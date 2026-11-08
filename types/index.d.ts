export * from './lib.js';
/**
 * Formats code files using the oxfmt cli.
 * oxfmt takes care of file discovery, config resolution
 * and gitignore handling.
 * @param {FormatParams} [args]
 * @returns {Promise<string[]>} - Array of changed file paths
 */
export declare const format: (args?: FormatParams) => Promise<string[]>;
