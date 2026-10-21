#!/usr/bin/env node
// font-fallback - measure the size-adjust a local fallback font needs to match a web font, separately
// for Hebrew and Latin, emit @font-face rules, then re-measure with those rules to prove the swap
// will not rewrap lines.
//
//   node font-fallback.mjs <font-file> [more files of the same family] [--family "Brand Display"]
//        [--weight 400] [--stretch 70%] [--axes "wdth=60,wght=300"]
//        [--fallbacks "Arial,Segoe UI,Tahoma,David"] [--size 20] [--all]
//        [--sample-he "..."] [--sample-en "..."] [--out fallback.css]
//
//   font files   .woff2/.woff/.ttf/.otf. Pass subsets of one family together (e.g. Fontsource's
//                hebrew + latin files); they are stacked in the order given.
//   --family     the web font's family name, used to name the fallback ("<family> Fallback").
//   --weight     the weight to measure (run once per weight that shows above the fold). Defaults to
//                the wght in --axes, else 400.
//   --stretch    font-stretch of the measured text (a condensed or wide instance of a variable font).
//   --axes       font-variation-settings of the measured text, as tag=value pairs. A condensed
//                display instance needs a very different size-adjust from the default instance
//                (measured: 47 % at wdth 58 against about 98 % at wdth 100), so measure the instance
//                you set. The fallback is then named per instance ("Brand w60 Fallback"): use it only
//                on elements set at that instance.
//   --fallbacks  local fonts to try, in preference order, as family names ("Arial") or full face
//                names ("Arial Black"). The first one installed here is emitted; --all emits a
//                family for every installed candidate.
//
// Each candidate is measured through the same @font-face rule the script emits: src: local(<full
// name>), local(<PostScript name>). From weight 600 up the bold faces are tried first ("Arial Bold",
// "Arial-BoldMT"), because local("Arial") is the regular face even at font-weight 800, and a
// regular face measured as bold rewraps.
//
// Why: fallback generators (Capsize, fontaine, next/font, the Astro Fonts API) average Latin letter
// widths. Hebrew glyphs have other proportions, so their size-adjust is wrong for Hebrew text
// (measured: Astro 7.3's generated Heebo fallback set Hebrew 22.7% too wide), and every paragraph
// rewraps when the web font arrives. Two faces with the same family name and different
// unicode-range give Hebrew and Latin their own size-adjust.
//
// Fallback fonts are the ones installed where this runs. Windows: Arial, Segoe UI, Tahoma, David.
// iOS/macOS and Android substitute other Hebrew fonts; run this there too, or keep body text on
// font-display: optional. Give every text style a unitless line-height: iOS ignores ascent-override,
// and a fixed line box is what keeps vertical metrics from shifting layout.

import http from 'node:http';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';

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

const args = parseArgs(process.argv.slice(2));
const files = args._.map((f) => resolve(f));
if (!files.length) {
  console.error('usage: node font-fallback.mjs <font-file> [more files] [--family "Name"] [--weight 400] [--stretch 70%] [--axes "wdth=60"] [--fallbacks "Arial,Segoe UI"]');
  process.exit(1);
}
for (const f of files) if (!existsSync(f)) { console.error(`font file not found: ${f}`); process.exit(1); }

const axes = String(args.axes && args.axes !== true ? args.axes : '').split(',').map((s) => s.trim()).filter(Boolean).map((s) => {
  const [tag, value] = s.split('=').map((x) => x.trim());
  if (!/^[A-Za-z0-9]{4}$/.test(tag || '') || value === undefined || !Number.isFinite(Number(value))) { console.error(`--axes needs tag=value pairs such as "wdth=60,wght=300", got "${s}"`); process.exit(1); }
  return [tag, Number(value)];
});
const axis = (tag) => axes.find(([t]) => t === tag)?.[1];
const stretch = args.stretch && args.stretch !== true ? (/%$/.test(String(args.stretch)) ? String(args.stretch) : `${args.stretch}%`) : null;
const family = String(args.family ?? basename(files[0], extname(files[0])).replace(/[-_](hebrew|latin|he|en|subset|wght|normal|variable|regular).*$/i, ''));
const weight = Number(args.weight ?? axis('wght') ?? 400);
const size = Number(args.size ?? 20);
const fallbacks = String(args.fallbacks ?? 'Arial,Segoe UI,Tahoma,David,Arial Hebrew,Noto Sans Hebrew,Helvetica Neue').split(',').map((s) => s.trim()).filter(Boolean);
const HEBREW_RANGE = 'U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F';
const sampleHe = String(args['sample-he'] ?? 'אנחנו בונים אתרים לעסקים קטנים בישראל, עם חוויית גלילה שלא נראית כמו תבנית. כל חלק בעמוד מספר משהו אחר, והלקוח מבין תוך כמה שניות למה כדאי לו להשאיר פרטים ולחזור אלינו.');
const sampleEn = String(args['sample-en'] ?? 'We build websites for small businesses, with a scroll experience that does not look like a template. Every part of the page says something different, and visitors understand within seconds why to get in touch.');

// The instance being measured: applied to every measured element, written into the emitted comment.
const variation = axes.length ? axes.map(([t, v]) => `"${t}" ${v}`).join(', ') : '';
const instanceCss = `${stretch ? `font-stretch:${stretch};` : ''}${variation ? `font-variation-settings:${variation};` : ''}`;
const widthValue = axis('wdth') ?? (stretch ? parseFloat(stretch) : null);
const instanceLabel = [stretch ? `font-stretch ${stretch}` : '', variation ? `font-variation-settings ${variation}` : ''].filter(Boolean).join(', ');
const instanceTag =[widthValue !== null && widthValue !== 100 ? `w${widthValue}` : '', ...axes.filter(([t]) => t !== 'wght' && t !== 'wdth').map(([t, v]) => `${t}${v}`)].filter(Boolean).join(' ');

// Local face names to try for a fallback family at this weight, best match first. Each group holds
// the aliases of one face (full name, PostScript name); the first group with an installed face wins.
function faceGroups(name, w) {
  const ns = name.replace(/\s+/g, '');
  const g = {
    black: [`${name} Black`, `${ns}-Black`],
    bold: [`${name} Bold`, `${ns}-Bold`, `${ns}-BoldMT`],
    semibold: [`${name} Semibold`, `${name} SemiBold`, `${ns}-Semibold`, `${ns}-SemiBold`],
    medium: [`${name} Medium`, `${ns}-Medium`],
    regular: [name, `${name} Regular`, `${ns}-Regular`, `${ns}MT`],
    light: [`${name} Light`, `${ns}-Light`],
  };
  const order = w >= 850 ? ['black', 'bold', 'semibold', 'regular'] : w >= 700 ? ['bold', 'semibold', 'black', 'regular'] : w >= 600 ? ['semibold', 'bold', 'regular'] : w >= 500 ? ['medium', 'regular'] : w <= 300 ? ['light', 'regular'] : ['regular'];
  return order.map((k) => ({ kind: k, names: [...new Set(g[k])] }));
}

const MIME = { '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf' };
// font-stretch range on the web faces: without it a variable font is clamped to 100 % width.
const webFaces = files.map((f, i) => `@font-face{font-family:"PBWeb${i}";src:url(/f${i}${extname(f)});font-weight:1 1000;font-stretch:25% 200%;font-display:block}`).join('\n');
const webStack = files.map((_, i) => `"PBWeb${i}"`).join(',');
const page = `<!doctype html><meta charset="utf-8"><style>${webFaces}
body{margin:0} .m{position:absolute;top:0;left:0;white-space:nowrap;font-size:${size}px;font-weight:${weight};line-height:normal;${instanceCss}}
.p{position:absolute;top:0;left:0;font-size:18px;font-weight:${weight};line-height:1.7;${instanceCss}}</style><body></body>`;

const server = http.createServer((req, res) => {
  const m = req.url.match(/^\/f(\d+)\./);
  if (m && files[Number(m[1])]) {
    const f = files[Number(m[1])];
    res.writeHead(200, { 'content-type': MIME[extname(f).toLowerCase()] ?? 'application/octet-stream' });
    return res.end(readFileSync(f));
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(page);
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));

const puppeteer = loadPuppeteer();
const browser = await puppeteer.launch({ headless: true });
try {
  const tab = await browser.newPage();
  await tab.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load' });

  // 1. Coverage and raw widths. A family covers a text when the width is the same with a
  //    monospace and a serif last resort behind it (missing glyphs would fall through and differ).
  //    Fallbacks are measured through @font-face { src: local(...) }, exactly as they are emitted.
  const candidates = fallbacks.map((name) => ({ name, groups: faceGroups(name, weight) }));
  const measured = await tab.evaluate(async ({ webStack, candidates, sampleHe, sampleEn, weight, size, n }) => {
    for (let i = 0; i < n; i++) await document.fonts.load(`${weight} ${size}px "PBWeb${i}"`, 'אבab');
    await document.fonts.ready;
    const width = (stack, text) => {
      const s = document.createElement('span');
      s.className = 'm'; s.style.fontFamily = stack; s.textContent = text;
      document.body.append(s);
      const r = s.getBoundingClientRect();
      s.remove();
      return { w: r.width, h: r.height };
    };
    // Several last resorts with different widths: Chrome can resolve monospace and serif to the same
    // Hebrew font, which made a Latin-only face look as if it covered Hebrew.
    const LAST = ['monospace', 'serif', '"Courier New"', '"Times New Roman"', '"David"', '"Tahoma"'];
    const covers = (stack, text) => { const ws = LAST.map((g) => width(`${stack}, ${g}`, text).w); return Math.max(...ws) - Math.min(...ws) < 0.5; };
    const web = {
      he: width(webStack, sampleHe), en: width(webStack, sampleEn),
      coversHe: covers(webStack, sampleHe), coversEn: covers(webStack, sampleEn),
    };
    const style = document.createElement('style');
    document.head.append(style);
    let k = 0;
    // a missing local() face makes document.fonts.load reject; that only means "not installed here"
    const loadLocal = async (local) => {
      const fam = `PBFb${k++}`;
      style.textContent += `@font-face{font-family:"${fam}";src:local("${local.replace(/"/g, '')}");font-weight:${weight};}\n`;
      try { return (await document.fonts.load(`${weight} ${size}px "${fam}"`, 'אבab')).length ? `"${fam}"` : null; } catch { return null; }
    };
    const rows = [];
    for (const c of candidates) {
      let row = { name: c.name, face: null, local: [], kind: null, he: { w: 0, h: 0 }, en: { w: 0, h: 0 }, coversHe: false, coversEn: false };
      for (const g of c.groups) {
        const loaded = [];
        for (const local of g.names) { const q = await loadLocal(local); if (q) loaded.push({ local, q, w: width(q, sampleEn + sampleHe).w }); }
        if (!loaded.length) continue;
        // aliases of one face measure the same; keep only those (a stray match on another face would mislead)
        const same = loaded.filter((x) => Math.abs(x.w - loaded[0].w) < 0.5);
        const q = same[0].q;
        row = { name: c.name, face: same[0].local, local: same.map((x) => x.local), kind: g.kind, he: width(q, sampleHe), en: width(q, sampleEn), coversHe: covers(q, sampleHe), coversEn: covers(q, sampleEn) };
        break;
      }
      rows.push(row);
    }
    return { web, rows };
  }, { webStack, candidates, sampleHe, sampleEn, weight, size, n: files.length });

  const { web, rows } = measured;
  if (!web.coversHe && !web.coversEn) {
    console.error('The web font did not load or covers neither sample. Check the files and --weight.');
    process.exit(2);
  }

  console.log(`\nfont-fallback  "${family}"  weight ${weight}${instanceLabel ? `  ${instanceLabel}` : ''}  (${files.map((f) => basename(f)).join(' + ')})`);
  console.log(`web font covers  Hebrew: ${web.coversHe ? 'yes' : 'NO'}   Latin: ${web.coversEn ? 'yes' : 'NO'}`);
  console.log(`line-height:normal box  web ${web.he.h.toFixed(1)}px at ${size}px  (use unitless line-heights; see header)\n`);
  console.log('candidate          face measured           Hebrew size-adjust   Latin size-adjust   normal box');
  const usable = [];
  for (const r of rows) {
    const he = r.coversHe ? web.he.w / r.he.w : null;
    const en = r.coversEn ? web.en.w / r.en.w : null;
    const installed = r.face && (r.coversHe || r.coversEn);
    if (installed && (he || !web.coversHe) && (en || !web.coversEn)) usable.push({ ...r, ratioHe: he, ratioEn: en });
    const fmt = (v) => (v ? `${(v * 100).toFixed(1)}%`.padEnd(20) : '- (no glyphs)'.padEnd(20));
    console.log(`${r.name.padEnd(19)}${(installed ? r.face : 'not installed').slice(0, 23).padEnd(24)}${fmt(he)} ${fmt(en)}${installed ? `${r.he.h.toFixed(1)}px` : ''}`);
    if (installed && weight >= 600 && r.kind === 'regular') console.log(`${''.padEnd(19)}no bold face of ${r.name} installed here: the regular face is used at weight ${weight}, unemboldened`);
  }
  if (!usable.length) {
    console.error('\nNo candidate covers the scripts the web font covers. Try --fallbacks with fonts installed here.');
    process.exit(2);
  }

  // 2. Emit CSS. Faces with overlapping ranges are checked last-defined first, so the general face
  //    comes first and the Hebrew face (narrow unicode-range) last.
  const chosen = args.all ? usable : [usable[0]];
  const css = chosen.map((c) => faceCss(family, c, chosen.length > 1)).join('\n');

  // 3. Prove it: same text, emitted fallback vs web font, as one line and as wrapped paragraphs.
  const proof = await tab.evaluate(async ({ css, webStack, chosenFamilies, sampleHe, sampleEn }) => {
    const st = document.createElement('style'); st.textContent = css; document.head.append(st);
    await document.fonts.ready;
    const box = (cls, stack, text, w) => {
      const s = document.createElement(cls === 'p' ? 'div' : 'span');
      s.className = cls; s.style.fontFamily = stack; s.textContent = text; if (w) s.style.width = `${w}px`;
      document.body.append(s);
      const r = s.getBoundingClientRect(); s.remove();
      return r;
    };
    return chosenFamilies.map((fam) => {
      const q = `"${fam}"`;
      const err = (text) => (box('m', q, text).width / box('m', webStack, text).width - 1) * 100;
      const lines = (text, w) => [box('p', webStack, text, w).height, box('p', q, text, w).height].map((h) => Math.round(h / (18 * 1.7)));
      return { fam, he: err(sampleHe), en: err(sampleEn), he340: lines(sampleHe, 340), he680: lines(sampleHe, 680), en340: lines(sampleEn, 340) };
    });
  }, { css, webStack, chosenFamilies: chosen.map((c) => fallbackName(family, c, chosen.length > 1)), sampleHe, sampleEn });

  console.log('\nproof with the emitted CSS (width error vs the web font; lines at 18px / line-height 1.7):');
  for (const p of proof) {
    const verdict = p.he340[0] === p.he340[1] && p.he680[0] === p.he680[1] && p.en340[0] === p.en340[1] ? 'no rewrap' : 'REWRAPS';
    console.log(`  ${p.fam}: Hebrew ${p.he >= 0 ? '+' : ''}${p.he.toFixed(1)}%  Latin ${p.en >= 0 ? '+' : ''}${p.en.toFixed(1)}%  ` +
      `| Hebrew 340px ${p.he340[0]}→${p.he340[1]} lines, 680px ${p.he680[0]}→${p.he680[1]}  | Latin 340px ${p.en340[0]}→${p.en340[1]}  → ${verdict}`);
  }
  const stackLine = `font-family: "${family}", ${chosen.map((c) => `"${fallbackName(family, c, chosen.length > 1)}"`).join(', ')}, sans-serif;${instanceLabel ? `  (on elements set at ${instanceLabel})` : ''}`;
  console.log(`\n/* ---- paste into your base CSS ---- */\n${css}\n/* ${stackLine} */`);
  if (args.out) { writeFileSync(resolve(String(args.out)), `${css}\n/* ${stackLine} */\n`); console.log(`\nwritten: ${resolve(String(args.out))}`); }
} finally {
  await browser.close();
  server.close();
}

function fallbackName(fam, c, multi) {
  const base = `${fam}${instanceTag ? ` ${instanceTag}` : ''} Fallback`;
  return multi ? `${base} ${c.name}` : base;
}

function faceCss(fam, c, multi) {
  const name = fallbackName(fam, c, multi);
  const src = c.local.map((l) => `local("${l}")`).join(', ');
  const out = [`/* "${fam}" weight ${weight}${instanceLabel ? ` at ${instanceLabel} (use this family only on elements set at that instance)` : ''} over ${c.face}, measured ${new Date().toLocaleDateString('sv')} on ${process.platform} */`];
  const general = c.ratioEn ?? c.ratioHe;
  out.push(`@font-face { font-family: "${name}"; src: ${src}; font-weight: ${weight}; size-adjust: ${(general * 100).toFixed(1)}%; }`);
  if (c.ratioHe && c.ratioEn && Math.abs(c.ratioHe - c.ratioEn) > 0.004) {
    out.push(`@font-face { font-family: "${name}"; src: ${src}; font-weight: ${weight}; size-adjust: ${(c.ratioHe * 100).toFixed(1)}%;\n  unicode-range: ${HEBREW_RANGE}; }`);
  }
  return out.join('\n');
}

function parseArgs(list) {
  const out = { _: [] };
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const next = list[i + 1];
    if (next === undefined || next.startsWith('--')) out[a.slice(2)] = true;
    else { out[a.slice(2)] = next; i++; }
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
