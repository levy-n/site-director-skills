---
name: frontend-super
description: Enforces distinctive, high-quality frontend design when building or reviewing web UI. Anti-AI-slop rules (banned fonts, extreme weight contrast, 8pt grid, OKLCH), JSON design scoring 0-100 with progressive refinement, CSS-first animation (scroll-driven, View Transitions) plus Motion/GSAP/Lenis, 3D web (Three.js/R3F/Spline), RTL/Hebrew typography, mobile UX, and performance budgets. Ships 14 on-demand playbooks (intake, evaluate, refine, polish, audits) and per-task reference files via progressive disclosure.
when_to_use: Building or styling any web UI — components, pages, hero sections, landing pages; design reviews and quality scoring; animation work; mobile or RTL/Hebrew frontends. Triggers — "design this", "make it look better", "improve the UI", "evaluate the design", "animation", "hero section", "עצב לי", "שפר את העיצוב", "תעשה את זה יפה", "בדוק את העיצוב", "אנימציות", "דף נחיתה", "RTL", "מובייל".
argument-hint: "[component-path or description of what to build]"
---

# Frontend Super-Skill

Distinctive design requires explicit constraints. ~400 tokens of focused guidance
dramatically improves output. GSD orchestrates the workflow; this skill provides
the design domain expertise.

**Path convention**: all `commands/`, `references/`, and `templates/` paths below are
relative to `${CLAUDE_SKILL_DIR}` (this skill's directory). Forward slashes always.

---

## Philosophy

1. **Anti-AI-slop**: Without explicit direction, output converges to Inter font, purple gradients, 3-column cards. Every project needs a BOLD aesthetic commitment BEFORE coding.
2. **Progressive disclosure**: 14 reference files + 14 playbooks. NEVER load all at once. Load only what the current task needs.
3. **Structured evaluation**: Design quality is scored 0-100 per category with JSON output. Not subjective "looks good."
4. **Performance is design**: A beautiful site that takes 5s to load is a failure. CSS-first animation, Islands architecture, and native browser APIs replace heavy JS libraries wherever possible.
5. **Creative disruption**: Before design brainstorming, read `~/.claude/skills/creative-seeds/seeds.md` and pick 3 random seeds to break pattern-thinking.
6. **Honest ceiling**: For brand expression, emotional resonance, and cultural sensitivity, flag for human designer review. AI excels at 80% of implementation; identify the 20% requiring human judgment, don't hide it.

---

## Playbooks (commands/ directory)

The `commands/` directory contains **playbooks**: step-by-step workflow files that Claude
loads and follows on demand. They are **NOT slash commands** — do not tell the user to
type `/evaluate-design`; instead, read the playbook file and execute it yourself when
the situation calls for it.

**Shorthand convention**: anywhere this skill (or a playbook) says "run `/name`", it means
"load `commands/<name>.md` and follow its steps" — never a real slash command.

### Start Here
| Playbook | Purpose |
|---|---|
| `commands/design-intake.md` | **Recommended first step.** Guided Hebrew questions (AskUserQuestion) that configure which references to load, playbook sequence, and score thresholds — then execute |

### Design Evaluation
| Playbook | Purpose |
|---|---|
| `commands/evaluate-design.md` | Score design quality 0-100 with structured JSON |
| `commands/progressive-refine.md` | Staged improvement: Layout > Typography > Color > Spacing > Motion |
| `commands/extract-reference.md` | Extract design principles from a reference URL |

### Critique & Polish
| Playbook | Purpose |
|---|---|
| `commands/audit.md` | Comprehensive 8-category design audit |
| `commands/critique.md` | Generator-Critic evaluation (read-only, no changes) |
| `commands/polish.md` | Final micro-detail pass (transitions, focus, touch targets) |
| `commands/bolder.md` | Strengthen visual hierarchy and distinctiveness |

### Development
| Playbook | Purpose |
|---|---|
| `commands/new-component.md` | Scaffold React component with TS, Tailwind, Motion, tests |
| `commands/fix-and-verify.md` | TDD bug fix with visual verification |
| `commands/responsive-check.md` | Test at 375px, 768px, 1280px breakpoints |
| `commands/perf-audit.md` | Lighthouse audit, fix top 3 issues |

### Mobile & RTL
| Playbook | Purpose |
|---|---|
| `commands/mobile-audit.md` | Mobile UX audit — thumb zones, touch targets, safe areas, performance |
| `commands/rtl-validate.md` | Validate CSS logical properties, Hebrew typography rules |

---

## Before Any Visual Work

**STOP. Do these steps before writing any visual code:**

### Recommended: run the design-intake playbook first

Load `commands/design-intake.md` and follow it. It asks 4 context questions + 1-2
follow-ups (in Hebrew, via AskUserQuestion), then auto-configures which references to
load, the playbook sequence, and score thresholds — and executes. This is the most
efficient entry point and prevents loading unnecessary references.

### Manual alternative (if intake is skipped)

1. **Commit to ONE aesthetic direction** — Not "clean and modern." Be specific: "warm editorial with serif headlines, cream backgrounds, watercolor textures, and staggered scroll reveals."
2. **Ask: "What makes this UNFORGETTABLE?"** — If you can't answer, the direction isn't bold enough.
3. **Check for `<frontend_aesthetics>` block** in the project's CLAUDE.md. If present, follow it strictly. If absent, create one using `templates/aesthetics-block.md`.
4. **If a reference URL is provided**: run the extract-reference playbook on it.

### Minimal Aesthetics Block (always enforce)

```xml
<frontend_aesthetics>
No AI slop. Ban Inter/Roboto/Arial. Extreme weight contrast (200 vs 800).
Size jumps 3x+. 8pt spacing grid. Internal <= external spacing.
OKLCH colors. Tinted neutrals. One orchestrated animation moment.
prefers-reduced-motion. Max 0.6s UI animations.
CSS-first: scroll-driven animations, View Transitions, anchor positioning before JS.
</frontend_aesthetics>
```

---

## Design System Quick Reference

### Typography
- **BANNED**: Inter, Roboto, Arial, Open Sans, system-ui (as primary)
- **Required**: Weight contrast 200 vs 800/900 (never 400 vs 600); size jumps 3x+ for headings
- **Preferred**: Variable fonts (single file, continuous weight/width range)
- **Hebrew**: No letter-spacing. No italics. Line-height 1.7-1.8.
- Full reference: `references/typography-system.md`

### Spacing
- **Base**: 8pt grid (4, 8, 12, 16, 24, 32, 48, 64, 96, 128)
- **CRITICAL**: Internal spacing <= external spacing (Gestalt proximity)
- **Sections**: 48-64px minimum between page sections
- Full reference: `references/spacing-system.md`

### Color
- **Rule**: 60/30/10 (dominant, secondary, accent); tinted neutrals (never pure gray)
- **Required**: WCAG AA contrast (4.5:1 body, 3:1 large)
- **Preferred**: OKLCH color space (perceptually uniform)
- Full reference: `references/color-system.md`

### Motion & Animation
- **Focus**: ONE orchestrated moment per section, not scattered animations
- **CSS-first**: CSS scroll-driven animations and View Transitions API before JS libraries
- **Libraries**: Motion (formerly Framer Motion) for React; GSAP for complex timelines; Lenis (~3KB) for smooth scroll
- **Limits**: Max 0.6s UI, 1.2s decorative. Transform + opacity only. `prefers-reduced-motion` required.
- Full reference: `references/motion-system.md`

### Modern CSS
- **Production-ready**: CSS nesting, `:has()`, container queries, scroll-driven animations, View Transitions
- **Progressive enhancement**: `@scope`, anchor positioning, `if()`, CSS Grid Lanes (masonry)
- **Rule**: Prefer native CSS features over JS libraries — smaller bundle, better performance
- Full reference: `references/css-2026.md`

---

## Reference Router

Load ONLY the reference file needed for your current task:

| Working on... | Load this reference |
|---|---|
| Font selection, type scale, font pairing | `references/typography-system.md` |
| Spacing, layout grid, composition | `references/spacing-system.md` |
| Color palette, themes, contrast | `references/color-system.md` |
| Animations, transitions, Motion/GSAP/Lenis | `references/motion-system.md` |
| Modern CSS: scroll animations, View Transitions, anchor positioning, @scope | `references/css-2026.md` |
| Hebrew/RTL site | `references/rtl-hebrew.md` |
| Mobile UX, touch targets, thumb zones, safe areas | `references/mobile-ux.md` |
| Design review, quality scoring rubric | `references/evaluation-criteria.md` |
| What NOT to do, common mistakes | `references/anti-patterns.md` |
| Chrome, Playwright MCP, Figma MCP | `references/visual-feedback.md` |
| React, Vite, Tailwind, framework tips | `references/framework-tips.md` |
| Testing, TDD, accessibility, Lighthouse | `references/testing-verification.md` |
| Performance optimization, Core Web Vitals, bundle size | `references/performance-optimization.md` |
| 3D web: Three.js, R3F, Spline, WebGPU | `references/3d-web.md` |

---

## Build-Verify-Iterate Loop

The core workflow for any visual frontend work:

1. Build the initial version.
2. Run the evaluate-design playbook → JSON score (0-100).
3. **Score >= 70** → run the polish playbook → DONE.
4. **Score < 70** → run the progressive-refine playbook (Layout > Typography > Color > Spacing > Motion), then re-evaluate.
5. Repeat up to 3 iterations. If still < 70, flag for human review instead of iterating further.

---

## Visual Feedback Setup

Claude Code cannot see the browser by default. Choose the right tool:

| Tool | Best For | Setup |
|------|----------|-------|
| `claude --chrome` | Daily dev, uses your auth | Install "Claude in Chrome" extension |
| Playwright MCP | CI/CD, automated testing, headless | `claude mcp add playwright -- cmd /c npx -y @playwright/mcp@latest` |
| Figma MCP | Design-to-code from Figma files | `claude mcp add --transport http figma https://mcp.figma.com/mcp` |
| Screenshot paste | Quick one-off visual checks | `Win+Shift+S` then `Ctrl+V` |

**Critical**: Say "use playwright MCP" explicitly the first time, or Claude may run Playwright via Bash instead.

Full reference: `references/visual-feedback.md`

---

## Context Management

**When to `/clear`**: between unrelated tasks; after correcting Claude 2+ times on the same issue; at ~80% context utilization; when Claude asks about things already discussed.

**Document & Clear** (preferred over `/compact`, which is opaque and lossy):
1. "Write your current plan and progress to `PROGRESS.md`"
2. `/clear`
3. "Read `PROGRESS.md` and continue"

---

## Animation Stack — Decision Matrix

| Need | Best Choice | Size | License |
|------|-------------|------|---------|
| Simple transitions | CSS-native / TailwindCSS Motion | 0-5KB | N/A |
| Scroll-driven effects | CSS `scroll-timeline` | 0KB | Native |
| Page transitions | View Transitions API | 0KB | Native |
| React project animations | Motion (formerly Framer Motion) | ~85KB | MIT |
| Complex scroll timelines | GSAP + ScrollTrigger | ~78KB | 100% free incl. all plugins (since v3.13 / Webflow acquisition) |
| Smooth scrolling | Lenis | ~3KB | MIT |
| 3D scene animation | Theatre.js | Varies | Apache 2.0 |
| Tooltip/dropdown positioning | CSS anchor positioning | 0KB | Native |

**Rule**: Always try CSS-native first. Add JS libraries only when CSS can't achieve the effect.

---

## Performance-First Design

Performance is not optional polish — it's a design constraint.

### CSS-First Replacement Matrix

| JS Library | CSS-Native Replacement | Savings |
|---|---|---|
| Scroll animation library (45KB+) | CSS `scroll-timeline` + `animation-timeline` | 45KB+ |
| Tooltip/dropdown positioning (200+ LOC) | CSS anchor positioning (4 lines) | Significant |
| Masonry layout library | CSS Grid Lanes (`display: grid-lanes`, Safari first; experimental elsewhere — feature-detect) | Library size |
| Page transition library | View Transitions API | Library size |
| `:has()` + conditional JS | CSS `:has()` selector | JS eliminated |

### Performance Targets

| Metric | Target | What it measures |
|--------|--------|-----------------|
| LCP | < 2.5s | Loading speed |
| INP | < 200ms | Responsiveness (replaced FID) |
| CLS | < 0.1 | Visual stability |
| Initial JS bundle | < 100KB | Bundle efficiency |

### Architecture for Speed
- **Islands Architecture** (Astro): Ships 0-15KB JS vs 85-250KB for typical Next.js
- **Variable fonts**: Single file replaces 4-6 weight files
- **CSS-first animation**: Zero JS overhead for scroll effects
- **AVIF/WebP images**: 50-80% smaller than JPEG/PNG

Full reference: `references/performance-optimization.md`

---

## 3D Web Quick Reference

| Scenario | Tool | Notes |
|----------|------|-------|
| Complex custom 3D | Three.js | Dominant ecosystem. WebGPURenderer production-ready (WebGL 2 fallback); WebGPU is Baseline in all major browsers |
| 3D in React app | React Three Fiber (R3F) | Declarative JSX for Three.js |
| Designer, no code | Spline | First animation in < 1 hour. Free plan available |
| 3D scene timeline | Theatre.js + Three.js | After Effects-level control in browser |

**Performance**: Draco compression = 90-95% geometry reduction. KTX2 = ~10x GPU memory reduction. LOD = 30-40% frame rate improvement.

Full reference: `references/3d-web.md`

---

## Design Trends That Stand Out

Reference these when committing to an aesthetic direction:

1. **Kinetic Typography** — Text that reacts to cursor, scroll, or audio. Hero identity, not decoration.
2. **Exaggerated Typographic Hierarchy** — Dramatically oversized type (200px+) juxtaposed with 14px text.
3. **Motion as Brand Identity** — Consistent easing curves, timing, and interaction patterns as recognizable as the logo.
4. **Scroll-Driven Storytelling** — Narrative flow replacing "sections stacked on a page."
5. **Dopamine Design** — Bright, saturated Y2K-inspired palettes replacing muted minimalism.
6. **3D Product Experiences** — Interactive models, scroll-triggered 3D, AR previews.
7. **Context-Aware Micro-Animations** — Animations responding to user behavior, not fixed timelines.

**Benchmark**: [Lando Norris site](https://landonorris.com) — Awwwards Site of the Year. Webflow + GSAP: reactive blob overlays, fluid animated background, GSAP-driven transitions, optimized despite rich animation.

---

## Component Library Recommendations

| Library | Style | Best For |
|---------|-------|----------|
| **shadcn/ui** | Copy-paste, fully owned | Maximum design control. You own every component |
| **Radix UI** | Unstyled primitives | Building completely custom design systems |
| **React Aria** | Accessible primitives | ARIA best practices baked in |
| **Magic UI** | Animated components | Text effects, animated borders |
| **Aceternity UI** | Dramatic scroll effects | 3D cards, spotlight, parallax |

**Rule**: Own your components. Use shadcn-style "copy into your project" approaches. Design tokens as the foundation — change the tokens, change the entire system.

---

## MediaWave Landing Page Integration

Integrates bidirectionally with `~/.claude/skills/mediawave-landing-page`.

### When MediaWave activates frontend-super:

| MediaWave Phase | Frontend-Super Integration |
|---|---|
| **Phase 2: Inspiration** | Run the extract-reference playbook on chosen reference URLs to produce the `<frontend_aesthetics>` block |
| **Phase 3: Design System** | `references/color-system.md` (OKLCH palette), `references/typography-system.md` (font pairing), `references/spacing-system.md` (Gestalt proximity) |
| **Phase 5: Build** | After each section (Hero, Features, Testimonials, CTA, FAQ, Contact), run evaluate-design. If score < 70, run progressive-refine |
| **Phase 5: Build (Motion)** | `references/motion-system.md` for Motion/Lenis implementation of animations found in Phase 3 |
| **Phase 5: Build (RTL)** | `references/rtl-hebrew.md` — more comprehensive than MediaWave's built-in RTL guide |
| **Phase 5: Build (Mobile)** | `references/mobile-ux.md` — detailed mobile reference MediaWave lacks |
| **Phase 6: Optimize** | Run perf-audit, mobile-audit, and rtl-validate playbooks as quality gates |

### What frontend-super gains from MediaWave:
- **Client workflow pipeline** (proposal, discovery, content collection, handoff)
- **Hebrew copywriting** patterns (StoryBrand, PAS/AIDA/4U) — MediaWave's `references/phase-4-copy.md`
- **SEO implementation** — MediaWave's `references/seo/`
- **Israeli legal compliance** (accessibility statement, privacy, terms) — MediaWave's `templates/`
- **Font research agent** and **animation research agent** (industry-specific, beyond standard Hebrew fonts)

### Cross-Reference Rule:
- Building a **client landing page** → suggest the MediaWave skill first
- Building **any frontend component/app** → use frontend-super
- Both coexist: MediaWave handles the business pipeline, frontend-super handles design quality

---

## GSD Integration

When used with GSD orchestration, this skill acts as a **Frontend Domain Profile**.

1. During `gsd init` / `gsd discuss`: GSD detects frontend keywords in PROJECT.md
2. Offers frontend domain consultation with 5 targeted questions
3. Saves design decisions to CONTEXT.md `## Domain Decisions` section
4. During `gsd plan`: task templates reference specific frontend-super references
5. During `gsd execute`: each task loads only the relevant reference files
6. During `gsd verify`: frontend verification checklist is appended to standard checks

### Integration files:
- `gsd-integration/frontend-domain-profile.md` — Detection, questions, routing
- `gsd-integration/task-templates.md` — XML task templates for PLAN-X.md
- `gsd-integration/verify-checklist.md` — Frontend verification checklist

### Context engineering:
- NEVER load all references at once (violates GSD context engineering principles)
- Each task loads: SKILL.md + 1-2 reference files (~200-500 lines each)

---

## Production Readiness Cross-Reference

For production deployment validation, use the **production-first** skill
(`~/.claude/skills/production-first`) — security, RLS, auth, CI/CD checklists — before
any deployment. It integrates with the GSD workflow.

---

## RTL Mode

When the project has `dir="rtl"` or is a Hebrew project:

1. **Always load** `references/rtl-hebrew.md` alongside any other reference
2. **CSS logical properties ONLY** — no margin-left/right, padding-left/right
3. **Hebrew typography**: no letter-spacing, no italics, line-height 1.7-1.8
4. **Font stack**: Hebrew font first (Heebo, Rubik, Assistant, Alef, or custom)
5. **Animations**: Enter from RIGHT (x: -20 instead of x: 20)
6. **Before committing**: run the rtl-validate playbook to catch violations

---

## Mobile UX Mode

When building mobile-first UI or optimizing for touch devices:

1. **Always load** `references/mobile-ux.md` as the primary mobile reference
2. **Thumb zone design**: Primary CTAs in bottom 30% of viewport
3. **Touch targets**: Minimum 44x44px (48px preferred), 8px spacing between targets
4. **Safe areas**: `viewport-fit=cover` meta tag + `env(safe-area-inset-*)` on fixed elements
5. **Typography**: `font-size: 1rem` (16px) minimum for body AND inputs (prevents iOS zoom)
6. **Viewport height**: Use `100dvh` instead of `100vh` (fixes mobile Safari)
7. **Performance**: Target < 500KB initial load, LCP < 2.5s on 4G
8. **Before shipping**: run the mobile-audit playbook for structured mobile scoring (0-100)

**Mobile + RTL**: For Hebrew/Arabic mobile projects, load BOTH `references/mobile-ux.md` AND `references/rtl-hebrew.md`. The mobile reference includes a dedicated RTL Mobile Considerations section.

---

## Windows Compatibility

Shell commands in this skill use Windows-compatible syntax: PowerShell/cmd (no bash-only
constructs like `chmod` or `source`), `npx` for tools (lighthouse, pa11y, tsc), `npm run`
for project scripts. File paths written in skill docs always use forward slashes.

---

## Templates

| Template | Purpose |
|---|---|
| `templates/claude-md-frontend.md` | CLAUDE.md template for React + Vite + Tailwind |
| `templates/aesthetics-block.md` | Aesthetics block snippets (full, minimal, Hebrew) |
| `templates/design-tokens-template.md` | CSS custom properties starter with Tailwind mapping |

---

## Limitations & Human Checkpoints

**Flag for human review when:**
- Brand expression requires emotional resonance beyond technical implementation
- Cultural context needs nuanced understanding (Hebrew idioms, regional preferences)
- Spatial layout decisions require precise visual alignment (AI spatial reasoning is limited)
- Dark mode color choices for complex component systems
- Design direction is "make it feel [emotion]" rather than "implement [specification]"

**What this skill does well:** design system consistency, anti-pattern and accessibility
catches, structured JSON evaluation, staged refinement, RTL/Hebrew technical compliance,
mobile UX auditing, modern CSS guidance, CSS-first performance, animation stack selection,
MediaWave integration for client landing pages.

---

## Memory

Cross-session learnings are stored in `MEMORY.md` (in this skill's directory). The
evaluate-design and audit playbooks may append notable findings there. Read it at session
start when working on a project with previous frontend-super history.
