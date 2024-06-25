// 上传切片到后端
import { Context } from 'koa'
import HError, { ErrorType } from '@src/utils/error'

const uploadChunkController = async (ctx: Context): Promise<void> => {
  try {
    const { chunkName }: { chunkName: string } = ctx.request.body
    await ctx.localFs.save(chunkName, ctx.request.files!.chunk)

    ctx.body = {
      code: 200,
      data: null,
      message: 'success'
    }
    ctx.status = 200
  } catch {
    // 这些错误应该也要写成 ts 的枚举值
    // 错误之后还 200？不对吧？
    /**
     * 优化：
     * 添加错误处理中间件
     */
    throw new HError(ErrorType.FileWriteError, '写入文件时发生错误')
  }
}

export default uploadChunkController
