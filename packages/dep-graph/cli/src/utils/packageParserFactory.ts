import * as path from 'node:path'
import FileSystem from './FileSystem'
import PP from '@dep-graph/core'

const packageParserFactory = async (filepath: string) => {
  if (await FileSystem.isFileExist(path.resolve(filepath, 'pnpm-lock.yaml'))) {
    return new PP.PnpmPackageParser(filepath)
  } else if (
    await FileSystem.isFileExist(path.resolve(filepath, 'yarn.lock'))
  ) {
    return new PP.YarnPackageParser(filepath)
  } else if (
    await FileSystem.isFileExist(path.resolve(filepath, 'package-lock.json'))
  ) {
    return new PP.NpmPackageParser(filepath)
  } else {
    throw new Error(
      `${path.resolve(filepath)} is not exist or package lock file is not exist`
    )
  }
}

export default packageParserFactory
