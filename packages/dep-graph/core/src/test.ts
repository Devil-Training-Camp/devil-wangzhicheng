import * as path from 'node:path'
import PnpmPackageParser from './PnpmPackageParser'
import * as fsPromises from 'node:fs/promises'
import NpmPackageParser from './NpmPackageParser'
import YarnPackageParser from './YarnPackageParser'
import { fileURLToPath } from 'node:url'

const getLockfile = async () => {
  const filepath = path.resolve(
    import.meta.dirname,
    '../../../big-file/upload-file-client' // pnpm
  )
  console.log('path', path.resolve('../', filepath))
  const parser = new PnpmPackageParser(filepath)
  const res = await parser.parse()
  await fsPromises.writeFile('lock.json', JSON.stringify(res, null, 4))
}

const getNpmLockfile = async () => {
  const currentPath = fileURLToPath(import.meta.url)
  const filepath = path.resolve(currentPath, '../../../../../../newlz-m-nuxt')
  console.log('filepath', filepath)

  const parser = new NpmPackageParser(filepath)
  const res = await parser.parse()
  await fsPromises.writeFile('lock.json', JSON.stringify(res, null, 4))
}

const getYarnLockfile = async () => {
  const currentPath = fileURLToPath(import.meta.url)
  const filepath = path.resolve(currentPath, '../../../../../../longzhu-m-new')
  console.log('filepath', filepath)

  const parser = new YarnPackageParser(filepath)
  const res = await parser.parse()
  await fsPromises.writeFile('lock.json', JSON.stringify(res, null, 4))
}

// getLockfile()
// getNpmLockfile()
getYarnLockfile()
