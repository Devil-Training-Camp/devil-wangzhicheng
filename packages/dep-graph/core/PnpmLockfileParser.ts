import LockfileParser from './LockfileParser'

export default class PnpmLockfileParser extends LockfileParser {
  constructor(lockfilename: string) {
    super(lockfilename)
  }

  public async parse(): Promise<{ [key: string]: any }> {
    if (await this.isFileExist()) {
      throw new Error(`${this.getAbstractLockfilename()} is not exist.`)
    }
    return
  }
}
