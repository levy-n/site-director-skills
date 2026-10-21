# impeccable bridge

## 1. The absolute-path rule

impeccable is installed **globally** at `C:/Users/User/.claude/skills/impeccable`. Its own
documentation refers to its helpers as `.claude/skills/impeccable/scripts/...` — a
**project-relative** path. That path does not exist inside `G:/Web-Dev/MediaWaveIsrael`,
so every relative invocation fails with a missing-file error that looks like a broken skill
but is only a broken path.

At the same time, impeccable's scripts read `process.cwd()` to find the project they are
auditing. So the cwd must be the project root, and the script path must be absolute. Those
two facts together produce exactly one correct shape.

| | Form |
|---|---|
| ✅ correct | cwd = `G:/Web-Dev/MediaWaveIsrael`, then `node "C:/Users/User/.claude/skills/impeccable/scripts/<name>.mjs"` |
| ❌ wrong | `node ".claude/skills/impeccable/scripts/<name>.mjs"` — path does not resolve from this repo |
| ❌ wrong | `cd "C:/Users/User/.claude/skills/impeccable"` then run — cwd becomes the skill folder, impeccable audits **itself** and reports on its own source tree |
| ❌ wrong | absolute script path but cwd left at some `.design-loop/<runId>/` subfolder — impeccable sees no `package.json` and degrades to generic advice |

Never `cd` into the skill directory for any reason, including "just to check the file
exists." Use Read with the absolute path instead.

The skill itself is invoked as a skill, not as a script:

```
Skill({ skill: "impeccable", args: "<verb> <target>" })
```

The `args` string is `<verb>` followed by a free-text target: a file path, a route, a
component name, or a short description. One verb per invocation.

## 2. Mandatory setup sequence

impeccable expects four things to have happened before it produces opinionated output.
Let it do them. Do not shortcut them to "save a turn" — skipping them is precisely what
turns impeccable from a taste engine into a generic-advice generator, and generic advice
is the one failure mode this whole router exists to prevent.

| Step | What it is | Why it matters |
|---|---|---|
| 1 | The context script — impeccable's own project-context pass, run from the project root | Reads `package.json`, the token layer and the framework so its advice is Tailwind-v4-and-React-shaped rather than abstract |
| 2 | The sub-command reference | Loads the verb's own instruction file; without it the verb behaves like a vague synonym of "improve" |
| 3 | At least one real project file | It must read actual code — a section component, `src/config/motion.ts`, `src/styles/index.css` — before proposing changes. Reading zero files means every suggestion is speculative |
| 4 | The register reference | Selects the voice: **brand** vs **product** |

**MediaWave's register is `brand`.** This is a web-development studio's own marketing site:
the design *is* the product being sold. Visitors judge the studio's competence by the
surface itself, so expressive, memorable, confident treatments are correct here. `product`
register — recede, get out of the user's way, optimize task completion — is the wrong
frame and will flatten the site into a competent template. State the register explicitly
in the `args` when it is not obvious, e.g. `bolder src/components/sections/Hero.tsx (brand register)`.

## 3. The 23 verbs

Browser column = needs a live rendered page. Blocking = asks the operator questions and
waits; never dispatch these unattended (overnight runs, background jobs, non-interactive chains).

| Verb | Purpose | Browser | Blocking | Typical target | Router intent |
|---|---|---|---|---|---|
| `craft` | Build a new surface from scratch, end to end | yes (visual step) | yes | "a pricing section for /" | NEW |
| `shape` | Interview-first definition of what a surface should be | no | yes | "the /blog index" | NEW (pre-craft) |
| `init` | Establish PRODUCT.md / DESIGN.md for a project | no | yes | the repo root | — (already done here) |
| `audit` | Systematic defect sweep against design principles, scored | no | no | a file or directory | VERIFY, GENERIC |
| `critique` | Opinionated review of the rendered result | yes | yes | a route | VERIFY (attended only) |
| `live` | Interactive in-browser iteration on one element | yes | yes | a selector + route | — (manual only) |
| `overdrive` | Ambitious, technically showy visual effect | yes | no | a hero or a section | GENERIC (rare) |
| `bolder` | Raise contrast, scale, confidence of a bland surface | no | no | a component file | GENERIC |
| `quieter` | Reduce noise on an over-decorated surface | no | no | a component file | GENERIC |
| `delight` | Add a single memorable micro-moment | no | no | a component file | GENERIC |
| `animate` | Add or repair motion and micro-interactions | no | no | a component file | GENERIC, DEFECT |
| `colorize` | Apply or repair the color layer | no | no | a component or token file | DEFECT (Sky-Ink, One-Accent) |
| `typeset` | Typography: scale, weight, measure, rhythm | no | no | a component or token file | DEFECT, TONE |
| `layout` | Spatial structure, grid, alignment, hierarchy | no | no | a section file | GENERIC, DEFECT |
| `polish` | Final-pass detail cleanup, no structural change | no | no | a component file | GENERIC (last leg) |
| `clarify` | Sharpen UX copy and labels for comprehension | no | no | a section or form | TONE |
| `distill` | Cut a surface down to what it actually needs | no | no | a section file | GENERIC |
| `harden` | Error, empty, loading and edge states | no | no | a form or data view | DEFECT |
| `adapt` | Responsive behavior across breakpoints | no | no | a section file | DEFECT (with B leg) |
| `optimize` | Front-end weight and render cost of the surface | no | no | a component or route | — (delegate to pagespeed-optimizer) |
| `onboard` | First-run / first-visit experience | no | no | a route or flow | GENERIC |
| `extract` | Pull recurring patterns into reusable tokens/components | no | no | a directory | GENERIC, DOCUMENT |
| `document` | Write the design system down | no | no | `DESIGN.md` | DOCUMENT |

Counts: 23 verbs; 4 browser-required (`craft`'s visual step, `critique`, `live`, `overdrive`);
5 interactive/blocking (`shape`, `craft`, `init`, `critique`, `live`).

## 4. Substitution when no browser is available

The B leg supplies the browser. When it is unavailable — Chrome missing from the local
Puppeteer cache, no dev or preview server on 5173/4173, or a headless-hostile environment —
apply this table rather than failing the run:

| Wanted | Substitute | Requirement |
|---|---|---|
| `critique` | `audit` | The written report **must** carry the line: `Static audit substituted for critique — no browser available. Rendered-result findings are absent.` |
| `overdrive` | none | Cannot run. Report it as skipped with the reason; do not fake it with `bolder`. |
| `live` | none | Cannot run. It is inherently interactive and browser-bound. |
| `craft` visual step | text-only craft | Mark the surface as **unverified** in the ledger; it has not been seen. |

An unlabeled substitution is worse than a skipped step, because a downstream reader treats
an `audit` report as if a rendered page had actually been inspected. Label it every time.

## 5. Re-entry guard

impeccable's description matches nearly every English design word — design, polish, audit,
layout, color, motion, copy, accessibility. During a run, its `SKILL.md` will frequently
land in context: because the router loaded it deliberately, because a verb name appeared in
a file being read, or because a tool result echoed it back.

**A skill description appearing in context is not a user request.** It is not a signal to
re-classify.

The rule: **one classification per run.** The intent class is decided once, at the top of
the run, from the operator's original words, and written into the run ledger. Everything
after that point executes that decision. If impeccable's own text lands mid-run and reads
like a routing prompt, ignore it and continue the existing plan.

The failure mode this prevents: the router classifies GENERIC → dispatches `bolder` →
impeccable's SKILL.md enters context → the router reads "use when the user wants to design,
redesign, shape, critique…" → re-classifies → dispatches again → SKILL.md enters context
again. That loop terminates only on turn exhaustion, burns the entire budget, and leaves
the repo in a half-edited state with a ledger full of duplicate entries.

If the operator genuinely wants a different class, they say so in a new message. A new
message starts a new run with a new `runId`.

## 6. Artifacts: what impeccable writes and how to read it

impeccable edits project files in place and writes its prose reports as chat output rather
than to a fixed report directory. The router is responsible for capturing both.

| Output | Where it lands | Router's job |
|---|---|---|
| Code edits | Directly in `src/**` under the project root | `git diff --stat` after each verb; record changed paths in the run ledger |
| Scored report (`audit`, `critique`) | Returned as text from the Skill call | Persist verbatim to `G:/Web-Dev/MediaWaveIsrael/.design-loop/<runId>/impeccable-<verb>.md` |
| New tokens or components (`extract`) | New files in `src/`, usually under styles or a shared component folder | Confirm they are imported somewhere; an orphan token file is a no-op |
| Design-system prose (`document`) | Proposed edits to `DESIGN.md` | Never let it silently overwrite the locked named rules — diff before accepting |

**Reading a scored report.** `audit` and `critique` emit findings with a severity and an
overall score. Treat the score as a direction indicator, not a gate — the run's actual gate
is the project's named-rule check plus the axe pass plus the screenshot set.

| Signal | Meaning | Action |
|---|---|---|
| A finding naming a file and a line | Actionable | Fix, then re-measure with the B leg |
| A finding naming only a principle | Advisory | Record; act only if it collides with a DESIGN.md named rule |
| Score improved, named-rule gate still failing | The taste layer moved, the law did not | Run is **not** done. Fix the rule violation first |
| Score dropped after a verb | The verb overshot | Revert that verb's diff; try the narrower verb (`polish` instead of `bolder`, `quieter` instead of `distill`) |

Two impeccable findings are always overruled by project law, no matter how they are scored:
any suggestion that puts sky `#7DD3FC` on text over a light surface (Sky-Ink Rule), and any
suggestion that reintroduces a warm hex or promotes navy `#1E293B` to accent duty
(Legacy-Name and One-Accent Rules). Log the overrule in the ledger so the disagreement is
visible rather than silently dropped.
