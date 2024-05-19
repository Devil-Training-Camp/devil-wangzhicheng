import { Context } from 'koa'
import LocalFileStorage from '../utils/LocalFileStorage'
import { UPLOAD_FOLDER_PATH } from '../utils/constant'
import { FileHashRequestParams } from '../types'
import { getFilename } from '../utils/files'

export const checkFileExists = async (ctx: Context): Promise<void> => {
  const params: FileHashRequestParams = ctx.request
    .body as FileHashRequestParams
  const fileName = getFilename(params)
  const fs = new LocalFileStorage({ path: UPLOAD_FOLDER_PATH })
  await fs.isExist(fileName)
  ctx.body = 'Hello World'
  ctx.status = 200
}
