# The scroll score: narrative architecture for a page you scroll through

Read this after the concept is chosen and before building any section. The output is `design/SCROLL-SCORE.md` (template in `assets/templates/SCROLL-SCORE.template.md`): one table that says, for every stretch of the page, what the visitor reads, what moves, what it means, and what happens on a phone and under reduced motion.

**Under site-director the score lives in `design/storyboard.rtl.md`.** Its beats table carries every column of §5, so it IS the score: write and check the beats there, and don't write SCROLL-SCORE.md. Its chapters table sits above the beats (§1, §5). Everything in this file applies to those beats.

Why a score: the generic page is a stack of components with the same fade on each. A scored page has acts, rhythm, peaks and rests, like a short film. None of the popular design skills cover pacing, surprise cadence or pin budgets; this file does.

## Contents
1. Units and vocabulary
2. Length and intensity budgets
3. Pacing rules
4. Narrative shapes
5. Writing the score
6. Handoffs between sections
7. Mobile re-choreography
8. Reduced motion: the last frame is the argument
9. ASCII notation for previews
10. How the score is verified

---

## 1. Units and vocabulary

- **vp (viewport):** one screen height of scrolling. Measure the page in vp, never in "sections". At 1440×900, 1 vp = 900 px.
- **Beat:** one idea the visitor takes away (usually one section, sometimes two beats in one section).
- **Act:** a group of beats with one job (promise, proof, story, method, ask). Act breaks are where the theme may flip.
- **Chapter** (site-director's storyboard): the act, named by a verb in the order things happen for the client (measure, bake, deliver), 3-5 per page; the hero row is not counted. Chapters sit above beats: every beat belongs to one chapter, chapter seams are the act breaks, and each chapter has one focus, one motion moment and one proof, plus the state of the persistent object (the one thing from the client's world that stays on screen and changes state along the scroll).
- **Hold:** a stretch where the page keeps scrolling but a scene stays in place (CSS sticky stage or a pin) while its contents change with scroll. Holds are where signature moments usually live.
- **Move:** a named mechanism (moves.md). A **signature move** is a move performing a sentence only this client could say.
- **Peak / rest:** high-intensity beats and quiet beats. Rests make peaks visible.
- **Dead zone:** 3 or more vp where nothing on screen changes and nothing is held. Motion-audit reports them.

## 2. Length and intensity budgets

The intake sets the intensity. These budgets are starting points; the content decides the final length.

| Intensity | Length (desktop) | Held share of scroll | Holds | Signature moments | Theme flips | Typical engine |
|---|---|---|---|---|---|---|
| Quiet / editorial | 6-8 vp | 0 % | 0 | 1 (often typographic) | 0 | CSS + one precise interaction |
| Alive | 6-10 vp | ≤ 15 % | 0-1 | 1-2 | 0-1 | CSS scroll-driven first, light GSAP |
| Orchestrated | 10-16 vp | 20-35 % | 2-3 (3 needs ≥ 15 vp) | 3 | 1-2 | GSAP ScrollTrigger + Lenis, sticky stages |
| Cinematic | 20-35 vp | 35-50 % | 4-6 (6 needs ≥ 30 vp) | 5+ | 2-4 | the above + image sequence or video |

The top of each hold range needs the top of its length range: §3 rule 3 caps holds at one per 5 vp. Reference point: liavmatzri.co.il is cinematic: 33 vp, 45 % held, 5 holds, about 10 distinct moves, 3 flips. Most small-business sites are orchestrated at most.

## 3. Pacing rules

These come from the reference's measured rhythm and from resolving the conflicts between existing skills (one says "pin at most 1-2 sections", the reference pins 5 and works). The resolution: budget holds by scroll length and vary the mechanic.

1. **A new distinct move every 1.5-3 vp.** Distinct means a different mechanism or a different element, not the same fade on the next block.
2. **No dead zone of 3 vp or more.** A long text stretch still gets one living element (a line that draws, a number that rolls, a motif that turns).
3. **Holds ≤ floor(page length in vp / 5), and never two holds touching.** Leave at least 1 vp of free scroll between holds so the visitor feels in control again. A 12 vp page holds at most 2 scenes, a 33 vp page at most 6.
4. **Each hold uses a different mechanic.** Horizontal track, frame sequence, text swap, chat timeline, travelling headline: never the same twice on one page.
5. **The first peak lands in the first 2 vp.** The hero proves the page is alive (an entrance, a reveal, a motif) without a preloader if possible.
6. **The biggest peak sits around 40-60 % of the page**, on the emotional core of the story (the "why now", the transformation, the proof that hurts competitors most).
7. **Rest after every peak.** One calm beat: a short paragraph, one reveal, generous space.
8. **End on a small delight, not a big effect.** A success state in the brand's motif, a footer that plays: the visitor leaves smiling.
9. **Theme flips only at act breaks.** One to three per page, each one a chapter marker.
10. **Hold length follows content, not taste.** Horizontal track: scroll distance ≈ the track's overflow width. Text swap: 60-80 % vp per sentence. Image sequence: frames × 12-18 px per frame on desktop, 10-13 on phones, plus 400-600 px holds between scenes. Chat timeline: ~250-300 px per message.
11. **Scrub smoothing 0.3-0.8.** Lower feels tighter and more mechanical; higher feels floaty. Use `scrub: true` (no smoothing) only for direct-manipulation scenes such as frame sequences, where Lenis already smooths the input.
12. **Spend scroll on emotion.** The reference gives ~29 % of its length to its "why now" story and ~3 % to the bio. Facts can be dense; feelings need distance.

### Pacing arithmetic

- **Beat weight:** each beat gets 0.7-1.8 vp of scroll (the "scroll weight" of a beat ledger); facts sit at the low end, emotional beats at the high end.
- **Held scene:** about 1.15 vp of dwell (the scene changes while held) plus 0.85 vp of move (the crossing to the next state) per scene, so one scene per ~2 vp of runway. A hold where nothing changes for part of its runway is dead scroll.
- **Choreography inside a beat:** media first, then headline lines, then supporting copy, then the action. Parallax layers: background slower, foreground slightly faster, text stable.
- **Two motion classes, never both on one trigger:** *scrubbed* (driven by the visitor's scroll: `ease: 'none'`, no duration, quality from `scrub` 0.3-0.8 (rule 11) and smooth scrolling) and *triggered* (the page speaking: eased, with a duration). Mixing them on one trigger makes motion that neither follows the thumb nor finishes on its own.
- **State is derived from scroll position, never accumulated.** Don't store "current scene" or sum wheel deltas; compute it from positions on every update, so scrollbar drags, Home/End, anchor jumps, refreshes and back-forward cache restores all land on the right state.

## 4. Narrative shapes

Pick the shape the concept implies. These are different structures, not templates; mixing them is fine.

A useful default for persuasion-led sites is the **beat ledger**: 5-7 beats, *hook → old way → new rule → mechanism → proof → payoff → action*, each with one motion verb, one piece of evidence (an exact fact or asset), and its scroll weight. One motion grammar per page (glide, orbit, crane, lateral track, dive, staged reveal), one renderer mode per page (DOM, video/sequence, or WebGL), and three named clichés the page refuses.

| Shape | Order | When it fits |
|---|---|---|
| **Proof first** | promise → real people/work → the story → method → ask | the client's best asset is proof (reviews, work, results); skeptical audiences |
| **Single transformation** | the whole page is one long take: the state at the top becomes the opposite state at the bottom (day → night, raw → finished) | a concept from lane C; a process business (making, restoring, converting) |
| **Walk-through** | the scroll is a path through a place: the studio, the kitchen, the workshop, the treatment room | a physical place people visit; strong photography |
| **Question → answer** | each act opens with a question the visitor has, and the motion answers it | services people misunderstand (legal, financial, technical) |
| **Collection** | the page is a curated shelf of objects, each with its story; scroll moves along the shelf | makers, shops, portfolios |

## 5. Writing the score

One row per beat. Every column is required; empty cells are where generic pages come from.

| vp | act | beat (the sentence the visitor takes away) | theme | hold | move (ID from moves.md) | what the visitor does | reduced-motion last frame | mobile |
|---|---|---|---|---|---|---|---|---|
| 0-1 | I promise | "…" | light | - | P-03 masked line rise + motif enters | reads | headline and motif visible | same, shorter |
| 1-3 | II proof | "…" | flips dark | 1.6 vp | H-02 horizontal track of real faces | scrolls sideways, taps to play | grid of the same cards | vertical stack, tap to play |

Under the table, list: the signature moments (each tied to a beat), total vp, held share, number of distinct moves, the peak and rest pattern, and the theme map. Check the totals against §2 and §3 before building.

Under site-director, write the chapters table first (verb, what the client feels, object state, motion moment, copy, proof, focus, dossier items), then the beats table with a chapter column in place of act. Each chapter's motion moment is one of its beats' moves, and the persistent object is the traveller across every seam (§6). The signature moments count against the 2-3 standout-moment budget, together with the hero interaction, page transitions, a logo ident and a contact companion; each one past the budget needs its own row in the decision log.

## 6. Handoffs between sections

The seams are where pages feel cheap or expensive. Plan each seam, don't let each section end and the next begin.

- **Theme flip at the centre line:** the new section's theme takes over when its top crosses the middle of the screen, not when it enters.
- **A traveller:** an element carries across the seam (the motif, a line, a product) so the eye has something to follow.
- **Exit and entry share a direction:** what leaves upward is replaced by what arrives from below; what slides out to the reading direction is followed by what slides in from it (mirrored for RTL).
- **Overlap, not gap:** start the next section's entrance while the previous hold releases, so there is never a blank screen. The reference's travelling headline starts with its first words already peeking in at 30 % of the screen "so the section never opens on a blank screen".
- **Two kinds of entrance.** Routine entrances (cards, paragraphs, grid images) start about 600 px before the block enters the viewport (`start: 'top bottom+=600'`, the engine's `reveal()`), last ≤ 0.35 s and travel ≤ 18 px, so they are finished before anyone sees them; their job is that nothing ever looks unfinished. MediaWave measured 18 of 21 phone scroll steps catching a block mid-entrance when entrances fired at the viewport edge, and 0 after. A section's signature entrance is the one meant to be watched: one per section at most, starting inside the viewport (`'top 80%'`), on a heading or a mask rather than the block being read. Anything larger is scrubbed, so its state follows the scroll position.

## 7. Mobile re-choreography

For every hold and every cursor-driven move, decide one of: **keep**, **shorten**, **replace**, **remove**, and write the replacement in the score's mobile column. Don't shrink the desktop scene.

- Cursor moves (follow previews, magnetic buttons, mouse parallax) don't exist on touch; replace them with a scroll-driven equivalent (the reference turns its cursor-following preview into a sticky laptop that plays whichever row crosses 74 % of the screen).
- Wide scenes become tall: a horizontal headline becomes two lines that open apart; a sideways track can stay sideways only if each card fills most of the screen.
- Shorter distances: phones flick fast; holds shrink about 25 % and frame steps drop (18 → 13 px per frame).
- Sticky stages start under the header, not at the top edge.
- Keep touch scrolling native (Lenis `syncTouch: false`); never trap the finger.

## 8. Reduced motion: the last frame is the argument

Design every move so its final frame states the beat as a still image: the struck word stays struck, the filled marker stays filled, the chat shows all messages, the counters print their real numbers in the HTML. Under `prefers-reduced-motion: reduce`:

- no smooth scrolling library, no scrub, no holds: the page flows normally;
- every beat renders its last frame; nothing waits for a trigger;
- nothing moves on its own (marquees and floats pause);
- state changes (theme, colour) are instant; nothing animates.

On client sites reduced motion is strict (Nati's ruling): no entrances (the content is simply there), instant theme flips, no fades, no cursor or pointer effects, and every moment shows its last frame. Focus rings, progress indicators and anything essential stay. A softer tier (short fades of 200 ms or less, without displacement) exists only on MediaWave's own site, mediawave.co.il (its CALM tier, recorded in its decision log); client sites never use it.

Write the last frame in the score's reduced-motion column. If you can't describe it, the beat depends on motion to make sense; redesign it. Hidden chapters inside a hold are `visibility: hidden` plus `inert` until they show (not just opacity 0), and only committed scene changes are announced, in one polite live region.

## 9. ASCII notation for previews

For intake previews and quick sketches (fits a 40-column monospace box):

```
SCORE  ~12 screens (desktop)
[==][**][##][##][==][**]
[==][##][##][==][**][>>]
## held scene   ** signature
== free scroll  >> the ask
```

One cell ≈ 1 vp. Add a line for theme flips (`flips: 2 (dark at 2, white at 9)`) and one for the engine.

## 10. How the score is verified

Motion-audit measures what the score promises: held ranges and held share, theme switches, distinct motion kinds, fade share (monotony), dead zones, and whether anything stays invisible mid-screen. Scroll-film shows the beats frame by frame on desktop and mobile. After the first full build, compare the measured holds and flips with the score's table and fix whichever is wrong: the page or the score.
