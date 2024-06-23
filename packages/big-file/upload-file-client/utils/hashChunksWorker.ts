import { FilePiece, type HashPiece } from '@/utils/file'
import SparkMD5 from 'spark-md5'
import { readAsArrayBuffer } from '@/utils/hashWorker'

// 这个跟旁边的 hashWorker.ts 文件看起来也很像，为什么要重复？
onmessage = async (e: MessageEvent): Promise<void> => {
  const spark: SparkMD5.ArrayBuffer = new SparkMD5.ArrayBuffer()
  const chunks: FilePiece[] = e.data

  let cur: number = 0
  let resolved: boolean = false
  const hashChunks: HashPiece[] = []
  while (cur < chunks.length) {
    const chunk: FilePiece = chunks[cur]

    spark.append(await readAsArrayBuffer(chunk.chunk))
    const hash = spark.end()
    spark.reset()

    hashChunks.push({ hash, ...chunk })
    const percentage: number = (cur + 1) / chunks.length
    resolved = percentage === 1

    postMessage({
      percentage,
      hashChunks,
      resolved
    })
    ++cur
  }
}
