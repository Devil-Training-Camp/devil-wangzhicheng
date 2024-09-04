import * as path from 'node:path'
import PnpmPackageParser from './PnpmPackageParser'
import * as fsPromises from 'node:fs/promises'
import NpmPackageParser from './NpmPackageParser'

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
  const filepath = path.resolve(
    import.meta.dirname,
    '../../../../../newlz-m-nuxt' //npm
  )
  console.log('path', path.resolve('../', filepath))
  const parser = new NpmPackageParser(filepath)
  const res = await parser.parse()
  await fsPromises.writeFile('lock.json', JSON.stringify(res, null, 4))
}

// getLockfile()
getNpmLockfile()
