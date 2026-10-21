// keyboard-inertia.js: keyboard and focus input always beat smooth-scroll inertia.
//
// Lenis ignores native scroll events while its own smooth animation runs (Lenis issue #107; in
// 1.3.26 onNativeScroll returns early while isScrolling === 'smooth'), so a PageDown, a Space, a
// find-in-page jump or a focus move during a wheel glide can be pulled back to where the glide was
// going. This cancels the glide at once on navigation keys, Tab and focusin, by jumping Lenis to the
// current native position (verified in Chromium to stop the animation and keep the position).
// The engine's stopInertiaOnNavigate covers internal link clicks only, so the boot assets
// (astro/motion-boot.js, next/SmoothScroll.tsx) call this right after creating the engine.

// The keys that scroll the page natively, plus Tab (focus moves and scrolls the target into view).
const KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Tab']);

/**
 * Cancels Lenis inertia on navigation keys, Tab and focus changes. No-op without Lenis
 * (reduced motion, smooth: false, prerender).
 * @param {import('./motion-engine.js').MotionEngine} engine
 * @returns {() => void} cleanup (idempotent; also registered with engine.addCleanup)
 */
export function guardKeyboardInertia(engine) {
  const lenis = engine.lenis;
  if (!lenis) return () => {};
  const cancel = () => {
    if (lenis.isScrolling === 'smooth') lenis.scrollTo(window.scrollY, { immediate: true, force: true });
  };
  /** @param {KeyboardEvent} e */
  const onKey = (e) => { if (KEYS.has(e.key)) cancel(); };
  // Capture phase: runs before any handler that might stop propagation.
  window.addEventListener('keydown', onKey, { capture: true });
  document.addEventListener('focusin', cancel);
  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    window.removeEventListener('keydown', onKey, { capture: true });
    document.removeEventListener('focusin', cancel);
  };
  engine.addCleanup(cleanup);
  return cleanup;
}
