import PackageParser from '@dep-graph/core/dist/PackageParser'
import PnpmPackageParser from '@dep-graph/core/dist/PnpmPackageParser'
import * as path from 'node:path'
import FileSystem from './FileSystem'

const packageParserFactory = async (
  filepath: string
): Promise<PackageParser> => {
  if (await FileSystem.isFileExist(path.resolve(filepath, 'pnpm-lock.yaml'))) {
    return new PnpmPackageParser(filepath)
  } else {
    throw new Error('package lock file is not exist.')
  }
}

export default packageParserFactory
