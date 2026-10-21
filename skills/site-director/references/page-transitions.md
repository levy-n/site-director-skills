# Page transitions: Astro ClientRouter and Next.js ViewTransition

Read this when a multi-page site gets page transitions. The code is in `<skill>/assets/astro/` and `<skill>/assets/next/`; this file explains the lifecycles it relies on, the CSS, browser support, why there is no Barba, and how to test. Page transitions count as one standout moment in the motion budget (the whole system counts once).

## Contents
1. When a site gets page transitions
2. Astro: ClientRouter
3. Next.js 16.4: ViewTransition
4. Next.js fallback: the GSAP curtain
5. Browser support
6. Why not Barba on our stacks
7. QA matrix

---

## 1. When a site gets page transitions

| Site | Default |
|---|---|
| One page (most landing pages) | none |
| Astro static, multi-page, nothing must persist between pages | none: a full page load resets every trigger and needs no lifecycle code (pattern-breaker's default stack) |
| Astro, multi-page, where moving between pages is part of the story or something must persist (a cursor, audio, a persistent object) | ClientRouter + the geometric RTL page mask (§2) |
| Next.js 16.4 + Payload | React `<ViewTransition>` + Link `transitionTypes` (§3); the GSAP curtain only where `startViewTransition` is missing (§4) |
| mediawave.co.il (React 18 + Vite) | outside this file; a separate decision |

1. A page transition needs a dossier reason, like any standout moment (moving between rooms, sheets or stages of the client's work), and a decision row.
2. Native cross-document view transitions (`@view-transition { navigation: auto; }`) need no script, but Firefox does not run them and nothing can persist across the load. Use them only on a simple multi-page site with no persistent state; our assets target ClientRouter.
3. One mechanism per site. Never run the View Transition wipe and the curtain on the same navigation.

## 2. Astro: ClientRouter

Files: `<skill>/assets/astro/BaseLayout.example.astro` (the wiring), `<skill>/assets/astro/motion-boot.js` (`bootMotion(libs, registry)` and `defineMotion(name, init)`), `<skill>/assets/astro/page-transition.css` (the mask).

### Setup

- `import { ClientRouter } from 'astro:transitions'` and render `<ClientRouter />` in `<head>`.
- **No `transition:*` directive on `<html>`.** Any directive there renames the root snapshot from `root` to an Astro scope name, and every `::view-transition-*(root)` rule stops matching.
- **String event names only:** `astro:before-preparation`, `astro:after-preparation`, `astro:before-swap`, `astro:after-swap`, `astro:page-load`. Never import the `TRANSITION_*` constants or the `isTransition*Event` helpers: Astro 7 does not export them (Astro 5.16 still does), while the strings work on 5, 6 and 7.
- The runtime behaves the same from Astro 5.16 to 7.3. Upgrading: Astro 6 needs Node 22.12+ and Vite 7; Astro 7 needs Vite 8 and its Rust compiler, which turns unclosed tags into errors.

### The event order and what we do in each

| Event | When | We do |
|---|---|---|
| `astro:before-preparation` | a link was followed, before the fetch; cancelable; `to`, `direction`, `newDocument` and `loader` are writable | nothing by default (a GSAP overlay with an SVG-filter edge would start here, through the loader) |
| `astro:after-preparation` | the new page is fetched | nothing |
| `astro:before-swap` | inside `startViewTransition`'s update callback, after the old page was captured; not cancelable; exposes `viewTransition` and a replaceable `swap()` | destroy the page lifetime (`engine.destroy()`: Lenis, triggers, effects); keep `event.viewTransition.finished` |
| `astro:after-swap` | the DOM is swapped, before the new page's scripts run | nothing (persisted elements are already in place) |
| `astro:page-load` | after the new page's scripts ran; also on the first load, at window `load` | create the page lifetime |

### Two lifetimes

- **App lifetime:** bundled module scripts run once per full load, not on navigation. They hold what must survive: the cursor canvas inside a `transition:persist` element, and the `defineMotion` registry.
- **Page lifetime:** the engine (with its Lenis, ScrollTriggers and every section's effects) is created on `astro:page-load` and destroyed on `astro:before-swap`.
- **Section scripts register, they do not animate.** A component's `<script>` calls `defineMotion(name, init)` once; `init` runs for every page inside the page lifetime. Anything created outside it (an inline script, a `setInterval`, a stray ScrollTrigger) leaks across navigations. Inline scripts re-run on navigation only with `data-astro-rerun`.

```js
// The shape of motion-boot.js; use the asset, not this sketch.
document.addEventListener('astro:page-load', () => { /* new engine; run every registered init */ });
document.addEventListener('astro:before-swap', (event) => { /* engine.destroy(); keep event.viewTransition.finished */ });
```

### Why Lenis is recreated on every page

ClientRouter's root-attribute swap removes every attribute from `<html>`, `class` included, except `data-astro-transition*`, then copies the new document's attributes. Lenis puts its classes on `<html>` and re-applies them only when its own state changes, so one Lenis kept across navigations runs without `lenis` and `lenis-smooth` on the root. Destroying the engine in `astro:before-swap` and creating a new one in `astro:page-load` avoids that; Heron also recreates Lenis per page.

### Timing rules

- **Cleanup is invisible in `astro:before-swap`.** It runs after the old page was captured, so reverting pins and inline styles there is never seen. In browsers without View Transitions, the `animate` fallback fires `before-swap` before its fade-out, and a revert can show a jump; `<ClientRouter fallback="swap" />` avoids it. Never use `fallback="none"`: in a browser without View Transitions, `astro:page-load` would then never fire.
- **The first load is CSS.** On the first load `astro:page-load` waits for window `load`, every image included, so a first-load entrance that hides content until then flashes late. The first-load hero entrance is CSS only, and the LCP element is never hidden.
- **Intros after a navigation wait for the wipe:** start them after `event.viewTransition.finished` (captured in `astro:before-swap`).

### Persisted and anchored elements

- `transition:persist` moves the same DOM node into the new page, so its JS state survives; CSS animations inside it restart and iframes reload.
- The persisted cursor canvas gets a plain CSS `view-transition-name` with its group animation off, so the wipe does not carry it. (Whether `transition:persist` and `transition:name` combine on one element is unconfirmed, so the asset uses the CSS property.)
- The header gets `transition:name` and `transition:animate="none"`: Astro then emits `animation: none` and `mix-blend-mode: normal` for its group, so the header stays still above the wipe.

### The mask: `page-transition.css`

- Old and new pages overlap. The new page is revealed by a diagonal clip-path edge travelling **right to left on forward** navigation, mirrored on back through `html[data-astro-transition="back"]` (ClientRouter sets `data-astro-transition` to `forward` or `back` on `<html>` for the length of the transition). Duration 0.8 s.
- **`mix-blend-mode: normal`** on `::view-transition-old(root)` and `::view-transition-new(root)`: the default crossfade blends with `plus-lighter` and washes out the overlap.
- **`::view-transition { pointer-events: none; }`** keeps the page clickable during the wipe.
- Both clip-path keyframes keep the same vertex count (4), or the polygon does not interpolate.
- Astro wraps its own generated rules in `@layer astro`, so unlayered author CSS wins.
- **Our own reduced-motion rule.** Astro's built-in kill rule reaches the page only with `transition:*` directives, so the file carries `@media (prefers-reduced-motion: reduce)` setting every view-transition animation to none. Strict policy: no wipe at all, an instant swap. The boot code also rebuilds on `motion:preference`.
- **Clip-path cannot make an ink edge.** A turbulent, displaced edge cannot be applied to view-transition snapshots with CSS clip-path; that look needs a GSAP-driven SVG overlay started from the `before-preparation` loader, with all the filter costs of the ink transition.

### Prefetch

ClientRouter turns on `prefetchAll` unless `astro.config` sets `prefetch: false`. On media-heavy client sites, set `prefetch: false` and prefetch the few links that matter, or budget the bytes.

## 3. Next.js 16.4: ViewTransition

Files: `<skill>/assets/next/PageTransition.tsx` (`PageTransition`), `<skill>/assets/next/page-transition.css`, `<skill>/assets/next/SmoothScroll.tsx` (default export).

- **No flag.** `experimental.viewTransition` was removed in Next 16.3.0; left in `next.config` on 16.4.1 it only prints an "unrecognized key" warning. Delete it.
- **`import { ViewTransition } from 'react'`**: stable in React 19.3 (19.2 does not export it). The App Router runs Next's vendored React build, which exports it as well.
- **Types per link:** Link `transitionTypes` (Next 16.2+), and `router.push(href, { transitionTypes })` for programmatic navigation. We use `'nav-forward'` and `'nav-back'`; the default is `'none'`. Which links count as forward and which as back (deeper is forward, toward home is back) is one decision row.
- **The wrapper goes in every `page.tsx`, never in a layout.** Layouts persist and never enter or exit. `<PageTransition>` is the first child, before any DOM node, or enter and exit never fire. Only one mounted ViewTransition per name; never call `startViewTransition` yourself; React does not respect reduced motion by itself.
- **The header is anchored:** `viewTransitionName: 'site-header'` on the header, and in CSS its group gets `animation: none` and a z-index, its old snapshot `display: none`, its new snapshot `animation: none`.
- **Browser back and forward carry no transition types**, so the default `'none'` gives an instant swap. That is intended (Next's guide and React's popstate caveat agree); a named shared element can still morph.
- **The CSS:** the same RTL diagonal wipe on `::view-transition-new(.mw-wipe-rtl)` and its mirror class, the exiting page held underneath, the entering group above it by z-index (check the z-order in Safari), `mix-blend-mode: normal`, `::view-transition { pointer-events: none; }`, and our own reduced-motion rule.
- **The engine lives in the persistent frontend layout.** `SmoothScroll.tsx` is `'use client'`; it creates the engine inside `useGSAP` and destroys it on unmount, refreshes after each pathname change, and rebuilds on `motion:preference`. Render it after `{children}` in `app/(frontend)/layout.tsx`, so its route-change refresh runs after the new page's effects.
- **Never in Payload's admin.** Motion lives only in the `(frontend)` route group, never in the Payload route group.
- **Payload pins:** Payload 3.90.2 declares peer `next >=16.3.3 <17` and React ^19, so Next 15.5 is outside its range. Payload 4 (4.0.0-beta.1 published 2026-10-13, verified 2026-10-15) stays out of production until a decision row adopts it.
- **`template.tsx`:** a root template does not remount on nested navigation (`/blog/a` to `/blog/b`), so it never carries per-navigation hooks; use `usePathname` in a persistent layout component instead.
- `next-view-transitions` is not needed with Next 16.3+ and React 19.3 (our assessment, not an official deprecation).
- Above-the-fold initial states are CSS keyed to `html.motion-ready`, never `gsap.from` with opacity on server-rendered content (it flashes after hydration).
- Next scrolls to the top on navigation; with Lenis, `stopInertiaOnNavigate` stops the glide. If a jump still shows, scroll to 0 immediately in the pathname effect.

```tsx
// app/(frontend)/services/page.tsx: the wrapper is the first child, before any DOM node
export default function ServicesPage() {
  return (
    <PageTransition>
      <main id="main">{/* sections */}</main>
    </PageTransition>
  );
}
// <Link href="/services" transitionTypes={['nav-forward']}> ; router.push('/contact', { transitionTypes: ['nav-forward'] })
```

## 4. Next.js fallback: the GSAP curtain

Files: `<skill>/assets/next/curtain.ts` (`cover`, `reveal`) and `<skill>/assets/next/TransitionLink.tsx` (`TransitionLink`).

- Link `onNavigate` (Next 15.3+) runs only for client-side navigation and supports `preventDefault()`. The link prevents the navigation, the curtain covers the screen (its edge enters at the right and travels left, 0.8 s), then `router.push(href)`.
- The curtain is revealed when the pathname changes, from a component in the persistent layout (not `template.tsx`, which does not remount on nested navigation).
- **A 5 s failsafe** reveals the page anyway (failed fetch, same URL), and a **same-URL guard** skips the curtain when the link points at the current page.
- **Gate:** it runs only where `'startViewTransition' in document` is false. Remove the gate and drop `PageTransition` only when a transition needs an SVG-filter edge, which view-transition snapshots cannot take.
- Under reduced motion it does not animate: navigation is instant.

## 5. Browser support

Verified 2026-10-15 (MDN browser-compat-data; caniuse for the Firefox note):

| Feature | Chrome / Edge | Safari | Firefox |
|---|---|---|---|
| Same-document View Transitions (`document.startViewTransition`, what ClientRouter and React use) | 111 | 18 | 144 |
| Cross-document View Transitions (`@view-transition`) | 126 | 18.2 | none (caniuse marks 144+ partial; treat it as none) |
| `pageswap` / `pagereveal` events | 124 / 123 | 18.2 | none |
| Transition types (`startViewTransition` options, `:active-view-transition-type`) | 125 | 18.2 | 147 |
| `view-transition-class` | 125 | 18.2 | 144 |

Without support the site still works and simply does not animate. Firefox 144-146 has same-document transitions but no types, so typed React transitions must degrade to no animation there (test it). Astro's `animate` fallback animates only elements with directives; everything else swaps instantly.

## 6. Why not Barba on our stacks

Heron used Barba in sync mode (old and new containers in the DOM together), the prefetch plugin, `preventRunning: true`, a 5 s timeout, and a geometric mask driven by CSS variables tweened on `html` over 0.8 s. On Webflow, which has no router, that is a reasonable choice. On our stacks it is not:

1. **Astro ClientRouter and the Next App Router already own routing.** Barba intercepts links and swaps containers itself, so a second router fights the first, and their lifecycle hooks (`astro:page-load`, `useGSAP` cleanup) stop matching what is on screen.
2. **View Transitions already give the overlap.** Old and new pages overlap natively, as snapshots animated by CSS, so no script runs per frame while the new page is swapped in and hydrated.
3. **We keep what the frameworks provide:** `transition:persist` for the cursor, built-in prefetch, history handling, and Astro's announcement of the new page to screen readers.
4. **Heron's own code shows the cost of hand-rolled transitions:** its leave and enter timelines tween two differently spelled variables (`--size--line` and `--size-line`), and SVG ids must be unique per container, because `url(#id)` resolves to the first match while both pages are in the DOM.

If a project ever uses Barba (a plain HTML site with no router), pin `@barba/core` 2.10.3 exactly and keep every SVG id unique per container.

## 7. QA matrix

Browsers: Chrome stable, Safari 18.2+ on macOS and a real iPhone, Firefox 144-146 (no types) and Firefox 147+. Each row below runs with motion on, then again with reduced motion on.

| Case | Expected |
|---|---|
| Forward link | right-to-left diagonal wipe, 0.8 s; header and cursor do not move |
| Back link (typed `nav-back`) or Astro back navigation | the mirrored wipe |
| Browser back button, Next.js | instant swap (no types) |
| Rapid double navigation | no stuck overlay; Astro aborts and skips the earlier transition |
| Link to the current URL | no curtain, no wipe |
| Back or forward from the browser's page cache, after a transition that covered the page before a full page load | the page opens again (reveal or instant), never left covered: on `pageshow` with `event.persisted`, take down every cover, CSS class and canvas state the leave set (mediawave.co.il shipped a cream page on back, D164). Test with `page.goBack()` and check `persisted` |
| Slow or failed fetch (curtain) | the failsafe reveals the page within 5 s |
| Reduced motion on | no wipe, no curtain animation; instant swap |
| Keyboard navigation | focus lands on the new page; the route is announced (Astro) |
| Ten navigations in a row | `ScrollTrigger.getAll().length` and the gsap ticker listener count match the first page: nothing leaks |
| After a navigation (Astro) | the new Lenis is running and its classes are on `<html>`; the page starts at the top |
| A link to `#id` on another page | lands below the header, focus on the target |
| Very long and very short Hebrew content on the new page | triggers measured correctly after the swap (the content-height watch refreshed) |
| Console | no errors or logs on any navigation |

Capture with `MSYS_NO_PATHCONV=1 node <skill>/scripts/shots.mjs <url> --out design/shots --paths /,/about` (in Git Bash the prefix stops `/` from turning into a Windows path) and film each page with `node <skills>/pattern-breaker/scripts/scroll-film.mjs <url> --viewports desktop,short,mobile`.
