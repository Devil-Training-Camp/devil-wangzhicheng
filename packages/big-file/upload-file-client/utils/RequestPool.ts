interface RequestPoolParams {
  maximum: number
  retry: number
}

export default class RequestPool<D> {
  // 最大同时请求数量
  private maximum: number
  // 传输失败重试次数
  private retry: number
  // 请求池
  private requestList: any[] = []
  // 请求处理函数
  private handler: ((d: D) => Promise<boolean> | undefined) | undefined
  // 请求的所有参数
  private data: D[] | undefined
  // 结果
  private result: any[]

  constructor({ maximum, retry }: RequestPoolParams) {
    this.maximum = maximum
    this.retry = retry
  }

  public setHandler(handler: (d: D) => Promise<boolean>) {
    this.handler = handler
  }

  public setData(data: D[]) {
    this.data = data
  }

  public async start(): Promise<boolean> {
    if (!this.handler || !this.data) {
      console.error('没有设置请求处理函数或请求参数')
      return false
    }
  }
}
