import 'dotenv/config';
import initSqlJs, { Database } from 'sql.js';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { DB_PATH, ROMSETS_PATH, getFiles } from './shared';

async function initDatabases(): Promise<void> {
    // Get all files in the ROMsets directory
    const romsets = getFiles(ROMSETS_PATH);
    const romsetNames: string[] = [];
    // Initialize SQL.js
    const SQL = await initSqlJs();

    console.log(`Found ${romsets.length} ROMset file(s): ${romsets.join(', ')}`);

    for (const romset of romsets) {
        const romsetName = path.parse(romset).name;
        const dbFilePath = path.join(DB_PATH!, romsetName + '.db');
        romsetNames.push(romsetName);

        console.log(`Processing ROMset: ${romset}`);

        let db: Database | null = null;

        try {
            db = new SQL.Database();

            // Drop existing table if present
            db.run('DROP TABLE IF EXISTS games;');

            // Create games table with schema
            // https://www.sqlite.org/fts3.html
            db.run(
                'CREATE VIRTUAL TABLE games USING fts4(rom TEXT, name TEXT, term TEXT, cloneOf INTEGER);'
            );

            // Create folder if it doesn't exist
            const dbDir = path.dirname(dbFilePath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // Export and save the database file
            const data = db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(dbFilePath, buffer);

            console.log(`Database created successfully for ${romset} at: ${dbFilePath}`);
        } catch (error) {
            throw new Error(`Error initializing database for ${romset}: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            db?.close();
        }
    }

    // Update .env with new DBs
    const fileStream = fs.createReadStream('./frontend/.env');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    let lines: string[] = [];    
    for await (const line of rl) {
        lines.push(line);
        if (line.includes('# Do not modify after this line')) {
            rl.close(); // Stop reading
        }
    }
    lines.push(`VITE_DBS=${JSON.stringify(romsetNames)}`);
    fs.writeFileSync('./frontend/.env', lines.join('\n'));
}

initDatabases()
    .catch(console.error);
