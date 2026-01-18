import 'dotenv/config';
import initSqlJs, { Database } from 'sql.js';
import fs from 'node:fs';
import path from 'node:path';
import { DB_PATH, getFiles } from './shared';

interface GameRow {
    [key: string]: string | number | bigint | Uint8Array | null;
}

async function validateDatabases(): Promise<void> {
    // Get all files in the database directory
    const databases = getFiles(DB_PATH, '.db');
    // Initialize SQL.js
    const SQL = await initSqlJs();

    console.log(`Found ${databases.length} database file(s): ${databases.join(', ')}`);
    
    for (const database of databases) {
        console.log(`Opening ${database}`);

        // Read and load the database file
        const filebuffer = fs.readFileSync(path.join(DB_PATH!, database));
        const db: Database = new SQL.Database(filebuffer);

        try {
            let result = db.exec('SELECT COUNT(*) FROM games');
            console.log('Number of games:', result[0].values[0][0]);

            // Query first 10 results from games table
            result = db.exec('SELECT * FROM games LIMIT 10');
            // Process and display results
            if (result.length > 0 && result[0].values.length > 0) {
                const columns = result[0].columns;
                const rows = result[0].values.map((row) => {
                    const obj: GameRow = {};
                    columns.forEach((col, colIndex) => {
                        obj[col] = row[colIndex];
                    });
                    return obj;
                });

                console.log(`Found ${rows.length} games:`);
                console.table(rows);
            } else {
                console.log('No games found in the database.');
            }
        } finally {
            db.close();
        }
    }
}

validateDatabases()
    .catch(console.error);
