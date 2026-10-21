# Harvest: Mr. Pandas Paper Portfolio (https://www.mr-pandas-psychologically-safe-portfolio.com/)

Moment only: the bear's bicycle. Picked by Nati, 19.10.2026 (`G:/Projects/moment-library/INDEX.md`, slug `mr-pandas-bike`).

## Facts
- Award: Awwwards SOTD 11.3.2026, 7.44 (MediaWave repo `design/research/02-awwwards.md`, source S12). Confirmed there, not re-read.
- Code: github.com/andrewwoan/mr-pandas-psychologically-safe-portfolio, MIT, commit 8f66120 (2026-09-17). Read 19.10.2026 as text; nothing was run.
- Stack (package.json ranges, not pinned): three ^0.182.0, @react-three/fiber ^9.4.2, @react-three/drei ^10.7.7, gsap ^3.12.7, normalize-wheel ^1.0.1, React ^19. Vite. KTX2 textures, Blender scenes in the repo.
- Film: not made. The page takes over the wheel (no native scroll), so `scroll-film.mjs` cannot drive it; filming needs puppeteer `mouse.wheel` steps. Needed later for the side-by-side gate.

## How it was made (paraphrased from the code)
- **Input** (`src/Experience/Experience.jsx`): the native scroll is replaced. Each wheel event adds `sign(pixelY) * 0.0085 * min(|pixelY| / 100, 1)` to a target progress; a touch move adds the sign times 0.0085 * 0.3.
- **One clock** (`src/Experience/Scene.jsx`): every frame, progress = lerp(progress, target, 0.1). Camera, bear and bike all read this one number.
- **The bike** (`src/Experience/models/Moving_Objects.jsx`): only while progress is 0 to 0.3, normalised to n = progress / 0.3.
  - Bike travels n * 16.89 units; wheels turn to n * -16π (8 turns); pedal holder and chainring to n * 32π (16 turns); the pedal itself counter-turns at half that, so it stays level.
  - Every part eases toward its target with lerp 0.1, on top of the eased progress: two layers of easing give it weight.
  - At rest the bike breathes: sine offsets of about 0.02 units in position and 0.01 rad in rotation, each axis at its own frequency and phase.
  - Dust: particle scale = min(velocity * 10, 2) where velocity is the gap between target and actual position; zero when scrolling backward.
- **The bear** (`src/Experience/models/Panda.jsx`): rides its own curve on the same progress; its costume texture swaps at progress thresholds (0.136, 0.306, 0.501, 0.603, 0.705), one per scene.

## Principles (no nouns from the reference)
### Scroll is the throttle
- Observable: the machine moves only when the hand moves, stops when it stops, and runs backward when it scrolls back.
- Intent: the reader feels they drive it, not that they watch it.
- Mechanism: every moving part is geared to one eased progress number at a fixed ratio (here 8 turns of travel to 16 turns of drive); no part has its own timeline.
- Principle: one number, fixed ratios, double easing. Three different sites from it: a tape transport, a film strip under a playhead, a hinge that opens.
### Alive at rest, loud only in motion
- Observable: still, it breathes; moving, it throws a trace whose size is its speed.
- Principle: a tiny idle drift at irrational frequencies, plus one speed-only signal that vanishes in reverse and at rest.

## What NOT to copy
- The wheel takeover: no native scroll means no keyboard, scrollbar or find-in-page scrolling and poor accessibility. Drive our parts from native scroll progress (ScrollTrigger) and smooth with lerp.
- The bear, the papercraft look, the Blender scenes, the textures: theirs.

## Weak spots
- Responsive and semantics were its lowest scores in the research (6.8 and 6.4); the README's to-do includes the mobile camera curve.

## Sources
- github.com/andrewwoan/mr-pandas-psychologically-safe-portfolio, files above, read 19.10.2026.
- awwwards.com/sites/mr-pandas-paper-portfolio (via `design/research/02-awwwards.md`).
