import { vault } from '../lib/notes.js'

export default function Browse({ onSelect }) {
  return (
    <div className="browse">
      {vault.constellations.map((c) => (
        <section key={c.name} className="constellation-group">
          <h2 style={{ color: c.color }}>
            <span className="dot" style={{ background: c.color }} />
            {c.name.replace(/-/g, ' ')}
            <span className="count">{c.count}</span>
          </h2>
          <div className="card-grid">
            {vault.notes
              .filter((n) => n.constellation === c.name)
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((n) => (
                <button key={n.id} className="card" onClick={() => onSelect(n.id)}>
                  <h3>{n.title}</h3>
                  <p>{n.excerpt}</p>
                  <div className="card-tags">
                    {n.tags.map((t) => (
                      <span key={t}>#{t}</span>
                    ))}
                  </div>
                </button>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
