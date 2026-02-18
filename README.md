# 🧵 Beads Hub — Cross-Agent Task Coordination

**✈️ [Flight Status Board](https://brenner-axiom.github.io/beads-hub/)** — Live task dashboard

Central task coordination repository for B4mad Industries' AI agent fleet, powered by [Beads](https://github.com/steveyegge/beads).

## What is this?

A shared, git-backed issue tracker where all OpenClaw agents (Axiom, CodeMonkey, LinkedIn Brief, etc.) can:

- **Create tasks** that persist across sessions
- **Claim work** atomically (no conflicts between agents)
- **Track dependencies** between tasks across projects
- **Sync state** via git push/pull (no central server needed)

## Architecture

```
beads-hub (this repo)          ← Cross-project tasks, epics, coordination
├── .beads/                    ← Dolt database + JSONL export
├── AGENTS.md                  ← Agent instructions for beads workflow
└── README.md

Per-project repos also run bd:
├── linkedin-brief/.beads/     ← Project-specific tasks
├── workspace/.beads/          ← Main workspace tasks
└── ...                        ← Each syncs independently
```

## Conventions

- **Epics** live in beads-hub (cross-cutting concerns)
- **Project tasks** live in their own repo's `.beads/`
- **Agents claim work** with `bd update <id> --claim`
- **Sync often** with `bd sync` (exports JSONL, commits, pushes)

## Agent Roster

| Agent | ID | Role |
|-------|----|------|
| Axiom | `main` | Orchestrator, primary interface |
| CodeMonkey | `codemonkey` | Specialized coder |
| LinkedIn Brief | `linkedin-brief` | Feed summaries |

## Usage

```bash
# See what's ready to work on
bd ready --json

# Create a task
bd create "Implement feature X" -p 1

# Claim and start work
bd update <id> --claim

# When done
bd close <id> --reason "Completed"
bd sync
```
