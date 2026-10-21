---
description: Comprehensive design audit checking typography, color, spacing, layout, motion, accessibility, code quality, and RTL
argument-hint: [component-path or directory-path]
---

Perform a comprehensive design audit of $ARGUMENTS.

Read these references before auditing:
- `references/anti-patterns.md`
- `references/evaluation-criteria.md`

## Audit Checklist

### 1. TYPOGRAPHY
- [ ] No banned fonts (Inter, Roboto, Arial, Open Sans, system-ui as primary)
- [ ] Weight contrast uses extremes (200 vs 800, not 400 vs 600)
- [ ] Size scale is consistent (modular scale, not random sizes)
- [ ] Heading hierarchy is clear (h1 > h2 > h3 visually distinct)
- [ ] Line-height appropriate (1.4-1.5 Latin, 1.7-1.8 Hebrew)
- [ ] Letter-spacing: tight for large text, absent on Hebrew

### 2. COLOR
- [ ] Palette follows 60/30/10 distribution
- [ ] No pure grays — neutrals are tinted (warm or cool)
- [ ] WCAG AA contrast: 4.5:1 body text, 3:1 large text
- [ ] Accent color used purposefully (not on every element)
- [ ] No anti-pattern gradients (purple on white, blue-to-purple hero)

### 3. SPACING
- [ ] All spacing follows 8pt grid (4, 8, 12, 16, 24, 32, 48, 64)
- [ ] Gestalt proximity: internal spacing <= external spacing
- [ ] Section breaks >= 48px between major sections
- [ ] No uniform spacing everywhere (variation creates hierarchy)
- [ ] Hero/key sections have generous whitespace (2-3x normal)

### 4. LAYOUT
- [ ] Not all 3-equal-columns (asymmetry creates interest)
- [ ] Responsive at 375px, 768px, 1280px
- [ ] Clear visual hierarchy (one focal point per section)
- [ ] Mix of full-bleed and contained sections
- [ ] Touch targets >= 44x44px on mobile

### 5. MOTION
- [ ] Animations serve a purpose (not purely decorative)
- [ ] Uses transform/opacity only (not width/height)
- [ ] Duration <= 600ms for UI, <= 1200ms for decorative
- [ ] `prefers-reduced-motion` respected
- [ ] No bounce/elastic on standard UI elements

### 6. ACCESSIBILITY
- [ ] Focus indicators visible on all interactive elements
- [ ] ARIA labels on icon-only buttons and non-text controls
- [ ] Alt text on all images
- [ ] Keyboard navigation works for all interactive elements
- [ ] Heading hierarchy is semantic (h1 → h2 → h3, no skips)
- [ ] Skip-to-content link present

### 7. CODE QUALITY
- [ ] No hardcoded color values (use CSS variables/tokens)
- [ ] No inline styles (use Tailwind or CSS modules)
- [ ] No arbitrary Tailwind values like `w-[347px]`
- [ ] No `!important` overrides
- [ ] Consistent units (rem preferred, no mixing px/em/rem)

### 8. RTL (if Hebrew/RTL project)
- [ ] CSS logical properties only (no margin-left/right, padding-left/right)
- [ ] No letter-spacing on Hebrew text
- [ ] No font-style: italic on Hebrew text
- [ ] dir="rtl" on root element
- [ ] Hebrew font in font stack
- [ ] Animations enter from RIGHT

## Output Format

Report findings grouped by severity:

**CRITICAL** (must fix before shipping):
- [Finding with file:line reference]

**WARNING** (should fix for quality):
- [Finding with file:line reference]

**SUGGESTION** (nice to have):
- [Finding with file:line reference]

End with: "Found X critical, Y warnings, Z suggestions across N files."
