import { useEffect, useRef } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
import * as THREE from 'three'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { vault } from '../lib/notes.js'

export default function Universe({ selectedId, onSelect }) {
  const fgRef = useRef()
  const containerRef = useRef()

  useEffect(() => {
    const fg = fgRef.current
    if (!fg) return
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 1.1, 0.45, 0.1)
    fg.postProcessingComposer().addPass(bloom)
    fg.d3Force('charge').strength(-60)
    return () => fg.postProcessingComposer().removePass(bloom)
  }, [])

  // Fly the camera to a note when it gets selected (e.g. from search/browse).
  useEffect(() => {
    if (!selectedId) return
    const node = vault.graphData.nodes.find((n) => n.id === selectedId)
    if (node && node.x !== undefined) flyTo(node)
  }, [selectedId])

  function flyTo(node) {
    const dist = Math.hypot(node.x, node.y, node.z) || 1
    const ratio = 1 + 110 / dist
    fgRef.current.cameraPosition(
      { x: node.x * ratio, y: node.y * ratio, z: node.z * ratio },
      node,
      1400,
    )
  }

  return (
    <div ref={containerRef} className="universe">
      <ForceGraph3D
        ref={fgRef}
        graphData={vault.graphData}
        backgroundColor="#04060d"
        showNavInfo={false}
        nodeLabel={(n) =>
          n.isHub ? '' : `<div class="node-tip"><b>${n.title}</b><br/>${n.constellation}</div>`
        }
        nodeColor={(n) => n.color}
        nodeOpacity={0.92}
        nodeResolution={16}
        nodeVal={(n) => (n.isHub ? 0.01 : 1.5 + n.degree * 0.9)}
        nodeThreeObject={(n) => {
          if (!n.isHub) return false
          const sprite = new SpriteText(n.title.toUpperCase().replace(/-/g, ' '))
          sprite.color = n.color
          sprite.textHeight = 5
          sprite.material.transparent = true
          sprite.material.opacity = 0.55
          return sprite
        }}
        linkColor={(l) => (l.kind === 'hub' ? '#ffffff' : '#9db4ff')}
        linkOpacity={0.12}
        linkWidth={(l) => (l.kind === 'hub' ? 0 : 0.6)}
        onNodeClick={(n) => {
          flyTo(n)
          if (!n.isHub) onSelect(n.id)
        }}
        onBackgroundClick={() => onSelect(null)}
      />
    </div>
  )
}
