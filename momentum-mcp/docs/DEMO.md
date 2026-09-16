# 60-second demo script

The repository includes fictional data so the product can be shown publicly without exposing personal information.

## Setup

```bash
npm install
npm run build
npm run demo:seed
```

The seed script creates a temporary demo database under the operating system's temp directory, not inside the repository.

## Demo flow

Connect your MCP client to the built server and point `MOMENTUM_HOME` at the demo directory printed by `npm run demo:seed`.

Then ask:

1. **"What am I waiting on?"**  
   Expected behavior: the host calls `get_waiting_on`.

2. **"Where did I leave the Portfolio Refresh project?"**  
   Expected behavior: the host calls `get_context` and reconstructs updates, open loops, and decisions.

3. **"Give me my Momentum brief."**  
   Expected behavior: the host calls `get_daily_brief`.

4. **"Mark the portfolio demo video as resolved."**  
   Expected behavior: the host first identifies the loop, then calls `resolve_open_loop`.

## Generic MCP configuration

MCP hosts use different configuration UIs, but a local stdio configuration generally needs a command, arguments, and environment variables similar to:

```json
{
  "mcpServers": {
    "momentum": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/momentum-mcp/dist/src/server.js"],
      "env": {
        "MOMENTUM_HOME": "/YOUR/PRIVATE/LOCAL/DIRECTORY"
      }
    }
  }
}
```

Use a data directory outside the repository. Consult your MCP host's current documentation for its exact configuration format.
