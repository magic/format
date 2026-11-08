/// <reference path="../types.d.ts" />

import { spawn } from 'node:child_process'

import { getOxfmtBin } from './oxfmtBin.js'

/**
 * Runs oxfmt with the given arguments
 * @param {string[]} oxfmtArgs
 * @param {string} cwd
 * @returns {Promise<{code: number, stdout: string, stderr: string}>}
 */
export const runOxfmt = (oxfmtArgs, cwd) =>
  new Promise(resolve => {
    const child = spawn(process.execPath, [getOxfmtBin(), ...oxfmtArgs], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    /** @type {string[]} */
    const stdout = []
    /** @type {string[]} */
    const stderr = []

    child.stdout.on('data', chunk => stdout.push(String(chunk)))
    child.stderr.on('data', chunk => stderr.push(String(chunk)))

    child.on('close', code =>
      resolve({ code: code ?? 1, stdout: stdout.join(''), stderr: stderr.join('') }),
    )
    child.on('error', () => resolve({ code: 1, stdout: '', stderr: 'failed to start oxfmt' }))
  })
