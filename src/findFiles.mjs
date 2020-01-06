import path from 'path'

import deep from '@magic/deep'
import fs from '@magic/fs'

export const findFiles = async ({ include, exclude, fileTypes }) => {
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
          .filter(file => !exclude.some(e => file === e || `${file}/`.startsWith(`${e}/`)))
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
