# Context Window Management

## Table of Contents
- [How Context Works in Claude Code](#how-context-works-in-claude-code)
- [Context Commands Reference](#context-commands-reference)
- [The Document and Clear Method](#the-document-and-clear-method)
- [Subagents for Context Isolation](#subagents-for-context-isolation)
- [Git Worktrees for Parallel Sessions](#git-worktrees-for-parallel-sessions)
- [Signs of Context Degradation](#signs-of-context-degradation)
- [Session Planning Strategy](#session-planning-strategy)

## How Context Works in Claude Code

Claude Code uses a 200K token context window (1M available in beta on recent Sonnet models).
Everything shares this space: system prompt, CLAUDE.md, conversation history, file contents,
tool outputs, and accumulated state.

**Critical threshold**: Performance degrades noticeably beyond **80% utilization**.
A fresh session with a clear prompt almost always outperforms a long session with
accumulated corrections.

### What Consumes Context Fast
- Large file reads (a 1000-line file ≈ 3-5K tokens)
- Multiple tool outputs accumulating
- Long back-and-forth correction chains
- Verbose error logs pasted in full
- MCP tool responses (especially Playwright screenshots)

### What's Surprisingly Cheap
- CLAUDE.md (typically 500-1500 tokens)
- Short, focused prompts
- Structured plans in markdown

## Context Commands Reference

### `/clear` — Full Reset
Wipes all conversation context. Code changes persist on disk.

**When to use**:
- Between unrelated tasks (always)
- After correcting Claude 2+ times on the same issue
- At ~80% context utilization
- When Claude starts asking about things already discussed

### `/compact [instructions]` — Compress Context
Summarizes conversation to free tokens. Optional focus instruction.

**When to use**: At ~70% utilization if you must continue the same task.

**Caveats**:
- Compression is lossy and opaque — important details may be dropped
- "Summaries of summaries" compound information loss
- Experienced developers avoid this as primary strategy
- If you must use it, add focus: `/compact Focus on the auth refactor only`

### `/rewind` — Undo Last Exchange (or press Escape twice)
Rolls back the last conversation turn and Claude's code changes.

**Limitation**: Only reverts changes made through Claude's tools. Bash commands
(e.g., `rm`, `mv`, `git` operations) are NOT tracked and cannot be undone.

### `/cost` — Check Usage
Shows current token usage and estimated cost. Use to gauge when to clear.

## The Document and Clear Method

The recommended alternative to `/compact` for maintaining continuity:

### Step 1: Document

```
"Write a summary of our current progress to PROGRESS.md. Include:
- What we've accomplished
- Current state of the implementation
- Remaining tasks
- Any decisions made and their rationale
- File paths that were modified"
```

### Step 2: Clear

```
/clear
```

### Step 3: Resume

```
"Read PROGRESS.md and continue from where we left off.
The next task is [specific next step]."
```

### Why This Works Better Than /compact
- You control what's preserved (no lossy auto-summarization)
- The summary is inspectable and editable
- Fresh context gives Claude maximum reasoning capacity
- You can adjust focus for the next phase

### Naming Convention
`PROGRESS.md` for progress, `PLAN.md` for plans, `DECISIONS.md` for architecture log. Add to `.gitignore` if temporary.

## Subagents for Context Isolation

Subagents run in separate context windows, keeping the main session clean.

### Built-in Subagents (spawned via the Agent tool)
- **general-purpose** — all tools, multi-step tasks
- **Plan** — read-only, research and analysis
- **Explore** — fast file searching, low cost

### When to Use Subagents
- Research that would bloat main context
- Code review (read-only, fresh perspective)
- File searching across large codebases

### Custom Subagent Example

```markdown
# .claude/agents/style-auditor.md
---
name: style-auditor
description: Audit CSS/Tailwind for consistency and design quality
tools: Read, Grep, Glob
---
Scan all component files. Report:
1. Inconsistent spacing values (should use design tokens)
2. Hardcoded colors (should use CSS variables)
3. Unused Tailwind classes
4. Accessibility issues (contrast, focus states)
Output findings as a checklist sorted by severity.
```

### Invoking Subagents
Claude automatically delegates to subagents when appropriate.
Force it: "Use the explore agent to find all files importing React Router."

## Git Worktrees for Parallel Sessions

Run multiple Claude Code instances with full isolation:

### Setup

```bash
# Create worktree for a feature branch
git worktree add ../project-feature-auth -b feature/auth main
cd ../project-feature-auth
claude  # Fresh session, separate context

# Create another worktree
git worktree add ../project-feature-ui -b feature/ui main
cd ../project-feature-ui
claude  # Completely independent session
```

### Benefits
- Each worktree has its own CLAUDE.md context
- No cross-contamination between feature work
- Can run dev servers on different ports simultaneously
- Easy to compare approaches side-by-side

### Cleanup

```bash
# Remove worktree when done
git worktree remove ../project-feature-auth

# Or from the main repo
cd project && git worktree prune
```

### When to Use
- Parallel feature development
- A/B testing different implementation approaches
- Keeping a "clean" main worktree while experimenting
- Reviewing PRs without disrupting current work

## Signs of Context Degradation

| Symptom | Action |
|---------|--------|
| Asks about things already discussed | `/clear` and resume |
| Unusually brief responses | Document & Clear |
| Repeated auto-compact calls | `/clear` immediately |
| Loses track of problem scope | Split into focused sessions |
| Hallucinates file paths | `/clear`, re-read relevant files |

## Session Planning Strategy

### Task Size Guidelines
- **Small** (1-3 exchanges): bug fix, style change → single session
- **Medium** (4-8 exchanges): new component, module refactor → single session + verification
- **Large** (10+ exchanges): new feature → Document & Clear after each phase
- **Huge** (20+ exchanges): architecture change → split into worktrees or subagent phases

### Session Template
1. Read CLAUDE.md → 2. Plan Mode for complex tasks → 3. Approve plan →
4. Build (5-8 exchanges max) → 5. Verify visually → 6. Self-review →
7. Document & Clear if continuing, or `/clear` if done.
