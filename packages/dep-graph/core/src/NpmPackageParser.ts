import PackageParser, { Node } from './PackageParser'
import { Dependencies } from '@pnpm/types'
import * as fs from 'node:fs'
import * as path from 'node:path'

export default class NpmPackageParser extends PackageParser {
  private lockfileData: any
  constructor(filepath: string) {
    super(filepath)
    this.lockfile = 'package-lock.json'
  }

  protected async parseLockfile(depth: number): Promise<Dependencies> {
    this.lockfileData = await import(
      path.resolve(this.filepath, this.lockfile!)
    )

    return null
  }
}
