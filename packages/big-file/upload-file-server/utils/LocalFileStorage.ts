import FileStorage from '@big-file/upload-file-client/utils/FileStorage'
import * as fsPromises from 'node:fs/promises'

interface LocalFileStorageParams {
  path: string
}
export default class LocalFileStorage extends FileStorage<String, Blob> {
  private readonly path: string
  constructor({ path }: LocalFileStorageParams) {
    super()
    this.path = path
  }
  public get(key: String): Promise<Blob> {
    return Promise.resolve(undefined!)
  }
  public async isExist(key: String): Promise<boolean> {
    try {
      await fsPromises.access(this.path)
      return true
    } catch {
      return false
    }
  }
  public save(key: String, value: Blob): Promise<void> {
    return Promise.resolve()
  }
}
