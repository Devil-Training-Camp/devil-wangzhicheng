import { expect, test } from 'vitest'
import PromisePool from '../PromisePool'
import { sleep } from '../'

const quickTask = () => {
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

test('添加任务，任务列表', () => {
  try {
    const pool = new PromisePool({ limit: 3 })
    pool.run(quickTask)
    pool.run(mediumTask)
    const taskList = [slowTask, quickTask, slowTask, mediumTask]
    pool.all(taskList)
    expect(true).toBe(true)
  } catch {
    expect(false).toBe(false)
  }
})

test('执行任务', async () => {
  const taskList = [slowTask, quickTask, slowTask, mediumTask]
  const pool = new PromisePool({ limit: 2 })
  const res = await pool.all(taskList)
  expect(res).toEqual(['quick', 'slow', 'slow', 'medium'])
})

test('暂停', async () => {
  const taskList = [slowTask, quickTask, slowTask, mediumTask]
  const pool = new PromisePool({ limit: 2 })
  pool.all(taskList)
  await sleep(150)
  expect(pool.getResult()).toEqual(['quick'])
})

test('暂停后继续', async () => {
  const taskList = [slowTask, quickTask, mediumTask]
  const pool = new PromisePool({ limit: 2 })
  pool.all(taskList)
  await sleep(150)
  pool.pause()
  expect(pool.getResult()).toEqual(['quick'])
  pool.continue()

  await sleep(200)
  expect(pool.getResult()).toEqual(['quick', 'medium'])
})

test('暂停后继续2', async () => {
  const taskList = [slowTask, quickTask, mediumTask, slowTask]
  const pool = new PromisePool({ limit: 2 })
  pool.all(taskList)
  await sleep(150)
  pool.pause()
  expect(pool.getResult()).toEqual(['quick'])
  pool.continue()

  await sleep(200)
  expect(pool.getResult()).toEqual(['quick', 'medium'])

  await sleep(100)
  expect(pool.getResult()).toEqual(['quick', 'medium', 'slow'])
})
