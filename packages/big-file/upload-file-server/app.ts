import Koa from 'koa'
import { FileHashResponseParams, ResponseParams } from '@/types'

const app: Koa = new Koa()

app.use(async (ctx) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Headers', '*')
  ctx.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  if (ctx.method === 'OPTIONS') {
    ctx.body = 200
  }
  if (ctx.request.method === 'GET' && ctx.request.path === '/') {
    ctx.status = 200
    ctx.body = 'hello world'
  }
  if (ctx.request.method === 'GET' && ctx.request.path === '/files/findFile') {
    const res: ResponseParams<FileHashResponseParams> = {
      code: 200,
      data: {
        isExist: true
      },
      message: '成功'
    }
    ctx.status = 200
    ctx.body = res
  }
})

app.listen(process.env.PORT, () => {
  console.log('服务端启动，端口', process.env.PORT)
})
