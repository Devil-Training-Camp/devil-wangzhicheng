import { describe, expect, test } from 'vitest'
import LocalFileStorage from '../LocalFileStorage'
import * as path from 'node:path'

describe('测试LocalFileStorage', () => {
  test('文件夹不存在', async () => {
    const fs = new LocalFileStorage({ path: path.join(__dirname, './test1') })
    const isExist = await fs.isExist('随便什么名称')
    expect(isExist).toBe(false)
  })

  test('文件夹存在，文件不存在', async () => {
    const fs = new LocalFileStorage({ path: path.join(__dirname, './test1') })
    const isExist = await fs.isExist('随便什么名称')
    expect(isExist).toBe(false)
  })

  test('文件夹存在，文件存在', async () => {
    const fs = new LocalFileStorage({ path: path.join(__dirname, './test1') })
    const isExist = await fs.isExist('helloWorld')
    expect(isExist).toBe(true)
  })
})
