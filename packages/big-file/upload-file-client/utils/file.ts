import { CHUNK_SIZE } from '@/const'
import { checkFileExists, uploadChunk } from '@/api/uploadFile'

export interface FilePiece {
  chunk: Blob
  size: number
}

export interface StorageFilePieces {
  fileChunks: FilePiece[]
  hash: string
}

// 分割文件
export function splitFile(
  file: File,
  chunkSize: number = CHUNK_SIZE
): FilePiece[] {
  const fileChunks: FilePiece[] = []
  for (let i: number = 0; i < file.size; i += chunkSize) {
    const chunk: Blob = file.slice(i, i + chunkSize)
    fileChunks.push({
      chunk,
      size: chunk.size
    })
  }
  return fileChunks
}
