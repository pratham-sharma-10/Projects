import * as THREE from 'three'

// Decorative deep-space scenery for the universe view: a twinkling starfield,
// a tilted Milky Way band, a warm galactic core, drifting nebula clouds, and a
// few faint constellation line-patterns. Everything here is pure background —
// none of it is interactive or part of the note graph.
//
// buildGalaxy() returns { objects, update(t), dispose() }. The caller adds the
// objects to the scene and drives update() from its animation loop.

function radialTexture(stops, size = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  for (const [offset, color] of stops) g.addColorStop(offset, color)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

// Wide, soft ellipse used for the Milky Way haze band.
function bandTexture() {
  const w = 1024
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h / 2)
  g.addColorStop(0, 'rgba(220, 225, 255, 0.9)')
  g.addColorStop(0.25, 'rgba(150, 170, 255, 0.45)')
  g.addColorStop(0.6, 'rgba(120, 90, 220, 0.18)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.scale(w / h, 1) // stretch the radial gradient into a long ellipse
  ctx.translate(-w / 2, -h / 2)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
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

const STAR_TINTS = [
  [1.0, 1.0, 1.0], // white
  [0.66, 0.8, 1.0], // blue-white giants
  [1.0, 0.92, 0.74], // warm yellow
  [1.0, 0.78, 0.7], // soft red
  [0.84, 0.76, 1.0], // violet
]

// Twinkling point-star shader. Each star has its own size + phase so the
// field shimmers instead of pulsing in unison.
const starVertexShader = `
  attribute float size;
  attribute float phase;
  attribute vec3 starColor;
  uniform float time;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vColor = starColor;
    vTwinkle = 0.55 + 0.45 * sin(time * 1.4 + phase);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (320.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const starFragmentShader = `
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    core = pow(core, 1.6);
    gl_FragColor = vec4(vColor * vTwinkle, core * vTwinkle);
  }
`

function buildStarfield(count, minR, maxR, sizeRange) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const phases = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const p = randomDirection(minR + Math.random() * (maxR - minR))
    positions[i * 3] = p.x
    positions[i * 3 + 1] = p.y
    positions[i * 3 + 2] = p.z
    const tint = STAR_TINTS[Math.floor(Math.random() * STAR_TINTS.length)]
    const b = 0.5 + Math.random() * 0.5
    colors[i * 3] = tint[0] * b
    colors[i * 3 + 1] = tint[1] * b
    colors[i * 3 + 2] = tint[2] * b
    sizes[i] = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0])
    phases[i] = Math.random() * Math.PI * 2
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('starColor', new THREE.BufferAttribute(colors, 3))
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1))
  const mat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  return { points: new THREE.Points(geo, mat), material: mat }
}

// A constellation: a handful of bright stars near one patch of sky, joined by
// faint lines into a little asterism.
function buildConstellation() {
  const center = randomDirection(1100 + Math.random() * 700)
  const n = 4 + Math.floor(Math.random() * 4)
  const up = new THREE.Vector3(0, 1, 0)
  const normal = center.clone().normalize()
  const tangent = new THREE.Vector3().crossVectors(normal, up).normalize()
  const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize()

  const verts = []
  for (let i = 0; i < n; i++) {
    const spread = 220
    const offset = tangent
      .clone()
      .multiplyScalar((Math.random() - 0.5) * spread)
      .add(bitangent.clone().multiplyScalar((Math.random() - 0.5) * spread))
    verts.push(center.clone().add(offset))
  }

  const linePositions = []
  for (let i = 0; i < verts.length - 1; i++) {
    linePositions.push(verts[i].x, verts[i].y, verts[i].z)
    linePositions.push(verts[i + 1].x, verts[i + 1].y, verts[i + 1].z)
  }
  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x9fb6ff,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const lines = new THREE.LineSegments(lineGeo, lineMat)

  // Bright marker stars at the vertices.
  const starTex = radialTexture([
    [0, 'rgba(255,255,255,1)'],
    [0.3, 'rgba(200,220,255,0.9)'],
    [1, 'rgba(0,0,0,0)'],
  ])
  const markers = new THREE.Group()
  for (const v of verts) {
    const mat = new THREE.SpriteMaterial({
      map: starTex,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const sprite = new THREE.Sprite(mat)
    sprite.position.copy(v)
    sprite.scale.setScalar(34 + Math.random() * 22)
    markers.add(sprite)
  }

  const group = new THREE.Group()
  group.add(lines)
  group.add(markers)
  return group
}

export function buildGalaxy() {
  const root = new THREE.Group()
  const materials = []
  const geometries = []
  const textures = []

  // Two starfield layers — distant fine dust + nearer brighter stars.
  const farStars = buildStarfield(9000, 1400, 3200, [1.4, 3.2])
  const nearStars = buildStarfield(2200, 700, 1500, [2.6, 6.0])
  root.add(farStars.points)
  root.add(nearStars.points)
  materials.push(farStars.material, nearStars.material)
  geometries.push(farStars.points.geometry, nearStars.points.geometry)

  // Warm galactic core glow sitting far behind the graph.
  const coreTex = radialTexture([
    [0, 'rgba(255, 240, 210, 0.95)'],
    [0.25, 'rgba(255, 200, 150, 0.5)'],
    [0.6, 'rgba(200, 120, 200, 0.18)'],
    [1, 'rgba(0,0,0,0)'],
  ])
  const coreMat = new THREE.SpriteMaterial({
    map: coreTex,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const core = new THREE.Sprite(coreMat)
  core.position.set(-600, -260, -3200)
  core.scale.setScalar(1500)
  root.add(core)
  materials.push(coreMat)
  textures.push(coreTex)

  // Milky Way band: overlapping elongated haze sprites along a tilted axis.
  const bandTex = bandTexture()
  const bandColors = [0xb9c4ff, 0x9a7bff, 0x6fd6ff]
  const axis = new THREE.Vector3(1, 0.4, -0.25).normalize()
  for (let i = 0; i < 5; i++) {
    const mat = new THREE.SpriteMaterial({
      map: bandTex,
      color: bandColors[i % bandColors.length],
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const sprite = new THREE.Sprite(mat)
    const t = (i / 4 - 0.5) * 2600
    sprite.position.copy(axis.clone().multiplyScalar(t)).add(new THREE.Vector3(0, 0, -1400))
    sprite.scale.set(2600, 900, 1)
    root.add(sprite)
    materials.push(mat)
  }
  textures.push(bandTex)

  // Drifting colored nebula clouds.
  const nebulaColors = [
    'rgba(124, 58, 237, 0.6)',
    'rgba(14, 165, 233, 0.5)',
    'rgba(236, 72, 153, 0.45)',
    'rgba(45, 212, 191, 0.45)',
    'rgba(99, 102, 241, 0.45)',
  ]
  const nebulae = []
  for (let i = 0; i < 9; i++) {
    const tex = radialTexture([
      [0, nebulaColors[i % nebulaColors.length]],
      [1, 'rgba(0,0,0,0)'],
    ])
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const sprite = new THREE.Sprite(mat)
    sprite.position.copy(randomDirection(500 + Math.random() * 1100))
    sprite.scale.setScalar(600 + Math.random() * 1000)
    root.add(sprite)
    nebulae.push({ sprite, basePos: sprite.position.clone(), phase: Math.random() * Math.PI * 2 })
    materials.push(mat)
    textures.push(tex)
  }

  // A scattering of constellation asterisms.
  for (let i = 0; i < 7; i++) {
    const c = buildConstellation()
    root.add(c)
  }

  function update(t) {
    farStars.material.uniforms.time.value = t
    nearStars.material.uniforms.time.value = t
    // Slow parallax drift so the field feels alive.
    farStars.points.rotation.y = t * 0.005
    nearStars.points.rotation.y = -t * 0.008
    for (const n of nebulae) {
      n.sprite.position.y = n.basePos.y + Math.sin(t * 0.15 + n.phase) * 30
    }
  }

  function dispose() {
    materials.forEach((m) => m.dispose())
    geometries.forEach((g) => g.dispose())
    textures.forEach((tx) => tx.dispose())
  }

  return { objects: [root], update, dispose }
}

// Build a glowing "star" object for a note node: a bright core sphere wrapped
// in an additive glow sprite, sized by how connected the note is.
const GLOW_TEX = (() => {
  let tex = null
  return () => {
    if (!tex) {
      tex = radialTexture([
        [0, 'rgba(255,255,255,0.95)'],
        [0.25, 'rgba(255,255,255,0.55)'],
        [1, 'rgba(0,0,0,0)'],
      ])
    }
    return tex
  }
})()

export function makeStarNode(color, degree) {
  const group = new THREE.Group()
  const radius = 2.4 + degree * 0.85

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 20, 20),
    new THREE.MeshBasicMaterial({ color }),
  )
  group.add(core)

  const glowMat = new THREE.SpriteMaterial({
    map: GLOW_TEX(),
    color,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const glow = new THREE.Sprite(glowMat)
  glow.scale.setScalar(radius * 4)
  group.add(glow)

  return group
}
