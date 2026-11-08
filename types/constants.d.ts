/**
 * The oxfmt config shared with all consumers,
 * so they do not have to declare rules themselves
 * @type {string}
 */
export declare const sharedConfigPath: string;
/**
 * Config file names oxfmt discovers itself,
 * starting from the formatted file and walking up the tree
 * @type {string[]}
 */
export declare const configFiles: string[];
export declare const tempConfigFilePrefix = "magic-format-";
