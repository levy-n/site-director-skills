---
name: pattern-breaker
description: 'Art-directs and builds websites that do not look AI-generated: concept first, a visual language specific to the client, and a choreographed scroll experience (held scenes, scrubbed timelines, image sequences, theme shifts) that stays smooth on phones. Two entry modes: greenfield builds a new site from zero on correct foundations after a short guided interview, so no repair sessions follow; upgrade audits an existing site, finds its generic and lifeless spots, and brings them to life without losing its identity. Verifies by filming the page. Inside the MediaWave client pipeline it runs the design phase.'
when_to_use: 'Use whenever someone wants a site or landing page that is distinctive, premium, award-level, not generic or templated, or has great scroll animations, or wants an existing site revived, even if they only say "build me a beautiful site". Hebrew: אתר מאפס, שדרוג אתר, לא גנרי, שלא ייראה כמו AI, אנימציות גלילה, תחיה את האתר. Not for one-component tweaks, pure SEO or performance audits, or backend work.'
license: Proprietary (MediaWave)
metadata:
  author: mediawave
  version: "1.2.0"
  calibrated-for: "claude-opus-5-5 (2026-10)"
  compatibility: "Best in Claude Code (structured questions, subagents, browser tools). Works in other Agent Skills clients with plain-text questions and sequential passes. Scripts need Node 20+ and puppeteer (npm i -D puppeteer); ffmpeg is optional (video strips)."
---

# Pattern Breaker

This skill builds websites that a visitor remembers: a concept specific to the client, a strict visual system, and a scroll story where each section performs one idea. It has two entry modes, **greenfield** (a new site from zero) and **upgrade** (an existing site brought to life), and calls nothing finished until it has filmed the page scrolling on desktop and mobile and measured it.

## The stance

AI-made sites look alike because the model starts from components (hero, features, testimonials, CTA) and fills each with the statistically safest choice. Sites that break the pattern start from a story, build a system strict enough that a few moments can be loud, and engineer those moments until scrolling feels like directing a short film.

The reference is liavmatzri.co.il (`references/masterpiece-anatomy.md`). Its surface uses two common 2026 AI defaults (near-black with an acid accent, mono uppercase labels); it stands out through real material (the founder, real client videos), type used as image, and a choreography where every section carries one move that acts out its sentence. Learn that method for each client; never transplant one site's surface onto another.

The ambition, stated plainly because a literal reading under-delivers: unless the brief says otherwise, build a complete, working site with the number of signature scroll moments the intensity budget sets (usually 3), each tied to a sentence only this client could say, fully built with its mobile and reduced-motion versions, not sketched or stubbed.

## Standing rules

Generalise from the reasons.

1. **Run the intake before any design decision.** The answers change the build, and a brief assembled turn by turn performs worse than one complete brief. When the brief makes an explicit choice, it wins over this skill's defaults.
2. **Content is visible without JavaScript and without animation.** Reveals enhance a visible default: JS hides an element just before animating it, never the other way round. Headless renderers, prerendering and hidden tabs never fire scroll triggers, so content that waits for them ships blank (measured on MediaWave).
3. **Reduced motion shows every beat's last frame.** Under `prefers-reduced-motion: reduce`: no smooth-scroll library, no scrub, no holds, nothing moving on its own, and each moment rendered as its final, complete statement. Design moves so their last frame is the argument.
4. **Holds are sticky stages, not pins.** A tall wrapper plus a `position: sticky` stage, with ScrollTrigger (or `animation-timeline`) reading progress. Measured: GSAP's default pin emits layout shifts at every start and end (CLS 1.0 to 3.4 on a two-pin page); sticky stages and `pinType: 'transform'` emit none.
5. **Mobile is re-choreographed, not shrunk.** Every hold and cursor move gets a decided touch version in the scroll score. Touch scrolling stays native.
6. **Hebrew is not Latin.** No italics (Hebrew has none; browsers fake a slant), no letter-spacing on Hebrew, every direction-bearing motion and arrow mirrors in RTL, and line splits go through the engine's `splitLines` (plain SplitText collapses RTL text into a single line, measured).
7. **Real material first; proof is never invented.** The client's own photos, video, people and work beat anything generated; generated media shows the real subject; numbers are real and sourced; demos are labelled. Proof inherited from an old site is unverified until the owner confirms it (content-voice.md §3).
8. **Judge the rendered page, not the code.** Done means its film was watched and its measurements pass.
9. **The floor is non-negotiable:** WCAG 2.2 AA contrast, visible focus, keyboard access, an accessibility statement for Israeli sites (IS 5568), and the performance budgets in the brief (LCP, CLS during scroll, INP, smooth frames).

## First-instinct check

The defaults current models, including you, reach for. Check the plan against them before writing code and the film after building: a match stays only with a brief-specific reason written next to the token. Full catalog and the probes: `references/reflexes.md`.

1. Cream, sand or paper page (≈ #F4F1EA), or tokens named paper, bone, cream.
2. Terracotta, rust, clay or amber accent (≈ #D97757, #D9622B).
3. Near-black (#0B0B0B, #111) with one acid-lime or vermilion signal.
4. Purple-to-blue gradients, gradient text, neon glow, glass cards.
5. A high-contrast serif display with one italic or coloured accent word.
6. Inter, Geist, Space Grotesk, Satoshi or Clash Display; mono for small labels.
7. A tracked all-caps eyebrow over every heading; "01 / 02 / 03" on content that is not a sequence; "A · B · C" meta strings; "→" appended to links.
8. Pill buttons, one radius everywhere, identical rounded cards with the same soft shadow; bento as "the creative layout".
9. The template: a two-button hero, logo strip, three icon cards, testimonials, pricing trio, FAQ, CTA band; a stat hero (centring alone is fine).
10. Fade-and-slide-up on every section; a hover lift on every card.
11. The scroll kit by default: preloader counter, character-split on every heading, marquee, pinned horizontal gallery, stacking cards, magnetic buttons, custom cursor, parallax everywhere.
12. Grain overlay, gradient-mesh blobs, floating particles, a ticker as decoration.
13. Stock "people at a laptop", abstract 3D blobs, or coloured boxes where a real image belongs.
14. Copy built from abstractions ("Elevate", "Seamless", "הפתרון המושלם", "לקחת את העסק לשלב הבא"); three-noun taglines; "not just X, it's Y".
15. Hebrew: Heebo, Assistant or Rubik as the brand voice by reflex; tracking or faux italics on Hebrew; LTR arrows; the WhatsApp-bubble plus three-service-cards small-business template.

## Choose the mode

| The user… | Mode | Start with |
|---|---|---|
| wants a new site or landing page, or has only a brief or an old site to replace | **Greenfield** | `references/intake.md` → `intake-greenfield.rtl.md` |
| has a site (URL or repo) that looks generic, boring or "AI-made" and wants it alive | **Upgrade** | `references/upgrade.md` (audit first), then `intake-upgrade.rtl.md` |
| wants to learn from a site they love | **Harvest** | scroll-film it, then `references/masterpiece-anatomy.md` §3: extract a method, not a look |
| wants one memorable moment added to an existing section | **Moment** | `references/moves.md`, then build, film and measure that range |

If it is unclear whether a site already exists, ask that one question first.

## Greenfield

1. **Intake** (`intake.md`, `intake-greenfield.rtl.md`). Research silently first: the client's Instagram, Google reviews, old site, five to ten local competitors, and the trade's own objects and documents. Then up to four rounds of questions (under site-director, only what is still open), options from that evidence, recommended first; the user picks fonts from rendered specimens. Compile `design/BRIEF.md`.
2. **Concept** (`reflexes.md` §7, `concept-lab.md`). Run the probes, then the concept lab: three concepts under three forcing constraints (material, tradition, transformation). Check each (concept-lab.md §6), present them with previews and the safe direction marked and rejected, write `design/CONCEPT.md`.
3. **Scroll score** (`scroll-score.md`, `moves.md`). One row per beat: sentence, theme, hold, move, mobile version, reduced-motion last frame. Check it against the pacing budgets and write `design/SCROLL-SCORE.md` (or the storyboard: see Files). Then critic milestone 1, "plan" (critic.md).
4. **Foundations** (`foundations.md`). Scaffold the stack, tokens, fonts, motion engine, content model, SEO and accessibility baseline, QA hook and scripts, and pass the foundation gate before building the first section; this prevents later repair sessions.
5. **Build** (`visual-language.md`, `motion-engine.md`, `moves-recipes.md`, `content-voice.md`, `hebrew-rtl.md`). Tokens first, then the engine, then sections in score order. Each section is built complete: content, its move, its mobile version and its reduced-motion last frame, then filmed over its range (`scroll-film --at`) before the next. After the first full build, critic milestone 2.
6. **Verify** (`verification.md`, scripts below). Film both viewports, run motion-audit, gates and slop-scan, then critic milestone 3; vet and fix the findings.
7. **Handoff.** Close the ledger, write the project's DESIGN.md (tokens, motif, moves used, how to extend), and add one line to `memory/portfolio-log.md`.

## Upgrade

Step order, artifacts and the small-site short path: `upgrade.md` §1.

1. **Audit before asking** (U0-U4): silent pre-scan, baseline and preservation snapshot, the four critics, the zone map, then `design/DIAGNOSIS.md` with the keep list, zone scores, a provisional verdict and the inherited proof to confirm.
2. **Intake round 1** (U5, `intake-upgrade.rtl.md`): depth (recommended = the provisional verdict), what is sacred, which zones first, intensity, which proof is real. Then the final verdict (U6).
3. **Directions** (U7): two or three from the concept lab, fed the upgrade packet (concept-lab.md §2), shown as before and after; intake round 2.
4. **Change list** (U8) and round 3, then **waves** W0-W4. URLs, heading semantics, prerendered text and conversion paths stay intact. Motion enters through data attributes (`assets/engine/attribute-layer.js`), so the markup works without it and every zone has a kill switch.
5. **Verify each wave** with before/after films, measurement deltas, the gates and the preservation diff; critic after W1 and before handoff.
6. **Handoff** as in greenfield, plus the before/after summary.

## Files this skill writes

| Path | Holds |
|---|---|
| `design/BRIEF.md`, `CONCEPT.md` | the brief (both modes), the concept |
| `design/SCROLL-SCORE.md` | the score; not written when `design/storyboard.rtl.md` exists (that IS the score, chapters above beats) |
| `design/LEDGER.md` | open items, critic findings, verification log; its Decisions section only points to the decision log |
| `DECISIONS.md` (project root) | the numbered decision log; not created when a root `DECISIONS.rtl.md` or `design/design-decisions.rtl.md` exists (that is the log; a root log wins) |
| `design/world-dossier.rtl.md` | written by site-director; condensed into BRIEF and the lane packet (concept-lab.md §2) |
| `design/DIAGNOSIS.md` (+ `.rtl.md`) | upgrade diagnosis; plain-Hebrew client version |
| `design/probe/<n>.json`, `concepts/<lane>.json`, `lab/prior.md` | probe answers, lane concepts, ideas held before reading them |
| `design/film/`, `audit/`, `upgrade/` | films, reports; upgrade baseline, critics, zones, waves, `intended.json` |
| `DESIGN.md` (project root) | the handoff summary |

Templates: `assets/templates/` (AGENTS.md links to these files, never copies them).

## Ledger

Keep `design/LEDGER.md` current from the first step; while an item is open, keep working instead of ending the turn with next steps. Human gates (wave approval, production deploy, any intake, font, concept or direction question) are the exception: ask (question tool, or one numbered message), stop until answered, and record the gate as an open item owned by the user.

## Delegation

The only subagent roles (other files point here); build in the main thread.
- **Probes:** 1 to 3 reflex probes at low effort without skills or project instructions (`assets/agents/pb-reflex-probe.md`), plus one ambition probe given the user's ambition words verbatim (reflexes.md §7).
- **Concept lab:** 3 lane agents in one message, in the background, each with the verbatim lane prompt; meanwhile do concept-independent foundation work; at 12 minutes write any missing concept yourself (concept-lab.md §4).
- **Critic:** 1 fresh agent at high effort per milestone (critic.md).
- **Upgrade audit:** the four critics run as separate passes in the main thread; one auditor subagent per route group only past about 10 routes, then a merge.

Questions are asked only from the main thread (subagents have no question tool). Don't spawn agents to re-check small edits; without subagents, run each role as a separate pass starting from the files, not your draft.

## Tools

`<skill>` means `${CLAUDE_SKILL_DIR}` (if unexpanded: this SKILL.md's folder, absolute), and `<skills>` means the skills root, `<skill>/..`; reference files use both. Run every script from the project root (where puppeteer resolves) as `node <skill>/scripts/<name>.mjs`; each answers `--help` and writes readable reports.

```bash
node <skill>/scripts/serve.mjs dist --port 4173 --spa
node <skill>/scripts/scroll-film.mjs <url> --out design/film --video   # desktop and mobile
node <skill>/scripts/scroll-film.mjs <url> --at 1800,story:0.5   # only these states, while building
node <skill>/scripts/motion-audit.mjs <url> --out design/audit --budget-cls 0.05   # --runs --only --dead-vp --strict
node <skill>/scripts/gates.mjs <url> --out design/audit          # axe, anchors, overflow, no-JS census, forms
node <skill>/scripts/slop-scan.mjs src --out design/audit         # folder or file; --url <url> for a live site
node <skill>/scripts/preserve.mjs snapshot <urls|sitemap> --out design/upgrade/baseline/preservation.json
node <skill>/scripts/preserve.mjs diff <before> <after> --intended design/upgrade/intended.json --map <from>=<to>
node <skill>/scripts/font-fallback.mjs <font files> --family "Name"   # --axes/--stretch for variable faces
node <skill>/scripts/lint-ask.mjs payload.json                    # before every question call
node <skill>/scripts/selftest.mjs --browser                       # after editing this skill
```

motion-audit's built-in CLS limit (0.1) is a smoke floor: pass the brief's budget. It exits 1 when a non-timing check fails; `--strict` adds the timing checks. Budgets, reading the reports and the image budget: `references/verification.md`.

## Gotchas

- Headless Chrome defaults to `prefers-reduced-motion: reduce`, and puppeteer's default `captureBeyondViewport: true` resizes the viewport, which re-runs ScrollTrigger refresh and makes the page jump. The scripts handle both; any other capture must set motion on and `captureBeyondViewport: false`.
- Full-page screenshots never fire scroll triggers and downscale text until it is unreadable. Review viewport frames.
- Split text only after `document.fonts.ready` (lines measured with fallback fonts break when the real font arrives), and call `ScrollTrigger.refresh()` after fonts and late images load; on phones, only after the finger lifts (the address bar resizes the viewport mid-scroll).
- A `position: fixed` element inside a transformed ancestor stops being fixed; it breaks pins and overlays. `overflow-x: hidden` on any ancestor of a sticky stage silently disables sticky; use `overflow-x: clip`.
- Heroes and stages use `100svh` (stable while the phone's address bar moves), not `vh` or `dvh`.
- Derive scene state from scroll position on every update; never store a "current scene". Stored state desyncs on anchor jumps, scrollbar drags and back-forward restores.
- Never let CSS transitions and a JS library own the same property on the same element.
- Routine entrances (cards, paragraphs) fire about 600 px before the block enters the viewport, at ≤ 0.35 s and ≤ 18 px, so they are over before anyone sees them (the engine's `reveal()`). Motion meant to be watched is a scene's signature move or is scrubbed. Never put `content-visibility: auto` on a section with scroll scenes: its triggers measure zero.
- Ask for a one-line rationale per decision, never a written-out chain of reasoning.

## Other design skills

With impeccable, frontend-super, frontend-design or design-loop-router loaded, this skill's brief and concept decide direction and motion ("motion sparingly" suits product UI, not a scroll story). site-gate-audit explains the pre-ship gates, mobile-ux-fixer fixes device defects, client-content-editor handles client editing, impeccable audits focused UI.

**site-director** conducts MediaWave client sites and calls this skill for stages 2-5. Two of its artifacts replace files here, the third feeds BRIEF (see Files); Nati's rulings win: strict reduced motion on client sites, at most two font families picked from rendered specimens, the safe direction shown and rejected.

**rive-studio:** a Rive piece (a stateful drawn hero, the persistent object, a contact companion) is one of this skill's signature moves: this skill decides whether and where (a score row with its sentence, mobile and reduced versions), then rive-studio designs and builds it.

**mediawave-landing-page** owns proposal, content collection, Payload and admin, legal, deployment, handoff and monitoring; this skill owns concept, visual language, score and motion, replacing its inspiration and design-system phases. Its discovery output is round-0 evidence (ask only what it leaves open); stack: foundations.md §1's Payload row.

## References

Open each file at the step or condition that names it, and skip the other mode's files (greenfield never needs upgrade.md, `intake-upgrade.rtl.md`, `assets/engine/attribute-layer.js` or preserve.mjs). GUIDE.rtl.md is the human guide; don't load it.

| File | Read when |
|---|---|
| `references/intake.md` + the mode's bank (`intake-greenfield.rtl.md`, `intake-upgrade.rtl.md`) | starting either mode |
| `references/reflexes.md` | before the concept and after the first build |
| `references/concept-lab.md` | generating and choosing the concept |
| `references/scroll-score.md` | pacing, holds, handoffs (greenfield step 3) |
| `references/foundations.md` | greenfield step 4 |
| `references/upgrade.md` | upgrade mode |
| `references/direction-bank.md`, `idea-bank.md` | technique stage only, never as concept inputs |
| `references/moves.md`, `moves-recipes.md` | choosing and building moves |
| `references/motion-engine.md` | Lenis, GSAP, CSS scroll-driven, sticky stages, refresh, media |
| `references/visual-language.md` | turning the concept into tokens |
| `references/content-voice.md` | any visible text |
| `references/hebrew-rtl.md` | any Hebrew site |
| `references/critic.md` | each milestone |
| `references/verification.md` | running and reading the scripts |
| `references/resource-atlas.md` | choosing a library or icon set; inspiration only at the technique stage |
| `references/masterpiece-anatomy.md` | seeing the method at full scale |
| `assets/templates/*`, `assets/agents/pb-reflex-probe.md` | the design files; the probe agent (copy once to `~/.claude/agents/`) |
| `assets/engine/*`, `assets/demo/moves-gallery.html` | engine starting code, working recipes |

## Portability

Without a question tool, ask as one numbered message and wait (intake.md §8); "subagents" and "a browser tool" mean any equivalent. For tools without skill support (Lovable, v0, Bolt), `portable/BRIEF-PROMPT.md` condenses the method into a prompt to paste after the brief and concept are written.
