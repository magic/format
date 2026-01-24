import fs from '@magic/fs'
import path from 'path'
import { format, formatString } from '../src/index.mjs'

const testDir = path.join(process.cwd(), 'test', '.index')
const testFile = path.join(testDir, 'test.js')
const testFileContent = 'const a=1;const b=2;'
const formattedContent = 'const a = 1;\nconst b = 2;\n'

const createMockFile = async () => {
  await fs.mkdir(testDir, { recursive: true })
  await fs.writeFile(testFile, testFileContent)
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
    info: 'format returns array of changed files',
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
    info: 'format with write returns array of changed files',
  },
  {
    fn: async () => {
      const result = await formatString('const a=1;', {})
      return typeof result === 'string'
    },
    expect: true,
    info: 'formatString returns formatted string',
  },
  {
    fn: async () => {
      await createMockFile()
      const result = await format({
        include: [testDir],
        exclude: ['node_modules'],
        fileTypes: ['js'],
        write: false,
      })
      await cleanMockFile()
      return Array.isArray(result)
    },
    expect: true,
    info: 'format handles array include parameter',
  },
  {
    fn: async () => {
      const result = await format({
        include: 'nonexistent',
        fileTypes: ['js'],
      })
      return Array.isArray(result)
    },
    expect: true,
    info: 'format handles nonexistent directory',
  },
  {
    fn: async () => {
      await createMockFile()
      await fs.writeFile(path.join(testDir, '.gitignore'), 'ignored-dir\nignored-file.js')
      const result = await format({
        include: testDir,
        exclude: 'string-exclude',
        fileTypes: ['js'],
        write: false,
      })
      await cleanMockFile()
      return Array.isArray(result)
    },
    expect: true,
    info: 'format handles gitignore with string exclude',
  },
  {
    fn: async () => {
      // Test case where no .gitignore exists and no args.exclude is provided
      const result = await format({
        include: 'nonexistent',
        fileTypes: ['js'],
        exclude: undefined,
      })
      return Array.isArray(result)
    },
    expect: true,
    info: 'format handles no gitignore and no exclude',
  },
]
