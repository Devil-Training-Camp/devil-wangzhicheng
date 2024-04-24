import { type FilePiece, type HashPiece } from '@/utils/file'

export interface CalcHashParams {
  chunks: FilePiece[]
  onTick?: (percentage: number) => void
}

// 计算整个文件的哈希值
export function calcHash({ chunks, onTick }: CalcHashParams): Promise<string> {
  return new Promise((resolve: (hash: string) => void): void => {
    const worker: Worker = new Worker(new URL('hashWorker.ts', import.meta.url))
    worker.postMessage(chunks)
    worker.onmessage = (e: MessageEvent) => {
      const {
        percentage,
        hash,
        resolved
      }: { percentage: number; hash: string; resolved: boolean } = e.data
      onTick?.(percentage)
      if (resolved) {
        resolve(hash)
      }
    }
  })
}

// 计算每个分片的哈希值
export function calcChunksHash({
  chunks,
  onTick
}: CalcHashParams): Promise<HashPiece[]> {
  return new Promise((resolve: (chunks: HashPiece[]) => void) => {
    const worker: Worker = new Worker(
      new URL('hashChunksWorker.ts', import.meta.url)
    )
    worker.postMessage(chunks)
    worker.onmessage = (e: MessageEvent) => {
      const {
        percentage,
        hashChunks,
        resolved
      }: { percentage: number; hashChunks: HashPiece[]; resolved: boolean } =
        e.data
      onTick?.(percentage)
      if (resolved) {
        resolve(hashChunks)
      }
    }
  })
}
