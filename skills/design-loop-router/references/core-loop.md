# Core loop mechanics

## 1. Canonical sequence

Every run has a `runId` (format `YYYYMMDD-HHmm-<slug>`) and a directory
`G:/Web-Dev/MediaWaveIsrael/.design-loop/<runId>/`. All commands run with cwd =
`G:/Web-Dev/MediaWaveIsrael` — impeccable's scripts read `process.cwd()` and will
silently target the wrong tree otherwise. `${SKILL_DIR}` =
`C:/Users/User/.claude/skills/design-loop-router`.

| # | Step | Command / action | Writes into `.design-loop/<runId>/` |
|---|------|------------------|--------------------------------------|
| 0 | preflight | `node "${SKILL_DIR}/scripts/preflight.mjs" --run <runId>` | `ledger.jsonl` (first entry), `preflight.json` |
| 1 | serve | start `npm run preview` (4173) or reuse `npm run dev` (5173); preflight records which | ledger `serve` entry with port + pid |
| 2 | before | `node "${SKILL_DIR}/scripts/shoot.mjs" --run <runId> --phase before --routes <list>` | `before/<route>-<vw>.png`, `before/console.json` |
| 3 | gate (baseline) | `node "${SKILL_DIR}/scripts/gate.mjs" --run <runId> --phase before` | `before/gate.json`, `before/axe.json` |
| 4 | direction | read `references/taste-core.md` + repo `DESIGN.md`; write the brief | `brief.md` |
| 5 | execute | `Skill({ skill: "impeccable", args: "<verb> <target>" })` | ledger `verb` entry; impeccable's own edits land in `src/` |
| 6 | after | `node "${SKILL_DIR}/scripts/shoot.mjs" --run <runId> --phase after-<n>` | `after-<n>/*.png`, `after-<n>/console.json` |
| 7 | gate (verify) | `node "${SKILL_DIR}/scripts/gate.mjs" --run <runId> --phase after-<n>` | `after-<n>/gate.json`, `after-<n>/axe.json` |
| 8 | compare | `node "${SKILL_DIR}/scripts/compare.mjs" --run <runId> --a before --b after-<n>` | `compare-<n>.json` (per-shot pixel delta, new/fixed rule ids) |
| 9 | loop or stop | if `gate.json.fail` non-empty and `n < 3`, map failures to verbs (§4) and return to step 5 with `n+1` | ledger `iteration` entry |
| 10 | require-done | `node "${SKILL_DIR}/scripts/require-done.mjs" --run <runId>` | `verdict.json`, `REPORT.md` |

`require-done.mjs` is the only thing allowed to declare an exit state. It re-reads
the ledger and the artifacts on disk; it does not read your prose. If the
screenshots are missing, if `axe.json` was never written, or if `gate.json.fail`
is non-empty with no `DEGRADED` justification recorded, it exits non-zero and the
run is not done. Never report a verdict `require-done.mjs` did not produce.

Viewports are fixed at **320, 390, 768, 1440**. Routes default to `/`, `/blog`,
`/terms`, `/privacy`, `/accessibility`, one `/blog/:slug` sample. `/studio` is
excluded (lazy third-party shell, not ours to style).

## 2. The run ledger

`ledger.jsonl` — one JSON object per line, append-only, never rewritten. Appending
is the entire point: a step that did not happen cannot leave a line behind.

```json
{"t":"2026-09-05T21:14:03.221Z","step":"shot","phase":"before","route":"/","vw":390,
 "file":"before/root-390.png","bytes":184223,"sha1":"a91c…","ms":1840}
```

| `step` | Required fields | What it proves |
|--------|-----------------|----------------|
| `preflight` | `node`, `ports`, `gitHead`, `dirty` | which tree, which commit, clean or not |
| `serve` | `port`, `pid`, `mode` (`preview`/`dev`) | something was actually listening |
| `shot` | `phase`, `route`, `vw`, `file`, `bytes`, `sha1` | a real PNG exists with real bytes |
| `gate` | `phase`, `pass[]`, `fail[]`, `skipped[]` | each rule id was evaluated, not assumed |
| `axe` | `phase`, `violations`, `serious`, `critical` | the accessibility engine ran |
| `verb` | `verb`, `target`, `iteration`, `exit` | which impeccable verb, on what |
| `edit` | `files[]`, `insertions`, `deletions` | the change has a size |
| `iteration` | `n`, `reason`, `verbsPlanned[]` | why the loop went round again |
| `verdict` | `state`, `reasons[]`, `openFailures[]` | the only line `require-done` will trust |

Why append-only matters: prose can claim "I took before/after screenshots at four
viewports and contrast passes." A ledger line cannot make that claim without a
filename, a byte count and a sha1 that a subsequent read can re-check against the
file on disk. `require-done.mjs` re-stats every `file` in every `shot` line and
compares `bytes`. A run whose ledger disagrees with the filesystem is `BLOCKED`,
not `PASS`. If you find yourself wanting to edit an earlier ledger line, the
correct move is to append a corrective line and let the verdict reflect the mess.

## 3. Iteration budget — hard cap of 3

| Iteration | Purpose | If it still fails |
|-----------|---------|-------------------|
| 1 | The fix. One verb aimed at the highest-severity failing rule. Do not batch unrelated verbs. | Read `compare-1.json` first — did the fix land at all? |
| 2 | The fix for what iteration 1 broke, or the second-severity rule if 1 was clean. Prefer the narrowest verb (`polish`, `clarify`, `harden`) over broad ones (`overdrive`, `bolder`). | Now treat it as structural, not cosmetic. |
| 3 | Last attempt. Allowed to revert iteration 1–2 edits and try a different verb from scratch. No new scope. | Stop. Write `BLOCKED`. |

After iteration 3, `require-done.mjs` refuses `PASS` regardless of what the gate
says about newly-touched rules, unless `fail[]` is empty.

An unbounded loop is worse than an honest `BLOCKED` for three reasons. It burns
context until the reader loses the thread of what the original defect was. It
accumulates unreviewed edits across `src/` that nobody asked for, so the eventual
revert is expensive. And it produces the specific failure mode this skill exists
to prevent: a run that reports success because it ran out of things to try, not
because the measurement passed. Three iterations with a clear `BLOCKED` and a
named open failure is a usable result; iteration 9 with a hopeful summary is not.

## 4. Failure → verb map

Gate rule ids, their meaning, and the impeccable verb that addresses each. Verbs
marked interactive (`shape`, `craft`, `init`, `critique`, `live`) block on
questions — never select them for an unattended iteration; escalate to the user
instead.

| Rule id | What it catches | Primary verb | Fallback / notes |
|---------|-----------------|--------------|------------------|
| `SKY_INK` | `#7DD3FC` / `--color-orange` used as a text color on a light surface | `colorize` | Then `harden`. Sky is a fill; text is ink/navy. Never "fix" by darkening the sky token itself. |
| `LEGACY_NAME` | a warm hex (`#F5A623`, `#E07B54`, `#F28B82`) reappeared anywhere in `src/` | `colorize` | Hand-edit is usually correct; the variable NAMES stay legacy, only values are cool. |
| `ONE_ACCENT` | a second accent hue on links/borders/icons; navy used as accent | `distill` | `quieter` if the offender is decorative rather than semantic. |
| `MOTION_IMPORT` | `import { motion }` instead of `{ m }` under LazyMotion strict | `harden` | Mechanical; fix directly, no verb needed if it is a single import line. |
| `EASE_SOURCE` | an inline cubic-bezier or named ease not sourced from `src/config/motion.ts` | `animate` | All easing routes through `EASE_BRAND`. |
| `HEBREW_TYPE` | italic on Hebrew, letter-spacing on Hebrew, line-height below 1.6 in body copy | `typeset` | Never `bolder` — that reaches for weight and misses the real defect. |
| `NO_STATIC_UNDERLINE` | `text-decoration: underline` at rest outside blog prose | `polish` | Hover/focus underlines are fine and expected. |
| `FOCUS_RING` | focus-visible outline missing, or under 2px, or invisible against its surface | `harden` | Accessibility-load-bearing; never resolve as `DEGRADED`. |
| `A11Y_NO_PERSIST` | accessibility widget writes settings to `localStorage` | `harden` | Project law. Settings are session-only. Direct edit. |
| `OVERFLOW_X` | `document.scrollWidth > innerWidth` at 320 or 390 | `adapt` | `layout` if the overflow comes from a grid rather than one runaway node. |
| `CONSOLE_ERROR` | any console `error` captured during the shot pass | none | Not a design defect. Fix as code, then re-shoot. Do not spend an iteration on a verb. |
| `AXE_CONTRAST` | axe serious/critical contrast violation | `colorize` | Usually the same root cause as `SKY_INK`; fix `SKY_INK` first and re-run before spending a second iteration. |
| `BLANK_RENDER` | a route screenshot is under the blank-page byte threshold, or the root node is empty | none | Infrastructure failure, not design. Check the serve step and hydration, then re-shoot. Never report `PASS` past this. |
| `TOKEN_DRIFT` | a raw hex/px value in a component where a token exists in the theme | `optimize` | `distill` if the drift is a whole duplicated scale rather than stray literals. |

Rules with verb `none` never justify an iteration — they are prerequisites. If any
of `CONSOLE_ERROR`, `BLANK_RENDER` fires in the `before` phase, fix it before
iteration 1 starts, or the whole comparison is meaningless.

## 5. Exit states

| State | Definition | When to use | What `REPORT.md` must say |
|-------|------------|-------------|---------------------------|
| `PASS` | `gate.json.fail` is empty in the final phase, every planned shot exists on disk with matching bytes, axe reports zero serious/critical, and `compare` shows no new failing rule ids vs `before`. | Only this. There is no partial `PASS`. | The rule ids checked, the verbs run, before/after paths, the compare delta. |
| `BLOCKED` | The loop hit the iteration cap with failures open, or a prerequisite (`BLANK_RENDER`, `CONSOLE_ERROR`, no server, missing Chrome) made measurement impossible. | Whenever you cannot honestly say `PASS` and you did not deliberately choose to ship a known gap. | Exactly which rule ids remain failing, what each of the 3 iterations attempted, and the single next thing a human should look at. |
| `DEGRADED` | The gate passes on everything measurable, but a check could not run and you are declaring that openly — e.g. a route could not be served, one viewport crashed the renderer, axe was skipped on a route. | Deliberately, with the skipped checks named in `gate.json.skipped[]` and a ledger `verdict` line listing them. | The list of checks that did NOT run, why, and what risk that leaves. |

`DEGRADED` is a respectable outcome. A run that measured three routes out of six
and says so is more useful than a run that measured three and implies six. What is
not acceptable is a silently degraded run: a verdict of `PASS` where `skipped[]`
is non-empty. `require-done.mjs` treats a non-empty `skipped[]` with a claimed
`PASS` as a contradiction and downgrades it to `BLOCKED`, because a wrong `PASS`
costs more than any `BLOCKED` ever does.

## 6. When the loop makes it worse

Regression detection is `compare.mjs`, not judgement. Two signals:

1. **Rule regression** — `compare-<n>.json` lists `newFailures[]`: rule ids that
   passed in `before` and fail in `after-<n>`. Any non-empty `newFailures` means
   the iteration was net-negative on the gate, regardless of what it fixed.
2. **Pixel regression** — per-shot `deltaRatio` (fraction of differing pixels).
   Interpret against the intended scope of the verb:

| deltaRatio | On a route the verb targeted | On a route the verb did not target |
|------------|------------------------------|-------------------------------------|
| < 0.005 | The edit did not land. Do not count the iteration; find out why. | Expected. Fine. |
| 0.005 – 0.15 | Normal targeted change. | Suspicious — inspect the shot before continuing. |
| > 0.15 | Only acceptable for `overdrive`, `bolder`, `layout`. Otherwise inspect. | Revert. A styling verb has leaked across the site. |

**Revert instead of iterating** when any of these hold:

- `newFailures[]` is non-empty and the failing rule is `SKY_INK`, `FOCUS_RING`,
  `A11Y_NO_PERSIST`, or `AXE_CONTRAST` — these are floors, not tradeoffs.
- `deltaRatio > 0.15` on a route outside the verb's target.
- Iteration 2 produced a different set of failures than iteration 1 rather than a
  smaller one — the loop is oscillating, and a third pass will oscillate again.
- The edit touched files outside the scope named in `brief.md`.

Revert mechanics: the `edit` ledger lines carry the file list per iteration.
Restore those paths from `gitHead` recorded at preflight (the tree was recorded as
clean/dirty there for exactly this reason — if it was dirty, revert only the listed
files, never the working tree). Append an `iteration` line with
`reason: "revert-<n>"`, re-shoot, re-gate, and either try one different verb within
the remaining budget or go straight to `BLOCKED`. A reverted run that ends
`BLOCKED` with the original defect intact is a clean result; a run that leaves half
a broken redesign in `src/` is not.
