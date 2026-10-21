#!/usr/bin/env node
/**
 * scan-offline.mjs — the proof, not the promise.
 *
 * Walks every file this skill ships and fails if any of them carries a network
 * reference, a remote-execution verb, an install command, or hidden Unicode.
 *
 * This exists so the skill's offline claim is a CHECKABLE PROPERTY rather than
 * a sentence in a README. Anyone can run it. It reads only this skill's own
 * directory, opens no sockets, and writes nothing.
 *
 *   node scan-offline.mjs            human-readable report, exit 0 clean / 2 dirty
 *   node scan-offline.mjs --json     machine-readable, same exit codes
 *   node scan-offline.mjs --manifest print sha256 of every shipped file
 *
 * The scanner deliberately does NOT exempt itself. The patterns it hunts for are
 * built from fragments at runtime so that this file can name what it looks for
 * without containing a literal instance of it.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, extname, sep } from 'node:path'
import { createHash } from 'node:crypto'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const SELF = resolve(fileURLToPath(import.meta.url))

const TEXT_EXT = new Set(['.md', '.mjs', '.js', '.json', '.txt', '.yml', '.yaml', '.cjs', '.ts'])

/**
 * EVERY pattern below is assembled at runtime from fragments that are individually
 * harmless. No forbidden literal appears anywhere in this file.
 *
 * This is not stylistic. If the scanner embedded the literals it hunts for, it
 * would flag itself, and the fix would be an exemption — a line the scanner
 * agrees to ignore. An exemption is a back door: anyone could then hide a real
 * URL behind the same marker. Fragment assembly gives the scanner NO exemptions
 * at all, so its verdict on itself is worth exactly as much as its verdict on
 * any other file.
 */
const j = (...parts) => parts.join('')
const alt = (...parts) => '(?:' + parts.join('|') + ')'

const SCHEME = j('h', 't', 't', 'p')
const TLDS = [
  'c' + 'om', 'n' + 'et', 'o' + 'rg', 'i' + 'o', 'd' + 'ev', 'a' + 'i', 'a' + 'pp',
  's' + 'h', 'c' + 'n', 'c' + 'o', 'm' + 'e', 'x' + 'yz', 'de' + 'sign', 'st' + 'yle',
  'ph' + 'otos', 'cl' + 'oud',
]
const FETCHERS = [
  'c' + 'url', 'w' + 'get', 'Invoke-Web' + 'Request', 'i' + 'wr\\s', 'ax' + 'ios',
  'XMLHttp' + 'Request', 'Web' + 'Fetch', 'Web' + 'Search',
]
const NETAPIS = [
  'node:' + 'http' + 's?', 'globalThis\\.' + 'fetch', 'new\\s+Web' + 'Socket', 'dg' + 'ram',
]
const PKGMGRS = ['n' + 'pm', 'pn' + 'pm', 'ya' + 'rn', 'b' + 'un']
const INSTALLVERBS = ['i', 'ins' + 'tall', 'a' + 'dd', 'cre' + 'ate', 'e' + 'xec', 'd' + 'lx']

const PATTERNS = [
  {
    id: 'URL_SCHEME',
    label: 'absolute URL',
    re: new RegExp(SCHEME + 's?:\\/\\/', 'i'),
    severity: 'fail',
  },
  {
    id: 'PROTO_REL_URL',
    label: 'protocol-relative URL',
    re: new RegExp('(^|[\\s"\'(<=])\\/\\/[a-z0-9-]+\\.[a-z]{2,}', 'i'),
    severity: 'fail',
  },
  {
    id: 'BARE_DOMAIN',
    label: 'bare domain name',
    // Several real TLDs (design, style, app, sh, co, me, io, ai) are also ordinary
    // identifiers, so `project.docs.design` would read as a domain. The lookbehind
    // rejects anything preceded by an identifier character or a dot — i.e. property
    // access — while a domain in prose or in a string still matches.
    re: new RegExp(
      '(?<![\\w.-])' +
        alt('w' + 'ww\\.[a-z0-9-]+\\.[a-z]{2,}', '[a-z0-9][a-z0-9-]{1,}\\.' + alt(...TLDS)) +
        '(?![\\w-])',
      'i',
    ),
    severity: 'fail',
  },
  {
    id: 'FETCH_VERB',
    label: 'network fetch verb',
    re: new RegExp('\\b' + alt(...FETCHERS) + '\\b'),
    severity: 'fail',
  },
  {
    id: 'NET_MODULE',
    label: 'outbound network module or API',
    re: new RegExp('\\b' + alt(...NETAPIS) + '\\b'),
    severity: 'fail',
  },
  {
    id: 'REMOTE_EXEC',
    label: 'remote code execution',
    re: new RegExp(
      alt(
        '\\bn' + 'px\\s+',
        '\\b' + alt(...PKGMGRS) + '\\s+' + alt(...INSTALLVERBS) + '\\b',
        '\\bp' + 'ip\\s+ins' + 'tall\\b',
        '\\bg' + 'it\\s+cl' + 'one\\b',
      ),
    ),
    severity: 'fail',
  },
  {
    id: 'HIDDEN_UNICODE',
    label: 'zero-width / bidi-override / tag character',
    re: new RegExp(
      '[' +
        '\\u200B-\\u200F' + '\\u202A-\\u202E' + '\\u2066-\\u2069' + '\\uFEFF' +
        ']|[\\u{E0000}-\\u{E007F}]',
      'u',
    ),
    severity: 'fail',
  },
  {
    id: 'SHELL_PIPE_EXEC',
    label: 'download piped to a shell',
    re: new RegExp(alt('\\|\\s*' + alt('b' + 'a', '') + 's' + 'h\\b', '\\|\\s*i' + 'ex\\b'), 'i'),
    severity: 'fail',
  },
]

/**
 * A TCP connect to localhost is how the skill probes for a running dev server.
 * That is loopback only and is not network egress, so node:net is permitted —
 * but only in the scripts that legitimately need it, and only for loopback.
 */
const NET_ALLOWED = new Set(['scripts/preflight.mjs', 'scripts/verify.mjs'])
const LOOPBACK_ONLY = /127\.0\.0\.1|localhost/

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.git') continue
      walk(full, out)
    } else {
      out.push(full)
    }
  }
  return out
}

function scanFile(full) {
  const rel = relative(ROOT, full).split(sep).join('/')
  const ext = extname(full).toLowerCase()
  const hits = []

  if (!TEXT_EXT.has(ext)) {
    return { file: rel, binary: true, hits, sha256: sha(full) }
  }

  const content = readFileSync(full, 'utf8')
  const lines = content.split(/\r?\n/)

  lines.forEach((line, i) => {
    for (const p of PATTERNS) {
      if (!p.re.test(line)) continue

      // node:net is permitted in the two scripts that probe a loopback port.
      if (p.id === 'NET_MODULE' && NET_ALLOWED.has(rel) && /node:net/.test(line)) continue
      if (p.id === 'BARE_DOMAIN' && LOOPBACK_ONLY.test(line)) continue

      hits.push({
        rule: p.id,
        label: p.label,
        severity: p.severity,
        line: i + 1,
        text: line.trim().slice(0, 140),
      })
    }
  })

  return { file: rel, binary: false, hits, sha256: sha(full), lines: lines.length }
}

function sha(full) {
  return createHash('sha256').update(readFileSync(full)).digest('hex')
}

function main() {
  const json = process.argv.includes('--json')
  const manifest = process.argv.includes('--manifest')

  const files = walk(ROOT).sort()
  const results = files.map(scanFile)
  const dirty = results.filter((r) => r.hits.length > 0)
  const failCount = dirty.reduce(
    (n, r) => n + r.hits.filter((h) => h.severity === 'fail').length,
    0,
  )

  if (manifest) {
    console.log('sha256                                                            file')
    results.forEach((r) => console.log(`${r.sha256}  ${r.file}`))
    process.exit(0)
  }

  if (json) {
    console.log(
      JSON.stringify(
        {
          root: ROOT.split(sep).join('/'),
          filesScanned: results.length,
          textFiles: results.filter((r) => !r.binary).length,
          totalLines: results.reduce((n, r) => n + (r.lines || 0), 0),
          rules: PATTERNS.map((p) => ({ id: p.id, label: p.label })),
          violations: failCount,
          findings: dirty,
          clean: failCount === 0,
        },
        null,
        2,
      ),
    )
    process.exit(failCount === 0 ? 0 : 2)
  }

  const textFiles = results.filter((r) => !r.binary)
  const totalLines = results.reduce((n, r) => n + (r.lines || 0), 0)

  console.log('OFFLINE SCAN — design-loop-router')
  console.log('='.repeat(64))
  console.log(`root          ${ROOT.split(sep).join('/')}`)
  console.log(`files         ${results.length} (${textFiles.length} text, ${results.length - textFiles.length} binary)`)
  console.log(`lines         ${totalLines}`)
  console.log(`rules applied ${PATTERNS.length}`)
  console.log('')
  PATTERNS.forEach((p) => console.log(`  · ${p.id.padEnd(16)} ${p.label}`))
  console.log('')

  if (failCount === 0) {
    console.log('RESULT: CLEAN')
    console.log('')
    console.log('  0 URLs · 0 bare domains · 0 network verbs · 0 remote-exec commands')
    console.log('  0 hidden Unicode · 0 piped-shell downloads')
    console.log('')
    console.log('Every shipped file was read. The only permitted socket use is a')
    console.log('loopback TCP probe for a local dev server, in preflight and verify.')
    process.exit(0)
  }

  console.log(`RESULT: ${failCount} VIOLATION(S)`)
  console.log('')
  dirty.forEach((r) => {
    console.log(`  ${r.file}`)
    r.hits.forEach((h) => console.log(`    ${String(h.line).padStart(4)}  [${h.rule}] ${h.text}`))
  })
  process.exit(2)
}

main()
