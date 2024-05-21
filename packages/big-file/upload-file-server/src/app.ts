import Koa, { Context, Next } from 'koa'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import filesRoutes from './routes/filesRoutes'

const app: Koa = new Koa()
app.use(logger())
// 设置跨域
app.use(async (ctx: Context, next: Next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Headers', '*')
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  if (ctx.method === 'OPTIONS') {
    ctx.body = 204
  } else {
    await next()
  }
})
app.use(bodyParser())
app.use(filesRoutes.routes()).use(filesRoutes.allowedMethods())

app.listen(process.env.PORT, () => {
  console.log('服务端启动，端口', process.env.PORT)
})
