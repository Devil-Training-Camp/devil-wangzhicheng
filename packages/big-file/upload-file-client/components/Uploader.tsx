'use client'

import { type FilePiece, type HashPiece, splitFile } from '@/utils/file'
import { calcHash, calcChunksHash } from '@/utils/hash'
import { checkFileExists, mergeFile, uploadChunk } from '@/api/uploadFile'
import IndexedDBStorage from '@/utils/IndexedDBStorage'
import FileStorage from '@/utils/FileStorage'
import PromisePool from '@/utils/PromisePool'
import { useCallback, useState } from 'react'

export default function Uploader() {
  const [status, setStatus] = useState<string>('')

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    setStatus('开始上传...')
    const file: File = e.target.files![0]
    console.log('选择的文件', file)

    // 计算哈希
    const fileChunks: FilePiece[] = splitFile(file)
    const hash: string = await calcHash({
      chunks: fileChunks,
      onTick: (percentage: number): void => {
        // TODO  实现进度
        console.log('完整文件进度', percentage)
      }
    })

    // 实现秒传
    const { data } = await checkFileExists({
      name: file.name,
      hash,
      isChunk: false
    })
    if (data.isExist) {
      console.log('文件上传成功，秒传')
      setStatus('文件上传成功，秒传')
      return
    }

    // 计算每个切片的哈希，保存到本地
    // 如果切片哈希已经保存在本地，直接取出来
    let hashChunks: HashPiece[]
    const fs: FileStorage<string, HashPiece[]> = new IndexedDBStorage<
      string,
      HashPiece[]
    >('bigFile', 'hashChunk', 'hash', 'hash')
    if (await fs.isExist(hash)) {
      hashChunks = await fs.get(hash)
    } else {
      hashChunks = await calcChunksHash({
        chunks: fileChunks,
        onTick: (percentage: number): void => {
          console.log('分片文件进度', percentage)
        }
      })
      console.log('计算得到的切片哈希数组', hashChunks)
      await fs.save(hash, hashChunks)
    }

    // 设置请求处理函数
    const requestHandler = async (hashChunk: HashPiece): Promise<boolean> => {
      const { data: checkData } = await checkFileExists({
        name: file.name,
        hash,
        isChunk: true
      })
      console.log('check data', checkData)
      if (checkData.isExist) {
        console.log('文件切片上传成功，秒传')
        setStatus('文件切片上传成功，秒传')
        return true
      }
      const { data: uploadData } = await uploadChunk({
        name: file.name,
        hash,
        isChunk: true,
        chunk: hashChunk.chunk
      })
      if (uploadData.success) {
        console.log('文件切片上传成功')
        setStatus('文件切片上传成功')
        return true
      } else {
        console.error('文件切片上传失败')
        return false
      }
    }

    const requests = hashChunks.map((chunk) => () => requestHandler(chunk))
    // 创建请求池，设置最大同时请求数
    const requestPool: PromisePool = new PromisePool({
      limit: 5
    })
    const res = await requestPool.all(requests)

    if (res.some(Boolean)) {
      setStatus('部分切片上传失败')
      console.log('部分切片上传失败')
      // TODO: 重新上传
    }

    // 合并文件
    const { data: mergeData } = await mergeFile({
      name: file.name,
      hash,
      isChunk: false
    })
    if (mergeData.success) {
      console.log('文件合并成功，所有工作完成')
    } else {
      console.log('文件合并失败')
      return
    }
  }

  const memoHandleFileSelect = useCallback(handleFileSelect, [])
  return (
    <div>
      <label htmlFor="uploader">
        <input type="file" name="uploader" onChange={memoHandleFileSelect} />
      </label>
      <p>{status}</p>
    </div>
  )
}
