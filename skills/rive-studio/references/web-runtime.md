# Web runtime: React, Next.js, Astro and plain HTML

Current method for integrating a `.riv` on the web. Version numbers come from the skill's `research-date` (`@rive-app/webgl2` 2.44.x, `@rive-app/react-webgl2` 4.36.x); when in doubt, check the live page as markdown, for example `https://rive.app/docs/runtimes/web/data-binding.md`. Starters: `assets/code/RiveStage.tsx` (React, Next.js) and `assets/code/rive-stage.js` (custom element for Astro and any HTML).

## Contents
1. Choose the package
2. Core API (vanilla)
3. Data binding
4. React
5. Next.js App Router
6. Astro
7. WASM loading and CSP
8. Sizing, layout shift and RTL
9. Hebrew text and fonts
10. Performance
11. One clock: pointer, scroll and the persistent object
12. Rest frame, generator and late load
13. Accessibility and reduced motion
14. Troubleshooting
15. Old patterns

---

## 1. Choose the package

All packages share one API; switching is an import change. Use one renderer per site.

| Package | Renderer | Choose when |
|---|---|---|
| `@rive-app/webgl2` / `@rive-app/react-webgl2` | Rive Renderer (WebGL2) | the default: matches the editor, supports vector feathering |
| `@rive-app/canvas` / `@rive-app/react-canvas` | Canvas2D | many small instances on one page, no feathering needed, or WebGL unavailable |
| `@rive-app/canvas-lite` / `@rive-app/react-canvas-lite` | Canvas2D, smaller WASM | no text, layouts, audio or scripting in the file. Never for Hebrew text or RTL layouts |

Sizes before compression: about 0.5 MB of JS plus 0.8-0.9 MB (lite) to 2.2 MB (webgl2) of WASM, compiled once per page. Measured on `@rive-app/canvas-lite` 2.43.1: `rive.js` 434 KB, `rive.wasm` 882 KB (about 362 KB gzipped). The React packages pin their renderer at an exact version; self-hosted WASM must match that version. The legacy `@rive-app/webgl` and `@rive-app/react-webgl` packages are deprecated: move to webgl2.

## 2. Core API (vanilla)

```js
import { Rive, Layout, Fit, Alignment } from '@rive-app/webgl2';
const r = new Rive({
  src: '/rive/hero.riv',           // or buffer, or riveFile (shared parsed file)
  canvas,                          // HTMLCanvasElement
  artboard: 'Hero',                // default artboard if omitted
  stateMachine: 'Main',            // singular; name it explicitly
  autoplay: true,
  autoBind: true,                  // binds the artboard's default view model instance
  layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  isTouchScrollEnabled: true,      // touch drags still scroll the page
  onLoad: () => { r.resizeDrawingSurfaceToCanvas(); /* set every app-to-Rive property now */ },
  onLoadError: (e) => console.error('rive load', e),
});
// teardown (SPA route change, element removed): r.cleanup();
```

- `Fit`: `Contain` (default), `Cover`, `Fill`, `FitWidth`, `FitHeight`, `None`, `ScaleDown`, `Layout`. `Fit.Layout` resizes the artboard to the canvas so Rive layouts reflow; `layoutScaleFactor` applies only to it.
- Methods: `play`, `pause`, `stop`, `reset`, `load`, `resizeDrawingSurfaceToCanvas(dpr?)`, `startRendering`, `stopRendering`, `cleanup`.
- Pointer options: `shouldDisableRiveListeners` (decorative pieces), `isTouchScrollEnabled`, `enableMultiTouch`.
- Keep the default draw optimisation (`DrawOnChanged`).

## 3. Data binding

```js
const vmi = r.viewModelInstance;                 // after load, with autoBind: true
const progress = vmi?.number('progress');        // accessors return null when the name is missing
if (progress) progress.value = 72;
const rm = vmi?.boolean('prefersReducedMotion');
if (rm) rm.value = matchMedia('(prefers-reduced-motion: reduce)').matches;
const status = vmi?.enum('status');
if (status) status.value = 'loading';
vmi?.trigger('celebrate')?.trigger();
vmi?.number('selectedIndex')?.on((e) => onSelect(e.data));   // Rive-to-app: observe
```

- Accessors on an instance: `number`, `string`, `boolean`, `color`, `enum`, `trigger`, `list`, `image`, `artboard`, `font`. Nested properties take a path (`'card/title'`) or go through `.viewModel('card')`.
- Values: `.value` for scalars; color also `rgb`, `rgba`, `argb`, `alpha`, `opacity`; enum `values`, `valueIndex`; trigger `trigger()`; list `length`, `addInstance`, `addInstanceAt`, `removeInstance`, `removeInstanceAt`, `instanceAt`, `swap`; image `.value = await decodeImage(bytes)`; font `.value = await decodeFont(bytes)`; artboard `.value = r.getBindableArtboard('Name')`.
- Observing: `prop.on(cb)` and `prop.off(cb)`. A write applies on the next advance; observers fire after it.
- Manual binding instead of autoBind: `r.viewModelByName('HeroVM')` (or `defaultViewModel()`), then `vm.defaultInstance()`, `vm.instanceByName('dark')` or `vm.instance()` (blank), then `r.bindViewModelInstance(vmi)`. Global view models: `r.setGlobalViewModelInstance(name, vmi)` then `r.bind()`.
- Introspection: `r.viewModelCount`, `r.viewModelByIndex(i).properties` (`{ name, type }`), `r.enums()`, `r.contents`.
- Assigning through optional chaining (`a?.b = 1`) is a syntax error; guard with `if` as above.

## 4. React

```tsx
const { rive, RiveComponent } = useRive({ src, artboard, stateMachine, autoplay: true, autoBind: true, layout });
const vmi = rive?.viewModelInstance ?? null;
const { setValue: setProgress } = useViewModelInstanceNumber('progress', vmi);
const { trigger: celebrate } = useViewModelInstanceTrigger('celebrate', vmi);
```

- Hooks: `useViewModel(rive, { name })`, `useViewModelInstance(vm, { name | useDefault | useNew, rive })`, `useGlobalViewModelInstance`, and per type `useViewModelInstanceNumber`, `String`, `Boolean`, `Color` (`setRgb`, `setRgba`, `setAlpha`, `setOpacity`), `Enum` (`values`), `Trigger` (`{ trigger }`, `onTrigger` for Rive-fired triggers), `List`, `Image`, `Font`, `Artboard`. Each returns `value` (null until resolved) and setters.
- To set values before the first frame (no flash of defaults), use `useRive({ ..., onRiveReady: (r) => { ... } })` or set them in `onLoad`.
- `useRive` creates the instance once per canvas: later changes to `src`, `artboard`, `stateMachine` or `layout` are ignored. Remount with a `key`, or set `rive.layout` directly.
- It cleans up on unmount, pauses rendering when off screen (an internal IntersectionObserver), and clamps the pixel ratio to 1-3. It still downloads the file and WASM on mount: defer mounting for below-the-fold pieces.
- `RiveComponent`: `className` goes on the wrapper div and replaces its default 100% sizing (and `style` is then ignored), so size the wrapper yourself; `aria-*` and `role` go on the canvas; `children` render as canvas fallback content.
- Several instances of one file: `useRiveFile({ src })` once, pass `riveFile` to each `useRive`.
- Keep `useRive` and its `RiveComponent` together in one dedicated component.

**Recipe: a real button over a decorative canvas** (the most common job). The DOM button keeps the Hebrew label, the focus ring, the keyboard and the screen reader; the canvas only reacts.

```tsx
export function RiveButton({ busy, done, onPress, children }: { busy: boolean; done: boolean; onPress: () => void; children: React.ReactNode }) {
  const stage = useRef<RiveStageHandle>(null);
  const [s, set] = useState({ isHovered: false, isPressed: false, isFocused: false });
  const press = (isPressed: boolean) => set((v) => ({ ...v, isPressed }));
  useEffect(() => { if (done) stage.current?.fire('celebrate'); }, [done]);
  return (
    <button type="button" aria-disabled={busy} onClick={() => { if (!busy) onPress(); }}
      className="relative isolate overflow-hidden rounded-xl px-8 py-4 focus-visible:outline focus-visible:outline-2"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') set((v) => ({ ...v, isHovered: true })); }}
      onPointerLeave={() => set((v) => ({ ...v, isHovered: false, isPressed: false }))}
      onPointerDown={() => press(true)} onPointerUp={() => press(false)}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') press(true); }} onKeyUp={() => press(false)}
      onFocus={() => set((v) => ({ ...v, isFocused: true }))} onBlur={() => set((v) => ({ ...v, isFocused: false }))}>
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <RiveStage ref={stage} src="/rive/cta.riv" decorative eager className="h-full"
          values={{ ...s, isDisabled: busy, status: busy ? 'loading' : done ? 'success' : 'idle' }} />
      </span>
      {children}
    </button>
  );
}
```

Hover is set only for a mouse pointer, so touch never sticks in hover. With the custom element the pattern is the same: put `<rive-stage data-decorative>` inside the button and call `el.set('isHovered', true)` from the same events.

## 5. Next.js App Router

- The React packages ship no `"use client"` directive: put Rive in your own client component. Server rendering outputs the empty wrapper and canvas, which is what reserves the box.
- Read `window` and `matchMedia` in effects, never during render, or hydration mismatches.
- `public/rive/hero.riv` is served at `/rive/hero.riv`. Exclude `.riv` and `.wasm` from i18n or auth middleware matchers.
- Below the fold: `next/dynamic(() => import('./RiveStage'), { ssr: false })` from inside a client component, or mount on visibility.
- Preload a hero file from a server component with `preload('/rive/hero.riv', { as: 'fetch', crossOrigin: 'anonymous' })` from `react-dom`.
- Development hot reload can throw `BindingError: File instance already deleted`: add `// @refresh reset` to the Rive component file.

## 6. Astro

- Files in `public/` need no config; importing `.riv` from `src/` needs `vite.assetsInclude: ['**/*.riv']`.
- React island: `client:visible={{ rootMargin: '200px' }}` below the fold, `client:idle` for low priority, `client:load` only for a hero. `client:only="react"` skips server rendering.
- No framework: the `rive-stage` custom element (`assets/code/rive-stage.js`). Its `connectedCallback` runs per instance, props come from `data-*`, and it survives `<ClientRouter />` page swaps because the browser calls the element callbacks.

## 7. WASM loading and CSP

- By default the runtime fetches `rive.wasm` from unpkg and falls back to jsDelivr. Production sites self-host: copy `rive.wasm` and `rive_fallback.wasm` from the installed package into `public/rive/` with the version in the filename, then call `RuntimeLoader.setWasmUrl('/rive/rive-<version>.wasm')` (import `RuntimeLoader` from the same package you render with) before the first instance. Serve as `application/wasm` with a long immutable cache.
- Start the download early with `RuntimeLoader.awaitInstance().catch(() => {})`; a preload `href` must equal the `setWasmUrl` URL or the file downloads twice.
- CSP: `script-src 'wasm-unsafe-eval'`; `connect-src` must cover the `.riv` and `.wasm` origins (both use fetch), plus Rive's CDN if hosted assets are used.

## 8. Sizing, layout shift and RTL

- Reserve the box in server HTML: an aspect-ratio class (`aspect-video`, `aspect-[4/3]`) or a fixed height (`h-[70svh]` with `Fit.Layout`). The canvas fills it absolutely. Never size from the artboard after load (`fitCanvasToArtboardHeight` shifts layout).
- Vanilla: call `resizeDrawingSurfaceToCanvas()` on resize and on device-pixel-ratio changes; on phones consider capping at 2. React does this itself.
- `dir="rtl"` does not mirror a canvas, and CSS `scaleX(-1)` mirrors glyphs and likely breaks hit-testing. Author direction in the file: a Rive layout's direction setting (left-to-right or right-to-left) cascades to children set to Inherit and flips rows and text alignment. Switch at runtime through a view model boolean or enum the file wires (`isRtl`), or a separate artboard. Set alignment explicitly (`CenterRight` or `CenterLeft`); it does not follow the page.

## 9. Hebrew text and fonts

- Right-to-left text and layouts need web runtime 2.26.7 or later (React 4.18.6) and are not in the lite packages. Shaping uses HarfBuzz and ordering uses SheenBidi with paragraph direction forced or auto-detected.
- The font must contain Hebrew glyphs, and its export setting must keep them: "Glyphs used" keeps only what was typed at design time, so text set at runtime needs "Custom" with Hebrew selected, or "All".
- Large fonts stay out of the file: mark the font Referenced and supply it in `assetLoader`:
  ```js
  assetLoader: (asset, bytes) => {
    if (!asset.isFont || bytes.length) return false;
    fetch('/fonts/brand-hebrew.ttf').then((r) => r.arrayBuffer())
      .then((b) => decodeFont(new Uint8Array(b))).then((f) => { asset.setFont(f); f.unref(); });
    return true;
  },
  ```
- Missing glyphs (2.37.1 and later): decode a Hebrew font and register `RiveFont.setFallbackFontCallback((cp) => (cp >= 0x0590 && cp <= 0x05FF) || (cp >= 0xFB1D && cp <= 0xFB4F) ? [heFont] : null)` before rendering.
- Always render a real check with mixed strings: Hebrew with digits, Latin, punctuation, the shekel sign, and nikud if used. Content text still belongs in HTML.

## 10. Performance

- A canvas is never the LCP element. For a hero, put a poster image (`fetchpriority="high"`) under the canvas and fade it out in `onLoad`, or keep the heading as the LCP with an inline SVG rest frame (§12).
- Defer below-the-fold pieces by mounting late; React's observer only pauses rendering, it does not delay the download.
- Vanilla pauses only for hidden tabs: add an IntersectionObserver calling `startRendering` and `stopRendering` (the custom element starter does). That pair is for visibility only: a piece the page moves also rests, with its state machine paused, whenever its values settle (§11).
- Browsers cap live WebGL contexts (reported around 16 on desktop Chrome and 8 on Android; the oldest is lost). React's offscreen renderer shares one; with many vanilla instances use `@rive-app/canvas` or share a parsed file.
- Non-normal blend modes are expensive on webgl2; measure on a real phone.
- Fonts dominate file size: subset them or load them out of band; reference large images instead of embedding them.

## 11. One clock: pointer, scroll and the persistent object

A site built on the pattern-breaker motion engine (pattern-breaker and site-director sites) has one clock: `gsap.ticker`, which also drives Lenis and ScrollTrigger. A Rive piece the page moves joins that clock; it never starts a `requestAnimationFrame` loop of its own.

- **Write view model values from the shared clock**: `engine.onFrame(job)` for pointer-driven and damped values, a ScrollTrigger `onUpdate` or `onToggle` for scroll-mapped values (Lenis already smooths the scroll on the same clock). `engine.onFrame` returns `off()`; `engine.damp(k)` is the frame-rate independent lerp factor.
- **Leave the clock when the values settle.** With Lenis attached the ticker never sleeps, so a job that stays registered runs every frame for nothing. Call `off()` and join again on the next input. `engine.frameJobCount` reads 0 when every effect has settled (use it in QA).
- **Rest Rive's own loop too: pause the machine, not only the rendering.** The high-level runtime draws on its own animation-frame loop while its state machine plays, and its API offers no way to hand that loop to the ticker. `stopRendering()` does not hold on its own: on canvas-lite 2.43.1, `resizeDrawingSurfaceToCanvas()` (the custom element starter calls it on every resize, and React resizes the drawing surface itself, §8) and any later `startRendering()` (the starters' visibility observers) restart a stopped loop for good, and the loop then resumes with the whole stopped time as one advance. A paused machine draws at most one frame on those calls and stays quiet, and `play()` resumes it with no time jump. So the rest is `rive.pause()` once the values have settled and the file has finished its own transition, and `rive.play()` on the next write. `startRendering()` and `stopRendering()` stay what they are for: visibility.
- **Rest from the first frame.** Arm the rest at mount, not only after the first input: a piece nobody touches must rest too, and so must a piece after a resize or after scrolling out and back. The settle window covers the file's intro the first time (the `intro` option) and the longest transition in the contract's Motion spec every other time. Writes apply on the next advance, so never pause in the same tick as the last write. The `restWhenSettled` helper below does all of this; recipes A and B use it. Page code that starts a moment itself (an intro when the piece scrolls in) calls the helper's `touch(seconds)` with the moment's length rather than `play()`, so the rest follows it.
- Pausing also detaches the file's own listeners until the next `play()`. A file with hover or press authored inside it is woken from the page (a `pointerenter` on the canvas calls `touch()`), or it stays decorative and the page drives it, as in the recipes.
- A file the page moves needs a running state machine, even one looping empty state: MediaWave's lens contract records that bindings apply only while a machine runs (canvas-lite 2.43.1). `touch()` plays the machine before the frame it draws, so a write made while the piece rests still applies.
- Under the engine's `REDUCE` (strict on client sites): no pointer following and no scrubbed numbers; a state may still swap instantly when the visitor reaches it, and `prefersReducedMotion` makes the file show final frames. The recipes expect the contract's `prefersReducedMotion` property: a file without it has no reduced path to rest on.

MediaWave's hero lens predates this rule: it runs its own `requestAnimationFrame` spring next to ScrollTrigger (it does sleep when settled and off screen, and stops the canvas again after a resize). New pieces use the helper and the recipes below.

**The rest helper.** One per Rive instance: each recipe makes its own, and when one instance takes both recipes, create one helper and pass it to both as `rest`. A recipe cleans up only a helper it created: a shared helper belongs to the caller, who calls its `cleanup()` after both recipes' (the engine's `destroy()` also runs it), so one recipe's cleanup (a React StrictMode re-run, a remount) never stops the rest the other recipe still relies on.

```js
// recipe: rest-when-settled
// touch() after every write, touch(seconds) for a longer moment. The piece rests (machine paused,
// no draw loop) once nothing has changed for `settle` seconds; the first window, from mount, lets the
// file's intro finish.
export function restWhenSettled(engine, rive, { settle = 0.5, intro = settle } = {}) {
  const ticker = engine.gsap.ticker;
  let quietAt = ticker.time + intro, off = null;
  const job = () => {
    if (ticker.time < quietAt) return;                   // the last write and the file's transition still drawing
    off(); off = null;                                   // leave the clock
    rive.pause();                                        // and end Rive's own loop: a resize cannot restart it
  };
  const touch = (hold = settle) => {                    // hold: a longer window for a moment the page starts
    quietAt = Math.max(quietAt, ticker.time + hold);
    if (off) return;
    rive.play();                                         // draws now; time resumes without a jump
    off = engine.onFrame(job);
  };
  if (!rive.isPlaying) rive.play();                      // paused by an earlier rest (the engine was rebuilt)
  off = engine.onFrame(job);                             // rest from the first frame, input or not
  const cleanup = () => { off?.(); off = null; };
  engine.addCleanup(cleanup);
  return { touch, cleanup };
}
```

**Recipe A: a pointer-driven value.** The contract names a number, here `pointerX` (-1 to 1); the file decides what it means in RTL (`isRtl`).

```js
// recipe: pointer-on-clock
export function followPointer(engine, rive, el, { name = 'pointerX', k = 0.15, settle = 0.4, intro, rest } = {}) {
  const ownRest = !rest;                                 // a shared helper is the caller's to clean up
  rest ??= restWhenSettled(engine, rive, { settle, intro }); // rests the intro, and later every quiet spell
  const dropRest = () => { if (ownRest) rest.cleanup(); };
  const prop = rive.viewModelInstance?.number(name);
  if (!prop || engine.REDUCE || !engine.FINE) return dropRest; // strict reduced motion; touch keeps the rest pose
  let target = 0, shown = 0, off = null;
  const job = () => {
    shown += (target - shown) * engine.damp(k);         // the same speed at 30, 60 or 120 fps
    if (Math.abs(target - shown) < 0.001) shown = target;
    prop.value = shown;
    rest.touch();                                        // keep drawing while the value moves
    if (shown === target) { off(); off = null; }        // leave the clock; the rest pauses Rive after `settle`
  };
  const wake = () => { if (!off) off = engine.onFrame(job); };
  const move = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    target = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    wake();
  };
  const leave = () => { target = 0; wake(); };
  el.addEventListener('pointermove', move, { passive: true });
  el.addEventListener('pointerleave', leave, { passive: true });
  const cleanup = () => {
    off?.(); off = null;
    dropRest();
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerleave', leave);
  };
  engine.addCleanup(cleanup);
  return cleanup;
}
```

**Recipe B: the storyboard's persistent object.** One object stays on screen (usually in a CSS sticky stage) and changes state chapter by chapter. The contract gives it a chapter enum whose values are the storyboard's chapter ids (lowercase ASCII, as the contract's enum rule asks) and, when the file animates between chapters, a 0-1 progress number over the whole story. Find the chapter sections by the page's own ids or refs: `data-chapter` and `data-dossier` are site-director's inert linkage attributes, and no script depends on them.

```js
// recipe: story-object
// chapters: [{ el, id }] in story order; story: the element that spans them.
export function driveStoryObject(engine, rive, story, chapters,
  { progressName = 'storyProgress', chapterName = 'chapter', settle = 0.5, intro, rest } = {}) {
  const { ScrollTrigger } = engine;
  const vmi = rive.viewModelInstance;
  const progress = vmi?.number(progressName);
  const chapter = vmi?.enum(chapterName);
  const reduced = vmi?.boolean('prefersReducedMotion');
  if (reduced) reduced.value = engine.REDUCE;
  const ownRest = !rest;                                 // a shared helper is the caller's to clean up
  rest ??= restWhenSettled(engine, rive, { settle, intro }); // ScrollTrigger writes; the rest ends Rive's loop
  const triggers = chapters.map(({ el, id }) => ScrollTrigger.create({
    trigger: el, start: 'top center', end: 'bottom center',
    onToggle: (self) => { if (self.isActive && chapter) { chapter.value = id; rest.touch(); } },
  }));
  if (progress && !engine.REDUCE) {                      // strict reduced motion: states swap, nothing scrubs
    triggers.push(ScrollTrigger.create({
      trigger: story, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => { progress.value = self.progress; rest.touch(); },
    }));
  }
  const cleanup = () => { triggers.forEach((t) => t.kill()); if (ownRest) rest.cleanup(); };
  engine.addCleanup(cleanup);
  return cleanup;
}
```

Call it from the file's load callback, after the values that must be right on the first frame (`isRtl`, `prefersReducedMotion`) are set. Pass `intro` (seconds) when the file plays an entrance of its own after load. When the file needs progress inside each chapter rather than over the story, bind a `chapterProgress` number from each chapter trigger's `onUpdate` instead. When the stage height depends on the viewport (a full-screen scene), the engine's `onViewportResize` covers the 1440x900 to 1440x700 window change.

## 12. Rest frame, generator and late load

Recommended practice. MediaWave built every Rive piece with a generator (`build-lens.mjs`, `build-hero.mjs`, `build-sea.mjs`, `build-scene.mjs` for the contact companion) and gave the lens, the earlier hero build and the companion the rest frame and the late-load rules below, on canvas-lite 2.43.1. It removes the two most visible Rive failures: a jump when the canvas replaces its placeholder, and an intro that starts seconds late.

**One set of numbers, two outputs.** Keep a project-local generator, `design/rive/<piece>/build-<piece>.mjs`, that holds the geometry, colours and poses as plain numbers and writes both the RML (`design/rive/<piece>/cli/scene.rml`, built with the Rive CLI, `build-cli.md`) and a static SVG of the rest pose drawn from the same numbers. When the page also moves the file, the page and the generator import the same geometry module (MediaWave's lens shares `lens-geometry.js`). Add a script such as `"rive:<piece>": "node design/rive/<piece>/build-<piece>.mjs --riv"`, regenerate after every change, and write the "how to extend" note into the brief. Check that the outputs agree: capture the Rive idle frame and the SVG at the same size and compare them; on MediaWave's companion they differ only at antialiased edges.

**The rest frame paints first.** The SVG is the first paint, the no-JS frame, the reduced-motion frame and the fallback. For a hero, inline the SVG markup instead of an `<img>`: an inline SVG is not an LCP candidate and an `<img>` is, so the heading stays the LCP. The canvas sits over it and becomes visible only after the first Rive frame with the current values has drawn, so the swap cannot be seen.

**Mount late, cut off late intros.** Below the fold, load the runtime with a dynamic `import()` only after the window `load` event, an idle callback and the piece coming near the viewport (MediaWave's companion: 600 px). An intro above the fold starts loading at once but has a cutoff: if Rive is not ready within about 4-4.5 s (MediaWave: 4 s for the earlier hero build, 4.5 s for the lens), the rest frame stays for this visit and the intro never starts late. Under strict reduced motion a piece whose meaning lives in one pose never loads the runtime: pass `reduce: engine.REDUCE` (or the media query's value on a page without the engine). A persistent object that carries the story's states may load it and swap states instantly (§11, recipe B), so it passes `reduce: false`.

```js
// recipe: mount-late
// create(): resolves with a Rive instance after its onLoad has set every first-frame value.
export function mountLate(el, create, { margin = 600, intro = false, cutoffMs = 4500, reduce = false } = {}) {
  if (reduce) return () => {};                           // strict reduced motion: the rest frame is the piece
  let rive = null, gone = false, late = false, idle = 0, timer = 0;
  const cutoff = intro ? setTimeout(() => { late = true; }, cutoffMs) : 0;
  const start = async () => {
    const r = await create().catch(() => null);
    if (!r) return;                                      // load error: the rest frame stays
    if (gone || late) { r.cleanup(); return; }          // too late, or unmounted meanwhile
    clearTimeout(cutoff);
    rive = r;
    // writes apply on the next advance: reveal the canvas once that frame is drawn
    requestAnimationFrame(() => requestAnimationFrame(() => { if (!gone) el.dataset.live = ''; }));
  };
  const whenIdle = () => {
    if ('requestIdleCallback' in window) idle = requestIdleCallback(() => start(), { timeout: 2500 });
    else timer = setTimeout(start, 300);
  };
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    if (document.readyState === 'complete') whenIdle();
    else addEventListener('load', whenIdle, { once: true });
  }, { rootMargin: `${margin}px 0px` });
  if (intro) start(); else io.observe(el);
  return () => {
    gone = true;
    io.disconnect();
    removeEventListener('load', whenIdle);
    if (idle) cancelIdleCallback(idle);
    clearTimeout(timer);
    clearTimeout(cutoff);
    rive?.cleanup(); rive = null;
    delete el.dataset.live;
  };
}
```

```css
/* the box is reserved in the HTML; the rest frame and the canvas fill it */
.piece { position: relative; aspect-ratio: 1; }
.piece > svg, .piece > img, .piece > canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.piece > canvas { opacity: 0; }
.piece[data-live] > canvas { opacity: 1; }
.piece[data-live] > svg, .piece[data-live] > img { visibility: hidden; }
```

`create` wraps the core API (§2): `import()` the runtime, `RuntimeLoader.setWasmUrl(...)`, `new Rive({ ..., onLoad: () => { /* set isRtl, prefersReducedMotion, values */ resolve(r); }, onLoadError: (e) => { r.cleanup(); reject(e); } })`. On a page with the engine, hand the cleanup to `engine.addCleanup` so a route change or the motion switch removes it.

## 13. Accessibility and reduced motion

- Decorative piece: `aria-hidden="true"` on the canvas and `shouldDisableRiveListeners: true`.
- Informative piece: `role="img"` and an `aria-label` in the page language; announce changing values through an `aria-live` region in the DOM.
- Interactive piece: real DOM `<button>`s and inputs carry the meaning and write view model properties or triggers; the canvas reacts. Keep the focus ring on the DOM control.
- Semantics overlay (experimental, web 2.39 and React 4.30 or later): `semanticsMode` mirrors roles authored in the editor into an invisible DOM; its nodes are reachable by screen readers but not by Tab. Use it in addition to real controls, not instead.
- Reduced motion: set the `prefersReducedMotion` view model boolean from `matchMedia('(prefers-reduced-motion: reduce)')` at load and on change; the file switches to its reduced path. Fallback for files without it: `autoplay: false`, or `pause()` after the first frame.
- On a page that runs the pattern-breaker motion engine, take the value from `engine.REDUCE` instead: it also covers the site's own motion switch and `?reduce=1`, and the boot code rebuilds the engine when the OS setting changes (the `motion:preference` event). Client sites follow the strict policy (`verification.md` §5): final frames, no scrub, no loops, no pointer following.

## 14. Troubleshooting

| Symptom or message | Cause and fix |
|---|---|
| `Failed to fetch the Rive file: HTTP 404` | wrong path (no `/public/` prefix), middleware rewrite, or basePath |
| `Problem loading file; may be corrupt!` | the response is not a `.riv` (an HTML rewrite or a Git LFS pointer) or a CORS failure; add `*.riv binary` to `.gitattributes` |
| `Invalid artboard name or no default artboard` | artboard name, or the artboard is not a Component and not the default (drafts are not exported) |
| `State Machine with name ... not found` | case-sensitive state machine name; check the contract and the probe |
| `Unable to create the renderer ... WebGL` | use `@rive-app/canvas` |
| `Attempt to use file after calling cleanup.` | an instance used after unmount; guard async callbacks |
| Blank canvas | a wrapper with no height, `className` without sizing, a zero-size parent, a lost WebGL context, or wrong names |
| Property setter does nothing | the accessor returned null (name or type mismatch); run the probe |
| First frame shows defaults | values set after load; use `onRiveReady` or set them in `onLoad` |

Debug hook in development: `window.__rive = r`, then inspect `r.contents`, `r.viewModelInstance.properties`, `r.enums()`; `enablePerfMarks: true` adds marks to the DevTools performance panel.

Playwright: set `data-rive-ready` on the wrapper in `onLoad` and wait for it; drive state through the DOM or `page.evaluate`; `pause()` before a screenshot (Playwright's `animations: 'disabled'` does not stop a canvas); `page.emulateMedia({ reducedMotion: 'reduce' })` for the reduced path.

## 15. Old patterns

Deprecated since web runtime 2.41 (still working, removal planned for v3): `stateMachines` (plural), `animations`, `automaticallyHandleEvents`, `onStateChange`, `onLoop`, `EventType.RiveEvent` subscriptions, `stateMachineInputs()`, `setTextRunValue` and its path variant, `scrub()`; in React `useStateMachineInput` since 4.33. Migrate: inputs become view model properties (the editor has "Convert Inputs to View Models"), text runs become string properties, general events become triggers or observed properties (open-url and audio events still work). When a legacy file must stay, read inputs with `r.stateMachineInputs('Main')` and set `.value` or call `.fire()`.
