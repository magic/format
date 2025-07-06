import path from 'path'

import deep from '@magic/deep'
import fs from '@magic/fs'
import log from '@magic/log'
import is from '@magic/types'

const shouldIgnore = ({ dir, exclude, file }) => {
  return !exclude.some(e => {
    const fullExclude = path.join(dir, e)
    return file.startsWith(fullExclude)
  })
}

export const findFiles = async ({
  include = [],
  exclude = [],
  fileTypes = [],
  verbose = false,
}) => {
  if (is.string(include)) {
    include = [include]
  }

  if (is.string(exclude)) {
    exclude = [exclude]
  }

  if (!exclude.includes('.git')) {
    exclude.push('.git')
  }

  const files = await Promise.all(
    include.map(async dir => {
      const files = await fs.getFiles(dir)

      return files
        .filter(file => file.includes('.'))
        .filter(file => fileTypes.some(ft => file.endsWith(ft)))
        .filter(file => shouldIgnore({ dir, exclude, file }))
    }),
  )

  const flat = deep.flatten(files)

  if (verbose) {
    log.warn('format', 'checking files:')
    flat.forEach(file => log.info(file.replace(process.cwd(), '.')))
  }

  return flat
}
