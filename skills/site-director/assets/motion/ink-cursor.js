// ink-cursor.js: the canvas cursor accent (move C-07). A small square dot that follows the mouse
// with a short trail while it moves fast. It is an accent on top of the native cursor, never a
// replacement: the page never sets cursor: none, because OS cursors scale with the visitor's
// settings and custom ones do not.
//
// Allowed only when a dossier item makes the pointer a tool from the client's work (Nati's ruling);
// it then counts toward the 2-3 standout-moment budget.
//
// One clock: the dot joins the engine's shared gsap.ticker dispatcher (engine.onFrame) on
// pointermove and leaves it as soon as it has arrived (distance to target below 0.1 px, trail
// empty). An idle page runs no per-frame work for it. The canvas keeps its last frame, so the
// dot stays visible at rest.
//
// Off (no canvas work at all) under reduced motion, on touch-first devices (engine.FINE is false),
// under forced-colors: active, and while prerendering. On a hybrid laptop every event is checked
// for pointerType === 'mouse': touch or pen input hides the dot.
//
// Numbers: the 9 px dot, the 0.18 follow, the 0.2 speed smoothing and the 1.5 trail threshold are
// the values Bearplus published for Heron AI's cursor (Codrops case study, 12 Oct 2026). The code
// is our own; the follow goes through engine.damp so 60, 120 and 144 Hz screens feel the same.

/**
 * @typedef {object} InkCursorOptions
 * @property {HTMLCanvasElement} [canvas] Draw on this canvas (Astro: the one inside the
 *   transition:persist layer). It is never removed by the cursor. Without it, a canvas is created
 *   in `mount` and removed on cleanup.
 * @property {Element} [mount] Where a created canvas goes (default document.body).
 * @property {boolean} [hold] With `canvas`: cleanup leaves the last frame drawn and remembers the
 *   position, so the next init on the same canvas (the next page) continues without a gap.
 * @property {number} [size] Dot size in CSS px (default 9).
 * @property {number} [ease] Follow factor per 60 Hz frame (default 0.18).
 * @property {number} [speedEase] Smoothing of the speed signal, an EMA factor (default 0.2).
 * @property {number} [trailSpeed] Smoothed speed (px per 60 Hz frame) above which the trail draws (default 1.5).
 * @property {number} [trailMax] Trail length in points (default 12).
 * @property {string} [color] Dot colour (default: the canvas's computed CSS color, so CSS decides).
 * @property {string} [zIndex] Canvas z-index (default '9999': above sticky headers and modals; the
 *   canvas never takes pointer events, and the dot hides on Tab so it never sits on a focus ring).
 */

/** Positions remembered per persisted canvas between two inits (Astro navigations). */
const memory = new WeakMap();

/** @param {HTMLCanvasElement} canvas */
function wipe(canvas) {
  const ctx = canvas.getContext('2d');
  if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); }
}

/**
 * Canvas cursor accent on the engine's one clock.
 * @param {import('./motion-engine.js').MotionEngine} engine
 * @param {InkCursorOptions} [opts]
 * @returns {() => void} cleanup (idempotent; also registered with engine.addCleanup)
 */
export function initInkCursor(engine, opts = {}) {
  const {
    canvas: given = null, mount = document.body, hold = false,
    size = 9, ease = 0.18, speedEase = 0.2, trailSpeed = 1.5, trailMax = 12, zIndex = '9999',
  } = opts;
  const forced = window.matchMedia('(forced-colors: active)').matches;
  if (engine.REDUCE || !engine.FINE || forced || engine.PRERENDER) {
    // A persisted canvas may still hold the previous page's dot: clear it, the cursor is off now.
    if (given) { wipe(given); memory.delete(given); }
    return () => {};
  }

  const canvas = given || document.createElement('canvas');
  // A canvas made here gets the layer class too, so reduced-motion.css hides it at once when the
  // visitor turns on forced colours (high contrast) or reduced motion mid-session: forced-colors is
  // read only at init, and nothing rebuilds the engine when it changes.
  if (!given) canvas.classList.add('mw-cursor-layer');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex,
  });
  if (!given) mount.append(canvas);
  const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  const color = opts.color || getComputedStyle(canvas).color || '#000';

  const target = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };
  /** @type {{ x: number, y: number }[]} */
  const trail = [];
  let speed = 0;
  let visible = false;
  /** @type {null | (() => void)} */
  let off = null;
  /** @type {null | { x: number, y: number, w: number, h: number }} */
  let dirty = null;
  /** @type {null | (() => void)} */
  let unwatchDpr = null;

  /** @param {boolean} withTrail */
  const draw = (withTrail) => {
    // Clear only what the last frame drew: a full-screen clear every frame costs more than the dot.
    if (dirty) ctx.clearRect(dirty.x, dirty.y, dirty.w, dirty.h);
    dirty = null;
    if (!visible) return;
    let x0 = cur.x; let y0 = cur.y; let x1 = cur.x; let y1 = cur.y;
    ctx.fillStyle = color;
    if (withTrail) {
      trail.forEach((pt, i) => {
        // Trail points are 40-85% of the dot and at most 35% alpha, older ones smaller and fainter: our tuning;
        // the published Heron values cover the follow and the trail threshold, not the trail's look.
        const a = (i + 1) / trail.length;
        const s = size * (0.35 + 0.5 * a);
        ctx.globalAlpha = 0.35 * a;
        ctx.fillRect(pt.x - s / 2, pt.y - s / 2, s, s);
        x0 = Math.min(x0, pt.x); y0 = Math.min(y0, pt.y); x1 = Math.max(x1, pt.x); y1 = Math.max(y1, pt.y);
      });
      ctx.globalAlpha = 1;
    }
    ctx.fillRect(cur.x - size / 2, cur.y - size / 2, size, size);
    const pad = size + 2; // half the dot plus antialiasing, with margin
    dirty = { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
  };

  const resize = () => {
    // Backing store capped at DPR 2: a 3x phone-class screen would triple the pixels for a 9 px dot.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dirty = null;
    draw(false); // resizing clears the canvas; put the dot back
    // A window dragged to a screen with another DPR fires no resize: watch this DPR value (MDN pattern).
    if (unwatchDpr) unwatchDpr();
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    mq.addEventListener('change', resize, { once: true });
    unwatchDpr = () => mq.removeEventListener('change', resize);
  };

  const leave = () => { if (off) { off(); off = null; } };
  /** @param {number} _time */
  const job = (_time) => {
    const ratio = Math.max(engine.gsap.ticker.deltaRatio(60), 0.0001);
    const k = engine.damp(ease);
    const px = cur.x;
    const py = cur.y;
    cur.x += (target.x - cur.x) * k;
    cur.y += (target.y - cur.y) * k;
    const moved = Math.hypot(cur.x - px, cur.y - py);
    speed += (moved / ratio - speed) * speedEase; // px per 60 Hz frame, so the threshold holds at 120 Hz
    if (moved > 0.05) { trail.push({ x: cur.x, y: cur.y }); if (trail.length > trailMax) trail.shift(); }
    else if (trail.length) trail.shift();
    draw(speed > trailSpeed);
    // Settled by distance to target, never by this frame's movement: the first tick after a wake can
    // move almost nothing and would put the dot to sleep at once.
    if (Math.hypot(target.x - cur.x, target.y - cur.y) < 0.1 && !trail.length) { cur.x = target.x; cur.y = target.y; draw(false); leave(); }
  };
  const wake = () => { if (!off) off = engine.onFrame(job); };
  const hide = () => {
    visible = false;
    trail.length = 0;
    speed = 0;
    draw(false);
    leave();
  };

  /** @param {PointerEvent} e */
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') { hide(); return; } // touch or pen on a hybrid device
    target.x = e.clientX;
    target.y = e.clientY;
    // The first move snaps, so the dot never flies in from a corner.
    if (!visible) { visible = true; cur.x = target.x; cur.y = target.y; }
    wake();
  };
  /** @param {PointerEvent} e */
  const onDown = (e) => { if (e.pointerType !== 'mouse') hide(); };
  /** @param {PointerEvent} e */
  const onOut = (e) => { if (!e.relatedTarget) hide(); }; // the pointer left the window
  /** @param {KeyboardEvent} e */
  const onKey = (e) => { if (e.key === 'Tab') hide(); }; // keyboard navigation: no stale dot near focus

  resize();
  const remembered = given && memory.get(given);
  if (remembered) {
    // The previous page's cursor left its position here (opts.hold): continue from it, no gap.
    memory.delete(given);
    visible = true;
    target.x = cur.x = remembered.x;
    target.y = cur.y = remembered.y;
    draw(false);
  }
  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerdown', onDown, { passive: true });
  document.addEventListener('pointerout', onOut);
  window.addEventListener('keydown', onKey);
  window.addEventListener('blur', hide);
  const offResize = engine.onViewportResize(resize);

  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    leave();
    offResize();
    if (unwatchDpr) unwatchDpr();
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerdown', onDown);
    document.removeEventListener('pointerout', onOut);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('blur', hide);
    if (!given) { canvas.remove(); return; }
    if (hold && visible) memory.set(given, { x: cur.x, y: cur.y }); // the last frame stays drawn
    else wipe(given);
  };
  engine.addCleanup(cleanup);
  return cleanup;
}
