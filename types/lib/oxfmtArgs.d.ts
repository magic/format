/**
 * Builds the oxfmt cli argument list from parsed arguments
 * @param {{args?: Record<string, any>, paths?: string[], configFile?: string}} params
 * @returns {string[]}
 */
export declare const buildOxfmtArgs: ({ args, paths, configFile }?: {
    args?: Record<string, any>;
    paths?: string[];
    configFile?: string;
}) => string[];
