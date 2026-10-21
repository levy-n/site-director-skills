# The details layer: scroll mechanics, pointer trails, surprises, two-state controls

Read at stage 2, right after the eye round, to build the details lab Nati picks from; at stage 4 to build his picks; at stage 5 to check them.

## Contents

1. Nati's rulings
2. The layers to propose on every site
3. Surprises: triggers and rules
4. The details lab
5. Performance and accessibility
6. Worked example: mediawave.co.il

## 1. Nati's rulings (19.10.2026)

- **Every site gets a details layer, proposed unasked:** a scroll experience, a pointer trail, small surprises that pop up, and controls with a second state. Award sites are not only scroll: the precision is in every layer, from the ground to the text inside a button.
- **Every unique element comes from the client's experiential world.** Each detail names its dossier item. The swap test applies to details too: if it would fit a competitor or another trade unchanged, it is out. Banned as generic: confetti, sparkles, a plain dot or ring cursor, magnetic buttons, a colour-only hover, a generic "wave hand" or emoji pop.
- **Nati picks from working examples, never from descriptions.** The lab is a page he can scroll, hover and tap.
- **Restraint above all.** Elegance and minimalism come first; an overloaded site looks unprofessional and reads as a poor imitation. The lab offers many, the site ships few: at most 1 trail, 3 surprises, 1 control style and 1 scroll mechanic per page (2 only if one is the persistent object). The default answer to "one more detail" is no. Every detail is quiet: low contrast, small, short, and it disappears.
- **Rich material, not thin lines.** Award sites rest on a living, textured material (a generative field, real imagery, renders) and bold type on a strict grid. Thin SVG line drawings on an empty ground read as a sketch, however well they move (MediaWave, 19.10.2026: the cream "wave" was rejected as "immature and weak"; the dark halftone "sea of dots" was approved). Before any build, show one hero screen in the chosen material at 390 and 1440 and get Nati's yes.
- **Open calmly.** Too much text at the start reads as a template. The first view carries the H1, one short line, one key and the persistent object; secondary links live in the menu. The opening (above) makes the visitor expect something different before any text.
- **Reduced motion: strict on client sites, full on MediaWave's own.** Many people (Nati included) have Windows animations off, so the browser reports reduced motion. Client sites default to strict (rule 6 in SKILL.md); a client may choose the CALM tier, where parts the reader drives with the scroll still follow it and only self-playing motion stops. mediawave.co.il runs full motion on every regular visit (D160, 20.10.2026): `?calm=1` for the calm tier, the accessibility widget's stop switch and `?reduce=1` to stop everything. Always offer `?motion=full` for review on a client site.
- **Every element other than text is alive and its own** (Nati, 20.10.2026): "כל אלמנט כלשהו מלבד טקסט באתר צריך להיות ייחודי, שונה, מרענן ומפתיע". A picture that only stands there is generic; it develops, reacts to the pointer, drifts, or breaks into the site's material at an edge (`media-material.md`).
- **Pointer effects are small and fine.** A wide fog or a thick shape under the pointer was rejected as "too big and too thick"; what passed is a fine refraction about 40 CSS px wide and a trail of 2-pixel squares that is gone in about 0.3 s.
- **The stillness test.** A screenshot of any screen at rest, with no pointer and no motion, must look like a calm, finished, elegant page. If a still frame looks busy, remove details until it does not. Second test: cover the details with a finger; if the page loses its meaning, the details are carrying too much.

## 2. The layers to propose on every site

| Layer | What it is | The lab offers | Rules |
|---|---|---|---|
| Opening | the page opens quietly once per visit: a loader from the client's world (a counter in its units, the mark drawing itself), a transition in the site's material, then the content comes in (H1 rises, then the line, the key, the object). Model: lamalama.com's counter, logo build, tile wipe; MediaWave's timecode, Horizon ring and tracking-band wipe (`src/look/wave/WaveIntro.tsx`) | 2 openings | CSS from first paint (a pre-paint class set in index.html, so it runs before the app boots); once per visit (sessionStorage); 2.5-3.3s; any tap, key or wheel skips; the H1 is painted under the veil and only moves (transform), so it stays the LCP; never under ?reduce=1 or the prerender; a calm version (no slides, a fade) under OS reduced motion; safety timeout removes it if JS never boots; never reuse a class name on html and on an element (a `.x { display:none }` rule hid the whole page) |
| Scroll mechanic | an object from the client's world geared to scroll (method: `harvest/mr-pandas.md`) | 3 translations | one eased progress number, fixed ratios, double easing; native scroll, never a wheel takeover |
| Pointer trail | a trace that trails the pointer all the time (method: `harvest/lamalama.md`, engine: `media-material.md` §6) | 3 trails, each in a material from the client's world | the same material as the logo or the ground; small units, dense at the head, gone in about 0.3 s; shows speed and direction; on touch it follows only a finger that draws, never a finger that scrolls (or it is off and the scroll stirs the material instead); off under strict reduced motion |
| Surprises | small things that pop up when the visitor does something | 5-7, each tied to a service | section 3 |
| Two-state controls | every key has a second, fully designed state (ground, text, icon) and a timed swap | 2 styles | the second text says what will happen; contained hover; on phones the pressed state shows it; keyboard focus gets the same |
| Live details | a small always-on detail (a counter, a status light) | 1-2 | only true data: never an invented number, count or time |
| Material | the one stuff the ground, logo, icons and trail are made of | named in one word in the decision log | if the pointer, the logo and the ground do not share it, it is decoration |

## 3. Surprises: triggers and rules

Triggers, all caused by the visitor: hovering or tapping a service word, a pause (no input for about 6 seconds), going back to the top, copying the phone or email, finishing a chapter, a 404 or an empty state.

Rules:
- Small (under a fifth of the screen), short (in under 0.6s, gone within 2s unless it is a state), and contained to where the visitor acted.
- Never covers text being read, the call to action, the dock or a dialog; never blocks a click.
- Decorative ones are `aria-hidden`; nothing the visitor needs lives only inside a surprise.
- Each fires at most once per element per visit, except the ones that are states (idle, copying).
- Reduced motion: the surprise is replaced by its last frame or does not happen.

## 4. The details lab

1. Copy `<skill>/assets/lab/details-lab.html` into the project's `design/eye/`. Keep its engine: the trail switcher, the force-motion button (the built-in browser can report reduced motion), the card layout. Replace every example with ones from this client's dossier: 3 trails, 5-7 surprises, 2 control styles, and a link to the scroll-mechanic sketch (`bike-translations.html` is the model).
2. Every card shows a code (T1, S3, H2), the dossier item, the trigger, and the service it points to.
3. Check it at 390 and 1440 with motion on: `LAB_PROJECT=<project> node <skill>/assets/lab/lab-shots.mjs <lab.html> <out>` films every trail, pop, key, REC and the rewind in headless Chrome with reduced motion switched off, and prints page errors; adjust its selectors when the lab's examples change. Do not trust the built-in browser for this: a hidden pane runs requestAnimationFrame at about 2 frames a second or not at all, and it may report reduced motion.
4. Send the file to Nati (render it) and ask one multi-select question per layer. Log every pick in the decision log and in the moment library ("Used in").
5. Budget for the build (section 1): 1 trail, up to 3 surprises, 1 control style, 1 scroll mechanic per page. Each pick becomes a storyboard row with its dossier item, and stage 5 runs the stillness test on every chapter at 390 and 1440.

## 5. Performance and accessibility

- Trail: one canvas, `pointer-events: none`, device pixel ratio capped at 2, drawing only while there is something to draw (stop the loop at rest), paused on a hidden tab. Low alpha and a short life so text stays AA readable under it. Strict reduced motion on client sites: no trail.
- Surprises and controls: no layout shift (absolute or transform only), no new requests at trigger time (assets preloaded or drawn), no main-thread work over 4ms per frame.
- Phones: anything hover-only needs a tap equivalent or does not ship.

## 6. Worked example: mediawave.co.il (19.10.2026)

The lab: `design/eye/details-lab.html` and `design/eye/bike-translations.html` in the MediaWave worktree (branch `redesign/elegant-20261019`).
- Material candidates: cyanotype paper (the logo is Cyanotype), magnetic tape, video tracking lines.
- Trails: T1 cyanotype exposure (the pointer exposes the paper; lingering makes it darker; it fades as it "develops"), T2 tape ribbon (a strand of magnetic tape that hangs and twists behind the pointer), T3 tracking lines (thin horizontal lines with a red and cyan offset, length by speed).
- Surprises: a cassette pops from the word "קלטות" and spins; a memory frame develops on "סרטוני זיכרונות"; a mini site builds itself on "אתרים"; REC and a running timecode appear after a pause; going back to the top plays a rewind; a tape counter counts the scroll; copying the phone number sticks a hand-written label "הועתק".
- Controls: the label rolls to say where it goes; an ink fill spreads from the side the pointer entered.
- Scroll: the cassette, the laptop and the film strip, all geared like the bike.
- What shipped after the Lama Lama rounds (20.10.2026, D154-D162): a showreel hero of eleven takes; live pictures that develop from cream squares into colour; a material of 2-pixel squares whose first seven draw the Horizon mark, at every picture's edge in a different shape; a trail of the same squares (fine pointers); a fine refraction under the pointer; the big drawn dots in varying sizes. The hairline trail and the field's ripple stay in the lab (`?lab=1`, gate `trail`).
