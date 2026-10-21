#!/usr/bin/env node
// preserve - the preservation contract for upgrades: what must not change while the site changes.
//
//   node preserve.mjs snapshot <url[,url…] | sitemap.xml (URL or local file) | urls.txt> --out preservation.json
//   node preserve.mjs diff <baseline.json> <candidate.json> [--intended intended.json] [--map <from>=<to>] [--out diff.md]
//
// snapshot: every URL is read twice - JavaScript OFF (what GPTBot, ClaudeBot, Perplexity read) and
// ON (what people and Googlebot see): status, final URL, canonical, robots, hreflang, lang/dir,
// title, description, H1/H2/H3, word counts, links, menu anchors (in-page links in header/nav, in
// order, with whether the target exists), CTA hrefs (tel/mailto/WhatsApp), forms (action, method,
// every control), image alts, JSON-LD types, and a hash of the main text. A sitemap index
// (WordPress, Yoast, Wix) is expanded to its pages. It warns about URLs answering 4xx/5xx, menu
// anchors with no target, and forms with no action and no named field: those submit nothing unless
// a script handles them, so check the submit before calling them a sacred conversion.
//
// diff: fails (exit 1) on any change not declared in intended.json. Keys are a URL, a path or "*".
// true frees a field; a value declares the new state, and the candidate must match it:
//   { "*": { "title": "<new>", "description": true, "h1": "<new>", "h2": ["…", "…"],
//            "copy": true | { "minWords": 250 }, "links": ["/old"], "anchors": true | ["#a", "#b"],
//            "forms": true | { "fields": ["name", "phone"], "action": "/api/lead" },
//            "images": true, "jsonld": true } }
// Declared or not: exactly one H1; the same number of H2s unless "h2" is an array; rendered words at
// least half the baseline unless copy.minWords says otherwise; menu anchors keep their order unless
// "anchors" is an array, and every target exists; no JSON-LD type lost unless "jsonld", none invalid.
// --map <from>=<to> compares a candidate served from another origin (preview deploy, local build):
//   --map http://localhost:4391=https://client.co.il. With one origin on each side it is inferred.
// Heights, styles and motion are free to change; meaning, routes and conversions are not.

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const [cmd, ...rest] = process.argv.slice(2);
const flag = (name) => { const i = rest.indexOf(`--${name}`); return i === -1 ? undefined : rest[i + 1]; };
const flags = (name) => rest.flatMap((a, i) => (a === `--${name}` && rest[i + 1] ? [rest[i + 1]] : []));
const positional = rest.filter((a, i) => !a.startsWith('--') && !(i > 0 && rest[i - 1].startsWith('--')));

function loadPuppeteer() {
  const bases = [import.meta.url, join(process.cwd(), 'noop.js')];
  try { bases.push(join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'noop.js')); } catch { /* none */ }
  for (const base of bases) { try { return createRequire(base)('puppeteer'); } catch { /* next */ } }
  console.error('puppeteer not found. Run from a project that has it (npm i -D puppeteer) or install it globally.');
  process.exit(1);
}

const EXTRACT = () => {
  const q = (s) => [...document.querySelectorAll(s)];
  const txt = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim();
  const main = document.querySelector('main') || document.body;
  const h = (n) => q(n).map(txt).filter(Boolean);
  const mainText = main ? txt(main) : '';
  // menu anchors: in-page links in the header or navigation, in DOM order
  const anchors = q('header a[href], nav a[href], [role="navigation"] a[href]').map((a) => {
    const raw = a.getAttribute('href') || '';
    if (!raw.includes('#')) return null;
    let u;
    try { u = new URL(raw, location.href); } catch { return null; }
    if (u.origin !== location.origin || u.pathname !== location.pathname) return null;
    let id = u.hash.slice(1);
    try { id = decodeURIComponent(id); } catch { /* keep raw */ }
    const targetExists = id === '' || id.toLowerCase() === 'top' || Boolean(document.getElementById(id)) || document.getElementsByName(id).length > 0;
    return { href: `#${id}`, text: txt(a), targetExists };
  }).filter(Boolean);
  return {
    lang: document.documentElement.lang, dir: document.documentElement.dir,
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content ?? null,
    robots: document.querySelector('meta[name="robots"]')?.content ?? null,
    canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
    hreflang: q('link[rel="alternate"][hreflang]').map((l) => `${l.hreflang}=${l.href}`).sort(),
    h1: h('h1'), h2: h('h2'), h3: h('h3'),
    words: mainText.split(' ').filter(Boolean).length,
    mainText,
    links: [...new Set(q('a[href]').map((a) => a.getAttribute('href')).filter((x) => x && !x.startsWith('#')))].sort(),
    anchors,
    ctas: [...new Set(q('a[href^="tel:"],a[href^="mailto:"],a[href*="wa.me"],a[href*="whatsapp"]').map((a) => a.getAttribute('href')))].sort(),
    imageAlts: q('img[alt]').map((i) => i.getAttribute('alt')).filter((a) => a && a.trim()).sort(),
    jsonld: [...new Set(q('script[type="application/ld+json"]').flatMap((s) => {
      try { const j = JSON.parse(s.textContent); return [].concat(j['@type'] || (j['@graph'] || []).map((g) => g['@type'])).flat(); } catch { return ['INVALID']; }
    }))].sort(),
    forms: q('form').map((f) => {
      const controls = [...f.elements].filter((e) => !['FIELDSET', 'OBJECT', 'OUTPUT'].includes(e.tagName)).map((e) => {
        const label = (e.labels && e.labels[0] && txt(e.labels[0])) || e.getAttribute('aria-label') || e.getAttribute('placeholder') || (e.tagName === 'BUTTON' ? txt(e) : '') || '';
        return { tag: e.tagName.toLowerCase(), type: (e.getAttribute('type') || '').toLowerCase(), name: e.getAttribute('name') || '', id: e.id || '', label: label.slice(0, 80) };
      });
      return { action: f.getAttribute('action'), method: (f.getAttribute('method') || 'get').toLowerCase(), fields: controls.map((c) => c.name).filter(Boolean).sort(), controls };
    }),
  };
};

async function readText(src) {
  if (/^https?:/i.test(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`${src} answered HTTP ${res.status}`);
    return res.text();
  }
  return readFile(/^file:/i.test(src) ? fileURLToPath(src) : src, 'utf8');
}

// A sitemap index (sitemap_index.xml, wp-sitemap.xml) lists child sitemaps, not pages: expand it.
async function sitemapUrls(src, depth = 0, seen = new Set()) {
  if (seen.has(src) || depth > 3) return [];
  seen.add(src);
  const xml = await readText(src);
  const locs = [...xml.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\s\]]+)\s*(?:\]\]>)?\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  if (!/<sitemapindex[\s>]/i.test(xml)) return locs;
  console.log(`${src}: sitemap index with ${locs.length} child sitemap(s)`);
  const out = [];
  for (const child of locs) out.push(...await sitemapUrls(child, depth + 1, seen));
  return out;
}

async function urlList(input) {
  if (/\.txt$/i.test(input)) return (await readFile(input, 'utf8')).split(/\s+/).filter((u) => u.startsWith('http'));
  if (/\.xml(\?.*)?$/i.test(input)) return [...new Set(await sitemapUrls(input))];
  return input.split(',').map((s) => s.trim()).filter(Boolean);
}

const norm = (u) => { try { return new URL(u).href; } catch { return u; } };

async function snapshot() {
  const input = positional[0];
  const out = flag('out') || 'preservation.json';
  if (!input) { console.error('snapshot needs <url[,url…] | sitemap.xml | urls.txt>'); process.exit(2); }
  let urls;
  try { urls = await urlList(input); } catch (e) { console.error(`could not read the URL list: ${e.message}`); process.exit(2); }
  if (!urls.length) { console.error(`no URLs found in ${input}`); process.exit(2); }
  const puppeteer = loadPuppeteer();
  const browser = await puppeteer.launch({ headless: true });
  const result = { takenAt: new Date().toISOString(), urls: {}, warnings: [] };
  const warn = (msg) => { result.warnings.push(msg); console.log(`  warning: ${msg}`); };
  try {
    for (const given of urls) {
      const url = norm(given);
      result.urls[url] = {};
      for (const js of [false, true]) {
        const page = await browser.newPage();
        await page.setJavaScriptEnabled(js);
        let res = null;
        try { res = await page.goto(url, { waitUntil: js ? 'networkidle2' : 'domcontentloaded', timeout: 60000 }); } catch (e) { result.urls[url][js ? 'rendered' : 'raw'] = { error: e.message }; await page.close(); continue; }
        if (js) await new Promise((r) => setTimeout(r, 1500));
        const data = await page.evaluate(EXTRACT);
        data.status = res ? res.status() : null;
        data.finalUrl = page.url();
        data.mainHash = createHash('sha1').update(data.mainText).digest('hex').slice(0, 12);
        delete data.mainText;
        result.urls[url][js ? 'rendered' : 'raw'] = data;
        await page.close();
      }
      const r = result.urls[url];
      console.log(`${url} - raw ${r.raw?.words ?? '?'} words, rendered ${r.rendered?.words ?? '?'} words, h1: ${JSON.stringify(r.rendered?.h1 ?? [])}`);
      const v = r.rendered && !r.rendered.error ? r.rendered : r.raw;
      if (!v || v.error) { warn(`${url}: could not load (${v?.error || 'no view'})`); continue; }
      if (v.status >= 400) warn(`${url}: answered HTTP ${v.status}; it is recorded, but an error page is not a page to preserve`);
      for (const a of v.anchors.filter((x) => !x.targetExists)) warn(`${url}: menu anchor ${a.href} ("${a.text}") has no target on the page`);
      v.forms.forEach((f, i) => {
        if (!f.action && !f.fields.length) warn(`${url}: form ${i + 1} has no action and no named fields; verify a submit handler exists before treating it as a sacred conversion`);
      });
    }
  } finally {
    await browser.close();
  }
  await writeFile(out, JSON.stringify(result, null, 2));
  console.log(`contract → ${out} (${urls.length} URLs${result.warnings.length ? `, ${result.warnings.length} warning(s)` : ''})`);
}

function sameArr(a = [], b = []) { return a.length === b.length && a.every((x, i) => x === b[i]); }
const originOf = (u) => { try { return new URL(u).origin; } catch { return null; } };
const pathOf = (u) => { try { const x = new URL(u); return x.pathname + x.search; } catch { return u; } };

// Origin mapping: the candidate is often a preview deploy or a local build of the same pages.
function originMap(base, cand, notes) {
  const pairs = flags('map').map((m) => {
    const i = m.indexOf('=');
    if (i < 1) { console.error(`--map needs <from>=<to>, got "${m}"`); process.exit(2); }
    return [m.slice(0, i).replace(/\/+$/, ''), m.slice(i + 1).replace(/\/+$/, '')];
  });
  if (!pairs.length) {
    const bo = new Set(Object.keys(base.urls).map(originOf).filter(Boolean));
    const co = new Set(Object.keys(cand.urls).map(originOf).filter(Boolean));
    if (bo.size === 1 && co.size === 1 && [...bo][0] !== [...co][0]) {
      pairs.push([[...co][0], [...bo][0]]);
      notes.push(`origin mapped: ${[...co][0]} → ${[...bo][0]} (inferred; pass --map to set it)`);
    }
  } else for (const [f, t] of pairs) notes.push(`origin mapped: ${f} → ${t}`);
  const map = (s) => {
    if (typeof s !== 'string') return s;
    for (const [from, to] of pairs) if (s === from || /^[/?#]/.test(s.slice(from.length, from.length + 1)) && s.startsWith(from)) return to + s.slice(from.length);
    return s;
  };
  const view = (v) => (!v || v.error ? v : {
    ...v,
    finalUrl: map(v.finalUrl),
    canonical: map(v.canonical),
    hreflang: (v.hreflang || []).map((x) => { const i = x.indexOf('='); return i === -1 ? x : `${x.slice(0, i)}=${map(x.slice(i + 1))}`; }).sort(),
    links: [...new Set((v.links || []).map(map))].sort(),
    forms: (v.forms || []).map((f) => ({ ...f, action: map(f.action) })),
  });
  const urls = {};
  for (const [u, entry] of Object.entries(cand.urls)) urls[norm(map(u))] = { ...entry, raw: view(entry.raw), rendered: view(entry.rendered) };
  return { ...cand, urls };
}

async function diff() {
  const [basePath, candPath] = positional;
  if (!basePath || !candPath) { console.error('diff needs <baseline.json> <candidate.json>'); process.exit(2); }
  const base = JSON.parse(await readFile(basePath, 'utf8'));
  const notes = [];
  const cand = originMap(base, JSON.parse(await readFile(candPath, 'utf8')), notes);
  const intended = flag('intended') ? JSON.parse(await readFile(flag('intended'), 'utf8')) : {};
  // a URL's declaration: its own entry (by URL or path) over the "*" entry
  const declared = (url, key) => {
    const own = intended[url] || intended[norm(url)] || intended[pathOf(url)] || {};
    return own[key] !== undefined ? own[key] : (intended['*'] || {})[key];
  };
  const listOf = (url, key) => [intended[url], intended[norm(url)], intended[pathOf(url)], intended['*']].flatMap((x) => (x && Array.isArray(x[key]) ? x[key] : []));
  const problems = [];
  const warnings = [];
  for (const [given, b] of Object.entries(base.urls)) {
    const url = norm(given);
    const c = cand.urls[url];
    const bStatus = b.rendered?.status ?? b.raw?.status;
    if (bStatus >= 400) { warnings.push(`${url}: the baseline answered HTTP ${bStatus}, so there is nothing to preserve; not compared (fix or redirect it, and record that in the change list)`); continue; }
    if (!c) { problems.push(`${url}: missing from candidate`); continue; }
    for (const view of ['raw', 'rendered']) {
      const B = b[view], C = c[view];
      if (!B || !C || B.error || C.error) { problems.push(`${url} [${view}]: could not compare (${B?.error || C?.error || 'missing view'})`); continue; }
      const P = (msg) => problems.push(`${url} [${view}]: ${msg}`);
      for (const k of ['status', 'finalUrl', 'canonical', 'robots', 'lang', 'dir']) if (B[k] !== C[k]) P(`${k} changed: ${JSON.stringify(B[k])} → ${JSON.stringify(C[k])}`);
      if (!sameArr(B.hreflang, C.hreflang)) P('hreflang changed');
      for (const k of ['title', 'description']) {
        const d = declared(url, k);
        if (typeof d === 'string') { if (C[k] !== d) P(`${k} is "${C[k]}", intended.json declares "${d}"`); } else if (B[k] !== C[k] && !d) P(`${k} changed: "${B[k]}" → "${C[k]}"`);
      }
      // headings: the count rules hold even when the text is declared
      if (C.h1.length !== 1) P(`expected exactly one H1, found ${C.h1.length}`);
      const h1 = declared(url, 'h1');
      if (typeof h1 === 'string' || Array.isArray(h1)) { if (!sameArr(C.h1, [].concat(h1))) P(`H1 is ${JSON.stringify(C.h1)}, intended.json declares ${JSON.stringify([].concat(h1))}`); } else if (!sameArr(B.h1, C.h1) && !h1) P(`H1 changed: ${JSON.stringify(B.h1)} → ${JSON.stringify(C.h1)}`);
      const h2 = declared(url, 'h2');
      if (Array.isArray(h2)) { if (!sameArr(C.h2, h2)) P(`H2 sequence differs from the one intended.json declares: ${JSON.stringify(C.h2)}`); } else if (h2) { if (C.h2.length !== B.h2.length) P(`H2 count changed ${B.h2.length} → ${C.h2.length} (declare the new sequence as an array to add or remove sections)`); } else if (!sameArr(B.h2, C.h2)) P('H2 sequence changed');
      // words: an undeclared edit may lose 3 %; a declared rewrite keeps a floor
      const copy = declared(url, 'copy');
      if (view === 'raw' && B.words && C.words < B.words * 0.97 && !copy) P(`raw words dropped ${B.words} → ${C.words}`);
      if (view === 'rendered' && copy) {
        const floor = copy && typeof copy === 'object' && copy.minWords ? copy.minWords : Math.ceil(B.words / 2);
        if (C.words < floor) P(`rendered words ${C.words}, below the floor of ${floor} (${copy.minWords ? 'copy.minWords' : 'half the baseline'}); declare copy.minWords if this cut is intended`);
      }
      if (B.mainHash !== C.mainHash && !copy) P('main text changed (copy edits must be declared as "copy")');
      const keep = listOf(url, 'links');
      const removedLinks = B.links.filter((l) => !C.links.includes(l) && !keep.includes(l));
      if (removedLinks.length) P(`links removed: ${removedLinks.slice(0, 8).join(' ')}`);
      // menu anchors: order and targets are part of the contract; the label text is copy
      if (B.anchors && C.anchors) {
        const anchors = declared(url, 'anchors');
        const bh = B.anchors.map((a) => a.href), ch = C.anchors.map((a) => a.href);
        if (Array.isArray(anchors)) { if (!sameArr(ch, anchors)) P(`menu anchors are ${ch.join(' ')}, intended.json declares ${anchors.join(' ')}`); } else if (!sameArr(bh, ch)) P(`menu anchors changed: ${bh.join(' ')} → ${ch.join(' ')}`);
        for (const a of C.anchors.filter((x) => !x.targetExists)) {
          const before = B.anchors.find((x) => x.href === a.href);
          if (before && !before.targetExists) warnings.push(`${url} [${view}]: menu anchor ${a.href} still points at nothing (broken in the baseline too)`);
          else P(`menu anchor ${a.href} ("${a.text}") points at nothing`);
        }
        if (!anchors && !copy && sameArr(bh, ch)) {
          const changed = B.anchors.filter((a, i) => a.text !== C.anchors[i].text);
          if (changed.length) P(`menu labels changed: ${changed.map((a) => `"${a.text}"`).join(', ')} (declare "anchors": true or "copy")`);
        }
      } else if (view === 'rendered' && !B.anchors) notes.push(`${url}: baseline taken with an older preserve.mjs; menu anchors and form controls were not compared (re-take the baseline to include them)`);
      if (!sameArr(B.ctas, C.ctas)) P(`CTA hrefs changed: ${JSON.stringify(B.ctas)} → ${JSON.stringify(C.ctas)}`);
      // forms: action, method, named fields and the control list
      const forms = declared(url, 'forms');
      const sig = (f) => JSON.stringify({ action: f.action, method: f.method, fields: f.fields });
      const ctl = (f) => (f.controls || []).map((x) => `${x.tag}:${x.type}:${x.name}`).join('|');
      if (forms && typeof forms === 'object') {
        // a page with no form before or after is not what the declaration is about
        const want = [...(forms.fields || [])].sort();
        const match = C.forms.find((f) => (!forms.fields || sameArr(f.fields, want)) && (forms.action === undefined || f.action === forms.action));
        if ((B.forms.length || C.forms.length) && !match) P(`no form matches the one intended.json declares (${JSON.stringify(forms)}); found ${JSON.stringify(C.forms.map((f) => ({ action: f.action, fields: f.fields })))}`);
      } else if (!forms) {
        const same = B.forms.length === C.forms.length && B.forms.every((f, i) => sig(f) === sig(C.forms[i]) && (!f.controls || !C.forms[i].controls || ctl(f) === ctl(C.forms[i])));
        if (!same) P('forms changed (action, method, field names or controls)');
      }
      if (view === 'rendered') B.forms.forEach((f, i) => { if (!f.action && !f.fields.length) warnings.push(`${url}: baseline form ${i + 1} has no action and no named fields; check that it submits before treating it as a sacred conversion`); });
      const lostAlts = B.imageAlts.filter((a) => !C.imageAlts.includes(a));
      if (lostAlts.length && !declared(url, 'images')) P(`image alt texts lost: ${lostAlts.slice(0, 5).join(' | ')}`);
      // JSON-LD: types may be added; none may be lost (unless declared) and none may be broken
      const lost = B.jsonld.filter((t) => !C.jsonld.includes(t));
      if (lost.length && !declared(url, 'jsonld')) P(`JSON-LD types lost: ${lost.join(',')}`);
      if (C.jsonld.includes('INVALID') && !B.jsonld.includes('INVALID')) P('a JSON-LD block no longer parses (INVALID)');
      const added = C.jsonld.filter((t) => !B.jsonld.includes(t) && t !== 'INVALID');
      if (added.length && view === 'rendered') notes.push(`${url}: JSON-LD types added: ${added.join(',')}`);
    }
    const raw = c.raw, ren = c.rendered;
    if (raw && ren && ren.words && raw.words / ren.words < 0.9) problems.push(`${url}: only ${Math.round((100 * raw.words) / ren.words)}% of the rendered words exist without JavaScript (content hiding behind JS)`);
    if (raw && ren && !raw.error && !raw.h1?.length) problems.push(`${url}: no H1 without JavaScript`);
    notes.push(`${url}: raw ${raw?.words} / rendered ${ren?.words} words`);
  }
  const md = [`# Preservation diff`, '', `baseline: ${basePath} (${base.takenAt})`, `candidate: ${candPath} (${cand.takenAt})`, '',
    problems.length ? `**FAIL - ${problems.length} undeclared change(s)**` : '**PASS - nothing changed outside intended.json**', '',
    ...problems.map((p) => `- ${p}`),
    ...(warnings.length ? ['', '## Warnings (not failures)', ...[...new Set(warnings)].map((w) => `- ${w}`)] : []),
    '', '## Notes', ...[...new Set(notes)].map((n) => `- ${n}`)].join('\n');
  if (flag('out')) await writeFile(flag('out'), md);
  console.log(md);
  process.exit(problems.length ? 1 : 0);
}

if (cmd === 'snapshot') await snapshot();
else if (cmd === 'diff') await diff();
else { console.error('usage: node preserve.mjs snapshot <urls|sitemap.xml|urls.txt> --out file  |  node preserve.mjs diff <baseline> <candidate> [--intended f] [--map from=to] [--out f]'); process.exit(2); }
