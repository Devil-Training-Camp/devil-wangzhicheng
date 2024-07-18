import * as path from 'node:path'
import * as fsPromises from 'node:fs/promises'

export interface Node {
  package: string
  version: string
}

export interface Link {
  source: Node
  target: Node
}

export interface Dependencies {
  nodes: Node[]
  links: Link[]
}

const DEFAULT_DEPTH: number = Infinity

export default abstract class PackageParser {
  protected filepath: string
  protected lockfile: string
  protected nodes: Node[]
  protected links: Link[]

  constructor(filepath: string) {
    this.filepath = filepath
    this.nodes = []
    this.links = []
  }

  public async parse(depth: number = DEFAULT_DEPTH): Promise<Dependencies> {
    if (!(depth >= 0 && (Number.isSafeInteger(depth) || depth === Infinity))) {
      throw new Error('Depth should be a non-negative integer.')
    }
    if (!(await this.isFileExist('package.json'))) {
      throw new Error(
        `${path.resolve(this.filepath, 'package.json')} is not exist.`
      )
    }
    if (!(await this.isFileExist(this.lockfile))) {
      throw new Error('package lock file is not exist.')
    }
    await this.parseLockfile(depth)
    return {
      nodes: this.nodes,
      links: this.links
    }
  }

  private async isFileExist(filename: string): Promise<boolean> {
    try {
      await fsPromises.access(path.resolve(this.filepath, filename))
      return true
    } catch {
      return false
    }
  }

  protected abstract parseLockfile(depth: number): Promise<Dependencies>
}
