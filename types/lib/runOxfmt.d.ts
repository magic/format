/**
 * Runs oxfmt with the given arguments
 * @param {string[]} oxfmtArgs
 * @param {string} cwd
 * @returns {Promise<{code: number, stdout: string, stderr: string}>}
 */
export declare const runOxfmt: (oxfmtArgs: string[], cwd: string) => Promise<{
    code: number;
    stdout: string;
    stderr: string;
}>;
