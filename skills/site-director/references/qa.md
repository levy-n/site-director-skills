# QA: the merged checklist

Read this at stage 5, and at stage 2 for the critic's extra questions (§2). It is the one QA list for a client site: this skill's scripts, pattern-breaker's measurements, site-gate-audit's ten gates, MediaWave's overlap gate, rive-studio's audit and one fresh critic, in the order that wastes the least work. `<skill>` is this skill's folder and `<skills>` the skills root, as SKILL.md defines them. Run every command from the project root.

## Contents
1. The merged checklist, in order
2. Critic prompt additions
3. Extreme-content matrix
4. Screenshot matrix
5. Polish pass order
6. Accessibility mapping
7. Known false positives

---

## 1. The merged checklist, in order

Set up once per shell (Git Bash on Windows). C: runs out of space during captures, and Git Bash rewrites any argument that starts with "/" into a Windows path unless path conversion is off. With conversion off, write script paths Windows style (`C:/...`), never `/c/...`:

```bash
mkdir -p G:/tmp/temp && export TEMP=G:/tmp/temp TMP=G:/tmp/temp MSYS_NO_PATHCONV=1
URL=http://localhost:4173    # no trailing slash; routes are written $URL/ and $URL/about/
```

Build and serve. The server must stay up for every later step, so run it in a second terminal (in Claude Code, as a background Bash task):

| Stack | Build | Serve | Rendered HTML for steps 1, 2 and 6 (`<built>`) |
|---|---|---|---|
| Astro, React + Vite | `npm run build` | `node <skills>/pattern-breaker/scripts/serve.mjs dist --port 4173` (`--spa` for a client-side router) | `dist` |
| Next.js + Payload | `npx next build` | `npx next start -p 4173`, with the preview database's `DATABASE_URI` and `PAYLOAD_SECRET`, never production's | `design/audit/html`, captured below |

A Next build has no `dist/` folder: its pages exist only as the server renders them. Capture each route once per QA round, after the server is up and after any content change, one file per route:

```bash
mkdir -p design/audit/html
curl -sL $URL/ > design/audit/html/index.html
curl -sL $URL/about/ > design/audit/html/about.html    # one line per route
```

`$URL` is the local server while iterating. Final numbers for G2-G4 come from a preview deployment (localhost has no CDN compression and no real TTFB): set `URL` to the preview address for steps 9 and 10. Every step names its pass condition; a step without one is not done.

- [ ] **1. Artifacts and linkage.** `node <skill>/scripts/check-artifacts.mjs design --html <built>` exits 0 (`--html dist`, or `--html design/audit/html` on Next). A project whose root `DECISIONS.rtl.md` is the log adds `--decisions DECISIONS.rtl.md`. Each `[לבירור]` is a warning: answer it, or carry it into the handoff as an open item. The script reads the tables by their Hebrew headers, so renamed columns read as missing tables.
- [ ] **2. Dash rule.** `node <skill>/scripts/lint-dashes.mjs design/*.md src <built>` exits 0 (use `app` in place of `src` in a Next project without a `src` folder; list only paths that exist, because a missing path is a usage error). It covers visible copy, meta, JSON-LD and alt text through the rendered HTML, and the design docs, not the tool reports under `design/`. `--fix` rewrites; then review the diff, because a dash used as a pause often reads better as ":" or as two sentences. A dash that opens a line is left for a hand edit (as "- " it would become a list bullet).
- [ ] **3. Screenshot matrix and accent audit** (§4). `node <skill>/scripts/shots.mjs $URL/ --out design/shots --paths /,/about/ --accent "#hex" --session key=value` exits 0. Without `--paths` it shoots the URL it is given, path included. Open `design/shots/index.html` and read the frames; the exit code only proves they exist. In `accent.json` every hit must carry the meaning written in the accent decision (D2 in the template); any other hit is accent leakage to remove.
- [ ] **4. Scroll film.** `node <skills>/pattern-breaker/scripts/scroll-film.mjs $URL/ --out design/film --viewports desktop,short,mobile --video`. Compare beat by beat with the storyboard's beats table and its seams table; read the 1440x700 strip for anything sized for 900 only.
- [ ] **5. Motion audit.** `node <skills>/pattern-breaker/scripts/motion-audit.mjs $URL/ --out design/audit --viewports desktop,short,mobile --budget-cls 0.05` exits 0. Before handoff add `--runs 3` and judge timing on the median. The reduced-motion checks must pass as they are: client sites use the strict policy, so there is no CALM exception to explain away.
- [ ] **6. Banned defaults.** `node <skills>/pattern-breaker/scripts/slop-scan.mjs --url $URL/ --out design/audit`, always on the built site, never on `src`. Target: index 20 or less, or every remaining finding answered. A first-order finding is waived in place with `slop-ok: <rule-id> <why>`; a second-order signal yields only to a logged decision: `slop-ok:<rule-id> decision:D<n> <why>` in code or `data-slop-ok="<rule-id> decision:D<n> <why>"` in markup, and D<n> must exist in the decision log with its reason. Waived signals stay listed under "waived by decision". Second opinion: `node <skills>/impeccable/scripts/detect.mjs --json <built>` (impeccable 3.9.1). Then by eye, from the shots: the template (two buttons + a logo strip + three cards), feature grids instead of proof inside a chapter, a card inside a card, and more than one focal point in a section. A centred hero with one button and a secondary link is allowed.
- [ ] **7. Swap test on the built site.** Repeat both swap tests from the decision log against the screenshots: a business from another trade, then a same-field competitor. Name what breaks. If nothing breaks, the fix goes back to the dossier, not to the CSS.
- [ ] **8. Extreme content** (§3). Every client-editable field at its extremes, screenshotted with `shots.mjs` on the affected route.
- [ ] **9. Automated gates.** `node <skills>/pattern-breaker/scripts/gates.mjs $URL/,$URL/about/ --out design/gates --lh-motion both --budget-cls 0.05` exits 0. `--lh-motion both` runs Lighthouse with motion forced on and forced off (gates.mjs pins each mode with a Chrome switch and first checks that the switch is honoured); the motion-on run is the proof that the site is fast with its animations on. Targets: Lighthouse mobile performance 95, LCP 2.0 s or less, TBT 200 ms or less (site-gate-audit's table asks for 150; treat 150 as the goal and 200 as the fail line), CLS 0.05 or less. Lighthouse needs a `lighthouse` binary; Lighthouse 13 needs Node 22.19 or newer.
- [ ] **10. site-gate-audit's ten gates**, on the preview deployment. Invoke `site-gate-audit` for the reasoning; the table says what already ran:

  | Gate | What | Covered by |
  |---|---|---|
  | G1 | content without JS: H1, body, FAQ answers, contact, JSON-LD in raw HTML | gates.mjs `nojs` (90 % of words or more) + `curl` per route |
  | G2 | AI crawlers can read (real crawler user agents + robots.txt) | `curl` on the custom domain; on Cloudflare, the zone's AI crawl setting can block them at the edge |
  | G3 | Lighthouse mobile 95/100/95/100 | gates.mjs `lighthouse` (median of runs) |
  | G4 | lab CWV: LCP, CLS, TBT | gates.mjs `lighthouse`; motion-audit for CLS during scroll |
  | G5 | axe zero critical or serious, keyboard, screen reader | gates.mjs `axe` + the manual passes in §6 |
  | G6 | valid JSON-LD | extract every ld+json block from the raw HTML and parse it |
  | G7 | RTL correctness, LTR islands | shots + §6 |
  | G8 | no regressions: types, lint, build, before/after shots at 390 and 1440 | build + `shots.mjs`; in redesign mode also `preserve.mjs diff` |
  | G9 | nothing broken: console, links, sitemap, canonicals, real 404 | gates.mjs `console` + a crawl |
  | G10 | every WhatsApp, tel, mailto and form path fires its own event | code review |

- [ ] **11. Overlap gate** (MediaWave's pattern, adopt per project). Every scene element carries `data-zone="text|art|ui"` (copy and CTAs are text; moving objects and media are art; header, floating buttons, cookie banner and accessibility tab are ui). Held stages carry `data-hold`, so the audit also steps through each hold's own range. Copy `G:/Web-Dev/MediaWaveIsrael/scripts/overlap-audit.mjs` (the MediaWave repo) into the project's `scripts/` folder (it needs puppeteer there) and run `node scripts/overlap-audit.mjs --looks site=$URL/ --vp 320,390,768,1024,1440 --out design/audit/overlap`; it exits 1 on any counted overlap, and the target is 0. Write the z-index and placement map of the floating UI (chat, accessibility tab, cookie banner, popup) before the first run.
- [ ] **12. Rive, when the site uses it.** `node <skills>/rive-studio/scripts/rive-audit.mjs .` exits 0, and each piece passes `node <skills>/rive-studio/scripts/rive-probe.mjs public/rive/<piece>.riv --contract design/rive/<piece>/CONTRACT.md --shots design/rive/<piece>/shots`. The static rest frame matches the idle pose, the file loads lazily, and reduced motion shows the rest frame.
- [ ] **13. Accessibility passes** (§6): keyboard, screen reader spot check, forced colours, 200 % zoom.
- [ ] **14. One fresh critic**, milestone 3 of pattern-breaker's critic, with §2 added. The same reviewer carries site-gate-audit's fresh-eyes brief (the gates table and the preview URL, with the job of making the site fail), so stage 5 spawns one reviewer, not two. Vet each finding against its evidence, fix the high ones and the cheap medium ones, and re-capture only the affected ranges.
- [ ] **15. Polish pass** (§5).
- [ ] **16. Nati's phone review.** Start the dev server on the LAN (`npx astro dev --host`, `npx next dev -H 0.0.0.0`, or `npm run dev -- --host` on Vite) and give Nati the LAN URL. He reviews on the phone first.
- [ ] **17. Report and docs.** Write `design/qa-report.rtl.md` in Hebrew, one row per step: result, evidence path, what is left. Sync the decision log, the storyboard (its polish table filled), BRIEF, CONCEPT, LEDGER and `.context/HANDOFF.md`, then run step 1 again. Gate: every step passes, or Nati accepts a named exception.

## 2. Critic prompt additions

Pattern-breaker owns the critic (one fresh-context reviewer per milestone, findings with severity, confidence and evidence, vetted by the main thread). This skill adds inputs, questions and two weighted rubrics. Append them to the milestone prompt; never replace pattern-breaker's own questions.

**Extra inputs.** All milestones: `design/world-dossier.rtl.md`, `design/design-decisions.rtl.md`, `design/storyboard.rtl.md`. Milestones 2 and 3 also: `design/shots/index.html` with sampled frames, `design/shots/accent.json`, and the gates report.

**Extra questions, milestone 1 (plan, nothing built):**

> 8. For the grid, the accent, the two typefaces, the persistent object and the hero interaction: which dossier item (W id) does each come from? Name any decision whose W id does not explain it.
> 9. Swap the client for a business from another trade, then for a same-field competitor. What breaks in the plan? Quote the swap-test lines and say whether they are honest.
> 10. Was the safe direction shown and rejected for a reason a client would understand, or only for taste?
> 11. Are the chapters verbs in the order things happen for the client? Does the persistent object change state in a way that means something at each step? Is every proof real, marked "הדגמה", or marked [לבירור]?
> 12. Does the hero interaction come from the work itself, and does its metaphor make literal sense (logic before wow, nothing recursive)?
> 13. Count the standout moments against the budget in the decision log. A logo ident, a contact companion, page transitions and a cursor all count.

**Extra questions, milestones 2 and 3 (built):**

> 14. For each section, name its one focal point with a frame. Flag sections with two.
> 15. Read accent.json: which hits do not carry the accent's stated meaning?
> 16. At 1440x700: what is cut, overlapping, or sized for 900 only? At 390: what was shrunk instead of re-choreographed?
> 17. In the reduced frames: does every moment show its last frame, with nothing invisible and nothing half-way?
> 18. Is any banned template visible: two buttons with a logo strip and three cards, a feature grid, a card inside a card?
> 19. Score both rubrics below, then give the cheapest fix for every category under 8.

**Rubric A, Awwwards site score.** Score each category 1-10 with evidence; the weighted sum is the site score.

| Category | Weight | Heron (SOTD 12 Oct 2026) |
|---|---|---|
| Design | 40 % | 7.75 |
| Usability | 30 % | 7.48 |
| Creativity | 20 % | 7.85 |
| Content | 10 % | 7.81 |
| Weighted | | 7.7 |

**Rubric B, Awwwards Developer award.** The award goes to sites above 7; the weights reproduce Heron's 7.01 exactly.

| Category | Weight | Heron |
|---|---|---|
| WPO (performance) | 0.20 | 7.00 |
| Responsive design | 0.20 | 7.00 |
| Semantics / SEO | 0.20 | 7.00 |
| Markup / meta-data | 0.15 | 6.60 |
| Animations / transitions | 0.15 | 7.60 |
| Accessibility | 0.10 | 6.80 |
| Weighted | | 7.01 |

The target is to beat Heron in every row, above all markup (6.6, Heron's lowest) and accessibility (6.8). The developer checklist behind rubric B includes: content usable with no CSS and with no JavaScript, Windows High Contrast mode, `aria-hidden` on decorative layers, labelled controls, no information only on hover, pause controls for anything that auto-starts and runs over 5 s, browser history that works, no console logs or errors, cross-browser behaviour, and "avoid filters" under WPO (so every SVG filter needs its decision row).

**Cheapest fix per score under 8.** For every category scored under 8, the critic names one change: what, where (file, selector or frame), the expected effect, and a rough effort. Rank them by expected points per hour. Typical candidates, to be checked against the evidence, not assumed:

| Category | Usual cheap fixes |
|---|---|
| Markup / meta | a title and description per route, canonical, `lang="he" dir="rtl"`, Open Graph image, valid HTML (`astro check`), JSON-LD that parses, no duplicate IDs |
| Accessibility | skip link (Heron had none), root font size in rem with a clamp floor (Heron's vw-only root size ignores the user's setting), visible focus, the pause control, a keyboard and touch path for the hero interaction |
| Semantics / SEO | landmarks, one H1, heading order, a heading per section, real links instead of click handlers |
| WPO | one live filter at a time, media lazy below the fold, a subset display font, no console errors, the motion chunk after first paint |
| Responsive | the 1440x700 fit, re-choreographed 390 scenes, touch targets of 44 px |
| Animations | a reduced variant per moment, no jank in the median, the polish order of §5 on the smallest transitions |

**Output.** Extend pattern-breaker's critic JSON with:

```json
{
  "awwwards": { "design": 0, "usability": 0, "creativity": 0, "content": 0, "weighted": 0 },
  "developer": { "wpo": 0, "responsive": 0, "semantics": 0, "markup": 0, "animations": 0, "accessibility": 0, "weighted": 0 },
  "cheapest_fixes": [ { "category": "", "score": 0, "fix": "", "evidence": "", "effort": "minutes|hours|day" } ]
}
```

## 3. Extreme-content matrix

Motion is built on design-time content; the client then types whatever they want. Every field the client can edit gets these cases, each screenshotted with `shots.mjs` on the affected route at all three viewports, motion and reduced:

| Field | Cases | Pass |
|---|---|---|
| Heading, label, button text | longest realistic Hebrew (the slot's maxLength, or twice the approved copy), shortest (one word), empty | no overflow or clipping; holds still land; empty shows the design's fallback text, never a hole |
| Paragraph | about 300 characters, one short sentence, empty | line length stays readable; the section height change does not leave triggers late |
| Mixed direction | a phone (052-1234567), a price with ₪, a time range 09:00-16:00, an email, an English brand name inside Hebrew | each LTR run isolated (`<bdi>` or `unicode-bidi: isolate`); nothing flips |
| Hebrew glyphs | geresh and gershayim (׳ ״), final letters, a long unbroken word or URL | the display face covers them or a fallback face does; the long word wraps or breaks without overflow |
| Image | missing (removed or 404), portrait in a landscape slot and the reverse, a very small source | the fallback image renders; markers placed over the image still land (object-fit mapping); no CLS |
| Gallery | 0 items, 1 item, the maximum | 0 hides the block or shows a fallback; 1 does not look broken; the maximum fits the hold or the pan |
| Video link | invalid, removed upstream | the poster or fallback shows; no console error escapes |
| Numbers in proof | a much larger and a much smaller figure | the instrument face keeps alignment; nothing invented to fill space |

How to drive the cases:

1. **Astro + client-content-editor.** On the VPS, against the cms-preview deploy: `cms set <key> "<value>" && cms publish && cms wait`, then capture. Use a unique marker in test values, and afterwards set the original values back and publish again (a test value left live is the classic failure). Read that skill's gotchas before the first run.
2. **Next.js + Payload.** Edit in the Payload admin against a preview database (or seed a variant document). Where the collection has Payload's Live Preview configured (`admin.livePreview`: an iframe in the admin that loads the front end for the document being edited), use it for the quick pass: each case shows while it is typed. Live Preview renders inside the admin at its own configured breakpoints, so the captures for the record still come from the preview deployment (`shots.mjs` on the affected route, then recapture `design/audit/html` for steps 1 and 2). Never test on production content.
3. **No CMS.** Edit the content files on a branch, build, capture, discard the branch.

The slots must enforce their limits in code, not only in help text: maxLength per text slot sized to the layout, gallery minimum and maximum rows, required alt text, and a required aspect ratio or focal point wherever motion depends on image geometry. The site's image accessor must return width, height and sizes so space is reserved before the image loads. The persistent object, motion assets, the accent's use, the chapter structure and any mask or cursor are never slots.

After each content change the page height changes; pattern-breaker's engine watches content height and refreshes ScrollTrigger. Check one case per page with `motion-audit.mjs $URL/ --only map --viewports desktop` to confirm holds still start and end where the storyboard says.

## 4. Screenshot matrix

| What | Viewports | Passes | Tool | When |
|---|---|---|---|---|
| every route at scroll steps 0, 0.25, 0.5, 0.75, 1 | 1440x900, 1440x700, 390x844 (DPR 2) | motion, reduced | `shots.mjs` | stage 3 prototype, every build wave, stage 5 |
| each held scene at progress 0.2, 0.5, 0.9 | desktop, short, mobile | motion | `scroll-film.mjs $URL/ --at <id>:0.2,<id>:0.5,<id>:0.9 --viewports desktop,short,mobile` | while building a scene, then stage 5 |
| each seam between chapters, just before and just after | desktop, mobile | motion | `scroll-film.mjs` stills or `shots.mjs --steps` around the seam | stage 5 |
| each signature moment scrolled forward, backward, slowly and with a fast flick | desktop, mobile | motion | `scroll-film.mjs --video` plus a manual pass | stage 5 |
| button and link states: idle, hover, focus-visible, pressed, loading, sent, error | desktop, mobile (press only) | motion | a dev states page, or the browser pane | when a component is built |
| extreme content (§3) | all three | motion, reduced | `shots.mjs` on the route | after the CMS is wired |
| overflow at 320, 390, 768, 1440 | four widths | motion | `gates.mjs` (`overflow`) | every gates run |
| forced colours (High Contrast) | desktop | reduced | DevTools: Rendering, emulate `forced-colors: active` | stage 5 |
| real devices | an iPhone (Safari) and a mid-range Android | both OS settings | by hand | before handoff; always for SVG filters and video |

Capture rules: motion forced on (headless Chrome defaults to reduced motion), `captureBeyondViewport: false` (true resizes the viewport, re-runs ScrollTrigger refresh and makes pinned pages jump), wheel scrolling on desktop so Lenis and ScrollTrigger fire, finger strokes (touch events) on mobile, settled before the shot, popups and once-per-visit intros suppressed through `--session`. Never review full-page screenshots: triggers below the fold never fire in them.

Reading the frames: one focal point per section; the accent only where its meaning applies; nothing cut at 1440x700 that was meant to sit in one screen; art whole and centred in its frame; Hebrew line breaks without a lone short word; every LTR island upright.

## 5. Polish pass order

Polish runs last and in this order, one change per iteration, re-capturing only the affected range (`scroll-film.mjs --at`, or `shots.mjs --steps` around it) and committing explicit paths after each verified change.

1. **Fit:** 1440x700 first, then 390, then 1440x900.
2. **The smallest transitions, each in sequence: geometry, then highlight, then text.** For each moment (a state change of the persistent object, a hover, a form step), first make the shapes move and land right, then the highlight or colour change, then the text change. Record each in the storyboard's polish table. Heron's team credits these small transitions, not the big moments, for making the site feel like a working tool.
3. **States:** idle, hover, focus-visible, pressed, loading, sent, error. Keyboard focus drives the same visuals as hover; touch gets press only; nothing hides or moves the label.
4. **Micro-surfaces in the client's dialect:** loader, labels, metadata lines, indexes and status text written in the trade's words and set in the instrument face.
5. **Copy pass:** outcome only, plain Israeli Hebrew, no tech jargon, the FAQ in the customer's words, every new line marked for Nati's approval resolved.
6. **Reduced and no-JS frames:** every moment's last frame reads on its own.
7. **Performance trims:** cheaper fixes first (media, fonts, filter regions); a signature moment is cut only by a logged decision.

## 6. Accessibility mapping

| Requirement | Level | What it means on these sites | Check |
|---|---|---|---|
| 2.2.2 Pause, Stop, Hide | A | anything that starts on its own and runs over 5 s (a looping hero video, a Lottie loop, a marquee, autoplay) has one visible pause control; the setting never persists between visits; it never forces motion on against the OS setting | by hand + the film |
| 2.3.1 Three Flashes | A | no rapid light and dark toggling; the reduced-motion swap uses hysteresis so it cannot flicker at a threshold | the film, reduced shots |
| 2.3.3 Animation from Interactions | AAA, mandatory here | every scroll-linked or pointer-linked moment has a reduced variant: its last frame, with no Lenis, scrub, loops, cursor or pointer masks | reduced shots, motion-audit reduced checks, the storyboard's reduced column |
| 2.4.7 Focus Visible | AA | every link, button and field shows focus | Tab pass |
| 2.4.11 Focus Not Obscured (Minimum) | AA | the sticky header, cookie banner, chat button and cursor canvas never fully cover the focused element; the header offset lives in `scroll-padding-top` | gates.mjs `anchors` + Tab pass |
| 2.1.1 Keyboard | A | the hero interaction has a keyboard path and a touch path (Heron's published drag code shows neither); tabbing into a held scene scrolls it to that item | Tab pass |
| 2.4.1 Bypass Blocks | A | a skip link to `<main>` | Tab pass |
| 1.4.3 Contrast (Minimum) | AA | axe reports 0 contrast violations on every route and state; the palette contrast table exists before the build | gates.mjs `axe` |
| 1.4.4 Resize Text | AA | the root font size is never vw-only (use clamp with a rem floor); text survives 200 % zoom | 200 % zoom pass |
| 1.3.1 Info and Relationships | A | landmarks, one H1, heading order, labelled fields | gates.mjs `axe`, `forms` |

Also, outside the numbered criteria: decorative layers (cursor canvas, lens, ink, Rive canvas) are `aria-hidden` and `pointer-events: none`, and their meaning lives in HTML; nothing important exists only on hover; under `forced-colors: active` the cursor is off and borders stay visible; numbers, dates and emails sit in isolated LTR runs; content is readable with JavaScript off (gates.mjs `nojs`); an accessibility widget never stores its settings; the Hebrew accessibility statement (mediawave-landing-page's legal templates) mentions the pause control.

## 7. Known false positives

Check this list before changing the site for a red result:

- A lab number taken without `--lh-motion` measured the reduced page, because headless Chrome reports reduced motion by default.
- Full-page screenshots show empty sections: their triggers never fired. Use `shots.mjs` or `scroll-film.mjs`.
- One slow timing sample is noise; motion-audit repeats runs near a budget and judges the median.
- axe colour-contrast can catch a cookie banner mid-fade; settle longer and re-run before changing colours.
- A local static server can serve `.wasm` with the wrong MIME type, which logs a Rive console error locally only; check the production headers before fixing code.
- A `/route` argument that arrives as `C:/Program Files/Git/route` is Git Bash path conversion; set `MSYS_NO_PATHCONV=1`.
- Cloudflare `pages.dev` previews carry an injected `x-robots-tag: noindex`; judge crawlability on production.
- design-loop-router's verify and gate rules (sky ink, token drift, the Hebrew type probe reading `<noscript>`) were written for MediaWave's old theme; they are not client QA.
