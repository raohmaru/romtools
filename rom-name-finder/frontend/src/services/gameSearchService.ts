import type { Game } from '@/types/schemas';
import { escapeSQLLike, escapeSQLMatch, isAllowedDatabase, sanitizeErrorMessage } from '@/utils/security';

// Worker message format
export interface WorkerMessage {
    id: number;
    action: 'open' | 'exec';
    buffer?: ArrayBuffer;
    sql?: string;
    params?: unknown[];
}

// Worker response format
export interface WorkerResponse {
    id: number;
    success: boolean;
    data?: unknown;
    error?: string;
}

// SQL.js result format
export interface QueryResult {
    columns: string[];
    values: unknown[][];
}

// Cache entry structure
interface CacheEntry {
    data: Game[];
    timestamp: number;
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_CACHE_SIZE = 100;

/**
 * GameSearchService - Handles database operations for game searches
 * Uses SQL.js web worker for non-blocking database operations
 */
export class GameSearchService {
    private worker: Worker | null = null;
    private pendingRequests: Map<number, { resolve: (value: unknown) => void; reject: (reason: Error) => void }> = new Map();
    private dbLoaded = false;
    private cache: Map<string, CacheEntry> = new Map();

    /**
     * Initialize the SQL.js web worker
     */
    async initialize(): Promise<void> {
        if (this.worker) {
            return;
        }

        return new Promise((resolve, reject) => {
            this.worker = new Worker('wasm/worker.sql-wasm.js', /*{ type: 'module' }*/);

            this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
                const { id, success, data, error } = event.data;
                const pending = this.pendingRequests.get(id);

                if (pending) {
                    if (success) {
                        pending.resolve(data);
                    } else {
                        pending.reject(new Error(sanitizeErrorMessage(error) || 'Unknown worker error'));
                    }
                    this.pendingRequests.delete(id);
                }
            };

            this.worker.onerror = (error) => {
                reject(new Error(`Worker error: ${error.message}`));
            };

            resolve();
        });
    }

    /**
     * Send a message to the worker and wait for response
     */
    private sendMessage(message: WorkerMessage): Promise<unknown> {
        if (!this.worker) {
            return Promise.reject(new Error('Worker not initialized'));
        }

        return new Promise((resolve, reject) => {
            this.pendingRequests.set(message.id, { resolve, reject });
            this.worker!.postMessage(message);
        });
    }

    /**
     * Load a database file from the given path
     */
    async loadDatabase(dbPath: string): Promise<void> {
        if (!this.worker) {
            await this.initialize();
        }

        // Validate database path to prevent path traversal
        if (!isAllowedDatabase(dbPath)) {
            throw new Error('Invalid database path');
        }

        // Fetch the database file
        const response = await fetch(`db/${dbPath}.db`);
        if (!response.ok) {
            throw new Error(`Failed to fetch database: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();

        // Send to worker to open
        await this.sendMessage({
            id: Date.now(),
            action: 'open',
            buffer,
        });

        this.dbLoaded = true;
    }

    private sanitizeInput(terms: string|string[]): string|string[] {
        if (typeof terms === 'string') {
            return terms.trim();
        }

        return (terms as string[])
            .map((term) => term.trim())
            .filter(Boolean);
    }

    /**
     * Search for a single game by name
     */
    private async find(terms: string|string[], conditions: string, includeClones: boolean): Promise<Game[]> {
        if (!this.dbLoaded || !this.worker) {
            throw new Error('Database not loaded. Call loadDatabase first.');
        }

        if (!terms || !terms.length) {
            return [];
        }

        let select = 'SELECT rom, name, cloneOf FROM games g1';
        let skipClones = '';
        if (includeClones) {
            // Left join to get the names of the clones
            select =
                'SELECT g1.rom AS rom, g1.name AS name, g2.name AS cloneOf ' +
                'FROM games g1 ' +
                'LEFT JOIN games g2 ON g1.cloneOf = g2.docid'
            ;
        } else {
            skipClones = 'AND cloneOf IS NULL';
        }
        const sqlQuery = `${select} WHERE ${conditions} ${skipClones}`;  // -- ORDER BY cloneOf, name
        // console.log(sqlQuery);
        const result = await this.sendMessage({
            id: Date.now(),
            action: 'exec',
            sql: sqlQuery
        }) as QueryResult[];

        if (!result || result.length === 0) {
            return [];
        }

        const { values } = result[0];

        // Map results to Game objects
        return values.map((row) => {
            const game: Game = {
                rom: row[0] as string,
                name: row[1] as string
            };
            if (includeClones) {
                game.cloneOf = row[2] as string;
            }
            return game;
        });
    }

    /**
     * Search for a single game by name
     */
    async findOne(term: string, includeClones: boolean): Promise<Game[]> {
        // Check cache first
        const cachedResults = this.getCachedResults(term, includeClones);
        if (cachedResults) {
            return cachedResults;
        }

        const sanitized = this.sanitizeInput(term) as string;
        if (!sanitized) {
            return [];
        }
        const conditions = `${sanitized.split(' ').map((t) => `g1.term LIKE "%${escapeSQLLike(t)}%"`).join(' AND ')}`;
        const results = await this.find(term, conditions, includeClones);

        // Cache the results
        this.cacheResults(term, includeClones, results);

        return results;
    }

    /**
     * Search for games by name
     */
    async findMany(terms: string[], includeClones: boolean): Promise<Game[]> {
        // Check cache first
        const cachedResults = this.getCachedResults(terms, includeClones);
        if (cachedResults) {
            return cachedResults;
        }

        const sanitized = this.sanitizeInput(terms) as string[];
        if (!sanitized.length) {
            return [];
        }
        // Full-text search
        const conditions = `g1.term MATCH "${sanitized.map((t) => escapeSQLMatch(t)).join(' OR ')}"`;
        const results = await this.find(terms, conditions, includeClones);

        // Cache the results
        this.cacheResults(terms, includeClones, results);

        return results;
    }

    /**
     * Generate a cache key based on search parameters
     */
    private generateCacheKey(terms: string | string[], includeClones: boolean): string {
        const termString = Array.isArray(terms) ? terms.join('|') : terms;
        return `${termString}|${includeClones}`;
    }

    /**
     * Check if a cache entry is still valid (not expired)
     */
    private isCacheEntryValid(entry: CacheEntry): boolean {
        return Date.now() - entry.timestamp < CACHE_TTL;
    }

    /**
     * Get cached results if available and valid
     */
    private getCachedResults(terms: string | string[], includeClones: boolean): Game[] | null {
        const cacheKey = this.generateCacheKey(terms, includeClones);
        const entry = this.cache.get(cacheKey);

        if (entry && this.isCacheEntryValid(entry)) {
            return entry.data;
        }

        // Remove expired entry
        if (entry) {
            this.cache.delete(cacheKey);
        }

        return null;
    }

    /**
     * Cache search results
     */
    private cacheResults(terms: string | string[], includeClones: boolean, data: Game[]): void {
        // If cache is at maximum size, remove the oldest entry
        if (this.cache.size >= MAX_CACHE_SIZE) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }

        const cacheKey = this.generateCacheKey(terms, includeClones);
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Check if the database is loaded
     */
    isLoaded(): boolean {
        return this.dbLoaded;
    }

    /**
     * Terminate the worker and clean up
     */
    terminate(): void {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            this.dbLoaded = false;
            this.pendingRequests.clear();
            this.cache.clear(); // Clear cache on termination
        }
    }
}

// Singleton instance for application-wide use
let serviceInstance: GameSearchService | null = null;

export function getGameSearchService(): GameSearchService {
    if (!serviceInstance) {
        serviceInstance = new GameSearchService();
    }
    return serviceInstance;
}

export function resetGameSearchService(): void {
    if (serviceInstance) {
        serviceInstance.terminate();
        serviceInstance = null;
    }
}
