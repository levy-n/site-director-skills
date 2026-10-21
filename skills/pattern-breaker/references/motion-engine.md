# Motion engine: making scroll choreography smooth, correct and safe

Read this when setting up motion in a project (greenfield foundations, upgrade wave W0) and when something scroll-related misbehaves (§10 is a symptom index). The starting code is `assets/engine/motion-engine.js` (+ `react.tsx`); this file explains what it settles and why. Versions and behaviours were verified on 2026-10-05 against npm, the installed type definitions and a headless test harness.

## Contents
1. The stack and its cost
2. What the engine settles once
3. Lenis: configuration and when not to use it
4. Holds: sticky stages, not pins
5. Refresh discipline
6. Text splitting
7. Two motion classes, derived state
8. Native CSS: scroll-driven animations and View Transitions
9. Media: image sequences and video scrubbing
10. Reduced motion, prerender and no-JS
11. Frameworks: React, Next.js, Astro
12. Symptom → cause → fix
13. Hooks for effects: onFrame, damp, addCleanup, onViewportResize

---

## 1. The stack and its cost

| Package | Version (2026-10) | Licence |
|---|---|---|
| `gsap` (ScrollTrigger, SplitText, Flip, Observer, DrawSVG, MorphSVG… all in the public package) | 3.15.0 | Standard no-charge licence: free for commercial sites including every plugin; the only prohibited use is building a no-code animation builder that competes with Webflow. Never generate `.npmrc` registry tokens: there is no paid registry anymore |
| `@gsap/react` (`useGSAP`) | 2.1.2 | same |
| `lenis` (not the deprecated `@studio-freight/lenis`) | 1.3.26 | MIT |
| `motion` (React state motion) | pinned in foundations.md §2 | MIT |

Measured cost (minified, gzip): gsap + ScrollTrigger + SplitText + Lenis ≈ 52 KB, about three quarters of React 19 itself. Nothing in it is needed for the first frame, so load it with a dynamic `import()` after first paint (an idle callback or `load` + a short delay) and never let it block LCP (foundations.md §5 has the loader). A page that only needs reveal-on-view plus one progress bar doesn't need GSAP at all: Motion's `inView` is 0.4 KB and CSS scroll-driven animations are free (§8).

GSAP 3.15 adds `easeReverse` (a different ease when a tween plays backwards; `yoyoEase` is deprecated). GSAP 3.13 rewrote SplitText: old snippets using `position: "absolute"` or `lineThreshold` are wrong.

## 2. What the engine settles once

| Setting | Why |
|---|---|
| Lenis on GSAP's ticker (`lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`), one driver only: `autoRaf: false` is forced after `options.lenis` is spread | one clock for scroll and animation; two rAF loops fight. `lenis/react` defaults `autoRaf` to true, so a copied option is easy to pass (measured with it: Lenis queued its own frame 189 times in 300 ms on top of the ticker) |
| `destroy()` sets `gsap.ticker.lagSmoothing(500, 33)` back when the engine had set it to 0, clears a pending refresh and the `load` listener | lag smoothing is global and setter-only in GSAP 3.15 (no getter), so GSAP's documented default is restored; a route without Lenis keeps it otherwise |
| Content-height watch: a `ResizeObserver` on `body` calls `safeRefresh()` 200 ms after `scrollHeight` last changed by more than 1 px, and re-reads the height on ScrollTrigger's `refresh` event (`watchContent: false` turns it off) | ScrollTrigger re-measures on resize, load and visibility changes only and has no ResizeObserver: CMS edits, late images and lazy sections leave triggers stale. Measured in the selftest fixture: without the re-read, a refresh that grows a pin answers itself forever (5 refreshes a second); without the 200 ms wait, 20 frames of an animated height gave 19 refreshes instead of 1 |
| OS reduced-motion changes while the page is open: `options.onPreferenceChange(reduce)` and a `motion:preference` window event (`detail.reduce`) | the engine never patches itself into the other mode; the boot code calls `destroy()` and creates a new engine, as for the in-page switch (§10) |
| Lenis only when motion is allowed; `syncTouch: false` | phones keep native momentum scrolling |
| `html.style.scrollBehavior = 'auto'` while Lenis runs | native smoothing double-smooths anchors and focus scrolls |
| `ScrollTrigger.config({ ignoreMobileResize: true })` + refresh only after the finger lifts and scroll is calm for 350 ms + resize handlers react to width only | the iOS address bar resizes the viewport mid-scroll; refreshing then rebuilds every scene mid-gesture and the page "gets stuck and jumps back" (the reference site's author hit exactly this) |
| Refresh after `document.fonts.ready` and on every `loadingdone` | measured: a late font swap left every trigger below it 74 px late |
| `html.motion-ready` added only by the engine | hidden "before" states exist only once JS runs: crawlers, no-JS visitors and prerender snapshots get visible content |
| `window.__PRERENDER__` (set by the prerender script) or `?reduce=1` forces the reduced path | prerender must capture the final, visible state; QA can screenshot the static version |
| `?at=<px>` or `?at=<sceneId>:<0..1>` QA jump (the scene form needs `id` on the scene's main trigger; a missing id sets `html[data-at="missing:…"]`) | deterministic screenshots of any scroll state; the scene form survives layout changes |
| `scene()` wraps code in `gsap.context`; `destroy()` reverts everything | route changes and React unmounts must not leak triggers or spacers |
| Velocity as a decaying, clamped signal (`getVelocity()`) | skew and marquee speed-ups return to rest instead of sticking |
| `playInView(video)` | video loads and plays only while visible and shows only once a frame is painting |

## 3. Lenis: configuration and when not to use it

Defaults that work: `lerp: 0.1` (0.08-0.12 feels premium; under 0.05 feels laggy), `wheelMultiplier: 1`, `syncTouch: false`, `stopInertiaOnNavigate: true`. Lenis 1.3.26 respects reduced motion by default (`respectReducedMotion: true`: lerp forced to 1, programmatic scrolls instant); the engine goes further and doesn't create it at all under reduced motion.

Lenis runs on native scroll (it writes the real scroll position each frame), so `position: sticky`, `position: fixed`, IntersectionObserver, CSS scroll-driven animations, find-in-page and anchors keep working. Import its CSS (`import 'lenis/dist/lenis.css'`) instead of hand-copying it.

- Inner scrollers (menus, modals, long tables): add `data-lenis-prevent`, or the wheel scrolls the page behind them. (`allowNestedScroll: true` does it automatically but walks the DOM on every wheel event.)
- Overlays: `lenis.stop()` / `lenis.start()` (the engine's `lock()` / `unlock()`).
- Anchors under a fixed header: `html { scroll-padding-top: <header height + gap> }`, and nothing else. For element targets Lenis 1.3 subtracts the root's scroll-padding (and the target's scroll-margin) and then adds any `offset`, and native scrolling honours scroll-padding too, so with it alone anchors land in the same place with and without Lenis, and focused elements clear the header (WCAG 2.4.11). The engine's `anchorOffset` (default 0) is an extra offset on top, for one target that must sit lower; used as the header offset, it or Lenis `anchors: { offset }` doubles it (measured: 153 px with motion against 80 px reduced). The engine's anchor handler moves focus to the target.
- Limits: no CSS scroll-snap (use `lenis/snap`); capped at 60 fps on Safari (30 in Low Power Mode); iframes swallow wheel events.

Don't use Lenis on content and utility pages (articles, legal pages, forms), on pages whose motion is pure CSS scroll-driven animation, or on pages with at most one scrubbed set-piece: native scroll is better for accessibility and battery there. Pass `{ smooth: false }` to the engine.

With Lenis, keep `scrub` at `true` or ≤ 0.8; Lenis already smooths the input, and a large scrub on top of it feels mushy.

## 4. Holds: sticky stages, not pins

| | `pin: true` (default) | `pin` + `pinType: 'transform'` | CSS sticky stage + ScrollTrigger reading progress |
|---|---|---|---|
| DOM | wraps the element in `.pin-spacer` with padding | same spacer | none |
| CLS while scrolling (measured, 2-scene page) | 3.6 desktop, 3.9 mobile | 0 | 0 |
| Breaks when | an ancestor has `transform`, `filter` or `will-change: transform` | same | an ancestor has `overflow: hidden/auto/scroll` (use `overflow: clip`) |
| Verdict | avoid | acceptable with Lenis | **default** |

Scrolling is not "recent input" for CLS, so field data (CrUX) records those pin shifts even though a lab Lighthouse run (which doesn't scroll) never sees them. The engine's `holdTimeline(wrapper)` builds the default: the wrapper's height sets the scroll distance, the stage is `position: sticky; top: 0; height: 100svh; overflow: clip`, and the timeline uses `start: 'top top', end: 'bottom bottom'`.

Use `pin` only when sticky can't work (an ancestor with overflow you cannot change, or pin reparenting). Then: `pinType: 'transform'`, `anticipatePin: 1`, never animate the pinned element itself (animate its children), and measure CLS with motion-audit. Never nest pins.

Horizontal tracks: translate the track inside a sticky stage; distance = `track.scrollWidth - stage.clientWidth` (not `innerWidth`, which includes the scrollbar on Windows); RTL needs a positive `x`; use function values with `invalidateOnRefresh: true`. For triggers on panels inside the moving track, use `containerAnimation` (the track tween must use `ease: 'none'`; no pin or snap on those triggers) and swap the edges in RTL (`start: 'right center'` instead of `'left center'`); LTR edges on an RTL page fire in an 8 px window or never.

## 5. Refresh discipline

1. Create ScrollTriggers in page order, top to bottom. A pin created later above an existing trigger shifts it: fix with `refreshPriority` or `ScrollTrigger.sort()` then `refresh()`.
2. Never put `content-visibility: auto` on a section with ScrollTrigger scenes: it makes the browser report the section as if it were `display: none`, so its scenes measure zero and never fire. It is a common Lighthouse "optimisation" that silently kills scroll scenes.
3. Refresh after anything that changes layout late: fonts and any change of the page height (the engine handles both: the font listeners and the content-height watch, §2), images without dimensions (give every image width/height or aspect-ratio anyway, for CLS). A layout change that keeps the page height (a sidebar opening beside the content) still needs `engine.safeRefresh()`.
4. Register every plugin (`gsap.registerPlugin(ScrollTrigger, SplitText, …)`): production tree-shaking drops unregistered plugins, so it works in dev and dies in production.
5. `fastScrollEnd: true` on toggle-type reveals so a fast fling never leaves a half-finished state; `once: true` for entrances.
6. `ScrollTrigger.normalizeScroll()` stays off; it is a form of scroll-jacking. Enable it only to fix a measured pin-jump on a pin-heavy page.

## 6. Text splitting

- Split after fonts load, with `autoSplit: true` and the animation created and **returned** inside `onSplit(self)`: SplitText re-splits when fonts finish or the width changes, reverts the old animation and carries its progress over. Required for Hebrew webfonts, whose line breaks change after the swap.
- `mask: 'lines'` wraps each line in an `overflow: clip` element for the rise-from-behind effect; `aria: 'auto'` (default) puts the full sentence in `aria-label` and hides the pieces; set `font-kerning: none` on split targets; don't put `text-wrap: balance` on them.
- Never hide the LCP element behind a split: a masked line has no paint until it rises.
- Hebrew: lines or words; characters are technically safe (grapheme segmentation keeps niqqud attached) but read as a Latin device. Text containing links: `aria: 'none'` plus a visually hidden copy of the sentence.
- RTL line splitting: SplitText's line grouping assumes left-to-right, so a `dir="rtl"` block comes back as one line (measured: 0 of 3 Hebrew blocks split correctly). `engine.splitLines` splits under `direction: ltr`, restores `rtl` on each line inside `onSplit` (so it survives `autoSplit` re-splits) and restores the element's direction on `revert()`; measured identical to native line breaks at 390 and 1440 px, with Hebrew, numbers, ₪ and Latin mixed.

## 7. Two motion classes, derived state

- **Scrubbed** motion is driven by the visitor's scroll: `ease: 'none'`, no duration, quality from `scrub` and smooth scrolling. **Triggered** motion is the page speaking: eased, with a duration, usually `once`. Never both on one trigger (`scrub` and `toggleActions` together is undefined behaviour).
- Derive state from position on every update (the active step, the current scene, the caption to show) and never store it: stored state desyncs on anchor jumps, scrollbar drags, Home/End and back-forward cache restores.
- Animate transform and opacity for anything continuous or large; clip-path and masks for bounded, one-shot reveals; blur at most 8 px, short and on small areas. Name each signature move's per-frame cost class before building it: compositor (transform, opacity), paint (clip-path, colour, blur) or layout (font-variation axes, width and height, anything that rewraps text). A layout-class move needs a measured cap and a touch version (moves.md E-09).
- CSS custom properties that drive motion are set on the element that consumes them (or registered with `@property … inherits: false`); a parent variable fanned out to many children re-styles them all every frame. The same holds for a `color` transition on `html` or `body` (moves-recipes.md T-01).
- Inside a held timeline (`engine.holdTimeline`, which sets `invalidateOnRefresh: true`), tween CSS variables with `fromTo`, never `gsap.set` + `.to`: the first refresh reverts the set value and the tween restarts from the CSS default (measured with GSAP 3.15: scrubbed to 50 %, set + to gave 0.95 against a CSS default of 0.9; `fromTo` gave 0.5). One-shot tweens and scrubs without `invalidateOnRefresh` may use set + to.
- One owner per animated property per element: CSS transitions or GSAP or Motion, never two.

## 8. Native CSS: scroll-driven animations and View Transitions

CSS scroll-driven animations (`animation-timeline: scroll()/view()`, `animation-range`, `view-timeline`, `timeline-scope`) ship in Chromium 115+ and Safari 26+, not in Firefox stable (October 2026). Use them only as progressive enhancement behind `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion: no-preference)`, with the final state as the default; never for content visibility and never with the polyfill (stale, main-thread). They run off the main thread for transform and opacity, so they stay smooth while JavaScript is busy. Put `animation-timeline` after the `animation` shorthand (the shorthand resets it). Anything essential to the story is built with GSAP instead.

View Transitions: same-document transitions are supported everywhere current (`document.startViewTransition`; React 19.3's `<ViewTransition>`; Motion's `animateView`). Cross-document transitions (`@view-transition { navigation: auto; }` on both pages) work in Chromium 126+ and Safari 18.2+; Firefox simply navigates. Wrap custom transition animations in a no-preference media query.

## 9. Media: image sequences and video scrubbing

- **Image sequence on a canvas** (the reference's 9,000-pixel scene): draw only when the frame index changes; always draw the nearest loaded frame, never a blank; load the first frame eagerly and the rest as the scene nears; cap DPR at 2; tiers (a low-resolution tier first, a desktop tier, portrait frames for phones). Memory: a decoded 1280×720 frame is 3.7 MB, so never pre-decode a whole sequence; keep a bounded decode window. Tiers as the reference measured them: `lo` 640 w first everywhere, `pt` 540×960 portrait for phones, `hi` 1280 w on desktop after `lo`; ≤ 168 frames per scene, 13-18 px of scroll per frame, phone tier ≤ 4 MB per scene. WebP or AVIF for bytes; JPEG decodes about twice as fast when frames are decoded during scroll (4.5 ms vs 8-10 ms p50, measured). Under reduced motion show one representative frame.
- **Video scrubbing** works only with random-access encoding and a server that answers range requests: `ffmpeg -i in.mov -c:v libx264 -g 1 -crf 28 -pix_fmt yuv420p -movflags +faststart -an scrub.mp4` (all-intra, about 3× the size of a normal encode). On iOS, seeks are coarse and frames often don't paint until playback has started once, so phones get an image sequence or a plain autoplaying loop. Video scrubbing is for short, desktop-first clips.
- **Playback video:** `muted playsinline`, a poster equal to the first frame, `src` assigned only when it should play, shown only after `playing` fires, paused offscreen.
- **Make sequences from real footage of the subject:** `ffmpeg -i clip.mp4 -vf "fps=24,scale=1280:-2" -q:v 5 seq/f%03d.jpg` (and a portrait crop for phones).

## 10. Reduced motion, prerender and no-JS

- The final state is the default in HTML and CSS; JavaScript hides "before" states only after the engine boots (`html.motion-ready`).
- Under reduced motion (OS setting, `?reduce=1`, or prerender): no Lenis, no scrub, no holds, no autoplaying loops, entrances at most a short fade; every beat shows its last frame. Lenis's own `respectReducedMotion` and Motion's `<MotionConfig reducedMotion="user">` agree with this.
- An in-page accessibility widget that toggles "stop animations" must take effect without a reload: set `html[data-motion="off"]`, call `engine.destroy()` and create a new engine, which then runs reduced (foundations.md §5 has the `stopAnimations()` helper; React uses `useStopAnimations()`, §11). Anything a scene did outside GSAP must be undone by the cleanup it returns, or it survives the switch. An OS setting changed while the page is open takes the same path: the engine reports it (`onPreferenceChange`, the `motion:preference` event, §2) and the boot code rebuilds. If a project uses `gsap.matchMedia()` instead, every conditions object needs a complementary pair (`'(prefers-reduced-motion: no-preference)'` and `'(prefers-reduced-motion: reduce)'`): when no condition matches, the callback never runs and motion is silently missing on desktop (measured).
- Prerender: set `window.__PRERENDER__ = true` before the page scripts run (`evaluateOnNewDocument` in puppeteer), so the snapshot captures visible content, never `opacity: 0` inline styles. Real numbers live in the HTML; counters only animate up to them. Whatever a scene writes during prerender is saved into the HTML every visitor gets, so under `engine.PRERENDER` reduced branches write no inline styles or classes (H-02's old `stage.style.position = 'static'` would have saved a static stage for motion visitors); `.motion-reduced` CSS carries the reduced layout instead, and the engine leaves that class out of snapshots and resets both classes on every boot (measured before that fix: a saved `motion-reduced` collapsed every hold on the live page, 180 px instead of 2,400).
- Loops longer than 5 seconds (marquees) need a pause control or must stop under reduced motion (WCAG 2.2.2, Level A).

## 11. Frameworks

- **React (Vite, TanStack Start, Lovable):** one `MotionProvider` near the root; scenes via `useScene` (built on `useGSAP`, which reverts everything on unmount and is StrictMode-safe: verified 3 triggers, not 6, and zero left after unmount). Handlers created later need `contextSafe`; listeners, ticker callbacks and DOM edits are undone by the cleanup `setup` returns. The accessibility menu's "stop animations" calls the function `useStopAnimations()` returns: it sets `html[data-motion="off"]` and the provider rebuilds its engine in reduced form, and every `useScene` re-runs because the engine is one of its dependencies (calling `engine.destroy()` yourself leaves the scenes' triggers running). The provider also rebuilds when the OS setting changes. Never call gsap during SSR: the engine only ever runs in an effect. Copy `motion-engine.d.ts` next to `motion-engine.js`: a default Vite `react-ts` project is strict without `allowJs`, and `tsc -b` fails on the untyped import (TS7016).
- **Next.js (App Router):** the provider and scene components are `'use client'`; sections stay Server Components (data attributes work there). On route change, scroll to top immediately and let the new route's scenes create their triggers.
- **Astro:** start the engine on `astro:page-load` and `destroy()` it on `astro:before-swap` when using `<ClientRouter />`; otherwise start once on load. Either way, rebuild on `motion:preference`.
- **Static and WordPress:** a module script (or an mu-plugin enqueue with `strategy: 'defer'`), loaded after first paint.

## 12. Symptom → cause → fix

| Symptom | Cause | Fix |
|---|---|---|
| Pinned section jumps at the start of the pin on fast scroll | threaded scroll painted before JS pinned | sticky stage; else `anticipatePin: 1`; last resort `normalizeScroll(true)` |
| Pinned element drifts or scrolls away | an ancestor `transform` / `filter` / `will-change` breaks `position: fixed` | remove it, or `pinReparent: true` |
| Triggers fire early or late after content above loads | stale measurements (font swap, images, CMS, accordion) | the engine's content-height watch and font listeners cover height changes; a change that keeps the height needs `engine.safeRefresh()`; image dimensions |
| Triggers wrong only below a pin created later | refresh order | create top to bottom; `refreshPriority`; `ScrollTrigger.sort()` |
| Jump when the phone's address bar hides | a viewport resize triggered a refresh | `ignoreMobileResize`, width-only resize handlers, `svh` units |
| Sticky does nothing | an ancestor has `overflow: hidden/auto` | `overflow: clip` |
| A scene measures zero; triggers never fire | `content-visibility: auto` on the section | remove it from scroll scenes |
| Wheel over a menu or modal scrolls the page | Lenis owns wheel events | `data-lenis-prevent` |
| Anchor lands under the header, or one header-height lower with motion than without | no `scroll-padding-top`, or a second offset stacked on it (Lenis subtracts scroll-padding, then adds `anchorOffset`) | `html { scroll-padding-top: <header + gap> }` only, `anchorOffset` 0 (§3) |
| Long tasks at every theme flip | a `color` transition (or one on an inherited custom property) on `html`/`body` re-styles every descendant each frame | switch text colour instantly; crossfade only the fixed theme layers (moves-recipes.md T-01) |
| A held scene's CSS variable scrubs from the wrong value | `gsap.set` + `.to` inside `holdTimeline`; the refresh reverted the set value | `fromTo` (§7) |
| After "stop animations" a counter shows 0, hover motion keeps running or a marquee doubles | listeners, ticker callbacks or DOM edits made outside GSAP, never undone | return a cleanup from the scene (moves-recipes.md, the rules) |
| Holds collapsed on a prerendered page while motion is allowed | reduced-motion classes or inline styles saved into the snapshot | no writes under `engine.PRERENDER` (§10) |
| Duplicate animations or spacers in React dev | effects run twice in StrictMode | `useGSAP` / `useScene` |
| Works in dev, dead in production | a plugin was tree-shaken | `gsap.registerPlugin(...)` |
| Horizontal track overshoots by ~15 px on Windows | `innerWidth` includes the scrollbar | measure with `clientWidth` |
| Panels inside a horizontal track never toggle (RTL) | LTR edges on `containerAnimation` triggers | swap edges: `start: 'right center'`, `end: 'left center'` |
| Skew or marquee speed stays stuck after scrolling stops | velocity never returns to zero | decay it every tick (the engine does), or reset on `scrollEnd` |
| Layout shifts while scrolling past held scenes | GSAP default pins | sticky stages or `pinType: 'transform'` |
| A section ships blank in screenshots, prerender or for crawlers | content hidden until a trigger fires | final state as default; `motion-ready` gating; `__PRERENDER__` |

## 13. Hooks for effects: onFrame, damp, addCleanup, onViewportResize

Effects that live outside ScrollTrigger (a cursor accent, a pointer-following mask, a canvas sized to the screen) use these instead of their own loops and listeners. They are on the engine object (`useMotionEngine()` in React), not separate imports.

| Hook | Use | Notes |
|---|---|---|
| `engine.onFrame(job)` returns `off()` | a per-frame job on GSAP's ticker: `job(time, deltaTime, frame)` (seconds, milliseconds, frame number) | one dispatcher joins the ticker with the first job and leaves with the last. The ticker never sleeps while Lenis is attached, so a job calls `off()` once its values settle and joins again on the next input. `off()` is safe inside the job and safe twice. Never `requestAnimationFrame` loops of your own |
| `engine.damp(k)` | the lerp factor for this frame: `x += (target - x) * engine.damp(0.18)` | `1 - (1 - k)^min(gsap.ticker.deltaRatio(60), 3)`: the same speed at 30, 60 or 120 fps, capped so a stalled tab does not jump |
| `engine.addCleanup(fn)` | teardown that `destroy()` runs: listeners, observers, canvases, ticker jobs an asset owns | registered after `destroy()`, it runs at once. Make it safe to call twice (an asset's own cleanup and `destroy()` may both call it) |
| `engine.onViewportResize(fn)` returns `off()` | scenes sized from `innerHeight` (a stage that must fit one screen, a full-screen canvas) | width changes always; height-only changes only while `(pointer: fine)` matches, so a desktop window going from 1440x900 to 1440x700 counts and a phone's address bar does not. `onWidthResize` stays for width-only work |

`engine.frameJobCount` is for QA: how many jobs are on the clock now (0 when every effect has settled). The selftest fixture `tests/fixtures/engine-api.html` exercises all of the above; `node <skill>/scripts/selftest.mjs --browser` runs it.
