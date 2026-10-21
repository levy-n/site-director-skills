// curtain.ts (Next.js): the GSAP page curtain, the fallback for move T-07.
//
// Used only where the View Transition wipe cannot run: browsers without document.startViewTransition,
// or, site-wide, when the transition needs an SVG-filter edge that view-transition snapshots cannot
// take (then set <html data-page-transition="curtain"> in the layout and drop PageTransition).
// Never on the same navigation as the wipe: TransitionLink checks shouldUseCurtain() first.
//
// Flow: TransitionLink's onNavigate (Next 15.3+) prevents the navigation, cover() draws the curtain
// over the page (its edge enters at the right and travels left, 0.8 s), then router.push(href);
// <Curtain /> in the persistent layout calls reveal() when the pathname changes, and the edge keeps
// travelling left off the screen. A 5 s failsafe reveals the page anyway (a failed fetch, a push
// that never changes the pathname), so the site is never left covered.
//
// Strict reduced motion: no animation; cover() calls through at once and reveal() hides at once.
// The curtain runs on GSAP's own ticker (the same clock as the engine), no frame loop of its own.

import gsap from 'gsap';

const DURATION = 0.8; // the same 0.8 s as the View Transition wipe (Heron AI's page transition)
const FAILSAFE = 5; //   seconds before the page is revealed regardless (Heron's Barba timeout is 5 s)

let covered = false;
let failsafe: gsap.core.Tween | null = null;

const node = () => document.getElementById('mw-curtain');
const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'off';

/** True when page transitions should use the curtain instead of the View Transition wipe. */
export function shouldUseCurtain(): boolean {
  if (typeof document === 'undefined') return false;
  return !('startViewTransition' in document) || document.documentElement.dataset.pageTransition === 'curtain';
}

/** True while the curtain covers the page (tests and QA). */
export function isCovered(): boolean {
  return covered;
}

/** Draws the curtain over the page, then calls `then` (usually router.push). */
export function cover(then: () => void): void {
  const el = node();
  if (!el || reduced()) { then(); return; }
  covered = true;
  gsap.killTweensOf(el);
  gsap.fromTo(
    el,
    { clipPath: 'inset(0% 0% 0% 100%)', visibility: 'visible' }, // collapsed on the right edge
    { clipPath: 'inset(0% 0% 0% 0%)', duration: DURATION, ease: 'power4.inOut', onComplete: then },
  );
  if (failsafe) failsafe.kill();
  failsafe = gsap.delayedCall(FAILSAFE, reveal);
}

/** Lifts the curtain off the new page. Safe to call when nothing is covered. */
export function reveal(): void {
  const el = node();
  if (failsafe) { failsafe.kill(); failsafe = null; }
  if (!el || !covered) return;
  covered = false;
  const done = () => { gsap.set(el, { visibility: 'hidden', clipPath: 'inset(0% 0% 0% 100%)' }); };
  gsap.killTweensOf(el);
  if (reduced()) { done(); return; }
  // The edge keeps travelling right to left: the right inset grows until nothing is left.
  gsap.to(el, { clipPath: 'inset(0% 100% 0% 0%)', duration: DURATION, ease: 'power4.inOut', onComplete: done });
}
