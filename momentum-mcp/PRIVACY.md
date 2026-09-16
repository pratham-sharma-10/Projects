# Privacy model

Momentum is designed for information that can be personally sensitive: unfinished commitments, relationship context, project notes, and decisions. Privacy is therefore an architectural constraint, not a post-launch setting.

## Default behavior

- **Local-first:** data is stored in a SQLite database under `~/.momentum-mcp/` by default.
- **Outside the repository:** Momentum refuses to place its database inside the current Git worktree unless the explicit development escape hatch is enabled.
- **No telemetry:** the core server makes no analytics or telemetry calls.
- **No model API:** Momentum does not send data to an LLM provider itself. The MCP host decides what context it requests and where that host sends it.
- **Metadata-only debug logging:** content fields are never written by Momentum's debug logger.
- **Data minimization:** tools are intentionally scoped so an AI can request project/person-specific context rather than reading the full database.

## What is public

The repository contains source code, documentation, tests, and **fictional demo data only**. Do not put real resumes, contact lists, exports, messages, databases, API keys, or private notes in the repository.

## Important MCP boundary

Local-first storage does **not** mean the content never leaves your computer. When an MCP client calls a Momentum tool, that returned context becomes available to that client. Review the privacy policy and data controls of the MCP host you connect to.

## Repository guardrails

- private database file patterns are gitignored;
- `npm run privacy-check` rejects common secret patterns and private database/key files;
- CI runs only against in-memory and fictional data;
- `.env` is ignored while `.env.example` remains public;
- the public demo uses fictional people, companies, and projects.

## Threat assumptions

Momentum v0.1 is intended for a trusted single-user machine. It does not yet provide encrypted-at-rest database storage, multi-user authorization, remote-server authentication, or sandboxing against a malicious local process. See `SECURITY.md` and the roadmap before using it for highly sensitive material.
