import { type FilePiece } from '@/utils/file'
import SparkMD5 from 'spark-md5'

onmessage = async (e: MessageEvent): Promise<void> => {
  const spark: SparkMD5.ArrayBuffer = new SparkMD5.ArrayBuffer()
  console.log('e.data', e.data)
  const chunks: FilePiece[] = e.data

  let cur: number = 0
  let resolved: boolean = false
  while (cur < chunks?.length) {
    const chunk: FilePiece = chunks[cur]
    spark.append(await readAsArrayBuffer(chunk.chunk))
    const percentage: number = (cur + 1) / chunks.length
    resolved = percentage === 1
    postMessage({
      percentage,
      resolved,
      hash: resolved ? spark.end() : undefined
    })
    ++cur
  }
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
