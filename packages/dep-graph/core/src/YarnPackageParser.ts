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

  // 从importers中获取节点信息
  protected getRootNodesFromImporters(): Node[] {
    const project: ProjectSnapshot =
      this.lockfileData!.importers['.' as ProjectId]
    return this.getNodesFrom(project)
  }

  // 从packages中获取节点信息
  protected getNodesFromPackages(node: Node): Node[] {
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
