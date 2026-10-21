# CLAUDE.md Template for Frontend Projects

> Copy this template into your project root as `CLAUDE.md`. Customize the bracketed values.
> Keep under 300 lines. Use `@imports` for extended docs.

---

```markdown
# Project: [Name]

[One-line description of the project]

## Commands
- `npm run dev` — Vite dev server at localhost:5173
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build
- `npm run test` — Vitest unit tests
- `npm run lint` — ESLint check
- `npm run type-check` — TypeScript strict check

## Architecture
- `/src/pages` or `/src/routes` — Route-level components
- `/src/components/ui` — Reusable UI primitives (Button, Card, Modal)
- `/src/components/sections` — Page sections (Hero, Features, Contact)
- `/src/components/layout` — Layout components (Header, Footer, Navigation)
- `/src/hooks` — Custom React hooks
- `/src/styles` — Global styles, tokens, font declarations
- `/src/assets` — Images, illustrations, SVGs
- `/src/utils` — Helper functions

## Tech Stack
- React 18 + Vite + TypeScript (strict mode)
- Tailwind CSS for styling
- Framer Motion for animations
- [Add any other libraries]

## Patterns
- Named exports only (no default exports)
- Co-locate tests: `Button.tsx` → `Button.test.tsx`
- Mobile-first responsive: base = mobile, add `md:` and `lg:`
- Lazy load routes: `React.lazy(() => import('./pages/Dashboard'))`
- CSS custom properties for design tokens (see `src/styles/tokens.css`)

## Styling Rules
- Tailwind utility classes only. No inline styles.
- Use design tokens from `src/styles/tokens.css` — never hardcode colors.
- No arbitrary Tailwind values like `w-[347px]` — use the design scale.

## Warnings
- NEVER commit `.env` or `.env.local`
- [Add project-specific warnings]

<frontend_aesthetics>
Avoid AI slop. Create distinctive, memorable interfaces.
Typography: Ban Inter/Roboto/Arial. Use [your display font] + [your body font]. Weight 200 vs 800. Size jumps 3x+.
Color: [Your palette description]. Dominant [color] + [accent]. OKLCH preferred. No purple gradients.
Motion: Framer Motion. Staggered reveals. Spring physics (stiffness 400). prefers-reduced-motion. Max 0.6s UI.
Layout: Asymmetric. Break grid where it serves content. 8pt spacing grid.
Spacing: Internal <= external (Gestalt). Section breaks 48-64px minimum.
Texture: [Grain overlay / gradient meshes / clean — pick one]. No flat solid backgrounds.
</frontend_aesthetics>
```

## For Hebrew/RTL Projects

Add these lines inside the template:

```markdown
## Hebrew & RTL
- ALL text in Hebrew. dir="rtl" on root html element. lang="he".
- CSS logical properties ONLY: margin-inline-start (not margin-left), etc.
- NEVER use letter-spacing on Hebrew text
- NEVER use italic on Hebrew — use bold for emphasis
- Line-height for Hebrew: 1.7-1.8
- Animation direction: enter from RIGHT
- Custom fonts in `/src/fonts/` — load Hebrew font first in stack
```

## For Existing Projects

When adding this to an existing project:
1. Run `npm run build` to verify current state
2. Document existing patterns (don't fight them)
3. Keep the aesthetics block focused on NEW work direction
4. Add warnings about files not to modify
