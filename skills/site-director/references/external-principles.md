# External principles, with credit

Ideas this skill takes from four external skill collections, each paraphrased, credited and mapped to where site-director uses it. Nothing here is installed and no text or code is copied from them: the principles are restated in our words, and any code in site-director is our own. Read this when a rule's origin matters, or before anyone proposes installing one of these collections.

## Contents
1. Summary
2. greensock/gsap-skills (MIT)
3. Emil Kowalski's skills (MIT)
4. impeccable v4 (Apache-2.0)
5. taste-skill (MIT)
6. Osmo (paid membership)
7. Corrected GSAP facts
8. Conflicts, settled
9. If anyone wants to install one

---

## 1. Summary

The four repositories were cloned read-only and reviewed without running any script, installer or binary (gsap-skills at aed9cfd, emilkowalski/skills at 2d22863, impeccable at abf5779, taste-skill at f624f37).

| Source | Licence | Verdict | What we take |
|---|---|---|---|
| greensock/gsap-skills | MIT, Copyright (c) 2026 GreenSock | extract, do not install | cleanup and lifecycle rules, the SplitText re-split pattern, quickTo followers, matchMedia conditions; three of its facts are wrong (§7) |
| emilkowalski/skills | MIT, Copyright (c) 2026 Emil Kowalski | extract, do not install | the frequency gate, naming a purpose, the review order, worst-case data, the mobile baseline, gesture physics |
| pbakaus/impeccable v4 | Apache-2.0 (with a NOTICE for references derived from an MIT project) | extract principles; keep the local 3.9.1 | the safe card shown but never recommended, candidates from the audience's world, the direction contract, the finish reviewer, bounded verification |
| Leonxlnx/taste-skill | MIT, Copyright (c) 2026 Leonxlnx | extract, do not install | the client inventory, claims with proof, one live thing, honest imagery, critique on screenshots |
| Osmo (osmo.supply) | paid membership; its terms forbid storing resources outside its vault | technique reference only, per project | nothing stored in this skill |

The GSAP library itself is not MIT: it ships under GreenSock's Standard no-charge licence (free for commercial use, every plugin included). Only the gsap-skills text is MIT.

## 2. greensock/gsap-skills (MIT)

| Principle | Where site-director uses it |
|---|---|
| Put ScrollTrigger on the top-level timeline, never on tweens nested inside it | stage 4 build; `motion-system.md` §1 rule 6 |
| Scrubbed or toggled, never both on one trigger | pattern-breaker's motion classes, which we keep |
| Create triggers top to bottom, or set `refreshPriority`, so later pins do not shift earlier triggers | `motion-system.md` §6 (triggers at boot, in page order) |
| Scope every selector to its component; wrap handlers created later in `contextSafe` | every scene runs in `engine.scene()` or `useGSAP` |
| On a route change, kill or revert everything, then refresh after fonts and content | `page-transitions.md` (before-swap teardown, the content-height watch) |
| SplitText: create the animation inside `onSplit` and return it, with `autoSplit`, so a re-split rebuilds it | `engine.splitLines` does this, plus the RTL fix the collection lacks |
| `gsap.quickTo` for a DOM follower instead of a new tween per pointer event | the DOM alternative to an `engine.onFrame` follower |
| `gsap.matchMedia` with a conditions object, and `matchMediaRefresh()` after an in-page toggle | the Next asset's reduced-motion branch |

Not installed because pattern-breaker's engine already covers its useful core; its skill descriptions push GSAP for every animation, which breaks our ownership rule (Motion owns component state); and it has no RTL or Hebrew guidance at all.

## 3. Emil Kowalski's skills (MIT)

| Principle | Where site-director uses it |
|---|---|
| **Frequency gate:** something used a hundred times a day gets no animation, tens of times a day only a near-invisible one, occasional surfaces a standard one; delight belongs only to rare or first-time moments | the motion budget: standout moments are rare-tier; navigation and menus stay near-instant (`motion-system.md` §5) |
| **Name the purpose in one word or delete the animation:** feedback, spatial consistency, state indication, preventing a jarring change, explanation, or delight (rare tier only) | the storyboard's motion column and each moment's decision row |
| **The review order:** delete, then reduce, then fix the easing, then the origin, then make it interruptible, then move it to the GPU, then asymmetric timing, then polish, then accessibility and cohesion | QA's polish pass, before adding anything |
| Exit faster than entry; slow where the visitor decides, quick where the system answers | timing of every component state |
| Motion that must stay smooth while the page is busy (a route change, hydration) belongs in CSS or WAAPI, not in a script loop | page transitions run as CSS animations on view-transition snapshots |
| A custom property on a parent restyles every child each frame; set it on the moving element | `motion-system.md` §6 |
| `will-change` only after a measured problem, only on the moving element | `motion-system.md` §6 |
| **Gesture physics** (from Apple's guidance): pointer capture that keeps the grab offset, release velocity handed to a spring, a momentum projection `current + (v / 1000) * d / (1 - d)` with `d` about 0.998 to choose the snap target, rubber-banding past the bounds | the hero interaction when it throws or snaps (`motion-system.md` §4) |
| **Worst-case data:** plausible or schema-backed, entered through the same data path as the demo content, switched on by a development-only toggle | QA's extreme-content pass, extended with Hebrew cases: long compound words, niqqud, LTR phone numbers and dates inside Hebrew, every client-editable field at its limits |
| **Mobile baseline:** `viewport-fit=cover`, a `theme-color` per colour scheme, 16 px inputs (never disable zoom), hover rules only under `(hover: hover) and (pointer: fine)`, `touch-action` on gesture surfaces, `overscroll-behavior` on inner scrollers | foundations checklist at stage 4; we use `svh` for heroes and stages and never `dvh` on scroll scenes |
| UI timing tokens (press 100-160 ms, small menus 150-250 ms, UI under 300 ms) apply to interface; marketing and explanatory motion is exempt | our 0.8 s page transition is a rare-tier exception, not a UI timing; extend the project's tokens instead of adding a second set |
| A blur-masked crossfade is for small UI states | never for a main transition (Nati bans the crossfade there) |

When routing to one of these skills, pass a concrete question: they answer with a fixed greeting otherwise, and three of them are user-invoke-only.

## 4. impeccable v4 (Apache-2.0)

site-director's precedence keeps the locally installed impeccable 3.9.1 as the specialist for audit, critique, harden, polish and typeset. These v4 ideas are taken as principles only:

| Principle | Where site-director uses it |
|---|---|
| **A standing "category standard" card** in every direction round: the safe answer, played straight, shown to the person deciding and never recommended | P1: the safe direction is shown to Nati, marked, and rejected with a reason |
| **Candidates from the audience's world:** seven concrete artifacts, places or rituals the audience knows by heart, across at least three material families; the page the category always ships and its predictable opposite are both the rut | the world dossier (stage 2) |
| **A direction contract before code** in six short blocks (thesis, own world, story, first viewport, form, finish), kept out of anything served to the browser | the decision log; internal notes never ship in HTML, comments, data attributes or bundles |
| **A fresh-context finish reviewer** with a fixed vocabulary (ship, fix, rebuild, recapture), at most eight ordered material fixes, and a validity check on every screenshot before reviewing | the one fresh critic per milestone in QA |
| **Bounded verification:** build fully, one batched inspection of desktop and mobile, one fix batch, at most one confirming round | stage 5 rhythm |
| **Theme the browser surfaces** the design did not draw: selection, caret, scrollbars, focus rings, underline offset, tabular numerals | QA polish list |
| **Monospace is for code, data or measurement**, never a costume for "technical" | P2: it permits a monospaced instrument face for numbers, labels and indexes |
| Four visitor modes (Persuade, Operate, Read, Experience) | a lens for the critic, not a step |

v4's font advice flags IBM Plex among the training-data defaults. When impeccable runs on a site with a pinned face (MediaWave's IBM Plex Sans Hebrew, decision #59), pass the pin in the brief so the brief wins.

## 5. taste-skill (MIT)

| Principle | Where site-director uses it |
|---|---|
| **Inventory the subject:** eight to twelve things that belong to this client and to no competitor, before any direction | the world dossier's 15-30 items |
| **The competitor test** | already in pattern-breaker; we run it with the other-trade swap test |
| **One live thing:** one thing the visitor can do, derived from the subject, with a no-JS fallback | P3: the hero interaction from the work |
| **Write the page as claims, each with its proof, before markup**; a section without a claim is filler and goes | P3: the storyboard's proof column; features only as proof inside a chapter |
| **Two-line headline arithmetic:** characters per line are about the line width divided by font size times a factor near 0.5 | headline sizing; recalibrate the factor on the chosen Hebrew display face first |
| **Honest imagery order:** the client's own images, then generated ones, then credited open-collection pictures of the client's world, then a drawn subject, then atmosphere stock; a found picture never passes for the client's own, and open-licence pictures are credited on the page | stage 1 photo request and the media ledger |
| **Critique screenshots, never code,** with the Awwwards weights (design 40, usability 30, creativity 20, content 10), hard caps for disqualifying faults, and at most three rounds | the fresh critic's rubric |
| **Removing AI tells leaves a hole unless something real fills it**: a larger main element, the full content, a picture made for this subject | QA: banned defaults are replaced, not just deleted |

Not installed, for these reasons. In its own blind tests the skill did not beat a no-skill baseline on judged quality (7.7 against 7.8 in the final round, 6.9 against 7.9 on unseen briefs); it wins on counted tells, not on quality. Its "247-site study" scores are model-panel judgements of screenshots, not Awwwards jurors. Its runtime scripts call six external APIs (Openverse, Wikimedia Commons, the Art Institute of Chicago, the Met, the Internet Archive, NASA images), write `.taste-skill/` in the project and in the home folder, and launch headless Chrome. Its photo library is hotlinked through picsum and its fonts from Google Fonts and Fontshare. Its motion rules forbid a smooth-scroll library and any custom cursor, and its house rules ban monospace outside code, all of which collide with our system. Its older sub-skills contradict its v2 rules. design-loop-router vendors an older commit; re-vendoring v2 would break that skill's no-network guarantee.

## 6. Osmo (paid membership)

Verified 2026-10-15 (osmo.supply home and pricing pages): a paid membership of Webflow and HTML/CSS/JS + GSAP resources by Dennis Snellenberg and Ilja van Eck, including a Barba page-transition course; Solo EUR 25 a month billed quarterly or EUR 20 billed yearly, Team (two seats or more) EUR 20 or EUR 16 per person; a free demo vault of 20 resources. The pricing page says resources used in client projects during an active membership may stay there, and that members may not download or store resources outside the vault; its licensing page returned 404, so the remaining terms are unverified.

Use: a technique reference at the technique stage only (P1 bans inspiration sources at the concept stage), per project, under a live membership. Nothing from Osmo is ever copied into this skill.

## 7. Corrected GSAP facts

Checked against gsap 3.15.0 source in node_modules:

1. **Observer's default `type` is `"wheel,touch,pointer"`** (`src/Observer.js`), not `"touch,pointer"` as gsap-skills' plugin table says.
2. **`Flip.from`'s `scale` defaults to off.** The option has no default (`src/Flip.js`), so Flip animates width and height unless `scale: true` is passed; gsap-skills says it defaults to true.
3. **gsap-skills' horizontal `containerAnimation` example does not run:** it calls `Max.max` (a typo for `Math.max`) and feeds a pixel value into `xPercent`. The working shape animates `x` with a function value, `ease: 'none'` (required for `containerAnimation`) and `invalidateOnRefresh: true`. On our stack the track moves inside a sticky stage instead of a pin, and on a Hebrew page it moves with a positive `x`:

```js
// Horizontal track in a sticky stage: the wrapper's height sets the scroll distance (no pin).
// Same shape as pattern-breaker's move H-02 (<skills>/pattern-breaker/references/moves-recipes.md).
// Inside engine.scene(), so destroy() reverts the timeline and its trigger.
engine.scene(() => {
  if (engine.REDUCE) return;                                     // strict reduced motion: H-02's CSS stacks the track
  const distance = () => track.scrollWidth - stage.clientWidth;  // clientWidth, not innerWidth (Windows scrollbar)
  const tl = engine.holdTimeline(wrapper, { scrub: 0.5 });        // start 'top top', end 'bottom bottom', invalidateOnRefresh
  tl.fromTo(track, { x: 0 }, { x: () => engine.DIR * distance(), duration: 1 }); // ease 'none' from holdTimeline's defaults
  // Triggers on panels inside the track: containerAnimation: tl, with edges swapped in RTL ('right center').
});
```

Smaller gaps in the same collection: its SplitText table omits `specialChars` and shows `type` as optional, while the 3.15 TypeScript types require it.

## 8. Conflicts, settled

| External rule | Ours |
|---|---|
| taste-skill: no smooth-scroll library, no custom cursor | Lenis through the engine is allowed; a cursor accent only with a dossier reason, never hiding the native cursor |
| taste-skill: no monospace outside code | monospace is allowed as the P2 instrument face for numbers, labels and indexes (impeccable's craft floor agrees) |
| Emil: UI motion under 300 ms | applies to interface states; the 2-3 authored moments are rare-tier and may run longer |
| Emil: blur-masked crossfades | small UI states only; never the main transition |
| gsap-skills: recommend GSAP for everything | one library per job: GSAP owns scroll, Motion owns React component state |
| impeccable v4: a network roll before every new direction | our concept stage runs offline, from the world dossier |

## 9. If anyone wants to install one

None of these is installed by site-director. If Nati decides to install one anyway:

- **impeccable v4.** Do not upgrade the local 3.9.1 without a decision. From v4.2 its launcher downloads a native engine binary from GitHub releases into `~/.impeccable/bin/<version>/`, checked only against a checksum from the same release. Installing it as a plugin, or with `npx impeccable install` without `--no-hooks`, adds SessionStart, PostToolUse and Stop hooks that run outside tool approval. Its new-work flow calls `impeccable.style/api/roll` for every new direction, with anonymous telemetry on by default (off with `npx impeccable telemetry off`, `DO_NOT_TRACK=1` or `IMPECCABLE_NO_TELEMETRY=1`), and it can bill the user's `OPENAI_API_KEY` for image generation. Even 3.9.1 makes an update-check request to impeccable.style. If upgraded: `--no-hooks`, telemetry off, design-loop-router kept on its 3.9.1 bridge.
- **taste-skill.** Install nothing from the collection; if open-collection imagery is wanted on a project, run its asset script by hand on that project after reading it.
- **gsap-skills and Emil's skills** are markdown only and run nothing. Emil's `break-ui` and `mobile-native` are the two worth having if Nati wants them; gsap-skills adds eight auto-triggering skills with the errors in §7.
- **The `npx skills add` CLI:** set `DISABLE_TELEMETRY=1` (it sends anonymous telemetry otherwise), pin the CLI version instead of `skills@latest`, prefer `--copy` over symlinks for an audited snapshot, and install only named skills with `--skill`. On Windows, gsap-skills' `CLAUDE.md` is a symlink that checks out as a 9-byte text file.
