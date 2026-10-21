# Frontend Domain Profile for GSD

> This file integrates with GSD's domain skill system. It follows the same pattern as the ML/DL domain profile in `DOMAIN-INTEGRATION.md`.

---

## Detection Keywords

Match ANY of these in PROJECT.md tech stack (case-insensitive):

```
React, Next.js, Vue, Svelte, Astro, Vite, Tailwind, CSS, SCSS, Sass,
Framer Motion, GSAP, Lottie, component, UI, UX, responsive, design system,
landing page, web app, frontend, HTML, TypeScript React, JSX, TSX,
Remix, Gatsby, shadcn/ui, Radix, Chakra UI, Material UI, Ant Design,
Bootstrap, Playwright MCP, visual regression, RTL, Hebrew, animation,
motion, Webpack, esbuild, SWC, PostCSS
```

---

## Frontend Discuss Questions

When frontend domain is detected during `gsd discuss`, ask these clarifying questions:

**Q1: "What type of frontend work?"**
- New site/app from scratch
- New component/section for existing site
- Redesign/refactor existing UI
- Performance optimization
- Animation/motion work
- RTL/Hebrew adaptation

**Q2: "What's the design direction?"**
- Have reference URL or Figma (will run /extract-reference)
- Have general aesthetic in mind (describe it)
- Want bold/distinctive suggestions from the skill
- Minimalist/clean approach
- Not sure yet (will explore during implementation)

**Q3: "Framework and styling?"**
- React + Vite + Tailwind (default for this user)
- Next.js + Tailwind
- Astro + Tailwind
- Svelte/SvelteKit
- Other (specify)
- Framer Motion for animations? (default: yes for React projects)

**Q4: "Is this an RTL/Hebrew project?"**
- Yes, full Hebrew RTL
- Bilingual (Hebrew + English)
- No, LTR only

**Q5: "Design quality target?"**
- Portfolio-piece (maximum distinctiveness, evaluation score target 85+)
- Professional (strong quality, evaluation score target 70+)
- Functional (get it working first, iterate design later)

---

## Sub-Skill Routing for GSD Phases

Based on discuss answers, route to the right frontend-super reference files per phase:

| GSD Phase Goal | Primary Reference | Also Load | Notes |
|---|---|---|---|
| Design system setup | typography-system.md | color-system.md, spacing-system.md | Run /extract-reference if URL provided |
| Component building | framework-tips.md | typography-system.md | Follow existing project patterns |
| Animation/motion | motion-system.md | framework-tips.md (Framer Motion) | Focus on ONE orchestrated moment |
| Visual polish | anti-patterns.md | evaluation-criteria.md | Run /evaluate-design after changes |
| Responsive layout | spacing-system.md | framework-tips.md | Test at 375, 768, 1280 breakpoints |
| Hebrew/RTL work | rtl-hebrew.md | typography-system.md | Run /rtl-validate before committing |
| Performance optimization | testing-verification.md | — | Target Lighthouse >= 90 |
| Visual testing/QA | visual-feedback.md | evaluation-criteria.md | Playwright MCP preferred |
| Design review | evaluation-criteria.md | anti-patterns.md | Run /audit or /critique |
| Final polish | anti-patterns.md | evaluation-criteria.md | Run /polish then /evaluate-design |

---

## CONTEXT.md Domain Section

When frontend consultation is accepted during `gsd discuss`, add this section to CONTEXT.md:

```markdown
## Domain Decisions
- **Domain**: Frontend
- **Framework**: [React+Vite / Next.js / Astro / Svelte / Other]
- **Styling**: [Tailwind / CSS Modules / styled-components / Other]
- **Animation Library**: [Framer Motion / CSS-only / GSAP / Lottie]
- **Design Direction**: [aesthetic description or "from reference URL"]
- **RTL**: [Yes/No/Bilingual]
- **Quality Target**: [Portfolio (85+) / Professional (70+) / Functional]
- **Reference URLs**: [list if any, or "none"]
- **Primary Sub-References**: [list of reference files for this phase]
- **Custom Fonts**: [if project uses custom fonts, list them]
- **Color Palette**: [if decided, list primary/accent/neutrals]
```

---

## PLAN-X.md Domain Tags

When planning frontend-aware tasks, use the `<domain-skill>` tag referencing frontend-super references:

```xml
<task type="human-verify">
  <name>Build hero section</name>
  <domain-skill>typography-system, spacing-system, motion-system</domain-skill>
  <files>src/components/sections/Hero.tsx, src/styles/tokens.css</files>
  <action>
    Follow typography-system.md for font selection and scale.
    Follow spacing-system.md for 8pt grid layout.
    Follow motion-system.md for Framer Motion staggered entrance.
    ...
  </action>
  <verify>npm run dev, navigate to /, run /evaluate-design /</verify>
  <expected>Hero renders, evaluation score >= 70</expected>
  <human-check>Visual design matches aesthetic direction from CONTEXT.md</human-check>
</task>
```

---

## Frontend 5-Step Workflow mapped to GSD Phases

```
Frontend Step 1: DESIGN SYSTEM  →  gsd discuss  (direction, fonts, colors, spacing)
Frontend Step 2: STRUCTURE      →  gsd execute Task 1  (layout, components, routing)
Frontend Step 3: VISUAL DESIGN  →  gsd execute Task 2  (styling, animation, polish)
Frontend Step 4: QA/TESTING     →  gsd verify  (responsive, a11y, performance)
Frontend Step 5: POLISH         →  gsd execute Task 3  (/progressive-refine, /polish)
```

For multi-phase frontend projects:
- **Phase 1**: Foundation (design tokens, layout structure, base components)
- **Phase 2**: Content sections (hero, features, about, contact — each a task)
- **Phase 3**: Animation & polish (motion system, visual refinement, /evaluate-design)
- **Phase 4**: QA (responsive, accessibility, performance, RTL validation)
