# Architecture

## Design goal

Momentum gives an AI assistant **continuity** without turning the MCP server itself into another AI product. The MCP host handles reasoning; Momentum handles trusted state, retrieval, and small state-changing actions.

```text
AI host (ChatGPT / Claude / Codex / Cursor / VS Code / other MCP client)
                              |
                              | MCP over stdio
                              v
                       Momentum MCP
                   tools + resources
                              |
                              v
                    Local SQLite store
                 ~/.momentum-mcp/momentum.db
```

## Why MCP

Without MCP, each assistant or agent would need its own custom integration to a user's productivity state. MCP gives Momentum a standardized boundary: the same local server can be used by different MCP-compatible hosts.

## Data model

Momentum intentionally separates four concepts:

- **Context items:** notes, interactions, and updates.
- **Open loops:** unresolved commitments, follow-ups, tasks, and dependencies.
- **Decisions:** what was decided and why.
- **Entities:** projects and people that connect the other records.

This supports questions such as:

- "Where did I leave Project Atlas?"
- "What am I waiting on?"
- "What did we decide about the launch?"
- "What should I follow up on today?"

## Tool design

Tools are narrow on purpose. `get_context` can retrieve one project's state without exposing unrelated personal notes. `get_waiting_on` can answer a dependency question without dumping every task. This is both better context engineering and better privacy.

## Transport

v0.1 uses **stdio**. This keeps the server local and avoids networking/authentication complexity. A future remote deployment would require explicit authentication, authorization, tenant isolation, encryption, and a separate threat model.

## AI boundary

Momentum has no embedded LLM and no API-key requirement. This is deliberate:

1. users choose their MCP host/model;
2. the server remains inexpensive and portable;
3. private storage and AI reasoning stay decoupled;
4. replacing an LLM provider does not require migrating Momentum data.
