import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

export const MODE = process.env.NODE_ENV || 'development';

const dotenvConfig = dotenv.config({
    path: [
        `.env.${MODE}`,
        '.env'
    ]
});

// Force dotenv to overwrite env variables
process.env = { ...process.env, ...dotenvConfig.parsed };
const DB_PATH = process.env.DATABASE_PATH;
if (!DB_PATH) {
    throw new Error('DATABASE_PATH environment variable is not set');
}
if (!fs.existsSync(DB_PATH)) {
    console.log(`Creating directory ${DB_PATH}`);
    fs.mkdirSync(DB_PATH, { recursive: true });
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
export function getFiles(dirPath: string | undefined, extension?: string | undefined) {
    if (!dirPath) {
        return [];
    }
    const ext = extension?.startsWith('.') ? extension.substring(1) : extension;
    const files = fs.readdirSync(dirPath!).filter((file: string) => {
        const stat = fs.statSync(path.join(dirPath!, file));
        return !stat.isFile()
            || !ext
            || path.extname(file).toLowerCase() === `.${ext.toLowerCase()}`;
    });
    if (files.length === 0) {
        console.log('No files found in directory', dirPath);
        process.exit(1);
    }
    return files;
}
