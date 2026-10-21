# Direction proof: get the direction right before any site code

Read this at stage 2, after the eye round and the dossier, before the concept lab hands anything to stage 3. It is a gate: no site code (components, sections, CSS in the project) before Nati has picked one proof.

## Contents

1. Why this gate exists (the MediaWave case)
2. The reference DNA sheet
3. The translation recipe
4. Building the proofs
5. The side-by-side still test
6. The gate

## 1. Why this gate exists

On 19.10.2026 a full MediaWave home page was built, gated and filmed (overlap 0, axe 0, good speed) and Nati rejected it in one line: "immature and weak, far from what I pointed you to". The direction was wrong, not the execution. What had happened:
- The eye round harvested only mechanics from his references (scroll gearing from Mr. Pandas, the hover swap from Lama Lama) and ignored their visual DNA: a dark textured ground, a living material filling the screen, huge confident type, dense UI structure.
- The build used thin SVG line drawings on an empty cream ground. Well animated, it still read as a sketch.

Within the same hour a one-screen prototype in the references' DNA, translated into MediaWave's world (a WebGL halftone "sea of dots" that forms the Horizon logo and then each service), got "that's the direction". The difference was not effort; it was matching the level of the references before building. This file makes that the first step.

## 2. The reference DNA sheet

For every site Nati picked, fill one row per axis from its first screen and one scrolled screen, at 390 and 1440. Write what is there, in plain words, with a number where possible.

| Axis | Question | Lama Lama, as measured | Failure sign in our proposal |
|---|---|---|---|
| Ground | dark or light, flat or textured, does it move? | near-black #1A1C1C, a moving dot field over all of it | an empty flat ground |
| Material | what living element fills the screen? | a WebGL dot field, the logo made of the same tiles | thin lines, icons, outlines |
| Type | H1 size as a share of the viewport width, weight, width, case | about 50% of the width per line, 700, uppercase, tight | H1 under 40% of the width, polite weight |
| Structure | the chrome: header shape, cards, labels, grid, rules | a header pill, a contact card with a photo, bracket labels, mono meta row | a plain nav bar and nothing else |
| Density | how full is a still frame? | full: field, type, meta row, cards | large empty areas with a small object |
| Imagery | photo, video, 3D, generative? | work photos and video in cards, a generative field | none, or one stock clip |
| Motion signature | the one move people remember | the field ripples under the pointer; text lines rise | many small moves, no signature |
| Opening | what happens before the content | a counter, the logo builds, a tile wipe | content at once |

Then fill the same column for our proposal. Any axis where ours is thinner, emptier, smaller or flatter than every reference is a blocker. Fix it in the proof, not in the site.

## 3. The translation recipe

1. Name the reference's signature material in one word (Lama Lama: tiles; Immersive Garden: relief; Mr. Pandas: paper).
2. Ask: what is this client's version of that material, from the dossier? (MediaWave: the wave, the sea, halftone dots of video and print, so a halftone sea.)
3. Make that material the persistent object: it fills the screen at the opening, forms the client's mark, and reshapes itself into each chapter's subject (MediaWave: the Horizon disc, a laptop screen, two cassette reels geared to the scroll, a chat bubble that types).
4. Take the reference's structure and type confidence as they are (a header card, a contact card, bracket labels, a live meta row, two-line display type), filled with the client's real copy. Never its assets, code, logo or palette.
5. Then add the picked mechanics (gearing, hover swaps, surprises) inside that material.

## 4. Building the proofs

- Two or three one-screen proofs, each a different material from the dossier, plus the hero and two chapters so the persistent object is seen changing. Standalone HTML, no project code: start from `<skill>/assets/proof/material-proof.html` (a WebGL field, the opening, the type, the structure; replace the shapes, copy and colours).
- Real fonts embedded (base64, so the file looks the same anywhere), real copy from the client (marked for approval), real colours.
- Mobile first: the shape above the text at 390, beside it from 1100.
- Render stills with `node <skill>/scripts/proof-shots.mjs <file.html> <out> 390x844` and `1440x900` (opening frames and every chapter, motion forced on).

## 5. The side-by-side still test

Before showing Nati, put our first screen next to each reference's first screen at the same size (`ffmpeg -i ref.png -i ours.png -filter_complex hstack side.png`). Ours is not ready if, next to the reference, it looks emptier, thinner, smaller, flatter, or like a wireframe. This takes one minute and would have caught the cream line-art home before a day of building.

## 6. The gate

Send Nati the proofs (the HTML files and the stills at 390 and 1440) and ask one question: which one, or what is missing. Log his pick as a decision. Only then does stage 3 start, and the motion prototype starts from the picked proof's material, not from scratch.
