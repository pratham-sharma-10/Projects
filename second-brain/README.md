# prat.brain — second brain

An Obsidian-style second brain rendered as an interactive 3D universe.
Every markdown note is a star, folders are constellations, and
`[[wikilinks]]` are the threads between them.

![stack](https://img.shields.io/badge/react-19-61dafb) ![stack](https://img.shields.io/badge/three.js-bloom-f5d76e) ![stack](https://img.shields.io/badge/vite-8-9b7cf5)

## Run it

```bash
cd second-brain
npm install
npm run dev      # http://localhost:5173
```

## Add a note (this is the whole workflow)

1. Create a markdown file anywhere under `notes/`:

   ```markdown
   ---
   title: My New Thought
   tags: [idea]
   created: 2026-06-12
   ---

   Connects to [[Project Ideas]] and [[Learning Queue]].
   ```

2. The **folder** it lives in becomes its constellation
   (`notes/ideas/…` → the *ideas* cluster). New folder = new constellation.
3. `[[Wikilinks]]` (by note title or filename) draw the edges in the graph.
4. Commit and push — GitHub Actions rebuilds and redeploys the universe.

Frontmatter is optional; without it the filename becomes the title.

## Features

- **Universe** — 3D force graph with bloom glow; drag to orbit, scroll to
  zoom, click a star to read the note (camera flies to it)
- **Note panel** — rendered markdown with clickable wikilinks and backlinks
- **Browse** — card grid grouped by constellation
- **Search** — press `/`, fuzzy-ish search over titles, tags, and content
- **Zero database** — the vault *is* the markdown; Vite ingests it at build time

## Deploying to GitHub Pages

The workflow in `.github/workflows/deploy-second-brain.yml` deploys on every
push to `main` that touches `second-brain/`. One-time setup: in the repo's
**Settings → Pages**, set *Source* to **GitHub Actions**.
