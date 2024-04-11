'use client'

import { type FilePiece, splitFile } from '@/utils/file'
import { calcHash } from '@/utils/hash'

export default function Uploader() {
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file: File = e.target.files![0]
    console.log('file', file)

    const fileChunks: FilePiece[] = splitFile(file)
    const hash: string = await calcHash({
      chunks: fileChunks,
      onTick: (percentage) => {
        console.log('percentage', percentage)
      }
    })
    console.log('hash', hash)
  }
  return (
    <label htmlFor="uploader">
      <input type="file" name="uploader" onChange={handleFileSelect} />
    </label>
  )
}
