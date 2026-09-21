# Momentum MCP

**Your AI remembers where you left off.**

Built by Pratham Sharma

Momentum MCP is a local-first productivity layer that helps AI assistants remember the context around unfinished work. It keeps track of open loops, project context, people, and decisions so that an AI can help someone continue where they left off instead of starting from zero every time.

## Why I built it

I did not start with the idea of building an MCP server. I started with a problem I kept running into in my own work.

Creating tasks was easy. Remembering the full context around those tasks was not.

A follow-up might be in one note, a decision in another conversation, and the reason behind a project choice somewhere else. When I returned to a project after a few days, I often had to reconstruct what happened, what I was waiting on, and what I had already decided before I could make progress again.

That made me realize the real problem was not task creation. It was **continuity**.

I wanted a simple way for an AI assistant to understand where I had left off without depending on one chat history or requiring all of my personal work context to live in another cloud service.

## The problem

Most productivity tools are good at storing individual pieces of information. Task managers store tasks. Notes apps store notes. Chatbots store conversations. Calendars store events.

The problem is that real work happens across all of them.

A task such as "follow up with Alex" is useful, but it does not explain who Alex is, what was discussed, what response is expected, which project it belongs to, or what decision depends on that response.

AI assistants are good at reasoning inside a conversation, but they are less useful when the important state is scattered across tools or locked inside old chats.

Momentum is designed to preserve the small amount of structured context that is useful when someone returns to work later.

## The solution

Momentum stores five simple types of information: **projects, people, context, open loops, and decisions**.

That allows it to answer practical questions such as:

- What should I focus on today?
- What am I waiting on?
- Where did I leave this project?
- What commitments are still unresolved?
- What did I decide, and why?
- What context do I have around this person or project?

The goal is not to make the system think for the user. The goal is to give an AI assistant better, more reliable state so that its reasoning starts from the right context.

## How it works

Momentum has two interfaces.

The first is a local command-line interface. Someone can use commands such as `momentum brief`, `momentum waiting`, `momentum search`, and `momentum context` without connecting an AI client at all.

The second is the MCP server. An MCP-compatible AI client can call Momentum's tools to retrieve or update structured context. For example, the AI can ask Momentum for unresolved work, fetch the context for a project, or record a decision and its rationale.

The architecture is intentionally simple:

**AI client or local CLI -> Momentum service -> local SQLite database**

The AI is responsible for reasoning. Momentum is responsible for storing and retrieving trustworthy state.

## Use cases

A few examples of where Momentum is useful:

- **Daily planning:** generate a brief of current priorities, overdue items, and unresolved work.
- **External dependencies:** track things that are waiting on another person or event instead of treating everything like a normal task.
- **Returning to a project:** recover recent context, open loops, and decisions after being away from the work.
- **Decision memory:** keep not only what was decided, but why it was decided.
- **Relationship follow-ups:** connect a person to a conversation, project, or unresolved follow-up.
- **Search:** find related tasks, notes, and decisions without remembering where they were originally stored.

## Why I chose MCP

I could have built Momentum as another standalone productivity app, but MCP made the project more interesting because it lets me separate the **reasoning layer** from the **state layer**.

Momentum owns the state. The AI client owns the reasoning.

That means the same Momentum data can work underneath different MCP-compatible AI clients instead of being tied to one chatbot or one model.

It also lets me expose narrow tools such as "get waiting items," "get project context," or "record a decision" rather than giving an AI unrestricted access to an entire database.

This makes the product more portable and gives me clearer control over what information an AI can request.

## Tech stack

Momentum is built with:

- **TypeScript** for the server, CLI, tests, and tooling.
- **Node.js 24** as the runtime.
- **Model Context Protocol (MCP)** for communication between compatible AI clients and Momentum.
- **SQLite** for lightweight local persistence.
- **Zod** for validating tool inputs.
- **GitHub Actions** for continuous integration, including build, test, and privacy checks.
- **Git and GitHub** for version control and public distribution.

The project also includes automated tests, fictional demo data, documentation, and privacy checks.

## Privacy by design

Because Momentum can contain personal work context, privacy was part of the architecture from the beginning.

Real user data is stored locally in a SQLite database outside the Git repository. The public repository contains source code, tests, documentation, and fictional demo data only.

The core project does not require an LLM API key, does not include telemetry, and does not need a cloud account to function.

It also includes guardrails that prevent private Momentum data from being stored inside the repository by default, along with a privacy-check script that looks for common secret patterns and private database or key files before publishing.

An important boundary is that an MCP client can still receive the context it requests, so the privacy settings of the AI client also matter. Momentum keeps storage local, but it does not pretend that tool results are invisible to the client using them.

## What I learned building it

The most useful part of this project was seeing how technical choices affect the product story.

Questions such as what context an AI needs, what it should be allowed to access, how much information a tool should return, and where user data should live are not only engineering questions. They directly influence trust, adoption, positioning, and the value a user experiences.

That is why the clearest way I describe Momentum is not "an MCP server for productivity."

It is:

> **Your AI remembers where you left off.**

## Current status

Momentum is currently a local, single-user MVP with a working MCP server, local CLI, SQLite persistence, privacy guardrails, automated tests, and a public demo using fictional data.

The next areas I would explore are better relevance ranking, deduplication, optional calendar and email integrations with clear permission boundaries, encrypted backup and export, and a lightweight visual interface for people who do not want to work in the terminal.

The project is deliberately small. The goal was to prove the continuity model first: preserve useful context, keep the user in control of it, and make that context available to AI tools in a structured way.
