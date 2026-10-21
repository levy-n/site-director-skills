#!/usr/bin/env node
// scroll-film: record how a page behaves while it is scrolled, the way a person scrolls it.
//
//   node scroll-film.mjs <url> [--out ./film] [--viewports desktop,short,mobile] [--step 0.5]
//                              [--settle 700] [--intro 4500] [--video] [--max 160]
//   node scroll-film.mjs <url> --at 0,story:0.5,1800 [--out ./film] [--viewports desktop,mobile]
//
// Viewports (default desktop,mobile): desktop 1440x900; short 1440x700, a laptop screen under browser
// chrome, where a full-screen scene sized for 900 px loses its bottom; laptop 1280x720; mobile 390x844
// (DPR 2, touch, iPhone user agent). All DPR 1 except mobile.
//
// Output per viewport: numbered stills (scrollY in the name), intro frames, an optional
// continuous-scroll scroll.webm + frame strip, meta.json (stack fingerprint, fonts, palette, pins),
// and film.html: a contact sheet you can open in a browser or screenshot.
// The video is WebM (VP9), the format puppeteer's screencast writes; ffmpeg and Chrome play it.
//
// --at films only the listed scroll states, through the engine's ?at= QA hook: a pixel offset or
// <triggerId>:<progress 0..1>. Each state is a fresh load with ?at=<value>; the frame is taken after
// html[data-at] appears, the hook's last re-jump (3 s) and --settle. Output: at-<value>.jpg, at.json
// and at.html per viewport. Use it to check one range while building a section, instead of a full film.
// A page without the hook still gets its pixel offsets, by real scrolling; trigger ids need the hook.
//
// Why it exists: settled full-page screenshots hide everything that makes a scroll experience
// good or bad: pins, scrubbed timelines, velocity effects, intros. This walks the page in
// half-viewport steps with motion ENABLED (headless Chrome follows the OS setting, and an OS with
// animation effects off reports reduce: Nati's machine does).

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

// --help: print the leading comment block of this file and exit
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

const args = parseArgs(process.argv.slice(2));
const URL_ARG = args._[0];
const USAGE = 'usage: node scroll-film.mjs <url> [--out dir] [--viewports desktop,short,laptop,mobile] [--step 0.5] [--video]\n' +
  '       node scroll-film.mjs <url> --at <px|triggerId:progress,...> [--out dir] [--viewports desktop,mobile]';
if (!URL_ARG || args.at === true) {
  console.error(USAGE);
  process.exit(2);
}
const AT = args.at ? String(args.at).split(',').map((s) => s.trim()).filter(Boolean) : null;
const badAt = (AT || []).filter((v) => !/^-?\d+(\.\d+)?$/.test(v) && !/^[^:\s]+:(0|1|0?\.\d+|1\.0+)$/.test(v));
if (badAt.length) {
  console.error(`--at values are pixels or <triggerId>:<0..1>; cannot read ${badAt.join(', ')}\n${USAGE}`);
  process.exit(2);
}
const OUT = resolve(args.out || './film');
const STEP = Number(args.step || 0.5);
const SETTLE = Number(args.settle || 700);
const INTRO_MS = Number(args.intro || 4500);
const MAX_FRAMES = Number(args.max || 160);
const VIEWPORTS = (args.viewports || 'desktop,mobile').split(',');

const PROFILES = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  // the same desktop, 200 px shorter: full-screen scenes and stages must still fit (1440x900 vs 1440x700)
  short: { width: 1440, height: 700, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  laptop: { width: 1280, height: 720, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  mobile: {
    width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  },
};

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

function loadPuppeteer() {
  const tryFrom = (base) => { try { return createRequire(base)('puppeteer'); } catch { return null; } };
  for (const base of [import.meta.url, join(process.cwd(), 'noop.js')]) {
    const p = tryFrom(base);
    if (p) return p;
  }
  // Only now ask npm for the global folder: `npm root -g` alone takes about 4 s on Windows.
  try {
    const p = tryFrom(join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'noop.js'));
    if (p) return p;
  } catch { /* no global npm */ }
  console.error('puppeteer not found. Run from a project that has it (npm i -D puppeteer) or install it globally.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pad = (n, w = 4) => String(n).padStart(w, '0');

async function waitForStillScroll(page, maxMs = 4000) {
  let last = -1, stableFor = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const y = await page.evaluate(() => Math.round(window.scrollY));
    stableFor = y === last ? stableFor + 100 : 0;
    if (stableFor >= 300) return y;
    last = y;
    await sleep(100);
  }
  return last;
}

// Desktop: real wheel ticks (smooth-scroll libraries intercept wheel, not scrollTo).
// Mobile: a synthesized touch gesture through the compositor, like a finger. Headless Chrome
// sometimes accepts the gesture without scrolling, so verify movement and fall back to a
// native scroll: touch smooth-scroll setups (Lenis syncTouch:false) follow native scroll anyway.
async function scrollBy(page, cdp, profile, delta) {
  if (profile.isMobile) {
    const before = await page.evaluate(() => scrollY);
    await cdp.send('Input.synthesizeScrollGesture', {
      x: Math.round(profile.width / 2), y: Math.round(profile.height * 0.6),
      yDistance: -delta, speed: 1400, gestureSourceType: 'touch', preventFling: true,
    }).catch(() => {});
    const moved = Math.abs((await page.evaluate(() => scrollY)) - before) > 2;
    if (!moved) await page.evaluate((d) => window.scrollTo({ top: scrollY + d, behavior: 'instant' }), delta);
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

async function fingerprint(page) {
  return page.evaluate(() => {
    const w = window;
    const has = (k) => typeof w[k] !== 'undefined';
    const html = document.documentElement;
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const families = new Set();
    document.querySelectorAll('h1,h2,h3,p,a,button,span,li').forEach((el, i) => {
      if (i < 600) families.add(cs(el).fontFamily.split(',')[0].replace(/["']/g, '').trim());
    });
    const colors = new Map();
    document.querySelectorAll('body *').forEach((el, i) => {
      if (i > 4000) return;
      const s = cs(el);
      for (const c of [s.color, s.backgroundColor]) {
        if (c && c !== 'rgba(0, 0, 0, 0)') colors.set(c, (colors.get(c) || 0) + 1);
      }
    });
    const fixedOrSticky = [];
    document.querySelectorAll('body *').forEach((el) => {
      const p = cs(el).position;
      if ((p === 'fixed' || p === 'sticky') && fixedOrSticky.length < 40) {
        fixedOrSticky.push(`${p}:${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`);
      }
    });
    return {
      title: document.title,
      lang: html.lang, dir: html.dir || getComputedStyle(html).direction,
      scrollHeight: document.documentElement.scrollHeight,
      viewport: { w: innerWidth, h: innerHeight },
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      finePointer: matchMedia('(hover:hover) and (pointer:fine)').matches,
      globals: {
        gsap: has('gsap'), ScrollTrigger: has('ScrollTrigger'), Lenis: has('Lenis') || has('lenis'),
        THREE: has('THREE'), Motion: has('Motion'), anime: has('anime'), Webflow: has('Webflow'),
        Framer: has('__framer_importFromPackage'), next: has('__NEXT_DATA__'), barba: has('barba'),
      },
      htmlClasses: html.className,
      smoothScrollClass: /lenis|locomotive|has-scroll-smooth/.test(html.className + ' ' + document.body.className),
      pinSpacers: document.querySelectorAll('.pin-spacer').length,
      counts: {
        sections: document.querySelectorAll('section').length,
        canvas: document.querySelectorAll('canvas').length,
        video: document.querySelectorAll('video').length,
        svg: document.querySelectorAll('svg').length,
        img: document.querySelectorAll('img').length,
        headings: document.querySelectorAll('h1,h2,h3').length,
      },
      fontsLoaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`),
      fontFamiliesInUse: [...families].slice(0, 20),
      topColors: [...colors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14),
      fixedOrSticky,
      bodyBg: cs(document.body).backgroundColor,
      bodyColor: cs(document.body).color,
    };
  });
}

async function frameContext(page, profile) {
  return page.evaluate(({ w, h }) => {
    const el = document.elementFromPoint(w / 2, h / 2);
    const sec = el && el.closest('section,[id],header,footer,main > div');
    const tag = (n) => (n ? `${n.tagName.toLowerCase()}${n.id ? '#' + n.id : ''}${typeof n.className === 'string' && n.className.trim() ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}` : '');
    const pinned = [...document.querySelectorAll('.pin-spacer > *')].filter((p) => getComputedStyle(p).position === 'fixed').map(tag);
    return { y: Math.round(scrollY), center: tag(el), section: tag(sec), pinned };
  }, { w: profile.width, h: profile.height });
}

async function filmViewport(browser, name) {
  const profile = PROFILES[name];
  if (!profile) throw new Error(`unknown viewport "${name}": use ${Object.keys(PROFILES).join(', ')}`);
  const dir = join(OUT, name);
  await mkdir(join(dir, 'intro'), { recursive: true });
  const page = await browser.newPage();
  if (profile.ua) await page.setUserAgent(profile.ua);
  await page.setViewport(profile);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  const cdp = await page.createCDPSession();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e.message).slice(0, 200)));

  // Intro: frames from navigation start, so preloaders and entrance timelines are visible.
  const navStart = Date.now();
  const resp = await page.goto(URL_ARG, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (!resp || resp.status() >= 400) throw new Error(`[${name}] ${URL_ARG} did not load (${resp ? 'HTTP ' + resp.status() : 'no response'}): a film of an error page proves nothing`);
  const introShots = [];
  for (const at of [0, 250, 600, 1000, 1500, 2200, 3000, 4000, INTRO_MS]) {
    const wait = at - (Date.now() - navStart);
    if (wait > 0) await sleep(wait);
    const file = `intro/i-${pad(at, 5)}ms.jpg`;
    await page.screenshot({ path: join(dir, file), type: 'jpeg', quality: 72, captureBeyondViewport: false });
    introShots.push({ file, t: at });
  }
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await sleep(600);

  const meta = await fingerprint(page);
  const stepPx = Math.round(profile.height * STEP);
  const frames = [];
  let target = 0;
  let stuck = 0;
  for (let i = 0; i < MAX_FRAMES; i++) {
    const y = await waitForStillScroll(page);
    await sleep(SETTLE);
    const ctx = await frameContext(page, profile);
    const file = `f-${pad(i)}-y${pad(ctx.y, 6)}.jpg`;
    await page.screenshot({ path: join(dir, file), type: 'jpeg', quality: 72, captureBeyondViewport: false });
    frames.push({ file, ...ctx });
    const maxY = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    if (y >= maxY - 2) break;
    // A page that refuses to scroll (scroll lock left on, overlay, broken smooth-scroll) would
    // otherwise burn every frame on the same spot: stop and say so.
    stuck = i > 0 && Math.abs(y - frames[i - 1].y) < 2 ? stuck + 1 : 0;
    if (stuck >= 3) {
      console.warn(`[${name}] scroll is stuck at y=${y} (max ${maxY}): check for a scroll lock (overflow:hidden, lenis.stop) or an overlay`);
      break;
    }
    target = Math.min(maxY, y + stepPx);
    await scrollBy(page, cdp, profile, target - y);
  }
  if (frames.length >= MAX_FRAMES) console.warn(`[${name}] stopped at --max ${MAX_FRAMES} frames before the end of the page`);
  meta.finalScrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  let video = null;
  if (args.video) video = await recordContinuous(browser, profile, dir);

  const report = { url: URL_ARG, viewport: name, profile, stepPx, settleMs: SETTLE, meta, introShots, frames, video, consoleErrors };
  await writeFile(join(dir, 'meta.json'), JSON.stringify(report, null, 2));
  await writeFile(join(dir, 'film.html'), contactSheet(report));
  await page.close();
  console.log(`[${name}] ${frames.length} frames, page ${meta.finalScrollHeight}px, pins ${meta.pinSpacers}, errors ${consoleErrors.length} -> ${dir}`);
}

// A continuous scroll at a human pace, recorded as video, then sampled into a strip:
// shows what settled stills cannot (velocity skew, scrub lag, marquee speed-up, pin hand-offs).
async function recordContinuous(browser, profile, dir) {
  const page = await browser.newPage();
  if (profile.ua) await page.setUserAgent(profile.ua);
  await page.setViewport(profile);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  const cdp = await page.createCDPSession();
  await page.goto(URL_ARG, { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
  await sleep(INTRO_MS);
  const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
  // WebM (VP9) is puppeteer's screencast default. Its mp4 option still encodes VP9 and needs an
  // ffmpeg with -movflags hybrid_fragmented, which older builds lack; WebM plays in Chrome and ffmpeg.
  const file = join(dir, 'scroll.webm');
  const rec = await page.screencast({ path: file, ffmpegPath, fps: 30, quality: 28 }).catch((e) => {
    console.warn(`screencast unavailable (${e.message}): skipping video`);
    return null;
  });
  if (!rec) { await page.close(); return null; }
  const maxY = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const t0 = Date.now();
  let y = 0;
  while (y < maxY - 4 && Date.now() - t0 < 120000) {
    await scrollBy(page, cdp, profile, profile.isMobile ? 260 : 100);
    await sleep(profile.isMobile ? 120 : 45);
    y = await page.evaluate(() => scrollY);
  }
  await sleep(1200);
  await rec.stop();
  await page.close();
  const strip = join(dir, 'scroll-strip.jpg');
  try {
    execSync(`"${ffmpegPath}" -y -loglevel error -i "${file}" -vf "fps=2,scale=360:-1,tile=6x8" -frames:v 1 -q:v 4 "${strip}"`);
    execSync(`"${ffmpegPath}" -y -loglevel error -i "${file}" -vf "fps=3,scale=720:-1" -q:v 4 "${join(dir, 'motion-%04d.jpg')}"`);
  } catch (e) { console.warn(`ffmpeg post-processing failed: ${e.message}`); }
  return { file: 'scroll.webm', strip: 'scroll-strip.jpg', seconds: Math.round((Date.now() - t0) / 1000) };
}

// ---- --at: exact scroll states through the engine's ?at= hook ---------------------------------
const AT_LAST_JUMP_MS = 3100; // the engine re-jumps 0.5, 1.5 and 3 s after fonts are ready

function atUrl(value) {
  const u = new URL(URL_ARG);
  u.searchParams.set('at', value);
  return u.href;
}

async function waitForAtStamp(page, maxMs = 10000) { // the engine may load after first paint (idle + import)
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const stamp = await page.evaluate(() => document.documentElement.dataset.at ?? null).catch(() => null);
    if (stamp !== null) return stamp;
    await sleep(100);
  }
  return null;
}

async function shootAt(browser, profile, name, dir, value) {
  const page = await browser.newPage();
  if (profile.ua) await page.setUserAgent(profile.ua);
  await page.setViewport(profile);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  const cdp = await page.createCDPSession();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)));
  const url = atUrl(value);
  const resp = await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  if (!resp || resp.status() >= 400) throw new Error(`[${name}] ${url} did not load (${resp ? 'HTTP ' + resp.status() : 'no response'})`);
  const entry = { at: value, url, hook: false, stamp: null, file: null, errors };
  let stamp = await waitForAtStamp(page);
  if (stamp !== null) {
    entry.hook = true;
    if (stamp.startsWith('missing:')) {
      entry.stamp = stamp;
      entry.problem = `no ScrollTrigger with id "${value.split(':')[0]}" (give the scene's main trigger that id)`;
      await page.close();
      return entry;
    }
    await sleep(AT_LAST_JUMP_MS);
    stamp = await page.evaluate(() => document.documentElement.dataset.at ?? null);
  } else if (/^-?\d/.test(value)) {
    // No hook on this page: reach the pixel offset the way a person would.
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    await sleep(600);
    const maxY = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const target = Math.max(0, Math.min(maxY, Number(value)));
    let y = await waitForStillScroll(page);
    for (let i = 0; i < 6 && Math.abs(target - y) > 2; i++) {
      await scrollBy(page, cdp, profile, target - y);
      y = await waitForStillScroll(page);
    }
    entry.problem = 'no ?at= hook on this page (html[data-at] never appeared); reached by scrolling';
  } else {
    entry.problem = 'no ?at= hook on this page (html[data-at] never appeared); trigger ids need the engine';
    await page.close();
    return entry;
  }
  await waitForStillScroll(page);
  await sleep(SETTLE);
  const ctx = await frameContext(page, profile);
  entry.stamp = stamp;
  entry.file = `at-${value.replace(/[^A-Za-z0-9._-]+/g, '-')}.jpg`;
  Object.assign(entry, ctx);
  await page.screenshot({ path: join(dir, entry.file), type: 'jpeg', quality: 80, captureBeyondViewport: false });
  await page.close();
  return entry;
}

async function filmAt(browser, name) {
  const profile = PROFILES[name];
  if (!profile) throw new Error(`unknown viewport "${name}": use ${Object.keys(PROFILES).join(', ')}`);
  const dir = join(OUT, name);
  await mkdir(dir, { recursive: true });
  const shots = [];
  for (const value of AT) {
    const shot = await shootAt(browser, profile, name, dir, value);
    shots.push(shot);
    console.log(`[${name}] at=${value} -> ${shot.file ? `y=${shot.y} ${shot.file}` : 'no frame'}${shot.problem ? `  (${shot.problem})` : ''}`);
  }
  await writeFile(join(dir, 'at.json'), JSON.stringify({ url: URL_ARG, viewport: name, profile, settleMs: SETTLE, shots }, null, 2));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  await writeFile(join(dir, 'at.html'), `<!doctype html><meta charset="utf-8"><title>at: ${esc(name)}</title>
<style>body{margin:0;padding:24px;background:#111;color:#ddd;font:12px/1.4 ui-monospace,monospace}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(${profile.isMobile ? 220 : 420}px,1fr));gap:12px}
figure{margin:0}img{width:100%;display:block;border:1px solid #333}figcaption{padding:4px 0;color:#9a9a9a}</style>
<h1>${esc(URL_ARG)} · ${esc(name)} · ${shots.length} states</h1><div class="g">${shots.map((s) => `<figure>${s.file ? `<img src="${s.file}">` : ''}<figcaption>at=${esc(s.at)}${s.file ? ` · y=${s.y} · ${esc(s.section)}` : ''}${s.problem ? ` · ${esc(s.problem)}` : ''}</figcaption></figure>`).join('')}</div>`);
  return shots;
}

function contactSheet(r) {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const cell = (f, label) => `<figure><img loading="lazy" src="${f}"><figcaption>${esc(label)}</figcaption></figure>`;
  return `<!doctype html><meta charset="utf-8"><title>scroll film: ${esc(r.viewport)}</title>
<style>body{margin:0;padding:24px;background:#111;color:#ddd;font:12px/1.4 ui-monospace,monospace}
h1,h2{font-weight:500}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(${r.profile.isMobile ? 180 : 300}px,1fr));gap:12px}
figure{margin:0}img{width:100%;display:block;border:1px solid #333}figcaption{padding:4px 0;color:#9a9a9a}
pre{white-space:pre-wrap;background:#1a1a1a;padding:12px;border:1px solid #2a2a2a}</style>
<h1>${esc(r.url)} · ${esc(r.viewport)} · ${r.frames.length} frames · step ${r.stepPx}px</h1>
<h2>Intro</h2><div class="g">${r.introShots.map((s) => cell(s.file, `${s.t}ms`)).join('')}</div>
<h2>Scroll</h2><div class="g">${r.frames.map((f) => cell(f.file, `y=${f.y} · ${f.section}${f.pinned.length ? ' · PINNED ' + f.pinned.join(' ') : ''}`)).join('')}</div>
${r.video ? `<h2>Continuous scroll strip</h2><img src="${r.video.strip}" style="max-width:100%">` : ''}
<h2>Fingerprint</h2><pre>${esc(JSON.stringify(r.meta, null, 2))}</pre>`;
}

const puppeteer = loadPuppeteer();
const browser = await puppeteer.launch({
  headless: true,
  args: ['--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling'],
});
let missed = 0;
try {
  for (const v of VIEWPORTS) {
    if (AT) missed += (await filmAt(browser, v.trim())).filter((s) => !s.file).length;
    else await filmViewport(browser, v.trim());
  }
} finally {
  await browser.close();
}
if (missed) {
  console.error(`${missed} --at state(s) could not be filmed; see the lines above`);
  process.exit(1);
}
