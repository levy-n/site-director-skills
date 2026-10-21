# Creative direction: stage 2, step by step

Read this at stage 2, which is mandatory on every site. It turns the client's world into a direction Nati can approve: the world dossier, a chosen direction with the safe one shown and rejected, fonts Nati picked, a hero idea, the decision log and the storyboard. Nothing is prototyped or built here.

`<skill>` is this skill's folder and `<skills>` is the skills root, as SKILL.md defines them. Every file below lives in the client project, under `design/` unless a path says otherwise.

## Contents
1. Inputs, outputs and the gate
2. Step 1: the world round
3. Step 2: the cliche exercise
4. Step 3: the world dossier
5. Step 4: the brief goes to pattern-breaker
6. Step 5: directions, with the safe card shown and rejected
7. Step 6: both swap tests
8. Step 7: font specimens
9. Step 8: the hero idea board
10. Step 9: design decisions and storyboard
11. Step 10: critic milestone 1
12. Step 11: check the artifacts
13. Step 12: the gate question
14. Copyable checklist

---

## 1. Inputs, outputs and the gate

| | Files |
|---|---|
| Inputs | `discovery-output.json` from stage 1 (its `world` block when mediawave-landing-page collected it); the client's answers to the five world questions; 10-20 workplace photos; `design/design-decisions.rtl.md` with D1 from stage 0; the three templates copied into `design/` at stage 0. Redesign mode adds pattern-breaker's `design/DIAGNOSIS.md`. |
| Outputs | `design/world/photos/`, `design/media-ledger.rtl.md` (every photo or video file meant for the site, the client's own included), `design/media/candidates/` (only when the client's own media is missing), `design/world-dossier.rtl.md`, `design/BRIEF.md` (or `BRIEF.rtl.md`), `design/probe/*.json`, `design/lab/prior.md`, `design/concepts/*.json`, `design/CONCEPT.md`, `design/specimens/type.html` and `type-board.png`, `design/ideas/hero-ideas.html`, `design/design-decisions.rtl.md`, `design/storyboard.rtl.md`, `design/LEDGER.md`, `design/ask/*.json` (every question payload, linted). |
| Gate | Nati approves the direction with one question (step 12). On mediawave.co.il Nati and Moriah approve, so every board is shareable: published as an artifact, or on a pushed branch. |

Inspiration sites (Dribbble, Awwwards, Pinterest, Behance, galleries) and pattern-breaker's `direction-bank.md` and `idea-bank.md` are banned for this whole stage. They return at the technique stage, after the gate. References come only from the client's world. Heron's team worked this way: their references were the architecture software their client's users work in, not an inspiration site.

## 2. Step 1: the world round

Input: discovery, the client, the photos. Output: answers and photos ready for the dossier.

1. Check which of the five world questions are already answered (the discovery `world` block, the questionnaire, the conversation):
   1. What is on your desk or workbench on a normal day?
   2. Which document or form do you hand the client?
   3. Which words does only your trade use?
   4. At which moment does the client understand they are in good hands?
   5. What does the client fear before contacting you?
2. Ask only the missing ones: through the question tool when Nati knows the answer, as a WhatsApp message when the client must answer. (SKILL.md also routes this step to `world-questions.rtl.md`, which holds ready Hebrew wording for both, the questionnaire version and the photo request.)
3. Photos: 10-20 from the workplace, taken by the client: tools, materials, documents and forms (private details covered), signage, uniforms, measuring instruments, markings, hands at work. Save the originals as `design/world/photos/NN-<what>.jpg`. They are evidence for the design, not site assets. A photo goes on the site only after the client approves that photo separately, and after who shot it, the consent and the licence are recorded in the dossier's "מקורות" table and as a `client-NN` row in `design/media-ledger.rtl.md` (template: `<skill>/assets/templates/media-ledger.template.rtl.md`).
4. Trade research on the web: supplier catalogues, standards bodies, the forms the trade fills in, its signage and instruments. For understanding shapes, units, numbering and words only; never take another brand's assets. Keep the URL of each finding for the dossier's source column.
5. Photos missing: send the request again and continue with the answers and the research. Every item that waits for a photo is marked `[לבירור]`. Never invent an object the client may not have.
6. If the client's own photos or video stay missing, follow SKILL.md stage 2 step 1: free, licence-checked, unique media of the client's world, each file logged in `design/media-ledger.rtl.md`, and one question to Nati before any download. (SKILL.md also routes this to `media-sourcing.md`; the steps that bind stage 2 are these.)
   1. Search once the dossier exists (step 3), one dossier item per run, with English terms: `node <skill>/scripts/find-media.mjs --q "<terms>" --item W03 --type image --out design/media/candidates`. Nothing downloads without `--download`.
   2. Pick from the contact sheet at most two or three candidates per item. Never a recognisable person, never another business's logo, product or signage, never the client's people, premises, products or results.
   3. Ask Nati once, one list: per file the id, the dossier item and the slot, the source page, the licence and whether it needs a credit, the size. Only after his yes: `node <skill>/scripts/find-media.mjs --download <approved ids>`, which adds the ledger rows.
   4. Found media is never presented as the client's own and is never a chapter's proof.

## 3. Step 2: the cliche exercise

Input: the client's own description of the business (discovery, old site, Instagram bio). Output: the "תרגיל הקלישאה" section of the dossier.

1. Write the brief's one-line description as the client says it.
2. Mark every cliche word in it. Common ones in Israeli small-business copy: איכותי, מקצועי, אמין, יוקרתי, מוביל, חדשני, בוטיק, שירות אישי, יחס אישי, ניסיון של X שנים, מחירים הוגנים, זמינות 24/7, הפתרון המושלם, ללא פשרות, ברמה הגבוהה ביותר, לקחת את העסק לשלב הבא, אנחנו כאן בשבילכם, בגובה העיניים, באהבה, חוויה, פתרונות, דיגיטלי, AI. Add the trade's own (a bakery's "ביתי" and "טרי", a tour's "חוויה בלתי נשכחת").
3. Delete them and write what the business actually does as a verb with an object and something visible: "מודד לחץ בצנרת ומוצא את הנזילה לפני שהיא הורסת קיר". Heron's team did this with the word "AI": they asked what a tool that helps architects catch and fix problems would look like with AI removed from the brief.
4. Name-pun check: list every motif the business name suggests (MediaWave suggests waves and sea). Those motifs are banned unless a dossier item from the work itself supports them independently. MediaWave's sea and wave rounds came from the name and were both rejected; the lesson is that a motif must come from the work, not the name.

## 4. Step 3: the world dossier

Input: steps 1-2. Output: `design/world-dossier.rtl.md` from the template.

1. Write 15-30 items, `W01` to `W30`. Each row: the item, its type, its source (a photo file name, an answer, a research URL), what it is in the client's world, how it becomes the site, and the axis.
   - Types: כלי, חומר, מסמך, טופס, שילוט, מדים, מכשיר מדידה, סימון, ז'רגון, רגע.
   - Axes: גריד, טיפוגרפיה, צבע, אינטראקציה, תנועה, תוכן, צורה.
2. "How it becomes the site" is concrete or the item does not count: "the order slip's three columns become chapter 2's grid", not "inspires the layout".
3. Coverage: at least three different axes; at least one "רגע" and at least one "מסמך" or "טופס". Include the trade's graphic and screen traditions (notation, forms, signage, labels), not only its physical objects. When more than half the items come from one material family (all paper, all metal), the search stopped at the most obvious artifact: dig until at least three families appear. (Adapted from impeccable's new-work flow, Apache-2.0.)
4. Unknown facts get `[לבירור]` and a question in "חסר ושאלות ללקוח". Name-pun motifs from step 2 are listed and excluded.
5. Fill "מועמדים לאובייקט הקבוע" with 2-3 items. A candidate stays on screen through the story and really passes through 3-5 states in the work, one per chapter.
6. Fill "מועמדים לאינטראקציית ההירו" with 2-3 items: something the visitor does with the item the way the professional does it (sweep, trace, measure, stamp, write), mapped close to 1:1.

## 5. Step 4: the brief goes to pattern-breaker

Input: the dossier. Output: `design/BRIEF.md` with its "World dossier (condensed)" section and its "Pinned by the brief" line filled, then pattern-breaker's probes and concept lab.

1. Run pattern-breaker's greenfield intake (`<skills>/pattern-breaker/references/intake.md` and `intake-greenfield.rtl.md`) only for what discovery left open. Skip its typography question (step 7 replaces it) and its infrastructure question (D1 decided the stack at stage 0).
2. Fill two places that pattern-breaker's BRIEF template (`<skills>/pattern-breaker/assets/templates/BRIEF.template.md`) already has, as text. Add no new section, so the pin lives in one place only.
   - The template's "## World dossier (condensed)" section, in its `- Wnn <item>: <how it becomes the site>` form. Type and axis may follow in brackets. The first bullet is what the business actually does; the last is the banned name puns:

```md
## World dossier (condensed)
- The business actually: <verb + object sentence from the cliche exercise>
- W03 <item>: <how it becomes the site> (<type>, <axis>)
- <8-12 item lines in all: the items with the strongest "how it becomes the site">
- Banned name puns: <motifs, or "none">
```

   - The template's "Pinned by the brief" line under "## Direction":

```md
- Pinned by the brief: persistent object W07 <item> (<s1> > <s2> > <s3>; literal because <one line>); hero interaction source W11 <what the professional does>, the visitor <does what>
```

3. Why it goes in as text: the lab's lane agents see only the brief and may not research (`<skills>/pattern-breaker/references/concept-lab.md` §4). Why the pin: the lab excludes "the page acts out the client's process" as a rut unless the brief pins it (concept-lab.md §6 check 1b); pinning is that rule's own escape hatch. The pin fixes the object and the source of the interaction, not their execution, which the hero idea board explores in step 8. A better source found later gets a new decision row.
4. Run pattern-breaker's probes (`reflexes.md` §7) and concept lab (concept-lab.md §4-§6) unchanged, with `direction-bank.md` and `idea-bank.md` kept out of the lane packet. Its checks 1a and 1e already cover the other-field swap and the dossier citation. Additionally, the concept's palette, type, grid and motif each trace to a W item.

## 6. Step 5: directions, with the safe card shown and rejected

Input: the lab's concepts. Output: Nati's pick, the "כיוונים" table in `design/design-decisions.rtl.md`.

1. Every concept passes the two swap tests of step 6 before it is shown. Two concepts that survive a font and colour swap into each other are one concept.
2. Write the safe card: the page every competitor in this trade would ship (concept-lab §6 check 1b, rut 1, informed by the reflex probe in `design/probe/`). Write it honestly in three or four lines (ground, type, hero, sections) and add its rejection reason: what it shows and what it fails to show. Heron's first direction was rejected this way: text and imagery, almost no interaction, product screenshots used as they were. The client liked it; the team held sign-off because it was too safe.
3. Present with pattern-breaker's concept question (concept-lab.md §7): one single-select question, the recommended concept first with "(מומלץ)", each option with an ASCII preview. The safe card is the last option, labelled "S · <name> (נפסל)", with its rejection reason first in its description and the same preview format. Only when four concepts already fill the four options does the safe card go in the message above the question instead, marked "בטוח, נפסל", with its reason. It is never recommended (impeccable's standing exit: always on offer, never recommended). Save the payload as `design/ask/concepts.json` and lint it: `node <skills>/pattern-breaker/scripts/lint-ask.mjs design/ask/concepts.json`. If Nati picks the safe card anyway, his ruling stands: log his reason as a decision row.
4. Fill "כיוונים" in the decision log: the safe card (בטוח? כן, נפסל, with the reason), the chosen direction (נבחר), the others (נפסל) with one-line reasons and their dossier items. At least two directions besides the safe card; exactly one chosen.
5. Redesign mode: the current site is evidence of what the business is, not authority over what it becomes. Show its look next to the safe card.
6. Show directions as live cards before the question: one page (`design/ideas/directions.html`, served by the project's dev server and opened in the side pane) where each card loops its signature moment in the candidate look, with its hero, peak, proof, swap results and risk beside it. A motion concept loses on a static board or an ASCII preview. Verified 2026-10-15 on MediaWave: Nati rejected three concepts presented as text, then picked from four live cards in one look.
7. Count each concept's overlap with `design/lab/prior.md` and say it in the message ("repeats 5 of 7 ideas held before the lab"). On MediaWave the chosen concept repeated all 7 prior lines; the critic caught it, and Nati rejected its ideas after seeing the prototype.

## 7. Step 6: both swap tests

Run both on every direction before step 5 presents it, then record the chosen direction's results under "מבחני החלפה" in the decision log.

1. **Other field** (pattern-breaker concept-lab §6 check 1a). Put a business from a different trade into the direction: its name, its words, its photos. If the grid, the accent's meaning, the persistent object and the hero interaction all still work, the direction comes from a style, not from this world: back to the dossier.
2. **Same field.** Put a competitor from the same city and trade into it (pattern-breaker concept-lab §6 check 1). What breaks has to be tied to the one true claim in the brief.
3. Record concretely what breaks: "a plumber has no order slip, so chapter 2's grid and the stamped state of the object mean nothing", never "it feels different".

The primary source for this test is Heron's own retrospective: they judged it a site where you could not swap the logo for another brand and notice nothing. Stage 5 runs the same two tests on screenshots of the built site.

## 8. Step 7: font specimens

Input: the chosen direction, the hero copy draft, the dossier. Output: `design/specimens/type-board.png`, then D3 and D4 after Nati picks.

1. Load nati-design-prefs (listed as `anthropic-skills:nati-design-prefs`). Its rules win: 3-4 options, each rendered on the real layout, one image labelled A/B/C/D, Nati picks, never on autopilot, never "propose and continue". Its base64 font embedding is for exported documents, not for the site.
2. Each option is a pair: a display face with presence (headlines, chapter verbs, type as image) and an instrument face (numbers, labels, indexes, units, and usually running text). Two families at most.
3. The candidate pool, one merged ban:
   - banned outright: the banned list in nati-design-prefs §1 (by reference, never copied);
   - shown only with a dossier reason written next to the option: the saturated typefaces in `<skills>/pattern-breaker/references/reflexes.md` §2 and the Hebrew reflex fonts in §5 and `<skills>/pattern-breaker/references/hebrew-rtl.md` §5. This covers the faces nati-design-prefs lists as having worked or as future candidates: they may appear, with a reason, and Nati still picks.
   - Prefer a commercial Hebrew foundry display face (hebrew-rtl.md §5).
4. Vet every candidate before rendering it: the licence covers web use for this client; all 27 Hebrew letterforms (22 letters and 5 final forms), geresh ׳ and gershayim ״; digits and Latin; the weights you will use (no faux bold); the WOFF2 size. A face that lacks ׳ ״ or has weak digits is still possible, with the other family supplying them.
5. Build `design/specimens/hero.html`: the real hero (H1, sub-line, CTA label) and one real chapter (heading, a paragraph, an instrument line with real numbers such as hours, prices or measurements, and the phone number in an LTR span), in the chosen direction's colours and grid. It reads `?pair=A` and switches both faces. Real Hebrew copy only, never dummy text; an unknown number is `[לבירור]`, not invented. Give the chapter `id="chapter"` and end the page with a spacer of one screen height so the anchor puts the chapter at the top. Fonts are self-hosted from `design/specimens/fonts/` (the foundry's woff2, or `@fontsource` files as nati-design-prefs §4 describes).
6. Build the board `design/specimens/type.html`: one labelled panel per option (a large letter, then the pair's names), each with four iframes: `hero.html?pair=A` and `hero.html?pair=A#chapter` at 1440x900, the same two at 390x844, all scaled with `transform: scale(.4)` and `transform-origin: 0 0` inside fixed frames with `overflow: hidden` (576x360 for desktop, 156x338 for the phone). The board page itself is `dir="ltr"`: it is chrome, and in RTL the scaled frames overflow out of the shot. Hebrew lives inside the frames. Label the recommended pair A.
7. Shoot it as ONE image with the bundled script: copy `<skill>/assets/specimens/shoot.mjs` to `design/specimens/shoot.mjs` and run `node design/specimens/shoot.mjs` from the project root (puppeteer resolvable from the project). It serves the folder over a local http port, sets the viewport to the board's full height and shoots with `captureBeyondViewport: false`.

Why not a plain `file://` page with `fullPage: true`: Chrome leaves `file://` iframes unpainted in a puppeteer screenshot, so every frame comes out blank (found on the first real run, 2026-10-15).

Verified 2026-10-15: two boards (MediaWave and a bakery brief), four pairs each, hero and chapter at 1440 and 390, one 3200 x 3996 image per run.

8. Look at the image yourself first: missing glyphs (boxes or fallback letters), a wrapped LTR run, a clipped line. Fix and reshoot. Then show it to Nati and ask in step 8's call.

## 9. Step 8: the hero idea board

Input: the dossier, the pin, the chosen direction. Output: `design/ideas/hero-ideas.html`, Nati's pick, then D7 and the storyboard's hero row.

1. Before any prototype, write 8-10 cheap ideas on one self-contained HTML page (inline SVG sketches or a static mock per idea; no Rive, no GSAP, no build step), so it can be published or sent as is.
2. Each idea card holds:
   - what the visitor sees in the first viewport;
   - which dossier item it comes from (W..);
   - what the visitor does, with its keyboard and touch versions;
   - how it is built (DOM/SVG, canvas, Rive, video, CSS);
   - the last frame under reduced motion;
   - the risk: performance, accessibility, content it needs, cost, honesty.
3. Spread: the ideas use at least four different dossier items and at least three build techniques; at least three use the pinned interaction source.
4. Logic before wow, per idea, in one sentence: what the metaphor means literally for this client. It must make literal sense. No recursive imagery (a site inside the site, a laptop playing the site's own film, a screen showing the page) and no name puns. An idea that fails is dropped from the board with its reason in one line.
5. Why the board: MediaWave's hero went through four concepts in about one day: three were built in Rive and rejected (the first as recursive) before a 10-idea board picked the fourth, the lens. A board costs minutes; a rejected prototype costs a day.
6. Rank by fit to the one true claim, dossier strength, cost and risk. Recommend one.
7. Send the type board image and the hero board (a published artifact or the file) in the message before the call. Then ask Nati in one call with two questions (header "פונטים": A/B/C/D, recommended first; header "הירו": the top 3-4 ideas, recommended first, any other board idea by number through Other). Save the payload as `design/ask/fonts-hero.json` and lint it: `node <skills>/pattern-breaker/scripts/lint-ask.mjs design/ask/fonts-hero.json`. Only the chosen idea gets a prototype, at stage 3.

## 10. Step 9: design decisions and storyboard

Input: everything above. Output: the two artifacts from the templates.

1. `design/design-decisions.rtl.md`: the "כיוונים" table (step 5), "מבחני החלפה" (step 6), and the decision rows. At stage 2 the minimum is:
   - D1 stack and CMS (from stage 0);
   - D2 the accent: hex, its meaning in the client's world, and the only places it appears;
   - D3 display face and D4 instrument face, approved by נתי;
   - D5 the grid and the document or tool it comes from;
   - D6 the persistent object and its states;
   - D7 the hero interaction;
   - D8 the standout-moment budget, n/3, listing each moment. The hero interaction, scroll transitions, page transitions, a logo ident and a contact companion each count; a custom cursor needs a dossier item and counts too.
   Every token in CONCEPT.md's visual system that is not covered gets its own row.
2. Rules for every row: a decision without a reason is deleted; a design decision without a dossier item goes back to the dossier; "אין" in the dossier column only on the technical axis; append only (a changed decision gets a new row "מחליפה את D<n>"); every standout moment beyond 3 gets its own row, labelled "רגע נוסף", with a reason. If the project already has a root `DECISIONS.md` or `DECISIONS.rtl.md`, that file is the single log and takes the same columns.
3. A reason passes pattern-breaker's translation test (concept-lab.md §6 check 1c): "behaves like <W item> because <mechanism>, so <rule>". "Premium", "bold" or "modern" is not a reason.
4. `design/storyboard.rtl.md`: 3-5 chapters named by verbs in the order things happen for the client, each with an English slug id (`measure`, `bake`, `deliver`), plus the `hero` row, which does not count as a chapter. Per chapter: what the client feels, the object's state, one motion moment, the text (one idea), one proof, the focal point, the dossier items. Proof is real, labelled "הדגמה", or `[לבירור]`; never invented.
5. The beats table carries every SCROLL-SCORE column, so the storyboard replaces pattern-breaker's `SCROLL-SCORE.md`. Its budgets and pacing rules are pattern-breaker's: `<skills>/pattern-breaker/references/scroll-score.md` §2-§3 (holds at most floor(length/5), never touching, a new move every 1.5-3 vp, no dead zone of 3 vp, first peak within 2 vp). Fill the totals, the signature moments (their count matches D8), the seams, the small-transition polish table and the engine notes.
6. CONCEPT.md (concept-lab.md §9) stays the concept contract. Where it and the decision log disagree, the log wins and CONCEPT.md gets an amendment line.

## 11. Step 10: critic milestone 1

Input: the plan files. Output: findings in `design/LEDGER.md`.

1. Run pattern-breaker's milestone-1 critic (`<skills>/pattern-breaker/references/critic.md` §1-§3): one fresh-context agent at high effort that receives files, not the conversation. Inputs: BRIEF, CONCEPT, `design/storyboard.rtl.md` in place of SCROLL-SCORE.md, the probes, `design/lab/prior.md`, reflexes.md, plus `design/world-dossier.rtl.md` and `design/design-decisions.rtl.md`.
2. Use critic.md's plan prompt (§3) and append, in this order, one list:
   - critic.md §3 "Under site-director" questions S1 and S4 only, answered from the files. S2, S3 and S5 are already asked by questions 9 and 11 below, and critic.md's rule is to ask nothing twice; S6-S8 start at milestone 2;
   - the milestone-1 questions below. They are the same text as `qa.md` §2's milestone-1 block, repeated word for word so this step stands alone; keep the two identical:

   > 8. For the grid, the accent, the two typefaces, the persistent object and the hero interaction: which dossier item (W id) does each come from? Name any decision whose W id does not explain it.
   > 9. Swap the client for a business from another trade, then for a same-field competitor. What breaks in the plan? Quote the swap-test lines and say whether they are honest.
   > 10. Was the safe direction shown and rejected for a reason a client would understand, or only for taste?
   > 11. Are the chapters verbs in the order things happen for the client? Does the persistent object change state in a way that means something at each step? Is every proof real, marked "הדגמה", or marked [לבירור]?
   > 12. Does the hero interaction come from the work itself, and does its metaphor make literal sense (logic before wow, nothing recursive)?
   > 13. Count the standout moments against the budget in the decision log. A logo ident, a contact companion, page transitions and a cursor all count.

   - one more, which qa.md asks only of the built site, asked here of the plan:

   > 13a. Does the hero and every chapter in the storyboard name exactly one focal point? Does the plan contain a banned default: the centred-hero template (two buttons, a logo strip, three cards), a three-feature-card grid, cards inside cards, a tired font without a reason, low contrast?
3. Log every finding in the LEDGER critic table, fix the high-severity ones, and do not re-review your own edits (pattern-breaker's rule: one perceptual review per milestone).

## 12. Step 11: check the artifacts

```bash
node <skill>/scripts/check-artifacts.mjs design            # add --decisions DECISIONS.rtl.md for a root log
node <skill>/scripts/lint-dashes.mjs design
```

Fix and rerun until both pass. Do not ask the gate question before they do.

## 13. Step 12: the gate question

1. In the message, before the call: the chosen direction in two lines, the safe card and why it lost, the fonts Nati picked, the hero idea, the chapter verbs, the standout moments, both swap results, and links to the boards.
2. One AskUserQuestion call with one question, the recommended option first. Save it as `design/ask/stage2-gate.json` and lint it with `node <skills>/pattern-breaker/scripts/lint-ask.mjs design/ask/stage2-gate.json`. Previews: ASCII only, at most 40 columns and 18 lines, no Hebrew inside. The linter's warning that only one option has a preview is expected.

```json
{
  "questions": [{
    "header": "שער כיוון",
    "question": "הכיוון, הפונטים, ההירו והסטוריבורד מוכנים. מאשרים לעבור לאב-טיפוס התנועה?",
    "multiSelect": false,
    "options": [
      { "label": "מאשר, לאב-טיפוס (מומלץ)",
        "description": "בונים רק את ההירו ופרק אחד, בדסקטופ ובמובייל יחד, ומראים לפני כל דבר אחר.",
        "preview": "STAGE 2  <client-slug>  v1\n------------------------------\nDIR    B <name>  (safe S out)\nACCENT <#hex> = <meaning>\nTYPE   <display> / <instrument>\nGRID   W05 <source>\nOBJECT W07 <s1> > <s2> > <s3>\nHERO   idea <n> (W11)\nCHAPS  <verb> > <verb> > <verb>\nBUDGET <n>/3 <moments>\nSWAP   other: breaks  same: breaks\nCRITIC <n> high open" },
      { "label": "לשנות את ההירו",
        "description": "חוזרים ללוח רעיונות ההירו ובוחרים רעיון אחר. הכיוון והפונטים נשארים." },
      { "label": "לשמור מראה, לשנות רעיון",
        "description": "הצבעים, הפונטים והגריד ננעלים; ההירו, האובייקט והרגעים חוזרים לשלב הכיוונים." },
      { "label": "לשנות כיוון",
        "description": "חוזרים לכיוונים. תיק העולם נשאר, וההחלטות והסטוריבורד נכתבים מחדש." }
    ]
  }]
}
```

The look (palette, type, grid) and the idea (hero, persistent object, moments) are separate decisions: on MediaWave Nati locked the first and rejected the second in one sentence. When nothing has been rendered in the chosen look yet, the third option is instead "חסר בתיק העולם" ("חוזרים לסבב העולם עם מה שחסר. שום החלטה לא ננעלת עד אז.").

3. Before the call, add the gate to LEDGER's "Open" list as an item owned by Nati (Nati and Moriah on mediawave.co.il). On approval: close that open item in LEDGER (move it to "Done" with the date and who approved) and go to stage 3. On a change: return to the named step; nothing else is asked again.

## 14. Copyable checklist

```
Stage 2: creative direction
- [ ] 1  World round: five questions answered, 10-20 photos in design/world/photos/, trade research with URLs;
         media ledger filled; Nati approved any download of found media
- [ ] 2  Cliche exercise: words struck, verb + object sentence, name puns listed and banned
- [ ] 3  Dossier: 15-30 items, 3+ axes, a moment and a document/form, 3+ material families, [לבירור] for unknowns
- [ ] 4  BRIEF: template's "World dossier (condensed)" section and "Pinned by the brief" line filled; banks kept out of the lab; probes + lab run
- [ ] 5  Directions: safe card as the last option "S · <name> (נפסל)" (in the message only when 4 concepts fill the options), never recommended; concepts.json linted; Nati picked; "כיוונים" filled
- [ ] 6  Swap tests: other field and same field, what breaks written down
- [ ] 7  Fonts: 3-4 vetted pairs, one A/B/C/D image at 1440 and 390, hero + chapter, real copy
- [ ] 8  Hero board: 8-10 ideas, logic before wow, Nati picked fonts and hero (fonts-hero.json linted)
- [ ] 9  design-decisions (D1-D8, reasons, W items) and storyboard (verbs, object states, proof, focal points, beats)
- [ ] 10 Critic milestone 1 with S1 and S4, questions 8-13 and 13a; findings in LEDGER
- [ ] 11 check-artifacts.mjs and lint-dashes.mjs pass
- [ ] 12 Gate: stage2-gate.json linted, one question, Nati approved (Moriah too on mediawave.co.il);
         LEDGER open item added before the call, moved to Done with date and approver after it
```
