# Framework-Specific Tips

## Table of Contents
- [React + Vite](#react--vite)
- [Framer Motion](#framer-motion)
- [Next.js](#nextjs)
- [Svelte and SvelteKit](#svelte-and-sveltekit)
- [Vue and Nuxt](#vue-and-nuxt)
- [Astro](#astro)
- [Tailwind CSS](#tailwind-css)
- [Responsive Design Patterns](#responsive-design-patterns)

---

## React + Vite

### Vite-Specific Patterns

**HMR (Hot Module Replacement):**
Vite HMR is fast by default. If you see full-page reloads, check:
- State is lost on edit: use React Fast Refresh (built-in with `@vitejs/plugin-react`)
- CSS changes should hot-update without reload
- Avoid side effects at module scope that don't play well with HMR

**Environment Variables:**
```tsx
// Vite uses VITE_ prefix (NOT REACT_APP_)
const apiUrl = import.meta.env.VITE_API_URL;

// Type safety: add to vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
}
```

**Code Splitting with React.lazy:**
```tsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

**Build Analysis:**
```powershell
# Analyze bundle size
npx vite-bundle-visualizer

# Or use rollup-plugin-visualizer in vite.config.ts
```

### Key React Patterns for Claude Code

**Eliminate waterfalls** -- Claude often writes sequential async calls:
```tsx
// BAD -- sequential
const user = await getUser(id);
const posts = await getPosts(user.id);

// GOOD -- parallel where possible
const [user, posts] = await Promise.all([
  getUser(id),
  getPosts(id)
]);
```

**Lazy state initialization:**
```tsx
// BAD -- runs JSON.parse on every render
const [data, setData] = useState(JSON.parse(localStorage.getItem('data')));

// GOOD -- runs only once
const [data, setData] = useState(() => JSON.parse(localStorage.getItem('data')));
```

**Testing with Vitest:**
```powershell
# Run tests
npx vitest

# Run with coverage
npx vitest --coverage

# Watch mode (default)
npx vitest --watch
```

Vitest is Vite-native and significantly faster than Jest for Vite projects.

---

## Framer Motion

Framer Motion is the primary animation library for React projects.

### Core API Quick Reference

```tsx
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";

// Basic animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
/>

// Spring physics (preferred for interactive)
<motion.button
  whileHover={{ scale: 1.04 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
/>

// Mount/unmount with AnimatePresence
<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key={uniqueKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

### Staggered Children Pattern

```tsx
const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

<motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  {items.map(i => <motion.div key={i.id} variants={item}>{i.content}</motion.div>)}
</motion.div>
```

### Scroll-Triggered with useInView

```tsx
const ref = useRef(null);
const isInView = useInView(ref, { once: true, margin: "-100px" });

<motion.div
  ref={ref}
  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
  transition={{ duration: 0.6 }}
/>
```

### Layout Animations

```tsx
// Shared element transitions
<motion.div layoutId={`card-${id}`}>
  <motion.h3 layoutId={`title-${id}`}>{title}</motion.h3>
</motion.div>
```

For the complete motion reference (spring tuning, easing curves, durations, accessibility, RTL), see `motion-system.md`.

---

## Next.js

### Server vs Client Components

Add to CLAUDE.md for Next.js projects:
```
Server Components by default. Add 'use client' ONLY for:
- useState, useEffect, or other hooks
- Event handlers (onClick, onChange)
- Browser-only APIs (localStorage, window)
```

### Next.js-Specific Warnings

- `middleware.ts` handles auth -- do not modify without explicit approval
- Route Groups `(groupName)` don't affect URL paths
- `loading.tsx` and `error.tsx` are convention files -- respect the naming
- `page.tsx` exports must be default exports (Next.js requirement)
- API routes in `/app/api/` use `NextRequest`/`NextResponse`, not Express

### Vercel React Best Practices Skill

```powershell
npx add-skill vercel-labs/agent-skills
```

Priority: 1. Eliminating Waterfalls, 2. Bundle Size, 3. Server-Side Performance.

---

## Svelte and SvelteKit

### MCP Server (Svelte 5 Syntax)

```powershell
claude mcp add --transport http --scope project svelte-llm https://svelte-llm.stanislav.garden/mcp/mcp
```

### Svelte 5 Runes Cheat Sheet

Claude frequently falls back to Svelte 4 syntax:
- `let count = $state(0)` -- NOT `let count = 0`
- `let double = $derived(count * 2)` -- NOT `$: double = count * 2`
- `$effect(() => { ... })` -- NOT `$: { ... }`
- `onclick={handler}` -- NOT `on:click={handler}`
- Props: `let { name, age = 25 } = $props()` -- NOT `export let name`

### SvelteKit Data Loading

Use `+page.server.ts` for server-only data (DB, secrets). Use `+page.ts` for universal data. Form mutations use form actions in `+page.server.ts`, not API routes.

---

## Vue and Nuxt

Add to CLAUDE.md for Nuxt projects:
```
Composition API with <script setup> only. No Options API.
Auto-imports enabled -- do NOT manually import ref, computed, reactive, watch, useRoute.
Data fetching: useFetch() or useAsyncData(). Never raw fetch() in components.
Server routes: /server/api/ with defineEventHandler.
```

Claude's common Nuxt mistake: adding unnecessary imports for auto-imported composables.

---

## Astro

### Island Architecture

```
Default to .astro components (zero client JS).
Interactive islands need explicit directives:
- client:load -- loads immediately (above fold interactions)
- client:visible -- loads when scrolled into view (below fold)
- client:idle -- loads when browser is idle (low priority)
- client:media="(min-width: 768px)" -- loads at breakpoint
```

### Content Collections

Content in `/src/content/` uses Zod schemas defined in `src/content/config.ts`. Querying: `getCollection('blog')` returns typed entries. Dynamic routes: use `getStaticPaths()` in `[...slug].astro`.

### Common Astro Mistake

Claude sometimes adds client-side JavaScript to Astro components that don't need it. Be explicit: "This component has no interactivity. Keep it as a pure .astro component with zero client JS."

---

## Tailwind CSS

### v4 Migration (Critical)

Tailwind v4 changed configuration completely:

```css
/* globals.css -- NOT tailwind.config.js */
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

---

## Responsive Design Patterns

### Breakpoints
```
Mobile-first: base styles = mobile.
sm: 640px, md: 768px, lg: 1024px, xl: 1280px.
Always start mobile, add complexity with breakpoint prefixes.
```

### Common Responsive Issues Claude Creates
- Fixed widths instead of fluid (`w-[400px]` -> `w-full max-w-md`)
- Forgetting to stack flex items on mobile (`flex-col md:flex-row`)
- Text too small on mobile (minimum 16px body)
- Touch targets too small (minimum 44x44px)
- Horizontal scroll from oversized elements
