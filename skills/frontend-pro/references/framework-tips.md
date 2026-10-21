# Framework-Specific Tips

## Table of Contents
- [React and Next.js](#react-and-nextjs)
- [Svelte and SvelteKit](#svelte-and-sveltekit)
- [Vue and Nuxt](#vue-and-nuxt)
- [Astro](#astro)
- [Tailwind CSS](#tailwind-css)
- [Responsive Design Patterns](#responsive-design-patterns)

## React and Next.js

### Vercel React Best Practices Skill

Install the official Vercel skill (45 rules, 8 categories):

```bash
npx add-skill vercel-labs/agent-skills
```

Priority order:
1. **Critical** — Eliminating Waterfalls, Bundle Size Optimization
2. **High** — Server-Side Performance
3. **Medium** — Client-Side Data Fetching, State Management

### Key Patterns for Claude Code

**Eliminate waterfalls** — Claude often writes sequential async calls:
```tsx
// ❌ Claude's default — sequential
const user = await getUser(id);
const posts = await getPosts(user.id);
const comments = await getComments(posts[0].id);

// ✅ Parallel where possible
const [user, posts] = await Promise.all([
  getUser(id),
  getPosts(id)
]);
```

**Lazy state initialization** — Claude forgets this:
```tsx
// ❌ Runs JSON.parse on every render
const [data, setData] = useState(JSON.parse(localStorage.getItem('data')));

// ✅ Runs only once
const [data, setData] = useState(() => JSON.parse(localStorage.getItem('data')));
```

**Server vs Client Components** — Add to CLAUDE.md:
```
Server Components by default. Add 'use client' ONLY for:
- useState, useEffect, or other hooks
- Event handlers (onClick, onChange)
- Browser-only APIs (localStorage, window)
```

### Large File Handling

Claude Code handles files up to 18K+ lines. Don't split files just because they're large —
split for architectural reasons. When working with large components:
```
"Read the entire file first. Understand the structure before making changes.
Only modify the specific section related to [task]. Do not refactor unrelated code."
```

### Next.js-Specific Warnings

Add to CLAUDE.md for Next.js projects:
- `middleware.ts` handles auth — do not modify without explicit approval
- Route Groups `(groupName)` don't affect URL paths
- `loading.tsx` and `error.tsx` are convention files — respect the naming
- `page.tsx` exports must be default exports (Next.js requirement)
- API routes in `/app/api/` use `NextRequest`/`NextResponse`, not Express

## Svelte and SvelteKit

### MCP Server (Svelte 5 Syntax)

```bash
claude mcp add --transport http --scope project svelte-llm https://svelte-llm.stanislav.garden/mcp/mcp
```

Provides up-to-date Svelte 5 runes syntax, which Claude's training data may not fully cover.

### Svelte 5 Runes Cheat Sheet

Add to CLAUDE.md — Claude frequently falls back to Svelte 4 syntax:

```markdown
## Svelte 5 Runes (REQUIRED)
- `let count = $state(0)` — NOT `let count = 0`
- `let double = $derived(count * 2)` — NOT `$: double = count * 2`
- `$effect(() => { ... })` — NOT `$: { ... }`
- `onclick={handler}` — NOT `on:click={handler}`
- Props: `let { name, age = 25 } = $props()` — NOT `export let name`
```

### SvelteKit Data Loading

```
Use +page.server.ts for data that needs the server (DB, secrets).
Use +page.ts for data that can run anywhere.
Form mutations use form actions in +page.server.ts, not API routes.
```

### Community Skills

Scott Spences maintains Svelte-specific Claude skills:
`github.com/spences10/svelte-claude-skills` — covers component patterns, store usage, transitions.

## Vue and Nuxt

Add to CLAUDE.md for Nuxt projects:

```markdown
Composition API with <script setup> only. No Options API.
Auto-imports enabled — do NOT manually import ref, computed, reactive, watch, useRoute.
Data fetching: useFetch() or useAsyncData(). Never raw fetch() in components.
Server routes: /server/api/ with defineEventHandler.
```

Claude's common Nuxt mistake: adding unnecessary imports for auto-imported composables.

## Astro

### Island Architecture

Add to CLAUDE.md:
```markdown
Default to .astro components (zero client JS).
Interactive islands need explicit directives:
- client:load — loads immediately (above fold interactions)
- client:visible — loads when scrolled into view (below fold)
- client:idle — loads when browser is idle (low priority)
- client:media="(min-width: 768px)" — loads at breakpoint
```

### Content Collections

```markdown
Content in /src/content/ uses Zod schemas defined in src/content/config.ts.
Querying: getCollection('blog') returns typed entries.
Dynamic routes: use getStaticPaths() in [...slug].astro.
```

### Common Astro Mistake

Claude sometimes adds client-side JavaScript to Astro components that don't need it.
Be explicit: "This component has no interactivity. Keep it as a pure .astro component
with zero client JS."

## Tailwind CSS

### v4 Migration (Critical)

Tailwind v4 changed configuration completely. Add to CLAUDE.md:

```markdown
## Tailwind CSS v4
Config is in globals.css, NOT tailwind.config.js:

@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --color-primary: #6f53b8;
  --color-accent: #ff2d55;
  --font-display: "Bricolage Grotesque", sans-serif;
  --breakpoint-sm: 640px;
}
```

### What Claude Gets Wrong with Tailwind
- Uses v3 config syntax in v4 projects (always specify version in CLAUDE.md)
- Overuses arbitrary values `w-[347px]` instead of design tokens
- Forgets responsive prefixes (remind: "mobile-first, add `md:` and `lg:`")
- Inconsistent spacing (enforce Tailwind's scale: 4, 8, 12, 16)

### Warning from Tailwind's Creator
Adam Wathan found AI was 50% slower for bulk visual tasks like adding dark mode to 600+ components. For repetitive style changes, use find-and-replace or PostCSS transforms instead.

## Responsive Design Patterns

Add to CLAUDE.md:
```markdown
Mobile-first: base styles = mobile. sm: 640px, md: 768px, lg: 1024px, xl: 1280px.
Always start mobile, add complexity with breakpoint prefixes.
```

### Common Responsive Issues Claude Creates
- Fixed widths instead of fluid (`w-[400px]` → `w-full max-w-md`)
- Forgetting to stack flex items on mobile (`flex-col md:flex-row`)
- Text too small on mobile (minimum 16px body)
- Touch targets too small (minimum 44x44px)
- Horizontal scroll from oversized elements
