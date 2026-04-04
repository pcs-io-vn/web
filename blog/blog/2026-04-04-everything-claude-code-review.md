---
slug: everything-claude-code-review
title: "Everything Claude Code: What's Worth Taking (And What Isn't)"
# vault: Obsidian/04_lessons/note-2026-04-04-everything-claude-code.md
authors: [jaxvn]
tags: [claude, ai-tools, productivity, developer-tools]
date: 2026-04-04
---

[Everything Claude Code](https://github.com/affaan-m/everything-claude-code) is an Anthropic Hackathon-winning repo with 50K+ stars. It ships 156 skills, 72 commands, 38 agents, and a full hooks system for Claude Code. Here's my honest breakdown after auditing it for my own stack.

<!-- truncate -->

## What's Actually In Here

The repo is structured around four core components:

| Component | Count | What it does |
|-----------|-------|--------------|
| `skills/` | 156 | Workflow definitions — domain knowledge bundled into reusable prompts |
| `commands/` | 72 | Slash command shims (mostly `/tdd`, `/plan`, `/code-review`, etc.) |
| `agents/` | 38 | Subagent configs for delegating specific tasks |
| `hooks/` | 12+ | Lifecycle automations (PreToolUse, Stop, SessionStart, etc.) |

Plus language-specific rules for TypeScript, Python, Go, Java, Kotlin, Swift, C++, Rust, Perl, PHP, and more.

## Claude-Only vs Cross-Agent

The first thing to understand: most of this is Claude Code-specific.

**Claude Code only:**
- `~/.claude/skills/` — only Claude Code reads these
- `~/.claude/commands/` — slash command definitions
- `~/.claude/agents/` — subagent configs
- Hooks in `settings.json` — lifecycle events Claude Code fires

**Cross-agent (works with Gemini, Cursor, etc.):**
- `rules/common/*.md` — security and style guidelines any AI can follow
- `mcp-configs/` — MCP server JSON configs, client-agnostic
- Any rule content you paste into a shared CLAUDE.md / AGENTS.md

If you run multiple AI environments (I use Claude Code + Antigravity/Gemini), the rules folder is the most transferable investment.

## The Hooks Problem

The hooks look powerful on paper:

```json
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [{ "type": "command", "command": "npx block-no-verify@1.1.2" }],
      "description": "Block --no-verify on git commits"
    }
  ]
}
```

But 90% of them reference `${CLAUDE_PLUGIN_ROOT}/scripts/hooks/*.js` — Node.js scripts that only exist inside the installed plugin. You cannot cherry-pick the hooks JSON without installing the full package.

The simpler hooks (like `block-no-verify`) work standalone. The rest require `install.ps1 --profile full`.

## What I Actually Kept (Cloudflare/React Stack)

My stack is JavaScript, React/Docusaurus, and Cloudflare Workers — not Python or Java. Out of 156 skills, about 8 are directly relevant:

**Skills worth keeping:**

| Skill | Why |
|-------|-----|
| `security-review` | Auth endpoints, API keys, worker security |
| `mcp-server-patterns` | Building MCP servers on Cloudflare Workers |
| `api-design` | REST conventions for multi-tenant APIs |
| `frontend-patterns` | React component patterns |
| `deployment-patterns` | Cloudflare Pages/Workers deploy flow |
| `database-migrations` | D1 schema management |
| `git-workflow` | Branch strategy and commit conventions |

**Commands worth keeping:**

| Command | Why |
|---------|-----|
| `/code-review` | Pre-push quality check |
| `/security-scan` | Before deploying auth code |
| `/build-fix` | When Docusaurus build breaks |
| `/plan` | Implementation planning on complex features |

**Agents worth keeping:**

| Agent | Why |
|-------|-----|
| `code-reviewer.md` | Delegate review to subagent |
| `security-reviewer.md` | Dedicated security analysis |

**Rules worth merging into CLAUDE.md:**
- `rules/common/security.md` — solid baseline checklist
- `rules/common/coding-style.md` — immutability, file organization

## What I Skipped

- All Python, Java, Kotlin, Swift, Android, Rust, PHP, Perl skills (not my stack)
- The full hooks system (requires Node.js environment + full install)
- Agent harness orchestration (overkill for a solo operator)

## How to Install Selectively

The repo ships `install.ps1` / `install.sh` with `--profile full` or per-language flags:

```powershell
# Install only what you need
.\install.ps1 typescript     # TypeScript rules only
.\install.ps1 --profile full  # Everything (156 skills, all rules)
```

For a selective cherry-pick without the installer:

```bash
# Copy only the skills you want
cp -r skills/security-review ~/.claude/skills/
cp -r skills/mcp-server-patterns ~/.claude/skills/
cp -r skills/api-design ~/.claude/skills/

# Copy useful commands
cp commands/code-review.md ~/.claude/commands/
cp commands/security-scan.md ~/.claude/commands/

# Copy common rules
cp rules/common/security.md ~/.claude/rules/
```

## Bottom Line

ECC is genuinely useful — but it's built for polyglot teams shipping TypeScript, Python, Go, Java, and Kotlin simultaneously. If your stack is narrower, install selectively.

The two things worth having regardless of stack:

1. **`rules/common/security.md`** — every project benefits from this checklist
2. **`skills/security-review/`** — activates automatically when you touch auth code

Everything else: read the skill, decide if it matches your actual workflow, copy only what you'll actually invoke.

---

*Stack: Cloudflare Workers + D1, Docusaurus 3.7, React 18, PowerShell. Running Claude Code (Pro) as primary coding environment.*
