import { Context, Middleware, Next } from 'koa'
import { ResponseParams } from '../../types'
import HError from '@src/utils/error'

const errorCatch = (): Middleware => {
  return async (ctx: Context, next: Next) => {
    try {
      await next()
    } catch (err) {
      const e: HError = err as HError
      ctx.body = {
        message: e.message,
        code: e.code,
        data: null
      } as ResponseParams<null>
      ctx.status = 500
    }
  }
}

export default errorCatch
