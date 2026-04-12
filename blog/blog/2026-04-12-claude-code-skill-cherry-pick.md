---
title: "Everything Claude Code — Comprehensive Skill Review & Integration Strategy"
authors: [jaxvn]
date: 2026-04-12
tags: [claude-code, skills, automation, integration, tools]
source: "[[note-2026-04-04-everything-claude-code]]"
---

> Based on exploring the comprehensive Everything Claude Code repository — 156 skills, 72 commands, 38 agents. This guide covers how to cherry-pick tools without installing the full package.

## Repository Overview

The Everything Claude Code repository is an Anthropic Hackathon winner containing 156 reusable skills across multiple AI platforms.

**Scope:** 156 skills | 72 commands | 38 agents | 12+ hooks

**Target platforms:** Claude Code (primary), Cursor, Codex, Gemini

## Claude Code-Only vs Shared Access

### Claude Code-Only Components

These features exist in `~/.claude/` and are not accessible to other AI environments:

- `~/.claude/skills/` — workflow definitions and automation scripts
- `~/.claude/commands/` — slash command shims and integrations
- `~/.claude/agents/` — subagent configurations
- `settings.json` hooks — system event handlers

### Shared Components (Multi-AI)

These can be accessed by Antigravity Agent, Gemini, or other tools:

- `rules/common/*.md` — security and style guidelines
- `mcp-configs/` — JSON Model Context Protocol server configurations

## Critical Hook Dependency Issue

A major finding: **~90% of hooks depend on `${CLAUDE_PLUGIN_ROOT}/scripts/hooks/*.js`**

This means:
- You cannot cherry-pick individual hooks
- To use the full hooks system, you must run `install.ps1 --profile full` (complete installation)
- Only simple hooks like `block-no-verify` work standalone

**Implication:** If you want selective skill cherry-picking without the full installation overhead, focus on skills and commands first.

## Recommended Cherry-Pick Strategy

For a tech stack focused on **JavaScript / React / Cloudflare / PowerShell**, here's what to cherry-pick:

### Priority 1: Skills → `~/.claude/skills/`

| Skill | Purpose | Use Case |
|-------|---------|----------|
| `security-review` | Auth endpoint analysis, API key validation | pcs-platform phase 2a–2c security audits |
| `mcp-server-patterns` | MCP protocol implementation patterns | Building phase 2b MCP workers |
| `api-design` | REST API conventions and best practices | pcs-platform API endpoint design |
| `frontend-patterns` | React and Docusaurus component patterns | jaxvn-blog UI development |
| `deployment-patterns` | Cloudflare Workers and Pages deployment | Automating pcs.io.vn deployments |
| `database-migrations` | D1 SQLite migration strategies | pcs-data schema versioning |
| `git-workflow` | Branch strategy and commit conventions | Maintaining jaxvn-blog + pcs-platform repos |

### Priority 2: Commands → `~/.claude/commands/`

| Command | Purpose |
|---------|---------|
| `code-review.md` | Pre-push code review checklist |
| `security-scan.md` | Authentication code security audit |
| `build-fix.md` | Docusaurus build error troubleshooting |
| `plan.md` | Complex feature planning and design docs |

### Priority 3: Agents → `~/.claude/agents/`

| Agent | Purpose |
|-------|---------|
| `code-reviewer.md` | Delegate detailed code reviews |
| `security-reviewer.md` | Dedicated security threat modeling |

### Priority 4: Rules → Merge into `CLAUDE.md`

- `rules/common/security.md` — standard security checklist for all code
- `rules/common/coding-style.md` — immutability and file organization patterns

## Installation Command (Selective)

```bash
# Copy skills
cp -r Research/Claudeskill/skills/security-review ~/.claude/skills/
cp -r Research/Claudeskill/skills/mcp-server-patterns ~/.claude/skills/
cp -r Research/Claudeskill/skills/api-design ~/.claude/skills/
cp -r Research/Claudeskill/skills/frontend-patterns ~/.claude/skills/
cp -r Research/Claudeskill/skills/deployment-patterns ~/.claude/skills/
cp -r Research/Claudeskill/skills/database-migrations ~/.claude/skills/
cp -r Research/Claudeskill/skills/git-workflow ~/.claude/skills/

# Copy commands
cp Research/Claudeskill/commands/code-review.md ~/.claude/commands/
cp Research/Claudeskill/commands/security-scan.md ~/.claude/commands/
cp Research/Claudeskill/commands/build-fix.md ~/.claude/commands/
cp Research/Claudeskill/commands/plan.md ~/.claude/commands/

# Copy agents
cp -r Research/Claudeskill/agents/code-reviewer ~/.claude/agents/
cp -r Research/Claudeskill/agents/security-reviewer ~/.claude/agents/

# Copy and merge rules
cp Research/Claudeskill/rules/common/security.md ~/.claude/docs/SECURITY.md
cp Research/Claudeskill/rules/common/coding-style.md ~/.claude/docs/STYLE.md
```

## What to Skip

**Language-specific skills** (if not in your stack):
- All Python, Java, Kotlin, Swift, Android skills
- Rust, PHP, Perl modules
- Language-specific build and test commands

**Complex orchestration** (too heavy for solo operators):
- Full hooks system (requires Node.js runtime + complete installation)
- Agent harness orchestration (intended for team workflows)

## Key Learnings

1. **Hooks require full installation** — cherry-pick skills instead
2. **Security and API design** should be top priority for pcs-platform work
3. **Docusaurus patterns** are essential for jaxvn-blog maintenance
4. **Git workflow rules** should be merged into project CLAUDE.md

## Related Notes

- [[guide-2026-04-04-cloudflare-auth-worker]] — pcs-platform Phase 2a implementation
- [[2026-04-03]] — daily notes from initial pcs-auth Worker build
- [[note-2026-04-04-everything-claude-code]] — vault original (Vietnamese)

---

**Status:** ✅ Published 2026-04-12 | Integration planned for Phase 2g
