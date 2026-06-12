import { useEffect, useRef, useState } from 'react'
import Universe from './components/Universe.jsx'
import Browse from './components/Browse.jsx'
import NotePanel from './components/NotePanel.jsx'
import { vault, searchNotes } from './lib/notes.js'

export default function App() {
  const [view, setView] = useState('universe')
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const searchRef = useRef()

  const results = searchNotes(query)

  useEffect(() => {
    function onKey(e) {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setQuery('')
        setSelectedId(null)
        searchRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function openNote(id) {
    setSelectedId(id)
    setQuery('')
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="pulse" /> prat.brain <span className="version">v0.1</span>
        </div>

        <div className="search">
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search the brain…  ( / )"
          />
          {results.length > 0 && (
            <ul className="search-results">
              {results.map((n) => (
                <li key={n.id}>
                  <button onClick={() => openNote(n.id)}>
                    <b>{n.title}</b>
                    <span>{n.constellation}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav>
          {['universe', 'browse', 'about'].map((v) => (
            <button
              key={v}
              className={view === v ? 'active' : ''}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {view === 'universe' && (
          <>
            <Universe selectedId={selectedId} onSelect={setSelectedId} />
            <div className="hud">
              <h2>second brain</h2>
              <p>
                {vault.notes.length} notes · {vault.constellations.length} constellations
              </p>
              <p className="hint">drag to orbit · scroll to zoom · click a star to read</p>
              <ul className="legend">
                {vault.constellations.map((c) => (
                  <li key={c.name}>
                    <span className="dot" style={{ background: c.color }} />
                    {c.name.replace(/-/g, ' ')}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {view === 'browse' && <Browse onSelect={openNote} />}

        {view === 'about' && (
          <div className="about">
            <h1>How this brain works</h1>
            <p>
              Every note is a markdown file in the <code>notes/</code> folder of the repo.
              Folders become constellations, <code>[[wikilinks]]</code> become the threads
              between stars, and the universe re-forms itself on every deploy.
            </p>
            <p>
              To grow the brain: add or edit a <code>.md</code> file, commit, push. That's it.
            </p>
          </div>
        )}

        {selectedId && (
          <NotePanel
            noteId={selectedId}
            onNavigate={openNote}
            onClose={() => setSelectedId(null)}
          />
        )}
      </main>
    </div>
  )
}
