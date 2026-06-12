// Turns the markdown vault in /notes into a graph.
//
// Every .md file under notes/ becomes a node. The folder it lives in is its
// "constellation" (cluster). [[Wikilinks]] between notes become edges.
// Files are pulled in at build time, so adding a note is just adding a file.

const files = import.meta.glob('../../notes/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const PALETTE = [
  '#f5d76e', '#7ee8fa', '#c084fc', '#86efac',
  '#fda4af', '#93c5fd', '#fcd34d', '#5eead4',
  '#f0abfc', '#fdba74', '#a5b4fc', '#bef264',
]

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Minimal YAML-ish frontmatter parser. Supports `key: value`,
// inline lists `[a, b]` and block lists (`- item`). Keep frontmatter simple.
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { meta: {}, body: raw }

  const meta = {}
  let listKey = null
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/)
    if (kv) {
      const key = kv[1]
      const value = kv[2].trim()
      if (value === '') {
        meta[key] = []
        listKey = key
      } else if (value.startsWith('[') && value.endsWith(']')) {
        meta[key] = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean)
        listKey = null
      } else {
        meta[key] = value.replace(/^['"]|['"]$/g, '')
        listKey = null
      }
    } else {
      const item = line.match(/^\s*-\s+(.*)$/)
      if (item && listKey) meta[listKey].push(item[1].trim().replace(/^['"]|['"]$/g, ''))
    }
  }
  return { meta, body: raw.slice(match[0].length) }
}

const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g

function extractWikilinks(body) {
  // Ignore wikilinks inside fenced blocks or inline code.
  const prose = body.replace(/```[\s\S]*?```|`[^`\n]*`/g, '')
  const targets = []
  for (const m of prose.matchAll(WIKILINK_RE)) targets.push(m[1].trim())
  return targets
}

function makeExcerpt(body, length = 170) {
  const text = body
    .replace(WIKILINK_RE, (_, target, alias) => alias || target)
    .replace(/^#+\s.*$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[*_`>#-]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > length ? text.slice(0, length).trimEnd() + '…' : text
}

function buildVault() {
  const notes = []

  for (const [path, raw] of Object.entries(files)) {
    // path looks like ../../notes/<constellation>/<file>.md
    const rel = path.replace(/^.*?\/notes\//, '')
    const parts = rel.split('/')
    const fileName = parts.pop().replace(/\.md$/, '')
    const folder = parts.length ? parts.join('/') : 'loose-notes'

    const { meta, body } = parseFrontmatter(raw)
    const title = meta.title || fileName.replace(/[-_]/g, ' ')

    notes.push({
      id: slugify(fileName),
      title,
      constellation: slugify(meta.constellation || folder),
      tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
      created: meta.created || null,
      body,
      excerpt: makeExcerpt(body),
      rawLinks: extractWikilinks(body),
    })
  }

  // Wikilinks may point at a note's title or its filename — index both.
  const idIndex = new Map()
  for (const note of notes) {
    idIndex.set(note.id, note.id)
    idIndex.set(slugify(note.title), note.id)
  }

  for (const note of notes) {
    note.links = []
    note.unresolved = []
    for (const target of note.rawLinks) {
      const id = idIndex.get(slugify(target))
      if (id && id !== note.id && !note.links.includes(id)) note.links.push(id)
      else if (!id) note.unresolved.push(target)
    }
    delete note.rawLinks
  }

  const notesById = new Map(notes.map((n) => [n.id, n]))
  for (const note of notes) note.backlinks = []
  for (const note of notes) {
    for (const target of note.links) notesById.get(target).backlinks.push(note.id)
  }

  const constellationNames = [...new Set(notes.map((n) => n.constellation))].sort()
  const constellations = constellationNames.map((name, i) => ({
    name,
    color: PALETTE[i % PALETTE.length],
    count: notes.filter((n) => n.constellation === name).length,
  }))
  const colorOf = new Map(constellations.map((c) => [c.name, c.color]))

  const nodes = notes.map((note) => ({
    id: note.id,
    title: note.title,
    constellation: note.constellation,
    color: colorOf.get(note.constellation),
    degree: note.links.length + note.backlinks.length,
  }))

  const links = []
  for (const note of notes) {
    for (const target of note.links) {
      links.push({ source: note.id, target, kind: 'link' })
    }
  }

  // Invisible-ish hub node per constellation: it carries the floating label
  // and gently pulls its members together so clusters form on their own.
  for (const c of constellations) {
    const hubId = `hub:${c.name}`
    nodes.push({ id: hubId, isHub: true, title: c.name, color: c.color })
    for (const note of notes) {
      if (note.constellation === c.name) {
        links.push({ source: hubId, target: note.id, kind: 'hub' })
      }
    }
  }

  return { notes, notesById, constellations, graphData: { nodes, links } }
}

export const vault = buildVault()

export function searchNotes(query, limit = 8) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const scored = []
  for (const note of vault.notes) {
    let score = 0
    if (note.title.toLowerCase().includes(q)) score += 10
    if (note.tags.some((t) => t.toLowerCase().includes(q))) score += 5
    if (note.constellation.includes(q)) score += 3
    if (note.body.toLowerCase().includes(q)) score += 1
    if (score > 0) scored.push([score, note])
  }
  scored.sort((a, b) => b[0] - a[0])
  return scored.slice(0, limit).map(([, note]) => note)
}
