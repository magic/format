/**
 * Resolves the oxfmt binary shipped with our oxfmt dependency.
 * Can be overridden with the MAGIC_FORMAT_OXFMT_BIN env variable (for testing)
 * @returns {string}
 */
export declare const getOxfmtBin: () => string;
/**
 * Overrides the oxfmt binary, for testing
 * @param {string|undefined} bin
 */
export declare const setOxfmtBin: (bin: string | undefined) => void;
