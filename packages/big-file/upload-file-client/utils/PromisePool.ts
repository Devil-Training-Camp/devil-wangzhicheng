interface PromisePoolProps {
  limit: number
  onTick?: (percentage: number) => void
}

type Task = () => Promise<any>

export default class Props {
  private limit: number
  private activeTask: number
  private queue: Array<() => void>
  private result: any[]
  private pauseSignal: boolean
  private onTick?: (percentage: number) => void
  private taskNumber: number = 0

  constructor({ limit, onTick }: PromisePoolProps) {
    this.limit = limit
    this.queue = []
    this.activeTask = 0
    this.result = []
    this.pauseSignal = false
    this.onTick = onTick
  }

  async run(task: Task): Promise<void> {
    if (this.activeTask >= this.limit) {
      // 等待队列中的resolve被执行了才会执行task
      await new Promise<void>((resolve: () => void) => this.queue.push(resolve))
    }
    ++this.activeTask

    let res: any
    try {
      res = await task()
      this.result.push(res)
    } catch (e) {
      // ？不区分正确错误，统一推进去? 这明显不合理呀
      this.result.push(e)
    } finally {
      this.onTick && this.onTick(this.result.length / this.taskNumber)
      --this.activeTask
      if (this.queue.length && !this.pauseSignal) {
        const resolve = this.queue.shift()!
        resolve()
      }
    }
  }

  async all(tasks: Task[]): Promise<any[]> {
    if (Array.isArray(tasks) && tasks.length > 0) {
      this.taskNumber = tasks.length
      await Promise.all(tasks.map((task: Task) => this.run(task)))
    }
    return this.result
  }

  pause(): void {
    this.pauseSignal = true
  }

  continue(): void {
    this.pauseSignal = false
    if (this.queue.length && !this.pauseSignal) {
      const resolve = this.queue.shift()!
      resolve()
    }
  }

  getResult(): any[] {
    return this.result
  }
}
