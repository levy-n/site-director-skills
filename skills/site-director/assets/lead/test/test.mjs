import { createRequire } from 'node:module';
// Run from a project where puppeteer is installed: node <skill>/assets/lead/test/test.mjs
const require = createRequire(process.cwd() + '/package.json');
const puppeteer = require('puppeteer');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Scenario test for lead-intent.js: 10 visitor behaviours, each in a fresh browser context, timings scaled x0.1.
const here = path.dirname(fileURLToPath(import.meta.url));
const serve = (u) => (u === '/lead-intent.js' ? path.join(here, '..', 'lead-intent.js') : path.join(here, u === '/' ? 'index.html' : u));
const srv = http.createServer((q, r) => { const f = serve(decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' }); fs.createReadStream(f).pipe(r); }).listen(4391);
const B = await puppeteer.launch({ headless: 'new' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
async function run(name, fn, { mobile = false, scale = 0.1, threshold = 2 } = {}) {
  const ctx = await B.createBrowserContext(); // fresh storage per scenario (converted/dismissed flags persist)
  const p = await ctx.newPage();
  if (mobile) await p.emulate({ viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148' });
  else await p.setViewport({ width: 1440, height: 900 });
  await p.goto(`http://localhost:4391/?scale=${scale}&threshold=${threshold}&lead=debug`); const logs=[]; p.on("console", (m) => logs.push(m.text())); await p.waitForFunction('window.ready');
  const keepActive = async (ms) => { const end = Date.now() + ms; while (Date.now() < end) { await p.mouse.move(500 + Math.random() * 50, 400); await sleep(250); } };
  let out; try { out = await fn(p, keepActive); } catch (e) { out = 'ERROR ' + e.message; }
  const opens = await p.evaluate(() => window.opens);
  results.push({ name, out, opens: opens.map((o) => o.reason), });
  await ctx.close();
}
const scrollTo = (p, y) => p.evaluate((y) => window.scrollTo(0, y), y);
const H = (p) => p.evaluate(() => document.documentElement.scrollHeight);

// 1. a visitor who only sits on the hero: never opens (no timer)
await run('idle on hero 6s (=60s real)', async (p, act) => { await act(6000); return 'expect: no open'; });
// 2. engaged reading + dwell on an interest section -> opens by score when calm
await run('read slowly to process, dwell', async (p, act) => { const h = await H(p); for (let y = 0; y < h * 0.5; y += 300) { await scrollTo(p, y); await act(300); } await p.evaluate(() => document.getElementById('process').scrollIntoView()); await act(3500); return 'expect: open score'; });
// 3. constant scrolling: never opens mid-gesture even with points
await run('keeps scrolling', async (p, act) => { const h = await H(p); for (let i = 0; i < 40; i++) { await scrollTo(p, (i * 400) % (h * 0.6)); await sleep(150); } return 'expect: no open while scrolling'; });
// 4. typing in the form: never opens
await run('typing in form', async (p, act) => { await p.focus('#name'); await p.evaluate(() => document.getElementById('process').scrollIntoView()); for (let i = 0; i < 18; i++) { await p.keyboard.type('א'); await sleep(250); } const during = await p.evaluate(() => window.opens.length); await p.evaluate(() => document.activeElement.blur()); await act(2500); return 'opens while typing: ' + during + ' (expect 0), then opens after blur'; });
// 5. converted via WhatsApp: never again
await run('clicked whatsapp', async (p, act) => { await p.evaluate(() => document.getElementById('wa').addEventListener('click', (e) => e.preventDefault())); await p.click('#wa'); await act(4000); return 'expect: no open (converted)'; });
// 6. exit intent on desktop after reading
await run('exit intent desktop', async (p, act) => { const h = await H(p); for (let y = 0; y < h * 0.35; y += 300) { await scrollTo(p, y); await act(250); } await act(1200); await p.mouse.move(700, 300); await p.mouse.move(700, 5); await p.mouse.move(700, -10); await p.evaluate(() => document.dispatchEvent(new MouseEvent('mouseout', { clientX: 700, clientY: -2, relatedTarget: null, bubbles: true }))); await sleep(600); return 'expect: open exit-intent'; }, { threshold: 9 });
// 7. read everything to the footer, then scroll back up fast (mobile)
await run('read all then back up (mobile)', async (p, act) => { const h = await H(p); for (let y = 0; y < h; y += 500) { await scrollTo(p, y); await act(150); } await scrollTo(p, h); await act(1500); await scrollTo(p, h - 844 * 1.2); await sleep(80); await scrollTo(p, h - 844 * 3.4); await sleep(1200); await act(800); return 'expect: open read-all-then-back'; }, { mobile: true, threshold: 9 });
// 8. FAQ toggles twice + engaged reading
await run('faq considering', async (p, act) => { await p.evaluate(() => document.getElementById('faq').scrollIntoView()); await act(800); await p.click('#q1'); await p.click('#q2'); await p.evaluate(() => document.activeElement.blur()); await sleep(4200); await act(3000); return 'expect: open (considering + interest)'; });
// 9. contact form in view: blocked even with points
await run('contact in view', async (p, act) => { await p.evaluate(() => document.getElementById('faq').scrollIntoView()); await act(900); await p.click('#q1'); await p.click('#q2'); await p.evaluate(() => { document.activeElement.blur(); document.getElementById('contact').scrollIntoView(); }); await sleep(4500); await act(2000); return 'expect: no open (contact visible)'; });
await run('dismissed then more reading', async (p, act) => { await p.evaluate(() => window.intent.dismissed()); const h = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < h * 0.6; y += 300) { await p.evaluate((y) => window.scrollTo(0, y), y); await act(300); } await act(2500); return 'expect: no open (dismissed)'; });
// 11. a sticky hold 4 screens tall still counts as interest (ratio never reaches 0.5)
await run('tall sticky hold dwell', async (p, act) => { await p.evaluate(() => { const el = document.getElementById('hold'); window.scrollTo(0, el.offsetTop + innerHeight); }); await act(1500); return 'expect: open (interest-hold counted)'; }, { threshold: 1 });
const expectOpen = (r) => /expect: open|then opens after blur/.test(r.out);
let fail = 0;
for (const r of results) { const ok = expectOpen(r) ? r.opens.length > 0 && !/opens while typing: [1-9]/.test(r.out) : r.opens.length === 0; if (!ok) fail++; console.log((ok ? 'PASS ' : 'FAIL ') + r.name.padEnd(36) + ' | ' + r.out + ' | ' + r.opens.join(',')); }
console.log(fail ? fail + ' failed' : 'all ' + results.length + ' scenarios pass');
process.exitCode = fail ? 1 : 0;
await B.close(); srv.close();
