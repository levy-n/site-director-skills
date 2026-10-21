// Films the details lab with motion on: trails, pops, keys, REC, label, rewind. Usage: node lab-shots.mjs <html> <outDir>
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
// Resolve puppeteer from the project: LAB_PROJECT=<project folder> (default: the current folder).
const require = createRequire((process.env.LAB_PROJECT || process.cwd()).replace(/\\/g, '/') + '/package.json');
const puppeteer = require('puppeteer');
const [file, out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const url = 'file:///' + file.replace(/\\/g, '/');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];

async function run(name, vp) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${name}: ${m.text()}`); });
  await page.setViewport(vp);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.goto(url, { waitUntil: 'load' });
  await sleep(400);
  const W = vp.width, H = vp.height;
  const stroke = async () => { for (let i = 0; i <= 40; i++) { await page.mouse.move(W * .15 + i * W * .017, H * .45 + Math.sin(i / 5) * H * .08); await sleep(16); } };
  // trails over the intro
  await page.mouse.move(W * .1, H * .4);
  for (const t of [1, 2, 3]) {
    await page.evaluate((n) => document.querySelector(`.bar [data-trail="${n}"]`).click(), t);
    await stroke(); await sleep(t === 1 ? 250 : 60);
    await page.screenshot({ path: `${out}/${name}-T${t}.png` });
  }
  await page.evaluate(() => document.querySelector('.bar [data-trail="0"]').click());
  // pops
  for (const id of ['cass', 'memory', 'site']) {
    const w = await page.$(`.w[data-pop="${id}"]`);
    await w.evaluate((el) => el.scrollIntoView({ block: 'center' })); await sleep(200);
    await w.hover(); await sleep(id === 'memory' ? 2100 : 800);
    const card = await w.evaluateHandle((el) => el.closest('.card'));
    await card.screenshot({ path: `${out}/${name}-S-${id}.png` });
    await page.mouse.move(2, 2); await sleep(300);
  }
  // copy label
  const phone = await page.$('#phone');
  await phone.evaluate((el) => el.scrollIntoView({ block: 'center' })); await phone.click(); await sleep(450);
  await (await phone.evaluateHandle((el) => el.closest('.card'))).screenshot({ path: `${out}/${name}-S7.png` });
  // keys
  for (const sel of ['.k1', '#k2']) {
    const k = await page.$(sel);
    await k.evaluate((el) => el.scrollIntoView({ block: 'center' })); await sleep(200);
    await k.hover(); await sleep(700);
    await (await k.evaluateHandle((el) => el.closest('.card'))).screenshot({ path: `${out}/${name}-H${sel === '.k1' ? 1 : 2}.png` });
  }
  // REC now, then rewind mid-way
  await page.evaluate(() => document.getElementById('recNow').click()); await sleep(1300);
  await page.screenshot({ path: `${out}/${name}-S4.png` });
  await page.evaluate(() => { scrollTo(0, document.body.scrollHeight); document.querySelector('footer [data-rewind]').click(); });
  await sleep(380);
  await page.screenshot({ path: `${out}/${name}-S5.png` });
  await browser.close();
}

await run('m', { width: 390, height: 844, deviceScaleFactor: 1, isMobile: false, hasTouch: false });
await run('d', { width: 1440, height: 900, deviceScaleFactor: 1 });
console.log(errors.length ? errors.join('\n') : 'no page errors');
