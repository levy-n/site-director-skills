---
description: Validate RTL/Hebrew compliance — check CSS logical properties, Hebrew typography rules, directional elements
argument-hint: [component-path or directory-path]
---

Validate RTL/Hebrew compliance for $ARGUMENTS.

Read the full reference: `references/rtl-hebrew.md`

## Automated Checks

### 1. CSS Physical Properties (CRITICAL)
Search all CSS/TSX/JSX files for physical properties that MUST be logical:

| Search for | Should be |
|---|---|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |
| `float: left` | `float: inline-start` |
| `float: right` | `float: inline-end` |
| `left:` (in positioning) | `inset-inline-start:` |
| `right:` (in positioning) | `inset-inline-end:` |
| `border-left` | `border-inline-start` |
| `border-right` | `border-inline-end` |

Also check Tailwind classes: `ml-`, `mr-`, `pl-`, `pr-`, `text-left`, `text-right`, `left-`, `right-`.
These should use `ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`, `start-`, `end-`.

### 2. Hebrew Typography (CRITICAL)
- Search for `letter-spacing` applied to elements with Hebrew text content
- Search for `font-style: italic` or Tailwind `italic` on Hebrew text
- Check `line-height` values (should be 1.7-1.8 for Hebrew body, not 1.5)
- Check for `text-transform: uppercase` (meaningless for Hebrew)

### 3. Root Element
- Verify `dir="rtl"` is set on `<html>` element
- Verify `lang="he"` is set on `<html>` element

### 4. Font Stack
- Verify a Hebrew-capable font is in the font stack: Heebo, Rubik, Assistant, Alef, Noa Shalev, Yarden, or other Hebrew font

### 5. Directional Elements
- Check arrow/chevron icons — should be flipped with `transform: scaleX(-1)` or RTL-aware
- Check breadcrumb separators — should point left in RTL
- Check progress indicators — should fill from right to left

### 6. Animation Direction
- Check Framer Motion `x` values — positive x means LEFT in RTL, should be negative for "enter from right"
- Check CSS `translateX` — same consideration

## Output Format

```
## RTL/Hebrew Validation: $ARGUMENTS

### CRITICAL (blocks shipping)
- [file:line] `margin-left: 8px` → should be `margin-inline-start: 8px`
- [file:line] `letter-spacing: 0.05em` on Hebrew text element

### WARNING (should fix)
- [file:line] Missing Hebrew font in font stack
- [file:line] line-height: 1.5 on Hebrew body text (should be 1.7-1.8)

### INFO (review)
- [file:line] Arrow icon not flipped for RTL
- [file:line] Animation x: 20 should be x: -20 for RTL entry

**Summary**: X critical, Y warnings, Z info items across N files.
[PASS / FAIL] — [FAIL if any critical items found]
```
