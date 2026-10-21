// selftest.mjs - structural checks for the rive-studio skill. Run after editing any file in the skill:
//   node scripts/selftest.mjs            (from the skill folder, or pass the folder as the first argument)
// Exit code 1 when any check fails. Checks follow C:/Users/User/.claude/skill-standard-2026.md
// plus MediaWave house rules (no en dash, em dash or maqaf anywhere; question payloads lint clean).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('usage: node selftest.mjs [skill-dir]   checks frontmatter, links, TOCs, dashes, payloads, templates');
  process.exit(0);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] || path.join(here, '..'));
const fails = [], warns = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const warn = (cond, msg) => { if (!cond) warns.push(msg); };

// Valid Claude Code / Agent Skills frontmatter keys (skill-standard-2026.md section 1)
const VALID = new Set(['name', 'description', 'when_to_use', 'argument-hint', 'arguments', 'disable-model-invocation',
  'user-invocable', 'allowed-tools', 'disallowed-tools', 'model', 'effort', 'context', 'agent', 'hooks', 'paths',
  'shell', 'license', 'metadata']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}
const rel = (p) => path.relative(root, p).split(path.sep).join('/');

// 1. SKILL.md frontmatter
const skillPath = path.join(root, 'SKILL.md');
ok(fs.existsSync(skillPath), 'SKILL.md missing');
const skill = fs.existsSync(skillPath) ? fs.readFileSync(skillPath, 'utf8') : '';
const fm = skill.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
ok(!!fm, 'SKILL.md has no frontmatter block');
const fmText = fm ? fm[1] : '';
const keys = [...fmText.matchAll(/^([A-Za-z_-]+):/gm)].map((m) => m[1]);
keys.forEach((k) => ok(VALID.has(k), `frontmatter key "${k}" is not a valid field`));
const scalar = (k) => {
  const m = fmText.match(new RegExp(`^${k}:\\s*(['"]?)([\\s\\S]*?)\\1\\s*$`, 'm'));
  return m ? m[2].replace(/''/g, "'") : '';
};
const name = scalar('name'), desc = scalar('description'), wtu = scalar('when_to_use');
ok(name === path.basename(root), `name "${name}" must match the folder "${path.basename(root)}"`);
ok(/^[a-z0-9-]{1,64}$/.test(name), 'name must be lowercase letters, numbers and hyphens, max 64');
ok(!/claude|anthropic/.test(name), 'name must not contain "claude" or "anthropic"');
ok(desc.length > 0 && desc.length <= 1024, `description length ${desc.length} must be 1-1024`);
warn(desc.length <= 700, `description is ${desc.length} chars; target <= ~700`);
ok(desc.length + wtu.length <= 1536, `description + when_to_use = ${desc.length + wtu.length} chars > 1536 listing cap`);
ok(!/<[a-z][^>]*>/i.test(desc), 'description must not contain XML tags');

// 2. Body length
const body = fm ? skill.slice(fm[0].length) : skill;
const bodyLines = body.split('\n').length;
ok(bodyLines <= 500, `SKILL.md body is ${bodyLines} lines > 500`);

// 3. Every referenced bundled path exists
const files = walk(root);
const textFiles = files.filter((f) => /\.(md|mjs|js|json|html|tsx|ts|kt|swift|dart|astro|css)$/.test(f));
for (const f of textFiles.filter((f) => f.endsWith('.md'))) {
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(/`((?:references|assets|scripts|evals)\/[^`\s*<>]+?)`/g)) {
    const target = path.join(root, m[1].replace(/[),.;:]+$/, ''));
    ok(fs.existsSync(target), `${rel(f)} references missing ${m[1]}`);
  }
}

// 4. Reference files over 100 lines need a contents section (one level deep only)
for (const f of files.filter((f) => rel(f).startsWith('references/') && f.endsWith('.md'))) {
  const t = fs.readFileSync(f, 'utf8');
  if (t.split('\n').length > 100) ok(/^## (Contents|תוכן)/m.test(t), `${rel(f)} is over 100 lines and has no "## Contents"`);
  ok(rel(f).split('/').length === 2, `${rel(f)} is nested deeper than references/`);
}

// 5. House rules on text: no en dash, em dash or Hebrew maqaf; forward slashes in skill paths
const DASH = /[\u2013\u2014\u05BE]/;
for (const f of textFiles) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((ln, i) => {
    if (DASH.test(ln)) fails.push(`${rel(f)}:${i + 1} contains an en dash, em dash or maqaf`);
    if (f.endsWith('.md') && /\b(references|scripts|assets)\\[A-Za-z]/.test(ln)) fails.push(`${rel(f)}:${i + 1} uses a backslash path`);
  });
}

// 6. Question payloads lint clean (errors only; previews of the smoke test are wide on purpose)
const { lintCall } = await import(pathToFileURL(path.join(root, 'scripts', 'lint-ask.mjs')).href);
for (const f of files.filter((f) => rel(f).startsWith('assets/intake/') && f.endsWith('.json'))) {
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  (Array.isArray(data) ? data : [data]).forEach((c, i) => lintCall(c, `${rel(f)}#${i + 1}`).errs.forEach((e) => fails.push(e)));
}

// 7. Templates are usable
const contract = path.join(root, 'assets', 'templates', 'CONTRACT.template.md');
if (fs.existsSync(contract)) {
  const block = fs.readFileSync(contract, 'utf8').match(/```json\r?\n([\s\S]*?)```/);
  ok(!!block, 'CONTRACT.template.md has no json block');
  if (block) { try { JSON.parse(block[1]); } catch (e) { fails.push(`CONTRACT.template.md json block does not parse: ${e.message}`); } }
}
const sketch = path.join(root, 'assets', 'sketch', 'sketch.template.html');
if (fs.existsSync(sketch)) {
  const t = fs.readFileSync(sketch, 'utf8');
  ['function to(', 'function loop(', 'function go(', 'function boot(', 'const SKETCH'].forEach((s) => ok(t.includes(s), `sketch template lost "${s}"`));
}

// 8. evals parse
const evals = path.join(root, 'evals', 'evals.json');
if (fs.existsSync(evals)) { try { JSON.parse(fs.readFileSync(evals, 'utf8')); } catch (e) { fails.push(`evals.json does not parse: ${e.message}`); } }

warns.forEach((w) => console.log('warn ', w));
fails.forEach((f) => console.log('FAIL ', f));
console.log(`\n${fails.length ? 'FAILED' : 'passed'}: ${fails.length} failures, ${warns.length} warnings, ${files.length} files checked`);
process.exit(fails.length ? 1 : 0);
