// ink-lens.js: the footer ink lens (move C-08). A circular SVG-internal mask follows the mouse over
// the footer mark and reveals an inked layer under it; a faster, slightly larger pulse circle at low
// opacity trails it. The static layer is always visible, so nothing exists only on hover.
//
// Markup (the inked layer starts hidden, so no-JS, touch and reduced motion show the static mark):
//
//   <footer class="site-footer">
//     <svg class="lens" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet"
//          aria-hidden="true" focusable="false">
//       <g data-lens-base> ...outline mark... </g>
//       <g data-lens-ink visibility="hidden"> ...inked mark... </g>
//     </svg>
//     ...footer content...
//   </footer>
//
// One clock: the follow runs as a job on the engine's shared gsap.ticker dispatcher (engine.onFrame)
// from pointerenter until both circles have arrived and the radius tween has ended; then it leaves.
// The pointer is mapped into the SVG with getScreenCTM() on every tick: Lenis moves the footer under
// a pointer that stands still, so a mapping cached at pointermove would drift.
//
// Strict reduced motion: off, with no follow at all (Heron's lens only zeroed its durations and kept
// following). Also off on touch-first devices and while prerendering.
//
// Numbers: follow 0.09, pulse follow 0.15, pulse radius x1.05 at opacity 0.2, grow 0.55 s, shrink
// 0.8 s (pulse 1 s) are the values Bearplus published for Heron AI's footer (Codrops case study,
// 12 Oct 2026). The code is our own.

const SVG_NS = 'http://www.w3.org/2000/svg';
let uid = 0;

/**
 * @typedef {object} InkLensOptions
 * @property {Element} [area] The element that receives the pointer (default: the closest footer, else svgEl).
 * @property {SVGGraphicsElement} [ink] The inked layer (default svgEl's [data-lens-ink]).
 * @property {number} [radius] Lens radius in viewBox units (default 120).
 * @property {number} [follow] Follow factor per 60 Hz frame (default 0.09).
 * @property {number} [pulseFollow] Pulse follow factor (default 0.15).
 * @property {number} [pulseScale] Pulse radius relative to the lens (default 1.05).
 * @property {number} [pulseOpacity] Pulse opacity (default 0.2).
 * @property {number} [grow] Seconds to open (default 0.55).
 * @property {number} [shrink] Seconds to close (default 0.8).
 * @property {number} [pulseShrink] Seconds for the pulse to close (default 1).
 */

/** @param {string} tag @param {Record<string, string | number>} attrs @param {Element} [parent] */
function make(tag, attrs, parent) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (parent) parent.append(node);
  return node;
}

/**
 * Footer ink lens on the engine's one clock.
 * @param {import('./motion-engine.js').MotionEngine} engine
 * @param {SVGSVGElement} svgEl
 * @param {InkLensOptions} [opts]
 * @returns {() => void} cleanup (idempotent; also registered with engine.addCleanup)
 */
export function initInkLens(engine, svgEl, opts = {}) {
  const noop = () => {};
  if (engine.REDUCE || !engine.FINE || engine.PRERENDER) return noop;
  const ink = opts.ink || svgEl.querySelector('[data-lens-ink]');
  const vb = svgEl.viewBox && svgEl.viewBox.baseVal;
  if (!ink) throw new Error('initInkLens: no [data-lens-ink] layer inside the svg');
  if (!vb || !vb.width || !vb.height) throw new Error('initInkLens: the svg needs a viewBox');
  const {
    radius = 120, follow = 0.09, pulseFollow = 0.15, pulseScale = 1.05, pulseOpacity = 0.2,
    grow = 0.55, shrink = 0.8, pulseShrink = 1,
  } = opts;
  const area = opts.area || svgEl.closest('footer') || svgEl;
  const { gsap } = engine;

  svgEl.querySelectorAll('[data-lens-defs]').forEach((n) => n.remove()); // a second init starts clean
  // Fresh ids per instance (see ink-mask.js): url(#id) resolves to the first match in the document.
  const id = `mw-lens-${++uid}-${Math.random().toString(36).slice(2, 7)}`;
  const defs = make('defs', { 'data-lens-defs': '' });
  svgEl.prepend(defs);
  const reach = radius * pulseScale; // the mask region covers the viewBox plus one lens on each side
  const mask = make('mask', {
    id, maskUnits: 'userSpaceOnUse',
    x: vb.x - reach, y: vb.y - reach, width: vb.width + 2 * reach, height: vb.height + 2 * reach,
  }, defs);
  const mid = { x: vb.x + vb.width / 2, y: vb.y + vb.height / 2 };
  const pulse = make('circle', { cx: mid.x, cy: mid.y, r: 0, fill: '#fff', opacity: 0 }, mask);
  const main = make('circle', { cx: mid.x, cy: mid.y, r: 0, fill: '#fff' }, mask);
  const prevMask = ink.getAttribute('mask');
  const prevVis = ink.getAttribute('visibility');
  ink.setAttribute('mask', `url(#${id})`);
  ink.setAttribute('visibility', 'visible'); // masked to a zero radius: still nothing shows at rest

  const client = { x: 0, y: 0 };
  const target = { ...mid };
  const cur = { ...mid };
  const pcur = { ...mid };
  let inside = false;
  /** @type {null | (() => void)} */
  let off = null;

  // Client px to viewBox units, honouring preserveAspectRatio and any CSS transform on the way.
  const toLocal = () => {
    const m = svgEl.getScreenCTM();
    if (!m) return;
    const p = new DOMPoint(client.x, client.y).matrixTransform(m.inverse());
    target.x = p.x;
    target.y = p.y;
  };
  /** @param {{ x: number, y: number }} pt @param {number} k */
  const step = (pt, k) => {
    const f = engine.damp(k);
    pt.x += (target.x - pt.x) * f;
    pt.y += (target.y - pt.y) * f;
  };
  /** @param {{ x: number, y: number }} pt */
  const near = (pt) => Math.hypot(target.x - pt.x, target.y - pt.y) < 0.1;
  const leave = () => { if (off) { off(); off = null; } };
  const job = () => {
    if (inside) toLocal();
    step(cur, follow);
    step(pcur, pulseFollow);
    main.setAttribute('cx', cur.x.toFixed(2));
    main.setAttribute('cy', cur.y.toFixed(2));
    pulse.setAttribute('cx', pcur.x.toFixed(2));
    pulse.setAttribute('cy', pcur.y.toFixed(2));
    // Settled: both circles arrived and the radius tween is over (it runs on the same ticker).
    if (near(cur) && near(pcur) && !gsap.isTweening(main) && !gsap.isTweening(pulse)) leave();
  };
  const wake = () => { if (!off) off = engine.onFrame(job); };

  /** @param {number} r @param {number} dur @param {number} pulseDur */
  const setRadius = (r, dur, pulseDur) => {
    gsap.to(main, { attr: { r }, duration: dur, ease: 'power2.out', overwrite: true });
    gsap.to(pulse, { attr: { r: r * pulseScale, opacity: r ? pulseOpacity : 0 }, duration: pulseDur, ease: 'power2.out', overwrite: true });
  };

  /** @param {PointerEvent} e */
  const onEnter = (e) => {
    if (e.pointerType !== 'mouse') return;
    inside = true;
    client.x = e.clientX;
    client.y = e.clientY;
    toLocal();
    // Open under the pointer, never sliding in from where the lens last closed.
    cur.x = pcur.x = target.x;
    cur.y = pcur.y = target.y;
    setRadius(radius, grow, grow);
    wake();
  };
  /** @param {PointerEvent} e */
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!inside) { onEnter(e); return; } // entered while a touch hid it, or a missed pointerenter
    client.x = e.clientX;
    client.y = e.clientY;
    wake();
  };
  const onLeave = () => {
    if (!inside) return;
    inside = false;
    setRadius(0, shrink, pulseShrink);
    wake();
  };
  const onScroll = () => { if (inside) wake(); }; // the footer moves under a still pointer

  area.addEventListener('pointerenter', /** @type {EventListener} */ (onEnter));
  area.addEventListener('pointermove', /** @type {EventListener} */ (onMove), { passive: true });
  area.addEventListener('pointerleave', onLeave);
  window.addEventListener('scroll', onScroll, { passive: true });

  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    leave();
    gsap.killTweensOf([main, pulse]);
    area.removeEventListener('pointerenter', /** @type {EventListener} */ (onEnter));
    area.removeEventListener('pointermove', /** @type {EventListener} */ (onMove));
    area.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('scroll', onScroll);
    defs.remove();
    if (prevMask === null) ink.removeAttribute('mask'); else ink.setAttribute('mask', prevMask);
    if (prevVis === null) ink.removeAttribute('visibility'); else ink.setAttribute('visibility', prevVis);
  };
  engine.addCleanup(cleanup);
  return cleanup;
}
