#!/usr/bin/env node
// serve - zero-dependency static server for filming/auditing a local build (dist/, out/, a folder of HTML).
//
//   node serve.mjs <dir> [--port 4173] [--spa]
//
// --spa falls back to index.html for unknown paths (client-side routers). Responses are gzip'd when
// the client asks - uncompressed serving makes performance numbers look seconds worse than reality.
// Flags and the folder can come in any order. A bad request gets a 4xx answer; it never stops the server.

import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { createGzip } from 'node:zlib';

// --help: print the leading comment block of this file and exit
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  const { readFileSync: readSelf } = await import('node:fs');
  const header = [];
  for (const l of readSelf(new URL(import.meta.url), 'utf8').split(/\r?\n/)) {
    if (l.startsWith('#!')) continue;
    if (!l.startsWith('//')) break;
    header.push(l.replace(/^\/\/ ?/, ''));
  }
  console.log(header.join('\n'));
  process.exit(0);
}

const args = process.argv.slice(2);
const VALUE_FLAGS = new Set(['--port']);
// The folder is the first argument that is neither a flag nor the value after a value flag.
const dirArg = args.find((a, i) => !a.startsWith('--') && !VALUE_FLAGS.has(args[i - 1]));
const ROOT = resolve(dirArg || '.');
const portIdx = args.indexOf('--port');
const PORT = portIdx === -1 ? 4173 : Number(args[portIdx + 1]);
const SPA = args.includes('--spa');

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error(`--port needs a number from 1 to 65535, got ${JSON.stringify(args[portIdx + 1])}`);
  process.exit(2);
}
if (!existsSync(ROOT) || !statSync(ROOT).isDirectory()) {
  console.error(`not a folder: ${ROOT}\nusage: node serve.mjs <dir> [--port 4173] [--spa]`);
  process.exit(2);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json', '.glb': 'model/gltf-binary', '.lottie': 'application/zip',
};
const COMPRESSIBLE = /^(text\/|application\/(json|xml|manifest)|image\/svg)/;

async function resolveFile(urlPath) {
  // decodeURIComponent throws URIError on malformed escapes (%E0%A4%A); the handler answers 400.
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^([/\\])+/, '');
  const full = join(ROOT, clean);
  if (!full.startsWith(ROOT + sep) && full !== ROOT) return null; // no path traversal
  for (const candidate of [full, join(full, 'index.html'), `${full}.html`]) {
    try {
      const s = await stat(candidate);
      if (s.isFile()) return { path: candidate, size: s.size };
    } catch { /* try next */ }
  }
  if (SPA) {
    try {
      const s = await stat(join(ROOT, 'index.html'));
      return { path: join(ROOT, 'index.html'), size: s.size };
    } catch { /* fall through */ }
  }
  return null;
}

function send(res, code, text, extra = {}) {
  if (res.headersSent) { res.destroy(); return; }
  res.writeHead(code, { 'content-type': 'text/plain; charset=utf-8', ...extra });
  res.end(text);
}

// Parse one "bytes=a-b" range. Returns { start, end }, 'unsatisfiable', or null (ignore the header).
function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(String(header).trim());
  if (!m || (m[1] === '' && m[2] === '')) return null;
  let start, end;
  if (m[1] === '') { // suffix range: the last N bytes
    const n = Number(m[2]);
    if (n === 0) return 'unsatisfiable';
    start = Math.max(0, size - n);
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start >= size || start > end) return 'unsatisfiable';
  return { start, end };
}

async function handle(req, res) {
  let file;
  try {
    file = await resolveFile(req.url || '/');
  } catch (e) {
    if (e instanceof URIError) { send(res, 400, `400 malformed URL ${req.url}`); return; }
    throw e;
  }
  if (!file) { send(res, 404, `404 ${req.url}`); return; }
  const type = TYPES[extname(file.path).toLowerCase()] || 'application/octet-stream';
  const gzip = COMPRESSIBLE.test(type) && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  const onStreamError = () => { if (res.headersSent) res.destroy(); else send(res, 500, '500 read error'); };
  // Range support keeps <video> seeking (and scroll-scrubbed video) honest.
  const range = !gzip && req.headers.range ? parseRange(req.headers.range, file.size) : null;
  if (range === 'unsatisfiable') {
    send(res, 416, '416 range not satisfiable', { 'content-range': `bytes */${file.size}`, 'accept-ranges': 'bytes' });
    return;
  }
  if (range) {
    const { start, end } = range;
    res.writeHead(206, { 'content-type': type, 'content-range': `bytes ${start}-${end}/${file.size}`, 'accept-ranges': 'bytes', 'content-length': end - start + 1 });
    createReadStream(file.path, { start, end }).on('error', onStreamError).pipe(res);
    return;
  }
  res.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes', 'cache-control': 'no-cache', ...(gzip ? { 'content-encoding': 'gzip', vary: 'accept-encoding' } : { 'content-length': file.size }) });
  const stream = createReadStream(file.path).on('error', onStreamError);
  (gzip ? stream.pipe(createGzip()) : stream).pipe(res);
}

const server = createServer((req, res) => {
  handle(req, res).catch((e) => {
    console.error(`500 ${req.url}: ${e.message}`);
    send(res, 500, '500 server error');
  });
});
server.on('error', (e) => {
  console.error(e.code === 'EADDRINUSE' ? `port ${PORT} is already in use; pass --port <another>` : `server error: ${e.message}`);
  process.exit(1);
});
server.listen(PORT, () => console.log(`serving ${ROOT} at http://localhost:${PORT}${SPA ? ' (spa fallback)' : ''}`));
