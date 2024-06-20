import { describe, expect, test } from 'vitest'
import LocalFileStorage from '../LocalFileStorage'
import * as path from 'node:path'

describe('测试LocalFileStorage', () => {
  test('文件夹不存在', async () => {
    // 有单测是好事，但是，这里应该有一些 mock，不能依赖于真实的文件系统
    /**
     * 疑问：
     * 这里应该怎么mock？？？
     */
    const fs = new LocalFileStorage({ path: path.join(__dirname, './test1') })
    const isExist = await fs.isExist('随便什么名称')
    expect(isExist).toBe(false)
  })

  // 这个好像跟上面的一模一样？
  /**
   * 解释：
   * 本地创建了文件夹
   */
  test('文件夹存在，文件不存在', async () => {
    const fs = new LocalFileStorage({ path: path.join(__dirname, './test1') })
    const isExist = await fs.isExist('随便什么名称')
    expect(isExist).toBe(false)
  })

  // 这个好像跟上面的一模一样？
  /**
   * 解释：
   * 本地创建了文件夹和文件
   */
  test('文件夹存在，文件存在', async () => {
    const fs = new LocalFileStorage({ path: path.join(__dirname, './test1') })
    const isExist = await fs.isExist('helloWorld')
    expect(isExist).toBe(true)
  })
})
