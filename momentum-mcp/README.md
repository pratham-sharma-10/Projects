# Momentum MCP

**Your AI remembers where you left off.**

Momentum is a **local-first Model Context Protocol (MCP) server** that gives AI assistants structured access to your unfinished commitments, project context, decisions, and relationship follow-ups — without putting your private productivity database in a public repository or requiring another hosted AI service.

> Status: `v0.1.1` — local single-user MVP with MCP + local CLI.

## Hiring manager / recruiter brief

If you are reviewing this project for a role, start here:

- [Hiring Manager Brief](docs/HIRING_MANAGER_BRIEF.md) - short, human-readable overview of why I built it, the problem, use cases, tech stack, product choices, privacy, and what I personally owned.
- [PDF version](docs/Momentum_MCP_Hiring_Manager_Brief.pdf)

## Demo

The repository includes fictional sample data only. The public project contains no personal productivity data. Run `npm run demo:seed` and `npm run demo:brief` for a safe demo.

## The problem

Modern knowledge work is fragmented across chats, notes, calendars, documents, and task managers. The recurring cost is not always creating a task; it is reconstructing **what happened, what is unresolved, who owes what, why a decision was made, and where a project was left**.

AI assistants can reason well inside a conversation, but they often start the next conversation without durable state. Momentum provides that continuity layer.

## What makes this different from a to-do app

A task says:

> Follow up with Alex.

Momentum can preserve:

- who Alex is;
- which project the conversation belongs to;
- what was last discussed;
- what response is expected;
- when it was expected;
- what decision or next action depends on it.

The AI host does the reasoning. Momentum supplies trustworthy state and bounded actions.

## Core questions Momentum can answer

- **What should I focus on today?**
- **What am I waiting on?**
- **Who or what should I follow up on?**
- **Where did I leave this project or conversation?**
- **What commitments are still unresolved?**
- **What did I decide, and why?**

## MCP tools

| Tool | Purpose |
| --- | --- |
| `capture_context` | Save a durable note, interaction, or update |
| `create_open_loop` | Track a commitment, follow-up, task, or dependency |
| `get_open_loops` | Retrieve unresolved work |
| `get_waiting_on` | See what depends on another person/event |
| `resolve_open_loop` | Close a loop without deleting its history |
| `get_context` | Reconstruct context for a project or person |
| `search_context` | Search across durable Momentum state |
| `record_decision` | Save a decision and rationale |
| `get_recent_decisions` | Recover recent project decisions |
| `get_daily_brief` | Surface priorities, overdue work, dependencies, stale projects, and reconnect candidates |

It also exposes two read-only MCP resources: `momentum://guide` and `momentum://stats`.

## Privacy by architecture

```text
Public GitHub repo                     Your machine
------------------                     ------------
source code                            ~/.momentum-mcp/
docs                                   └── momentum.db  ← real data
fictional demo data
     |
     | MCP over local stdio
     v
AI host  <-------------------------->  Momentum MCP
```

Momentum deliberately ships with the following defaults:

- local SQLite storage;
- database outside the repository;
- refusal to initialize private storage inside a Git worktree;
- no telemetry;
- no required cloud account or LLM API key;
- metadata-only debug logging;
- fictional test/demo data;
- repository privacy scanner.

Read [`PRIVACY.md`](PRIVACY.md) before using Momentum with sensitive information. The MCP host you connect can still receive tool results, so its own privacy controls matter too.

## Quick start

### Requirements

- Node.js `24.15+`
- an MCP-compatible host

### Install

```bash
git clone <your-fork-or-repository>
cd momentum-mcp
npm install
npm run build
```

Your real database defaults to:

```text
~/.momentum-mcp/momentum.db
```

Do **not** move it into the repository.

### Start locally

```bash
npm start
```

Momentum uses MCP over stdio, so in normal use your MCP host launches this command for you.

See [`docs/DEMO.md`](docs/DEMO.md) for a fictional demo and generic host configuration.

## Local CLI (no AI client required)

Momentum also ships with a local command-line interface for people who want to use the same private database without giving an AI client access to their computer.

```bash
npm run build
npm link
momentum brief
momentum add "Follow up Friday" --project "Job Search" --priority high
momentum waiting
momentum search "Amazon"
momentum resolve 3
```

The CLI and MCP server both use the same local database at `~/.momentum-mcp/momentum.db`.

## Everyday usage

### Morning continuity

Ask your AI:

> Give me my Momentum brief. Tell me what needs attention, what I'm waiting on, and anything that has gone stale.

The host can call `get_daily_brief`.

### After a conversation

> Jordan said the design review should be ready Friday. Capture that and track it as something I'm waiting on.

The host can call `capture_context` and `create_open_loop`.

### Returning to work

> Where did I leave the Atlas launch?

The host can call `get_context(project="Atlas launch")`.

### Preserve rationale

> Record that we chose local SQLite for v0.1 because privacy and portability are more important than sync right now.

The host can call `record_decision`.

## Public demo without personal data

```bash
npm run demo:seed
npm run demo:brief
```

The seed uses only fictional data and creates the demo database in the operating system's temporary directory.

## Development

```bash
npm run privacy-check
npm test
npm run build
```

Run all checks:

```bash
npm run check
```

## Why PMMs should care

MCP is not only an engineering concept. It changes how AI products access context, use tools, and complete workflows — which directly affects **positioning, trust, adoption, permissions, and the value users actually experience**.

Building Momentum forced me to think beyond generic “AI-powered” messaging and ask product-marketing questions such as:

- What context does the AI need to be useful?
- What actions should it be allowed to take?
- How do privacy and user control affect trust?
- How do you explain agentic behavior without making it sound magical?
- What is the user value beyond the model itself?

## Why this project matters

The project explores a practical agent-design question: **what should persist between AI conversations?** Rather than storing an entire transcript or giving an assistant unrestricted access to personal data, Momentum models a small set of durable primitives and exposes them through narrow MCP tools.

That creates useful engineering tradeoffs around context retrieval, state modeling, tool boundaries, privacy, stale information, and human control — without making the core product dependent on a particular LLM.

For the full product/engineering story, read [`docs/CASE_STUDY.md`](docs/CASE_STUDY.md).

## Repository map

```text
src/
  server.ts       MCP tools + resources
  repository.ts   persistence/query layer
  db.ts           SQLite schema/migrations
  config.ts       local storage + repo-safety guard
  privacy.ts      metadata-only logging
  cli.ts          local CLI over the same private database
scripts/
  privacy-check.ts
  seed-demo.ts
  demo-brief.ts
tests/
examples/
  demo-seed.json  fictional data only
docs/
  ARCHITECTURE.md
  CASE_STUDY.md
  CODEX_BUILD_PROMPT.md
  DEMO.md
```

## Current tradeoffs

v0.1 intentionally does **not** include automatic Gmail/calendar ingestion, remote sync, multi-user accounts, or an embedded model. These are attractive features, but each materially changes the privacy and authorization model. The first release proves the continuity primitives before adding integrations.

## License

MIT
