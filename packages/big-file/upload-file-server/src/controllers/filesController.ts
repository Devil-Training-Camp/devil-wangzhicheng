import { Context } from 'koa'
import LocalFileStorage from '@src/utils/LocalFileStorage'
import { UPLOAD_FOLDER_PATH } from '@src/utils/constant'
import type {
  CheckFileExistsRequestParams,
  FileMergeRequestParams
} from '../../types'
import * as path from 'node:path'
import fsPromises from 'node:fs/promises'
import * as console from 'node:console'

// 检查文件是否存在
/**
 * 切片文件名 hash-$index
 */
export const checkFileExists = async (ctx: Context): Promise<void> => {
  const params: CheckFileExistsRequestParams = {
    name: ctx.request.query.name as string
  }
  const fs = new LocalFileStorage({ path: UPLOAD_FOLDER_PATH })
  await fs.init()
  const isExist = await fs.isExist(params.name)
  ctx.body = {
    code: 200,
    message: 'success',
    data: {
      isExist
    }
  }
  ctx.status = 200
}

// 上传切片到后端
export const uploadChunk = async (ctx: Context): Promise<void> => {
  const { chunkName }: { chunkName: string } = ctx.request.body

  const fs = new LocalFileStorage({ path: UPLOAD_FOLDER_PATH })
  await fs.init()
  const res: boolean = await fs.save(chunkName, ctx.request.files!.chunk)

  if (res) {
    ctx.body = {
      code: 200,
      data: null,
      message: 'success'
    }
    ctx.status = 200
    return
  }
  ctx.body = {
    // 这些错误应该也要写成 ts 的枚举值
    /**
     * 优化：
     * 增加ErrorType枚举
     */
    code: ErrorType.FileWriteError,
    data: null,
    message: '文件写入失败'
  }
  // 错误之后还 200？不对吧？
  ctx.status = ErrorType.FileWriteError
}

//  合并文件
export const mergeFile = async (ctx: Context): Promise<void> => {
  const params: FileMergeRequestParams = ctx.request.body
  try {
    const targetFilename = path.join(UPLOAD_FOLDER_PATH, params.name)
    const buffers: Buffer[] = await Promise.all(
      params.chunks.map((chunk) => {
        const sourceFilename = path.join(
          UPLOAD_FOLDER_PATH,
          `${params.hash}-$${chunk.index}`
        )
        return fsPromises.readFile(sourceFilename)
      })
    )
    const buffer = Buffer.concat(buffers)
    // 批量读，批量写；文件体积比较大的时候，可能会有性能问题
    // 或者内存爆栈问题
    // 这里推荐用 stream api
    /**
     * TODO 当初用stream api提示类型不符合才改用buffer的
     */
    await fsPromises.writeFile(targetFilename, buffer)

    ctx.body = {
      code: 200,
      data: null,
      message: '文件合并成功'
    }
    ctx.status = 200
  } catch (e) {
    ctx.body = {
      code: ErrorType.FileMergeError,
      data: null,
      message: '文件合并失败'
    }
    // 为什么这些错误的情况都返回 200？
    /**
     * 优化：
     * 增加FileMergeError
     */
    ctx.status = ErrorType.FileMergeError
  }

  // 删除分片
  try {
    await Promise.all(
      params.chunks.map((chunk) => {
        const sourceFilename = path.join(
          UPLOAD_FOLDER_PATH,
          `${params.hash}-$${chunk.index}`
        )
        return fsPromises.unlink(sourceFilename)
      })
    )
  } catch (e) {
    console.error('删除切片错误', e)
  }
}
