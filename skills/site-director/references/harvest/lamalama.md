# Harvest: Lama Lama (https://lamalama.com/)

Layers, not a single moment. Picked by Nati, 19.10.2026: "nothing there is generic, from the unique background to the texts; on a button, texts change inside". Library slugs `lamalama-trail`, `lamalama-buttons`.

## Facts
- Award: Awwwards SOTD 20.7.2026, 7.51, and SOTM July 2026 (MediaWave repo `design/research/02-awwwards.md`, S14).
- Stack, read 19.10.2026 in the built-in browser: WordPress theme `lamalama2025`, a Vite bundle split into one chunk per block (button, contact_card, icon, logo_marquee, case_item, webgl_image, webgl_video, backdrop_theme, clock, scrollbar, canvas_2d, tile). GSAP with SplitText. No Lenis global, no three.js global: the WebGL is their own small composer (`app-*.js`). Code is closed and minified; everything below was read as text, never run.
- Ground: `#1A1C1C`, text `#F9F4EB`. Fonts: Suisse BP Intl (display, uppercase, 700, letter-spacing -0.02em) and Sometype Mono (body and labels).

## How it was made (paraphrased)
- **The material** (shaders read 20.10.2026 in `app-*.js`, `image-*.js`, `backdrop_theme-*.js`, confirmed on GPU frames): one screen-wide grid; pictures and videos use 8 CSS px cells, the ground and the opener 16. Each cell is 4x4 squares lit in a fixed order by a level 0..1 (`drawLLLogo`): the quiet material stops at 7 squares, which spell their logo, so it is never solid; colour edges and transitions use all 16. That is why every "dot" is a different cluster.
- **A video's edge** (`backdrop_theme`, confirmed): the colour video is masked through the 16-square pattern by its height: holes open square by square down a band about 0.2 of the screen, and what is left keeps the video's colour. The band's height swells with broad smooth noise (0.15 of the screen); the top edge uses the inverse order.
- **Reveals and changes** (confirmed): a level per element runs through `1 - smoothstep(0, 1, 1 - p + n * (1 - p))`, where n is squared value noise turning a radian every 20 s, so the front is mostly even with a few late patches. Pictures reveal in two stages: the material, then colour (1.25 s, power2.out).
- **Cursor trail** (confirmed): a velocity field (a splat about 0.04 of the screen height, fading about 7% per frame) drawn as the 7-square pattern in the cursor colour: a ribbon of small squares, dense at the head, gone in about 0.3 s. Over a picture it turns the colour back into the material and drags the sampling a little.
- **Press** (confirmed): on a picture, the material spreads from the press point over 3.75 s (power4.out) and returns in 1.25 s.
- **Touch** (confirmed): the WebGL is off on touch devices; phones get plain video.
- **Hero headline:** `mix-blend-mode: exclusion` over the video (dark over fire).
- **Logo and icons** (`canvas_2d-*.js`, `tile-*.js`, confirmed): a 2D canvas grid of square tiles, each with its own alpha. Logo, icons and trail share one material: the pixel tile.
- **Buttons** (`button-*.js`, confirmed): every button carries two complete layers, normal and hover (backdrop, text, arrow, and their hover twins). On enter: the backdrop fades and scales to 0.98 (power4.out, 0.25s), the hover backdrop fades in (0.35s), the arrow scales out while the hover arrow scales in (0.45s), the normal text lines roll out and the hover text lines roll in. On leave the same in reverse, the backdrop delayed 0.2s. Touch devices get no hover handlers.
- **Cursor label** (confirmed): hovering a button or a labelled text puts its `data-text` in a label that travels with the pointer.
- **Text reveal** (confirmed): SplitText lines; each line from yPercent 80, scale 0.96, opacity 0 and a clip-path inset to rest, expo.out, 0.85s, staggered by `i * (0.135 + 0.03 * lines) / (lines - 1) + 0.15`.
- **Small live details:** a clock block, a custom scrollbar, a logo marquee, WebGL hover on case images and videos, a backdrop shader per colour theme.

## Principles (no nouns from the reference)
### One material everywhere
The mark, the icons, the pointer's trace and the ground are made of the same stuff. That is why nothing reads as a template: every detail is visibly from the same world. Test: name the material in one word; if the pointer, the logo and the ground do not share it, they are decoration.
### The picture breaks, nothing is laid over it
At an edge the picture itself turns into the material: holes open in it and the rest keeps its own colour. Colour lives in the media; the material lives at edges, rest states and changes.
### Variation inside the unit
A unit with many states (sixteen squares lit in order) gives a different cluster in every cell; one dot size everywhere reads as a template.
### Every control has two complete states
The hover is not a colour change. It is a second, fully designed state (its own ground, text and icon) and a choreographed swap between them, with exit and entry timed separately. The second text says what will happen.
### The pointer carries meaning
The trace shows speed and direction; the label near the pointer says what a click will do.
### Notation as typography
A display family with presence and a mono family with a strict job (labels, brackets, codes): `( + )`, `[ FEATURED WORK ]`.

## What NOT to copy
Their lighting order (it spells their logo), the mono label style, the palette and fonts, the exclusion-blend headline (fails AA). When Nati asks for fidelity, the mechanism (squares, levels, curves, timings) transfers exactly and the signature becomes the client's: on mediawave.co.il the first seven squares draw the Horizon mark (D162). Method: `../fidelity.md`.

## Sources
- lamalama.com, scripts listed by `performance.getEntriesByType('resource')`, read 19.10.2026.
- awwwards.com/sites/lama-lama-2 (via `design/research/02-awwwards.md`).

## Deep harvest (20.10.2026)
The full breakdown (opener timings, the header's per-section icon and lines, section wipes, page turn,
image treatment, decode, colour map, mobile) is in the MediaWave repo:
`G:/Web-Dev/MediaWaveIsrael/.claude/worktrees/elegant-20261019/design/harvest/lamalama-deep.rtl.md`
(on main after the release); §13 there holds the code-level notes. Films: `G:/Projects/moment-library/films/lamalama*/`. The page scrolls
inside a Lenis wrapper (`.js-scroller`), so the standard scroll-film sees one frame; film it by
scrolling the wrapper (the session's `film-scroller.mjs` pattern).
