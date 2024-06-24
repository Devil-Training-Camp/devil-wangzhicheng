// 上传切片到后端
import { Context } from 'koa'
import { UPLOAD_FOLDER_PATH } from '@src/utils/constant'
import LocalFileStorage from '@src/utils/LocalFileStorage'
import ErrorType from '@src/utils/error'

const uploadChunkController = async (ctx: Context): Promise<void> => {
  try {
    const { chunkName }: { chunkName: string } = ctx.request.body

    const localFs: LocalFileStorage = new LocalFileStorage({
      path: UPLOAD_FOLDER_PATH
    })
    await localFs.init()
    await localFs.save(chunkName, ctx.request.files!.chunk)

    ctx.body = {
      code: 200,
      data: null,
      message: 'success'
    }
    ctx.status = 200
  } catch {
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
    /**
     * 优化：
     * 增加ErrorType枚举
     */
    ctx.status = 200
  }
}

export default uploadChunkController
