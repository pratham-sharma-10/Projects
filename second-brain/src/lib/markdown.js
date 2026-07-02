import { marked } from 'marked'
import { slugify } from './notes.js'

const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g

// Split body into [text, code, text, code, ...] so wikilinks inside
// fenced blocks or inline code are left untouched.
const CODE_SPLIT_RE = /(```[\s\S]*?```|`[^`\n]*`)/g

// Render markdown to HTML, resolving [[wikilinks]] against the given vault.
export function renderMarkdown(body, vault) {
  const withLinks = body
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
