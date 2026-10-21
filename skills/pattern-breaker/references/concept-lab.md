# Concept lab: three divergent concepts, one choice

Read this after the brief exists (intake done) and the probes have run (reflexes.md §7). The output is one chosen concept, written to `design/CONCEPT.md` from `assets/templates/CONCEPT.template.md`. Everything later (tokens, scroll score, moves, copy) answers to it. In upgrade mode the same lab, fed the upgrade packet (§2), produces the two or three directions of upgrade.md §8. Under site-director the lab also reads its world dossier (through BRIEF, §2), runs two extra checks (§6 checks 1a and 1e) and shows the safe direction (§7).

Why a lab and not one idea: a single pass converges on the model's median for the category. Sampling settings can't fix that anymore (temperature is not available on current Claude models), so variety has to come from process. Anthropic's recommended mechanism is the same one used here: propose distinct directions and let the person choose.

## Contents
1. What a concept is (and is not)
2. Inputs
3. The three forcing constraints
4. Running the lab
5. The concept JSON
6. Checks every concept must pass
7. Presenting the choice
8. Autopilot selection
9. Writing CONCEPT.md

---

## 1. What a concept is

A concept is a single idea specific to this client that decides the visual language and the scroll story together. It is not a style ("minimal", "bold", "editorial") and not a palette.

| Not a concept | A concept |
|---|---|
| "Modern and warm" | "The worn stamp: the circle a family locksmith has pressed on every receipt since 1971 becomes the page's grid, its section markers and its success message" (a locksmith whose regulars recognise the stamp) |
| "Dark luxury" | "The tape rewinds: a VHS cassette rolls back through decades and comes out as the client's family film" (a tape-conversion service) |
| "Clean professional" | "Road-sign grammar: the page speaks the sign chart every Israeli learner memorises, where shape means rule and colour means urgency, and each lesson type gets its own sign" (a driving school whose students mostly pass the first test) |

These examples show three different *shapes* of concept: an object the client owns, a change the scroll drives, a vernacular borrowed from the visitor's own life. They are not menu items. Never reuse them. The page acting out the client's process from start to finish (it fires, roasts or bakes as you scroll) is one shape among several, and it is the one a strong model reaches for first when asked to be distinctive (§6 check 1b). That shape, and a persistent object from the client's world that stays on screen and changes state along the scroll, are allowed when BRIEF's "Pinned by the brief" line pins them and they pass the logic-before-wow test (§6 check 1b).

A good concept implies, almost by itself: a colour world (the stamp: carbon-blue ink, brass, cut-key steel), a type character, a motif (the stamp's worn circle), a page-wide change of state, and two or three signature moments that only make sense for this client.

## 2. Inputs

- `design/BRIEF.md` from the intake (goal, audience, the one true unique claim, real materials, intensity, constraints), including its "World dossier (condensed)" section and its "Pinned by the brief" line when they are filled.
- `design/world-dossier.rtl.md` when site-director wrote it. The main thread reads it in full for the checks in §6; the lanes see it only as BRIEF's condensed section (they may not research, §4), so that section must carry the items a concept can be built from.
- The probe answers in `design/probe/` (reflexes.md §7): the reflex probes and the ambition probe.
- The last 10 lines of `memory/portfolio-log.md` (don't repeat yourself across clients).
- Evidence gathered during intake: the client's Instagram, Google Business reviews, old site, photos, and the trade's own objects and documents. Reviews are gold: the phrases customers repeat are where the unique claim lives.
- **Upgrade mode:** the brief is compiled only after the directions, so instead of BRIEF.md use the upgrade packet, taken from DIAGNOSIS.md and intake round 1: the verified facts, the sacred list (anchors in order, H1/H2 order, service names, form fields, brand marks), the keep list, the ban list, and the top three genericness findings with one line of evidence each.

**Not inputs:** `direction-bank.md` and `idea-bank.md` (both built from award-site scans), and every inspiration site or gallery (Awwwards, Dribbble, Pinterest, resource-atlas.md §4). They belong to the **technique stage**: after CONCEPT.md is written, when the score and the build look for mechanisms to perform the chosen concept's moments. Even then they are harvested as principles through resource-atlas.md §7, never copied as worlds or surfaces. A concept that starts from another site starts from someone else's client.

## 3. The three forcing constraints

Each concept is generated under a different constraint so the three land in different places:

| Lane | Constraint | Typical result |
|---|---|---|
| **A. Material** | Derive everything from the subject's physical world: its materials, tools, processes, rituals, units, smells, sounds, and the words insiders use; with a world dossier, from its items. The palette comes from photographs of real materials, the motion from how the material behaves (clay is thrown and spins; dough rises and proofs; ink bleeds; paper folds). | grounded, tactile, hard to copy |
| **B. Tradition** | Borrow from one named design tradition far from the category: e.g. Swiss railway signage for a bakery, 1960s Israeli political posters for a law firm, Japanese matchbox labels for a garage, Bauhaus timetables for a clinic. Name the tradition and exactly what is borrowed (grid, type behaviour, colour logic), and translate it to this subject. | unexpected but disciplined |
| **C. Transformation** | Start from the scroll story: what changes between the first viewport and the last, for the visitor? A state change the visitor drives (noise → order, closed → open, a stranger → a regular, a cassette → a film). Design the system so that transformation can happen. The client's own production process played end to end is the obvious version (§6 check 1b); use it only when the brief pins it and it passes logic before wow. | narrative-first, strong scroll |

Optional lane **D. The client's own artifact**, when real assets are strong: build the visual language from one thing the client owns: the geometry of their logo, their storefront sign, the founder's handwriting, the silhouette of their product. liavmatzri.co.il did this with six brand shapes that do six jobs.

## 4. Running the lab

**With subagents:** launch three lane agents *in one message*, in the background. Each gets one compact packet **as text in its prompt**, no file paths: the brief verbatim, including its "World dossier (condensed)" section and its "Pinned by the brief" line (or the upgrade packet, §2), the probe answers, reflexes.md §1-§3, the portfolio-log lines, its lane's row from §3 and the JSON shape from §5. Not the §6 checks: they run once, in the main thread. Use this prompt verbatim, filling the brackets:

> You are lane [A/B/C/D] of a concept lab. Your constraint: [the lane's row from §3]. Below are the brief (with its condensed world dossier and what it pins, when present), the probe answers, the reflex catalogue, recent portfolio lines and the JSON shape.
> Write exactly one concept to `[project]/design/concepts/[lane].json` in your first reply after reading this, then stop. One line of rationale per field, no more. When the brief lists world-dossier items, build from them and cite at least three W IDs in `dossier`. Do not run checks, compare drafts or iterate: put any weakness you see into `risks`. No web research, no shell, download or font tooling, and no skill files. If you need a fact checked, list it under `facts_to_verify`; the main thread checks it.
> [packet]

Why the template is this strict, measured in three evals: in one, the lanes read their 8 or 9 files and then all three spent one thinking turn of about 26 minutes running a private check loop until each hit the 128K output cap; in the other two, lanes made 13 to 32 tool calls, web research included. None of the nine lanes wrote a concept. Writing the three concepts as sequential passes in the main thread took about 12 minutes.

**While the lanes run,** do concept-independent foundation work (foundations.md §6: environment, scaffold, content and SEO skeleton, the engine's test stage; not tokens, fonts or chrome), and don't sketch concepts, moves or scroll stories. Note the launch time in the ledger; completion notifications arrive on their own, so don't poll. Before reading any lane result, or before running the lab in-thread, write every idea you already hold, one line each, to `design/lab/prior.md`; a winner that matches it counts as a reflex hit (§6 check 2). If the three files are not there 12 minutes after launch, stop the remaining lanes if the tool allows, ignore late results, and write the missing concepts yourself by the path below, each started from BRIEF.md (or the upgrade packet).

**Without subagents:** write the three concepts one after another, starting each from the brief file (or the upgrade packet) rather than from your previous concept, and finish all three before judging any.

Delegation roles are listed once, in SKILL.md. The question tool is not available inside subagents: lane agents return data, and the main thread asks the user.

## 5. The concept JSON

```json
{
  "name": "2-4 words",
  "lane": "material | tradition | transformation | artifact",
  "idea": "one sentence a client would repeat to a friend",
  "subject_world": ["materials", "tools", "rituals", "insider words"],
  "dossier": ["W03: what it decides in this concept (grid, type, colour, interaction, motion, content, shape)"],
  "pinned": "how the concept carries what the brief pins (persistent object, process story), or null",
  "tradition": "named tradition and what is borrowed, or null",
  "transformation": "what changes from first viewport to last",
  "palette": [{ "name": "ember", "hex": "#…", "role": "accent: what it means in the client's world; max 5% of area" }],
  "type": { "display": "", "text": "", "hebrew_support": "native | needs pairing", "why": "" },
  "hero_ascii": "10 lines max, 40 cols max",
  "motif": { "what": "", "jobs": ["preloader", "section marker", "…"] },
  "signature_moments": [
    { "where": "section", "sentence": "the content line it performs", "move": "what the visitor sees", "why_only_here": "" }
  ],
  "motion_grammar": { "verbs": ["three verbs, e.g. rise, kindle, settle"], "easing_character": "", "scroll_model": "lenis + sticky stages | native + CSS scroll-driven | …", "intensity": "quiet | alive | orchestrated | cinematic" },
  "scroll_outline": ["act 1: …", "act 2: …", "act 3: …"],
  "reflex_hits": [{ "item": "reflexes.md item", "reason": "brief-specific reason, or 'remove'" }],
  "assets_needed": ["what must be photographed, filmed or generated"],
  "risks": ["what could go wrong: performance, content, legibility"],
  "facts_to_verify": ["a fact the concept relies on that nobody has checked yet"]
}
```

`dossier` stays an empty list and `pinned` null when the brief has no world dossier or pins nothing. The type pair in the JSON is the concept's suggestion only: the user picks the fonts from rendered specimens (intake.md §3).

## 6. Checks every concept must pass

Run these in the main thread before presenting anything.

1. **Competitor swap.** Replace the client's name with a competitor in the same city and category. If the concept still fits without changing a word, it is about the category, not the client. Push it toward the brief's unique claim.
1a. **Other-field swap.** Replace the client with a business from another field (a dentist for a bakery, a law office for a garage) and keep everything else. If nothing breaks (the grid, the accent's meaning, the hero interaction, the persistent object, the copy), the concept is design without a client: go back to the dossier or the brief's material. Run both swaps; neither replaces the other.
1b. **Three ruts.** Before judging, write down three pages: the one this category always ships; its predictable opposite (the "edgy" version everyone reaches for when told to avoid the first); and the obvious metaphor a strong model picks when asked to be distinctive, taken from the ambition probe's concept and signature moment (an accountant becomes a ledger or binder, a roastery a page that roasts as you scroll). All three are excluded unless the brief pins one. A pinned idea (a persistent object that changes state, a process played as the scroll) stays only when it passes **logic before wow**: the metaphor makes literal sense in the trade (the object exists in the client's work and really changes that way, in that order), nothing is recursive (a site shown inside a site, a laptop playing this page), and a visitor gets it from the image before reading the copy.
1c. **Translation test.** Every formal decision can be stated as "this behaves like [evidence from the subject] because [mechanism], so the design uses [formal rule]". "It looks premium", "bold" or "unlike AI" is not a reason. Borrow mechanisms, never appearances (this applies to the reference site too).
1d. **Type-only and skeleton tests.** The direction must already be distinctive with type, flat colour and space alone, before any motion; and it must stay recognisable without its most conspicuous effect. Strip the copy from the hero sketch: if it only works once the words return, the boldness is in the text size, not the design. Two concepts that survive a font and colour swap into each other are one concept.
1e. **Dossier citation** (when a world dossier exists). Every concept cites at least three dossier items in `dossier`, each with what it decides. Fewer means the concept was not built from the client's world: rewrite it from the dossier or drop it. A motif that is a pun on the business's name fails here even with citations (the dossier's own rule).
2. **Probe diff.** Compare with every answer in `design/probe/` and with `design/lab/prior.md`. Each shared value (colour family, display face, hero structure, motion effect, and from the ambition probe the concept, subject world, motif or signature moment) is a reflex hit and needs a written reason in `reflex_hits`, or it changes.
3. **Portfolio diff.** No palette family, display face or signature device from the last 10 projects, unless the user asked for continuity.
4. **Signature truth.** Each signature moment names the content sentence it performs. "A pinned horizontal gallery" is a mechanism; "the shelf of 40 students' first bowls, each with its maker's name, scrolled like walking along the shelf" is a moment.
5. **Boldness budget.** The concept names the one place where the risk goes (a scene, a type treatment, a material) and keeps the rest quiet. Three loud ideas cancel each other.
6. **Reality.** The assets it needs exist or can be produced in this project. A concept built on video the client can't shoot is a rendering, not a plan. Name each signature move's per-frame cost class: compositor (transform, opacity), paint (colour, clip, filter) or layout (anything that re-flows text, such as scrubbing a variable font's width or weight axis). A layout-class signature needs its touch version written into the concept (a compositor scale or a few stepped instances), because on phones it is the first thing a performance bisect points at. Check every entry in `facts_to_verify` before presenting the concept.
7. **Accessibility and RTL.** Contrast is achievable with the palette; the type has real Hebrew (or a deliberate pairing); the transformation reads as a static story under reduced motion.

## 7. Presenting the choice

Present the three concepts with the structured question tool when you have it (intake.md describes the limits): one single-select question, three options, the recommended one first and marked "(מומלץ)" / "(Recommended)". Each option's preview holds, in plain monospace: the palette hexes with names, the type pair, a hero wireframe of at most 10 lines and 40 columns, and one line naming the signature moment. Keep Hebrew out of the preview box (bidi breaks alignment in terminals); put it in the label and description.

**The safe card.** Show one more direction, marked safe and never recommended: the category-default rut from check 1b, or the reflex probe's answer when it is more telling. It shows what any competitor would get, with one line saying why it is rejected (what it shows about this client and what it hides). In the question it is the last option, labelled "S · <name> (נפסל)" (the name at most three words, so the label stays within five: lint-ask counts the S and the dot, not the parentheses) with the rejection reason first in its description and the same preview format; when four concepts already fill the four options, show it in the message only. Picking it anyway is the user's call: record it as a decision with the user's reason. Under site-director the decision log's directions table lists it as safe, rejected, with that reason.

Add one more line to your message, outside the question: the probe diff count for each concept ("reflex hits: A 1, B 0, C 2"). If the user picks "Other" with notes, merge the notes into the closest concept, don't start over.

Without the tool: send the same concepts and the safe card as one numbered message and wait. Never answer for the user, and never proceed on an invented answer.

## 8. Autopilot selection

When nobody can answer (an unattended run, an eval harness, or the user said "you decide"), pick by these criteria in order, and record the reasoning in one line per criterion in the ledger:

1. Fit to the brief's goal and audience.
2. Distinctiveness: fewest unjustified reflex hits (reflex probes, ambition probe, `prior.md`), outside the three ruts, no portfolio repeats, passes the competitor swap (and, with a world dossier, the other-field swap and the dossier citation).
3. Feasibility with the real assets and the intensity chosen.
4. Strength of the signature moments.

Autopilot never picks the safe card, and never picks the fonts (intake.md §7).

## 9. Writing CONCEPT.md

Fill `assets/templates/CONCEPT.template.md`: the chosen JSON in prose and tables, the dossier items it cites, the reasons it beat the other two (one line each) and the safe card with its rejection reason, the rejected concepts' best ideas worth stealing later, and the reflex-hit table with reasons. Under site-director, also write every direction, the safe one included, into the decision log's directions table. CONCEPT.md is the contract: the scroll score, tokens and copy cite it. When something in the build fights the concept, change the build or explicitly amend the concept with the user's agreement.
