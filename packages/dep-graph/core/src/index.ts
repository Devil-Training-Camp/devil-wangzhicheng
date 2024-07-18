import * as path from 'node:path'
import PnpmPackageParser from './PnpmPackageParser'

const getLockfile = async () => {
  const filepath = path.resolve(__dirname, '../../big-file/upload-file-client')
  console.log('path', path.resolve('../', filepath))
  const parser = new PnpmPackageParser(filepath)
  const res = await parser.parse(1)
  console.log('res', res)
}

getLockfile()
