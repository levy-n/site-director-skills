#!/usr/bin/env node
// motion-audit: measure what a scroll experience actually does, library-agnostic.
//
//   node motion-audit.mjs <url> [--viewports desktop,short,mobile] [--out ./audit] [--only map,smoothness,reduced]
//                               [--runs N] [--strict] [--dead-vp 3] [--budget-cls 0.1]
//                               [--step 0.5] [--settle 600] [--intro 4500] [--throttle 4] [--max-steps 140]
//
// Viewports (default desktop,mobile): desktop 1440x900; short 1440x700, the same desktop 200 px
// shorter, where stages and full-screen scenes sized for 900 px must still fit; mobile 390x844 (DPR 2,
// touch, 4x CPU throttle). short is judged on the desktop budgets.
//
// Reports, per viewport:
//   motion map   which sections move, how (scrub vs trigger; fade, clip, scale, rotate, horizontal,
//                SVG morph and draw), where the page HOLDS (pinned/sticky ranges, edges read from
//                layout), theme switches, dead zones and each section's dead share
//   monotony     share of seen reveals that are plain fade-ups, the #1 AI-motion tell. Early
//                entrances (changed only while off screen, like engine.reveal()) are counted apart
//   smoothness   frame times during a human-speed scroll (p50/p95/jank%), long tasks with the scroll
//                position and section they hit, the scripts behind long frames, CLS
//   honesty      the page scrolls to the end, content stuck invisible mid-screen, horizontal overflow,
//                page errors; under prefers-reduced-motion: reduce, all content visible, nothing
//                moving on its own, nothing animating on scroll
//   idle motion  things moving with no input (marquees, floats): must be ~0 under reduced motion
//
// --only        run some passes: map (stepped motion map), smoothness, reduced. To re-measure a
//               performance fix: --only smoothness --viewports mobile (under a minute).
// --runs N      smoothness runs; timing checks are judged on the median. Default 1, and two more
//               runs start on their own when the first lands near a timing budget (long tasks within
//               0.5x-2x, p95 frame or jank within 0.8x-2x). WARN = median within budget, a run over.
// --dead-vp N   dead-zone threshold in viewports (default 3; upgrade zone scoring uses 1.5)
// --budget-cls  scroll CLS budget (default 0.1, a smoke floor; pass the brief's 0.05)
// --strict      timing checks (p95 frame, jank, long tasks) also set the exit code
//
// Exit code: 1 when a non-timing check fails (with --strict, any check), 2 on bad usage, else 0.
// Runtime: about 2-3 min per viewport on desktop and 4-6 on mobile (4x CPU throttle) for a
// 10,000 px page; most of it is the stepped map and reduced passes.
//
// Works for GSAP, Motion, anime.js and CSS scroll-driven animations alike: it samples computed
// styles of every element that carries inline animation styles or a Web Animation, plus the boxes
// near the viewport. Headless frame timing is a smoke test, not a device benchmark: compare runs.

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { inflateSync } from 'node:zlib';

// --help prints the leading comment block of this file (everything above the imports).
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  const { readFileSync: readSelf } = await import('node:fs');
  const header = [];
  for (const l of readSelf(new URL(import.meta.url), 'utf8').split(/\r?\n/)) {
    if (l.startsWith('#!')) continue;
    if (!l.startsWith('//')) break;
    header.push(l.replace(/^\/\/ ?/, ''));
  }
  console.log(header.join('\n'));
  process.exit(0);
}

const BOOLEAN_FLAGS = new Set(['strict']);
const PASSES = ['map', 'smoothness', 'reduced'];
const args = parseArgs(process.argv.slice(2));
const URL_ARG = args._[0];
const usage = (msg) => {
  if (msg) console.error(msg);
  console.error('usage: node motion-audit.mjs <url> [--viewports desktop,short,mobile] [--out dir] [--only map,smoothness,reduced] [--runs N] [--strict] (--help for all options)');
  process.exit(2);
};
if (!URL_ARG) usage();
const OUT = resolve(args.out || './audit');
const STEP = Number(args.step || 0.5);
const SETTLE = Number(args.settle || 600);
const INTRO_MS = Number(args.intro || 4500);
const MAX_STEPS = Number(args['max-steps'] || 140);
const MOBILE_THROTTLE = Number(args.throttle || 4);
const VIEWPORTS = String(args.viewports || 'desktop,mobile').split(',').map((v) => v.trim()).filter(Boolean);
const ONLY = new Set(String(args.only || PASSES.join(',')).split(',').map((v) => v.trim()).filter(Boolean));
const RUNS = args.runs === undefined ? null : Number(args.runs);
const DEAD_VP = Number(args['dead-vp'] || 3);
const BUDGET_CLS = args['budget-cls'] === undefined ? 0.1 : Number(args['budget-cls']);
const STRICT = Boolean(args.strict);

const PROFILES = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  // the same desktop, 200 px shorter: holds, stages and full-screen scenes must still fit
  short: { width: 1440, height: 700, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  mobile: {
    width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  },
};
if (VIEWPORTS.some((v) => !PROFILES[v])) usage(`unknown viewport in "${VIEWPORTS.join(',')}": use ${Object.keys(PROFILES).join(', ')}`);
if (!ONLY.size || [...ONLY].some((p) => !PASSES.includes(p))) usage(`--only takes ${PASSES.join(', ')} (comma-separated)`);
if (RUNS !== null && !(Number.isInteger(RUNS) && RUNS >= 1)) usage('--runs takes a whole number ≥ 1');
if (!(DEAD_VP > 0) || !(BUDGET_CLS >= 0) || !(STEP > 0)) usage('--dead-vp, --step and --budget-cls take positive numbers');

// Budgets are deliberately generous for headless software rendering; tighten per project.
// Timing budgets come in two tiers: mobile (touch, CPU throttled) and desktop (every other profile).
const tier = (name) => (PROFILES[name].isMobile ? 'mobile' : 'desktop');
const BUDGET = {
  p95FrameMs: { desktop: 34, mobile: 50 },
  jankPct: { desktop: 12, mobile: 20 },     // % of frames slower than 2× the 60Hz budget
  clsDuringScroll: BUDGET_CLS,                // built-in 0.1 is a smoke floor; the brief says 0.05
  longTaskMsDuringScroll: { desktop: 400, mobile: 1000 }, // mobile runs at 4x CPU throttle
  fadeUpShareMax: 0.7,                        // above this with <3 motion kinds = monotone reveals
  deadZoneViewports: DEAD_VP,                 // this many consecutive viewports with nothing alive
};
// A first smoothness run this close to a timing budget gets two more runs (median judged).
// Measured: identical builds gave 2832 vs 3960 ms and 1149 vs 2219 ms of long tasks on mobile.
const NEAR = { longTaskMs: [0.5, 2], p95FrameMs: [0.8, 2], jankPct: [0.8, 2] };
const SMOOTH_CAP_MS = 90000;   // a smoothness scroll stops here even if the page is longer
const STUCK_MS = 2000;         // no scroll movement for this long = a scroll lock, not a slow page

function parseArgs(list) {
  const out = { _: [] };
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const key = a.slice(2);
    const next = list[i + 1];
    if (BOOLEAN_FLAGS.has(key) || next === undefined || next.startsWith('--')) out[key] = true;
    else { out[key] = next; i++; }
  }
  return out;
}

function loadPuppeteer() {
  const bases = [import.meta.url, join(process.cwd(), 'noop.js')];
  try { bases.push(join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'noop.js')); } catch { /* none */ }
  for (const base of bases) {
    try { return createRequire(base)('puppeteer'); } catch { /* next */ }
  }
  console.error('puppeteer not found. Run from a project that has it (npm i -D puppeteer) or install it globally.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pct = (arr, p) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};
const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  return s.length ? s[Math.floor((s.length - 1) / 2)] : 0;
};
const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;
const stuckMessage = (tag, y, maxY) => `[${tag}] scroll is stuck at y=${Math.round(y)} (max ${Math.round(maxY)}): check for a scroll lock (overflow:hidden, lenis.stop) or an overlay`;

// Injected before any page script: performance observers, an rAF frame sampler and, while the
// smoothness pass measures, a scrollY timeline so each long task can be placed on the page.
const INSTRUMENT = () => {
  window.__ma = { longTasks: [], shifts: [], loaf: [], ys: [] };
  const obs = (type, fn) => {
    try { new PerformanceObserver((l) => l.getEntries().forEach(fn)).observe({ type, buffered: true }); } catch { /* unsupported */ }
  };
  obs('longtask', (e) => window.__ma.longTasks.push({ t: e.startTime, d: e.duration }));
  const describe = (n) => {
    if (!n || !n.tagName) return 'text';
    const cls = typeof n.className === 'string' && n.className.trim() ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    return `${n.tagName.toLowerCase()}${n.id ? '#' + n.id : ''}${cls}`;
  };
  obs('layout-shift', (e) => {
    if (e.hadRecentInput) return;
    window.__ma.shifts.push({ t: e.startTime, v: e.value, src: (e.sources || []).slice(0, 3).map((s) => describe(s.node)) });
  });
  obs('long-animation-frame', (e) => window.__ma.loaf.push({
    t: e.startTime, d: e.duration, b: e.blockingDuration,
    s: (e.scripts || []).slice(0, 4).map((x) => ({ u: x.sourceURL || '', f: x.sourceFunctionName || '', i: x.invoker || '', d: x.duration })),
  }));
  window.__maFrames = null;
  let prev = 0;
  const tick = (t) => {
    if (window.__maFrames) {
      if (prev) window.__maFrames.push(t - prev);
      window.__ma.ys.push(t, Math.round(scrollY));
    }
    prev = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

async function openPage(browser, profile, reduced) {
  const page = await browser.newPage();
  if (profile.ua) await page.setUserAgent(profile.ua);
  await page.setViewport(profile);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }]);
  await page.evaluateOnNewDocument(INSTRUMENT);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 240)));
  // "Failed to load resource" console lines carry no URL: report failed responses directly instead,
  // and ignore the missing favicon every bare test page has.
  page.on('console', (m) => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) errors.push(`console: ${m.text().slice(0, 240)}`); });
  page.on('response', (r) => { if (r.status() >= 400 && !/\/favicon\.ico(\?|$)/.test(r.url())) errors.push(`HTTP ${r.status()} ${r.url().slice(0, 160)}`); });
  const cdp = await page.createCDPSession();
  if (profile.isMobile && MOBILE_THROTTLE > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: MOBILE_THROTTLE });
  let navError = null;
  const resp = await page.goto(URL_ARG, { waitUntil: 'networkidle2', timeout: 90000 }).catch((e) => { navError = e.message; return null; });
  if (!resp && !navError) navError = 'no response';
  else if (resp && resp.status() >= 400) navError = `HTTP ${resp.status()}`;
  await sleep(INTRO_MS);
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  // An audit of a page that never loaded "passes" everything: measure that it actually rendered.
  const loaded = await page.evaluate(() => ({ text: (document.body && document.body.innerText || '').trim().length, height: document.documentElement.scrollHeight })).catch(() => ({ text: 0, height: 0 }));
  return { page, cdp, errors, load: { navError, ...loaded } };
}

async function stillScroll(page, maxMs = 4000) {
  let last = -1, stable = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const y = await page.evaluate(() => Math.round(scrollY));
    stable = y === last ? stable + 100 : 0;
    if (stable >= 300) return y;
    last = y;
    await sleep(100);
  }
  return last;
}

async function scrollBy(page, cdp, profile, delta) {
  if (profile.isMobile) {
    const before = await page.evaluate(() => scrollY);
    await cdp.send('Input.synthesizeScrollGesture', {
      x: Math.round(profile.width / 2), y: Math.round(profile.height * 0.6),
      yDistance: -delta, speed: 1400, gestureSourceType: 'touch', preventFling: true,
    }).catch(() => {});
    if (Math.abs((await page.evaluate(() => scrollY)) - before) <= 2) {
      await page.evaluate((d) => window.scrollTo({ top: scrollY + d, behavior: 'instant' }), delta);
    }
    return;
  }
  await page.mouse.move(profile.width / 2, profile.height / 2);
  let left = delta;
  while (Math.abs(left) > 0) {
    const tick = Math.max(-120, Math.min(120, left));
    await page.mouse.wheel({ deltaY: tick });
    left -= tick;
    await sleep(16);
  }
}

// One observation of the page at the current scroll position.
const SAMPLE = () => {
  const vh = innerHeight, vw = innerWidth;
  let nextId = window.__maNext || 0;
  const idOf = (el) => (el.dataset.maId ||= String(++nextId));
  const SEC = 'section,footer,header,main > *,[data-section]';
  const secLabel = (sec) => {
    if (!sec) return 'body';
    if (!sec.dataset.maSec) {
      window.__maSecN = (window.__maSecN || 0) + 1;
      sec.dataset.maSec = `${sec.tagName.toLowerCase()}${sec.id ? '#' + sec.id : ''}${typeof sec.className === 'string' && sec.className.trim() ? '.' + sec.className.trim().split(/\s+/)[0] : ''}@${window.__maSecN}`;
    }
    return sec.dataset.maSec;
  };
  const describe = (n) => {
    const cls = typeof n.className === 'string' && n.className.trim() ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    return `${n.tagName.toLowerCase()}${n.id ? '#' + n.id : ''}${cls}`;
  };
  const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  const GEOM = /^(path|polyline|polygon|line|circle|ellipse)$/;
  const geometry = (el, cs) => {
    const tag = el.tagName.toLowerCase();
    if (!GEOM.test(tag)) return '';
    if (tag === 'path') return hash((cs.d && cs.d !== 'none' ? cs.d : el.getAttribute('d')) || '');
    if (tag === 'line') return hash(['x1', 'y1', 'x2', 'y2'].map((a) => el.getAttribute(a)).join(','));
    if (tag === 'polyline' || tag === 'polygon') return hash(el.getAttribute('points') || '');
    return hash(`${cs.cx},${cs.cy},${cs.r},${cs.rx},${cs.ry}`);
  };
  const candidates = new Set();
  // 1) JS-driven motion writes inline styles (GSAP, Motion, anime.js), SVG draws included
  document.querySelectorAll('[style]').forEach((el) => {
    const s = el.style;
    if (s.transform || s.opacity || s.clipPath || s.translate || s.scale || s.rotate || s.visibility || s.strokeDashoffset) candidates.add(el);
  });
  // 2) running Web Animations / CSS animations / scroll-driven timelines
  if (document.getAnimations) document.getAnimations().forEach((a) => a.effect && a.effect.target && candidates.add(a.effect.target));
  // 3) class-toggle reveals (AOS, IntersectionObserver + CSS transition) leave no inline style and no
  //    Animation once finished: so also track every box near the viewport and diff computed styles.
  const near = document.querySelectorAll('body *');
  for (let i = 0, added = 0; i < near.length && added < 1800; i++) {
    const el = near[i];
    if (candidates.has(el) || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.bottom < -vh * 0.5 || r.top > vh * 1.5) continue;
    candidates.add(el);
    added++;
  }
  const els = {};
  let n = 0;
  for (const el of candidates) {
    if (n++ > 2500 || !(el instanceof Element)) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const svg = el instanceof SVGElement;
    const parent = el.parentElement;
    els[idOf(el)] = {
      // transform|opacity|clip|translate|scale|rotate|svg geometry|stroke-dashoffset
      sig: `${cs.transform}|${cs.opacity}|${cs.clipPath}|${cs.translate}|${cs.scale}|${cs.rotate}|${svg ? geometry(el, cs) : ''}|${svg ? cs.strokeDashoffset : ''}`,
      inView: r.bottom > 0 && r.top < vh && r.width > 0,
      sec: secLabel(el.closest(SEC)),
      // a word inside running text whose opacity changes is an ink fill, not a reveal
      word: el.tagName === 'SPAN' && Boolean(parent && /^(P|H[1-6]|LI|BLOCKQUOTE)$/.test(parent.tagName)) && (el.textContent || '').trim().length < 24,
      lb: describe(el),
      ah: Boolean(el.closest('[aria-hidden="true"]')),
      pg: Boolean(el.closest('[role="progressbar"],progress')),
    };
  }
  window.__maNext = nextId;
  const keyOf = (s) => `${s.tagName.toLowerCase()}${s.id ? '#' + s.id : ''}${typeof s.className === 'string' && s.className.trim() ? '.' + s.className.trim().split(/\s+/)[0] : ''}`;
  // Hold candidates: GSAP pins (children of .pin-spacer), CSS sticky elements, sections.
  // A large candidate whose viewport top stays put while the page scrolls is a held scene.
  if (!window.__maSticky) {
    window.__maSticky = [];
    const all = document.querySelectorAll('body *');
    for (let i = 0; i < all.length && i < 9000; i++) if (getComputedStyle(all[i]).position === 'sticky') window.__maSticky.push(all[i]);
  }
  // Where a hold starts and ends, read from layout (document px, before subtracting the held top T):
  // a pin holds while its spacer passes, a sticky box while its parent's content box passes.
  const px = (v) => (/px$/.test(v) ? parseFloat(v) : null);
  const num = (v) => parseFloat(v) || 0;
  const layout = (el) => {
    const p = el.parentElement;
    if (!p) return null;
    const cs = getComputedStyle(el);
    const y = scrollY;
    if (p.classList.contains('pin-spacer')) {
      const top = p.getBoundingClientRect().top + y;
      return { start: top, end: top + p.offsetHeight - el.offsetHeight, T: cs.position === 'fixed' ? px(cs.top) : null };
    }
    if (cs.position !== 'sticky') return null;
    const pcs = getComputedStyle(p);
    const pr = p.getBoundingClientRect();
    const flow = /^(block|flow-root|list-item)$/.test(pcs.display);
    let prev = el.previousElementSibling;
    while (prev && (/^(absolute|fixed)$/.test(getComputedStyle(prev).position) || getComputedStyle(prev).display === 'none')) prev = prev.previousElementSibling;
    let natural;
    if (prev) {
      const pm = num(getComputedStyle(prev).marginBottom);
      natural = prev.getBoundingClientRect().bottom + y + (flow ? Math.max(pm, num(cs.marginTop)) : pm + num(cs.marginTop));
    } else {
      const pad = num(pcs.borderTopWidth) + num(pcs.paddingTop);
      natural = pr.top + y + pad + (pad || !flow ? num(cs.marginTop) : 0);
    }
    const bottom = pr.bottom + y - num(pcs.borderBottomWidth) - num(pcs.paddingBottom);
    return { start: natural, end: bottom - el.offsetHeight - num(cs.marginBottom), T: px(cs.top) };
  };
  const held = [];
  for (const el of new Set([...document.querySelectorAll('.pin-spacer > *'), ...window.__maSticky, ...document.querySelectorAll('section')])) {
    const r = el.getBoundingClientRect();
    if (r.height < vh * 0.4 || r.bottom < 0 || r.top > vh) continue;
    held.push({ id: idOf(el), sec: keyOf(el.closest('section,footer,[data-section]') || el), top: Math.round(r.top), lay: layout(el) });
  }
  window.__maNext = nextId;
  // The section under the middle of the screen: dead stretches are reported per section.
  const midEl = document.elementFromPoint(vw / 2, vh / 2);
  const mid = secLabel(midEl && midEl.closest(SEC));
  // Content you should be able to read in the middle band of the screen but cannot.
  const hidden = [];
  const band = [vh * 0.25, vh * 0.75];
  const effOpacity = (el) => {
    let o = 1;
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.visibility === 'hidden' || cs.display === 'none') return 0;
      o *= parseFloat(cs.opacity);
      if (o < 0.05) return o;
    }
    return o;
  };
  // Hidden content is only a defect if it NEVER shows while on screen: content waiting for its
  // cue inside a pinned scene is choreography. Record both sides; analysis decides.
  const bandVisible = [];
  // A closed overlay (menu, modal, lightbox) is a fixed layer that is itself invisible: not content.
  const inClosedOverlay = (el) => {
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.position === 'fixed' && (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05 || cs.display === 'none')) return true;
    }
    return false;
  };
  document.querySelectorAll('h1,h2,h3,h4,p,li,blockquote,figcaption,button,a,img,video').forEach((el) => {
    if (el.closest('[aria-hidden="true"],[inert],dialog:not([open])') || inClosedOverlay(el)) return;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return;
    const mid = (r.top + r.bottom) / 2;
    if (mid < band[0] || mid > band[1] || r.right < 0 || r.left > vw) return;
    const hasContent = (el.textContent || '').trim().length > 2 || el.tagName === 'IMG' || el.tagName === 'VIDEO';
    if (!hasContent) return;
    const id = idOf(el);
    if (effOpacity(el) >= 0.05) { if (bandVisible.length < 400) bandVisible.push(id); return; }
    if (hidden.length < 40) hidden.push({ id, label: `${el.tagName.toLowerCase()}: "${(el.textContent || el.getAttribute('alt') || el.getAttribute('src') || '').trim().slice(0, 60)}"` });
  });
  window.__maNext = nextId;
  return {
    y: Math.round(scrollY), maxY: document.documentElement.scrollHeight - vh,
    els, held, hidden, bandVisible, mid,
    overflowX: Math.max(0, document.documentElement.scrollWidth - vw),
  };
};

// Minimal PNG decoder (8-bit RGB/RGBA, non-interlaced: what Chrome screenshots produce),
// so the audit can read real rendered pixels without an image dependency.
function decodePng(buf) {
  let pos = 8, width = 0, height = 0, colorType = 6;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); colorType = data[9]; }
    if (type === 'IDAT') idat.push(data);
    if (type === 'IEND') break;
    pos += 12 + len;
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      const p = a + b - c;
      const pr = Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c) ? a : Math.abs(p - b) <= Math.abs(p - c) ? b : c;
      const v = line[x];
      out[y * stride + x] = (f === 0 ? v : f === 1 ? v + a : f === 2 ? v + b : f === 3 ? v + ((a + b) >> 1) : v + pr) & 255;
    }
  }
  return { width, height, bpp, data: out };
}

// The background as the visitor sees it: average pixels at three screen edges, majority vote.
// Hit-testing misses fixed theme layers with pointer-events:none; pixels do not.
async function renderedBackground(page, profile) {
  const spots = [[2, profile.height * 0.5], [profile.width - 10, profile.height * 0.5], [profile.width * 0.5, profile.height - 10]];
  // Measured gotchas: the clip is in DOCUMENT coordinates, and the default captureBeyondViewport:true
  // briefly resizes the viewport: which fires resize, re-runs ScrollTrigger.refresh and makes the
  // page jump (9000 → 2931 on a pinned page). Always capture from the visible surface.
  const { sx, sy } = await page.evaluate(() => ({ sx: scrollX, sy: scrollY }));
  const colors = [];
  // The topmost hit-testable element at the spot: canvas/video/img (or a background image) is media.
  const mediaAt = await page.evaluate((pts) => pts.map(([x, y]) => {
    const el = document.elementFromPoint(x, y);
    if (!el) return false;
    if (/^(CANVAS|VIDEO|IMG|PICTURE)$/.test(el.tagName)) return true;
    const bi = getComputedStyle(el).backgroundImage;
    return Boolean(bi && bi.includes('url('));
  }), spots);
  for (const [i, [x, y]] of spots.entries()) {
    if (mediaAt[i]) { colors.push('media'); continue; }
    const png = await page.screenshot({ type: 'png', captureBeyondViewport: false, clip: { x: Math.round(sx + x), y: Math.round(sy + y), width: 8, height: 8 } }).catch(() => null);
    if (!png) continue;
    const img = decodePng(Buffer.from(png));
    const n = img.width * img.height;
    const sum = [0, 0, 0];
    const sq = [0, 0, 0];
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { const v = img.data[i * img.bpp + k]; sum[k] += v; sq[k] += v * v; }
    const mean = sum.map((s) => s / n);
    const spread = Math.sqrt(sq.reduce((s, q, k) => s + q / n - mean[k] ** 2, 0) / 3);
    colors.push(spread > 18 ? 'media' : mean.map((m) => Math.round(m / 8) * 8)); // quantise to absorb grain
  }
  const key = (c) => (c === 'media' ? 'media' : `rgb(${c.join(', ')})`);
  const votes = {};
  colors.forEach((c) => { votes[key(c)] = (votes[key(c)] || 0) + 1; });
  const best = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : 'unknown';
}

const colourDistance = (a, b) => {
  const pa = a.match(/\d+/g), pb = b.match(/\d+/g);
  if (!pa || !pb) return a === b ? 0 : 999;
  return Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]);
};

// CLS the way Chrome scores it: the worst session window (gap < 1s, window ≤ 5s).
function clsWindows(shifts) {
  let worst = 0, cur = 0, winStart = 0, last = -Infinity;
  for (const s of shifts) {
    if (s.t - last > 1000 || s.t - winStart > 5000) { cur = 0; winStart = s.t; }
    cur += s.v;
    last = s.t;
    worst = Math.max(worst, cur);
  }
  const bySource = {};
  shifts.forEach((s) => (s.src.length ? s.src : ['unknown']).forEach((k) => { bySource[k] = (bySource[k] || 0) + s.v; }));
  const top = Object.entries(bySource).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k} (${round(v, 3)})`);
  return { worst: round(worst, 3), total: round(shifts.reduce((s, x) => s + x.v, 0), 3), top };
}

// Hidden-in-view content is a defect only if it never becomes visible while on screen.
function hiddenReport(samples) {
  const shown = new Set(samples.flatMap((s) => s.bandVisible));
  const stuck = new Map();
  let cued = 0;
  for (const s of samples) {
    for (const h of s.hidden) {
      if (shown.has(h.id)) { cued++; continue; }
      if (!stuck.has(h.id)) stuck.set(h.id, `y=${s.y} ${h.label}`);
    }
  }
  return { stuck: [...stuck.values()], cuedObservations: cued };
}

async function idleMotion(page) {
  const snap = () => page.evaluate(() => {
    const out = {};
    document.querySelectorAll('[style], [data-ma-id]').forEach((el, i) => {
      if (i > 2500) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const cs = getComputedStyle(el);
      out[el.dataset.maId || `i${i}`] = `${cs.transform}|${cs.opacity}`;
    });
    return out;
  });
  const a = await snap();
  await sleep(700);
  const b = await snap();
  return Object.keys(b).filter((k) => a[k] !== undefined && a[k] !== b[k]).length;
}

function classify(first, last) {
  const [t1, o1, c1, , , , g1 = '', d1 = ''] = first.split('|');
  const [t2, o2, c2, , , , g2 = '', d2 = ''] = last.split('|');
  const kinds = [];
  const m1 = parseMatrix(t1), m2 = parseMatrix(t2);
  // SVG geometry first: a morphing or drawing path that also fades is a morph or a draw, not a fade.
  if (g1 !== g2) kinds.push('morph');
  if (d1 !== d2) kinds.push('draw');
  if (c1 !== c2) kinds.push('clip');
  if (Math.abs(m1.s - m2.s) > 0.02) kinds.push('scale');
  if (Math.abs(m1.r - m2.r) > 2) kinds.push('rotate');
  if (Math.abs(m1.x - m2.x) > 40) kinds.push('horizontal');
  const fade = Math.abs(parseFloat(o1) - parseFloat(o2)) > 0.3;
  const smallY = Math.abs(m1.y - m2.y) > 4 && Math.abs(m1.y - m2.y) <= 120;
  if (fade && smallY && !kinds.length) return 'fade-up';
  if (fade && !kinds.length) return 'fade';
  if (Math.abs(m1.y - m2.y) > 120 && !kinds.length) return 'vertical-travel';
  // a short vertical move with no fade is usually a masked line/word rise
  return kinds.join('+') || (smallY ? 'masked-rise' : 'other');
}

function parseMatrix(t) {
  if (!t || t === 'none') return { x: 0, y: 0, s: 1, r: 0 };
  const n = (t.match(/-?[\d.e]+/g) || []).map(Number);
  if (t.startsWith('matrix3d') && n.length >= 16) {
    // column-major: translation lives in elements 12 (x) and 13 (y)
    return { x: n[12], y: n[13], s: Math.hypot(n[0], n[1]), r: (Math.atan2(n[1], n[0]) * 180) / Math.PI };
  }
  if (n.length >= 6) return { x: n[4], y: n[5], s: Math.hypot(n[0], n[1]), r: (Math.atan2(n[1], n[0]) * 180) / Math.PI };
  return { x: 0, y: 0, s: 1, r: 0 };
}

function buildHistory(samples) {
  const history = {};
  samples.forEach((s, step) => {
    for (const [id, e] of Object.entries(s.els)) (history[id] ||= []).push({ step, ...e });
  });
  return history;
}

// Every element whose signature changed, with its kind and mode. An entrance whose every change
// happened while it was off screen (fired early, like engine.reveal() at 600 px) is "early": the
// visitor never sees it move, so it counts neither as a reveal nor as variety.
function animatedElements(history) {
  const animated = [];
  for (const [id, h] of Object.entries(history)) {
    const changed = [];
    for (let i = 1; i < h.length; i++) if (h[i].sig !== h[i - 1].sig) changed.push(i);
    if (!changed.length) continue;
    let kind = classify(h[0].sig, h[h.length - 1].sig);
    if (h[0].word && (kind === 'fade' || kind === 'fade-up')) kind = 'ink-fill';
    const mode = changed.length >= 3 ? 'scrub' : 'trigger';
    const early = mode === 'trigger' && changed.every((i) => !h[i].inView && !h[i - 1].inView);
    animated.push({ id, sec: h[changed[0]].sec, mode, kind, early, firstStep: h[changed[0]].step, changes: changed.length });
  }
  return animated;
}

// Held ranges. Exact edges come from layout: a sticky box holds while its parent's content box
// passes, a GSAP pin while its .pin-spacer passes. Sampled edges lose up to a step at each end
// (measured: a true 1800 px hold reported as 1350 px), so they are the fallback, widened by half a
// step and marked approximate.
function holdRanges(samples, profile) {
  const minHold = profile.height * 0.4;
  const half = (profile.height * STEP) / 2;
  const maxY = samples.length ? samples[samples.length - 1].maxY : 0;
  const tracks = {};
  samples.forEach((s, step) => s.held.forEach((h) => (tracks[h.id] ||= []).push({ step, y: s.y, top: h.top, sec: h.sec, lay: h.lay })));
  const fromLayout = (lay, T) => (lay && T !== null && T !== undefined ? { from: lay.start - T, to: lay.end - T } : null);
  const raw = [];
  for (const list of Object.values(tracks)) {
    // 1) a sticky box (or a fixed pin) with a known top offset: one sample inside its range is enough.
    //    Inside means past its start, so a sticky that an overflow:hidden ancestor breaks (it sits at
    //    its offset only at the very start) is not counted.
    let exact = null;
    for (const e of list) {
      const r = fromLayout(e.lay, e.lay && e.lay.T);
      if (r && r.to - r.from >= minHold && e.y > r.from + 2 && e.y <= r.to + 2 && Math.abs(e.top - e.lay.T) <= 2) { exact = { section: e.sec, ...r, exact: true }; break; }
    }
    if (exact) raw.push(exact);
    // 2) the viewport top stays put across consecutive samples while the page keeps scrolling
    let run = null;
    for (let i = 1; i <= list.length; i++) {
      const cur = list[i], prev = list[i - 1];
      const held = Boolean(cur) && cur.step === prev.step + 1 && Math.abs(cur.top - prev.top) <= 2 && cur.y - prev.y > 40;
      if (held && !run) run = { sec: prev.sec, from: prev.y, T: prev.top, lay: prev.lay };
      if (held || !run) continue;
      run.to = prev.y;
      if (!exact || run.from < exact.from - 2 || run.to > exact.to + 2) {
        const r = fromLayout(run.lay, run.T);
        const hold = r && r.from <= run.from + 2 && r.to >= run.to - 2 && r.to - r.from >= minHold
          ? { ...r, exact: true } : { from: run.from - half, to: run.to + half, exact: false };
        if (hold.to - hold.from >= minHold) raw.push({ section: run.sec, ...hold });
      }
      run = null;
    }
  }
  // A pin and the sticky stage inside it report the same range: merge overlaps.
  raw.forEach((h) => { h.from = Math.max(0, Math.round(h.from)); h.to = Math.min(maxY, Math.round(h.to)); });
  raw.sort((a, b) => a.from - b.from);
  const holds = [];
  for (const h of raw) {
    const last = holds[holds.length - 1];
    if (last && h.from <= last.to) { last.to = Math.max(last.to, h.to); last.px = last.to - last.from; last.exact = last.exact && h.exact; }
    else if (h.to > h.from) holds.push({ ...h, px: h.to - h.from });
  }
  return holds;
}

// Dead zones: consecutive samples where nothing in view changed and nothing was held.
// "Alive" = something visible on screen changed since the previous sample.
function deadZones(samples, profile, history, animated, holds) {
  const aliveAt = new Set(animated.flatMap((a) => (history[a.id] || []).filter((x, i, arr) => i > 0 && x.inView && x.sig !== arr[i - 1].sig).map((x) => x.step)));
  const heldAt = new Set();
  holds.forEach((h) => samples.forEach((s, i) => { if (s.y >= h.from && s.y <= h.to) heldAt.add(i); }));
  const zones = [];
  const deadStep = new Set();
  let run = [];
  samples.forEach((s, i) => {
    const alive = aliveAt.has(i) || heldAt.has(i);
    if (!alive) run.push(i);
    if ((alive || i === samples.length - 1) && run.length) {
      const span = samples[run[run.length - 1]].y - samples[run[0]].y + profile.height * STEP;
      if (span >= profile.height * BUDGET.deadZoneViewports) {
        zones.push({ from: samples[run[0]].y, to: samples[run[run.length - 1]].y, viewports: round(span / profile.height) });
        run.forEach((k) => deadStep.add(k));
      }
      run = [];
    }
  });
  // Per section (the one under the middle of the screen): the share of its samples inside a dead stretch.
  const bySection = {};
  samples.forEach((s, i) => {
    const z = (bySection[s.mid || 'body'] ||= { samples: 0, dead: 0 });
    z.samples++;
    if (deadStep.has(i)) z.dead++;
  });
  return { zones, bySection };
}

function analyse(samples, profile) {
  const history = buildHistory(samples);
  const animated = animatedElements(history);
  const seen = animated.filter((a) => !a.early);
  const holds = holdRanges(samples, profile);
  // Theme timeline from rendered edge pixels; ignore drift smaller than a visible change.
  const themes = [];
  samples.forEach((s) => {
    const last = themes[themes.length - 1];
    if (!last || (s.bg !== last.bg && (s.bg === 'media' || last.bg === 'media' || colourDistance(s.bg, last.bg) > 40))) themes.push({ y: s.y, bg: s.bg });
  });
  const dead = deadZones(samples, profile, history, animated, holds);
  const triggers = seen.filter((a) => a.mode === 'trigger');
  const kinds = {};
  seen.forEach((a) => { kinds[a.kind] = (kinds[a.kind] || 0) + 1; });
  const fadeUpShare = triggers.length ? triggers.filter((a) => a.kind === 'fade-up' || a.kind === 'fade').length / triggers.length : 0;
  const sectionMap = {};
  const entry = (sec) => (sectionMap[sec] ||= { scrub: 0, trigger: 0, fades: 0, early: 0, kinds: {} });
  animated.forEach((a) => {
    const m = entry(a.sec);
    if (a.early) { m.early++; return; }
    m[a.mode]++;
    m.kinds[a.kind] = (m.kinds[a.kind] || 0) + 1;
    if (a.mode === 'trigger' && (a.kind === 'fade' || a.kind === 'fade-up')) m.fades++; // scrubbed fades are not reveals
  });
  for (const [sec, z] of Object.entries(dead.bySection)) entry(sec).deadShare = round(z.dead / z.samples, 2);
  const pageHeight = samples.length ? samples[samples.length - 1].maxY + profile.height : 0;
  const heldPx = holds.reduce((s, h) => s + h.px, 0);
  // Page averages hide boring zones (measured: a page at fade share 0.63 passed while its FAQ was
  // 16 of 16 plain fades). A zone with 6+ reveals that are 80%+ plain fades is monotone.
  const monotoneZones = Object.entries(sectionMap)
    .map(([sec, m]) => ({ sec, trigger: m.trigger, fades: m.fades }))
    .filter((z) => z.trigger >= 6 && z.fades / z.trigger >= 0.8)
    .map((z) => `${z.sec} (${z.fades}/${z.trigger} fades)`);
  for (const m of Object.values(sectionMap)) m.fadeShare = m.trigger ? round(m.fades / m.trigger, 2) : 0;
  // Peaks: moments that stop the visitor. Held scenes, plus sections driven by 3+ scrubbed elements outside any hold.
  const scrubSections = Object.entries(sectionMap).filter(([sec, m]) => m.scrub >= 3 && !holds.some((h) => h.section === sec)).length;
  const scrubbed = seen.filter((a) => a.mode === 'scrub').length;
  return {
    animatedElements: seen.length,
    earlyEntrances: animated.length - seen.length,
    scrubbed,
    triggered: triggers.length,
    scrubRatio: seen.length ? round(scrubbed / seen.length, 2) : 0,
    peaks: holds.length + scrubSections,
    kinds, fadeUpShare: round(fadeUpShare, 2), distinctKinds: Object.keys(kinds).length,
    monotoneZones,
    holds, heldShare: pageHeight ? round(heldPx / pageHeight, 2) : 0, holdsApproximate: holds.some((h) => !h.exact),
    themes: themes.length > 1 ? themes : [], themeSwitches: Math.max(0, themes.length - 1),
    deadZones: dead.zones, deadZoneViewports: BUDGET.deadZoneViewports, sectionMap, pageHeight,
  };
}

// Under reduced motion nothing should move on scroll. An element outside aria-hidden whose
// transform, clip-path or SVG geometry changed between samples fails (AOS and whileInView entrances
// that ignore the preference). Opacity-only changes (theme layers, instant state swaps) and
// aria-hidden decoration are notes: the step sampler cannot tell an instant swap from an animation.
function reducedScrollMotion(samples) {
  const moving = {}, notes = {};
  for (const h of Object.values(buildHistory(samples))) {
    let changed = false, moved = false;
    for (let i = 1; i < h.length; i++) {
      if (h[i].sig === h[i - 1].sig) continue;
      changed = true;
      const a = h[i - 1].sig.split('|'), b = h[i].sig.split('|');
      if (a.some((v, k) => k !== 1 && v !== b[k])) moved = true;
    }
    if (!changed) continue;
    const label = `${h[0].lb}${h[0].sec && h[0].sec !== 'body' ? ` in ${h[0].sec}` : ''}`;
    const fails = moved && !h.some((x) => x.ah) && !h[0].pg;
    const bucket = fails ? moving : notes;
    const key = fails ? label : `${label} (${moved ? 'aria-hidden' : 'opacity only'})`;
    bucket[key] = (bucket[key] || 0) + 1;
  }
  const list = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, n]) => (n > 1 ? `${k} ×${n}` : k));
  return { moving: list(moving), movingCount: Object.values(moving).reduce((s, n) => s + n, 0), notes: list(notes) };
}

// One human-speed scroll to the end. Stops early when scrollY has not moved for STUCK_MS: a scroll
// lock, not a slow page (three short attempts would trip on a snap section mid-transition).
async function smoothRun(browser, profile, name) {
  const { page, cdp, errors, load } = await openPage(browser, profile, false);
  const t0 = await page.evaluate(() => { window.__maFrames = []; window.__ma.ys = []; return performance.now(); });
  const maxY = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const started = Date.now();
  let y = await page.evaluate(() => scrollY), lastMove = Date.now(), stuck = false, timedOut = false;
  while (y < maxY - 4) {
    if (Date.now() - started > SMOOTH_CAP_MS) { timedOut = true; break; }
    await scrollBy(page, cdp, profile, profile.isMobile ? 240 : 110);
    await sleep(profile.isMobile ? 110 : 50);
    const ny = await page.evaluate(() => scrollY);
    if (Math.abs(ny - y) >= 2) lastMove = Date.now();
    else if (Date.now() - lastMove > STUCK_MS) { stuck = true; break; }
    y = ny;
  }
  if (stuck) console.warn(stuckMessage(`${name}, smoothness`, y, maxY));
  await sleep(800);
  const r = await page.evaluate(attribute, t0);
  await page.close();
  const f = r.frames.filter((d) => d > 0 && d < 1000);
  return {
    scrolledPx: Math.round(y), maxY: r.maxY, stuck, timedOut, seconds: round((Date.now() - started) / 1000),
    frames: f.length,
    p50FrameMs: round(pct(f, 50)), p95FrameMs: round(pct(f, 95)), p99FrameMs: round(pct(f, 99)),
    jankPct: f.length ? round((100 * f.filter((d) => d > 33.4).length) / f.length) : 0,
    longTaskMs: Math.round(r.longTasks.reduce((s, t) => s + t.d, 0)),
    longestTaskMs: Math.round(Math.max(0, ...r.longTasks.map((t) => t.d))),
    loafBlockingMs: Math.round(r.loaf.reduce((s, l) => s + (l.b || 0), 0)),
    cls: clsWindows(r.shifts),
    ...longTaskPlaces(r),
    errors, load,
  };
}

// In the page after the smoothness scroll: frames, and each long task / long frame tagged with the
// scrollY at its start (from the rAF timeline) and the section under the middle of the screen there.
const attribute = (start) => {
  const frames = window.__maFrames || [];
  window.__maFrames = null;
  const ys = window.__ma.ys;
  const yAt = (t) => {
    if (!ys.length) return Math.round(scrollY);
    let lo = 0, hi = ys.length / 2 - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (ys[m * 2] <= t) lo = m; else hi = m - 1; }
    return ys[lo * 2 + 1];
  };
  const key = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : ''}`;
  // Section boxes in document coordinates. A sticky or pinned section occupies its parent's range.
  const secs = [];
  document.querySelectorAll('section,footer,header,main > *,[data-section]').forEach((el) => {
    const cs = getComputedStyle(el);
    const p = el.parentElement;
    const pinned = p && p.classList.contains('pin-spacer');
    if (cs.display === 'none' || (cs.position === 'fixed' && !pinned)) return;
    const box = (pinned || cs.position === 'sticky') && p ? p : el;
    const b = box.getBoundingClientRect();
    if (b.height >= 40) secs.push({ k: key(el), top: b.top + scrollY, bottom: b.bottom + scrollY });
  });
  const secAt = (y) => {
    const mid = y + innerHeight / 2;
    let best = null;
    for (const s of secs) if (mid >= s.top && mid < s.bottom && (!best || s.bottom - s.top < best.bottom - best.top)) best = s;
    return best ? best.k : 'body';
  };
  const tag = (e) => { const y = yAt(e.t); return { ...e, y, sec: secAt(y) }; };
  return {
    frames,
    longTasks: window.__ma.longTasks.filter((t) => t.t >= start).map(tag),
    shifts: window.__ma.shifts.filter((s) => s.t >= start),
    loaf: window.__ma.loaf.filter((l) => l.t >= start).map(tag),
    maxY: document.documentElement.scrollHeight - innerHeight,
  };
};

// Where the long tasks happened: the five longest with their place, totals per section, and the
// scripts that the long-animation-frame API blames most.
function longTaskPlaces(r) {
  const bySec = {};
  r.longTasks.forEach((t) => { bySec[t.sec] = (bySec[t.sec] || 0) + t.d; });
  const scripts = {};
  r.loaf.forEach((l) => (l.s || []).forEach((s) => {
    const file = (s.u.split(/[?#]/)[0].split('/').pop() || '(inline)').slice(0, 60);
    const k = `${file}${s.f ? ` ${s.f.slice(0, 40)}` : ''} [${s.i.slice(0, 50)}]`;
    scripts[k] = (scripts[k] || 0) + s.d;
  }));
  return {
    topLongTasks: [...r.longTasks].sort((a, b) => b.d - a.d).slice(0, 5).map((t) => ({ ms: Math.round(t.d), y: t.y, sec: t.sec })),
    longTasksBySection: Object.entries(bySec).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([sec, ms]) => ({ sec, ms: Math.round(ms) })),
    longFrameScripts: Object.entries(scripts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([script, ms]) => ({ script, ms: Math.round(ms) })),
  };
}

const nearBudget = (run, name) => Object.entries(NEAR).some(([k, [lo, hi]]) => {
  const t = tier(name);
  const budget = k === 'longTaskMs' ? BUDGET.longTaskMsDuringScroll[t] : k === 'p95FrameMs' ? BUDGET.p95FrameMs[t] : BUDGET.jankPct[t];
  return run[k] >= budget * lo && run[k] <= budget * hi;
});

// Timing checks are judged on the median run; the attribution comes from the run whose long-task
// total is the median. CLS takes the worst run: a shift that happened is real.
async function smoothness(browser, profile, name) {
  const runs = [await smoothRun(browser, profile, name)];
  const want = RUNS ?? (nearBudget(runs[0], name) ? 3 : 1);
  if (want > 1 && RUNS === null) console.warn(`[${name}] first smoothness run is near a timing budget: ${want - 1} more runs, judged on the median`);
  while (runs.length < want && !runs[0].stuck) runs.push(await smoothRun(browser, profile, name));
  const rep = [...runs].sort((a, b) => a.longTaskMs - b.longTaskMs)[Math.floor((runs.length - 1) / 2)];
  const worstCls = runs.reduce((w, r) => (r.cls.worst > w.cls.worst ? r : w), runs[0]).cls;
  const med = (k) => round(median(runs.map((r) => r[k])));
  const range = (k) => [Math.min(...runs.map((r) => r[k])), Math.max(...runs.map((r) => r[k]))];
  return {
    ...rep,
    p50FrameMs: med('p50FrameMs'), p95FrameMs: med('p95FrameMs'), p99FrameMs: med('p99FrameMs'),
    jankPct: med('jankPct'), longTaskMs: Math.round(med('longTaskMs')), loafBlockingMs: Math.round(med('loafBlockingMs')),
    cls: worstCls,
    stuck: runs.some((r) => r.stuck), timedOut: runs.some((r) => r.timedOut),
    range: { p95FrameMs: range('p95FrameMs'), jankPct: range('jankPct'), longTaskMs: range('longTaskMs') },
    runs: runs.map((r) => ({ p95FrameMs: r.p95FrameMs, jankPct: r.jankPct, longTaskMs: r.longTaskMs, longestTaskMs: r.longestTaskMs, cls: r.cls.worst, scrolledPx: r.scrolledPx, seconds: r.seconds })),
  };
}

async function steppedPass(browser, profile, name, reduced) {
  const { page, cdp, errors, load } = await openPage(browser, profile, reduced);
  const idle = await idleMotion(page);
  const samples = [];
  const stepPx = Math.round(profile.height * (reduced ? 1 : STEP));
  const tag = `${name}${reduced ? ', reduced motion' : ''}`;
  let stuck = false, reachedEnd = false;
  for (let i = 0; i < MAX_STEPS; i++) {
    const y = await stillScroll(page);
    await sleep(SETTLE);
    const sample = await page.evaluate(SAMPLE);
    sample.bg = await renderedBackground(page, profile);
    samples.push(sample);
    const maxY = sample.maxY;
    if (y >= maxY - 2) { reachedEnd = true; break; }
    if (i > 3 && samples.slice(-4).every((s) => Math.abs(s.y - y) < 2)) {
      stuck = true;
      console.warn(stuckMessage(tag, y, maxY));
      break;
    }
    await scrollBy(page, cdp, profile, Math.min(stepPx, maxY - y));
  }
  const last = samples[samples.length - 1] || { y: 0, maxY: 0 };
  const capped = !reachedEnd && !stuck;
  if (capped) console.warn(`[${tag}] stopped at --max-steps ${MAX_STEPS} at y=${last.y} of ${last.maxY}: the rest of the page was not sampled`);
  await page.close();
  return { samples, errors, idle, load, stuck, capped, lastY: last.y, maxY: last.maxY };
}

function verdicts(name, { motion, smooth, rm, base }) {
  const v = [];
  const add = (ok, label, detail, extra = {}) => v.push({ ok, label, detail, ...extra });
  const NOT_MEASURED = 'not measured: the page did not scroll';
  const L = (base || smooth || rm).load || {};
  add(!L.navError && L.text > 80, 'page actually loaded and rendered text', L.navError ? `navigation failed: ${L.navError}` : `${L.text} chars of text, ${L.height}px tall`);
  const errs = base ? base.errors : smooth ? smooth.errors : null;
  if (errs) add(errs.length === 0, 'no page errors', errs.slice(0, 5).join(' || ') || '0');
  // A page that will not scroll measures one screen and "passes" the rest: say so first.
  const parts = [];
  if (base) parts.push(`map ${base.lastY}/${base.maxY}px${base.stuck ? ' (stuck)' : base.capped ? ` (stopped at --max-steps ${MAX_STEPS})` : ''}`);
  if (smooth) parts.push(`smoothness ${smooth.scrolledPx}/${smooth.maxY}px${smooth.stuck ? ' (stuck)' : smooth.timedOut ? ` (time cap ${SMOOTH_CAP_MS / 1000}s, not a failure)` : ''}`);
  if (rm) parts.push(`reduced ${rm.lastY}/${rm.maxY}px${rm.stuck ? ' (stuck)' : rm.capped ? ' (stopped at --max-steps)' : ''}`);
  add(!(base && (base.stuck || base.capped)) && !(smooth && smooth.stuck) && !(rm && (rm.stuck || rm.capped)), 'page scrolled to the end', parts.join(' · '));
  if (base) mapVerdicts(add, motion, base, NOT_MEASURED);
  if (smooth) smoothVerdicts(add, name, smooth, NOT_MEASURED);
  if (rm) reducedVerdicts(add, rm, base, NOT_MEASURED);
  return v;
}

function mapVerdicts(add, motion, base, NM) {
  const hid = hiddenReport(base.samples);
  if (base.stuck) add(false, 'no content stuck invisible mid-screen', `${NM}${hid.stuck.length ? ` · first screen: ${hid.stuck.slice(0, 3).join(' | ')}` : ''}`);
  else add(!hid.stuck.length, 'no content stuck invisible mid-screen', hid.stuck.slice(0, 5).join(' | ') || `none (${hid.cuedObservations} cued-later observations)`);
  const overflow = Math.max(0, ...base.samples.map((s) => s.overflowX));
  add(overflow <= 1, 'no horizontal overflow', `${overflow}px`);
  const m = motion;
  const early = m.earlyEntrances ? ` · ${m.earlyEntrances} early entrances not counted` : '';
  if (base.stuck) {
    ['reveals are not a monotone fade-up', 'has at least one memorable moment (held scene or scrub-driven section)', 'no monotone zone (6+ reveals, 80%+ plain fades)', `no dead zone ≥ ${BUDGET.deadZoneViewports} viewports`].forEach((l) => add(false, l, NM));
    return;
  }
  add(!(m.fadeUpShare > BUDGET.fadeUpShareMax && m.distinctKinds < 3), 'reveals are not a monotone fade-up', `fade share ${m.fadeUpShare}, ${m.distinctKinds} motion kinds${early}`);
  add(m.peaks > 0, 'has at least one memorable moment (held scene or scrub-driven section)', `${m.peaks} peaks: ${m.holds.length} held scenes, scrub ratio ${m.scrubRatio}`);
  add(!m.monotoneZones.length, 'no monotone zone (6+ reveals, 80%+ plain fades)', (m.monotoneZones.join(', ') || 'none') + early);
  add(!m.deadZones.length, `no dead zone ≥ ${BUDGET.deadZoneViewports} viewports`, m.deadZones.map((d) => `${d.from}-${d.to} (${d.viewports}vh)`).join(', ') || 'none');
}

function smoothVerdicts(add, name, s, NM) {
  const runs = s.runs.length;
  const of = (k, unit) => (runs > 1 ? ` · median of ${runs} runs, range ${s.range[k][0]}-${s.range[k][1]}${unit}` : '');
  // Timing checks: FAIL when the median is over budget, WARN when the median is within it but a run was over.
  const timing = (k, budget, label, detail, unit) => {
    if (s.stuck) return add(false, label, NM, { timing: true });
    const ok = s[k] <= budget;
    add(ok, label, detail + of(k, unit), { timing: true, warn: ok && s.range[k][1] > budget });
  };
  const t = tier(name);
  timing('p95FrameMs', BUDGET.p95FrameMs[t], `p95 frame ≤ ${BUDGET.p95FrameMs[t]}ms while scrolling (timing)`, `${s.p95FrameMs}ms (p50 ${s.p50FrameMs})`, 'ms');
  timing('jankPct', BUDGET.jankPct[t], `janky frames ≤ ${BUDGET.jankPct[t]}% (timing)`, `${s.jankPct}%`, '%');
  const clsLabel = `CLS during scroll ≤ ${BUDGET.clsDuringScroll} (worst session window)`;
  const floor = BUDGET.clsDuringScroll === 0.1 ? ' · 0.1 is the built-in smoke floor; the brief\'s budget is --budget-cls 0.05' : '';
  if (s.stuck) add(false, clsLabel, NM);
  else add(s.cls.worst <= BUDGET.clsDuringScroll, clsLabel, `${s.cls.worst} (sum ${s.cls.total}) · top sources: ${s.cls.top.join(', ') || 'none'}${floor}`);
  const places = s.topLongTasks.map((t) => `${t.ms}ms at y=${t.y} (${t.sec})`).join(', ');
  timing('longTaskMs', BUDGET.longTaskMsDuringScroll[t], `long tasks during scroll ≤ ${BUDGET.longTaskMsDuringScroll[t]}ms (timing)`,
    `${s.longTaskMs}ms (longest ${s.longestTaskMs}ms)${places ? ` · longest: ${places}` : ''}`, 'ms');
}

function reducedVerdicts(add, rm, base, NM) {
  // Under reduced motion nothing should wait for a cue: every hidden observation counts.
  const rmHidden = rm.samples.flatMap((s) => s.hidden.map((h) => `y=${s.y} ${h.label}`));
  if (rm.stuck && !rmHidden.length) add(false, 'reduced motion: all content visible', NM);
  else add(!rmHidden.length, 'reduced motion: all content visible', rmHidden.slice(0, 4).join(' | ') || 'none');
  add(rm.idle <= 2, 'reduced motion: nothing moves on its own', `${rm.idle} elements moving while idle${base ? ` (normal mode: ${base.idle})` : ''}`);
  const sm = rm.scrollMotion;
  if (rm.stuck) add(false, 'reduced motion: nothing animates on scroll', NM);
  else add(!sm.movingCount, 'reduced motion: nothing animates on scroll', `${sm.movingCount ? `${sm.movingCount} moving: ${sm.moving.slice(0, 5).join(', ')}` : 'none'}${sm.notes.length ? ` · not counted: ${sm.notes.slice(0, 3).join(', ')}` : ''}`);
  add(rm.errors.length === 0, 'reduced motion: no page errors', rm.errors.slice(0, 3).join(' || ') || '0');
}

const status = (x) => (!x.ok ? 'FAIL' : x.warn ? 'WARN' : 'PASS');

function markdown(report) {
  const o = report.options;
  const lines = [`# motion-audit: ${report.url}`, '',
    `Passes: ${o.only.join(', ')} · dead zone ≥ ${o.deadVp} vp · CLS budget ${o.budgetCls}${o.only.includes('smoothness') ? ` · smoothness runs ${o.runs ?? 'auto (1, or 3 near a budget)'} · timing checks ${o.strict ? 'set' : 'do not set'} the exit code` : ''}`, ''];
  for (const vp of report.viewports) {
    const m = vp.motion, s = vp.smoothness;
    lines.push(`## ${vp.name} (${vp.profile.width}×${vp.profile.height})`, '');
    if (m) lines.push(`Page ${m.pageHeight}px · peaks ${m.peaks} · held (pinned/sticky) ${Math.round(m.heldShare * 100)}%${m.holdsApproximate ? ' (some hold edges ± half a step)' : ''} · theme switches ${m.themeSwitches} · animated elements ${m.animatedElements} (scrub ${m.scrubbed}, trigger ${m.triggered}, scrub ratio ${m.scrubRatio}) · early entrances ${m.earlyEntrances} · idle-moving ${vp.idleMotion}`, '');
    if (s) lines.push(`Smoothness (${s.runs.length} run${s.runs.length > 1 ? 's, median' : ''}): ${s.scrolledPx}px in ${s.seconds}s · p95 ${s.p95FrameMs}ms · jank ${s.jankPct}% · long tasks ${s.longTaskMs}ms · long-frame blocking ${s.loafBlockingMs}ms${s.runs.length > 1 ? ` · per run: ${s.runs.map((r) => `p95 ${r.p95FrameMs}ms, long tasks ${r.longTaskMs}ms`).join(' / ')}` : ''}`, '');
    lines.push('| ok | check | detail |', '|---|---|---|');
    for (const v of vp.verdicts) lines.push(`| ${status(v)} | ${v.label} | ${String(v.detail).replace(/\|/g, '/')} |`);
    if (m) {
      lines.push('', '**Holds**: ' + (m.holds.map((h) => `${h.section} ${h.exact ? '' : '≈'}${h.from}→${h.to} (${h.px}px${h.exact ? '' : ', edges ± half a step'})`).join(' · ') || 'none'));
      lines.push('', '**Motion kinds** (seen): ' + (Object.entries(m.kinds).map(([k, n]) => `${k}×${n}`).join(', ') || 'none'));
      if (m.deadZones.length) lines.push('', `**Dead stretches** (≥ ${m.deadZoneViewports} vp): ` + m.deadZones.map((d) => `${d.from}→${d.to} (${d.viewports} vp)`).join(' · '));
      lines.push('', '**Per section** (scrub/trigger · fade share · kinds · early entrances · dead share):');
      for (const [sec, x] of Object.entries(m.sectionMap)) lines.push(`- ${sec}: ${x.scrub}/${x.trigger} · fade share ${x.fadeShare} · ${Object.entries(x.kinds).map(([k, n]) => `${k}×${n}`).join(', ') || 'no seen motion'}${x.early ? ` · early ${x.early}` : ''}${x.deadShare !== undefined ? ` · dead ${x.deadShare}` : ''}`);
      if (m.themes.length) lines.push('', '**Theme timeline**: ' + m.themes.map((t) => `${t.y}: ${t.bg}`).join(' → '));
    }
    if (s) {
      lines.push('', '**Long tasks by section**' + (s.runs.length > 1 ? ' (median run)' : '') + ': ' + (s.longTasksBySection.map((x) => `${x.sec} ${x.ms}ms`).join(' · ') || 'none'));
      lines.push('', '**Longest tasks**: ' + (s.topLongTasks.map((t) => `${t.ms}ms at y=${t.y} (${t.sec})`).join(' · ') || 'none'));
      lines.push('', '**Long-frame scripts**: ' + (s.longFrameScripts.map((x) => `${x.script} ${x.ms}ms`).join(' · ') || 'none'));
    }
    if (vp.reducedMotion && vp.reducedMotion.scrollMotion.notes.length) lines.push('', '**Reduced motion, changes not counted**: ' + vp.reducedMotion.scrollMotion.notes.slice(0, 10).join(', '));
    lines.push('');
  }
  return lines.join('\n');
}

const puppeteer = loadPuppeteer();
const browser = await puppeteer.launch({ headless: true, args: ['--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling'] });
const report = {
  url: URL_ARG,
  options: { only: PASSES.filter((p) => ONLY.has(p)), runs: RUNS, strict: STRICT, deadVp: DEAD_VP, budgetCls: BUDGET_CLS, step: STEP, settle: SETTLE, intro: INTRO_MS, throttle: MOBILE_THROTTLE, maxSteps: MAX_STEPS },
  viewports: [],
};
let gatingFailures = 0;
try {
  await mkdir(OUT, { recursive: true });
  for (const name of VIEWPORTS) {
    const profile = PROFILES[name];
    const base = ONLY.has('map') ? await steppedPass(browser, profile, name, false) : null;
    const motion = base ? analyse(base.samples, profile) : null;
    const smooth = ONLY.has('smoothness') ? await smoothness(browser, profile, name) : null;
    const rm = ONLY.has('reduced') ? await steppedPass(browser, profile, name, true) : null;
    if (rm) rm.scrollMotion = reducedScrollMotion(rm.samples);
    const v = verdicts(name, { motion, smooth, rm, base });
    const { errors: _e, load: _l, ...smoothReport } = smooth || {};
    report.viewports.push({
      name, profile, motion, smoothness: smooth ? smoothReport : null, idleMotion: base ? base.idle : null,
      reducedMotion: rm ? { idle: rm.idle, hiddenSteps: rm.samples.filter((s) => s.hidden.length).length, scrollMotion: rm.scrollMotion, errors: rm.errors } : null,
      verdicts: v,
    });
    const failing = v.filter((x) => !x.ok);
    const gating = failing.filter((x) => STRICT || !x.timing);
    gatingFailures += gating.length;
    const timingOnly = failing.length - gating.length;
    const warns = v.filter((x) => x.ok && x.warn).length;
    console.log(`[${name}] ${v.length - failing.length}/${v.length} checks pass${timingOnly ? ` · ${timingOnly} timing check${timingOnly > 1 ? 's' : ''} fail (timing sets the exit code only with --strict)` : ''}${warns ? ` · ${warns} WARN (median within budget, a run over it)` : ''}`);
  }
  await writeFile(join(OUT, 'motion-audit.json'), JSON.stringify(report, null, 2));
  await writeFile(join(OUT, 'motion-audit.md'), markdown(report));
  console.log(`report -> ${join(OUT, 'motion-audit.md')}`);
} finally {
  await browser.close();
}
process.exitCode = gatingFailures ? 1 : 0;
