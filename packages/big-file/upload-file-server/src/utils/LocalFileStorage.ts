import * as fsPromises from 'node:fs/promises'
import * as path from 'node:path'
import { UPLOAD_FOLDER_PATH } from '@src/utils/constant'

interface LocalFileStorageParams {
  path: string
}

export default class LocalFileStorage {
  private readonly path: string

  constructor({ path }: LocalFileStorageParams) {
    this.path = path
  }

  public async init() {
    await this.createDir()
  }

  // 创建文件夹
  private async createDir(): Promise<void> {
    try {
      await fsPromises.access(this.path)
    } catch (e) {
      console.error(`不存在文件夹${this.path}，开始创建...`)
      // 这是一个非常不好的实践，try-catch 里面居然还包含 try-catch？
      // 想办法优化一下
      /**
       * 疑问：
       * 这里文件夹不存在的时候catch，创建文件夹，应该怎么优化？！
       */
      try {
        await fsPromises.mkdir(this.path)
        console.log('创建文件夹成功')
      } catch (e) {
        console.error('创建文件夹失败', e)
      }
    }
  }

  public async isExist(filename: string): Promise<boolean> {
    // isExist 应该是很纯净的函数，不应该有副作用
    // 这里一进来就 creteDir，明显不合适啊
    /**
     * 优化：
     * 添加init函数，初始化文件夹
     */
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
