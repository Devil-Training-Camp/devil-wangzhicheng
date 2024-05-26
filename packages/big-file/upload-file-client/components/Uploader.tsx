'use client'

import {
  type FilePiece,
  type HashPiece,
  splitFile,
  uploadChunks
} from '@/utils/file'
import { calcHash, calcChunksHash } from '@/utils/hash'
import { checkFileExists, mergeFile } from '@/api/uploadFile'
import IndexedDBStorage from '@/utils/IndexedDBStorage'
import FileStorage from '@/utils/FileStorage'
import { useState } from 'react'
import Progress from '@/components/Progress'

// TODO 多文件
// TODO 测试重传

export default function Uploader() {
  const [status, setStatus] = useState<string>()
  const [calcHashRatio, setCalcHashRatio] = useState<number>(0)
  const [uploadFile, setUploadFile] = useState<File>()
  /**
   * -1 上传失败
   * 0 未开始上传
   * 1 上传成功
   * 2 上传中
   * 3 暂停中
   */
  const [uploadStatus, setUploadStatus] = useState<number>(0)
  const [pauseSignal, setPauseSignal] = useState<boolean>(false)

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
    // TODO onTick
    setStatus('上传中...')
    const uploadChunksRes: boolean = await uploadChunks(hashChunks, file.name)
    if (!uploadChunksRes) {
      setStatus(`上传失败`)
      return false
    }

    /**
     * step 5：合并文件
     */
    try {
      const { code, message } = await mergeFile({
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
    setUploadStatus(2)
    const uploadSuccess: boolean = await upload(file)
    setUploadStatus(uploadSuccess ? 1 : -1)
  }

  const pause = () => {}

  const goOn = () => {}

  const uploadActionMap: any = {
    '-1': {
      label: '重新上传',
      action: () => upload(uploadFile!)
    },
    '2': {
      label: '暂停',
      action: () => pause()
    },
    '3': {
      label: '继续',
      action: () => goOn()
    }
  }

  return (
    <div>
      <label htmlFor="uploader">
        <input
          type="file"
          name="uploader"
          onChange={handleFileSelect}
          multiple
        />
      </label>
      {uploadFile && (
        <>
          <p>{uploadFile.name}</p>
          <p>{status}</p>
          <Progress ratio={calcHashRatio} />
        </>
      )}
      {uploadActionMap[uploadStatus] && (
        <button
          className="border-white border-2 px-2 py -1"
          onClick={uploadActionMap[uploadStatus].action}
        >
          {uploadActionMap[uploadStatus].label}
        </button>
      )}
    </div>
  )
}
