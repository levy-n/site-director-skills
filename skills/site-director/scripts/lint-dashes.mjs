#!/usr/bin/env node
// lint-dashes: finds the three characters Nati's dash rule bans (en dash U+2013, em dash U+2014,
// Hebrew maqaf U+05BE) in files and folders, and optionally replaces them with the plain hyphen.
// Node 20+, no dependencies. Exit 0 = clean (or everything fixed), 1 = found (or some left for a
// hand edit after --fix), 2 = usage error.
// The banned characters are built from code points, so the linter passes on itself.

import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, relative, resolve, extname } from 'node:path';

const HELP = `lint-dashes: find en dashes, em dashes and Hebrew maqafs; only "-" is allowed.

  node lint-dashes.mjs <file or folder> [more...] [--fix] [--json]

Scans files and folders recursively. Skips node_modules, .git and binary files (by extension, or a
NUL byte in the first 8 KB). Prints file:line:col, the character's name and the line around it,
with the character shown as [U+2014] so the output itself stays clean.

--fix    rewrite the files: " \\u2014 " and " \\u2013 " (with spaces) become " - ", any other en or em
         dash becomes "-", and the maqaf becomes "-". Line endings and a BOM are kept. An en or em
         dash that opens a line (after indentation, a ">" or a list marker) is left in place and
         listed for a hand edit, because "- " there turns into a Markdown list bullet. Review the
         diff: a sentence that used a dash as a pause may read better with ":" or as two sentences.
--json   print the findings as JSON

Exit code: 0 nothing found (or everything fixed), 1 found (without --fix) or left for a hand edit
(with --fix), 2 usage error.`;

// The banned characters are built from code points, so this file itself contains none of them.
const EN_DASH = String.fromCharCode(0x2013);
const EM_DASH = String.fromCharCode(0x2014);
const MAQAF = String.fromCharCode(0x05be);
const BANNED = { [EN_DASH]: 'en dash U+2013', [EM_DASH]: 'em dash U+2014', [MAQAF]: 'maqaf U+05BE' };
const ANY = new RegExp(`[${EN_DASH}${EM_DASH}${MAQAF}]`, 'g');
const SPACED = new RegExp(` [${EN_DASH}${EM_DASH}] `, 'g');
const DASHES = new RegExp(`[${EN_DASH}${EM_DASH}]`, 'g');
const MAQAFS = new RegExp(MAQAF, 'g');
// A BOM (first line only), indentation, blockquote markers and one list marker ("- ", "* ", "+ ",
// "1. "), then the dash.
const LEADING = new RegExp(`^\\ufeff?[ \\t]*(?:>[ \\t]*)*(?:[-*+][ \\t]+|\\d+[.)][ \\t]+)?[${EN_DASH}${EM_DASH}]`);
const SKIP_DIRS = new Set(['node_modules', '.git']);
const BINARY_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.bmp', '.tif', '.tiff', '.psd',
  '.woff', '.woff2', '.ttf', '.otf', '.eot', '.mp4', '.webm', '.mov', '.m4v', '.mp3', '.wav', '.ogg',
  '.flac', '.pdf', '.zip', '.gz', '.br', '.7z', '.rar', '.tar', '.riv', '.wasm', '.exe', '.dll', '.so',
  '.dylib', '.glb', '.bin', '.class', '.jar', '.docx', '.xlsx', '.pptx', '.sqlite', '.db',
]);

function parseArgs(argv) {
  const opts = { paths: [], fix: false, json: false };
  for (const a of argv) {
    if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--fix') opts.fix = true;
    else if (a === '--json') opts.json = true;
    else if (a.startsWith('--')) return { error: `unknown option ${a}` };
    else opts.paths.push(a);
  }
  return opts;
}

function collect(target, out) {
  const st = statSync(target);
  if (st.isFile()) {
    out.push(target);
    return;
  }
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(target, entry.name);
    if (entry.isDirectory()) collect(full, out);
    else if (entry.isFile() && !BINARY_EXT.has(extname(entry.name).toLowerCase())) out.push(full);
  }
}

function readText(path) {
  const buf = readFileSync(path);
  if (buf.subarray(0, 8192).includes(0)) return null;
  return buf.toString('utf8');
}

function findIn(text) {
  const hits = [];
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(ANY)) {
      const from = Math.max(0, m.index - 40);
      const context = line.slice(from, m.index + 41).replace(/\r$/, '').replace(ANY, (c) => `[U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}]`);
      hits.push({ line: i + 1, col: m.index + 1, char: BANNED[m[0]], context: context.trim() });
    }
  });
  return hits;
}

const fixRun = (s) => s.replace(SPACED, ' - ').replace(DASHES, '-').replace(MAQAFS, '-');

// A dash that opens a line (a dialogue dash, an attribution) would become "- ", a Markdown list
// bullet, so it stays for a hand edit; the rest of that line is fixed as usual.
function fixText(text) {
  return text.split('\n').map((line) => {
    const lead = line.match(LEADING);
    return lead ? lead[0] + fixRun(line.slice(lead[0].length)) : fixRun(line);
  }).join('\n');
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(HELP);
    return 0;
  }
  if (opts.error || opts.paths.length === 0) {
    console.error(`${opts.error || 'no files or folders given'}\nusage: node lint-dashes.mjs <file or folder> [more...] [--fix] [--json]`);
    return 2;
  }
  const missing = opts.paths.filter((p) => !existsSync(p));
  if (missing.length) {
    console.error(`not found: ${missing.join(', ')}`);
    return 2;
  }
  const files = [];
  for (const p of opts.paths) collect(p, files);
  const results = [];
  let scanned = 0;
  for (const path of files) {
    const text = readText(path);
    if (text === null) continue;
    scanned += 1;
    const hits = findIn(text);
    if (!hits.length) continue;
    const file = relative(process.cwd(), resolve(path)).replace(/\\/g, '/');
    let left = [];
    if (opts.fix) {
      const fixed = fixText(text);
      writeFileSync(path, fixed, 'utf8');
      left = findIn(fixed);
    }
    results.push({ file, hits, left });
  }
  report(results, scanned, opts);
  const found = results.reduce((n, r) => n + r.hits.length, 0);
  const left = results.reduce((n, r) => n + r.left.length, 0);
  return (found && !opts.fix) || left ? 1 : 0;
}

function report(results, scanned, opts) {
  const found = results.reduce((n, r) => n + r.hits.length, 0);
  const left = results.reduce((n, r) => n + r.left.length, 0);
  if (opts.json) {
    console.log(JSON.stringify({ scanned, found, fixed: opts.fix ? found - left : 0, left, files: results }, null, 2));
    return;
  }
  for (const r of results) {
    for (const h of r.hits) console.log(`${r.file}:${h.line}:${h.col}  ${h.char}  ${h.context}`);
  }
  if (!opts.fix) {
    console.log(`${found ? '' : 'clean: '}${scanned} file(s) scanned, ${found} banned dash(es) found in ${results.length} file(s)`);
    return;
  }
  for (const r of results) {
    for (const h of r.left) console.log(`left for a hand edit (opens a line; "- " would become a list bullet): ${r.file}:${h.line}:${h.col}  ${h.context}`);
  }
  console.log(`${scanned} file(s) scanned, ${found - left} banned dash(es) fixed in ${results.length} file(s)${left ? `, ${left} left for a hand edit` : ''}`);
}

process.exitCode = main();
