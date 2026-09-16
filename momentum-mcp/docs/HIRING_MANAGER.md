# Momentum MCP — 2-minute hiring-manager brief

## What I built

Momentum MCP is a local-first Model Context Protocol server that gives AI assistants durable continuity across **unfinished commitments, project context, decisions, people, and follow-ups**.

It is not another chatbot and not another to-do list. The AI client provides reasoning; Momentum provides trusted, structured state through MCP tools.

## Why I built it

I noticed a repeated productivity problem: when I switched between projects, conversations, and priorities, I spent time reconstructing where I had left off. Existing task systems captured *what to do*, but not always the relationship and decision context around the work.

That led to the product question:

> What is the smallest durable state an AI needs to help someone continue work across conversations without storing everything?

## Why MCP

MCP makes the continuity layer portable across compatible AI clients. I can change the AI host without rewriting the underlying productivity system or moving the core data model into one model provider.

## How I use it

My normal interaction is conversational:

- "What am I waiting on?"
- "Where did I leave this project?"
- "What should I follow up on today?"
- "Record this decision and why we made it."
- "Give me my daily Momentum brief."

The AI chooses a narrow Momentum tool instead of receiving the entire personal database.

## Technical choices

- MCP TypeScript SDK v2
- local SQLite persistence
- stdio transport for a local single-user threat model
- Zod validation at tool boundaries
- prepared SQL statements
- repository-level privacy scan
- database-location guard that rejects private state inside the Git worktree
- fictional demo fixtures and in-memory tests
- no telemetry and no embedded LLM API

## What I deliberately did not build yet

I postponed email/calendar ingestion, hosted sync, and remote HTTP access. Those features are useful, but they materially change authentication, privacy, and consent requirements. The first release tests whether the continuity primitives are useful before expanding the trust boundary.

## What I learned

The interesting part of agentic software is often not the model call. It is **state design, tool boundaries, permissions, context minimization, stale information, and user control**. Momentum is an experiment in making those choices explicit.

For the longer product + engineering narrative, see [`CASE_STUDY.md`](CASE_STUDY.md).
