---
description: Final polish pass — micro-details that elevate from good to great
argument-hint: [component-path]
---

Apply final polish to $ARGUMENTS. This is the LAST pass before shipping.

Focus on the micro-details that separate professional from amateur work.
Each item below should be checked and applied where missing.

## Polish Checklist

### 1. TRANSITIONS
Add subtle hover/focus transitions to all interactive elements where missing:
```css
transition: all 150ms ease-out;
/* Or with Tailwind: transition-all duration-150 ease-out */
```

### 2. FOCUS STATES
Ensure every interactive element has a visible focus indicator:
```css
:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
/* Or with Tailwind: focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 */
```

### 3. LOADING STATES
Add skeleton/shimmer placeholders for any async content. No layout shift when content loads.

### 4. EMPTY STATES
Handle zero-data gracefully — friendly message, illustration, or call-to-action. Never a blank screen.

### 5. SPACING CONSISTENCY
Final check: all spacing aligns to 8pt grid. Fix any 5px, 7px, 15px values.

### 6. TEXT OVERFLOW
Add proper truncation where text length is variable:
```css
overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
/* Or multi-line: display: -webkit-box; -webkit-line-clamp: 3; */
```

### 7. CURSOR STYLES
- `cursor: pointer` on all clickable non-link elements
- `cursor: not-allowed` on disabled elements
- `cursor: grab` / `cursor: grabbing` on draggable elements

### 8. TOUCH TARGETS
Minimum 44x44px hit area on all interactive elements for mobile. Use padding, not just content size.

### 9. SCROLL BEHAVIOR
Add `scroll-behavior: smooth` on html for anchor links. Add `scroll-margin-top` for sticky headers.

### 10. SELECTION STYLES
Match text selection color to the palette:
```css
::selection { background: var(--color-accent); color: white; }
```

## Process

1. Read the component(s) at $ARGUMENTS
2. Check each of the 10 items above
3. Make changes where items are missing or incomplete
4. Report what was polished with before/after descriptions

Output: "Polished X items in Y files: [list of changes made]"
