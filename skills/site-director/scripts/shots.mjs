#!/usr/bin/env node
// shots: the site-director screenshot matrix. Every route at 1440x900, 1440x700 and 390x844, with
// motion forced on and with reduced motion, at fixed scroll fractions, plus a contact sheet and an
// optional accent audit. Node 20+; needs puppeteer resolvable from the project (cwd) or NODE_PATH.
// Exit 0 = every page loaded and every shot taken, 1 = a page or shot failed, 2 = usage error or
// puppeteer missing.

import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, statfsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import os from 'node:os';

const HELP = `shots: the screenshot matrix (1440x900, 1440x700, 390x844) x (motion, reduced) x scroll steps.

  node shots.mjs <url> [--out design/shots] [--paths /,/about] [--steps 0,0.25,0.5,0.75,1]
                       [--viewports desktop,short,mobile] [--passes motion,reduced]
                       [--settle 900] [--intro 1500] [--timeout 60000]
                       [--session key=value]... [--accent "#hex"]

viewports  desktop = 1440x900, short = 1440x700 (DPR 1); mobile = 390x844, isMobile, hasTouch, DPR 2
passes     motion  = prefers-reduced-motion emulated as no-preference (headless Chrome defaults to
                     reduce, so without this every lab shot shows the reduced branch)
           reduced = prefers-reduced-motion: reduce (strict policy: each moment's last frame)
--steps    scroll positions as fractions of the scroll range. Desktop scrolls with real wheel ticks so
           Lenis and ScrollTrigger fire; mobile with finger strokes (touch events, native touch
           scrolling), falling back to a native scroll when a stroke moves nothing. shots.json and
           the console name the scroll mode per run (wheel, touch, touch+scrollTo, scrollTo, mixed).
           Each shot waits until the scroll position is still, then --settle ms and two frames.
           Shots use captureBeyondViewport:false (true resizes the viewport, re-runs ScrollTrigger
           refresh and makes pinned pages jump).
--paths    routes, comma separated, resolved against <url> (full URLs also work). Default: <url>
           itself, with its path ("shots.mjs http://host/order.html" shoots that page). A route
           that starts with "/" is resolved from the origin; "./about" from <url>'s folder. In Git
           Bash prefix the command with MSYS_NO_PATHCONV=1, or "/" arrives as a Windows path
--session  sets sessionStorage before any page script runs, on every load; repeat the flag for more
           keys. Use it to suppress once-per-visit popups and intros (for example
           --session leadModalClosed=true).
--accent   also writes accent.json: per route and viewport, every visible element whose computed
           color (own text only), background-color, gradient colour, box-shadow colour, border
           color, outline-color, text-decoration-color, SVG fill or stroke equals the accent within
           2 per RGB channel, on the element itself or on its ::before / ::after (reported as
           "::before background-color" and so on), with selector, text snippet, page rect and the
           steps where it was seen. Colours in oklch(), lab() or color() are converted to sRGB
           first. Read it against the accent decision: every hit must carry the accent's meaning.
--intro    wait after load (fonts ready) before the first shot, for entrance motion to finish
--timeout  navigation timeout in ms

Output in --out: <route>/<viewport>-<pass>-p<percent>.png, index.html (contact sheet),
shots.json (what was taken, scroll mode, page errors) and accent.json with --accent.
On Windows set TEMP and TMP to a roomy drive first; every Chrome profile is about 40 MB.
Exit code: 0 all shots taken, 1 a page failed to load or a shot failed, 2 usage error or no puppeteer.`;

const VIEWPORTS = {
  desktop: { label: 'desktop-1440x900', width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  short: { label: 'short-1440x700', width: 1440, height: 700, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  mobile: { label: 'mobile-390x844', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const PASSES = { motion: 'no-preference', reduced: 'reduce' };
const TOLERANCE = 2; // per RGB channel: absorbs rounding from colour-space conversion and 8-bit output
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- arguments ----------

function parseArgs(argv) {
  const opts = {
    url: null, out: 'design/shots', paths: null, steps: [0, 0.25, 0.5, 0.75, 1],
    viewports: Object.keys(VIEWPORTS), passes: Object.keys(PASSES), settle: 900, intro: 1500,
    timeout: 60000, session: [], accent: null,
  };
  const valueFlags = new Set(['--out', '--paths', '--steps', '--viewports', '--passes', '--settle', '--intro', '--timeout', '--session', '--accent']);
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--help' || a === '-h') return { help: true };
    if (valueFlags.has(a)) {
      const v = argv[i + 1];
      if (v === undefined) return { error: `${a} needs a value` };
      const err = applyFlag(opts, a, v);
      if (err) return { error: err };
      i += 1;
    } else if (a.startsWith('--')) return { error: `unknown option ${a}` };
    else if (!opts.url) opts.url = a;
    else return { error: `unexpected argument ${a}` };
  }
  if (!opts.url) return { error: 'missing <url>' };
  try {
    opts.url = new URL(opts.url).href;
  } catch {
    return { error: `not a URL: ${opts.url}` };
  }
  if (!/^https?:$/.test(new URL(opts.url).protocol)) return { error: `only http and https URLs: ${opts.url}` };
  // Git Bash rewrites an argument that starts with "/" into a Windows path (MSYS path conversion).
  const mangled = (opts.paths || []).find((p) => /^[A-Za-z]:[\\/]/.test(p));
  if (mangled) {
    return { error: `route "${mangled}" looks like a Windows path: Git Bash rewrote the leading "/". Run with MSYS_NO_PATHCONV=1, or write routes without it (./ and ./about).` };
  }
  return opts;
}

function applyFlag(opts, flag, v) {
  const list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
  const num = (s) => (Number.isFinite(Number(s)) && Number(s) >= 0 ? Number(s) : null);
  switch (flag) {
    case '--out': opts.out = v; return null;
    case '--paths': opts.paths = list(v); return opts.paths.length ? null : '--paths is empty';
    case '--steps': {
      const steps = list(v).map(Number);
      if (!steps.length || steps.some((s) => !Number.isFinite(s) || s < 0 || s > 1)) return '--steps needs fractions between 0 and 1';
      opts.steps = steps;
      return null;
    }
    case '--viewports': opts.viewports = list(v); return pickOnly(opts.viewports, VIEWPORTS, '--viewports');
    case '--passes': opts.passes = list(v); return pickOnly(opts.passes, PASSES, '--passes');
    case '--settle': case '--intro': case '--timeout': {
      const n = num(v);
      if (n === null) return `${flag} needs a number of milliseconds`;
      opts[flag.slice(2)] = n;
      return null;
    }
    case '--session': {
      const at = v.indexOf('=');
      if (at < 1) return '--session needs key=value';
      opts.session.push([v.slice(0, at), v.slice(at + 1)]);
      return null;
    }
    case '--accent': {
      const m = v.trim().match(/^#?([0-9a-f]{6}|[0-9a-f]{3})$/i);
      if (!m) return '--accent needs a hex colour like "#002fa7"';
      const hex = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
      opts.accent = { hex: `#${hex.toLowerCase()}`, rgb: [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) };
      return null;
    }
    default: return `unknown option ${flag}`;
  }
}

function pickOnly(values, table, flag) {
  const bad = values.filter((v) => !(v in table));
  if (!values.length) return `${flag} is empty`;
  return bad.length ? `${flag}: unknown ${bad.join(', ')} (valid: ${Object.keys(table).join(', ')})` : null;
}

// ---------- environment ----------

function loadPuppeteer() {
  const req = createRequire(join(process.cwd(), 'noop.js'));
  let id;
  try {
    id = req.resolve('puppeteer');
  } catch {
    console.error(`puppeteer not found from ${process.cwd()} (or NODE_PATH).\nInstall it in the project: npm i -D puppeteer`);
    process.exit(2);
  }
  const mod = req(id);
  return typeof mod.launch === 'function' ? mod : mod.default;
}

function warnLowTemp() {
  try {
    const st = statfsSync(os.tmpdir());
    const freeGb = (Number(st.bavail) * Number(st.bsize)) / 1e9;
    if (freeGb < 3) {
      console.warn(`warning: ${freeGb.toFixed(1)} GB free in ${os.tmpdir()}. Set TEMP and TMP to a roomier drive before running (for example G:/tmp/temp).`);
    }
  } catch {
    // statfs is unavailable on some file systems; the check is advisory only
  }
}

function slugFor(path) {
  const clean = path.replace(/^https?:\/\/[^/]+/i, '').replace(/[?#].*$/, '');
  const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return slug || 'home';
}

const pct = (f) => `p${String(Math.round(f * 100)).padStart(3, '0')}`;

// ---------- scrolling ----------

async function scrollY(page) {
  return page.evaluate(() => Math.round(window.scrollY));
}

async function waitStill(page, maxMs = 4000) {
  let last = -1;
  let still = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const y = await scrollY(page);
    still = y === last ? still + 100 : 0;
    if (still >= 300) return y;
    last = y;
    await sleep(100);
  }
  return last;
}

async function snapTo(page, target, mode) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), target);
  await waitStill(page);
  return mode;
}

// Desktop: wheel ticks, the input smooth-scroll libraries listen to. Several rounds, because Lenis
// eases toward its target and may stop a few pixels short; native scroll as a last resort.
// Returns 'none' when the page already sits at the target (nothing was scrolled).
async function wheelTo(page, vp, target) {
  if (Math.abs(target - (await scrollY(page))) <= 2) return 'none';
  await page.mouse.move(Math.round(vp.width / 2), Math.round(vp.height / 2));
  let mode = 'wheel';
  for (let round = 0; round < 5; round += 1) {
    const before = await scrollY(page);
    let left = target - before;
    if (Math.abs(left) <= 2) break;
    while (left !== 0) {
      const tick = Math.max(-120, Math.min(120, left));
      await page.mouse.wheel({ deltaY: tick });
      left -= tick;
      await sleep(16);
    }
    const after = await waitStill(page);
    if (Math.abs(after - before) <= 2) {
      mode = 'scrollTo';
      await snapTo(page, target, mode);
      break;
    }
  }
  return mode;
}

// Mobile: finger strokes through page.touchscreen (real touch events and native touch scrolling,
// as on a phone). CDP's Input.synthesizeScrollGesture was dropped: in puppeteer 24.37 it resolves
// without moving the page. Chrome keeps about 15 px of every stroke as touch slop, so each stroke
// adds it back; the finger rests 120 ms before lifting, so no fling carries the page past the
// target. Returns 'touch' (strokes reached the target), 'touch+scrollTo' (strokes moved the page and
// a native scroll did the last pixels), 'scrollTo' (strokes moved nothing: an older puppeteer, or a
// page that blocks touch) or 'none' (already there).
const TOUCH_SLOP = 15;

async function touchTo(page, vp, target) {
  if (Math.abs(target - (await scrollY(page))) <= 2) return 'none';
  const ts = page.touchscreen;
  if (!ts || typeof ts.touchStart !== 'function' || typeof ts.touchEnd !== 'function') return snapTo(page, target, 'scrollTo');
  const x = Math.round(vp.width / 2);
  const reach = Math.round(vp.height * 0.7);
  for (let stroke = 0; stroke < 16; stroke += 1) {
    const before = await scrollY(page);
    const left = target - before;
    if (Math.abs(left) <= 2) break;
    const d = Math.sign(left) * Math.min(reach, Math.abs(left) + TOUCH_SLOP);
    const y0 = left > 0 ? Math.round(vp.height * 0.85) : Math.round(vp.height * 0.15);
    await ts.touchStart(x, y0);
    for (let i = 1; i <= 10; i += 1) {
      await ts.touchMove(x, Math.round(y0 - (d * i) / 10));
      await sleep(16);
    }
    await sleep(120);
    await ts.touchEnd();
    await nextFrames(page);
    const moved = Math.abs((await scrollY(page)) - before);
    if (stroke === 0 && moved <= 2 && Math.abs(left) > 2 * TOUCH_SLOP) return snapTo(page, target, 'scrollTo');
  }
  const y = await waitStill(page);
  return Math.abs(target - y) <= 2 ? 'touch' : snapTo(page, target, 'touch+scrollTo');
}

async function nextFrames(page) {
  await page.evaluate(() => Promise.race([
    new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    new Promise((r) => setTimeout(r, 500)),
  ]));
}

// ---------- accent audit (runs inside the page) ----------

function collectAccent(accent, tolerance) {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const cache = new Map();
  const alphaOf = (s) => (s === undefined ? 1 : s.endsWith('%') ? parseFloat(s) / 100 : parseFloat(s));
  const toRgba = (css) => {
    if (!css || css === 'none' || css === 'transparent' || css.startsWith('url(')) return null;
    if (cache.has(css)) return cache.get(css);
    let out = null;
    const m = css.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/);
    if (m) out = [+m[1], +m[2], +m[3], alphaOf(m[4])];
    else {
      const am = css.match(/\/\s*([\d.]+%?)\s*\)$/);
      const opaque = am ? css.replace(/\s*\/\s*[\d.]+%?\s*\)$/, ')') : css;
      ctx.fillStyle = '#010203';
      ctx.fillStyle = opaque;
      if (ctx.fillStyle !== '#010203' || opaque === '#010203') {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillRect(0, 0, 1, 1);
        const d = ctx.getImageData(0, 0, 1, 1).data;
        out = [d[0], d[1], d[2], am ? alphaOf(am[1]) : 1];
      }
    }
    cache.set(css, out);
    return out;
  };
  const near = (rgba) => rgba && rgba[3] > 0.05 && [0, 1, 2].every((i) => Math.abs(rgba[i] - accent[i]) <= tolerance);
  const opacityCache = new Map();
  const effectiveOpacity = (el) => {
    if (!el || el.nodeType !== 1) return 1;
    if (opacityCache.has(el)) return opacityCache.get(el);
    const v = parseFloat(getComputedStyle(el).opacity || '1') * effectiveOpacity(el.parentElement);
    opacityCache.set(el, v);
    return v;
  };
  const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const selector = (el) => {
    const parts = [];
    let e = el;
    for (let i = 0; e && e.nodeType === 1 && i < 4; i += 1) {
      let s = e.localName;
      if (e.id) {
        parts.unshift(`${s}#${CSS.escape(e.id)}`);
        break;
      }
      s += [...e.classList].slice(0, 2).map((c) => `.${CSS.escape(c)}`).join('');
      const parent = e.parentElement;
      const same = parent ? [...parent.children].filter((c) => c.localName === e.localName) : [];
      if (same.length > 1) s += `:nth-of-type(${same.indexOf(e) + 1})`;
      parts.unshift(s);
      e = parent;
    }
    return parts.join(' > ');
  };
  // Properties that hold one colour, and properties whose value can hold several (shadows, gradients).
  const MULTI = new Set(['box-shadow', 'background-image']);
  const COLOR_TOKEN = /(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\([^()]*\)|#[0-9a-f]{3,8}\b/gi;
  const matchOf = (prop, value) => {
    if (!MULTI.has(prop)) {
      const rgba = toRgba(value);
      return near(rgba) ? rgba : null;
    }
    if (!value || value === 'none') return null;
    for (const token of value.match(COLOR_TOKEN) || []) {
      const rgba = toRgba(token);
      if (near(rgba)) return rgba;
    }
    return null;
  };
  // Where accent paint can sit on a box: text (only when it has text), background (flat or gradient),
  // borders, outline (focus rings), text decoration (underlines) and box-shadow (rings, glows).
  const boxProps = (cs, withText) => {
    const props = [];
    if (withText) props.push('color');
    props.push('background-color', 'background-image', 'box-shadow');
    for (const side of ['top', 'right', 'bottom', 'left']) {
      const width = parseFloat(cs.getPropertyValue(`border-${side}-width`));
      if (width > 0 && cs.getPropertyValue(`border-${side}-style`) !== 'none') props.push(`border-${side}-color`);
    }
    if (cs.getPropertyValue('outline-style') !== 'none' && parseFloat(cs.getPropertyValue('outline-width')) > 0) props.push('outline-color');
    const decorated = cs.getPropertyValue('text-decoration-line') !== 'none';
    if (withText && decorated && cs.getPropertyValue('text-decoration-color') !== cs.getPropertyValue('color')) props.push('text-decoration-color');
    return props;
  };
  // ::before and ::after paint markers, underlines and rules without their own element.
  const pseudoParts = (el) => {
    const parts = [];
    for (const which of ['::before', '::after']) {
      const ps = getComputedStyle(el, which);
      const content = ps.getPropertyValue('content');
      if (!content || content === 'none' || content === 'normal' || ps.display === 'none') continue;
      if (ps.visibility === 'hidden' || parseFloat(ps.opacity || '1') < 0.05) continue;
      const withText = /^["'].+["']$/.test(content) && content.length > 2;
      parts.push({ prefix: `${which} `, cs: ps, props: boxProps(ps, withText) });
    }
    return parts;
  };
  const SKIP = new Set(['script', 'style', 'noscript', 'template', 'head', 'meta', 'link', 'title']);
  const hits = [];
  for (const el of [document.body, ...document.body.querySelectorAll('*')]) {
    if (SKIP.has(el.localName)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || effectiveOpacity(el) < 0.05) continue;
    const isSvg = el instanceof SVGElement;
    const props = boxProps(cs, ownText(el) || el.localName === 'input' || el.localName === 'textarea');
    if (isSvg) props.push('fill');
    if (isSvg && parseFloat(cs.strokeWidth || '0') > 0) props.push('stroke');
    const parts = [{ prefix: '', cs, props }, ...(isSvg ? [] : pseudoParts(el))];
    for (const part of parts) {
      for (const prop of part.props) {
        const value = part.cs.getPropertyValue(prop);
        const rgba = matchOf(prop, value);
        if (!rgba) continue;
        const text = (el.textContent || el.getAttribute('aria-label') || el.getAttribute('alt') || '').replace(/\s+/g, ' ').trim().slice(0, 80);
        hits.push({
          selector: selector(el), prop: `${part.prefix}${prop}`, value: value.slice(0, 160), alpha: Math.round(rgba[3] * 100) / 100, text,
          rect: { x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
          inViewport: r.bottom > 0 && r.top < innerHeight,
        });
      }
    }
  }
  return hits;
}

function mergeAccent(store, hits, step) {
  for (const h of hits) {
    const key = `${h.selector}|${h.prop}`;
    if (store.has(key)) store.get(key).steps.push(step);
    else store.set(key, { ...h, steps: [step] });
  }
}

// ---------- one route x viewport x pass ----------

async function newContext(browser) {
  if (typeof browser.createBrowserContext === 'function') return browser.createBrowserContext();
  return browser.createIncognitoBrowserContext();
}

async function prepare(page, vp, pass, opts, errors) {
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e?.message || e).slice(0, 300)}`));
  // Failed loads are reported by URL from the response event; a missing favicon is ignored.
  page.on('response', (r) => {
    if (r.status() >= 400 && !/\/favicon\.ico(\?|$)/i.test(r.url())) errors.push(`http ${r.status()}: ${r.url().slice(0, 200)}`);
  });
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(`console: ${m.text().slice(0, 300)}`);
  });
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: PASSES[pass] }]);
  if (opts.session.length) {
    await page.evaluateOnNewDocument((pairs) => {
      try {
        for (const [k, v] of pairs) window.sessionStorage.setItem(k, v);
      } catch {
        // opaque origins (about:blank) have no sessionStorage
      }
    }, opts.session);
  }
}

async function shootOne(browser, job, opts) {
  const { route, vpKey, pass } = job;
  const vp = VIEWPORTS[vpKey];
  const run = { path: route.path, url: route.url, viewport: vp.label, pass, status: 'ok', maxScroll: 0, scrollMode: null, errors: [], shots: [] };
  const ctx = await newContext(browser);
  const page = await ctx.newPage();
  try {
    await prepare(page, vp, pass, opts, run.errors);
    const res = await page.goto(route.url, { waitUntil: 'networkidle2', timeout: opts.timeout });
    if (!res || res.status() >= 400) throw new Error(`HTTP ${res ? res.status() : 'no response'}`);
    await page.evaluate(() => (document.fonts ? document.fonts.ready.then(() => true) : true));
    await sleep(opts.intro);
    const accent = opts.accent && pass === 'motion' ? new Map() : null;
    for (const step of opts.steps) await shootStep(page, vp, step, run, opts, accent, job.dir);
    if (accent) run.accent = [...accent.values()];
  } catch (err) {
    run.status = 'failed';
    run.errors.push(`run: ${String(err?.message || err).slice(0, 300)}`);
  } finally {
    await ctx.close().catch(() => {});
  }
  return run;
}

async function shootStep(page, vp, step, run, opts, accent, dir) {
  const max = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
  run.maxScroll = Math.max(run.maxScroll, max);
  const target = Math.round(step * max);
  const mode = vp.isMobile ? await touchTo(page, vp, target) : await wheelTo(page, vp, target);
  // 'none' (no scroll needed for this step) says nothing about how scrolling works; leave it out.
  if (mode !== 'none') run.scrollMode = run.scrollMode && run.scrollMode !== mode ? 'mixed' : mode;
  await sleep(opts.settle);
  await nextFrames(page);
  const file = `${vp.label}-${run.pass}-${pct(step)}.png`;
  await page.screenshot({ path: join(dir, file), type: 'png', captureBeyondViewport: false });
  run.shots.push({ step, target, y: await scrollY(page), file });
  if (accent) mergeAccent(accent, await page.evaluate(collectAccent, opts.accent.rgb, TOLERANCE), step);
}

// ---------- output ----------

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function contactSheet(runs, opts, accentFile) {
  const byRoute = new Map();
  for (const r of runs) {
    if (!byRoute.has(r.path)) byRoute.set(r.path, []);
    byRoute.get(r.path).push(r);
  }
  const head = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shots</title><style>
:root{color-scheme:light dark;--bg:#f6f6f4;--fg:#16181d;--muted:#5d6270;--line:#d9d9d3}
@media (prefers-color-scheme:dark){:root{--bg:#121316;--fg:#ececea;--muted:#a3a6ad;--line:#2c2f36}}
body{margin:0;padding:24px 16px;background:var(--bg);color:var(--fg);font:14px/1.5 system-ui,sans-serif}
h1{font-size:20px;margin:0 0 4px}h2{font-size:17px;margin:32px 0 8px}h3{font-size:14px;margin:20px 0 6px;color:var(--muted)}
table{border-collapse:collapse}td,th{padding:4px;vertical-align:top;text-align:left;border-top:1px solid var(--line)}
img{display:block;width:220px;height:auto;border:1px solid var(--line)}td.m img{width:110px}
.k{color:var(--muted);font-size:12px}.bad{color:#c62828}.wrap{overflow-x:auto}</style></head><body>`;
  let body = `<h1>Screenshot matrix</h1><p class="k">${esc(opts.url)} &middot; ${new Date().toISOString()} &middot; steps ${opts.steps.join(', ')}${accentFile ? ` &middot; accent ${esc(opts.accent.hex)} (see accent.json)` : ''}</p>`;
  for (const [path, list] of byRoute) {
    body += `<h2>${esc(path)}</h2>`;
    for (const vpLabel of [...new Set(list.map((r) => r.viewport))]) {
      body += `<h3>${esc(vpLabel)}</h3><div class="wrap"><table><tr><th></th>${opts.steps.map((s) => `<th>${pct(s)}</th>`).join('')}</tr>`;
      for (const r of list.filter((x) => x.viewport === vpLabel)) {
        const cls = vpLabel.startsWith('mobile') ? ' class="m"' : '';
        const cells = opts.steps.map((s) => {
          const shot = r.shots.find((x) => x.step === s);
          return shot ? `<td${cls}><a href="${esc(`${slugFor(r.path)}/${shot.file}`)}"><img loading="lazy" src="${esc(`${slugFor(r.path)}/${shot.file}`)}" alt="${esc(`${vpLabel} ${r.pass} ${pct(s)}`)}"></a><span class="k">y ${shot.y}</span></td>` : '<td class="bad">missing</td>';
        }).join('');
        const note = r.status !== 'ok' ? `<br><span class="bad">${esc(r.errors.at(-1) || 'failed')}</span>` : r.errors.length ? `<br><span class="k">${r.errors.length} page error(s)</span>` : '';
        const acc = r.accent ? `<br><span class="k">accent: ${r.accent.length}</span>` : '';
        body += `<tr><th>${esc(r.pass)}<br><span class="k">${esc(r.scrollMode || '')}</span>${note}${acc}</th>${cells}</tr>`;
      }
      body += '</table></div>';
    }
  }
  return `${head}${body}</body></html>`;
}

function accentReport(runs, opts) {
  const pages = {};
  for (const r of runs.filter((x) => x.accent)) {
    pages[r.path] ??= {};
    const byProperty = {};
    for (const h of r.accent) byProperty[h.prop] = (byProperty[h.prop] || 0) + 1;
    pages[r.path][r.viewport] = { count: r.accent.length, byProperty, elements: r.accent };
  }
  return {
    accent: opts.accent.hex, rgb: opts.accent.rgb, tolerance: TOLERANCE, pass: 'motion',
    note: 'Every visible element painted in the accent. Each one must carry the meaning written in the accent decision; anything else is accent leakage.',
    pages,
  };
}

// ---------- driver ----------

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(HELP);
    return 0;
  }
  if (opts.error) {
    console.error(`${opts.error}\nusage: node shots.mjs <url> [--out dir] [--paths /,/about] [--accent "#hex"] (--help for all options)`);
    return 2;
  }
  const puppeteer = loadPuppeteer();
  warnLowTemp();
  const out = resolve(opts.out);
  // Without --paths the one route is <url> itself, path and query included (a site served under
  // /he/ or a single page such as /order.html), never silently the origin root.
  const routes = opts.paths
    ? opts.paths.map((p) => ({ path: p, url: new URL(p, opts.url).href }))
    : [{ path: `${new URL(opts.url).pathname || '/'}${new URL(opts.url).search}`, url: opts.url }];
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
  });
  const runs = [];
  try {
    for (const route of routes) {
      const dir = join(out, slugFor(route.path));
      mkdirSync(dir, { recursive: true });
      for (const vpKey of opts.viewports) {
        for (const pass of opts.passes) {
          const run = await shootOne(browser, { route, vpKey, pass, dir }, opts);
          runs.push(run);
          const acc = run.accent ? `, accent ${run.accent.length}` : '';
          console.log(`${run.status === 'ok' ? 'ok  ' : 'FAIL'} ${route.path} ${run.viewport} ${pass}: ${run.shots.length}/${opts.steps.length} shots, scroll ${run.scrollMode || '-'}, ${run.errors.length} page error(s)${acc}`);
        }
      }
    }
  } finally {
    await browser.close();
  }
  return finish(runs, opts, out);
}

function finish(runs, opts, out) {
  mkdirSync(out, { recursive: true });
  const meta = {
    url: opts.url, created: new Date().toISOString(), steps: opts.steps, passes: opts.passes,
    viewports: opts.viewports.map((k) => VIEWPORTS[k]), sessionKeys: opts.session.map(([k]) => k),
    runs: runs.map(({ accent, ...rest }) => rest),
  };
  writeFileSync(join(out, 'shots.json'), JSON.stringify(meta, null, 2));
  if (opts.accent) {
    const report = accentReport(runs, opts);
    writeFileSync(join(out, 'accent.json'), JSON.stringify(report, null, 2));
    const total = Object.values(report.pages).flatMap((p) => Object.values(p)).reduce((n, v) => n + v.count, 0);
    if (total === 0) console.warn(`warning: no visible element uses ${opts.accent.hex}; check the value against the accent decision`);
  }
  writeFileSync(join(out, 'index.html'), contactSheet(runs, opts, Boolean(opts.accent)));
  const failed = runs.filter((r) => r.status !== 'ok' || r.shots.length !== opts.steps.length);
  console.log(`${failed.length ? 'FAIL' : 'done'}: ${runs.reduce((n, r) => n + r.shots.length, 0)} shots in ${out.replace(/\\/g, '/')} (open index.html)`);
  return failed.length ? 1 : 0;
}

main().then((code) => { process.exitCode = code; }, (err) => {
  console.error(`shots failed: ${err?.stack || err}`);
  process.exitCode = 1;
});
