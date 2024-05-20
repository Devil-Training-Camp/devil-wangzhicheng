'use client'

import { type FilePiece, type HashPiece, splitFile } from '@/utils/file'
import { calcHash, calcChunksHash } from '@/utils/hash'
import { checkFileExists, mergeFile, uploadChunk } from '@/api/uploadFile'
import IndexedDBStorage from '@/utils/IndexedDBStorage'
import FileStorage from '@/utils/FileStorage'
import PromisePool from '@/utils/PromisePool'
import { useCallback, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import Progress from '@/components/Progress'

export default function Uploader() {
  const [status, setStatus] = useState<string>('进度')
  const [calcHashRatio, setCalcHashRatio] = useState<number>(0)
  const { toast } = useToast()

  // 设置请求处理函数
  const requestHandler = async (
    hashChunk: HashPiece,
    filename: string,
    fileHash: string
  ): Promise<boolean> => {
    try {
      const { data, code, message } = await checkFileExists({
        name: filename,
        hash: fileHash,
        isChunk: true
      })
      if (code === 200) {
        if (data.isExist) {
          setStatus(`切片 ${fileHash} 上传成功，秒传`)
          return true
        }
      } else {
        toast({
          description: message,
          duration: 3000,
          variant: 'destructive'
        })
      }
    } catch {
      return false
    }

    try {
      const { data, code, message } = await uploadChunk({
        name: filename,
        hash: fileHash,
        isChunk: true,
        chunk: hashChunk.chunk
      })
      if (code === 200) {
        setStatus(`切片 ${fileHash} 上传成功`)
        return true
      } else {
        setStatus(`切片 ${fileHash} 上传失败`)
        return false
      }
    } catch {
      return false
    }
  }

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    setStatus('开始上传...')
    const file: File = e.target.files![0]

    // 计算哈希
    const fileChunks: FilePiece[] = splitFile(file)
    const hash: string = await calcHash({
      chunks: fileChunks,
      onTick: (percentage: number): void => {
        const ratio: number = Number(percentage.toFixed(2))
        setStatus(`计算文件哈希 ${Math.floor(percentage * 100)}%`)
        setCalcHashRatio(ratio)
      }
    })

    // 实现秒传
    try {
      const { data, code, message } = await checkFileExists({
        name: file.name,
        hash,
        isChunk: false
      })
      if (code === 200) {
        if (data.isExist) {
          setStatus('文件上传成功，秒传')
          toast({
            description: '文件上传成功，秒传',
            duration: 3000
          })
          return
        }
      } else {
        setStatus('进度')
        toast({
          description: message,
          duration: 3000,
          variant: 'destructive'
        })
      }
    } catch {}

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
          setStatus(`分片文件 ${Math.floor(percentage * 100)}%`)
        }
      })
      await fs.save(hash, hashChunks)
    }
    setStatus('分片成功')

    const requests = hashChunks.map(
      (chunk) => () => requestHandler(chunk, file.name, hash)
    )
    // 创建请求池，设置最大同时请求数
    const requestPool: PromisePool = new PromisePool({
      limit: 5
    })
    const res = await requestPool.all(requests)

    if (res.some(Boolean)) {
      setStatus('部分切片上传失败')
      // TODO: 重新上传
    }

    // 合并文件
    try {
      const { data, code, message } = await mergeFile({
        name: file.name,
        hash,
        isChunk: false
      })
      if (code === 200) {
        setStatus('文件上传成功')
      } else {
        setStatus('文件上传失败')
      }
    } catch {}
  }

  const memoHandleFileSelect = useCallback(handleFileSelect, [])
  return (
    <div>
      <label htmlFor="uploader">
        <input type="file" name="uploader" onChange={memoHandleFileSelect} />
      </label>
      <p>{status}</p>
      <Progress ratio={calcHashRatio} />
    </div>
  )
}
