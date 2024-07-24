import * as c from 'node:child_process'
import * as path from 'node:path'
import Koa, { Context, Middleware, Next } from 'koa'
import serve from 'koa-static'
import { Dependencies } from '@dep-graph/core'

export default class DepGraphServer {
  private readonly deps: Dependencies
  private port: number | undefined

  constructor(deps: Dependencies) {
    this.deps = deps
    this.port = 9995
  }

  public start() {
    const koa: Koa = new Koa()
    // koa充当服务器
    koa.use(this.getDependencies.bind(this)())
    // koa充当静态服务器
    koa.use(serve(path.resolve(__dirname, '../../../web/dist/')))

    koa.listen(this.port, () => {
      console.log(`Server is running at http://localhost:${this.port}/`)
    })
  }

  // 获取依赖的接口
  private getDependencies(): Middleware {
    return async (ctx: Context, next: Next) => {
      if (ctx.request.url === '/api/getDependencies') {
        ctx.response.status = 200
        ctx.response.body = this.deps
      } else {
        await next()
      }
    }
  }

  // 打开浏览器
  public open(): void {
    const openCommand: string =
      process.platform === 'win32'
        ? 'start'
        : process.platform === 'darwin'
          ? 'open'
          : 'xdg-open'

    console.log('openCommand', openCommand)
    c.exec(`${openCommand} http://localhost:${this.port}/index.html`)
  }
}
