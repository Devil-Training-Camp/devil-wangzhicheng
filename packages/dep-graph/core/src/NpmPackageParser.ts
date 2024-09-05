import PackageParser, { Dependencies, Node } from './PackageParser'
import * as path from 'node:path'

interface Package {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  peerDependencies: Record<string, string>
}

export default class NpmPackageParser extends PackageParser {
  private lockfileData: any
  constructor(filepath: string) {
    super(filepath)
    this.lockfile = 'package-lock.json'
  }

  protected async parseLockfile(depth: number): Promise<Dependencies> {
    this.lockfileData = await import(
      path.resolve(this.filepath, this.lockfile!)
    )

    const rootNodes: Node[] = this.getRootNodesFromImporters()

    for (const node of rootNodes) {
      this.DFS(node, depth)
    }
    return {
      nodes: this.nodes,
      links: this.links
    }
  }

  /**
   * 获取根节点的dependencies devDependencies peerDependencies
   * @returns {Node[]}
   * @private
   */
  protected getRootNodesFromImporters(): Node[] {
    const pack: Package = this.lockfileData.packages['']
    return this.getNodesFrom(pack)
  }

  /**
   * 从某个包中获取dependencies devDependencies peerDependencies
   * @returns {Node[]}
   * @private
   */
  protected getNodesFromPackages(node: Node): Node[] {
    const pack: Package =
      this.lockfileData.packages[`node_modules/${node.package}`]
    return this.getNodesFrom(pack)
  }

  private getNodesFrom(pack: Package): Node[] {
    const allDependencies: Record<string, string> = {
      ...(pack?.dependencies ?? {}),
      ...(pack?.devDependencies ?? {}),
      ...(pack?.peerDependencies ?? {})
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
