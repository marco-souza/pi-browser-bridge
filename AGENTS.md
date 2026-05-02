# AGENTS.md — pi-browser-bridge

Bridge between the pi coding agent and the browser, enabling browser-based interactions and automation.

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | [Bun](https://bun.com) v1.3+ |
| Language | TypeScript (strict mode) |
| Package manager | Bun |

## Common Commands

```bash
bun install        # Install dependencies
bun run index.ts   # Run the project
```

## Project Structure

```
.
├── index.ts            # Entry point
├── package.json
├── tsconfig.json       # TypeScript config (ESNext target, bundler mode)
├── bun.lock
├── docs/               # Documentation
├── .agents/            # Agent skills (shared from workspace)
│   ├── skills/         # Reusable skill definitions
│   └── rules/          # Agent rules
└── node_modules/
```

## Conventions

- **Module system**: ESM (`"type": "module"`)
- **TypeScript**: strict mode, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`
- **Types**: Bun types included (`@types/bun`)
- **Formatting/Linting**: TBD
- **Testing**: TBD

## Skills

This project inherits agent skills from the workspace `.agents/skills/` directory:

| Skill | Purpose |
|-------|---------|
| `brainstorm` | Structured ideation sessions |
| `create-prd` | Write Product Requirements Documents |
| `explore` | Research and explore codebases |
| `git-commit-formatter` | Format commit messages |
| `grill-me` | Clarify ambiguous requests |
| `implement-tasks` | Execute task plans |
| `markdown-format` | Format and lint Markdown |
| `mixture-of-experts` | Multi-agent analysis |
| `pr-review` | Review GitHub pull requests |
| `prd-to-tasks` | Convert PRDs to task plans |
| `project-files` | Manage PLAN/TODO/SPEC files |
| `subagent-tmux` | Delegate to tmux sub-agents |
| `terminal-multiplexer` | Manage tmux sessions |
