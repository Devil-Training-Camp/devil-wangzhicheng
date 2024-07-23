import { Dependencies } from '@dep-graph/core/dist/PackageParser'
import * as cp from 'node:child_process'
import http from 'node:http'
import * as path from 'node:path'
import FileSystem from './FileSystem'
import * as fsPromise from 'node:fs/promises'
import fs from 'node:fs'

export default class DepGraphServer {
  private readonly deps: Dependencies
  private port: number | undefined
  constructor(deps: Dependencies) {
    this.deps = deps
  }
  public async start() {
    const server = http.createServer(this.staticServer.bind(this))

    this.port = await this.tryUsePort(9995)
    server.listen(this.port, () => {
      console.log(`Server is running at http://localhost:${this.port}/`)
    })
  }

  // 打开浏览器
  public open(): void {
    const openCommand: string =
      process.platform === 'win32'
        ? 'start'
        : process.platform === 'darwin'
          ? 'open'
          : 'xdg-open'

    cp.exec(`${openCommand} localhost:${this.port}`)
  }

  // 递归尝试使用端口
  private async tryUsePort(port: number): Promise<number> {
    return port
  }

  // 静态文件服务器，注入deps数据
  private async staticServer(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    try {
      fs.createReadStream(
        path.resolve(__dirname, '../../../web/dist/', '.' + req.url)
      ).pipe(res)
    } catch {
      res.writeHead(404)
      res.end('Not Found')
    }
    // const htmlPath: string = path.resolve(__dirname, '../../../web/dist/web/index.html')
    //
    // if(!await FileSystem.isFileExist(htmlPath)) {
    //   throw new Error(`${htmlPath} file is not exist`)
    // }
    //
    // const htmlData: string = await fsPromise.readFile(htmlPath, 'utf8')
    // const injectedHtmlData: string = this.injectDepsData(htmlData)
    // res.writeHead(200, {'Content-Type': 'text/html'})
    // res.end(injectedHtmlData)
  }

  // 注入deps
  private injectDepsData(htmlData: string): string {
    return htmlData.replace(
      '<div id="app"></div>',
      `
        <script>
            window.__DEPS__ = ${JSON.stringify(this.deps)}
        </script>   
        <div id="app"></div>
      `
    )
  }
}
