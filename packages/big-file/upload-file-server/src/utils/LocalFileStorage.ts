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
    // 这是一个非常不好的实践，try-catch 里面居然还包含 try-catch？
    // 想办法优化一下
    /**
     * 疑问：
     * 这里文件夹不存在的时候catch，创建文件夹，应该怎么优化？！
     * 解答：可以考虑把目录是否存在的判断再单独抽成一个函数，类似于：
     const dirExist=(dir:string)=>{
     try{
     const stat=await fsPromises.access(this.path);
     if(!stat){
     return false;
     }
     return true;
     }catch(e){
     return false;
     }
     }
     之后再你的代码中调用这个函数判断目录是否存在，就不用 try-catch 了
     */
    if (!(await this.pathExist(this.path))) {
      try {
        await fsPromises.mkdir(this.path)
        console.log('创建文件夹成功')
      } catch (e) {
        console.error('创建文件夹失败', e)
        throw e
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
    return this.pathExist(path.resolve(this.path, filename))
  }

  public async save(filename: string, file: any): Promise<void> {
    try {
      const oldName = file.filepath
      const newName: string = path.resolve(UPLOAD_FOLDER_PATH, filename)
      await fsPromises.rename(oldName, newName)
    } catch (e) {
      console.error(`写入文件 ${filename} 失败：`, e)
      throw e
    }
  }

  public async pathExist(path: string): Promise<boolean> {
    try {
      await fsPromises.access(path)
      return true
    } catch {
      return false
    }
  }
}
