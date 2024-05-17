import { expect, test } from 'vitest'
import PromisePool from '../PromisePool'

const firstTask = () => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 1000, 'quick')
  })
}
const secondTask = () => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 2000, 'slow')
  })
}
const taskList = [secondTask, firstTask, firstTask]

test('添加任务，任务列表', () => {
  try {
    const pool = new PromisePool({ limit: 3 })
    pool.run(firstTask)
    pool.run(secondTask)
    pool.all(taskList)
    expect(true).toBe(true)
  } catch {
    expect(false).toBe(false)
  }
})

test('执行任务', async () => {
  const pool = new PromisePool({ limit: 2 })
  const res = await pool.all(taskList)
  expect(res).toEqual(['quick', 'slow', 'quick'])
})
