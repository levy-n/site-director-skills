#!/usr/bin/env node
// find-media: searches free, licence-checked images and video of the client's world for site-director.
// Writes candidates.json and a contact sheet (index.html) into --out, and downloads only the ids passed
// to --download, adding one row per file to the project's media ledger (design/media-ledger.rtl.md).
// Node 20+, no dependencies. Exit 0 = ok, 1 = no results or a source error, 2 = usage error.
//
// Ideas taken from taste-skill's scripts/assets.mjs by Leonxlnx (MIT License, Copyright (c) 2026
// Leonxlnx): the open-collection source list, licence normalisation into one code set, picking a web
// rendition of a Commons video, a word filter for the museums' loose search, short clips first.
// Small helpers are adapted from it (the stop-word list, queryWords, onSubject, the VALUED/FLAGS
// argument tables); the rest is new code. API rules verified 2026-10-15 are summarised in
// references/media-sourcing.md.
// The three banned dash characters appear here only as code points, so the dash linter passes.

import { readFileSync, writeFileSync, existsSync, mkdirSync, createWriteStream, renameSync, unlinkSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const VERSION = '1.0.0';
const SCRIPT = fileURLToPath(import.meta.url);
const TEMPLATE = join(dirname(SCRIPT), '..', 'assets', 'templates', 'media-ledger.template.rtl.md');
// Wikimedia blocks generic agents; its policy asks for a tool name, a version and a contact.
const CONTACT = String(process.env.FIND_MEDIA_CONTACT || 'https://mediawave.co.il').replace(/[^\x20-\x7e]/g, '').slice(0, 120);
const UA = `site-director-find-media/${VERSION} (+${CONTACT}; MediaWave site-director skill) node/${process.versions.node}`;
const DAY = 24 * 60 * 60 * 1000;
const MB = 1024 * 1024;
const BANNED = new RegExp(`[${String.fromCharCode(0x2013, 0x2014, 0x05be)}]`, 'g');

// gap = minimum ms between two requests to one source (sequential, polite; Openverse allows 20/min
// anonymously, the Art Institute asks for about one request per second). The Met's API documents 80
// requests per second, but its CDN refused about 90 uncached requests in 3 minutes with HTTP 403 in
// testing (2026-10-15), so it gets one request per second too.
// timeout = ms to wait for an answer (default 20 s); timeoutRetries = repeats after a timeout. Openverse
// took 10-12 s for fresh queries and over 20 s for some under load (2026-10-15); in those tests a
// repeat a few seconds later answered within a second.
const SOURCES = {
  openverse: { name: 'Openverse', home: 'https://openverse.org', types: ['image'], gap: 3200, timeout: 40000, timeoutRetries: 1 },
  wikimedia: { name: 'Wikimedia Commons', home: 'https://commons.wikimedia.org', types: ['image', 'video'], gap: 600 },
  artic: { name: 'Art Institute of Chicago', home: 'https://www.artic.edu', types: ['image'], gap: 1100 },
  met: { name: 'The Met', home: 'https://www.metmuseum.org', types: ['image'], gap: 1000 },
  pexels: { name: 'Pexels', home: 'https://www.pexels.com', types: ['image', 'video'], env: 'PEXELS_API_KEY', gap: 600 },
  pixabay: { name: 'Pixabay', home: 'https://pixabay.com', types: ['image', 'video'], env: 'PIXABAY_API_KEY', gap: 800 },
  nasa: { name: 'NASA Image and Video Library', home: 'https://images.nasa.gov', types: ['image', 'video'], gap: 300 },
};
const DEFAULT_SOURCES = ['openverse', 'wikimedia', 'artic', 'met', 'pexels', 'pixabay'];

const HELP = `find-media: search free, licence-checked images and video of the client's world.

  node find-media.mjs --q "<terms>" [--q "<terms>" ...] [options]
  node find-media.mjs --download <id>[=W03],<id>... [--out <dir>] [--ledger <file>]

Search
  --q <terms>          English search terms, repeatable (one dossier item per run works best)
  --type image|video   default image
  --sources <list>     comma separated: openverse, wikimedia, artic, met, pexels, pixabay, nasa
                       default openverse,wikimedia,artic,met,pexels,pixabay (those with the type)
  --per <n>            candidates kept per source and query, 1-30, default 12
  --page <n>           result page, default 1; page 2 and later skip the most obvious picks
  --min-width <px>     drop smaller files, default 1000 for images, 960 for video
  --max-width <px>     web size fetched where the source can resize, default 1920
  --max-mb <n>         video over this size is flagged and never downloaded, default 25
  --item <W id>        the dossier item this search serves (W01-W30); carried into the ledger
  --out <dir>          default design/media/candidates (candidates.json, index.html, .cache/)
  --fresh              forget earlier candidates in --out
  --no-cache           ignore the 24 h response cache

Download (only the ids Nati approved)
  --download <ids>     comma separated ids from candidates.json; "id=W03" sets the dossier item
  --ledger <file>      default design/media-ledger.rtl.md, created from the template if missing
  --allow-needs-check  also download candidates whose status is "needs-check"

Keys: pexels and pixabay run only when PEXELS_API_KEY or PIXABAY_API_KEY is set; otherwise they
are skipped with a message. Keys are never printed or written to disk.
Licences: non-commercial (NC) licences are dropped. No-derivatives (ND), unknown licences, US-only
public domain, files with named restrictions and Commons licences not yet confirmed (review or
deletion categories) stay as "needs-check". Indexes such as Openverse do
not verify licences: the source page is the authority, and --download checks it again before saving.
Run from the project root. Nothing is downloaded without --download.

Exit code: 0 ok, 1 no results or a source error, 2 usage error.`;

class UsageError extends Error {}
class SourceError extends Error {}

// ---------- arguments ----------

const VALUED = { '--q': 'q', '--type': 'type', '--sources': 'sources', '--per': 'per', '--page': 'page', '--min-width': 'minWidth', '--max-width': 'maxWidth', '--max-mb': 'maxMb', '--item': 'item', '--out': 'out', '--ledger': 'ledger', '--download': 'download' };
const FLAGS = { '--fresh': 'fresh', '--no-cache': 'noCache', '--allow-needs-check': 'allowNeedsCheck', '--help': 'help', '-h': 'help' };

export function parseArgs(argv) {
  const o = { q: [], type: 'image', sources: null, per: '12', page: '1', minWidth: null, maxWidth: '1920', maxMb: '25', item: null, out: 'design/media/candidates', ledger: 'design/media-ledger.rtl.md', download: null, fresh: false, noCache: false, allowNeedsCheck: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i];
    let v;
    const eq = a.indexOf('=');
    if (a.startsWith('--') && eq > 0) { v = a.slice(eq + 1); a = a.slice(0, eq); }
    if (FLAGS[a] && v === undefined) { o[FLAGS[a]] = true; continue; }
    const key = VALUED[a];
    if (!key) throw new UsageError(`unknown argument "${a}"`);
    if (v === undefined) {
      v = argv[++i];
      if (v !== undefined && v.startsWith('--')) throw new UsageError(`${a} needs a value`);
    }
    if (v === undefined || String(v).trim() === '') throw new UsageError(`${a} needs a value`);
    if (key === 'q') o.q.push(String(v).trim());
    else o[key] = String(v).trim();
  }
  return validate(o);
}

function int(name, value, min, max) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) throw new UsageError(`${name} must be a whole number from ${min} to ${max}`);
  return n;
}

function validate(o) {
  if (o.help) return o;
  if (!['image', 'video'].includes(o.type)) throw new UsageError('--type is image or video');
  const v = { ...o, per: int('--per', o.per, 1, 30), page: int('--page', o.page, 1, 50), maxWidth: int('--max-width', o.maxWidth, 400, 4000), maxMb: int('--max-mb', o.maxMb, 1, 500) };
  v.minWidth = o.minWidth === null ? (o.type === 'video' ? 960 : 1000) : int('--min-width', o.minWidth, 0, 8000);
  if (o.item !== null && !/^W\d{2}$/.test(o.item)) throw new UsageError('--item is a dossier id such as W03');
  v.explicitSources = o.sources !== null;
  const list = o.sources === null ? DEFAULT_SOURCES : o.sources.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
  const unknown = list.filter((s) => !SOURCES[s]);
  if (unknown.length || !list.length) throw new UsageError(`unknown source "${unknown.join(', ') || o.sources}"; sources: ${Object.keys(SOURCES).join(', ')}`);
  v.sources = [...new Set(list)];
  if (o.download !== null) v.download = parseDownloadList(o.download);
  if (o.q.some((q) => q.length > 100)) throw new UsageError('--q terms must be 100 characters or fewer');
  return v;
}

function parseDownloadList(text) {
  const list = text.split(',').map((s) => s.trim()).filter(Boolean).map((s) => {
    const [id, item = null] = s.split('=');
    if (!/^[a-z]+-[A-Za-z0-9._-]+$/.test(id)) throw new UsageError(`"${id}" is not an id from candidates.json`);
    if (item !== null && !/^W\d{2}$/.test(item)) throw new UsageError(`"${item}" is not a dossier id such as W03`);
    return { id, item };
  });
  if (!list.length) throw new UsageError('--download needs at least one id');
  return list;
}

// ---------- text ----------

export function tidy(v) {
  if (v === undefined || v === null) return '';
  return String(v)
    .replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[nm]dash;/g, '-')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => (Number(n) > 31 && Number(n) < 0x110000 ? String.fromCodePoint(Number(n)) : ' '))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => (parseInt(h, 16) > 31 && parseInt(h, 16) < 0x110000 ? String.fromCodePoint(parseInt(h, 16)) : ' '))
    .replace(/&amp;/g, '&')
    .replace(BANNED, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP = new Set(['a', 'an', 'the', 'of', 'in', 'on', 'at', 'and', 'or', 'for', 'with', 'from', 'to', 'by']);
const fold = (s) => String(s).toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '');

const queryWords = (q) => fold(q).split(/[^\p{L}\p{N}]+/u).filter((w) => w && !STOP.has(w));
const reEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Whole words only ("order" must not match "border" or "recorder"), with a plural either way. A word
// of six letters or more may also end a compound ("cassette" in "videocassette").
function hasWord(hay, w) {
  const forms = [w];
  if (w.length > 4 && w.endsWith('es')) forms.push(w.slice(0, -2), w.slice(0, -1));
  else if (w.length > 3 && w.endsWith('s')) forms.push(w.slice(0, -1));
  return forms.some((f) => new RegExp(`${f.length >= 6 ? '' : '(?:^|[^\\p{L}\\p{N}])'}${reEscape(f)}(?:s|es)?(?![\\p{L}\\p{N}])`, 'u').test(hay));
}

// Openverse, Commons, the museums and NASA match words anywhere (tags, transcripts, page text). Keep a
// record only when its own fields hold the query words (all of them, or all but one of three or more)
// and at least one of them sits in a strong field (name, title, tags, categories), not only in a long
// description where "order" and "slip" can turn up by chance.
export function onSubject(query, strong, weak = '') {
  const want = queryWords(query);
  if (!want.length) return true;
  const hay = `${fold(strong)} ${fold(weak)}`;
  const hits = want.filter((w) => hasWord(hay, w)).length;
  if (hits < (want.length >= 3 ? want.length - 1 : want.length)) return false;
  const title = fold(strong);
  return want.some((w) => hasWord(title, w));
}

const num = (n) => (Number.isFinite(Number(n)) && Number(n) > 0 ? Math.round(Number(n)) : null);
const https = (u) => (u && /^https?:\/\//i.test(String(u)) ? String(u).replace(/^http:/i, 'https:') : null);
const noQuery = (u) => (u ? String(u).split('?')[0] : null);
const clock = (s) => (s ? `${Math.floor(Math.round(s) / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}` : '?');
const size = (b) => (b ? (b >= MB ? `${(b / MB).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`) : 'size unknown');
const rel = (p) => relative(process.cwd(), p).split('\\').join('/') || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- licences ----------

const NC = { label: 'CC BY-NC', commercial: false, credit: true };
const LICENCES = {
  cc0: { label: 'CC0 1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/', commercial: true, credit: false },
  pdm: { label: 'Public Domain Mark 1.0', url: 'https://creativecommons.org/publicdomain/mark/1.0/', commercial: true, credit: false },
  pd: { label: 'public domain', commercial: true, credit: false },
  by: { label: 'CC BY', commercial: true, credit: true },
  'by-sa': { label: 'CC BY-SA', commercial: true, credit: true, note: 'Share-alike: an edited version (crop, grade, overlay) must be offered under the same licence; credit it and say what changed.' },
  'by-nd': { label: 'CC BY-ND', commercial: true, credit: true, check: 'No derivatives: treat any crop, grade or overlay as an adaptation; use the file whole and untouched, or skip it.' },
  'sampling+': { label: 'CC Sampling+ 1.0', url: 'https://creativecommons.org/licenses/sampling+/1.0/', commercial: true, credit: true, check: 'Retired Sampling+ licence: read its terms before any use.' },
  'by-nc': NC, 'by-nc-sa': { ...NC, label: 'CC BY-NC-SA' }, 'by-nc-nd': { ...NC, label: 'CC BY-NC-ND' }, 'nc-sampling+': { ...NC, label: 'CC NC-Sampling+' },
  pexels: { label: 'Pexels License', url: 'https://www.pexels.com/license/', commercial: true, credit: false },
  pixabay: { label: 'Pixabay Content License', url: 'https://pixabay.com/service/license-summary/', commercial: true, credit: false },
  other: { label: 'licence on the source page', commercial: false, credit: true, check: 'Licence not recognised: read the source page before any use.' },
};

// One licence record per candidate: status "ok", "needs-check" (kept, never downloaded without
// --allow-needs-check) or "filtered" (forbids commercial use; never kept).
export function licence(code, { version = null, url = null, label = null, check = null, credit = null } = {}) {
  const k = LICENCES[code] ? code : 'other';
  const d = LICENCES[k];
  const isCc = /^(by|nc-)/.test(k);
  // a CC licence link needs its version; without one there is no link and a note says so
  const ccUrl = isCc && version ? `https://creativecommons.org/licenses/${k}/${version}/` : null;
  const out = {
    code: k,
    label: tidy(label) || (isCc && version ? `${d.label} ${version}` : d.label),
    url: https(url) || d.url || ccUrl,
    commercialOk: d.commercial,
    creditRequired: credit === null ? d.credit : Boolean(credit) || d.credit,
    notes: [d.note, d.check, check, isCc && !version && !https(url) && 'Licence version unknown: take it and its link from the source page.'].filter(Boolean),
  };
  out.status = !d.commercial && k !== 'other' ? 'filtered' : d.check || check ? 'needs-check' : 'ok';
  return out;
}

function ccCode(text) {
  const m = String(text).toLowerCase().match(/\b(?:cc[- ])?(by(?:-nc)?(?:-sa|-nd)?)(?:[- ](\d\.\d))?\b/);
  return m ? { code: m[1], version: m[2] || null } : null;
}

// Commons states each file's licence in its extmetadata (License = template code, LicenseShortName = label).
function commonsLicence(meta) {
  const code = meta('License').toLowerCase();
  const short = meta('LicenseShortName');
  const url = meta('LicenseUrl') || null;
  const restrictions = meta('Restrictions');
  // Commons marks files whose licence is not yet confirmed (often imports from YouTube or Flickr) or
  // that are up for deletion with maintenance categories; such a file is not ready to use.
  const unconfirmed = meta('Categories').match(/licen[cs]e review needed|deletion requests?|copyright violations?|possible copyright/i)?.[0];
  const check = [
    restrictions && `Restrictions named on the file page (${restrictions}): personality rights, a trademark or insignia. Read it before use.`,
    unconfirmed && `Commons has not confirmed this file's licence (category "${unconfirmed}"): check the original source first.`,
  ].filter(Boolean).join(' ') || null;
  const credit = meta('AttributionRequired') === 'true';
  if (/^cc0|^cc-zero/.test(code) || /^cc0/i.test(short)) return licence('cc0', { check, credit });
  const cc = code.startsWith('cc-') ? ccCode(code.slice(3).replace(/-(\d)\.(\d)/, ' $1.$2')) : /^cc /i.test(short) ? ccCode(short.slice(3)) : null;
  if (cc) return licence(cc.code, { version: cc.version, url, check, credit });
  if (/^pd-us(?!gov)/.test(code)) return licence('pd', { label: short || 'public domain in the US', check: 'Public domain in the United States only: check the status in Israel on the file page.', credit });
  if (/^pd|public.domain/.test(code) || /public domain/i.test(short)) return licence('pd', { label: short || 'public domain', check, credit });
  if (/no (known )?(copyright )?restrictions/i.test(short)) return licence('pd', { label: 'no known copyright restrictions', check: 'Not a licence: the archive states it knows of no copyright restrictions. Read the file page.', credit });
  return licence('other', { label: short || code || 'unknown', url, check, credit });
}

// ---------- network ----------

// refused: sources that answered 429 or 403, or timed out twice in a row, in this run; they
// are not asked again until the next run. slow: timeouts in a row per source (reset by an answer).
const NET = { cacheDir: null, last: new Map(), refused: new Map(), slow: new Map() };

function redact(url) {
  try {
    const u = new URL(url);
    for (const k of ['key', 'client_id', 'api_key']) if (u.searchParams.has(k)) u.searchParams.set(k, 'REDACTED');
    return u.toString();
  } catch { return '(url)'; }
}

async function pace(source) {
  const wait = (NET.last.get(source) || 0) + (SOURCES[source]?.gap || 300) - Date.now();
  if (wait > 0) await sleep(wait);
  NET.last.set(source, Date.now());
}

function cachePath(source, url) {
  if (!NET.cacheDir) return null;
  return join(NET.cacheDir, `${source}-${createHash('sha1').update(redact(url)).digest('hex').slice(0, 20)}.json`);
}

// Responses are cached for 24 h (Pixabay requires it; everyone else is spared repeat calls).
// The cache key and the stored URL never contain an API key.
async function getJson(source, url, headers = {}, { fresh = false } = {}) {
  const file = cachePath(source, url);
  if (file && !fresh && existsSync(file)) {
    try {
      const c = JSON.parse(readFileSync(file, 'utf8'));
      if (Date.now() - c.savedAt < DAY) return c.body;
    } catch { /* unreadable cache entry: fetch again */ }
  }
  const body = await fetchJson(source, url, headers);
  if (file) {
    mkdirSync(NET.cacheDir, { recursive: true });
    writeFileSync(file, JSON.stringify({ savedAt: Date.now(), url: redact(url), body }));
  }
  return body;
}

const isTimeout = (e) => e?.name === 'TimeoutError' || e?.name === 'AbortError';

// A final timeout (after any repeat) counts toward "twice in a row", after which the source is left alone.
function timedOut(source, limit, tries) {
  const inRow = (NET.slow.get(source) || 0) + 1;
  NET.slow.set(source, inRow);
  const what = `no answer within ${limit / 1000} s${tries > 1 ? ` (asked ${tries} times)` : ''}`;
  if (inRow >= 2) NET.refused.set(source, `no answer within ${limit / 1000} s, ${inRow} times in a row`);
  return new SourceError(`${what}; run the same command again later (results already found are kept)`);
}

async function fetchJson(source, url, headers, attempt = 1, timeouts = 0) {
  if (NET.refused.has(source)) throw new SourceError(`not asked again in this run after: ${NET.refused.get(source)}`);
  await pace(source);
  const limit = SOURCES[source]?.timeout || 20000;
  let r;
  try {
    r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json', ...headers }, signal: AbortSignal.timeout(limit) });
    if (r.ok) {
      const body = await r.json().catch((e) => { throw isTimeout(e) ? e : new SourceError('the answer was not JSON'); });
      NET.slow.delete(source);
      return body;
    }
  } catch (e) {
    if (e instanceof SourceError) throw e;
    // Connection failures are retried twice with a growing pause. A timeout is repeated only for a
    // source with timeoutRetries (Openverse); elsewhere the service is slow and repeating adds load.
    if (isTimeout(e)) {
      if (timeouts < (SOURCES[source]?.timeoutRetries || 0)) return fetchJson(source, url, headers, attempt, timeouts + 1);
      throw timedOut(source, limit, timeouts + 1);
    }
    if (attempt < 3) { await sleep(1500 * attempt); return fetchJson(source, url, headers, attempt + 1, timeouts); }
    throw new SourceError(`could not connect (${e.cause?.code || e.message})`);
  }
  NET.slow.delete(source);
  if ([500, 502, 503, 504].includes(r.status) && attempt < 3) {
    await r.body?.cancel().catch(() => {});
    await sleep(1500 * attempt);
    return fetchJson(source, url, headers, attempt + 1, timeouts);
  }
  // A refusal stops that source for the rest of the run: asking again only adds load.
  if (r.status === 429 || r.status === 403) {
    await r.body?.cancel().catch(() => {});
    const why = r.status === 429 ? 'rate limited (HTTP 429)' : source === 'met' ? "HTTP 403 from the Met's CDN (too many requests)" : 'HTTP 403: refused (check the API key or the User-Agent)';
    NET.refused.set(source, why);
    throw new SourceError(`${why}; wait a few minutes, then run fewer queries`);
  }
  if (r.status === 401) throw new SourceError('HTTP 401: refused (check the API key)');
  if (r.status === 410) throw new SourceError('HTTP 410: this endpoint was retired; find-media.mjs needs updating');
  await r.body?.cancel().catch(() => {});
  throw new SourceError(`HTTP ${r.status}`);
}

// ---------- candidates ----------

function candidate(source, nativeId, type, f) {
  const lic = f.lic;
  return {
    id: `${source}-${String(nativeId)}`.replace(/[^A-Za-z0-9._-]/g, '-'),
    nativeId: String(nativeId), source, sourceName: SOURCES[source].name, type,
    query: null, item: null,
    title: tidy(f.title) || 'Untitled',
    pageUrl: https(f.pageUrl), fileUrl: https(f.fileUrl),
    thumbUrl: https(f.thumbUrl) || https(f.posterUrl) || (type === 'image' ? https(f.fileUrl) : null), posterUrl: https(f.posterUrl),
    width: num(f.width), height: num(f.height), originalWidth: num(f.originalWidth),
    duration: Number.isFinite(Number(f.duration)) && Number(f.duration) > 0 ? Math.round(Number(f.duration) * 10) / 10 : null,
    bytes: num(f.bytes),
    author: tidy(f.author) || 'unknown', authorUrl: https(f.authorUrl), provider: f.provider ? tidy(f.provider) : null,
    licence: lic.code, licenceLabel: lic.label, licenceUrl: lic.url,
    commercialOk: lic.commercialOk, creditRequired: lic.creditRequired, status: lic.status,
    attribution: f.attribution ? tidy(f.attribution) : '',
    notes: [...lic.notes, ...(f.notes || []), lic.creditRequired && !tidy(f.author) && 'No author in the metadata: take the author or archive name for the credit from the source page.'].filter(Boolean).map(tidy).filter(Boolean),
    downloads: num(f.downloads),
    offSubject: Boolean(f.offSubject), searchedAt: null,
  };
}

// TASL credit (title, author, source, licence) as Creative Commons recommends; one line, plain text.
export function attributionFor(c) {
  if (c.attribution) return c.attribution;
  const by = c.author && c.author !== 'unknown' ? ` by ${c.author}` : '';
  if (c.licence === 'pexels') return `${c.type === 'video' ? 'Video' : 'Photo'}${by} on Pexels (${c.pageUrl})`;
  if (c.licence === 'pixabay') return `${c.type === 'video' ? 'Video' : 'Image'}${by} from Pixabay (${c.pageUrl})`;
  const lic = c.licenceUrl ? `${c.licenceLabel} (${c.licenceUrl})` : c.licenceLabel;
  const via = c.provider && c.source === 'openverse' ? `${c.provider} via Openverse` : c.sourceName;
  return `"${c.title}"${by}, ${lic}, ${via}: ${c.pageUrl}`;
}

// ---------- sources: search and lookup ----------

const OPENVERSE_LICENCES = 'by,by-sa,by-nd,cc0,pdm';

function openverseThumb(r) {
  const url = String(r.url || '');
  if (/^https:\/\/live\.staticflickr\.com\/.+_[a-z]\.jpg$/i.test(url)) return url.replace(/_[a-z]\.jpg$/i, '_z.jpg');
  const wm = url.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[0-9a-f]\/[0-9a-f]{2}\/([^/?]+)$/);
  if (wm) return `https://commons.wikimedia.org/wiki/Special:FilePath/${wm[1]}?width=330`;
  return r.thumbnail || url;
}

// q (the search terms) marks records whose own title and tags miss the words; null skips the check.
export function fromOpenverse(r, q = null) {
  const code = r.license === 'pdm' ? 'pdm' : String(r.license || 'other').toLowerCase();
  const title = tidy(r.title).replace(/^File:/i, '').replace(/\.(jpe?g|png|tiff?|gif|webp)$/i, '');
  return candidate('openverse', r.id, 'image', {
    lic: licence(code, { version: r.license_version, url: r.license_url }),
    title, pageUrl: r.foreign_landing_url || r.detail_url, fileUrl: r.url, thumbUrl: openverseThumb(r),
    width: r.width, height: r.height, author: r.creator, authorUrl: r.creator_url, provider: r.source || r.provider,
    notes: ['Openverse does not verify licences: confirm the licence on the source page.'],
    offSubject: q ? !onSubject(q, [title, ...(r.tags || []).map((t) => t.name)].join(' ')) : false,
  });
}

async function searchOpenverse(q, o) {
  const p = new URLSearchParams({ q, license: OPENVERSE_LICENCES, page_size: String(Math.min(20, o.per + 4)), page: String(o.page), mature: 'false' });
  const j = await getJson('openverse', `https://api.openverse.org/v1/images/?${p}`);
  return (j.results || []).map((r) => fromOpenverse(r, q));
}

const COMMONS_META = 'ObjectName|Artist|LicenseShortName|License|LicenseUrl|AttributionRequired|Restrictions|DateTimeOriginal|ImageDescription|Categories';
const commonsUrl = (params) => `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', ...params })}`;
const commonsProps = (type, width) => ({
  prop: type === 'video' ? 'imageinfo|videoinfo' : 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: String(width),
  iiextmetadatafilter: COMMONS_META, iiextmetadatalanguage: 'en', ...(type === 'video' ? { viprop: 'derivatives' } : {}),
});

// Of the renditions a source offers, the largest whose short side is at most 1080, in WebM or MP4.
function pickRendition(list) {
  const side = (r) => (r.w && r.h ? Math.min(r.w, r.h) : 0);
  const playable = list.filter((r) => r.url && /^video\/(webm|mp4)/.test(r.type || ''));
  const fit = playable.filter((r) => side(r) && side(r) <= 1080).sort((a, b) => side(b) - side(a) || (a.bytes || Infinity) - (b.bytes || Infinity));
  return fit[0] || playable.sort((a, b) => side(a) - side(b))[0] || null;
}

// Commons search also matches transcripts and page text, so the words are checked against the
// file's own name, title and categories (strong) and its description (weak).
export function fromWikimedia(pg, type, q = null) {
  const ii = pg?.imageinfo?.[0];
  if (!ii) return null;
  const meta = (k) => tidy(ii.extmetadata?.[k]?.value);
  const name = String(pg.title || '').replace(/^File:/, '');
  const title = meta('ObjectName').replace(/\s*\b(?:title|label) QS:.*$/s, '') || name.replace(/\.[a-z0-9]+$/i, '');
  const f = {
    lic: commonsLicence(meta), title, pageUrl: ii.descriptionurl, author: meta('Artist'), originalWidth: ii.width,
    offSubject: q ? !onSubject(q, [name, title, meta('Categories')].join(' '), meta('ImageDescription')) : false,
  };
  if (type === 'video') {
    const duration = Number(ii.duration) || null;
    const pick = pickRendition((pg.videoinfo?.[0]?.derivatives || []).map((d) => {
      const original = !/\/transcoded\//.test(d.src || '');
      return { url: noQuery(d.src), type: String(d.type || ''), w: num(d.width), h: num(d.height), bytes: original ? num(ii.size) : d.bandwidth && duration ? Math.round((d.bandwidth * duration) / 8) : null };
    }));
    if (!pick) return null;
    const notes = [/\/transcoded\//.test(pick.url) && 'Size estimated from the bit rate.', /opus|vorbis|mp4a|aac/i.test(pick.type) && 'Carries an audio track: encode without it (-an).'].filter(Boolean);
    return candidate('wikimedia', pg.pageid, 'video', { ...f, fileUrl: pick.url, width: pick.w, height: pick.h, bytes: pick.bytes, duration, posterUrl: noQuery(ii.thumburl), notes });
  }
  const resized = ii.thumburl && ii.thumbwidth && ii.thumbwidth < ii.width;
  return candidate('wikimedia', pg.pageid, 'image', {
    ...f,
    fileUrl: noQuery(resized ? ii.thumburl : ii.url), width: resized ? ii.thumbwidth : ii.width, height: resized ? ii.thumbheight : ii.height,
    thumbUrl: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name.replace(/ /g, '_'))}?width=330`,
  });
}

async function searchWikimedia(q, o) {
  const limit = Math.min(40, o.per * 2);
  const filter = o.type === 'video' ? 'filetype:video' : `filetype:bitmap filew:>${Math.max(0, o.minWidth - 1)}`;
  const params = { generator: 'search', gsrnamespace: '6', gsrsearch: `${q} ${filter}`, gsrlimit: String(limit), gsroffset: String((o.page - 1) * limit), ...commonsProps(o.type, o.type === 'video' ? 640 : o.maxWidth) };
  const j = await getJson('wikimedia', commonsUrl(params));
  if (j.error) throw new SourceError(tidy(j.error.info) || 'the search failed');
  const pages = (j.query?.pages || []).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  return pages.map((pg) => fromWikimedia(pg, o.type, q)).filter(Boolean);
}

const ARTIC_FIELDS = ['id', 'title', 'artist_title', 'date_display', 'image_id', 'thumbnail', 'medium_display', 'artwork_type_title', 'term_titles', 'subject_titles', 'classification_titles', 'is_public_domain'];
const ARTIC_MAX = 1686; // the API docs' largest suggested IIIF width for public-domain images

export function fromArtic(d, iiif, q, maxWidth) {
  if (!d?.image_id) return null;
  const W = num(d.thumbnail?.width);
  const H = num(d.thumbnail?.height);
  const w = Math.min(maxWidth, ARTIC_MAX, W || ARTIC_MAX);
  const artist = tidy(d.artist_title) || 'Unknown artist';
  const hay = [d.title, d.medium_display, d.artwork_type_title, ...(d.term_titles || []), ...(d.subject_titles || []), ...(d.classification_titles || [])].join(' ');
  return candidate('artic', d.id, 'image', {
    lic: d.is_public_domain ? licence('cc0') : licence('other', { label: 'not public domain', check: 'Not marked public domain at the museum.' }),
    title: d.title, pageUrl: `https://www.artic.edu/artworks/${d.id}`,
    fileUrl: `${iiif}/${d.image_id}/full/${w},/0/default.jpg`, thumbUrl: `${iiif}/${d.image_id}/full/400,/0/default.jpg`,
    width: w, height: W && H ? Math.round((H * w) / W) : null, originalWidth: W, author: artist,
    attribution: `${artist}. ${tidy(d.title)}, ${(tidy(d.date_display) || 'n.d.').replace(/\.$/, '')}. The Art Institute of Chicago (CC0): https://www.artic.edu/artworks/${d.id}`,
    offSubject: q ? !onSubject(q, hay) : false,
  });
}

// The museum's plain "q" search returns loosely related works first, so the query asks for the words
// in the descriptive fields (all of them; all but one for three words or more).
async function searchArtic(q, o) {
  const limit = Math.min(100, o.per * 3);
  const words = queryWords(q);
  const match = { query: words.join(' ') || q, type: 'cross_fields', operator: 'or', minimum_should_match: String(Math.max(1, words.length >= 3 ? words.length - 1 : words.length)), fields: ['title^3', 'term_titles^2', 'subject_titles^2', 'classification_titles', 'medium_display', 'artwork_type_title'] };
  const params = { query: { bool: { must: [{ multi_match: match }], filter: [{ term: { is_public_domain: true } }, { exists: { field: 'image_id' } }] } }, fields: ARTIC_FIELDS, limit, page: o.page };
  const j = await getJson('artic', `https://api.artic.edu/api/v1/artworks/search?params=${encodeURIComponent(JSON.stringify(params))}`, { 'AIC-User-Agent': UA });
  const iiif = https(j.config?.iiif_url) || 'https://www.artic.edu/iiif/2';
  return (j.data || []).map((d) => fromArtic(d, iiif, q, o.maxWidth)).filter(Boolean);
}

// A Met object that is not public domain usually has no image URL in the API; it is still returned
// (status "filtered") so the search counts it as dropped by licence.
export function fromMet(x, q) {
  if (!x?.objectID || (x.isPublicDomain && !x.primaryImage)) return null;
  const hay = [x.title, x.objectName, x.medium, x.classification, x.culture, x.department, ...(x.tags || []).map((t) => t.term)].join(' ');
  const author = tidy(x.artistDisplayName) || (x.culture ? `${tidy(x.culture)} maker` : 'Unknown maker');
  return candidate('met', x.objectID, 'image', {
    lic: x.isPublicDomain ? licence('cc0', { label: 'Open Access (CC0)' }) : licence('by-nc', { label: 'not Open Access (in copyright or restricted)' }),
    title: x.title || x.objectName, pageUrl: x.objectURL || `https://www.metmuseum.org/art/collection/search/${x.objectID}`,
    fileUrl: x.primaryImage ? encodeURI(x.primaryImage).replace(/%25([0-9a-f]{2})/gi, '%$1') : null, thumbUrl: x.primaryImageSmall ? encodeURI(x.primaryImageSmall).replace(/%25([0-9a-f]{2})/gi, '%$1') : null,
    author, attribution: `${tidy(x.title || x.objectName)}, ${author}, ${(tidy(x.objectDate) || 'n.d.').replace(/\.$/, '')}. The Metropolitan Museum of Art, Open Access (CC0): ${x.objectURL || ''}`,
    notes: ['Pixel size unknown until downloaded (the API does not report it).'],
    offSubject: q ? !onSubject(q, hay) : false,
  });
}

// The search returns ids only, so every id costs one object request: at most per x 2 per query.
async function searchMet(q, o) {
  const limit = Math.min(60, o.per * 2);
  const p = new URLSearchParams({ q, hasImages: 'true', limit: String(limit), offset: String((o.page - 1) * limit) });
  const s = await getJson('met', `https://collectionapi.metmuseum.org/public/collection/v1.1/search?${p}`);
  const rows = [];
  for (const id of (s.objectIDs || []).slice(0, limit)) {
    if (rows.filter((c) => c.status !== 'filtered' && !c.offSubject).length >= o.per) break;
    let x = null;
    try {
      x = await getJson('met', `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
    } catch (e) {
      // one missing object is skipped; a refusal ends the source, keeping what was read so far
      if (!NET.refused.has('met')) continue;
      if (!rows.length) throw e;
      rows.stoppedEarly = e.message;
      break;
    }
    const c = fromMet(x, q);
    if (c) rows.push(c);
  }
  return rows;
}

function pexelsVideoFile(files) {
  const mp4 = (files || []).filter((f) => f.link && /mp4/.test(f.file_type || '') && f.width && f.height);
  const fit = mp4.filter((f) => Math.min(f.width, f.height) <= 1080).sort((a, b) => b.width * b.height - a.width * a.height);
  return fit[0] || mp4.sort((a, b) => a.width * a.height - b.width * b.height)[0] || null;
}

// Pexels videos carry no title; the page URL's slug ("/video/kneading-dough-1234567/") describes them.
const pexelsSlug = (url) => String(url || '').match(/\/(?:photo|video)\/([a-z0-9-]+?)-?\d+\/?$/i)?.[1]?.replace(/-/g, ' ') || '';

export function fromPexels(x, type) {
  const notes = ['Pexels License: no sale of unaltered copies, no implied endorsement by people or brands shown, no offensive use of identifiable people.'];
  const base = { lic: licence('pexels'), pageUrl: x.url, author: type === 'video' ? x.user?.name : x.photographer, authorUrl: type === 'video' ? x.user?.url : x.photographer_url, notes };
  if (type === 'video') {
    const f = pexelsVideoFile(x.video_files);
    if (!f) return null;
    return candidate('pexels', x.id, 'video', { ...base, title: pexelsSlug(x.url) || `Pexels video ${x.id}`, fileUrl: f.link, width: f.width, height: f.height, duration: x.duration, posterUrl: x.image, thumbUrl: x.image, originalWidth: x.width });
  }
  return candidate('pexels', x.id, 'image', { ...base, title: x.alt || pexelsSlug(x.url) || `Pexels photo ${x.id}`, fileUrl: x.src?.original, thumbUrl: x.src?.medium, width: x.width, height: x.height });
}

async function searchPexels(q, o, key) {
  const p = new URLSearchParams({ query: q, per_page: String(Math.min(80, o.per + 4)), page: String(o.page) });
  const j = await getJson('pexels', `https://api.pexels.com/v1/${o.type === 'video' ? 'videos/' : ''}search?${p}`, { Authorization: key });
  return ((o.type === 'video' ? j.videos : j.photos) || []).map((x) => fromPexels(x, o.type)).filter(Boolean);
}

export function fromPixabay(x, type) {
  const notes = ['Pixabay Content License: no standalone sale or redistribution, no implied endorsement, brands in frame not for commercial use.'];
  if (x.downloads >= 50000) notes.push(`Widely used (${x.downloads} downloads): likely seen on other sites.`);
  const base = { lic: licence('pixabay'), title: x.tags, pageUrl: x.pageURL, author: x.user, authorUrl: x.user && x.user_id ? `https://pixabay.com/users/${x.user}-${x.user_id}/` : null, downloads: x.downloads, notes };
  if (type === 'video') {
    const v = x.videos || {};
    const pick = [v.medium, v.small, v.large, v.tiny].find((r) => r?.url && r.width && Math.min(r.width, r.height) <= 1080) || v.small;
    if (!pick?.url) return null;
    return candidate('pixabay', x.id, 'video', { ...base, fileUrl: pick.url, width: pick.width, height: pick.height, bytes: pick.size, duration: x.duration, posterUrl: pick.thumbnail, thumbUrl: pick.thumbnail });
  }
  const scale = Math.min(1, 1280 / Math.max(x.imageWidth || 1, x.imageHeight || 1));
  notes.push('API files are at most 1280 px on the long side: half-width use, not a full-bleed hero.');
  return candidate('pixabay', x.id, 'image', { ...base, fileUrl: x.largeImageURL, thumbUrl: x.webformatURL, width: (x.imageWidth || 0) * scale, height: (x.imageHeight || 0) * scale, originalWidth: x.imageWidth });
}

async function searchPixabay(q, o, key) {
  const p = new URLSearchParams({ key, q, per_page: String(Math.max(3, Math.min(200, o.per + 4))), page: String(o.page), safesearch: 'true' });
  p.set(o.type === 'video' ? 'video_type' : 'image_type', o.type === 'video' ? 'film' : 'photo');
  const j = await getJson('pixabay', `https://pixabay.com/api/${o.type === 'video' ? 'videos/' : ''}?${p}`);
  return (j.hits || []).map((x) => fromPixabay(x, o.type)).filter(Boolean);
}

const NASA_NOTE = 'NASA: no NASA insignia or logos, no implied endorsement, no identifiable astronauts or employees in promotion; third-party credits in the description need their owner.';

export function fromNasa(it, q, type, files = null) {
  const d = it?.data?.[0];
  if (!d?.nasa_id) return null;
  const credit = String(d.description || '').match(/(?:credit|image courtesy)[:\s]+([^.\n]{2,80})/i)?.[1] || '';
  const thirdParty = (credit && !/nasa/i.test(credit)) || /©|copyright/i.test(d.description || '');
  const base = {
    lic: licence('pd', { label: 'public domain (NASA)', url: 'https://www.nasa.gov/nasa-brand-center/images-and-media/', check: thirdParty ? `Credit names a third party (${tidy(credit) || 'copyright notice'}): permission from that owner is needed.` : null }),
    title: d.title, pageUrl: `https://images.nasa.gov/details/${encodeURIComponent(d.nasa_id)}`, author: d.photographer || d.secondary_creator || `NASA${d.center ? ` ${d.center}` : ''}`,
    notes: [NASA_NOTE], offSubject: q ? !onSubject(q, [d.title, ...(d.keywords || [])].join(' '), d.description) : false,
  };
  const enc = (u) => (u ? encodeURI(String(u)).replace(/%25([0-9a-f]{2})/gi, '%$1') : null);
  const preview = enc((it.links || []).find((l) => l.rel === 'preview')?.href);
  if (type === 'video') {
    const pick = (files || []).find((f) => /~medium\.mp4$/.test(f)) || (files || []).find((f) => /~small\.mp4$/.test(f));
    return candidate('nasa', d.nasa_id, 'video', { ...base, fileUrl: enc(pick), posterUrl: preview, thumbUrl: preview, notes: [...base.notes, 'Size and length unknown until downloaded.'] });
  }
  // the ~large rendition (about 1920 px) is the web file; the ~orig file can be tens of megapixels
  const images = (it.links || []).filter((l) => l.render === 'image' && l.width);
  const largest = images.find((l) => /~large\.jpg$/i.test(l.href || '')) || images.sort((a, b) => b.width - a.width)[0];
  return candidate('nasa', d.nasa_id, 'image', { ...base, fileUrl: enc(largest?.href), width: largest?.width, height: largest?.height, thumbUrl: preview });
}

async function searchNasa(q, o) {
  const p = new URLSearchParams({ q, media_type: o.type, page_size: String(Math.min(100, o.per * 2)), page: String(o.page) });
  const j = await getJson('nasa', `https://images-api.nasa.gov/search?${p}`);
  const rows = [];
  for (const it of j.collection?.items || []) {
    let c = fromNasa(it, q, o.type, []);
    if (c && o.type === 'video' && !c.offSubject && rows.filter((r) => !r.offSubject).length < o.per) {
      const files = await getJson('nasa', encodeURI(String(it.href)).replace(/^http:/, 'https:')).catch(() => []);
      c = fromNasa(it, q, o.type, Array.isArray(files) ? files : []);
    }
    if (c && (c.fileUrl || c.offSubject)) rows.push(c);
  }
  return rows;
}

const RUNNERS = { openverse: searchOpenverse, wikimedia: searchWikimedia, artic: searchArtic, met: searchMet, pexels: searchPexels, pixabay: searchPixabay, nasa: searchNasa };

// Before a download, read the record again from the source (never from the cache): the licence on
// the source page is the authority, and it can change after the search.
const LOOKUPS = {
  openverse: async (c) => fromOpenverse(await getJson('openverse', `https://api.openverse.org/v1/images/${encodeURIComponent(c.nativeId)}/`, {}, { fresh: true })),
  wikimedia: async (c, o) => {
    const j = await getJson('wikimedia', commonsUrl({ pageids: c.nativeId, ...commonsProps(c.type, c.type === 'video' ? 1280 : o.maxWidth) }), {}, { fresh: true });
    return fromWikimedia(j.query?.pages?.[0], c.type);
  },
  artic: async (c, o) => {
    const j = await getJson('artic', `https://api.artic.edu/api/v1/artworks/${encodeURIComponent(c.nativeId)}?fields=${ARTIC_FIELDS.join(',')}`, { 'AIC-User-Agent': UA }, { fresh: true });
    return fromArtic(j.data, https(j.config?.iiif_url) || 'https://www.artic.edu/iiif/2', null, o.maxWidth);
  },
  met: async (c) => fromMet(await getJson('met', `https://collectionapi.metmuseum.org/public/collection/v1/objects/${encodeURIComponent(c.nativeId)}`, {}, { fresh: true }), null),
  pexels: async (c, o, key) => fromPexels(await getJson('pexels', `https://api.pexels.com/v1/${c.type === 'video' ? 'videos/videos' : 'photos'}/${encodeURIComponent(c.nativeId)}`, { Authorization: key }, { fresh: true }), c.type),
  pixabay: async (c, o, key) => {
    const j = await getJson('pixabay', `https://pixabay.com/api/${c.type === 'video' ? 'videos/' : ''}?${new URLSearchParams({ key, id: c.nativeId })}`);
    return j.hits?.[0] ? fromPixabay(j.hits[0], c.type) : null;
  },
};

// ---------- search run ----------

function planSources(o) {
  return o.sources.map((key) => {
    const s = SOURCES[key];
    if (!s.types.includes(o.type)) return { key, skip: o.explicitSources ? `no ${o.type} in this source` : null, silent: !o.explicitSources };
    if (s.env && !process.env[s.env]) return { key, skip: `set ${s.env} to search it` };
    return { key, skip: null };
  }).filter((p) => !p.silent);
}

function finish(c, q, o, now) {
  const { offSubject, ...rest } = c;
  const video = rest.type === 'video';
  const extra = [
    video && rest.duration > 60 && `Long (${clock(rest.duration)}): a loop wants 5-15 s; trim it or skip it.`,
    video && rest.bytes > o.maxMb * MB && `Over ${o.maxMb} MB (${size(rest.bytes)}): --download refuses it.`,
    rest.originalWidth > rest.width && rest.width && `Downloads at ${rest.width} px wide; the original is ${rest.originalWidth} px.`,
  ].filter(Boolean);
  const out = { ...rest, query: q, item: o.item, searchedAt: now, notes: [...rest.notes, ...extra] };
  return { ...out, attribution: attributionFor(out) };
}

const clipRank = (c) => (!c.duration ? 2 : c.duration <= 30 ? 0 : c.duration <= 90 ? 1 : 3);

const fileKey = (name) => {
  let s = String(name);
  try { s = decodeURIComponent(s); } catch { /* keep the raw name */ }
  return `file:${s.replace(/ /g, '_').toLowerCase()}`;
};

// Keys that name one Commons file in both Commons' own records and Openverse's copies of them: the
// page id (Openverse links a Commons file as index.php?curid=<page id>) and the file name (from a
// /wiki/File: page or an upload.wikimedia.org file or thumbnail URL).
export function commonsKeys(c) {
  const keys = c.source === 'wikimedia' ? [`page:${c.nativeId}`] : [];
  for (const u of [c.pageUrl, c.fileUrl]) {
    const s = String(u || '');
    const id = s.match(/^https:\/\/commons\.wikimedia\.org\/w\/index\.php\?(?:[^#]*&)?curid=(\d+)/)?.[1];
    if (id) keys.push(`page:${id}`);
    const name = s.match(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:([^?#]+)/)?.[1]
      || s.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?#]+)/)?.[1];
    if (name) keys.push(fileKey(name));
  }
  return [...new Set(keys)];
}

// An Openverse record is a copy of a Commons file that Commons itself returned (in this run or an
// earlier one kept in candidates.json); Commons' own record (better metadata, web-sized file) wins.
export const isCommonsCopy = (c, commons) => c.source === 'openverse' && c.provider === 'wikimedia' && commonsKeys(c).some((k) => commons.has(k));

async function searchOne(key, q, o, seen, now) {
  // Openverse is asked for commercial-use licences only (OPENVERSE_LICENCES), so its NC results are
  // excluded in the request and cannot be counted; the flag says so in the report.
  const stats = { query: q, source: key, raw: 0, kept: 0, filteredLicence: 0, filteredInRequest: key === 'openverse', needsCheck: 0, tooSmall: 0, offSubject: 0, duplicate: 0, error: null };
  let rows;
  try {
    const env = SOURCES[key].env;
    rows = await RUNNERS[key](q, o, env ? process.env[env] : undefined);
  } catch (e) {
    stats.error = e instanceof SourceError ? e.message : `failed (${e.message})`;
    return { stats, kept: [] };
  }
  stats.raw = rows.length;
  if (rows.stoppedEarly) stats.error = `stopped early: ${rows.stoppedEarly}`;
  // Every file Commons returned, kept or not: an Openverse copy of it is a duplicate.
  if (key === 'wikimedia' && o.commons) for (const c of rows) for (const k of commonsKeys(c)) o.commons.add(k);
  const kept = [];
  for (const c of rows) {
    const available = Math.max(c.width || 0, c.originalWidth || 0);
    if (o.commons && isCommonsCopy(c, o.commons)) stats.duplicate++;
    else if (c.offSubject) stats.offSubject++;
    else if (c.status === 'filtered') stats.filteredLicence++;
    else if (available && available < o.minWidth) stats.tooSmall++;
    else if (seen.has(c.id)) stats.duplicate++;
    else if (kept.length < o.per) { seen.add(c.id); kept.push(finish(c, q, o, now)); }
  }
  if (o.type === 'video') kept.sort((a, b) => clipRank(a) - clipRank(b));
  stats.kept = kept.length;
  stats.needsCheck = kept.filter((c) => c.status === 'needs-check').length;
  return { stats, kept };
}

function readCandidates(out) {
  const file = join(out, 'candidates.json');
  if (!existsSync(file)) return { runs: [], candidates: [] };
  try {
    const j = JSON.parse(readFileSync(file, 'utf8'));
    return { runs: Array.isArray(j.runs) ? j.runs : [], candidates: Array.isArray(j.candidates) ? j.candidates : [] };
  } catch {
    throw new SourceError(`${rel(file)} is not valid JSON; fix it or run again with --fresh`);
  }
}

function printStats(run) {
  for (const q of run.queries) {
    console.log(`\n"${q}"`);
    for (const s of run.stats.filter((x) => x.query === q)) {
      const name = SOURCES[s.source].name.padEnd(28);
      if (s.error && !s.raw) { console.log(`  ${name} error: ${s.error}`); continue; }
      const extra = [s.filteredLicence && `${s.filteredLicence} dropped (licence)`, s.filteredInRequest && 'NC excluded in the request', s.needsCheck && `${s.needsCheck} needs-check`, s.tooSmall && `${s.tooSmall} too small`, s.offSubject && `${s.offSubject} off subject`, s.duplicate && `${s.duplicate} duplicate`].filter(Boolean);
      console.log(`  ${name} ${s.raw} found, ${s.kept} kept${extra.length ? `, ${extra.join(', ')}` : ''}${s.error ? `; error: ${s.error}` : ''}`);
    }
  }
}

async function runSearch(o) {
  const out = resolve(o.out);
  mkdirSync(out, { recursive: true });
  NET.cacheDir = o.noCache ? null : join(out, '.cache');
  const plan = planSources(o);
  const now = new Date().toISOString();
  console.log(`find-media ${VERSION}: ${o.type} search, ${o.q.length} quer${o.q.length === 1 ? 'y' : 'ies'}${o.item ? `, item ${o.item}` : ''}`);
  for (const p of plan.filter((x) => x.skip)) console.log(`${SOURCES[p.key].name}: skipped (${p.skip})`);
  const searched = plan.filter((p) => !p.skip).map((p) => p.key);
  // Commons goes first, so Openverse's copies of the files it returned are known as duplicates.
  const active = searched.includes('wikimedia') ? ['wikimedia', ...searched.filter((k) => k !== 'wikimedia')] : searched;
  const previous = o.fresh ? { runs: [], candidates: [] } : readCandidates(out);
  const seen = new Set(previous.candidates.map((c) => c.id));
  const commons = new Set(previous.candidates.filter((c) => c.source === 'wikimedia').flatMap(commonsKeys));
  const stats = [];
  const found = [];
  for (const q of o.q) {
    for (const key of active) {
      const r = await searchOne(key, q, { ...o, commons }, seen, now);
      stats.push(r.stats);
      found.push(...r.kept);
    }
  }
  const run = { at: now, type: o.type, item: o.item, page: o.page, queries: o.q, sources: Object.fromEntries(plan.map((p) => [p.key, p.skip ? `skipped: ${p.skip}` : 'searched'])), stats };
  const data = { tool: 'find-media', version: VERSION, updated: now, note: 'Nothing here is downloaded. Thumbnails and file URLs point at the sources; --download fetches approved ids only.', runs: [...previous.runs, run].slice(-30), candidates: [...found, ...previous.candidates] };
  writeFileSync(join(out, 'candidates.json'), `${JSON.stringify(data, null, 1)}\n`);
  writeFileSync(join(out, 'index.html'), contactSheet(data, o));
  printStats(run);
  const errors = stats.filter((s) => s.error).length;
  const needs = found.filter((c) => c.status === 'needs-check').length;
  const known = stats.reduce((n, s) => n + s.duplicate, 0);
  console.log(`\n${found.length} new candidate(s)${needs ? `, ${needs} needs-check` : ''}${!found.length && known ? ' (the results are already in candidates.json)' : ''}${errors ? `, ${errors} source error(s)` : ''}.`);
  console.log(`Contact sheet: ${rel(join(out, 'index.html'))}   Data: ${rel(join(out, 'candidates.json'))}`);
  console.log('Next: choose, then ask Nati once with the list (file, source, licence, size). Only after a yes:');
  console.log(`  node ${quote(SCRIPT)} --download <id>[=W03],<id>${o.out !== 'design/media/candidates' ? ` --out ${quote(o.out)}` : ''}`);
  return errors || (!found.length && !known) ? 1 : 0;
}

// ---------- contact sheet ----------

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const quote = (p) => {
  const s = String(p).split('\\').join('/');
  return /[\s"]/.test(s) ? `"${s.replace(/"/g, '\\"')}"` : s;
};
const safeHref = (u) => esc(https(u) || '#');

function card(c) {
  const dims = c.width && c.height ? `${c.width}x${c.height}` : 'size ?';
  const facts = [c.sourceName + (c.provider && c.source === 'openverse' ? ` / ${c.provider}` : ''), dims, c.type === 'video' ? `${clock(c.duration)}, ${size(c.bytes)}` : null].filter(Boolean);
  const badge = c.status === 'ok' ? 'ok' : 'check';
  return `<figure class="card ${badge}">
<a href="${safeHref(c.pageUrl)}" target="_blank" rel="noopener noreferrer"><img src="${safeHref(c.thumbUrl)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></a>
<figcaption>
<label class="pick"><input type="checkbox" name="pick" value="${esc(c.id)}"> <code dir="ltr">${esc(c.id)}</code></label>
<p class="title" dir="auto">${esc(c.title)}</p>
<p class="meta" dir="ltr">${facts.map(esc).join(' | ')}</p>
<p class="lic"><span class="badge">${badge === 'ok' ? 'תקין' : 'לבדיקה'}</span> <a dir="ltr" href="${safeHref(c.licenceUrl || c.pageUrl)}" target="_blank" rel="noopener noreferrer">${esc(c.licenceLabel)}</a>${c.creditRequired ? ' · קרדיט חובה' : ''}</p>
<p class="meta" dir="auto">${esc(c.author)}${c.item ? ` · ${esc(c.item)}` : ''}${c.type === 'video' ? ' · וידאו' : ''}</p>
${c.notes.length ? `<details><summary>הערות (${c.notes.length})</summary><ul dir="ltr">${c.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></details>` : ''}
</figcaption>
</figure>`;
}

function statsTable(run) {
  if (!run) return '';
  const rows = run.stats.map((s) => `<tr><td dir="ltr">${esc(s.query)}</td><td>${esc(SOURCES[s.source]?.name || s.source)}</td><td>${s.error && !s.raw ? '' : `${s.raw} / ${s.kept}`}${s.error ? ` <span class="err" dir="ltr">${esc(s.error)}</span>` : ''}</td><td>${s.filteredLicence}${s.filteredInRequest ? ' (NC סוננו כבר בבקשה)' : ''}</td><td>${s.needsCheck}</td><td>${s.tooSmall}</td><td>${s.offSubject}</td></tr>`).join('');
  const skipped = Object.entries(run.sources).filter(([, v]) => v !== 'searched').map(([k, v]) => `${SOURCES[k]?.name || k}: ${v}`);
  return `<table><thead><tr><th>חיפוש</th><th>מקור</th><th>נמצאו / נשמרו</th><th>נפסלו (רישיון)</th><th>לבדיקה</th><th>קטנים מדי</th><th>לא בנושא</th></tr></thead><tbody>${rows}</tbody></table>${skipped.length ? `<p class="meta" dir="ltr">${skipped.map(esc).join(' | ')}</p>` : ''}`;
}

const SHEET_CSS = `:root{color-scheme:light dark;--bg:#f6f5f1;--fg:#1c1c1a;--muted:#5b5a55;--line:#d8d6ce;--card:#fff;--ok:#1d6a39;--check:#8a5500;--err:#a3271f}
@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#ecebe6;--muted:#a7a6a0;--line:#34332f;--card:#1d1d1c;--ok:#7fd49b;--check:#f0b65a;--err:#ff8a80}}
*{box-sizing:border-box}body{margin:0;padding:24px 16px 140px;background:var(--bg);color:var(--fg);font:15px/1.6 system-ui,"Segoe UI",Arial,sans-serif}
h1{font-size:1.5rem;margin:0 0 4px}h2{font-size:1.15rem;margin:32px 0 12px}p{margin:0 0 6px}.meta{color:var(--muted);font-size:.85rem}
table{border-collapse:collapse;width:100%;font-size:.85rem;margin:12px 0;display:block;overflow-x:auto}th,td{border:1px solid var(--line);padding:4px 8px;text-align:start;white-space:nowrap}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(240px,100%),1fr));gap:16px}
.card{margin:0;background:var(--card);border:1px solid var(--line);border-radius:8px;overflow:hidden;display:flex;flex-direction:column}
.card img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:var(--line)}
figcaption{padding:10px 12px;display:flex;flex-direction:column;gap:2px;min-width:0}.title{font-weight:600;overflow-wrap:anywhere}
code{font-size:.8rem;overflow-wrap:anywhere}.pick{display:flex;gap:6px;align-items:flex-start;cursor:pointer}
.badge{display:inline-block;padding:0 6px;border-radius:4px;font-size:.8rem;font-weight:600;border:1px solid currentColor}
.ok .badge{color:var(--ok)}.check .badge{color:var(--check)}.err{color:var(--err)}a{color:inherit}
details{font-size:.8rem;color:var(--muted)}ul{margin:4px 0;padding-inline-start:18px}
.bar{position:fixed;inset-inline:0;bottom:0;background:var(--card);border-top:1px solid var(--line);padding:10px 16px}
.bar code{display:block;direction:ltr;text-align:left;overflow-x:auto;white-space:nowrap;padding:4px 0}`;

export function contactSheet(data, o) {
  const groups = new Map();
  for (const c of data.candidates) {
    const k = `${c.query || '-'}|${c.type}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(c);
  }
  const sections = [...groups.entries()].map(([k, list]) => `<h2><bdi dir="ltr">${esc(k.split('|')[0])}</bdi> <span class="meta">(${list[0].type === 'video' ? 'וידאו' : 'תמונות'}, ${list.length})</span></h2>\n<div class="grid">${list.map(card).join('\n')}</div>`).join('\n');
  const base = `node ${quote(SCRIPT)}${o.out !== 'design/media/candidates' ? ` --out ${quote(o.out)}` : ''}`;
  const sourcesUsed = [...new Set(data.candidates.map((c) => c.source))].map((k) => `<a href="${esc(SOURCES[k].home)}" target="_blank" rel="noopener noreferrer">${esc(SOURCES[k].name)}</a>`).join(', ');
  return `<!doctype html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>מועמדי מדיה</title><style>${SHEET_CSS}</style></head>
<body>
<h1>מועמדי מדיה מעולם הלקוח</h1>
<p class="meta">נוצר ב-<bdi dir="ltr">${esc(data.updated)}</bdi> על ידי find-media ${VERSION}. התמונות הממוזערות נטענות מהמקורות לתצוגה מקומית בלבד. שום קובץ לא הורד.</p>
<p class="meta">מקורות: ${sourcesUsed || '-'}.${data.candidates.some((c) => c.source === 'openverse') ? ' חלק מהתמונות נמצאו דרך Openverse, שלא מאמת רישיונות. נעשה באמצעות Openverse, בלי אישור או חסות של Openverse.' : ''} כל כרטיס מקשר לעמוד המקור, ושם הרישיון הקובע.</p>
<p class="meta">חומר שנמצא ברשת לעולם לא מוצג כחומר של הלקוח. "לבדיקה" = רישיון ND, רישיון לא מוכר או הגבלה בעמוד המקור.</p>
<h2>החיפוש האחרון</h2>
${statsTable(data.runs[data.runs.length - 1])}
${sections || '<p>אין מועמדים.</p>'}
<div class="bar"><p class="meta">פקודת הורדה, רק אחרי אישור של נתי:</p><code id="cmd" data-base="${esc(base)}"></code></div>
<script>
const boxes=[...document.querySelectorAll('input[name=pick]')];const cmd=document.getElementById('cmd');
function update(){const ids=boxes.filter(b=>b.checked).map(b=>b.value);cmd.textContent=ids.length?cmd.dataset.base+' --download '+ids.join(','):'סמנו מועמדים כדי לבנות את הפקודה';}
boxes.forEach(b=>b.addEventListener('change',update));update();
</script>
</body>
</html>
`;
}

// ---------- download ----------

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif', 'video/mp4': 'mp4', 'video/webm': 'webm' };

async function saveUrl(url, base, kind, source, capBytes) {
  if (!url) throw new Error('the source gives no file URL');
  await pace(source);
  const headers = { 'User-Agent': UA, Accept: kind === 'video' ? 'video/*' : 'image/*', ...(source === 'artic' ? { 'AIC-User-Agent': UA } : {}) };
  const r = await fetch(url, { headers, signal: AbortSignal.timeout(kind === 'video' ? 600000 : 120000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} from the file server`);
  const type = (r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const ext = TYPES[type];
  if (!ext || !type.startsWith(kind === 'video' ? 'video/' : 'image/')) {
    await r.body?.cancel().catch(() => {});
    throw new Error(`the file is ${type || 'of no stated type'}, not a web ${kind}`);
  }
  const file = `${base}.${ext}`;
  const part = `${file}.part`;
  const outStream = createWriteStream(part);
  let n = 0;
  try {
    for await (const chunk of r.body) {
      n += chunk.length;
      if (n > capBytes) throw new Error(`over the ${size(capBytes)} cap`);
      if (!outStream.write(chunk)) await new Promise((res) => outStream.once('drain', res));
    }
    await new Promise((res, rej) => outStream.end((e) => (e ? rej(e) : res())));
  } catch (e) {
    outStream.destroy();
    try { unlinkSync(part); } catch { /* nothing to remove */ }
    throw e;
  }
  if (!n) { unlinkSync(part); throw new Error('the file was empty'); }
  renameSync(part, file);
  return { file, bytes: n };
}

async function recheck(c, o) {
  const lookup = LOOKUPS[c.source];
  const env = SOURCES[c.source].env;
  if (!lookup || (env && !process.env[env])) return { ...c, notes: [...c.notes, 'Licence not re-checked at download (no lookup for this source or no API key): read the source page.'] };
  const fresh = await lookup(c, o, env ? process.env[env] : undefined);
  if (!fresh || !fresh.fileUrl) throw new Error('the source no longer returns this record or its file');
  return { ...fresh, query: c.query, item: c.item, attribution: attributionFor(fresh) };
}

async function downloadOne(data, want, o, out) {
  const c = data.candidates.find((x) => x.id === want.id);
  if (!c) throw new Error('not in candidates.json');
  const fresh = await recheck(c, o);
  if (fresh.status === 'filtered') throw new Error(`the source now shows ${fresh.licenceLabel}, which forbids commercial use`);
  if (fresh.status === 'needs-check' && !o.allowNeedsCheck) throw new Error('status needs-check: read the source page; pass --allow-needs-check only if Nati approved this file');
  if (fresh.type === 'video' && fresh.bytes && fresh.bytes > o.maxMb * MB) throw new Error(`about ${size(fresh.bytes)}, over --max-mb ${o.maxMb}`);
  const base = join(out, c.id.replace(/[^A-Za-z0-9._-]/g, '-').slice(0, 90));
  const saved = await saveUrl(fresh.fileUrl, base, fresh.type, fresh.source, fresh.type === 'video' ? o.maxMb * MB : 40 * MB);
  let poster = null;
  if (fresh.type === 'video' && fresh.posterUrl) poster = await saveUrl(fresh.posterUrl, `${base}-poster`, 'image', fresh.source, 10 * MB).catch(() => null);
  console.log(`Saved ${rel(saved.file)} (${size(saved.bytes)})${poster ? ` and ${rel(poster.file)}` : ''}`);
  console.log(`  ${fresh.licenceLabel}${fresh.creditRequired ? ', credit required' : ''}: ${fresh.attribution}`);
  for (const n of fresh.notes) console.log(`  note: ${n}`);
  return { ...fresh, item: want.item || c.item, date: new Date().toISOString().slice(0, 10), localPath: [rel(saved.file), poster && rel(poster.file)].filter(Boolean).join(' + ') };
}

async function runDownload(o) {
  const out = resolve(o.out);
  const data = readCandidates(out);
  if (!data.candidates.length) {
    console.error(`find-media: no candidates in ${rel(join(out, 'candidates.json'))}; run a search first`);
    return 1;
  }
  NET.cacheDir = join(out, '.cache');
  const rows = [];
  let failed = 0;
  for (const want of o.download) {
    try { rows.push(await downloadOne(data, want, o, out)); } catch (e) { failed++; console.error(`${want.id}: not downloaded (${e.message})`); }
  }
  if (rows.length) {
    const ledger = resolve(o.ledger);
    const added = appendLedger(ledger, rows);
    console.log(`Ledger: ${added} row(s) added to ${rel(ledger)}. Fill "עריכות שבוצעו" after cropping, grading or encoding.`);
  }
  return failed ? 1 : 0;
}

// ---------- ledger ----------

const LEDGER_COLUMNS = {
  'מזהה': (r) => r.id,
  'פריט בתיק העולם': (r) => r.item || '[לבירור]',
  'סוג': (r) => (r.type === 'video' ? 'וידאו' : 'תמונה'),
  'עמוד המקור': (r) => r.pageUrl || '',
  'יוצר': (r) => r.author,
  'רישיון': (r) => `${r.licenceLabel}${r.licenceUrl ? ` ${r.licenceUrl}` : ''}${r.status === 'needs-check' ? ' (לבדיקה)' : ''}`,
  'טקסט קרדיט': (r) => r.attribution,
  'תאריך הורדה': (r) => r.date,
  'נתיב מקומי': (r) => r.localPath,
  'עריכות שבוצעו': () => 'עדיין לא נערך',
};
const FALLBACK_LEDGER = `# יומן מדיה\n\n| ${Object.keys(LEDGER_COLUMNS).join(' | ')} |\n|${Object.keys(LEDGER_COLUMNS).map(() => '---').join('|')}|\n`;
const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((s) => s.trim());
const cell = (v) => tidy(v).replace(/\|/g, '/');

// Adds rows under the ledger table, matching columns by their Hebrew header names, so the columns
// may be reordered in the file. Creates the ledger from the template when it does not exist.
export function appendLedger(path, rows) {
  if (!existsSync(path)) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, existsSync(TEMPLATE) ? readFileSync(TEMPLATE, 'utf8') : FALLBACK_LEDGER);
  }
  const text = readFileSync(path, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  const head = lines.findIndex((l) => l.trim().startsWith('|') && cells(l).includes('מזהה') && cells(l).includes('נתיב מקומי'));
  if (head < 0) throw new Error(`no ledger table (a header row with "מזהה" and "נתיב מקומי") in ${rel(path)}`);
  const headers = cells(lines[head]);
  let end = head + 2;
  while (end < lines.length && lines[end].trim().startsWith('|')) end++;
  const existing = new Set(lines.slice(head + 2, end).map((l) => cells(l).join('|')));
  const fresh = rows.map((r) => headers.map((h) => cell(LEDGER_COLUMNS[h] ? LEDGER_COLUMNS[h](r) : ''))).filter((c) => !existing.has(c.join('|')));
  lines.splice(end, 0, ...fresh.map((c) => `| ${c.join(' | ')} |`));
  writeFileSync(path, lines.join(eol));
  return fresh.length;
}

// ---------- main ----------

async function main() {
  let o;
  try {
    o = parseArgs(process.argv.slice(2));
  } catch (e) {
    if (e instanceof UsageError) { console.error(`find-media: ${e.message}\n\n${HELP}`); return 2; }
    throw e;
  }
  if (o.help) { console.log(HELP); return 0; }
  try {
    if (o.download) return await runDownload(o);
    if (!o.q.length) { console.error(`find-media: give at least one --q, or --download\n\n${HELP}`); return 2; }
    return await runSearch(o);
  } catch (e) {
    console.error(`find-media: ${e.message}`);
    return 1;
  }
}

const invoked = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href.toLowerCase() === import.meta.url.toLowerCase();
if (invoked) main().then((code) => { process.exitCode = code; });
