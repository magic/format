/**
 * The oxfmt config shared with all consumers,
 * so they do not have to declare rules themselves
 * @type {string}
 */
export declare const sharedConfigPath: string;
/** @type {Record<string, any>} */
export declare const sharedConfig: Record<string, any>;
/**
 * oxfmt config files oxfmt discovers itself,
 * checked in the consumer project
 * @type {string[]}
 */
export declare const discoverableConfigs: string[];
/**
 * Parses json or jsonc (comments and trailing commas allowed)
 * @param {string} text
 * @returns {Record<string, any>}
 */
export declare const parseJsonc: (text: string) => Record<string, any>;
/**
 * Loads Oxfmt configuration as an object for the in-process javascript api.
 * Resolution: the shared config (with optional languages enabled),
 * merged with the user config file when given.
 * @param {LoadConfigParams} [params={}]
 * @returns {Promise<OxfmtConfig>}
 */
export declare const loadConfig: (params?: LoadConfigParams) => Promise<OxfmtConfig>;
/**
 * Resolves the config file the oxfmt cli should be invoked with.
 * Resolution: the shared config (with optional languages enabled)
 * merged with the user config (explicit --config or the consumer's own
 * .oxfmtrc*), written to a temp file. User configs that cannot be
 * parsed here (e.g. typescript) are passed to oxfmt as-is.
 * @param {LoadConfigParams} [params={}]
 * @returns {Promise<{file: string, temp: boolean}>}
 */
export declare const resolveConfigFile: (params?: LoadConfigParams) => Promise<{
    file: string;
    temp: boolean;
}>;
