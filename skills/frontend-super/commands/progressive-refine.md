---
description: Progressive refinement through 5 staged design improvement passes
argument-hint: [component-path or page-path]
---

Progressively refine $ARGUMENTS through these stages IN ORDER.
Do NOT advance to the next stage until the current stage scores >= 70.

Read the evaluation rubric from `references/evaluation-criteria.md`.

## Stage 1 — LAYOUT/STRUCTURE

Read `references/spacing-system.md`.

Actions:
- Fix grid alignment and visual hierarchy
- Ensure asymmetric composition (not 3-equal-columns)
- Verify responsive behavior at 375px, 768px, 1280px
- Add generous whitespace to hero/key sections (2-3x normal)
- Use full-bleed alternating with contained sections for rhythm

Evaluate layout score. Must be >= 70 to proceed.

## Stage 2 — TYPOGRAPHY

Read `references/typography-system.md`.

Actions:
- Replace banned fonts (Inter, Roboto, Arial, Open Sans) with distinctive alternatives
- Enforce weight contrast: 200/300 vs 800/900 (not 400 vs 600)
- Enforce size jumps: headings 3x+ body size
- Fix letter-spacing: tight for large text, NEVER on Hebrew
- Set proper line-height (1.4-1.5 Latin, 1.7-1.8 Hebrew)

Evaluate typography score. Must be >= 70 to proceed.

## Stage 3 — COLOR

Read `references/color-system.md`.

Actions:
- Apply 60/30/10 palette distribution
- Replace pure grays with tinted neutrals
- Verify WCAG AA contrast (4.5:1 body, 3:1 large text)
- Ensure accent color is used purposefully (not everywhere)
- Build surface hierarchy: bg → surface → elevated

Evaluate color score. Must be >= 70 to proceed.

## Stage 4 — SPACING

Read `references/spacing-system.md`.

Actions:
- Align all spacing to 8pt grid (4, 8, 12, 16, 24, 32, 48, 64)
- Enforce Gestalt proximity: internal spacing <= external spacing
- Add section breaks of 48-64px minimum between page sections
- Check padding consistency across similar components
- Verify responsive spacing adaptation

Evaluate spacing score. Must be >= 70 to proceed.

## Stage 5 — MOTION/INTERACTIONS

Read `references/motion-system.md`.

Actions:
- Add ONE orchestrated staggered reveal to the main content area
- Add hover transitions to interactive elements (150-200ms ease-out)
- Add focus states to all interactive elements
- Verify `prefers-reduced-motion` support
- Ensure all animations use transform/opacity only (no width/height)

Evaluate motion score. Must be >= 60 to proceed.

## Completion

After all 5 stages pass, run `/evaluate-design $ARGUMENTS` for final comprehensive score.

**Maximum 3 full iterations.** If still below threshold after 3 passes, output:
"Design has reached the limit of automated refinement. Flagging for human review. Key remaining issues: [list]"
