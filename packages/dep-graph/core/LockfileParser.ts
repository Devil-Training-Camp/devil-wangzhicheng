export default abstract class LockfileParser {
  private lockfilename: string

  constructor(lockfilename: string) {
    this.lockfilename = lockfilename
  }

  public abstract parse(): Promise<{ [key: string]: any }>
}
