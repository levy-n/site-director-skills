---
description: Strengthen visual hierarchy and make design more distinctive
argument-hint: [component-path]
---

Make $ARGUMENTS BOLDER and more distinctive.

Read these references first:
- `references/anti-patterns.md` (what to avoid)
- `references/typography-system.md` (font choices)
- `references/color-system.md` (color strategy)

## Interventions (apply all that are relevant)

### 1. TYPOGRAPHY — Increase Contrast
- If heading weight is 600 → make it 800 or 900
- If heading weight is 700 → make it 200 (ultralight can be bolder than bold)
- If heading is 2x body size → make it 3x or larger
- Add letter-spacing: -0.03em on large headings (NOT on Hebrew)

### 2. COLOR — Strengthen Accent
- Increase accent saturation (OKLCH chroma from 0.15 to 0.25+)
- Increase contrast between surfaces (bg vs surface vs elevated)
- Add a single unexpected color pop in a strategic location

### 3. BACKGROUND — Add Depth
Choose ONE:
- Grain/noise overlay at 3-8% opacity
- Gradient mesh with 3+ color stops
- Subtle dot/line pattern
- Radial gradient spotlight behind key content

### 4. LAYOUT — Break Symmetry
- If 2 equal columns → make them 60/40 or 70/30
- If 3 equal cards → vary their sizes (1 large + 2 small)
- Add an overlapping element (negative margin or absolute positioning)
- Try a full-bleed section between contained sections

### 5. SCALE — Create Drama
- Make ONE element dramatically larger than everything else
- Add extreme whitespace around the most important content
- Use a very large heading (clamp to viewport width)

### 6. WOW ELEMENT — Add One Memorable Detail
Choose ONE:
- `clip-path` shape on a section divider
- `mix-blend-mode` on an overlay
- CSS `backdrop-filter: blur()` glass effect on a card
- A single animated element that catches the eye
- Text with gradient fill (`background-clip: text`)

### 7. VALIDATION
After making changes, check: did any intervention create an anti-pattern?
- No purple gradients
- No bounce/elastic animations
- No reduced contrast
- No broken responsive layout
Fix any anti-patterns introduced.

## Process

1. Read the component(s)
2. Identify which interventions apply (usually 3-4 of the 6)
3. Apply changes
4. Validate no anti-patterns created
5. Report: "Applied X interventions: [list]. The design is now more distinctive because [reason]."

The goal: make someone stop scrolling and think "that looks different."
