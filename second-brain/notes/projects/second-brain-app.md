---
title: Second Brain App
tags: [project, active]
created: 2026-06-12
---

This app. An Obsidian-style vault rendered as a 3D universe.

## How it works

- Vite + React + `react-force-graph-3d` (Three.js with a bloom pass)
- Notes are parsed at build time: folders → constellations, wikilinks → edges
- Deployed to GitHub Pages on every push

## Roadmap

- [ ] Timeline view (notes by created date)
- [ ] Local graph view inside the note panel
- [ ] Mobile-friendly orbit controls
- [ ] Tag-based filtering in the universe

Built with [[Claude Code Notes|Claude Code]]. Maintenance guide: [[How to grow this brain]].
