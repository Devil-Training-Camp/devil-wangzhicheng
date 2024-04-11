'use client'

import { type FilePiece, splitFile } from '@/utils/file'
import { calcHash } from '@/utils/hash'

export default function Uploader() {
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file: File = e.target.files![0]

    // 计算哈希
    const fileChunks: FilePiece[] = splitFile(file)
    const hash: string = await calcHash({
      chunks: fileChunks,
      onTick: (percentage) => {
        // TODO  实现进度
        console.log('percentage', percentage)
      }
    })

    // 实现秒传
    const isExist = await queryFileByHash({ name: file.name, hash })
    if (isExist) {
      console.log('文件上传成功，秒传')
      return
    }

    //
  }
  return (
    <label htmlFor="uploader">
      <input type="file" name="uploader" onChange={handleFileSelect} />
    </label>
  )
}
