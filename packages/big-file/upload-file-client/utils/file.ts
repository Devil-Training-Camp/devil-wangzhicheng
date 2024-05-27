import { CHUNK_SIZE } from '@/const'
import { checkFileExists, uploadChunk } from '@/api/uploadFile'

export interface FilePiece {
  chunk: Blob
  size: number
}

export interface HashPiece extends FilePiece {
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

/**
 * 上传切片请求函数，先检查后上传
 * @param hashChunk
 * @param filename
 */
export async function pieceRequestHandler(
  hashChunk: HashPiece,
  filename: string
): Promise<boolean> {
  // 检查切片是否存在
  try {
    const { data: checkData, code: checkCode } = await checkFileExists({
      name: filename,
      hash: hashChunk.hash,
      isChunk: true
    })
    if (checkCode !== 200) {
      return false
    }
    if (checkData.isExist) {
      return true
    }

    // 上传切片
    const formData = new FormData()
    formData.append('name', filename)
    formData.append('hash', hashChunk.hash)
    formData.append('chunk', hashChunk.chunk)
    const { code: uploadCode } = await uploadChunk(formData)
    return uploadCode === 200
  } catch {
    return false
  }
}
