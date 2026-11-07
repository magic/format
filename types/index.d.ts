/**
 * Formats the content of a single file using oxfmt
 * @param {string} file
 * @param {string} content
 * @param {OxfmtConfig} config
 * @returns {Promise<string>}
 */
export declare const formatFileContent: (file: string, content: string, config: OxfmtConfig) => Promise<string>;
/**
 * Formats code files using Oxfmt
 * @param {FormatParams} args
 * @returns {Promise<string[]>} - Array of changed file paths
 */
export declare const format: (args: FormatParams) => Promise<string[]>;
/**
 * Formats a string using Oxfmt
 * @param {string} content - The content to format
 * @param {FormatParams} [args] - Formatting options
 * @returns {Promise<string>} - Formatted content
 */
export declare const formatString: (content: string, args?: FormatParams) => Promise<string>;
export default format;
