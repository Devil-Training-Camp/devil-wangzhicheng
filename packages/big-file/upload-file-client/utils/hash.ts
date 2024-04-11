import { FilePiece } from '@/utils/file'

export function calcHash({
  chunks,
  onTick
}: {
  chunks: FilePiece[]
  onTick?: (percentage: number) => void
}): Promise<string> {
  return new Promise((resolve: (hash: string) => void): void => {
    const worker: Worker = new Worker(
      new URL('hash-worker.ts', import.meta.url)
    )
    worker.postMessage(chunks)
    worker.onmessage = (e: MessageEvent) => {
      const { percentage, hash } = e.data
      onTick?.(percentage)
      resolve(hash)
    }
  })
}
