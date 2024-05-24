import { Context } from 'koa'
import LocalFileStorage from '@src/utils/LocalFileStorage'
import { UPLOAD_FOLDER_PATH } from '@src/utils/constant'
import type {
  ChunkInfo,
  FileHashRequestParams,
  FileHashResponseParams,
  FileMergeRequestParams,
  ResponseParams
} from '../../types'
import { getFilename } from '@src/utils/files'
import * as path from 'node:path'
import fsPromises from 'node:fs/promises'
import stream from 'node:stream/promises'
import * as zlib from 'node:zlib'

// 检查文件是否存在
export const checkFileExists = async (ctx: Context): Promise<void> => {
  const params: FileHashRequestParams = {
    name: ctx.request.query.name as string,
    hash: ctx.request.query.hash as string,
    isChunk: ctx.request.query.isChunk === 'true'
  }
  const fileName = getFilename(params)
  const fs = new LocalFileStorage({ path: UPLOAD_FOLDER_PATH })
  const isExist = await fs.isExist(fileName)
  const res: ResponseParams<FileHashResponseParams> = {
    code: 200,
    message: 'success',
    data: {
      isExist
    }
  }
  ctx.body = res
  ctx.status = 200
}

// 上传切片到后端
export const uploadChunk = async (ctx: Context): Promise<void> => {
  const { name, hash }: { name: string; hash: string } = ctx.request.body

  const fs = new LocalFileStorage({ path: UPLOAD_FOLDER_PATH })

  const filenameParams: FileHashRequestParams = {
    name: name as string,
    hash: hash,
    isChunk: true
  }
  const filename = getFilename(filenameParams)
  const res: boolean = await fs.save(filename, ctx.request.files!.chunk)

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
    code: 10001,
    data: null,
    message: '文件写入失败'
  }
  ctx.status = 200
}

//  合并文件
export const mergeFile = async (ctx: Context): Promise<void> => {
  const params: FileMergeRequestParams = ctx.request.body
  try {
    // TODO 错误类型
    const targetFilename = path.join(
      UPLOAD_FOLDER_PATH,
      getFilename({
        name: params.name,
        hash: params.hash,
        isChunk: false
      })
    )
    const buffers: Buffer[] = await Promise.all(
      params.chunks.map((chunk) => {
        const sourceFilename = path.join(
          UPLOAD_FOLDER_PATH,
          getFilename({
            name: params.name,
            hash: chunk.hash,
            isChunk: true
          })
        )
        return fsPromises.readFile(sourceFilename)
      })
    )
    const buffer = Buffer.concat(buffers)
    await fsPromises.writeFile(targetFilename, buffer)

    ctx.body = {
      code: 200,
      data: null,
      message: '文件合并成功'
    }
    ctx.status = 200
  } catch (e) {
    ctx.body = {
      code: 10002,
      data: null,
      message: '文件合并失败'
    }
    ctx.status = 200
  }
}
