import { CHUNK_SIZE, RETRY } from '@/const'
import { checkFileExists, uploadChunk } from '@/api/uploadFile'
import { sleep } from '@/utils/index'
import PromisePool from '@/utils/PromisePool'

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
 *  并发上传切片
 * @param hashChunks
 * @param filename
 * @param retry
 */
export async function uploadChunks(
  hashChunks: HashPiece[],
  filename: string,
  retry: number = 0
): Promise<boolean> {
  const requests = hashChunks.map(
    (chunk: HashPiece) => () => pieceRequestHandler(chunk, filename)
  )
  // 创建请求池，设置最大同时请求数
  const requestPool: PromisePool = new PromisePool({
    limit: 5
  })
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
    const {
      data: checkData,
      code: checkCode,
      message: checkMessage
    } = await checkFileExists({
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
    const { code: uploadCode, message: uploadMessage } =
      await uploadChunk(formData)
    return uploadCode === 200
  } catch {
    return false
  }
}
