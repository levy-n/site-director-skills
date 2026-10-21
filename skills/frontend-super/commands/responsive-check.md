---
description: Check responsive design at 3 breakpoints — report layout issues
argument-hint: [URL-path like / or /about]
---

Check responsive design of `localhost:3000$ARGUMENTS` at all critical breakpoints.

## Breakpoints to Check

| Name | Viewport | Device Reference |
|------|----------|-----------------|
| Mobile | 375x812 | iPhone SE / 13 |
| Tablet | 768x1024 | iPad |
| Desktop | 1280x800 | Standard laptop |

## Process

### If Playwright MCP is available:
1. Use Playwright MCP to navigate to the URL
2. Set viewport to 375x812 → take screenshot
3. Set viewport to 768x1024 → take screenshot
4. Set viewport to 1280x800 → take screenshot
5. Analyze each screenshot for issues

### If no Playwright MCP:
1. Read the component/page code
2. Analyze Tailwind breakpoint usage (sm:, md:, lg:)
3. Check for fixed widths that would cause overflow
4. Check for missing responsive adjustments

## Issue Checklist per Breakpoint

- [ ] No horizontal scroll (overflow-x)
- [ ] Text is readable (>= 16px body on mobile)
- [ ] Touch targets >= 44x44px on mobile
- [ ] Images don't overflow container
- [ ] Navigation is accessible (hamburger on mobile)
- [ ] Content order makes sense (mobile-first reading order)
- [ ] No truncated/overlapping text
- [ ] Spacing adapts appropriately (tighter on mobile)
- [ ] Cards/grids stack properly (flex-col on mobile, md:flex-row)
- [ ] No awkward empty space

## Output Format

```
## Responsive Check: $ARGUMENTS

### Mobile (375px) — [PASS/ISSUES]
- [issue description or "All clear"]

### Tablet (768px) — [PASS/ISSUES]
- [issue description or "All clear"]

### Desktop (1280px) — [PASS/ISSUES]
- [issue description or "All clear"]

### Summary: X issues found across 3 breakpoints.
[Specific fix recommendations with file:line references]
```
