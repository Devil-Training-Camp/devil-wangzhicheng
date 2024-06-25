// 检查文件是否存在
import { Context } from 'koa'
import { CheckFileExistsRequestParams } from '../../types'
import LocalFileStorage from '@src/utils/LocalFileStorage'
import { UPLOAD_FOLDER_PATH } from '@src/utils/constant'

/**
 * 切片文件名 hash-$index
 */
const checkFileExistsController = async (ctx: Context): Promise<void> => {
  const params: CheckFileExistsRequestParams = {
    name: ctx.request.query.name as string
  }
  const isExist = await ctx.localFs.isExist(params.name)
  ctx.body = {
    code: 200,
    message: 'success',
    data: {
      isExist
    }
  }
  ctx.status = 200
}

export default checkFileExistsController
