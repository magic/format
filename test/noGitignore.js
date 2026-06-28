import path from 'path'
import fs from '@magic/fs'
import { execSync } from 'node:child_process'

// Use /tmp for testing - it has no gitignore
const testDir = '/tmp/.magic-format-test-no-gitignore'
const testFile = path.join(testDir, 'test.js')
const testFileContent = 'const a=1;const b=2;'

const createMockFile = async () => {
  await fs.mkdir(testDir, { recursive: true })
  await fs.writeFile(testFile, testFileContent)
}

const cleanMockFile = async () => {
  await fs.rm(testDir, { recursive: true, force: true })
}

const runFormatInDir = (dir, args = {}) => {
  try {
    const argsStr = Object.entries(args)
      .map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`)
      .join(',\n')

    const code = `
import { format } from '/home/j/dev/magic/util/format/src/index.js';
const result = await format({
  include: '${dir}',
  fileTypes: ['js'],
${argsStr}
});
console.log(JSON.stringify({ isArray: Array.isArray(result) }));
`.trim()

    const result = execSync(
      `cd "${dir}" && node --input-type=module -e "${code.replace(/"/g, '\\"')}"`,
      {
        encoding: 'utf8',
        timeout: 10000,
      },
    )

    const parsed = JSON.parse(result.trim())
    return parsed.isArray
  } catch (e) {
    return false
  }
}

export default [
  {
    fn: async () => {
      await createMockFile()
      const result = runFormatInDir(testDir)
      await cleanMockFile()
      return result
    },
    expect: true,
    info: 'format uses default exclude when no gitignore exists',
  },
  {
    fn: async () => {
      await createMockFile()
      const result = runFormatInDir(testDir, { exclude: ['custom-exclude'] })
      await cleanMockFile()
      return result
    },
    expect: true,
    info: 'format merges exclude with default when no gitignore',
  },
]
