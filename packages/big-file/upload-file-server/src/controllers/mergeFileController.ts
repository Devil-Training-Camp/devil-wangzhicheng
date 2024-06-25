//  合并文件
import { Context } from 'koa'
import { ChunkInfo, FileMergeRequestParams } from '../../types'
import { UPLOAD_FOLDER_PATH } from '@src/utils/constant'
import * as path from 'node:path'
import MergeFile, { MergeSource } from '@src/utils/MergeFile'
import ErrorType from '@src/utils/error'
import fsPromise from 'node:fs/promises'

const mergeChunks = async (params: FileMergeRequestParams): Promise<void> => {
  const target: string = path.resolve(UPLOAD_FOLDER_PATH, params.name)
  const sources: MergeSource[] = params.chunks.map((chunk: ChunkInfo) => ({
    source: path.resolve(UPLOAD_FOLDER_PATH, `${params.hash}-$${chunk.index}`),
    index: chunk.index,
    size: chunk.size
  }))

  const mergeFile: MergeFile = new MergeFile({
    target,
    sources
  })

  await mergeFile.merge()
}

const deleteChunks = async (params: FileMergeRequestParams): Promise<void> => {
  await Promise.all(
    params.chunks.map((chunk: ChunkInfo) =>
      fsPromise.unlink(
        path.resolve(UPLOAD_FOLDER_PATH, `${params.hash}-$${chunk.index}`)
      )
    )
  )
}

const mergeFileController = async (ctx: Context): Promise<void> => {
  const params: FileMergeRequestParams = ctx.request.body
  try {
    // 批量读，批量写；文件体积比较大的时候，可能会有性能问题
    // 或者内存爆栈问题
    // 这里推荐用 stream api
    /**
     * TODO 当初用stream api提示类型不符合才改用buffer的
     * 额，可以问问其他同学的实现，核心代码就几行：
     * const writeStream = fs.createWriteStream(outputFile);
     * const readStream = fs.createReadStream(inputFiles[currentIndex]);
     * readStream.pipe(writeStream, { end: false });
     */
    /**
     * 优化：
     * 改用stream api
     */
    await mergeChunks(params)

    await deleteChunks(params)

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
    ctx.status = 200
  }
}

export default mergeFileController