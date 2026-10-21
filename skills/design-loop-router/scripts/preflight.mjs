#!/usr/bin/env node
/*
 * preflight.mjs — environment probe for the design-loop-router skill.
 *
 * Purpose: emit ONE JSON object on stdout describing everything the router needs
 * to decide which legs (Taste / impeccable / Browser) are actually available.
 *
 * Contract:
 *   - NO network. Nothing is downloaded, installed, or requested. The only socket
 *     used is a loopback TCP connect to the local ports 5173 and 4173 to see whether a
 *     dev/preview server is already running locally; it is destroyed immediately.
 *   - NO writes. This script never creates, edits, or deletes a file.
 *   - NO throwing. Every probe is isolated; failures are appended to `errors`
 *     and the process still prints valid JSON and exits 0.
 *   - Builtins only: node:fs, node:path, node:crypto, node:net, node:url, node:os.
 *
 * Usage:  node "<skillDir>/scripts/preflight.mjs"     (run from the project root)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import net from 'node:net';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const errors = [];

/** Record a non-fatal failure with a message that names the fixable thing. */
function note(where, err, hint) {
  errors.push({
    where,
    message: err && err.message ? err.message : String(err),
    hint: hint || null,
  });
}

/** Run a probe, never let it escape. */
function safe(where, fn, fallback, hint) {
  try {
    return fn();
  } catch (err) {
    note(where, err, hint);
    return fallback;
  }
}

/** Normalize a path to forward slashes (Windows-friendly output). */
const slash = (p) => String(p).split(path.sep).join('/').replace(/\\/g, '/');

const exists = (p) => {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
};

const readText = (p) => fs.readFileSync(p, 'utf8');

const SKILL_DIR = slash(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
const ROOT = slash(process.cwd());
const HOME = slash(os.homedir());
const IMPECCABLE_DIR = `${HOME}/.claude/skills/impeccable`;

/* ------------------------------------------------------------------ runId -- */

function makeRunId(now) {
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return (
    `${now.getUTCFullYear()}-${p(now.getUTCMonth() + 1)}-${p(now.getUTCDate())}` +
    `T${p(now.getUTCHours())}-${p(now.getUTCMinutes())}-${p(now.getUTCSeconds())}Z`
  );
}

const NOW = new Date();
const runId = makeRunId(NOW);

/* ---------------------------------------------------------------- project -- */

function readGitBranch() {
  const headFile = `${ROOT}/.git/HEAD`;
  if (!exists(headFile)) return null;
  const head = readText(headFile).trim();
  const m = /^ref:\s*refs\/heads\/(.+)$/.exec(head);
  if (m) return m[1];
  // Detached HEAD: report the short commit sha.
  return /^[0-9a-f]{7,40}$/i.test(head) ? `detached@${head.slice(0, 8)}` : null;
}

function readPackageJson() {
  const pkgPath = `${ROOT}/package.json`;
  if (!exists(pkgPath)) {
    note(
      'project.packageJson',
      new Error(`no package.json at ${pkgPath}`),
      'run this script from the project root (its cwd is used as the project root)',
    );
    return null;
  }
  return JSON.parse(readText(pkgPath));
}

const pkg = safe('project.packageJson', readPackageJson, null);

function depVersion(name) {
  if (!pkg) return null;
  const deps = pkg.dependencies || {};
  const dev = pkg.devDependencies || {};
  if (Object.prototype.hasOwnProperty.call(deps, name)) {
    return { version: String(deps[name]), scope: 'dependencies' };
  }
  if (Object.prototype.hasOwnProperty.call(dev, name)) {
    return { version: String(dev[name]), scope: 'devDependencies' };
  }
  return null;
}

function detectFramework() {
  if (!pkg) return 'unknown';
  const all = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const has = (n) => Object.prototype.hasOwnProperty.call(all, n);
  const parts = [];
  if (has('next')) parts.push('next');
  else if (has('astro')) parts.push('astro');
  else if (has('nuxt')) parts.push('nuxt');
  else if (has('react')) parts.push('react');
  else if (has('vue')) parts.push('vue');
  else if (has('svelte')) parts.push('svelte');
  if (has('vite')) parts.push('vite');
  if (has('typescript')) parts.push('typescript');
  if (has('tailwindcss')) parts.push('tailwind');
  if (has('framer-motion')) parts.push('framer-motion');
  return parts.length ? parts.join('+') : 'unknown';
}

function detectRtl() {
  const candidates = [`${ROOT}/index.html`, `${ROOT}/public/index.html`, `${ROOT}/src/index.html`];
  for (const file of candidates) {
    if (!exists(file)) continue;
    const html = readText(file);
    const m = /<html[^>]*\sdir\s*=\s*["']?([a-zA-Z]+)/i.exec(html);
    if (m) {
      return { file: slash(file), dir: m[1].toLowerCase(), rtl: m[1].toLowerCase() === 'rtl' };
    }
    return { file: slash(file), dir: null, rtl: false };
  }
  return { file: null, dir: null, rtl: false };
}

const rtl = safe('project.rtl', detectRtl, { file: null, dir: null, rtl: false });

const project = {
  root: ROOT,
  skillDir: SKILL_DIR,
  home: HOME,
  branch: safe(
    'project.branch',
    readGitBranch,
    null,
    'expected a readable .git/HEAD under the project root',
  ),
  framework: safe('project.framework', detectFramework, 'unknown'),
  packageName: pkg && pkg.name ? String(pkg.name) : null,
  docs: {
    product: exists(`${ROOT}/PRODUCT.md`),
    design: exists(`${ROOT}/DESIGN.md`),
    claude: exists(`${ROOT}/CLAUDE.md`),
  },
  rtl: rtl.rtl,
  rtlSource: rtl.file,
  htmlDirAttr: rtl.dir,
  scripts: pkg && pkg.scripts ? Object.keys(pkg.scripts).sort() : [],
};

if (!project.docs.design) {
  note(
    'project.docs',
    new Error('DESIGN.md not found at the project root'),
    'the named-rule gate needs DESIGN.md; create it at the project root before a design pass',
  );
}

/* ------------------------------------------------------------- impeccable -- */

function readImpeccable() {
  const present = exists(IMPECCABLE_DIR);
  const skillMd = `${IMPECCABLE_DIR}/SKILL.md`;
  let version = null;
  let name = null;
  if (present && exists(skillMd)) {
    const text = readText(skillMd);
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
    const block = fm ? fm[1] : '';
    const v = /^\s*version\s*:\s*["']?([^"'\r\n]+)["']?\s*$/m.exec(block);
    const n = /^\s*name\s*:\s*["']?([^"'\r\n]+)["']?\s*$/m.exec(block);
    if (v) version = v[1].trim();
    if (n) name = n[1].trim();
  }
  return {
    present,
    dir: IMPECCABLE_DIR,
    skillMd: exists(skillMd) ? skillMd : null,
    scriptsDir: `${IMPECCABLE_DIR}/scripts`,
    scriptsDirExists: exists(`${IMPECCABLE_DIR}/scripts`),
    name,
    version,
    invokeNote:
      'invoke as Skill({ skill: "impeccable", args: "<verb> <target>" }); run from the project root because its scripts read process.cwd(); use the absolute scriptsDir above, not a project-relative .claude path',
  };
}

const impeccable = safe(
  'impeccable',
  readImpeccable,
  {
    present: false,
    dir: IMPECCABLE_DIR,
    skillMd: null,
    scriptsDir: `${IMPECCABLE_DIR}/scripts`,
    scriptsDirExists: false,
    name: null,
    version: null,
    invokeNote: null,
  },
  `expected the impeccable skill directory at ${IMPECCABLE_DIR}`,
);

if (!impeccable.present) {
  note(
    'impeccable',
    new Error(`impeccable skill not found at ${IMPECCABLE_DIR}`),
    'the I leg is unavailable; run taste-only (T) and browser (B) legs, or restore the skill directory',
  );
} else if (!impeccable.version) {
  note(
    'impeccable.version',
    new Error('no version field in the impeccable SKILL.md frontmatter'),
    `add a version: field to ${IMPECCABLE_DIR}/SKILL.md frontmatter`,
  );
}

/* ------------------------------------------------------------------ taste -- */

function readTaste() {
  const file = `${SKILL_DIR}/references/taste-core.md`;
  if (!exists(file)) {
    return { present: false, file, sha256: null, lines: 0, bytes: 0 };
  }
  const buf = fs.readFileSync(file);
  const text = buf.toString('utf8');
  return {
    present: true,
    file,
    sha256: crypto.createHash('sha256').update(buf).digest('hex'),
    lines: text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length,
    bytes: buf.length,
  };
}

const taste = safe(
  'taste',
  readTaste,
  { present: false, file: `${SKILL_DIR}/references/taste-core.md`, sha256: null, lines: 0, bytes: 0 },
  `expected the vendored taste layer at ${SKILL_DIR}/references/taste-core.md`,
);

if (!taste.present) {
  note(
    'taste',
    new Error('taste-core.md missing'),
    `restore ${SKILL_DIR}/references/taste-core.md — the T leg cannot run without it`,
  );
}

/* ---------------------------------------------------------------- browser -- */

function puppeteerCacheDirs() {
  const candidates = [
    `${HOME}/.cache/puppeteer`,
    `${HOME}/AppData/Local/puppeteer`,
    `${HOME}/.puppeteer`,
    `${ROOT}/node_modules/puppeteer/.local-chromium`,
  ];
  const found = [];
  for (const dir of candidates) {
    if (!exists(dir)) continue;
    let entries = [];
    try {
      entries = fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort();
    } catch {
      entries = [];
    }
    found.push({ dir: slash(dir), entries });
  }
  return found;
}

function readBrowser() {
  const pup = depVersion('puppeteer');
  const axe = depVersion('axe-core');
  const caches = puppeteerCacheDirs();
  return {
    puppeteer: {
      declared: Boolean(pup),
      version: pup ? pup.version : null,
      scope: pup ? pup.scope : null,
      installed: exists(`${ROOT}/node_modules/puppeteer/package.json`),
    },
    axeCore: {
      declared: Boolean(axe),
      version: axe ? axe.version : null,
      scope: axe ? axe.scope : null,
      installed: exists(`${ROOT}/node_modules/axe-core/package.json`),
    },
    browserCaches: caches,
    browserCachePresent: caches.length > 0,
    existingHelpers: {
      designVerify: exists(`${ROOT}/scripts/design-verify.mjs`)
        ? `${ROOT}/scripts/design-verify.mjs`
        : null,
      contrastAudit: exists(`${ROOT}/.gsd/temp/contrast-audit.mjs`)
        ? `${ROOT}/.gsd/temp/contrast-audit.mjs`
        : null,
    },
  };
}

const browser = safe(
  'browser',
  readBrowser,
  {
    puppeteer: { declared: false, version: null, scope: null, installed: false },
    axeCore: { declared: false, version: null, scope: null, installed: false },
    browserCaches: [],
    browserCachePresent: false,
    existingHelpers: { designVerify: null, contrastAudit: null },
  },
  'expected puppeteer and axe-core to be listed in the project package.json',
);

if (!browser.puppeteer.declared) {
  note(
    'browser.puppeteer',
    new Error('puppeteer is not listed in package.json'),
    'the B leg cannot measure; check the devDependencies block of the project package.json',
  );
}
if (!browser.axeCore.declared) {
  note(
    'browser.axeCore',
    new Error('axe-core is not listed in package.json'),
    'the accessibility pass cannot run; check the devDependencies block of the project package.json',
  );
}
if (browser.puppeteer.declared && !browser.browserCachePresent) {
  note(
    'browser.cache',
    new Error('no local puppeteer browser cache directory found under the user home'),
    'a headless Chrome must already be present locally; the B leg will fail to launch without it',
  );
}

/* -------------------------------------------------------------- devServer -- */

const PROBE_TIMEOUT_MS = 400;

function probePort(port) {
  return new Promise((resolve) => {
    let settled = false;
    const socket = new net.Socket();
    const done = (open) => {
      if (settled) return;
      settled = true;
      try {
        socket.destroy();
      } catch {
        /* socket already gone */
      }
      resolve(open);
    };
    socket.setTimeout(PROBE_TIMEOUT_MS);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
    try {
      socket.connect({ port });
    } catch {
      done(false);
    }
  });
}

async function readDevServer() {
  const [dev, preview] = await Promise.all([probePort(5173), probePort(4173)]);
  return {
    timeoutMs: PROBE_TIMEOUT_MS,
    dev5173: dev,
    preview4173: preview,
    any: dev || preview,
    baseHint: dev ? 'dev server on port 5173' : preview ? 'preview server on port 4173' : null,
    startHint: dev || preview ? null : 'no local server answered; start the dev or preview script before the B leg',
  };
}

let devServer;
try {
  devServer = await readDevServer();
} catch (err) {
  note('devServer', err, 'loopback TCP probe failed; assume no server is running');
  devServer = {
    timeoutMs: PROBE_TIMEOUT_MS,
    dev5173: false,
    preview4173: false,
    any: false,
    baseHint: null,
    startHint: 'probe failed; start the dev or preview script before the B leg',
  };
}

/* ------------------------------------------------------------------ legs --- */

const legs = {
  T: taste.present,
  I: impeccable.present,
  B: browser.puppeteer.declared && browser.puppeteer.installed !== false && browser.browserCachePresent,
};

/* ----------------------------------------------------------------- output -- */

const out = {
  runId,
  generatedAt: NOW.toISOString(),
  node: process.version,
  platform: process.platform,
  runDir: `${ROOT}/.design-loop/${runId}`,
  project,
  impeccable,
  taste,
  browser,
  devServer,
  legs,
  ok: errors.length === 0,
  errors,
};

process.stdout.write(JSON.stringify(out, null, 2) + '\n');
process.exitCode = 0;
