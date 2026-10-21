# Motion assets

Effect and lifecycle code for site-director, built on pattern-breaker's motion engine (`<skills>/pattern-breaker/assets/engine/motion-engine.js`, documented in `<skills>/pattern-breaker/references/motion-engine.md`). The rules behind them are in `<skill>/references/motion-system.md` and `<skill>/references/page-transitions.md`; this file says what each file is, how to copy it into a project, and how to test it.

`<skill>` is the site-director folder and `<skills>` the skills root, as defined in SKILL.md.

## Contents
1. The files
2. Pinned versions
3. The one-clock contract
4. Copy into an Astro site
5. Copy into a Next.js 16.4 site with Payload
6. Copy into a React and Vite site
7. Markup for each effect
8. Which storyboard effect uses which file
9. Testing

---

## 1. The files

| File | Export | Move | What it does |
|---|---|---|---|
| `motion/ink-mask.js` | `initInkMask(engine, svgEl, opts)` | T-06 | scroll-scrubbed ink reveal from a sketch to the finished image; SVG-internal mask; tiers live, baked, reduced |
| `motion/ink-cursor.js` | `initInkCursor(engine, opts)` | C-07 | 9 px canvas dot with a trail when fast, on top of the native cursor |
| `motion/ink-lens.js` | `initInkLens(engine, svgEl, opts)` | C-08 | footer lens: a circular SVG mask follows the mouse over the footer mark |
| `motion/fit-map.js` | `mapToRendered`, `placeMarkers`, `trackMarkers` | - | keeps DOM markers on target over an `object-fit` image at any viewport |
| `motion/keyboard-inertia.js` | `guardKeyboardInertia(engine)` | - | navigation keys, Tab and focus changes stop a Lenis glide at once |
| `motion/reduced-motion.css` | - | - | strict reduced motion and no-JS safety; view-transition animations off under reduce |
| `motion/*.d.ts` | - | - | types for the five `.js` modules (TypeScript without `allowJs`) |
| `astro/motion-boot.js` | `bootMotion(libs, registry, options)`, `defineMotion(name, init)` | - | the ClientRouter lifecycle: engine per page, persisted cursor, rebuild on preference change, stop switch |
| `astro/page-transition.css` | - | T-07 | diagonal RTL page mask on `::view-transition-old/new(root)`, first-load CSS entrance |
| `astro/BaseLayout.example.astro` | - | T-07 | the wiring: ClientRouter, CSS, persisted cursor layer, anchored header, the boot script |
| `next/SmoothScroll.tsx` | default `SmoothScroll`, `useMotionEngine`, `useStopAnimations` | - | the engine in the persistent frontend layout |
| `next/PageTransition.tsx` | `PageTransition` | T-07 | React 19.3 `<ViewTransition>` keyed by Link `transitionTypes` |
| `next/page-transition.css` | - | T-07 | the same wipe on React's view-transition classes, anchored header, curtain base style |
| `next/curtain.ts` | `cover`, `reveal`, `shouldUseCurtain`, `isCovered` | T-07 fallback | GSAP curtain where `startViewTransition` is missing |
| `next/TransitionLink.tsx` | `TransitionLink`, `Curtain` | T-07 fallback | Link `onNavigate` that covers, then `router.push`; the curtain element that lifts on pathname change |

What the boot assets already include: `astro/motion-boot.js` and `next/SmoothScroll.tsx` both create the engine, call `guardKeyboardInertia`, rebuild on `motion:preference` and provide the stop switch. On a React and Vite site you add the guard yourself (section 6).

## 2. Pinned versions

Verified 2026-10-15 (npm registry and the installed MediaWave code): gsap 3.15.0, @gsap/react 2.1.2, lenis 1.3.26 (2.0 only as dev builds, not for production), astro 7.3.8 (ClientRouter's lifecycle is the same from 5.16 to 7.3), next 16.4.1, react 19.3.1, payload 3.90.2.

- Pin exactly, no caret: `npm i -E gsap@3.15.0 lenis@1.3.26` (plus `@gsap/react@2.1.2` on React and Next). Every GSAP plugin comes from the same `gsap` package version.
- `<ViewTransition>` needs React 19.3 (19.2 does not export it). Next 16.3 removed `experimental.viewTransition`; delete it from `next.config`.

## 3. The one-clock contract

`gsap.ticker` is the only requestAnimationFrame loop on the page. Every asset here follows these rules, and so does anything new you write next to them:

1. **Receive the engine.** Use `engine.gsap`, `engine.ScrollTrigger`, `engine.onFrame`, `engine.damp`, `engine.addCleanup`, `engine.onViewportResize`, `engine.REDUCE`, `engine.FINE`, `engine.RTL`, `engine.PRERENDER`. Never import a second copy of gsap into an effect.
2. **Per-frame work goes through `engine.onFrame(job)`**, which returns `off()`. Join on input (pointermove, pointerenter, a scroll callback); call `off()` when settled. Settled means distance to target below a threshold (0.1 px or 0.1 viewBox units), never "this frame moved little": the first frame after a wake can move almost nothing.
3. **Frame-rate independent lerp:** `x += (target - x) * engine.damp(k)`, where `k` is the factor per 60 Hz frame.
4. **No requestAnimationFrame loop of your own.** One-shot deferrals (one frame to wait for layout) are fine.
5. **`init*` returns its cleanup and also registers it with `engine.addCleanup`.** The cleanup is idempotent: `useGSAP` reverts, `engine.destroy()` and a manual call can all run it.
6. **Strict reduced motion.** Under `engine.REDUCE` an effect shows its final state or does nothing: no Lenis, no scrub, no loop, no cursor, no pointer mask. The ink transition keeps one thing: an instant swap with hysteresis.
7. **Prerender writes nothing.** Under `engine.PRERENDER` return a no-op: a snapshot keeps every attribute and inline style.
8. **Pointer effects gate on capability:** `engine.FINE` plus `e.pointerType === 'mouse'` on every event, never the viewport width.
9. **SVG ids are generated per instance** (`url(#id)` resolves to the first match in the document).

## 4. Copy into an Astro site

Default stack (D1: Astro static + client-content-editor). Page transitions only when moving between pages is part of the story or something must persist (`<skill>/references/page-transitions.md` §1); without ClientRouter, `bootMotion` starts the engine at once and the page mask CSS is simply not used.

1. `npm i -E gsap@3.15.0 lenis@1.3.26`
2. Into `src/motion/`: `<skills>/pattern-breaker/assets/engine/motion-engine.js` (and its `.d.ts`), `astro/motion-boot.js`, `motion/keyboard-inertia.js`, `motion/ink-cursor.js` (motion-boot imports it), and each effect the storyboard uses (`ink-mask.js`, `ink-lens.js`, `fit-map.js`). Astro's base tsconfig has `allowJs`, so the `.d.ts` files are optional.
3. Into `src/styles/`: `motion/reduced-motion.css` and `astro/page-transition.css`.
4. `astro/BaseLayout.example.astro` becomes `src/layouts/BaseLayout.astro`. It imports the two CSS files and `lenis/dist/lenis.css`, renders `<ClientRouter />`, the persisted cursor layer (prop `cursor`, only with a dossier item), the anchored header and the boot script.
5. Each section registers its motion once and marks its element:

```astro
<section data-motion-scene="plan" data-chapter="measure" data-dossier="W04">
  <figure class="ink" data-ink>...</figure>
</section>
<script>
  import { defineMotion } from '../motion/motion-boot.js';
  import { initInkMask } from '../motion/ink-mask.js';
  defineMotion('plan', (engine, el) => initInkMask(engine, el.querySelector('svg')!, { id: 'plan' }));
</script>
```

Lifecycle facts the boot relies on: the engine is created on `astro:page-load` and destroyed on `astro:before-swap` (invisible: the old page is already a snapshot), Lenis is recreated per page because ClientRouter's root-attribute swap wipes its classes, string event names only. On the first load `astro:page-load` waits for window `load`, so the first-load entrance is CSS (`data-intro`, `data-intro="rise"` on the LCP element); intros after a navigation start from `page.ready`, which resolves when the wipe has finished. Section `init` functions run inside `engine.scene`, so their tweens and triggers die with the page; they must be synchronous. An init that throws is contained: the other sections still run, the error is rethrown outside the loop (console and error monitoring see it), and whatever it created before the throw is reverted with the page.

## 5. Copy into a Next.js 16.4 site with Payload

D1 when the CMS must live inside the site (Next 16.4 + Payload 3.90). Payload's template splits the app into route groups: `app/(payload)/` (the admin, its own root layout) and `app/(frontend)/` (the site). Motion lives only in `(frontend)`.

1. `npm i -E gsap@3.15.0 @gsap/react@2.1.2 lenis@1.3.26`
2. Into `src/components/motion/`: `motion-engine.js` and `motion-engine.d.ts` (pattern-breaker), `motion/keyboard-inertia.js` and `.d.ts`, each effect used (`.js` and `.d.ts`), `next/SmoothScroll.tsx`, `next/PageTransition.tsx`, and only for the fallback `next/curtain.ts` and `next/TransitionLink.tsx`.
3. `motion/reduced-motion.css` and `next/page-transition.css` next to them, imported once by the frontend layout.
4. Wire the frontend root layout:

```tsx
// app/(frontend)/layout.tsx (a Server Component)
import SmoothScroll from '@/components/motion/SmoothScroll';
import { Curtain } from '@/components/motion/TransitionLink'; // only with the curtain fallback
import '@/components/motion/reduced-motion.css';
import '@/components/motion/page-transition.css';

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <SmoothScroll>
          <header className="site-header" style={{ viewTransitionName: 'site-header' }}>...</header>
          {children}
          <Curtain />
        </SmoothScroll>
      </body>
    </html>
  );
}
```

5. Every `page.tsx` starts with `<PageTransition>` as its first child (never in a layout). Links carry `transitionTypes={['nav-forward']}` or `['nav-back']`; untyped navigations and the browser's back button swap instantly.
6. Scenes live in client components: `const engine = useMotionEngine();` then `useGSAP(() => { if (!engine || !ref.current) return; return initInkMask(engine, ref.current); }, { dependencies: [engine], revertOnUpdate: true });`. The engine is `null` on the server and the first client render; a rebuilt engine (OS setting, stop switch) re-runs the scene.
7. The curtain only where needed: `TransitionLink` uses it when `startViewTransition` is missing, or everywhere when `<html data-page-transition="curtain">` is set (an SVG-filter page edge, which view-transition snapshots cannot take; then drop `PageTransition`). A link to the same path (a query-only or `#hash`-only change) navigates without the curtain, because `<Curtain />` lifts only on a pathname change.

## 6. Copy into a React and Vite site

mediawave.co.il's own stack (React 18 + Vite + prerender). Use pattern-breaker's React adapter (`<skills>/pattern-breaker/assets/engine/react.tsx`: `MotionProvider`, `useScene`, `useMotionEngine`, `useStopAnimations`); there is no page-transition asset for this stack.

1. Copy `motion-engine.js`, `motion-engine.d.ts`, `react.tsx`, and the effects with their `.d.ts` files into `src/motion/` (Vite's react-ts template has no `allowJs`: without the `.d.ts` files the build fails with TS7016).
2. Effects run inside `useScene`, which returns their cleanup to `useGSAP`:

```tsx
const ref = useScene<HTMLElement>((engine, root) => initInkMask(engine, root.querySelector('svg')!, { id: 'plan' }));
```

3. Add the keyboard guard once, below `MotionProvider`:

```tsx
function KeyboardGuard() {
  const engine = useMotionEngine();
  useEffect(() => (engine ? guardKeyboardInertia(engine) : undefined), [engine]);
  return null;
}
```

4. On mediawave.co.il the two-tier CALM policy replaces the strict reduced-motion rule; these assets implement the strict rule for client sites.

## 7. Markup for each effect

**Ink transition (`ink-mask.js`).** The finished image is an SVG `<image data-ink-final>` inside the inline SVG; the sketch is an `<img>` under it (or an SVG `<image data-ink-sketch>` before it). The viewBox aspect equals the image aspect, and the sketch's `object-fit`/`object-position` match the SVG's `preserveAspectRatio`. Without JavaScript the finished image shows. Options: `direction` (`rtl` default on a Hebrew page, `ltr`, `down`, `center`), `live: false`, `safari: 'baked'`, `scale` (100), `octaves` (3), `start`/`end` (`'top 75%'`/`'bottom 35%'`), `id` (for `?at=<id>:0.5`). `data-ink-srcset="a.webp 800w, b.webp 1600w"` on an SVG image picks the file once at init. Never over a `<video>`; at most one live ink transition in the viewport.

```html
<figure class="ink" data-ink>
  <img class="ink__sketch" src="/img/plan-1600.webp" width="1600" height="1000" alt="...">
  <svg class="ink__svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <image data-ink-final href="/img/built-1600.webp" width="1600" height="1000" preserveAspectRatio="xMidYMid slice"/>
  </svg>
</figure>
```

**Cursor (`ink-cursor.js`).** Nothing in the markup on Next or Vite (it creates its canvas). On Astro with ClientRouter it draws on the persisted `.mw-cursor-layer canvas`; the layer's CSS (a fixed full-screen layer above the page and above the wipe) comes from `astro/page-transition.css`, so the layout adds none of its own. A canvas the cursor creates carries the `mw-cursor-layer` class too, so `reduced-motion.css` hides it when forced colours or reduced motion turn on mid-session. Its colour is the canvas's CSS `color`. Only with a dossier item; it counts toward the budget.

**Lens (`ink-lens.js`).** Inside the footer: an SVG with `<g data-lens-base>` (always visible) and `<g data-lens-ink visibility="hidden">` (revealed under the lens). The pointer area defaults to the closest `footer`.

**Fit map (`fit-map.js`).** The image and its markers share a positioned container; markers are `position: absolute; left: 0; top: 0; translate: -50% -50%`; `[data-clipped]` marks a point cropped away by `cover`. `trackMarkers(engine, img, [{ el, x, y }])` with source-image pixel coordinates.

## 8. Which storyboard effect uses which file

The storyboard's move column (`design/storyboard.rtl.md`) names moves by their `moves.md` ID:

| Storyboard entry | Files |
|---|---|
| T-06 ink mask transition | `motion/ink-mask.js` |
| C-07 canvas cursor accent | `motion/ink-cursor.js` (Astro: plus the persisted layer in the layout) |
| C-08 footer ink lens | `motion/ink-lens.js` |
| T-07 geometric page mask, Astro | `astro/page-transition.css`, `astro/motion-boot.js`, `astro/BaseLayout.example.astro` |
| T-07 geometric page mask, Next.js | `next/PageTransition.tsx`, `next/page-transition.css`, `next/SmoothScroll.tsx`; fallback `next/curtain.ts` + `next/TransitionLink.tsx` |
| a hero or chapter with markers over a photo or drawing | `motion/fit-map.js` |
| every project | `motion/reduced-motion.css`, `motion/keyboard-inertia.js` (the boot assets call it) |

## 9. Testing

Test every asset in headless Chrome with puppeteer before it ships in a project, and judge by numbers, not by eye:

- Serve a test page that imports the real engine and the real asset, with gsap and lenis from the project's `node_modules` (an import map works: `gsap`, `gsap/ScrollTrigger`, `gsap/SplitText`, `lenis` to their files). `node <skills>/pattern-breaker/scripts/serve.mjs <dir>` serves one folder.
- Force the media features through CDP, not the OS: headless Chrome follows the machine's reduced-motion setting. `Emulation.setEmulatedMedia` with `prefers-reduced-motion: no-preference` for motion tests and `reduce` for reduced tests (puppeteer's `emulateMediaFeatures` rejects `forced-colors`, so use the CDP call for that too).
- Screenshots with `captureBeyondViewport: false`; the clip is in document coordinates (add `scrollY`).

| Asset | Prove |
|---|---|
| ink-mask | coverage of the finished image's colour per scroll fraction 0, 0.1, 0.25, 0.5, 0.75, 0.9, 1 rises monotonically from 0 to 1 in each direction and tier; the revealed centroid starts at the right in `rtl`, at the left in `ltr`, at the top in `down`; the band is `display: none` at 0 and 1; under reduce, coverage is only 0 or 1 with the hysteresis sequence and zero tweens; cleanup removes the mask (no-JS state) |
| ink-cursor | `engine.frameJobCount` 0 at rest, 1 while moving, 0 once arrived, with the gsap ticker listener count back to its idle value; the dot's pixels centred on the pointer; more inked pixels while moving fast (trail); none after Tab or a touch pointer; canvas width at DPR 3 is twice the CSS width; no canvas under reduce or `forced-colors: active`; the canvas is `display: none` once forced colours turn on mid-session |
| ink-lens | radius reaches its value after the grow; the circle settles within 0.1 viewBox units of the pointer, also after scrolling with the pointer still (getScreenCTM per tick); radius 0 and no job after leaving; no mask under reduce |
| fit-map | each marker within 1 px of the rendered target (a coloured square in the source image found in a screenshot) at 1440x900 and after a live resize to 1440x700, for `cover` and `contain` and several `object-position` forms; `data-clipped` exactly on the markers whose square is cropped away |
| keyboard-inertia | a Tab keydown during a 2 s Lenis glide stops it where it is; without the guard the glide carries on |
| Astro boot and CSS | with Astro's events dispatched inside a real `document.startViewTransition`: `mw-wipe-rtl`/`mw-wipe-ltr` and `mw-drift` run for 800 ms on the root pseudo-elements; mid-wipe the new page covers the right side on forward, the left on back; after ten navigations the ticker listener and ScrollTrigger counts equal the first page's; the persisted canvas is the same node; with only the shipped CSS (no layer rule on the test page) the dot is drawn over a sticky header with a z-index, mid-wipe, and over the header mid-wipe; a section init that throws after creating a trigger leaves no trigger and no active GSAP context after the page ends; a reduced-motion change rebuilds a reduced engine; the stop switch survives the attribute swap; no `mw-` animation under reduce or the switch |
| Next CSS and curtain | the typed classes start the same keyframes; untyped and reduced navigations start none; `cover` covers from the right and calls back after 0.8 s; `reveal` hides; the failsafe lifts the curtain by itself within 5 s plus the reveal; under reduce `cover` calls back synchronously with no tween |
| types | `tsc --noEmit` (strict, `jsx: react-jsx`) over the Next files and the `.d.ts` files, and `checkJs` over the `.js` modules |

Verified 2026-10-15 in headless Chrome (puppeteer 24.37.3) with gsap 3.15.0 and lenis 1.3.26: every row above passed. Ink coverage at p 0.5 was 0.55 (rtl and ltr live), 0.52 (rtl baked), 0.48 (center live); the reduced sequence read 0, 0, 1, 1, 0, 0 with zero tweens; the cursor left the clock within 0.9 s of a 200 px move (lerp 0.18 to 0.1 px is about 38 frames); the lens settled within 0.1 units after a 40 px scroll; fit-map's worst error was 0.5 px over 40 visible markers, and the 8 cropped ones carried data-clipped; ten simulated navigations kept 2 ticker listeners and 2 ScrollTriggers; with only the shipped CSS the persisted cursor dot measured 64 px over a z-index 10 sticky header, mid-wipe, and over the header mid-wipe (0, 0 and 0 with the earlier layer rule); a section init that throws left 0 ScrollTriggers and no active GSAP context after two page views (2 leaked triggers and a stuck context with the earlier boot loop); a created cursor canvas went `display: none` when forced colours turned on mid-session. Not run: Safari, Firefox, a real Astro build, a real Next.js app, React 19 at runtime. The type check used TypeScript 5.6.3 with @types/react 18.3.27 plus local declaration shims for React 19.3's `ViewTransition` and for `next/link` and `next/navigation`. Profile the live ink filter on a real iPhone before shipping it there (WebKit bug 287982); pass `safari: 'baked'` if it drops frames.

**slop-scan.** pattern-breaker's slop-scan reports two second-order signals in a project copy of `ink-mask.js`: `grain-overlay` (the noise primitive) and `liquid-glass` (the displacement primitive). The file marks both lines. Replace each marker comment with a waiver naming the ink transition's decision row, for example `// slop-ok:grain-overlay decision:D9 ink edge noise, band-limited, hidden at rest, baked on touch`, and the report lists them under "waived by decision".
