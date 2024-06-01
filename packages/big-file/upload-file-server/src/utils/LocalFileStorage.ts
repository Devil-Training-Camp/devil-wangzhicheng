// import FileStorage from '@big-file/upload-file-client/utils/FileStorage'
import * as fsPromises from 'node:fs/promises'
import * as path from 'node:path'
import { UPLOAD_FOLDER_PATH } from '@src/utils/constant'

interface LocalFileStorageParams {
  path: string
}

export default class LocalFileStorage {
  private readonly path: string

  constructor({ path }: LocalFileStorageParams) {
    // super()
    this.path = path
  }

  // 创建文件夹
  private async createDir(): Promise<void> {
    try {
      await fsPromises.access(this.path)
    } catch (e) {
      console.error(`不存在文件夹${this.path}，开始创建...`)
      // 这是一个非常不好的实践，try-catch 里面居然还包含 try-catch？
      // 想办法优化一下
      try {
        await fsPromises.mkdir(this.path)
        console.log('创建文件夹成功')
      } catch (e) {
        console.error('创建文件夹失败', e)
      }
    }
  }

  public get(key: String): Promise<Blob> {
    // 啥意思？持续返回 undefined？
    return Promise.resolve(undefined!)
  }

  public async isExist(filename: string): Promise<boolean> {
    // isExist 应该是很纯净的函数，不应该有副作用
    // 这里一进来就 creteDir，明显不合适啊
    await this.createDir()
    try {
      await fsPromises.access(path.join(this.path, filename))
      return true
    } catch {
      return false
    }
  }

  public async save(filename: string, file: any): Promise<boolean> {
    try {
      const oldName = file.filepath
      const newName = path.join(UPLOAD_FOLDER_PATH, filename)
      await fsPromises.rename(oldName, newName)
      return true
    } catch (e) {
      console.error(`写入文件 ${filename} 失败：`, e)
      return false
    }
  }
}
