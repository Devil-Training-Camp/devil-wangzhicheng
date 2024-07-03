import { type FilePiece } from '@/utils/file'
import SparkMD5 from 'spark-md5'

onmessage = async (e: MessageEvent): Promise<void> => {
  const spark: SparkMD5.ArrayBuffer = new SparkMD5.ArrayBuffer()
  console.log('e.data', e.data)
  const chunks: FilePiece[] = e.data

  let cur: number = 0
  while (cur < chunks?.length) {
    const chunk: FilePiece = chunks[cur]
    spark.append(await readAsArrayBuffer(chunk.chunk))
    const percentage: number = (cur + 1) / chunks.length
    postMessage({
      percentage,
      hash: spark.end()
    })
    ++cur
  }
  /**
   * 优化：关闭worker
   */
  self.close()
}

export async function readAsArrayBuffer(file: Blob): Promise<ArrayBuffer> {
  const fileReader: FileReader = new FileReader()
  fileReader.readAsArrayBuffer(file)
  return new Promise((resolve: (buffer: ArrayBuffer) => void): void => {
    fileReader.onload = (e: ProgressEvent<FileReader>): void => {
      resolve(e.target?.result as ArrayBuffer)
    }
  })
}
