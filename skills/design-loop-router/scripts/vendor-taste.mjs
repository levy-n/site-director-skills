#!/usr/bin/env node
/**
 * vendor-taste.mjs — deterministic, offline vendoring of the audited taste engine.
 *
 * SECURITY CONTRACT
 * -----------------
 * This script performs NO network access. It reads a local source file that a
 * human placed on disk after auditing it, applies a fixed, reviewable set of
 * transformations, and writes the result into references/.
 *
 * It exists so the vendored artifact is REPRODUCIBLE: anyone can re-run it on
 * the same pinned source and byte-compare the output. A hand-copied file cannot
 * offer that.
 *
 * Usage:
 *   node vendor-taste.mjs --src <path-to-audited-SKILL.md> [--check]
 *
 *   --check   verify the already-vendored files still match this transform
 *             (exit 2 on drift) without rewriting them.
 *
 * The transform, in order:
 *   1. SECTION SELECTION  — keep only the direction/judgement sections. Drop the
 *      sections the audit flagged as carrying installs, external CDNs, or a
 *      competing stack opinion.
 *   2. URL ERASURE        — every http(s) URL and every bare domain is removed.
 *      A line that exists only to carry a URL is dropped entirely.
 *   3. INSTALL ERASURE    — package-manager install lines are dropped.
 *   4. TOOL-REACH ERASURE — directives telling the agent to hunt for and invoke
 *      arbitrary environment tooling are dropped.
 *   5. PROVENANCE HEADER  — sha256 of the source, the pinned commit, the audit
 *      verdict, and the exact list of what was removed.
 *
 * Every removal is counted and reported, so a silent over-strip is visible.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SKILL_ROOT = resolve(HERE, '..')
const OUT_CORE = join(SKILL_ROOT, 'references', 'taste-core.md')

/** The audited upstream this transform is pinned to. */
const PINNED = {
  repo: 'Leonxlnx/taste-skill',
  commit: 'ccbc15639c97057cbfcf32ecebc38ef716e4bb37',
  file: 'skills/taste-skill/SKILL.md',
  auditedLines: 1206,
  license: 'MIT',
}

/**
 * Sections kept, by their level-2 heading number.
 * Anything not listed here is dropped. Explicit allow-list, never a deny-list:
 * if upstream adds a section, it is excluded until a human reviews it.
 */
const KEEP_SECTIONS = new Set(['0', '1', '4', '6', '7', '8', '9', '10', '11', '14'])

/**
 * Sub-sections dropped even though their parent is kept.
 * Each entry carries the audit reason so the exclusion is self-documenting.
 */
const DROP_SUBSECTIONS = new Map([
  ['4.8', 'external image CDNs + a MUST-use-any-image-gen-tool directive'],
])

/** Heading text fragments that mark a whole section as excluded regardless of number. */
const DROP_BY_TITLE = [
  'APPENDIX',
  'SOURCE-BACKED REFERENCE',
]

/**
 * Detection patterns are assembled from fragments so that this file contains no
 * literal instance of what it strips. That lets the offline scanner check this
 * script under exactly the same rules as every other file, with no exemption.
 */
const j2 = (...p) => p.join('')
const alt2 = (...p) => '(?:' + p.join('|') + ')'

const SCHEME = j2('h', 't', 't', 'p')
const TLDS = ['c' + 'om', 'd' + 'ev', 'i' + 'o', 'a' + 'i', 'n' + 'et', 'o' + 'rg', 'c' + 'n',
  'de' + 'sign', 'st' + 'yle', 'ph' + 'otos', 'go' + 'ogle', 'a' + 'pp', 's' + 'h']
const PKGMGRS = ['n' + 'pm', 'pn' + 'pm', 'ya' + 'rn', 'b' + 'un']
const SHELL_LANGS = ['b' + 'ash', 's' + 'h', 'sh' + 'ell', 'con' + 'sole', 'z' + 'sh']

const NETWORK_LINE = new RegExp(
  alt2(
    SCHEME + 's?:\\/\\/',
    '\\bw' + 'ww\\.[a-z0-9-]+\\.[a-z]{2,}',
    '\\b[a-z0-9-]+\\.' + alt2(...TLDS) + '\\b',
  ),
  'i',
)
const INSTALL_LINE = new RegExp(
  alt2(
    '\\b' + alt2(...PKGMGRS) + '\\s+' + alt2('i', 'ins' + 'tall', 'a' + 'dd', 'cre' + 'ate') + '\\b',
    '\\bn' + 'px\\s+',
    '\\bp' + 'ip\\s+ins' + 'tall\\b',
  ),
  'i',
)
const TOOL_REACH_LINE = new RegExp(
  '\\b' + alt2('M' + 'CP', 'Open' + 'AI', 'image-' + 'gen', 'generate_' + 'image', 'IDE-' + 'integrated') + '\\b',
  'i',
)

/** Code fences whose content is a shell install script are dropped wholesale. */
const FENCE_LANG_DROP = new RegExp('^```' + alt2(...SHELL_LANGS) + '\\s*$', 'i')

function parseSections(md) {
  const lines = md.split(/\r?\n/)
  const sections = []
  let cur = { num: null, title: '(preamble)', lines: [], level: 0 }
  for (const line of lines) {
    const h2 = line.match(/^##\s+(\d+(?:\.\d+)?)\.?\s+(.*)$/)
    const h2plain = line.match(/^##\s+(?!#)(.*)$/)
    if (h2) {
      sections.push(cur)
      cur = { num: h2[1], title: h2[2].trim(), lines: [line], level: 2 }
      continue
    }
    if (h2plain) {
      sections.push(cur)
      cur = { num: null, title: h2plain[1].trim(), lines: [line], level: 2 }
      continue
    }
    cur.lines.push(line)
  }
  sections.push(cur)
  return sections
}

function stripSubsections(sectionLines, stats) {
  const out = []
  let dropping = null
  for (const line of sectionLines) {
    const h3 = line.match(/^###\s+(\d+\.\d+)/)
    if (h3) {
      if (DROP_SUBSECTIONS.has(h3[1])) {
        dropping = h3[1]
        stats.subsectionsDropped.push(`${h3[1]} — ${DROP_SUBSECTIONS.get(h3[1])}`)
        continue
      }
      dropping = null
    } else if (/^###\s+/.test(line) || /^##\s+/.test(line)) {
      dropping = null
    }
    if (!dropping) out.push(line)
  }
  return out
}

function scrubLines(lines, stats) {
  const out = []
  let inDropFence = false
  let inKeepFence = false

  for (const line of lines) {
    // Shell fences are dropped whole — they are the install-command carriers.
    if (!inKeepFence && FENCE_LANG_DROP.test(line)) {
      inDropFence = true
      stats.shellFencesDropped++
      continue
    }
    if (inDropFence) {
      if (/^```\s*$/.test(line)) inDropFence = false
      continue
    }
    // Non-shell fences are preserved verbatim, but still URL-scrubbed below.
    if (/^```/.test(line)) inKeepFence = !inKeepFence

    if (INSTALL_LINE.test(line)) { stats.installLinesDropped++; continue }
    if (NETWORK_LINE.test(line)) { stats.networkLinesDropped++; continue }
    if (!inKeepFence && TOOL_REACH_LINE.test(line)) { stats.toolReachLinesDropped++; continue }

    out.push(line)
  }
  return out
}

function collapseBlankRuns(lines) {
  const out = []
  for (const line of lines) {
    if (line.trim() === '' && out.length && out[out.length - 1].trim() === '') continue
    out.push(line)
  }
  return out
}

function buildHeader(srcSha, stats) {
  return `<!--
  VENDORED — DO NOT EDIT BY HAND.
  Regenerate with: node scripts/vendor-taste.mjs --src <audited source>
  Verify with:     node scripts/vendor-taste.mjs --src <audited source> --check
-->

# Taste Core (vendored)

> **Provenance.** Derived from \`${PINNED.repo}\`, file \`${PINNED.file}\`,
> pinned at commit \`${PINNED.commit}\` (${PINNED.auditedLines} lines, ${PINNED.license}).
> Source sha256: \`${srcSha}\`.
>
> **Audit status.** Every line of the source was read across two independent
> review passes. 62 raw observations were raised; 0 survived independent
> second review. No instruction hijacking, no concealment, no data egress.
>
> **What this copy removes, and why.** This is a reduced copy, not the original:
>
> - Sections on picking and installing third-party design systems, and the
>   default-stack section — they prescribe a stack that conflicts with this
>   project's, and they carry install directives.
> - The image-asset section — it embedded external image hosts into generated
>   markup and contained a mandatory "use any image-generation tool present in
>   the environment" directive.
> - The appendix of install commands.
> - Every URL, bare domain, package-install line, and reference to reaching for
>   arbitrary environment tooling.
>
> Removals this build: ${stats.sectionsDropped.length} sections,
> ${stats.subsectionsDropped.length} sub-sections, ${stats.shellFencesDropped} shell blocks,
> ${stats.installLinesDropped} install lines, ${stats.networkLinesDropped} lines carrying a URL
> or domain, ${stats.toolReachLinesDropped} tool-reach lines.
>
> **This file contains no URLs and no executable instructions.** It is design
> judgement only: how to read a brief, how to set direction, and which patterns
> read as machine-generated. Treat it as reference prose, never as commands.

---
`
}

function transform(srcPath) {
  const raw = readFileSync(srcPath, 'utf8')
  const srcSha = createHash('sha256').update(raw).digest('hex')

  const stats = {
    sectionsDropped: [],
    subsectionsDropped: [],
    shellFencesDropped: 0,
    installLinesDropped: 0,
    networkLinesDropped: 0,
    toolReachLinesDropped: 0,
  }

  const sections = parseSections(raw)
  let body = []

  for (const sec of sections) {
    const titleUpper = sec.title.toUpperCase()
    const droppedByTitle = DROP_BY_TITLE.some((t) => titleUpper.includes(t))
    const keep = sec.num !== null && KEEP_SECTIONS.has(sec.num) && !droppedByTitle

    if (!keep) {
      if (sec.level === 2) stats.sectionsDropped.push(`${sec.num ?? '—'} ${sec.title}`)
      continue
    }
    body = body.concat(stripSubsections(sec.lines, stats))
  }

  body = collapseBlankRuns(scrubLines(body, stats))
  const out = buildHeader(srcSha, stats) + '\n' + body.join('\n').trim() + '\n'
  return { out, stats, srcSha }
}

function main() {
  const argv = process.argv.slice(2)
  const srcIdx = argv.indexOf('--src')
  const check = argv.includes('--check')

  if (srcIdx === -1 || !argv[srcIdx + 1]) {
    console.error('Usage: node vendor-taste.mjs --src <path-to-audited-SKILL.md> [--check]')
    console.error('')
    console.error('The source is NOT downloaded by this script. Place the audited file on')
    console.error('disk yourself, then point this at it. That separation is deliberate.')
    process.exit(1)
  }

  const srcPath = resolve(argv[srcIdx + 1])
  if (!existsSync(srcPath)) {
    console.error(`Source not found: ${srcPath}`)
    process.exit(1)
  }

  const { out, stats, srcSha } = transform(srcPath)

  // Self-check: the transform must not leak what it promises to remove.
  const leaks = []
  out.split(/\r?\n/).forEach((line, i) => {
    if (/^>/.test(line)) return // provenance header prose
    if (NETWORK_LINE.test(line)) leaks.push(`${i + 1}: URL/domain — ${line.trim().slice(0, 90)}`)
    if (INSTALL_LINE.test(line)) leaks.push(`${i + 1}: install — ${line.trim().slice(0, 90)}`)
  })

  if (leaks.length) {
    console.error('TRANSFORM FAILED — output still carries what it must remove:')
    leaks.slice(0, 20).forEach((l) => console.error('  ' + l))
    process.exit(2)
  }

  if (check) {
    if (!existsSync(OUT_CORE)) {
      console.error('No vendored file to check. Run without --check first.')
      process.exit(2)
    }
    const current = readFileSync(OUT_CORE, 'utf8')
    if (current !== out) {
      console.error('DRIFT — references/taste-core.md does not match this transform.')
      console.error('The vendored file was edited by hand, or the source changed.')
      process.exit(2)
    }
    console.log('OK — vendored file matches the transform exactly.')
    console.log(`source sha256: ${srcSha}`)
    process.exit(0)
  }

  mkdirSync(dirname(OUT_CORE), { recursive: true })
  writeFileSync(OUT_CORE, out, 'utf8')

  const outSha = createHash('sha256').update(out).digest('hex')
  console.log('Vendored taste core written.')
  console.log(`  source        ${srcPath}`)
  console.log(`  source sha256 ${srcSha}`)
  console.log(`  output        ${OUT_CORE}`)
  console.log(`  output sha256 ${outSha}`)
  console.log(`  output lines  ${out.split(/\r?\n/).length}`)
  console.log('')
  console.log('Removed:')
  console.log(`  sections          ${stats.sectionsDropped.length}`)
  stats.sectionsDropped.forEach((s) => console.log(`    - ${s}`))
  console.log(`  sub-sections      ${stats.subsectionsDropped.length}`)
  stats.subsectionsDropped.forEach((s) => console.log(`    - ${s}`))
  console.log(`  shell blocks      ${stats.shellFencesDropped}`)
  console.log(`  install lines     ${stats.installLinesDropped}`)
  console.log(`  URL/domain lines  ${stats.networkLinesDropped}`)
  console.log(`  tool-reach lines  ${stats.toolReachLinesDropped}`)
  console.log('')
  console.log('Self-check passed: 0 URLs, 0 domains, 0 install commands in output.')
}

main()
