# Motion system: one clock, few moments, strict reduced motion

Read this at stage 3 (motion prototype) and stage 4 (build). The runtime is pattern-breaker's motion engine (`<skills>/pattern-breaker/assets/engine/motion-engine.js`, documented in `<skills>/pattern-breaker/references/motion-engine.md`). This file adds what the engine does not hold: the contract every effect follows, this skill's effects (`<skill>/assets/`), the budget, and the rules for performance, height, RTL, reduced motion, Lenis and Rive. Whatever the engine already settles (Lenis setup, refresh discipline, sticky stages, splitting, the move catalogue in `<skills>/pattern-breaker/references/moves.md`) is used as it is, never rewritten.

## Contents
1. The one-clock contract
2. Library ownership
3. The effect catalogue
4. The hero interaction from the work
5. The motion budget
6. Performance rules
7. Responsive height
8. Hebrew and RTL
9. Strict reduced motion and WCAG
10. Lenis rules
11. Rive inside the clock
12. Pinned versions
13. Prototype first

---

## 1. The one-clock contract

`gsap.ticker` is the only requestAnimationFrame loop a page owns. The engine drives Lenis from it (`lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add((t) => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`) and forces Lenis `autoRaf: false` even when `options.lenis` asks for something else. Every other per-frame job joins through the engine:

| Engine API | What it is for |
|---|---|
| `engine.onFrame(job)` | registers `job(time, deltaTime, frame)` on the shared ticker and returns `off()`. One dispatcher sits on `gsap.ticker` while at least one job is registered and leaves with the last one. |
| `engine.damp(k)` | frame-rate independent lerp factor, `1 - (1 - k)^min(gsap.ticker.deltaRatio(60), 3)`: 60, 120 and 144 Hz screens move at the same speed, and one long frame never jumps more than three frames' worth |
| `engine.addCleanup(fn)` | a cleanup that `destroy()` runs: listeners, observers, canvases, Rive instances, anything GSAP does not record |
| `engine.onViewportResize(fn)` | fires on every width change, and on height-only changes when the primary pointer is fine (a desktop window going from 1440x900 to 1440x700). Height-only changes on touch devices are the address bar and are ignored. |
| content-height watch | on by default (`watchContent: false` turns it off): a ResizeObserver on `document.body` calls `safeRefresh()` when `scrollHeight` changes by more than 1 px, and ignores changes caused by ScrollTrigger's own refresh |
| `options.onPreferenceChange(reduce)` and the window event `motion:preference` | the OS reduced-motion setting changed while the page is open. The engine does not rebuild itself: the boot code calls `destroy()` and creates a new engine. |

Rules:

1. **Join while moving, leave when settled.** A component calls `engine.onFrame` when input arrives (pointermove, pointerenter, a scroll callback) and calls `off()` when it has arrived. An idle page runs no per-frame work of ours.
2. **Settled means distance to target**, not per-frame movement: `Math.hypot(target.x - cur.x, target.y - cur.y) < 0.1`. The first tick after a wake can move almost nothing, and a movement test puts the component to sleep at once (found while testing the cursor in Chromium).
3. **The ticker itself never sleeps while Lenis is attached** (GSAP's ticker auto-sleeps only below two listeners). That is why our jobs must leave: what stops is our work, not the clock.
4. **No requestAnimationFrame loop in any component.** One-shot deferrals are fine (one `requestAnimationFrame` to wait for layout, a `gsap.delayedCall` as a debounce); a loop that re-requests itself is not.
5. **Full cleanup.** Every effect returns its cleanup and also registers it with `engine.addCleanup`, so `destroy()` (route change, reduced-motion flip, the "stop animations" switch) leaves no listener, observer, ticker job or canvas behind. Test on a test page: after `destroy()` the gsap ticker has as many listeners as before the engine was created (read through an engine debug counter, or GSAP's internal listener list in the test only).
6. **Every GSAP object is born inside a revertable scope**: `engine.scene()`, `useGSAP`, or `gsap.matchMedia`. A scene with dependencies uses `revertOnUpdate: true`, or old animations pile up on each change. A ScrollTrigger goes on a standalone tween or on the top-level timeline, never on a tween nested inside a timeline: the parent timeline's playhead and the trigger then both drive that tween.

Heron, the case study behind this skill, describes one ticker callback for everything, yet its cursor and footer run their own self-waking requestAnimationFrame loops and its bundle has 21 `requestAnimationFrame` references. We follow the rule it states, not the code it shipped.

The pattern every follower uses (cursor, lens, pointer-driven values):

```js
// A pointer follower on the shared clock: joins on input, leaves when it has arrived.
export function initFollower(engine, el) {
  if (engine.REDUCE || !engine.FINE) return () => {};
  const target = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };
  let seen = false;
  let off = null;
  const job = () => {
    const k = engine.damp(0.18);
    cur.x += (target.x - cur.x) * k;
    cur.y += (target.y - cur.y) * k;
    el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
    // settled by distance to target, never by this frame's movement
    if (Math.hypot(target.x - cur.x, target.y - cur.y) < 0.1) { off(); off = null; }
  };
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return; // hybrid laptops also send touch and pen
    target.x = e.clientX;
    target.y = e.clientY;
    // the first move snaps, so the element never flies in from the top-left corner
    if (!seen) { seen = true; cur.x = target.x; cur.y = target.y; }
    if (!off) off = engine.onFrame(job);
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  const cleanup = () => { if (off) off(); window.removeEventListener('pointermove', onMove); };
  engine.addCleanup(cleanup);
  return cleanup;
}
```

## 2. Library ownership

| Owner | Owns | Never |
|---|---|---|
| GSAP + ScrollTrigger + Lenis, through the engine | scroll position, scrubbed scenes, holds, scroll-linked masks, routine reveals, per-frame pointer work | the open or closed state of a component |
| Motion (the `motion` package, or Framer Motion `m` under `LazyMotion` on mediawave.co.il) | React component state: menus, modals, accordions, presence | anything scroll-linked; any element GSAP animates |
| CSS transitions | hover, press and focus states of controls | a property GSAP or Motion also animates on that element |
| The browser's View Transitions | page transitions (a GSAP curtain only as the Next.js fallback) | - |
| The Rive runtime | drawing inside its canvas | deciding values: the page writes them (§11) |

1. **One owner per element and property.** GSAP and Motion both writing `transform` on one node, or a CSS transition on a property GSAP tweens, fight every frame. Split them: the wrapper belongs to one, the child to the other.
2. One smooth scroller per site (Lenis through the engine), one Rive runtime package per site, one page-transition mechanism per site.
3. Astro sites usually need no Motion at all: component state is CSS plus a few lines of script.
4. Register every GSAP plugin once at boot (`gsap.registerPlugin`), or production tree-shaking drops it and the effect dies only in production.

## 3. The effect catalogue

These are the effects pattern-breaker lacks. The code is in `<skill>/assets/`; how to copy it into a project and how to test each effect is in `<skill>/assets/motion/README.md`. Every file is a plain ES module built on the engine: it receives `engine`, returns a cleanup and registers it with `engine.addCleanup`. In the storyboard's move column, write their moves.md IDs (`<skills>/pattern-breaker/references/moves.md` §10): T-06 ink mask transition, C-07 canvas cursor accent, C-08 footer ink lens, T-07 geometric page mask (the Astro and the Next.js page assets are both T-07). The fit map and the reduced-motion CSS are utilities, not moves, and get no ID.

| Effect | File and export | Tiers | Earns its place when |
|---|---|---|---|
| Ink transition (T-06) | `assets/motion/ink-mask.js`, `initInkMask(engine, svgEl, opts)` | **live**: fine pointer, band-limited SVG filter edge. **baked**: a pre-roughened path, no filter (touch; Safari when `opts.safari === 'baked'`; any page with `opts.live === false`). **reduced**: instant swap with hysteresis. | the client's work turns a draft into a finished thing the visitor should watch happen (sketch to render, raw to finished, plan to built), and a dossier item names that moment |
| Cursor accent (C-07) | `assets/motion/ink-cursor.js`, `initInkCursor(engine, opts)` | live only on a fine pointer with a mouse; nothing on touch, under reduced motion or under `forced-colors: active` | a dossier item makes the pointer a tool from the client's work. Never by default; it counts toward the budget. |
| Footer lens (C-08) | `assets/motion/ink-lens.js`, `initInkLens(engine, svgEl, opts)` | live on a fine pointer; nothing under reduced motion (no follow at all); the static logo always shows | looking closely is part of the trade (inspecting, proofing, checking) and the page ends on it |
| Fit map | `assets/motion/fit-map.js`, `mapToRendered(img, x, y, sourceW, sourceH)` and `placeMarkers(img, markers)` | a utility, no tiers | markers sit on coordinates of an image (a drag-to-reveal hero, an annotated photo or drawing); required whenever that image uses `object-fit` |
| Reduced-motion CSS | `assets/motion/reduced-motion.css` | - | every project: final states visible, hidden "before" states only under `html.motion-ready`, view-transition animations off under reduce |
| Page mask, Astro (T-07) | `assets/astro/page-transition.css`, `assets/astro/motion-boot.js` (`bootMotion(libs, registry)`, `defineMotion(name, init)`), `assets/astro/BaseLayout.example.astro` | a geometric wipe; nothing under reduce | moving between pages is part of the story (counts once in the budget) |
| Page transition, Next.js (T-07) | `assets/next/PageTransition.tsx`, `assets/next/page-transition.css`, `assets/next/SmoothScroll.tsx`, fallback `assets/next/curtain.ts` + `assets/next/TransitionLink.tsx` | View Transition wipe; the curtain where `startViewTransition` is missing; nothing under reduce | the same |

Page transitions (lifecycles, CSS, browser support, their QA matrix) have their own reference, routed from SKILL.md.

### Ink transition

- **SVG-internal mask.** The finished image is an SVG `<image mask="url(#id)">` inside the same inline SVG as the mask. Never CSS `mask-image: url(#id)` on an HTML element: Safari cannot reference an SVG `<mask>` from a non-SVG element (WebKit 139092, reopened). CSS `mask-image` with gradients or image files works everywhere.
- **Never over `<video>`.** Safari applies no SVG `url()` mask, filter or clip-path to video (WebKit 184601). Put the ink on a poster frame or a still.
- **Edge:** feTurbulence (fractalNoise, 3 octaves by default) into feDisplacementMap (scale 100) into feGaussianBlur into a feComponentTransfer alpha step. The values come from Bearplus's Codrops write-up of Heron; the file credits them.
- **The filter covers a band around the moving edge only**, and the band is hidden at p=0 and p=1, so nothing is filtered at rest.
- **Animate the mask geometry only**: the path `d` through `setAttribute`, never the CSS `d` property (Safari lacks it). Never animate filter attributes: the noise is recomputed every frame.
- **Unique ids per instance**, rewritten at init: two copies of the same markup (a view-transition overlap, a component used twice) would otherwise resolve `url(#id)` to the first match in the document.
- The viewBox aspect equals the image aspect. SVG `<image>` has no srcset, so choose the href at init from the rendered width x min(DPR, 2), or ship one 1600 px wide AVIF or WebP.
- **Directions:** `rtl` (default on Hebrew pages: the reveal travels right to left), `ltr`, `down`, `center`. Centre-out filters the whole circle, so its cost grows with the radius; prefer the others. Option names are in the file's JSDoc.
- **At most one live ink transition in the viewport.**
- **Why the band, the octave cap and the baked tier exist** (Chromium, software raster, relative numbers only): no filter 21.7 ms; full-shape filter with 4 octaves +146 ms; band-limited with 4 octaves +101 ms; band with 2 octaves +76 ms; baked path +9 ms. Safari stays unproven until profiled on a real iPhone (WebKit 287982: a full-screen feTurbulence overlay slows Safari scrolling); if it drops frames there, Safari gets the baked tier.
- **No-JS markup shows the finished image.**
- **Reduced:** an instant state swap with hysteresis. Scrolling down, the finished image shows once the trigger's top edge rises past the line 35% from the viewport top; it hides again only once that edge falls back below the line 65% from the top (ScrollTrigger `start: 'top 65%'`, `end: 'top 35%'`; `onLeave` shows, `onLeaveBack` hides). No crossfade and no wipe, and a visitor parked on a line never sees it flicker (WCAG 2.3.1).
- **Cost accounting.** The Awwwards Developer guidelines ask to avoid filters under WPO, which weighs 20%. The decision row for an ink transition states the band, the octaves, the at-rest switch and the fallback tier: pixels filtered per frame are a budget line. pattern-breaker's slop-scan flags feTurbulence (rule `grain-overlay`) and feDisplacementMap (rule `liquid-glass`) as second-order signals. Waive each on the filter element's line or the line above it, and only with its decision: `slop-ok:grain-overlay decision:D<n> <reason>` and `slop-ok:liquid-glass decision:D<n> <reason>`. The report then lists them under "waived by decision".

### Cursor accent

- **Gate:** `(hover: hover) and (pointer: fine)` (`engine.FINE`) plus `e.pointerType === 'mouse'` on every event, because hybrid laptops report a fine pointer and touch.
- 9 px square dot, lerp 0.18 through `engine.damp`, a trail only while the smoothed speed (EMA 0.2) is above 1.5. It joins the clock on pointermove and leaves when the distance to target is below 0.1.
- **Never `cursor: none`.** The dot is an accent on top of the native cursor: OS cursors scale with the visitor's settings, custom ones do not.
- The canvas is `aria-hidden` and `pointer-events: none`; the dot hides on keyboard navigation (Tab keydown) and on touch; nothing runs under reduced motion or `forced-colors: active`; DPR capped at 2; only the dirty rectangle is cleared each frame.
- Hover and press states taken from the client's world (Heron's dot inverts over dark areas, grows on links and contracts into a targeting reticle when pressed) live on a small HTML layer that stays `pointer-events: none` and never fully covers a focused control (WCAG 2.4.11).
- Allowed only when a dossier item justifies it (Nati's ruling); it then counts toward the budget. pattern-breaker rates a follower cursor as high cliché (C-04) and slop-scan's cursor rule fires on `cursor: none`; an accent justified by the dossier avoids both.
- Astro with ClientRouter: the canvas lives in a `transition:persist` element, or navigation deletes it.

### Footer lens

- SVG-internal circular mask: the main circle follows at lerp 0.09, a pulse layer at lerp 0.15 with radius x1.05 and opacity 0.2; it grows in 0.55 s and shrinks in 0.8 s.
- The pointer is mapped with `getScreenCTM()` on every tick, because Lenis moves the footer under a pointer that stands still.
- A static logo layer is always visible: nothing exists only on hover.
- Off under reduced motion: no follow at all. (Heron's lens only zeroed its durations and kept following; strict means still.)
- It leaves the clock when both circles have settled and the radius tween has ended.

### Fit map

- `object-fit: cover` crops and `contain` letterboxes, so markers placed in percent of the box drift off target as the viewport changes shape (1440x900 against 1440x700). Map source-image coordinates through the rendered size and `object-position` instead.
- Markers are re-placed on resize through a ResizeObserver registered with the engine.
- Acceptance: markers land within 1 px at 1440x900 and 1440x700, for cover and for contain.

## 4. The hero interaction from the work

1. **The interaction is what the professional does.** Heron's hero is an ordinary drawing, and dragging a selection across it reveals guardrails, handrails and code references. The idea is picked on the hero idea board (8-10 cheap ideas) before anything is prototyped.
2. **Directness.** Keep the pointer-to-effect mapping close to 1:1: heavy easing reads as an effect, directness reads as a tool. Ease only what the visitor does not hold.
3. A drag starts only after 2 px of movement; highlight gradients point in the drag direction.
4. **Touch.** The surface takes the gesture inside itself only (`touch-action: none` on that surface, pointer capture that keeps the grab offset); page scrolling outside it stays native. If the gesture would trap scrolling on a phone, the phone gets a tap or scroll-driven version, written in the storyboard's mobile column.
5. **Keyboard.** Every revealed item is reachable without a pointer: a real button or link per finding in DOM order, or a focusable surface where the arrow keys move the selection and Enter reveals. As the article shows it, Heron's drag hero has no keyboard or touch path.
6. **The information never exists only in the interaction.** The findings are also in the HTML (a list or captions) for no-JS visitors, screen readers and reduced motion.
7. Throw and snap gestures follow gesture physics (Emil Kowalski, after Apple's guidance): release velocity hands off to a spring, the momentum projection picks the snap target, and the surface rubber-bands past its bounds.
8. Markers on an image go through the fit map (§3).
9. Reduced motion shows the revealed state; the controls still work, without animation.
10. The LCP element stays the H1 text; hero art is inline SVG, a canvas, or a poster image that is never hidden.

## 5. The motion budget

**2-3 standout moments per site.** Each moment beyond three gets its own decision row starting "רגע נוסף:", with a reason and a dossier item (`<skill>/scripts/check-artifacts.mjs` counts these rows and fails the log when one is missing). The decision log's budget row (D8, written as n/3) holds the count; the storyboard's signature-moment list names each one.

| Counts as one standout moment | Does not count |
|---|---|
| the hero interaction | routine entrances (`engine.reveal`: fire 600 px early, 0.35 s, 18 px) |
| each signature scroll moment (what the decision log calls a scroll transition: an ink transition, a held scene where the persistent object changes state) | a section's watched entrance (pattern-breaker's E-moves, one per section) |
| page transitions (the whole system counts once) | hover, press and focus states of controls |
| a logo ident | theme flips at act breaks (T-01) |
| a contact companion | progress indicators |
| a custom cursor | the reduced-motion and no-JS states |
| a footer lens | |

- **Terminology.** "Standout moment" means this site-level budget. pattern-breaker's "one signature move per section" is a pacing rule and does not count toward it. Its intensity table (`<skills>/pattern-breaker/references/scroll-score.md` §2) sets signature moments per intensity: Quiet 1, Alive 1-2, Orchestrated 3, Cinematic 5+. Quiet, Alive and Orchestrated fit the budget; at Cinematic, every moment past three needs its own "רגע נוסף" row.
- **Frequency gate** (Emil Kowalski): standout moments belong to the rare tier, seen once per visit or per page. Anything seen tens of times per visit (navigation, menus, buttons) stays near-instant.
- **Meaning test** (Heron): turning a moment off must lose part of the meaning, not only decoration. Every motion signals a change of state.
- **Fewer at once:** two standout moments never run in the same viewport at the same time.

## 6. Performance rules

1. **Fewer things moving at once** beats micro-optimising each one (Heron's own framing).
2. **Motion code loads after first paint** (pattern-breaker foundations: a dynamic import after first paint, its own chunk). The LCP element is text or a poster, never hidden or animated from opacity 0.
3. **Initialise heavy parts near the viewport.** Triggers are cheap and are created at boot in page order. The expensive part (decoding an image sequence, building a live filter, mounting a canvas or Rive) starts when its section is about one to one and a half viewports away and stops when it leaves. Rive and Lottie mount after load and idle.
4. **Per frame, write only transform, opacity and clip-path.** The one exception is the ink transition's SVG filter: limited to a band around the edge, at most 3 octaves, hidden at rest, with a baked tier, and **only one live filtered element in the viewport**. Blur at most 8 px, short and on small areas.
5. **DPR capped at 2** for every canvas (cursor, image sequences, Rive): `Math.min(devicePixelRatio || 1, 2)`.
6. **Desktop interactions gate on pointer capability, never on width:** `engine.FINE` plus `pointerType === 'mouse'` per event. A 1440 px touch screen gets the touch version; a narrow desktop window with a mouse keeps the pointer effects.
7. **Never mask, filter or clip a `<video>`** with SVG `url()` effects (Safari ignores them). Use the poster frame or a canvas.
8. **CSS custom properties that drive motion are set on the element that consumes them.** A variable on `html` or on a large container restyles every descendant every frame (pattern-breaker and Emil Kowalski agree). Heron tweens its page-transition variables on `html`; measure before copying that.
9. `will-change` only on the moving element, only while its scene is active, and only after a measured problem.
10. Never `content-visibility: auto` on a section with scroll scenes: the section measures zero and its triggers never fire.
11. **Full cleanup on every exit** (route change, reduced-motion flip, stop switch): ticker jobs, listeners, observers, canvases, Rive instances.
12. **Profile held chapters on a throttled phone** (`node <skills>/pattern-breaker/scripts/motion-audit.mjs <url> --throttle 4`). Lighthouse load scores miss scroll-time long tasks: MediaWave's two holds produced about 13-14 s of long tasks at 4x CPU, mostly from building Lotties, while its mobile Lighthouse read 96.
13. **Performance is judged with motion on.** Headless Chrome follows the OS reduced-motion setting: on a machine with animation effects off (Nati's is one), a default run measures the reduced page. `<skills>/pattern-breaker/scripts/gates.mjs --lh-motion` forces each mode; the QA list has the commands.

## 7. Responsive height

- **1440x900 and 1440x700 are different canvases** (Heron's team found this). A full-screen scene tuned at 900 px tall clips its caption or overflows at 700. Every scene is checked at 1440x900, 1440x700 and 390 wide.
- **Units:** `svh` (or `lvh`) for stages and full-screen scenes, never `dvh` on scroll scenes: `dvh` changes the body height with the mobile toolbar and refreshes triggers while a finger is down.
- **Size from measurement.** Compute scene sizes from `innerHeight` and the measured content height, inside `engine.onViewportResize(fn)`: desktop height changes arrive there, touch address-bar changes do not. Distances use function values with `invalidateOnRefresh: true`.
- **Stage content fits `100svh`** at 390x664, at 1440x700 and at 200% zoom (pattern-breaker's stage-fit rule plus the short desktop).
- **The content-height watch stays on.** CMS edits, late images, lazy sections, accordions and font swaps move every trigger below them; the engine refreshes once the height settles (no finger down, 350 ms of calm scrolling).
- **CMS edits.** Every client-editable slot inside a scene gets limits in the CMS (characters for titles and captions, an image ratio), so a long Hebrew title cannot push a held stage past `100svh`. Test each slot with very long and very short Hebrew and with a missing image.
- **Capture:** `node <skill>/scripts/shots.mjs <url> --out design/shots` (1440x900, 1440x700, 390, reduced) and `node <skills>/pattern-breaker/scripts/scroll-film.mjs <url> --viewports desktop,short,mobile`.

## 8. Hebrew and RTL

1. **`engine.DIR`** (1 on a Hebrew page, -1 on an English one) multiplies every horizontal offset that follows the reading direction: `gsap.from(el, { x: 24 * engine.DIR })` enters from the right on a Hebrew page. `dir="rtl"` mirrors neither SVG coordinates nor canvas drawing (x grows to the right in both), so direction is always explicit in code.
2. **Scans, wipes and reveals travel right to left** on forward and mirror on back (the ink transition's `rtl` default, the page mask). Recipes written for LTR (library docs, the Next.js guide's slides) need their signs flipped.
3. Horizontal tracks move with a positive `x` in RTL, and `containerAnimation` triggers swap their edges (`start: 'right center'`).
4. **Lines only through `engine.splitLines`.** SplitText 3.15 groups lines with a left-to-right test, so `dir="rtl"` text collapses into one line; the engine measures under `ltr` and restores `rtl` on each line and through every re-split.
5. **Words by default** (`type: 'words'` has no line test). Characters only after a visual check on the rendered Hebrew, and never on runs with digits or Latin: split pieces are inline-blocks, which bidi treats as neutral, so a Latin phrase or a number can come out reordered.
6. **LTR isolation:** English, numbers, phone numbers, prices and dates inside Hebrew go in `<bdi>` or `<span dir="ltr">`, and those elements are passed to SplitText's `ignore`. Phone and email inputs get `dir="ltr"`.
7. Split only headings without links: `aria: 'auto'` puts the sentence in `aria-label` and drops link semantics. **Text with links stays unsplit.** A paragraph without links may use `aria: 'hidden'` plus a visually hidden copy. Never `aria: 'none'` with a copy: in SplitText 3.15 `none` leaves the split pieces exposed, so a screen reader reads the text twice.
8. **TextPlugin `rtl: true` is not a language setting.** It reverses the order in which new text replaces old. For Hebrew keep `rtl: false` (the logical order already types from the visual right) and use `delimiter: ' '` to type word by word.
9. No letter-spacing and no italics on Hebrew. Mirror arrows; never mirror logos, play icons or check marks.
10. Rive: `dir` does not mirror a canvas; the file reads its `isRtl` property or uses layout direction (rive-studio).
11. **Measure, then trust.** Every RTL measurement behaviour is checked on rendered Hebrew at 1440x900, 1440x700 and 390 before it ships; library docs say nothing about RTL.

## 9. Strict reduced motion and WCAG

**Policy (Nati's ruling):** on client sites, when the OS asks for reduced motion, every moment shows its last frame: no Lenis, no scrub, no loops, no cursor, no pointer masks. The two-tier CALM policy belongs to mediawave.co.il only.

`engine.REDUCE` is true under the OS setting, `?reduce=1`, prerender (`window.__PRERENDER__`) or `html[data-motion="off"]`.

| Effect | Under reduced motion |
|---|---|
| Smooth scroll | no Lenis; native scroll |
| Scrubbed scenes and holds | the last frame; holds become a plain stacked layout through `.motion-reduced` CSS, never inline styles (prerender would save them for everyone) |
| Routine and watched entrances | none: the content is simply there |
| SplitText | nothing is split |
| Ink transition | instant swap with the hysteresis band; no crossfade, no wipe |
| Cursor accent | not created |
| Footer lens | not created; the static logo shows |
| Hero interaction | the revealed state shows; the controls work without animation |
| Theme flips | instant |
| Loops (video, Lottie, marquee) | paused on a meaningful frame (the poster) |
| Page transitions | no wipe, an instant swap, through our own CSS rule (Astro's built-in rule ships only with `transition:*` directives; React adds none) |
| Rive | no pointer following and no scrubbed numbers. A persistent object swaps instantly to each chapter's state when its chapter is reached (no scrub, no transition); other pieces show the final frame or the static rest pose (§11) |

- **A preference change while the page is open** reaches the boot code through `onPreferenceChange` or the `motion:preference` event; the boot code destroys the engine and creates a new one (the Astro and Next boot assets do this).
- **The in-page "stop animations" switch** sets `html[data-motion="off"]`, destroys the engine and creates a new one, without a reload. It is never persisted between visits (MediaWave rule: accessibility settings never persist) and never forces motion on against the OS setting.
- **Three states per moment, written before code:** full motion, reduced (a state change without movement) and no-JS (the final, meaningful state visible). The storyboard's reduced column holds the second.

| WCAG 2.2 criterion | Level | Our rule |
|---|---|---|
| 2.2.2 Pause, Stop, Hide | A | anything that starts by itself (including on scroll into view or hover), lasts more than 5 s and runs alongside other content gets a visible pause or stop; one global control is enough (technique G186) |
| 2.3.1 Three Flashes or Below Threshold | A | at most three flashes per second; no rapid luminance toggles (blend-mode flips, strobing swaps); the reduced ink swap uses hysteresis |
| 2.3.3 Animation from Interactions | AAA, mandatory at MediaWave | every scroll-linked and pointer-linked motion has its reduced version |
| 2.4.11 Focus Not Obscured (Minimum) | AA | no overlay (header, cursor layer, lens, transition overlay, cookie bar) fully hides the focused element; `scroll-padding-top` clears the header |
| 2.4.7 Focus Visible | AA | the cursor dot hides on Tab; focus rings are never removed |

Decorative layers (cursor canvas, lens, ink layers) are `aria-hidden`, `pointer-events: none` and out of the tab order, and never the only carrier of information.

## 10. Lenis rules

1. **Pin `lenis` 1.3.26 exactly** (the status of 2.0 is in the Verified line in §12). Heron's 1.1.5 has no reduced-motion support; in the 2.0 dev builds `lock()` stops blocking keyboard scrolling (issue #552).
2. **Only the engine creates Lenis**, always with `autoRaf: false` (the engine forces it). `lenis/react`'s `ReactLenis` starts its own loop unless given `options={{ autoRaf: false }}`, because its deprecated prop defaults to true; we do not use it, the Next asset wraps the engine instead.
3. **`anchors: false`.** Lenis's anchor option neither prevents the default nor moves focus. The engine's anchor handler does both: preventDefault, a smooth scroll, focus on the target, pushState, Hebrew ids decoded. `html { scroll-padding-top }` is the only header offset.
4. **`data-lenis-prevent`** on menus, modals, nested scrollers, long tables and embedded maps.
5. **Never `orientation: 'horizontal'` on a Hebrew page.** The Lenis source has no direction handling for horizontal scrolling, and `scrollLeft` is negative in RTL scrollers. Horizontal chapters are transforms inside a sticky stage on a vertical page.
6. **No `scroll-behavior: smooth`** (Tailwind's `scroll-smooth`) while Lenis runs. lenis.css 1.3.26 does not reset it; the engine sets `auto`.
7. **Never `ScrollTrigger.normalizeScroll()` together with Lenis**: both intercept wheel and touch input.
8. Pass `lerp` (engine default 0.1) or `duration` with `easing`, never both: an explicit `duration` switches Lenis to duration mode whatever `lerp` says. The README table says otherwise; the source wins, so read the installed `dist` and `.d.ts` files before trusting a README table.
9. `syncTouch: false` (engine default): phones keep native momentum and Lenis only mirrors it.
10. **Keyboard beats inertia.** Lenis ignores native scroll events while its own smooth animation runs (issue #107), so a PageDown or a find-in-page jump during inertia can be overridden. Cancel the inertia on navigation keys, Tab and `focusin` with `lenis.scrollTo(window.scrollY, { immediate: true, force: true })` (verified in Chromium to stop the glide), with the listeners removed through `engine.addCleanup`. The engine does not do this (its `stopInertiaOnNavigate` covers internal link clicks only). Check whether the project's boot asset includes the guard (`<skill>/assets/motion/README.md` lists what each asset covers); where it does not, and on a React and Vite site without those assets, add it next to engine creation.
11. Skip Lenis (`smooth: false`) on legal, article and form pages, and on pages with at most one scrubbed set-piece.
12. Astro with ClientRouter: Lenis is recreated on every page, because the router's root-attribute swap wipes Lenis's classes from `<html>`. The boot asset does this.
13. With Lenis, `scrub` is `true` or at most 0.8.

## 11. Rive inside the clock

- **Who decides.** site-director decides whether and where a Rive piece goes, and its storyboard row exists first. rive-studio decides how it moves and builds it, contract first (`design/rive/<piece>/CONTRACT.md`; its names are the API). Rive is for state, interactivity, character or live data; anything a transform, an SVG mask, SplitText or a video can do stays in the engine.
- **The file draws, the page moves.** The .riv holds the drawing and how each state looks. The page computes the numbers (scroll progress, the chapter in view, pointer position, form status) and writes them into the view model.
- Scroll-driven values are written from a ScrollTrigger `onUpdate` (Lenis already smooths the input). Pointer-driven values are damped in an `engine.onFrame` job that leaves when settled.
- **The runtime's own loop is the one exception.** The Rive runtime draws on its own requestAnimationFrame while its state machine plays; keep that short. The rest is `rive.pause()` once the writes have been quiet for a settle window at least as long as the longest transition in the contract's motion spec, and `rive.play()` on the next write. Arm it from mount, so a piece nobody touches rests too. Writes apply on the next advance, so never pause in the same tick as the last write. Off screen no writes arrive, so the same window rests it there. `startRendering()` and `stopRendering()` are for visibility only: on canvas-lite 2.43.1 a resize or a later `startRendering()` restarts a stopped loop for good and advances the whole stopped time in one step (rive-studio, `<skills>/rive-studio/references/web-runtime.md` §11). Pausing also detaches the file's own listeners (hover, press) until the next `play()`; rive-studio covers waking such a file. The page never adds a loop of its own to feed it. MediaWave's lens hero did (a separate spring loop next to ScrollTrigger): that is the counter-example.
- **The persistent object (P3) as Rive:** the driver is the chapter in view as an enum whose values are the storyboard's chapter ids, or one 0-1 progress across the story. Find the chapter sections by the page's own ids or refs: `data-chapter` and `data-dossier` are inert linkage attributes, and no script reads them.
- **Loading and budget.** A Rive piece counts as a standout moment. It mounts after load and idle when near the viewport. A static SVG rest frame identical to its idle pose shows until it is ready and stays if Rive is late (MediaWave cuts off at 4-4.5 s). The canvas is `aria-hidden`, the meaning lives in HTML, it is never the LCP element, and its DPR is capped at 2.
- **Reduced motion:** no pointer following and no scrubbed numbers. A persistent object swaps instantly to each chapter's state when its chapter is reached (no scrub, no transition), as the storyboard's reduced column asks; other pieces show the final frame or the static rest pose. Set the `prefersReducedMotion` view-model boolean from `engine.REDUCE` when the file has one.
- **Recipes.** rive-studio's `<skills>/rive-studio/references/web-runtime.md` §11 holds the helpers: `restWhenSettled` (the rest above, armed from mount), `followPointer` for a pointer-driven value and `driveStoryObject` for the persistent object (chapter enum plus story progress). Use them before writing a binding of your own, and copy `restWhenSettled` from there rather than writing a variant. The snippet below binds one scrubbed section on top of that helper.

```js
// The file draws, the page moves: scroll progress into a Rive view model, with no loop of our own.
// `r` is a loaded Rive instance; 'progress' is a name from the piece's CONTRACT.md. A persistent
// story object uses rive-studio's driveStoryObject (chapter enum) instead of this.
// restWhenSettled is rive-studio's rest helper (web-runtime.md §11, recipe rest-when-settled):
// rive.pause() once the writes are quiet, rive.play() on the next one, armed from mount.
// Checked against a stand-in Rive object on the real engine, never against a real .riv: verify a
// real piece with rive-studio's probe and per-state shots.
export function bindRiveScroll(engine, r, section, { settle = 0.5, intro } = {}) {
  const vmi = r.viewModelInstance;
  const progress = vmi?.number('progress');
  const reduced = vmi?.boolean('prefersReducedMotion');
  if (reduced) reduced.value = engine.REDUCE;
  const rest = restWhenSettled(engine, r, { settle, intro }); // an untouched piece rests too
  if (!progress) return rest.cleanup;
  let st = null;
  if (engine.REDUCE) {
    progress.value = 1; // the value the contract names as the final frame; nothing scrubs
    rest.touch();       // drawn, then paused
  } else {
    st = engine.ScrollTrigger.create({
      trigger: section, start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => { progress.value = self.progress; rest.touch(); },
    });
  }
  const cleanup = () => { st?.kill(); rest.cleanup(); };
  engine.addCleanup(cleanup);
  return cleanup;
}
```

## 12. Pinned versions

Verified 2026-10-15 (npm registry, installed code in the MediaWave repo): gsap 3.15.0, @gsap/react 2.1.2, lenis 1.3.26 (2.0 only as dev builds), astro 7.3.8, next 16.4.1, react 19.3.1, payload 3.90.2 (peer next >=16.3.3 <17, react ^19), tailwindcss 4.3.3, @rive-app/react-canvas 4.36.0, @barba/core 2.10.3 (not used on our stacks).

1. **Pin animation libraries exactly** (`"gsap": "3.15.0"`, no caret) and load every GSAP plugin from the same gsap version. Heron mixed a 3.12.5 core with 3.13.0 plugins.
2. **GSAP's licence** is the Standard no-charge licence: free for commercial client sites including every plugin, not MIT. Never build a client-facing no-code animation builder on it (for example inside a Payload admin); that is the prohibited use.
3. React 19.3.1 is inside @gsap/react's peer range (react >=17), but nothing in this skill has run on React 19. Run a StrictMode smoke test (mount, navigate, unmount; the ScrollTrigger count returns to zero) before claiming compatibility.
4. Read the installed `dist` and `.d.ts` files before trusting a README table (Lenis's README is wrong about `duration`).
5. mediawave.co.il keeps its own stack and pins (React 18 + Vite + prerender).

## 13. Prototype first

1. **Stage 3 builds the hero and one chapter only**, desktop and mobile together, on the engine with the real effects and real content, before any other section exists.
2. **The hero idea is picked on a cheap idea board** first: 8-10 ideas, each with what you see, why it comes from the client's world, how it is built and the risk. MediaWave's own hero went through four fully built Rive concepts in about a day before this rule existed.
3. **Show it running:** the screenshot matrix (1440x900, 1440x700, 390, reduced), a film (`--viewports desktop,short,mobile`) and Nati's phone over the LAN. Nati approves before anything else is built.
4. Heron's retrospective says the same: scroll, motion and responsive decisions can only be judged running live, so prototype in the browser early and build mobile alongside desktop from day one.
5. **The prototype proves the budget.** If the hero and one chapter already drop frames on a throttled phone, the plan changes at the prototype, not after the build.
