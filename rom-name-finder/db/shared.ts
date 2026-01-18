import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = process.env.DATABASE_PATH;
if (!DB_PATH) {
    throw new Error('DATABASE_PATH environment variable is not set');
}
if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Database directory not found at: ${DB_PATH}`);
}
export { DB_PATH };

const ROMSETS_PATH = process.env.ROMSETS_PATH;
if (!ROMSETS_PATH) {
    throw new Error('ROMSETS_PATH environment variable is not set');
}
if (!fs.existsSync(ROMSETS_PATH)) {
    throw new Error(`ROMsets directory not found at: ${ROMSETS_PATH}`);
}
export { ROMSETS_PATH };

/**
 * Get all files in the given path
 * @param dirPath - Directory path
 * @returns Array of database file names
 */
export function getFiles(dirPath: string | undefined) {
    if (!dirPath) {
        return [];
    }
    const files = fs.readdirSync(dirPath!).filter((file: string) => {
        return fs.statSync(path.join(dirPath!, file)).isFile();
    });

    if (files.length === 0) {
        console.log('No files found in directory', dirPath);
        process.exit(1);
    }
    return files;
}