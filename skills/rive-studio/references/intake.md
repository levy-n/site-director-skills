# Intake: the guided questions that shape the piece

Read at the start of every mode, before any design decision. The Hebrew question bank is `intake-bank.rtl.md`. The output is `design/rive/MOTION-BRIEF.md` (from `assets/templates/MOTION-BRIEF.template.md`) and, once a concept is chosen, the contract (`rive-contract.md`).

Why the intake matters: a vague start produces the category median (a blob mascot, elastic overshoot on everything, a gradient spinner). A spec revealed over many turns costs more and performs worse than one complete brief. Every question exists because its answer changes the piece.

## Contents
1. Principles
2. The question tool and its limits
3. Rounds
4. Options come from evidence
5. Previews
6. Autopilot
7. Without the question tool
8. Compiling the brief
9. When site-director conducts the site

---

## 1. Principles

1. **Infer first, ask second.** Read the repo (stack, tokens, fonts, `dir`, existing `.riv` files, `design/BRIEF.md`, `design/CONCEPT.md`, `DESIGN.md`, `PRODUCT.md`, and when present `design/world-dossier.rtl.md`, `design/design-decisions.rtl.md` and `design/storyboard.rtl.md`), the live site or app screens, and the tools available (is the Rive MCP connected, does `rive doctor` run?). Never ask what the files answer; §9 lists what the site-director files settle.
2. **Front-load.** A full piece gets at most four rounds and about twelve questions; a single component gets one round of at most four. Then compile the brief and build. Anything genuinely new that appears later is batched into one question call.
3. **Every question has a recommended option**, listed first and marked "(מומלץ)" in Hebrew sessions or "(Recommended)" in English ones. The recommendation comes from the evidence, and its description says why.
4. **Ask in the user's language.** Nati works in Hebrew, so the bank is Hebrew. In an English session translate the bank faithfully; do not invent new options.
5. **No question whose answer would not change the piece.** If both answers lead to the same result, decide and record it under Inferred.
6. **Show, do not describe.** Personality, intensity and concept are visual choices: they carry previews, and the concept is chosen only after the user has seen the motion sketches running (`motion-sketches.md`).
7. **Main thread only.** The question tool is not available inside subagents and workflows take no input mid-run. Sketch agents return files; the main thread asks.
8. **Lint every payload.** Write it to `design/rive/.ask/<round>.json` (shape: `assets/intake/round2-feel.example.json`), run `node ${CLAUDE_SKILL_DIR}/scripts/lint-ask.mjs design/rive/.ask/<round>.json`, fix every ERROR and every preview warning, then call the tool with the same content.

## 2. The question tool and its limits

AskUserQuestion in Claude Code, as `scripts/lint-ask.mjs` enforces it:

| Limit | Value |
|---|---|
| Questions per call | 1-4 |
| Options per question | 2-4 (fewer than 2 is rejected) |
| `header` | 1-12 characters, a chip label |
| `label` | 1-5 words |
| `description` | required; say what the choice changes |
| "Other" | added automatically; never add your own Other or Skip option |
| `multiSelect` | true when choices are not exclusive; no commas inside labels then |
| `preview` | single-select questions only; monospace markdown beside the options |
| Answers | keyed by question text, so question texts in one call must differ |

House rules: previews at most 40 columns and 18 lines, ASCII only inside boxes, no Hebrew between box borders, no en dash, em dash or maqaf in any field (use "-"). Only the user sees the rendered pane: if they report a misaligned preview, ask `assets/intake/smoke-test.json` once to measure its width.

## 3. Rounds

| Round | When | Questions (headers) | What the answers decide |
|---|---|---|---|
| 0 | silently, first | none | evidence, platform, MCP status, and what the site's direction files already settle (§9) |
| 1 | start | תפקיד, פלטפורמה (only if unclear), דרך עבודה, טריגרים | role, platform, build path, drivers |
| 2 | after round 1 | אופי תנועה, עוצמה, סגנון, להימנע | personality, intensity and file budget, visual material, anti-references |
| lab | between 2 and 3 | none: build and show the motion sketches | concepts the user can see |
| 3 | after the user has seen the sketches | קונספט, טקסט, מצבים (only if not implied), תנועה מופחתת (not asked on client websites: strict final frames, `verification.md` §5) | concept, text strategy, states, reduced-motion behaviour |
| 4 | after compiling | אישור, with the brief as preview | build, or one targeted change |

After round 2 (or the single-component round), write the **States list** into the brief: the states the role needs (`motion-craft.md` §3), which the sketches implement.

**Single component** (a button, toggle, icon, loader), the short flow:
1. One call of at most four questions: אופי תנועה, מצבים or טריגרים, דרך עבודה, and פלטפורמה only if unclear. Intensity defaults to subtle (60 KB), recorded under Inferred.
2. Two sketches (A and B), shown on the board.
3. One call: קונספט, plus תנועה מופחתת only when the role does not imply it (not asked on client websites: strict final frames, `verification.md` §5).
4. Brief and contract, then אישור with the brief as preview.

**Upgrade** of an existing product and **existing `.riv`** integration have their own short openings in `intake-bank.rtl.md` §9.

Skip any question the evidence already answers, and show the inferred answer in round 4's preview instead.

## 4. Options come from evidence

The skeletons are fixed; the options are not. The best questions offer the user true things about their own product and ask which one leads.

| Question | Where its options come from |
|---|---|
| תפקיד | where the product is static or generic today: a still hero, a stock spinner, empty states, controls without feedback |
| פלטפורמה | the build files found in round 0 |
| דרך עבודה | the role and the tools found: "Claude builds in code" (CLI) by default; "Claude builds in the Editor" (MCP) for illustration or rigged characters when the Editor MCP is connected |
| סגנון | the logo geometry, the illustrations, photos and objects the brand already owns |
| להימנע | the reflexes in `motion-craft.md` §11 most likely for this role, plus what 3-5 competitors in the category do |
| קונספט | the motion sketches, one option per sketch |
| מיפוי (existing file) | the probe output: real property names, matched to real product events |

Each option's description says what choosing it changes in the piece ("the mascot gets a concern pose and a help gesture for errors"), not only what it means.

## 5. Previews

Use previews for visual or structural choices only: personality, intensity, concept, and the final brief. The templates are in the bank; fill them from evidence and the sketches. Never reuse a previous project's concept preview as an example, or it becomes a house style.

The concept preview summarises; the sketch page is what the user actually judges. Ask round 3 only after the sketch page was shown.

## 6. Autopilot

In an unattended run (a loop, an eval, a scheduled job) or when the user says "תחליט אתה" or "you decide":
- take the recommended option for every question;
- record each one in the brief under **Assumed**, with the evidence that made it the recommendation;
- pick the concept that best passes the competitor swap test (it would look wrong on a competitor's product) within the budget;
- never approve side effects: no installs (Rive CLI, npm packages), no MCP registration, no `rive push`, `rive pull` or `--publish`. Without a working CLI or Editor MCP, use the build sheet path and list what was skipped;
- tell the user at the end which assumptions shaped the result most.

If the question tool times out mid-session, do the same for the unanswered questions and say so.

## 7. Without the question tool

Send the same questions as one numbered message, the recommended option first in each, and wait for the reply. Never answer your own questions and never proceed on invented answers: a brief nobody agreed to produces a piece nobody wanted.

## 8. Compiling the brief

Fill `assets/templates/MOTION-BRIEF.template.md` into `design/rive/MOTION-BRIEF.md`:
- role, platform, build path, drivers, personality, intensity and file budget, style, the avoid list, concept, text strategy, states, reduced-motion behaviour;
- **Inferred** (from evidence, with sources) and **Assumed** (recommended options taken without an answer) as separate lists;
- on a site-director project, the Site context row (the storyboard row, its dossier items and the decision numbers) and a dossier item on every row of the Decisions table;
- the success criteria the verification checks: rubric threshold, budgets, every state in the contract rendered, reduced motion, accessibility.

Then draft the contract (`rive-contract.md`) for the chosen concept, and show the brief with the contract summary as the preview of the אישור question. The brief and the contract are the single source of truth: when the user changes something later, update them, not just the conversation.

## 9. When site-director conducts the site

site-director decides whether a client site uses Rive and where, and hands a piece here only after the piece's row exists in the storyboard. Its files then join round 0:

| File | What it carries for the piece |
|---|---|
| `design/world-dossier.rtl.md` | the items from the client's trade (`W01`, `W02`, ...), the cliche word, and the motifs already rejected as puns on the name |
| `design/design-decisions.rtl.md`, or the root `DECISIONS.md` / `DECISIONS.rtl.md` when the project keeps its log there | the rejected directions, the stack (`D1`), the accent and its one meaning, the fonts, the persistent object and its states, the hero interaction, the moment budget |
| `design/storyboard.rtl.md` | the piece's rows: its chapter row (or the `hero` row) and the beats of that chapter, with what the visitor does, the reduced last frame and the mobile treatment |

Read them before the first question and skip what they settle. Record each skipped answer under **Inferred** with the file and the row or ID as its source, and show it in round 4's preview.

| Question | Settled by |
|---|---|
| פלטפורמה | `D1` |
| תפקיד | the storyboard row: the hero interaction, the persistent object, or the moment the row names |
| טריגרים | the beats' "what the visitor does" column, plus scroll progress when the piece is the persistent object |
| אופי תנועה | the easing character under "Motion grammar" in `design/CONCEPT.md` |
| עוצמה | the moment budget decision and the row, when they say how large the moment is |
| סגנון | the dossier items the row cites |
| להימנע | seeded from the rejected directions, the cliche word and the rejected motifs; ask only for additions |
| מצבים | the object states in the piece's rows; states the row does not cover (hover, focus, error) follow `motion-craft.md` §3 |
| תנועה מופחתת | the beats' reduced last frame; client sites are strict: final frames only, no scrub and no loops |
| the font for text in the canvas | the display and instrument fonts in the decision log (the טקסט question is still asked when the row leaves it open) |

What stays open is usually the build path (דרך עבודה), the concept among the sketches (קונספט) and the final אישור. If a file leaves a question blank, ask it as usual.

**The row is the Material.** The storyboard row and the dossier items it cites are the Material constraint of every sketch (`motion-sketches.md` §2). The concept was chosen at site level, so the lab does not reopen it and does not run a second concept lab: the sketches differ in gesture and timing, not in idea.

**Conflicts.** When a row asks for something this skill's rules forbid (a heading drawn in the canvas, an idle loop that never rests, a pointer-only motion with no touch path), ask one question with the conflict and both options, then log the answer in the brief's Decisions table and as a new row in the site's decision log.
