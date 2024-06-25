// 检查文件是否存在
import { Context } from 'koa'
import { CheckFileExistsRequestParams } from '../../types'
import HError, { ErrorType } from '@src/utils/error'

/**
 * 切片文件名 hash-$index
 */
const checkFileExistsController = async (ctx: Context): Promise<void> => {
  try {
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
  } catch {
    throw new HError(ErrorType.FileCheckExistError, '检查文件时发生错误')
  }
}

export default checkFileExistsController
