/**
 * Skips whitespace, line comments and block comments
 * starting at index i
 * @param {string} text
 * @param {number} i
 * @returns {number}
 */
export declare const skipComments: (text: string, i: number) => number;
/**
 * Parses json or jsonc (comments and trailing commas allowed)
 * @param {string} text
 * @returns {Record<string, any>}
 */
export declare const parseJsonc: (text: string) => Record<string, any>;
