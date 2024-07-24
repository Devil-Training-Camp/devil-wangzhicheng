import * as path from 'node:path'
import FileSystem from './FileSystem'
import PP from '@dep-graph/core'

const packageParserFactory = async (filepath: string) => {
  if (await FileSystem.isFileExist(path.resolve(filepath, 'pnpm-lock.yaml'))) {
    return new PP.PnpmPackageParser(filepath)
  } else {
    throw new Error('package lock file is not exist.')
  }
}

export default packageParserFactory
