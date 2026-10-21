# The critic: a fresh pair of eyes at three milestones

Read this when a milestone is reached. Greenfield: (1) "plan", after the scroll score (concept and score, nothing built yet), (2) after the first full build, (3) before handoff. Upgrade: after wave W1 and before handoff. The critic is one fresh-context reviewer that looks at the rendered film (at milestone 1, the plan files), not at the builder's reasoning. Anthropic's guidance for current models: separate, fresh-context verifiers outperform self-critique, and "double-check your work" prose in a prompt adds little. So there is exactly one perceptual review per milestone, and the builder does not re-review its own edits in between.

## Contents
1. Setup
2. What the critic receives
3. The critic prompt
4. Output shape
5. Vetting the findings
6. Image budget

---

## 1. Setup

- **With subagents:** one fresh agent at high effort. It receives files, not the conversation. It never sees the builder's notes about why things are the way they are; it judges what is on screen.
- **Without subagents:** do a separate pass that starts by reading the files listed below, written as if you have not seen the project before. Don't skim your own draft.

## 2. What the critic receives

| Milestone | Inputs |
|---|---|
| 1 Plan | `design/BRIEF.md`, `CONCEPT.md`, `SCROLL-SCORE.md`, `design/probe/*.json`, `design/lab/prior.md`, reflexes.md |
| 2 First full build | the above + scroll-film frames (sampled, §6) for desktop and mobile + motion-audit.md + slop-scan.md |
| 3 Before handoff | the above, re-captured, + the previous critic report (to check what was fixed) |
| Upgrade, after W1 and before handoff | `design/DIAGNOSIS.md`, the chosen direction and change list, before and after films of the changed zones, motion-audit, slop-scan, the preservation diff, + the previous critic report |
| Under site-director, every milestone | also `design/world-dossier.rtl.md`, `design/design-decisions.rtl.md` and `design/storyboard.rtl.md` (it replaces SCROLL-SCORE.md in the prompts); from milestone 2 also the built HTML (for `data-chapter` and `data-dossier`), frames at 1440x700 (scroll-film's `short` viewport) and the extreme-content captures |

## 3. The critic prompt

For milestone 1 nothing is built yet, so give the critic this plan-only brief:

> You are reviewing a website plan for distinctiveness. Read BRIEF.md, CONCEPT.md, SCROLL-SCORE.md, the probe answers in design/probe/, design/lab/prior.md and reflexes.md.
>
> 1. Describe the concept in one sentence, the way a competitor would describe it to a client. Could a competitor in the same city use it unchanged?
> 2. Which values does the concept share with the probe answers or prior.md (palette family, display face, hero structure, motion, subject world, motif, signature moment)? For each, does CONCEPT.md give a brief-specific reason?
> 3. Is the concept the category default, its predictable "edgy" opposite, or the obvious metaphor for this trade?
> 4. For each signature moment: does it name a sentence only this client could say, and does the score give it a mobile and a reduced-motion version?
> 5. Where does the score break its pacing rules in scroll-score.md §2-§3 (dead stretches of 3 vp or more, more holds than the length allows, touching holds, no peak in the first 2 vp)?
>
> Report every issue with severity and confidence, with the line you are quoting as evidence.

For milestones 2 and 3, and for upgrade waves, give the critic this brief (adapt the file paths):

> You are reviewing a website for distinctiveness and craft. Read BRIEF.md, CONCEPT.md and SCROLL-SCORE.md, then look at the film frames in order (desktop first, then mobile) and read motion-audit.md and slop-scan.md.
>
> 1. Describe the site in one sentence, the way a competitor would describe it to a client.
> 2. Which default patterns from reflexes.md are visible? For each, name the frame file and whether CONCEPT.md gives a reason for it.
> 3. Name the single most memorable moment, with its frame. If there is none, say so.
> 4. Mark dead zones (a stretch of 3 viewports or more where nothing changes or nothing new is said; motion-audit uses the same threshold) and any frame where content looks unfinished, cut off, overlapping or unreadable.
> 5. Compare the film with SCROLL-SCORE.md: which beats are missing, weaker than planned, or happen in a different place?
> 6. Mobile: which scenes were shrunk instead of re-choreographed?
> 7. Copy: which visible lines could a competitor use unchanged?
>
> Report every issue you see with severity (high: breaks the concept or the experience; medium: noticeably generic or off; low: polish) and your confidence. Don't filter by severity; filtering happens later. Point to evidence (frame file names, selectors, quoted text) for each finding.

### Under site-director: extra questions and the scores

When the project has site-director's three artifacts, append these to the milestone's prompt. They go to the same fresh critic; never answer them as self-critique. site-director appends its own critic additions at each milestone (`<skills>/site-director/references/qa.md` §2: questions 8-19, rubrics A and B, output keys). That set covers some of the questions below, and which ones depends on the milestone. At milestone 1 its questions 9 and 11 ask S2, S3 and S5, so add only S1 and S4. At milestones 2 and 3 its questions 15, 16 and 19 ask S4, S6 and S8, so add S1, S2, S3, S5 and S7. Ask nothing twice.

At every milestone (milestone 1 answers from the files):

> S1. Does every section link to a dossier item and to a chapter? In the plan, every storyboard row cites W IDs; in the build, every `<section>` that is a direct child of `<main>` carries `data-chapter` and `data-dossier` (legal and utility sections `data-chapter="support"`). List the orphans.
> S2. Are the chapters verbs, 3-5 of them, in the order things happen for the client? Quote any chapter that is a noun or a feature.
> S3. Does the persistent object change state from chapter to chapter, and does each state mean something in the client's work? Name the chapters where it only sits there.
> S4. Is the accent used only for its meaning (the decision log names it)? List every place it appears for anything else.
> S5. Other-field swap: put a business from another field in this site. What breaks? If nothing breaks, say so.

From milestone 2:

> S6. Does the page hold up at 1440x700: no hero or held stage cut off, the focus of each held scene inside the viewport, nothing hidden under the header?
> S7. Extreme content: in the captures with very long and very short Hebrew in every client-editable field and a missing image, what breaks (overflow, a stage that no longer fits, a move that no longer lands)?
> S8. Score the site 1-10 per category by the Awwwards site weights (design 40%, usability 30%, creativity 20%, content 10%) and by the Developer-award weights (WPO 0.20, responsive 0.20, semantics and SEO 0.20, markup and meta 0.15, animations 0.15, accessibility 0.10), with both weighted totals. For every score under 8, name the cheapest fix that would raise it: what, where, its evidence and a rough effort.

For calibration: Heron AI (Awwwards Site of the Day, 12 Oct 2026) scored 7.7 on the site score and 7.01 for development, its weakest categories markup (6.6) and accessibility (6.8); site-director's target is to beat both.

Why these questions: the useful judgment is pattern recognition ("which defaults are visible"), not provenance ("is this AI-made"), which no model can determine from pixels. Asking for every issue keeps recall high; asking only for "high-severity issues" makes reviewers miss things.

## 4. Output shape

```json
{
  "competitor_sentence": "",
  "memorable_moment": { "frame": "", "what": "" },
  "findings": [
    { "id": "F1", "severity": "high|medium|low", "confidence": "high|medium|low", "area": "concept|layout|type|colour|motion|copy|mobile|a11y|performance", "evidence": ["desktop/f-0012-y005400.jpg", ".hero h1"], "issue": "", "suggestion": "" }
  ],
  "score_drift": [{ "beat": "", "planned": "", "observed": "" }],
  "dead_zones": [{ "from_frame": "", "to_frame": "" }],
  "linkage": [{ "section": "#id or storyboard row", "chapter": "", "dossier": ["W03"], "issue": "" }],
  "awwwards": { "design": 0, "usability": 0, "creativity": 0, "content": 0, "weighted": 0 },
  "developer": { "wpo": 0, "responsive": 0, "semantics": 0, "markup": 0, "animations": 0, "accessibility": 0, "weighted": 0 },
  "cheapest_fixes": [{ "category": "", "score": 0, "fix": "", "evidence": "", "effort": "minutes|hours|day" }]
}
```

`linkage`, `awwwards`, `developer` and `cheapest_fixes` are filled only under site-director (the three score keys from milestone 2, each category on a 1-10 scale). `awwwards`, `developer` and `cheapest_fixes` are the same keys site-director's `qa.md` §2 adds, so the scores read the same whichever set of questions was appended; `linkage` is this file's own.

## 5. Vetting the findings

The main thread vets before fixing; critics over-report too.

- Re-open the evidence for each finding (the frame, the selector, the line). If it doesn't reproduce, mark it rejected and why.
- A finding that contradicts the brief or the concept is resolved in favour of the brief, unless it reveals that the concept itself fails (then raise it with the user).
- Fix high findings, then medium ones that are cheap. Record each finding's outcome in the ledger: fixed, rejected (with reason), or deferred (with reason).
- Under site-director, every score under 8 enters the ledger with its cheapest fix; fix them in order of score gain per effort.
- Re-capture only the affected range (`?at=` or a scroll-film run limited by `--max`) to confirm a fix; save the full re-capture for the next milestone.

## 6. Image budget

Frames cost tokens and requests have image limits: the long edge is capped at 2576 px, and once a request holds more than 20 images each must be at most 2000 px per side. A 1440×900 frame costs about 1,700 visual tokens; a full page at 4 frames per viewport across two viewports can pass 250k.

So the critic samples:
- every frame in the hero and in each signature moment and hold;
- every 3rd or 4th frame elsewhere;
- mobile at section starts and in every re-choreographed scene;
- under site-director, the 1440x700 frames at the hero and in every held scene;
- or the contact sheets scroll-film writes (`film.html`, `scroll-strip.jpg`), which show the whole page at a glance.

Never use full-page screenshots for review: scroll-triggered content never fires in them, and the page is downscaled until text is unreadable.
