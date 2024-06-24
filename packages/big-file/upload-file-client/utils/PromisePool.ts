interface PromisePoolProps {
  limit: number
  onTick?: (percentage: number) => void
}

interface PromisePoolRes {
  state: 'fulfilled' | 'rejected'
  data: any
}

type Task = () => Promise<any>

/**
 * 解释
 * 总体思路：
 * 1. 首先为传进来的所有异步的任务执行一个run函数，这个run函数有如下功能
 * 2. 如果当前正在执行的任务小于等于并发限制，则run函数执行这个任务
 *    如果当前执行的任务超过并发限制，创建一个用于阻塞run函数的Promise，当这个Promise的resolve被消费时，对应的任务才会被执行。把这个resolve放入队列中
 *    初始情况下，有limit个任务并发执行，tasks.length-limit个任务被阻塞
 * 3. 当一个任务执行完成后，会检查resolve队列
 *    如果队列不为空，pop一个resolve出来并消费，此时这个resolve对应的任务会被执行
 *    如果队列为空，这所有的任务已经被执行
 *
 * 这是一个流程图：https://www.yuque.com/g/u1598738/ryg73d/uhy5c8rhlggtpu9g/collaborator/join?token=cm9N9pZZTGqbHlBq&source=doc_collaborator# 《并发池》
 *
 * 暂停与继续执行
 * 4. 暂停：在一个任务执行完成后检查resolve队列时，发现暂停的flag为true，则不消费队列中的resolve
 * 5. 继续执行：从队列中pop出limit-activeTask个resolve，并发的执行
 */
export default class PromisePool {
  private limit: number
  private activeTask: number
  /**
   * 解释：
   * 这个queue存储的是创建的用于阻塞任务的resolve（run函数第一段）
   * 当resolve被消费的时候，任务执行
   */
  private queue: Array<() => void>
  private result: PromisePoolRes[]
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
      this.result.push({
        state: 'fulfilled',
        data: res
      })
    } catch (e) {
      // ？不区分正确错误，统一推进去? 这明显不合理呀
      /**
       * 优化：
       * 设置返回的结构PromisePoolRes
       */
      this.result.push({
        state: 'rejected',
        data: e
      })
    } finally {
      this.onTick && this.onTick(this.result.length / this.taskNumber)
      --this.activeTask
      if (this.queue.length && !this.pauseSignal) {
        // 这个 queue 的设计没太看懂，可否展开聊聊呢？
        /**
         * 解释：
         * 这里从queue中pop一个resolve消费，被这个Promise阻塞的任务会执行
         */
        const resolve = this.queue.shift()!
        resolve()
      }
    }
  }

  async all(tasks: Task[]): Promise<PromisePoolRes[]> {
    if (Array.isArray(tasks) && tasks.length > 0) {
      this.taskNumber = tasks.length
      // 这看起来是 promise.all ，并没有并发限制的能力吧？
      // 这不是全部都在执行了吗
      /**
       * 解释：
       * 对每个任务执行run函数
       * 任务是否执行任务取决于当前活跃的任务activeTask是否超过限制limit
       * activeTask <= limit的时候，执行任务
       * active > limit的时候，阻塞任务，并把阻塞的resolve push进queue中
       * 执行完的任务会pop出一个resolve并消费，这个resolve阻塞的任务会执行
       */
      await Promise.all(tasks.map((task: Task) => this.run(task)))
    }
    return this.result
  }

  pause(): void {
    this.pauseSignal = true
  }

  continue(): void {
    this.pauseSignal = false
    while (this.queue.length && this.activeTask <= this.limit) {
      // 啥意思？直接 resolve？
      /**
       * 优化：
       * 这里有问题，应该pop出activeTask-limit个resolve并发执行
       */
      ++this.activeTask
      const resolve = this.queue.shift()!
      resolve()
    }
  }

  getResult(): any[] {
    return this.result
  }
}
