import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { finished } from "stream/promises";
import initSqlJs, { Database, Statement } from 'sql.js';
import { parse } from 'csv-parse';
import { DB_PATH, ROMSETS_PATH, getFiles } from './shared';

interface GameData {
    rom: string;
    name: string;
    cloneOf: number;
}

async function seedDatabases(): Promise<void> {
    console.log('SEED DB');

    // Get all files in the ROMsets directory
    const romsets = getFiles(ROMSETS_PATH);
    // Get all files in the ROMsets directory
    const SQL = await initSqlJs();

    console.log(`Found ${romsets.length} ROMset file(s): ${romsets.join(', ')}`);

    for (const romset of romsets) {
        let db: Database | null = null;
        let stmt: Statement | null = null;
        const dbName = path.parse(romset).name;

        try {
            const romsetFilePath = path.join(ROMSETS_PATH!, romset);
            const dbFilePath = path.join(DB_PATH!, `${dbName}.db`);
            const filebuffer = fs.readFileSync(dbFilePath);
            db = new SQL.Database(filebuffer);

            // Insert data from ROMset file
            const gameData: GameData[] = [];

            await finished(
                fs.createReadStream(romsetFilePath)
                    .pipe(
                        parse({ columns: true })  // Skip columns row
                    )
                    .on('data', (row) => {
                        const { name, cloneOf, description } = row;
                        gameData.push({
                            rom: name,
                            name: description,
                            cloneOf: parseInt(cloneOf, 10)
                        });
                    })
                    .on('error', (err) => {
                        throw new Error(err.message);
                    })
            )

            // Use transaction for related operations
            db.run('BEGIN TRANSACTION;');

            // Prepare insert statement
            stmt = db.prepare('INSERT INTO games (rom, name, term, cloneOf) VALUES (?, ?, ?, ?)');

            // Insert each sample record
            for (const game of gameData) {
                if (!game.rom || !game.name) {
                    throw new Error('Invalid game data: rom and name are required');
                }
                stmt.run([
                    game.rom.trim(),
                    game.name.trim(),
                    game.name
                        .trim()
                        .toLowerCase()
                        .replace(/[^\w]/g, ' ')
                        .replace(/\s+/g, ' '),
                    game.cloneOf
                ]);
            }

            // Commit the transaction
            db.run('COMMIT;');

            // Export and save the updated database
            const data = db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(dbFilePath, buffer);

            console.log(`Database ${dbName} seeded successfully with ${gameData.length} games.`);
        } catch (error) {
            throw new Error(`Error seeding database: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            // Clean up resources
            stmt?.free();
            db?.close();
        }
    }
}

seedDatabases()
    .catch(console.error);
