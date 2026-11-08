#!/usr/bin/env node
/**
 * Collects bare positional path arguments from the given argv
 * @param {string[]} [argv=process.argv]
 * @returns {string[]}
 */
export declare const getPaths: (argv?: string[]) => string[];
/**
 * Main CLI entry point
 * @returns {Promise<number>} - the exit code
 */
export declare const run: () => Promise<number>;
