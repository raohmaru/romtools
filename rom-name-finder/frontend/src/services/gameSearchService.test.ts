import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameSearchService, getGameSearchService, resetGameSearchService, type QueryResult } from './gameSearchService';
import type { WorkerMessage, WorkerResponse } from './gameSearchService';

// Define the type for the mock worker instance, implementing Worker
class MockWorkerInstance implements Worker {
    onmessage: ((this: Worker, ev: MessageEvent) => any) | null = null;
    onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null = null; // Corrected type for 'this'
    readonly port!: MessagePort; // Worker has a MessagePort
    onmessageerror: ((this: Worker, ev: MessageEvent) => any) | null = null;

    postMessage = vi.fn();
    terminate = vi.fn();
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    dispatchEvent = vi.fn();

    // constructor(scriptURL: string, options?: WorkerOptions) {
        // Optionally capture these if needed for specific tests
    // }
}

// Mock Worker as a vi.fn() that returns an instance of MockWorkerInstance
// This makes the MockWorker itself spyable (as a constructor function)
const MockWorker = vi.fn(MockWorkerInstance);

// Mock fetch
const mockFetch = vi.fn();

// Global setup for mocks
beforeEach(() => {
    vi.stubGlobal('Worker', MockWorker);
    vi.stubGlobal('fetch', mockFetch);

    // Reset all mock instances connected to the worker
    vi.clearAllMocks();

    resetGameSearchService(); // Ensure a fresh service instance for each test
});

describe('GameSearchService', () => {
    let service: GameSearchService;
    let workerInstance: MockWorkerInstance; // Corrected type

    beforeEach(() => {
        service = new GameSearchService();
        // Reset fetch mock calls for each test
        mockFetch.mockReset();
    });

    describe('initialize', () => {
        it('should initialize the worker if not already initialized', async () => {
            expect(service['worker']).toBeNull();
            await service.initialize();
            expect(window.Worker).toHaveBeenCalledWith('wasm/worker.sql-wasm.js'/* , { type: 'module' } */); // Corrected expectation
        });

        it('should not re-initialize the worker if already initialized', async () => {
            await service.initialize();
            const initialWorker = service['worker'];
            await service.initialize(); // Call again
            expect(service['worker']).toBe(initialWorker);
            expect(window.Worker).toHaveBeenCalledTimes(1); // Corrected expectation
        });
    });

    describe('sendMessage', () => {
        beforeEach(async () => {
            // Ensure worker is initialized before each sendMessage test
            await service.initialize();
        });

        it('should send a message to the worker and resolve on success', async () => {
            const message: WorkerMessage = { id: 1, action: 'open' };
            const promise = service['sendMessage'](message);

            expect(service['worker']?.postMessage).toHaveBeenCalledWith(message);

            // Simulate worker response
            const response: WorkerResponse = { id: 1, success: true, data: 'OK' };
            service['worker']?.onmessage?.call(service['worker'], { data: response } as MessageEvent<WorkerResponse>); // Corrected call

            await expect(promise).resolves.toBe('OK');
            expect(service['pendingRequests'].size).toBe(0);
        });

        it('should send a message to the worker and reject on failure', async () => {
            const message: WorkerMessage = { id: 2, action: 'exec', sql: 'SELECT 1' };
            const promise = service['sendMessage'](message);

            expect(service['worker']?.postMessage).toHaveBeenCalledWith(message);

            // Simulate worker error response
            const response: WorkerResponse = { id: 2, success: false, error: 'SQL Error' };
            service['worker']?.onmessage?.call(service['worker'], { data: response } as MessageEvent<WorkerResponse>); // Corrected call

            await expect(promise).rejects.toThrow('SQL Error');
            expect(service['pendingRequests'].size).toBe(0);
        });

        it('should return a rejected promise if worker is not initialized', async () => {
            // Reset service state so it's uninitialized for this test
            resetGameSearchService();
            const newService = new GameSearchService();
            const message: WorkerMessage = { id: 3, action: 'open' };

            await expect(newService['sendMessage'](message)).rejects.toThrow('Worker not initialized');
        });
    });

    describe('loadDatabase', () => {
        const dummyBuffer = new ArrayBuffer(8);

        beforeEach(() => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                arrayBuffer: () => Promise.resolve(dummyBuffer),
            });
            // Directly mock the private sendMessage method for the current service instance
            service['sendMessage'] = vi.fn().mockResolvedValue(undefined);
        });

        it('should fetch the database and send it to the worker', async () => {
            await service.loadDatabase('testdb');

            expect(mockFetch).toHaveBeenCalledWith('db/testdb.db');
            expect(service['sendMessage']).toHaveBeenCalledWith({
                id: expect.any(Number),
                action: 'open',
                buffer: dummyBuffer,
            });
            expect(service.isLoaded()).toBe(true);
        });

        it('should initialize the worker if not already initialized before loading db', async () => {
            // Reset service state so it's uninitialized for this test
            resetGameSearchService();
            const newService = new GameSearchService();
            // Directly mock the private sendMessage method for the new service instance
            newService['sendMessage'] = vi.fn().mockResolvedValue(undefined);

            await newService.loadDatabase('testdb');
            expect(window.Worker).toHaveBeenCalledTimes(1); // Called during newService.initialize()
            expect(newService['worker']).toBeInstanceOf(MockWorker); // Corrected type
        });

        it('should throw an error if fetching the database fails', async () => {
            mockFetch.mockReset(); // Clear previous mock
            mockFetch.mockResolvedValueOnce({
                ok: false,
                statusText: 'Not Found',
            });

            await expect(service.loadDatabase('nonexistent')).rejects.toThrow('Invalid database path');
            expect(service.isLoaded()).toBe(false);
        });
    });

    describe('find functionality', () => {
        const mockGamesResult: QueryResult[] = [{
            columns: ['rom', 'name', 'cloneOf'],
            values: [['rom1', 'Game One Primary', null], ['rom2', 'Game Two Clone', 'Game One Primary']],
        }];

        beforeEach(async () => {
            await service.initialize();
            service['dbLoaded'] = true; // Manually set dbLoaded for find tests
            // Directly mock the private sendMessage method for the current service instance
            service['sendMessage'] = vi.fn().mockResolvedValue(mockGamesResult);
        });

        it('findOne should return an empty array if term is empty', async () => {
            const result = await service.findOne('', false);
            expect(result).toEqual([]);
        });

        it('should search for a single game by name without clones', async () => {
            const result = await service.findOne('test game', false);
            expect(result).toEqual([{ rom: 'rom1', name: 'Game One Primary' }, { rom: 'rom2', name: 'Game Two Clone' }]);
            expect(service['sendMessage']).toHaveBeenCalledWith({
                id: expect.any(Number),
                action: 'exec',
                sql: 'SELECT rom, name, cloneOf FROM games g1 WHERE g1.term LIKE "%test%" AND g1.term LIKE "%game%" AND cloneOf IS NULL'
            });
        });

        it('should search for a single game by name with clones', async () => {
            const result = await service.findOne('test game', true);
            expect(result).toEqual([{ rom: 'rom1', name: 'Game One Primary', cloneOf: null }, { rom: 'rom2', name: 'Game Two Clone', cloneOf: 'Game One Primary' }]);
            const expectedSql =
                'SELECT g1.rom AS rom, g1.name AS name, g2.name AS cloneOf ' +
                'FROM games g1 ' +
                'LEFT JOIN games g2 ON g1.cloneOf = g2.docid ' +
                'WHERE g1.term LIKE "%test%" AND g1.term LIKE "%game%" '
            ;
            expect(service['sendMessage']).toHaveBeenCalledWith({
                id: expect.any(Number),
                action: 'exec',
                sql: expectedSql
            });
        });

        it('findMany should return an empty array if terms array is empty', async () => {
            const result = await service.findMany([], false);
            expect(result).toEqual([]);
        });

        it('findMany should return an empty array if terms array contains only empty strings', async () => {
            const result = await service.findMany(['', ' '], false);
            expect(result).toEqual([]);
        });

        it('findMany should search for multiple games by name without clones', async () => {
            const result = await service.findMany(['test1', 'test2'], false);
            expect(result).toEqual([{ rom: 'rom1', name: 'Game One Primary' }, { rom: 'rom2', name: 'Game Two Clone' }]);
            expect(service['sendMessage']).toHaveBeenCalledWith({
                id: expect.any(Number),
                action: 'exec',
                sql: 'SELECT rom, name, cloneOf FROM games g1 WHERE g1.term MATCH "test1 OR test2" AND cloneOf IS NULL'
            });
        });

        it('findMany should search for multiple games by name with clones', async () => {
            const result = await service.findMany(['test1', 'test2'], true);
            expect(result).toEqual([{ rom: 'rom1', name: 'Game One Primary', cloneOf: null }, { rom: 'rom2', name: 'Game Two Clone', cloneOf: 'Game One Primary' }]);
            const expectedSql =
                'SELECT g1.rom AS rom, g1.name AS name, g2.name AS cloneOf ' +
                'FROM games g1 ' +
                'LEFT JOIN games g2 ON g1.cloneOf = g2.docid ' +
                'WHERE g1.term MATCH "test1 OR test2" '
            ;
            expect(service['sendMessage']).toHaveBeenCalledWith({
                id: expect.any(Number),
                action: 'exec',
                sql: expectedSql
            });
        });

        it('should throw an error if database is not loaded before find', async () => {
            service['dbLoaded'] = false;
            await expect(service.findOne('test', false)).rejects.toThrow('Database not loaded. Call loadDatabase first.');
        });

        it('should handle no results from worker', async () => {
            service['sendMessage'] = vi.fn().mockResolvedValue([]);
            const result = await service.findOne('no-match', false);
            expect(result).toEqual([]);
        });

        it('should handle no values in query result from worker', async () => {
            service['sendMessage'] = vi.fn().mockResolvedValue([{ columns: [], values: [] }]);
            const result = await service.findOne('no-match', false);
            expect(result).toEqual([]);
        });
    });

    describe('isLoaded', () => {
        it('should return false when database is not loaded', () => {
            expect(service.isLoaded()).toBe(false);
        });

        it('should return true when database is loaded', async () => {
            // Mock successful open
            service['sendMessage'] = vi.fn().mockResolvedValue(undefined);
            mockFetch.mockResolvedValueOnce({ok: true, arrayBuffer: () => {}});
            await service.loadDatabase('testdb');
            expect(service.isLoaded()).toBe(true);
        });
    });

    describe('terminate', () => {
        beforeEach(() => {
            // Reset fetch mock calls for each test
            mockFetch.mockReset();
        });

        it('should terminate the worker and reset state', async () => {
            await service.initialize();
            // Capture the internal worker instance created by the service for interaction in tests
            workerInstance = service['worker'] as unknown as MockWorkerInstance; // Corrected type
            service['dbLoaded'] = true;
            expect(service['worker']).not.toBeNull();
            expect(service.isLoaded()).toBe(true);

            service.terminate();

            expect(service['worker']).toBeNull();
            expect(service.isLoaded()).toBe(false);
            expect(service['pendingRequests'].size).toBe(0);
            expect(workerInstance.terminate).toHaveBeenCalled();
        });

        it('should do nothing if worker is already null', () => {
            expect(() => service.terminate()).not.toThrow();
            // If the worker was never initialized, terminate should not be called
            expect(workerInstance.terminate).not.toHaveBeenCalled();
        });
    });

    describe('Singleton instance', () => {
        it('getGameSearchService should return the same instance', () => {
            const instance1 = getGameSearchService();
            const instance2 = getGameSearchService();
            expect(instance1).toBe(instance2);
        });

        it('resetGameSearchService should reset the instance', async () => {
            const instance1 = getGameSearchService();
            // Initialize the instance so it has a worker to terminate
            await instance1.initialize();

            const terminateSpy = vi.spyOn(instance1, 'terminate');

            resetGameSearchService();

            // Expect the old instance's worker to have been terminated
            expect(terminateSpy).toHaveBeenCalled();

            const instance2 = getGameSearchService();
            expect(instance1).not.toBe(instance2);

            // Now verify that the new instance also gets a mocked worker (from beforeEach)
            await instance2.initialize();
            expect(instance2['worker']).toBeInstanceOf(MockWorker);
        });

        it('resetGameSearchService should terminate existing instance if it exists', async () => {
            const instance = getGameSearchService();
            // Manually initialize the service and worker for the singleton to demonstrate termination
            await instance.initialize();

            const terminateSpy = vi.spyOn(instance, 'terminate');
            resetGameSearchService();

            expect(terminateSpy).toHaveBeenCalled();
        });

        it('should not terminate if no instance exists', () => {
            resetGameSearchService(); // Ensure no instance exists initially
            const instance = new GameSearchService(); // Create a dummy instance without registering it as singleton
            vi.spyOn(instance, 'terminate');

            getGameSearchService(); // This will create a new singleton, but resetGameSearchService should not affect the dummy
            resetGameSearchService(); // This will terminate the newly created singleton, but not our dummy

            expect(instance.terminate).not.toHaveBeenCalled();
        });
    });

    describe('Caching functionality', () => {
        const mockGamesResult: QueryResult[] = [{
            columns: ['rom', 'name', 'cloneOf'],
            values: [['rom1', 'Game One', null]],
        }];

        beforeEach(async () => {
            await service.initialize();
            service['dbLoaded'] = true; // Manually set dbLoaded for cache tests
            // Directly mock the private sendMessage method for the current service instance
            service['sendMessage'] = vi.fn().mockResolvedValue(mockGamesResult);
        });

        it('should cache results for findOne', async () => {
            const result1 = await service.findOne('test', false);
            const result2 = await service.findOne('test', false);

            // Should only call sendMessage once (first request)
            expect(service['sendMessage']).toHaveBeenCalledTimes(1);
            expect(result1).toEqual(result2);
        });

        it('should cache results for findMany', async () => {
            const result1 = await service.findMany(['test1', 'test2'], false);
            const result2 = await service.findMany(['test1', 'test2'], false);

            // Should only call sendMessage once (first request)
            expect(service['sendMessage']).toHaveBeenCalledTimes(1);
            expect(result1).toEqual(result2);
        });

        it('should not use cache for different includeClones parameter', async () => {
            await service.findOne('test', true);
            await service.findOne('test', false);

            // Should call sendMessage twice (different cache keys)
            expect(service['sendMessage']).toHaveBeenCalledTimes(2);
        });

        it('should not use cache for different search terms', async () => {
            await service.findOne('test1', false);
            await service.findOne('test2', false);

            // Should call sendMessage twice (different cache keys)
            expect(service['sendMessage']).toHaveBeenCalledTimes(2);
        });

        it('should clear cache on terminate', async () => {
            await service.findOne('test', false);
            service.terminate();
            await service.initialize();
            service['dbLoaded'] = true;
            service['sendMessage'] = vi.fn().mockResolvedValue(mockGamesResult);

            await service.findOne('test', false);

            // Should call sendMessage again after termination (cache was cleared)
            expect(service['sendMessage']).toHaveBeenCalledTimes(1);
        });
    });
});
