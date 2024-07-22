import * as path from 'node:path'
import PnpmPackageParser from './PnpmPackageParser'
import * as fsPromises from 'node:fs/promises'

const getLockfile = async () => {
  const filepath = path.resolve(
    __dirname,
    '../../../big-file/upload-file-client'
  )
  console.log('path', path.resolve('../', filepath))
  const parser = new PnpmPackageParser(filepath)
  const res = await parser.parse()
  await fsPromises.writeFile('lock.json', JSON.stringify(res, null, 4))
}

getLockfile()
