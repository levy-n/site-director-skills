// rive-audit.mjs - static audit of a project's Rive integration: legacy packages and APIs, missing cleanup,
// accessibility, reduced motion, layout shift, WASM hosting, Next.js client boundaries, file sizes, git setup.
// Usage: node rive-audit.mjs [project-dir] [--json]
// Exit code 1 when any ERROR is found. Findings are leads to verify, not proof: read the code before changing it.
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
  console.log('usage: node rive-audit.mjs [project-dir] [--json]   static audit of Rive usage; exit 1 on ERROR');
  process.exit(0);
}
const root = path.resolve(argv.find((a) => !a.startsWith('--')) || '.');
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.astro', '.svelte-kit', '.turbo', 'out', 'coverage', '.gradle', 'Pods', '.dart_tool', 'DerivedData']);
const CODE = /\.(m?[jt]sx?|cjs|astro|vue|svelte|html|kt|kts|swift|dart)$/;
const findings = [];
const add = (sev, file, line, msg, fix) => findings.push({ sev, file: path.relative(root, file).split(path.sep).join('/'), line, msg, fix });

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p); else files.push(p);
  }
})(root);

// ---------- packages ----------
const LEGACY_PKG = {
  'rive-react': ['@rive-app/react-webgl2', 'the old package name'],
  'rive-js': ['@rive-app/webgl2', 'the old package name'],
  '@rive-app/webgl': ['@rive-app/webgl2', 'deprecated renderer package'],
  '@rive-app/react-webgl': ['@rive-app/react-webgl2', 'deprecated renderer package'],
  'rive-react-native': ['@rive-app/react-native', 'the legacy React Native runtime (the Nitro runtime is recommended)'],
};
for (const f of files.filter((f) => path.basename(f) === 'package.json')) {
  let pkg; try { pkg = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { continue; }
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const [name, [to, why]] of Object.entries(LEGACY_PKG)) if (deps[name]) add('WARN', f, 0, `${name} is ${why}`, `move to ${to}`);
  const renderers = Object.keys(deps).filter((d) => /^@rive-app\/(react-)?(canvas|canvas-lite|webgl2|webgl)$/.test(d))
    .map((d) => d.replace('react-', '').replace('@rive-app/', '')).filter((v, i, a) => a.indexOf(v) === i);
  if (renderers.length > 1) add('WARN', f, 0, `several Rive renderers installed (${renderers.join(', ')})`, 'one renderer per site: each ships its own WASM');
  if (Object.keys(deps).some((d) => d.includes('canvas-lite'))) add('INFO', f, 0, 'canvas-lite has no text, layouts, audio or scripting', 'never use it for Hebrew text or RTL layouts');
}
for (const f of files.filter((f) => path.basename(f) === 'pubspec.yaml')) {
  const m = fs.readFileSync(f, 'utf8').match(/^\s*rive:\s*\^?(\d+)\.(\d+)/m);
  if (m && Number(m[1]) === 0 && Number(m[2]) < 14) add('WARN', f, 0, `rive ${m[1]}.${m[2]} uses the legacy Dart runtime`, 'upgrade to rive 0.14+ (rive_native) and the RiveWidget API');
}
for (const f of files.filter((f) => /build\.gradle(\.kts)?$/.test(f))) {
  const m = fs.readFileSync(f, 'utf8').match(/app\.rive:rive-android:(\d+)\./);
  if (m && Number(m[1]) < 11) add('WARN', f, 0, `rive-android ${m[1]}.x predates the Compose API and data binding fixes`, 'upgrade to 11.x and the app.rive Compose API');
}

// ---------- source patterns ----------
const RULES = [
  [/\bstateMachines\s*:/, 'WARN', 'stateMachines (plural) is deprecated since web runtime 2.41', 'use stateMachine: "<name>"'],
  [/useStateMachineInput\s*\(/, 'WARN', 'useStateMachineInput is deprecated (React 4.33)', 'bind a view model property: useViewModelInstanceNumber/Boolean/Trigger'],
  [/\.stateMachineInputs\s*\(/, 'WARN', 'state machine inputs are the old pattern', 'view model properties and triggers (data binding)'],
  [/setTextRunValue(AtPath)?\s*\(/, 'WARN', 'text-run setters are deprecated', 'bind a string property'],
  [/EventType\.RiveEvent|automaticallyHandleEvents|onStateChange\s*:/, 'WARN', 'Rive events, onStateChange and automaticallyHandleEvents are deprecated', 'observe a view model property or trigger'],
  [/\.scrub\s*\(/, 'WARN', 'scrub() is deprecated', 'drive the timeline from a bound number'],
  [/fitCanvasToArtboardHeight/, 'WARN', 'fitCanvasToArtboardHeight sizes the box after load and shifts layout', 'reserve the box with aspect-ratio or a fixed height'],
  [/src\s*[:=]\s*['"`]\/public\//, 'ERROR', '"/public/..." is not a served URL', 'drop the /public prefix: public/rive/x.riv is served at /rive/x.riv'],
  [/['"`]State Machine 1['"`]/, 'WARN', 'the editor default name "State Machine 1"', 'rename it in the file (contract name, e.g. "Main") and update the code'],
  [/RiveAnimationView/, 'INFO', 'legacy Android View API', 'the app.rive Compose API is recommended for new Compose code'],
  [/\.(setNumberState|setBooleanState|fireState)\s*\(/, 'WARN', 'Android input setters are the old pattern', 'ViewModelInstance.setNumber/setBoolean/fireTrigger'],
  [/RiveAnimation\.(asset|network|file)\s*\(|StateMachineController\.fromArtboard/, 'WARN', 'legacy Flutter API (pre 0.14)', 'RiveWidgetBuilder + FileLoader (rive 0.14+)'],
  [/RiveViewModel\s*\(\s*fileName/, 'INFO', 'legacy Apple API', 'the new Worker/File/Rive API with view model instances'],
];
let usesRive = false, hasReduced = false, hasWasmSelfHost = false;
for (const f of files.filter((f) => CODE.test(f))) {
  const text = fs.readFileSync(f, 'utf8');
  const touchesRive = /@rive-app\/|rive-react|app\.rive|RiveRuntime|import\s+['"]package:rive|\bnew Rive\(|<rive-stage|<RiveStage\b|\bRiveStage\(/.test(text);
  if (!touchesRive) continue;
  usesRive = true;
  if (/prefers-reduced-motion|prefersReducedMotion|isReduceMotionEnabled|ANIMATOR_DURATION_SCALE|areAnimatorsEnabled|disableAnimations/.test(text)) hasReduced = true;
  if (/setWasmUrl|setWasmBinary|name=["']rive-wasm["']/.test(text)) hasWasmSelfHost = true;
  const lines = text.split(/\r?\n/);
  lines.forEach((ln, i) => { for (const [re, sev, msg, fix] of RULES) if (re.test(ln)) add(sev, f, i + 1, msg, fix); });
  const isReactRive = /@rive-app\/react-/.test(text) && /\.(jsx|tsx|js|ts)$/.test(f);
  if (isReactRive && /[\\/]app[\\/]/.test(f) && !/^\s*['"]use client['"]/m.test(text))
    add('ERROR', f, 1, 'Rive React hooks in an App Router file without "use client"', 'move Rive into a client component');
  if (/\bnew Rive\(/.test(text) && !/\.cleanup\(\)/.test(text)) add('WARN', f, 0, 'new Rive(...) without cleanup()', 'call r.cleanup() when the element or route goes away');
  if ((/<RiveComponent|<canvas/.test(text) && !/aria-(label|hidden)|role=|data-label|data-decorative|decorative/.test(text))
    || (/<RiveStage\b/.test(text) && !/\blabel=|decorative/.test(text)))
    add('WARN', f, 0, 'a Rive canvas without an accessible name or aria-hidden', 'role="img" plus aria-label, or aria-hidden for decoration');
}
if (usesRive && !hasReduced) add('WARN', root, 0, 'no reduced-motion handling found anywhere in the Rive code', 'set a prefersReducedMotion view model boolean from the platform setting');
if (usesRive && !hasWasmSelfHost && files.some((f) => /\.(m?[jt]sx?|astro|html)$/.test(f)))
  add('INFO', root, 0, 'web WASM loads from unpkg / jsDelivr', 'self-host it for production (RuntimeLoader.setWasmUrl) and allow wasm-unsafe-eval in CSP');

// ---------- .riv files and git ----------
const rivs = files.filter((f) => f.endsWith('.riv'));
for (const f of rivs) {
  const kb = fs.statSync(f).size / 1024;
  const head = fs.readFileSync(f).subarray(0, 64).toString('latin1');
  if (head.startsWith('version https://git-lfs')) add('ERROR', f, 0, 'this .riv is a Git LFS pointer, not the file', 'git lfs pull, or stop tracking .riv with LFS');
  else if (!head.startsWith('RIVE')) add('WARN', f, 0, 'the file does not start with the RIVE header', 'check that the export is a .riv, not a .rev or HTML');
  if (kb > 600) add('WARN', f, 0, `${kb.toFixed(0)} KB is above the showpiece budget (600 KB)`, 'subset fonts, reference large images, remove unused artboards');
  else if (kb > 150) add('INFO', f, 0, `${kb.toFixed(0)} KB is above the balanced budget (150 KB)`, 'fine for a showpiece; otherwise slim it');
}
const ga = path.join(root, '.gitattributes');
if (rivs.length && (!fs.existsSync(ga) || !/\*\.riv\s+binary/.test(fs.readFileSync(ga, 'utf8'))))
  add('WARN', ga, 0, '.riv files without "*.riv binary" in .gitattributes', 'add the line so git never rewrites line endings inside them');

// ---------- report ----------
const order = { ERROR: 0, WARN: 1, INFO: 2 };
findings.sort((a, b) => order[a.sev] - order[b.sev] || a.file.localeCompare(b.file) || a.line - b.line);
if (argv.includes('--json')) console.log(JSON.stringify({ root, usesRive, rivFiles: rivs.length, findings }, null, 2));
else {
  if (!usesRive && !rivs.length) console.log('rive-audit: no Rive usage found under', root);
  for (const x of findings) console.log(`${x.sev.padEnd(5)} ${x.file}${x.line ? `:${x.line}` : ''}  ${x.msg}\n      fix: ${x.fix}`);
  const n = (s) => findings.filter((x) => x.sev === s).length;
  console.log(`\n${n('ERROR')} errors, ${n('WARN')} warnings, ${n('INFO')} notes (${rivs.length} .riv files)`);
}
process.exit(findings.some((x) => x.sev === 'ERROR') ? 1 : 0);
