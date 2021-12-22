import path from 'path'

import { findFiles } from '../src/findFiles.mjs'

const dir = path.join(process.cwd(), 'test', '.findFiles')

const expectedFullDir = [
  "/home/j/dev/magic/util/format/test/.findFiles/file1.mjs",
  "/home/j/dev/magic/util/format/test/.findFiles/file2.txt",
  "/home/j/dev/magic/util/format/test/.findFiles/file3.csv",
  "/home/j/dev/magic/util/format/test/.findFiles/subDir/subFile1.js",
  "/home/j/dev/magic/util/format/test/.findFiles/subDir/subFile2.md",
]

const expectedMjsExcluded = [
  "/home/j/dev/magic/util/format/test/.findFiles/file2.txt",
  "/home/j/dev/magic/util/format/test/.findFiles/file3.csv",
  "/home/j/dev/magic/util/format/test/.findFiles/subDir/subFile1.js",
  "/home/j/dev/magic/util/format/test/.findFiles/subDir/subFile2.md",
]

const expectedSubDirExcluded = [
  "/home/j/dev/magic/util/format/test/.findFiles/file1.mjs",
  "/home/j/dev/magic/util/format/test/.findFiles/file2.txt",
  "/home/j/dev/magic/util/format/test/.findFiles/file3.csv",
]

export default [
  { fn: findFiles({ include: dir, fileTypes: [ '.mjs', '.js', '.csv', '.md', '.txt' ] }), expect: expectedFullDir, info: 'findFiles finds files' },
  { fn: findFiles({ include: dir, fileTypes: [ '.js', '.csv', '.md', '.txt' ] }), expect: expectedMjsExcluded, info: 'findFiles can exclude' },
  { fn: findFiles({ include: dir, exclude: 'subDir', fileTypes: [ '.mjs', '.js', '.csv', '.md', '.txt' ] }), expect: expectedSubDirExcluded, info: 'findFiles can exclude by string' },
  { fn: findFiles({ include: dir, exclude: [ 'subDir' ], fileTypes: [ '.mjs', '.js', '.csv', '.md', '.txt' ] }), expect: expectedSubDirExcluded, info: 'findFiles can exclude by array' },
]
