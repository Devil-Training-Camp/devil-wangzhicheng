import { Context } from 'koa'

export const helloWorld = async (ctx: Context): Promise<void> => {
  ctx.body = 'Hello World'
}
