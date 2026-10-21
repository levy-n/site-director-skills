// Shoots type.html as ONE image. Served over http, not file://: Chrome does not paint file:// iframes
// into a puppeteer screenshot (found 2026-10-15: every frame came out blank). The viewport is set to
// the board's own height and captureBeyondViewport stays false, so nothing is resized mid-shot.
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(process.cwd(), 'package.json'));
let puppeteer;
try { puppeteer = require('puppeteer'); } catch { console.error('puppeteer not found from ' + process.cwd() + ': run from a project with puppeteer (npm i -D puppeteer)'); process.exit(2); }
const types = { '.html': 'text/html; charset=utf-8', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.css': 'text/css', '.js': 'text/javascript' };
const srv = http.createServer((q, r) => {
  const f = path.join(here, decodeURIComponent(q.url.split('?')[0].split('#')[0]));
  if (!f.startsWith(here) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
}).listen(0);
const port = srv.address().port;
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });
await page.goto(`http://127.0.0.1:${port}/type.html`, { waitUntil: 'networkidle0' });
for (const frame of page.frames()) await frame.evaluate(() => document.fonts.ready.then(() => true));
const h = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
await page.setViewport({ width: 1600, height: h, deviceScaleFactor: 2 });
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: path.join(here, 'type-board.png'), captureBeyondViewport: false });
await browser.close();
srv.close();
console.log('type-board.png', h + 'px tall');
