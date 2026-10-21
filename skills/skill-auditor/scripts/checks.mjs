// checks.mjs - every check skill-auditor runs, as one function per concern.
// audit-skill.mjs is the command line; this module only reads files and returns findings.
// It never runs code from the audited skill and never touches the network.
//
// Severity: errors break loading, listing or the house rules and can never be waived. Warnings are
// judgment calls; a line can waive one with the comment "audit-ok:<check-id>" on the same line or
// the line above, and waived findings are still counted in the report.

import fs from 'node:fs';
import path from 'node:path';
import { isUtf8 } from 'node:buffer';
import { splitFrontmatter, parseFrontmatter, claudeCodeRetryText } from './frontmatter.mjs';

// What a YAML error does in Claude Code 2.1.296 (its loader read 2026-10-15; outcomes reproduced with
// Bun 1.3.5's Bun.YAML on 23 cases, while Claude Code ships Bun 1.4.3). Strict parsers: skill-creator's
// quick_validate.py (PyYAML safe_load), the yaml and js-yaml packages.
const CC_EFFECT = {
  drops: 'Claude Code 2.1.296 fails on it even after its retry and loads the skill with every frontmatter field dropped',
  rescued: 'Claude Code 2.1.296 loads it after re-quoting the value on a retry, but strict YAML parsers (skill-creator\'s validator, other tools) reject the whole frontmatter',
};

// Valid frontmatter fields: the house standard (references/standard.md section 1). Claude Code
// 2.1.296 also reads a top-level "version", but the standard keeps it in metadata for portability.
export const VALID_FIELDS = ['name', 'description', 'when_to_use', 'argument-hint', 'arguments',
  'disable-model-invocation', 'user-invocable', 'allowed-tools', 'disallowed-tools', 'model', 'effort',
  'context', 'agent', 'hooks', 'paths', 'shell', 'license', 'metadata'];
const MIGRATE = { triggers: 'merge the phrases into when_to_use', skill_id: 'delete it',
  version: 'move it to metadata.version', compatibility: 'move it to metadata.compatibility',
  author: 'move it to metadata.author', tags: 'move it to metadata.tags', category: 'move it to metadata.category',
  'when-to-use': 'rename it to when_to_use', allowed_tools: 'rename it to allowed-tools', tools: 'rename it to allowed-tools' };

// Limits from the standard. 1536 is Claude Code's per-skill listing cap (description, " - ",
// when_to_use), verified in the 2.1.296 binary; 700 is the house target that leaves room for both.
const LIMITS = { description: 1024, descriptionTarget: 700, listing: 1536, body: 500, refToc: 100, tocWindow: 40, hebrewRatio: 0.3, hebrewMinLetters: 100 };

export const HINTS = {
  'skill-md-missing': 'Create SKILL.md at the skill root, starting with a --- frontmatter block.',
  'frontmatter-missing': 'Start SKILL.md with "---", the fields, and a closing "---" line.',
  'frontmatter-parse': 'Fix the YAML: wrap the value in single quotes and double any inner single quote. The message says whether Claude Code drops every field or rescues it; strict parsers reject both. Never write "---" inside the frontmatter: use a single "-" or rephrase.',
  'frontmatter-comment': 'Quote the value: an unquoted " #" starts a YAML comment and cuts the rest of the line.',
  'frontmatter-field': 'Keep only the valid fields. Migrations: triggers -> when_to_use; version, author, tags, compatibility -> metadata; skill_id -> delete.',
  'frontmatter-value': 'Use the documented type: booleans unquoted, effort low|medium|high|xhigh|max, context fork, shell bash|powershell, metadata a mapping.',
  'name-missing': 'Add name: <folder-name>.',
  'name-invalid': 'Use lowercase letters, digits and single hyphens, at most 64 characters.',
  'name-mismatch': 'Make name equal the folder name (never rename the folder: it is the /command).',
  'name-reserved': 'Remove "claude" and "anthropic" from the name.',
  'description-missing': 'Add a third-person description: the key use case first, then when to use it.',
  'description-length': 'Cut the description to 1024 characters or less; move trigger lists to when_to_use.',
  'description-xml': "Remove XML-like tags from the description (the Agent Skills rules forbid them, and skill-creator's quick_validate.py rejects any < or >).",
  'listing-length': 'Shorten description + when_to_use to 1536 characters or less; the listing truncates the rest.',
  'body-length': 'Move detail out of SKILL.md into references/<topic>.md (one level deep) until the body is 500 lines or less.',
  'link-broken': 'Fix the path or create the file. SKILL.md paths are relative to the skill folder.',
  'backslash-path': 'Use forward slashes in every path inside skill files, also on Windows.',
  dash: 'Replace en dash, em dash and maqaf with "-", ":" or a rewrite (Nati\'s rule, every file).',
  'json-invalid': 'Fix the JSON syntax (trailing commas, comments and single quotes are not JSON).',
  'description-long': 'Aim for about 700 characters: key use case first, long trigger lists in when_to_use.',
  'description-person': 'Write the description in third person ("Builds...", "Audits..."), never I, you or an imperative.',
  'description-angle': 'Remove "<" and ">" from the description; skill-creator\'s quick_validate.py rejects them.',
  'toc-missing': 'Start the file with "## Contents" and a numbered list of its sections.',
  'reference-chain': 'Keep references one level deep: put the required step in SKILL.md or in this file instead of sending the reader to another reference.',
  'reference-depth': 'Move the file directly under references/.',
  'reference-orphan': 'Point to the file from SKILL.md (a "Read when" table row), or delete it.',
  'ref-link-broken': 'Fix the path or create the file (skill-relative paths start at the skill folder).',
  'cross-skill-link': 'Check the sibling skill path; it does not exist under the skills root.',
  'task-tool': 'The Task tool is now the Agent tool: rename it in allowed-tools and in the text.',
  'absolute-user-path': 'Replace user-specific absolute paths with ${CLAUDE_SKILL_DIR} (SKILL.md), <skill>/<skills> placeholders (references) or ~ paths.',
  'skill-dir-placeholder': 'Define <skill> = ${CLAUDE_SKILL_DIR} (and <skills> = ${CLAUDE_SKILL_DIR}/..) in SKILL.md, run bundled scripts as ${CLAUDE_SKILL_DIR}/scripts/..., and use the placeholders in reference files (they are read without substitution).',
  'time-sensitive': 'State the fact without a time word, or put it on a dated "Verified YYYY-MM-DD" line, or move it to an "Old patterns" section.',
  'hebrew-not-rtl': 'Hebrew documents use the .rtl.md extension (rename only if nothing links to the old name, or update the links).',
  'script-help': 'Make the script print its usage on --help (and exit 0).',
  'model-stale': 'Use the current model family (claude-opus-5-5, claude-sonnet-5-5, claude-haiku-5-5, claude-fable-5-1) or mark the old id as old.',
  'evals-shape': 'Use {"skill_name": "<name>", "evals": [{"id", "prompt", "expected_output", "files"}]} plus optional "trigger_evals": [{"query", "should_trigger"}].',
  'nested-skill-md': 'Rename nested SKILL.md files (for example to SKILL.example.md): a skill has exactly one SKILL.md, at its root.',
};

const TEXT_EXT = new Set(['.md', '.mjs', '.js', '.cjs', '.ts', '.tsx', '.jsx', '.json', '.html', '.htm', '.css', '.txt', '.yml', '.yaml',
  '.astro', '.py', '.sh', '.bash', '.ps1', '.cmd', '.bat', '.svg', '.xml', '.csv', '.kt', '.swift', '.dart', '.toml', '.vue', '.svelte', '.rml', '.lua', '.luau']);
// Never text, so never read. Any other extension (.ipynb, .sql, .ini, none at all) is sniffed.
const BINARY_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.bmp', '.tif', '.tiff', '.psd', '.pdf',
  '.woff', '.woff2', '.ttf', '.otf', '.eot', '.riv', '.lottie', '.mp4', '.webm', '.mov', '.mkv', '.avi', '.mp3', '.wav', '.ogg',
  '.flac', '.m4a', '.zip', '.gz', '.tgz', '.7z', '.rar', '.exe', '.dll', '.so', '.dylib', '.pyc', '.class', '.jar', '.wasm',
  '.bin', '.dat', '.db', '.sqlite', '.pt', '.pth', '.onnx', '.safetensors', '.npy', '.npz', '.pkl', '.h5', '.docx', '.xlsx', '.pptx']);
// Code that may hard-code a model id (scripts/ only: that is where a stale id breaks output).
const CODE_EXT = new Set(['.mjs', '.js', '.cjs', '.ts', '.tsx', '.jsx', '.py', '.sh', '.bash', '.ps1', '.cmd', '.bat']);
const SKIP_DIRS = new Set(['node_modules', '__pycache__']);
const MAX_TEXT_BYTES = 2 * 1024 * 1024; // larger files are data, not instructions
const SNIFF_BYTES = 8192; // a NUL byte this early means binary (the same test git uses)

const DASH = /[\u2013\u2014\u05BE]/g;
const DASH_NAME = { '\u2013': 'en dash U+2013', '\u2014': 'em dash U+2014', '\u05BE': 'maqaf U+05BE' };
const STALE_WORDS = /\b(old|older|legacy|deprecated|retired|previous|prior|stale|superseded|replaced?|instead|no longer|predates?|was|were|migrat\w*|outdated|renamed?|formerly|earlier)\b/i;
// In prose an arrow also marks a migration ("claude-opus-4-1 -> claude-opus-5-5"); in code it is syntax.
const STALE_CUE = new RegExp(`${STALE_WORDS.source}|->|=>|\\u2192`, 'i');
const OLD_MODELS = [
  /\bclaude-(?:opus|sonnet|haiku|instant)-[1-4](?:[-.]\d+)*\b/gi,
  /\bclaude-[1-3](?:[-.]\d+)*-(?:opus|sonnet|haiku|instant)\b/gi,
  /\bclaude-fable-5(?![-.]?\d)/gi,
  // Opus 5 and Sonnet 5 are separate, older releases than 5.5 (Claude Code 2.1.296 model table).
  /\bclaude-(?:opus|sonnet|haiku)-5(?![-.]?\d)/gi,
  /\b(?:Claude\s+)?(?:Opus|Sonnet|Haiku)\s+[1-4](?:\.\d+)?\b(?!\.\d)/g,
  // "Opus 5" without ".5" is the older release; a sentence-ending "Opus 5." still counts.
  /\b(?:Claude\s+)?(?:Opus|Sonnet|Haiku)\s+5(?!\.?\d)/g,
  /\b(?:Claude\s+)?Fable\s+5(?!\.?\d)/g,
  /\bClaude\s+[1-3](?:\.\d+)?\s+(?:Opus|Sonnet|Haiku)\b/g,
];
// The current family (Claude Code 2.1.296 model table, verified 2026-10-15).
const CURRENT_MODEL = /\bclaude-(?:opus|sonnet|haiku)-5-5\b|\bclaude-fable-5-1\b|\b(?:Opus|Sonnet|Haiku)\s+5\.5\b|\bFable\s+5\.1\b/i;
const TIME_EN =/\b(currently|as of|new in|recently|nowadays|at the time of writing|at the moment|these days)\b/i;
// Only the ו and ש prefixes: "מעכשיו" (from now on) is a standing instruction, not a dated fact.
const TIME_HE = /(?<!\p{L})[וש]?(עכשיו|לאחרונה|כרגע|נכון להיום|נכון לעכשיו|בימים אלה)(?!\p{L})/u;
const TIME_EXEMPT = /\bverified\b|אומת|research-date|calibrated-for/i;
const OLD_SECTION = /old patterns|legacy|history|changelog|היסטוריה|דפוסים ישנים/i;
const CHAIN_CUE = /\b(follow(?:s|ing)?|steps? (?:in|from|of)|procedure|must (?:read|run|do|follow)|then (?:read|run|follow|go to|continue)|continue (?:in|with|at)|go to|is required|required (?:by|in))\b|(?<!\p{L})(בצע|פעל לפי|השלבים ב|המשך ב|חובה לקרוא)/iu;
const TOC_HEAD = /^#{1,4}\s+(?:\d+\.\s*)?(?:contents|table of contents|toc|on this page|in this file)\b|^#{1,4}\s+(?:תוכן|תוכן העניינים|תוכן עניינים)(?!\p{L})/imu;

/** Audit one skill folder. Returns { dir, name, findings, stats }. */
export function auditSkill(dir) {
  const root = path.resolve(dir);
  const ctx = makeContext(root);
  const skillPath = path.join(root, 'SKILL.md');
  if (!fs.existsSync(skillPath)) {
    ctx.add('error', 'skill-md-missing', 'SKILL.md', 0, 'no SKILL.md in this folder');
    return finish(ctx);
  }
  checkFrontmatter(ctx);
  checkName(ctx);
  checkDescription(ctx);
  checkBody(ctx);
  checkLinks(ctx);
  checkPlaceholders(ctx);
  ctx.files.filter((f) => f.text !== null).forEach((f) => checkTextFile(ctx, f));
  checkReferences(ctx);
  checkScripts(ctx);
  checkJson(ctx);
  ctx.files.filter((f) => f.rel !== 'SKILL.md' && path.basename(f.rel) === 'SKILL.md' && !f.rel.startsWith('evals/'))
    .forEach((f) => ctx.add('warning', 'nested-skill-md', f.rel, 1, 'a second SKILL.md inside the skill (the Agent Skills layout has one, at the root of the skill folder)'));
  return finish(ctx);
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.isFile()) out.push(p);
  }
  return out;
}

/** A file's text, or null for binary and oversized files. Unknown extensions count as text when the
 *  file has no NUL byte in its first 8 KB and is valid UTF-8, so the dash rule reaches every text file. */
function readText(abs, ext) {
  if (BINARY_EXT.has(ext) || fs.statSync(abs).size > MAX_TEXT_BYTES) return null;
  const buf = fs.readFileSync(abs);
  if (!TEXT_EXT.has(ext) && (buf.subarray(0, SNIFF_BYTES).includes(0) || !isUtf8(buf))) return null;
  return buf.toString('utf8').replace(/^﻿/, '');
}

function makeContext(root) {
  const files = walk(root).map((abs) => {
    const rel = path.relative(root, abs).split(path.sep).join('/');
    const ext = rel.endsWith('.rtl.md') ? '.md' : path.extname(rel).toLowerCase();
    const text = readText(abs, ext);
    return { abs, rel, ext, text, lines: text === null ? [] : text.split(/\r?\n/) };
  });
  const topDirs = fs.readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('.')).map((e) => e.name);
  const findings = [];
  const add = (severity, check, file, line, message) => findings.push({ severity, check, file, line, message });
  const skillsRoot = path.dirname(root);
  let siblings = [];
  try {
    siblings = fs.readdirSync(skillsRoot, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.') && path.join(skillsRoot, e.name) !== root)
      .map((e) => e.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  } catch { /* unreadable parent: no sibling lookups */ }
  return { root, skillsRoot, siblings, files, topDirs, findings, add, fm: null, data: {}, keyLines: {}, stats: { files: files.length } };
}

function finish(ctx) {
  for (const f of ctx.findings) {
    if (f.severity !== 'warning' || !f.line) continue;
    const file = ctx.files.find((x) => x.rel === f.file);
    const near = file ? [file.lines[f.line - 1], file.lines[f.line - 2]].filter(Boolean).join('\n') : '';
    const m = [...near.matchAll(/audit-ok:([\w,-]+)/g)].flatMap((x) => x[1].split(','));
    if (m.includes(f.check)) f.waived = true;
  }
  // Reports name skills by folder (the /command); the frontmatter name is kept for comparison.
  const declared = typeof ctx.data.name === 'string' ? ctx.data.name : null;
  return { dir: ctx.root.split(path.sep).join('/'), name: path.basename(ctx.root), declaredName: declared, findings: ctx.findings, stats: ctx.stats };
}

// ---------------------------------------------------------------- frontmatter
function checkFrontmatter(ctx) {
  const skill = ctx.files.find((f) => f.rel === 'SKILL.md');
  const split = splitFrontmatter(skill.text);
  ctx.split = split;
  if (!split.ok) { ctx.add('error', 'frontmatter-missing', 'SKILL.md', 1, split.error); return; }
  const fm = parseFrontmatter(split.fmText, split.fmStartLine);
  ctx.data = fm.data || {};
  ctx.keyLines = fm.keyLines || {};
  if (fm.errors.length) {
    // Say what each YAML error does in Claude Code: lost on its retry (every field dropped), rescued
    // by the retry, or accepted by Bun's YAML. All three stay errors: strict parsers reject them all.
    const retry = parseFrontmatter(claudeCodeRetryText(split.fmText), split.fmStartLine);
    const drops = retry.errors.some((e) => !e.lenient);
    fm.errors.forEach((e) => {
      const effect = drops ? CC_EFFECT.drops : e.lenient ? `${e.lenient}; strict YAML parsers reject it` : CC_EFFECT.rescued;
      ctx.add('error', 'frontmatter-parse', 'SKILL.md', e.line, `${e.message}. ${effect}`);
    });
  }
  checkFrontmatterCut(ctx, split);
  fm.warnings.forEach((w) => ctx.add('warning', 'frontmatter-comment', 'SKILL.md', w.line, w.message));
  for (const key of Object.keys(ctx.data)) {
    if (VALID_FIELDS.includes(key)) continue;
    const how = MIGRATE[key] ? `: ${MIGRATE[key]}` : '';
    ctx.add('error', 'frontmatter-field', 'SKILL.md', ctx.keyLines[key], `"${key}" is not a valid frontmatter field${how}`);
  }
  checkValues(ctx);
}

// Claude Code finds the frontmatter with /^---\s*\n([\s\S]*?)---\s*\n?/ (read in the 2.1.296 and
// 2.1.299 binaries, 2026-10-15). It is not anchored to a line, so the block ends at the first "---"
// anywhere, even inside a value; the line-based split above never sees that. Say what is left.
function checkFrontmatterCut(ctx, split) {
  const at = split.fmText.indexOf('---');
  if (at < 0) return;
  const before = split.fmText.slice(0, at);
  const line = split.fmStartLine + before.split('\n').length - 1;
  const cut = parseFrontmatter(before, split.fmStartLine);
  const breaks = cut.errors.length > 0 && parseFrontmatter(claudeCodeRetryText(before), split.fmStartLine).errors.some((e) => !e.lenient);
  const later = Object.keys(ctx.keyLines).filter((k) => ctx.keyLines[k] > line);
  const effect = breaks
    ? 'the cut block fails to parse and the skill loads with every frontmatter field dropped'
    : `the rest of that line${later.length ? ` and the fields after it (${later.join(', ')})` : ''} quietly become body text`;
  ctx.add('error', 'frontmatter-parse', 'SKILL.md', line, `"---" inside the frontmatter: Claude Code ends the frontmatter at the first "---" anywhere, even inside a value, so ${effect}`);
}

function checkValues(ctx) {
  const d = ctx.data, line = (k) => ctx.keyLines[k];
  const bad = (k, msg, sev = 'error') => ctx.add(sev, 'frontmatter-value', 'SKILL.md', line(k), `${k}: ${msg}`);
  const isStrList = (v) => typeof v === 'string' || (Array.isArray(v) && v.every((x) => typeof x === 'string'));
  for (const k of ['name', 'description', 'when_to_use', 'license', 'model', 'agent']) if (k in d && d[k] !== null && typeof d[k] !== 'string') bad(k, `must be text, got ${kind(d[k])} (quote it)`);
  if (Array.isArray(d['argument-hint'])) bad('argument-hint', 'was read as a YAML list because it starts with "["; wrap it in double quotes to keep the brackets', 'warning');
  else if ('argument-hint' in d && typeof d['argument-hint'] !== 'string') bad('argument-hint', `must be text, got ${kind(d['argument-hint'])}`);
  for (const k of ['disable-model-invocation', 'user-invocable']) {
    if (!(k in d) || typeof d[k] === 'boolean') continue;
    if (/^(true|false)$/i.test(String(d[k]))) bad(k, 'is quoted text; write true or false without quotes', 'warning');
    else bad(k, `must be true or false, got "${d[k]}"`);
  }
  for (const k of ['allowed-tools', 'disallowed-tools', 'paths', 'arguments']) if (k in d && d[k] !== null && !isStrList(d[k])) bad(k, 'must be text or a list of text');
  if ('effort' in d && !['low', 'medium', 'high', 'xhigh', 'max'].includes(d.effort) && !Number.isInteger(d.effort)) bad('effort', `"${d.effort}" is not low, medium, high, xhigh, max or an integer`);
  if ('context' in d && d.context !== 'fork') bad('context', `"${d.context}" is not recognized; the only value is fork`);
  if ('agent' in d && d.context !== 'fork') bad('agent', 'is only used together with context: fork', 'warning');
  if ('shell' in d && !/^(bash|powershell)$/i.test(String(d.shell))) bad('shell', `"${d.shell}" is not bash or powershell`);
  if ('metadata' in d && (d.metadata === null || typeof d.metadata !== 'object' || Array.isArray(d.metadata))) bad('metadata', 'must be a mapping of key: value lines');
  if ('hooks' in d && (d.hooks === null || typeof d.hooks !== 'object' || Array.isArray(d.hooks))) bad('hooks', 'must be a mapping');
  const tools = typeof d['allowed-tools'] === 'string' ? d['allowed-tools'].split(/[\s,]+/) : Array.isArray(d['allowed-tools']) ? d['allowed-tools'] : [];
  if (tools.some((t) => /^Task(\(|$)/.test(String(t).trim()))) ctx.add('warning', 'task-tool', 'SKILL.md', line('allowed-tools'), 'allowed-tools lists "Task"; the tool is now called Agent');
  if (typeof d.model === 'string') OLD_MODELS.forEach((re) => { re.lastIndex = 0; if (re.test(d.model)) bad('model', `"${d.model}" is an older model id`, 'warning'); });
}

const kind = (v) => (Array.isArray(v) ? 'a list' : v === null ? 'nothing' : typeof v === 'object' ? 'a mapping' : typeof v);

function checkName(ctx) {
  if (!ctx.split || !ctx.split.ok) return;
  const name = ctx.data.name, folder = path.basename(ctx.root), ln = ctx.keyLines.name || 1;
  if (name === undefined || name === null || name === '') { ctx.add('error', 'name-missing', 'SKILL.md', 1, `no name field (house rule: name equals the folder, "${folder}")`); return; }
  const n = String(name);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(n) || n.length > 64) ctx.add('error', 'name-invalid', 'SKILL.md', ln, `"${n}" must be lowercase letters, digits and single hyphens (no leading, trailing or double hyphen), at most 64 characters`);
  if (n !== folder) ctx.add('error', 'name-mismatch', 'SKILL.md', ln, `name "${n}" does not match the folder "${folder}"`);
  if (/claude|anthropic/i.test(n)) ctx.add('error', 'name-reserved', 'SKILL.md', ln, `"${n}" contains a reserved word (claude, anthropic)`);
}

function checkDescription(ctx) {
  if (!ctx.split || !ctx.split.ok) return;
  const raw = ctx.data.description, ln = ctx.keyLines.description || 1;
  const desc = typeof raw === 'string' ? raw.trim() : '';
  const wtu = typeof ctx.data.when_to_use === 'string' ? ctx.data.when_to_use.trim() : '';
  const len = [...desc].length, listing = len + (wtu ? 3 + [...wtu].length : 0);
  Object.assign(ctx.stats, { descriptionChars: len, listingChars: listing });
  if (!desc) { ctx.add('error', 'description-missing', 'SKILL.md', ln, 'no description: Claude cannot tell when to use the skill'); return; }
  if (len > LIMITS.description) ctx.add('error', 'description-length', 'SKILL.md', ln, `description is ${len} characters (max ${LIMITS.description})`);
  else if (len > LIMITS.descriptionTarget) ctx.add('warning', 'description-long', 'SKILL.md', ln, `description is ${len} characters (target about ${LIMITS.descriptionTarget})`);
  if (listing > LIMITS.listing) ctx.add('error', 'listing-length', 'SKILL.md', ctx.keyLines.when_to_use || ln, `description + when_to_use is ${listing} characters; the listing cuts at ${LIMITS.listing}`);
  if (/<\/?[A-Za-z][\w:-]*(\s[^<>]*)?\/?>/.test(desc)) ctx.add('error', 'description-xml', 'SKILL.md', ln, 'description contains an XML-like tag');
  else if (/[<>]/.test(desc)) ctx.add('warning', 'description-angle', 'SKILL.md', ln, 'description contains "<" or ">"');
  const first = desc.replace(/^["'(]+/, '');
  if (/^(I|I'm|I'll|I've|You|You're|You'll|We|We're|My|Our|Let me)\b/i.test(first) || /^(אני|אתה|את|אנחנו)(?!\p{L})/u.test(first)) {
    ctx.add('warning', 'description-person', 'SKILL.md', ln, `description starts with "${first.split(/\s+/)[0]}"; write it in third person`);
  } else if (/^(Use|Using)\b|^(השתמש|תשתמש)(?!\p{L})/u.test(first)) {
    ctx.add('warning', 'description-person', 'SKILL.md', ln, `description starts with an imperative ("${first.split(/\s+/)[0]}"); lead with what the skill does, in third person`);
  }
}

function checkBody(ctx) {
  const split = ctx.split;
  if (!split) return;
  const lines = split.body.split('\n');
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  ctx.stats.bodyLines = lines.length;
  if (lines.length > LIMITS.body) ctx.add('error', 'body-length', 'SKILL.md', split.bodyStartLine, `SKILL.md body is ${lines.length} lines (max ${LIMITS.body})`);
}

// ---------------------------------------------------------------- links and placeholders
const PATH_CHARS = "[^\\s`'\"()\\[\\]<>|,;]";

function pathTokens(line, dirs, bare) {
  const out = [];
  const push = (m, raw, kind) => {
    // A path that goes on with a placeholder ("<skill>/references/harvest/<slug>.md") is a pattern
    // for a file the procedure creates, not a link to check.
    if (kind !== 'mdlink' && /^[<{$]/.test(line.slice(m.index + m[0].length))) return;
    out.push({ raw, kind, at: m.index });
  };
  for (const m of line.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) {
    if (/[/.]/.test(m[1])) push(m, m[1], 'mdlink'); // [text](url) is a placeholder, not a link
  }
  for (const m of line.matchAll(new RegExp(`\\$\\{CLAUDE_SKILL_DIR\\}\\/(${PATH_CHARS}+)`, 'g'))) push(m, m[1], 'skill');
  for (const m of line.matchAll(new RegExp(`(?<![\\w./-])<skill>\\/(${PATH_CHARS}+)`, 'g'))) push(m, m[1], 'skill');
  for (const m of line.matchAll(new RegExp(`(?<![\\w./-])<skills>\\/(${PATH_CHARS}+)`, 'g'))) push(m, m[1], 'cross');
  if (bare && dirs.length) for (const m of line.matchAll(new RegExp(`(?<![\\w./$}>~:-])((?:${dirs.join('|')})\\/${PATH_CHARS}*)`, 'g'))) push(m, m[1], 'bare');
  return out;
}

// Folders that projects have too, and the words that say a sentence is about the project.
const PROJECT_DIRS = new Set(['scripts', 'assets', 'templates', 'tests', 'docs', 'src', 'public', 'design', 'dist', 'app', 'components', 'lib']);
const PROJECT_CUE = /\b(?:projects?|repo|repos|repository|repositories)\b/i;

/** The sentence of a line that holds position at (sentences end at . ; ! or ? before a space). */
function sentenceAt(line, at) {
  let start = 0;
  for (const m of line.matchAll(/[.;!?](?=\s)/g)) {
    if (m.index < at) start = m.index + 1;
    else return line.slice(start, m.index);
  }
  return line.slice(start);
}

// A bare "scripts/x" can also be a project path ("copy scripts/x.mjs from the MediaWave repo into the
// project") or a path inside a sibling skill named on the same line ("frontend-super's templates/x.md").
// Those are not this skill's broken links.
function bareIsElsewhere(r, line, at, ctx) {
  const first = r.split('/')[0];
  const segments = r.replace(/\/$/, '').split('/');
  if (!ctx.topDirs.includes(first) && (segments.length === 1 || !/\.\w+$|\/$/.test(r))) return true;
  if (PROJECT_DIRS.has(first) && PROJECT_CUE.test(sentenceAt(line, at))) return true;
  return ctx.siblings.some((s) => new RegExp(`(?<![\\w-])${s}(?![\\w-])`).test(line) && fs.existsSync(path.join(ctx.skillsRoot, s, r)));
}

function resolveToken(tok, file, ctx) {
  let r = tok.raw.replace(/[#?\u00A7].*$/, '').replace(/:\d+(-\d+)?$/, '').replace(/[.,;:)'"`]+$/, '');
  if (!r || /^(https?|mailto|data|file|ftp):/i.test(r) || /[<>{}$\u2026]|\.\.\./.test(r) || /^[a-z]+:\/\//i.test(r)) return null;
  try { r = decodeURI(r); } catch { /* keep raw */ }
  const star = r.indexOf('*');
  const probe = star >= 0 ? r.slice(0, star).replace(/[^/]*$/, '') : r;
  if (tok.kind === 'cross') return { target: path.resolve(ctx.skillsRoot, probe), shown: `<skills>/${r}`, cross: true };
  const base = tok.kind === 'mdlink' ? path.dirname(path.join(ctx.root, file.rel)) : ctx.root;
  const candidates = [path.resolve(base, probe), path.resolve(ctx.root, probe)];
  const hit = candidates.find((c) => fs.existsSync(c)) || candidates[0];
  const inside = hit === ctx.root || hit.startsWith(ctx.root + path.sep);
  return { target: hit, shown: r, cross: !inside };
}

function checkLinks(ctx) {
  // A bare path counts only when its first folder exists in the skill: skills often name project
  // paths (design/, src/, scripts/ of the project), and a skill without scripts/ means the project's.
  // Prefixed paths (${CLAUDE_SKILL_DIR}/, <skill>/) and markdown links always count.
  const esc = (d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const skillDirs = ctx.topDirs.map(esc), refDirs = skillDirs;
  // Templates are copied into projects, so the paths inside them are project paths.
  for (const file of ctx.files.filter((f) => f.ext === '.md' && !/template/i.test(f.rel))) {
    const isSkill = file.rel === 'SKILL.md';
    const dirs = isSkill ? skillDirs : refDirs;
    const seen = new Set();
    const state = mdState(file.lines);
    file.lines.forEach((line, i) => {
      // Code blocks and tree drawings mostly show project layouts: only prefixed paths count there.
      const bare = !state[i].inFence && !/[\u2500-\u257F]/.test(line);
      for (const tok of pathTokens(line, dirs, bare)) {
        const res = resolveToken(tok, file, ctx);
        if (!res || fs.existsSync(res.target) || seen.has(res.shown)) continue;
        if (tok.kind === 'bare' && bareIsElsewhere(res.shown, line, tok.at, ctx)) continue;
        seen.add(res.shown);
        if (res.cross) ctx.add('warning', 'cross-skill-link', file.rel, i + 1, `${res.shown} does not exist`);
        else ctx.add(isSkill ? 'error' : 'warning', isSkill ? 'link-broken' : 'ref-link-broken', file.rel, i + 1, `${res.shown} does not exist in the skill`);
      }
    });
  }
}

function checkPlaceholders(ctx) {
  const skill = ctx.files.find((f) => f.rel === 'SKILL.md');
  const lines = skill.lines;
  const defines = (ph) => lines.some((l) => l.includes(ph) && l.includes('${CLAUDE_SKILL_DIR}'));
  const def = { '<skill>': defines('<skill>'), '<skills>': defines('<skills>') };
  for (const file of ctx.files.filter((f) => f.ext === '.md')) {
    for (const ph of ['<skill>', '<skills>']) {
      const at = file.lines.findIndex((l) => new RegExp(`(?<![\\w-])${ph}\\/`).test(l));
      if (at >= 0 && !def[ph]) ctx.add('warning', 'skill-dir-placeholder', file.rel, at + 1, `uses ${ph}/ but SKILL.md never defines ${ph} as \${CLAUDE_SKILL_DIR}${ph === '<skills>' ? '/..' : ''}`);
    }
    if (file.rel === 'SKILL.md') continue;
    file.lines.forEach((l, i) => {
      if (/\$\{CLAUDE_SKILL_DIR\}\/(?:\w|\.\.\/)/.test(l)) ctx.add('warning', 'skill-dir-placeholder', file.rel, i + 1, '${CLAUDE_SKILL_DIR} is substituted only in SKILL.md; reference files should use the <skill> placeholder');
    });
  }
  const cmd = /(?:^|[\s`(])(?:node|python3?|py|bash|sh|tsx|bun|deno run|pwsh|powershell(?:\.exe)?(?:\s+-File)?)\s+(?:\.\/)?((?:scripts|assets|evals)\/[^\s`]+)/;
  // Only paths that exist in the skill: "npx tsx scripts/seed.ts" in a package.json is a project script.
  const own = (p) => fs.existsSync(path.join(ctx.root, p.replace(/[.,;:)'"]+$/, '')));
  lines.forEach((l, i) => {
    const m = l.match(cmd);
    if (m && own(m[1])) ctx.add('warning', 'skill-dir-placeholder', 'SKILL.md', i + 1, `runs ${m[1]} by a bare relative path; write \${CLAUDE_SKILL_DIR}/${m[1]} (the working directory is the project, not the skill)`);
  });
  const mentions = lines.findIndex((l) => [...l.matchAll(/(?<![\w./}>-])(scripts\/[\w.-]+\.\w+)/g)].some((m) => own(m[1])));
  if (mentions >= 0 && !lines.some((l) => l.includes('${CLAUDE_SKILL_DIR}'))) ctx.add('warning', 'skill-dir-placeholder', 'SKILL.md', mentions + 1, 'mentions bundled scripts but never uses ${CLAUDE_SKILL_DIR}');
}

// ---------------------------------------------------------------- per-line text checks
function mdState(lines) {
  let fence = false, section = '';
  return lines.map((l) => {
    const isFence = /^\s*(```|~~~)/.test(l);
    const st = { inFence: fence || isFence, section };
    if (isFence) fence = !fence;
    if (!fence && !isFence && /^#{1,6}\s/.test(l)) { section = l; st.section = l; }
    return st;
  });
}

const stripMentions = (l) => l.replace(/`[^`]*`/g, ' ').replace(/"[^"\n]*"/g, ' ').replace(/\u201C[^\u201D]*\u201D/g, ' ').replace(/(^|[\s(])'[^'\n]+'(?=[\s).,;:]|$)/g, '$1 ').replace(/<!--.*?-->/g, ' ');

// Home folders: Windows (drive letter, either slash), macOS, and Git Bash (the drive letter as the
// first folder). Written without a sample path so this file passes its own audit.
const USER_PATHS = [/\b[A-Za-z]:[\\/]+Users[\\/]/i, /(?<![\w.~:])\/Users\/[A-Za-z][\w.-]*\//, /(?<=^|[\s`'"(=])\/[a-zA-Z]\/Users\/[^/\s]+\//];

function checkTextFile(ctx, file) {
  const md = file.ext === '.md';
  const state = md ? mdState(file.lines) : [];
  file.lines.forEach((line, i) => {
    const n = i + 1;
    for (const m of line.matchAll(DASH)) ctx.add('error', 'dash', file.rel, n, `${DASH_NAME[m[0]]}: "${snippet(line, m.index)}"`);
    const up = USER_PATHS.map((re) => line.search(re)).find((at) => at >= 0);
    if (up !== undefined) ctx.add('warning', 'absolute-user-path', file.rel, n, `user-specific absolute path: "${snippet(line, up)}"`);
    if (md) checkMdLine(ctx, file, line, n, state[i]);
    if (md || (file.ext === '.json' && file.rel.startsWith('evals/'))) checkModels(ctx, file, line, n, md ? state[i] : {});
    else if (file.rel.startsWith('scripts/') && CODE_EXT.has(file.ext)) checkModels(ctx, file, line, n, {}, true);
  });
  if (md) checkHebrewName(ctx, file);
}

function checkMdLine(ctx, file, line, n, st) {
  const bs = backslashPath(line);
  if (bs) ctx.add('error', 'backslash-path', file.rel, n, `backslash path "${bs}"`);
  if (/\b`?Task`?\s+tool\b|\bTask\s*\(\s*subagent_type\b/.test(line) && !STALE_CUE.test(line)) ctx.add('warning', 'task-tool', file.rel, n, 'mentions the Task tool; it is now the Agent tool');
  // Templates and worked examples are output documents ("עכשיו לחצו..."), not instructions.
  if (st.inFence || OLD_SECTION.test(st.section) || TIME_EXEMPT.test(line) || /template|(^|\/)examples?[-/]/i.test(file.rel)) return;
  const prose = stripMentions(line);
  const m = prose.match(TIME_EN) || prose.match(TIME_HE);
  if (m) ctx.add('warning', 'time-sensitive', file.rel, n, `time-sensitive phrase "${m[0].trim()}" outside a dated Verified line`);
}

function backslashPath(line) {
  const pats = [/\b[A-Za-z]:\\(?:[^\\\s`'"<>|*?]+\\?)+/, /(?<![\w\\])(?:\.{1,2}|[\w$%{}.-]+)(?:\\[\w$%{}.-]+)+\.[A-Za-z][A-Za-z0-9]{0,5}\b/, /\b(?:references|scripts|assets|evals|templates|agents)\\[\w.-]+/];
  for (const re of pats) {
    const m = line.match(re);
    if (m && /\\/.test(m[0].replace(/\\[_*#|`~[\]()!-]/g, ''))) return m[0];
  }
  return '';
}

function checkModels(ctx, file, line, n, st, code = false) {
  // A line that also names a current model compares or cites ("the Opus 4.8 and Opus 5.5 docs"), so
  // the older id is not being presented as the current one. In code only a comment can mark an id as
  // old ("// legacy id"): arrows are syntax there and ".replace(" is not a cue.
  const cue = code ? STALE_WORDS.test((line.match(/(?:\/\/|#)(.*)$/) || ['', ''])[1]) : STALE_CUE.test(line);
  if (cue || OLD_SECTION.test(st.section || '') || CURRENT_MODEL.test(line)) return;
  for (const re of OLD_MODELS) {
    re.lastIndex = 0;
    const m = re.exec(line);
    if (m) { ctx.add('warning', 'model-stale', file.rel, n, `"${m[0]}" is older than the current family and is not marked as old`); return; }
  }
}

function checkHebrewName(ctx, file) {
  if (file.rel === 'SKILL.md' || file.rel.endsWith('.rtl.md')) return;
  const he = (file.text.match(/[א-ת]/g) || []).length;
  const letters = (file.text.match(/\p{L}/gu) || []).length;
  if (letters >= LIMITS.hebrewMinLetters && he / letters > LIMITS.hebrewRatio) ctx.add('warning', 'hebrew-not-rtl', file.rel, 1, `${Math.round((100 * he) / letters)}% Hebrew letters, but the name does not end in .rtl.md`);
}

const snippet = (line, at) => {
  const s = Math.max(0, (at < 0 ? 0 : at) - 25);
  return line.slice(s, s + 60).replace(DASH, (c) => `[${DASH_NAME[c].split(' ').pop()}]`).trim();
};

// ---------------------------------------------------------------- references, scripts, json
function checkReferences(ctx) {
  const skill = ctx.files.find((f) => f.rel === 'SKILL.md');
  const refs = ctx.files.filter((f) => f.ext === '.md' && f.rel.startsWith('references/'));
  const tocTargets = ctx.files.filter((f) => f.ext === '.md' && f.rel !== 'SKILL.md' && !/template/i.test(f.rel) && !f.rel.startsWith('evals/') && !/^GUIDE[^/]*\.md$/i.test(f.rel));
  for (const f of tocTargets) {
    if (f.lines.length <= LIMITS.refToc) continue;
    const top = f.lines.slice(0, LIMITS.tocWindow);
    const anchors = top.filter((l) => /^\s*(?:[-*]|\d+\.)\s+\[[^\]]+\]\(#[^)]+\)/.test(l)).length;
    if (!TOC_HEAD.test(top.join('\n')) && anchors < 3) ctx.add('warning', 'toc-missing', f.rel, 1, `${f.lines.length} lines and no table of contents in the first ${LIMITS.tocWindow} lines`);
  }
  for (const f of refs) {
    if (f.rel.split('/').length > 2) ctx.add('warning', 'reference-depth', f.rel, 1, 'nested deeper than references/<file>.md');
    const base = path.basename(f.rel);
    if (!skill.text.includes(base) && !/references\/\*/.test(skill.text)) ctx.add('warning', 'reference-orphan', f.rel, 1, 'SKILL.md never points to this file');
    checkChain(ctx, f, refs);
  }
}

function checkChain(ctx, f, refs) {
  const siblings = refs.filter((r) => r !== f).map((r) => path.basename(r.rel));
  const state = mdState(f.lines);
  const reported = new Set();
  f.lines.forEach((line, i) => {
    if (state[i].inFence || !CHAIN_CUE.test(line)) return;
    // The cue and the sibling must share a sentence or table cell: "Read this before X" is about
    // this file, while "follow `y.md` section 3" sends the reader on.
    const sentences = line.split(/(?<=[.;!?])\s+|\s\|\s?/).filter((s) => CHAIN_CUE.test(s));
    for (const s of siblings) {
      const re = new RegExp(`(?<![\\w-])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
      if (sentences.some((x) => re.test(x)) && !reported.has(s)) {
        reported.add(s);
        ctx.add('warning', 'reference-chain', f.rel, i + 1, `sends the reader to ${s} for a required step (a reference-to-reference chain)`);
      }
    }
  });
}

function checkScripts(ctx) {
  for (const f of ctx.files.filter((x) => x.rel.startsWith('scripts/') && x.text !== null)) {
    const t = f.text;
    let runnable, helped;
    if (['.mjs', '.js', '.cjs', '.ts'].includes(f.ext)) { runnable = /process\.argv|Deno\.args|parseArgs\(/.test(t) || t.startsWith('#!'); helped = /--help/.test(t); }
    else if (f.ext === '.py') { runnable = /__main__|sys\.argv|argparse/.test(t); helped = /--help|argparse|click\.|typer/.test(t); }
    else if (['.sh', '.bash'].includes(f.ext)) { runnable = true; helped = /--help/.test(t); }
    else if (f.ext === '.ps1') { runnable = true; helped = /--help|\.SYNOPSIS|Get-Help|-Help\b/i.test(t); }
    else continue;
    if (runnable && !helped) ctx.add('warning', 'script-help', f.rel, 1, 'a runnable script with no --help usage text');
  }
}

function checkJson(ctx) {
  for (const f of ctx.files.filter((x) => x.ext === '.json' && x.text !== null)) {
    const inEvals = f.rel.startsWith('evals/');
    let data;
    try { data = JSON.parse(f.text); } catch (e) {
      ctx.add(inEvals ? 'error' : 'warning', 'json-invalid', f.rel, jsonErrorLine(f.text, e), `invalid JSON: ${e.message.split('\n')[0]}`);
      continue;
    }
    if (f.rel !== 'evals/evals.json') continue;
    const evals = data && Array.isArray(data.evals) ? data.evals : null;
    if (!evals) ctx.add('warning', 'evals-shape', f.rel, 1, 'expected an object with an "evals" array');
    else if (evals.some((e) => !e || typeof e.prompt !== 'string')) ctx.add('warning', 'evals-shape', f.rel, 1, 'every eval needs a "prompt" string');
    if (data && data.skill_name && typeof ctx.data.name === 'string' && data.skill_name !== ctx.data.name) ctx.add('warning', 'evals-shape', f.rel, 1, `skill_name "${data.skill_name}" differs from the skill name "${ctx.data.name}"`);
    if (data && data.trigger_evals && (!Array.isArray(data.trigger_evals) || data.trigger_evals.some((t) => typeof t.query !== 'string' || typeof t.should_trigger !== 'boolean'))) ctx.add('warning', 'evals-shape', f.rel, 1, 'trigger_evals items need "query" (text) and "should_trigger" (true or false)');
  }
}

function jsonErrorLine(text, err) {
  const m = String(err.message).match(/line (\d+)/) || String(err.message).match(/position (\d+)/);
  if (!m) return 1;
  return /line/.test(m[0]) ? Number(m[1]) : text.slice(0, Number(m[1])).split('\n').length;
}
