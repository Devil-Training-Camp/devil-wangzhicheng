import { CHUNK_SIZE } from '@/const'

export interface FilePiece {
  chunk: Blob
  size: number
}

// 分割文件
export function splitFile(
  file: File,
  chunkSize: number = CHUNK_SIZE
): FilePiece[] {
  const fileChunks: FilePiece[] = []
  for (let i: number = 0; i < file.size; i++) {
    const chunk = file.slice(i, i + chunkSize)
    fileChunks.push({
      chunk,
      size: chunk.size
    })
  }
  return fileChunks
}
