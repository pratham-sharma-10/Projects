import { useMemo } from 'react'
import { renderMarkdown } from '../lib/markdown.js'
import { deleteLocalNote, exportLocalNote } from '../lib/store.js'

export default function NotePanel({ vault, noteId, onNavigate, onClose }) {
  const note = vault.notesById.get(noteId)
  const html = useMemo(() => (note ? renderMarkdown(note.body, vault) : ''), [note, vault])
  if (!note) return null

  const color = vault.constellations.find((c) => c.name === note.constellation)?.color

  function handleClick(e) {
    const link = e.target.closest('[data-note]')
    if (link) {
      e.preventDefault()
      onNavigate(link.dataset.note)
    }
  }

  function download() {
    const file = exportLocalNote(note.sourceKey)
    if (!file) return
    const blob = new Blob([file.raw], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function remove() {
    if (confirm(`Delete “${note.title}” from this browser?`)) {
      deleteLocalNote(note.sourceKey)
      onClose()
    }
  }

  return (
    <aside className="note-panel" onClick={handleClick}>
      <header className="note-panel-head">
        <span className="chip" style={{ color, borderColor: color }}>
          {note.constellation}
        </span>
        <span className="note-panel-actions">
          {note.local && (
            <>
              <button className="close-btn" title="Download as markdown to commit into notes/" onClick={download}>
                ⤓
              </button>
              <button className="close-btn" title="Delete from this browser" onClick={remove}>
                🗑
              </button>
            </>
          )}
          <button className="close-btn" onClick={onClose} aria-label="Close note">
            ✕
          </button>
        </span>
      </header>

      <h1 className="note-title">{note.title}</h1>
      <div className="note-meta">
        {note.local && <span className="meta-item local-badge">● local — only in this browser</span>}
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
