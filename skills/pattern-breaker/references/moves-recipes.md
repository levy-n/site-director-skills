# Moves recipes

Read this when building a move from `moves.md`. Each recipe is vanilla JavaScript on top of `assets/engine/motion-engine.js` (GSAP 3.15, ScrollTrigger, SplitText, Lenis 1.3). Recipes marked ✓ run together in `assets/demo/moves-gallery.html` and pass motion-audit on desktop and mobile; the others are generalised from liavmatzri.co.il's production code. In React, put the same code inside `useScene` (`assets/engine/react.tsx`).

Every recipe follows the same rules: the markup shows the final state without JavaScript; the reduced-motion branch leaves that final state, through `.motion-reduced` CSS rather than inline styles (a prerender saves inline styles into the HTML); holds are sticky stages; horizontal motion is multiplied by `engine.DIR` so RTL and LTR both read correctly; and every listener, ticker callback and DOM edit a scene makes is undone by a cleanup function the scene returns. `gsap.context` reverts only what GSAP made, and runs the returned function on `destroy()`, so the accessibility switch and route changes leave nothing running (measured before this rule: after "stop animations" two ticker callbacks kept running, a counter showed "0", the hover preview still opened and the marquee doubled on every rebuild).

## Contents
- Setup
- E-01 Masked line rise ✓ · E-02 Clip reveal ✓ · E-03 Marker draw ✓ · E-04 Word ink-fill ✓ · E-05 Count to a real number ✓
- H-01 Text-swap stage ✓ · H-02 Horizontal track ✓ · H-03 Frame sequence ✓ · H-04 Timeline argument · H-05 Conversation · H-06 Travelling headline · H-07 Rolling step counter ✓ · H-10 Split open
- V-01/V-02 Velocity marquee and skew ✓
- C-01 Follow preview ✓ · C-02 Contained magnetic action
- T-01 Theme layers ✓ · T-02 Footer reveal · T-03 Lightbox from the card
- M-01 Play in view · D-01 Success burst · N-01 CSS view reveal ✓

---

## Setup

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { createMotionEngine, themeLayers } from './motion-engine.js';

const engine = createMotionEngine({ gsap, ScrollTrigger, SplitText, Lenis });
const { scene, REDUCE, FINE, DIR } = engine;
scene(() => { themeLayers(engine); }); // only if sections declare data-theme; inside a scene so destroy() removes it
```

Base CSS every project needs:

```css
html { scroll-behavior: auto; }                 /* native smoothing fights Lenis */
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-stopped { overflow: clip; }
.hold { position: relative; }                   /* a held scene: tall wrapper … */
.stage { position: sticky; top: 0; height: 100svh; overflow: clip; } /* … sticky stage */
/* reduced motion: a hold becomes an ordinary section showing its last frame */
.motion-reduced .hold { height: auto !important; }
.motion-reduced .stage { position: static; height: auto; }
```

Give each scene's main trigger an `id` (`engine.holdTimeline(wrap, { id: 'story' })`, or `scrollTrigger: { id: 'story' }`): QA then films and screenshots exact states with `?at=story:0.5`, which survives layout changes where pixel offsets don't. Stage content must fit `100svh` at 390 × 664 (a phone with browser bars); check it at 200 % zoom too.

## E-01 Masked line rise ✓

```js
if (!REDUCE) engine.splitLines(document.querySelector('.headline'), {
  // build and RETURN the animation: on a width change SplitText re-splits and rebuilds it
  onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1, stagger: 0.09, ease: 'power3.out',
    scrollTrigger: { trigger: '.headline', start: 'top 80%', once: true } }), // a signature entrance: meant to be watched
});
```
Not on the LCP element (usually the hero H1): masked lines have no paint until they rise, which pushes LCP to the end of the animation. Let the hero H1 paint at the first frame and animate a marker, a motif or a sibling instead. Lines are split after fonts load (`splitLines` waits for `document.fonts.ready`, turns off kerning shifts and keeps the accessible text with `aria: 'auto'`). `mask: 'lines'` wraps each line so it rises from behind its own edge. Don't put `text-wrap: balance` on a split target. Hebrew: split lines or words, never characters, and split through `engine.splitLines`: plain SplitText collapses RTL text into one line (hebrew-rtl.md §3).

## E-02 Clip reveal with inner settle ✓

```js
scene(({ gsap }) => {
  if (REDUCE) return;
  const box = document.querySelector('.reveal-media');
  gsap.timeline({ scrollTrigger: { trigger: box, start: 'center 85%', once: true } })
    .fromTo(box, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut' }, 0)
    .fromTo(box.querySelector('img'), { scale: 1.15 }, { scale: 1, duration: 1.5, ease: 'power3.out' }, 0.05);
});
```
Trigger on the image's centre for tall images, otherwise most of the reveal happens below the screen edge. Never use this on the LCP image.

## E-03 Marker draw ✓

```css
.mark { position: relative; }
.mark::after { content: ""; position: absolute; inset-inline: 0; bottom: .06em; height: .12em; background: var(--signal);
  transform-origin: var(--mark-origin, right); transform: scaleX(var(--u, 1)); }  /* right = start in RTL */
html[dir="ltr"] .mark::after { --mark-origin: left; }
```
```js
if (!REDUCE) { gsap.set(mark, { '--u': 0 }); gsap.to(mark, { '--u': 1, duration: 0.7, ease: 'power2.inOut', delay: 0.8 }); }
```
`--u` defaults to 1 in CSS, so without JS the marker is drawn. GSAP tweens CSS variables only when they have a start value (set it first).

## E-04 Word ink-fill ✓

```js
scene(({ gsap }) => {
  if (REDUCE) return;                                     // the paragraph stays as written
  const p = document.querySelector('.ink'), text = p.textContent;
  const words = text.trim().split(/\s+/);
  p.textContent = '';
  const spans = words.map((w, i) => { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; p.append(s); if (i < words.length - 1) p.append(' '); return s; });
  gsap.set(spans, { '--o': 0.25 });
  gsap.to(spans, { '--o': 1, stagger: 0.3, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: 0.4 } });
  return () => { p.textContent = text; };
});
```
CSS: `.ink .w { opacity: var(--o, 1); }`. The words stay real text in one paragraph, so screen readers read the sentence.

## E-05 Count to a real number ✓

```html
<div class="num" data-n="312">312</div>  <!-- the real number is in the HTML -->
```
```js
scene(({ gsap, ScrollTrigger }) => {
  if (REDUCE) return;
  const el = document.querySelector('.num'), original = el.textContent, n = Number(el.dataset.n), o = { v: 0 };
  let count = null;                                        // created in onEnter, outside the context
  el.textContent = '0';
  ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true,
    onEnter: () => { count = gsap.to(o, { v: n, duration: 1.4, ease: 'power3.out', onUpdate: () => { el.textContent = String(Math.round(o.v)); } }); } });
  return () => { count?.kill(); el.textContent = original; };   // destroy(): the real number comes back
});
```
Use `font-variant-numeric: tabular-nums` so the width doesn't jitter. Only for real, sourced numbers.

## H-01 Text-swap stage ✓

```html
<div class="hold swap-hold" style="height: 300svh"><div class="stage">
  <div class="swap"><p>First truth.</p><p>Second truth.</p><p>Third truth.</p></div>
  <div class="idx">01 / 03</div>
</div></div>
```
```js
scene(({ gsap }) => {
  const wrap = document.querySelector('.swap-hold'), lines = [...wrap.querySelectorAll('.swap p')], idx = wrap.querySelector('.idx');
  if (REDUCE) { /* make the stage static and stack the lines: the markup already contains all of them */ return; }
  gsap.set(lines.slice(1), { autoAlpha: 0, y: 40 });
  const tl = engine.holdTimeline(wrap, { scrub: 0.5,
    onUpdate: (self) => { idx.textContent = `0${Math.min(lines.length, Math.floor(self.progress * lines.length) + 1)} / 0${lines.length}`; } });
  lines.forEach((l, i) => { if (!i) return;
    tl.to(lines[i - 1], { autoAlpha: 0, y: -40, duration: 0.35, ease: 'power2.in' }, i)
      .to(l, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, i + 0.3); });
  tl.to({}, { duration: 0.6 }); // a beat of rest before the stage releases
});
```
The wrapper's height is the scroll distance (about 80-100 svh per sentence). Give each sentence its own image or motif change when the concept has them.

## H-02 Horizontal track ✓

```css
.motion-reduced .track { flex-wrap: wrap; }      /* with the base CSS: a static stage, the cards as a grid */
```
```js
scene(({ ScrollTrigger }) => {
  const wrap = document.querySelector('.track-hold'), stage = wrap.querySelector('.stage'), track = wrap.querySelector('.track');
  if (REDUCE) return;                                    // the CSS above does the layout: no inline styles
  const distance = () => Math.max(0, track.scrollWidth - stage.clientWidth + 80);
  const size = () => { wrap.style.height = `${distance() + innerHeight}px`; };
  size();
  ScrollTrigger.addEventListener('refreshInit', size);   // re-measure before every refresh
  engine.holdTimeline(wrap, { scrub: 0.5 }).fromTo(track, { x: 0 }, { x: () => DIR * distance(), duration: 1 });
  return () => { ScrollTrigger.removeEventListener('refreshInit', size); wrap.style.height = ''; };
});
```
In RTL the first card sits on the right and the track travels right (`DIR = 1`), revealing cards on the left. To animate things *inside* the moving track (a card that scales at the centre), compute each card's distance from the stage centre in an `onUpdate`, as the reference does: `scale: 1 - Math.min(Math.abs(i - pos), 1.4) * 0.12`. Mobile: cards around 85 % of the width, or a vertical stack.

## H-03 Frame sequence ✓

```js
scene(({ ScrollTrigger }) => {
  const wrap = document.querySelector('.seq-hold'), canvas = wrap.querySelector('canvas');
  const N = 72, PX = innerWidth < 900 ? 11 : 14;             // scroll px per frame
  const frames = new Array(N), ctx = canvas.getContext('2d', { alpha: false });
  const url = (i) => `/seq/f${String(i + 1).padStart(3, '0')}.jpg`;
  let last = null, want = 0;
  const draw = (img) => { if (!img) return; last = img; const cw = canvas.width, ch = canvas.height, r = img.naturalWidth / img.naturalHeight;
    let w = cw, h = cw / r; if (h < ch) { h = ch; w = ch * r; } ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h); };
  const resize = () => { const d = Math.min(devicePixelRatio || 1, 2); canvas.width = innerWidth * d; canvas.height = innerHeight * d; draw(last); };
  const nearest = (f) => { for (let k = 0; k < N; k++) { if (frames[f - k]) return frames[f - k]; if (frames[f + k]) return frames[f + k]; } return null; };
  resize(); engine.onWidthResize(resize);
  if (REDUCE) { /* static stage + the poster frame + all captions visible */ return; }
  wrap.style.height = `${N * PX + innerHeight}px`;
  const load = (i) => new Promise((res) => { const im = new Image(); im.onload = () => { frames[i] = im; if (i === want) draw(im); res(); }; im.onerror = res; im.src = url(i); });
  ScrollTrigger.create({ trigger: wrap, start: 'top 250%', once: true, onEnter: async () => { await load(0); draw(frames[0]); for (let i = 1; i < N; i++) load(i); } });
  ScrollTrigger.create({ trigger: wrap, start: 'top top', end: 'bottom bottom', onUpdate: (self) => {
    want = Math.min(N - 1, Math.floor(self.progress * N));
    const img = nearest(want); if (img && img !== last) draw(img);
  } });
});
```
Production rules from the reference: always draw the nearest loaded frame, never a blank; load a low-resolution tier first (640×360), then a desktop tier (1280×720); give portrait phones their own portrait frames; hold 400-600 px between scenes with a slow 1 → 1.05 zoom; place captions at a fixed share of each scene (about 68 %). Make frames from a real clip of the subject: `ffmpeg -i clip.mp4 -vf "fps=24,scale=1280:-2" -q:v 5 seq/f%03d.jpg`.

## H-04 Timeline argument

The claim "it used to take long; now it doesn't" as distance and speed, without numbers.

```js
// markup: a headline with <span class="strike">old word<i></i></span> and <mark class="mk">new phrase</mark>;
// a track .tl-seg using CSS vars --w (track width share) and --p (dot position share).
const t = engine.holdTimeline(wrap, { scrub: 0.6 });
t.fromTo(strikeLine, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, 0.55)   // the old word is struck…
 .fromTo(seg, { '--p': 0 }, { '--p': 0.28, duration: 0.55, ease: 'none' }, 0.55)              // …while the dot crawls
 .fromTo(seg, { '--w': 1 }, { '--w': innerWidth < 900 ? 0.6 : 0.34, duration: 0.6, ease: 'power3.inOut' }, 1.15) // the road shrinks
 .fromTo(seg, { '--p': 0.28 }, { '--p': 1, duration: 0.35, ease: 'power2.out', immediateRender: false }, 1.6) // and the dot arrives fast
 .fromTo(mark, { '--fill': 0 }, { '--fill': 1, duration: 0.5, ease: 'power2.inOut' }, 1.6)    // the new phrase fills
 .fromTo(ring, { '--ring': 1, '--ringo': 0 }, { '--ring': 3.2, '--ringo': 1, duration: 0.45 }, 1.94); // one pulse
```
Inside `engine.holdTimeline` (which sets `invalidateOnRefresh: true`), give every CSS-variable tween an explicit start with `fromTo`: a `gsap.set` start value is reverted at the first refresh and the tween restarts from the CSS default, which the last-frame rule makes sure exists (measured with GSAP 3.15: scrubbed to 50 %, set + to gave 0.95 against a CSS default of 0.9; `fromTo` gave 0.5). A later tween of the same variable takes `immediateRender: false`, so its start value doesn't paint over the first one at load. Reduced motion: struck word, short track, filled phrase (the CSS defaults).

## H-05 Conversation

```js
const tl = engine.holdTimeline(wrap, { scrub: 0.6 });   // wrapper height ≈ 250-300 px per message
let at = 0.3;
items.forEach((el, k) => {
  if (el.classList.contains('me')) { tl.to(typing, { autoAlpha: 1, duration: 0.15 }, at); at += 0.55; tl.to(typing, { autoAlpha: 0, duration: 0.1 }, at); }
  tl.to(el, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(1.6)' }, at)
    .to(list, { y: () => -Math.max(0, items[k].offsetTop + items[k].offsetHeight + 8 - screen.clientHeight), duration: 0.3 }, at);
  at += 0.8;
});
```
Label it as an illustration ("המחשת תהליך"). Reduced motion: all messages visible.

## H-06 Travelling headline

One headline line several screens wide (`white-space: nowrap`) crosses a sticky stage and stops when its last words reach the margin; skew follows velocity.

```js
const x0 = () => -(h.offsetLeft + h.offsetWidth) + stage.clientWidth * 0.3;   // first words already peeking in (RTL)
const x1 = () => pad - h.offsetLeft;                                         // last words at the margin
const skew = gsap.quickTo(h, 'skewX', { duration: 0.5, ease: 'power3' });
gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top top', end: 'bottom bottom', scrub: 0.7, invalidateOnRefresh: true,
  onUpdate: (self) => skew(gsap.utils.clamp(-8, 8, self.getVelocity() / -260)) } })
  .fromTo(h, { x: x0 }, { x: x1, duration: 1, ease: 'none' })
  .to(underline, { '--u': 1, duration: 0.08 }, 0.9);
```
Wrapper height ≈ `Math.abs(x1() - x0()) * 0.55 + innerHeight`. Start with words already visible, so the scene never opens on an empty screen. Mobile: H-10.

## H-07 Rolling step counter ✓

```js
const show = (k) => gsap.to(roll, { yPercent: (-100 * k) / steps.length, duration: REDUCE ? 0 : 0.6, ease: 'power3.inOut', overwrite: true });
const sync = () => { const line = innerHeight * 0.5; let k = 0; steps.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) k = i; }); show(k); };
ScrollTrigger.create({ trigger: box, start: 'top bottom', end: 'bottom top', onUpdate: sync, onRefresh: sync });
```
Compute the active step from positions on every update; enter/leave events skip steps on fast scrolls and leave a stale number. On phones the counter sits in a sticky bar under the header and the line moves down accordingly.

## H-10 Split open (mobile partner of H-06)

```js
const half = () => (b.offsetTop - (a.offsetTop + a.offsetHeight)) / 2;
engine.holdTimeline(wrap, { scrub: 0.6 })
  .fromTo(a, { y: () => half() }, { y: 0, duration: 1, ease: 'power3.inOut' }, 0)
  .fromTo(b, { y: () => -half() }, { y: 0, duration: 1, ease: 'power3.inOut' }, 0)
  .fromTo(media, { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power3.inOut' }, 0)
  .fromTo(media.querySelectorAll('img'), { scale: 1.3 }, { scale: 1, duration: 1, ease: 'power3.inOut' }, 0);
```

## V-01 / V-02 Velocity marquee and skew ✓

```css
.marquee .row { display: flex; width: max-content; }
.marquee .row span { padding-inline-end: 48px; } /* not `gap`: half the row must be exactly one period */
```
```js
scene(({ gsap, ScrollTrigger }) => {
  if (REDUCE) return;                                     // one copy: nothing loops, nothing is read twice
  const copies = [...row.children].map((n) => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c; });
  row.append(...copies);                                  // a second, identical copy that screen readers skip
  const loop = gsap.fromTo(row, { xPercent: 0 }, { xPercent: 50 * DIR, duration: 30, ease: 'none', repeat: -1 });
  const skew = gsap.quickTo(row, 'skewX', { duration: 0.5, ease: 'power3' });
  let on = false;
  ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: (s) => { on = s.isActive; on ? loop.play() : loop.pause(); } });
  const tick = () => { if (!on) return; const v = gsap.utils.clamp(-3000, 3000, engine.getVelocity());
    loop.timeScale(1 + Math.abs(v) / 900); skew(gsap.utils.clamp(-6, 6, v / 400)); };
  gsap.ticker.add(tick);
  return () => { gsap.ticker.remove(tick); copies.forEach((c) => c.remove()); };
});
```
Loops longer than 5 seconds need a pause control or must stop under reduced motion (WCAG 2.2.2).

## C-01 Follow preview ✓

```js
scene(({ gsap }) => {
  if (!FINE || REDUCE) return;                            // touch gets a sticky preview instead (moves.md)
  const xTo = gsap.quickTo(prev, 'x', { duration: 0.6, ease: 'power3' }), yTo = gsap.quickTo(prev, 'y', { duration: 0.6, ease: 'power3' });
  const rTo = gsap.quickTo(prev, 'rotation', { duration: 0.5, ease: 'power3' });
  let lx = null, vx = 0, shown = false;
  const onMove = (e) => { if (lx !== null) vx += (e.clientX - lx - vx) * 0.35; lx = e.clientX; xTo(e.clientX + 24); yTo(e.clientY - prev.offsetHeight / 2); };
  const tick = () => { if (!shown) return; vx *= 0.88; rTo(gsap.utils.clamp(-10, 10, vx * 0.5)); };
  const onEnter = () => { /* swap the preview content */
    if (!shown) { shown = true; gsap.fromTo(prev, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power4.out', overwrite: 'auto' }); } };
  const onLeave = () => { shown = false; lx = null; vx = 0; rTo(0); gsap.to(prev, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.35, ease: 'power3.in', overwrite: 'auto' }); };
  list.addEventListener('pointermove', onMove);
  list.addEventListener('pointerleave', onLeave);
  rows.forEach((a) => a.addEventListener('pointerenter', onEnter));
  gsap.ticker.add(tick);
  return () => {                                          // destroy(): no listener, no ticker, preview closed
    list.removeEventListener('pointermove', onMove); list.removeEventListener('pointerleave', onLeave);
    rows.forEach((a) => a.removeEventListener('pointerenter', onEnter)); gsap.ticker.remove(tick);
    gsap.killTweensOf(prev); gsap.set(prev, { clearProps: 'clipPath,transform' });
  };
});
```
The preview is `position: fixed; pointer-events: none`. Load video only after about 380 ms of dwell on a row.

## C-02 Contained magnetic action

Nati's rule: hover effects stay inside their own element. The pull is clamped so the label never leaves its button.

```js
if (FINE && !REDUCE) zone.addEventListener('pointermove', (e) => {
  const r = zone.getBoundingClientRect(), max = Math.min(r.width, r.height) * 0.12;
  label.style.setProperty('--x', `${gsap.utils.clamp(-max, max, (e.clientX - (r.left + r.width / 2)) * 0.3)}px`);
  label.style.setProperty('--y', `${gsap.utils.clamp(-max, max, (e.clientY - (r.top + r.height / 2)) * 0.3)}px`);
});
zone.addEventListener('pointerleave', () => { label.style.setProperty('--x', '0px'); label.style.setProperty('--y', '0px'); });
```
CSS: `.btn { overflow: clip; } .btn .label { translate: var(--x, 0) var(--y, 0); transition: translate .35s cubic-bezier(.23,1,.32,1); }`. One button per page.

## T-01 Theme layers ✓

`themeLayers(engine)` in the engine, called inside a scene (`engine.scene(() => { themeLayers(engine); })`) so `destroy()` removes its trigger. Markup: `<div class="theme-bg" aria-hidden="true"><i data-t="light"></i><i data-t="dark"></i></div>` plus `data-theme` on sections; CSS per theme on `body.t-<name>` (tokens) and `.theme-bg i.on { opacity: 1 }`. Check contrast in every theme.

Only the fixed `.theme-bg` layers crossfade (opacity). Text colour switches instantly at `flipDelay`. Never transition `color`, or an inherited custom property, on `html`, `body` or any fixed chrome (a header's `transition: color` counts): each frame of the transition re-styles every descendant that inherits it. Measured at 4× CPU on a page of 300 sections: about 340 ms of long tasks per flip with `transition: color .2s` on `body`, about 100 ms without; on a real build, 543 ms of long tasks at the two flip points dropped to 0.

## T-02 Footer reveal

```css
.site-footer { position: fixed; inset-inline: 0; bottom: 0; z-index: -1; }
main { position: relative; background: var(--ground); } /* the page covers the footer until the end */
```
```js
const fit = () => { document.body.style.paddingBottom = `${footer.offsetHeight}px`; engine.lenis?.resize(); engine.safeRefresh(); };
fit(); engine.onWidthResize(fit); engine.fontsReady.then(fit);
```
Padding on `body`, not margin on the page: a last child's margin collapses out of `body` and Lenis mis-measures the page, so the footer can never be reached.

## T-03 Lightbox from the card

```js
function open(card) {
  const r = card.getBoundingClientRect();
  engine.lock();                                           // Lenis stopped, or body overflow hidden
  gsap.set(frame, { left: r.left, top: r.top, width: r.width, height: r.height });
  gsap.timeline({ defaults: { ease: 'power3.inOut' } })
    .to(backdrop, { opacity: 1, duration: 0.5 }, 0)
    .to(frame, { ...fitToViewport(card), duration: 0.75 }, 0);
  closeButton.focus({ preventScroll: true });              // trap Tab between close and the media; Escape closes
}
function close() { /* animate back to the card's current rect, then unlock and return focus to the card */ }
```

## M-01 Play in view

`engine.playInView(video)`: the video gets its `src` from `data-src` when it should play, shows only after `playing` fires (the poster, equal to the first frame, sits underneath), and pauses offscreen. Muted and `playsinline` for iOS autoplay.

## D-01 Success burst

On a successful submit: 12-20 motif members (`<svg><use href="#motif-x"/></svg>`) start at the button, each with a random angle and speed (140-420 px), rise for 0.55 s with `power2.out`, fall 220-360 px with `power2.in`, rotate, fade after 1.1 s, and are removed. Skip it under reduced motion; the message itself says what happens next.

## N-01 CSS view reveal ✓

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal { animation: rise linear both; animation-timeline: view(); animation-range: entry 0% cover 30%; }
    @keyframes rise { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
  }
}
```
No JavaScript, runs off the main thread where supported (Chromium, Safari 26+; not Firefox stable as of October 2026). The final state is the default, so unsupported browsers simply show the content. Use it for decoration, never for content visibility.
