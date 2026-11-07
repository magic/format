import path from 'path'

import { findFiles } from '../src/findFiles.js'

const dir = path.join(process.cwd(), 'test', '.findFiles')

const expectedFullDir = [
  '/home/j/dev/magic/util/format/test/.findFiles/file1.mjs',
  '/home/j/dev/magic/util/format/test/.findFiles/file2.txt',
  '/home/j/dev/magic/util/format/test/.findFiles/file3.csv',
  '/home/j/dev/magic/util/format/test/.findFiles/subDir/subFile1.js',
  '/home/j/dev/magic/util/format/test/.findFiles/subDir/subFile2.md',
  '/home/j/dev/magic/util/format/test/.findFiles/routes/docs/file.js',
  '/home/j/dev/magic/util/format/test/.findFiles/docs/shouldExclude.md',
]

const expectedMjsExcluded = [
  '/home/j/dev/magic/util/format/test/.findFiles/file2.txt',
  '/home/j/dev/magic/util/format/test/.findFiles/file3.csv',
  '/home/j/dev/magic/util/format/test/.findFiles/subDir/subFile1.js',
  '/home/j/dev/magic/util/format/test/.findFiles/subDir/subFile2.md',
  '/home/j/dev/magic/util/format/test/.findFiles/routes/docs/file.js',
  '/home/j/dev/magic/util/format/test/.findFiles/docs/shouldExclude.md',
]

const expectedSubDirExcluded = [
  '/home/j/dev/magic/util/format/test/.findFiles/file1.mjs',
  '/home/j/dev/magic/util/format/test/.findFiles/file2.txt',
  '/home/j/dev/magic/util/format/test/.findFiles/file3.csv',
  '/home/j/dev/magic/util/format/test/.findFiles/routes/docs/file.js',
  '/home/j/dev/magic/util/format/test/.findFiles/docs/shouldExclude.md',
]

const expectedNestedDirs = ['/home/j/dev/magic/util/format/test/.findFiles/routes/docs/file.js']

const expectedNestedDirsExcluded = [
  '/home/j/dev/magic/util/format/test/.findFiles/subDir/subFile2.md',
]

export default [
  {
    fn: findFiles({ include: dir, fileTypes: ['.mjs', '.js', '.csv', '.md', '.txt'] }),
    expect: expectedFullDir,
    info: 'findFiles finds files',
  },
  {
    fn: findFiles({ include: dir, fileTypes: ['.js', '.csv', '.md', '.txt'] }),
    expect: expectedMjsExcluded,
    info: 'findFiles can exclude',
  },
  {
    fn: findFiles({
      include: dir,
      exclude: 'subDir',
      fileTypes: ['.mjs', '.js', '.csv', '.md', '.txt'],
    }),
    expect: expectedSubDirExcluded,
    info: 'findFiles can exclude by string',
  },
  {
    fn: findFiles({
      include: dir,
      exclude: ['subDir'],
      fileTypes: ['.mjs', '.js', '.csv', '.md', '.txt'],
    }),
    expect: expectedSubDirExcluded,
    info: 'findFiles can exclude by array',
  },
  {
    fn: findFiles({
      include: dir,
      exclude: ['docs'],
      fileTypes: ['.js', '.md'],
    }),
    expect: expectedNestedDirs,
    info: 'findFiles excludes only exact "docs" dir, not nested paths like routes/docs',
  },
  {
    fn: findFiles({
      include: dir,
      exclude: ['docs'],
      fileTypes: ['.md'],
    }),
    expect: expectedNestedDirsExcluded,
    info: 'findFiles excludes direct child docs dir',
  },
]
