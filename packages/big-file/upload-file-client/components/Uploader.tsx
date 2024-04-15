'use client'

import { type FilePiece, type HashPiece, splitFile } from '@/utils/file'
import { calcHash } from '@/utils/hash'
import { findFile } from '@/api/uploadFile'

export default function Uploader() {
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file: File = e.target.files![0]

    // 计算哈希
    const fileChunks: FilePiece[] = splitFile(file)
    const hash: string = await calcHash({
      chunks: fileChunks,
      onTick: (percentage: number): void => {
        // TODO  实现进度
        console.log('percentage', percentage)
      }
    })

    // 实现秒传
    const { data } = await findFile({ name: file.name, hash })
    if (data.isExist) {
      console.log('文件上传成功，秒传')
      return
    }

    // 计算每个切片的哈希，保存到本地
    // 如果切片哈希已经保存在本地，直接取出来
    let hashChunks: HashPiece[]
    const fs: FileStorage = new FileStorage({ type: 'indexedDB' })
    if (fs.isExists(hash)) {
      hashChunks = fs.get({ hash })
    } else {
      hashChunks = await calcChunksHash({
        chunks: fileChunks,
        onTick: (percentage: number): void => {
          console.log('percentage', percentage)
        }
      })
      fs.save(hashChunks)
    }

    // 设置请求处理函数
    const requestHandler = async (hashChunk: HashPiece): Promise<boolean> => {
      const isExist = await findFile({ name: file.name, hash })
      if (isExist) {
        console.log('文件切片上传成功，秒传')
        return true
      }
      const { code, data, message } = await uploadChunk({ chunk: hashChunk })
      if (code === 200) {
        console.log('文件切片上传成功')
        return true
      }
      console.errror('文件切片上传失败')
      return false
    }
    // 创建请求池，设置最大同时请求数
    const requestPool: RequestPool = new RequestPool({ maximum: 5, retry: 2 })
    requestPool.setHandler(requestHandler)
    requestPool.setData(hashChunks)
    requestPool.on('tick', (percentage: number): void => {
      console.log('上传进度：', percentage)
    })
    const pieceState: boolean = await requestPool.start()
    if (pieceState) {
      console.log('所有文件分片上传成功')
    } else {
      console.log('文件分片上传失败')
      return
    }

    // 合并文件
    const mergeState: boolean = await mergeFile({ name: file.name, hash })
    if (mergeState) {
      console.log('文件合并成功，所有工作完成')
    } else {
      console.log('文件合并失败')
      return
    }
  }
  return (
    <label htmlFor="uploader">
      <input type="file" name="uploader" onChange={handleFileSelect} />
    </label>
  )
}
