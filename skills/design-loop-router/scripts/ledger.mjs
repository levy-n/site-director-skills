#!/usr/bin/env node
/*
 * ledger.mjs — the append-only run ledger and the completion gate for design-loop-router.
 *
 * Purpose
 *   Records every leg of a design loop run (taste, impeccable, verify, gate, note) into
 *   G:/Web-Dev/MediaWaveIsrael/.design-loop/<runId>/run.json, and refuses to declare the
 *   run "done" until the evidence for that claim exists on disk.
 *
 * No-network contract
 *   Node builtins only (node:fs, node:path, node:process). No dependencies, no downloads,
 *   no remote calls of any kind. This file must stay resolvable and runnable offline.
 *
 * Subcommands
 *   init         --run <runId> [--intent <class>]
 *   record       --run <runId> --type <t> --json '<json>'
 *   status       --run <runId>
 *   require-done --run <runId>
 *
 * Exit codes: 0 = ok, 2 = refused / requirement failed, 1 = usage or IO error.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const PROJECT_ROOT = 'G:/Web-Dev/MediaWaveIsrael';
const LOOP_DIR = `${PROJECT_ROOT}/.design-loop`;

/** A screenshot smaller than this is a blank or failed render, not evidence. */
const MIN_SHOT_BYTES = 10000;

const STEP_TYPES = ['taste', 'impeccable', 'verify', 'gate', 'note'];

/** Intents that legitimately have no taste-direction leg. */
const TASTE_EXEMPT = new Set(['VERIFY', 'DOCUMENT']);
/** Intents that legitimately have no impeccable execution leg. */
const IMPECCABLE_EXEMPT = new Set(['VERIFY', 'OPINION']);

// ---------------------------------------------------------------------------
// tiny arg parser
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const tok = argv[i];
    if (tok.startsWith('--')) {
      const key = tok.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = next;
        i += 1;
      }
    } else {
      out._.push(tok);
    }
  }
  return out;
}

function die(msg, code = 1) {
  process.stderr.write(`ledger: ${msg}\n`);
  process.exit(code);
}

function toPosix(p) {
  return String(p).replace(/\\/g, '/');
}

// ---------------------------------------------------------------------------
// paths + io
// ---------------------------------------------------------------------------

function runDir(runId) {
  return `${LOOP_DIR}/${runId}`;
}

function ledgerPath(runId) {
  return `${runDir(runId)}/run.json`;
}

function readLedger(runId) {
  const file = ledgerPath(runId);
  if (!fs.existsSync(file)) {
    die(
      `no ledger at ${file}. Create it first: node "<SKILL_DIR>/scripts/ledger.mjs" init --run ${runId}`,
    );
  }
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch (err) {
    die(`cannot read ${file}: ${err.message}`);
  }
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !Array.isArray(data.steps)) {
      throw new Error('missing steps array');
    }
    return data;
  } catch (err) {
    die(`${file} is not a valid ledger (${err.message}). Delete it and re-run init --run ${runId}`);
  }
  return null;
}

function writeLedger(runId, data) {
  const dir = runDir(runId);
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ledgerPath(runId), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (err) {
    die(`cannot write ${ledgerPath(runId)}: ${err.message}`);
  }
}

/**
 * Resolve a screenshot path recorded in a verify step. Relative paths are read as
 * relative to the run folder first (that is where design-verify writes), then the
 * project root, so both conventions survive.
 */
function resolveShotPath(runId, p) {
  const raw = toPosix(p);
  if (path.isAbsolute(raw) || /^[A-Za-z]:\//.test(raw)) return raw;
  const inRun = `${runDir(runId)}/${raw}`;
  if (fs.existsSync(inRun)) return inRun;
  return toPosix(path.posix.join(PROJECT_ROOT, raw));
}

// ---------------------------------------------------------------------------
// init
// ---------------------------------------------------------------------------

function cmdInit(args) {
  const runId = requireRunId(args);
  const intent = typeof args.intent === 'string' ? args.intent.toUpperCase() : 'UNSPECIFIED';
  const file = ledgerPath(runId);

  if (fs.existsSync(file)) {
    // Re-initialising would silently erase recorded evidence. Refuse instead.
    die(`ledger already exists at ${file}. Use a new --run id, or delete that folder yourself.`, 2);
  }

  const data = {
    runId,
    intent,
    startedAt: new Date().toISOString(),
    steps: [],
    status: 'open',
  };
  writeLedger(runId, data);
  process.stdout.write(`ledger init ${runId} intent=${intent} -> ${file}\n`);
}

// ---------------------------------------------------------------------------
// record
// ---------------------------------------------------------------------------

/*
 * Why append-only:
 * The ledger is the evidence a design run actually happened — which taste rules were
 * applied, which impeccable command ran, which screenshots were taken, whether the
 * named-rule gate passed. Evidence you can rewrite is not evidence: if a later step
 * could edit or drop an earlier one, a failed run could be laundered into a clean one
 * and require-done would be checking a story rather than a history. So record only ever
 * pushes onto steps[]; any request to replace or remove an existing step is refused.
 */
function cmdRecord(args) {
  const runId = requireRunId(args);
  const type = typeof args.type === 'string' ? args.type : null;
  if (!type) die('record needs --type <taste|impeccable|verify|gate|note>');
  if (!STEP_TYPES.includes(type)) {
    die(`unknown --type "${type}". Allowed: ${STEP_TYPES.join(', ')}`);
  }

  let payload = {};
  if (typeof args.json === 'string' && args.json.trim() !== '') {
    try {
      payload = JSON.parse(args.json);
    } catch (err) {
      die(`--json is not valid JSON (${err.message}). Wrap it in single quotes and escape inner quotes.`);
    }
    if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
      die('--json must be a JSON object, e.g. --json \'{"cmd":"polish src/x.tsx"}\'');
    }
  }

  // Refuse any attempt to target an existing step. Append-only means append-only.
  for (const key of ['index', 'replace', 'at', 'delete', 'remove', 'overwrite']) {
    if (args[key] !== undefined) {
      die(`--${key} is not supported: the ledger is append-only and existing steps are immutable.`, 2);
    }
  }
  if ('index' in payload || 'replaces' in payload) {
    die('step payload may not target an existing step: the ledger is append-only.', 2);
  }

  const data = readLedger(runId);
  if (data.status === 'done') {
    // A closed run may still gain notes, but not new claims of work.
    if (type !== 'note') {
      die(`run ${runId} is already marked done; only "note" steps may be appended afterwards.`, 2);
    }
  }

  const step = {
    n: data.steps.length + 1,
    type,
    at: new Date().toISOString(),
    ...payload,
  };
  data.steps = [...data.steps, step];
  writeLedger(runId, data);
  process.stdout.write(`ledger record ${runId} #${step.n} ${type}\n`);
}

// ---------------------------------------------------------------------------
// status
// ---------------------------------------------------------------------------

function countByType(steps) {
  const counts = Object.create(null);
  for (const t of STEP_TYPES) counts[t] = 0;
  for (const s of steps) {
    counts[s.type] = (counts[s.type] || 0) + 1;
  }
  return counts;
}

function cmdStatus(args) {
  const runId = requireRunId(args);
  const data = readLedger(runId);
  const counts = countByType(data.steps);

  process.stdout.write(`run       ${data.runId}\n`);
  process.stdout.write(`intent    ${data.intent}\n`);
  process.stdout.write(`started   ${data.startedAt}\n`);
  process.stdout.write(`status    ${data.status}\n`);
  process.stdout.write(`evidence  ${runDir(runId)}\n`);
  process.stdout.write(
    `steps     ${data.steps.length} (` +
      STEP_TYPES.map((t) => `${t}=${counts[t] || 0}`).join(' ') +
      ')\n',
  );

  for (const s of data.steps) {
    const bits = [];
    if (s.cmd) bits.push(`cmd=${s.cmd}`);
    if (s.rule) bits.push(`rule=${s.rule}`);
    if (typeof s.exit === 'number') bits.push(`exit=${s.exit}`);
    if (typeof s.shots === 'number') bits.push(`shots=${s.shots}`);
    if (Array.isArray(s.files)) bits.push(`files=${s.files.length}`);
    if (s.note) bits.push(`note=${String(s.note).slice(0, 60)}`);
    process.stdout.write(`  #${s.n} ${s.type.padEnd(10)} ${s.at}  ${bits.join(' ')}\n`);
  }
}

// ---------------------------------------------------------------------------
// require-done
// ---------------------------------------------------------------------------

/**
 * Collect the screenshot records from a verify step. Accepted shapes:
 *   files: [{ path, bytes }, ...]     preferred
 *   files: ["a.png", "b.png"]         path only, size is then stat-only
 *   shotFiles / screenshots           accepted aliases
 */
function shotRecords(step) {
  const list = step.files || step.shotFiles || step.screenshots;
  if (!Array.isArray(list)) return [];
  return list.map((entry) => {
    if (typeof entry === 'string') return { path: entry, bytes: null };
    if (entry && typeof entry === 'object') {
      const p = entry.path || entry.file || entry.name;
      const bytes =
        typeof entry.bytes === 'number'
          ? entry.bytes
          : typeof entry.size === 'number'
            ? entry.size
            : null;
      return { path: p, bytes };
    }
    return { path: null, bytes: null };
  });
}

/*
 * Why require-done re-stats every file:
 * The ledger records claims. The filesystem holds facts. A verify step saying it wrote
 * eight 240 KB PNGs proves nothing if the run folder was cleaned, the browser crashed
 * mid-write, or a later step overwrote the shots with empty files. require-done is the
 * one place where the loop is allowed to say "done", so it checks the artefacts as they
 * exist right now — present, and no smaller than what was recorded.
 */
function checkVerifySteps(runId, steps) {
  const verifySteps = steps.filter((s) => s.type === 'verify');
  if (verifySteps.length === 0) {
    return { ok: false, reason: 'no step of type "verify" was recorded (no browser measurement ran)' };
  }

  const problems = [];
  for (const step of verifySteps) {
    const shots = typeof step.shots === 'number' ? step.shots : null;
    if (shots === null) {
      problems.push(`verify step #${step.n} has no numeric "shots" field`);
      continue;
    }
    if (shots <= 0) {
      problems.push(`verify step #${step.n} recorded shots=${shots}`);
      continue;
    }

    const records = shotRecords(step);
    if (records.length === 0) {
      problems.push(`verify step #${step.n} claims shots=${shots} but lists no screenshot files`);
      continue;
    }

    let stepOk = true;
    for (const rec of records) {
      if (!rec.path) {
        problems.push(`verify step #${step.n} has a screenshot entry with no path`);
        stepOk = false;
        continue;
      }
      const abs = resolveShotPath(runId, rec.path);
      let stat;
      try {
        stat = fs.statSync(abs);
      } catch {
        problems.push(`verify step #${step.n}: screenshot missing on disk: ${abs}`);
        stepOk = false;
        continue;
      }
      if (!stat.isFile()) {
        problems.push(`verify step #${step.n}: not a file: ${abs}`);
        stepOk = false;
        continue;
      }
      if (stat.size <= MIN_SHOT_BYTES) {
        problems.push(
          `verify step #${step.n}: ${abs} is ${stat.size} bytes (<= ${MIN_SHOT_BYTES}) — blank or failed render`,
        );
        stepOk = false;
        continue;
      }
      if (rec.bytes !== null && stat.size < rec.bytes) {
        problems.push(
          `verify step #${step.n}: ${abs} shrank since it was recorded (${stat.size} on disk vs ${rec.bytes} claimed)`,
        );
        stepOk = false;
      }
    }
    if (stepOk) {
      return { ok: true, step, count: records.length };
    }
  }

  return {
    ok: false,
    reason: `no verify step has usable screenshot evidence:\n    - ${problems.join('\n    - ')}`,
  };
}

function cmdRequireDone(args) {
  const runId = requireRunId(args);
  const data = readLedger(runId);
  const intent = String(data.intent || 'UNSPECIFIED').toUpperCase();
  const steps = data.steps;
  const failures = [];

  // 1. taste direction
  if (!TASTE_EXEMPT.has(intent)) {
    if (!steps.some((s) => s.type === 'taste')) {
      failures.push(
        'REQUIREMENT taste: no step of type "taste" — the run never took direction from the taste layer. ' +
          'Record one after reading references/taste-core.md.',
      );
    }
  }

  // 2. impeccable execution
  if (!IMPECCABLE_EXEMPT.has(intent)) {
    const ok = steps.some(
      (s) => s.type === 'impeccable' && typeof s.cmd === 'string' && s.cmd.trim() !== '',
    );
    if (!ok) {
      failures.push(
        'REQUIREMENT impeccable: no step of type "impeccable" carrying a non-empty "cmd" — ' +
          'the execution leg never ran, or was recorded without the verb and target it used.',
      );
    }
  }

  // 3. browser measurement, checked against the filesystem
  const verify = checkVerifySteps(runId, steps);
  if (!verify.ok) {
    failures.push(`REQUIREMENT verify: ${verify.reason}`);
  }

  // 4. named-rule gate
  const gateOk = steps.some((s) => s.type === 'gate' && s.exit === 0);
  if (!gateOk) {
    const gates = steps.filter((s) => s.type === 'gate');
    const detail =
      gates.length === 0
        ? 'no step of type "gate" was recorded'
        : `gate steps exist but none exited 0 (saw exit codes: ${gates
            .map((g) => (typeof g.exit === 'number' ? g.exit : '?'))
            .join(', ')})`;
    failures.push(`REQUIREMENT gate: ${detail} — the project's named-rule gate has not passed.`);
  }

  if (failures.length > 0) {
    process.stderr.write(`require-done FAILED for run ${runId} (intent ${intent}):\n`);
    for (const f of failures) process.stderr.write(`  - ${f}\n`);
    process.stderr.write(`  evidence folder: ${runDir(runId)}\n`);
    process.exit(2);
  }

  const counts = countByType(steps);
  const shotCount = verify.count;
  process.stdout.write(
    `DONE run=${runId} intent=${intent} steps=${steps.length} ` +
      `(taste=${counts.taste} impeccable=${counts.impeccable} verify=${counts.verify} gate=${counts.gate}) ` +
      `screenshots=${shotCount} verified on disk; evidence: ${runDir(runId)}\n`,
  );

  if (data.status !== 'done') {
    data.status = 'done';
    data.completedAt = new Date().toISOString();
    writeLedger(runId, data);
  }
}

// ---------------------------------------------------------------------------
// entry
// ---------------------------------------------------------------------------

function requireRunId(args) {
  const runId = typeof args.run === 'string' ? args.run.trim() : '';
  if (!runId) die('missing --run <runId>');
  if (!/^[A-Za-z0-9._-]+$/.test(runId)) {
    die(`invalid --run "${runId}": use letters, digits, dot, dash, underscore only`);
  }
  return runId;
}

function usage() {
  process.stdout.write(
    [
      'usage: node ledger.mjs <command> [options]',
      '',
      '  init         --run <runId> [--intent <class>]',
      '  record       --run <runId> --type <taste|impeccable|verify|gate|note> [--json \'{...}\']',
      '  status       --run <runId>',
      '  require-done --run <runId>',
      '',
      `ledgers live at ${LOOP_DIR}/<runId>/run.json`,
      '',
    ].join('\n'),
  );
}

function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const args = parseArgs(argv.slice(1));

  switch (cmd) {
    case 'init':
      return cmdInit(args);
    case 'record':
      return cmdRecord(args);
    case 'status':
      return cmdStatus(args);
    case 'require-done':
      return cmdRequireDone(args);
    case '--help':
    case '-h':
    case 'help':
    case undefined:
      usage();
      return process.exit(cmd === undefined ? 1 : 0);
    default:
      usage();
      return die(`unknown command "${cmd}"`);
  }
}

main();
