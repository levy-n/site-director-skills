#!/usr/bin/env node
// selftest.mjs - prove skill-auditor still catches what it should, and only that.
//
// usage: node selftest.mjs [--fixture-dir <dir>] [--help]
//
// Builds nine fixture skills in a temp folder (or in --fixture-dir, which is kept afterwards):
//   broken-skill   one skill that breaks many rules at once (must fire at least 8 distinct checks)
//   warn-skill     valid but with warning-level problems only
//   clean-skill    tricky but correct content: must produce 0 findings and exactly 1 waiver
//   rescued-skill  a YAML error that Claude Code's retry rescues (the message must say so)
//   tri-skill, tri2-skill   a "---" inside a frontmatter value, where Claude Code ends the block
//   nofm-skill, noname-skill, empty-skill   the missing-file and missing-field errors
// Then checks every check id fires somewhere, the CLI exit codes, the JSON output, and that
// skill-auditor itself audits with 0 errors. Exit 1 on any failure. No network, no install.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { auditSkill, HINTS } from './checks.mjs';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  // the leading comment block only (it ends at the first line that is not a comment)
  const lines = fs.readFileSync(new URL(import.meta.url), 'utf8').split(/\r?\n/).filter((l) => !l.startsWith('#!'));
  const head = lines.slice(0, lines.findIndex((l) => !l.startsWith('//')));
  console.log(head.map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(HERE, '..');
const fdArg = process.argv.indexOf('--fixture-dir');
const KEEP = fdArg > 0 ? path.resolve(process.argv[fdArg + 1] || '') : '';
if (fdArg > 0 && !process.argv[fdArg + 1]) { console.error('selftest: --fixture-dir needs a folder'); process.exit(2); }
const BASE = KEEP || fs.mkdtempSync(path.join(os.tmpdir(), 'skill-auditor-selftest-'));

// Characters the house rules forbid in this file are built from code points, so this file stays clean.
const EN = '\u2013', EM = '\u2014', MAQAF = '\u05BE', BS = String.fromCharCode(92);
const userPath = ['C:', 'Users', 'someone', 'skills', 'broken-skill', 'scripts', 'run.mjs'].join(BS);
const gitBashPath = ['', 'c', 'Users', 'someone', 'skills', 'x.mjs'].join('/');
// Older model names, built from parts so this script does not report itself.
const OLD_OPUS = ['claude', 'opus', '4', '1'].join('-'), OLD_SONNET = ['claude', 'sonnet', '4', '6'].join('-'), OPUS_5 = ['Opus', '5'].join(' ');
const TREE = String.fromCharCode(0x251C, 0x2500, 0x2500);
const filler = (n, word) => Array.from({ length: n }, (_, i) => `${word} line ${i + 1}.`).join('\n');

const FIXTURES = {
  'broken-skill': {
    'SKILL.md': [
      '---',
      'name: Claude_Broken',
      `description: You can use this skill: it checks <b>things</b>. ${'More words here. '.repeat(100)}`,
      "when_to_use: 'unterminated",
      'triggers: [a, b]',
      'version: 1.0',
      'effort: extreme',
      'metadata: just text',
      'license: MIT #not part of the value',
      '---',
      '# Broken',
      'Run node scripts/run.mjs to start. Read `references/missing.md` and [the guide](references/guide.md) and references/notes.md.',
      `Path ${userPath}`,
      `Currently this uses the Task tool with ${OLD_OPUS}.`,
      `Planning runs on ${OPUS_5}. Git Bash form: ${gitBashPath}`,
      `Ranges: 10${EN}20, a pause${EM}here, and ב${MAQAF}2025.`,
      filler(510, 'Filler'),
    ].join('\n'),
    'scripts/run.mjs': `const target = process.argv[2];\nconst MODEL = '${OLD_SONNET}';\nconsole.log('run', target, MODEL);\n`,
    'assets/notebook.ipynb': `{ "cells": [ { "source": ["pages 10${EN}20"] } ] }\n`,
    'assets/blob.xyz': `\u0000\u0001binary${EN}data`,
    'references/guide.md': ['# Guide', 'Then follow the steps in other.md before you continue.', 'Run `${CLAUDE_SKILL_DIR}/scripts/run.mjs` and see `scripts/nope.mjs`.', 'Also `<skills>/no-such-skill/SKILL.md`.', filler(120, 'Guide')].join('\n'),
    'references/other.md': '# Other\nA short sibling reference that SKILL.md never names.\n',
    'references/sub/deep.md': '# Deep\nNested one level too deep.\n',
    'references/notes.md': `# הערות\n${'זהו קובץ בעברית שנשמר בלי הסיומת הנכונה ולכן הבודק צריך להתריע עליו. '.repeat(6)}\n`,
    'evals/evals.json': '{ "skill_name": "broken-skill", "evals": [ { "prompt": "x" }, ] }\n',
    'assets/inner/SKILL.md': '---\nname: inner\ndescription: Nested skill file.\n---\n',
  },
  'warn-skill': {
    'SKILL.md': [
      '---',
      'name: warn-skill',
      `description: 'Use this when a value is > 10. ${'It explains the reason in detail. '.repeat(22)}'`,
      'argument-hint: [path]',
      'agent: Explore',
      '---',
      '# Warn skill',
      'A valid skill with warning-level problems only.',
    ].join('\n'),
    'evals/evals.json': '{ "tests": [] }\n',
  },
  'clean-skill': {
    'SKILL.md': [
      '---',
      'name: clean-skill',
      "description: 'Checks clean things: it is a fixture that must produce no findings. Use it in the auditor''s selftest.'",
      'when_to_use: \'Triggers: "clean check", "בדיקה נקייה".\'',
      'argument-hint: "[path]"',
      'allowed-tools:',
      '  - Read',
      '  - Bash(node ${CLAUDE_SKILL_DIR}/scripts/tool.mjs *)',
      'metadata:',
      '  version: "1.0.0"',
      '---',
      '# Clean skill',
      'Paths: `<skill>` means `${CLAUDE_SKILL_DIR}` and `<skills>` means `${CLAUDE_SKILL_DIR}/..`.',
      'Run `node ${CLAUDE_SKILL_DIR}/scripts/tool.mjs <file>`. Read `references/long.md` and `references/he.rtl.md`.',
      'The word "currently" in quotes is a mention, not a use. The `Task` tool was renamed Agent.',
      'Verified 2026-10-15: this is currently the method.',
      'This is new in version 2. <!-- audit-ok:time-sensitive quoting a changelog -->',
      '```js',
      "const re = /\\d+\\.md$/;",
      '```',
      '```json',
      '"seed": "npx tsx scripts/seed.ts"',
      '```',
      `${TREE} assets/   project layout drawing, not a skill path`,
      'Write external links as [text](url). See broken-skill\'s `scripts/run.mjs` for the sibling version.',
      'CrewAI code such as Task(description="x") is not the Claude Code tool. מעכשיו תמיד לבדוק לפני מסירה.',
      'Copy `scripts/overlap-audit.mjs` from the MediaWave repo into the project and run it there.',
      'Each run writes `<skill>/references/harvest/<site-slug>.md`; the Opus 4.8 and Opus 5.5 docs agree.',
      '## Old patterns',
      `${OLD_OPUS} was used before; recently replaced.`,
      'Forum thread: https://example.com/c/Users/guide/ (a URL, not a home folder).',
    ].join('\n'),
    'scripts/tool.mjs': [
      "if (process.argv.includes('--help')) { console.log('usage: tool.mjs <file>'); process.exit(0); }",
      "const MODEL = 'claude-opus-5-5'; // the default",
      `const OLD = '${OLD_OPUS}'; // legacy id kept for comparison`,
      "const clean = (s) => s.replace('a', 'b');",
      '',
    ].join('\n'),
    'references/long.md': ['# Long reference', '', '## Contents', '1. One', '2. Two', '', `Uses \`<skill>/scripts/tool.mjs\` from a reference.`, filler(110, 'Long')].join('\n'),
    'references/he.rtl.md': `# עברית\n${'קובץ עברי עם הסיומת הנכונה. '.repeat(10)}\n`,
    'evals/evals.json': JSON.stringify({ skill_name: 'clean-skill', evals: [{ id: 0, prompt: 'check', expected_output: 'ok', files: [] }], trigger_evals: [{ query: 'clean check', should_trigger: true }] }, null, 2),
  },
  // Its only YAML error is one that Claude Code's retry rescues (a single-line value with ": ").
  'rescued-skill': { 'SKILL.md': '---\nname: rescued-skill\ndescription: Checks things: a fixture whose only YAML error Claude Code rescues.\n---\n# Rescued\n' },
  // Valid YAML, but Claude Code ends the frontmatter at the first "---": the cut quote breaks the block.
  'tri-skill': { 'SKILL.md': "---\nname: tri-skill\ndescription: 'Audits A --- B, a fixture.'\n---\n# T\n" },
  // The cut block still parses, so allowed-tools quietly becomes body text.
  'tri2-skill': { 'SKILL.md': '---\nname: tri2-skill\ndescription: Audits A---B and more words here.\nallowed-tools: Read\n---\n# T\n' },
  'nofm-skill': { 'SKILL.md': '# No frontmatter\nJust a body.\n' },
  'noname-skill': { 'SKILL.md': '---\nlicense: MIT\n---\n# No name, no description\n' },
  'empty-skill': { 'README.txt': 'no SKILL.md here\n' },
};

function writeFixtures() {
  for (const [skill, files] of Object.entries(FIXTURES)) {
    const dir = path.join(BASE, skill);
    fs.rmSync(dir, { recursive: true, force: true });
    for (const [rel, text] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
      fs.writeFileSync(path.join(dir, rel), text);
    }
  }
}

const results = [];
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); };
const ids = (res, sev) => new Set(res.findings.filter((f) => !f.waived && (!sev || f.severity === sev)).map((f) => f.check));

const EXPECT = {
  'broken-skill': ['frontmatter-parse', 'frontmatter-comment', 'frontmatter-field', 'frontmatter-value', 'name-invalid', 'name-mismatch', 'name-reserved',
    'description-length', 'description-xml', 'description-person', 'listing-length', 'body-length', 'link-broken', 'backslash-path', 'dash', 'json-invalid',
    'toc-missing', 'reference-chain', 'reference-depth', 'reference-orphan', 'ref-link-broken', 'cross-skill-link', 'task-tool', 'absolute-user-path',
    'skill-dir-placeholder', 'time-sensitive', 'hebrew-not-rtl', 'script-help', 'model-stale', 'nested-skill-md'],
  'warn-skill': ['description-long', 'description-person', 'description-angle', 'frontmatter-value', 'evals-shape'],
  'rescued-skill': ['frontmatter-parse'],
  'tri-skill': ['frontmatter-parse'],
  'tri2-skill': ['frontmatter-parse'],
  'nofm-skill': ['frontmatter-missing'],
  'noname-skill': ['name-missing', 'description-missing'],
  'empty-skill': ['skill-md-missing'],
};

function run() {
  writeFixtures();
  const fired = new Set();
  for (const [skill, want] of Object.entries(EXPECT)) {
    const res = auditSkill(path.join(BASE, skill));
    const got = ids(res);
    got.forEach((c) => fired.add(c));
    const missing = want.filter((c) => !got.has(c));
    check(`${skill}: expected checks fire`, missing.length === 0, missing.length ? `missing ${missing.join(', ')}` : `${got.size} distinct checks`);
  }
  const broken = auditSkill(path.join(BASE, 'broken-skill'));
  check('broken-skill fires at least 8 distinct checks', ids(broken).size >= 8, `${ids(broken).size}`);
  const dashLines = broken.findings.filter((f) => f.check === 'dash' && f.file === 'SKILL.md').length;
  check('dash: en dash, em dash and maqaf each reported', dashLines === 3, `${dashLines} findings`);
  const dashFiles = new Set(broken.findings.filter((f) => f.check === 'dash').map((f) => f.file));
  check('dash: a text file with an unknown extension is read, a binary one is not',
    dashFiles.has('assets/notebook.ipynb') && !dashFiles.has('assets/blob.xyz'), [...dashFiles].join(', '));
  const has = (c, re) => broken.findings.some((f) => f.check === c && re.test(`${f.file} ${f.message}`));
  check('absolute-user-path: a Git Bash home path is reported', has('absolute-user-path', /\/c\/Users\//));
  check('model-stale: an older display name in prose and an old id in a script are reported',
    has('model-stale', new RegExp(`"${OPUS_5}"`)) && has('model-stale', /^scripts\/run\.mjs /));
  const parseMsgs = (res) => res.findings.filter((f) => f.check === 'frontmatter-parse').map((f) => f.message);
  check('frontmatter-parse: a YAML error that survives Claude Code\'s retry says every field is dropped',
    parseMsgs(broken).length > 0 && parseMsgs(broken).every((m) => /every frontmatter field dropped/.test(m)), parseMsgs(broken)[0]);
  const tri = parseMsgs(auditSkill(path.join(BASE, 'tri-skill')));
  check('frontmatter-parse: "---" inside a quoted value, which the cut breaks, says every field is dropped',
    tri.length === 1 && /"---" inside the frontmatter/.test(tri[0]) && /every frontmatter field dropped/.test(tri[0]), tri[0]);
  const tri2 = parseMsgs(auditSkill(path.join(BASE, 'tri2-skill')));
  check('frontmatter-parse: "---" inside a plain value names the fields that become body text',
    tri2.length === 1 && /quietly become body text/.test(tri2[0]) && /allowed-tools/.test(tri2[0]), tri2[0]);
  const rescued = parseMsgs(auditSkill(path.join(BASE, 'rescued-skill')));
  check('frontmatter-parse: a YAML error Claude Code rescues says it loads but strict parsers reject it',
    rescued.length === 1 && /loads it after re-quoting/.test(rescued[0]) && /strict YAML parsers/.test(rescued[0]), rescued[0]);
  const warn = auditSkill(path.join(BASE, 'warn-skill'));
  check('warn-skill has no errors', ids(warn, 'error').size === 0, [...ids(warn, 'error')].join(', '));
  const clean = auditSkill(path.join(BASE, 'clean-skill'));
  const noise = clean.findings.filter((f) => !f.waived);
  check('clean-skill: no findings (no false positives)', noise.length === 0, noise.map((f) => `${f.check} ${f.file}:${f.line}`).join('; '));
  check('clean-skill: the audit-ok waiver is counted', clean.findings.filter((f) => f.waived).length === 1);
  const unknown = [...fired].filter((c) => !HINTS[c]);
  check('every fired check has a fix hint', unknown.length === 0, unknown.join(', '));
  const neverFired = Object.keys(HINTS).filter((c) => !fired.has(c));
  check('every check in HINTS fires in some fixture', neverFired.length === 0, neverFired.join(', '));
  cli();
  const self = auditSkill(SKILL);
  check('skill-auditor audits itself with 0 errors', ids(self, 'error').size === 0, self.findings.filter((f) => f.severity === 'error').map((f) => `${f.check} ${f.file}:${f.line}`).join('; '));
}

function cli() {
  const cliPath = path.join(HERE, 'audit-skill.mjs');
  const exit = (...args) => spawnSync(process.execPath, [cliPath, ...args], { encoding: 'utf8' });
  check('CLI: errors exit 1', exit(path.join(BASE, 'broken-skill')).status === 1);
  check('CLI: clean exits 0, also with --strict', exit(path.join(BASE, 'clean-skill')).status === 0 && exit(path.join(BASE, 'clean-skill'), '--strict').status === 0);
  check('CLI: warnings exit 0, and 1 with --strict', exit(path.join(BASE, 'warn-skill')).status === 0 && exit(path.join(BASE, 'warn-skill'), '--strict').status === 1);
  check('CLI: usage errors exit 2', exit().status === 2 && exit('--nope').status === 2 && exit(path.join(BASE, 'does-not-exist')).status === 2);
  const j = exit(path.join(BASE, 'warn-skill'), path.join(BASE, 'clean-skill'), '--json');
  let parsed = null;
  try { parsed = JSON.parse(j.stdout); } catch { /* reported below */ }
  check('CLI: --json is one parseable object with totals', !!parsed && parsed.totals && parsed.totals.skills === 2);
  // eight fixture folders have a SKILL.md; empty-skill has none and is skipped
  check('CLI: --each audits every child skill', /total: 8 skills/.test(exit(BASE, '--each').stdout));
  check('CLI: --help exits 0', exit('--help').status === 0);
}

try { run(); } finally {
  if (!KEEP) fs.rmSync(BASE, { recursive: true, force: true });
  else console.log(`fixtures kept in ${BASE.split(path.sep).join('/')}`);
}
const failed = results.filter((r) => !r).length;
console.log(`\n${failed ? 'FAILED' : 'passed'}: ${results.length - failed}/${results.length}`);
process.exit(failed ? 1 : 0);
