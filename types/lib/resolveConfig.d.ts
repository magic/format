/**
 * Resolves the config file to pass to the oxfmt cli.
 * oxfmt does not merge configs, so an explicit --config, or a consumer
 * config discovered in the project, is merged over the shared config
 * and written to a temp file. User configs that cannot be parsed here
 * (e.g. typescript) are passed to oxfmt as-is, otherwise the shared
 * config is used.
 * @param {Record<string, any>} [args]
 * @param {string} [cwd=process.cwd()]
 * @returns {Promise<{file: string, temp: boolean}>}
 */
export declare const resolveConfig: (args?: Record<string, any>, cwd?: string) => Promise<{
    file: string;
    temp: boolean;
}>;
