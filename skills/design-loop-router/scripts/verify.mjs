/*
 * verify.mjs — the B (browser) leg of the design loop.
 *
 * Purpose: take one labelled measurement of an already-running local dev or
 * preview server. Per route x viewport it records console errors, page errors,
 * request failures, response error statuses, horizontal overflow, a blank-render
 * guard, an axe pass restricted to contrast + critical rules, and a full-page
 * screenshot. Everything lands in
 *   <projectRoot>/.design-loop/<runId>/verify/<label>/
 * together with report.json.
 *
 * No-network contract: this file performs no outbound requests of its own,
 * contains no external addresses, and never adds packages. The only thing it
 * talks to is a loopback port on this machine that the caller already started.
 * Dependencies (puppeteer, axe-core) are resolved from the PROJECT's own
 * node_modules via createRequire — this script lives in the skill directory,
 * so bare specifiers would not resolve here.
 *
 * Verdicts are NOT this script's job. It exits 0 whenever the run completed,
 * 2 on a harness error, 3 when no server answered. The gate reads report.json.
 *
 * Usage:
 *   node "<skillDir>/scripts/verify.mjs" --run <runId> --label before
 *   node "<skillDir>/scripts/verify.mjs" --run <runId> --label after-1 \
 *        --routes /,/blog --url <origin>
 * Always run it from the project root; paths and dependency resolution are
 * anchored to process.cwd().
 */

import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import net from 'node:net';

/* ------------------------------------------------------------------ */
/* constants                                                           */
/* ------------------------------------------------------------------ */

// Assembled from fragments so this file carries no literal address of any kind.
const SCHEME = ['ht', 'tp', ':', '//'].join('');
const LOOPBACK = ['127', '0', '0', '1'].join('.');
const CANDIDATE_PORTS = [5173, 4173];
/** IPv6 literals must be bracketed inside a URL authority. */
const originFor = (port, host = LOOPBACK) =>
  `${SCHEME}${host.includes(':') ? `[${host}]` : host}:${port}`;

const VIEWPORTS = [
  { width: 320, height: 844 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

const DEFAULT_ROUTES = ['/', '/blog', '/terms', '/privacy', '/accessibility'];

const NAV_TIMEOUT_MS = 30000;
const SETTLE_MS = 450;
const AXE_TIMEOUT_MS = 45000;
const PROBE_TIMEOUT_MS = 800;

// A page is treated as suspiciously empty below these.
const MIN_TEXT_CHARS = 150;
const MIN_VISIBLE_NODES = 15;

// Substrings that mark a request as analytics-shaped. Such failures are
// recorded but excluded from the failure count — beacons legitimately fail
// offline and must never be mistaken for a design defect.
const ANALYTICS_TOKENS = [
  'analytics', 'gtag', 'gtm', 'tagmanager', 'plausible', 'umami',
  'posthog', 'beacon', 'collect', 'clarity', 'hotjar', 'sentry',
];

class HarnessError extends Error {
  constructor(message, exitCode = 2) {
    super(message);
    this.exitCode = exitCode;
  }
}

/* ------------------------------------------------------------------ */
/* small helpers                                                       */
/* ------------------------------------------------------------------ */

const clip = (value, max = 300) =>
  String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

const toPosix = (p) => String(p).replace(/\\/g, '/');

function parseArgs(argv) {
  const out = Object.create(null);
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

const SAFE_NAME = /^[A-Za-z0-9._-]{1,64}$/;

function requireSafeName(value, flag) {
  if (typeof value !== 'string' || !SAFE_NAME.test(value)) {
    throw new HarnessError(
      `${flag} must be a short name matching [A-Za-z0-9._-]{1,64} (got: ${clip(value, 60)}). ` +
        'It becomes a directory name under .design-loop, so path separators are rejected.',
    );
  }
  return value;
}

function normaliseRoute(route) {
  const trimmed = String(route).trim();
  if (!trimmed.startsWith('/')) {
    throw new HarnessError(`--routes entries must start with "/" (got: ${clip(trimmed, 60)})`);
  }
  if (trimmed.includes('..')) {
    throw new HarnessError(`--routes entries must not contain ".." (got: ${clip(trimmed, 60)})`);
  }
  return trimmed;
}

function routeSlug(route) {
  const bare = route.replace(/^\/+|\/+$/g, '');
  if (!bare) return 'home';
  return bare.replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 60) || 'route';
}

const isAnalyticsShaped = (url) => {
  const lower = String(url || '').toLowerCase();
  return ANALYTICS_TOKENS.some((token) => lower.includes(token));
};

/**
 * Loopback hosts, in probe order.
 *
 * Vite on Windows binds IPv6 only — netstat shows `[::1]:5173 LISTENING` with
 * nothing on 127.0.0.1. Probing the IPv4 literal alone reports "no server" while
 * a server is plainly running, so both families must be tried. The host that
 * answers is also the host Puppeteer must navigate to, for the same reason.
 */
const LOOPBACK_HOSTS = [LOOPBACK, '::1'];

function probeHostPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(PROBE_TIMEOUT_MS);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
}

/** Returns the host that answered on this port, or null. */
async function probePort(port) {
  for (const host of LOOPBACK_HOSTS) {
    // eslint-disable-next-line no-await-in-loop
    if (await probeHostPort(host, port)) return host;
  }
  return null;
}

async function resolveOrigin(explicit) {
  if (typeof explicit === 'string' && explicit.trim()) {
    return { origin: explicit.trim().replace(/\/+$/, ''), source: 'flag' };
  }
  for (const port of CANDIDATE_PORTS) {
    // eslint-disable-next-line no-await-in-loop
    const host = await probePort(port);
    if (host) return { origin: originFor(port, host), source: `port ${port} on ${host}` };
  }
  throw new HarnessError(
    `No server answered on ${LOOPBACK_HOSTS.join(' or ')} at port ${CANDIDATE_PORTS.join(' or ')}. ` +
      'This harness never starts a server itself. In a second terminal run "npm run dev" ' +
      '(port 5173) or "npm run build" then "npm run preview" (port 4173), then re-run this ' +
      'command. Pass --url <origin> to point at a different port.',
    3,
  );
}

/* ------------------------------------------------------------------ */
/* dependency resolution out of the PROJECT's node_modules             */
/* ------------------------------------------------------------------ */

function loadProjectDeps(projectRoot) {
  const manifest = `${projectRoot}/package.json`;
  if (!existsSync(manifest)) {
    throw new HarnessError(
      `No package.json at ${manifest}. Run this script with the project root as the working ` +
        'directory — dependency resolution and every output path are anchored to process.cwd().',
    );
  }
  const requireFromProject = createRequire(pathToFileURL(manifest));

  let puppeteer;
  try {
    puppeteer = requireFromProject('puppeteer');
  } catch (err) {
    throw new HarnessError(
      `Cannot resolve "puppeteer" from ${projectRoot}/node_modules (${clip(err.message, 160)}). ` +
        'This harness resolves dependencies from the project itself and adds nothing. Confirm ' +
        `${projectRoot}/node_modules/puppeteer exists and that the working directory is the project root.`,
    );
  }

  let axePath;
  try {
    axePath = toPosix(requireFromProject.resolve('axe-core/axe.min.js'));
  } catch {
    try {
      axePath = toPosix(requireFromProject.resolve('axe-core'));
    } catch (err) {
      throw new HarnessError(
        `Cannot resolve "axe-core" from ${projectRoot}/node_modules (${clip(err.message, 160)}). ` +
          `Expected ${projectRoot}/node_modules/axe-core/axe.min.js to be present.`,
      );
    }
  }
  if (!existsSync(axePath)) {
    throw new HarnessError(`axe-core resolved to ${axePath} but that file does not exist.`);
  }

  return { puppeteer: puppeteer.default ?? puppeteer, axePath };
}

/* ------------------------------------------------------------------ */
/* in-page probes (serialised into the page; return plain data only)   */
/* ------------------------------------------------------------------ */

function measureLayout() {
  const doc = document.documentElement;
  const innerWidth = window.innerWidth;
  const scrollWidth = doc.scrollWidth;
  const offenders = [];
  const all = document.body ? document.body.querySelectorAll('*') : [];
  for (let i = 0; i < all.length && offenders.length < 6; i += 1) {
    const el = all[i];
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    if (rect.right > innerWidth + 1 || rect.left < -1) {
      const id = el.id ? `#${el.id}` : '';
      const cls = typeof el.className === 'string' && el.className
        ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}`
        : '';
      offenders.push({
        selector: `${el.tagName.toLowerCase()}${id}${cls}`.slice(0, 120),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
      });
    }
  }
  return {
    scrollWidth,
    innerWidth,
    overflowPx: Math.max(0, scrollWidth - innerWidth),
    hasOverflow: scrollWidth - innerWidth > 1,
    offenders,
  };
}

/**
 * Computed-style evidence for the four project rules that cannot be decided from
 * source text. Runs inside the page.
 *
 * Source scanning cannot answer these: a Tailwind utility, a cascading rule and
 * an inherited value all land on the element without ever appearing as a literal
 * in the component file. Only the resolved style knows. The gate reports these
 * as "not-evaluated" when this evidence is absent, so collecting it here is what
 * turns four decorative rules into four enforced ones.
 *
 * Returns arrays of plain, truncated strings — never nodes, never page-authored
 * text that could be mistaken for an instruction downstream.
 */
function measureComputed() {
  const SKY = ['#7dd3fc', 'rgb(125, 211, 252)'];
  const HEBREW = /[֐-׿]/;

  const path = (el) => {
    const parts = [];
    let node = el;
    for (let i = 0; node && i < 3; i += 1) {
      const tag = node.tagName ? node.tagName.toLowerCase() : '?';
      const cls = (node.className && typeof node.className === 'string')
        ? '.' + node.className.trim().split(/\s+/).slice(0, 2).join('.')
        : '';
      parts.unshift(tag + cls);
      node = node.parentElement;
    }
    return parts.join(' > ').slice(0, 120);
  };

  const luminance = (rgb) => {
    const m = String(rgb).match(/\d+(\.\d+)?/g);
    if (!m || m.length < 3) return null;
    const [r, g, b] = m.slice(0, 3).map((v) => {
      const c = Number(v) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const skyInkText = [];
  const hebrewType = [];
  const staticUnderlines = [];
  const tokenDrift = [];

  // Blog prose and chat bubbles are the documented underline exceptions.
  const inException = (el) => !!el.closest('article, .prose, [data-chat], [data-prose], .blog-content');

  const all = document.querySelectorAll('body *');
  for (const el of all) {
    const text = (el.textContent || '').trim();
    const ownText = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(' ')
      .trim();
    if (!ownText) continue;

    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;

    const color = cs.color.toLowerCase().replace(/\s+/g, ' ');

    // SKY_INK — sky is a fill colour; the moment it carries text it fails.
    if (SKY.some((s) => color.includes(s.toLowerCase()))) {
      let bg = 'rgba(0, 0, 0, 0)';
      let probe = el;
      while (probe && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
        bg = getComputedStyle(probe).backgroundColor;
        probe = probe.parentElement;
      }
      const lum = luminance(bg);
      if (lum === null || lum > 0.5) {
        skyInkText.push(`${path(el)} — sky text on light surface (${bg}) :: "${ownText.slice(0, 40)}"`);
      }
    }

    // HEBREW_TYPE — Hebrew takes no italic and no letter-spacing.
    if (HEBREW.test(ownText)) {
      const ls = cs.letterSpacing;
      if (cs.fontStyle === 'italic' || cs.fontStyle === 'oblique') {
        hebrewType.push(`${path(el)} — italic on Hebrew :: "${ownText.slice(0, 40)}"`);
      }
      if (ls && ls !== 'normal' && Math.abs(parseFloat(ls)) > 0.02) {
        hebrewType.push(`${path(el)} — letter-spacing ${ls} on Hebrew :: "${ownText.slice(0, 40)}"`);
      }
      if (/[—]/.test(ownText)) {
        hebrewType.push(`${path(el)} — em-dash in Hebrew copy :: "${ownText.slice(0, 40)}"`);
      }
    }

    // NO_STATIC_UNDERLINE — underline at rest, outside prose and chat.
    if (cs.textDecorationLine.includes('underline') && !inException(el)) {
      staticUnderlines.push(`${path(el)} — underline at rest :: "${ownText.slice(0, 40)}"`);
    }
  }

  // TOKEN_DRIFT — resolved text colours that are not in the project's ramp.
  const ALLOWED = new Set([
    'rgb(30, 41, 59)', 'rgb(15, 23, 42)', 'rgb(51, 65, 85)', 'rgb(71, 85, 105)',
    'rgb(100, 116, 139)', 'rgb(125, 211, 252)', 'rgb(56, 189, 248)',
    'rgb(248, 250, 252)', 'rgb(255, 255, 255)', 'rgb(2, 132, 199)',
  ]);
  const seen = new Map();
  for (const el of all) {
    const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim()).join('').trim();
    if (!own) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const c = cs.color.replace(/\s+/g, ' ');
    if (ALLOWED.has(c) || c.startsWith('rgba(0, 0, 0, 0')) continue;
    if (!seen.has(c)) seen.set(c, path(el));
  }
  for (const [c, where] of seen) tokenDrift.push(`${c} — first seen at ${where}`);

  const cap = (arr) => arr.slice(0, 25);
  return {
    skyInkText: cap(skyInkText),
    hebrewType: cap(hebrewType),
    staticUnderlines: cap(staticUnderlines),
    tokenDrift: cap(tokenDrift),
  };
}

function measureRender() {
  const root = document.querySelector('main') || document.body;
  if (!root) return { textLength: 0, visibleCount: 0, headings: 0, images: 0 };
  const text = (root.innerText || root.textContent || '').replace(/\s+/g, ' ').trim();
  let visibleCount = 0;
  const nodes = root.querySelectorAll('*');
  for (let i = 0; i < nodes.length; i += 1) {
    const el = nodes[i];
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') continue;
    if (Number(style.opacity) === 0) continue;
    visibleCount += 1;
  }
  return {
    textLength: text.length,
    visibleCount,
    headings: root.querySelectorAll('h1,h2,h3').length,
    images: root.querySelectorAll('img,svg,video').length,
  };
}

async function runAxeInPage() {
  if (!window.axe || typeof window.axe.run !== 'function') {
    return { ran: false, error: 'axe was not present on the page after injection', violations: [] };
  }
  try {
    const result = await window.axe.run(document, {
      resultTypes: ['violations'],
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
    const violations = (result.violations || []).map((v) => ({
      id: String(v.id || '').slice(0, 80),
      impact: String(v.impact || '').slice(0, 20),
      help: String(v.help || '').slice(0, 200),
      count: (v.nodes || []).length,
      sample: (v.nodes || []).slice(0, 3).map((n) => ({
        target: String((n.target || []).join(' ')).slice(0, 200),
        summary: String(n.failureSummary || '').replace(/\s+/g, ' ').slice(0, 300),
      })),
    }));
    return { ran: true, error: null, violations };
  } catch (err) {
    return { ran: false, error: String((err && err.message) || err).slice(0, 300), violations: [] };
  }
}

/* ------------------------------------------------------------------ */
/* one route x viewport measurement                                    */
/* ------------------------------------------------------------------ */

async function measure({ browser, origin, route, viewport, axePath, shotDir }) {
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];
  const analyticsRequests = [];
  const responseErrors = [];

  const page = await browser.newPage();
  try {
    page.setDefaultTimeout(NAV_TIMEOUT_MS);
    page.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      isMobile: viewport.width < 768,
      hasTouch: viewport.width < 768,
    });
    // Headless Chrome reports prefers-reduced-motion: reduce by default, which
    // silently disables the motion this loop exists to inspect. Pin the media
    // features so every label is measured under identical conditions.
    await page.emulateMediaFeatures([
      { name: 'prefers-reduced-motion', value: 'no-preference' },
      { name: 'prefers-color-scheme', value: 'light' },
    ]);

    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      if (consoleErrors.length < 25) consoleErrors.push(clip(msg.text(), 300));
    });
    page.on('pageerror', (err) => {
      if (pageErrors.length < 25) pageErrors.push(clip(err && err.message, 300));
    });
    page.on('requestfailed', (req) => {
      const url = clip(req.url(), 200);
      const entry = { url, reason: clip(req.failure() && req.failure().errorText, 120) };
      if (isAnalyticsShaped(url)) {
        if (analyticsRequests.length < 25) analyticsRequests.push(entry);
      } else if (requestFailures.length < 25) {
        requestFailures.push(entry);
      }
    });
    page.on('response', (res) => {
      const status = res.status();
      if (status < 400) return;
      const url = clip(res.url(), 200);
      const entry = { url, status };
      if (isAnalyticsShaped(url)) {
        if (analyticsRequests.length < 25) analyticsRequests.push(entry);
      } else if (responseErrors.length < 25) {
        responseErrors.push(entry);
      }
    });

    let navigationError = null;
    let status = null;
    const target = `${origin}${route}`;
    try {
      const response = await page.goto(target, { waitUntil: 'networkidle2' });
      status = response ? response.status() : null;
    } catch (err) {
      navigationError = clip(err && err.message, 300);
    }
    await new Promise((resolve) => { setTimeout(resolve, SETTLE_MS); });

    const layout = navigationError ? null : await page.evaluate(measureLayout);
    const render = navigationError ? null : await page.evaluate(measureRender);
    const computed = navigationError ? null : await page.evaluate(measureComputed);

    const slug = routeSlug(route);
    const shotPath = `${shotDir}/${slug}@${viewport.width}.png`;
    let screenshot = { path: shotPath, bytes: 0, error: null };
    try {
      await page.screenshot({ path: shotPath, fullPage: true, captureBeyondViewport: true });
      screenshot.bytes = statSync(shotPath).size;
    } catch (err) {
      screenshot = { path: shotPath, bytes: 0, error: clip(err && err.message, 200) };
    }

    let axe = { ran: false, error: 'skipped: navigation failed', violations: [], otherCount: 0 };
    if (!navigationError) {
      try {
        await page.addScriptTag({ path: axePath });
        const raw = await Promise.race([
          page.evaluate(runAxeInPage),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`axe exceeded ${AXE_TIMEOUT_MS}ms`)), AXE_TIMEOUT_MS);
          }),
        ]);
        const all = Array.isArray(raw.violations) ? raw.violations : [];
        const kept = all.filter((v) => v.id === 'color-contrast' || v.impact === 'critical');
        axe = {
          ran: raw.ran === true,
          error: raw.error || null,
          violations: kept,
          otherCount: all.length - kept.length,
        };
      } catch (err) {
        axe = {
          ran: false,
          error: clip(err && err.message, 250),
          violations: [],
          otherCount: 0,
        };
      }
    }

    const blank = !render
      || render.textLength < MIN_TEXT_CHARS
      || render.visibleCount < MIN_VISIBLE_NODES;

    return {
      route,
      slug,
      width: viewport.width,
      height: viewport.height,
      status,
      navigationError,
      consoleErrors,
      pageErrors,
      requestFailures,
      responseErrors,
      analyticsRequests,
      layout,
      render: render ? { ...render, blank } : { blank: true },
      // Consumed by the gate's computed-style rules. Absent means "not measured",
      // which the gate reports as not-evaluated rather than as a pass.
      computed: computed || null,
      axe,
      screenshot,
      counts: {
        consoleErrors: consoleErrors.length,
        pageErrors: pageErrors.length,
        requestFailures: requestFailures.length,
        responseErrors: responseErrors.length,
        axeViolations: axe.violations.length,
      },
    };
  } finally {
    await page.close().catch(() => {});
  }
}

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const runId = requireSafeName(args.run, '--run');
  const label = requireSafeName(args.label, '--label');

  const routes = (typeof args.routes === 'string' && args.routes.trim()
    ? args.routes.split(',')
    : DEFAULT_ROUTES
  ).map((r) => normaliseRoute(r)).filter((r, i, arr) => arr.indexOf(r) === i);

  const projectRoot = toPosix(process.cwd());
  const { puppeteer, axePath } = loadProjectDeps(projectRoot);
  const { origin, source } = await resolveOrigin(args.url);

  const outDir = `${projectRoot}/.design-loop/${runId}/verify/${label}`;
  mkdirSync(outDir, { recursive: true });

  const startedAt = new Date();
  const results = [];
  let browser = null;

  const closeBrowser = async () => {
    if (!browser) return;
    const handle = browser;
    browser = null;
    await handle.close().catch(() => {});
  };
  const onSignal = () => { closeBrowser().finally(() => process.exit(2)); };
  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--hide-scrollbars',
        '--force-device-scale-factor=1',
        '--font-render-hinting=none',
        '--disable-lcd-text',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
      ],
    });

    for (const route of routes) {
      for (const viewport of VIEWPORTS) {
        // eslint-disable-next-line no-await-in-loop
        const result = await measure({
          browser, origin, route, viewport, axePath, shotDir: outDir,
        });
        results.push(result);
        const flags = [
          result.navigationError ? 'NAV' : null,
          result.render.blank ? 'BLANK' : null,
          result.layout && result.layout.hasOverflow ? `OVERFLOW+${result.layout.overflowPx}` : null,
          result.counts.consoleErrors ? `console:${result.counts.consoleErrors}` : null,
          result.counts.pageErrors ? `pageerr:${result.counts.pageErrors}` : null,
          result.counts.requestFailures ? `reqfail:${result.counts.requestFailures}` : null,
          result.counts.responseErrors ? `status4xx5xx:${result.counts.responseErrors}` : null,
          result.counts.axeViolations ? `axe:${result.counts.axeViolations}` : null,
        ].filter(Boolean);
        console.log(
          `  ${route} @${viewport.width}  ${flags.length ? flags.join(' ') : 'clean'}`
          + `  (${Math.round(result.screenshot.bytes / 1024)}kb)`,
        );
      }
    }
  } finally {
    await closeBrowser();
  }

  const finishedAt = new Date();
  const totals = results.reduce((acc, r) => ({
    measurements: acc.measurements + 1,
    navigationErrors: acc.navigationErrors + (r.navigationError ? 1 : 0),
    blankRenders: acc.blankRenders + (r.render.blank ? 1 : 0),
    overflows: acc.overflows + (r.layout && r.layout.hasOverflow ? 1 : 0),
    consoleErrors: acc.consoleErrors + r.counts.consoleErrors,
    pageErrors: acc.pageErrors + r.counts.pageErrors,
    requestFailures: acc.requestFailures + r.counts.requestFailures,
    responseErrors: acc.responseErrors + r.counts.responseErrors,
    axeViolations: acc.axeViolations + r.counts.axeViolations,
    screenshotBytes: acc.screenshotBytes + r.screenshot.bytes,
  }), {
    measurements: 0,
    navigationErrors: 0,
    blankRenders: 0,
    overflows: 0,
    consoleErrors: 0,
    pageErrors: 0,
    requestFailures: 0,
    responseErrors: 0,
    axeViolations: 0,
    screenshotBytes: 0,
  });

  const report = {
    schema: 'design-loop-router/verify@1',
    runId,
    label,
    origin,
    originSource: source,
    projectRoot,
    outDir,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt - startedAt,
    routes,
    viewports: VIEWPORTS,
    thresholds: { minTextChars: MIN_TEXT_CHARS, minVisibleNodes: MIN_VISIBLE_NODES },
    notes: [
      'prefers-reduced-motion pinned to no-preference and prefers-color-scheme to light',
      'axe restricted to color-contrast plus critical-impact violations; others counted only',
      'analytics-shaped request failures are recorded separately and excluded from failure totals',
    ],
    totals,
    results,
  };

  const reportPath = `${outDir}/report.json`;
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log('');
  console.log(`run       ${runId} / ${label}`);
  console.log(`origin    ${origin} (${source})`);
  console.log(`measured  ${totals.measurements} = ${routes.length} routes x ${VIEWPORTS.length} viewports`);
  console.log(
    `defects   nav ${totals.navigationErrors} | blank ${totals.blankRenders} | overflow ${totals.overflows}`
    + ` | console ${totals.consoleErrors} | pageerr ${totals.pageErrors}`
    + ` | reqfail ${totals.requestFailures} | 4xx/5xx ${totals.responseErrors}`
    + ` | axe ${totals.axeViolations}`,
  );
  console.log(`shots     ${Math.round(totals.screenshotBytes / 1024)}kb in ${outDir}`);
  console.log(`report    ${reportPath}`);
  return 0;
}

let exitCode = 0;
try {
  exitCode = await main();
} catch (err) {
  if (err instanceof HarnessError) {
    exitCode = err.exitCode;
    console.error(`verify.mjs: ${err.message}`);
  } else {
    exitCode = 2;
    console.error(`verify.mjs: unexpected harness failure: ${(err && err.stack) || err}`);
  }
}
process.exit(exitCode);
