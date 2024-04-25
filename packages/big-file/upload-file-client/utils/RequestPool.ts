interface RequestPoolParams {
  maximum: number
  retry: number
}

export default class RequestPool {
  // 最大同时请求数量
  private maximum: number
  // 传输失败重试次数
  private retry: number

  constructor({ maximum, retry }: RequestPoolParams) {
    this.maximum = maximum
    this.retry = retry
  }
}
