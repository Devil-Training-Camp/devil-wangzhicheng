import { Context } from 'koa'
import LocalFileStorage from '@src/utils/LocalFileStorage'
import { UPLOAD_FOLDER_PATH } from '@src/utils/constant'
import type {
  FileHashRequestParams,
  FileHashResponseParams,
  FileMergeRequestParams,
  ResponseParams,
  UploadFileInfoRequestParams
} from '../../types'
import { getFilename } from '@src/utils/files'
import fsPromises from 'fs/promises'
import * as path from 'node:path'

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

// 上传文件信息
/**
 * 文件信息名称: name_hash_info.json
 */
export const uploadFileInfo = async (ctx: Context): Promise<void> => {
  const data: UploadFileInfoRequestParams = ctx.request.body
  const { name, hash } = data
  const filename = path.join(UPLOAD_FOLDER_PATH, `${name}_${hash}_info.json`)
  try {
    const json: string = JSON.stringify(data, undefined, '  ')
    await fsPromises.writeFile(filename, json, 'utf-8')
    ctx.body = {
      code: 200,
      data: null,
      message: 'success'
    }
    ctx.status = 200
  } catch {
    ctx.body = {
      code: 10001,
      data: null,
      message: '上传文件信息失败'
    }
    ctx.status = 200
  }
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
  const params: FileMergeRequestParams = {
    name: ctx.request.query.name as string,
    hash: ctx.request.query.hash as string
  }
  try {
    // TODO 错误类型
    // TODO 寻找配置文件
    // TODO 合并文件
  } catch (e) {
    ctx.body = {
      code: 10002,
      data: null,
      message: '文件合并失败'
    }
    ctx.status = 200
  }
}
