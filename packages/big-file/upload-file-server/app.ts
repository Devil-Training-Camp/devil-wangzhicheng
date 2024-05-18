import Koa from 'koa'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import helloWorldRoutes from './routes/helloWorldRoutes'

const app: Koa = new Koa()
app.use(logger())
app.use(bodyParser())
app.use(helloWorldRoutes.routes()).use(helloWorldRoutes.allowedMethods)

app.listen(process.env.PORT, () => {
  console.log('服务端启动，端口', process.env.PORT)
})
