#!/usr/bin/env node
/** @type {string[]} */
export const fileTypes: string[]
/**
 * @typedef {Object} OptionalPlugin
 * @property {string} path - Plugin module path
 */
/** @type {Record<string, string>} */
export const optional: Record<string, string>
/** @type {string} */
export const nodeModuleDir: string
export function checkOptionalDependencies([extension, pluginPath]: [string, string]): Promise<void>
/** @type {string[]} */
export const additionalPossiblePrettierPlugins: string[]
export function checkPossiblePlugins(pluginPath: string): Promise<void>
export function run(): Promise<void>
export type OptionalPlugin = {
  /**
   * - Plugin module path
   */
  path: string
}
