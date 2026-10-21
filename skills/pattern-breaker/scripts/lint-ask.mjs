// lint-ask.mjs - validate an AskUserQuestion payload before the call.
// Limits marked [schema] come from @anthropic-ai/claude-agent-sdk 0.3.289 sdk-tools.d.ts
// (AskUserQuestionInput), [tool] from the Claude Code tool description (ccVersion 2.1.69-2.1.216),
// [policy] are pattern-breaker house rules (preview budget, operator dash rule) - not tool limits.
// Usage: node lint-ask.mjs payloads/*.json   (each file = {"questions":[...]} or an array of such calls)
// Wildcards are expanded here, so the glob form works in cmd and PowerShell too. Exit 0 = no errors,
// 1 = errors (or a file that is missing or not valid JSON), 2 = no payload file given or matched.
// A recommended option is marked "(Recommended)" or "(מומלץ)", optionally with a qualifier inside
// the brackets ("(מומלץ לאתר תדמית)"), and must be listed first.
import fs from 'node:fs';
import path from 'node:path';

// --help: print the leading comment block of this file and exit
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  const header = [];
  for (const l of fs.readFileSync(new URL(import.meta.url), 'utf8').split(/\r?\n/)) {
    if (l.startsWith('#!')) continue;
    if (!l.startsWith('//')) break;
    header.push(l.replace(/^\/\/ ?/, ''));
  }
  console.log(header.join('\n'));
  process.exit(0);
}

const DASHES = /[\u2013\u2014\u05BE]/;            // en dash, em dash, Hebrew maqaf  [policy: Nati]
const HEB = /[֐-׿]/;
const BOX_AFTER = /[֐-׿][^\n]*[|│║]/; // Hebrew followed by a right border on same line
const OTHER = /^(other|אחר|אחר\.|skip|דלג)$/i;
const PREVIEW_MAX_COLS = 40;                          // [policy, UNVERIFIED render budget]
const PREVIEW_MAX_LINES = 18;                         // [policy]
const RECOMMENDED = /\((Recommended|מומלץ)[^)]*\)/;   // the bare tag or one with a qualifier

export function lintCall(call, name = 'call') {
  const errs = [], warns = [];
  const E = (m) => errs.push(`${name}: ${m}`), W = (m) => warns.push(`${name}: ${m}`);
  const qs = call.questions;
  if (!Array.isArray(qs) || qs.length < 1 || qs.length > 4) E(`questions must be 1-4 [schema], got ${qs?.length}`);
  const qTexts = new Set();
  (qs || []).forEach((q, i) => {
    const at = `Q${i + 1}(${q.header})`;
    if (!q.question) E(`${at} missing question`);
    if (qTexts.has(q.question)) E(`${at} duplicate question text - answers are keyed by question text [schema]`);
    qTexts.add(q.question);
    if (q.question && !/[?？]\s*$/.test(q.question)) W(`${at} question should end with "?" [schema]`);
    if (!q.header || [...q.header].length > 12) E(`${at} header must be 1-12 chars [schema], got ${q.header ? [...q.header].length : 0}`);
    if (typeof q.multiSelect !== 'boolean') E(`${at} multiSelect boolean is required [schema]`);
    const opts = q.options || [];
    if (opts.length < 2 || opts.length > 4) E(`${at} options must be 2-4 [schema]; <2 is rejected unseen [CC 2.1.216]`);
    const labels = new Set();
    opts.forEach((o, j) => {
      const ot = `${at}.opt${j + 1}`;
      if (!o.label) E(`${ot} missing label`);
      if (labels.has(o.label)) E(`${ot} duplicate label`);
      labels.add(o.label);
      if (OTHER.test((o.label || '').trim())) E(`${ot} never add an Other/Skip option - the UI adds Other [schema]`);
      const words = (o.label || '').replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(Boolean).length;
      if (words > 5) W(`${ot} label has ${words} words; keep 1-5 [schema]`);
      if (typeof o.description !== 'string' || !o.description.trim()) E(`${ot} description is required [schema]`);
      if (q.multiSelect && (o.label || '').includes(',')) E(`${ot} comma in a multiSelect label breaks the comma-joined answer [hooks doc]`);
      if (RECOMMENDED.test(o.label || '') && j !== 0) W(`${ot} recommended option must be first [tool]`);
      if (o.preview !== undefined) {
        if (q.multiSelect) E(`${ot} preview on a multiSelect question - previews are single-select only [tool]`);
        const lines = o.preview.split('\n');
        if (lines.length > PREVIEW_MAX_LINES) W(`${ot} preview ${lines.length} lines > ${PREVIEW_MAX_LINES} [policy]`);
        lines.forEach((ln, k) => {
          const w = [...ln].length;
          if (w > PREVIEW_MAX_COLS) W(`${ot} preview line ${k + 1} is ${w} cols > ${PREVIEW_MAX_COLS} [policy]`);
          if (BOX_AFTER.test(ln)) W(`${ot} preview line ${k + 1}: Hebrew before a right border - bidi/width may break alignment [policy]`);
        });
      }
      for (const [k, v] of Object.entries(o)) if (typeof v === 'string' && DASHES.test(v)) E(`${ot}.${k} contains an en/em dash or maqaf - use "-" [policy: Nati]`);
    });
    if (DASHES.test(q.question || '')) E(`${at} question contains an en/em dash or maqaf [policy: Nati]`);
    if (opts.some((o) => o.preview !== undefined) && opts.some((o) => o.preview === undefined)) W(`${at} only some options have previews - fine, but the pane is empty for the rest`);
  });
  return { errs, warns };
}

// Expand * and ? in the file-name part of an argument (cmd and PowerShell pass them through as text).
// fs.globSync exists only from Node 22, so match the folder listing by hand.
function expand(arg) {
  if (!/[*?]/.test(arg)) return [arg];
  const dir = path.dirname(arg), base = path.basename(arg);
  if (/[*?]/.test(dir)) {
    return typeof fs.globSync === 'function' ? fs.globSync(arg).sort() : [];
  }
  const re = new RegExp(`^${base.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`, 'i');
  try { return fs.readdirSync(dir).filter((n) => re.test(n)).sort().map((n) => path.join(dir, n)); } catch { return []; }
}

if (process.argv[1] && /lint-ask\.mjs$/.test(process.argv[1])) {
  const argv = process.argv.slice(2);
  const files = argv.flatMap(expand);
  if (!files.length) {
    console.error(`no payload files ${argv.length ? `match ${argv.join(' ')}` : 'given'}\nusage: node lint-ask.mjs <payload.json> [more.json | payloads/*.json]`);
    process.exit(2);
  }
  let total = 0, bad = 0;
  for (const f of files) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(f, 'utf8'));
    } catch (e) {
      bad++;
      console.log('ERROR ', `${f}: ${e.code === 'ENOENT' ? 'file not found' : `invalid JSON (${e.message.split('\n')[0]})`}`);
      continue;
    }
    const calls = Array.isArray(data) ? data : [data];
    calls.forEach((c, i) => {
      const { errs, warns } = lintCall(c, `${f.split(/[\\/]/).pop()}#${i + 1}`);
      total++;
      if (errs.length) bad++;
      errs.forEach((m) => console.log('ERROR ', m));
      warns.forEach((m) => console.log('warn  ', m));
      if (!errs.length && !warns.length) console.log('ok    ', `${f.split(/[\\/]/).pop()}#${i + 1}`, `(${c.questions?.length} questions)`);
    });
  }
  console.log(`\n${total} calls checked, ${bad} with errors`);
  process.exit(bad ? 1 : 0);
}
