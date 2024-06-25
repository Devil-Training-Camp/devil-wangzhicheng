import Koa from 'koa'
import logger from 'koa-logger'
import { koaBody } from 'koa-body'
import filesRoutes from './routes/filesRoutes'
import * as process from 'node:process'
import localFs from '@src/middlewares/localFs'
import cors from '@src/middlewares/cors'
import errorCatch from '@src/middlewares/errorCatch'

const app: Koa = new Koa()
app.use(logger())
app.use(cors())
app.use(koaBody())
app.use(localFs())
app.use(errorCatch())

app.use(filesRoutes.routes()).use(filesRoutes.allowedMethods())

app.listen(process.env.PORT, () => {
  console.log('服务端启动，端口', process.env.PORT)
})
