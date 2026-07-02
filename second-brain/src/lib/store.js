// Reactive vault store: repo notes (build time) + local notes (runtime).
//
// Local notes are captured in the browser — quick thoughts, imported .md/.txt
// files — and persisted to localStorage. Every change rebuilds the vault so
// the universe, browse grid, search, and the AI brain all see them instantly.

import { useSyncExternalStore } from 'react'
import { buildVault, makeNote, parseFrontmatter, slugify } from './notes.js'

const STORAGE_KEY = 'prat-brain.local-notes'

function loadLocalNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

let localNotes = loadLocalNotes()
let vault = buildVault(localNotes.map(hydrate))
const listeners = new Set()

// localStorage keeps the raw source; note objects are derived on load so
// parsing improvements apply retroactively.
function hydrate(saved) {
  const { meta, body } = parseFrontmatter(saved.raw)
  const note = makeNote({
    id: slugify(saved.title),
    title: meta.title || saved.title,
    folder: saved.folder || 'inbox',
    meta: { ...meta, created: meta.created || saved.created },
    body,
    local: true,
  })
  // Stable handle back to the saved entry, even if the graph id gets
  // de-duplicated against a repo note.
  note.sourceKey = slugify(saved.title)
  return note
}

function commit() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(localNotes))
  vault = buildVault(localNotes.map(hydrate))
  listeners.forEach((fn) => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useVault() {
  return useSyncExternalStore(subscribe, () => vault)
}

export function getVault() {
  return vault
}

export function captureNote({ title, body, tags = [], folder = 'inbox' }) {
  const created = new Date().toISOString().slice(0, 10)
  const front = [
    '---',
    `title: ${title}`,
    tags.length ? `tags: [${tags.join(', ')}]` : null,
    `created: ${created}`,
    '---',
    '',
  ]
    .filter(Boolean)
    .join('\n')
  localNotes = [...localNotes, { title, folder, created, raw: front + body }]
  commit()
  return slugify(title)
}

// Import raw markdown/text files (drag-drop or file picker).
export function importFiles(fileEntries) {
  const created = new Date().toISOString().slice(0, 10)
  const added = []
  for (const { name, text } of fileEntries) {
    const { meta } = parseFrontmatter(text)
    const title = meta.title || name.replace(/\.(md|txt|markdown)$/i, '').replace(/[-_]/g, ' ')
    localNotes = [...localNotes, { title, folder: 'inbox', created, raw: text }]
    added.push(title)
  }
  if (added.length) commit()
  return added
}

export function deleteLocalNote(sourceKey) {
  localNotes = localNotes.filter((saved) => slugify(saved.title) !== sourceKey)
  commit()
}

// The raw markdown for a local note, ready to be committed into notes/.
export function exportLocalNote(sourceKey) {
  const saved = localNotes.find((s) => slugify(s.title) === sourceKey)
  return saved ? { filename: `${slugify(saved.title)}.md`, raw: saved.raw } : null
}

export function localNoteCount() {
  return localNotes.length
}
