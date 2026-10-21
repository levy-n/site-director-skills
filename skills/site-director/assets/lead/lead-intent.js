// lead-intent.js: open a lead popup when the visitor shows intent, never on a bare timer.
//
// A timer ("open after 35 s", "10 s after halfway") fires for the reader who is still reading and
// for the visitor who already left in their head; it covered MediaWave's whole story from mid-scroll
// for anyone who reads slowly (diagnosis 2026-10-15). This module scores what the visitor does and
// opens only when two independent signals agree, or one strong signal fires, AND the moment is calm.
//
// Framework-free ES module, no dependencies. One instance per page:
//   import { createLeadIntent } from './lead-intent.js';
//   const intent = createLeadIntent({ onOpen: (reason) => showPopup(reason) });
//   // popup closed:     intent.dismissed()
//   // lead submitted:   intent.converted()
//   // route change/unmount: intent.destroy()
//
// Markup hooks (all optional):
//   data-intent="interest"   sections whose reading signals interest (process, pricing, FAQ)
//   data-intent="end"        the last section of the story (footer or the closing chapter)
//   data-intent="contact"    the contact form: while it is in view the popup never opens (it would
//                            only duplicate the form the visitor is already looking at)
//   data-intent-signal       elements whose use signals consideration (FAQ toggles, "details" links)
//   data-convert             anything that counts as a conversion besides WhatsApp, tel:, mailto:
//
// QA: ?lead=off disables, ?lead=now opens at the first calm moment, ?lead=debug logs every signal
// and mirrors the state into html[data-lead-intent]. window.__leadIntent exposes state() and fire().

/**
 * @typedef {Object} LeadIntentOptions
 * @property {(reason: string, state: LeadIntentState) => void} onOpen  called once, when the popup should open
 * @property {() => boolean} [isBusy]          extra veto from the app (chat open, a11y panel open, …)
 * @property {number} [threshold=2]            points needed (each signal is worth one point)
 * @property {number} [minActiveMs=12000]      never before this much active time on the page
 * @property {number} [engagedActiveMs=25000] "engaged reading": this much active time…
 * @property {number} [engagedDepth=0.45]      …and this much of the page seen
 * @property {number} [interestDwellMs=8000]   time an interest section must be in view (active)
 * @property {number} [signalUses=2]           uses of [data-intent-signal] worth one point
 * @property {number} [hiddenReturnMs=20000]   tab hidden this long, then back: one point
 * @property {number} [scrollBackVp=1.5]       viewports scrolled up within 1 s after half the page
 * @property {boolean} [exitIntent=true]       desktop pointer leaving through the top edge (strong)
 * @property {number} [exitMinActiveMs=15000]  exit intent counts only after this much active time
 * @property {number} [exitMinDepth=0.25]       …and this much of the page seen
 * @property {number} [cooldownDays=3]         after a dismissal, stay quiet this long (localStorage)
 * @property {string[]} [legacyConverted]      localStorage keys that already mean "converted"
 * @property {string[]} [legacyDismissed]      sessionStorage keys that already mean "dismissed"
 */

/**
 * @typedef {Object} LeadIntentState
 * @property {number} activeMs
 * @property {number} depth
 * @property {number} points
 * @property {string[]} signals
 * @property {boolean} opened
 * @property {string|null} blockedBy
 */

const ACTIVE_WINDOW_MS = 5000;     // input within the last 5 s means the visitor is present
const SCROLL_CALM_MS = 900;        // a scroll in the last 0.9 s means "mid-gesture": wait
const KEYBOARD_CALM_MS = 4000;     // keyboard navigation in the last 4 s: never steal focus
const ANCHOR_JUMP_MS = 1500;       // an in-page link click is a deliberate jump
const PENDING_TTL_MS = 20000;      // a decided open waits at most 20 s for a calm moment
const TICK_MS = 500;               // one cheap timer; nothing here runs per frame

const safeMatches = (el, sel) => { try { return el.matches(sel); } catch { return true; } }; // old engines without :focus-visible stay strict
const CONVERT_SELECTOR = 'a[href^="https://wa.me"], a[href*="api.whatsapp.com"], a[href^="whatsapp:"], a[href^="tel:"], a[href^="mailto:"], [data-convert]';
const TYPING_SELECTOR = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';
const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, summary, [tabindex], [contenteditable]';

/** @param {LeadIntentOptions} opts */
export function createLeadIntent(opts) {
  if (typeof opts?.onOpen !== 'function') throw new Error('createLeadIntent needs { onOpen(reason) }');
  const o = {
    threshold: 2, minActiveMs: 12000, engagedActiveMs: 25000, engagedDepth: 0.45,
    interestDwellMs: 8000, signalUses: 2, hiddenReturnMs: 20000, scrollBackVp: 1.5,
    exitIntent: true, exitMinActiveMs: 15000, exitMinDepth: 0.25, cooldownDays: 3, legacyConverted: [], legacyDismissed: [],
    ...opts,
  };
  const qs = new URLSearchParams(location.search).get('lead');
  const DEBUG = qs === 'debug';
  const log = (...a) => { if (DEBUG) console.info('[lead-intent]', ...a); };

  const store = {
    get: (s, k) => { try { return s.getItem(k); } catch { return null; } },
    set: (s, k, v) => { try { s.setItem(k, v); } catch { /* private mode: in-memory only */ } },
  };
  const ls = (() => { try { return window.localStorage; } catch { return null; } })();
  const ss = (() => { try { return window.sessionStorage; } catch { return null; } })();
  const KEY_CONVERTED = 'leadIntent.converted';
  const KEY_DISMISSED = 'leadIntent.dismissed';
  const KEY_COOLDOWN = 'leadIntent.dismissedAt';

  const alreadyDone = () => {
    if (qs === 'off') return 'off';
    if (ls && (store.get(ls, KEY_CONVERTED) || o.legacyConverted.some((k) => store.get(ls, k)))) return 'converted';
    if (ss && (store.get(ss, KEY_DISMISSED) || o.legacyDismissed.some((k) => store.get(ss, k)))) return 'dismissed';
    const at = ls && Number(store.get(ls, KEY_COOLDOWN));
    if (at && Date.now() - at < o.cooldownDays * 864e5) return 'cooldown';
    return null;
  };
  const done = alreadyDone();
  if (done && qs !== 'now') {
    log('inactive:', done);
    return { destroy() {}, dismissed() {}, converted() {}, state: () => ({ activeMs: 0, depth: 0, points: 0, signals: [], opened: false, blockedBy: done }) };
  }

  // ---- state ---------------------------------------------------------------------------------
  let activeMs = 0;
  let lastInputAt = performance.now();
  // -Infinity, not 0: performance.now() starts near 0, so 0 would read as "the visitor just
  // scrolled / used the keyboard" for the first seconds of every page (found by the scenario test).
  let lastScrollAt = -Infinity;
  let lastKeyNavAt = -Infinity;
  let anchorUntil = 0;
  let depth = 0;
  let maxY = 0;
  let endSeen = false;
  let hiddenAt = 0;
  let opened = false;
  let pending = null;             // { reason, until }
  let contactVisible = false;
  let signalUses = 0;
  let blockedBy = null;
  const signals = new Set();      // one point per distinct signal
  const dwell = new Map();        // interest section -> visible active ms
  const visibleInterest = new Set();
  const cleanups = [];
  const on = (t, type, fn, opt) => { t.addEventListener(type, fn, opt); cleanups.push(() => t.removeEventListener(type, fn, opt)); };

  const points = () => signals.size;
  const state = () => ({ activeMs: Math.round(activeMs), depth: +depth.toFixed(2), points: points(), signals: [...signals], opened, blockedBy });
  const mirror = () => { if (DEBUG) document.documentElement.dataset.leadIntent = JSON.stringify(state()); };

  // ---- calm gate -----------------------------------------------------------------------------
  function busyReason() {
    const now = performance.now();
    if (document.visibilityState !== 'visible') return 'hidden';
    if (activeMs < o.minActiveMs && qs !== 'now') return 'too-early';
    if (now - lastScrollAt < SCROLL_CALM_MS) return 'scrolling';
    if (now < anchorUntil) return 'anchor-jump';
    if (now - lastKeyNavAt < KEYBOARD_CALM_MS) return 'keyboard';
    const a = document.activeElement;
    if (a && a !== document.body && a !== document.documentElement) {
      if (a.matches(TYPING_SELECTOR)) return 'typing';
      // Only keyboard focus blocks: a mouse click leaves focus on the button it clicked (an FAQ
      // toggle, a nav link), and treating that as busy blocked the popup until the pending open
      // expired (found by the scenario test). :focus-visible is true for keyboard focus only.
      if (a.matches(INTERACTIVE_SELECTOR) && safeMatches(a, ':focus-visible')) return 'focus-on-control';
    }
    if (contactVisible) return 'contact-in-view';
    if (document.querySelector('[aria-modal="true"]:not([hidden]), dialog[open]')) return 'dialog-open';
    if (o.isBusy && o.isBusy()) return 'app-busy';
    return null;
  }

  function open(reason) {
    if (opened) return;
    opened = true;
    pending = null;
    log('OPEN', reason, state());
    mirror();
    teardown(); // nothing left to watch; dismissed()/converted() still write storage
    o.onOpen(reason, state());
  }

  function decide(reason, strong = false) {
    if (opened) return;
    const busy = busyReason();
    blockedBy = busy;
    if (!busy) { open(reason); return; }
    // A strong, momentary signal (the pointer leaving) is stale a moment later: drop it.
    if (strong && reason === 'exit-intent') { log('exit intent dropped:', busy); return; }
    pending = { reason, until: performance.now() + PENDING_TTL_MS };
    log('pending', reason, 'blocked by', busy);
  }

  function addSignal(name) {
    if (opened || signals.has(name)) return;
    signals.add(name);
    log('signal', name, `${points()}/${o.threshold}`);
    mirror();
    if (points() >= o.threshold) decide(`score:${[...signals].join('+')}`);
  }

  // ---- inputs --------------------------------------------------------------------------------
  const markInput = () => { lastInputAt = performance.now(); };
  on(window, 'pointermove', markInput, { passive: true });
  on(window, 'pointerdown', markInput, { passive: true });
  on(window, 'touchstart', markInput, { passive: true });
  on(window, 'wheel', markInput, { passive: true });

  let backFrom = null; // { y, t } start of an upward run
  on(window, 'scroll', () => {
    const now = performance.now();
    markInput();
    lastScrollAt = now;
    const y = window.scrollY;
    const doc = document.documentElement.scrollHeight;
    depth = Math.max(depth, Math.min(1, (y + innerHeight) / Math.max(1, doc)));
    if (y > maxY) { maxY = y; backFrom = null; }
    // Scroll-back: after half the page, a fast run up of 1.5 viewports within 1 s. On phones this is
    // the nearest honest proxy for "leaving" (there is no pointer to leave the window).
    if (depth >= 0.5 && y < maxY) {
      if (!backFrom || now - backFrom.t > 1000) backFrom = { y: Math.max(y, maxY), t: now };
      if (backFrom.y - y >= o.scrollBackVp * innerHeight) {
        backFrom = null;
        if (endSeen) decide('read-all-then-back', true); else addSignal('scroll-back');
      }
    }
  }, { passive: true });

  on(document, 'keydown', (e) => {
    markInput();
    if (['Tab', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Enter'].includes(e.key)) lastKeyNavAt = performance.now();
  }, true);

  on(document, 'click', (e) => {
    const t = /** @type {Element|null} */ (e.target);
    if (!t || !t.closest) return;
    if (t.closest(CONVERT_SELECTOR)) { api.converted(); return; }
    if (t.closest('a[href^="#"], a[href^="/#"]')) anchorUntil = performance.now() + ANCHOR_JUMP_MS;
    if (t.closest('[data-intent-signal]')) {
      signalUses += 1;
      log('signal use', signalUses);
      if (signalUses >= o.signalUses) addSignal('considering');
    }
  }, true);

  on(document, 'submit', () => api.converted(), true);

  on(document, 'visibilitychange', () => {
    if (document.visibilityState === 'hidden') { hiddenAt = performance.now(); return; }
    // Came back after comparing elsewhere, having already read a fair part of the page.
    if (hiddenAt && performance.now() - hiddenAt >= o.hiddenReturnMs && depth >= 0.3) addSignal('came-back');
    hiddenAt = 0;
    markInput();
  });

  // Desktop exit intent: the pointer leaves through the top edge (towards tabs and the address bar).
  // Only with a fine pointer that hovers, and only after real reading, so a visitor who arrives and
  // reaches for another tab at once is left alone.
  const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (o.exitIntent && FINE) {
    on(document, 'mouseout', (e) => {
      if (e.relatedTarget || e.clientY > 0) return;
      if (activeMs < o.exitMinActiveMs || depth < o.exitMinDepth) return;
      decide('exit-intent', true);
    });
  }

  // ---- sections ------------------------------------------------------------------------------
  // Sections can mount after this module (React Suspense, lazy routes, Astro islands), so a cheap
  // rescan every 2 s observes any marked element it has not seen yet.
  const seen = new WeakSet();
  let scan = () => {};
  if ('IntersectionObserver' in window) {
    // "In view" = it fills half the screen OR half of itself. A plain 0.5 ratio never fires for a
    // sticky hold several screens tall (MediaWave's process hold: 4,000 px, at most 22% visible),
    // which the real-site run caught and the short-section fixture had not.
    const STEPS = Array.from({ length: 21 }, (_, i) => i / 20);
    const covers = (en, share) => en.isIntersecting && (en.intersectionRatio >= share ||
      en.intersectionRect.height >= share * (en.rootBounds ? en.rootBounds.height : innerHeight));
    const ioInterest = new IntersectionObserver((entries) => {
      for (const en of entries) { if (covers(en, 0.5)) visibleInterest.add(en.target); else visibleInterest.delete(en.target); }
    }, { threshold: STEPS });
    const ioEnd = new IntersectionObserver((entries) => {
      if (entries.some((en) => covers(en, 0.35)) && !endSeen) { endSeen = true; log('end of story seen'); }
    }, { threshold: STEPS });
    const contactShown = new Set();
    const ioContact = new IntersectionObserver((entries) => {
      for (const en of entries) { if (covers(en, 0.3)) contactShown.add(en.target); else contactShown.delete(en.target); }
      contactVisible = contactShown.size > 0;
    }, { threshold: STEPS });
    const watch = (sel, io) => document.querySelectorAll(sel).forEach((el) => { if (!seen.has(el)) { seen.add(el); io.observe(el); } });
    scan = () => { watch('[data-intent="interest"]', ioInterest); watch('[data-intent="end"]', ioEnd); watch('[data-intent="contact"]', ioContact); };
    scan();
    cleanups.push(() => { ioInterest.disconnect(); ioEnd.disconnect(); ioContact.disconnect(); });
  }

  // ---- the one timer -------------------------------------------------------------------------
  let last = performance.now();
  let ticks = 0;
  const tick = setInterval(() => {
    const now = performance.now();
    if (++ticks % 4 === 0) scan();
    const dt = Math.min(now - last, 2000); // a throttled background tab must not add minutes at once
    last = now;
    const present = document.visibilityState === 'visible' && now - lastInputAt < ACTIVE_WINDOW_MS;
    if (present) {
      activeMs += dt;
      for (const el of visibleInterest) {
        const t = (dwell.get(el) || 0) + dt;
        dwell.set(el, t);
        if (t >= o.interestDwellMs) {
          const i = [...document.querySelectorAll('[data-intent="interest"]')].indexOf(el);
          addSignal(`interest-${el.id || i}`);
        }
      }
      if (activeMs >= o.engagedActiveMs && depth >= o.engagedDepth) addSignal('engaged-reading');
    }
    if (qs === 'now' && !pending && !opened) pending = { reason: 'qa:now', until: Infinity };
    if (pending) {
      if (now > pending.until) { log('pending expired', pending.reason); pending = null; }
      else if (!busyReason()) open(pending.reason);
    }
    mirror();
  }, TICK_MS);
  cleanups.push(() => clearInterval(tick));

  function teardown() { cleanups.splice(0).forEach((fn) => fn()); }

  const api = {
    /** The visitor closed the popup: quiet for this session, and for cooldownDays. */
    dismissed() {
      if (ss) store.set(ss, KEY_DISMISSED, '1');
      if (ls) store.set(ls, KEY_COOLDOWN, String(Date.now()));
      teardown();
    },
    /** The visitor converted (WhatsApp, phone, form): never again on this device. */
    converted() {
      if (ls) store.set(ls, KEY_CONVERTED, '1');
      log('converted');
      opened = true;
      pending = null;
      teardown();
    },
    destroy: teardown,
    state,
  };
  if (DEBUG || qs === 'now') window.__leadIntent = { state, fire: (r = 'qa:fire') => decide(r) };
  log('armed', o);
  return api;
}
