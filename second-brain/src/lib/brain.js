// The "brain" behind the ask view: retrieval over the vault + Claude.
//
// Retrieval is plain client-side lexical scoring (no server, no embeddings):
// the top-scoring notes are packed into the prompt and Claude answers from
// them, citing sources as [[wikilinks]]. With no API key configured, a local
// extractive mode answers from the same retrieved notes so the app still
// works as a static site.

import Anthropic from '@anthropic-ai/sdk'

export const MODELS = [
  { id: 'claude-opus-4-8', label: 'Opus 4.8 — smartest' },
  { id: 'claude-sonnet-5', label: 'Sonnet 5 — balanced' },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5 — fastest' },
]
export const DEFAULT_MODEL = MODELS[0].id

const STOPWORDS = new Set(
  'a an and are as at be but by for from has have how i in is it its me my of on or that the this to was what when where which who why with you your'.split(' '),
)

function terms(text) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
}

function countOccurrences(haystack, term) {
  let count = 0
  let i = haystack.indexOf(term)
  while (i !== -1) {
    count += 1
    i = haystack.indexOf(term, i + term.length)
  }
  return count
}

// Score every note against the question; return the strongest matches.
export function retrieve(vault, question, k = 6) {
  const queryTerms = [...new Set(terms(question))]
  if (!queryTerms.length) return []

  // Down-weight terms that appear in most notes (cheap idf).
  const noteCount = vault.notes.length || 1
  const docFreq = new Map()
  for (const term of queryTerms) {
    let df = 0
    for (const note of vault.notes) {
      if (note.body.toLowerCase().includes(term) || note.title.toLowerCase().includes(term)) df += 1
    }
    docFreq.set(term, df)
  }

  const scored = []
  for (const note of vault.notes) {
    const title = note.title.toLowerCase()
    const body = note.body.toLowerCase()
    const tags = note.tags.join(' ').toLowerCase()
    let score = 0
    for (const term of queryTerms) {
      const idf = Math.log(1 + noteCount / (1 + (docFreq.get(term) || 0)))
      if (title.includes(term)) score += 8 * idf
      if (tags.includes(term)) score += 4 * idf
      score += Math.min(countOccurrences(body, term), 5) * idf
    }
    if (score > 0) scored.push([score, note])
  }
  scored.sort((a, b) => b[0] - a[0])
  return scored.slice(0, k).map(([, note]) => note)
}

function packContext(notes, maxCharsPerNote = 2500) {
  return notes
    .map((n) => {
      const body = n.body.length > maxCharsPerNote ? n.body.slice(0, maxCharsPerNote) + '\n…' : n.body
      return `<note title="${n.title}" folder="${n.constellation}" tags="${n.tags.join(', ')}">\n${body}\n</note>`
    })
    .join('\n\n')
}

function systemPrompt(vault, sources) {
  return `You are prat.brain — the voice of Pratham Sharma's second brain, a personal knowledge base of ${vault.notes.length} markdown notes about his experience, projects, learning, and ideas.

Answer the user's question using the notes provided below. Rules:
- Ground every claim in the notes. If the notes don't cover something, say so plainly instead of inventing details.
- When you draw on a note, cite it inline as a wikilink with its exact title, e.g. [[About Pratham]].
- Keep answers conversational and tight (2–6 sentences for simple questions) — they may be read aloud by a voice interface.
- Speak about Pratham in third person unless the user is clearly Pratham himself.

Notes retrieved for this question:

${packContext(sources)}`
}

// Ask Claude, streaming text deltas to onDelta. Returns the final text.
export async function askBrain({ vault, question, history, apiKey, model, onDelta }) {
  const sources = retrieve(vault, question)
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const stream = client.messages.stream({
    model: model || DEFAULT_MODEL,
    max_tokens: 1024,
    system: systemPrompt(vault, sources),
    messages: [
      ...history.map((m) => ({ role: m.role, content: m.text })),
      { role: 'user', content: question },
    ],
  })
  stream.on('text', (delta) => onDelta?.(delta))
  const final = await stream.finalMessage()
  const text = final.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
  return { text, sources }
}

// Keyless fallback: extract the most relevant passages from the top notes.
export function localAnswer(vault, question) {
  const sources = retrieve(vault, question, 3)
  if (!sources.length) {
    return {
      text: "I couldn't find anything about that in the brain yet. Try different words, or capture a note about it with **+ capture**.",
      sources: [],
    }
  }
  const queryTerms = new Set(terms(question))
  const parts = sources.map((note) => {
    const paragraphs = note.body
      .split(/\n{2,}/)
      .map((p) => p.replace(/^#+\s.*$/gm, '').trim())
      .filter((p) => p.length > 30)
    let best = ''
    let bestScore = -1
    for (const p of paragraphs) {
      const lower = p.toLowerCase()
      let score = 0
      for (const t of queryTerms) if (lower.includes(t)) score += 1
      if (score > bestScore) {
        bestScore = score
        best = p
      }
    }
    const snippet = best.length > 320 ? best.slice(0, 320).trimEnd() + '…' : best
    return `**[[${note.title}]]** — ${snippet}`
  })
  return {
    text: `_Local mode (no API key set — add one in ⚙ settings for real answers)._ Here's what the brain holds on that:\n\n${parts.join('\n\n')}`,
    sources,
  }
}

// Strip markdown/wikilinks so text-to-speech reads naturally.
export function speakableText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' code block omitted. ')
    .replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g, (_, t, a) => a || t)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/^_?Local mode.*?\._?/m, '')
    .replace(/\s+/g, ' ')
    .trim()
}
