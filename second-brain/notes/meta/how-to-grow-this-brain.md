---
title: How to grow this brain
tags: [meta, guide]
created: 2026-06-12
---

The whole brain is just markdown files in the `notes/` folder.

## Rules of the universe

1. **Folders are constellations.** `notes/ideas/foo.md` puts the star in the
   *ideas* cluster. New folder = new constellation, automatically.
2. **Wikilinks are threads.** Writing `[[Project Ideas]]` anywhere creates a
   line between the two stars. Link by title or by filename.
3. **Frontmatter is optional.** `title`, `tags`, and `created` are read if
   present; otherwise the filename becomes the title.

## Daily workflow

- Have a thought → drop a `.md` file in the right folder
- Link it to whatever it touches: `[[Welcome to prat.brain]]`
- `git add . && git commit -m "brain: new note" && git push`
- The deploy workflow rebuilds the universe

See [[Second Brain App]] for how the app itself works under the hood.
