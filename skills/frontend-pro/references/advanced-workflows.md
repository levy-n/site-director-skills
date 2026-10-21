# Advanced Workflows

## Table of Contents
- [Multi-Agent Patterns](#multi-agent-patterns)
- [Custom Agents for Frontend](#custom-agents-for-frontend)
- [GitHub Actions Integration](#github-actions-integration)
- [Headless Mode Automation](#headless-mode-automation)
- [CI/CD Visual Verification](#cicd-visual-verification)
- [Batch Operations](#batch-operations)

## Multi-Agent Patterns

### Writer + Reviewer Chain

The highest-impact pattern: build with one agent, review with another.

```
"Implement the UserProfile component with all CRUD operations.
After you're done, use the code-reviewer agent to review your changes.
Fix any critical issues it finds."
```

Claude uses the main context for writing, then delegates read-only review
to a subagent with fresh context.

### Analyzer + Optimizer Chain

```
"First use the explore agent to find all components importing react-query.
List them. Then refactor each to use the new useQuery v5 API."
```

The explore agent (Haiku, fast and cheap) handles search.
The main agent handles the complex refactoring.

### Parallel Analysis

```
"Use three subagents in parallel:
1. One to analyze bundle size (check package.json, imports)
2. One to find unused exports across the codebase
3. One to check for accessibility issues in components
Summarize all findings."
```

### When Multi-Agent Helps
- Code review (reviewer has fresh perspective without implementation bias)
- Large codebase analysis (search agent + refactor agent)
- Research + implementation (plan agent reads docs, main agent implements)
- Style audits (dedicated agent checks consistency across files)

### When Multi-Agent Hurts
- Simple tasks (overhead of delegation exceeds time saved)
- Tasks requiring deep context from current session (subagent starts fresh)
- High-frequency iterations (agent switching adds latency)

## Custom Agents for Frontend

Store in `.claude/agents/`. Each agent gets its own context, keeping the main session clean.

### Code Reviewer Agent

```markdown
# .claude/agents/code-reviewer.md
---
name: code-reviewer
description: Expert frontend code reviewer
tools: Read, Grep, Glob, Bash
---
Review modified files. Report by priority:
- Critical: security (XSS, secrets), bugs (null refs, race conditions, infinite renders)
- Warning: performance (re-renders, bundles), accessibility (ARIA, contrast), duplication
- Suggestion: style, abstractions, test coverage
Include file:line references.
```

### Style Auditor Agent

```markdown
# .claude/agents/style-auditor.md
---
name: style-auditor
tools: Read, Grep, Glob
---
Scan components. Report: hardcoded colors (use tokens), inconsistent spacing,
mixed font declarations, inline styles, unused classes. Group by file.
```

## GitHub Actions Integration

### Automated PR Review

```yaml
name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          claude_args: "--max-turns 10"
```

### Built-in /code-review

Claude Code's `/code-review` runs 4 parallel agents: CLAUDE.md compliance, bug/security scan,
style consistency, and test coverage analysis.

## Headless Mode Automation

### Basic Queries

```bash
# Single file review
claude -p "Review src/App.tsx for performance issues" --output-format json

# Pipe input
cat error.log | claude -p "Summarize the key frontend errors"

# Restricted tools
claude -p "Audit src/components/" --allowedTools "Read,Grep,Glob"
```

### Batch Processing

```bash
# Review all components
for file in src/components/*.tsx; do
  echo "=== Reviewing $file ===" >> review.md
  claude -p "Review $file for bugs and accessibility" \
    --allowedTools "Read,Grep" >> review.md
done

# Generate tests for untested components
for file in src/components/*.tsx; do
  test_file="${file%.tsx}.test.tsx"
  if [ ! -f "$test_file" ]; then
    claude -p "Generate tests for $file using React Testing Library" \
      --allowedTools "Read,Write"
  fi
done
```

### JSON Output for Tooling

```bash
claude -p "List all TODO comments in src/" --output-format json | \
  jq '.result' > todos.json
```

## CI/CD Visual Verification

Capture screenshots at key breakpoints in CI using headless Playwright MCP:

```bash
for width in 375 768 1280; do
  claude -p "Use playwright MCP: navigate to localhost:3000, viewport ${width}px, screenshot to screenshots/current-${width}.png" \
    --allowedTools "mcp__playwright"
done
```

Compare with baselines in `screenshots/baseline/`. Update baselines after verified changes:
```bash
cp screenshots/current-*.png screenshots/baseline/ && git add screenshots/baseline/
```

## Batch Operations

### Migration Across Files

```bash
# Migrate all class components to functional
claude -p "Find all React class components in src/ and convert them \
  to functional components with hooks. Preserve all existing behavior. \
  Run tests after each file conversion." --max-turns 50
```

### Bulk Style Updates

```bash
# Add dark mode to all components
claude -p "Add dark mode support to all components in src/components/. \
  Use the existing dark: Tailwind prefix. Follow the color tokens in \
  src/styles/tokens.css. Process one file at a time, verify no regressions."
```

⚠️ **Warning**: Bulk operations can trigger thousands of file writes. Monitor closely.
Set `--max-turns` to limit runaway loops. Review changes before committing.
