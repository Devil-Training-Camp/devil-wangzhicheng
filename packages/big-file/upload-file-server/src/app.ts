import Koa, { Context, Next } from 'koa'
import logger from 'koa-logger'
import { koaBody } from 'koa-body'
import filesRoutes from './routes/filesRoutes'
import { UPLOAD_FOLDER_PATH } from '@src/utils/constant'
import * as process from 'node:process'
import localFs from '@src/middlewares/localFs'

const app: Koa = new Koa()
app.use(logger())
// 设置跨域
app.use(async (ctx: Context, next: Next) => {
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
})
app.use(koaBody())
app.use(filesRoutes.routes()).use(filesRoutes.allowedMethods())
app.use(localFs())

app.listen(process.env.PORT, () => {
  console.log('服务端启动，端口', process.env.PORT)
})
