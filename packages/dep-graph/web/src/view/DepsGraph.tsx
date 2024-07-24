import ForceGraph3D, { GraphData } from 'react-force-graph-3d'
import { type Dependencies } from '@dep-graph/core/dist/PackageParser'
import { useEffect, useState } from 'react'

const format = (deps: Dependencies): GraphData => {
  return {
    nodes: deps.nodes.map((node) => ({
      id: node.package,
      name: `${node.package}@${node.version}`,
      node
    })),
    links: deps.links.map((link) => ({
      source: link.source.package,
      target: link.target.package,
      sourceNode: link.source,
      targetNode: link.target
    }))
  }
}

export default function DepsGraph() {
  const [renderData, setRenderData] = useState<GraphData | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('http://localhost:9995/api/getDependencies', {
        method: 'GET'
      })
      const deps: Dependencies = (await res.json()) as Dependencies
      setRenderData(format(deps))
    }

    fetchData()
  }, []) // 添加空的依赖数组

  if (!renderData) {
    return <div>Loading...</div>
  }
  return (
    <ForceGraph3D
      graphData={renderData!}
      linkDirectionalArrowLength={2}
      linkDirectionalArrowRelPos={1}
    />
  )
}
