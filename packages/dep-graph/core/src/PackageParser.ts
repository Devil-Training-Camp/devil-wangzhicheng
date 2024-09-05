import * as path from 'node:path'
import * as fsPromises from 'node:fs/promises'

export interface Node {
  package: string
  version: string
  depth: number
}

export interface Link {
  source: Node
  target: Node
}

export interface Dependencies {
  nodes: Node[]
  links: Link[]
}

export interface Package {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  bundledDependencies?: Record<string, string>
}

const DEFAULT_DEPTH: number = Infinity

export default abstract class PackageParser {
  protected filepath: string // 项目根目录
  protected lockfile: string | undefined // lock文件
  protected nodes: Node[] // 解析出的节点
  protected links: Link[] // 解析出的链
  protected depth: number // 当前解析的深度
  private nodesMap: { [key: string]: boolean } = {} // 保存node是否被解析过

  protected constructor(filepath: string) {
    this.filepath = filepath
    this.nodes = []
    this.links = []
    this.lockfile = undefined
    this.depth = 0
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
    if (!(await this.isFileExist(this.lockfile!))) {
      throw new Error('package lock file is not exist.')
    }
    await this.parseLockfile(depth)
    return {
      nodes: this.nodes,
      links: this.links
    }
  }

  protected DFS(node: Node, depth: number): void {
    this.addToNodes(node)
    if (depth <= 0) {
      return
    }
    const depNodes = this.getNodesFromPackages(node)
    for (const depNode of depNodes) {
      this.addToLinks(node, depNode)
      if (!this.isNodeInCollection(depNode)) {
        ++this.depth
        this.DFS(depNode, depth - 1)
      }
    }
  }

  protected isNodeInCollection(node: Node): boolean {
    return this.nodesMap[this.nodeToDependencyName(node)]
  }

  protected nodeToDependencyName(node: Node): string {
    return `${node.package}@${node.version}`
  }

  protected addToNodes(node: Node): void {
    this.nodes.push(node)
    this.nodesMap[this.nodeToDependencyName(node)] = true
  }

  protected addToLinks(node: Node, depNode: Node): void {
    this.links.push({
      source: node,
      target: depNode
    })
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
  /**
   * 获取根节点的dependencies devDependencies peerDependencies
   * @returns {Node[]}
   * @private
   */
  protected abstract getRootNodesFromImporters(): Node[]
  /**
   * 从某个包中获取dependencies devDependencies peerDependencies
   * @returns {Node[]}
   * @private
   */
  protected abstract getNodesFromPackages(node: Node): Node[]
}
