import PackageParser, { Dependencies, Node, Package } from './PackageParser'
import * as fsPromises from 'node:fs/promises'
import * as path from 'node:path'
import lockfile from '@yarnpkg/lockfile'

export default class YarnPackageParser extends PackageParser {
  private lockfileData: any
  private rootNodes: Node[]
  constructor(filepath: string) {
    super(filepath)
    this.lockfile = 'yarn.lock'
    this.lockfileData = null
    this.rootNodes = []
  }

  protected async parseLockfile(depth: number): Promise<Dependencies> {
    const file = await fsPromises.readFile(
      path.resolve(this.filepath, this.lockfile!),
      'utf-8'
    )
    const parser = lockfile.parse(file)
    if (parser.type === 'success') {
      this.lockfileData = parser.object
    } else {
      return {
        nodes: this.nodes,
        links: this.links
      }
    }
    await this.getRootNodes()
    const rootNodes: Node[] = this.getRootNodesFromImporters()

    for (const node of rootNodes) {
      this.DFS(node, depth)
    }
    return {
      nodes: this.nodes,
      links: this.links
    }
  }

  protected getRootNodesFromImporters(): Node[] {
    return this.rootNodes
  }

  /**
   * yarn从package.json获取root节点
   * @private
   */
  private async getRootNodes(): Promise<void> {
    const file = await fsPromises.readFile(
      path.resolve(this.filepath, 'package.json'),
      'utf-8'
    )
    const pack = JSON.parse(file)
    this.rootNodes = this.getNodesFrom(pack)
  }

  protected getNodesFromPackages(node: Node): Node[] {
    return this.getNodesFrom(
      this.lockfileData[`${node.package}@${node.version}`]
    )
  }

  private getNodesFrom(pack: Package): Node[] {
    const allDependencies: Record<string, string> = {
      ...(pack?.dependencies ?? {}),
      ...(pack?.devDependencies ?? {}),
      ...(pack?.peerDependencies ?? {}),
      ...(pack?.optionalDependencies ?? {}),
      ...(pack?.bundledDependencies ?? {})
    }
    return Object.entries(allDependencies).map(([p, v]) => {
      return {
        package: p,
        version: v,
        depth: this.depth
      }
    })
  }
}
