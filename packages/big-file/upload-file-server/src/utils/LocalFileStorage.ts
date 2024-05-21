// import FileStorage from '@big-file/upload-file-client/utils/FileStorage'
import * as fsPromises from 'node:fs/promises'
import * as path from 'node:path'
import * as formidable from 'formidable'
import { IncomingMessage } from 'http'

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
      try {
        await fsPromises.mkdir(this.path)
        console.log('创建文件夹成功')
      } catch (e) {
        console.error('创建文件夹失败', e)
      }
    }
  }

  public get(key: String): Promise<Blob> {
    return Promise.resolve(undefined!)
  }

  public async isExist(filename: string): Promise<boolean> {
    await this.createDir()
    try {
      await fsPromises.access(path.join(this.path, filename))
      return true
    } catch {
      return false
    }
  }

  public async save(key: string, req: IncomingMessage): Promise<boolean> {
    // try {
    // const form = new formidable.IncomingForm()
    // form.uploadDir = this.path
    // form.keepExtensions = true
    // form.parse(req, (err, fields, files) => {
    //   console.log('fields', fields)
    // })
    // const buffer = Buffer.from(await value.arrayBuffer())
    // await fsPromises.writeFile(path.join(this.path, key), buffer)
    // return true
    // } catch (e) {
    //   console.error(`写入文件 ${key} 失败：`, e)
    //   return false
    // }
  }
}
