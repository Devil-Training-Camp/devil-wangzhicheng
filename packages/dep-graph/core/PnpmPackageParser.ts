import PackageParser, { Dependencies } from './PackageParser'

export default class PnpmPackageParser extends PackageParser {
  constructor(filepath: string) {
    super(filepath)
    this.lockfile = 'pnpm-lock.yaml'
  }

  protected parseLockfile(): Promise<Dependencies> {
    return Promise.resolve(undefined)
  }
}
