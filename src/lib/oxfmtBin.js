/// <reference path="../types.ts" />

import path from 'node:path'
import mod from 'node:module'

const require = mod.createRequire(import.meta.url)

/** @type {string|undefined} */
let testOxfmtBin

/**
 * Resolves the oxfmt binary shipped with our oxfmt dependency.
 * Can be overridden with the MAGIC_FORMAT_OXFMT_BIN env variable (for testing)
 * @returns {string}
 */
export const getOxfmtBin = () =>
  testOxfmtBin ||
  process.env.MAGIC_FORMAT_OXFMT_BIN ||
  path.join(path.dirname(require.resolve('oxfmt/package.json')), 'bin', 'oxfmt')

/**
 * Overrides the oxfmt binary, for testing
 * @param {string|undefined} bin
 */
export const setOxfmtBin = bin => {
  testOxfmtBin = bin
}
