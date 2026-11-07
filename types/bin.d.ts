#!/usr/bin/env node
/**
 * Overrides the oxfmt binary, for testing
 * @param {string|undefined} bin
 */
export declare const setTestOxfmtBin: (bin: string | undefined) => void;
/**
 * Resolves the oxfmt binary shipped with our oxfmt dependency.
 * Can be overridden with the MAGIC_FORMAT_OXFMT_BIN env variable (for testing)
 * @returns {string}
 */
export declare const getOxfmtBin: () => string;
/**
 * Collects bare positional path arguments from the given argv
 * @param {string[]} [argv=process.argv]
 * @returns {string[]}
 */
export declare const getPaths: (argv?: string[]) => string[];
/**
 * Builds the oxfmt cli argument list from f's parsed arguments
 * @param {{args?: Record<string, any>, paths?: string[], configFile?: string}} params
 * @returns {string[]}
 */
export declare const buildOxfmtArgs: ({ args, paths, configFile }?: {
    args?: Record<string, any>;
    paths?: string[];
    configFile?: string;
}) => string[];
/**
 * Main CLI entry point
 * @returns {Promise<number>} - the exit code
 */
export declare const run: () => Promise<number>;
