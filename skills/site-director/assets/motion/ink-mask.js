// ink-mask.js: the ink transition (move T-06). A scroll-scrubbed reveal from a sketch to the finished
// image through an SVG-internal mask, with a rough "wet ink" leading edge.
//
// Built on pattern-breaker's motion engine: it receives the engine, uses engine.gsap and
// engine.ScrollTrigger, returns a cleanup and also registers it with engine.addCleanup, so one
// engine.destroy() (route change, reduced-motion flip, the stop switch) removes everything.
//
// Markup. Without JavaScript the finished image is visible: the mask is only added here, at init.
//
//   <figure class="ink" data-ink>
//     <img class="ink__sketch" src="/img/plan-1600.webp" width="1600" height="1000" alt="..." />
//     <svg class="ink__svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"
//          aria-hidden="true" focusable="false">
//       <image data-ink-final href="/img/built-1600.webp" width="1600" height="1000"
//              preserveAspectRatio="xMidYMid slice" />
//     </svg>
//   </figure>
//
//   .ink { display: grid; margin: 0; overflow: hidden; aspect-ratio: 16 / 10; }
//   .ink > * { grid-area: 1 / 1; width: 100%; height: 100%; }
//   .ink__sketch { object-fit: cover; object-position: 50% 50%; } /* matches xMidYMid slice */
//
// The viewBox aspect equals the image aspect. The sketch may also be an SVG <image data-ink-sketch>
// placed before the final image inside the same SVG.
//
// Why SVG-internal: Safari cannot reference an SVG <mask> from CSS mask-image on an HTML element
// (WebKit bug 139092, reopened), while a mask attribute on an SVG <image> inside the same inline SVG
// works in every engine. Never use this over a <video>: Safari applies no SVG url() mask or filter
// to video (WebKit bug 184601); put it on the poster frame instead.
//
// Tiers (chosen once at init, written to svgEl.dataset.inkTier for QA):
//   live     fine pointer: a band around the moving edge goes through the noise filter.
//   baked    touch, opts.live === false, or Safari with opts.safari === 'baked': a pre-roughened
//            edge computed once that only translates. No filter exists at runtime.
//   reduced  engine.REDUCE: an instant swap with hysteresis. No tween, no wipe, no crossfade.
//
// Cost rules (why the code looks like this): only the mask geometry animates (rect and path
// attributes through setAttribute; never the CSS d property, which Safari lacks, and never a filter
// attribute, which would recompute the noise every frame). The filter covers a band around the edge,
// not the image, and the band is hidden at p = 0 and p = 1, so nothing is filtered at rest.
// Measured in Chromium (software raster, relative numbers): no filter 21.7 ms; full-shape filter with
// 4 octaves +146 ms; band with 4 octaves +101 ms; band with 2 octaves +76 ms; baked edge +9 ms.
// Keep at most one live ink transition in the viewport.
//
// Filter values: fractal noise at baseFrequency "0.045 0.055" with seed 5, a displacement map at
// scale 100, a 1.8 blur and an alpha step (slope 2.2, intercept -0.6) are the values Bearplus
// published for Heron AI (Codrops case study, 12 Oct 2026). Heron uses 4 octaves; we default to 3.
// The code below is our own.

const SVG_NS = 'http://www.w3.org/2000/svg';
let uid = 0;

/**
 * @typedef {'rtl' | 'ltr' | 'down' | 'center'} InkDirection
 *
 * @typedef {object} InkMaskOptions
 * @property {InkDirection} [direction] Where the reveal starts. Default 'rtl' on a right-to-left page
 *   (the reveal travels right to left, the Hebrew reading direction), 'ltr' otherwise.
 * @property {boolean} [live] false forces the baked tier everywhere.
 * @property {'live' | 'baked'} [safari] 'baked' gives Safari the baked tier (do it when a real
 *   iPhone or Safari profile drops frames; WebKit bug 287982: large feTurbulence areas slow scrolling).
 * @property {number} [scale] Displacement scale in viewBox units (default 100). Edge geometry scales with it.
 * @property {number} [octaves] Noise octaves (default 3; more is rougher and slower).
 * @property {string} [baseFrequency] Noise frequency per viewBox unit (default '0.045 0.055', tuned
 *   for a viewBox about 1000-1600 units wide).
 * @property {number} [seed] Noise seed (default 5).
 * @property {number} [blur] Blur of the displaced edge in viewBox units (default 1.8).
 * @property {Element} [trigger] The scroll trigger element (default: the closest [data-ink] or figure).
 * @property {string} [start] ScrollTrigger start (default 'top 75%').
 * @property {string} [end] ScrollTrigger end (default 'bottom 35%').
 * @property {boolean | number} [scrub] ScrollTrigger scrub (default true: Lenis already smooths the input).
 * @property {string} [id] ScrollTrigger id, so ?at=<id>:0.5 lands mid-reveal (engine QA hook).
 * @property {SVGElement} [target] The finished image (default svgEl's [data-ink-final]).
 * @property {string} [reducedStart] Reduced tier: the finished image hides again once the trigger's top
 *   falls back below this line (default 'top 65%').
 * @property {string} [reducedEnd] Reduced tier: the finished image shows once the trigger's top rises
 *   past this line (default 'top 35%').
 */

/** @param {string} tag @param {Record<string, string | number>} attrs @param {Element} [parent] */
function make(tag, attrs, parent) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (parent) parent.append(node);
  return node;
}

/** @param {Element} node @param {Record<string, number>} attrs */
function setAttrs(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v.toFixed(2));
}

function isSafari() {
  const ua = navigator.userAgent;
  return /safari/i.test(ua) && !/chrome|chromium|crios|fxios|edg|android/i.test(ua);
}

// Deterministic roughness for the baked edge (no randomness: every load and every screenshot is the
// same). Three sines at unrelated frequencies read as an irregular ink line; result in -1..1.
/** @param {number} t @param {number} seed */
function rough(t, seed) {
  return Math.sin(t * 0.019 + seed) * 0.5 + Math.sin(t * 0.061 + seed * 2.3) * 0.32 + Math.sin(t * 0.137 + seed * 4.1) * 0.18;
}

// SVG <image> has no srcset or lazy loading. With data-ink-srcset="a.webp 800w, b.webp 1600w" on an
// image, pick the smallest file at least as wide as the rendered width x min(DPR, 2), once at init.
/** @param {SVGSVGElement} svgEl */
function pickSources(svgEl) {
  const need = svgEl.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 2);
  svgEl.querySelectorAll('image[data-ink-srcset]').forEach((img) => {
    const list = String(img.getAttribute('data-ink-srcset'))
      .split(',')
      .map((s) => s.trim().split(/\s+/))
      .map(([href, w]) => ({ href, w: parseInt(w, 10) }))
      .filter((s) => s.href && s.w > 0)
      .sort((a, b) => a.w - b.w);
    const pick = list.find((s) => s.w >= need) || list[list.length - 1];
    if (pick && pick.href !== img.getAttribute('href')) img.setAttribute('href', pick.href);
  });
}

/**
 * Axis helpers. The geometry is written once in "advance" units (a: distance travelled from the
 * side where the reveal starts) and "cross" units (c: along the edge), then mapped to viewBox x/y.
 * dir="rtl" does not mirror SVG coordinates (x always grows to the right), so rtl is explicit here.
 * @param {InkDirection} direction @param {DOMRect | SVGRect} vb
 */
function axisFor(direction, vb) {
  const { x: X, y: Y, width: W, height: H } = vb;
  if (direction === 'down') return { L: H, C: W, pt: (/** @type {number} */ a, /** @type {number} */ c) => [X + c, Y + a] };
  if (direction === 'ltr') return { L: W, C: H, pt: (/** @type {number} */ a, /** @type {number} */ c) => [X + a, Y + c] };
  return { L: W, C: H, pt: (/** @type {number} */ a, /** @type {number} */ c) => [X + W - a, Y + c] };
}

/**
 * Scroll-scrubbed ink transition from a sketch to the finished image.
 * @param {import('./motion-engine.js').MotionEngine} engine
 * @param {SVGSVGElement} svgEl the inline SVG that holds the finished image
 * @param {InkMaskOptions} [opts]
 * @returns {() => void} cleanup (idempotent; also registered with engine.addCleanup)
 */
export function initInkMask(engine, svgEl, opts = {}) {
  const noop = () => {};
  // A prerender snapshot keeps every attribute written here and would ship the sketch to visitors
  // who allow motion. The plain markup (finished image) is the right snapshot.
  if (engine.PRERENDER) return noop;

  const { gsap, ScrollTrigger } = engine;
  const target = opts.target || svgEl.querySelector('[data-ink-final]');
  const vb = svgEl.viewBox && svgEl.viewBox.baseVal;
  if (!target) throw new Error('initInkMask: no [data-ink-final] image inside the svg');
  if (!vb || !vb.width || !vb.height) throw new Error('initInkMask: the svg needs a viewBox');

  const direction = opts.direction || (engine.RTL ? 'rtl' : 'ltr');
  const tier = engine.REDUCE ? 'reduced'
    : opts.live === false || !engine.FINE || (opts.safari === 'baked' && isSafari()) ? 'baked'
      : 'live';
  const scale = opts.scale ?? 100;
  // Edge geometry, all in viewBox units and tied to the displacement scale:
  const BAND = 1.6 * scale; // filtered strip behind the edge (160 at scale 100, the research build)
  const OVER = 0.7 * scale; // solid part overlaps the strip by more than the largest displacement
  //                           (scale / 2), so the strip's own rough trailing edge stays hidden
  const PAD = scale; //         bleed past the viewBox on the cross axis: displaced side edges never show
  const AMP = 0.22 * scale; //  baked edge roughness, about what the live filter produces at scale 100

  pickSources(svgEl);
  svgEl.querySelectorAll('[data-ink-defs]').forEach((n) => n.remove()); // a second init starts clean

  // Fresh ids per instance: two copies of this markup in one document (a component used twice, two
  // pages side by side during a transition) would otherwise resolve url(#id) to the first match.
  const id = `mw-ink-${++uid}-${Math.random().toString(36).slice(2, 7)}`;
  const defs = make('defs', { 'data-ink-defs': '' });
  svgEl.prepend(defs);
  const full = { x: vb.x - PAD, y: vb.y - PAD, width: vb.width + 2 * PAD, height: vb.height + 2 * PAD };
  const empty = { x: vb.x, y: vb.y, width: 0, height: 0 };
  const mask = make('mask', { id: `${id}-m`, maskUnits: 'userSpaceOnUse', ...full }, defs);
  const solid = make('rect', { fill: '#fff', ...empty }, mask);
  const centre = direction === 'center';
  const band = make(centre && tier === 'live' ? 'circle' : 'path', { fill: '#fff', display: 'none' }, mask);

  if (tier === 'live') {
    // The filter region follows the band's bounding box. Along the travel axis it reaches 50% past
    // the band on each side (more than scale / 2 for any band at least 100 units thick); centre
    // mode uses 30% because the whole disc is the band.
    const region = centre ? { x: '-30%', y: '-30%', width: '160%', height: '160%' }
      : direction === 'down' ? { x: '-10%', y: '-50%', width: '120%', height: '200%' }
        : { x: '-50%', y: '-10%', width: '200%', height: '120%' };
    const filter = make('filter', { id: `${id}-f`, 'color-interpolation-filters': 'sRGB', ...region }, defs);
    // pattern-breaker's slop-scan flags the next line (second-order signal grain-overlay). In the
    // project copy, replace this comment with the waiver from README.md ("slop-scan" in the
    // testing section), naming the ink transition's decision row.
    make('feTurbulence', { type: 'fractalNoise', baseFrequency: opts.baseFrequency || '0.045 0.055', numOctaves: opts.octaves ?? 3, seed: opts.seed ?? 5, result: 'noise' }, filter);
    // The same for the next line (signal liquid-glass).
    make('feDisplacementMap', { in: 'SourceGraphic', in2: 'noise', scale, xChannelSelector: 'R', yChannelSelector: 'G', result: 'moved' }, filter);
    make('feGaussianBlur', { in: 'moved', stdDeviation: opts.blur ?? 1.8, result: 'soft' }, filter);
    const step = make('feComponentTransfer', { in: 'soft' }, filter);
    make('feFuncA', { type: 'linear', slope: 2.2, intercept: -0.6 }, step); // alpha step: a crisp ink line
    band.setAttribute('filter', `url(#${id}-f)`);
  }

  const prevMask = target.getAttribute('mask');
  target.setAttribute('mask', `url(#${id}-m)`);
  svgEl.dataset.inkTier = tier;

  const ax = axisFor(direction, vb);
  const cx = vb.x + vb.width / 2;
  const cy = vb.y + vb.height / 2;
  const c0 = -PAD;
  const c1 = ax.C + PAD;
  const cm = ax.C / 2;
  /** @param {number} a @param {number} c */
  const P = (a, c) => ax.pt(a, c).map((n) => n.toFixed(1)).join(' ');
  /** @param {number} a0 @param {number} a1 */
  const rectFor = (a0, a1) => {
    if (a1 <= a0) return empty;
    const [xa, ya] = ax.pt(a0, c0);
    const [xb, yb] = ax.pt(a1, c1);
    return { x: Math.min(xa, xb), y: Math.min(ya, yb), width: Math.abs(xb - xa), height: Math.abs(yb - ya) };
  };

  // Live linear edge: a strip from (A - BAND) to A whose leading side is a quadratic curve bulging
  // forward. The bulge deepens from 12% to 25% of the edge length as it travels (our tuning; Heron
  // animates its path from a shallow curve to a deeper one), capped at 30% of the travel: a wide
  // image revealed downward would otherwise finish long before its scroll range ends (measured on
  // 16:10 'down': fully revealed at p = 0.9 without the cap). A runs from "apex hidden before the
  // start" to "both corners past the far side", so p = 0 shows nothing and p = 1 shows everything.
  const bulge = (/** @type {number} */ p) => Math.min(ax.C * (0.12 + 0.13 * p), ax.L * 0.3);
  const A0 = -(bulge(0) + scale / 2 + 2);
  const A1 = ax.L + scale / 2 + 2;
  // Centre: the band is a disc whose radius grows past the far corners. The filter then covers the
  // whole disc, so its cost grows with the radius: prefer a linear direction for large images.
  const R1 = Math.hypot(vb.width, vb.height) / 2 + scale / 2 + 2;

  // Baked edge: computed once, then only translated (linear) or scaled (centre).
  let bakedTravel = { from: 0, to: 0 };
  if (tier === 'baked') {
    if (centre) {
      const n = 120; // points around the circle; enough that the polygon never reads as faceted
      const pts = [];
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2;
        const r = 1 + 0.05 * rough(i * 9, opts.seed ?? 5); // 5% radial roughness
        pts.push(`${(Math.cos(t) * r).toFixed(4)} ${(Math.sin(t) * r).toFixed(4)}`);
      }
      band.setAttribute('d', `M ${pts.join(' L ')} Z`);
      bakedTravel = { from: 0, to: R1 / 0.95 }; // 0.95: the innermost point of the rough circle
    } else {
      const seed = opts.seed ?? 5;
      const bow = Math.min(ax.C * 0.18, ax.L * 0.3); // fixed bulge: the middle of the live range, same cap
      const edge = (/** @type {number} */ c) => {
        const u = (c - cm) / (ax.C / 2);
        return bow * Math.max(0, 1 - u * u) + rough(c, seed) * AMP;
      };
      const back = ax.L + 2 * PAD + AMP; // the shape reaches back far enough to cover everything revealed
      const parts = [`M ${P(-back, c1)}`];
      for (let c = c1; c >= c0; c -= 8) parts.push(`L ${P(edge(c), c)}`); // 8 units: smooth at any size
      parts.push(`L ${P(edge(c0), c0)} L ${P(-back, c0)} Z`);
      band.setAttribute('d', parts.join(' '));
      bakedTravel = { from: -(bow + AMP + 2), to: ax.L + AMP + 2 };
    }
  }

  let last = -1;
  /** @param {number} p 0..1 */
  const render = (p) => {
    if (p === last) return;
    last = p;
    if (p <= 0 || p >= 1) { // at rest: nothing filtered, nothing moving
      band.setAttribute('display', 'none');
      setAttrs(solid, p >= 1 ? full : empty);
      return;
    }
    band.removeAttribute('display');
    if (tier === 'baked') {
      setAttrs(solid, empty);
      const t = bakedTravel.from + (bakedTravel.to - bakedTravel.from) * p;
      let tr;
      if (centre) tr = `translate(${cx} ${cy}) scale(${t.toFixed(2)})`;
      else if (direction === 'down') tr = `translate(0 ${t.toFixed(2)})`;
      else tr = `translate(${(direction === 'rtl' ? -t : t).toFixed(2)} 0)`;
      band.setAttribute('transform', tr);
      return;
    }
    if (centre) {
      setAttrs(solid, empty);
      setAttrs(band, { cx, cy, r: R1 * p });
      return;
    }
    const A = A0 + (A1 - A0) * p;
    setAttrs(solid, rectFor(-PAD, A - BAND + OVER));
    const b = bulge(p);
    band.setAttribute('d', `M ${P(A - BAND, c0)} L ${P(A - BAND, c1)} L ${P(A, c1)} Q ${P(A + 2 * b, cm)} ${P(A, c0)} Z`);
  };

  const trigger = opts.trigger || svgEl.closest('[data-ink]') || svgEl.closest('figure') || svgEl;
  /** @type {ScrollTrigger | null} */
  let st = null;
  /** @type {gsap.core.Tween | null} */
  let tween = null;

  if (tier === 'reduced') {
    // Strict reduced motion: the state changes, nothing moves. Hysteresis: scrolling down, the
    // finished image appears once the trigger's top passes the 35% line; it goes back to the sketch
    // only once that top falls below the 65% line. A visitor parked on one line never sees it flicker
    // (WCAG 2.3.1), and there is no crossfade and no wipe.
    render(0);
    st = ScrollTrigger.create({
      trigger,
      start: opts.reducedStart || 'top 65%',
      end: opts.reducedEnd || 'top 35%',
      id: opts.id,
      onLeave: () => render(1),
      onLeaveBack: () => render(0),
      onRefresh: (self) => { if (self.progress >= 1) render(1); else if (self.progress <= 0) render(0); },
    });
    if (st.progress >= 1) render(1);
  } else {
    render(0);
    const state = { p: 0 };
    tween = gsap.to(state, {
      p: 1,
      ease: 'none',
      onUpdate: () => render(state.p),
      scrollTrigger: {
        trigger,
        start: opts.start || 'top 75%',
        end: opts.end || 'bottom 35%',
        scrub: opts.scrub ?? true,
        id: opts.id,
      },
    });
    st = tween.scrollTrigger || null;
  }

  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    if (st) st.kill();
    if (tween) tween.kill();
    defs.remove();
    // Back to the no-JS state: the finished image, unmasked.
    if (prevMask === null) target.removeAttribute('mask');
    else target.setAttribute('mask', prevMask);
    delete svgEl.dataset.inkTier;
  };
  engine.addCleanup(cleanup);
  return cleanup;
}
