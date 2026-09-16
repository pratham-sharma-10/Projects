# Sharing Momentum MCP

## One-line repository description

A local-first MCP server that gives AI assistants continuity across commitments, project context, decisions, people, and open loops.

## 30-second hiring-manager pitch

I built Momentum after noticing that the expensive part of switching between projects was not creating tasks; it was reconstructing context. I wanted an AI assistant to remember what I was waiting on, where I left a project, and why a decision was made without dumping all of my personal information into another hosted app. Momentum is a local-first MCP server that stores that durable state in SQLite and exposes it through narrow tools. The AI client handles reasoning, while Momentum handles trusted state, retrieval, and actions. I also designed the public repo so real user data never needs to live in Git.

## Interview deep-dive prompts

If someone asks **"Why MCP?"**:

> I wanted the state layer to be portable across AI clients. MCP gives me a standard tool boundary, so the user's continuity is not tied to one model provider or one chat interface.

If someone asks **"What was the hardest design choice?"**:

> Deciding what *not* to persist. I intentionally model a small set of durable primitives — context, open loops, decisions, projects, and people — instead of storing entire chat histories. That keeps retrieval useful and reduces the privacy surface.

If someone asks **"Why local-first?"**:

> The data can include private relationship and project context. I wanted privacy to be enforced by architecture, so the core uses local SQLite, stdio, no telemetry, no embedded LLM API, and a guard that refuses to put the real database inside the Git worktree.

If someone asks **"What would you build next?"**:

> I would validate the daily brief and context-recovery workflows first, then add opt-in integrations such as calendar or email with explicit permissions. Remote sync would come later because it changes the authentication and threat model substantially.

## LinkedIn draft

I built my own MCP server — **Momentum MCP**.

**Why should PMMs care? Because MCP is changing how AI products access context, use tools, and deliver value — and that directly shapes positioning, trust, and adoption.**

The problem I wanted to solve was simple: tasks are easy to track, but **context gets lost**.

Momentum helps AI remember:

- what I’m working on
- what I’m waiting on
- what decisions were made
- why they were made

Building it pushed me beyond generic “AI-powered” messaging and into the real product questions: what context does AI need, what actions should it take, and how do privacy and trust shape the user experience?

Built with TypeScript, Node.js, SQLite, and MCP.

*Sample local demo data shown below — no personal data is exposed.*

#ProductMarketing #MCP #AI #BuildInPublic

## Suggested GitHub topics

`mcp` · `model-context-protocol` · `ai-agents` · `local-first` · `productivity` · `sqlite` · `context-engineering`
