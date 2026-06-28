import path from 'path'
import fs from '@magic/fs'
import { findFiles } from '../src/findFiles.js'

const dir = path.join(process.cwd(), 'test', '.findFiles')

export default [
  {
    fn: async () => {
      const result = await findFiles({
        include: dir,
        fileTypes: ['.mjs', '.js', '.csv', '.md', '.txt'],
        verbose: true,
      })
      return Array.isArray(result) && result.length > 0
    },
    expect: true,
    info: 'findFiles handles verbose mode',
  },
  {
    fn: async () => {
      const result = await findFiles({
        include: dir,
        exclude: [],
        fileTypes: ['.mjs', '.js', '.csv', '.md', '.txt'],
      })
      return Array.isArray(result)
    },
    expect: true,
    info: 'findFiles handles empty exclude array',
  },
  {
    fn: async () => {
      const result = await findFiles({
        include: [dir],
        exclude: [],
        fileTypes: ['.js'],
      })
      return Array.isArray(result)
    },
    expect: true,
    info: 'findFiles handles array include',
  },
]
