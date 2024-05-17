import Koa from 'koa'
import {
  FileHashResponseParams,
  ResponseParams,
  UploadChunkResponseParams
} from '@/types'

const app: Koa = new Koa()

// TODO: 临时测试
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
  // 判断文件是否存在
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
  // 上传切片
  if (
    ctx.request.method === 'POST' &&
    ctx.request.path === '/files/uploadChunk'
  ) {
    const res: ResponseParams<UploadChunkResponseParams> = {
      code: 200,
      data: {
        success: true
      },
      message: '成功'
    }
    ctx.status = 200
    ctx.body = res
  }
  // 合并文件
  if (ctx.request.method === 'GET' && ctx.request.path === '/files/mergeFile') {
    const res: ResponseParams<UploadChunkResponseParams> = {
      code: 200,
      data: {
        success: true
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
