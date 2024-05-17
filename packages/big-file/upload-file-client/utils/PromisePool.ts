interface PromisePoolProps {
  limit: number
}

type Task = () => Promise<any>

export default class Props {
  private limit: number
  private activeTask: number
  private queue: Array<() => void>
  private result: any[]

  constructor({ limit }: PromisePoolProps) {
    this.limit = limit
    this.queue = []
    this.activeTask = 0
    this.result = []
  }

  async run(task: Task): Promise<any> {
    if (this.activeTask >= this.limit) {
      // 等待队列中的resolve被执行了才会执行task
      await new Promise<void>((resolve: () => void) => this.queue.push(resolve))
    }
    ++this.activeTask

    let res: any
    try {
      // TODO: 执行成功fulfilled，执行错误reject
      res = await task()
      this.result.push(res)
      return res
    } finally {
      --this.activeTask
      if (this.queue.length) {
        const resolve = this.queue.shift()!
        resolve()
      }
    }
  }

  async all(tasks: Task[]): Promise<any[]> {
    await Promise.all(tasks.map((task: Task) => this.run(task)))
    return this.result
  }
}
