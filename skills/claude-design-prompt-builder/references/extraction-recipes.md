# Extraction Recipes — pulling design tokens from common stacks

For each stack: where to look, what to grep, and what to expect. Always extract — never guess.

## Tailwind CSS v4 (current standard)

**Where:** `src/index.css`, `src/main.css`, or wherever `@import "tailwindcss"` is.

**Look for:** `@theme { ... }` block.

```bash
# Grep recipe
rg -A 50 '@theme \{' src/index.css
```

**What you get:** All theme tokens declared with CSS-custom-property syntax. These ARE the design system.

```css
@theme {
  --color-primary: oklch(0.6 0.2 30);
  --font-serif: "Frank Ruhl Libre", serif;
  ...
}
```

**Note:** Tailwind v4 has NO `tailwind.config.js`. If you see one, it is either v3 or a leftover.

## Tailwind CSS v3 (legacy but common)

**Where:** `tailwind.config.js`, `tailwind.config.ts`, `tailwind.config.mjs`.

**Look for:** `theme.extend` (or `theme` for full overrides).

```bash
rg -A 100 'extend:|theme:' tailwind.config.*
```

**What you get:** Plain JS objects for `colors`, `fontFamily`, `spacing`, `borderRadius`, `boxShadow`, `screens`.

**Also check:** `globals.css` or equivalent for `:root` overrides that take precedence at runtime.

## Next.js (App Router) — Tailwind + CSS variables

**Where:**
- `app/globals.css` — `:root` and `@theme`
- `app/layout.tsx` — font loading via `next/font`
- `app/(routes)/.../page.tsx` — actual usage

**Font loading recipe:**
```bash
rg "from 'next/font" app/
rg 'Geist|Inter|Roboto|Frank_Ruhl_Libre|Heebo' app/layout.tsx
```

`next/font` rewrites font CSS — capture variable names like `--font-geist-sans` declared in layout's `className`.

## Next.js (Pages Router)

**Where:**
- `pages/_document.tsx` — `<link>` tags for Google Fonts
- `pages/_app.tsx` — global CSS imports
- `styles/globals.css`

## CSS-in-JS — styled-components / Emotion

**Where:** `theme.ts`, `theme.js`, `src/theme/`, `lib/theme.ts`.

```bash
rg -l "createGlobalStyle|ThemeProvider" src/
```

**What you get:** A nested object exported as `theme`. Look for `colors`, `fonts`, `space`, `breakpoints`, `radii`, `shadows`.

**Note:** values may use design-tokens like `'rgba(0,0,0,0.1)'` instead of OKLCH. Convert to hex/OKLCH in the output for clarity.

## Material UI (MUI)

**Where:** `theme/index.ts`, wherever `createTheme()` is called.

```bash
rg "createTheme|extendTheme" src/
```

**Recipe:** look at `palette.primary.main`, `palette.background.default`, `typography.h1`, etc.

## Chakra UI

**Where:** `theme.ts`, `chakra-theme.ts`, calls to `extendTheme`.

**Recipe:** `colors.{name}.{shade}`, `fonts.heading`, `fonts.body`, `space.{n}`, `radii.{name}`.

## Vanilla CSS

**Where:** `styles/`, `css/`, `assets/css/`, or any `.css` file at the root of the source tree.

```bash
# Find every CSS custom property declaration
rg ':root \{|--[a-z-]+:' --type css
```

**Risk:** declarations may live in many files with different specificities. The browser tells the truth — use Playwright `getComputedStyle` if extraction from source is ambiguous.

## SCSS / Sass

**Where:** `_variables.scss`, `_tokens.scss`, `_theme.scss`, `styles/abstracts/`.

**Recipe:** look for `$primary-color: ...`, `$font-stack-serif: ...`, `$spacing-unit: ...`.

## Vue (single-file components)

**Where:** `src/assets/styles/`, `src/styles/`, plus `<style>` blocks in `App.vue`.

```bash
rg ':root \{|@theme \{' src/
```

## Astro

**Where:** `src/styles/`, `src/layouts/Layout.astro` (often has global CSS), `astro.config.mjs` for integrations.

## Svelte / SvelteKit

**Where:** `src/app.css`, `src/routes/+layout.svelte` for `<style>`, `src/lib/styles/`.

## Component inventory recipes

```bash
# React/Next.js
rg --files src/components -t tsx -t jsx | head -50

# Vue
rg --files src/components -t vue | head -50

# Svelte
rg --files src/lib/components -t svelte | head -50
```

For each component, capture: name, file path, one-line purpose (read first 10 lines if not obvious).

## Page structure recipes

**React/Next.js (App Router):**
- Read `app/layout.tsx` for global structure (Navbar/Footer slots)
- Read `app/page.tsx` (homepage) for section composition

**React (Vite, no router):**
- Read `src/App.tsx` or `src/App.jsx` — usually composes sections in order

**Next.js (Pages Router):**
- Read `pages/index.tsx`

**Astro:**
- Read `src/pages/index.astro`

## RTL detection recipes

```bash
# Check HTML root
rg 'dir="rtl"|dir=\{("rtl")|<html lang="(he|ar)"' index.html app/ public/

# Check CSS
rg 'direction: rtl|direction:rtl' --type css

# Check for Hebrew/Arabic text in components (smoke test)
rg '[\u0590-\u05FF\u0600-\u06FF]' src/components/ -l
```

If ANY of these match → flag the project as RTL/non-Latin script and include the corresponding language block in `Notes`.

## When extraction is ambiguous

1. **Multiple competing systems** (e.g. theme.ts + tailwind.config.js + global.css all declaring `--color-primary` differently) → trust runtime: open the live site, sample with browser DevTools, ask user which is canonical.
2. **Tokens declared but never used** → still capture them; mark as `[DECLARED, USAGE NOT VERIFIED]` in audit-summary.md.
3. **Tokens used but never declared** (hex literals scattered through JSX) → capture the most-frequent values via grep counts, mark as `[INFERRED FROM USAGE]`.
