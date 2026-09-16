# Momentum MCP — product & engineering case study

## 1. The observation

My work rarely fails because I cannot create another task. The recurring cost is **reconstructing context**: what changed, what I promised, who owes me a response, why a decision was made, and where a project was left.

Those details are usually fragmented across chats, notes, calendars, documents, and my own memory. A traditional task manager can tell me that something is due, but it often cannot tell an AI assistant enough about **why the task exists and what happened before it**.

## 2. Problem statement

> Knowledge workers lose momentum when unfinished work and relationship context are fragmented across tools. Each AI conversation can reason well in the moment, but without a durable continuity layer it repeatedly has to reconstruct the user's state.

## 3. Product hypothesis

If an AI assistant can safely retrieve a small set of durable primitives — **context, open loops, decisions, projects, and people** — it can answer high-value continuity questions without requiring the user to re-explain everything.

## 4. Why MCP

I did not want to build another standalone chatbot. MCP lets the product sit underneath multiple AI clients. Momentum becomes the durable state/tool layer; the user's preferred MCP-compatible AI remains the reasoning layer.

That separation is important because the valuable asset is not one model's chat history. It is the user's structured, portable continuity.

## 5. Why local-first

The data can include relationship notes and unfinished commitments. I therefore made privacy a product requirement before writing features:

- real data defaults outside the Git repository;
- the core works without a cloud API or account;
- stdio avoids opening a network service;
- no telemetry is enabled;
- logging is metadata-only;
- public examples are fictional;
- a repository privacy scanner catches common mistakes before publishing.

## 6. How I use it

The daily workflow is intentionally conversational.

**Morning**

> "Give me my Momentum brief. What needs my attention today?"

The AI calls `get_daily_brief` and can summarize unresolved priorities, overdue items, external dependencies, stale projects, and relationships that may need a follow-up.

**During work**

> "Alex said the team will respond next week. Save that and remind my future self what I'm waiting on."

The host can call `capture_context` and `create_open_loop`.

**Returning to a project**

> "Where did I leave the portfolio refresh?"

The AI calls `get_context(project=...)` and receives recent updates, unresolved loops, and decisions.

**After a decision**

> "We chose local SQLite because we don't want cloud dependencies in v0.1. Record that decision and rationale."

The AI calls `record_decision`.

## 7. How I proceeded

### Step 1 — observed repeated behavior
I looked for a problem that appeared across job search, networking, projects, and community work rather than a one-off workflow.

### Step 2 — chose the durable primitives
Instead of modeling every productivity concept, I reduced the system to five primitives: context, open loops, decisions, projects, and people.

### Step 3 — separated reasoning from state
I decided the MCP client should provide intelligence. Momentum should provide trustworthy state and bounded actions.

### Step 4 — designed privacy before integrations
I intentionally postponed Gmail, calendars, CRMs, and other cloud connections. v0.1 proves the local continuity model first.

### Step 5 — created narrow MCP tools
Each tool answers a recognizable user question and minimizes unnecessary context exposure.

### Step 6 — built a local persistence layer
SQLite keeps the project easy to install, query, back up, and move between machines.

### Step 7 — added guardrails and tests
The repo blocks in-repository private storage by default, uses fictional fixtures, scans for common secrets, and tests core continuity behaviors.

### Step 8 — documented tradeoffs
The first release deliberately favors a local single-user workflow. Remote sync, automatic extraction from email/calendar, encrypted storage, and richer ranking can be added after the core behavior proves useful.

## 8. What is technically interesting

The hard part is not calling an LLM. The interesting engineering/product questions are:

- What information deserves to become durable state?
- How do you represent an unresolved dependency differently from a normal task?
- How much personal context should a tool return?
- How do you avoid duplicating people and projects?
- When does an old project become "stale"?
- How do you make privacy enforceable rather than aspirational?
- How do you preserve model portability?

## 9. What I would measure

For real usage, I would track local, opt-in/product-side metrics such as:

- percentage of open loops eventually resolved;
- number of "where did I leave this?" retrievals that result in a next action;
- average time from an expected external response to follow-up;
- weekly active projects with captured context;
- user-rated usefulness of the daily brief.

I would not collect private content as product analytics by default.

## 10. Roadmap

- natural-language capture helper without storing an embedded LLM key;
- optional calendar/email connectors with explicit permissions;
- encrypted backups;
- better relevance ranking and recency scoring;
- conflict/deduplication tools;
- portable export/import format;
- optional Streamable HTTP mode with authentication for advanced users.
