# Testing & Verification Workflows

## Table of Contents
- [Closed-Loop Testing Pattern](#closed-loop-testing-pattern)
- [TDD with Claude Code](#tdd-with-claude-code)
- [Playwright Test Generation](#playwright-test-generation)
- [Visual Regression Testing](#visual-regression-testing)
- [Accessibility Auditing](#accessibility-auditing)
- [Performance Testing with Lighthouse](#performance-testing-with-lighthouse)
- [Self-Review Pattern](#self-review-pattern)

## Closed-Loop Testing Pattern

The most effective Claude Code workflow for frontend:

```
Write Code → Run Tests → Claude Sees Failures → Auto-Fix → Re-run → Pass
```

Claude enters an autonomous loop: implement → test → analyze → fix → repeat.

### Enabling the Loop

Prompt structure:
```
"Implement [feature]. After writing the code, run the tests.
If any test fails, analyze the error and fix it. Keep iterating
until all tests pass. Do not ask me for guidance — just fix it."
```

### Key Principles
- Claude must see test output directly (not summarized)
- Keep test suites fast (<30s) or Claude's context fills with wait messages
- Group related tests — don't run the entire suite on every iteration
- Set a mental limit: if Claude fails 3 iterations, intervene manually

## TDD with Claude Code

### Setup Prompt

```
"We are doing TDD. The rules:
1. Write tests FIRST based on the requirements
2. Confirm tests FAIL before writing implementation
3. Write minimal code to make tests pass
4. Refactor only after green
Do NOT stub imaginary code. Do NOT skip the red phase."
```

### Test Specification Pattern

Use input/output pairs for clarity:
```
"Create a test for formatPrice():
- formatPrice(1000) → '$1,000.00'
- formatPrice(0) → '$0.00'
- formatPrice(1234.5) → '$1,234.50'
- formatPrice(-50) → '-$50.00'
Write the test first, run it, confirm it fails, then implement."
```

### Component TDD Example

```
"Write tests for a SearchBar component:
- Renders an input with placeholder 'Search...'
- Calls onSearch callback after 300ms debounce on typing
- Shows a clear button when input is non-empty
- Pressing Escape clears the input and calls onClear
- Disables input when disabled prop is true
Use React Testing Library. Write tests first."
```

### Common TDD Pitfalls with Claude
- Claude may write implementation alongside tests (remind: "tests FIRST")
- Claude may mock too aggressively (specify: "test real behavior, minimal mocks")
- Claude may skip edge cases (specify them explicitly in requirements)

## Playwright Test Generation

### Configuration (project .mcp.json)

```json
{"mcpServers": {"playwright": {"command": "npx", "args": ["@playwright/mcp@latest", "--headless"]}}}
```

### Auto-Generate Tests

```
"Use playwright MCP: navigate to localhost:3000/login, fill email 'test@example.com',
fill password, click 'Sign In', wait for /dashboard. Generate a Playwright test file."
```

The `mcp__playwright__browser_generate_playwright_test` tool captures the interaction as a `.spec.ts` file.
Playwright provides agents: **Planner** (strategy), **Generator** (creates tests), **Healer** (auto-fixes selectors).

## Visual Regression Testing

Use Playwright MCP to capture screenshots at 375px, 768px, 1280px before and after changes.

### Breakpoints to Cover

| Name | Size | Device |
|------|------|--------|
| Mobile S | 375x812 | iPhone SE/13 |
| Tablet | 768x1024 | iPad |
| Desktop | 1280x800 | Standard |

Create `.claude/agents/responsive-tester.md` to automate: navigate, set viewport, screenshot,
check overflow/truncation/alignment, report by breakpoint.

## Accessibility Auditing

### Quick Check (No MCP Required)

```bash
npx pa11y http://localhost:3000
npx pa11y http://localhost:3000/dashboard --standard WCAG2AA
```

### AccessLint MCP (project .mcp.json)

```json
{
  "mcpServers": {
    "accesslint": {
      "command": "npx",
      "args": ["-y", "@accesslint/mcp"]
    }
  }
}
```

### Prompt for Accessibility Review

```
"Audit this page: contrast ratios (WCAG AA), alt text, keyboard nav,
ARIA labels, focus indicators, heading hierarchy. Report by severity."
```

### Common A11y Issues Claude Can Fix
Missing `alt` on images, low contrast text, missing focus styles (`outline: none`), missing
`aria-label` on icon buttons, unlabeled form inputs, missing skip-nav link.

## Performance Testing with Lighthouse

### Lighthouse MCP (project .mcp.json)

```json
{
  "mcpServers": {
    "lighthouse": {
      "command": "npx",
      "args": ["lighthouse-mcp"]
    }
  }
}
```

### Manual Lighthouse Run

```bash
npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse.json
```

### Performance Checklist Prompt

```
"Analyze this page for performance:
1. Run Lighthouse audit
2. Check: LCP, FID/INP, CLS scores
3. Identify largest assets (images, JS bundles)
4. Check for render-blocking resources
5. Verify images use next/image or lazy loading
6. Check for unused CSS/JS
Implement the top 3 highest-impact fixes."
```

## Self-Review Pattern

After completing any feature, always run self-review:

```
"Review all changes you just made. Check for:
1. Bugs or logic errors
2. Missing error handling
3. Security vulnerabilities (XSS, injection)
4. Hardcoded values that should be configurable
5. Missing loading/error states
6. Accessibility issues
7. Unused imports or dead code
Report findings, then fix critical and major issues."
```

This catches errors Claude introduced during implementation. Multiple developers report
this single practice as the highest-ROI habit with Claude Code.
