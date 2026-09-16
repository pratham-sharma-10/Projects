# Security

## Supported model

Momentum MCP v0.1 is a **local, single-user MCP server over stdio**. It is not designed to be exposed directly to the public internet.

## Safe defaults

1. Real data lives outside the Git repository.
2. The server uses stdio rather than opening a network port.
3. No telemetry or third-party API is required.
4. SQLite foreign keys are enabled and all variable SQL inputs use prepared statements.
5. Tool inputs are validated with Zod at the MCP boundary.
6. Debug logs permit only a small metadata allowlist.

## Before publishing a fork

Run:

```bash
npm run privacy-check
```

Then inspect:

```bash
git status
git diff --cached
```

Never commit real databases, private exports, credentials, or copied conversation histories.

## Reporting a vulnerability

Open a GitHub security advisory rather than posting sensitive exploit details in a public issue.
