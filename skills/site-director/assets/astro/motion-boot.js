// motion-boot.js (Astro): the motion lifecycle for a site with <ClientRouter />, on pattern-breaker's
// motion engine. Copy it next to motion-engine.js, ink-cursor.js and keyboard-inertia.js
// (one folder, src/motion/); README.md in assets/motion has the layout.
//
// Two lifetimes:
// - App lifetime (this module runs once per full load: Astro bundles module scripts and does not
//   re-run them on navigation): the defineMotion registry, the event listeners below, and the
//   cursor canvas, which lives in a transition:persist layer so the same node survives navigation.
// - Page lifetime: the engine (Lenis, ScrollTriggers, every section's effects, the cursor's
//   listeners) is created on astro:page-load and destroyed on astro:before-swap. Lenis must be
//   recreated per page: ClientRouter's root-attribute swap removes every attribute of <html>,
//   class included, and Lenis re-applies its classes only when its own state changes.
//
// Timing:
// - astro:before-swap runs inside startViewTransition's update callback, after the old page was
//   captured, so tearing down pins and inline styles there is never seen.
// - On the first load astro:page-load waits for window load (every image). The first-load entrance
//   is therefore CSS (data-intro in page-transition.css); the engine's scroll work joins after.
// - After a navigation, intros wait for the wipe: start them from page.ready, which resolves when
//   event.viewTransition.finished does (and never resolves for a page that was already left).
// - The OS reduced-motion setting can change while the page is open: the engine reports it with the
//   window event 'motion:preference' and this module rebuilds the page lifetime.
//
// Event names are strings ('astro:page-load', ...). Never import the TRANSITION_* constants or the
// isTransition* helpers: Astro 7 no longer exports them; the strings work on Astro 5, 6 and 7.
//
// Section scripts register, they do not animate:
//
//   <section data-motion-scene="ink" ...>...</section>
//   <script>
//     import { defineMotion } from '../motion/motion-boot.js';
//     import { initInkMask } from '../motion/ink-mask.js';
//     defineMotion('ink', (engine, el) => initInkMask(engine, el.querySelector('svg')));
//   </script>
//
// Anything created outside an init (an inline script, a setInterval, a stray ScrollTrigger) leaks
// across navigations.

import { createMotionEngine } from './motion-engine.js';
import { initInkCursor } from './ink-cursor.js';
import { guardKeyboardInertia } from './keyboard-inertia.js';

/**
 * @typedef {'load' | 'navigation' | 'rebuild'} PageReason
 *   load: the first page of a visit; navigation: a ClientRouter navigation; rebuild: the same page
 *   rebuilt (OS reduced-motion change, the stop switch).
 *
 * @typedef {object} PageInfo
 * @property {PageReason} reason
 * @property {Promise<void>} ready resolves once the page transition has finished (at once for 'load'
 *   and 'rebuild'); stays pending forever if this page lifetime ends first, so a late intro never runs.
 *
 * @typedef {(engine: import('./motion-engine.js').MotionEngine, el: HTMLElement, page: PageInfo) => void | (() => void)} MotionInit
 *   Runs inside engine.scene (a gsap.context scoped to el): every tween and ScrollTrigger it creates
 *   is reverted with the page; a returned function runs then too. Must be synchronous.
 *
 * @typedef {object} BootOptions
 * @property {import('./motion-engine.js').MotionEngineOptions} [engine] options for createMotionEngine
 *   (reduce, onPreferenceChange and the stop switch are handled here).
 * @property {false | import('./ink-cursor.js').InkCursorOptions} [cursor] options for the cursor accent
 *   on the persisted canvas, or false. The cursor runs only if the page has a canvas matching
 *   cursorSelector (render it only when a dossier item justifies a cursor).
 * @property {string} [cursorSelector] default '.mw-cursor-layer canvas'
 * @property {string} [sceneAttribute] default 'data-motion-scene' (space-separated names)
 * @property {(engine: import('./motion-engine.js').MotionEngine, page: PageInfo) => void} [onPage]
 *   called after every engine creation, for page-wide extras such as themeLayers(engine).
 *
 * @typedef {object} MotionController
 * @property {import('./motion-engine.js').MotionEngine | null} engine the current page's engine
 * @property {() => void} stopAnimations the in-page stop switch (WCAG 2.2.2): html[data-motion="off"]
 *   and a reduced rebuild; holds across ClientRouter navigations, never persisted between visits
 * @property {() => void} resumeAnimations undo the switch (the OS setting still wins)
 * @property {() => void} destroy remove everything (tests, hot reload)
 */

/** @type {Map<string, MotionInit>} */
const registry = new Map();

/**
 * Registers a section's motion once (module scripts run once); it runs on every page that has an
 * element with data-motion-scene="<name>".
 * @param {string} name
 * @param {MotionInit} init
 * @param {Map<string, MotionInit>} [into] a registry other than the shared one
 */
export function defineMotion(name, init, into = registry) {
  into.set(name, init);
}

/** @type {MotionController | null} */
let booted = null;

/**
 * Starts the Astro motion lifecycle. Call once, from the layout's module script.
 * @param {import('./motion-engine.js').MotionLibs} libs { gsap, ScrollTrigger, SplitText, Lenis }
 * @param {Map<string, MotionInit>} [sections] the registry filled by defineMotion (default: the shared one)
 * @param {BootOptions} [options]
 * @returns {MotionController}
 */
export function bootMotion(libs, sections = registry, options = {}) {
  if (booted) return booted; // a second call (hot reload, a stray import) reuses the first boot
  const html = document.documentElement;
  const sceneAttr = options.sceneAttribute || 'data-motion-scene';
  /** @type {import('./motion-engine.js').MotionEngine | null} */
  let engine = null;
  let stopped = false; // the in-page switch; lives as long as this module (the visit), never stored
  let navigated = false;
  /** @type {Promise<unknown>} */
  let transitionDone = Promise.resolve();
  let generation = 0;

  const end = () => {
    generation++;
    if (engine) { engine.destroy(); engine = null; }
  };

  /** @param {PageReason} reason */
  const start = (reason) => {
    end();
    const mine = generation;
    if (stopped) html.dataset.motion = 'off';
    engine = createMotionEngine(libs, { ...(options.engine || {}), reduce: stopped || options.engine?.reduce === true });
    guardKeyboardInertia(engine);
    const waitFor = reason === 'navigation' ? transitionDone : Promise.resolve();
    /** @type {PageInfo} */
    const page = {
      reason,
      ready: waitFor.then(() => (generation === mine ? undefined : new Promise(() => {}))),
    };
    const canvas = options.cursor === false ? null
      : /** @type {HTMLCanvasElement | null} */ (document.querySelector(options.cursorSelector || '.mw-cursor-layer canvas'));
    if (canvas) initInkCursor(engine, { ...(options.cursor || {}), canvas, hold: true });
    const current = engine;
    document.querySelectorAll(`[${sceneAttr}]`).forEach((node) => {
      const el = /** @type {HTMLElement} */ (node);
      for (const name of String(el.getAttribute(sceneAttr)).split(/\s+/)) {
        const init = sections.get(name);
        // An unknown name is skipped silently: no console output on a client site (Awwwards WPO).
        if (!init) continue;
        current.scene(() => {
          // The catch sits INSIDE the scene function: gsap.context (3.15.0) has no try/finally, so a
          // throw escaping it leaves GSAP's global context pointing at an orphan context that the
          // engine never stored, and whatever the init created before the throw (a ScrollTrigger)
          // outlives the page. Caught here, the context completes and is reverted with the page.
          // One broken section does not stop the others; the error still reaches the console and
          // error monitoring, just outside this loop.
          try {
            return init(current, el, page);
          } catch (err) {
            queueMicrotask(() => { throw err; });
            return undefined;
          }
        }, el);
      }
    });
    if (options.onPage) options.onPage(current, page);
  };

  const onPageLoad = () => {
    start(navigated ? 'navigation' : 'load');
    navigated = false;
  };
  /** @param {Event} event */
  const onBeforeSwap = (event) => {
    const e = /** @type {any} */ (event);
    navigated = true;
    end(); // inside the view transition's update callback: the old page is already a frozen snapshot
    transitionDone = e.viewTransition && e.viewTransition.finished
      ? e.viewTransition.finished.catch(() => undefined)
      : Promise.resolve();
    // Prepare the incoming <html> before Astro copies its attributes over ours: the stop switch
    // holds across navigation, and motion-ready is there from the first frame of the new page, so
    // hidden "before" states do not pop out of view when the engine boots after the swap.
    const next = e.newDocument && e.newDocument.documentElement;
    if (!next) return;
    if (stopped) next.setAttribute('data-motion', 'off');
    let reduceParam = false;
    try { reduceParam = new URL(String(e.to)).searchParams.get('reduce') === '1'; } catch { /* no URL */ }
    const willReduce = stopped || reduceParam || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    next.classList.toggle('motion-ready', !willReduce);
  };
  const onAfterSwap = () => { if (stopped) html.dataset.motion = 'off'; };
  const onPreference = () => { if (engine) start('rebuild'); };

  document.addEventListener('astro:page-load', onPageLoad);
  document.addEventListener('astro:before-swap', onBeforeSwap);
  document.addEventListener('astro:after-swap', onAfterSwap);
  window.addEventListener('motion:preference', onPreference);

  // Without <ClientRouter /> on the page (a plain multi-page Astro site) astro:page-load never fires:
  // start now (module scripts run after the document is parsed).
  const routed = document.querySelector('meta[name="astro-view-transitions-enabled"]');
  if (!routed) start('load');

  booted = {
    get engine() { return engine; },
    stopAnimations() {
      stopped = true;
      html.dataset.motion = 'off';
      start('rebuild');
    },
    resumeAnimations() {
      stopped = false;
      delete html.dataset.motion;
      start('rebuild');
    },
    destroy() {
      end();
      document.removeEventListener('astro:page-load', onPageLoad);
      document.removeEventListener('astro:before-swap', onBeforeSwap);
      document.removeEventListener('astro:after-swap', onAfterSwap);
      window.removeEventListener('motion:preference', onPreference);
      booted = null;
    },
  };
  return booted;
}
