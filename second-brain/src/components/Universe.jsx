import { useEffect, useRef } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
import * as THREE from 'three'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { vault } from '../lib/notes.js'
import { buildGalaxy, makeStarNode } from '../lib/galaxy.js'

export default function Universe({ selectedId, onSelect }) {
  const fgRef = useRef()
  const containerRef = useRef()

  useEffect(() => {
    const fg = fgRef.current
    if (!fg) return
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.7, 0.55, 0.2)
    fg.postProcessingComposer().addPass(bloom)
    fg.d3Force('charge').strength(-60)

    // Crisper rendering on high-DPI screens.
    fg.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

    const scene = fg.scene()
    const galaxy = buildGalaxy()
    galaxy.objects.forEach((obj) => scene.add(obj))

    const controls = fg.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.4

    // Drive the twinkle/drift animation from the render loop.
    const clock = new THREE.Clock()
    let raf
    const animate = () => {
      galaxy.update(clock.getElapsedTime())
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      fg.postProcessingComposer().removePass(bloom)
      galaxy.objects.forEach((obj) => scene.remove(obj))
      galaxy.dispose()
    }
  }, [])

  // Fly the camera to a note when it gets selected (e.g. from search/browse).
  useEffect(() => {
    if (!selectedId) return
    const node = vault.graphData.nodes.find((n) => n.id === selectedId)
    if (node && node.x !== undefined) flyTo(node)
  }, [selectedId])

  function flyTo(node) {
    const dist = Math.hypot(node.x, node.y, node.z) || 1
    const ratio = 1 + 170 / dist
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
        nodeVal={(n) => (n.isHub ? 0.01 : 1.5 + n.degree * 0.9)}
        nodeThreeObject={(n) => {
          if (n.isHub) {
            const sprite = new SpriteText(n.title.toUpperCase().replace(/-/g, ' '))
            sprite.color = n.color
            sprite.textHeight = 5.5
            sprite.fontWeight = '600'
            sprite.material.transparent = true
            sprite.material.opacity = 0.5
            return sprite
          }
          return makeStarNode(n.color, n.degree)
        }}
        linkColor={(l) => (l.kind === 'hub' ? '#ffffff' : '#8fb4ff')}
        linkOpacity={0.18}
        linkWidth={(l) => (l.kind === 'hub' ? 0 : 0.7)}
        linkDirectionalParticles={(l) => (l.kind === 'hub' ? 0 : 2)}
        linkDirectionalParticleWidth={0.8}
        linkDirectionalParticleSpeed={0.004}
        onNodeClick={(n) => {
          flyTo(n)
          if (!n.isHub) onSelect(n.id)
        }}
        onBackgroundClick={() => onSelect(null)}
      />
    </div>
  )
}
