#!/usr/bin/env node
// audit-skill.mjs - audit Agent Skills folders against the house skill standard.
//
// usage: node audit-skill.mjs <skill-dir> [more skill dirs] [--json] [--strict] [--limit N] [--each]
//
//   <skill-dir>   a folder with SKILL.md, its SKILL.md, or a bare skill name (a folder next to this skill)
//   --json        print one JSON object instead of the text report
//   --strict      exit 1 on warnings too (default: only on errors)
//   --limit N     text report: show at most N findings per check and file (default 5, 0 = all)
//   --each        treat every folder argument as a folder OF skills and audit each child skill
//   --help, -h    print this help
//
// Exit codes: 0 clean (or warnings only, without --strict), 1 errors (or warnings with --strict),
// 2 usage error (no folder, unknown flag, missing folder).
// Reads files only: never runs the audited skill's code, never uses the network. Node 20+, no install.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditSkill, HINTS } from './checks.mjs';

const VERSION = '1.0.0';

function usage(code, msg) {
  if (msg) console.error(`audit-skill: ${msg}\n`);
  // the leading comment block only (it ends at the first line that is not a comment)
  const lines = fs.readFileSync(new URL(import.meta.url), 'utf8').split(/\r?\n/).filter((l) => !l.startsWith('#!'));
  const head = lines.slice(0, lines.findIndex((l) => !l.startsWith('//')));
  (code ? console.error : console.log)(head.map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(code);
}

function parseArgs(argv) {
  const opts = { dirs: [], json: false, strict: false, limit: 5, each: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') usage(0);
    else if (a === '--json') opts.json = true;
    else if (a === '--strict') opts.strict = true;
    else if (a === '--each') opts.each = true;
    else if (a === '--limit') {
      const n = Number(argv[++i]);
      if (!Number.isInteger(n) || n < 0) usage(2, '--limit needs a whole number (0 = show all)');
      opts.limit = n;
    } else if (a.startsWith('-')) usage(2, `unknown option "${a}" (valid: --json, --strict, --limit N, --each, --help)`);
    else opts.dirs.push(a);
  }
  if (!opts.dirs.length) usage(2, 'give at least one skill folder');
  return opts;
}

// The skills root is the folder that holds this skill, so "site-director" also works from any folder.
const SKILLS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function resolveDirs(opts) {
  const out = [];
  for (const raw of opts.dirs) {
    let d = path.resolve(raw);
    if (!fs.existsSync(d) && /^[\w.-]+$/.test(raw) && fs.existsSync(path.join(SKILLS_ROOT, raw))) d = path.join(SKILLS_ROOT, raw);
    if (fs.existsSync(d) && fs.statSync(d).isFile() && path.basename(d) === 'SKILL.md') d = path.dirname(d);
    if (!fs.existsSync(d) || !fs.statSync(d).isDirectory()) usage(2, `not a folder: ${raw}`);
    if (!opts.each) { out.push(d); continue; }
    const kids = fs.readdirSync(d, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.') && fs.existsSync(path.join(d, e.name, 'SKILL.md')))
      .map((e) => path.join(d, e.name));
    if (!kids.length) usage(2, `--each: no child folder of ${raw} has a SKILL.md`);
    out.push(...kids);
  }
  return out;
}

const count = (fs_, sev) => fs_.filter((f) => f.severity === sev && !f.waived).length;

function printSkill(res, limit) {
  const { findings, stats } = res;
  const errors = count(findings, 'error'), warnings = count(findings, 'warning');
  const waived = findings.filter((f) => f.waived);
  console.log(`\n== ${res.name}  (${res.dir})`);
  const parts = [`${stats.files} files`];
  if (stats.bodyLines !== undefined) parts.push(`SKILL.md body ${stats.bodyLines}/500 lines`);
  if (stats.descriptionChars !== undefined) parts.push(`description ${stats.descriptionChars}/1024 chars (target 700)`, `listing ${stats.listingChars}/1536`);
  console.log(`   ${parts.join(', ')}`);
  const width = Math.max(10, ...findings.map((f) => f.check.length));
  for (const sev of ['error', 'warning']) {
    const list = findings.filter((f) => f.severity === sev && !f.waived)
      .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.check.localeCompare(b.check));
    if (!list.length) continue;
    console.log(`\n   ${sev === 'error' ? 'ERRORS' : 'WARNINGS'} (${list.length})`);
    const shown = new Map();
    for (const f of list) {
      const key = `${f.check}|${f.file}`;
      const k = (shown.get(key) || 0) + 1;
      shown.set(key, k);
      if (limit && k > limit) continue;
      console.log(`   ${f.check.padEnd(width)}  ${f.file}${f.line ? `:${f.line}` : ''}  ${f.message}`);
    }
    for (const [key, k] of shown) if (limit && k > limit) { const [c, file] = key.split('|'); console.log(`   ${''.padEnd(width)}  ... ${k - limit} more ${c} in ${file} (--limit 0 shows all)`); }
  }
  if (waived.length) {
    const by = {};
    waived.forEach((f) => { by[f.check] = (by[f.check] || 0) + 1; });
    console.log(`\n   WAIVED by audit-ok comments: ${Object.entries(by).map(([c, n]) => `${c} x${n}`).join(', ')}`);
  }
  const fired = [...new Set(findings.filter((f) => !f.waived).map((f) => f.check))];
  if (fired.length) {
    console.log('\n   HOW TO FIX');
    fired.forEach((c) => console.log(`   ${c.padEnd(width)}  ${HINTS[c] || ''}`));
  }
  console.log(`\n   result: ${errors ? 'FAIL' : warnings ? 'PASS with warnings' : 'PASS'} (${errors} errors, ${warnings} warnings${waived.length ? `, ${waived.length} waived` : ''})`);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const results = resolveDirs(opts).map((d) => auditSkill(d));
  const totals = results.reduce((t, r) => ({
    skills: t.skills + 1,
    errors: t.errors + count(r.findings, 'error'),
    warnings: t.warnings + count(r.findings, 'warning'),
    waived: t.waived + r.findings.filter((f) => f.waived).length,
  }), { skills: 0, errors: 0, warnings: 0, waived: 0 });
  if (opts.json) {
    const skills = results.map((r) => ({ ...r, counts: { errors: count(r.findings, 'error'), warnings: count(r.findings, 'warning'), waived: r.findings.filter((f) => f.waived).length } }));
    console.log(JSON.stringify({ tool: 'skill-auditor', version: VERSION, strict: opts.strict, totals, skills }, null, 2));
  } else {
    results.forEach((r) => printSkill(r, opts.limit));
    if (results.length > 1) {
      const failing = results.filter((r) => count(r.findings, 'error')).map((r) => r.name);
      console.log(`\n== total: ${totals.skills} skills, ${totals.errors} errors, ${totals.warnings} warnings${totals.waived ? `, ${totals.waived} waived` : ''}${failing.length ? `; with errors: ${failing.join(', ')}` : ''}`);
    }
  }
  process.exit(totals.errors || (opts.strict && totals.warnings) ? 1 : 0);
}

main();
