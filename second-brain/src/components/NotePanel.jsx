import { useMemo } from 'react'
import { marked } from 'marked'
import { vault, slugify } from '../lib/notes.js'

const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g

// Split body into [text, code, text, code, ...] so wikilinks inside
// fenced blocks or inline code are left untouched.
const CODE_SPLIT_RE = /(```[\s\S]*?```|`[^`\n]*`)/g

function renderMarkdown(note) {
  // Resolve [[wikilinks]] to in-app anchors before handing off to marked.
  const withLinks = note.body
    .split(CODE_SPLIT_RE)
    .map((segment, i) => {
      if (i % 2 === 1) return segment
      return segment.replace(WIKILINK_RE, (_, target, alias) => {
        const label = alias || target.trim()
        const id = slugify(target.trim())
        return vault.notesById.has(id)
          ? `<a class="wikilink" data-note="${id}">${label}</a>`
          : `<span class="wikilink broken" title="No note named “${target.trim()}” yet">${label}</span>`
      })
    })
    .join('')
  return marked.parse(withLinks)
}

export default function NotePanel({ noteId, onNavigate, onClose }) {
  const note = vault.notesById.get(noteId)
  const html = useMemo(() => (note ? renderMarkdown(note) : ''), [note])
  if (!note) return null

  const color = vault.constellations.find((c) => c.name === note.constellation)?.color

  function handleClick(e) {
    const link = e.target.closest('[data-note]')
    if (link) {
      e.preventDefault()
      onNavigate(link.dataset.note)
    }
  }

  return (
    <aside className="note-panel" onClick={handleClick}>
      <header className="note-panel-head">
        <span className="chip" style={{ color, borderColor: color }}>
          {note.constellation}
        </span>
        <button className="close-btn" onClick={onClose} aria-label="Close note">
          ✕
        </button>
      </header>

      <h1 className="note-title">{note.title}</h1>
      <div className="note-meta">
        {note.created && <span className="meta-item">{note.created}</span>}
        {note.tags.map((t) => (
          <span key={t} className="meta-item tag">
            #{t}
          </span>
        ))}
      </div>

      <article className="note-body" dangerouslySetInnerHTML={{ __html: html }} />

      {note.backlinks.length > 0 && (
        <footer className="backlinks">
          <h3>Linked from</h3>
          {note.backlinks.map((id) => (
            <a key={id} className="wikilink" data-note={id}>
              {vault.notesById.get(id).title}
            </a>
          ))}
        </footer>
      )}
    </aside>
  )
}
