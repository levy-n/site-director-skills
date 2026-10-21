#!/usr/bin/env node
// site-director · stills of a direction proof (references/direction-proof.md): the opening at 0.3,
// 0.9, 1.5 and 2.6s, a pointer ripple (desktop), then every .s section, motion forced on; prints page
// errors. Puppeteer resolves from PROOF_PROJECT (a project folder with puppeteer) or the current folder.
// Usage: node proof-shots.mjs <file.html> <outDir> <WxH>
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire((process.env.PROOF_PROJECT || process.cwd()).split(String.fromCharCode(92)).join('/') + '/package.json');
const puppeteer = require('puppeteer');
const [file, out, size] = process.argv.slice(2);
if (!file || !out || !size) { console.log('usage: node proof-shots.mjs <file.html> <outDir> <WxH>'); process.exit(file === '--help' ? 0 : 1); }
mkdirSync(out, { recursive: true });
const [w, h] = size.split('x').map(Number);
const b = await puppeteer.launch({ headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage();
const logs = [];
p.on('console', (m) => logs.push(m.type() + ': ' + m.text().slice(0, 200)));
p.on('pageerror', (e) => logs.push('pageerror: ' + e.message));
await p.setViewport({ width: w, height: h, isMobile: w < 768, hasTouch: w < 768 });
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
p.goto('file:///' + file.split(String.fromCharCode(92)).join('/')).catch(() => {});
await p.waitForSelector('#field');
const t0 = Date.now();
for (const [ms, name] of [[300, 'a'], [900, 'b'], [1500, 'c'], [2600, 'd']]) { await sleep(Math.max(0, ms - (Date.now() - t0))); await p.screenshot({ path: `${out}/open-${name}.png` }); }
if (w >= 768) { for (let i = 0; i < 30; i++) { await p.mouse.move(w * 0.2 + i * 12, h * 0.5 + Math.sin(i / 4) * 60); await sleep(16); } await p.screenshot({ path: `${out}/ripple.png` }); }
const n = await p.evaluate(() => document.querySelectorAll('.s').length);
for (let i = 1; i < n; i++) {
  await p.evaluate((k) => { const s = document.querySelectorAll('.s')[k]; window.scrollTo(0, s.offsetTop); }, i);
  await sleep(2200);
  await p.screenshot({ path: `${out}/s${i}.png` });
}
console.log(logs.filter((l) => /error/i.test(l)).join('\n') || 'no errors');
await b.close();
