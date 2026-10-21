# Prompts, Slash Commands & Hooks

## Table of Contents
- [High-Impact Prompting Patterns](#high-impact-prompting-patterns)
- [Planning Prompts](#planning-prompts)
- [Implementation Prompts](#implementation-prompts)
- [Review and QA Prompts](#review-and-qa-prompts)
- [Custom Slash Commands](#custom-slash-commands)
- [Hook Recipes](#hook-recipes)
- [Extended Thinking Triggers](#extended-thinking-triggers)
- [Prompting Anti-Patterns](#prompting-anti-patterns)

## High-Impact Prompting Patterns

### The Three Rules That Matter Most

1. **Be specific about scope** — "Fix the dropdown in `Header.tsx`" not "Fix the navigation"
2. **Constrain output** — "Only modify files in `src/components/`. Do not touch anything else."
3. **State expected behavior** — "After this change, clicking X should show Y within 200ms"

### Context-Setting Openers

Start sessions with context, not just tasks:

```
"I'm working on [feature] in a Next.js 14 app with Tailwind.
The relevant files are in src/components/auth/.
The current problem is [specific issue].
The expected behavior is [what should happen].
Plan the fix first, then implement."
```

## Planning Prompts

### Feature Planning

```
"Think hard about this before writing any code.
I need to build [feature]. Analyze the codebase, identify files to change,
list edge cases, create step-by-step plan, flag risks.
Present the plan. Do not implement until I approve."
```

### Architecture Decision

```
"I need to decide between [A] and [B] for [feature].
Analyze our codebase. Consider performance, maintainability, bundle size.
Show code examples of each approach. Be opinionated — recommend one."
```

### Refactoring Plan

```
"Analyze src/components/Dashboard/ for refactoring.
Read every file first. Propose: components to split, logic to extract into hooks,
duplicated code, performance improvements. Prioritized plan. Don't implement yet."
```

## Implementation Prompts

### New Component

```
"Create [ComponentName] in src/components/:
TypeScript props interface, Tailwind mobile-first, loading/error/empty states,
keyboard accessible (ARIA), unit test with RTL.
Follow patterns in [ExampleComponent]."
```

### Bug Fix with Verification

```
"Fix [bug] in [file]. Write failing test first, implement fix,
verify test passes, run full suite, screenshot the fix (Chrome)."
```

### Scope-Limited Edit

```
"In src/components/Cart.tsx, only modify calculateTotal.
Add discount code handling. Do NOT change any other function or file."
```

## Review and QA Prompts

### Self-Review (use after every feature)

```
"Review all changes. Check: bugs (null refs, race conditions), security (XSS, secrets),
performance (re-renders, bundles), accessibility (ARIA, keyboard, contrast),
edge cases (empty data, errors), types (any, null checks).
Fix critical issues. List warnings for my review."
```

### Pre-Commit Review

```
"Run git diff --staged. Check for: secrets, console.logs, TODOs, commented-out code,
missing error handling. Report findings. Do not commit."
```

## Custom Slash Commands

Store in `.claude/commands/` (project) or `~/.claude/commands/` (global).

### /new-component

```markdown
<!-- .claude/commands/new-component.md -->
---
argument-hint: ComponentName
description: Scaffold React component with tests
allowed-tools: [Write, Edit, Read]
---
Create $1 in src/components/$1/: $1.tsx (typed props, Tailwind, mobile-first),
$1.test.tsx (RTL tests), index.ts (re-export). Follow existing patterns.
```

### /fix-and-verify

```markdown
<!-- .claude/commands/fix-and-verify.md -->
---
argument-hint: bug description
description: Fix bug with test + visual proof
allowed-tools: [Write, Edit, Read, Bash, mcp__playwright]
---
Fix: $1. Steps: find root cause → write failing test → fix → verify pass → full suite → screenshot.
```

### /responsive-check

```markdown
<!-- .claude/commands/responsive-check.md -->
---
argument-hint: URL path
description: Responsive check at all breakpoints
allowed-tools: [mcp__playwright]
---
Use playwright MCP on localhost:3000$1 at 375x812, 768x1024, 1280x800.
Screenshot each. Report overflow, truncation, readability issues.
```

### /perf-audit

```markdown
<!-- .claude/commands/perf-audit.md -->
---
argument-hint: URL path
description: Lighthouse audit + fix top issues
allowed-tools: [Bash, Read, Write, Edit]
---
Run Lighthouse on localhost:3000$1. Fix top 3 performance issues. Re-run. Report before/after.
```

## Hook Recipes

Configure in `.claude/settings.json` under `"hooks"`. All use `PostToolUse` with matcher `"Edit|MultiEdit|Write"`.

### Format + Lint on Every Edit

```json
{"hooks": {"PostToolUse": [{"matcher": "Edit|MultiEdit|Write", "hooks": [
  {"type": "command", "command": "prettier --write $CLAUDE_FILE_PATHS && eslint $CLAUDE_FILE_PATHS --fix --quiet"}
]}]}}
```

### TypeScript Check on Every Edit

```json
{"hooks": {"PostToolUse": [{"matcher": "Edit|MultiEdit|Write", "hooks": [
  {"type": "command", "command": "npx tsc --noEmit 2>&1 | head -20"}
]}]}}
```

### ⚠️ Hook Warnings
- Hooks consume context tokens. Use `--quiet` flags to minimize output.
- One developer reported Prettier hooks consuming 160K tokens in 3 rounds from system reminders.
- Test hooks with a simple edit first before relying on them.
- Avoid long chains — keep to 1-2 commands max.

## Extended Thinking Triggers

Phrases that activate deeper reasoning: "think hard", "ultrathink", "think step by step", "analyze before implementing". Combine with Plan Mode for best results. View thinking: `Ctrl+O`.

## Prompting Anti-Patterns

| Don't | Why | Do Instead |
|-------|-----|-----------|
| "Make the UI look better" | Too vague, invites AI slop | "Apply the design tokens from tokens.css. Add entrance animations. Use asymmetric layout." |
| "Fix all the bugs" | Unbounded scope | "Fix the login form validation bug in AuthForm.tsx" |
| "Rewrite everything" | Dangerous, loses working code | "Refactor [specific module] while preserving behavior and tests" |
| "Just do it" | No constraints, poor results | Specify scope, expected behavior, and constraints |
| Pasting 500-line error logs | Context waste | "Summarize the key error" or paste only the relevant 10 lines |
| Multiple unrelated requests | Context pollution | One task per session, `/clear` between tasks |
| "Be creative with the design" | Triggers generic AI aesthetics | Specify exact aesthetic: fonts, colors, layout style |
| No verification step | Bugs ship silently | Always include "verify" or "test" in the prompt |
