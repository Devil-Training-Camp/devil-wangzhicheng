import { expect, test, describe } from 'vitest'
import PromisePool from '../PromisePool'
import { sleep } from '../'

const quickTask = () => {
  // 单测的时候不要依赖真实环境，同样应该 mock 掉
  return new Promise((resolve) => {
    setTimeout(resolve, 100, 'quick')
  })
}
const mediumTask = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 200, 'medium')
  })
}
const slowTask = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 400, 'slow')
  })
}

// 单测很不错
describe('PromisePool', () => {
  test('执行任务', async () => {
    const taskList = [slowTask, quickTask, slowTask, mediumTask]
    const pool = new PromisePool({ limit: 2 })
    const res = await pool.all(taskList)
    expect(res).toEqual([
      { state: 'fulfilled', data: 'quick' },
      { state: 'fulfilled', data: 'slow' },
      { state: 'fulfilled', data: 'slow' },
      { state: 'fulfilled', data: 'medium' }
    ])
  })

  test('暂停', async () => {
    const taskList = [slowTask, quickTask, slowTask, mediumTask]
    const pool = new PromisePool({ limit: 2 })
    pool.all(taskList)
    await sleep(150)
    expect(pool.getResult()).toEqual([{ state: 'fulfilled', data: 'quick' }])
  })

  test('暂停后继续', async () => {
    const taskList = [slowTask, quickTask, mediumTask]
    const pool = new PromisePool({ limit: 2 })
    pool.all(taskList)
    await sleep(150)
    pool.pause()
    expect(pool.getResult()).toEqual([{ state: 'fulfilled', data: 'quick' }])
    pool.continue()

    await sleep(200)
    expect(pool.getResult()).toEqual([
      { state: 'fulfilled', data: 'quick' },
      { state: 'fulfilled', data: 'medium' }
    ])
  })

  test('暂停后继续2', async () => {
    const taskList = [slowTask, quickTask, mediumTask, slowTask]
    const pool = new PromisePool({ limit: 2 })
    pool.all(taskList)
    await sleep(150)
    pool.pause()
    expect(pool.getResult()).toEqual([{ state: 'fulfilled', data: 'quick' }])
    pool.continue()

    await sleep(200)
    expect(pool.getResult()).toEqual([
      { state: 'fulfilled', data: 'quick' },
      { state: 'fulfilled', data: 'medium' }
    ])

    await sleep(100)
    expect(pool.getResult()).toEqual([
      { state: 'fulfilled', data: 'quick' },
      { state: 'fulfilled', data: 'medium' },
      { state: 'fulfilled', data: 'slow' }
    ])
  })
})
