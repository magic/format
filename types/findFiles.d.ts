/**
 * Finds all files matching the given criteria
 * @param {FindFilesParams} params
 * @returns {Promise<string[]>}
 */
export declare const findFiles: ({ include, exclude, fileTypes, verbose, }: FindFilesParams) => Promise<string[]>;
