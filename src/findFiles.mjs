import path from 'path'

import deep from '@magic/deep'
import fs from '@magic/fs'
import is from '@magic/types'

const shouldIgnore = ({ dir, exclude, file }) => {
  return !exclude.some(e => file === e || path.join(dir, file).endsWith(path.join(e, file)))
}

export const findFiles = async ({ include = [], exclude = [], fileTypes = [] }) => {
  if (is.string(include)) {
    include = [ include ]
  }

  if (is.string(exclude)) {
    exclude = [ exclude ]
  }

  const files = await Promise.all(
    include.map(async dir => {
      if (dir.startsWith('.')) {
        return
      }

      const stat = await fs.stat(dir)
      let files = []
      if (stat.isDirectory()) {
        let dirContent = await fs.readdir(dir)
        dirContent = dirContent
          .filter(file => !file.startsWith('.'))
          .filter(file => shouldIgnore({ dir, exclude, file }))
          .filter(file => !file.includes('.') || fileTypes.some(ft => file.endsWith(ft)))

        files = await Promise.all(
          dirContent.map(a => findFiles({ include: [path.join(dir, a)], exclude, fileTypes })),
        )
      } else if (stat.isFile()) {
        if (fileTypes.some(f => dir.endsWith(f))) {
          files.push(dir)
        }
      }

      return files
    }),
  )

  return deep.flatten(files)
}
