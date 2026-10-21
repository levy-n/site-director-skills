# Frontend-Super Integration

How this pipeline uses the `frontend-super` skill (`~/.claude/skills/frontend-super`) for elevated design quality.

## When to Activate Frontend-Super

| Phase | Frontend-Super Action | Why |
|---|---|---|
| **Phase 2** | Run `/extract-reference` on chosen reference URLs | Produces formal `<frontend_aesthetics>` block for build phase |
| **Phase 3** | Load `references/color-system.md` (OKLCH palettes), `references/typography-system.md` (font pairing rules, weight contrast) | Deeper design system expertise than built-in rules |
| **Phase 5** | Run `/evaluate-design` after each section build (Hero, Features, etc.). If score < 70, run `/progressive-refine` | Structured quality scoring prevents shipping mediocre design |
| **Phase 5 (Motion)** | Load `references/motion-system.md` for Motion/Lenis implementation | More comprehensive animation patterns than built-in |
| **Phase 5 (RTL)** | Load `references/rtl-hebrew.md` | More comprehensive than built-in RTL guide - includes `/rtl-validate` command |
| **Phase 5 (Mobile)** | Load `references/mobile-ux.md` (987 lines) | Fills critical gap - thumb zones, touch targets, safe areas, bottom sheets |
| **Phase 6** | Run `/perf-audit`, `/mobile-audit`, `/rtl-validate` | Automated quality gates before deployment |

Note: the `references/*.md` paths in this table are inside the **frontend-super** skill directory, not this skill.

## Key Frontend-Super Advantages Over Built-In

- **OKLCH color space** (perceptually uniform) vs standard hex
- **Extreme weight contrast** (200 vs 800) vs standard (400 vs 600)
- **Tinted neutrals** mandatory (never pure gray)
- **0-100 JSON scoring** with 6 categories - objective quality measurement
- **Mobile UX** reference (987 lines) - MediaWave mentions mobile-first but lacks detailed reference
- **CSS 2026 features** - scroll-driven animations, View Transitions, anchor positioning
