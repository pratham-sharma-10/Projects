# Public GitHub publication checklist

Before making the repository public:

- [ ] Run `npm run privacy-check`.
- [ ] Run `npm test`.
- [ ] Run `npm run build` after installing dependencies.
- [ ] Run `git status` and inspect every untracked file.
- [ ] Inspect `git log --stat` for accidentally committed private files.
- [ ] Confirm there is no `.env`, database, export, resume, contact list, or chat history in Git history.
- [ ] Search the repository for your name, personal email, phone number, home address, and private company/contact names.
- [ ] Keep real `MOMENTUM_HOME` outside the repository.
- [ ] Record the public demo using the fictional seed only.
- [ ] Add a repository description such as: `A local-first MCP server for commitments, decisions, project context, and open loops.`
- [ ] Add topics: `mcp`, `model-context-protocol`, `local-first`, `productivity`, `sqlite`, `ai-agents`.

If a secret or personal file was ever committed, deleting it from the latest commit is not enough; rewrite the Git history or start from a clean repository before publishing.
