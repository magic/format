/**
 * Languages oxfmt only formats when the corresponding option is enabled
 * and the matching peer package is installed in the project
 * @type {Record<string, {ext: string, package: string}>}
 */
export declare const optionalLanguages: Record<string, {
    ext: string;
    package: string;
}>;
/**
 * Detects which optional languages are available,
 * based on the peer packages installed in the project
 * @param {string} [nodeModulesDir] - node_modules root to check
 * @returns {Promise<{fileTypes: string[], config: Record<string, boolean>}>}
 */
export declare const detectOptionalLanguages: (nodeModulesDir?: string) => Promise<{
    fileTypes: string[];
    config: Record<string, boolean>;
}>;
