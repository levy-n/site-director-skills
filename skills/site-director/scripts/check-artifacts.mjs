#!/usr/bin/env node
// check-artifacts: validates site-director's three creative-direction artifacts (world dossier,
// decision log, storyboard) and, with --html, the data-chapter / data-dossier links in a built site.
// Node 20+, no dependencies. Exit 0 = no errors (warnings allowed), 1 = errors, 2 = usage error.
// Tables are found by their Hebrew header rows (assets/templates/*.template.rtl.md), so the
// header names are the contract: columns may be reordered, never renamed.

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, relative, dirname, extname } from 'node:path';

const HELP = `check-artifacts: validate the creative-direction artifacts and their links to the built site.

  node check-artifacts.mjs <design-dir> [--html <file|dir>] [--decisions <path>] [--json]

<design-dir>   folder with world-dossier.rtl.md, design-decisions.rtl.md and storyboard.rtl.md
--decisions    read this decision log. Without the flag: a root log next to the design folder
               (<design-dir>/../DECISIONS.rtl.md, else DECISIONS.md) is the project's single log
               and is read; <design-dir>/design-decisions.rtl.md is read only when no root log
               exists. A second decision log is an error (merge it into the single log, delete it).
--html         a built page or a folder of pages (dist/). Every <section> that is a direct child of
               <main> needs data-chapter (a storyboard id, "hero" or "support") and, unless it is
               "support", data-dossier with existing W ids. Every chapter must appear at least once.
--json         print the report as JSON

World dossier: 15-30 items, unique W ids (W01..W30), item and "איך הוא הופך לאתר" filled, axis in
  the allowed set, at least 3 distinct axes, at least one "רגע" and one "מסמך" or "טופס", the cliche
  exercise filled (no <placeholder>).
Decision log: at least 2 directions, a safe one ("בטוח? כן") rejected ("נפסל") with a reason, exactly
  one "נבחר", both swap tests filled, a reason on every decision, W ids on every non-technical
  decision, and the required decisions: accent with "משמעות", 1-2 font rows, grid, persistent object,
  hero interaction, moment budget (n/3; above 3 needs one row per extra moment, either containing
  "רגע נוסף" or on axis "תנועה"/"אינטראקציה" naming the "רגע").
  A row that says "מחליפה את D<n>" retires D<n> from these counts.
Storyboard: persistent object line with a W id, 3-5 chapters besides "hero", lowercase ASCII slug
  ids, every chapter column filled, every beat on a known chapter with its reduced last frame and
  mobile column filled.
Every "[לבירור]" counts as a warning; leftover template placeholders (<...>, W..) are warnings
  where no stricter rule applies, and errors in required fields. Markup in a row is fine: write
  element names in backticks (\`<section>\`); bare HTML or SVG tags and PascalCase components such
  as <ViewTransition> are also read as content, not as placeholders.

Exit code: 0 no errors, 1 errors, 2 usage error.`;

const DOSSIER_AXES = ['גריד', 'טיפוגרפיה', 'צבע', 'אינטראקציה', 'תנועה', 'תוכן', 'צורה'];
const DECISION_AXES = [...DOSSIER_AXES, 'טכני'];
const DOSSIER_TYPES = ['כלי', 'חומר', 'מסמך', 'טופס', 'שילוט', 'מדים', 'מכשיר מדידה', 'סימון', "ז'רגון", 'רגע'];
const UNRESOLVED = '[לבירור]';
const W_ID = /\bW\d{2}\b/g;
// A valid dossier id: W01..W30 (the dossier holds 15-30 items). W_ID above still extracts W31 or
// W99 from prose, so a citation of an impossible id is reported as missing from the dossier.
const DOSSIER_ID = /^W(?:0[1-9]|[12]\d|30)$/;
const SLUG = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const HEX = /#[0-9a-fA-F]{3,8}\b/;
// Template placeholders are <...> (the templates write <hex>, <n>, <verb-slug>, <שם הלקוח>) and the
// "W.." id stub. A decision may legitimately name markup, so these are NOT placeholders: anything
// inside an inline code span, an HTML or SVG element (<section data-chapter="x">, </main>, <canvas>),
// and a bare PascalCase component with no spaces (<ViewTransition>, <ClientRouter />). A "<" followed
// by a space or "=" is a comparison (LCP < 2.5 s, TBT <= 200 ms), not a placeholder either.
const ELEMENTS = [
  'a', 'abbr', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'body', 'br', 'button', 'canvas', 'circle',
  'clippath', 'code', 'defs', 'details', 'dialog', 'div', 'ellipse', 'em', 'fe[a-z]+', 'figcaption', 'figure',
  'filter', 'footer', 'form', 'g', 'h[1-6]', 'head', 'header', 'html', 'i', 'iframe', 'image', 'img', 'input',
  'label', 'li', 'lineargradient', 'link', 'main', 'mask', 'meta', 'nav', 'noscript', 'ol', 'p', 'path',
  'picture', 'polygon', 'polyline', 'radialgradient', 'rect', 'script', 'section', 'select', 'slot', 'source',
  'span', 'strong', 'style', 'sub', 'summary', 'sup', 'svg', 'template', 'textarea', 'title', 'ul', 'video',
];
const ANGLE = /<([^<>\s=][^<>\n]{0,119})>/g;
const ELEMENT_TAG = new RegExp(`^\\/?(?:${ELEMENTS.join('|')})(?:[\\s/]|$)`, 'i');
const COMPONENT_TAG = /^[A-Z][A-Za-z0-9]*\s*\/?$/; // case-sensitive on purpose: <hex> stays a placeholder
const W_STUB = /\bW\.\./;
const CODE_SPAN = /`[^`\n]*`/g;

// ---------- small helpers ----------

// Invisible marks are built from code points so none hide in this file.
const cp = (...codes) => String.fromCharCode(...codes);
const BIDI_MARKS = new RegExp(`[${cp(0x200e, 0x200f)}${cp(0x202a)}-${cp(0x202e)}${cp(0x2066)}-${cp(0x2069)}${cp(0xfeff)}]`, 'g');
const NBSP = cp(0xa0);
const GERESH = cp(0x05f3);
const GERSHAYIM = cp(0x05f4);

function norm(value) {
  return String(value ?? '')
    .replace(BIDI_MARKS, '')
    .replaceAll(NBSP, ' ')
    .replaceAll(GERESH, "'")
    .replaceAll(GERSHAYIM, '"')
    .replace(/\*\*|__|`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const isBlank = (value) => ['', '-', '?'].includes(norm(value));

function hasPlaceholder(value) {
  const s = String(value ?? '').replace(CODE_SPAN, '');
  if (W_STUB.test(s)) return true;
  for (const m of s.matchAll(ANGLE)) {
    if (!ELEMENT_TAG.test(m[1]) && !COMPONENT_TAG.test(m[1])) return true;
  }
  return false;
}

const unfilled = (value) => isBlank(value) || hasPlaceholder(value);
const wIds = (value) => [...norm(value).matchAll(W_ID)].map((m) => m[0]);
const LISTSEP = new RegExp(`[,/${cp(0x060c)}]`); // comma, slash or Arabic comma
const splitList = (value) => norm(value).split(LISTSEP).map((s) => s.trim()).filter(Boolean);
const short = (value, n = 60) => {
  const s = norm(value);
  return s.length > n ? `${s.slice(0, n)}...` : s;
};

function makeReport() {
  const files = new Map();
  const group = (name) => {
    if (!files.has(name)) files.set(name, { file: name, errors: [], warnings: [], flagged: new Set() });
    return files.get(name);
  };
  return {
    files,
    error: (file, line, message) => {
      const g = group(file);
      g.errors.push({ line, message });
      if (line) g.flagged.add(line);
    },
    warn: (file, line, message) => {
      const g = group(file);
      g.warnings.push({ line, message });
      if (line) g.flagged.add(line);
    },
    touch: group,
  };
}

// ---------- markdown parsing ----------

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells = [];
  let current = '';
  for (let i = 0; i < s.length; i += 1) {
    if (s[i] === '\\' && s[i + 1] === '|') {
      current += '|';
      i += 1;
    } else if (s[i] === '|') {
      cells.push(current.trim());
      current = '';
    } else {
      current += s[i];
    }
  }
  cells.push(current.trim());
  return cells;
}

const isSeparator = (line) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);

function parseMarkdown(text) {
  const lines = text.split(/\r?\n/);
  const tables = [];
  const sections = [];
  let section = { title: '', line: 0, bullets: [] };
  sections.push(section);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      section = { title: norm(heading[1]), line: i + 1, bullets: [] };
      sections.push(section);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) section.bullets.push({ text: line.replace(/^\s*[-*]\s+/, ''), line: i + 1 });
    if (line.trim().startsWith('|') && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      const table = { header: splitRow(line).map(norm), line: i + 1, section: section.title, rows: [] };
      let j = i + 2;
      for (; j < lines.length && lines[j].trim().startsWith('|'); j += 1) {
        table.rows.push({ cells: splitRow(lines[j]), line: j + 1 });
      }
      tables.push(table);
      i = j - 1;
    }
  }
  return { lines, tables, sections };
}

function colIndex(header, name) {
  return header.findIndex((h) => h === name || h.startsWith(`${name} `) || h.startsWith(`${name}(`));
}

function findTable(doc, names) {
  return doc.tables.find((t) => names.every((n) => colIndex(t.header, n) >= 0));
}

// Rows as objects keyed by the given map {key: headerName}; rows where every cell is blank are skipped.
function tableRows(table, map) {
  if (!table) return [];
  const idx = Object.fromEntries(Object.entries(map).map(([k, name]) => [k, colIndex(table.header, name)]));
  return table.rows
    .filter((row) => row.cells.some((c) => !isBlank(c)))
    .map((row) => {
      const obj = { line: row.line };
      for (const [k, i] of Object.entries(idx)) obj[k] = i >= 0 ? row.cells[i] ?? '' : '';
      return obj;
    });
}

const findSection = (doc, fragment) => doc.sections.find((s) => s.title.includes(fragment));

function bulletValue(bullet) {
  const i = bullet.text.indexOf(':');
  return i < 0 ? '' : bullet.text.slice(i + 1);
}

// Blockquote lines are the template's own instructions (they mention [לבירור] as a rule), not content.
function scanCommon(doc, file, report) {
  doc.lines.forEach((text, i) => {
    const line = i + 1;
    if (text.trim().startsWith('>')) return;
    const count = text.split(UNRESOLVED).length - 1;
    for (let k = 0; k < count; k += 1) report.warn(file, line, `${UNRESOLVED}: ${short(text, 70)}`);
  });
}

function scanPlaceholders(doc, file, report) {
  const group = report.touch(file);
  doc.lines.forEach((text, i) => {
    const line = i + 1;
    if (group.flagged.has(line) || !hasPlaceholder(text) || text.trim().startsWith('>')) return;
    report.warn(file, line, `template placeholder left: ${short(text, 70)}`);
  });
}

// ---------- world dossier ----------

function checkDossier(doc, file, report) {
  const stats = { items: 0, ids: new Set(), axes: new Set(), moments: 0, documents: 0 };
  const table = findTable(doc, ['מזהה', 'פריט', 'סוג', 'איך הוא הופך לאתר', 'ציר']);
  if (!table) {
    report.error(file, 0, 'items table not found (header: מזהה | פריט | סוג | ... | איך הוא הופך לאתר | ציר)');
    return stats;
  }
  const rows = tableRows(table, { id: 'מזהה', item: 'פריט', type: 'סוג', how: 'איך הוא הופך לאתר', axis: 'ציר' });
  for (const row of rows) checkDossierRow(row, stats, file, report);
  if (stats.items < 15 || stats.items > 30) {
    report.error(file, table.line, `${stats.items} items; the dossier needs 15-30`);
  }
  if (stats.axes.size < 3) {
    report.error(file, table.line, `${stats.axes.size} distinct axes (${[...stats.axes].join(', ') || 'none'}); at least 3 are needed`);
  }
  if (stats.moments === 0) report.error(file, table.line, 'no item of type "רגע"');
  if (stats.documents === 0) report.error(file, table.line, 'no item of type "מסמך" or "טופס"');
  checkCliche(doc, file, report);
  checkCandidates(doc, stats.ids, file, report);
  return stats;
}

function checkDossierRow(row, stats, file, report) {
  const id = norm(row.id);
  if (!DOSSIER_ID.test(id)) report.error(file, row.line, `id "${id}" is not W01..W30`);
  else if (stats.ids.has(id)) report.error(file, row.line, `duplicate id ${id}`);
  else stats.ids.add(id);
  const label = id || `line ${row.line}`;
  if (unfilled(row.item)) report.error(file, row.line, `${label}: "פריט" is empty`);
  else stats.items += 1;
  if (unfilled(row.how)) report.error(file, row.line, `${label}: "איך הוא הופך לאתר" is empty`);
  const axes = splitList(row.axis);
  if (axes.length === 0) report.error(file, row.line, `${label}: "ציר" is empty`);
  for (const axis of axes) {
    if (DOSSIER_AXES.includes(axis)) stats.axes.add(axis);
    else report.error(file, row.line, `${label}: axis "${axis}" is not one of ${DOSSIER_AXES.join(', ')}`);
  }
  const types = splitList(row.type);
  if (types.length === 0) report.warn(file, row.line, `${label}: "סוג" is empty`);
  for (const type of types) {
    if (!DOSSIER_TYPES.includes(type)) report.warn(file, row.line, `${label}: type "${type}" is not one of ${DOSSIER_TYPES.join(', ')}`);
  }
  if (types.includes('רגע')) stats.moments += 1;
  if (types.includes('מסמך') || types.includes('טופס')) stats.documents += 1;
}

function checkCliche(doc, file, report) {
  const section = findSection(doc, 'תרגיל הקלישאה');
  if (!section) {
    report.error(file, 0, 'section "תרגיל הקלישאה" not found');
    return;
  }
  if (section.bullets.length < 3) report.error(file, section.line, 'the cliche exercise needs its bullets filled (word, brief without it, what the business does)');
  for (const bullet of section.bullets) {
    if (hasPlaceholder(bullet.text) || isBlank(bulletValue(bullet))) {
      report.error(file, bullet.line, `cliche exercise not filled: ${short(bullet.text, 60)}`);
    }
  }
}

function checkCandidates(doc, ids, file, report) {
  for (const fragment of ['מועמדים לאובייקט הקבוע', 'מועמדים לאינטראקציית ההירו']) {
    const section = findSection(doc, fragment);
    if (!section) continue;
    for (const bullet of section.bullets) {
      const cited = wIds(bullet.text);
      if (cited.length === 0) report.warn(file, bullet.line, `"${fragment}": candidate cites no W id`);
      for (const w of cited) if (!ids.has(w)) report.error(file, bullet.line, `"${fragment}": ${w} is not in the dossier`);
    }
  }
}

// ---------- decision log ----------

function checkDecisions(doc, file, report, dossierIds) {
  const stats = { directions: 0, decisions: 0, budget: null };
  stats.directions = checkDirections(doc, file, report, dossierIds);
  checkSwapTests(doc, file, report);
  const table = findTable(doc, ['#', 'החלטה', 'ציר', 'נימוק']);
  if (!table) {
    report.error(file, 0, 'decision table not found (header: # | החלטה | ציר | נימוק | פריטים מהתיק | אישר)');
    return stats;
  }
  const rows = tableRows(table, { id: '#', text: 'החלטה', axis: 'ציר', reason: 'נימוק', items: 'פריטים מהתיק', approved: 'אישר' });
  const retired = new Set();
  const seen = new Set();
  for (const row of rows) {
    checkDecisionRow(row, seen, file, report, dossierIds);
    for (const m of norm(row.text).matchAll(/מחליפ\S* את\s+(D\d+)/g)) retired.add(m[1]);
  }
  const active = rows.filter((r) => !retired.has(norm(r.id)));
  stats.decisions = active.length;
  stats.budget = checkRequiredDecisions(active, table.line, file, report);
  return stats;
}

function checkDirections(doc, file, report, dossierIds) {
  const table = findTable(doc, ['כיוון', 'בטוח?', 'סטטוס', 'נימוק']);
  if (!table) {
    report.error(file, 0, 'directions table not found (header: כיוון | במשפט אחד | בטוח? | סטטוס | נימוק | פריטים מהתיק)');
    return 0;
  }
  const rows = tableRows(table, { id: 'כיוון', sentence: 'במשפט אחד', safe: 'בטוח?', status: 'סטטוס', reason: 'נימוק', items: 'פריטים מהתיק' });
  if (rows.length < 2) report.error(file, table.line, `${rows.length} direction(s); at least 2 are needed`);
  for (const row of rows) checkDirectionRow(row, file, report, dossierIds);
  const chosen = rows.filter((r) => norm(r.status) === 'נבחר');
  if (chosen.length !== 1) report.error(file, table.line, `${chosen.length} directions marked "נבחר"; exactly one is needed`);
  if (chosen.some((r) => norm(r.safe) === 'כן')) report.error(file, table.line, 'the chosen direction is marked safe ("בטוח? כן")');
  const safeRejected = rows.filter((r) => norm(r.safe) === 'כן' && norm(r.status) === 'נפסל' && !unfilled(r.reason));
  if (safeRejected.length === 0) {
    report.error(file, table.line, 'no direction is marked "בטוח? כן", rejected ("נפסל") and given a reason');
  }
  return rows.length;
}

function checkDirectionRow(row, file, report, dossierIds) {
  const label = `direction ${norm(row.id) || `line ${row.line}`}`;
  if (unfilled(row.sentence)) report.error(file, row.line, `${label}: "במשפט אחד" is empty`);
  if (!['נבחר', 'נפסל'].includes(norm(row.status))) report.error(file, row.line, `${label}: status must be "נבחר" or "נפסל"`);
  if (!['כן', 'לא'].includes(norm(row.safe))) report.error(file, row.line, `${label}: "בטוח?" must be "כן" or "לא"`);
  if (unfilled(row.reason) && norm(row.safe) !== 'כן') report.warn(file, row.line, `${label}: no reason`);
  const cited = wIds(row.items);
  if (cited.length === 0 && norm(row.safe) !== 'כן') report.warn(file, row.line, `${label}: cites no dossier item`);
  for (const w of cited) if (!dossierIds.has(w)) report.error(file, row.line, `${label}: ${w} is not in the dossier`);
}

function checkSwapTests(doc, file, report) {
  const section = findSection(doc, 'מבחני החלפה');
  if (!section) {
    report.error(file, 0, 'section "מבחני החלפה" not found');
    return;
  }
  for (const label of ['עסק מתחום אחר', 'מתחרה מאותו תחום']) {
    const bullet = section.bullets.find((b) => norm(b.text).startsWith(label));
    if (!bullet) report.error(file, section.line, `swap test "${label}" missing`);
    else if (hasPlaceholder(bullet.text) || isBlank(bulletValue(bullet))) {
      report.error(file, bullet.line, `swap test "${label}" not filled`);
    }
  }
}

function checkDecisionRow(row, seen, file, report, dossierIds) {
  const id = norm(row.id);
  if (!/^D\d+$/.test(id)) report.error(file, row.line, `decision id "${id}" is not D<n>`);
  else if (seen.has(id)) report.error(file, row.line, `duplicate decision ${id}`);
  else seen.add(id);
  const label = id || `line ${row.line}`;
  if (unfilled(row.text)) report.error(file, row.line, `${label}: decision text empty or still a template`);
  if (unfilled(row.reason)) report.error(file, row.line, `${label}: no reason (a decision without a reason is deleted)`);
  const axis = norm(row.axis);
  if (!DECISION_AXES.includes(axis)) report.error(file, row.line, `${label}: axis "${axis}" is not one of ${DECISION_AXES.join(', ')}`);
  const cited = wIds(row.items);
  for (const w of cited) if (!dossierIds.has(w)) report.error(file, row.line, `${label}: ${w} is not in the dossier`);
  if (axis !== 'טכני' && cited.length === 0) {
    const why = norm(row.items) === 'אין' ? '"אין" is allowed only on technical decisions' : 'cites no dossier item';
    report.error(file, row.line, `${label}: ${why}`);
  }
}

function checkRequiredDecisions(active, line, file, report) {
  const has = (r, s) => norm(r.text).includes(s);
  const axisOf = (r) => norm(r.axis);
  const accents = active.filter((r) => axisOf(r) === 'צבע' && (has(r, 'הדגשה') || has(r, 'משמעות')));
  if (!accents.some((r) => has(r, 'משמעות'))) report.error(file, line, 'no accent decision (axis "צבע") stating its "משמעות"');
  if (accents.filter((r) => has(r, 'הדגשה')).length > 1) report.error(file, line, 'more than one active accent decision; retire the old one with "מחליפה את D<n>"');
  for (const r of accents) if (!HEX.test(r.text)) report.warn(file, r.line, `${norm(r.id)}: accent has no #hex value`);
  const fonts = active.filter((r) => axisOf(r) === 'טיפוגרפיה' && has(r, 'פונט'));
  if (fonts.length < 1 || fonts.length > 2) report.error(file, line, `${fonts.length} active font decisions; 1-2 families are allowed`);
  for (const r of fonts) if (isBlank(r.approved)) report.warn(file, r.line, `${norm(r.id)}: font not marked as approved (Nati picks from rendered specimens)`);
  if (!active.some((r) => axisOf(r) === 'גריד')) report.error(file, line, 'no grid decision (axis "גריד")');
  if (!active.some((r) => has(r, 'אובייקט קבוע'))) report.error(file, line, 'no persistent object decision ("אובייקט קבוע")');
  if (!active.some((r) => has(r, 'אינטראקציית הירו') || (axisOf(r) === 'אינטראקציה' && has(r, 'הירו')))) {
    report.error(file, line, 'no hero interaction decision ("אינטראקציית הירו")');
  }
  if (!active.some((r) => axisOf(r) === 'טכני' && has(r, 'סטאק'))) report.warn(file, line, 'no stack and CMS decision (D1, axis "טכני")');
  return checkBudget(active, line, file, report);
}

function checkBudget(active, line, file, report) {
  const row = active.find((r) => norm(r.text).includes('תקציב רגעים'));
  if (!row) {
    report.error(file, line, 'no moment budget decision ("תקציב רגעים: n/3")');
    return null;
  }
  const m = norm(row.text).match(/(\d+)\s*\/\s*3/);
  if (!m) {
    report.error(file, row.line, `${norm(row.id)}: budget count not readable; write it as n/3`);
    return null;
  }
  const n = Number(m[1]);
  if (n < 2) report.warn(file, row.line, `${norm(row.id)}: budget ${n}/3; the target is 2-3 standout moments`);
  const listed = norm(row.text).slice(norm(row.text).indexOf(m[0]) + m[0].length).replace(/^\s*:/, '');
  const items = splitList(listed);
  if (items.length && items.length !== n) report.warn(file, row.line, `${norm(row.id)}: budget says ${n} but lists ${items.length} moment(s)`);
  if (n > 3) {
    const extra = active.filter((r) => r !== row && isExtraMomentRow(r));
    if (extra.length < n - 3) {
      report.error(file, row.line, `budget ${n}/3 needs ${n - 3} extra decision row(s), one per moment above 3, each with a reason; found ${extra.length}. Start each with "רגע נוסף:" (a row on axis "תנועה" or "אינטראקציה" that names the "רגע" also counts)`);
    }
  }
  return n;
}

// The template asks for "a row of its own with a reason" per moment above 3 without fixing a
// keyword, so two forms count: any row containing "רגע נוסף", and a motion or interaction row that
// names a "רגע" and is not one of the required rows (persistent object, hero interaction).
function isExtraMomentRow(r) {
  const text = norm(r.text);
  if (text.includes('רגע נוסף')) return true;
  if (!['תנועה', 'אינטראקציה'].includes(norm(r.axis)) || !text.includes('רגע')) return false;
  return !['תקציב רגעים', 'אובייקט קבוע', 'אינטראקציית הירו'].some((s) => text.includes(s));
}

// ---------- storyboard ----------

function checkStoryboard(doc, file, report, dossierIds, decisionBudget) {
  const stats = { chapters: [], chapterItems: new Map(), beats: 0 };
  checkStoryHeader(doc, file, report, dossierIds, decisionBudget);
  const table = findTable(doc, ['מזהה', 'מה הלקוח מרגיש', 'מצב האובייקט']);
  if (!table) {
    report.error(file, 0, 'chapters table not found (header: מזהה | פרק (פועל) | מה הלקוח מרגיש | מצב האובייקט | ...)');
    return stats;
  }
  const rows = tableRows(table, {
    id: 'מזהה', name: 'פרק', feel: 'מה הלקוח מרגיש', state: 'מצב האובייקט', motion: 'תנועה',
    text: 'טקסט', proof: 'הוכחה', focus: 'מוקד', items: 'פריטים מהתיק',
  });
  const heroRows = rows.filter((r) => norm(r.id) === 'hero');
  if (heroRows.length === 0) report.warn(file, table.line, 'no "hero" row in the chapters table');
  if (heroRows.length > 1) report.error(file, table.line, 'more than one "hero" row');
  for (const r of heroRows) {
    for (const w of wIds(r.items)) if (!dossierIds.has(w)) report.error(file, r.line, `hero: ${w} is not in the dossier`);
    stats.chapterItems.set('hero', wIds(r.items));
  }
  const chapters = rows.filter((r) => norm(r.id) !== 'hero');
  for (const row of chapters) checkChapterRow(row, stats, file, report, dossierIds);
  if (chapters.length < 3 || chapters.length > 5) {
    report.error(file, table.line, `${chapters.length} chapters besides hero; the story needs 3-5`);
  }
  checkBeats(doc, file, report, stats);
  checkSeams(doc, file, report, stats.chapters.length);
  return stats;
}

function checkStoryHeader(doc, file, report, dossierIds, decisionBudget) {
  const bullets = doc.sections[0].bullets.concat(...doc.sections.slice(1, 2).map((s) => s.bullets));
  const find = (label) => bullets.find((b) => norm(b.text).startsWith(label));
  const object = find('אובייקט קבוע');
  if (!object) report.error(file, 0, 'line "- אובייקט קבוע: ... (W..)" not found');
  else {
    const cited = wIds(object.text);
    if (hasPlaceholder(object.text) || isBlank(bulletValue(object))) report.error(file, object.line, 'persistent object line not filled');
    else if (cited.length === 0) report.error(file, object.line, 'persistent object line cites no W id');
    for (const w of cited) if (!dossierIds.has(w)) report.error(file, object.line, `persistent object: ${w} is not in the dossier`);
  }
  const states = find('מצבי האובייקט');
  if (!states || unfilled(bulletValue(states))) report.warn(file, states?.line ?? 0, 'object states line ("מצבי האובייקט") not filled');
  const budget = find('תקציב רגעים');
  const m = budget && norm(budget.text).match(/(\d+)\s*\/\s*3/);
  if (m && decisionBudget != null && Number(m[1]) !== decisionBudget) {
    report.warn(file, budget.line, `budget ${m[1]}/3 here but ${decisionBudget}/3 in the decision log`);
  }
}

function checkChapterRow(row, stats, file, report, dossierIds) {
  const id = norm(row.id);
  if (!SLUG.test(id)) report.error(file, row.line, `chapter id "${id}" is not a lowercase ASCII slug`);
  else if (id === 'support') report.error(file, row.line, 'chapter id "support" is reserved for legal and utility sections');
  else if (stats.chapters.includes(id)) report.error(file, row.line, `duplicate chapter id "${id}"`);
  else stats.chapters.push(id);
  const fields = { name: 'פרק', feel: 'מה הלקוח מרגיש', state: 'מצב האובייקט', motion: 'תנועה', text: 'טקסט', proof: 'הוכחה', focus: 'מוקד' };
  const empty = Object.entries(fields).filter(([k]) => unfilled(row[k])).map(([, label]) => `"${label}"`);
  if (empty.length) report.error(file, row.line, `chapter ${id}: empty ${empty.join(', ')}`);
  const cited = wIds(row.items);
  if (cited.length === 0) report.error(file, row.line, `chapter ${id}: cites no dossier item`);
  for (const w of cited) if (!dossierIds.has(w)) report.error(file, row.line, `chapter ${id}: ${w} is not in the dossier`);
  stats.chapterItems.set(id, cited);
}

function checkBeats(doc, file, report, stats) {
  const table = findTable(doc, ['vp', 'פרק', 'פריים אחרון ב-reduced']);
  if (!table) {
    report.error(file, 0, 'beats table not found (header: vp | פרק | ... | פריים אחרון ב-reduced | מובייל ...)');
    return;
  }
  const rows = tableRows(table, { vp: 'vp', chapter: 'פרק', reduced: 'פריים אחרון ב-reduced', mobile: 'מובייל' });
  if (rows.length === 0) report.error(file, table.line, 'no beats');
  const known = new Set([...stats.chapters, 'hero', 'support']);
  const used = new Set();
  for (const row of rows) {
    // A note in brackets after the id is allowed ("support (faq)"), so a beat can say which support section it is.
    const chapter = norm(row.chapter).replace(/\s*\([^)]*\)$/, '');
    const label = `beat ${norm(row.vp) || `line ${row.line}`}`;
    if (!known.has(chapter)) report.error(file, row.line, `${label}: chapter "${chapter}" is not in the chapters table`);
    used.add(chapter);
    if (unfilled(row.reduced)) report.error(file, row.line, `${label}: "פריים אחרון ב-reduced" is empty`);
    if (unfilled(row.mobile)) report.error(file, row.line, `${label}: mobile column is empty`);
  }
  for (const id of stats.chapters) if (!used.has(id)) report.warn(file, table.line, `chapter ${id} has no beat`);
  stats.beats = rows.length;
}

function checkSeams(doc, file, report, chapterCount) {
  const seams = findTable(doc, ['תפר']);
  const filled = tableRows(seams, { seam: 'תפר' }).filter((r) => !unfilled(r.seam)).length;
  if (seams && chapterCount > 0 && filled < chapterCount) {
    report.warn(file, seams.line, `${filled} seam row(s) for ${chapterCount + 1} parts; write how each exit meets the next entry`);
  }
  const polish = findTable(doc, ['גיאומטריה']);
  if (polish && tableRows(polish, { moment: 'רגע' }).filter((r) => !unfilled(r.moment)).length === 0) {
    report.warn(file, polish.line, 'small-transition polish table is empty (fill it during QA: geometry, highlight, text)');
  }
}

// ---------- HTML linkage ----------

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const CLOSES_P = new Set(['address', 'article', 'aside', 'blockquote', 'details', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'main', 'menu', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul']);
const SELF_CLOSING_PEERS = { li: ['li'], dt: ['dt', 'dd'], dd: ['dt', 'dd'], option: ['option'], tr: ['tr'], td: ['td', 'th'], th: ['td', 'th'] };
const TAG = /<!--[\s\S]*?-->|<(script|style|template|textarea)\b[^>]*>[\s\S]*?<\/\1\s*>|<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
const ATTR = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function parseAttrs(source) {
  const attrs = {};
  for (const m of source.matchAll(ATTR)) {
    attrs[m[1].toLowerCase()] = (m[2] ?? m[3] ?? m[4] ?? '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  }
  return attrs;
}

function lineAt(starts, index) {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= index) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}

// Returns { mains, sections: [{attrs, line}] } for <section> elements that are direct children of <main>.
function mainSections(html) {
  const starts = [0];
  for (let i = 0; i < html.length; i += 1) if (html[i] === '\n') starts.push(i + 1);
  const stack = [];
  const sections = [];
  let mains = 0;
  for (const m of html.matchAll(TAG)) {
    if (m[1] || !m[3]) continue;
    const name = m[3].toLowerCase();
    if (m[2] === '/') {
      const at = stack.lastIndexOf(name);
      if (at >= 0) stack.length = at;
      continue;
    }
    const top = stack[stack.length - 1];
    if (CLOSES_P.has(name) && top === 'p') stack.pop();
    if (SELF_CLOSING_PEERS[name]?.includes(stack[stack.length - 1])) stack.pop();
    if (name === 'main') mains += 1;
    if (name === 'section' && stack[stack.length - 1] === 'main') {
      sections.push({ attrs: parseAttrs(m[4] || ''), line: lineAt(starts, m.index) });
    }
    if (!VOID.has(name) && m[5] !== '/') stack.push(name);
  }
  return { mains, sections };
}

function listHtml(target) {
  if (!existsSync(target)) return null;
  if (statSync(target).isFile()) return [target];
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (['.html', '.htm'].includes(extname(entry.name).toLowerCase())) out.push(full);
    }
  };
  walk(target);
  return out.sort();
}

function checkHtml(target, report, dossierIds, story) {
  const files = listHtml(target);
  const site = rel(target);
  if (!files) {
    report.error(site, 0, '--html path does not exist');
    return { pages: 0, sections: 0 };
  }
  const valid = new Set([...story.chapters, 'hero', 'support']);
  const seen = new Set();
  let mainsTotal = 0;
  let sectionsTotal = 0;
  for (const path of files) {
    const file = rel(path);
    const { mains, sections } = mainSections(readFileSync(path, 'utf8'));
    mainsTotal += mains;
    sectionsTotal += sections.length;
    if (mains === 0) continue;
    if (mains > 1) report.warn(file, 0, `${mains} <main> elements; a page has one`);
    if (sections.length === 0) report.warn(file, 0, '<main> has no direct <section> children');
    for (const s of sections) checkSection(s, file, report, { valid, seen, dossierIds, story });
  }
  if (files.length === 0) report.error(site, 0, 'no .html files found');
  else if (mainsTotal === 0) report.error(site, 0, 'no <main> element in any page');
  for (const id of story.chapters) if (!seen.has(id)) report.error(site, 0, `chapter "${id}" never appears as data-chapter in the HTML`);
  if (!seen.has('hero') && mainsTotal > 0) report.warn(site, 0, 'no section with data-chapter="hero"');
  return { pages: files.length, sections: sectionsTotal };
}

function checkSection(section, file, report, ctx) {
  const chapter = norm(section.attrs['data-chapter']);
  const where = `<section${section.attrs.id ? ` id="${section.attrs.id}"` : ''}>`;
  if (!chapter) {
    report.error(file, section.line, `${where} in <main> has no data-chapter`);
    return;
  }
  if (!ctx.valid.has(chapter)) report.error(file, section.line, `${where}: data-chapter="${chapter}" is not a storyboard id, "hero" or "support"`);
  ctx.seen.add(chapter);
  const raw = section.attrs['data-dossier'];
  if (raw === undefined || isBlank(raw)) {
    if (chapter !== 'support') report.error(file, section.line, `${where} (${chapter}): no data-dossier`);
    return;
  }
  const ids = norm(raw).split(/[\s,]+/).filter(Boolean);
  for (const id of ids) {
    if (!DOSSIER_ID.test(id)) report.error(file, section.line, `${where} (${chapter}): data-dossier token "${id}" is not a W id (W01..W30)`);
    else if (!ctx.dossierIds.has(id)) report.error(file, section.line, `${where} (${chapter}): ${id} is not in the dossier`);
  }
  const planned = ctx.story.chapterItems.get(chapter);
  const allKnown = ids.every((id) => ctx.dossierIds.has(id));
  if (allKnown && planned && planned.length && !ids.some((id) => planned.includes(id))) {
    report.warn(file, section.line, `${where} (${chapter}): none of ${ids.join(' ')} is listed for this chapter in the storyboard (${planned.join(' ')})`);
  }
}

// ---------- driver ----------

const rel = (p) => relative(process.cwd(), resolve(p)).replace(/\\/g, '/') || '.';

function parseArgs(argv) {
  const opts = { dir: null, html: null, decisions: null, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--json') opts.json = true;
    else if (a === '--html' || a === '--decisions') {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) return { error: `${a} needs a path` };
      opts[a.slice(2)] = argv[i + 1];
      i += 1;
    } else if (a.startsWith('--')) return { error: `unknown option ${a}` };
    else if (!opts.dir) opts.dir = a;
    else return { error: `unexpected argument ${a}` };
  }
  return opts;
}

// The project keeps ONE decision log. A root DECISIONS.rtl.md (else DECISIONS.md) next to the design
// folder is that log; design/design-decisions.rtl.md is the log only when no root log exists. Any
// second log is an error, so the gate can never pass on the copy that is not authoritative.
function resolveDecisions(opts, report) {
  const own = join(opts.dir, 'design-decisions.rtl.md');
  const roots = [join(opts.dir, '..', 'DECISIONS.rtl.md'), join(opts.dir, '..', 'DECISIONS.md')].filter(existsSync);
  const chosen = opts.decisions ?? roots[0] ?? own;
  const same = (a, b) => resolve(a).toLowerCase() === resolve(b).toLowerCase();
  const chosenIsRoot = roots.some((p) => same(p, chosen));
  for (const other of [own, ...roots].filter((p) => existsSync(p) && !same(p, chosen))) {
    if (same(other, own)) {
      report.error(rel(own), 0, `two decision logs: ${rel(chosen)} is the single log; merge this file into it and delete it`);
    } else if (chosenIsRoot) {
      report.warn(rel(other), 0, `two root decision logs; ${rel(chosen)} is read as the log`);
    } else {
      report.error(rel(other), 0, `two decision logs: this root log is the single log; merge ${rel(chosen)} into it and pass it with --decisions`);
    }
  }
  return chosen;
}

function loadDoc(path, report) {
  if (!existsSync(path)) {
    report.error(rel(path), 0, 'file not found');
    return null;
  }
  return parseMarkdown(readFileSync(path, 'utf8'));
}

function run(opts) {
  const report = makeReport();
  report.touch(rel(join(opts.dir, 'world-dossier.rtl.md')));
  const paths = {
    dossier: join(opts.dir, 'world-dossier.rtl.md'),
    decisions: resolveDecisions(opts, report),
    story: join(opts.dir, 'storyboard.rtl.md'),
  };
  for (const p of Object.values(paths)) report.touch(rel(p));
  const docs = Object.fromEntries(Object.entries(paths).map(([k, p]) => [k, loadDoc(p, report)]));
  const stats = { decisionLog: rel(paths.decisions) };
  const ids = new Set();
  if (docs.dossier) Object.assign(stats, { dossier: checkDossier(docs.dossier, rel(paths.dossier), report) });
  for (const id of stats.dossier?.ids ?? []) ids.add(id);
  if (docs.decisions) stats.decisions = checkDecisions(docs.decisions, rel(paths.decisions), report, ids);
  const story = docs.story
    ? checkStoryboard(docs.story, rel(paths.story), report, ids, stats.decisions?.budget ?? null)
    : { chapters: [], chapterItems: new Map(), beats: 0 };
  stats.story = story;
  if (opts.html) stats.html = checkHtml(opts.html, report, ids, story);
  for (const key of ['dossier', 'decisions', 'story']) {
    if (!docs[key]) continue;
    scanCommon(docs[key], rel(paths[key]), report);
    scanPlaceholders(docs[key], rel(paths[key]), report);
  }
  return { report, stats, paths };
}

function summarize(stats) {
  const parts = [`decision log ${stats.decisionLog}`];
  const d = stats.dossier;
  if (d) parts.push(`dossier ${d.items} items, ${d.axes.size} axes, ${d.moments} moment(s), ${d.documents} document/form item(s)`);
  if (stats.decisions) parts.push(`${stats.decisions.directions} directions, ${stats.decisions.decisions} active decisions, budget ${stats.decisions.budget ?? '?'}/3`);
  if (stats.story) parts.push(`${stats.story.chapters.length} chapters (${stats.story.chapters.join(', ') || 'none'}), ${stats.story.beats} beats`);
  if (stats.html) parts.push(`html ${stats.html.pages} page(s), ${stats.html.sections} section(s) in <main>`);
  return parts;
}

function totals(report) {
  let errors = 0;
  let warnings = 0;
  let unresolved = 0;
  for (const g of report.files.values()) {
    errors += g.errors.length;
    warnings += g.warnings.length;
    unresolved += g.warnings.filter((w) => w.message.startsWith(UNRESOLVED)).length;
  }
  return { errors, warnings, unresolved };
}

function printText(result, opts) {
  const { report, stats } = result;
  const t = totals(report);
  console.log(`check-artifacts ${rel(opts.dir)}${opts.html ? ` (html: ${rel(opts.html)})` : ''}`);
  for (const g of report.files.values()) {
    console.log(`\n${g.file}`);
    if (!g.errors.length && !g.warnings.length) console.log('  ok');
    const at = (line) => (line ? `line ${String(line).padEnd(4)}` : 'file     ');
    for (const e of g.errors.sort((a, b) => a.line - b.line)) console.log(`  error  ${at(e.line)} ${e.message}`);
    for (const w of g.warnings.sort((a, b) => a.line - b.line)) console.log(`  warn   ${at(w.line)} ${w.message}`);
  }
  console.log('');
  for (const line of summarize(stats)) console.log(`summary: ${line}`);
  const verdict = t.errors ? 'FAIL' : 'PASS';
  console.log(`result: ${verdict}, ${t.errors} error(s), ${t.warnings} warning(s), of them ${t.unresolved} ${UNRESOLVED}`);
}

function printJson(result) {
  const { report, stats } = result;
  const t = totals(report);
  const files = [...report.files.values()].map(({ file, errors, warnings }) => ({ file, errors, warnings }));
  const plain = {
    decisionLog: stats.decisionLog,
    dossier: stats.dossier && { items: stats.dossier.items, ids: [...stats.dossier.ids], axes: [...stats.dossier.axes], moments: stats.dossier.moments, documents: stats.dossier.documents },
    decisions: stats.decisions,
    story: stats.story && { chapters: stats.story.chapters, beats: stats.story.beats },
    html: stats.html,
  };
  console.log(JSON.stringify({ ok: t.errors === 0, ...t, files, stats: plain }, null, 2));
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(HELP);
    return 0;
  }
  if (opts.error || !opts.dir) {
    console.error(`${opts.error || 'missing <design-dir>'}\n\n${HELP.split('\n').slice(0, 3).join('\n')}\nRun with --help for the checks.`);
    return 2;
  }
  if (!existsSync(opts.dir) || !statSync(opts.dir).isDirectory()) {
    console.error(`design folder not found: ${opts.dir}`);
    return 2;
  }
  const result = run(opts);
  if (opts.json) printJson(result);
  else printText(result, opts);
  return totals(result.report).errors ? 1 : 0;
}

process.exitCode = main();
