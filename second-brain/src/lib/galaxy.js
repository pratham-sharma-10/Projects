import * as THREE from 'three'

// Background scenery for the universe view: a distant tinted starfield and
// a few soft additive nebula clouds. Pure decoration — none of it is
// interactive or part of the graph.

function makeGlowTexture(color) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

function randomDirection(radius) {
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(2 * Math.random() - 1)
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  )
}

export function buildGalaxy() {
  const objects = []

  // Distant starfield in a hollow sphere around the graph
  const STAR_COUNT = 5000
  const positions = new Float32Array(STAR_COUNT * 3)
  const colors = new Float32Array(STAR_COUNT * 3)
  const tints = [
    [1, 1, 1], // white
    [0.72, 0.84, 1], // blue giants
    [1, 0.93, 0.78], // warm yellows
    [0.86, 0.78, 1], // violet
  ]
  for (let i = 0; i < STAR_COUNT; i++) {
    const p = randomDirection(900 + Math.random() * 1800)
    positions[i * 3] = p.x
    positions[i * 3 + 1] = p.y
    positions[i * 3 + 2] = p.z
    const tint = tints[Math.floor(Math.random() * tints.length)]
    const brightness = 0.45 + Math.random() * 0.55
    colors[i * 3] = tint[0] * brightness
    colors[i * 3 + 1] = tint[1] * brightness
    colors[i * 3 + 2] = tint[2] * brightness
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const starMat = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  })
  objects.push(new THREE.Points(starGeo, starMat))

  // Soft nebula clouds drifting far behind the notes
  const nebulaColors = [
    'rgba(124, 58, 237, 0.55)', // violet
    'rgba(14, 165, 233, 0.45)', // cyan
    'rgba(236, 72, 153, 0.40)', // magenta
    'rgba(45, 212, 191, 0.40)', // teal
    'rgba(245, 158, 11, 0.30)', // amber
  ]
  for (let i = 0; i < 8; i++) {
    const texture = makeGlowTexture(nebulaColors[i % nebulaColors.length])
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const sprite = new THREE.Sprite(material)
    sprite.position.copy(randomDirection(450 + Math.random() * 950))
    sprite.scale.setScalar(550 + Math.random() * 950)
    objects.push(sprite)
  }

  return objects
}
