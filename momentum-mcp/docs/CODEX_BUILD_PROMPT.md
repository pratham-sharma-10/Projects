# Codex continuation prompt

Use this prompt when asking Codex to continue developing the repository.

---

You are working on **Momentum MCP**, a privacy-first local Model Context Protocol server. Before changing code, read `README.md`, `PRIVACY.md`, `SECURITY.md`, `docs/ARCHITECTURE.md`, and `docs/CASE_STUDY.md`.

Non-negotiable constraints:

1. Real user data must never be required inside the Git repository.
2. The default database must remain local and outside the repo.
3. Do not add telemetry or external API calls to the core server.
4. Examples/tests must use fictional data only.
5. MCP tools should return the minimum context needed for their job.
6. Never log note bodies, names, decision text, or other user content.
7. Preserve stdio as the default local transport.
8. Any cloud integration must be optional and document exactly what leaves the machine.

Before finishing any change, run:

```bash
npm run privacy-check
npm test
npm run build
```

Then summarize:
- what changed;
- why it improves the user workflow;
- privacy/security implications;
- tests added or changed;
- remaining tradeoffs.

If a request conflicts with the privacy model, propose a safer design rather than silently weakening the guardrail.
