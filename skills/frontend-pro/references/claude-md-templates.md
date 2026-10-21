# CLAUDE.md Templates for Frontend Projects

## Table of Contents
- [General Principles](#general-principles)
- [Next.js App Router Template](#nextjs-app-router-template)
- [React + Vite Template](#react--vite-template)
- [Astro Template](#astro-template)
- [Svelte/SvelteKit Template](#sveltesveltekit-template)
- [Vue/Nuxt Template](#vuenuxt-template)
- [Vanilla HTML/CSS/JS Template](#vanilla-htmlcssjs-template)
- [Multi-CLAUDE.md Strategy](#multi-claudemd-strategy)

## General Principles

Every line in CLAUDE.md costs context tokens. Apply these rules:

1. **Delete filler** — Remove anything Claude already knows (basic framework concepts)
2. **Be exact** — "Run `npm run dev` in `web/`" not "start the dev server"
3. **Warn explicitly** — "DO NOT EDIT `routeTree.gen.ts` — it is auto-generated"
4. **Define jargon** — If your team calls something "Wraps", define it
5. **Keep under 300 lines** — Use `@imports` for extended docs
6. **Review /init output** — Always heavily edit what `/init` generates
7. **Design/aesthetics blocks** — use the frontend-super skill's `templates/aesthetics-block.md`; do not duplicate design rules here

## Next.js App Router Template

```markdown
# Project: [Name]

Next.js 14+ App Router with [TypeScript/Prisma/Stripe/etc].

## Commands (run from project root)
- `npm run dev` — Dev server at localhost:3000
- `npm run build` — Production build
- `npm run test` — Jest unit tests
- `npm run test:e2e` — Playwright E2E tests
- `npm run lint` — ESLint + Prettier check

## Architecture
- `/app` — App Router pages, layouts, route groups
- `/app/api` — API routes (Route Handlers)
- `/components/ui` — Reusable UI primitives (Button, Card, Modal)
- `/components/features` — Feature-specific composed components
- `/lib` — Utilities, helpers, shared logic
- `/lib/db` — Database client and queries

## Patterns
- Server Components by default. Add 'use client' only when needed (hooks, events, browser APIs).
- Data fetching in Server Components or Route Handlers, never in Client Components directly.
- Use Next.js Image component for all images (optimization).
- Dynamic imports with `next/dynamic` for heavy client components.

## Styling
- Tailwind CSS utility classes only. No custom CSS files.
- Component variants via `cva` (class-variance-authority).
- Dark mode: use `dark:` prefix. Theme toggle in `/components/ui/ThemeToggle.tsx`.

## Warnings
- NEVER commit `.env.local` — contains API keys
- `/app/sitemap.ts` and `/app/robots.ts` are auto-generated
- Middleware in `middleware.ts` handles auth — do not bypass
```

## React + Vite Template

```markdown
# Project: [Name]

React 18+ with Vite, TypeScript strict mode.

## Commands
- `npm run dev` — Vite dev server at localhost:5173
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build
- `npm run test` — Vitest unit tests
- `npm run test:ui` — Vitest with browser UI

## Architecture
- `/src/pages` — Route-level components
- `/src/components/ui` — Shared UI primitives
- `/src/hooks` — Custom React hooks
- `/src/lib` — Utilities, API client, constants
- `/src/stores` — Zustand stores (if used)

## Patterns
- Named exports only, no default exports
- Co-locate tests: `Button.tsx` → `Button.test.tsx`
- Lazy load routes: `React.lazy(() => import('./pages/Dashboard'))`

## Styling
- Tailwind CSS. Configuration in `tailwind.config.ts`.
- No inline styles except dynamic values.
```

## Astro Template

```markdown
# Project: [Name]

Astro [version] with [React/Vue/Svelte] islands.

## Commands
- `npm run dev` — Dev server at localhost:4321
- `npm run build` — Static build to `dist/`
- `npm run preview` — Preview build

## Architecture
- `/src/pages` — File-based routing (.astro files)
- `/src/layouts` — Page layouts
- `/src/components` — Astro + framework components
- `/src/content` — Content collections (MDX/MD)
- `/public` — Static assets (copied as-is)

## Patterns
- Default to Astro components (zero JS). Use React/Vue only for interactive islands.
- Add `client:load` for immediately interactive, `client:visible` for below-fold.
- Content collections use Zod schemas in `src/content/config.ts`.
- Prefer `getStaticPaths()` for dynamic routes over SSR.
```

## Svelte/SvelteKit Template

```markdown
# Project: [Name]

SvelteKit with Svelte 5 runes syntax.

## Commands
- `npm run dev` — Dev server at localhost:5173
- `npm run build` — Build (adapter-auto)
- `npm run test` — Vitest + Playwright

## Architecture
- `/src/routes` — File-based routing (+page.svelte, +layout.svelte)
- `/src/lib` — Shared utilities ($lib alias)
- `/src/lib/components` — Reusable components

## Patterns
- Use Svelte 5 runes: `$state()`, `$derived()`, `$effect()` — NOT `let` reactivity
- Load data in `+page.server.ts` (server) or `+page.ts` (universal)
- Form actions in `+page.server.ts` for mutations
- Use `$lib/` alias for imports from lib directory
```

## Vue/Nuxt Template

```markdown
# Project: [Name]

Nuxt 3 with Vue 3 Composition API.

## Commands
- `npm run dev` — Dev server at localhost:3000
- `npm run build` — Production build
- `npm run generate` — Static generation

## Architecture
- `/pages` — File-based routing
- `/components` — Auto-imported components
- `/composables` — Auto-imported composables (useXxx)
- `/server/api` — Server API routes

## Patterns
- Composition API with `<script setup>` only. No Options API.
- Auto-imports enabled — do not manually import `ref`, `computed`, etc.
- Use `useFetch` or `useAsyncData` for data fetching, never raw `fetch` in components.
- Server routes in `/server/api/` use `defineEventHandler`.
```

## Vanilla HTML/CSS/JS Template

```markdown
# Project: [Name]

Static site. ES modules (`type="module"`). CSS custom properties for theming.
No build step. Progressive enhancement — core content works without JS.

## Structure
/index.html, /css/, /js/ (ES modules), /assets/ (images, fonts)
```

## Multi-CLAUDE.md Strategy

For monorepos, use multiple CLAUDE.md files: root for shared context, subdirectories for specifics.

```
project/
├── CLAUDE.md              # General: monorepo structure, shared commands
├── CLAUDE.local.md        # Personal prefs (gitignored)
├── frontend/CLAUDE.md     # Framework, components, styling
└── backend/CLAUDE.md      # API, database, auth
```

Use `@imports` to reference extended docs: `@docs/api-patterns.md`, `@docs/component-conventions.md`.
Claude loads the nearest CLAUDE.md based on working directory.
