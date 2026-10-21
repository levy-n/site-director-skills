# Reference fidelity: when Nati says "like that site, but precise"

Read this when Nati asks to match a reference closely ("כמה שיותר דומה", "תהיה מדויק", "לא מספיק דומה"), when a referenced moment comes back "not in the direction" a second time, and before building any material, shader or WebGL effect taken from a reference. It extends the eye round (`human-eye.md`) and the harvest (`sotd-harvest.md`); the gate stays the side-by-side verdict.

## Contents

1. Why guessing fails
2. Read the source first
3. See it with a GPU, up close
4. The inventory
5. Translate: the mechanism exact, the signature ours
6. Show early, side by side
7. What Nati's words usually mean
8. The case behind this file

## 1. Why guessing fails

On mediawave.co.il (October 2026) six rounds tried to match Lama Lama's material from screenshots and descriptions, and Nati rejected each: round dots ("too coarse"), a uniform fine dither ("all the same"), a grey fog under the pointer ("too big and thick"), a chain of blobs as the trail, static pictures ("generic"). One round of reading their public shader code and shooting the site with a GPU settled it: the "dots" were 4x4 grids of 2-pixel squares lit in a fixed order, the edge of the video was holes opening in the video itself, and the trail was a ribbon of the same squares. A scaled JPEG screenshot had hidden every one of those facts.

So: after the second "not similar enough" on the same moment, stop iterating on the look and go to the source. It is the same rule as two failed fixes: search before the third try.

## 2. Read the source first

Bundles are read as text, never run (`sotd-harvest.md` §1). Work in a scratch folder outside the project.

1. **List what the page really loads.** A Vite site split per block lazy-loads chunks that the HTML never names. Open the page in the built-in browser and list the network requests filtered by `.js`, then fetch each relevant one with `curl -s -o <name> <url>`.
2. **Cut the shaders out.** Search for `precision highp float`, `#version 300 es`, `gl_FragColor` and `out vec4`, and slice each template string between its backticks:

   ```bash
   node -e "const s=require('fs').readFileSync('app.js','utf8');let i=0,o=[];while((i=s.indexOf('precision highp float',i))>=0){const a=s.lastIndexOf('\`',i),b=s.indexOf('\`',i);o.push(s.slice(a,b+1));i=b+1}require('fs').writeFileSync('shaders.txt',o.join('\n\n'))"
   ```

3. **Find what drives each uniform.** Search for every uniform name (`u_hover`, `u_reveal_progress`) and for the setter (`uniforms.set(`, `gl.uniform`). Write down the tweens that move them (duration, ease), the constants (grid size, border, scale) and which component instantiates them with which arguments.
4. **Find the DOM it reads:** the `data-*` attributes in the HTML, which hidden `<video>` or `<img>` is the texture source, and the CSS on the section (blend modes, masks, opacity).
5. **Record numbers with file names**, each confirmed (read) or inferred (seen only on screen), in the harvest file. The code stays theirs: the project gets new code written from the notes.

## 3. See it with a GPU, up close

- The built-in browser pane and plain headless shells can draw WebGL black (Lama's hero was an empty dark page there). Shoot with the GPU on:

  ```bash
  node <skill>/scripts/gpu-frames.mjs <url> --out <scratch>/frames --zoom 560,600,240,150
  node <skill>/scripts/gpu-frames.mjs <url> --out <scratch>/frames-phone --mobile
  ```

  It takes rest, scrolled, mid sweep, decay (0.4 s after the pointer stops) and press frames, keeps the pointer at the top during load (pointer-led effects change the frame), and writes 4x nearest-neighbour crops. Read PNG, never JPEG, for anything under 4 pixels.
- Many reference sites switch WebGL off on touch. Shoot the phone too, and decide what our phone gets: Nati judges on his phone, so ours never ships a blank or a plain fallback where the desktop has the material.
- Look at the crops before writing a line: the shape of one unit, its size in CSS px, whether all elements share one grid, how many levels a unit has, whether it keeps the picture's colour or one theme colour.

## 4. The inventory

Answer each line from the code or the frames, with the source, before building:

| Question | Example answer (Lama Lama, 20.10.2026) |
|---|---|
| The unit of the material | a cell of 4x4 squares, 2 CSS px each, on one screen-wide grid |
| Its levels | 16 squares lit in a fixed order; the quiet material stops at 7 (their logo) |
| Its colour | the material in one theme colour; a picture's edge keeps the picture's colour |
| Where it appears, where it never does | edges of videos, the trail, transitions, image hovers; never over the whole hero |
| The edge | a band about 0.2-0.3 of the screen, height swelled by broad smooth noise; the top edge in the inverse order |
| Pace and repetition | many short takes, never the same change twice in a row |
| Pointer | a ribbon of squares from a decaying velocity field, about 80-120 px wide, gone in about 0.3 s |
| Press | the material spreads from the press point over 3.75 s, returns in 1.25 s |
| Scroll | the edge climbs as the section leaves |
| Touch | WebGL off; a plain video |
| Text over media | the headline blends with `exclusion` (not taken: AA) |

Then list three to five small details Nati did not name, show them on the zoomed crops, and say which ones you will build. He asked for exactly this ("תנסה לשים לב לפרטים קטנים שאולי אני לא שמתי אליהם לב").

## 5. Translate: the mechanism exact, the signature ours

- When Nati asks for fidelity, the mechanism transfers exactly: the unit, the levels, the curves, the timings, the decay. That is technique (ordered dithering, a velocity trail, a noisy edge), the same as using an easing curve.
- The signature never transfers: their glyph or lighting order (Lama's seven squares spell their logo; ours draw the client's mark), palette, fonts, copy, imagery, layout. Name the swap in the decision log.
- The locked rules still win: AA contrast, the accessibility settings, mobile first, the LCP element, the overlap audit.
- Spread the material "in different shapes and elements" (Nati, 20.10.2026): the same material in several roles (a hero edge, each picture breaking on its own side, grounds fraying in rows, transitions, the trail) reads as the site's own stuff, not one effect.
- Engine patterns for media-led looks: `media-material.md`. Reusable shader code: `<skill>/assets/motion/squares.glsl`.

## 6. Show early, side by side

1. Build the material on one screen first (usually the hero), shoot it at 390 (DPR 3) and 1440 with `gpu-frames.mjs`, and put our zoomed crops beside the reference's at the same zoom.
2. Send Nati the phone frame every time.
3. Spread it to the other elements, and close with the side-by-side verdict: our film and the reference's at the same viewport and speed (`ffmpeg ... hstack`), plus the same zoomed crop of both; Nati says "same level" or names the one thing missing (the gate itself: `human-eye.md` §6).

## 7. What Nati's words usually mean

| He said | It meant | The fix |
|---|---|---|
| "אתה לא בכיוון" | the structure is wrong (one video where the reference cuts through many) | watch the reference end to end and inventory the structure before the material |
| "גס מדי" | the scale of the material | measure the unit in CSS px on a zoomed crop; never guess |
| "גדול מדי ועבה מדי", "לא אלגנטי" | a pointer effect too large, too opaque or too slow to fade | smaller radius, thinner, shorter life |
| "גנרי", "סתם תמונות שעומדות" | a static non-text element | every non-text element is alive: it develops, reacts, drifts |
| "יש כאלה ויש כאלה, לא הכל אותו דבר" | per-unit variation | ordered clusters; dots of varying size |
| "כאילו חלק מהסרטון שפתאום משתנה בקצה" | the picture itself breaks (holes, its own colour), not dots laid over it | mask the picture through the pattern |
| "תהיה מדויק" | read the source | §2 |
| "פחות מדויקים", "לא סימטרי" | the dot drawings fall on the grid unevenly | centre on a dot column, lines a dot thick, no tilt, no random sizes (`media-material.md` §7) |

## 8. The case behind this file

mediawave.co.il, decisions D154-D162 (20.10.2026). The code-level notes: `design/harvest/lamalama-deep.rtl.md` §13 in the MediaWave repo; the build: `src/look/sea/shader.ts`; the corrected harvest: `harvest/lamalama.md`.
