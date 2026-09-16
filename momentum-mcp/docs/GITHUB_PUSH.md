# Push the prepared branch to GitHub

This working repository was prepared on the branch:

```text
feature/momentum-mcp-v0.1.1
```

## If you downloaded the ZIP

The ZIP contains the working tree but not Git history. Create a new GitHub repository, then:

```bash
cd momentum-mcp
git init
git checkout -b feature/momentum-mcp-v0.1.1
git add .
git commit -m "feat: launch Momentum MCP v0.1"
git remote add origin git@github.com:YOUR_USERNAME/momentum-mcp.git
git push -u origin feature/momentum-mcp-v0.1.1
```

## If you downloaded the Git bundle

The bundle preserves the prepared commits and branch.

```bash
git clone momentum-mcp-feature-v0.1.bundle momentum-mcp
cd momentum-mcp
git switch feature/momentum-mcp-v0.1.1
git remote remove origin
git remote add origin git@github.com:YOUR_USERNAME/momentum-mcp.git
git push -u origin feature/momentum-mcp-v0.1.1
```

Then open a pull request into `main` when you are ready to publish.

## Before making the repository public

Run the checklist in `docs/PUBLICATION_CHECKLIST.md`. In particular, install dependencies and run:

```bash
npm run check
```

Do not push your real `~/.momentum-mcp/momentum.db` or any exported personal data.
