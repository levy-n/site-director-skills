# Living media on one WebGL canvas: the engine patterns

Read this at stages 3-4 when the direction is media-led: a showreel hero, pictures that develop and react, a material the media breaks into at its edges (the look Nati asked for on mediawave.co.il, after lamalama.com). The reference code is MediaWave's `src/look/sea/field.ts` and `shader.ts` (decisions D154-D162); the reusable shader module is `<skill>/assets/motion/squares.glsl`. How to match a reference first: `fidelity.md`.

## Contents

1. The rule of the look
2. Architecture
3. The showreel
4. Live pictures
5. The material and its edges
6. The pointer
7. Big drawn dots
8. Text over media
9. Loading and the LCP
10. Motion policy
11. Verification
12. Pitfalls met

## 1. The rule of the look

Every non-text element is alive and its own (Nati's standing rule, 20.10.2026): no picture that only stands there. A picture develops into colour, reacts to the pointer, drifts in its frame, and breaks into the site's material at an edge. Media keeps its real colour; the material belongs to the edges, the rest states and the transitions, never laid over everything. Restraint still holds (`details-layer.md` §1): small units, short lives, one trail.

## 2. Architecture

- **One fixed full-screen canvas** behind the page (`pointer-events: none`) draws every film, take and picture. DOM elements are placeholders that the engine measures (a `getBoundingClientRect` per element on scroll, resize and an observer), so layout, text and links stay real HTML.
- **Textures:** two film slots (chapter grounds), two reel takes (the hero), and one atlas for pictures (2048x640, eight cells of 512x320, filled near the viewport and freed far from it). Videos upload a frame only when a new one exists.
- **Uniform budget (WebGL1):** pack scalars four to a `vec4` (energies, weights) and keep arrays short; about 120 fragment vectors ran on Chromium, Firefox and WebKit, iPhone included. No dynamic indexing of `const` arrays: pick rows with ternaries and `dot(row, vec4(equal(vec4(i), vec4(0,1,2,3))))`.
- **Lab gates** (`?lab=1`): every variant behind a named gate, with the defaults set to the recommendation, so Nati compares live and the shipped site is the default.

## 3. The showreel

- A pool of short takes (about 11, 6-8 s each, from the client's world), played in random order from random start points, each held 1.1-2.4 s, with one of eight changes between takes (the material's squares, a bloom from a point, an angled wipe, a liquid flow, a push through, through the dark, a slide, sinking into the material and rising out of it), never one of the last three. A slow push-in (about 8% over 6.5 s) keeps every take moving.
- The first take's poster shows until its first frame, so the hero is never empty.
- Encodes: desktop 1280x720 and a tall phone cut (406x720), H.264 MP4 plus VP9 WebM (crf 46-48 was smaller than H.264 here), no audio.

## 4. Live pictures

- At rest a picture is its material (§5): its light as cream squares on a dark tile.
- It develops into colour on hover (desktop) or when it crosses the middle of the screen (phone), in one of three ways: all over, from the point where the pointer came in, or from the top down. Colour arrives square by square with the noisy reveal curve; it leaves faster than it comes (0.95 s in, 0.6 s out).
- It drifts and zooms a little inside its frame (parallax), and the pointer's wake bends it (§6).
- One edge of each picture breaks into the page, a different side per picture (bottom, top, start, end), so a row of pictures never repeats one shape.

## 5. The material and its edges

`squares.glsl` holds the code and the reasons. In short:

- One screen-wide grid of 2 CSS px squares, four by four to a cell. A level lights a cell's squares in a fixed order designed per client: the first seven draw a tiny glyph of the client's mark (the material at full light), the rest spread apart.
- Two kinds of colour: the material in one colour (cream on dark), and a picture's edge in the picture's own colour, dimming toward the end of the band.
- Edge shapes, one per element so the material appears "in different shapes": holes (a broad swelling band, about a third of the hero), holes then material (the picture goes on as cream squares below), rows (each row of cells frays on its own, like a tape's tracking), backdrop (only the material, quiet, behind a list). Opposite edges use opposite orders.
- The hero's band climbs as the hero scrolls away.

## 6. The pointer

- **Trail:** a ribbon of the same small squares, fuller where the pointer ran fast, thinning behind it, gone in about 0.3 s. Twelve recent samples (position, speed, energy `exp(-age/0.5s) * (0.3 + 0.7 * speed)`), a gaussian of about 40 CSS px per sample, energy squared for the trail. Fine pointers only: a finger scrolling never paints.
- **Wake over pictures:** a fingertip through water. Pushed out about 10 px times the falloff, carried 0.3 of the velocity along the motion, red and blue sampled at plus and minus 0.35 of the offset for a faint fringe. Radius about 40 CSS px, settles in 0.5 s. Small and fine: a big grey fog was rejected ("too big and thick").
- **Phones:** the scroll's speed stirs the pictures, and the finger gets its own effect (D163): where it lands and moves, everything under it swells like a drop of water on the glass (up to about 1.28x, radius about 64 CSS px), lit on the upper side and shaded on the lower so it has depth, with a thin ring of the material's squares around it; it follows the finger with a little ease, swells in fast and settles out slowly, and the trail of squares follows the finger too.

## 7. Big drawn dots

Shapes drawn in halftone dots (a laptop, a cassette, a phone) are pixel art: Nati checks them for exactness first (D163, "the laptop's screen is suddenly not symmetric").
- **Centre each drawing on a column of dots** (snap its centre x to a cell centre), so its left and right halves fall on the grid alike. Unsnapped, a symmetric trapezoid steps out at different heights on each side.
- **Every line at least one dot thick, at full size:** outlines, keys and text bars get a minimum half-width of half a cell in the drawing's own units, with a near-binary edge. A thin line passing between dot centres otherwise comes out as big and small dots at random.
- **No tilted rectangles:** a few degrees of tilt fall on the grid in single steps that read as mistakes.
- **Vary the size only inside fills,** and in order: slow diagonal bands of light drifting across the shape. Never a random size per dot; it was rejected as less exact. The radius is `pow(value, 0.62) * cell / 2`.
- **Keep a moving ground quiet around a drawing** (dim the footage within about 1.9 radii of its slot).

## 8. Text over media

Dim the media under text per pixel, never per cell (a cell-sized step shows as stairs): about 0.32 under the words, feathered over about seven times the padding so no dark box shows around a headline. Inside a breaking band, where only scattered squares are left, dim less. Check AA on the darkest and brightest takes. Blend modes on the headline (Lama's `exclusion`) fail AA on mid-tones: not used.

## 9. Loading and the LCP

- The H1 is the LCP and never waits for media: posters load with `new Image()` (never as DOM images), videos are hidden 2-pixel elements used only as texture sources, and everything mounts after `load` plus idle.
- Autoplay can be refused (an iPhone in Low Power Mode, strict policies): try `play()`, and on refusal retry on the first `pointerdown`, `touchstart` or `keydown`. Every regular visit then gets its motion.

## 10. Motion policy

mediawave.co.il runs full motion by default (D160): the OS reduced-motion flag does not calm it; `?calm=1` gives the calm tier, and the accessibility widget's stop switch and `?reduce=1` stop everything, the trail and the reel included. Client sites stay strict (SKILL.md rule 6): under reduced motion, posters and last frames only.

## 11. Verification

- Frames with the GPU at 390 (DPR 3) and 1440, zoomed crops beside the reference's: `<skill>/scripts/gpu-frames.mjs`.
- WebGL starts in Chromium, Firefox and WebKit (Playwright; about 5-6 s headless).
- The project's overlap audit at 320, 390, 768, 1024 and 1440, and the all-pages pass (axe, overflow, targets) at 390 and 1440.
- Lighthouse is measured, and Nati decides whether a lower score ships for now (he allowed it on 20.10.2026 with a follow-up).

## 12. Pitfalls met

- The built-in browser pane can render WebGL black, and a hidden pane runs frames at about 2 per second: never judge the material there.
- JPEG screenshots hide 2-pixel structure: PNG and nearest-neighbour crops.
- Gate classes read at import time miss the lab's later change: read them at call time.
- Files with CRLF endings: edit with a script that keeps CRLF and fails loudly on a miss.
- A cover drawn in the canvas before a full page load comes back with the page from the browser's cache: undo it on `pageshow` (`persisted`), not only the CSS classes.
- ffmpeg: `xfade` needs `fps=25,settb=1/25` on each branch for a seamless loop; `bc` is missing in Git Bash (use `awk`); crop tiles with `force_original_aspect_ratio=increase` before `crop`.
