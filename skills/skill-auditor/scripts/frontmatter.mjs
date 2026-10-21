// frontmatter.mjs - a dependency-free reader for the YAML subset that SKILL.md frontmatter uses.
//
// Why a hand-written reader: the auditor must run with plain Node 20+ and nothing installed.
// Why it is strict: skill-creator's quick_validate.py (PyYAML safe_load) and the yaml and js-yaml
// packages reject any YAML mistake, and Claude Code (2.1.296, read from its code 2026-10-15) parses
// with Bun.YAML.parse, retries once (claudeCodeRetryText below), and when the retry also fails loads
// the skill with EVERY field dropped (name falls back to the folder, description to the first body
// line, allowed-tools and disable-model-invocation stop applying), with only a warn-level log line.
// So every YAML mistake found here is an error; checks.mjs says which of the two outcomes applies.
//
// Supported: block mappings (nested), block sequences, plain / single-quoted / double-quoted scalars
// (multi-line, folded), literal and folded block scalars with chomping, flow sequences, and a
// shallow flow mapping. Anything outside that subset is reported, never guessed.

const ESCAPES = { 0: '\0', a: '\x07', b: '\b', t: '\t', '\t': '\t', n: '\n', v: '\v', f: '\f', r: '\r',
  e: '\x1b', ' ': ' ', '"': '"', '/': '/', '\\': '\\', N: '\x85', _: '\xa0', L: '\u2028', P: '\u2029' };

/** Split a SKILL.md text into frontmatter and body. Lines are 1-based. */
export function splitFrontmatter(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  if (lines[0].trim() !== '---') return { ok: false, error: 'SKILL.md does not start with a "---" line', body: lines.join('\n'), bodyStartLine: 1 };
  const close = lines.findIndex((l, i) => i > 0 && l.trimEnd() === '---');
  if (close < 0) return { ok: false, error: 'the frontmatter has no closing "---" line', body: '', bodyStartLine: lines.length + 1 };
  return { ok: true, fmText: lines.slice(1, close).join('\n'), fmStartLine: 2, body: lines.slice(close + 1).join('\n'), bodyStartLine: close + 2 };
}

// Claude Code 2.1.296's fallback when Bun.YAML.parse throws (functions G9t and v in its code, read
// 2026-10-15): every top-level "key: value" line whose plain value contains one of {}[]*&#!|>%@` or
// ": " gets the value wrapped in double quotes (a value already in quotes, or a valid [list], stays),
// then leading tabs become two spaces each, and the text is parsed once more. Only a single-line value
// can be rescued this way: continuation lines and nested keys are left as they were.
const RETRY_QUOTE = /[{}[\]*&#!|>%@`]|: /;

/** The text Claude Code parses on its second try, so the auditor can predict which outcome applies. */
export function claudeCodeRetryText(fmText) {
  const BS = String.fromCharCode(92);
  return fmText.split('\n').map((line) => {
    const m = line.match(/^([a-zA-Z_-]+):\s+(\S.*)$/);
    if (!m) return line;
    const v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return line;
    if (v.startsWith('[') && v.endsWith(']')) {
      const probe = { errors: [], warnings: [] };
      if (Array.isArray(parseFlowSeq(v, 0, probe)) && !probe.errors.length) return line;
    }
    if (!RETRY_QUOTE.test(v)) return line;
    return `${m[1]}: "${v.split(BS).join(BS + BS).split('"').join(`${BS}"`)}"`;
  }).join('\n').replace(/^\t+/gm, (tabs) => '  '.repeat(tabs.length));
}

/** Parse frontmatter text. Returns { data, keyLines, errors: [{line, message, lenient?}], warnings: [...] }.
 * lenient marks an error that Bun's YAML parser (Claude Code) accepts silently but strict parsers reject. */
export function parseFrontmatter(fmText, firstLine = 2) {
  const out = { errors: [], warnings: [] };
  const lines = fmText.split('\n');
  const { data, keyLines } = parseMapping(lines, firstLine, out);
  return { data, keyLines, errors: out.errors, warnings: out.warnings };
}

const isBlank = (l) => /^\s*(#.*)?$/.test(l);
const indentOf = (l) => l.match(/^ */)[0].length;

function parseMapping(lines, baseLine, out) {
  const data = {}, keyLines = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i], lineNo = baseLine + i;
    if (isBlank(line)) { i++; continue; }
    if (/^ *\t/.test(line)) { out.errors.push({ line: lineNo, message: 'a tab in the indentation (YAML allows spaces only)' }); i++; continue; }
    if (/^\s/.test(line)) { out.errors.push({ line: lineNo, message: 'unexpected indentation: this line is not under any key' }); i++; continue; }
    const m = line.match(/^([A-Za-z0-9_][\w.-]*)[ \t]*:(?:[ \t]+(.*)|[ \t]*)$/);
    if (!m) {
      const why = /^-(\s|$)/.test(line) ? 'a list item where a "key: value" line was expected' : `expected "key: value" (with a space after the colon), got "${line.slice(0, 40)}"`;
      out.errors.push({ line: lineNo, message: why });
      i++; continue;
    }
    let j = i + 1;
    while (j < lines.length && (lines[j].trim() === '' || /^[ \t]/.test(lines[j]))) j++;
    let end = j;
    while (end > i + 1 && lines[end - 1].trim() === '') end--;
    const key = m[1];
    if (key in data) out.errors.push({ line: lineNo, lenient: 'Bun.YAML in Claude Code keeps the last value without a word', message: `duplicate key "${key}" (first on line ${keyLines[key]})` });
    data[key] = parseValue((m[2] || '').trim(), lines.slice(i + 1, end), lineNo, out);
    if (!(key in keyLines)) keyLines[key] = lineNo;
    i = j;
  }
  return { data, keyLines };
}

function parseValue(rest, cont, lineNo, out) {
  if (rest === '' || rest.startsWith('#')) return parseNested(cont, lineNo, out);
  if (/^[|>]/.test(rest)) return parseBlockScalar(rest, cont, lineNo, out);
  if (rest[0] === "'") return parseQuoted([rest, ...cont].join('\n'), "'", lineNo, out);
  if (rest[0] === '"') return parseQuoted([rest, ...cont].join('\n'), '"', lineNo, out);
  if (rest[0] === '[') return parseFlowSeq([rest, ...cont.map((l) => l.trim())].join(' '), lineNo, out);
  if (rest[0] === '{') return parseFlowMap([rest, ...cont.map((l) => l.trim())].join(' '), lineNo, out);
  return parsePlain(rest, cont, lineNo, out);
}

function dedent(cont, lineNo, out) {
  const filled = cont.filter((l) => l.trim() !== '');
  if (!filled.length) return null;
  if (cont.some((l) => /^ *\t/.test(l) && l.trim())) out.errors.push({ line: lineNo + 1, message: 'a tab in the indentation (YAML allows spaces only)' });
  const n = indentOf(filled[0]);
  cont.forEach((l, k) => { if (l.trim() && indentOf(l) < n) out.errors.push({ line: lineNo + 1 + k, message: 'inconsistent indentation inside a nested value' }); });
  return { n, lines: cont.map((l) => (l.trim() ? l.slice(Math.min(n, indentOf(l))) : '')) };
}

function parseNested(cont, lineNo, out) {
  const d = dedent(cont, lineNo, out);
  if (!d) return null;
  const first = d.lines.find((l) => l.trim());
  if (/^-(\s|$)/.test(first)) return parseSequence(d.lines, lineNo + 1, out);
  return parseMapping(d.lines, lineNo + 1, out).data;
}

function parseSequence(lines, baseLine, out) {
  const items = [];
  let i = 0;
  while (i < lines.length) {
    if (isBlank(lines[i])) { i++; continue; }
    const m = lines[i].match(/^-(?:[ \t]+(.*)|[ \t]*)$/);
    if (!m) { out.errors.push({ line: baseLine + i, message: 'expected a "- item" line in this list' }); i++; continue; }
    let j = i + 1;
    while (j < lines.length && (lines[j].trim() === '' || /^[ \t]/.test(lines[j]))) j++;
    const text = (m[1] || '').trim();
    const sub = lines.slice(i + 1, j);
    if (/^[A-Za-z0-9_][\w.-]*[ \t]*:(\s|$)/.test(text)) {
      const pad = ' '.repeat(lines[i].indexOf(text));
      items.push(parseMapping([text, ...sub.map((l) => l.replace(new RegExp(`^${pad}`), ''))], baseLine + i, out).data);
    } else items.push(parseValue(text, sub, baseLine + i, out));
    i = j;
  }
  return items;
}

function parseBlockScalar(rest, cont, lineNo, out) {
  const h = rest.match(/^([|>])([+-]?)(\d?)([+-]?)\s*(#.*)?$/);
  if (!h) { out.errors.push({ line: lineNo, message: `invalid block scalar header "${rest}"` }); return ''; }
  const d = dedent(cont, lineNo, out);
  if (!d) return '';
  const chomp = h[2] || h[4];
  let text;
  if (h[1] === '|') text = d.lines.join('\n');
  else text = d.lines.reduce((acc, l, k) => (k === 0 ? l : acc + (l === '' ? '\n' : (acc.endsWith('\n') || /^\s/.test(l) ? '' : ' ') + l)), '');
  text = text.replace(/\n+$/, '');
  return chomp === '-' ? text : chomp === '+' ? `${text}\n` : `${text}\n`;
}

function foldQuoted(inner) {
  const parts = inner.split('\n');
  if (parts.length === 1) return inner;
  let s = parts[0].trimEnd();
  for (let k = 1; k < parts.length; k++) {
    const p = k === parts.length - 1 ? parts[k].trimStart() : parts[k].trim();
    if (p === '' && k < parts.length - 1) { s += '\n'; continue; }
    s += s.endsWith('\n') ? p : ` ${p}`;
  }
  return s;
}

function parseQuoted(full, q, lineNo, out) {
  let end = -1;
  for (let i = 1; i < full.length; i++) {
    if (q === "'" && full[i] === "'") { if (full[i + 1] === "'") { i++; continue; } end = i; break; }
    if (q === '"' && full[i] === '\\') { i++; continue; }
    if (q === '"' && full[i] === '"') { end = i; break; }
  }
  if (end < 0) { out.errors.push({ line: lineNo, message: `unterminated ${q === "'" ? 'single' : 'double'}-quoted value` }); return full.slice(1); }
  const after = full.slice(end + 1).trim();
  if (after && !after.startsWith('#')) out.errors.push({ line: lineNo, message: `text after the closing quote: "${after.slice(0, 30)}" (the whole value must be inside the quotes; double any ' inside single quotes)` });
  const inner = full.slice(1, end);
  if (q === "'") return foldQuoted(inner).replace(/''/g, "'");
  const joined = foldQuoted(inner.replace(/\\\n[ \t]*/g, ''));
  return joined.replace(/\\(x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8}|[\s\S])/g, (all, e) => {
    if (e.length > 1) return String.fromCodePoint(parseInt(e.slice(1), 16));
    if (e in ESCAPES) return ESCAPES[e];
    out.errors.push({ line: lineNo, message:`unknown escape "\\${e}" inside double quotes (use single quotes, or write \\\\)` });
    return e;
  });
}

function splitFlow(body) {
  const items = [];
  let depth = 0, quote = '', cur = '';
  for (const ch of body) {
    if (quote) { cur += ch; if (ch === quote) quote = ''; continue; }
    if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
    if (ch === '[' || ch === '{') depth++;
    if (ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) { items.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) items.push(cur.trim());
  return items;
}

function closeIndex(full, open, close) {
  let depth = 0, quote = '';
  for (let i = 0; i < full.length; i++) {
    const ch = full[i];
    if (quote) { if (ch === quote) quote = ''; continue; }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === open) depth++;
    else if (ch === close && --depth === 0) return i;
  }
  return -1;
}

function parseFlowSeq(full, lineNo, out) {
  const end = closeIndex(full, '[', ']');
  if (end < 0) { out.errors.push({ line: lineNo, message: 'unclosed "[" (a value starting with [ is a YAML list; quote it if it is text)' }); return []; }
  const after = full.slice(end + 1).trim();
  if (after && !after.startsWith('#')) out.errors.push({ line: lineNo, message: `text after "]": "${after.slice(0, 30)}" (quote the whole value)` });
  return splitFlow(full.slice(1, end)).map((s) => (/^['"]/.test(s) ? parseQuoted(s, s[0], lineNo, out) : scalarType(s)));
}

function parseFlowMap(full, lineNo, out) {
  const end = closeIndex(full, '{', '}');
  if (end < 0) { out.errors.push({ line: lineNo, message: 'unclosed "{" (quote the value if it is text)' }); return {}; }
  const obj = {};
  for (const pair of splitFlow(full.slice(1, end))) {
    const k = pair.indexOf(':');
    if (k > 0) obj[pair.slice(0, k).trim().replace(/^['"]|['"]$/g, '')] = scalarType(pair.slice(k + 1).trim());
  }
  return obj;
}

function scalarType(s) {
  if (/^(true|True|TRUE)$/.test(s)) return true;
  if (/^(false|False|FALSE)$/.test(s)) return false;
  if (/^(null|Null|NULL|~)?$/.test(s)) return null;
  if (/^[-+]?(\d+|\d*\.\d+)([eE][-+]?\d+)?$/.test(s)) return Number(s);
  return s;
}

function parsePlain(rest, cont, lineNo, out) {
  if (/^[@`]/.test(rest)) out.errors.push({ line: lineNo, message: `a plain value cannot start with "${rest[0]}" (reserved in YAML); wrap the value in single quotes` });
  else if (/^[*&!%]/.test(rest)) out.errors.push({ line: lineNo, message: `the value starts with the YAML indicator "${rest[0]}"; wrap the value in single quotes` });
  else if (/^[-?:,\]}](\s|$)/.test(rest)) out.errors.push({ line: lineNo, message: `the value starts with "${rest[0]}" followed by a space; wrap the value in single quotes` });
  const pieces = [rest, ...cont.map((l) => l.trim())];
  let text = '';
  pieces.forEach((raw, k) => {
    const ln = lineNo + k;
    if (k > 0 && raw.startsWith('#')) { out.errors.push({ line: ln, message: 'a comment line inside a multi-line value' }); return; }
    let piece = raw;
    const hash = piece.search(/\s#/);
    if (hash >= 0) {
      out.warnings.push({ line: ln, message: '" #" starts a YAML comment, so the rest of this line is silently dropped from the value; quote the value' });
      piece = piece.slice(0, hash).trimEnd();
    }
    if (/:(\s|$)/.test(piece)) out.errors.push({ line: ln, message: '": " or a final ":" inside an unquoted value is a YAML error; wrap the whole value in single quotes' });
    if (piece === '') { if (k > 0) text += '\n'; return; }
    text += k === 0 || text.endsWith('\n') ? piece : ` ${piece}`;
  });
  return cont.length ? text : scalarType(text);
}
