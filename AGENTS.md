# AGENTS.md — Beads Hub

This is the cross-agent task coordination repo for B4mad Industries.

## Before You Start

```bash
git pull --rebase
```

## Workflow

1. `bd ready --json` — see available tasks
2. `bd update <id> --claim` — claim a task (atomic, prevents conflicts)
3. Do the work
4. `bd close <id> --reason "Completed: summary"` 
5. `bd sync` — push changes

## Creating Tasks

```bash
bd create "Title" -p <priority> --json
# Assign to a specific agent:
bd create "Title" -p 2 --assign axiom --json
bd create "Title" -p 1 --assign codemonkey --json
```

## Rules

- Always use `--json` for output
- Always `bd sync` after changes
- Claim before working
- Include bead ID in git commits: `git commit -m "Fix X (bd-abc)"`
- Don't use `bd edit` (requires interactive editor)
