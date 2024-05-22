import { Context } from 'koa'
import LocalFileStorage from '@src/utils/LocalFileStorage'
import { UPLOAD_FOLDER_PATH } from '@src/utils/constant'
import type {
  FileHashRequestParams,
  FileHashResponseParams,
  ResponseParams
} from '../../types'
import { getFilename } from '@src/utils/files'
import formidable from 'formidable'

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
  // const formidableChunk: formidable.File = ctx.request.files!
  //   .chunk as formidable.File

  const fs = new LocalFileStorage({ path: UPLOAD_FOLDER_PATH })

  const filenameParams: FileHashRequestParams = {
    name: name as string,
    hash: hash,
    isChunk: true
  }
  const filename = getFilename(filenameParams)
  const res: boolean = await fs.save(filename, ctx.req)

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
    message: '切片写入失败'
  }
  ctx.status = 200
}
