/// <reference path="../types.d.ts" />

import os from 'node:os'
import path from 'node:path'

import fs from '@magic/fs'
import { tempConfigFilePrefix } from '../constants.js'

/** @type {number} */
let tempCounter = 0

/**
 * Writes a config object to a temp file
 * @param {Record<string, any>} config
 * @returns {Promise<string>}
 */
export const writeTempConfig = async config => {
  const file = path.join(
    os.tmpdir(),
    `${tempConfigFilePrefix}-${process.pid}-${Date.now()}-${tempCounter++}.json`,
  )
  await fs.writeFile(file, JSON.stringify(config, null, 2))
  return file
}
