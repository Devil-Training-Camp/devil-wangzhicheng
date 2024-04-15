import Koa from 'koa'

const app: Koa = new Koa()

app.use(async (ctx) => {
  ctx.body = 'hello world'
})

app.listen(4000)
