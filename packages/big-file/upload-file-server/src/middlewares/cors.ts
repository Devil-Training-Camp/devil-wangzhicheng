import { Context, Middleware, Next } from 'koa'
import process from 'node:process'

const cors = (): Middleware => {
  return async (ctx: Context, next: Next) => {
    // 这也明显是非常不合理的动作
    // 生产环境下对所有域都支持跨域，不安全啊
    /**
     * 优化：
     * 区分生产和开发环境
     */
    if (process.env.NODE_ENV === 'development') {
      ctx.set('Access-Control-Allow-Origin', '*')
    } else {
      ctx.set('Access-Control-Allow-Origin', `localhost:3000`)
    }
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('Access-Control-Allow-Headers', '*')
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    if (ctx.method === 'OPTIONS') {
      ctx.body = 204
    } else {
      await next()
    }
  }
}

export default cors
