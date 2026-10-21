#!/usr/bin/env node
// slop-scan: find the fingerprints of template / AI-default design in a codebase or a live page.
//
//   node slop-scan.mjs <dir|file>       scan source files (html, css, jsx/tsx, vue, svelte, astro, md, json/yaml copy)
//   node slop-scan.mjs --url <url>      render a live page (any platform) and scan what visitors get
//   options: --out <dir>  --json  --fail-above <index>
//
// It reports evidence (file:line or DOM excerpt), a weighted Slop Index (0-100) and, separately,
// SECOND-ORDER slop: the "tasteful AI" look that anti-slop prompting produces (cream + serif italic
// + mono labels + grain + acid accent…). A clean score is not taste: it only means none of the
// known defaults were found. Rules are heuristics: read the evidence before acting on it.
//
// Waivers work for every rule, copy included: `slop-ok: <rule-id> <why>` in a comment on the same or
// previous line (code), or data-slop-ok="<rule-id> <why>" on the element or an ancestor (URL mode).
// Second-order signals ignore that plain form. They yield only to a logged design decision:
// `slop-ok:<rule-id> decision:D<n> <why>` (code) or data-slop-ok="<rule-id> decision:D<n> <why>"
// (URL mode). A waived signal leaves the "signals together" count but is listed, with its decision
// and every occurrence, in its own report section ("waived by decision"), so nothing hides.
// Client voice (blockquote, q, testimonial/review/quote classes, data-voice="client", files named
// testimonials/reviews) is not judged as owner copy; only the proof rules run on it (placeholder
// people, round stats, lorem). Its own reports, scroll-film output and the skill's design/ folder are
// skipped. URL mode exits 2 when the page does not load (network error, HTTP ≥ 400, under 80
// characters of text): a scan of an error page proves nothing.

import { readdir, readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { join, extname, relative, resolve, dirname, basename } from 'node:path';
import { NEW_RULES, NEW_SECOND_ORDER } from './slop-rules.mjs';
import { DOM_DETECTORS_2, NEW_DOM_RULES } from './slop-dom.mjs';

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

const USAGE = 'usage: node slop-scan.mjs <dir|file> | --url <url>  [--out dir] [--json] [--fail-above N]';
function usage(msg) {
  if (msg) console.error(msg);
  console.error(USAGE);
  process.exit(2);
}
const args = parseArgs(process.argv.slice(2));
if (args.url !== undefined && typeof args.url !== 'string') usage('--url needs a URL');
const TARGET = args.url || args._[0];
if (!TARGET) usage();

function parseArgs(list) {
  const out = { _: [] };
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const next = list[i + 1];
    if (next === undefined || next.startsWith('--')) out[a.slice(2)] = true;
    else { out[a.slice(2)] = next; i++; }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Rules. weight: 1 = weak signal (common in good sites too), 2 = typical default, 3 = strong tell.
// kind: 'code' runs on source text, 'copy' on human-readable text, 'both' on either.
// max: cap on how many hits of one rule count toward the score (repetition is a tell, but a
// capped one: 40 identical classes are one decision, not forty).
// ---------------------------------------------------------------------------------------------
const RULES = [
  // Colour & surface
  { id: 'purple-blue-gradient', w: 3, max: 4, kind: 'code', cat: 'colour', re: /(from|via|to)-(purple|violet|indigo|fuchsia|pink)-\d{2,3}[^"'`]{0,80}(to|via)-(blue|indigo|purple|violet|cyan|pink)-\d{2,3}|linear-gradient\([^)]*(#(8b5cf6|7c3aed|6366f1|a855f7|9333ea|4f46e5|ec4899|d946ef)|purple|violet|indigo)[^)]*\)/gi, msg: 'Purple/indigo→blue/pink gradient: the single most recognisable AI-default surface.' },
  { id: 'gradient-text-headline', w: 3, max: 3, kind: 'code', cat: 'type', re: /bg-clip-text[^"'`]{0,60}text-transparent|text-transparent[^"'`]{0,60}bg-clip-text|-webkit-background-clip:\s*text/gi, msg: 'Gradient-filled headline text.' },
  { id: 'blur-blob', w: 2, max: 3, kind: 'code', cat: 'colour', re: /(absolute|fixed)[^"'`]{0,120}rounded-full[^"'`]{0,120}blur-(2xl|3xl|\[\d{2,3}px\])|blur-(2xl|3xl)[^"'`]{0,120}rounded-full/gi, msg: 'Blurred colour blob behind the hero.' },
  { id: 'glass-nav', w: 2, max: 2, kind: 'code', cat: 'surface', re: /backdrop-blur(-\w+)?[^"'`]{0,80}bg-(white|black|slate|gray|zinc)\/(5|10|20|30|40|50|60|70|80)|bg-(white|black)\/(5|10|20)[^"'`]{0,80}backdrop-blur/gi, msg: 'Frosted-glass surface (glassmorphism nav/cards).' },
  { id: 'soft-card-stack', w: 1, max: 6, kind: 'code', cat: 'surface', re: /rounded-(2xl|3xl)[^"'`]{0,80}shadow-(lg|xl|2xl)|shadow-(lg|xl|2xl)[^"'`]{0,80}rounded-(2xl|3xl)/gi, msg: 'Rounded-2xl card with a big soft shadow: the default card.' },
  { id: 'tinted-icon-square', w: 2, max: 4, kind: 'code', cat: 'icon', re: /(rounded-(lg|xl|full)[^"'`]{0,60}bg-(\w+)-(50|100)[^"'`]{0,60}p-[234])|(bg-(\w+)-(50|100)[^"'`]{0,60}rounded-(lg|xl|full)[^"'`]{0,60}p-[234])/gi, msg: 'Icon inside a pale tinted square/circle: feature-card boilerplate.' },
  { id: 'pulse-badge', w: 2, max: 2, kind: 'code', cat: 'motion', re: /animate-pulse[^"'`]{0,80}rounded-full|animate-ping/gi, msg: 'Pulsing dot/badge used as decoration.' },
  // Typography
  { id: 'default-sans', w: 2, max: 3, kind: 'code', cat: 'type', re: /font-family:\s*['"]?(Inter|Roboto|Poppins|Montserrat|Open Sans|Lato|Nunito|Plus Jakarta Sans|DM Sans)['"]?|fonts\.googleapis\.com\/css2?\?family=(Inter|Roboto|Poppins|Montserrat|Open\+Sans|Lato|Nunito|Plus\+Jakarta\+Sans|DM\+Sans)|import\s*\{[^}]*\b(?:Inter|Roboto|Poppins|Montserrat)\b[^}]*\}\s*from\s*['"]next\/font\/google['"]|@fontsource(-variable)?\/(inter|roboto|poppins|montserrat)/gi, msg: 'Default UI sans as the brand voice (Inter/Roboto/Poppins/Montserrat…).' },
  { id: 'default-sans-he', w: 2, max: 2, kind: 'code', cat: 'type', re: /font-family:\s*['"]?(Heebo|Assistant|Rubik|Varela Round|Alef|Open Sans Hebrew)['"]?|fonts\.googleapis\.com\/css2?\?family=(Heebo|Assistant|Rubik|Varela\+Round|Alef)|@fontsource(-variable)?\/(heebo|assistant|rubik)/gi, msg: 'Default Hebrew web font as the brand voice (Heebo/Assistant/Rubik: the Hebrew Inter).' },
  { id: 'marketplace-effect', w: 2, max: 3, kind: 'code', cat: 'motion', re: /<(BackgroundBeams(?:WithCollision)?|LampContainer|Meteors|SparklesCore|Particles|ShimmerButton|RainbowButton|AnimatedGradientText|AnimatedShinyText|AuroraText|Globe|WorldMap|AnimatedBeam|OrbitingCircles|TextGenerateEffect|HeroParallax|TracingBeam|StickyScroll|Dock)\b/g, msg: 'Effect imported from a component marketplace (Aceternity, Magic UI…): what does it say about this client? (resource-atlas.md §6)' },
  { id: 'emoji-heading', w: 3, max: 4, kind: 'code', cat: 'copy', re: /<h[1-3][^>]*>[^<]{0,80}[\u{1F300}-\u{1FAFF}\u{2728}\u{26A1}\u{1F680}][^<]{0,80}<\/h[1-3]>/giu, msg: 'Emoji inside a heading.' },
  { id: 'sparkle-badge', w: 3, max: 2, kind: 'both', cat: 'copy', re: /(✨|🚀|⚡)\s*(new|introducing|now|powered by ai|ai[- ]powered|חדש|מבוסס AI)|\b(introducing|new:)\s*[^<]{0,30}<\/(span|div|a)>/gi, msg: '"✨ New / AI-powered" pill above the headline.' },
  // Layout tells
  { id: 'three-icon-cards', w: 2, max: 3, kind: 'code', cat: 'layout', re: /grid-cols-1\s+md:grid-cols-3|md:grid-cols-3\s+gap-(6|8)|lg:grid-cols-3\s+gap-(6|8)/gi, msg: 'Three-up feature grid (check whether each card is the same icon+title+blurb).' },
  { id: 'centred-hero-two-buttons', w: 1, max: 2, kind: 'code', cat: 'layout', re: /text-center[^"'`]{0,200}(Get Started|Start (your )?free|Learn More|Book a demo|התחילו עכשיו|למידע נוסף)/gi, msg: 'Centred hero with the stock CTA pair.' },
  { id: 'generic-container', w: 1, max: 1, kind: 'code', cat: 'layout', re: /max-w-7xl\s+mx-auto\s+px-4\s+sm:px-6\s+lg:px-8/g, msg: 'Stock Tailwind container repeated everywhere (fine alone; a tell with the rest).' },
  { id: 'fade-up-everywhere', w: 2, max: 1, kind: 'code', cat: 'motion', count: 6, re: /initial=\{\{\s*opacity:\s*0,\s*y:\s*(2|3|4|5)0\s*\}\}|whileInView=\{\{\s*opacity:\s*1,\s*y:\s*0\s*\}\}|data-aos=["']fade-up["']|from\(\s*[^,]+,\s*\{\s*(opacity|autoAlpha):\s*0,\s*y:\s*(2|3|4|5)0/g, msg: 'The same fade-up on every block (≥6 occurrences): motion with no hierarchy.' },
  // Imagery
  { id: 'stock-avatar-service', w: 3, max: 2, kind: 'code', cat: 'imagery', re: /(randomuser\.me|pravatar\.cc|i\.pravatar|ui-avatars\.com|dicebear\.com|thispersondoesnotexist)/gi, msg: 'Generated/stock avatars for testimonials.' },
  { id: 'placeholder-imagery', w: 2, max: 2, kind: 'code', cat: 'imagery', re: /(picsum\.photos|placehold\.co|via\.placeholder|placeholder\.com|source\.unsplash\.com|images\.unsplash\.com\/photo-[\w-]+\?[^"'`]*auto=format)/gi, msg: 'Placeholder or generic stock imagery.' },
  { id: 'lorem', w: 3, max: 1, kind: 'both', cat: 'copy', re: /lorem ipsum|dolor sit amet/gi, msg: 'Lorem ipsum left in.' },
  // Copy: English
  { id: 'copy-buzzwords-en', w: 2, max: 6, kind: 'copy', cat: 'copy', re: /\b(unlock|elevate|seamless(ly)?|revolutioni[sz]e|empower(ing)?|supercharge|game[- ]changer|cutting[- ]edge|next[- ]level|state[- ]of[- ]the[- ]art|leverage|synergy|unleash|transform your|in today'?s fast[- ]paced|look no further|whether you'?re a|take (your|it) to the next level|built for the future|all[- ]in[- ]one (platform|solution))\b/gi, msg: 'Generic marketing filler (EN).' },
  { id: 'fake-round-stats', w: 2, max: 3, kind: 'copy', cat: 'copy', re: /(99(\.9)?%|\b10,?000\+|\b1,?000\+|\b500\+|100% (satisfaction|guaranteed)|5\.0 ★|★★★★★)/g, msg: 'Round, unsourced stats (99.9% · 10,000+ · 500+ · ★★★★★).' },
  { id: 'always-on-claim', w: 1, max: 1, kind: 'copy', cat: 'copy', re: /\b24\/7\b/g, msg: '"24/7" as a selling point (fine when literally true and specific).' },
  // Copy: Hebrew
  { id: 'copy-buzzwords-he', w: 2, max: 6, kind: 'copy', cat: 'copy', re: /(הפתרון המושלם|הכי מקצועי|ברמה הגבוהה ביותר|פתרונות? מתקדמ(ים|ות)|ללא פשרות|מקצועיות,? אמינות|חוויית משתמש (מושלמת|ייחודית)|פורץ דרך|חדשני(ים|ת)? ביותר|לקחת את העסק (שלכם |שלך )?לשלב הבא|המהפכה (כבר )?כאן|שירות (אישי|מקצועי) ו(אדיב|מהיר)|אנחנו כאן בשבילכם|הצטרפו לאלפי)/g, msg: 'Generic Hebrew marketing filler.' },
  { id: 'manufactured-contrast', w: 2, max: 1, count: 3, kind: 'copy', cat: 'copy', re: /\b(it'?s )?not (just|only|merely|another) (a |an |the )?[^.,!?\n]{2,40}[.,\u2014\u2013-]\s*(it'?s|it is|this is|we'?re)\b|\bno [^.!?\n]{2,30}\.\s*just\b|(זה )?לא (רק|סתם|עוד) [^.,!?\n]{2,40}[.,\u2014\u2013-]\s*(זה|זו|אנחנו)\b|לא עוד [^.!?\n]{2,30}\./gi, msg: 'Manufactured contrast copy ("Not just X. It\'s Y" / "זה לא רק X, זה Y"): three or more is a tic.' },
  // Structural detectors computed on the RENDERED page (URL mode): they see any stack, GSAP or not.
  { id: 'uniform-card-grid', w: 2, max: 3, kind: 'dom', cat: 'layout', msg: '≥3 sibling cards with an identical recipe (same surface + heading + paragraph [+ icon]).' },
  { id: 'repeated-section-shells', w: 2, max: 1, kind: 'dom', cat: 'layout', msg: 'Most sections share one shell (same vertical padding + same centred container): no rhythm.' },
  { id: 'kicker-labels', w: 1, max: 1, kind: 'dom', cat: 'type', msg: '≥3 tiny tracked/uppercase labels scaffolding headings: template chrome unless it carries information.' },
  { id: 'centred-copy', w: 1, max: 1, kind: 'dom', cat: 'layout', msg: '≥3 centred paragraphs of 48+ characters.' },
  { id: 'flat-type-scale', w: 2, max: 1, kind: 'dom', cat: 'type', msg: 'Flat type scale: largest heading < 2× body size.' },
  { id: 'too-many-families', w: 1, max: 1, kind: 'dom', cat: 'type', msg: '4+ font families in use.' },
  { id: 'arrow-ctas', w: 1, max: 1, kind: 'dom', cat: 'copy', msg: '≥3 links/buttons with an appended arrow (→ ↗ ←).' },
  { id: 'dot-meta-strings', w: 1, max: 1, kind: 'dom', cat: 'copy', msg: '≥3 "A · B" meta strings.' },
  { id: 'cta-cliche', w: 1, max: 3, kind: 'copy', cat: 'copy', re: /\b(get started|learn more|start your journey|join thousands)\b|(?:^|[\s>])(התחילו עכשיו|למידע נוסף|לחצו כאן|גלו עוד)(?=$|[\s<.!])/gim, msg: 'Stock CTA wording.' },
];

// Second-order slop: each signal is fine alone; three or more together = the "tasteful AI" template.
const SECOND_ORDER = [
  { id: 'serif-italic-display', re: /(Instrument Serif|Fraunces|Playfair Display|Cormorant|EB Garamond|Newsreader|DM Serif)[^;{}]{0,200}|font-serif[^"'`]{0,40}italic|italic[^"'`]{0,40}font-serif/gi, msg: 'Serif-italic display headline' },
  { id: 'cream-paper', re: /#(f[5-9a-f][ef][0-9a-f]e[0-9a-f]|faf[5-9a-f]f[0-9a-f]|f7f3e[0-9a-f]|fdfbf[0-9a-f]|f5f0e[0-9a-f])\b|bg-(stone|amber|orange)-50\b|bg-\[#f[5-9a-f][a-f0-9]{4}\]/gi, msg: 'Cream / paper background' },
  { id: 'mono-uppercase-labels', re: /(JetBrains Mono|Geist Mono|IBM Plex Mono|Space Mono|DM Mono|font-mono)[^"'`;{}]{0,80}(uppercase|tracking-(wide|wider|widest))|uppercase[^"'`]{0,60}tracking-(widest|\[0\.\d+em\])[^"'`]{0,40}font-mono/gi, msg: 'Mono uppercase micro-labels' },
  { id: 'grain-overlay', re: /feTurbulence|noise\.(png|svg|webp)|grain|bg-noise/gi, msg: 'Film-grain / noise overlay' },
  { id: 'numbered-sections', re: /(['"`>]\s*0[1-9]\s*(\u2014|\u2013|\/|\.)\s*[A-Za-z\u0590-\u05FF])/g, msg: 'Numbered "01 /" section labels (a dash, slash or dot after the number)' },
  { id: 'acid-accent', re: /#(d[4-9a-f]ff[0-4][0-9a-f]|c[0-9a-f]ff[0-4][0-9a-f]|e[0-9a-f]ff[0-4][0-9a-f]|d8fc73|ccff00|b8ff00|dfff00)\b|lime-(300|400)/gi, msg: 'Acid-lime / chartreuse accent' },
  { id: 'terracotta-accent', re: /#(c[0-9a-f]5[0-9a-f]3[0-9a-f]|d[0-9a-f]6[0-9a-f]4[0-9a-f]|e0[67][0-9a-f]5[0-9a-f]|b8[45][0-9a-f]3[0-9a-f])\b/gi, msg: 'Terracotta / clay accent (hex values only: legacy token NAMES prove nothing)' },
  { id: 'marquee-strip', re: /\bmarquee\b|animate-(marquee|scroll)\b|infinite-scroll/gi, msg: 'Infinite marquee strip' },
  { id: 'bento-grid', re: /bento|col-span-2\s+row-span-2|row-span-2\s+col-span-2/gi, msg: 'Bento grid' },
];

RULES.push(...NEW_RULES, ...NEW_DOM_RULES);
SECOND_ORDER.push(...NEW_SECOND_ORDER);

const CODE_EXT = new Set(['.html', '.htm', '.css', '.scss', '.sass', '.less', '.js', '.jsx', '.ts', '.tsx', '.mjs', '.vue', '.svelte', '.astro', '.php', '.liquid', '.njk', '.hbs']);
// .txt is left out of directory scans on purpose: reference dumps and notes live there, site copy
// rarely does. A .txt file named explicitly is scanned as prose.
const COPY_EXT = new Set(['.md', '.mdx', '.json', '.yaml', '.yml']);
const PROSE_EXT = new Set(['.md', '.mdx', '.txt']);
const DATA_EXT = new Set(['.json', '.yaml', '.yml']);
const STYLE_EXT = new Set(['.css', '.scss', '.sass', '.less']);
const SCRIPT_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.vue', '.svelte', '.astro']);
// The QA tools themselves, their reports, tool config and project docs are not what visitors read
// (scanning its own rule files would score 100; scanning its own last report makes the index climb
// on every run).
const SKIP_FILE = /^(slop-scan|slop-rules|slop-dom|slop-rules\.test|motion-audit|scroll-film|preserve|font-fallback|lint-ask|serve|selftest|gates)\.m?js$|^(slop-scan|motion-audit|gates)\.(md|json)$|^(package(-lock)?|composer|tsconfig[\w.-]*|jsconfig|vercel|netlify|wrangler|turbo|components|renovate|lerna|nx|deno)\.json$|^(README|CHANGELOG|LICENSE|AGENTS|CLAUDE|PRODUCT|DESIGN|DECISIONS|BRIEF|CONCEPT|SCROLL-SCORE|LEDGER|DIAGNOSIS|HANDOFF|ASSUMPTIONS)([.-][\w-]+)*\.md$/i;
const SKIP_DIR = /^(node_modules|dist|build|\.next|\.nuxt|\.astro|\.svelte-kit|\.git|\.vercel|\.wrangler|coverage|out|vendor|\.cache|\.turbo|storybook-static)$/;
// The skill's working folder (design/ holding BRIEF, LEDGER, film, audit…) is notes about the site.
const WORKSPACE_DOCS = ['BRIEF.md', 'CONCEPT.md', 'SCROLL-SCORE.md', 'LEDGER.md', 'DIAGNOSIS.md', 'DIAGNOSIS.rtl.md'];
const WORKSPACE_DIRS = ['film', 'audit', 'upgrade', 'probe', 'concepts', 'lab'];
// The skill's own engine is shared plumbing; its comments name techniques a project may not use.
const SECOND_ORDER_SKIP = /^(motion-engine|attribute-layer)\.js$/;

async function walk(dir, files, ctx) {
  const entries = await readdir(dir, { withFileTypes: true });
  const names = new Set(entries.map((e) => e.name));
  const rel = (p) => relative(ctx.root, p).replace(/\\/g, '/') || '.';
  // scroll-film output: film.html + meta.json + frames
  if (names.has('film.html') && names.has('meta.json')) { ctx.skipped.push(`${rel(dir)}/ (scroll-film output)`); return files; }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIR.test(entry.name)) continue;
      if (ctx.skip.has(resolve(full))) { ctx.skipped.push(`${rel(full)}/ (--out folder)`); continue; }
      if (entry.name === 'design') {
        const inner = await readdir(full).catch(() => []);
        if (inner.some((n) => WORKSPACE_DOCS.includes(n)) || inner.filter((n) => WORKSPACE_DIRS.includes(n)).length >= 2) {
          ctx.skipped.push(`${rel(full)}/ (pattern-breaker working folder)`);
          continue;
        }
      }
      await walk(full, files, ctx);
      continue;
    }
    const ext = extname(entry.name).toLowerCase();
    if (SKIP_FILE.test(entry.name)) continue;
    if (CODE_EXT.has(ext) || COPY_EXT.has(ext)) files.push(full);
  }
  return files;
}

// A joined text built from source fragments that remembers where each fragment came from, so a
// copy finding gets a real line number and a slop-ok comment next to the source line waives it.
function joinFragments(frags) {
  let text = '';
  const segs = [];
  for (const f of frags) {
    if (segs.length) text += '\n';
    segs.push({ t: text.length, s: f.s });
    text += f.text;
  }
  const toSrc = (i) => {
    if (!segs.length) return i;
    let lo = 0, hi = segs.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (segs[mid].t <= i) lo = mid; else hi = mid - 1; }
    return segs[lo].s + (i - segs[lo].t);
  };
  return { text, toSrc };
}

// A string literal is copy when it carries Hebrew, a stat, or words that are not a class list.
function looksLikeCopy(v) {
  if (v.length < 3) return false;
  if (/[א-ת]/.test(v)) return true;
  if (/^\s*[\d,.]+\s*[+%]\s*$|★/.test(v)) return true;
  if (!/\s/.test(v.trim()) || !/\p{L}/u.test(v) || /[{};]|=>/.test(v)) return false;
  const tokens = v.trim().split(/\s+/);
  const classList = tokens.every((t) => /^[!@]?[a-z0-9:_\-[\]/.%#&>()=,'"*~+]+$/.test(t)) && tokens.some((t) => /[-:[\]/\d]/.test(t));
  return !classList;
}

// Client voice in markup: blockquote, q, testimonial/review/quote components or classes, data-voice.
const VOICE_WORD = /testimon|(?<!p)review|quote/i;
const VOICE_CLASS = /\b(?:class|className)\s*=\s*\{?\s*["'`][^"'`]*?(?:testimon|(?<!p)review|quote)/i;
function voiceRanges(src) {
  const ranges = [];
  const open = /<([A-Za-z][\w.-]*)\b((?:[^>"'{}]|"[^"]*"|'[^']*'|\{[^{}]*\})*)>/g;
  for (const m of src.matchAll(open)) {
    const [whole, tag, attrs = ''] = m;
    const voice = /^(?:blockquote|q)$/i.test(tag) || VOICE_WORD.test(tag) || VOICE_CLASS.test(attrs) || /data-voice\s*=\s*["']client/i.test(attrs);
    if (!voice) continue;
    const openEnd = m.index + whole.length;
    if (/\/\s*$/.test(attrs)) { ranges.push([m.index, openEnd]); continue; }
    const tagRe = new RegExp(`<(/?)${tag.replace(/[.]/g, '\\.')}\\b(?:[^>"']|"[^"]*"|'[^']*')*?(/?)>`, 'g');
    tagRe.lastIndex = openEnd;
    let depth = 1, end = -1, x;
    while ((x = tagRe.exec(src))) {
      if (x[1]) { if (--depth === 0) { end = x.index + x[0].length; break; } } else if (!x[2]) depth++;
    }
    ranges.push([m.index, end === -1 ? Math.min(src.length, openEnd + 20000) : end]);
  }
  return ranges;
}

// Human-readable text out of a file, split into the owner's copy and the client's voice.
// Fragments are de-duplicated by source position: a quoted sentence inside a tag is one fragment.
function extractCopy(src, ext, rel) {
  const empty = { text: '', toSrc: (i) => i };
  if (PROSE_EXT.has(ext)) return { owner: { text: src, toSrc: (i) => i }, voice: empty };
  const frags = [];
  if (DATA_EXT.has(ext)) {
    if (ext === '.json') {
      for (const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"(\s*:)?/g)) {
        if (m[2]) continue; // a key, not copy
        let v = m[1];
        try { v = JSON.parse(`"${m[1]}"`); } catch { /* keep raw */ }
        if (/[\p{L}\d]/u.test(v)) frags.push({ s: m.index + 1, e: m.index + m[0].length, text: v });
      }
    } else {
      let offset = 0;
      for (const line of src.split('\n')) {
        const m = line.match(/^(\s*(?:-\s+)?(?:[\w.$-]+|"[^"]*"|'[^']*')\s*:\s+|\s*-\s+)(.+?)\s*$/);
        if (m && !m[2].startsWith('#')) {
          const v = m[2].replace(/^(["'])(.*)\1$/, '$2');
          if (/[\p{L}\d]/u.test(v)) frags.push({ s: offset + m[1].length, e: offset + line.length, text: v });
        }
        offset += line.length + 1;
      }
    }
  } else if (STYLE_EXT.has(ext)) {
    for (const m of src.matchAll(/content:\s*(["'])((?:(?!\1).)+)\1/g)) frags.push({ s: m.index, e: m.index + m[0].length, text: m[2] });
  } else {
    for (const m of src.matchAll(/>([^<>{}]{3,})</g)) if (/[\p{L}\d]/u.test(m[1])) frags.push({ s: m.index + 1, e: m.index + 1 + m[1].length, text: m[1] });
    // every literal is matched (even '' and 'x') so the tokenizer stays aligned on quote pairs
    for (const m of src.matchAll(/(["'`])((?:(?!\1)[^\\\n]|\\.)*)\1/g)) if (looksLikeCopy(m[2])) frags.push({ s: m.index + 1, e: m.index + m[0].length - 1, text: m[2] });
  }
  frags.sort((a, b) => a.s - b.s || b.e - a.e);
  const kept = [];
  let lastEnd = -1;
  for (const f of frags) if (f.s >= lastEnd) { kept.push(f); lastEnd = f.e; }
  const wholeFile = VOICE_WORD.test(basename(rel));
  const ranges = wholeFile || STYLE_EXT.has(ext) || DATA_EXT.has(ext) ? [] : voiceRanges(src);
  const inVoice = (f) => wholeFile || ranges.some(([a, b]) => f.s >= a && f.s < b);
  return { owner: joinFragments(kept.filter((f) => !inVoice(f))), voice: joinFragments(kept.filter(inVoice)) };
}

function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (index) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= index) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
}

// Text that QUOTES a tell is not using it: "is there a '✨ New' badge?" (an anti-slop checklist,
// a critique, a blog post about AI sites). Skip matches wrapped in quotes or inside a question.
// In code, a quote right after `:`, `=`, `,`, `[`, `(` or `{` opens a string value: that string is
// the copy itself (name: 'John Doe'), not a quotation of it.
const QUOTES = /["'“”„״׳`«»]/;
const EXAMPLE_CUE = /(כמו|למשל|כגון|such as|like|e\.g\.)\s*["'“„״]?\s*$/i;
const QUESTION_CUE = /(האם|יש |אומרת|כמו|is there|does|do you|are there|such as|like)/i;
function isMention(text, index, length, code = false) {
  const before = text.slice(Math.max(0, index - 2), index);
  const after = text.slice(index + length, index + length + 2);
  if (QUOTES.test(before) && QUOTES.test(after)) {
    const q = QUOTES.test(text[index - 1] || '') ? index - 1 : index - 2;
    if (!(code && /[:=,[({]\s*$/.test(text.slice(Math.max(0, q - 20), q)))) return true; // "✨ חדש"
  }
  if (EXAMPLE_CUE.test(text.slice(Math.max(0, index - 14), index))) return true; // ...כמו 99.9%
  // a checklist question that names the tell ("is there a ... badge?") is not a rhetorical hook
  const start = Math.max(text.lastIndexOf('\n', index), text.lastIndexOf('.', index - 1)) + 1;
  const rest = text.slice(index + length, index + length + 160);
  const end = rest.search(/[.!?\n]/);
  return end !== -1 && rest[end] === '?' && QUESTION_CUE.test(text.slice(start, index));
}

// A finding is a question ("justify it or change it"), never an automatic failure. A deliberate
// choice is waived with a reason next to it: `slop-ok: <rule-id> <why>` in a comment on the same or
// previous line (code), or data-slop-ok="<rule-id> <why>" on the element or an ancestor (URL mode).
function waiverAt(text, index, ruleId) {
  const lineStart = text.lastIndexOf('\n', index) + 1;
  const prevStart = text.lastIndexOf('\n', Math.max(0, lineStart - 2)) + 1;
  const lineEnd = text.indexOf('\n', index);
  const window = text.slice(prevStart, lineEnd === -1 ? undefined : lineEnd);
  for (const m of window.matchAll(/slop-ok:\s*([\w-]+)\s*([^\n*]*)/g)) {
    if (m[1] === ruleId || m[1] === 'all') return (m[2] || '').replace(/-->|\*\/|\}\s*$/g, '').trim() || 'no reason given';
  }
  return null;
}

// URL mode: a copy match inside an element carrying data-slop-ok for that rule is waived.
function domWaiver(list, ruleId, matchText) {
  const t = matchText.replace(/\s+/g, ' ').trim();
  const w = list.find((x) => (x.rule === ruleId || x.rule === 'all') && x.text.includes(t));
  return w ? `${w.label}: ${w.why}` : null;
}

// Rules with kind 'both' run once per source: on the code pass when there is one, otherwise on copy.
// Proof rules also run on the client's voice: a testimonial can carry an invented person or number.
const PROOF_RULES = new Set(['placeholder-persona', 'lorem', 'fake-round-stats']);
function runRules(text, source, kindFilter, findings, counts, waived = {}, opt = {}) {
  const { origin = text, toSrc = (i) => i, lines = kindFilter === 'code', skipBoth = false, only = null, domWaivers = null } = opt;
  const lineOf = lines ? lineIndex(origin) : null;
  for (const rule of RULES) {
    if (rule.kind === 'dom' || (rule.kind !== 'both' && rule.kind !== kindFilter)) continue;
    if (skipBoth && rule.kind === 'both') continue;
    if (only && !only.has(rule.id)) continue;
    if (rule.skipPath && rule.skipPath.test(source)) continue;
    rule.re.lastIndex = 0;
    for (const m of text.matchAll(rule.re)) {
      if ((rule.cat === 'copy' || kindFilter === 'copy') && isMention(text, m.index, m[0].length, kindFilter === 'code')) continue;
      const at = toSrc(m.index);
      const where = `${source}${lineOf ? ':' + lineOf(at) : ''}`;
      const reason = waiverAt(origin, at, rule.id) || (domWaivers && domWaiver(domWaivers, rule.id, m[0]));
      if (reason) { (waived[rule.id] ||= []).push(`${where}: ${reason}`); continue; }
      counts[rule.id] = (counts[rule.id] || 0) + 1;
      if ((findings[rule.id] ||= []).length < 6) findings[rule.id].push(`${where}: ${m[0].replace(/\s+/g, ' ').slice(0, 90)}`);
    }
  }
}

// Comments describe code; they are not the page. Stripped before the second-order pass, in one
// left-to-right pass that remembers where each kept run came from: a match in the stripped text maps
// back to its source line, where a decision waiver may sit.
function stripComments(src, ext) {
  const kinds = ['<!--[\\s\\S]*?-->'];
  if (STYLE_EXT.has(ext) || SCRIPT_EXT.has(ext) || ext === '.html' || ext === '.htm') kinds.push('\\/\\*[\\s\\S]*?\\*\\/');
  if (SCRIPT_EXT.has(ext)) kinds.push('(?<=^|[\\s;{}),])\\/\\/[^\\n]*');
  const re = new RegExp(kinds.join('|'), 'gm');
  let text = '';
  let last = 0;
  const segs = []; // [index in text, index in src] where a kept run starts
  for (const m of src.matchAll(re)) {
    segs.push([text.length, last]);
    text += `${src.slice(last, m.index)} `;
    last = m.index + m[0].length;
  }
  segs.push([text.length, last]);
  text += src.slice(last);
  const toSrc = (i) => {
    let lo = 0, hi = segs.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (segs[mid][0] <= i) lo = mid; else hi = mid - 1; }
    return segs[lo][1] + (i - segs[lo][0]);
  };
  return { text, toSrc };
}

// Structural detectors on the rendered DOM (thresholds follow React Doctor's design rules, re-expressed).
const DOM_DETECTORS = () => {
  const hits = {};
  const waived = {};
  const label = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
  const waiverOf = (el, id) => {
    const w = el.closest('[data-slop-ok]');
    if (!w) return null;
    const [rule, ...why] = w.getAttribute('data-slop-ok').split(/\s+/);
    return rule === id || rule === 'all' ? why.join(' ') || 'no reason given' : null;
  };
  const add = (id, el, detail) => {
    const why = el && waiverOf(el, id);
    if (why) { (waived[id] ||= []).push(`${label(el)}: ${why}`); return; }
    (hits[id] ||= []).push(detail);
  };
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  // 1. uniform card grids
  document.querySelectorAll('body *').forEach((el) => {
    const kids = [...el.children].filter((k) => visible(k) && k.getBoundingClientRect().width > 120);
    if (kids.length < 3 || kids.length > 16) return;
    const recipe = (k) => {
      const h = k.querySelector('h2,h3,h4,h5,h6,strong');
      const p = k.querySelector('p');
      if (!h || !p) return null;
      const cs = getComputedStyle(k);
      const surface = cs.boxShadow !== 'none' || cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.borderStyle !== 'none';
      return [k.tagName, cs.borderRadius, surface, Boolean(k.querySelector('svg,img,i,[class*="icon"]')), Math.round(k.getBoundingClientRect().width / 20)].join('|');
    };
    const recipes = kids.map(recipe);
    if (recipes.every(Boolean) && new Set(recipes).size === 1) add('uniform-card-grid', el, `${label(el)} ×${kids.length}`);
  });
  // 2. repeated section shells
  const secs = [...document.querySelectorAll('section')].filter(visible);
  if (secs.length >= 4) {
    const shell = (s) => {
      const cs = getComputedStyle(s);
      const inner = s.firstElementChild ? getComputedStyle(s.firstElementChild) : null;
      return [cs.paddingTop, cs.paddingBottom, inner ? inner.maxWidth : 'none', inner ? inner.marginLeft === inner.marginRight : false].join('|');
    };
    const tally = {};
    secs.forEach((s) => { const k = shell(s); tally[k] = (tally[k] || 0) + 1; });
    const [top, n] = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
    if (n >= 3 && n / secs.length >= 0.6) add('repeated-section-shells', secs[0], `${n}/${secs.length} sections share "${top}"`);
  }
  // 3. kicker labels above headings
  const kickers = [...document.querySelectorAll('h1,h2,h3')].map((h) => h.previousElementSibling).filter((k) => {
    if (!k || !visible(k)) return false;
    const cs = getComputedStyle(k);
    const t = (k.textContent || '').trim();
    return t.length > 0 && t.length <= 48 && parseFloat(cs.fontSize) <= 14 && (cs.textTransform === 'uppercase' || parseFloat(cs.letterSpacing) / parseFloat(cs.fontSize) >= 0.05);
  });
  if (kickers.length >= 3) add('kicker-labels', kickers[0], `${kickers.length} labels, e.g. "${kickers.slice(0, 3).map((k) => k.textContent.trim().slice(0, 30)).join('", "')}"`);
  // 4. centred long copy
  const centred = [...document.querySelectorAll('p')].filter((p) => visible(p) && (p.textContent || '').trim().length >= 48 && getComputedStyle(p).textAlign === 'center');
  if (centred.length >= 3) add('centred-copy', centred[0], `${centred.length} centred paragraphs`);
  // 5. flat type scale
  const size = (sel) => { const el = [...document.querySelectorAll(sel)].find(visible); return el ? parseFloat(getComputedStyle(el).fontSize) : 0; };
  const body = size('p') || 16;
  const biggest = Math.max(size('h1'), size('h2'), size('h3'));
  if (biggest && biggest / body < 2) add('flat-type-scale', document.querySelector('h1,h2'), `largest heading ${biggest}px vs body ${body}px (${(biggest / body).toFixed(2)}×)`);
  // 6. font families
  const fams = new Set();
  document.querySelectorAll('h1,h2,h3,h4,p,a,button,li,span,label').forEach((el, i) => { if (i < 2500 && visible(el)) fams.add(getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase()); });
  if (fams.size >= 4) add('too-many-families', document.body, [...fams].join(', '));
  // 7. arrow CTAs and 8. dot meta strings
  const arrows = [...document.querySelectorAll('a,button')].filter((a) => visible(a) && /[→↗←↘➔⟶]\s*$|^\s*[→↗←]/.test((a.textContent || '').trim()));
  if (arrows.length >= 3) add('arrow-ctas', arrows[0], `${arrows.length}× e.g. "${(arrows[0].textContent || '').trim().slice(0, 30)}"`);
  const dots = [...document.querySelectorAll('span,small,p,div,li')].filter((el) => el.children.length === 0 && visible(el) && /^[^·]{1,30}\s·\s[^·]{1,30}(\s·\s[^·]{1,30})*$/.test((el.textContent || '').trim()));
  if (dots.length >= 3) add('dot-meta-strings', dots[0], `${dots.length}× e.g. "${(dots[0].textContent || '').trim().slice(0, 40)}"`);
  return { hits, waived };
};

// A second-order waiver must name the signal and a logged decision: slop-ok:<rule> decision:D<n> <why>
// in a comment, or data-slop-ok="<rule> decision:D<n> <why>" in markup, on the same or the previous
// line. "all" does not work here: each look is its own decision.
function decisionWaiverAt(text, index, ruleId) {
  const lineStart = text.lastIndexOf('\n', index) + 1;
  const prevStart = text.lastIndexOf('\n', Math.max(0, lineStart - 2)) + 1;
  const lineEnd = text.indexOf('\n', index);
  const window = text.slice(prevStart, lineEnd === -1 ? undefined : lineEnd);
  for (const m of window.matchAll(/(?:slop-ok:\s*|data-slop-ok=["'])([\w-]+)\s+decision:\s*(D\d+)\b([^\n*"']*)/g)) {
    if (m[1] === ruleId) return { decision: m[2], reason: (m[3] || '').replace(/-->|\*\/|\}\s*$/g, '').trim() || 'no reason given' };
  }
  return null;
}

// Second-order signals are not waived by a plain slop-ok: each is fine alone, and a page of separately
// excused "tasteful" defaults is exactly the template this pass exists to catch. A logged decision
// (decision:D<n>) does waive one, and the waived occurrences are collected for their own report
// section. A plain slop-ok next to a second-order hit is recorded as ignored, so its author sees why.
// opt: origin (the unstripped source), toSrc (stripped index -> origin index), source (file label),
// lines (report line numbers), domRanges (URL mode: elements carrying a decision waiver).
function runSecondOrder(text, hits, opt = {}) {
  const { origin = text, toSrc = (i) => i, source = '', lines = false, domRanges = null, decided = {}, plain = {}, where = {} } = opt;
  const lineOf = lines ? lineIndex(origin) : null;
  for (const s of SECOND_ORDER) {
    const re = s.re.global ? s.re : new RegExp(s.re.source, `${s.re.flags}g`);
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) {
      const at = toSrc(m.index);
      const place = `${source}${lineOf ? `:${lineOf(at)}` : ''}`;
      const d = decisionWaiverAt(origin, at, s.id) || (domRanges && domRanges.find((r) => r.rule === s.id && at >= r.start && at < r.end));
      if (d) { (decided[s.id] ||= []).push(`${place || d.label}, ${d.decision}: ${d.reason}`); continue; }
      if (waiverAt(origin, at, s.id)) (plain[s.id] ||= []).push(place || 'dom');
      if (!hits[s.id]) { hits[s.id] = m[0].replace(/\s+/g, ' ').slice(0, 70); where[s.id] = place; }
    }
  }
}

// Presence matters more than repetition (forty identical classes are one decision), and no single
// category can carry the verdict alone: the template look is many defaults agreeing with each other.
const CATEGORY_CAP = { colour: 25, type: 20, surface: 20, icon: 20, layout: 15, motion: 10, imagery: 15, copy: 25 };
function score(counts) {
  const byCat = {};
  const breakdown = [];
  for (const rule of RULES) {
    const n = counts[rule.id] || 0;
    if (!n) continue;
    if (rule.count && n < rule.count) continue; // only a tell when repeated
    const repeats = rule.count ? 0 : Math.min(n, rule.max) - 1;
    const points = rule.w * 5 + repeats * rule.w;
    const cat = rule.cat === 'icon' ? 'surface' : rule.cat;
    byCat[cat] = (byCat[cat] || 0) + points;
    breakdown.push({ id: rule.id, hits: n, points });
  }
  const index = Math.min(100, Object.entries(byCat).reduce((s, [cat, p]) => s + Math.min(p, CATEGORY_CAP[cat] ?? 15), 0));
  return { index, byCat, breakdown: breakdown.sort((a, b) => b.points - a.points) };
}

// A folder is walked; a single file is scanned as named (the skip list does not apply to it).
async function scanPath(target) {
  const abs = resolve(target);
  const st = await stat(abs).catch(() => null);
  if (!st) usage(`not found: ${target}`);
  const ctx = { root: abs, skip: new Set(args.out ? [resolve(String(args.out))] : []), skipped: [] };
  let files;
  if (st.isFile()) {
    const ext = extname(abs).toLowerCase();
    if (!CODE_EXT.has(ext) && !COPY_EXT.has(ext) && ext !== '.txt') usage(`${target}: slop-scan reads ${[...CODE_EXT, ...COPY_EXT, '.txt'].join(' ')}`);
    ctx.root = dirname(abs);
    files = [abs];
  } else if (st.isDirectory()) {
    files = await walk(abs, [], ctx);
  } else usage(`${target} is neither a file nor a folder`);
  const findings = {}, counts = {}, second = {}, waived = {}, secondWaived = {}, secondPlain = {}, secondWhere = {};
  for (const f of files) {
    const s = await stat(f);
    if (s.size > 1_500_000) continue;
    const src = await readFile(f, 'utf8');
    if (/^\s*\{\s*"takenAt"\s*:/.test(src)) continue; // a preserve.mjs snapshot: the site's own text, copied
    const ext = extname(f).toLowerCase();
    const rel = relative(ctx.root, f).replace(/\\/g, '/');
    const code = CODE_EXT.has(ext);
    if (code) runRules(src, rel, 'code', findings, counts, waived);
    const { owner, voice } = extractCopy(src, ext, rel);
    runRules(owner.text, rel, 'copy', findings, counts, waived, { origin: src, toSrc: owner.toSrc, lines: true, skipBoth: code });
    if (voice.text) runRules(voice.text, `${rel} (client voice)`, 'copy', findings, counts, waived, { origin: src, toSrc: voice.toSrc, lines: true, skipBoth: code, only: PROOF_RULES });
    if (!SECOND_ORDER_SKIP.test(basename(f))) {
      const stripped = code ? stripComments(src, ext) : { text: src, toSrc: (i) => i };
      runSecondOrder(stripped.text, second, { origin: src, toSrc: stripped.toSrc, source: rel, lines: true, decided: secondWaived, plain: secondPlain, where: secondWhere });
    }
  }
  return { target: st.isFile() ? abs : ctx.root, files: files.length, findings, counts, second, secondWhere, secondWaived, secondPlain, waived, skipped: ctx.skipped };
}

function loadPuppeteer() {
  const bases = [import.meta.url, join(process.cwd(), 'noop.js')];
  try { bases.push(join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'noop.js')); } catch { /* none */ }
  for (const base of bases) { try { return createRequire(base)('puppeteer'); } catch { /* next */ } }
  console.error('puppeteer not found: URL mode needs it (npm i -D puppeteer).');
  process.exit(1);
}

// URL mode: what the visitor actually receives, whatever built it (WordPress, Wix, Webflow, Lovable…).
class LoadError extends Error {}
async function openOrExplain(page, url) {
  let resp = null;
  try {
    resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
  } catch (e) {
    // A busy live site (chat widget, analytics polling) may never go network-idle: that is not a failed load.
    if (e.name !== 'TimeoutError' && !/timeout/i.test(e.message)) throw new LoadError(`could not load ${url}: ${e.message}`);
    console.error(`warning: ${url} never went network-idle within 90 s; scanning what has loaded`);
  }
  if (resp && resp.status() >= 400) throw new LoadError(`${url} answered HTTP ${resp.status()}; a scan of an error page proves nothing`);
  await new Promise((r) => setTimeout(r, 3000));
  const state = await page.evaluate(() => ({ ready: document.readyState, chars: ((document.body && document.body.innerText) || '').trim().length }));
  if (state.ready === 'loading' || state.chars <= 80) throw new LoadError(`${url} rendered ${state.chars} characters of text (readyState ${state.ready}); a scan of an empty or error page proves nothing`);
}

async function scanUrl(url) {
  if (!/^(https?|file):/i.test(url)) usage(`--url needs an http(s) or file URL, got "${url}"`);
  const puppeteer = loadPuppeteer();
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    await openOrExplain(page, url);
    const dom = await page.evaluate(() => {
      const fam = (el) => (el ? getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim() : '');
      const grads = new Set();
      document.querySelectorAll('body *').forEach((el, i) => {
        if (i > 6000) return;
        const bi = getComputedStyle(el).backgroundImage;
        if (bi && bi.includes('gradient')) grads.add(bi.slice(0, 160));
      });
      const headings = [...document.querySelectorAll('h1,h2,h3')].slice(0, 40).map((h) => h.textContent.trim().replace(/\s+/g, ' ').slice(0, 160));
      // client voice: testimonials and quotes are not the owner's copy (only the proof rules read them)
      const v = [...document.querySelectorAll('blockquote, q, [class*="testimon" i], [class*="review" i]:not([class*="preview" i]), [class*="quote" i], [data-voice="client"]')].filter((n) => !n.parentElement || !n.parentElement.closest('blockquote, q, [class*="testimon" i], [class*="review" i]:not([class*="preview" i]), [class*="quote" i], [data-voice="client"]'));
      const voice = v.map((n) => n.innerText).join('\n');
      const prev = v.map((n) => n.style.display);
      v.forEach((n) => { n.style.display = 'none'; });
      const text = document.body.innerText;
      v.forEach((n, i) => { n.style.display = prev[i]; });
      const label = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`;
      const waivers = [...document.querySelectorAll('[data-slop-ok]')].map((el) => {
        const [rule, ...why] = el.getAttribute('data-slop-ok').trim().split(/\s+/);
        return { rule, why: why.join(' ') || 'no reason given', label: label(el), text: (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim() };
      });
      // Second-order decision waivers: data-slop-ok="<rule> decision:D<n> <why>". Their outerHTML is
      // located in the page HTML below, so a match inside the element is waived.
      const decisions = [...document.querySelectorAll('[data-slop-ok]')].map((el) => {
        const m = el.getAttribute('data-slop-ok').trim().match(/^([\w-]+)\s+decision:\s*(D\d+)\b\s*(.*)$/);
        return m ? { rule: m[1], decision: m[2], reason: m[3] || 'no reason given', label: label(el), html: el.outerHTML } : null;
      }).filter(Boolean);
      return {
        html: document.documentElement.outerHTML,
        decisions,
        text,
        voice,
        waivers,
        headingFont: fam(document.querySelector('h1') || document.querySelector('h2')),
        bodyFont: fam(document.querySelector('p') || document.body),
        gradients: [...grads].slice(0, 30),
        headings,
      };
    });
    const findings = {}, counts = {}, second = {}, waived = {}, secondWaived = {}, secondPlain = {}, secondWhere = {};
    runRules(dom.html, 'dom', 'code', findings, counts, waived);
    runRules(dom.text, 'text', 'copy', findings, counts, waived, { skipBoth: true, domWaivers: dom.waivers });
    if (dom.voice) runRules(dom.voice, 'client voice', 'copy', findings, counts, waived, { skipBoth: true, only: PROOF_RULES, domWaivers: dom.waivers });
    runRules(dom.gradients.map((g) => g.replace(/rgb\((\d+), (\d+), (\d+)\)/g, (_, r, g2, b) => '#' + [r, g2, b].map((n) => (+n).toString(16).padStart(2, '0')).join(''))).join('\n'), 'computed-gradients', 'code', findings, counts, waived);
    const domRanges = [];
    for (const d of dom.decisions) {
      for (let i = dom.html.indexOf(d.html); i !== -1; i = dom.html.indexOf(d.html, i + 1)) domRanges.push({ ...d, start: i, end: i + d.html.length });
    }
    runSecondOrder(dom.html, second, { source: '', domRanges, decided: secondWaived, plain: secondPlain, where: secondWhere });
    const fonts = `font-family: ${dom.headingFont}; font-family: ${dom.bodyFont};`;
    runRules(fonts, 'computed-fonts', 'code', findings, counts, waived);
    // Structural detectors see the rendered page regardless of the stack that produced it.
    const structural = await page.evaluate(DOM_DETECTORS);
    for (const [id, list] of Object.entries(structural.hits)) {
      counts[id] = (counts[id] || 0) + list.length;
      findings[id] = [...(findings[id] || []), ...list.slice(0, 6)];
    }
    for (const [id, list] of Object.entries(structural.waived)) waived[id] = [...(waived[id] || []), ...list];
    const structural2 = await page.evaluate(DOM_DETECTORS_2);
    for (const [id, list] of Object.entries(structural2.hits)) {
      counts[id] = (counts[id] || 0) + list.length;
      findings[id] = [...(findings[id] || []), ...list.slice(0, 6)];
    }
    for (const [id, list] of Object.entries(structural2.waived)) waived[id] = [...(waived[id] || []), ...list];
    return { target: url, files: 1, findings, counts, second, secondWhere, secondWaived, secondPlain, waived, fonts: { heading: dom.headingFont, body: dom.bodyFont }, headings: dom.headings };
  } finally {
    await browser.close();
  }
}

function report(r) {
  const s = score(r.counts);
  const secondHits = Object.keys(r.second);
  const waivedIds = Object.keys(r.secondWaived || {});
  const decisionsOf = (id) => [...new Set(r.secondWaived[id].map((e) => (e.match(/, (D\d+):/) || [])[1]).filter(Boolean))].join(', ');
  const waivedNote = waivedIds.length ? ` · waived by decision: ${waivedIds.map((id) => `${id} (${decisionsOf(id)})`).join(', ')}` : '';
  const band = s.index <= 20 ? 'clean of known defaults' : s.index <= 45 ? 'some template tells' : s.index <= 70 ? 'generic' : 'AI-default template';
  const lines = [
    `# slop-scan: ${r.target}`,
    '',
    `**Slop Index ${s.index}/100: ${band}** · ${r.files} file(s) scanned${r.skipped?.length ? ` · skipped: ${r.skipped.join(', ')}` : ''}`,
    secondHits.length >= 3
      ? `**Second-order slop: ${secondHits.length}/${SECOND_ORDER.length} "tasteful-AI" signals together**: ${secondHits.join(', ')}. Not wrong individually; together they read as the anti-slop template. Make sure each one is demanded by THIS brand's concept.${waivedNote}`
      : `Second-order signals: ${secondHits.length ? secondHits.join(', ') : 'none'}${waivedNote}`,
    '',
  ];
  if (r.fonts) lines.push(`Rendered fonts: headings: ${r.fonts.heading || '?'}, body: ${r.fonts.body || '?'}`, '');
  if (s.breakdown.length) {
    lines.push('| rule | hits | points | what it means |', '|---|---|---|---|');
    for (const b of s.breakdown) lines.push(`| ${b.id} | ${b.hits} | ${b.points} | ${RULES.find((x) => x.id === b.id).msg} |`);
    lines.push('', '## Evidence');
    for (const b of s.breakdown) {
      lines.push(`### ${b.id}`);
      for (const e of r.findings[b.id] || []) lines.push(`- ${e}`);
    }
  }
  const ruleWaivedIds = Object.keys(r.waived || {});
  if (ruleWaivedIds.length) {
    lines.push('', '## Waived with a reason (not scored)');
    for (const id of ruleWaivedIds) for (const w of r.waived[id].slice(0, 5)) lines.push(`- ${id}: ${w}`);
  }
  if (secondHits.length) {
    lines.push('', '## Second-order signals');
    for (const id of secondHits) lines.push(`- ${id} (${SECOND_ORDER.find((x) => x.id === id).msg}): \`${r.second[id]}\`${r.secondWhere?.[id] ? ` at ${r.secondWhere[id]}` : ''}`);
  }
  if (waivedIds.length) {
    lines.push('', `## Second-order signals waived by decision (${waivedIds.length}, not in the count above)`);
    for (const id of waivedIds) {
      const list = r.secondWaived[id];
      lines.push(`- ${id} (${SECOND_ORDER.find((x) => x.id === id).msg}): ${list.length} occurrence${list.length === 1 ? '' : 's'}`);
      for (const w of list.slice(0, 5)) lines.push(`  - ${w}`);
    }
  }
  const plainIds = Object.keys(r.secondPlain || {}).filter((id) => secondHits.includes(id));
  if (plainIds.length) {
    lines.push('', '## Plain slop-ok on second-order signals (ignored: these need decision:D<n>)');
    for (const id of plainIds) lines.push(`- ${id}: ${[...new Set(r.secondPlain[id])].slice(0, 5).join(', ')}`);
  }
  return { md: lines.join('\n'), index: s.index, band, second: secondHits, secondWaived: waivedIds };
}

let result;
try {
  result = args.url ? await scanUrl(args.url) : await scanPath(TARGET);
} catch (e) {
  if (!(e instanceof LoadError)) throw e;
  console.error(e.message);
  process.exit(2);
}
const out = report(result);
if (args.out) {
  await mkdir(resolve(args.out), { recursive: true });
  await writeFile(join(resolve(args.out), 'slop-scan.md'), out.md);
  await writeFile(join(resolve(args.out), 'slop-scan.json'), JSON.stringify({ ...result, index: out.index, band: out.band, secondOrder: out.second, secondOrderWaived: result.secondWaived }, null, 2));
}
console.log(args.json ? JSON.stringify({ index: out.index, band: out.band, secondOrder: out.second, secondOrderWaived: result.secondWaived }) : out.md);
if (args['fail-above'] !== undefined && out.index > Number(args['fail-above'])) process.exit(1);
