import ForceGraph3D from 'react-force-graph-3d'
import jsonData from '../../../core/lock.json'
function genRandomTree(N = 300, reverse = false) {
  return {
    nodes: [...Array(N).keys()].map((i) => ({ id: i })),
    links: [...Array(N).keys()]
      .filter((id) => id)
      .map((id) => ({
        [reverse ? 'target' : 'source']: id,
        [reverse ? 'source' : 'target']: Math.round(Math.random() * (id - 1))
      }))
  }
}

export default function ForceGraph() {
  console.log('randomTree', genRandomTree())
  console.log('jsonData', jsonData)
  const renderData = {
    nodes: jsonData.nodes.map((node) => ({
      id: node.package,
      name: `${node.package}@${node.version}`,
      node
    })),
    links: jsonData.links.map((link) => ({
      source: link.source.package,
      target: link.target.package,
      sourceNode: link.source,
      targetNode: link.target
    }))
  }
  return (
    <ForceGraph3D
      graphData={renderData}
      linkDirectionalArrowLength={2}
      linkDirectionalArrowRelPos={1}
    />
  )
}
