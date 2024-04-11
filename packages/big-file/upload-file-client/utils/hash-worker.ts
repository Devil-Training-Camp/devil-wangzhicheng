import { type FilePiece } from '@/utils/file'
import SparkMD5 from 'spark-md5'

onmessage = (e: MessageEvent): void => {
  const spark: SparkMD5.ArrayBuffer = new SparkMD5.ArrayBuffer()
  console.log('e.data', e.data)
  const chunks: FilePiece[] = e.data
  chunks.forEach(async (chunk: FilePiece, i: number): Promise<void> => {
    spark.append(await readAsArrayBuffer(chunk.chunk))
    const percentage: number = (i + 1) / chunks.length
    postMessage({ percentage })
  })
  postMessage({
    percentage: 1,
    hash: spark.end()
  })
}

async function readAsArrayBuffer(file: Blob): Promise<ArrayBuffer> {
  const fileReader: FileReader = new FileReader()
  fileReader.readAsArrayBuffer(file)
  return new Promise((resolve: (buffer: ArrayBuffer) => void): void => {
    fileReader.onload = (e: ProgressEvent<FileReader>): void => {
      resolve(e.target?.result as ArrayBuffer)
    }
  })
}
