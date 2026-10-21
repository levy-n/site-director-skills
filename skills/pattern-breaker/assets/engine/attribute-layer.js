// attribute-layer.js - motion for an EXISTING site through data attributes (upgrade mode).
//
// Built on createMotionEngine, so smooth scrolling, refresh discipline, the fonts gate, reduced
// motion, RTL line splits and the QA hooks behave exactly as in a greenfield build. The markup
// keeps working on its own: every hook only adds motion to an element that is already final.
//
//   1. Paste the head snippet from references/upgrade.md §10 (fail-open pre-hide + stage CSS).
//   2. Mark zones and moves in the markup:
//        <section data-pb-zone="Z03">            one scope per zone (labels for audits, kill switch)
//          <h2 data-pb="mask-lines">…</h2>       a move from the registry below (or your own)
//          <div data-pb="reveal" data-pb-opts='{"y":14}'>…</div>
//        <div data-pb-stage="story"><div class="pb-sticky">…</div></div>   a held scene: CSS reads --pb-p 0→1
//        <section data-pb-zone="Z05" data-pb-act="dark">…</section>          a theme act (html[data-pb-act])
//      Builders that allow classes but not attributes: class="pb--mask-lines", "pb--zone-Z03"
//      (double hyphen, because Tailwind owns pb-*).
//   3. Start it after first paint:
//        import { startLayer } from './attribute-layer.js';
//        const layer = startLayer({ gsap, ScrollTrigger, SplitText, Lenis });
//        layer.register('my-move', { full(el, opts, ctx) { … }, reduced(el, opts, ctx) { … } });
//
// Kill switches, fastest first: ?motion=0 (one visitor), ?pb-off=Z02,Z05 (zones), data-pb-off on a
// zone, <html data-pb-off> (a one-line redeploy). QA: ?at=<px> or ?at=<stageId>:<0..1>, ?reduce=1,
// window.__pb.zones for audit attribution.

import { createMotionEngine } from './motion-engine.js';

const BUILTIN_MOVES = {
  // Routine entrance: fires early, short and small, so it is over before anyone sees it.
  reveal: {
    full: (el, o, { engine }) => { engine.reveal(el, { y: o.y ?? 18, ...(o.duration ? { duration: o.duration } : {}) }); },
    reduced: () => {},
  },
  // E-01 masked line rise: a signature entrance meant to be watched. Never on the LCP element.
  'mask-lines': {
    full: (el, o, { engine, gsap }) => {
      engine.splitLines(el, {
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 105, duration: o.duration ?? 0.9, stagger: o.stagger ?? 0.08, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: o.start ?? 'top 80%', once: true },
        }),
      });
    },
    reduced: () => {},
  },
  // E-02 clip reveal with inner settle, scrubbed: the frame opens as the image arrives.
  clip: {
    full: (el, o, { gsap }) => {
      const st = { trigger: el, start: 'top 92%', end: o.end ?? 'top 45%', scrub: 0.5 };
      gsap.fromTo(el, { clipPath: 'inset(10% 8% 10% 8% round 12px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: st });
      const media = el.querySelector('img, video, picture');
      if (media) gsap.fromTo(media, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: st });
    },
    reduced: () => {},
  },
  // E-05 count to the real number already in the HTML (crawlers and no-JS read the final value).
  // Use only when the change is the story; a founding year is not a count. A number already on
  // screen when the layer starts keeps its value (counting it would flash final → 0 → final); one
  // below the screen shows its start value at once, so nobody reads the real number and then a 0.
  count: {
    full: (el, o, { gsap }) => {
      if (el.getBoundingClientRect().top <= innerHeight) return undefined;
      const original = el.textContent;
      const match = original.match(/\d[\d,.]*/);
      if (!match) return undefined;
      const target = Number(match[0].replace(/,/g, ''));
      const grouped = match[0].includes(',');
      const decimals = (match[0].split('.')[1] || '').length;
      const fmt = (v) => (grouped ? v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : v.toFixed(decimals));
      const state = { v: o.from ?? 0 };
      el.textContent = original.replace(match[0], fmt(state.v));
      gsap.to(state, {
        v: target, duration: o.duration ?? 1.2, ease: 'power2.out',
        onUpdate: () => { el.textContent = original.replace(match[0], fmt(state.v)); },
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
      return () => { el.textContent = original; };
    },
    reduced: () => {},
  },
  // Gentle scrubbed depth for one or two layers per page, never on text being read.
  drift: {
    full: (el, o, { gsap }) => {
      gsap.fromTo(el, { y: o.y ?? 40 }, { y: -(o.y ?? 40), ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    },
    reduced: () => {},
  },
};

export function startLayer(libs, options = {}) {
  const html = document.documentElement;
  const qs = new URLSearchParams(location.search);
  const moves = { ...BUILTIN_MOVES, ...(options.moves || {}) };
  const late = performance.now() > (options.preHideMs ?? 2500); // the fail-open already showed [data-pb-pre]
  let engine = null;
  let undo = [];
  let zones = [];

  // keepPre: start() keeps [data-pb-pre] elements hidden until the moves have built their start states
  function stop(keepPre = false) {
    undo.splice(0).forEach((fn) => { try { fn(); } catch { /* a move's cleanup must not block the rest */ } });
    engine?.destroy();
    engine = null;
    zones = [];
    html.classList.remove('pb-on', 'pb-reduced');
    if (!keepPre) html.classList.remove('pb-pre');
    delete html.dataset.pbAct;
  }

  function start() {
    stop(true);
    if (qs.get('motion') === '0' || html.hasAttribute('data-pb-off')) { html.classList.remove('pb-pre'); return api; }
    document.querySelectorAll('[class*="pb--"]').forEach(aliasClassesToAttributes);
    engine = createMotionEngine(libs, options.engine || {});
    const { gsap, ScrollTrigger, REDUCE } = engine;
    // Before any trigger exists: stage heights (and so every trigger position below) depend on it.
    html.classList.add('pb-on');
    html.classList.toggle('pb-reduced', REDUCE);
    const offZones = new Set((qs.get('pb-off') || '').split(',').filter(Boolean));

    for (const zone of document.querySelectorAll('[data-pb-zone]')) { // DOM order = creation order
      const id = zone.dataset.pbZone;
      if (offZones.has(id) || zone.hasAttribute('data-pb-off')) continue;
      zones.push(id);
      engine.scene(() => {
        stages(zone, engine);
        const els = zone.hasAttribute('data-pb') ? [zone, ...zone.querySelectorAll('[data-pb]')] : [...zone.querySelectorAll('[data-pb]')];
        for (const el of els) {
          const move = moves[el.dataset.pb];
          if (!move) { console.warn('[pb] unknown move', el.dataset.pb); continue; }
          if (late && el.hasAttribute('data-pb-pre')) continue;
          let opts = {};
          try { opts = el.dataset.pbOpts ? JSON.parse(el.dataset.pbOpts) : {}; } catch { console.warn('[pb] bad data-pb-opts on', el); }
          const run = REDUCE ? move.reduced : move.full;
          const cleanup = run && run(el, opts, { engine, gsap, ScrollTrigger, zone, REDUCE });
          if (typeof cleanup === 'function') undo.push(cleanup);
        }
      }, zone);
    }
    acts(engine);
    // Show pre-hidden elements only once their moves exist: mask-lines splits after fonts load, and
    // its continuation on fontsReady runs before this one. Removing pb-pre at start showed the
    // heading unsplit, then hid it behind its masks (measured with a webfont 1.5 s late on a phone).
    // The head snippet's 2.5 s fail-open still caps how long anything stays hidden.
    if (REDUCE) html.classList.remove('pb-pre');
    else engine.fontsReady.then(() => requestAnimationFrame(() => html.classList.remove('pb-pre')));
    window.__pb = api;
    return api;
  }

  const api = {
    get zones() { return zones; },
    get engine() { return engine; },
    register(id, move) { moves[id] = move; return api; },
    restart: start,
    stop: () => stop(),
  };
  return start();
}

// Held scenes without pins: the wrapper's height is the scroll distance (CSS sets it only while
// animating), its .pb-sticky child sticks, and --pb-p carries progress 0 → 1 for CSS to read.
function stages(zone, engine) {
  const { ScrollTrigger, REDUCE } = engine;
  const list = zone.matches('[data-pb-stage]') ? [zone, ...zone.querySelectorAll('[data-pb-stage]')] : [...zone.querySelectorAll('[data-pb-stage]')];
  for (const wrapper of list) {
    if (REDUCE) { wrapper.style.setProperty('--pb-p', '1'); continue; }
    const set = (p) => wrapper.style.setProperty('--pb-p', p.toFixed(4));
    const st = ScrollTrigger.create({
      id: wrapper.dataset.pbStage || undefined, trigger: wrapper, start: 'top top', end: 'bottom bottom',
      invalidateOnRefresh: true, onUpdate: (self) => set(self.progress), onRefresh: (self) => set(self.progress),
    });
    set(st.progress); // start state before the stage enters; without it CSS shows the final state, then jumps to 0
  }
}

// Theme acts: derived from position on every update, never stored.
function acts(engine) {
  const { ScrollTrigger } = engine;
  const list = [...document.querySelectorAll('[data-pb-act]')];
  if (!list.length) return;
  const html = document.documentElement;
  const pick = () => {
    const mid = innerHeight / 2;
    const hit = list.find((z) => { const r = z.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
    if (hit) html.dataset.pbAct = hit.dataset.pbAct; else delete html.dataset.pbAct;
  };
  engine.scene(() => { ScrollTrigger.create({ start: 0, end: 'max', onUpdate: pick, onRefresh: pick }); });
  pick();
}

function aliasClassesToAttributes(el) {
  for (const c of el.classList) {
    if (c.startsWith('pb--zone-')) el.dataset.pbZone = c.slice(9);
    else if (c.startsWith('pb--') && !el.dataset.pb) el.dataset.pb = c.slice(4);
  }
}
