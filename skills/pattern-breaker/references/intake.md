# Intake: the guided questions that decide the build

Read this at the start of both modes, before any design decision. The Hebrew question banks are in `intake-greenfield.rtl.md` and `intake-upgrade.rtl.md`. The output is one compiled brief, `design/BRIEF.md` (Hebrew content may live in `design/BRIEF.rtl.md`, following Nati's convention for Hebrew files), from `assets/templates/BRIEF.template.md`.

Why the intake matters this much: Opus 5.5 is literal and gets to work quickly. A vague start produces the category median, and a spec revealed bit by bit over many turns costs more and performs worse than one complete brief. Every question here exists because its answer changes the build.

## Contents
1. Principles
2. The question tool and its limits
3. Greenfield rounds (and fonts)
4. Upgrade rounds
5. Options come from evidence
6. Previews
7. When nobody can answer (autopilot)
8. Without the question tool
9. Compiling the brief

---

## 1. Principles

1. **Infer first, ask second.** Read what exists before asking: the repo (stack, tokens, `dir`, PRODUCT.md / DESIGN.md / DECISIONS files), the live site, the client's Instagram, Google Business profile and reviews, the old site. Never ask what the files answer. WebFetch usually cannot read Instagram (login wall) or Google Maps reviews (rendered by JavaScript); try a browser tool if one is connected, and when a found source still can't be read, ask for its content (the bank's מקורות question). The brief's Inferred list names only sources you actually read. In upgrade mode, run the full audit before the first question (upgrade.md).
2. **Research the trade, not only the business.** Round 0 also collects the trade's own objects and documents: tools, materials, the forms and documents it hands clients, signage, uniforms, measuring instruments, markings, insider words, moments from the work. Web and image search are fine; what is found is reference for the concept, never material for the site: no other business's logo, photos, illustrations or brand assets are copied.
3. **Under site-director, ask only what is still open.** When `design/world-dossier.rtl.md` exists, or `discovery-output.json` (mediawave-landing-page's discovery) has a `world` key, the client was already interviewed: the five world questions (desk objects, the documents handed to clients, insider words, the moment the client knows they are in good hands, the fear before getting in touch) and the 10-20 workplace photos. Then the dossier answers חומרים (the photo set), feeds הייחוד (what the business really does, the good-hands moment) and קהל (the fear), and the discovery output usually answers מטרה, קהל, שפות and מיתוג; the decision log's D1 answers תשתית. Skip every question so answered, state the inferred answer in round 4's preview, and ask the rest (usually עוצמה, אופי, להימנע, then round 3).
4. **Front-load.** At most four rounds in greenfield (the bank holds up to 14 questions; skip every one the evidence answers) and three in upgrade. The tool takes at most four questions per call, so a larger round is sent as two calls, back to back. Then compile the brief and build without drip-feeding new questions. If something genuinely new comes up later, batch it.
5. **Every question has a recommended option**, listed first and marked "(מומלץ)" in Hebrew sessions or "(Recommended)" in English ones, so the user can move fast. The recommendation is yours, from the evidence.
6. **Ask in the user's language.** Nati and his clients work in Hebrew, so Hebrew sessions get Hebrew questions; the banks are written in Hebrew for that reason.
7. **No question whose answer would not change the build.** If both answers lead to the same site, decide yourself and note it in the brief.
8. **Main thread only.** The question tool is not available inside subagents, and workflows take no input mid-run. Concept agents return data; the main thread asks.
9. **Lint every payload** before calling the tool: `node <skill>/scripts/lint-ask.mjs <payload.json>` (`<skill>` as defined in SKILL.md Tools) checks the limits below and the house rules.

## 2. The question tool and its limits

When you have a structured multiple-choice tool (AskUserQuestion in Claude Code), use it within these limits (verified 2026-10):

| Limit | Value |
|---|---|
| Questions per call | 1-4 |
| Options per question | 2-4 (fewer than 2 is rejected) |
| `header` | 1-12 characters, a chip label |
| `label` | 1-5 words |
| `description` | required; say what the choice changes |
| "Other" | added automatically; never add your own "Other"/"Skip" option |
| `multiSelect` | true when choices are not exclusive; no commas inside labels then (answers are comma-joined) |
| `preview` | single-select questions only; rendered as monospace markdown beside the options |
| Answers | keyed by question text, so question texts in one call must differ |

House rules for previews (from testing in a terminal): at most 40 columns and 18 lines, ASCII only inside boxes, no Hebrew between box borders (bidi breaks alignment), hex values and Latin font names are fine. No en dash, em dash or maqaf in any field or file (Nati's rule; use "-"). If the first preview of a session looks misaligned, run the smoke test in `assets/intake/smoke-test.json` once to measure the pane width.

## 3. Greenfield rounds

| Round | When | Questions (headers) | What the answers decide |
|---|---|---|---|
| 0 | silently, first | none: research the business and the trade's objects and documents (§1), fill what you can | evidence for options |
| 1a | start, only when needed | שפות (if not obvious), מקורות (if nothing was found, or a found source could not be read) | languages; the evidence that 1b's options come from |
| 1b | start | מטרה, קהל, הייחוד, חומרים | goal, audience, the unique claim, real assets |
| 2 | after round 1 | עוצמה, אופי (up to 2), להימנע, מיתוג | intensity budget, character, anti-references, brand constraints |
| - | between 2 and 3 | run the probes (reflexes.md §7) and the concept lab (concept-lab.md) | three concepts and the safe card |
| 3 | after the lab | קונספט (with previews and the safe card) and תשתית (with previews; skip when the decision log has D1); then, in a second call once the specimens are rendered on the chosen concept, טיפוגרפיה (below) | the concept, the stack, the type pair |
| 4 | after compiling | אישור (with the brief as preview) | build, or one targeted change |

Skip any question the evidence already answers (state the inferred answer in round 4's preview instead).

### Fonts: rendered specimens, the user picks

The טיפוגרפיה question is never an ASCII preview of font names. It follows nati-design-prefs (load it when available; the rule holds without it):

1. After the concept is chosen, set 3-4 candidate pairs on the real layout: the chosen concept's hero and one chapter or section, with real copy (a Hebrew headline, body text, numbers, a label or index line, a price or phone number, a word with geresh or gershayim, any Latin the site uses), at the concept's scale.
2. Capture them as **one image** with the panels labelled A, B, C and D, and show it to the user (send the file; in Claude Code, SendUserFile with render).
3. Then ask one single-select question: options labelled "A · <display face>" and so on (the text face goes in the description, so labels stay within five words), the concept's own pair first and marked recommended when it earns it, each description naming the text face, the character and any glyph fallback. The user picks; never pick for them, and never "propose and continue".
4. **At most two families:** a display face with presence and a face for text that also carries numbers, labels and indexes (site-director calls that job the instrument voice). A glyph fallback that only supplies characters the chosen faces lack (Latin, digits, geresh and gershayim), declared with `unicode-range`, is not a third family.
5. Banned and liked faces are listed in nati-design-prefs. A face from reflexes.md §5 may appear as a specimen when it earns its place; if it is picked, the decision log gets the reason (the slop-scan waiver cites it).
6. Record the pick in the decision log (display and text, weights, the glyph fallback, the licence) and run font-fallback.mjs on the picked files.

## 4. Upgrade rounds

| Round | When | Questions | What the answers decide |
|---|---|---|---|
| 0 | first (U0-U4) | none: pre-scan, baseline, audit, zone map, DIAGNOSIS with a provisional verdict (upgrade.md) | evidence |
| 1a | after DIAGNOSIS (U5) | עומק (recommended = the provisional verdict), לא לגעת (multi), להחיות (multi, options = top zones) | depth, sacred elements, which zones first |
| 1b | right after 1a | עוצמה (recommendation derived from the audit), הוכחות (multi, only when DIAGNOSIS lists proof to confirm) | intensity, which inherited proof may ship |
| - | between (U6-U7) | the final verdict, then 2-3 upgrade directions (the concept lab with the upgrade packet, concept-lab.md §2) | directions |
| 2 | after | כיוון (with before/after previews) | the direction |
| 3 | after the change list (U8) | אישור (with the upgrade plan as preview) | go, or one targeted change |

Playwright MCP's `browser_annotate` (if available) lets the user draw on the live page to mark what bores them; offer it as an alternative to the "להחיות" question. When an upgrade changes the fonts, the specimen flow in §3 applies.

## 5. Options come from evidence

The question skeletons are fixed; the options are not. The best questions offer the user three true things about their own business that you found, and ask which one leads.

| Question | Where its options come from |
|---|---|
| הייחוד (the one true claim) | phrases customers repeat in Google reviews; what the old site or Instagram shows that competitors' don't; the owner's own words; the dossier's good-hands moment |
| קהל (who arrives) | review authors, the Instagram audience, the business type, the client's fear from the world questions |
| להימנע (what would look generic) | what you saw on 5-10 local competitors' sites and the category's reflexes (reflexes.md) |
| להחיות (what to revive first) | the top zones of the audit by priority, each with its evidence |
| הוכחות (which inherited proof is real) | DIAGNOSIS "proof to confirm", each item with its evidence (content-voice.md §3) |
| קונספט / כיוון | the concept lab's three concepts, plus the safe card (concept-lab.md §7) |
| טיפוגרפיה | 3-4 pairs rendered on the real layout (§3), each tested in Hebrew, digits and Latin |

Each option's description says what choosing it changes in the site ("the last act is built around a conversation"), not just what it means.

## 6. Previews

Use previews only for visual or structural choices: intensity, concept, stack, depth of upgrade, before/after, the final brief. Fonts are shown as a rendered image instead (§3). Templates with placeholders are in the banks; fill them from the evidence and the concept lab. Never reuse a previous client's concept preview as an example; it becomes a house style.

## 7. When nobody can answer (autopilot)

In an unattended run (a loop, an eval harness, a scheduled job) or when the user says "תחליט אתה" / "you decide":

- take the recommended option for every question (for inherited proof, content-voice.md §3 decides what stays);
- write each one into the brief under **Assumed**, with the evidence that made it the recommendation;
- pick the concept with the criteria in concept-lab.md §8 (never the safe card);
- **never pick the fonts:** render the specimen image anyway, record the font choice as an open gate owned by the user, and build with the metric-matched fallback stack so the pick is a one-token change later;
- tell the user at the end which assumptions shaped the result most.

If the question tool times out mid-session, do the same for the unanswered questions and say so.

## 8. Without the question tool

Send the same questions as one numbered message, with the recommended option first in each, and wait for the reply. Never answer your own questions and never proceed on invented answers: some agents silently improvise an answer when the tool is missing, which produces a brief nobody agreed to.

## 9. Compiling the brief

Fill `assets/templates/BRIEF.template.md` into `design/BRIEF.md`:
- the goal, audience, unique claim, real assets, intensity, character, things to avoid, brand constraints, stack, deadline;
- under site-director, the **World dossier (condensed)** section (the items a concept can be built from, one line each: "W01 item: how it becomes the site") and the **Pinned by the brief** line (the persistent object or process story the concept must carry, or "nothing"); the lanes see the dossier only through this section;
- **Inferred** (from evidence, naming only sources you actually read) and **Assumed** (recommended options taken without an answer) as separate lists;
- the success criteria the verification will check (intensity budget, signature moments count, performance and accessibility budgets).

In upgrade mode the brief is compiled after the change list (U8): its plan section points to `design/upgrade/CHANGES.md`, and it records the verdict, the direction, the sacred list and the proof the owner confirmed.

The brief is the single source of truth for the build. Show it as the preview of the confirmation question, and update it (not the conversation) when the user changes something.
