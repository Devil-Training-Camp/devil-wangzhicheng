import * as fsPromises from 'fs/promises'

export default class FileSystem {
  static async isFileExist(filepath: string): Promise<boolean> {
    try {
      await fsPromises.access(filepath)
      return true
    } catch {
      return false
    }
  }
}
