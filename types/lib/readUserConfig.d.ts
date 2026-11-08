/**
 * Reads a user config file as a plain object.
 * Returns null when the file cannot be parsed here
 * (e.g. typescript configs), so the caller can
 * fall back to letting oxfmt handle it natively.
 * @param {string} file
 * @returns {Promise<Record<string, any>|null>}
 */
export declare const readUserConfig: (file: string) => Promise<Record<string, any> | null>;
