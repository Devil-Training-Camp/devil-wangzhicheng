import ForceGraph2D, {
  GraphData,
  LinkObject,
  NodeObject
} from 'react-force-graph-2d'
import { type Dependencies } from '@dep-graph/core/dist/PackageParser'
import { useEffect, useMemo, useState } from 'react'

const format = (deps: Dependencies): GraphData => {
  const data = {
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
  data.nodes.map((node) => {
    const current = node as typeof node & { links: LinkObject[] }
    current.links = data.links.reduce<LinkObject[]>((acc, cur) => {
      if (
        node.node.package === cur.source ||
        node.node.package === cur.target
      ) {
        acc.push(cur)
      }
      return acc
    }, [])
    return current
  })
  return data
}

export default function DepsGraph() {
  const [renderData, setRenderData] = useState<GraphData | null>(null)

  const [highlightLinks, setHighlightLinks] = useState<Set<LinkObject>>(
    new Set()
  )

  const maxDepth = useMemo(() => {
    return (
      renderData?.nodes.reduce(
        (acc, cur) => Math.max(acc, cur.node.depth),
        0
      ) ?? 0
    )
  }, [renderData])

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

  // 根据深度生成大小
  const genNodeVal = (d: NodeObject) => {
    return ((maxDepth - d.node.depth) / maxDepth) * 5 + 1
  }
  // 节点hover
  const handleNodeHover = (d: NodeObject | null) => {
    console.log(d)
    highlightLinks.clear()
    if (d) {
      d.links.forEach((l: LinkObject) => {
        highlightLinks.add(l)
      })
      setHighlightLinks(highlightLinks)
    }
  }

  const nodeCanvasObject = (
    node: NodeObject,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => {
    const label = node.name || node.id // 显示的标签，可以是 name 或 id
    const fontSize = 12 / globalScale // 调整字体大小以适应缩放

    // 绘制节点
    ctx.beginPath()
    ctx.arc(node.x!, node.y!, 5, 0, 2 * Math.PI, false)
    ctx.fillStyle = '#69b3a2'
    ctx.fill()
    ctx.closePath()

    // 绘制标签
    ctx.font = `${fontSize}px Sans-Serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#333'
    if (globalScale > 1.5) {
      ctx.fillText(label, node.x!, node.y!) // 标签显示在节点中心
    }
  }

  if (!renderData) {
    return <div>Loading...</div>
  }
  return (
    <ForceGraph2D
      graphData={renderData as GraphData}
      linkDirectionalArrowLength={2}
      nodeLabel="name"
      nodeVal={genNodeVal}
      linkDirectionalParticles={4}
      linkDirectionalParticleSpeed={0.005}
      linkDirectionalParticleWidth={(l) => (highlightLinks.has(l) ? 2 : 0)}
      linkColor={(l) => (highlightLinks.has(l) ? 'orange' : '')}
      onNodeHover={handleNodeHover}
      nodeCanvasObject={nodeCanvasObject}
    />
  )
}
