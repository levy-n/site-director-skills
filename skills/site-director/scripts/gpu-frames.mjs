#!/usr/bin/env node
// gpu-frames: frames of a WebGL-led page (a reference or our own build) rendered with the GPU on, in the
// states that matter for a material: at rest, after a scroll, mid pointer sweep, after the pointer stops,
// and on a press; plus zoomed crops (4x, nearest neighbour) that show the material's real structure.
// Why: the built-in browser pane and plain headless shells can draw WebGL black, and a scaled JPEG
// screenshot hides 2-pixel structure (tiny squares look like round dots).
// Node 20+; needs puppeteer resolvable from the project (cwd) or NODE_PATH; ffmpeg on PATH for --zoom.
// Exit 0 = frames taken, 1 = the page failed or WebGL was missing, 2 = usage error or no puppeteer.

import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const HELP = `gpu-frames: WebGL frames with the GPU on, in rest / scroll / sweep / decay / press states.

  node gpu-frames.mjs <url> [--out frames] [--vp 1440x900] [--mobile] [--wait 8000] [--scroll 300]
                            [--zoom x,y,w,h]... [--session key=value]...

--vp       viewport for the desktop pass (default 1440x900, DPR 1)
--mobile   shoot a phone instead: 390x844, DPR 3, touch (no pointer states; many sites switch WebGL
           off on touch, which is itself a finding)
--wait     ms after load before the first frame (videos and intros), default 8000
--scroll   px for the scrolled frame, default 300
--zoom     a crop of the scrolled frame, in CSS px, saved 4x with nearest neighbour (repeatable)
--session  sessionStorage key=value before any script runs (skip intros and popups); repeatable

The pointer waits at the top centre during load, as it does when a person takes a screenshot, because
pointer-led effects change the frame. Output: rest.png, scrolled.png, sweep.png, decay.png, press.png
(desktop), zoom-<n>.png, frames.json (WebGL support, canvases, playing videos, page errors).
Prefers-reduced-motion is emulated as no-preference.`;

const args = process.argv.slice(2);
if (!args.length || args.includes('--help')) { console.log(HELP); process.exit(args.length ? 0 : 2); }
const url = args[0];
const opt = { out: 'frames', vp: '1440x900', mobile: false, wait: 8000, scroll: 300, zoom: [], session: [] };
for (let i = 1; i < args.length; i++) {
  const a = args[i];
  if (a === '--mobile') opt.mobile = true;
  else if (a === '--zoom') opt.zoom.push(args[++i].split(',').map(Number));
  else if (a === '--session') opt.session.push(args[++i]);
  else if (['--out', '--vp', '--wait', '--scroll'].includes(a)) opt[a.slice(2)] = args[++i];
  else { console.error(`unknown option ${a}\n\n${HELP}`); process.exit(2); }
}
let puppeteer;
try { puppeteer = createRequire(join(process.cwd(), 'package.json'))('puppeteer'); } catch {
  console.error('puppeteer is not resolvable from this folder: run from the project, or npm i -D puppeteer'); process.exit(2);
}
const out = resolve(opt.out);
mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const [w, h] = opt.vp.split('x').map(Number);
const viewport = opt.mobile ? { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { width: w, height: h, deviceScaleFactor: 1 };

const browser = await puppeteer.launch({ headless: true, args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--autoplay-policy=no-user-gesture-required'] });
const errors = [];
let ok = true;
try {
  const p = await browser.newPage();
  await p.setViewport(viewport);
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  const pairs = opt.session.map((s) => s.split('='));
  await p.evaluateOnNewDocument((kv) => { try { kv.forEach(([k, v]) => sessionStorage.setItem(k, v)); } catch { /* private */ } }, pairs);
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  if (!opt.mobile) await p.mouse.move(viewport.width / 2, 5);
  await p.goto(url, { waitUntil: 'networkidle2', timeout: 90000 }).catch((e) => errors.push(`goto: ${e.message}`));
  await sleep(Number(opt.wait));
  await p.screenshot({ path: join(out, 'rest.png') });
  await p.evaluate((y) => window.scrollBy(0, y), Number(opt.scroll));
  if (!opt.mobile) await p.mouse.wheel({ deltaY: 1 });
  await sleep(1500);
  await p.screenshot({ path: join(out, 'scrolled.png') });
  if (!opt.mobile) {
    for (let i = 0; i < 30; i++) { await p.mouse.move(viewport.width * 0.15 + i * viewport.width * 0.024, viewport.height * 0.33 + viewport.height * 0.16 * Math.sin(i / 5)); await sleep(16); }
    await p.screenshot({ path: join(out, 'sweep.png') });
    await sleep(400);
    await p.screenshot({ path: join(out, 'decay.png') });
    await p.mouse.move(viewport.width / 2, viewport.height / 2);
    await p.mouse.down(); await sleep(1500);
    await p.screenshot({ path: join(out, 'press.png') });
    await p.mouse.up();
  }
  const info = await p.evaluate(() => {
    const c = document.createElement('canvas');
    return {
      webgl2: !!c.getContext('webgl2'), webgl: !!document.createElement('canvas').getContext('webgl'),
      canvases: [...document.querySelectorAll('canvas')].map((x) => `${x.className || x.id || 'canvas'} ${x.width}x${x.height}`),
      videosPlaying: [...document.querySelectorAll('video')].filter((v) => !v.paused).length,
    };
  });
  if (!info.webgl && !info.webgl2) { ok = false; errors.push('no WebGL in this browser: frames will not show the material'); }
  writeFileSync(join(out, 'frames.json'), JSON.stringify({ url, viewport, ...info, errors }, null, 2));
  console.log(JSON.stringify({ ...info, errors: errors.slice(0, 5) }, null, 1));
} catch (e) { ok = false; console.error(e.message); }
await browser.close();

opt.zoom.forEach(([x, y, cw, ch], i) => {
  const s = opt.mobile ? 3 : 1;
  const vf = `crop=${cw * s}:${ch * s}:${x * s}:${y * s},scale=${cw * 4}:${ch * 4}:flags=neighbor`;
  const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', join(out, 'scrolled.png'), '-vf', vf, join(out, `zoom-${i + 1}.png`)]);
  if (r.error || r.status) console.log(`zoom ${i + 1}: run by hand: ffmpeg -i scrolled.png -vf "${vf}" zoom-${i + 1}.png`);
});
console.log(`frames in ${out}`);
process.exit(ok ? 0 : 1);
