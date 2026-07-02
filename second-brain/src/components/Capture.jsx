import { useRef, useState } from 'react'
import { captureNote, importFiles } from '../lib/store.js'

// Quick capture: jot a thought or drop .md/.txt files straight into the
// brain. Notes land in the "inbox" constellation (stored in this browser)
// and appear in the universe, search, and AI answers immediately.
export default function Capture({ onClose, onCaptured }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [importedNames, setImportedNames] = useState([])
  const fileRef = useRef(null)

  function submit(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    const id = captureNote({
      title: title.trim(),
      body: body.trim() + '\n',
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    })
    onCaptured(id)
  }

  async function handleFiles(fileList) {
    const files = [...fileList].filter((f) => /\.(md|txt|markdown)$/i.test(f.name))
    if (!files.length) return
    const entries = await Promise.all(files.map(async (f) => ({ name: f.name, text: await f.text() })))
    const added = importFiles(entries)
    setImportedNames((prev) => [...prev, ...added])
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h2>＋ capture a thought</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <form onSubmit={submit}>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="title — e.g. Idea: recruiter-facing portfolio"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={7}
            placeholder={'What’s on your mind? Markdown works, and [[wikilinks]] connect it to other notes.'}
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tags, comma separated (optional)"
          />
          <button type="submit" className="primary" disabled={!title.trim() || !body.trim()}>
            add to brain
          </button>
        </form>

        <div
          className={`dropzone ${dragOver ? 'over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFiles(e.dataTransfer.files)
          }}
          onClick={() => fileRef.current?.click()}
        >
          drop <code>.md</code> / <code>.txt</code> files here (or click) to feed the brain
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".md,.txt,.markdown"
            hidden
            onChange={(e) => {
              handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </div>

        {importedNames.length > 0 && (
          <p className="import-done">
            ✓ imported: {importedNames.join(', ')} — now glowing in the <b>inbox</b> constellation
          </p>
        )}

        <p className="fineprint">
          Captured notes live in this browser (localStorage). To make one permanent, open it and use
          <b> ⤓ download .md</b>, then commit the file to <code>notes/</code> in the repo.
        </p>
      </div>
    </div>
  )
}
