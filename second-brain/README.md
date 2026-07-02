# prat.brain — a second brain you can talk to

An AI-powered second brain rendered as an interactive 3D universe. Every
markdown note is a star, folders are constellations, `[[wikilinks]]` are the
threads between them — and the whole thing has a **voice**: ask it anything
about Pratham and it answers from the notes, cites its sources, and flies you
to the star it learned it from.

![stack](https://img.shields.io/badge/react-19-61dafb)
![stack](https://img.shields.io/badge/three.js-bloom-f5d76e)
![stack](https://img.shields.io/badge/claude-opus_4.8-c084fc)
![stack](https://img.shields.io/badge/web_speech_api-voice-7ee8fa)
![stack](https://img.shields.io/badge/backend-none-86efac)

## What it does

| Surface | What happens |
| --- | --- |
| 🌌 **universe** | 3D force graph with bloom glow — drag to orbit, click a star to read the note, camera flies to it |
| 💬 **ask** | Chat with the brain. Client-side retrieval picks the most relevant notes, Claude answers from them and cites `[[sources]]` — click a citation chip and you're taken to the note |
| 🎙 **voice** | Press `∞ voice` and just talk. It listens (Web Speech API), thinks, answers out loud, then listens again — a hands-free conversation with a knowledge base |
| ＋ **capture** | Jot a thought or drag-drop `.md`/`.txt` files. New notes appear in the universe, search, and AI answers instantly — no rebuild, no server |
| 🔍 **search** | Press `/`, fuzzy search over titles, tags, and content |

## Architecture (the interesting part)

**There is no backend.** The entire system is a static site:

```
markdown vault (notes/)                 browser
┌──────────────────────┐   build   ┌─────────────────────────────────────┐
│ folders → clusters   │ ───────▶  │ vault store (repo notes + local     │
│ [[wikilinks]] → edges│   vite    │ notes from localStorage, reactive)  │
└──────────────────────┘           │   ├─ 3D universe (three.js/d3)      │
                                   │   ├─ lexical retrieval (tf-idf-ish) │
        you, speaking ──────────▶  │   ├─ Claude API (streaming, BYO key)│
        Web Speech API STT         │   └─ speech synthesis (TTS) ──▶ 🔊  │
                                   └─────────────────────────────────────┘
```

- **RAG without a vector DB** — retrieval is transparent lexical scoring
  (title/tag/body hits weighted by inverse document frequency) running
  client-side over the whole vault. The top notes are packed into Claude's
  system prompt; answers stream token-by-token.
- **Graceful degradation** — no API key? The brain answers in *local mode*,
  extracting the most relevant passages from the same retrieved notes. The
  public demo is never dead.
- **Voice loop on-device** — speech-to-text and text-to-speech are the
  browser's own (Chrome/Edge/Safari). No audio ever leaves the machine.
- **Bring-your-own-key** — the Claude key lives in `localStorage` and goes
  straight to Anthropic's API from the browser. Nothing to host, nothing to
  leak.
- **Zero database** — the vault *is* the markdown. Captured notes layer on
  top from `localStorage` and merge into the same graph at runtime.

## Run it

```bash
cd second-brain
npm install
npm run dev      # http://localhost:5173
```

Optional: open **ask → ⚙ settings** and paste a Claude API key
([console.anthropic.com](https://console.anthropic.com)) for full AI answers.
Works without one in local extractive mode.

## Grow the brain

1. **In the app**: hit **＋ capture** — type a thought or drop `.md` files.
   Stored in your browser, instantly part of the graph and the AI's knowledge.
2. **Permanently**: add a markdown file under `notes/`:

   ```markdown
   ---
   title: My New Thought
   tags: [idea]
   created: 2026-07-02
   ---

   Connects to [[Project Ideas]] and [[Learning Queue]].
   ```

   The folder becomes its constellation; `[[wikilinks]]` draw the edges.
   Commit, push — GitHub Actions rebuilds and redeploys the universe.
   (Captured notes have a **⤓ download .md** button to make this a two-click
   promotion.)

## Deploying to GitHub Pages

The workflow in `.github/workflows/deploy-second-brain.yml` deploys on every
push to `main` that touches `second-brain/`. One-time setup: in the repo's
**Settings → Pages**, set *Source* to **GitHub Actions**.

## Stack

React 19 · Vite 8 · three.js + react-force-graph-3d (WebGL bloom universe) ·
Anthropic SDK (Claude Opus 4.8, streaming) · Web Speech API (STT + TTS) ·
marked · zero backend, zero database.
