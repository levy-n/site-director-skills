#!/usr/bin/env node
// gates: the pre-ship gates in one command, against a local build (serve.mjs) or a live URL.
//
//   node gates.mjs <url[,url…]> [--out ./gates] [--only axe,anchors,overflow,nojs,forms,console,lighthouse]
//                  [--baseline <earlier gates.json>] [--header <css selector>] [--settle 2500]
//                  [--axe <file or url of axe.min.js>] [--lh-runs 3] [--lh-motion on|off|both]
//                  [--budget-lcp 2000] [--budget-tbt 200] [--budget-cls 0.1]
//
// axe        axe-core 4.12.1 (the newest on cdnjs), injected into the page; WCAG 2.0, 2.1 and 2.2 A/AA rules
//            at 390 and 1440 px, with reduced motion (final states, nothing mid-tween), after --settle ms.
//            Any violation fails. With --baseline only new ones fail; the old ones are listed as debt.
// anchors    every in-page link is activated from the keyboard (Enter) with motion on and with reduced motion,
//            at 1440 and 390 px. Its target must exist, land below the fixed header and on screen, land at the
//            same spot in both modes (within 4 px; a gap means two offsets add up), and take focus, or the next
//            Tab must reach the first focusable element at the target. The header offset belongs in
//            html { scroll-padding-top }. Links hidden at a width (a closed phone menu) are skipped there.
// overflow   no sideways scrolling at 320, 390, 768 and 1440 px (motion on); names the elements that stick out.
// nojs       words a reader can see with JavaScript off vs on (reduced motion): at least 90 %, and a visible H1.
//            preserve.mjs compares DOM text; this catches text that is in the HTML but hidden until JS runs.
// forms      every <form> has an action or a submit listener, a native action gets named fields, and every
//            field has a label (a placeholder is not a label). Fields outside any <form> need labels too.
// console    no page errors or console errors on any load with JavaScript on (a missing favicon is ignored).
// lighthouse when a lighthouse binary is found (PATH, then ./node_modules/.bin, then the npx cache through
//            npx --no-install, located once and run with node), otherwise skipped with a note; an npx
//            lookup that times out (180 s) fails instead. Mobile, --lh-runs runs, the median. LCP ≤ 2.0 s,
//            TBT ≤ 200 ms, CLS ≤ 0.1 by default; with --baseline, LCP and TBT may not be more than 10 %
//            worse than the baseline (and at least 100 / 50 ms, below which it is noise).
//            --lh-motion (default both): headless Chrome reports the OS reduced-motion setting, and an OS
//            with animation effects off measures the reduced page. Each mode is forced with a Chrome switch:
//            on = --force-prefers-no-reduced-motion, off = --force-prefers-reduced-motion. Verified
//            2026-10-15 with Lighthouse 12.8.2 and Chrome 145 on a probe page that reports matchMedia:
//            the default run gave reduce on that machine, each switch gave its own value. Before the runs,
//            the same Chrome binary is launched with each switch to confirm it still honours it (a check
//            fails if it does not). Both modes double the Lighthouse time; --lh-motion on while iterating.
//
// Prints one PASS / FAIL / NOTE line per check, writes gates.json and gates.md to --out, exits 1 on any FAIL
// (2 on a usage error). site-gate-audit explains why each gate exists; this script runs them.
// Needs puppeteer (run from a project that has it) and network for axe, unless --axe points at a local copy.

import { createRequire } from 'node:module';
import { execSync, execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

// --help: print the leading comment block of this file and exit
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  const header = [];
  for (const l of readFileSync(new URL(import.meta.url), 'utf8').split(/\r?\n/)) {
    if (l.startsWith('#!')) continue;
    if (!l.startsWith('//')) break;
    header.push(l.replace(/^\/\/ ?/, ''));
  }
  console.log(header.join('\n'));
  process.exit(0);
}

function parseArgs(list) {
  const out = { _: [] };
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const key = a.slice(2);
    const next = list[i + 1];
    if (next === undefined || next.startsWith('--')) out[key] = true;
    else { out[key] = next; i++; }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const USAGE = 'usage: node gates.mjs <url[,url…]> [--out ./gates] [--only axe,anchors,overflow,nojs,forms,console,lighthouse] [--baseline gates.json] [--header selector] [--lh-motion on|off|both]';
const fail = (msg) => { console.error(`${msg}\n${USAGE}`); process.exit(2); };
if (!args._[0]) fail('no URL given');
const URLS = String(args._[0]).split(',').map((s) => s.trim()).filter(Boolean);
for (const u of URLS) {
  if (existsSync(u) && statSync(u).isDirectory()) fail(`${u} is a folder: serve it first (node <skill>/scripts/serve.mjs ${u} --port 4173) and pass the URL`);
  try { new URL(u); } catch { fail(`not a URL: ${u}`); }
}
const GATES = ['axe', 'anchors', 'overflow', 'nojs', 'forms', 'console', 'lighthouse'];
const ONLY = new Set(typeof args.only === 'string' ? args.only.split(',').map((s) => s.trim()) : GATES);
const unknown = [...ONLY].filter((g) => !GATES.includes(g));
if (unknown.length) fail(`unknown gate(s): ${unknown.join(', ')}`);
const need = (g) => ONLY.has(g);
const num = (v, d) => (v === undefined || v === true || !Number.isFinite(Number(v)) ? d : Number(v));
const OUT = resolve(typeof args.out === 'string' ? args.out : './gates');
const SETTLE = num(args.settle, 2500);
const HEADER = typeof args.header === 'string' ? args.header : null;
const LH_RUNS = Math.max(1, num(args['lh-runs'], 3));
if (args['lh-motion'] === true) fail('--lh-motion takes on, off or both');
const LH_MOTION = typeof args['lh-motion'] === 'string' ? args['lh-motion'] : 'both';
if (!['on', 'off', 'both'].includes(LH_MOTION)) fail(`--lh-motion takes on, off or both (got ${args['lh-motion']})`);
const LH_MODES = LH_MOTION === 'both' ? ['on', 'off'] : [LH_MOTION];
// The Chrome switch that pins prefers-reduced-motion for each mode (see --lh-motion in the header).
const LH_SWITCH = { on: '--force-prefers-no-reduced-motion', off: '--force-prefers-reduced-motion' };
const LH_EXPECT = { on: 'no-preference', off: 'reduce' };
const BUDGET = { lcp: num(args['budget-lcp'], 2000), tbt: num(args['budget-tbt'], 200), cls: num(args['budget-cls'], 0.1) };
const AXE_VERSION = '4.12.1'; // cdnjs has nothing newer (Oct 2026); npm is at 4.14
const AXE_SOURCES = typeof args.axe === 'string' ? [args.axe] : [
  `https://cdnjs.cloudflare.com/ajax/libs/axe-core/${AXE_VERSION}/axe.min.js`,
  `https://cdn.jsdelivr.net/npm/axe-core@${AXE_VERSION}/axe.min.js`, // same version, second CDN
];
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const OVERFLOW_WIDTHS = [320, 390, 768, 1440];
const ANCHOR_WIDTHS = [1440, 390];
const MAX_ANCHORS = 25;
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
let BASELINE = null;
if (typeof args.baseline === 'string') {
  try { BASELINE = JSON.parse(readFileSync(args.baseline, 'utf8')); } catch (e) { fail(`cannot read --baseline ${args.baseline}: ${e.message}`); }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (u) => { const x = new URL(u); return (x.pathname.replace(/\/+$/, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'home'); };
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };

// ---------------------------------------------------------------- output
const results = [];
function report(url, gate, scope, ok, detail) {
  results.push({ url, gate, scope, ok, detail });
  const tag = ok === null ? 'NOTE' : ok ? 'PASS' : 'FAIL';
  const where = URLS.length > 1 ? `  [${new URL(url).pathname}]` : '';
  console.log(`${tag}  ${gate}${scope ? ` ${scope}` : ''}${where}  ${detail}`);
}

function loadPuppeteer() {
  const tryFrom = (base) => { try { return createRequire(base)('puppeteer'); } catch { return null; } };
  for (const base of [import.meta.url, join(process.cwd(), 'noop.js')]) {
    const p = tryFrom(base);
    if (p) return p;
  }
  try {
    const p = tryFrom(join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'noop.js'));
    if (p) return p;
  } catch { /* no global npm */ }
  console.error('puppeteer not found. Run from a project that has it (npm i -D puppeteer) or install it globally.');
  process.exit(2);
}

// ---------------------------------------------------------------- in-page helpers
// Installed with page.evaluate after every load; everything here runs in the page.
function installHelpers() {
  const describe = (el) => {
    if (!el || el.nodeType !== 1) return el ? el.nodeName.toLowerCase() : 'nothing';
    const cls = typeof el.className === 'string' && el.className.trim() ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
    const href = el.tagName === 'A' && !el.id && !cls && el.getAttribute('href') ? `[href="${el.getAttribute('href')}"]` : '';
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls}${href}`;
  };
  const shown = (el) => el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  const targetOf = (href) => {
    let id = href.slice(1);
    try { id = decodeURIComponent(id); } catch { /* keep it raw */ }
    return document.getElementById(id) || document.getElementsByName(id)[0] || null;
  };
  // The bottom edge of whatever fixed or stuck bar covers the top of the viewport.
  const headerBottom = (sel) => {
    const vh = innerHeight, vw = document.documentElement.clientWidth;
    const els = sel ? [...document.querySelectorAll(sel)] : [...document.body.querySelectorAll('*')].filter((el) => /fixed|sticky/.test(getComputedStyle(el).position));
    let bottom = 0, by = '';
    for (const el of els) {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (!sel && (r.top > 2 || r.bottom <= 0 || r.height < 8 || r.height > vh * 0.35 || r.width < vw * 0.5)) continue;
      if (!sel && (cs.pointerEvents === 'none' || !shown(el) || el.closest('[aria-hidden="true"]'))) continue;
      if (r.bottom > bottom) { bottom = r.bottom; by = describe(el); }
    }
    return { bottom: Math.round(bottom), by };
  };
  const linkAt = (i) => document.querySelector(`[data-pb-gate="${i}"]`);
  const anchorLinks = () => {
    const seen = new Map();
    document.querySelectorAll('a[href^="#"]').forEach((a, n) => {
      const href = a.getAttribute('href');
      if (href.length < 2 || /^#[!/]/.test(href)) return; // "#" alone and hash-router links
      a.dataset.pbGate = String(n);
      const focusable = a.tabIndex >= 0 && a.checkVisibility({ visibilityProperty: true });
      const prev = seen.get(href);
      if (!prev || (!prev.focusable && focusable)) seen.set(href, { i: String(n), href, target: Boolean(targetOf(href)), focusable });
    });
    return [...seen.values()];
  };
  const focusLink = (i) => { const a = linkAt(i); a.focus({ preventScroll: true }); return document.activeElement === a; };
  // What the reader looks for after the jump: the target's heading when it opens with one (section
  // padding may legitimately sit under the header), otherwise the target's own top edge.
  const landing = (i, sel) => {
    const t = targetOf(linkAt(i).getAttribute('href'));
    const box = t.getBoundingClientRect(), h = headerBottom(sel), ae = document.activeElement;
    const head = t.matches('h1,h2,h3,h4,h5,h6') ? t : t.querySelector('h1,h2,h3,h4,h5,h6');
    const mark = head && head.getBoundingClientRect().top - box.top < innerHeight / 2 ? head : t;
    return {
      top: Math.round(mark.getBoundingClientRect().top), mark: describe(mark), boxTop: Math.round(box.top),
      header: h.bottom, headerBy: h.by, vh: innerHeight, y: Math.round(scrollY),
      atStart: scrollY < 1, atEnd: scrollY >= document.documentElement.scrollHeight - innerHeight - 2,
      focused: ae === t || t.contains(ae), active: describe(ae),
    };
  };
  // After a Tab: did focus enter the target, or reach the first focusable element at or after it?
  const tabbedInto = (i) => {
    const t = targetOf(linkAt(i).getAttribute('href')), ae = document.activeElement;
    if (ae === t || t.contains(ae)) return { ok: true, active: describe(ae) };
    const tabbable = [...document.querySelectorAll('a[href],button,input,select,textarea,summary,iframe,[tabindex],[contenteditable="true"]')]
      .filter((el) => el.tabIndex >= 0 && !el.disabled && el.checkVisibility({ visibilityProperty: true }));
    const first = tabbable.find((el) => el === t || t.contains(el) || (t.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING));
    // Nothing focusable after the target: focus may leave the page, but must not go back above it.
    const above = ae && ae !== document.body && (t.compareDocumentPosition(ae) & Node.DOCUMENT_POSITION_PRECEDING);
    return { ok: first ? ae === first : !above, active: describe(ae), expected: first ? describe(first) : 'nothing above the target' };
  };
  // Culprits are measured against the root box, not the window: on a phone an overflowing page is
  // zoomed out and, in RTL, scrolled from the right, so window coordinates point at the wrong element.
  const overflow = () => {
    const de = document.documentElement, vw = de.clientWidth, root = de.getBoundingClientRect();
    const culprits = [];
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || (r.right <= root.left + vw + 1 && r.left >= root.left - 1)) continue;
      if (culprits.some((c) => c.el.contains(el))) continue;
      let clipped = false;
      for (let p = el; p && p !== document.body; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (cs.position === 'fixed' || (p !== el && cs.overflowX !== 'visible')) { clipped = true; break; }
      }
      if (!clipped) culprits.push({ el, sel: describe(el), left: Math.round(r.left - root.left), right: Math.round(r.right - root.left) });
      if (culprits.length >= 8) break;
    }
    return { over: de.scrollWidth - vw, vw, culprits: culprits.map(({ el, ...c }) => c) };
  };
  // Words a reader can see: text in a rendered box that no opacity, visibility or display rule hides.
  const census = () => {
    const count = (s) => (s.match(/[\p{L}\p{N}]+/gu) || []).length;
    const cache = new Map();
    const seen = (el) => {
      if (!cache.has(el)) {
        let v = shown(el);
        if (v) { const r = el.getBoundingClientRect(); v = r.width > 0 && r.height > 0; }
        cache.set(el, v);
      }
      return cache.get(el);
    };
    let words = 0;
    const hidden = new Map();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      const el = t.parentElement;
      const n = el && !el.closest('script,style,noscript,template') ? count(t.nodeValue) : 0;
      if (!n) continue;
      if (seen(el)) { words += n; continue; }
      if (!el.checkVisibility()) continue; // display:none (menus, tabs) is not the pattern looked for here
      let top = el; // the outermost ancestor that is laid out but invisible: the pre-hidden block
      while (top.parentElement && top.parentElement !== document.body && top.parentElement.checkVisibility() && !shown(top.parentElement)) top = top.parentElement;
      hidden.set(top, (hidden.get(top) || 0) + n);
    }
    const h1 = [...document.querySelectorAll('h1')];
    return {
      words, h1: h1.length, h1Visible: h1.filter(seen).length,
      hidden: [...hidden.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([el, n]) => `${describe(el)} (${n} words)`),
    };
  };
  const forms = () => {
    const nameOf = (el) => {
      const lab = [...(el.labels || [])].map((l) => l.textContent.trim()).filter(Boolean).join(' ');
      const by = (el.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean).map((id) => (document.getElementById(id)?.textContent || '').trim()).join(' ').trim();
      return lab || (el.getAttribute('aria-label') || '').trim() || by || (el.getAttribute('title') || '').trim();
    };
    const FIELD = 'input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=image]),select,textarea';
    const live = (el) => el.matches(FIELD) && el.tabIndex >= 0 && !el.closest('[aria-hidden="true"]') && el.checkVisibility({ visibilityProperty: true });
    const info = (el) => ({ field: `${describe(el)}${el.name ? `[name=${el.name}]` : ''}`, name: el.name || '', label: nameOf(el), placeholder: el.getAttribute('placeholder') || '' });
    const list = [...document.forms].map((f, i) => {
      f.dataset.pbForm = String(i);
      const action = (f.getAttribute('action') || '').trim();
      return { i, form: describe(f), action: action && !/^(#|javascript:)/i.test(action) ? action : '', fields: [...f.elements].filter(live).map(info) };
    });
    const loose = [...document.querySelectorAll(FIELD)].filter((el) => !el.form && live(el)).map(info);
    return { forms: list, loose };
  };
  window.__pbg = { describe, headerBottom, anchorLinks, focusLink, landing, tabbedInto, overflow, census, forms };
}

// ---------------------------------------------------------------- page plumbing
function viewportFor(width) {
  if (width <= 430) return { width, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  if (width <= 820) return { width, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  return { width, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false };
}

async function open(browser, url, { width, reduce = false, js = true, errors = null }) {
  const page = await browser.newPage();
  await page.setBypassCSP(true); // a strict CSP would otherwise block the injected axe
  await page.setJavaScriptEnabled(js);
  if (width <= 430) await page.setUserAgent(MOBILE_UA);
  await page.setViewport(viewportFor(width));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' }]);
  if (errors && js) {
    page.on('pageerror', (e) => errors.add(`page error: ${String(e.message).split('\n')[0].slice(0, 160)}`));
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      const where = (m.location() && m.location().url) || '';
      if (/\/favicon\.ico(\?|$)/i.test(where)) return;
      errors.add(`console: ${m.text().slice(0, 160)}${where && !m.text().includes(where) ? ` (${where})` : ''}`);
    });
  }
  const res = await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  if (!res || res.status() >= 400) {
    await page.close();
    throw new Error(`${url} answered ${res ? `HTTP ${res.status()}` : 'nothing'}`);
  }
  await page.evaluate(installHelpers);
  return page;
}

async function waitForStillScroll(page, maxMs = 5000) {
  let last = -1, stableFor = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const y = await page.evaluate(() => Math.round(window.scrollY));
    stableFor = y === last ? stableFor + 100 : 0;
    if (stableFor >= 400) return y;
    last = y;
    await sleep(100);
  }
  return last;
}

// Scroll the whole page once, the way a reader would: lazy chunks load (their errors count),
// entrances fire and CSS scroll-driven reveals play. Driven from Node, so it also works with
// JavaScript off. Stops early when the page will not scroll (a scroll lock).
async function scrollThrough(page) {
  let stuck = 0;
  for (let i = 0; i < 300 && stuck < 3; i++) {
    const { y, max, vh } = await page.evaluate(() => ({ y: Math.round(scrollY), max: document.documentElement.scrollHeight - innerHeight, vh: innerHeight }));
    if (y >= max - 2) break;
    await page.evaluate((to) => window.scrollTo(0, to), Math.min(max, y + Math.round(vh * 0.8)));
    await sleep(120);
    stuck = (await page.evaluate(() => Math.round(scrollY))) === y ? stuck + 1 : 0;
  }
  await sleep(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);
  await waitForStillScroll(page);
}

// ---------------------------------------------------------------- gates
async function runAxe(page) {
  let lastErr = '';
  for (const src of AXE_SOURCES) {
    try {
      await page.addScriptTag(existsSync(src) ? { path: resolve(src) } : { url: src });
      if (await page.evaluate(() => typeof window.axe === 'object' && typeof window.axe.run === 'function')) { lastErr = ''; break; }
      lastErr = 'no axe global after the script loaded (an AMD loader on the page?)';
    } catch (e) { lastErr = e.message.split('\n')[0]; }
  }
  if (lastErr) return { error: `axe-core did not load: ${lastErr}. Pass --axe <path to axe.min.js> to use a local copy` };
  return page.evaluate(async (tags) => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] });
    return {
      version: window.axe.version,
      violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) })),
    };
  }, AXE_TAGS);
}

async function anchorRun(page) {
  const links = await page.evaluate(() => window.__pbg.anchorLinks());
  const out = [];
  for (const l of links.slice(0, MAX_ANCHORS)) {
    if (!l.target) { out.push({ href: l.href, missing: true }); continue; }
    try {
      if (!(await page.evaluate((i) => window.__pbg.focusLink(i), l.i))) { out.push({ href: l.href, skipped: true }); continue; }
      await page.keyboard.press('Enter');
      await sleep(150);
      await waitForStillScroll(page);
      const m = await page.evaluate((i, sel) => window.__pbg.landing(i, sel), l.i, HEADER);
      if (!m.focused) {
        await page.keyboard.press('Tab');
        const t = await page.evaluate((i) => window.__pbg.tabbedInto(i), l.i);
        Object.assign(m, { focusByTab: t.ok, tabbedTo: t.active, expected: t.expected });
      }
      out.push({ href: l.href, ...m });
    } catch (e) {
      out.push({ href: l.href, error: `the page changed under the test (${e.message.split('\n')[0].slice(0, 80)})` });
      break;
    }
  }
  return { total: links.length, links: out };
}

// Who receives a submit: the form's own listeners, a click listener on its submit button, or a
// listener on an ancestor (React registers one on its root for every form, used or not).
async function submitReceivers(page, count) {
  const cdp = await page.createCDPSession();
  const types = async (expression) => {
    const { result } = await cdp.send('Runtime.evaluate', { expression });
    if (!result.objectId) return [];
    const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId, depth: 0 });
    return listeners.map((x) => x.type);
  };
  const out = [];
  for (let i = 0; i < count; i++) {
    const f = `document.querySelector('[data-pb-form="${i}"]')`;
    const own = (await types(f)).includes('submit');
    const button = (await types(`${f}.querySelector('button:not([type]),button[type=submit],input[type=submit],input[type=image]')`)).includes('click');
    let delegated = '';
    const chain = await page.evaluate((k) => {
      const names = [];
      for (let e = document.querySelector(`[data-pb-form="${k}"]`).parentNode; e; e = e.parentNode) names.push(window.__pbg.describe(e));
      return names;
    }, i);
    for (let k = 1; k <= chain.length + 1 && !delegated; k++) {
      const top = k > chain.length;
      const expr = top ? 'window' : `(() => { let e = ${f}; for (let n = 0; n < ${k}; n++) e = e.parentNode; return e; })()`;
      if ((await types(expr)).includes('submit')) delegated = top ? 'window' : chain[k - 1];
    }
    out.push({ own, button, delegated });
  }
  await cdp.detach();
  return out;
}

async function formsCheck(page) {
  const data = await page.evaluate(() => window.__pbg.forms());
  const receivers = await submitReceivers(page, data.forms.length);
  data.forms.forEach((f, i) => Object.assign(f, receivers[i]));
  return data;
}

// ---------------------------------------------------------------- one URL
async function collect(browser, url) {
  const errors = new Set();
  const s = { url, loads: 0, axe: {}, anchors: {}, overflow: {}, nojs: null, forms: null, errors: [] };
  for (const width of ANCHOR_WIDTHS) { // reduced motion: final states
    const nojsHere = width === 1440 && need('nojs'), formsHere = width === 1440 && need('forms');
    if (!need('axe') && !need('anchors') && !nojsHere && !formsHere) continue;
    const page = await open(browser, url, { width, reduce: true, errors });
    s.loads++;
    await sleep(SETTLE);
    if (need('axe')) s.axe[width] = await runAxe(page);
    if (nojsHere) {
      await scrollThrough(page);
      s.nojs = { on: await page.evaluate(() => window.__pbg.census()) };
    }
    if (formsHere) s.forms = await formsCheck(page);
    if (need('anchors')) s.anchors[`${width} reduced`] = await anchorRun(page);
    await page.close();
  }
  for (const width of OVERFLOW_WIDTHS) { // motion on
    const anchorsHere = need('anchors') && ANCHOR_WIDTHS.includes(width), throughHere = need('console') && width === 1440;
    if (!need('overflow') && !anchorsHere && !throughHere) continue;
    const page = await open(browser, url, { width, errors });
    s.loads++;
    await sleep(SETTLE);
    if (need('overflow')) s.overflow[width] = await page.evaluate(() => window.__pbg.overflow());
    if (throughHere || anchorsHere) await scrollThrough(page);
    if (anchorsHere) s.anchors[`${width} motion`] = await anchorRun(page);
    await page.close();
  }
  if (need('nojs')) {
    const page = await open(browser, url, { width: 1440, js: false });
    await sleep(500);
    await scrollThrough(page);
    s.nojs.off = await page.evaluate(() => window.__pbg.census());
    await page.close();
  }
  s.errors = [...errors];
  return s;
}

// ---------------------------------------------------------------- verdicts
function baselineFor(url) {
  if (!BASELINE || !BASELINE.urls) return null;
  const entries = Object.entries(BASELINE.urls);
  if (entries.length === 1 && URLS.length === 1) return entries[0][1];
  const key = (u) => { try { const x = new URL(u); return x.pathname.replace(/\/index\.html$/, '/') + x.search; } catch { return u; } };
  return (entries.find(([u]) => key(u) === key(url)) || [])[1] || null;
}

function judgeAxe(url, s, base) {
  for (const width of [390, 1440]) {
    const r = s.axe[width];
    if (!r) continue;
    if (r.error) { report(url, 'axe', `${width}`, false, r.error); continue; }
    const fmt = (v) => `${v.id} (${v.impact}, ${v.nodes} node${v.nodes === 1 ? '' : 's'}: ${v.targets[0]})`;
    const before = base?.axe?.[width]?.violations;
    if (before) {
      const old = new Map(before.map((v) => [v.id, v.nodes]));
      const fresh = r.violations.filter((v) => !old.has(v.id) || v.nodes > old.get(v.id));
      const debt = r.violations.filter((v) => !fresh.includes(v)).map((v) => v.id);
      report(url, 'axe', `${width}`, fresh.length === 0, fresh.length ? `new since the baseline: ${fresh.map(fmt).join('; ')}` : `no new violations${debt.length ? ` (debt kept from the baseline: ${debt.join(', ')})` : ''}`);
    } else {
      report(url, 'axe', `${width}`, r.violations.length === 0, r.violations.length ? r.violations.map(fmt).join('; ') : `0 violations (axe ${r.version})`);
    }
  }
}

function anchorProblems(res, mode) {
  const out = [];
  for (const l of res.links) {
    if (l.error) { out.push(`${l.href} ${mode}: ${l.error}`); continue; }
    if (l.missing || l.skipped) continue;
    // At the very top the page cannot scroll higher: where the target sits there is layout, not the jump.
    if (!l.atStart && l.top < l.header - 1) out.push(`${l.href} ${mode}: lands under the header (${l.mark} top at ${l.top} px, ${l.headerBy} ends at ${l.header} px)`);
    else if (l.top > l.vh - 24) out.push(`${l.href} ${mode}: target is not on screen after the jump (top ${l.top} px of ${l.vh})`);
    if (!l.focused && !l.focusByTab) out.push(`${l.href} ${mode}: focus did not move (stayed on ${l.active}; next Tab went to ${l.tabbedTo}, expected ${l.expected})`);
  }
  return out;
}

function judgeAnchors(url, s) {
  const runs = Object.values(s.anchors);
  if (!runs.length) return;
  if (runs.every((r) => r.total === 0)) { report(url, 'anchors', '', null, 'no in-page links on this page'); return; }
  const missing = [...new Set(runs.flatMap((r) => r.links.filter((l) => l.missing).map((l) => l.href)))];
  if (missing.length) report(url, 'anchors', 'targets', false, `no element with these ids: ${missing.join(' ')}`);
  for (const width of ANCHOR_WIDTHS) {
    const m = s.anchors[`${width} motion`], r = s.anchors[`${width} reduced`];
    if (!m && !r) continue;
    const problems = [...(m ? anchorProblems(m, 'motion') : []), ...(r ? anchorProblems(r, 'reduced') : [])];
    if (m && r) {
      for (const a of m.links) {
        const b = r.links.find((x) => x.href === a.href);
        if (!b || a.top === undefined || b.top === undefined || a.atEnd || b.atEnd) continue;
        if (Math.abs(a.top - b.top) > 4) problems.push(`${a.href}: lands ${a.top - b.top} px apart with motion on and reduced (top ${a.top} vs ${b.top}; two offsets adding up?)`);
      }
    }
    const tested = (m || r).links.filter((l) => l.top !== undefined);
    const skipped = (m || r).links.filter((l) => l.skipped).length;
    const extra = `${skipped ? `; ${skipped} hidden at this width, skipped` : ''}${(m || r).total > MAX_ANCHORS ? `; only the first ${MAX_ANCHORS} of ${(m || r).total} tested` : ''}`;
    if (!tested.length && !problems.length) { report(url, 'anchors', `${width}`, null, `no reachable in-page link at this width${extra}`); continue; }
    const gaps = tested.filter((l) => !l.atStart && !l.atEnd).map((l) => l.top - l.header);
    const lo = Math.min(...gaps), hi = Math.max(...gaps);
    const gap = gaps.length ? ` (the target ${lo === hi ? `${lo} px` : `${lo} to ${hi} px`} below it)` : '';
    report(url, 'anchors', `${width}`, problems.length === 0, problems.length ? problems.slice(0, 5).join('; ') + (problems.length > 5 ? `; and ${problems.length - 5} more` : '')
      : `${tested.length} link${tested.length === 1 ? ' lands' : 's land'} below the header${gap}, same spot with motion on and reduced, focus follows${extra}`);
  }
}

function judgeOverflow(url, s) {
  for (const width of OVERFLOW_WIDTHS) {
    const o = s.overflow[width];
    if (!o) continue;
    const who = o.culprits.slice(0, 4).map((c) => `${c.sel} (${c.left}..${c.right})`).join(', ');
    if (o.over > 1) report(url, 'overflow', `${width}`, false, `the page scrolls sideways by ${o.over} px${who ? `; sticking out: ${who}` : ''}`);
    else report(url, 'overflow', `${width}`, true, `0 px${who ? ` (html/body clip these, which phones do not always honour: ${who})` : ''}`);
  }
}

function judgeNojs(url, s) {
  if (!s.nojs) return;
  const { on, off } = s.nojs;
  const ratio = on.words ? off.words / on.words : 1;
  const h1ok = on.h1 === 0 || off.h1Visible > 0;
  const pct = Math.round(ratio * 100);
  const detail = `JavaScript off shows ${off.words} of ${on.words} words (${pct} %); H1 ${on.h1 === 0 ? 'missing on the page' : off.h1Visible ? 'visible' : 'hidden'} without JavaScript`;
  report(url, 'nojs', '', ratio >= 0.9 && h1ok, `${detail}${off.hidden.length && (ratio < 0.9 || !h1ok) ? `; hidden until JS: ${off.hidden.join(', ')}` : ''}`);
}

function judgeForms(url, s) {
  if (!s.forms) return;
  const { forms, loose } = s.forms;
  if (!forms.length && !loose.length) { report(url, 'forms', '', null, 'no form fields on this page'); return; }
  const problems = [], notes = [];
  const unlabelled = (fields) => fields.filter((f) => !f.label).map((f) => `${f.field}${f.placeholder ? ' (placeholder only)' : ''}`);
  for (const f of forms) {
    const who = `form ${f.i + 1} (${f.form})`;
    if (!f.action && !f.own && !f.button && !f.delegated) problems.push(`${who}: no action and no submit listener, so the submit goes nowhere`);
    if (f.action && !f.own && !f.button && !f.delegated && !f.fields.some((x) => x.name)) problems.push(`${who}: posts to ${f.action} but no field has a name, so it sends nothing`);
    if (!f.action && !f.own && !f.button && f.delegated) notes.push(`${who} is handled only by a listener on an ${f.delegated} (React registers one for every form): submit it once by hand`);
    const bad = unlabelled(f.fields);
    if (bad.length) problems.push(`${who}: fields without a label: ${bad.join(', ')}`);
  }
  const badLoose = unlabelled(loose);
  if (badLoose.length) problems.push(`fields outside any form without a label: ${badLoose.join(', ')}`);
  if (loose.length) notes.push(`${loose.length} field(s) outside any <form> (Enter does not submit them)`);
  const head = `${forms.length} form${forms.length === 1 ? '' : 's'}, ${forms.reduce((n, f) => n + f.fields.length, 0) + loose.length} fields`;
  const said = problems.length ? problems.join('; ') : 'every form has a receiver, every field a label';
  report(url, 'forms', '', problems.length === 0, `${head}: ${said}${notes.length ? `. Note: ${notes.join('; ')}` : ''}`);
}

function judgeConsole(url, s) {
  if (!need('console')) return;
  report(url, 'console', '', s.errors.length === 0, s.errors.length ? `${s.errors.length} error(s): ${s.errors.slice(0, 5).join(' | ')}` : `0 errors over ${s.loads} loads`);
}

// ---------------------------------------------------------------- Lighthouse (optional)
// The lighthouse command: { cmd, pre, shell, via } where pre are arguments before the URL. PATH first,
// then the project's own node_modules/.bin, then the npx cache (npx --no-install: a cached or local
// install, never a download). Returns null when none is found, { timedOut: true } when the npx lookup
// did not answer in time (main fails the gate then: a skip would read as "no Lighthouse installed").
function findLighthouse() {
  try {
    const out = execFileSync(process.platform === 'win32' ? 'where' : 'which', ['lighthouse'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const found = out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const bin = (process.platform === 'win32' && found.find((l) => /\.cmd$/i.test(l))) || found[0];
    if (bin) return { cmd: bin, pre: [], shell: true, via: 'PATH' };
  } catch { /* not on PATH */ }
  const local = join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'lighthouse.cmd' : 'lighthouse');
  if (existsSync(local)) return { cmd: local, pre: [], shell: true, via: 'node_modules/.bin' };
  return npxLighthouse();
}

// Run inside `npx -p lighthouse`: npx puts the package's .bin first on PATH, so the first PATH entry
// with ../lighthouse/package.json is the copy npx resolved for the package. Prints its CLI path.
const LOCATE_LIGHTHOUSE = `const { join, delimiter } = require('path'); const fs = require('fs');
for (const d of (process.env.PATH || '').split(delimiter)) {
  const pkg = join(d, '..', 'lighthouse', 'package.json');
  if (!fs.existsSync(pkg)) continue;
  const p = JSON.parse(fs.readFileSync(pkg, 'utf8'));
  const bin = typeof p.bin === 'string' ? p.bin : p.bin && p.bin.lighthouse;
  if (bin) { console.log(JSON.stringify({ cli: join(d, '..', 'lighthouse', bin), version: p.version })); process.exit(0); }
}
process.exit(3);
`;

// The npx copy is located once and then run as `node <cli>`, without a shell. Measured 2026-10-15 on
// Windows: `npx --no-install lighthouse --version` took 23-27 s (13-58 s in another session) against
// 4-6 s for `node <cli> --version`, and --lh-motion both --lh-runs 3 is six launches; this lookup took
// 3-5 s. npx-cli.js next to node runs without cmd.exe; the npx on PATH is the fallback. The lookup
// gets 180 s, because a cold npx call took 58 s.
function npxLighthouse() {
  const dir = mkdtempSync(join(tmpdir(), 'pb-gates-'));
  try {
    const script = join(dir, 'locate.cjs');
    writeFileSync(script, LOCATE_LIGHTHOUSE);
    const args = ['--no-install', '-p', 'lighthouse', 'node', script];
    const npxCli = [join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npx-cli.js'), // Windows
      join(dirname(process.execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npx-cli.js')].find((p) => existsSync(p)); // Unix
    const opts = { encoding: 'utf8', timeout: 180000 };
    // npx stays unquoted on the shell path: cmd.exe runs a quoted "npx" with the wrong %~dp0.
    const probe = npxCli ? spawnSync(process.execPath, [npxCli, ...args], opts)
      : spawnSync(`npx ${args.slice(0, -1).join(' ')} "${script}"`, { ...opts, shell: true });
    if (probe.error?.code === 'ETIMEDOUT' || probe.signal) return { timedOut: true };
    let hit = null;
    try { hit = JSON.parse((probe.stdout || '').trim().split(/\r?\n/).pop()); } catch { /* not found */ }
    if (probe.status !== 0 || !hit || !existsSync(hit.cli)) return null;
    return { cmd: process.execPath, pre: [hit.cli], shell: false, via: `npx --no-install cache (${hit.version}), run with node` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Does this Chrome binary honour the switch that pins prefers-reduced-motion? Launched once per mode
// before the Lighthouse runs: a Chrome that dropped the switch would label a reduced run "motion on".
async function motionSwitchHonoured(puppeteer, chromePath, mode) {
  let b = null;
  try {
    b = await puppeteer.launch({ headless: true, executablePath: chromePath, args: [LH_SWITCH[mode]] });
    const p = await b.newPage();
    const got = await p.evaluate(() => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'no-preference'));
    return { ok: got === LH_EXPECT[mode], got, version: await b.version() };
  } catch (e) {
    return { ok: false, got: `launch failed: ${e.message.split('\n')[0].slice(0, 120)}` };
  } finally {
    if (b) await b.close().catch(() => {});
  }
}

function lighthouseRuns(url, lhCmd, chromePath, mode) {
  const runs = [];
  let version = null;
  const q = (x) => `"${x}"`;
  for (let k = 1; k <= LH_RUNS; k++) {
    const file = join(OUT, `lighthouse-${slug(url)}-motion-${mode}-${k}.json`);
    rmSync(file, { force: true });
    // Lighthouse on Windows often exits non-zero on a temp-folder cleanup (EPERM) after writing a good
    // report, so the report decides, not the exit code. A lighthouse.cmd (PATH, node_modules/.bin) runs
    // only through cmd.exe, so those arguments are quoted; the npx copy is node + its CLI, no shell.
    const opts = { encoding: 'utf8', timeout: 240000, env: { ...process.env, CHROME_PATH: chromePath } };
    const lhArgs = (wrap) => [wrap(url), '--output=json', `--output-path=${wrap(file)}`, '--quiet', '--only-categories=performance', wrap(`--chrome-flags=--headless=new ${LH_SWITCH[mode]}`)];
    const r = lhCmd.shell ? spawnSync(q(lhCmd.cmd), [...lhCmd.pre.map(q), ...lhArgs(q)], { ...opts, shell: true })
      : spawnSync(lhCmd.cmd, [...lhCmd.pre, ...lhArgs((x) => x)], opts);
    let j = null;
    try { j = JSON.parse(readFileSync(file, 'utf8')); } catch { /* no report */ }
    if (!j || !j.audits || j.runtimeError) return { error: `run ${k} gave no report: ${(j?.runtimeError?.message || r.stderr || r.error?.message || '').trim().split('\n').pop().slice(0, 160)}` };
    version = j.lighthouseVersion;
    runs.push({ lcp: j.audits['largest-contentful-paint'].numericValue, tbt: j.audits['total-blocking-time'].numericValue, cls: j.audits['cumulative-layout-shift'].numericValue, score: j.categories.performance.score });
  }
  const pick = (key) => median(runs.map((x) => x[key]));
  return { mode, version, runs, lcp: pick('lcp'), tbt: pick('tbt'), cls: pick('cls'), score: pick('score') };
}

// One verdict per motion mode. A baseline from before --lh-motion (one unlabelled Lighthouse result,
// measured in whatever mode the OS gave) is not compared: its mode is unknown, so the budgets judge.
function judgeLighthouse(url, lh, base, mode) {
  if (!lh) return;
  const scope = `mobile, motion ${mode}`;
  if (lh.error) { report(url, 'lighthouse', scope, false, lh.error); return; }
  const line = `median of ${lh.runs.length}: LCP ${(lh.lcp / 1000).toFixed(2)} s, TBT ${Math.round(lh.tbt)} ms, CLS ${lh.cls.toFixed(3)}, score ${Math.round(lh.score * 100)}`;
  const old = base?.lighthouse;
  const b = old && (old[mode] || null);
  const unlabelled = Boolean(old && typeof old.lcp === 'number'); // the old format kept lcp at the top
  const problems = [];
  if (b && !b.error) {
    if (lh.lcp > b.lcp * 1.1 && lh.lcp - b.lcp > 100) problems.push(`LCP ${Math.round(lh.lcp)} ms vs ${Math.round(b.lcp)} ms in the baseline`);
    if (lh.tbt > b.tbt * 1.1 && lh.tbt - b.tbt > 50) problems.push(`TBT ${Math.round(lh.tbt)} ms vs ${Math.round(b.tbt)} ms in the baseline`);
  } else {
    if (lh.lcp > BUDGET.lcp) problems.push(`LCP over ${BUDGET.lcp} ms`);
    if (lh.tbt > BUDGET.tbt) problems.push(`TBT over ${BUDGET.tbt} ms`);
  }
  if (lh.cls > BUDGET.cls) problems.push(`CLS over ${BUDGET.cls}`);
  const note = unlabelled ? ' (the baseline has no motion mode, so the budgets judged)' : '';
  report(url, 'lighthouse', scope, problems.length === 0, `${line}${problems.length ? `: ${problems.join('; ')}` : ''}${note}`);
}

// ---------------------------------------------------------------- report files
function markdown(store) {
  const fails = results.filter((r) => r.ok === false).length;
  const md = ['# Gates', '', `${new Date().toISOString()} · ${URLS.join(', ')}${BASELINE ? ` · baseline ${args.baseline}` : ''}`, '',
    fails ? `**FAIL: ${fails} of ${results.filter((r) => r.ok !== null).length} checks**` : '**PASS: every check**', '',
    '| | gate | scope | page | detail |', '|---|---|---|---|---|',
    ...results.map((r) => `| ${r.ok === null ? 'NOTE' : r.ok ? 'PASS' : 'FAIL'} | ${r.gate} | ${r.scope} | ${new URL(r.url).pathname} | ${String(r.detail).replace(/\|/g, '\\|')} |`)];
  for (const [url, s] of Object.entries(store)) {
    const axeRows = Object.entries(s.axe || {}).flatMap(([w, r]) => (r.violations || []).map((v) => `| ${w} | ${v.id} | ${v.impact} | ${v.nodes} | ${v.targets.join(', ').replace(/\|/g, '\\|')} |`));
    if (axeRows.length) md.push('', `## axe violations: ${url}`, '', '| width | rule | impact | nodes | first targets |', '|---|---|---|---|---|', ...axeRows);
    for (const mode of ['on', 'off']) {
      const lh = s.lighthouse && s.lighthouse[mode];
      const b = baselineFor(url)?.lighthouse?.[mode];
      if (!lh || lh.error) continue;
      md.push('', `## Lighthouse mobile, motion ${mode}: ${url}`, '', '| metric | median | baseline |', '|---|---|---|');
      for (const [k, unit] of [['lcp', 'ms'], ['tbt', 'ms'], ['cls', ''], ['score', '']]) {
        const f = (v) => (v === undefined || v === null ? '' : k === 'cls' ? v.toFixed(3) : k === 'score' ? Math.round(v * 100) : `${Math.round(v)} ${unit}`);
        md.push(`| ${k.toUpperCase()} | ${f(lh[k])} | ${b && !b.error ? f(b[k]) : ''} |`);
      }
    }
  }
  return md.join('\n');
}

// ---------------------------------------------------------------- main
await mkdir(OUT, { recursive: true });
const puppeteer = loadPuppeteer();
const store = {};
const browser = await puppeteer.launch({ headless: true, args: ['--hide-scrollbars', '--disable-background-timer-throttling'] });
try {
  for (const url of URLS) {
    try {
      store[url] = await collect(browser, url);
    } catch (e) {
      report(url, 'load', '', false, e.message.split('\n')[0]);
      continue;
    }
    const s = store[url], base = baselineFor(url);
    judgeAxe(url, s, base);
    judgeAnchors(url, s);
    judgeOverflow(url, s);
    judgeNojs(url, s);
    judgeForms(url, s);
    judgeConsole(url, s);
  }
} finally {
  await browser.close();
}
let lhMeta = null;
if (need('lighthouse')) { // after the browser closes, so the measured runs do not share the CPU
  const found = findLighthouse();
  const lhCmd = found && !found.timedOut ? found : null;
  const chromePath = process.env.CHROME_PATH || puppeteer.executablePath();
  const honoured = {};
  if (lhCmd) for (const mode of LH_MODES) honoured[mode] = await motionSwitchHonoured(puppeteer, chromePath, mode);
  lhMeta = lhCmd ? { via: lhCmd.via, chrome: chromePath, modes: LH_MODES, switches: LH_SWITCH, preflight: honoured }
    : found ? { via: 'npx --no-install', timedOut: true } : null;
  for (const url of URLS.filter((u) => store[u])) {
    if (found && found.timedOut) {
      report(url, 'lighthouse', '', false, 'lighthouse discovery through npx --no-install timed out after 180 s, so nothing was measured; install lighthouse on PATH or in node_modules/.bin (npm i -D lighthouse)');
      continue;
    }
    if (!lhCmd) {
      report(url, 'lighthouse', '', null, 'skipped: no lighthouse found on PATH, in node_modules/.bin or through npx --no-install (npm i -g lighthouse; 13.x needs Node 22.19 or newer, use lighthouse@12.8.2 on older Node, foundations.md §2)');
      continue;
    }
    store[url].lighthouse = {};
    for (const mode of LH_MODES) {
      const h = honoured[mode];
      if (!h.ok) {
        report(url, 'lighthouse', `mobile, motion ${mode}`, false, `not measured: this Chrome ignores ${LH_SWITCH[mode]} (prefers-reduced-motion stayed ${h.got}); set CHROME_PATH to a Chrome that honours it`);
        continue;
      }
      store[url].lighthouse[mode] = lighthouseRuns(url, lhCmd, chromePath, mode);
      judgeLighthouse(url, store[url].lighthouse[mode], baselineFor(url), mode);
    }
  }
}
await writeFile(join(OUT, 'gates.json'), JSON.stringify({ takenAt: new Date().toISOString(), axeVersion: AXE_VERSION, budgets: BUDGET, lighthouse: lhMeta, urls: store, results }, null, 2));
await writeFile(join(OUT, 'gates.md'), markdown(store));
const failed = results.filter((r) => r.ok === false).length;
console.log(`\n${failed ? `FAIL: ${failed} check(s) failed` : 'PASS: every check'} (${results.filter((r) => r.ok !== null).length} checks) -> ${join(OUT, 'gates.md')}`);
process.exit(failed ? 1 : 0);
