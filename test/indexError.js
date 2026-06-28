import path from 'path'
import fs from '@magic/fs'
import { format } from '../src/index.js'

const testDir = path.join(process.cwd(), 'test', '.indexError')
const testFile = path.join(testDir, 'invalid.js')
const invalidContent = 'const a = ' + String.fromCharCode(123)

const createMockFile = async () => {
  await fs.mkdir(testDir, { recursive: true })
  await fs.writeFile(testFile, invalidContent)
}

const cleanMockFile = async () => {
  await fs.rm(testDir, { recursive: true, force: true })
}

export default [
  {
    fn: async () => {
      await createMockFile()
      const result = await format({
        include: testDir,
        exclude: ['node_modules'],
        fileTypes: ['js'],
        write: false,
      })
      await cleanMockFile()
      return Array.isArray(result)
    },
    expect: true,
    info: 'format handles parse error gracefully',
  },
  {
    fn: async () => {
      await createMockFile()
      const result = await format({
        include: testDir,
        exclude: ['node_modules'],
        fileTypes: ['js'],
        write: true,
      })
      await cleanMockFile()
      return Array.isArray(result)
    },
    expect: true,
    info: 'format with write handles parse error',
  },
  {
    fn: async () => {
      const result = await format({
        include: testDir,
        fileTypes: ['js'],
      })
      return Array.isArray(result)
    },
    expect: true,
    info: 'format handles non-existent directory without error',
  },
]
