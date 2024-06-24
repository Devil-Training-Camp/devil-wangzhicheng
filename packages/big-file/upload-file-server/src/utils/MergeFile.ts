import { pipeline } from 'node:stream/promises'
import * as fs from 'node:fs'
import { PassThrough } from 'stream'

export interface MergeSource {
  source: string
  index: number
  size: number
}

interface MergeFileParams {
  target: string
  sources: MergeSource[]
}

export default class MergeFile {
  private readonly target: string
  private readonly sources: MergeSource[]

  constructor({ target, sources }: MergeFileParams) {
    this.target = target
    this.sources = sources
  }

  public async merge(): Promise<void> {
    const writeStream: fs.WriteStream = fs.createWriteStream(this.target)
    const passThroughStreams: PassThrough[] = this.sources.map(
      () => new PassThrough()
    )

    try {
      const pipelinePromises: Promise<void>[] = this.sources.map(
        (source: MergeSource, index: number) =>
          pipeline(
            fs.createReadStream(source.source),
            passThroughStreams[index]
          )
      )

      passThroughStreams.forEach((passThrough: PassThrough) =>
        passThrough.pipe(writeStream, { end: false })
      )

      await Promise.all(pipelinePromises)

      writeStream.end()
    } catch (e) {
      throw e
    }
  }
}
