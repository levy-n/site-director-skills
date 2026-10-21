# The moves library

Read this while writing the scroll score (to pick a move for each beat) and while building (to find the recipe). A move is a named, reusable mechanism. A **signature move** is a move bound to a sentence only this client could say. The library exists so you choose deliberately, never twice on one page, and so the same mechanism is not reinvented with a new bug each time. liavmatzri.co.il works the same way: its author keeps a private library and tags each section's move with an ID.

Working recipes for the moves marked ✓ are in `moves-recipes.md` and run together in `assets/demo/moves-gallery.html`.

## Contents
1. How to choose a move
2. E: entrances (one watched entrance per section)
3. H: holds (sticky stages and pins)
4. V: velocity and loops
5. C: cursor and touch
6. T: transitions and theme
7. M: media
8. D: delight
9. N: native CSS (no library)
10. Ink, cursor and page-mask effects (code in site-director)
11. Combinations that fail

Columns: **says** = the meaning the move can carry · **mobile** = what it becomes on touch · **RM** = its last frame under reduced motion · **cost** = runtime/bundle weight · **cliché** = how often it appears without a reason (high = use only with a sentence that needs it).

---

## 1. How to choose a move

1. Start from the beat's sentence, not from the move list. Ask "what would this sentence look like if it happened?" ("months became days" → a long road that shrinks).
2. Pick the move whose **says** column matches. If none matches, invent one, give it a new ID, and add it here after the project.
3. Check the pacing rules (scroll-score.md §3): no repeats on the page, no two holds touching.
4. Write its mobile and RM versions in the score before building it.
5. High-cliché moves are allowed when the sentence needs them. Write the reason in the score.

## 2. E: entrances (a section's one watched entrance)

Routine entrances (cards, paragraphs, grid images) are not moves: they use the engine's `reveal()` (start `'top bottom+=600'`, ≤ 0.35 s, ≤ 18 px), so they are over before anyone sees them and nothing is still moving under the visitor's thumb. The E-moves below are a section's one signature entrance, meant to be watched: it starts inside the viewport (`'top 80%'` unless the move says otherwise), on a heading, a mask or an image rather than the block being read, with the duration given per move (typically 0.35-0.9 s; E-05 counts for 1.2-1.6 s). The content is visible by default in the HTML; JavaScript hides it just before animating (never the other way round).

| ID | Move | Says | Mechanics | Mobile | RM | Cost | Cliché |
|---|---|---|---|---|---|---|---|
| E-01 ✓ | Masked line rise | "this line is important; read it in order" | split into lines after fonts load; each line rises from `yPercent: 110` inside an overflow mask, stagger 0.08-0.1. Not on the LCP element (usually the hero H1): masked text has no paint until it rises, which delays LCP by the whole animation. Use it on secondary headings, or behind a preloader that already covers the first paint | same | lines in place | low (SplitText) | med when on every heading |
| E-02 ✓ | Clip reveal with inner settle | "here is the real thing" (a portrait, a product, a place) | `clip-path: inset(100% 0 0 0)` → `inset(0)` while the image scales 1.15 → 1; trigger at the image's centre, not its top, for tall images | same | image visible | low | low |
| E-03 ✓ | Marker / underline draw | "this phrase is the point" (one per page section at most) | a pseudo-element's `scaleX` driven by a CSS variable `--u` 0 → 1 | same | marker drawn | tiny | med (single-word accent is a known tell; one per page earns it) |
| E-04 ✓ | Word ink-fill (scrubbed) | "read this slowly; it matters" | words start at 30-40 % opacity and fill to ink one by one with scroll | same, shorter range | all words ink | low | low |
| E-05 ✓ | Count to a real number | "this number is earned" | the real number is printed in the HTML; JS sets 0 and counts up when visible (1.2-1.6 s, ease out) | same | the real number | tiny | high if numbers are round or unsourced |
| E-06 | Reading-direction stagger | "a list you can scan" | rows enter from the reading side (right in RTL), 30-60 ms stagger | same | rows in place | tiny | low |
| E-07 | Motif pop | "the brand's alphabet is here" | a brand shape scales in from 0.6 with a slight rotation and an overshoot ease (`back.out(1.7)`); decorative actors only, never controls | same | shape in place | tiny | low |
| E-08 | Preloader that teaches | "this studio has its own language" | the motif's members appear one by one, then a curtain lifts; only when there is a real motif and real loading to cover; under 1.8 s | same, shorter | skipped | low | high as a % counter or spinner |
| E-09 | Type swell (scrubbed font axes) | "it grows, opens up or gets heavier" (the transformation as type) | a variable face's `wdth`/`wght` scrubbed with scroll on one display line, never a paragraph. Layout-class cost: the text re-lays out every frame (in the build that found this, it was the largest single cost on phones). Cap the axis travel so the block keeps its line count at 320, 390 and 1440 px (measure, don't guess); preload one variable file subset to the page's characters; measure its fallback at the instance painted first (foundations.md §3.3) | a compositor `scale` on the line, or 3-4 stepped instances switched at thresholds | the end instance | high (layout every frame) | low |

## 3. H: holds (the scene stays, its contents change)

Build holds as **CSS sticky stages**: a tall wrapper (its height sets the scroll distance) holding a `position: sticky; top: 0; height: 100svh` stage, with ScrollTrigger (or `animation-timeline`) only reading progress. Measured on 2026-10-04: GSAP's default pin (`position: fixed`) emits layout shifts at every pin start and end (CLS 1.0-3.4 on a two-pin test page; ~2.0 per pin on the reference site), while sticky stages and `pinType: 'transform'` emit 0. Use `pin: true` only when sticky cannot work (an ancestor with `overflow: hidden` you cannot change, or pin reparenting), and then try `pinType: 'transform'` and measure.

| ID | Move | Says | Mechanics | Mobile | RM | Cost | Cliché |
|---|---|---|---|---|---|---|---|
| H-01 ✓ | Text-swap stage | "three truths, one at a time" | 2-4 sentences swap on a held stage; each brings its own image and its own motif; a progress index "01 / 03" (here the numbers ARE a sequence) | same | all sentences stacked | low | low |
| H-02 ✓ | Horizontal track | "walk along the shelf / meet them one by one" | the track translates sideways with scroll; scroll distance = track overflow; the centred card scales up and plays, the others dim | cards fill ~85 % width, or becomes a vertical stack | a grid | med (video) | high as "pinned horizontal gallery" with no reason |
| H-03 ✓ | Frame sequence | "time passes / a transformation you control" | an image sequence drawn on a canvas, one frame per 12-18 px of scroll; captions land at a fixed % of each scene; Ken Burns hold between scenes | portrait frames, 10-13 px per frame | the poster frame + all captions | high (frames: tiered loading) | low (expensive to fake) |
| H-04 | Timeline argument | "it used to take long; now it doesn't" | a word is struck through while a dot crawls a long track; the track shrinks; the new word fills; one pulse on arrival | same, track shrinks less | struck word + short track + filled word | low | low |
| H-05 | Conversation | "you talk to a person, and they answer" | messages appear with scroll; a typing indicator before each reply; the list scrolls so the newest message sits at the bottom; label it as an illustration | same, shorter | the whole chat visible | low | low |
| H-06 | Travelling headline | "this takes time to get to" | one headline line several screens wide crosses the stage and stops when its last words reach the margin; flyers at different depths; skew from velocity | two lines open apart (H-10) | the headline wrapped normally | med | low |
| H-07 ✓ | Rolling step counter | "a finite process; you always know where you are" | a sticky number rolls like an odometer to the active step; the active step is computed from position on every update (never from enter/leave events, which skip on fast scrolls); a line fills | counter sits in a sticky bar under the header | all steps listed | low | low |
| H-08 | Stacking cards | "layers / chapters piling up" | each card sticks a little lower than the previous and the earlier ones scale down slightly | same | normal list | low | **high** (2024-26 default); needs a sentence about layering |
| H-09 | Zoom-through | "step inside" | a frame (a window, a screen, a door) scales until its contents become the next section | same | the next section | med | med |
| H-10 | Split open | "the answer is between the words" | two halves of a sentence start together and part to reveal media between them (clip-path inset 50 % → 0, media scale 1.3 → 1) | ideal on mobile | sentence above media | low | low |
| H-11 | Object turn | "look at it from every side" | a product or object rotates with scroll (frame sequence or 3D) | sequence | front view | high | low |
| H-12 | Path draw | "the route / the journey" | an SVG path draws with scroll (`stroke-dashoffset`), markers light up as it passes them | same | the full path | low | med |

## 4. V: velocity and loops

| ID | Move | Says | Mechanics | Mobile | RM | Cost | Cliché |
|---|---|---|---|---|---|---|---|
| V-01 ✓ | Velocity marquee | "there is a lot of it" (work, praise, clients) | a loop at a slow base speed (about 90 px/s); scroll velocity multiplies speed (×3 desktop, ×7 touch) and skews it (±6°); decays every frame; never changes position; paused offscreen | stronger multiplier | paused, first items visible | low | **high** as decoration; fine as a "volume" sentence |
| V-02 ✓ | Velocity skew | "momentum" | large type or a row skews by scroll velocity (clamped ±6-8°), easing back to 0 | lighter | no skew | tiny | low |
| V-03 | Ambient float | "alive at rest" | motif members float slowly (sine, 3-5 s); paused when offscreen and under RM | same | still | tiny | high when everything floats |

## 5. C: cursor and touch (fine pointers only)

Gate every cursor move with `matchMedia('(hover: hover) and (pointer: fine)')` and give touch a scroll-driven equivalent in the score. C-07 (canvas cursor accent) and C-08 (footer ink lens) have ready code: §10.

| ID | Move | Says | Mechanics | Touch replacement | Cliché |
|---|---|---|---|---|---|
| C-01 ✓ | Follow preview with tilt | "look at the real thing while you choose" | a preview follows the pointer (quickTo 0.6 s), tilts with pointer velocity (±10° z, ±18° y, decaying), reveals with clip-path, plays the item's recording after a 380 ms dwell | sticky preview above the list; the row crossing ~74 % of the screen is active | med |
| C-02 | Magnetic action | "this is the one button" | the button pulls toward the pointer by 0.3 × the offset inside a slightly larger zone; returns on leave | none needed | **high** on every button; use on one |
| C-03 | Depth parallax | "a space with depth" | layers move opposite to the pointer by their depth (10-40 px) | scroll parallax by depth | med |
| C-04 | Follower cursor | "precision / play" | a small dot follows with lag (0.2 lerp) and grows over targets; native cursor kept | none | **high** (dot+ring kit); only if the brand is about precision or play |
| C-05 | Physics toys | "a person made this for fun" | motif members fall with gravity, collide, and can be dragged and thrown; the loop sleeps when still | drag works on touch | low (expensive to fake) |
| C-06 | Row reveal | "a list with depth" | hovering a row expands it to show media and detail | tap to expand | low |

## 6. T: transitions and theme

| ID | Move | Says | Mechanics | Cliché |
|---|---|---|---|---|
| T-01 ✓ | Theme flip by section | "a new chapter" | sections declare `data-theme`; only the fixed background layers crossfade (opacity) when a section's box crosses the middle of the screen; text colour switches instantly ~200 ms into the ~350 ms fade, never through a colour transition on `html` or `body` (moves-recipes.md T-01 has the measurement) | low (1-3 per page) |
| T-02 | Footer revealed behind the page | "the end is a place" | the footer is fixed behind the page; `body` gets `padding-bottom` equal to the footer height (margin collapses and breaks smooth-scroll measurement) | med |
| T-03 | Lightbox from the card | "open this one" | the media grows from its card's rect to full screen (FLIP); scroll locked (Lenis stopped); focus trapped; Escape closes; focus returns to the card | low |
| T-04 | Page transition | "you stayed in the same world" | View Transitions API between routes (same-document in SPAs, `@view-transition` across documents), a shared element morphs; plain navigation as fallback | med |
| T-05 | Active-section pill | "you are here" | a pill slides under the nav link of the section crossing the middle of the screen | med |

T-06 (ink mask transition) and T-07 (geometric page mask, a specific T-04) have ready code: §10.

## 7. M: media

| ID | Move | Rule |
|---|---|---|
| M-01 | Play in view | a `<video>` gets its `src` only when it should play, shows only after the `playing` event fires (the poster sits underneath until then), pauses when it leaves the viewport; muted, `playsinline` |
| M-02 | Device frames | screen recordings inside a laptop or phone frame; the poster is the recording's first frame so the switch is invisible |
| M-03 | Scroll-scrubbed video | only with every-frame-a-keyframe encoding; prefer an image sequence (H-03) on iOS, where seeking is coarse |
| M-04 | Ken Burns hold | during a hold, a slow 1 → 1.05 zoom so a stop never feels frozen |

## 8. D: delight (small, earned)

| ID | Move | Rule |
|---|---|---|
| D-01 | Success burst | on a successful form send, 12-20 motif members burst from the button and fall; the message says what happens next |
| D-02 | Occasional twinkle | one motif member flares every few seconds near a section title; paused offscreen |
| D-03 | Easter egg | one hidden interaction that rewards curiosity (drag the logo apart, a long-press); never required for content |

## 9. N: native CSS (no library)

Use these for quiet and alive intensities, and as progressive enhancement. Scroll-driven animations run off the main thread where supported; check current support in motion-engine.md and wrap them in `@supports (animation-timeline: view())`.

| ID | Move | Mechanics |
|---|---|---|
| N-01 ✓ | View reveal | `animation: rise linear both; animation-timeline: view(); animation-range: entry 0% cover 30%` |
| N-02 | Sticky chapter titles | `position: sticky` titles that hand over to the next title |
| N-03 | Snap gallery | `scroll-snap-type: x mandatory` for a swipeable strip on touch |

## 10. Ink, cursor and page-mask effects (code in site-director)

These four moves ship as code in site-director, written on this skill's motion engine. The JS moves (T-06, C-07, C-08) join the one clock (`gsap.ticker`) through `engine.onFrame` only while something moves, and register their cleanup with the engine; T-07 is the browser's View Transitions, animated by CSS, and needs no frame job. `<skills>` is the skills root (SKILL.md Tools); how to copy the files into a project is in `<skills>/site-director/assets/motion/README.md`. Each one used counts toward the 2-3 standout-moment budget (scroll-score.md §5), and each one past the budget gets its own decision-log row with a reason. Under the strict reduced-motion rule for client sites every one of them shows its final state or is off.

| ID | Move | Says | Mechanics | Mobile | RM | Cost | Cliché | Code |
|---|---|---|---|---|---|---|---|---|
| T-06 | Ink mask transition | "the sketch becomes the real thing" (a plan becomes built, a drawing becomes the finished work) | scroll-scrubbed reveal from a sketch image to the finished image through an SVG-internal mask: the finished image is an `<image mask="url(#id)">` in the same inline SVG (never CSS `mask-image: url(#id)` on HTML, which fails in Safari; never over `<video>`). Directions `rtl` (Hebrew default), `ltr`, `down`, `center`. The rough edge (feTurbulence, feDisplacementMap at scale 100, blur, an alpha step; values credited to Bearplus/Codrops) is filtered only in a band around the moving edge, the band hides at 0 and 1, and only the mask geometry animates, never filter attributes | baked tier: a pre-roughened edge with no filter (also for Safari when chosen: full-screen SVG filters slow its scrolling) | instant swap to the finished image with hysteresis (shown below 35% of the trigger, hidden above 65%); no wipe, no crossfade | paint; the live filter is CPU heavy, so the band stays narrow | low; slop-scan's second-order `grain-overlay` and `liquid-glass` signals fire on its filter: waive each with `slop-ok:<rule> decision:D<n> <why>` next to the filter | `<skills>/site-director/assets/motion/ink-mask.js` (`initInkMask`) |
| C-07 | Canvas cursor accent | "precision: the visitor holds the client's instrument"; only when a dossier item justifies it | a 9 px square dot on one small 2D canvas, following with lerp 0.18 made frame-rate independent by `engine.damp`; a short trail only while the smoothed speed (EMA 0.2) is above 1.5; joins the clock on pointermove, leaves it within 0.1 px of the target. Gated on `(hover: hover) and (pointer: fine)` and `pointerType === 'mouse'`; hides on Tab and on touch; DPR capped at 2; dirty-rect clearing; canvas `aria-hidden` with `pointer-events: none`; never `cursor: none` (the native cursor stays) | none (touch has no cursor); if its meaning matters, the score gives it a scroll-driven move | off; also off under `forced-colors: active` | low (one small canvas that sleeps when settled) | **high** (the custom cursor is part of the kit, C-04): needs a dossier item and counts toward the budget | `<skills>/site-director/assets/motion/ink-cursor.js` (`initInkCursor`) |
| C-08 | Footer ink lens | "look closer: there is more here" (the end of the page as a place, the client's mark under the ink) | in the footer, an SVG-internal circular mask follows the pointer (lerp 0.09) with a pulse layer (lerp 0.15, radius x1.05, opacity 0.2); grows in 0.55 s, shrinks in 0.8 s; maps the pointer with `getScreenCTM` on every tick (smooth scrolling moves the footer under a still pointer); a static logo layer is always visible, so nothing exists only on hover; sleeps when settled | the static layer only | no follow; the static layer | low to medium (paint, one masked layer, only while the pointer moves) | med (cursor glows and spotlights are a known tell, resource-atlas.md §6): what the lens reveals must come from the client's world | `<skills>/site-director/assets/motion/ink-lens.js` (`initInkLens`) |
| T-07 | Geometric page mask | "you stayed in the same world; the next page is drawn over this one" | a View Transition between pages: old and new overlap and the new page is revealed by a diagonal `clip-path` edge travelling right to left on forward navigation, mirrored on back, 0.8 s; no blend modes; `::view-transition` gets `pointer-events: none`; the header stays anchored. Astro: ClientRouter with the CSS on `::view-transition-old/new(root)`. Next: React's `<ViewTransition>` in each page, keyed by Link transition types. Same-document support: Chrome 111, Safari 18, Firefox 144; elsewhere plain navigation (Next may use the GSAP curtain fallback, `<skills>/site-director/assets/next/curtain.ts` with `TransitionLink.tsx`, never on the same navigation as the wipe) | same | off: instant navigation, by the file's own reduced-motion rule | low to medium (paint on two full-page snapshots, 0.8 s per navigation) | med (copied curtain wipes are a tell, resource-atlas.md §8): the edge's geometry needs a meaning; counts toward the budget | `<skills>/site-director/assets/astro/page-transition.css` (Astro); `<skills>/site-director/assets/next/PageTransition.tsx` with `<skills>/site-director/assets/next/page-transition.css` (Next) |

## 11. Combinations that fail

- The same move on consecutive sections (two horizontal tracks, two text swaps).
- Two holds touching, with no free scroll between them.
- A cursor move with no touch equivalent in the score.
- A marquee, a stacking-card stack, a magnetic button and a follower cursor on one small-business page: that is the kit (reflexes.md §4), not a concept.
- Two cursors (C-04 and C-07), or an ink filter (T-06) stretched over a full-screen band or a video.
- A frame sequence without real footage of the subject: stock footage turns the most expensive move into the most generic one.
- Scroll-jacking: anything that changes how far one wheel tick scrolls, outside a hold the visitor can see the end of.
