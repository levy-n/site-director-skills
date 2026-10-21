#!/usr/bin/env node
// selftest: prove the skill still works after any edit to its files, engine or scripts.
//
//   node selftest.mjs              static checks (no browser, no network)
//   node selftest.mjs --browser    + engine checks in headless Chrome (needs puppeteer and network
//                                    for gsap/lenis from jsDelivr): RTL line splits, attribute layer,
//                                    the engine API (one clock, damp, cleanups, resize, content watch,
//                                    preference rebuild), the short viewport, slop-scan in URL mode
//   node selftest.mjs --full       + motion-audit of the moves gallery, desktop and mobile (slow)
//
// Static: SKILL.md frontmatter and body size, every referenced file exists, Hebrew docs use .rtl.md,
// slop-scan rule vectors, slop-scan skips its own files, decision waivers, every script answers --help.
// Run it from a folder where puppeteer resolves (any project with it installed) for --browser.
// Scratch output goes to the OS temp folder and is removed (a failed --full audit keeps its folder and
// names it); set TEMP/TMP to move it off a full drive.

import { readFileSync, readdirSync, existsSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn, execFile, execSync } from 'node:child_process';
import { promisify } from 'node:util';
import { createRequire } from 'node:module';
import http from 'node:http';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  // the leading comment block only, as the other scripts print it
  const header = [];
  for (const l of readFileSync(new URL(import.meta.url), 'utf8').split(/\r?\n/)) {
    if (l.startsWith('#!')) continue;
    if (!l.startsWith('//')) break;
    header.push(l);
  }
  console.log(header.map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}

const SKILL = join(dirname(fileURLToPath(import.meta.url)), '..');
const BROWSER = process.argv.includes('--browser') || process.argv.includes('--full');
const FULL = process.argv.includes('--full');
const execFileP = promisify(execFile);
// a child script that exits non-zero (a FAIL verdict) still has a report to read
const runScript = (args, timeout = 180000) => execFileP(process.execPath, args, { timeout, maxBuffer: 32 << 20 }).catch((e) => e);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: Boolean(ok), detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); };

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const files = walk(SKILL);
const rel = (p) => relative(SKILL, p).split('\\').join('/');

// 1. SKILL.md frontmatter and body budget (only the first ~5,000 tokens survive compaction).
// Keys and limits follow the skill authoring standard (its allowed-key list, nothing more).
{
  const s = readFileSync(join(SKILL, 'SKILL.md'), 'utf8');
  const fm = s.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const keys = fm ? [...fm[1].matchAll(/^([a-z_-]+):/gm)].map((m) => m[1]) : [];
  const allowed = new Set(['name', 'description', 'when_to_use', 'argument-hint', 'arguments', 'disable-model-invocation', 'user-invocable',
    'allowed-tools', 'disallowed-tools', 'model', 'effort', 'context', 'agent', 'hooks', 'paths', 'shell', 'license', 'metadata']);
  const field = (k) => (fm ? (fm[1].match(new RegExp(`^${k}:\\s*'([\\s\\S]*?)'\\s*$`, 'm')) || fm[1].match(new RegExp(`^${k}:\\s*(.*)$`, 'm')) || [])[1] || '' : '');
  const desc = field('description');
  const when = field('when_to_use');
  check('SKILL.md frontmatter: name, description, allowed keys only', fm && keys.includes('name') && keys.includes('description') && keys.every((k) => allowed.has(k)), `keys: ${keys.join(', ')}`);
  check('SKILL.md description ≤ 1024 characters, with when_to_use ≤ 1536', desc.length > 0 && desc.length <= 1024 && desc.length + when.length <= 1536, `${desc.length} + ${when.length} chars`);
  const body = s.slice(fm ? fm[0].length : 0);
  const heb = (body.match(/[\u0590-\u05FF]/g) || []).length;
  const tokens = Math.round((body.length - heb) / 3.8 + heb / 1.6);
  const lines = body.split(/\r?\n/).length;
  check('SKILL.md body ≤ ~5,000 tokens and ≤ 500 lines', tokens <= 5000 && lines <= 500, `≈${tokens} tokens, ${lines} lines`);
}

// 2. every skill-relative path mentioned in the skill exists. A path written as
// <skills>/<other-skill>/assets/... belongs to that sibling skill and is checked against the skills
// root in its own line, so a missing sibling file is named as such and not as a file of this skill.
{
  const re = /\b((?:references|assets|scripts|portable|memory|evals|tests)\/[A-Za-z0-9_./*-]+[A-Za-z0-9_*])/g;
  const OWN = new Set(['<skill>', '${CLAUDE_SKILL_DIR}', '..', '.', 'pattern-breaker']);
  const missing = new Set();
  const missingSibling = new Set();
  let siblings = 0;
  for (const f of files.filter((p) => /\.(md|mjs|js|tsx|html|json)$/.test(p))) {
    const text = readFileSync(f, 'utf8');
    for (const m of text.matchAll(re)) {
      const r = m[1].replace(/[.,;:)]+$/, '');
      if (/[<{]/.test(r)) continue;
      const owner = (text.slice(Math.max(0, m.index - 80), m.index).match(/([^\s/'"`(]+)\/$/) || [])[1];
      // A template expression (`${base}/tests/...` in this script) is a URL or path to this skill, not a sibling.
      const base = owner && !OWN.has(owner) && !owner.includes('$') ? join(SKILL, '..', owner) : SKILL;
      const target = r.includes('*') ? join(base, r.slice(0, r.indexOf('*')).replace(/[^/]*$/, '')) : join(base, r);
      if (base !== SKILL) siblings++;
      if (!existsSync(target)) (base === SKILL ? missing : missingSibling).add(`${base === SKILL ? '' : `${owner}/`}${r} ← ${rel(f)}`);
    }
  }
  check('every referenced skill file exists', missing.size === 0, missing.size ? [...missing].slice(0, 6).join('; ') : '');
  check('every referenced file in a sibling skill exists (<skills>/<name>/...)', missingSibling.size === 0,
    missingSibling.size ? [...missingSibling].slice(0, 6).join('; ') : `${siblings} reference(s)`);
}

// 3. Hebrew documents use the .rtl.md extension
{
  const wrong = files.filter((p) => extname(p) === '.md' && !p.endsWith('.rtl.md')).filter((p) => {
    const t = readFileSync(p, 'utf8');
    const he = (t.match(/[\u05D0-\u05EA]/g) || []).length;
    const letters = (t.match(/\p{L}/gu) || []).length;
    return letters > 200 && he / letters > 0.5;
  });
  check('Hebrew documents use .rtl.md', wrong.length === 0, wrong.map(rel).join(', '));
}

// 4. slop-scan rule vectors and self-skip
{
  const { NEW_RULES, NEW_SECOND_ORDER, TESTS } = await import(pathToFileURL(join(SKILL, 'scripts', 'slop-rules.mjs')).href);
  let pass = 0;
  const fails = [];
  for (const r of [...NEW_RULES, ...NEW_SECOND_ORDER]) {
    const t = TESTS[r.id];
    if (!t) { fails.push(`${r.id}: no vectors`); continue; }
    for (const s of t.yes) { r.re.lastIndex = 0; if ([...s.matchAll(r.re)].length) pass++; else fails.push(`${r.id} misses ${JSON.stringify(s).slice(0, 50)}`); }
    for (const s of t.no) { r.re.lastIndex = 0; if ([...s.matchAll(r.re)].length) fails.push(`${r.id} false hit ${JSON.stringify(s).slice(0, 50)}`); else pass++; }
  }
  check('slop-scan rule vectors', fails.length === 0, `${pass} passed${fails.length ? `; ${fails.slice(0, 3).join('; ')}` : ''}`);
  try {
    const { stdout } = await execFileP(process.execPath, [join(SKILL, 'scripts', 'slop-scan.mjs'), join(SKILL, 'scripts'), '--json'], { maxBuffer: 16 << 20 });
    const j = JSON.parse(stdout.trim().split('\n').pop());
    check('slop-scan skips its own rule files', j.index === 0, `index ${j.index}`);
  } catch (e) { check('slop-scan skips its own rule files', false, e.message.slice(0, 120)); }
  // second-order signals: a plain slop-ok is ignored, slop-ok:<rule> decision:D<n> waives into its own section
  const fixture = join(SKILL, 'tests', 'fixtures', 'slop-waiver');
  const asJson = await runScript([join(SKILL, 'scripts', 'slop-scan.mjs'), fixture, '--json']);
  const asMd = await runScript([join(SKILL, 'scripts', 'slop-scan.mjs'), fixture]);
  let j = null;
  try { j = JSON.parse(String(asJson.stdout).trim().split('\n').pop()); } catch { /* checked below */ }
  const md = String(asMd.stdout || '');
  const waived = j && j.secondOrderWaived && j.secondOrderWaived['klein-blue'];
  check('slop-scan: decision:D<n> waives a second-order signal into its own section; a plain slop-ok does not',
    Boolean(waived) && waived.length === 2 && !j.secondOrder.includes('klein-blue') && ['cream-paper', 'grain-overlay', 'mono-uppercase-labels'].every((id) => j.secondOrder.includes(id)) &&
    /## Second-order signals waived by decision/.test(md) && /klein-blue \([^)]*\): 2 occurrences/.test(md) && /## Plain slop-ok on second-order signals[^\n]*\n- cream-paper/.test(md),
    j ? `signals ${j.secondOrder.join(', ')}; waived ${Object.keys(j.secondOrderWaived || {}).join(', ') || 'none'}` : 'no JSON from slop-scan');
}

// 5. every script answers --help
{
  const bad = [];
  for (const f of readdirSync(join(SKILL, 'scripts')).filter((n) => n.endsWith('.mjs') && !['slop-rules.mjs', 'slop-dom.mjs', 'selftest.mjs'].includes(n))) {
    try { await execFileP(process.execPath, [join(SKILL, 'scripts', f), '--help'], { timeout: 20000 }); } catch (e) { bad.push(`${f}: ${(e.stderr || e.message).slice(0, 80)}`); }
  }
  check('every script answers --help', bad.length === 0, bad.join('; '));
}

// ---------------------------------------------------------------- browser checks
function loadPuppeteer() {
  const bases = [join(process.cwd(), 'noop.js'), import.meta.url];
  try { bases.push(join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'noop.js')); } catch { /* none */ }
  for (const b of bases) { try { return createRequire(b)('puppeteer'); } catch { /* next */ } }
  return null;
}

// JPEG width and height from the first SOF marker (no image dependency).
function jpegSize(buf) {
  for (let i = 2; i + 9 < buf.length;) {
    if (buf[i] !== 0xFF) return null;
    const m = buf[i + 1];
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

// tests/fixtures/engine-api.html runs its own checks and writes window.__api; the viewport and the OS
// preference are changed from here (CDP emulation, no reload), then the page's counters are read.
async function engineApiChecks(open) {
  const page = await open('/tests/fixtures/engine-api.html');
  await page.waitForFunction(() => window.__api && window.__api.done, { timeout: 60000 });
  const a = await page.evaluate(() => window.__api);
  if (a.errors.length) { check('engine API fixture ran', false, a.errors[0].slice(0, 200)); await page.close(); return; }
  check('onFrame: jobs share one ticker listener, which leaves with the last job', a.onFrameTwoJobsOneListener && a.onFrameOneLeft && a.onFrameBackToBaseline && a.onFrameStopsCalling,
    `two jobs ${a.onFrameTwoJobsOneListener}, one left ${a.onFrameOneLeft}, none ${a.onFrameBackToBaseline}, stopped ${a.onFrameStopsCalling}`);
  check('onFrame: (time, deltaTime, frame); a job can remove itself; one function added twice leaves twice', a.onFrameRan && a.onFrameArgs && a.onFrameSelfRemoval && a.onFrameSameFunctionTwice,
    `ran ${a.onFrameRan}, args ${a.onFrameArgs}, self-removal ${a.onFrameSelfRemoval}, twice ${a.onFrameSameFunctionTwice}`);
  check('damp(k) = 1 - (1 - k)^min(deltaRatio(60), 3)', a.damp && Object.values(a.damp).every(Boolean), JSON.stringify(a.damp));
  check('content-height watch: one refresh within 1 s of new content, one per animated burst, never answering its own refresh',
    a.idleRefreshes === 0 && a.refreshLatencyMs !== null && a.refreshLatencyMs <= 1000 && a.refreshesAfterAppend === 1 && a.heightGrowth > 800 && a.refreshesAfterBurst === 1,
    `${a.refreshLatencyMs} ms, ${a.refreshesAfterAppend} refresh, burst of 20 frames ${a.refreshesAfterBurst}, idle ${a.idleRefreshes}, page grew ${a.heightGrowth}px (the refresh itself grows a pin)`);
  check('watchContent: false; destroy() cancels a pending refresh and removes the load listener',
    a.watchOffRefreshes === 0 && a.pendingRefreshAfterDestroy === 0 && a.loadListenerRemoved && a.tickerAfterE0 === 0,
    `watch off ${a.watchOffRefreshes}, after destroy ${a.pendingRefreshAfterDestroy}, load removed ${a.loadListenerRemoved}, ticker ${a.tickerAfterE0}`);
  check('themeLayers on an engine that is already destroyed: no trigger left, no late theme flip on <body>',
    a.lateThemeCalled && a.lateThemeTriggers === 0 && a.lateThemeFlips === 0, `called ${a.lateThemeCalled}, triggers ${a.lateThemeTriggers}, t-* classes ${a.lateThemeFlips}`);
  check('options.lenis.autoRaf is forced false: no second rAF loop (a bare Lenis with autoRaf runs one)',
    a.motionOn && a.autoRafOption === false && a.engineOwnRaf === 0 && a.controlOwnRaf > 5 && a.lagSetToZero,
    `own rAF calls in 300 ms: engine ${a.engineOwnRaf}, bare Lenis ${a.controlOwnRaf}`);
  const cdp = await page.createCDPSession();
  const resize = async (width, height) => {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await sleep(300);
    return page.evaluate(() => ({ ...window.__api.resize }));
  };
  const r1 = await resize(1440, 700); // desktop, height only: counts
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const r2 = await resize(1440, 620); // touch, height only: the address bar, ignored
  const r3 = await resize(1280, 620); // touch, width: counts
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false });
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  check('onViewportResize: desktop height changes count, touch height-only changes do not', r1.viewport === 1 && r1.width === 0 && r2.viewport === 1 && r3.viewport === 2 && r3.width === 1,
    `viewport/width calls: 1440x700 ${r1.viewport}/${r1.width}, touch 1440x620 ${r2.viewport}/${r2.width}, touch 1280x620 ${r3.viewport}/${r3.width}`);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await sleep(600);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await sleep(600);
  const p = await page.evaluate(() => ({ calls: window.__api.prefCalls, events: window.__api.prefEvents, rebuilds: window.__api.rebuilds, after: window.__api.afterDestroy }));
  const [reducedBuild, fullBuild] = p.rebuilds;
  check('OS preference change: onPreferenceChange and motion:preference fire; the boot code rebuilds reduced, then full',
    JSON.stringify(p.events) === '[true,false]' && JSON.stringify(p.calls) === '[true,false]' && Boolean(reducedBuild && reducedBuild.REDUCE && !reducedBuild.lenis && reducedBuild.reduced && fullBuild && !fullBuild.REDUCE && fullBuild.lenis && fullBuild.ready),
    `events ${JSON.stringify(p.events)}, rebuilds ${JSON.stringify(p.rebuilds)}`);
  const d = p.after[0] || {};
  check('destroy(): no ticker listener or trigger left, lagSmoothing back to 500/33, cleanups ran once, a late addCleanup runs at once',
    d.tickerAdded === 0 && d.triggers === 0 && d.frameJobs === 0 && d.lastLag === '[500,33]' && d.cleanupRanOnce && d.lateCleanup && d.classes === '', JSON.stringify(d));
  const fin = await page.evaluate(() => window.__finish());
  check('after the last destroy(): nothing on the ticker, no triggers, no classes on <html>', fin.tickerAdded === 0 && fin.triggers === 0 && fin.classes === '', JSON.stringify(fin));
  await page.close();
}

// The short desktop profile (1440x700) in scroll-film and motion-audit, and slop-scan's URL-mode
// decision waivers. Output goes to a temp folder that is removed afterwards.
async function scriptChecks(base) {
  const out = mkdtempSync(join(tmpdir(), 'pb-selftest-'));
  try {
    const layer = `${base}/tests/fixtures/layer.html`;
    await runScript([join(SKILL, 'scripts', 'scroll-film.mjs'), layer, '--viewports', 'short', '--at', '0', '--out', out]);
    const at = existsSync(join(out, 'short', 'at.json')) ? JSON.parse(readFileSync(join(out, 'short', 'at.json'), 'utf8')) : null;
    const shot = at && at.shots[0] && at.shots[0].file ? jpegSize(readFileSync(join(out, 'short', at.shots[0].file))) : null;
    check('scroll-film --viewports short films at 1440x700', Boolean(shot) && shot.w === 1440 && shot.h === 700, shot ? `frame ${shot.w}x${shot.h}` : 'no frame');
    await runScript([join(SKILL, 'scripts', 'motion-audit.mjs'), layer, '--viewports', 'short', '--only', 'reduced', '--intro', '1500', '--out', out]);
    const rep = existsSync(join(out, 'motion-audit.json')) ? JSON.parse(readFileSync(join(out, 'motion-audit.json'), 'utf8')) : null;
    const vp = rep && rep.viewports[0];
    check('motion-audit --viewports short measures at 1440x700', Boolean(vp) && vp.name === 'short' && vp.profile.width === 1440 && vp.profile.height === 700 && vp.verdicts.length > 0,
      vp ? `${vp.name} ${vp.profile.width}x${vp.profile.height}, ${vp.verdicts.filter((v) => v.ok).length}/${vp.verdicts.length} checks pass` : 'no report');
    const scan = await runScript([join(SKILL, 'scripts', 'slop-scan.mjs'), '--url', `${base}/tests/fixtures/slop-waiver/index.html`, '--json']);
    let j = null;
    try { j = JSON.parse(String(scan.stdout).trim().split('\n').pop()); } catch { /* checked below */ }
    check('slop-scan URL mode: data-slop-ok="<rule> decision:D<n>" waives that second-order signal only',
      Boolean(j && j.secondOrderWaived && j.secondOrderWaived['klein-blue']) && !j.secondOrder.includes('klein-blue') && j.secondOrder.includes('cream-paper'),
      j ? `signals ${j.secondOrder.join(', ')}; waived ${Object.keys(j.secondOrderWaived || {}).join(', ') || 'none'}` : String(scan.stderr || scan.message || '').slice(0, 160));
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

async function serveSkill(port) {
  const child = spawn(process.execPath, [join(SKILL, 'scripts', 'serve.mjs'), SKILL, '--port', String(port)], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    const ok = await new Promise((r) => http.get(`http://localhost:${port}/SKILL.md`, (res) => { res.resume(); r(res.statusCode === 200); }).on('error', () => r(false)));
    if (ok) return child;
    await new Promise((r) => setTimeout(r, 200));
  }
  child.kill();
  throw new Error('serve.mjs did not start');
}

if (BROWSER) {
  const puppeteer = loadPuppeteer();
  if (!puppeteer) {
    check('browser checks', false, 'puppeteer not found: run from a project that has it (npm i -D puppeteer)');
  } else {
    const port = 4790 + Math.floor(Math.random() * 100);
    const server = await serveSkill(port);
    const base = `http://localhost:${port}`;
    const browser = await puppeteer.launch({ headless: true });
    const open = async (path, { width = 1440, reduce = false, js = true } = {}) => {
      const page = await browser.newPage();
      await page.setJavaScriptEnabled(js);
      await page.setViewport({ width, height: 900 });
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' }]);
      await page.goto(base + path, { waitUntil: 'load', timeout: 60000 });
      return page;
    };
    try {
      // RTL line split matches native line breaks
      for (const width of [390, 1440]) {
        const page = await open('/tests/fixtures/rtl-split.html', { width });
        await page.waitForFunction(() => window.__result, { timeout: 20000 });
        const r = await page.evaluate(() => window.__result);
        check(`RTL line split equals native breaks at ${width}px`, r.every((b) => b.identical && b.rtlLines) && r[0].dirAfterRevert === 'rtl',
          r.map((b) => `${b.id}: ${b.lines}/${b.native} lines${b.identical ? '' : ' DIFFERENT'}`).join(', '));
        if (width === 1440) {
          await page.waitForFunction(() => window.__result_resplit, { timeout: 20000 }).catch(() => {});
          const rs = await page.evaluate(() => window.__result_resplit || null);
          check('RTL re-split after a width change still equals native breaks, element stays RTL', rs && rs.every((b) => b.identical && b.dir === 'rtl' && b.startSideKept),
            rs ? rs.map((b) => `${b.id}: ${b.lines}/${b.native}${b.identical ? '' : ' DIFFERENT'} dir ${b.dir}`).join(', ') : 'fixture gave no result');
        }
        await page.close();
      }
      // attribute layer: boot, kill switches, QA jump, teardown
      const settle = (ms = 3500) => new Promise((r) => setTimeout(r, ms));
      const state = () => ({
        cls: document.documentElement.className, zones: window.__pb ? window.__pb.zones.join(',') : '',
        triggers: window.ScrollTrigger ? ScrollTrigger.getAll().length : 0, lines: document.querySelectorAll('.line').length,
        p: getComputedStyle(document.querySelector('[data-pb-stage]')).getPropertyValue('--pb-p').trim(),
        stageH: Math.round(document.querySelector('[data-pb-stage]').getBoundingClientRect().height), y: Math.round(scrollY),
      });
      let page = await open('/tests/fixtures/layer.html');
      await settle();
      const boot = await page.evaluate(state);
      await page.evaluate(() => window.__pb.stop());
      await settle(300);
      const stopped = await page.evaluate(state);
      await page.evaluate(() => window.__pb.restart());
      await settle(1200);
      const again = await page.evaluate(state);
      check('layer boots every zone and a tall stage', boot.zones === 'Z01,Z02,Z03,Z04,Z05' && boot.stageH > 1500 && boot.cls.includes('pb-on'), `zones ${boot.zones}, stage ${boot.stageH}px`);
      check('layer stop() leaves nothing behind', stopped.triggers === 0 && stopped.lines === 0 && !stopped.cls.includes('pb-on'), `triggers ${stopped.triggers}, split lines ${stopped.lines}`);
      check('layer restart() rebuilds without duplicates', again.triggers === boot.triggers, `${boot.triggers} → ${again.triggers}`);
      await page.close();
      page = await open('/tests/fixtures/layer.html?at=story:0.5');
      await settle();
      const at = await page.evaluate(state);
      check('?at=story:0.5 lands mid-stage', Math.abs(parseFloat(at.p) - 0.5) < 0.02, `--pb-p ${at.p}, y ${at.y}`);
      await page.close();
      page = await open('/tests/fixtures/layer.html?pb-off=Z02');
      await settle();
      const off = await page.evaluate(state);
      check('?pb-off=Z02 skips that zone', !off.zones.split(',').includes('Z02') && off.lines === 1, `zones ${off.zones}`);
      await page.close();
      page = await open('/tests/fixtures/layer.html?motion=0');
      await settle(1500);
      const none = await page.evaluate(state);
      check('?motion=0 switches the layer off', none.triggers === 0 && none.stageH <= 900, `classes "${none.cls}", stage ${none.stageH}px`);
      await page.close();
      page = await open('/tests/fixtures/layer.html', { reduce: true });
      await settle(2000);
      const red = await page.evaluate(state);
      check('reduced motion: final states, short stage', red.cls.includes('pb-reduced') && red.p === '1' && red.stageH <= 900 && red.lines === 0, `--pb-p ${red.p}, stage ${red.stageH}px`);
      await page.close();
      page = await open('/tests/fixtures/layer.html', { js: false });
      const hidden = await page.evaluate(() => [...document.querySelectorAll('h1,h2,p,div')].filter((e) => { const cs = getComputedStyle(e); return cs.visibility === 'hidden' || Number(cs.opacity) < 0.1; }).length);
      check('JavaScript off: nothing hidden', hidden === 0, `${hidden} hidden`);
      await page.close();
      await engineApiChecks(open);
      await scriptChecks(base);
    } catch (e) {
      check('browser checks ran', false, e.message.slice(0, 160));
    } finally {
      await browser.close();
      if (FULL) {
        // A temp folder like the other scratch output; kept (and named) only when the audit fails.
        const auditOut = mkdtempSync(join(tmpdir(), 'pb-selftest-audit-'));
        let auditOk = false;
        try {
          const { stdout } = await execFileP(process.execPath, [join(SKILL, 'scripts', 'motion-audit.mjs'), `${base}/assets/demo/moves-gallery.html`, '--viewports', 'desktop,mobile', '--intro', '2500', '--out', auditOut], { timeout: 20 * 60 * 1000, maxBuffer: 32 << 20 });
          const lines = stdout.split('\n').filter((l) => /checks pass|checks fail|\d+\/\d+/.test(l));
          auditOk = lines.length >= 2 && lines.every((l) => { const m = l.match(/(\d+)\/(\d+)/); return m && m[1] === m[2]; });
          check('moves gallery passes motion-audit on desktop and mobile', auditOk, `${lines.join(' | ')}${auditOk ? '' : `; report kept in ${auditOut}`}`);
        } catch (e) { check('moves gallery motion-audit', false, `${(e.stdout || e.message).slice(-200)}; report kept in ${auditOut}`); }
        if (auditOk) rmSync(auditOut, { recursive: true, force: true });
      }
      server.kill();
    }
  }
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks pass${BROWSER ? '' : ' (static only; add --browser for engine checks)'}`);
process.exit(failed.length ? 1 : 0);
