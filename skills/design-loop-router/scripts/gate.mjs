/**
 * gate.mjs — the pass/fail gate of the design loop.
 *
 * Combines two evidence sources for one run:
 *   (a) the browser report written by the verify leg
 *       .design-loop/<runId>/verify/<label>/report.json   (label !== "before")
 *   (b) a static source scan over src/ (or only the --changed files)
 *
 * Contract: node builtins only, zero dependencies, zero network access.
 * It reads files, writes failures.json into the run folder, prints a table.
 *
 * A rule is never reported as "pass" when the evidence to judge it was absent.
 * Such rules are reported as "not-evaluated". That distinction is the point.
 *
 * Usage:
 *   node gate.mjs --run <runId> [--changed a.tsx,b.css] [--label after] [--root <projectRoot>]
 *
 * Exit codes: 0 = no fail-severity rule failed | 2 = at least one failed
 *             3 = run folder or browser report missing (run the verify leg first)
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve as pathResolve, extname, basename } from 'node:path';
import process from 'node:process';

const DEFAULT_ROOT = 'G:/Web-Dev/MediaWaveIsrael';
const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css']);
const SKIP_DIR = new Set([
  'node_modules', 'dist', 'build', 'coverage', '.git', '.design-loop',
  '.next', '.vite', '.cache', 'public', 'sanity', 'studio',
]);
const MAX_EVIDENCE = 25;

/* ------------------------------------------------------------------ paths */

const slash = (p) => String(p).replace(/\\/g, '/');

function parseArgs(argv) {
  const out = { run: null, changed: null, label: null, root: DEFAULT_ROOT, help: false };
  const flat = [];
  for (const raw of argv) {
    if (raw.startsWith('--') && raw.includes('=')) {
      const i = raw.indexOf('=');
      flat.push(raw.slice(0, i), raw.slice(i + 1));
    } else flat.push(raw);
  }
  for (let i = 0; i < flat.length; i++) {
    const a = flat[i];
    if (a === '--run') out.run = flat[++i];
    else if (a === '--changed') out.changed = flat[++i];
    else if (a === '--label') out.label = flat[++i];
    else if (a === '--root') out.root = flat[++i];
    else if (a === '--help' || a === '-h') out.help = true;
    else if (a.startsWith('--')) die(1, `unknown flag "${a}". Run with --help for the accepted flags.`);
  }
  return out;
}

function die(code, msg) {
  process.stderr.write(`gate: ${msg}\n`);
  process.exit(code);
}

/* -------------------------------------------------------------- file util */

function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const full = slash(`${dir}/${e.name}`);
    if (e.isDirectory()) {
      if (SKIP_DIR.has(e.name)) continue;
      walk(full, acc);
    } else if (SCAN_EXT.has(extname(e.name).toLowerCase())) {
      acc.push(full);
    }
  }
  return acc;
}

function loadFile(root, abs) {
  let content;
  try {
    content = readFileSync(abs, 'utf8');
  } catch {
    return null;
  }
  const starts = [0];
  for (let i = 0; i < content.length; i++) if (content.charCodeAt(i) === 10) starts.push(i + 1);
  return {
    abs: slash(abs),
    rel: slash(abs).startsWith(slash(root) + '/') ? slash(abs).slice(slash(root).length + 1) : slash(abs),
    name: basename(abs),
    ext: extname(abs).toLowerCase(),
    content,
    starts,
  };
}

function lineOf(file, index) {
  const s = file.starts;
  let lo = 0, hi = s.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (s[mid] <= index) lo = mid; else hi = mid - 1;
  }
  return lo + 1;
}

function snippet(file, index) {
  const line = lineOf(file, index);
  const start = file.starts[line - 1];
  const end = file.starts[line] === undefined ? file.content.length : file.starts[line] - 1;
  return { line, text: file.content.slice(start, end).trim().slice(0, 160) };
}

const hit = (file, index, note) => {
  const s = snippet(file, index);
  return note ? { file: file.rel, line: s.line, text: s.text, note } : { file: file.rel, line: s.line, text: s.text };
};

/* ------------------------------------------------------------ static rules */

const RE_LEGACY_HEX = /(?<![0-9A-Za-z])#?(F5A623|E07B54|F28B82)(?![0-9A-Za-z])/gi;
const RE_FM_IMPORT = /import\s+([\s\S]{0,400}?)\s+from\s+['"]framer-motion(?:\/[^'"]*)?['"]/g;
const RE_CUBIC = /cubic-bezier\s*\(/gi;
const RE_EASE_ARRAY = /\b(?:ease|easing|easeIn|easeOut|easeInOut|customEase|transitionEase)\s*:\s*\[\s*-?\d*\.?\d+\s*,\s*-?\d*\.?\d+\s*,\s*-?\d*\.?\d+\s*,\s*-?\d*\.?\d+\s*\]/g;
const RE_CSS_TOKEN_DECL = /(?:^|[\s;{])--[\w-]+\s*:[^;{}]*$/;

/** true when the match at `index` sits inside a `--token: …` declaration in a css file */
function insideCssToken(file, index) {
  const cut = Math.max(
    file.content.lastIndexOf(';', index),
    file.content.lastIndexOf('{', index),
    file.content.lastIndexOf('}', index),
  );
  return RE_CSS_TOKEN_DECL.test(file.content.slice(cut + 1, index));
}
const RE_CLIP_TEXT = /(?:-webkit-)?background-?[Cc]lip\s*:\s*['"]?text/g;
const RE_FILL_TRANSPARENT = /-webkit-text-fill-color\s*:\s*['"]?transparent|WebkitTextFillColor\s*:\s*['"]transparent/g;
const RE_TW_CLIP_TEXT = /\bbg-clip-text\b/g;
const RE_BLOCK = /\{([^{}]*)\}/g;
const RE_BLEND = /mix-blend-mode|mixBlendMode/;
const RE_TEXT_PROP = /(?:^|[\s;{,])(?:color|font[-A-Z][\w-]*|text[-A-Z][\w-]*|letter-spacing|letterSpacing|line-height|lineHeight|WebkitTextFillColor)\s*:/;
const RE_OUTLINE_NONE = /outline\s*:\s*['"]?none|\boutline-none\b|outline\s*:\s*0(?![\w.])/g;
const RE_FOCUS_VISIBLE = /focus-visible|focusVisible/;
const RE_SET_ITEM = /localStorage\s*\.\s*setItem|localStorage\[\s*['"]setItem/g;
const RE_NAVY_PROP = /(?:^|[\s;{,])(?:color|border-color|borderColor|background-color|backgroundColor|stroke|fill)\s*:\s*[^;{}\n]{0,40}#?1E293B/gi;
const RE_NAVY_TW = /\b(?:text|border|bg|fill|stroke|ring|outline|decoration)-\[#?1E293B\]/gi;

function fmNamedBindings(clause) {
  const braced = clause.match(/\{([\s\S]*?)\}/);
  if (!braced) return [];
  return braced[1]
    .split(',')
    .map((part) => part.trim().split(/\s+as\s+/)[0].trim())
    .filter(Boolean);
}

const STATIC_RULES = [
  {
    id: 'LEGACY_NAME',
    severity: 'fail',
    title: 'retired warm hex reappeared (variable names are legacy, values are sky)',
    scan(file) {
      const out = [];
      for (const m of file.content.matchAll(RE_LEGACY_HEX)) out.push(hit(file, m.index, `retired hex ${m[1].toUpperCase()}`));
      return out;
    },
  },
  {
    id: 'MOTION_IMPORT',
    severity: 'fail',
    title: 'imported the motion binding — LazyMotion strict requires m',
    scan(file) {
      if (file.ext === '.css') return [];
      const out = [];
      for (const m of file.content.matchAll(RE_FM_IMPORT)) {
        const names = fmNamedBindings(m[1]);
        if (names.includes('motion')) out.push(hit(file, m.index, 'import { m } instead'));
      }
      return out;
    },
  },
  {
    id: 'EASE_SOURCE',
    severity: 'fail',
    title: 'easing written inline instead of imported from src/config/motion.ts',
    scan(file) {
      if (file.rel.endsWith('src/config/motion.ts')) return [];
      const out = [];
      for (const m of file.content.matchAll(RE_CUBIC)) {
        if (file.ext === '.css' && insideCssToken(file, m.index)) continue; // the token declaration IS the source
        out.push(hit(file, m.index, 'literal cubic-bezier'));
      }
      if (file.ext !== '.css') {
        for (const m of file.content.matchAll(RE_EASE_ARRAY)) out.push(hit(file, m.index, 'inline easing array — use EASE_BRAND'));
      }
      return out;
    },
  },
  {
    id: 'NO_GRADIENT_TEXT',
    severity: 'fail',
    title: 'gradient-clipped text',
    scan(file) {
      const out = [];
      for (const m of file.content.matchAll(RE_CLIP_TEXT)) out.push(hit(file, m.index, 'background-clip: text'));
      for (const m of file.content.matchAll(RE_FILL_TRANSPARENT)) out.push(hit(file, m.index, 'text-fill-color: transparent'));
      for (const m of file.content.matchAll(RE_TW_CLIP_TEXT)) out.push(hit(file, m.index, 'bg-clip-text utility'));
      return out;
    },
  },
  {
    id: 'NO_BLEND_TEXT',
    severity: 'fail',
    title: 'mix-blend-mode in the same block as a text property',
    scan(file) {
      const out = [];
      for (const block of file.content.matchAll(RE_BLOCK)) {
        const body = block[1];
        if (!RE_BLEND.test(body) || !RE_TEXT_PROP.test(body)) continue;
        const offset = block.index + 1 + body.search(RE_BLEND);
        out.push(hit(file, offset, 'blend mode applied to text'));
      }
      return out;
    },
  },
  {
    id: 'FOCUS_RING',
    severity: 'warn',
    title: 'outline removed in a file with no focus-visible style',
    scan(file) {
      if (RE_FOCUS_VISIBLE.test(file.content)) return [];
      const out = [];
      for (const m of file.content.matchAll(RE_OUTLINE_NONE)) out.push(hit(file, m.index, 'no focus-visible replacement in this file'));
      return out;
    },
  },
  {
    id: 'A11Y_NO_PERSIST',
    severity: 'fail',
    title: 'accessibility widget writes to localStorage — settings must not persist',
    scan(file) {
      if (!/accessib/i.test(file.name)) return [];
      const out = [];
      for (const m of file.content.matchAll(RE_SET_ITEM)) out.push(hit(file, m.index, 'a11y settings must reset each visit'));
      return out;
    },
  },
  {
    id: 'ONE_ACCENT',
    severity: 'warn',
    title: 'navy 1E293B used where an accent colour belongs — needs judgement',
    scan(file) {
      const out = [];
      for (const m of file.content.matchAll(RE_NAVY_PROP)) out.push(hit(file, m.index, 'navy as colour value'));
      for (const m of file.content.matchAll(RE_NAVY_TW)) out.push(hit(file, m.index, 'navy arbitrary utility'));
      return out;
    },
  },
];

/* ----------------------------------------------------------- browser rules */

/**
 * Sub-objects the verify leg groups its measurements under. Their members are
 * hoisted onto the page entry so every rule below can use a flat key lookup.
 *
 * Without this, a measurement that WAS taken reads as "not-evaluated" purely
 * because it sits one level down — the worst possible failure for this tool,
 * since not-evaluated is meant to mean "no evidence exists", not "the evidence
 * was nested". A rule that silently skips is a rule that silently passes.
 */
const GROUPED_MEASUREMENTS = ['layout', 'render', 'counts', 'metrics'];

function hoist(entry) {
  if (!entry || typeof entry !== 'object') return entry;
  const flat = { ...entry };
  for (const group of GROUPED_MEASUREMENTS) {
    const sub = entry[group];
    if (!sub || typeof sub !== 'object' || Array.isArray(sub)) continue;
    for (const [k, v] of Object.entries(sub)) {
      if (!Object.prototype.hasOwnProperty.call(flat, k)) flat[k] = v;
    }
  }
  return flat;
}

function pageEntries(report) {
  for (const key of ['pages', 'results', 'entries', 'routes', 'checks']) {
    const v = report?.[key];
    if (Array.isArray(v) && v.length) return v.map(hoist);
  }
  return [];
}

const firstArray = (obj, keys) => {
  for (const k of keys) if (Array.isArray(obj?.[k])) return obj[k];
  return null;
};

const hasAnyKey = (entries, keys) => entries.some((e) => keys.some((k) => e && Object.prototype.hasOwnProperty.call(e, k)));

const where = (e) => {
  const route = e?.route ?? e?.name ?? e?.path ?? 'unknown-route';
  const vp = e?.viewport ?? e?.width ?? e?.vp;
  return vp === undefined ? String(route) : `${route} @ ${vp}`;
};

function axeViolations(entry, report) {
  const pools = [entry?.axe?.violations, entry?.violations, entry?.a11y?.violations, report?.axe?.violations, report?.violations];
  for (const p of pools) if (Array.isArray(p)) return p;
  return null;
}

/** Computed-style rules: evaluated only when the browser report carried the data. */
const COMPUTED_RULES = [
  {
    id: 'SKY_INK',
    severity: 'fail',
    title: 'sky #7DD3FC used as text on a light surface — sky is a fill, ink carries text',
    keys: ['skyInkText', 'skyInk', 'skyTextNodes', 'skyOnLight'],
  },
  {
    id: 'HEBREW_TYPE',
    severity: 'fail',
    title: 'Hebrew text with italic or letter-spacing',
    keys: ['hebrewType', 'hebrewTypography', 'italicHebrew', 'hebrewLetterSpacing'],
  },
  {
    id: 'NO_STATIC_UNDERLINE',
    severity: 'warn',
    title: 'underline at rest outside blog prose',
    keys: ['staticUnderlines', 'restUnderlines', 'underlineAtRest'],
  },
  {
    id: 'TOKEN_DRIFT',
    severity: 'warn',
    title: 'computed colour or spacing outside the token set',
    keys: ['tokenDrift', 'offTokenColors', 'rogueValues'],
  },
];

function computedPool(entry, keys) {
  const direct = firstArray(entry, keys);
  if (direct) return direct;
  const nested = entry?.computed ?? entry?.styles ?? entry?.audit;
  return firstArray(nested, keys);
}

function computedPresent(entries, keys) {
  return entries.some((e) => {
    if (keys.some((k) => e && Object.prototype.hasOwnProperty.call(e, k))) return true;
    const nested = e?.computed ?? e?.styles ?? e?.audit;
    return keys.some((k) => nested && Object.prototype.hasOwnProperty.call(nested, k));
  });
}

/* ------------------------------------------------------------------- main */

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  process.stdout.write(
    [
      'gate.mjs — pass/fail gate for a design-loop run',
      '',
      '  --run <runId>        required; the folder under <root>/.design-loop/',
      '  --changed <a,b,c>    limit the static scan to these files',
      '  --label <name>       force one verify label instead of the newest non-"before"',
      '  --root <path>        project root (default the MediaWave repo)',
      '',
      'exit 0 clean · 2 a fail-severity rule failed · 3 no browser report yet',
      '',
    ].join('\n'),
  );
  process.exit(0);
}

if (!args.run) die(1, 'missing --run <runId>. Example: node gate.mjs --run 2026-09-05-hero');

const root = slash(pathResolve(args.root));
const runDir = `${root}/.design-loop/${args.run}`;
const verifyDir = `${runDir}/verify`;

if (!existsSync(runDir)) {
  die(3, `no run folder at ${runDir}\n      Run the verify leg first — it creates the run folder and captures the browser evidence.`);
}
if (!existsSync(verifyDir)) {
  die(3, `no verify folder at ${verifyDir}\n      Capture the browser evidence first (the verify leg drives Puppeteer over the four viewports), then re-run the gate.`);
}

let labels;
try {
  labels = readdirSync(verifyDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => (args.label ? n === args.label : n !== 'before'))
    .map((n) => ({ name: n, path: `${verifyDir}/${n}/report.json` }))
    .filter((c) => existsSync(c.path))
    .map((c) => ({ ...c, mtime: statSync(c.path).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
} catch (err) {
  die(3, `cannot read ${verifyDir}: ${err.message}`);
}

if (!labels.length) {
  const only = existsSync(`${verifyDir}/before/report.json`) ? ' Only a "before" baseline exists.' : '';
  die(
    3,
    `no usable report.json under ${verifyDir}.${only}\n      Capture an "after" pass with the verify leg (it writes verify/<label>/report.json), then re-run the gate.`,
  );
}

const chosen = labels[0];
let report;
try {
  report = JSON.parse(readFileSync(chosen.path, 'utf8'));
} catch (err) {
  die(3, `${chosen.path} is not readable JSON (${err.message}). Re-run the verify leg to rewrite it.`);
}

const entries = pageEntries(report);
const results = [];
const record = (rule, status, evidence, measured, note) =>
  results.push({
    id: rule.id,
    severity: rule.severity,
    title: rule.title,
    source: rule.source,
    status,
    evidenceCount: evidence.length,
    evidence: evidence.slice(0, MAX_EVIDENCE),
    measured: measured ?? {},
    ...(note ? { note } : {}),
  });

/* ---- browser: runtime rules ---- */

const noEntriesNote = 'the browser report carried no page entries';

{
  const rule = { id: 'OVERFLOW_X', severity: 'fail', source: 'browser', title: 'horizontal overflow at one or more viewports' };
  const keys = ['hOverflow', 'horizontalOverflow', 'overflowX', 'hasHorizontalOverflow', 'hasOverflow', 'overflowPx'];
  if (!entries.length || !hasAnyKey(entries, keys)) {
    record(rule, 'not-evaluated', [], { routes: entries.length }, entries.length ? 'report carries no overflow measurement' : noEntriesNote);
  } else {
    const ev = [];
    for (const e of entries) {
      const v = keys.map((k) => e?.[k]).find((x) => x !== undefined);
      if (v === true || (typeof v === 'number' && v > 0)) ev.push({ where: where(e), detail: `overflow ${typeof v === 'number' ? `${v}px` : 'detected'}` });
    }
    record(rule, ev.length ? 'fail' : 'pass', ev, { routesChecked: entries.length, offending: ev.length });
  }
}

{
  const rule = { id: 'CONSOLE_ERROR', severity: 'fail', source: 'browser', title: 'console or page errors during the visit' };
  const keys = ['consoleErrors', 'pageErrors', 'errors'];
  if (!entries.length || !hasAnyKey(entries, keys)) {
    record(rule, 'not-evaluated', [], { routes: entries.length }, entries.length ? 'report carries no console capture' : noEntriesNote);
  } else {
    const ev = [];
    let total = 0;
    for (const e of entries) {
      const msgs = keys.flatMap((k) => (Array.isArray(e?.[k]) ? e[k] : []));
      total += msgs.length;
      for (const msgRaw of msgs) {
        const msg = typeof msgRaw === 'string' ? msgRaw : JSON.stringify(msgRaw);
        ev.push({ where: where(e), detail: msg.slice(0, 220) });
      }
    }
    record(rule, ev.length ? 'fail' : 'pass', ev, { routesChecked: entries.length, messages: total });
  }
}

{
  const rule = { id: 'AXE_CONTRAST', severity: 'fail', source: 'browser', title: 'accessibility engine reported contrast violations' };
  const anyAxe = entries.some((e) => axeViolations(e, report) !== null) || axeViolations(null, report) !== null;
  if (!anyAxe) {
    record(rule, 'not-evaluated', [], {}, 'the browser report carries no accessibility-engine results');
  } else {
    const ev = [];
    let nodes = 0;
    const pushViolations = (list, ctx) => {
      for (const v of list) {
        if (!/contrast/i.test(String(v?.id ?? ''))) continue;
        const targets = Array.isArray(v?.nodes) ? v.nodes : [];
        nodes += Math.max(targets.length, 1);
        const sample = targets.slice(0, 3).map((n) => (Array.isArray(n?.target) ? n.target.join(' ') : String(n?.target ?? ''))).filter(Boolean);
        ev.push({ where: ctx, detail: `${v.id}: ${String(v?.description ?? '').slice(0, 120)}${sample.length ? ` — ${sample.join(' | ')}` : ''}` });
      }
    };
    for (const e of entries) {
      const list = axeViolations(e, null);
      if (list) pushViolations(list, where(e));
    }
    const globalList = axeViolations(null, report);
    if (globalList && !entries.some((e) => axeViolations(e, null))) pushViolations(globalList, 'report-level');
    record(rule, ev.length ? 'fail' : 'pass', ev, { violations: ev.length, nodes });
  }
}

{
  const rule = { id: 'BLANK_RENDER', severity: 'fail', source: 'browser', title: 'a route rendered blank or near-empty' };
  const flagKeys = ['blank', 'isBlank', 'blankRender'];
  const lenKeys = ['bodyTextLength', 'textLength', 'visibleTextLength', 'contentLength'];
  const keys = [...flagKeys, ...lenKeys];
  if (!entries.length || !hasAnyKey(entries, keys)) {
    record(rule, 'not-evaluated', [], { routes: entries.length }, entries.length ? 'report carries no rendered-content measurement' : noEntriesNote);
  } else {
    const ev = [];
    for (const e of entries) {
      const flag = flagKeys.map((k) => e?.[k]).find((x) => x !== undefined);
      const len = lenKeys.map((k) => e?.[k]).find((x) => typeof x === 'number');
      if (flag === true) ev.push({ where: where(e), detail: 'reported as blank' });
      else if (typeof len === 'number' && len < 40) ev.push({ where: where(e), detail: `only ${len} chars of visible text` });
    }
    record(rule, ev.length ? 'fail' : 'pass', ev, { routesChecked: entries.length, offending: ev.length });
  }
}

/* ---- browser: computed-style rules ---- */

for (const rule of COMPUTED_RULES) {
  const def = { ...rule, source: 'computed-style' };
  if (!entries.length || !computedPresent(entries, rule.keys)) {
    record(def, 'not-evaluated', [], { requires: `computed-style evidence (${rule.keys[0]}) from the verify leg` },
      'no computed-style evidence in the browser report — this rule was NOT checked');
    continue;
  }
  const ev = [];
  for (const e of entries) {
    const pool = computedPool(e, rule.keys) ?? [];
    for (const item of pool) {
      const detail = typeof item === 'string' ? item : JSON.stringify(item);
      ev.push({ where: where(e), detail: detail.slice(0, 220) });
    }
  }
  record(def, ev.length ? (rule.severity === 'fail' ? 'fail' : 'warn') : 'pass', ev, { routesChecked: entries.length, offenders: ev.length });
}

/* ---- static scan ---- */

let files = [];
let scanNote = null;

if (args.changed) {
  const listed = args.changed.split(',').map((s) => s.trim()).filter(Boolean);
  const abs = listed.map((p) => (/^[A-Za-z]:\//.test(slash(p)) || slash(p).startsWith('/') ? slash(p) : slash(`${root}/${p}`)));
  const usable = abs.filter((p) => SCAN_EXT.has(extname(p).toLowerCase()) && existsSync(p));
  files = usable;
  if (!usable.length) scanNote = `--changed listed ${listed.length} path(s), none of them scannable source files`;
} else {
  const srcDir = `${root}/src`;
  if (!existsSync(srcDir)) die(3, `no source folder at ${srcDir}. Pass the right --root.`);
  files = walk(srcDir);
}

const loaded = files.map((f) => loadFile(root, f)).filter(Boolean);

for (const rule of STATIC_RULES) {
  const def = { ...rule, source: 'static' };
  if (!loaded.length) {
    record(def, 'not-evaluated', [], { filesScanned: 0 }, scanNote ?? 'no source files were scanned');
    continue;
  }
  const ev = [];
  for (const file of loaded) {
    try {
      ev.push(...rule.scan(file));
    } catch (err) {
      ev.push({ file: file.rel, line: 0, text: '', note: `scan error: ${err.message}` });
    }
  }
  const status = ev.length ? (rule.severity === 'fail' ? 'fail' : 'warn') : 'pass';
  record(def, status, ev, { filesScanned: loaded.length, matches: ev.length });
}

/* -------------------------------------------------------------- reporting */

const summary = {
  fail: results.filter((r) => r.status === 'fail').length,
  warn: results.filter((r) => r.status === 'warn').length,
  pass: results.filter((r) => r.status === 'pass').length,
  notEvaluated: results.filter((r) => r.status === 'not-evaluated').length,
};

const exitCode = summary.fail > 0 ? 2 : 0;

const payload = {
  runId: args.run,
  generatedAt: new Date().toISOString(),
  root,
  browserReport: { label: chosen.name, path: chosen.path, pageEntries: entries.length },
  staticScan: { mode: args.changed ? 'changed-only' : 'full-src', filesScanned: loaded.length, files: loaded.map((f) => f.rel), note: scanNote },
  summary,
  exitCode,
  rules: results,
};

const outPath = `${runDir}/failures.json`;
try {
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
} catch (err) {
  die(1, `cannot write ${outPath}: ${err.message}`);
}

const pad = (s, n) => String(s).padEnd(n).slice(0, n);
const MARK = { pass: 'PASS', fail: 'FAIL', warn: 'WARN', 'not-evaluated': 'NOT-EVAL' };
const order = { fail: 0, warn: 1, 'not-evaluated': 2, pass: 3 };

const lines = [];
lines.push(`gate · run ${args.run} · browser label "${chosen.name}" · ${entries.length} page entries · ${loaded.length} files scanned`);
lines.push(`${pad('RULE', 22)}${pad('SEV', 6)}${pad('STATUS', 10)}${pad('N', 5)}SOURCE / NOTE`);
lines.push('-'.repeat(78));
for (const r of [...results].sort((a, b) => order[a.status] - order[b.status] || a.id.localeCompare(b.id))) {
  const tail = r.status === 'not-evaluated' ? `${r.source} — ${r.note ?? 'no evidence'}` : r.source;
  lines.push(`${pad(r.id, 22)}${pad(r.severity, 6)}${pad(MARK[r.status], 10)}${pad(r.evidenceCount, 5)}${tail}`);
}
lines.push('-'.repeat(78));
for (const r of results) {
  if (r.status !== 'fail' && r.status !== 'warn') continue;
  for (const e of r.evidence.slice(0, 5)) {
    const loc = e.file ? `${e.file}:${e.line}` : e.where;
    lines.push(`  ${r.status === 'fail' ? 'x' : '!'} ${r.id}  ${loc}  ${(e.text || e.detail || e.note || '').slice(0, 90)}`);
  }
  if (r.evidenceCount > 5) lines.push(`  … ${r.evidenceCount - 5} more in failures.json`);
}
lines.push(
  `fail ${summary.fail} · warn ${summary.warn} · pass ${summary.pass} · not-evaluated ${summary.notEvaluated}`,
);
if (summary.notEvaluated) lines.push('not-evaluated means the evidence was absent — those rules were NOT checked and must not be reported as clean.');
lines.push(`written: ${outPath}`);

process.stdout.write(`${lines.join('\n')}\n`);
process.exit(exitCode);
