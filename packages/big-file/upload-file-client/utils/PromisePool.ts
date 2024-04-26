interface RequestPoolParams {
  maximum: number
}

interface ResultParams {
  status: 'fulfilled' | 'rejected'
  data: any
}

type taskFunction = () => Promise<any>

export default class PromisePool {
  // 最大同时请求数量
  private readonly maximum: number
  // 当前正在执行任务的数量
  private running: number = 0
  private taskList: taskFunction[] = []
  private result: ResultParams[] = []

  constructor({ maximum }: RequestPoolParams) {
    this.maximum = maximum
  }

  // 添加任务
  public addTask(task: taskFunction | taskFunction[]) {
    if (Array.isArray(task)) {
      this.taskList = this.taskList.concat(task)
    } else {
      this.taskList.push(task)
    }
  }

  // 开始执行
  public async start(): Promise<ResultParams[]> {
    return new Promise((resolve: (res: ResultParams[]) => void) => {
      while (this.running < this.maximum && this.taskList.length > 0) {
        const task = this.taskList.shift() as taskFunction
        this.runTask(task, resolve)
        ++this.running
      }
    })
  }

  // 执行单个任务
  private async runTask(
    task: taskFunction,
    resolve: (res: ResultParams[]) => void
  ) {
    try {
      const data = await task()
      this.result.push({
        status: 'fulfilled',
        data
      })
    } catch (reason: unknown) {
      this.result.push({
        status: 'rejected',
        data: reason
      })
    } finally {
      --this.running
      if (this.running === 0 && this.taskList.length === 0) {
        // 如果列表空了，所有任务都已经执行
        resolve(this.result)
      } else {
        // 否则弹出队列中的任务，继续执行
        const task = this.taskList.shift() as taskFunction
        this.runTask(task, resolve)
        ++this.running
      }
    }
  }
}
