# Testing & Verification Workflows

## Table of Contents
- [Closed-Loop Testing Pattern](#closed-loop-testing-pattern)
- [TDD with Claude Code](#tdd-with-claude-code)
- [Playwright Test Generation](#playwright-test-generation)
- [Visual Regression Testing](#visual-regression-testing)
- [Visual Regression Scoring](#visual-regression-scoring)
- [Accessibility Auditing](#accessibility-auditing)
- [RTL Testing](#rtl-testing)
- [Performance Testing with Lighthouse](#performance-testing-with-lighthouse)
- [Self-Review Pattern](#self-review-pattern)

## Closed-Loop Testing Pattern

The most effective Claude Code workflow for frontend:

```
Write Code -> Run Tests -> Claude Sees Failures -> Auto-Fix -> Re-run -> Pass
```

Claude enters an autonomous loop: implement -> test -> analyze -> fix -> repeat.

### Enabling the Loop

Prompt structure:
```
"Implement [feature]. After writing the code, run the tests.
If any test fails, analyze the error and fix it. Keep iterating
until all tests pass. Do not ask me for guidance -- just fix it."
```

### Key Principles
- Claude must see test output directly (not summarized)
- Keep test suites fast (<30s) or Claude's context fills with wait messages
- Group related tests -- don't run the entire suite on every iteration
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
- formatPrice(1000) -> '$1,000.00'
- formatPrice(0) -> '$0.00'
- formatPrice(1234.5) -> '$1,234.50'
- formatPrice(-50) -> '-$50.00'
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

### Configuration

```json
{"mcpServers": {"playwright": {"command": "cmd", "args": ["/c", "npx", "-y", "@playwright/mcp@latest", "--headless"]}}}
```

> **Windows Note:** The `cmd /c` wrapper is required on Windows for npx execution. On macOS/Linux, use `"command": "npx"` directly.

### Auto-Generate Tests

```
"Use playwright MCP: navigate to localhost:5173/login, fill email 'test@example.com',
fill password, click 'Sign In', wait for /dashboard. Generate a Playwright test file."
```

The `browser_generate_playwright_test` tool captures the interaction as a `.spec.ts` file.
Playwright provides agents: **Planner** (strategy), **Generator** (creates tests), **Healer** (auto-fixes selectors).

## Visual Regression Testing

Use Playwright MCP to capture screenshots at 375px, 768px, 1280px before and after changes.

### Breakpoints to Cover

| Name | Size | Device |
|------|------|--------|
| Mobile S | 375x812 | iPhone SE/13 |
| Tablet | 768x1024 | iPad |
| Desktop | 1280x800 | Standard |

### Multi-Breakpoint Workflow

```
"Use playwright MCP to navigate to localhost:5173.
Set viewport to 375x812, take screenshot.
Set viewport to 768x1024, take screenshot.
Set viewport to 1280x800, take screenshot.
Report any layout issues across breakpoints."
```

---

## Visual Regression Scoring

After capturing screenshots, integrate with the structured evaluation system for quantified quality tracking.

### Process

1. **Capture** screenshots at all 3 breakpoints (before changes)
2. **Run `/evaluate-design`** to establish baseline scores (JSON output)
3. **Make changes** to the component/page
4. **Re-capture** screenshots at all 3 breakpoints
5. **Run `/evaluate-design`** again to get new scores
6. **Compare** score deltas across categories

### Score Tracking Format

```json
{
  "component": "HeroSection",
  "date": "2025-01-15",
  "iterations": [
    {
      "iteration": 1,
      "overall_score": 52,
      "categories": {
        "typography": 60,
        "color": 55,
        "spacing": 45,
        "layout": 50,
        "motion": 40,
        "accessibility": 65
      }
    },
    {
      "iteration": 2,
      "overall_score": 74,
      "categories": {
        "typography": 80,
        "color": 75,
        "spacing": 70,
        "layout": 72,
        "motion": 60,
        "accessibility": 85
      }
    }
  ]
}
```

### Pass/Fail Thresholds

| Category | Minimum | Target | Notes |
|----------|---------|--------|-------|
| Typography | 60 | 80 | Font choice, weight contrast, scale |
| Color | 60 | 80 | Palette cohesion, contrast compliance |
| Spacing | 60 | 75 | Grid adherence, Gestalt grouping |
| Layout | 60 | 75 | Responsive, asymmetry, hierarchy |
| Motion | 50 | 70 | Purpose, performance, reduced-motion |
| Accessibility | 70 | 90 | Critical -- highest minimum threshold |
| **Overall** | **70** | **80** | Weighted average across categories |

---

## Accessibility Auditing

### Quick Check (No MCP Required)

```powershell
npx pa11y http://localhost:5173
npx pa11y http://localhost:5173/dashboard --standard WCAG2AA
```

### AccessLint MCP

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

---

## RTL Testing

For Hebrew/RTL projects, add these verification steps to your testing workflow.

### Automated RTL Checks

Run `/rtl-validate` on your component directory to catch:
- Physical CSS properties that should be logical (margin-left -> margin-inline-start)
- Letter-spacing on Hebrew text elements
- Italic styles on Hebrew text
- Missing `dir="rtl"` on root element
- Missing Hebrew font in font stack

### Visual RTL Verification

```
"Use playwright MCP to navigate to localhost:5173.
Set viewport to 1280x800. Take screenshot.
Check: Is the layout correctly mirrored for RTL?
- Navigation on the RIGHT side?
- Text aligned to the RIGHT?
- Arrow/chevron icons pointing LEFT (back in RTL)?
- No overlapping elements from incorrect directionality?"
```

### RTL-Specific Test Cases

When writing component tests for RTL projects:

```tsx
// Wrap component in RTL context for testing
const { getByText } = render(
  <div dir="rtl" lang="he">
    <MyComponent />
  </div>
);

// Test that logical properties are applied correctly
const element = getByText('some text');
const styles = window.getComputedStyle(element);
expect(styles.direction).toBe('rtl');
```

### Common RTL Bugs to Check
- Text overflowing containers (Hebrew text can be wider than Latin)
- Icons not flipped (arrows, chevrons, breadcrumb separators)
- Animations entering from wrong direction (should enter from RIGHT)
- Scrollbars on wrong side
- Absolutely positioned elements misplaced

---

## Performance Testing with Lighthouse

### Lighthouse MCP

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

```powershell
npx lighthouse http://localhost:5173 --output=json --output-path=lighthouse.json --chrome-flags="--headless"
```

### Performance Checklist Prompt

```
"Analyze this page for performance:
1. Run Lighthouse audit
2. Check: LCP, INP, CLS scores
3. Identify largest assets (images, JS bundles)
4. Check for render-blocking resources
5. Verify images use lazy loading and proper dimensions
6. Check for unused CSS/JS
Implement the top 3 highest-impact fixes."
```

### Vite-Specific Performance

```powershell
# Analyze Vite bundle
npx vite-bundle-visualizer

# Check for unused exports
npx knip
```

---

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

### Frontend-Specific Self-Review Additions

After the general self-review, also check:
- Run `/evaluate-design` for structured quality scoring
- Verify responsive behavior at 375px, 768px, 1280px
- Check `prefers-reduced-motion` support for any animations
- If RTL project: run `/rtl-validate` before committing
