'use client'

import {
  type FilePiece,
  type HashPiece,
  pieceRequestHandler,
  splitFile
} from '@/utils/file'
import { calcHash, calcChunksHash } from '@/utils/hash'
import { checkFileExists, mergeFile } from '@/api/uploadFile'
import IndexedDBStorage from '@/utils/IndexedDBStorage'
import FileStorage from '@/utils/FileStorage'
import { useState } from 'react'
import Progress from '@/components/Progress'
import PromisePool from '@/utils/PromisePool'
import { RETRY } from '@/const'
import { sleep } from '@/utils'

// TODO 多文件
// TODO 测试重传

export default function Uploader() {
  const [status, setStatus] = useState<string>()
  const [calcHashRatio, setCalcHashRatio] = useState<number>(0)
  const [uploadFile, setUploadFile] = useState<File>()
  const [requestPool, setRequestPool] = useState<PromisePool>()
  /**
   * -1 上传失败
   * 0 未有文件
   * 1 未开始上传
   * 2 上传中，本地处理
   * 3 暂停中
   * 4 上传成功
   * 5 上传中，可暂停
   * 6 上传中，合并文件
   */
  const [uploadStatus, setUploadStatus] = useState<number>(0)

  const upload = async (file: File): Promise<boolean> => {
    /**
     * step 1: 计算文件哈希
     */
    setStatus('开始上传...')
    const fileChunks: FilePiece[] = splitFile(file)
    const hash: string = await calcHash({
      chunks: fileChunks,
      onTick: (percentage: number): void => {
        setCalcHashRatio(Number(percentage.toFixed(2)))
        setStatus(`计算文件哈希中：${Math.floor(percentage * 100)}%`)
      }
    })

    /**
     * step 2 检查服务器是否存在文件，文件存在直接上传成功
     */
    try {
      const { data, code } = await checkFileExists({
        name: file.name,
        hash,
        isChunk: false
      })
      if (code !== 200) {
        setStatus('上传失败')
        return false
      }
      if (data.isExist) {
        setStatus('上传成功（秒传）')
        return true
      }
    } catch {
      return false
    }

    /**
     * step 3: 计算每个切片的哈希，保存到本地。如果切片哈希已经保存在本地，直接取出来
     */
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
          setCalcHashRatio(Number(percentage.toFixed(2)))
          setStatus(`文件切片中：${Math.floor(percentage * 100)}%`)
        }
      })
      await fs.save(hash, hashChunks)
    }

    /**
     * step 4: 创建并发池，上传切片
     */
    setStatus('上传中...')
    setUploadStatus(5)
    const uploadChunks = async (
      hashChunks: HashPiece[],
      filename: string,
      retry: number = 0
    ): Promise<boolean> => {
      const requests = hashChunks.map(
        (chunk: HashPiece) => () => pieceRequestHandler(chunk, filename)
      )
      // 创建请求池，设置最大同时请求数
      const requestPool = new PromisePool({
        limit: 5,
        onTick: (percentage: number): void => {
          setCalcHashRatio(Number(percentage.toFixed(2)))
          setStatus(`文件上传中：${Math.floor(percentage * 100)}%`)
        }
      })
      setRequestPool(requestPool)
      const piecesUpload: boolean[] = await requestPool.all(requests)
      console.log('上传结果', piecesUpload)

      if (!piecesUpload.every(Boolean)) {
        if (retry >= RETRY) {
          return false
        }
        console.log('重传次数：', retry)
        const retryHashChunks = hashChunks.filter(
          (undefined, index: number) => !piecesUpload[index]
        )
        await sleep(3000)
        return uploadChunks(retryHashChunks, filename, ++retry)
      }
      return true
    }
    const uploadChunksRes: boolean = await uploadChunks(hashChunks, file.name)
    if (!uploadChunksRes) {
      setStatus(`上传失败`)
      return false
    }

    /**
     * step 5：合并文件
     */
    setUploadStatus(6)
    try {
      const { code } = await mergeFile({
        name: file.name,
        hash,
        chunks: hashChunks.map((chunk, index) => ({
          hash: chunk.hash,
          index,
          size: chunk.size
        }))
      })
      if (code !== 200) {
        setStatus('上传失败')
        return false
      }
      setStatus('上传成功')
      return true
    } catch {
      setStatus('上传失败')
      return false
    }
  }

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file: File = e.target.files![0]
    setUploadFile(file)
    setUploadStatus(1)
    setStatus('开始上传吧！')
  }

  const handleStartUpload = async (): Promise<void> => {
    setUploadStatus(2)
    const uploadSuccess: boolean = await upload(uploadFile!)
    setUploadStatus(uploadSuccess ? 1 : 4)
    if (uploadSuccess) {
      setUploadFile(undefined)
      setRequestPool(undefined)
      setCalcHashRatio(0)
      setUploadStatus(6)
    }
  }

  const pause = () => {
    console.log('requestPool', requestPool)
    requestPool!.pause()
    setUploadStatus(3)
  }

  const goOn = () => {
    requestPool!.continue()
    setUploadStatus(5)
  }

  const uploadActionMap: any = {
    '-1': {
      label: '重新上传',
      action: () => handleStartUpload()
    },
    '1': {
      label: '上传',
      action: () => handleStartUpload()
    },
    '2': {
      label: '处理中...',
      action: () => {}
    },
    '5': {
      label: '暂停',
      action: () => pause()
    },
    '3': {
      label: '继续',
      action: () => goOn()
    }
  }

  return (
    <div className="flex flex-col space-y-8">
      <label htmlFor="uploader">
        <input
          type="file"
          name="uploader"
          onChange={handleFileSelect}
          multiple
        />
      </label>
      <p>{status}</p>
      {uploadActionMap[uploadStatus] && (
        <button
          className="border-white border-2 rounded-full px-2 py-1 w-28"
          onClick={uploadActionMap[uploadStatus].action}
        >
          {uploadActionMap[uploadStatus].label}
        </button>
      )}
      {uploadFile && (
        <>
          <Progress ratio={calcHashRatio} />
          <p>{uploadFile.name}</p>
        </>
      )}
    </div>
  )
}
