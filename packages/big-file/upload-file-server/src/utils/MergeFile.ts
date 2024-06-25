import { pipeline } from 'node:stream/promises'
import * as fs from 'node:fs'

export interface MergeSource {
  source: string
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
    writeStream.setMaxListeners(this.sources.length)

    try {
      for (const source of this.sources) {
        await pipeline(
          fs.createReadStream(source.source, { start: 0 }),
          writeStream,
          { end: false }
        )
      }
    } catch (e) {
      throw e
    } finally {
      writeStream.end()
    }
  }
}
