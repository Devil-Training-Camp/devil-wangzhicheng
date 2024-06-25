import LocalFileStorage from '@src/utils/LocalFileStorage'
import { UPLOAD_FOLDER_PATH } from '@src/utils/constant'
import { Context, Middleware, Next } from 'koa'

const localFs = (): Middleware => {
  const fs: LocalFileStorage = new LocalFileStorage({
    path: UPLOAD_FOLDER_PATH
  })
  return async (ctx: Context, next: Next) => {
    if (!fs.isInited) {
      await fs.init()
    }
    ctx.localFs = fs
    await next()
  }
}

export default localFs
