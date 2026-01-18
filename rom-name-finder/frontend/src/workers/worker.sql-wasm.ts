// SQL.js Web Worker for database operations
// This worker handles all SQLite database operations off the main thread

import initSqlJs from 'sql.js';
import type { BindParams, Database } from 'sql.js';

type SqlJsInstance = Awaited<ReturnType<typeof initSqlJs>>;

interface WorkerMessage {
    id: string;
    action: 'open' | 'exec';
    buffer?: ArrayBuffer;
    sql?: string;
    params?: BindParams;
}

interface WorkerResponse {
    id: string;
    success: boolean;
    data?: unknown;
    error?: string;
}

let db: Database | null = null;
let sqlJsInstance: SqlJsInstance | null = null;

// Initialize SQL.js
async function initializeSqlJs(): Promise<void> {
    if (!sqlJsInstance) {
        sqlJsInstance = await initSqlJs();
    }
}

// Send response back to main thread
function sendResponse(id: string, success: boolean, data?: unknown, error?: string): void {
    const response: WorkerResponse = { id, success, data, error };
    self.postMessage(response);
}

// Handle incoming messages
self.onmessage = async (event: MessageEvent<WorkerMessage>): Promise<void> => {
    const { id, action, buffer, sql, params } = event.data;

    try {
        switch (action) {
            case 'open':
                // Initialize SQL.js and open database
                await initializeSqlJs();

                if (!buffer) {
                    throw new Error('No database buffer provided');
                }

                if (!sqlJsInstance) {
                    throw new Error('SQL.js not initialized');
                }

                db = new sqlJsInstance.Database(new Uint8Array(buffer));
                sendResponse(id, true, { message: 'Database opened successfully' });
                break;

            case 'exec':
                if (!db) {
                    throw new Error('Database not opened. Call "open" action first.');
                }

                if (!sql) {
                    throw new Error('No SQL query provided');
                }

                // Execute query with optional parameters
                sendResponse(id, true, db.exec(sql, params));
                break;

            default:
                throw new Error(`Unknown action: ${action}`);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        sendResponse(id, false, undefined, errorMessage);
    }
};
