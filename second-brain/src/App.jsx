import { useEffect, useRef, useState } from 'react'
import Universe from './components/Universe.jsx'
import Browse from './components/Browse.jsx'
import NotePanel from './components/NotePanel.jsx'
import Ask from './components/Ask.jsx'
import Capture from './components/Capture.jsx'
import { searchNotes } from './lib/notes.js'
import { useVault } from './lib/store.js'

export default function App() {
  const vault = useVault()
  const [view, setView] = useState('universe')
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [capturing, setCapturing] = useState(false)
  const searchRef = useRef()

  const results = searchNotes(vault, query)

  useEffect(() => {
    function onKey(e) {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')
      if (e.key === '/' && !typing) {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setQuery('')
        setSelectedId(null)
        setCapturing(false)
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
          <span className="pulse" /> prat.brain <span className="version">v0.3</span>
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
          {['universe', 'ask', 'browse', 'about'].map((v) => (
            <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>
              {v}
            </button>
          ))}
          <button className="capture-btn" onClick={() => setCapturing(true)}>
            ＋ capture
          </button>
        </nav>
      </header>

      <main>
        {view === 'universe' && (
          <>
            <Universe vault={vault} selectedId={selectedId} onSelect={setSelectedId} />
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

        {view === 'ask' && <Ask vault={vault} onOpenNote={openNote} />}

        {view === 'browse' && <Browse vault={vault} onSelect={openNote} />}

        {view === 'about' && (
          <div className="about">
            <h1>How this brain works</h1>
            <p>
              Every note is a markdown file in the <code>notes/</code> folder of the repo. Folders
              become constellations, <code>[[wikilinks]]</code> become the threads between stars,
              and the universe re-forms itself on every deploy.
            </p>
            <p>
              <b>ask</b> is the brain's voice: it retrieves the most relevant notes right here in
              your browser and has Claude answer from them — with citations that fly you to the
              source star. Press the mic to talk to it out loud.
            </p>
            <p>
              <b>＋ capture</b> adds thoughts instantly (stored in your browser), and dropping
              <code> .md</code> files feeds the brain in bulk. To make a note permanent: download it
              from its panel, commit it to <code>notes/</code>, push. That's it.
            </p>
          </div>
        )}

        {selectedId && (
          <NotePanel
            vault={vault}
            noteId={selectedId}
            onNavigate={openNote}
            onClose={() => setSelectedId(null)}
          />
        )}
      </main>

      {capturing && (
        <Capture
          onClose={() => setCapturing(false)}
          onCaptured={(id) => {
            setCapturing(false)
            setSelectedId(id)
          }}
        />
      )}
    </div>
  )
}
