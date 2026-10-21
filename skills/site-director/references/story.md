# Story: chapters instead of a feature list (P3)

Read this when writing the storyboard (`design/storyboard.rtl.md`), choosing or building the persistent object, deciding what proves each chapter, and designing or building the hero interaction. The storyboard's beats table follows pattern-breaker's scroll score rules; this file covers what pattern-breaker does not: verb chapters, the persistent object, proof per chapter and the hero from the work.

`<skill>` is this skill's folder and `<skills>` is the skills root, as SKILL.md defines them.

## Contents
1. Chapters named by verbs
2. Four illustrations (not facts)
3. The persistent object
4. One focus, one motion, one proof per chapter
5. Honest proof
6. Features only as proof
7. The hero interaction from the work
8. Gesture physics for drag heroes
9. Polishing small transitions
10. Linking chapters to the built site

---

## 1. Chapters named by verbs

- **3-5 chapters, each named by a verb, in the order things happen for the client:** what they do and what the business does for them, from first contact to the result. Heron's homepage follows its product's real workflow, Observe, Advise, Act, Learn, instead of a feature list.
- **The verb test.** A chapter that cannot be named by a verb from the work is a feature list in disguise. "About", "services" and "testimonials" are not chapters.
- **IDs:** a lowercase ASCII slug of the English verb (`measure`, `bake`, `deliver`); the Hebrew verb is the visible label. The hero row has the id `hero` and is not counted as a chapter.
- **What the client feels** comes from world question 5 (the fear before contacting): each chapter moves the client from one part of that fear to relief.
- **The beats table** carries every column of pattern-breaker's scroll score, and its budgets and pacing are pattern-breaker's (`<skills>/pattern-breaker/references/scroll-score.md` §2-§3, with §7 for mobile and §8 for reduced motion). A chapter is usually one or two beats.
- **The hero** opens with the most characteristic thing in the client's world and carries the hero interaction (§7).

## 2. Four illustrations (not facts)

These show the shape of a storyboard for four trades. They describe no real client: every object, word, number and working method must come from the real client's dossier and be checked with the client. Accent and grid examples are illustrations too.

| Trade | Dossier items (examples) | Chapters (id: Hebrew) | Persistent object and its states | Hero interaction | Proof per chapter (honest forms) |
|---|---|---|---|---|---|
| Confectionery | flour sacks, order slips, oven timer | `order`: מזמינים, `bake`: אופים, `decorate`: מקשטים, `collect`: אוספים | the order slip: filled in (date, inscription), clipped next to the running oven timer, its inscription copied onto the cake, stamped and handed over | the visitor types the cake's inscription and each letter appears piped on the cake top (a text field: keyboard and touch are native) | the real slip with customer details covered; the real baking schedule `[לבירור]`; the client's photos of real cakes; a named review with its source |
| Plumber | pipe schematics, pressure gauges, work certificates | `call`: מתקשרים, `measure`: מודדים, `repair`: מתקנים, `certify`: מאשרים | the pressure gauge: needle falling (a leak), a reading taken, steady again, the reading written on the certificate | the visitor traces a line on a home's pipe schematic; where the pressure drops, the fault marks appear (use the method this plumber really uses to find leaks) | a gauge photo from a real job, or a reading labelled "הדגמה"; before and after photos; a real certificate with private details covered |
| Law office | document margins, stamps, clause numbering | `listen`: שומעים, `read`: קוראים, `draft`: מנסחים, `sign`: חותמים | one document page: blank, margin notes, numbered clauses, stamped and signed | the visitor drags a highlighter over a dense clause and its plain-Hebrew meaning appears in the margin (keyboard: Tab to a clause, Enter shows its note) | a real clause rewritten in plain Hebrew, labelled "הדגמה"; the office's real practice areas; no results or numbers unless the client supplies them and the rules that bind the office's advertising allow them (ask) |
| Jeep tours | topographic maps, trail marks, route log, dashboard | `choose`: בוחרים מסלול, `drive`: נוסעים, `stop`: עוצרים, `return`: חוזרים | the route on a topographic map: drawn, travelled to the first stop, stops pinned, complete with its log line | the visitor drags along the map to draw the route while the elevation profile and the dashboard numbers follow (from real map data); a "play the route" button for keyboard and touch | a real route log from a real trip (dates and distance from the client); real trip photos; named reviews |

Matching illustrations for P2: grids from the order slip's columns, the certificate's form fields, the document's margin and clause numbering (1, 1.1, 1.2 as the index in the instrument face), the map's squares and coordinates. Accents: the slip's "confirmed" stamp, the gauge's red zone, the stamp ink of a signature, the trail-mark colour of "your route". A law office usually takes pattern-breaker's quiet intensity.

## 3. The persistent object

- **One object from the dossier** stays on screen through the chapters (inside a sticky stage that spans the story) and changes state once per chapter. It is pinned in `design/BRIEF.md` before pattern-breaker's concept lab, because the lab otherwise excludes "the page acts out the client's process" as a rut.
- **Logic before wow.** The object really passes through these states in the work or in the client's experience. No recursive imagery, no name puns.
- **States map to chapters.** Write them in the storyboard header ("מצבי האובייקט") and per chapter ("מצב האובייקט"): the hero's opening state, then one state per chapter.
- **Choose the technique:**

| Technique | Choose when | Rules |
|---|---|---|
| DOM/SVG (default) | the object is shapes, lines, text and numbers, and the states are geometry or attribute changes | crisp at any size, real text, no runtime; animate transforms, opacity and SVG geometry |
| Canvas 2D | many marks move per frame (thousands of points, strokes, particles) | DPR capped at 2; driven by `engine.onFrame`, leaving the clock when settled; `aria-hidden`, with the meaning in HTML |
| Rive | a drawn object with blends or bones, or a character whose states form a state machine | route to rive-studio, with a CONTRACT.md per piece; canvas-lite has no text, so text stays HTML; a static SVG rest frame for no-JS and reduced motion; budget the wasm runtime (on mediawave.co.il, canvas-lite 2.43.1's wasm measured about 365 KB gzipped) |

- **Implementation:** one timeline with a label per chapter state, scrubbed by the story's sticky stage (pattern-breaker: holds are sticky stages, never default pins). Or discrete states switched at chapter boundaries with hysteresis, so a visitor resting on a boundary does not see flicker. Per frame, write only transforms, opacity and SVG geometry on the moving parts; measure layout only on refresh.
- **Mobile:** re-choreographed, not shrunk. A common answer is the object on top and the chapter text under it at every width; decide it per chapter in the storyboard's mobile column.
- **Reduced motion (strict on client sites):** no sticky motion, no scrub. Each chapter shows the object's state for that chapter, still, next to its text, so the page reads as a sequence of finished states. The no-JS page is the same.
- **Keyboard:** tabbing onto a chapter's link or control scrolls the stage to that chapter, so focus never sits on copy that is off stage.
- **Accessibility:** the object is `aria-hidden` when the chapter text carries the meaning. When it shows information (a reading, a date), the same information is in the HTML text.

## 4. One focus, one motion, one proof per chapter

- **Focus:** one focal point per chapter, written in the storyboard's "מוקד" column. One element wins at the resting frame.
- **Motion:** one motion moment per chapter, usually the object's state change. Write the chapter's sentence first, then the move that performs it (pattern-breaker content-voice.md §4; moves in `moves.md`). Never the same move in neighbouring chapters.
- **Proof:** one piece of proof per chapter, attached to the doubt that chapter answers (content-voice.md §3). World question 5 tells you which doubt belongs where.
- **Client-edited text:** every chapter slot the client edits in the CMS gets a length limit and an image ratio, tested with the longest realistic Hebrew and with the shortest, so the motion survives edits. Worst-case content is plausible or taken from the schema's real limit, never random (Emil Kowalski's break-ui principle).

## 5. Honest proof

- **Real only:** the client's photos, real documents with private details covered and with consent, named reviews with their source, numbers with a source and a date.
- **Never invented.** A demonstration is labelled "הדגמה" visibly on the page, not only in alt text.
- **Unknown is `[לבירור]`** in the storyboard, with a question to the client. A `[לבירור]` never ships.
- **Inherited proof** from an old site is unverified until the owner confirms it (content-voice.md §3).
- **No proof yet** (a new business): show the process honestly, how the work is done, instead of a number.

## 6. Features only as proof

- No feature grid anywhere: no three-feature-card grid, no section of icon cards listing services.
- A feature appears inside the chapter where it does its job, as evidence for that chapter's sentence. "Answers within an hour" belongs in `call`, as a real time on a real message, not in a card.
- A plain, scannable list of services, for search and for visitors who came for one service, may sit in a support section (`data-chapter="support"`). It is a list, not a grid of cards.

## 7. The hero interaction from the work

- **The visitor does what the professional does:** sweep, trace, measure, stamp, write. Its source is a dossier item of type "רגע" or "כלי", pinned in the brief, and its form is the idea Nati picked from the hero idea board. In one sentence: "the visitor <verb>s the <W item> the way the <professional> does, and sees <result>."
- **Heron's hero:** dragging across an ordinary architectural drawing surfaces guardrails, handrails and code references. The pointer-to-reveal mapping stays near 1:1, because heavy easing reads as an effect and directness reads as a tool.
- **Near 1:1:** during the gesture, write the pointer's value directly, with no easing. Smoothing belongs only after release (§8).
- **2 px drag threshold:** a press becomes a drag only after the pointer moves 2 px (Heron's value), so a click stays a click.
- **Touch:** keep vertical scrolling native with `touch-action: pan-y` on the hero surface. Claim a horizontal drag only after about 10 px of mostly horizontal travel (Apple's direction hysteresis, via Emil Kowalski). Offer a tap version as well: tap a marker, or a "next" control.
- **Keyboard (Heron's published drag code shows none):** a focusable control steps through the same states, such as a button or a slider moved with the arrow keys; the focus ring is visible; the revealed content is real HTML, and its caption has `aria-live="polite"`.
- **Pointer-only effects** around the hero (a lens, a cursor accent) are gated by `(hover: hover) and (pointer: fine)` and by `pointerType === 'mouse'` on each event. The drag itself serves mouse, pen and touch.
- **Markers over an image** under `object-fit` are placed with `<skill>/assets/motion/fit-map.js` (`mapToRendered`, `placeMarkers`), so they stay on target at 1440x900 and at 1440x700.
- **Reduced motion (strict):** the hero shows its last frame, everything revealed, with no pointer effects. Nothing important exists only behind the interaction.
- **Budget:** the hero interaction is one of the 2-3 standout moments (D8).

## 8. Gesture physics for drag heroes

Credit: Emil Kowalski's apple-design skill (MIT), which distils Apple's WWDC 2018 talk "Designing Fluid Interfaces" for the web.

1. **Grab where it was grabbed:** call `setPointerCapture` on pointerdown, keep the offset between the pointer and the element, and never snap the element's centre to the pointer.
2. **Track velocity:** keep the last ~100 ms of pointer positions with their timestamps; at release, velocity = distance / time over that window.
3. **Hand the velocity over:** the settle starts at the release velocity, so there is no seam between dragging and settling.
4. **Project the momentum** when the hero has snap targets (a slider between states): `projected = current + (v / 1000) * 0.998 / (1 - 0.998)`, then snap to the target nearest the projected point (0.99 instead of 0.998 feels snappier). A free reveal stays exactly where the pointer left it.
5. **Rubber-band past the bounds:** `offset = (overshoot * dim * 0.55) / (dim + 0.55 * Math.abs(overshoot))`.
6. **Interruptible:** a new grab starts from the value on screen, never from the old target.
7. **Spring values:** damping ratio 1 (no overshoot from rest) by default; about 0.8 only when the gesture itself carried momentum (a flick). Response 0.3-0.4 s.

On this skill's stack, the settle runs on the one clock (`engine.onFrame`, gsap ticker time: `deltaTime` is in milliseconds), never in its own `requestAnimationFrame` loop, and it leaves the clock when settled:

```js
// x: rendered position in px, v: velocity in px/s, render(x) writes a transform.
const response = 0.4, zeta = 1; // Apple's "move" spring: critically damped
const k = (2 * Math.PI / response) ** 2, c = 4 * Math.PI * zeta / response;
function release(releaseVelocity) {
  v = releaseVelocity;
  target = nearestSnap(x + (v / 1000) * 0.998 / (1 - 0.998)); // momentum projection
  const off = engine.onFrame((time, deltaTime) => {
    const dt = Math.min(deltaTime, 32) / 1000; // cap long frames so the spring stays stable
    v += (-k * (x - target) - c * v) * dt;
    x += v * dt;
    render(x);
    if (Math.abs(x - target) < 0.1 && Math.abs(v) < 1) { x = target; render(x); off(); }
  });
  return off; // a new grab calls off() and continues from the current x
}
```

Checked numerically: from rest it settles without overshoot in about 0.75-0.95 s at 120, 60 and 30 frames per second; a fast flick toward a near snap point can overshoot once, which is expected.

## 9. Polishing small transitions

Heron's team said the smallest state transitions, iterated hardest, are what made the site feel like a responsive tool rather than a set of big moments. The order is geometry, then highlight, then text, in sequence.

1. **Sequence each small state change:** the geometry moves first (a shape, a line, a box, a part of the object), then the highlight lands on what changed (the accent or a contrast change), then the text updates (a label, a number, a caption). Starting values to tune by eye: geometry 0-180 ms, highlight from about 120 ms for about 120 ms, text from about 200 ms. These sit in the UI motion family (100-300 ms, pattern-breaker visual-language.md §7). Exits are faster than entries.
2. **Polish in the same order across the page:** settle every geometry change first, then every highlight, then every text change.
3. **Write each one** in the storyboard's polish table ("ליטוש מעברים קטנים": moment, geometry, highlight, text).
4. **Under reduced motion,** all three happen at once, instantly.

## 10. Linking chapters to the built site

- Every `<section>` that is a direct child of `<main>` carries `data-chapter="<chapter id>"` and `data-dossier="W03 W11"` (space separated). The hero uses `data-chapter="hero"`; legal and utility sections use `data-chapter="support"`.
- The attributes are inert: no CSS or JS depends on them.
- `node <skill>/scripts/check-artifacts.mjs design --html dist` checks that every section is linked to a storyboard chapter and to real dossier items.
