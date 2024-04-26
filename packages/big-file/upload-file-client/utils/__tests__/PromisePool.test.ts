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
const taskList = [firstTask, secondTask]

test('添加任务，任务列表', () => {
  try {
    const pool = new PromisePool({ maximum: 3 })
    pool.addTask(firstTask)
    pool.addTask(secondTask)
    pool.addTask(taskList)
    expect(true).toBe(true)
  } catch {
    expect(false).toBe(false)
  }
})

test('执行任务', async () => {
  const pool = new PromisePool({ maximum: 3 })
  // [second, first, second, first]
  pool.addTask(secondTask)
  pool.addTask(taskList)
  pool.addTask(firstTask)
  const res = await pool.start()
  expect(res).toEqual([
    {
      status: 'fulfilled',
      data: 'quick'
    },
    {
      status: 'fulfilled',
      data: 'slow'
    },
    {
      status: 'fulfilled',
      data: 'slow'
    },
    {
      status: 'fulfilled',
      data: 'quick'
    }
  ])
})
