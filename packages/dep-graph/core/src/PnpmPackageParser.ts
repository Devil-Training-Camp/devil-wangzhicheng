import PackageParser, { Dependencies, Node } from './PackageParser'
import {
  Lockfile,
  readWantedLockfile,
  ResolvedDependencies,
  ProjectSnapshot,
  PackageSnapshot,
  ProjectId
} from '@pnpm/lockfile-file'
import { DepPath } from '@pnpm/types/lib/misc'

export default class PnpmPackageParser extends PackageParser {
  private lockfileData: Lockfile | null
  private nodesMap: { [key: string]: boolean } = {}
  constructor(filepath: string) {
    super(filepath)
    this.lockfile = 'pnpm-lock.yaml'
    this.lockfileData = null
  }

  protected async parseLockfile(depth: number): Promise<Dependencies> {
    this.lockfileData = (await readWantedLockfile(this.filepath, {
      ignoreIncompatible: true
    })) as Lockfile
    const rootNodes: Node[] = this.getRootNodesFromImporters()

    for (const node of rootNodes) {
      this.DFS(node, depth)
    }
    return {
      nodes: this.nodes,
      links: this.links
    }
  }

  private DFS(node: Node, depth: number): void {
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

  private isNodeInCollection(node: Node): boolean {
    return this.nodesMap[this.nodeToDependencyName(node)]
  }

  private nodeToDependencyName(node: Node): string {
    return `${node.package}@${node.version}`
  }

  private addToNodes(node: Node): void {
    this.nodes.push(node)
    this.nodesMap[this.nodeToDependencyName(node)] = true
  }

  private addToLinks(node: Node, depNode: Node): void {
    this.links.push({
      source: node,
      target: depNode
    })
  }

  private getRootNodesFromImporters(): Node[] {
    const project: ProjectSnapshot =
      this.lockfileData!.importers['.' as ProjectId]
    return this.getNodesFrom(project)
  }

  private getNodesFromPackages(node: Node): Node[] {
    const packageName: PackageSnapshot | undefined =
      this.lockfileData!.packages?.[this.nodeToDependencyName(node) as DepPath]
    if (!packageName) {
      return []
    }
    return this.getNodesFrom(packageName)
  }

  private getNodesFrom(snapshot: ProjectSnapshot | PackageSnapshot): Node[] {
    const nodes: Node[] = []
    let deps: ResolvedDependencies = Object.assign(
      {},
      snapshot?.dependencies,
      snapshot?.optionalDependencies
    )
    if ('devDependencies' in snapshot) {
      deps = Object.assign(deps, snapshot?.devDependencies)
    } else {
      deps = Object.assign(
        deps,
        (snapshot as PackageSnapshot)?.peerDependencies,
        (snapshot as PackageSnapshot)?.bundledDependencies
      )
    }

    for (const [packageName, version] of Object.entries(deps)) {
      nodes.push({
        package: packageName,
        version,
        depth: this.depth
      })
    }
    return nodes
  }
}
