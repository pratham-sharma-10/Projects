# Contributing

Contributions are welcome. The project is intentionally small and privacy-first.

## Principles

- Keep the core local-first and useful without a cloud account.
- Prefer narrow MCP tools over a single tool that dumps all personal context.
- Do not add telemetry by default.
- Tests and examples must use fictional data only.
- New integrations should document what data leaves the machine.

## Development

```bash
npm install
npm test
npm run privacy-check
npm run build
```

For feature work, add or update tests and explain privacy implications in the pull request.
