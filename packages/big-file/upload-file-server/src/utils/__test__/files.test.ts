import { describe, expect, test } from 'vitest'
import type { FileHashRequestParams } from '../../../types'
import { getFilename } from '../files'

describe('测试getFilename', () => {
  test('没有后缀的chunk', () => {
    const params: FileHashRequestParams = {
      name: '你好',
      hash: 'jkhdlkjuh345uj3hjk4hgouyi',
      isChunk: true
    }
    expect(getFilename(params)).toEqual(`你好_${params.hash}`)
  })

  test('有后缀的chunk', () => {
    const params: FileHashRequestParams = {
      name: '你好.txt',
      hash: 'jkhdlkjuh345uj3hjk4hgouyi',
      isChunk: true
    }
    expect(getFilename(params)).toEqual(`你好_${params.hash}`)
  })

  test('有多个后缀的chunk', () => {
    const params: FileHashRequestParams = {
      name: '你好.txt.a.b.d.exe',
      hash: 'jkhdlkjuh345uj3hjk4hgouyi',
      isChunk: true
    }
    expect(getFilename(params)).toEqual(`你好.txt.a.b.d_${params.hash}`)
  })

  test('没有后缀的完整文件', () => {
    const params: FileHashRequestParams = {
      name: '你好',
      hash: 'jkhdlkjuh345uj3hjk4hgouyi',
      isChunk: false
    }
    expect(getFilename(params)).toEqual(`你好_${params.hash}`)
  })

  test('有后缀的完整文件', () => {
    const params: FileHashRequestParams = {
      name: '你好.jpeg',
      hash: 'jkhdlkjuh345uj3hjk4hgouyi',
      isChunk: false
    }
    expect(getFilename(params)).toEqual(`你好_${params.hash}.jpeg`)
  })

  test('有多个后缀的完整文件', () => {
    const params: FileHashRequestParams = {
      name: '你好.txt.a.b.d.exe',
      hash: 'jkhdlkjuh345uj3hjk4hgouyi',
      isChunk: false
    }
    expect(getFilename(params)).toEqual(`你好.txt.a.b.d_${params.hash}.exe`)
  })
})
