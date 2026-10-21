---
name: frontend-pro
description: Sets up and runs the Claude Code frontend WORKFLOW — the tooling side of frontend work. Wires visual feedback loops (Playwright MCP, Chrome DevTools MCP, Figma MCP), writes CLAUDE.md for frontend repos, configures hooks, slash commands and subagents, runs TDD with visual verification and closed-loop testing, manages context (Document & Clear, git worktrees), and applies framework-specific project wiring (React/Next.js, Vue/Nuxt, Astro, Svelte, Tailwind). Does NOT cover design quality, aesthetics, animation, or design scoring — that is the frontend-super skill.
when_to_use: Setting up a frontend project for Claude Code; "set up frontend project", "frontend workflow", "visual testing loop", "wire Playwright MCP", "connect Chrome DevTools MCP", "Figma MCP", "CLAUDE.md for frontend", visual regression loop, TDD with screenshots, frontend CI / headless automation, "הקם פרויקט פרונטאנד", "חבר Playwright", "לולאת בדיקות ויזואלית", "CLAUDE.md לפרונטאנד". NOT for "build UI", "design this", styling, animation, or design review — use frontend-super for those.
---

# Frontend Pro — Claude Code Frontend Workflow

Own the workflow and tooling side of frontend work with Claude Code: project
setup, MCP wiring, visual feedback loops, testing automation, and context
management.

**Division of labor**: For design quality, aesthetics, animation, and scoring —
use the **frontend-super** skill. This skill gets the loop running; frontend-super
decides what good looks like inside that loop. They compose: frontend-pro wires
Playwright MCP, frontend-super scores the screenshots it captures.

All reference paths below are relative to `${CLAUDE_SKILL_DIR}` — forward slashes always.

## Quick Start Checklist

1. Run `/init` → heavily edit the generated CLAUDE.md (see "Project Setup: CLAUDE.md" below)
2. Wire visual feedback → Playwright MCP or Chrome integration (see "Visual Feedback Loop" below)
3. Use Plan Mode (`Shift+Tab` twice) before complex features
4. Build → verify visually → test → self-review → iterate
5. `/clear` between unrelated tasks; Document & Clear on long sessions

## Visual Feedback Loop

Claude Code cannot see the browser by default. Wire one of these:

| Tool | Best For | Setup |
|------|----------|-------|
| `claude --chrome` | Daily dev, uses your auth sessions | Low |
| Playwright MCP | Automated testing, headless, CI/CD | Medium |
| Chrome DevTools MCP | Live debugging, performance traces, network/console | Medium |
| Figma MCP | Design-to-code from Figma files | Medium |
| Screenshot paste | Quick one-off visual checks | None |

### Playwright MCP (default for testing loops)

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

Headless (CI): add `--headless` to the args in the MCP config (project scope: `.mcp.json`).

Tools arrive as `mcp__playwright__*` (e.g. `mcp__playwright__browser_navigate`,
`mcp__playwright__browser_take_screenshot`).

**Gotcha**: say "use playwright MCP" explicitly the first time, or Claude may run
Playwright via Bash instead of the MCP server.

### Chrome DevTools MCP (default for debugging)

```bash
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest
```

Tools arrive as `mcp__chrome-devtools__*`. Adds what Playwright MCP lacks:
performance traces, network request inspection, CPU/network throttling.
Alternative plugin install: `/plugin marketplace add ChromeDevTools/chrome-devtools-mcp`.

### Chrome Integration (daily interactive dev)

```bash
claude --chrome
```

Requires the "Claude in Chrome" extension. Navigate, click, fill forms, read
console, screenshot, record GIFs — using your real auth sessions. Visible window
only (no headless), Chrome proper only.

### Figma MCP

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

Good for initial generation from designs. Poor at incremental updates — use it
to scaffold, then iterate with Chrome/Playwright.

### Screenshot Paste

Windows: `Win+Shift+S` → `Ctrl+V` in Claude Code. macOS: `Shift+Command+Control+4` → `Control+V`.

Details, tool lists, multi-breakpoint workflows → `${CLAUDE_SKILL_DIR}/references/visual-feedback.md`

## Project Setup: CLAUDE.md

Run `/init` then **heavily edit** the output. Every line costs context tokens.

```markdown
# Project: [Name]

[Framework] [version] with [key integrations]. [One-line description].

## Commands
- `npm run dev`: Dev server (port XXXX)
- `npm run test`: Unit tests
- `npm run test:e2e`: E2E tests
- `npm run lint`: Lint + format check

## Architecture
- `/app` or `/src/pages`: Routes/pages
- `/components/ui`: Reusable UI primitives
- `/lib`: Utilities and shared logic

## Code Style
- [TypeScript strictness level]
- [Import/export conventions]
- [CSS approach: Tailwind/CSS Modules/etc.]

## Important Warnings
- [Auto-generated files: DO NOT EDIT]
- [Environment variables: NEVER commit]
- [Domain terminology if non-obvious]
```

**Include**: exact commands with directories, framework-specific patterns (RSC vs
Client Components), domain terms, MCP usage instructions, generated-file warnings.

**Exclude**: concepts Claude already knows, vague guidance ("write clean code"),
anything pushing the file past ~300 lines.

Use `@imports` (`@docs/api-patterns.md`) to keep the main file lean.
Use `CLAUDE.local.md` (gitignored) for personal preferences.
For the `<frontend_aesthetics>` block to embed in CLAUDE.md, use
frontend-super's `templates/aesthetics-block.md` — do not write your own copy.

Per-framework templates (Next.js, Vite, Astro, SvelteKit, Nuxt, vanilla, monorepo)
→ `${CLAUDE_SKILL_DIR}/references/claude-md-templates.md`

## Development Workflow

### The Build → Verify → Iterate Loop

1. **Plan**: `Shift+Tab` twice for Plan Mode. Claude reads code, plans, makes no edits. `Ctrl+G` to edit the plan.
2. **Build**: approve the plan; Claude implements.
3. **Verify**: screenshots at key breakpoints via the wired visual feedback tool.
4. **Test**: run tests; Claude sees failures and auto-fixes.
5. **Review**: "Review your changes for bugs, security issues, and missed edge cases."
6. **Iterate or Clear**: fix issues, or `/clear` when switching tasks.

### Context Management

`/clear` between unrelated tasks (always), after correcting Claude 2+ times on
the same issue, at ~80% context utilization, or when Claude re-asks settled questions.

Prefer **Document & Clear** over `/compact` (auto-compression is lossy and opaque):

1. "Write your current plan and progress to `PROGRESS.md`"
2. `/clear`
3. "Read `PROGRESS.md` and continue"

Full strategies (subagent isolation, worktrees, degradation signs)
→ `${CLAUDE_SKILL_DIR}/references/context-management.md`

## Testing & Verification

### Closed-Loop Testing

```
Write Code → Run Tests → Claude Sees Results → Auto-Fix → Re-run → Repeat Until Pass
```

Be explicit: "We are doing TDD — do not stub imaginary code."

### Visual Regression Loop

1. Screenshot baselines at 375px / 768px / 1280px (Playwright MCP viewport control)
2. Make changes
3. Re-capture, compare, report visual diffs per breakpoint

### Accessibility & Performance Checks

```bash
npx pa11y http://localhost:3000
```

AccessLint MCP and Lighthouse MCP — add to `.mcp.json` (project scope):

```json
{
  "mcpServers": {
    "accesslint": {"command": "npx", "args": ["-y", "@accesslint/mcp"]},
    "lighthouse": {"command": "npx", "args": ["lighthouse-mcp"]}
  }
}
```

TDD prompts, Playwright test generation, a11y/perf audit workflows
→ `${CLAUDE_SKILL_DIR}/references/testing-verification.md`

## Framework Project Wiring

Claude already knows the frameworks; this covers only Claude Code integration points.

- **React/Next.js**: install Vercel's rules skill `npx add-skill vercel-labs/agent-skills`.
  Priorities: eliminate waterfalls (`Promise.all`), lazy state init, bundle size.
- **Svelte/SvelteKit**: `claude mcp add --transport http --scope project svelte-llm https://svelte-llm.stanislav.garden/mcp/mcp`
  — supplies Svelte 5 runes syntax Claude tends to miss.
- **Tailwind v4**: config lives in `globals.css` via `@theme {}` blocks, not
  `tailwind.config.js`. State the version in CLAUDE.md or Claude writes v3 syntax.

Full patterns (Nuxt auto-imports, Astro islands, responsive pitfalls)
→ `${CLAUDE_SKILL_DIR}/references/framework-tips.md`

## Automation & Multi-Agent

### Subagents

Built-in agent types: general-purpose (all tools), Plan (read-only planning),
Explore (fast read-only search). Custom agents live in `.claude/agents/`:

```markdown
# .claude/agents/code-reviewer.md
---
name: code-reviewer
tools: Read, Grep, Glob, Bash
---
Review for: bugs, security, duplication, missing error handling, test coverage.
Report by priority: Critical → Warning → Suggestion.
```

Chain them: "First use code-analyzer to find issues, then use optimizer to fix them."
Subagents are spawned via the Agent tool with a `subagent_type`.

### Git Worktrees for Parallel Sessions

```bash
git worktree add ../project-feature-a -b feature-a main
cd ../project-feature-a && claude
```

Each worktree gets its own session and context.

### Headless Mode

```bash
claude -p "Review src/components/" --output-format json --allowedTools "Read,Grep"
```

CI/CD recipes, GitHub Actions, batch operations
→ `${CLAUDE_SKILL_DIR}/references/advanced-workflows.md`

### Hooks

Auto-format after every edit — `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|MultiEdit|Write",
      "hooks": [{"type": "command", "command": "prettier --write $CLAUDE_FILE_PATHS"}]
    }]
  }
}
```

Test hooks carefully — noisy hooks can consume excessive tokens via system reminders.

Proven prompts, slash command templates, hook recipes
→ `${CLAUDE_SKILL_DIR}/references/prompts-and-commands.md`

## Design Quality → frontend-super

For design quality, aesthetics, animation, and scoring — use the **frontend-super**
skill. It owns: anti-AI-slop rules (fonts, color, layout), 0-100 design scoring,
CSS-first animation, 3D web, RTL/Hebrew typography, mobile UX, and the
`<frontend_aesthetics>` CLAUDE.md block template. This skill deliberately keeps
no copy of that content.

Typical combined flow: frontend-pro sets up the project + visual loop →
frontend-super drives the design pass → frontend-pro's testing loop verifies it.

## Anti-Patterns

| Don't | Do Instead |
|-------|-----------|
| Mix unrelated tasks in one session | `/clear` between tasks |
| Let context hit 85%+ | Document & Clear at ~70% |
| Skip Plan Mode for complex features | Plan first, build second |
| Trust output without visual check | Verify at 375/768/1280px |
| Write massive CLAUDE.md (500+ lines) | Keep lean, use @imports |
| Let Claude run Playwright via Bash | Say "use playwright MCP" explicitly |
| Use `/compact` as primary strategy | Prefer Document & Clear |
| Hand-roll design rules here | Delegate design to frontend-super |
