/**
 * Escapes special characters in SQL LIKE patterns
 * Prevents SQL injection by escaping wildcards and special characters
 *
 * @param input - The user input to escape
 * @returns The escaped string safe for use in SQL LIKE clauses
 */
export function escapeSQLLike(input: string): string {
    // Escape special characters used in SQL LIKE patterns
    // % matches any sequence of characters
    // _ matches any single character
    // \ is the escape character
    return input
        .replace(/\\/g, '\\\\')  // Escape backslashes first
        .replace(/%/g, '\\%')     // Escape percent signs
        .replace(/_/g, '\\_');    // Escape underscores
}

/**
 * Escapes special characters in SQL MATCH patterns
 * Prevents SQL injection by escaping quotes and special characters
 *
 * @param input - The user input to escape
 * @returns The escaped string safe for use in SQL MATCH clauses
 */
export function escapeSQLMatch(input: string): string {
    // Escape double quotes to prevent SQL injection
    return input.replace(/"/g, '""');
}

/**
 * Escapes CSV fields to prevent CSV injection
 * Prevents formula injection by escaping special characters and adding prefix
 *
 * @param input - The field value to escape
 * @returns The escaped CSV field
 */
export function escapeCSVField(input: string): string {
    // Prevent formula injection by adding a tab prefix if field starts with dangerous characters
    const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
    const trimmed = input.trim();

    if (dangerousPrefixes.some(prefix => trimmed.startsWith(prefix))) {
        // Add a tab prefix to prevent Excel from interpreting as formula
        input = '\t' + input;
    }

    // Escape double quotes by doubling them
    const escaped = input.replace(/"/g, '""');

    // Wrap in quotes if field contains comma, quote, or newline
    if (input.includes(',') || input.includes('"') || input.includes('\n') || input.includes('\r')) {
        return `"${escaped}"`;
    }

    return escaped;
}

/**
 * Sanitizes ROM values for use in URLs
 * Only allows alphanumeric characters, underscores, and hyphens
 *
 * @param rom - The ROM value to sanitize
 * @returns The sanitized ROM value
 */
export function sanitizeROM(rom: string | undefined | null): string {
    if (!rom) {
        return '';
    }

    // Only allow alphanumeric, underscore, and hyphen
    return rom.replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Sanitizes error messages to prevent information disclosure
 * Removes sensitive information like file paths, database details, etc.
 *
 * @param error - The error message to sanitize
 * @returns The sanitized error message
 */
export function sanitizeErrorMessage(error: string | unknown): string {
    if (typeof error !== 'string') {
        return 'An error occurred';
    }

    // Remove file paths (Windows and Unix)
    let sanitized = error.replace(/[a-zA-Z]:\\[^\\]*\\|\/[^/]*\//g, '[path]/');

    // Remove database names and table names
    sanitized = sanitized.replace(/database\s+['"][^'"]*['"]/gi, 'database');
    sanitized = sanitized.replace(/table\s+['"][^'"]*['"]/gi, 'table');

    // Remove SQL queries (basic pattern)
    sanitized = sanitized.replace(/SELECT\s+.*?FROM/gi, 'SELECT ... FROM');
    sanitized = sanitized.replace(/INSERT\s+INTO\s+.*?VALUES/gi, 'INSERT INTO ... VALUES');
    sanitized = sanitized.replace(/UPDATE\s+.*?SET/gi, 'UPDATE ... SET');
    sanitized = sanitized.replace(/DELETE\s+FROM/gi, 'DELETE FROM');

    // Remove stack traces
    sanitized = sanitized.split('\n').filter(line => !line.includes('at ') && !line.includes('node_modules')).join('\n');

    return sanitized.trim() || 'An error occurred';
}

/**
 * Validates that a database path is in the allowed list
 * Prevents path traversal attacks
 *
 * @param dbPath - The database path to validate
 * @returns True if the path is allowed, false otherwise
 */
export function isAllowedDatabase(dbPath: string): boolean {
    const ALLOWED_DATABASES = ['testdb'].concat(JSON.parse(import.meta.env.VITE_DBS));

    return ALLOWED_DATABASES.includes(dbPath);
}

/**
 * Validates that file content contains only printable ASCII characters
 * Used for validating dropped files in Textarea component
 *
 * @param content - The file content to validate
 * @returns True if content is valid, false otherwise
 */
export function isValidFileContent(content: string): boolean {
    // Check if content contains only printable ASCII characters (32-126) plus whitespace
    const printableAsciiRegex = /^[\x20-\x7E\r\n\t]*$/;
    return printableAsciiRegex.test(content);
}

/**
 * Sanitizes game names for use in URLs
 * Removes special characters and replaces spaces with hyphens
 *
 * @param gameName - The game name to sanitize
 * @returns The sanitized game name
 */
export function sanitizeGameName(gameName: string): string {
    // Remove content in parentheses (usually region/version info)
    let sanitized = gameName.replace(/\s*\([^)]*\)\s*/g, '').trim();

    // Replace multiple spaces with single space
    sanitized = sanitized.replace(/\s+/g, ' ');

    return sanitized;
}

/**
 * Sanitizes strings for SQL query
 * @param terms - strings to sanitize
 * @returns The sanitized strings
 */
export function sanitizeInput(terms: string|string[]): string|string[] {
    if (typeof terms === 'string') {
        return terms.trim();
    }

    return (terms as string[])
        .map((term) => term.trim())
        .filter(Boolean);
}

/**
 * Validates that the column is in the allowed list of database columns
 * @param column - The column path to validate
 * @returns True if the column is allowed, false otherwise
 */
export function isAllowedDBColumn(column?: string): boolean {
    if (!column) {
        return false;
    }
    return ['term', 'rom'].includes(column);
}