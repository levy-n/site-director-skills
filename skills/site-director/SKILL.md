---
name: site-director
description: 'The single entry point for MediaWave website work, brief to delivery, at award level (Awwwards Site of the Day) without hurting speed or accessibility. Nati picks reference moments he loves; this skill reads their source, films them with a GPU, translates them into the client''s world and proves them side by side. It proves the direction with one-screen material proofs before any code, owns creative direction (world dossier, decision log, storyboard), the motion prototype, QA and handoff, and routes every other website task to the skill that owns it. Use for a new client site, a redesign, a site or moment Nati loved, matching a reference precisely, or any website task when unsure which skill owns it.'
when_to_use: 'Triggers: "אתר חדש ללקוח", "תתחיל אתר", "בנה אתר מאפס", "אתר מושלם", "אתר ברמת Awwwards", "Site of the Day", "כיוון קריאייטיבי", "תיק עולם", "סטוריבורד לאתר", "פירוק אתר זוכה", "השראה מאתר", "אהבתי את האתר הזה", "רגע שאהבתי", "כמה שיותר דומה", "לא מספיק דומה", "תהיה מדויק", "לא מרגיש פרימיום", "זה לא ברמה", "הוכחת כיוון", "new client site", "start a website", "award-level site", "SOTD breakdown", "make it exactly like this site", "a moment I loved". Narrow tasks are routed, not done here: one effect to pattern-breaker Moment mode, one Rive piece to rive-studio, CMS editing to client-content-editor, a pre-ship audit to site-gate-audit, a proposal to mediawave-landing-page.'
argument-hint: "[client or project] [new|redesign|harvest|moment] [stage 0-6]"
license: Proprietary (MediaWave)
metadata:
  author: mediawave
  version: "1.2.0"
  calibrated-for: "claude-opus-5-5 (2026-10)"
  research-date: "2026-10-15"
---

# Site Director

This skill conducts a complete client site. It does not rewrite the skills it calls: it decides what runs, in which order, with which inputs, and it owns only what none of them has. That means the creative-direction stage and its three artifacts, the eye round and the side-by-side gate, the extra motion effects, one merged QA list, the SOTD harvest mode, and the precedence rules. It is the super-skill: any website request can start here, and this skill sends it to the owner.

Paths: `<skill>` means `${CLAUDE_SKILL_DIR}`, and `<skills>` means `${CLAUDE_SKILL_DIR}/..` (the skills root). Reference files use these placeholders.

## Router

| The request | Goes to |
|---|---|
| A new client site, or a full redesign | stages 0-6 below |
| "I loved this site / this moment", "take inspiration from" | the eye round (`references/human-eye.md`), then the stage it feeds |
| Break down an award-winning site | harvest mode (`references/sotd-harvest.md`) |
| Trails, surprises, hovers, small details | the details lab (`references/details-layer.md`) |
| A new look, or "it does not feel premium" | the direction proof (`references/direction-proof.md`): reference DNA sheet, 2-3 one-screen proofs, Nati picks |
| "Like that site, but precise", "not similar enough", any material or WebGL effect from a reference | reference fidelity (`references/fidelity.md`): read its source, shoot it with the GPU, then build and compare side by side |
| A media-led look: a showreel hero, live pictures, a material the media breaks into | the engine patterns (`references/media-material.md`), after the direction proof |
| One section or one effect in an existing site | the eye round if it comes from a reference, then pattern-breaker Moment mode |
| Revive an existing site without a full redesign | pattern-breaker upgrade mode |
| One Rive piece | rive-studio |
| Proposal, price, content collection, legal pages, deploy | mediawave-landing-page |
| The client edits content | client-content-editor |
| Fonts, specimens, dashes, RTL in a document | nati-design-prefs |
| Pre-ship audit | site-gate-audit |
| Broken on phones | mobile-ux-fixer |
| Critique or polish of a finished page | impeccable |
| Slow site | pagespeed-optimizer (reference only) |

Announce the route in one line and call the skill by name (`references/routing.md` §6).

## Before the principles: Nati's eye sets the level

Award-level precision comes from a human eye, not from a prompt (Nati, 19.10.2026). Nati picks the moments that set the bar; this skill dissects them, translates them into the client's world, builds them, and proves them side by side with the reference. The skill never picks the references for him and never grades its own work as SOTD level: his side-by-side verdict decides. Procedure: `references/human-eye.md`.

Match the references' level before building anything. Mechanics alone are not the level: the references' visual DNA is (ground, living material, type scale, structure, density, imagery, motion signature, opening). The direction proof (`references/direction-proof.md`) is a gate: a DNA sheet, the client's own version of the references' signature material, two or three one-screen proofs at 390 and 1440, and Nati's pick, all before any site code. A full MediaWave home was once built, gated and rejected because this step was skipped.

Precision comes from the reference's source, not from screenshots. Before building a material, shader or WebGL moment from a reference, read its code and shoot it with the GPU, zoomed (`references/fidelity.md`): on mediawave.co.il six rounds guessed from screenshots were rejected, and one round of reading Lama Lama's shaders matched it. After the second "not similar enough" on one moment, stop guessing and go to the source. Then go past what Nati named: list the small details he did not mention and build them.

## The three principles (mandatory on every site)

1. **References from the client's world.** Before any design, a world dossier of 15-30 items from the trade itself: tools, materials, documents and forms the client hands out, signage, uniforms, measuring instruments, markings, jargon, moments from the work. Each item becomes a decision. Inspiration sites never decide what the site is about; they set the level and the mechanics, and only through moments Nati picked (the eye round). Nobody else's look, palette or layout enters the project. The same holds for every detail: a trail, a surprise or a hover comes from the client's world too, or it does not ship. And restraint wins over richness: at most 1 trail, 3 surprises, 1 control style and 1 scroll mechanic per page, and every still frame must look calm and elegant (`references/details-layer.md` §1).
2. **Sharp design decisions.** One accent whose meaning comes from the client's world and is used only for that meaning. At most two font families: a display face with presence and an "instrument" face for numbers, labels and indexes, picked by Nati from rendered specimens. A grid taken from the client's world. One focal point per section. A decision log where every decision has a reason and a dossier item. The swap test.
3. **A story, not a feature list.** 3-5 chapters named by verbs, in the order things happen for the client, around one persistent object from the client's world that changes state along the scroll. Per chapter: one focus, one motion moment, one proof. Features appear only as proof inside a chapter. The hero interaction comes from the work itself.

On top of the three: scroll and motion at Awwwards level, inside a budget of 2-3 standout moments, never at the cost of performance or accessibility. The case study behind these rules is in `references/heron-case.md`.

## Standing rules

1. **Route, don't rewrite.** Each step belongs to the skill named in the stage map. Call it, give it the artifacts, and do not copy its procedures here.
2. **One source of truth per artifact.** `design/world-dossier.rtl.md`, `design/design-decisions.rtl.md` and `design/storyboard.rtl.md`. The storyboard IS pattern-breaker's scroll score (its beats table carries every SCROLL-SCORE column). The project keeps one decision log: if a root `DECISIONS.md` or `DECISIONS.rtl.md` exists, it is the log.
3. **Never invent facts** about the client, the trade, proof or numbers. Unknown means `[לבירור]` plus a question to the client.
4. **Nati picks the fonts** from 3-4 specimens rendered on the real layout, labelled A/B/C/D (nati-design-prefs). Never on autopilot.
5. **Only the plain hyphen "-"** in everything this skill and the skills it calls produce: files, copy, questions, chat. No en dash, em dash or maqaf. Hebrew files end in `.rtl.md`.
6. **Strict reduced motion on client sites.** The OS setting shows every moment's last frame: no Lenis, no scrub, no loops, no cursor, no pointer masks. mediawave.co.il is the exception: full motion on every regular visit (D160), `?calm=1` for calm, and the accessibility widget's stop switch or `?reduce=1` to stop everything.
7. **Content is visible without JavaScript.** The LCP element is text or a poster, never hidden or animated from opacity 0.
8. **Centring is allowed on every site.** What is banned is the template: two buttons, a logo strip and three cards.
9. **Work in the main thread and show results early.** Subagents only where an owning skill prescribes them (pattern-breaker's probes, concept lanes, one fresh critic per milestone). One question per gate, with rendered options.
10. **Judge the rendered page.** Nothing is done until it has been screenshotted at 1440x900, 1440x700, 390 wide and in reduced motion, and the stage's checks pass.

## Stage map

| # | Stage | Owner | Output | Gate |
|---|---|---|---|---|
| 0 | Setup: mode, stack, CMS, environment | this skill | D1 in the decision log | - |
| 1 | Business: discovery, proposal, photo request | mediawave-landing-page | discovery-output.json, proposal | proposal approved |
| 2 | **Creative direction** | this skill + pattern-breaker + nati-design-prefs | the three artifacts, BRIEF, CONCEPT, the picked direction proof | Nati picks a proof, then approves |
| 3 | Motion prototype: hero + one chapter | this skill + pattern-breaker engine (+ rive-studio) | running prototype, screenshot matrix | Nati approves |
| 4 | Build | pattern-breaker, rive-studio, client-content-editor or Payload, mediawave-landing-page (legal, SEO) | the site | - |
| 5 | QA | this skill (merged list) + scripts + one fresh critic | QA report | all checks pass |
| 6 | Delivery and monitoring | mediawave-landing-page + pattern-breaker handoff | handoff package, DESIGN.md | deploy approved |

A request can start at any stage (`$ARGUMENTS`). Before starting a later stage, check that the earlier artifacts exist: `node ${CLAUDE_SKILL_DIR}/scripts/check-artifacts.mjs design`.

## Stage 0: setup

- [ ] Mode: **new** (greenfield), **redesign** (an existing site: run pattern-breaker's upgrade audit first, then come back to stage 2 with its DIAGNOSIS as evidence) **harvest** (`references/sotd-harvest.md`) or **moment** (Nati brings a moment for an existing site: `references/human-eye.md`, then pattern-breaker Moment mode, then the side-by-side gate).
- [ ] Stack and CMS, logged as D1: default Astro static + client-content-editor; Next.js 16.4 + Payload 3.90 when the CMS must live inside the site; MediaWave's own site stays React + Vite + prerender. Reasons and versions: `references/routing.md`.
- [ ] Pinned versions: gsap 3.15.0, @gsap/react 2.1.2, lenis 1.3.26, exact, all GSAP plugins on the core version.
- [ ] Environment: `TEMP` and `TMP` on `G:/tmp/temp`, at least 5 GB free on C:, puppeteer resolvable from the project.
- [ ] Gate approvers: Nati (and Moriah on mediawave.co.il).
- [ ] Copy the templates from `<skill>/assets/templates/` into the project's `design/` folder (dropping `.template`).

## Stage 1: business (mediawave-landing-page)

Run its Phase 1 Tier 1, Tier 1.5 SEO and Phase 0.5 proposal. The questionnaire includes the five world questions. Skip its Tier 2 design questions, Phase 2 (inspiration), Phase 3 (design system), and its font and animation researcher agents: stage 2 replaces them. Right after the proposal is approved, send the content brief with the world shot list (10-20 photos from the workplace), so the photos arrive **before** stage 2.

## Stage 2: creative direction (mandatory)

Procedure: `references/creative-direction.md`. Rules: `references/design-rules.md` and `references/story.md`.

1. World round: the five questions (`references/world-questions.rtl.md`), the client's photos, research on the trade's objects and documents. Where the client's own material is missing, find unique, licence-checked free images and video of the client's world (`references/media-sourcing.md`, `scripts/find-media.mjs`), log every file in `design/media-ledger.rtl.md`, and ask Nati once before downloading.
2. Eye round (`references/human-eye.md` §5), beside the world round: Nati brings 3-5 moments; each is harvested (open code read, closed sites filmed), reduced to one mechanic and translated into 2-3 options from dossier items; Nati picks which one carries the hero.
2a. Direction proof (`references/direction-proof.md`), a gate: the reference DNA sheet for every picked site, the translation recipe (the client's version of the references' signature material, as the persistent object), two or three one-screen proofs from `<skill>/assets/proof/material-proof.html`, the side-by-side still test against each reference, then Nati picks. No site code before the pick.
2b. Details lab (`references/details-layer.md`), proposed on every site without being asked: 3 pointer trails, 5-7 surprises tied to the services, 2 two-state control styles and the scroll translations, every one taken from a dossier item, built as a working page; Nati picks per layer.
3. The cliche exercise: delete the field's cliche word from the brief and write what the business actually does.
4. `design/world-dossier.rtl.md`: 15-30 items, each mapped to an axis (grid, type, colour, interaction, motion, content, shape).
5. pattern-breaker greenfield intake rounds (only what discovery left open) and its concept lab, with the condensed dossier, the pinned persistent object and Nati's picked moments in `design/BRIEF.md`. At least two directions; the safe one is shown to Nati, marked, and rejected with a reason.
6. Swap tests: a business from another field, and a same-field competitor.
7. Fonts: nati-design-prefs specimens A/B/C/D on the real layout; Nati picks.
8. Hero idea board: 8-10 cheap ideas from the dossier and the translated moments before any prototype.
9. `design/design-decisions.rtl.md` and `design/storyboard.rtl.md` (each referenced moment names its library slug); then pattern-breaker's critic milestone 1 with the extra questions from `references/qa.md` §2.
10. `node ${CLAUDE_SKILL_DIR}/scripts/check-artifacts.mjs design` passes. Gate: Nati approves the direction.

## Stage 3: motion prototype

Start from the picked direction proof's material (never from scratch). Build the hero and one chapter only, at 390 first and then widened (most visitors judge on a phone, and a concept that only works at 1440 is not a concept), on pattern-breaker's motion engine plus this skill's effects (`references/motion-system.md`; page transitions in `references/page-transitions.md`; code in `<skill>/assets/`). A drawn, stateful hero or persistent object goes to rive-studio here. Screenshot the matrix (`node ${CLAUDE_SKILL_DIR}/scripts/shots.mjs <url> --out design/shots`), film it (`node <skills>/pattern-breaker/scripts/scroll-film.mjs <url> --viewports desktop,short,mobile`), and show Nati before building anything else. Every moment translated from a reference passes the side-by-side gate (`references/human-eye.md` §6): our film next to the reference at the same viewport, and Nati says "same level" or names what is missing.

## Stage 4: build

- pattern-breaker greenfield steps 4-5 (foundations, then sections in storyboard order), with the storyboard as the score. Every `<section>` in `<main>` carries `data-chapter` and `data-dossier`.
- Rive pieces: rive-studio, after the storyboard row for that piece exists.
- CMS: client-content-editor (static) or Payload inside Next (mediawave-landing-page's Payload setup), per D1. Editable slots get length and image-ratio limits so motion survives client edits.
- Copy: pattern-breaker content-voice; the strategy layer (awareness, message match, objection FAQ) from mediawave-landing-page Phase 4. Mark new copy for Nati's approval.
- Legal pages and SEO: mediawave-landing-page 5E and 5F.
- Lead popup, if the site has one: it opens on intent, never on a timer (`references/lead-capture.md`).

## Stage 5: QA

The merged checklist and every command: `references/qa.md`. It covers the three artifacts and their linkage to the site, the swap test, the accent audit, banned defaults, the screenshot matrix, extreme content (very long and very short Hebrew, missing image, every client-editable field), performance with motion on, accessibility (WCAG 2.2.2, 2.3.1, 2.3.3, 2.4.11), pattern-breaker's motion-audit, gates and slop-scan, site-gate-audit's ten gates, and one fresh critic scoring by the Awwwards site weights and the Developer-award weights. The target is to beat Heron's Developer scores, especially markup (6.6) and accessibility (6.8). The side-by-side gate runs again on the finished build for every referenced moment; the critic's score informs, Nati's verdict decides.

## Stage 6: delivery

mediawave-landing-page Phase 7-8 (deploy, handoff package, monitoring). pattern-breaker handoff: the project's DESIGN.md and one line in its `memory/portfolio-log.md`. Tag a rollback point before production and write the rollback command into `.context/HANDOFF.md`. Deploy only with Nati's explicit approval.

## Precedence when skills disagree

1. Nati's rulings and the three principles.
2. pattern-breaker (concept mechanics, motion engine, verification scripts).
3. nati-design-prefs (fonts, dashes, RTL, LTR isolation; its base64 font rule is for documents, not websites).
4. site-gate-audit (gate reasoning and targets).
5. rive-studio (how a Rive piece moves; this skill decides whether and where).
6. impeccable, Anthropic's frontend-design, mobile-ux-fixer: specialists.
7. frontend-super, pagespeed-optimizer, design-inspiration-to-code: reference only.

What to take from each skill and what never to run from it: `references/routing.md`.

## Scripts

```bash
node ${CLAUDE_SKILL_DIR}/scripts/check-artifacts.mjs design [--html dist] [--decisions DECISIONS.rtl.md]
node ${CLAUDE_SKILL_DIR}/scripts/shots.mjs <url> --out design/shots [--accent "#hex"] [--paths /,/about]
node ${CLAUDE_SKILL_DIR}/scripts/lint-dashes.mjs <files or folders>
node ${CLAUDE_SKILL_DIR}/scripts/embed-fonts.mjs <proof template> <out.html> <font-a.woff2> <font-b.woff2>
PROOF_PROJECT=<project> node ${CLAUDE_SKILL_DIR}/scripts/proof-shots.mjs <proof.html> <out> 390x844   # and 1440x900
node ${CLAUDE_SKILL_DIR}/scripts/find-media.mjs --q "<terms>" --type image|video --out design/media/candidates   # --download <ids> only after Nati approves
```

Each prints usage with `--help`, needs Node 20+, and the screenshot script needs puppeteer resolvable from the project (`npm i -D puppeteer`).

## References

| File | Read when |
|---|---|
| `references/creative-direction.md` | stage 2, step by step |
| `references/world-questions.rtl.md` | asking the client about their world (stage 1 or 2) |
| `references/design-rules.md` | any P2 decision: accent, fonts, grid, focus, banned defaults, swap test |
| `references/story.md` | chapters, the persistent object, proof, the hero interaction |
| `references/media-sourcing.md` | the client has no photos or video of their world: free, licence-checked, unique media and the media ledger |
| `references/lead-capture.md` | any lead popup or nudge: it opens on intent (`assets/lead/lead-intent.js`), never on a timer |
| `references/motion-system.md` | stage 3-4: the one clock, effects, budget, RTL, height, performance, accessibility |
| `references/page-transitions.md` | multi-page sites: Astro ClientRouter or Next.js ViewTransition |
| `references/routing.md` | which skill owns what, what never to run, stack and CMS choice |
| `references/qa.md` | stage 5, and the critic's extra questions at stage 2 |
| `references/heron-case.md` | the verified case study |
| `references/external-principles.md` | ideas taken from external skills, with credit |
| `references/sotd-harvest.md` | breaking down an award-winning site |
| `references/direction-proof.md` | stage 2a: the reference DNA sheet, the translation recipe, building the proofs, the side-by-side still test, the gate; template `assets/proof/material-proof.html` |
| `references/details-layer.md` | stage 2 details lab (trails, surprises, two-state controls, live details, material), stage 4 build, stage 5 checks; the lab template is `assets/lab/details-lab.html` |
| `references/harvest/*.md` | finished harvests (`mr-pandas.md`: scroll gearing; `lamalama.md`: the squares material read from its shaders, picture edges, trail, two-state buttons) |
| `references/fidelity.md` | matching a reference precisely: read the source, GPU frames and zoomed crops, the inventory, what Nati's words mean |
| `references/media-material.md` | a media-led look: one WebGL canvas, the showreel, live pictures, the squares material and its edges, the pointer, text over media; code `assets/motion/squares.glsl` |
| `references/human-eye.md` | the eye round, where to hunt, open-source award sites, the moment library (`G:/Projects/moment-library/`), the side-by-side gate |
| `assets/templates/*` | the three artifacts |
| `assets/motion/*`, `assets/astro/*`, `assets/next/*` | effect and lifecycle code (see `assets/motion/README.md`) |

`GUIDE.rtl.md` is the human guide in Hebrew; don't load it.
