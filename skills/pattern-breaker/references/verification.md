# Verification: filming and measuring the page

Read this before running the scripts for the first time in a project, and whenever a report needs interpreting. The principle: a scroll experience is judged by what it does while scrolling, on a phone and on a desktop, with motion on and with motion reduced. Code review cannot see any of that.

## Contents
1. Setup
2. The scripts
3. Budgets and how to read motion-audit
4. Reading slop-scan
5. Reading a scroll film
6. The QA hook
7. Image budget for reviewing frames
8. Known limits of headless measurement

---

## 1. Setup

- Node 20 or newer. puppeteer installed in the project (`npm i -D puppeteer`) or globally; the scripts look in the current directory first, then globally. Run them from the project root as `node <skill>/scripts/<name>.mjs` (`<skill>` as SKILL.md's Tools section defines it); a bare `node scripts/…` would look in the project's own `scripts/` folder.
- ffmpeg is optional: scroll-film uses it for the continuous-scroll video strip (set `FFMPEG_PATH` if it is not on PATH; on Nati's machine it is `C:/ffmpeg/bin/ffmpeg.exe`).
- Serve production builds, not the dev server, for anything performance-related: `node <skill>/scripts/serve.mjs dist --spa` (gzip and range requests included; uncompressed serving makes numbers look seconds worse).
- On Windows, quote paths with spaces and use forward slashes; the scripts accept both.

## 2. The scripts

Each runs as `node <skill>/scripts/<name>.mjs` and prints its full options with `--help`.

| Script | What it produces | When |
|---|---|---|
| `scroll-film.mjs <url> --out design/film [--viewports desktop,short,mobile] [--video] [--step 0.5]` | stills every half viewport with motion enabled (scroll position in the file name), intro frames from navigation start, an optional human-speed scroll video (`scroll.webm`) sampled into `motion-NNNN.jpg` and `scroll-strip.jpg`, `meta.json` (stack fingerprint, fonts, colours, fixed/sticky elements, pins) and `film.html` (a contact sheet) | after every section, before every critic pass, and to study a reference site |
| `scroll-film.mjs <url> --at <px or id:progress,…>` | one still per listed state through the `?at=` hook (`at-<value>.jpg`, `at.html`), each after `html[data-at]` appears | while building a section: film its range (`--at story:0.2,story:0.5,story:0.9`) instead of the whole page |
| `motion-audit.mjs <url> --out design/audit [--viewports desktop,short,mobile] [--only map,smoothness,reduced] [--runs N] [--dead-vp 3] [--budget-cls 0.1] [--strict]` | `motion-audit.md` + `.json`: held scenes and held share, theme timeline (from real pixels), motion kinds, fade share, per-section motion map, dead zones, frame times while scrolling, long tasks with where they happened, CLS during scroll with its sources, whether the page scrolls to the end, content stuck invisible, horizontal overflow, page errors, and the same content checks under reduced motion. Exit code 1 when a non-timing check fails; with `--strict`, when any check fails | first full build, every upgrade wave, before handoff. About 2-3 min per viewport on desktop and 4-6 on mobile for a 10,000 px page; `--only smoothness --viewports mobile` re-measures a performance fix in under a minute |
| `slop-scan.mjs <dir or file>` or `--url <url>` `[--out dir] [--fail-above N]` | Slop Index 0-100 with evidence (file:line or DOM excerpt), second-order signals, waived findings, second-order signals waived by a logged decision (§4) | after tokens are set, after copy is written, before handoff; in upgrade mode on day one |
| `gates.mjs <url[,url…]> [--out dir] [--only …] [--baseline gates.json] [--lh-motion on\|off\|both]` | `gates.md` + `.json`: axe (WCAG 2.2 A/AA at 390 and 1440), in-page anchors landing below the header with motion on and reduced, overflow at 320/390/768/1440, the no-JS census, forms, console errors, and Lighthouse mobile (median) with motion on and with motion off (`--lh-motion`, default both, §8) when `lighthouse` is found on PATH, in `node_modules/.bin` or in the npx cache (`npx --no-install`, located once and run with node; a lookup that times out fails the gate instead of skipping it). Exit code 1 on any FAIL; with `--baseline`, only new axe violations fail, and Lighthouse is compared per motion mode | the foundation gate, every upgrade wave, before handoff (site-gate-audit explains why each gate exists) |
| `preserve.mjs snapshot <urls or sitemap> --out file` · `preserve.mjs diff <base> <cand> [--intended file] [--map from=to]` | what must survive an upgrade, read with JavaScript off and on; the diff fails (exit 1) on any change not declared in `intended.json` | upgrade baseline and every wave (upgrade.md §3) |
| `font-fallback.mjs <font files> --family "Name" [--weight N]` | `@font-face` fallback rules measured on Hebrew and Latin separately, and a proof line that the swap doesn't rewrap | foundations step 4, and whenever a display face or weight changes |
| `serve.mjs <dir> [--port] [--spa]` | a static server (gzip, range requests) | to film, audit or gate a local build |
| `lint-ask.mjs <payload.json>` | errors and warnings for a question payload | before every structured question call |
| `selftest.mjs [--browser]` | static checks of the skill's own files; `--browser` adds the engine checks in headless Chrome (RTL splits, the attribute layer, the engine API, the short viewport, slop-scan in URL mode) | after editing anything in the skill |

Viewports: `desktop` 1440x900, `short` 1440x700 (the same desktop 200 px shorter: holds, stages and full-screen scenes sized for 900 px must still fit), `mobile` 390x844 at DPR 2 with touch and an iPhone user agent; scroll-film also has `laptop` 1280x720. motion-audit judges `short` on the desktop budgets. Film `desktop,short,mobile` at every milestone.

## 3. Budgets and how to read motion-audit

Built-in budgets (generous smoke floors, because headless rendering is a smoke test). The brief's budgets are stricter (foundations.md §3.8): scroll CLS ≤ 0.05, which the audit applies with `--budget-cls 0.05`; lab LCP ≤ 2.0 s is measured by Lighthouse (`gates.mjs`), and INP ≤ 200 ms only by real users.

| Check | Desktop and short | Mobile (4× CPU throttle) |
|---|---|---|
| page actually loaded and rendered text | required | required |
| page scrolled to the end | required | required |
| no page errors (failed requests, exceptions; a missing favicon is ignored) | 0 | 0 |
| no content stuck invisible mid-screen | 0 | 0 |
| no horizontal overflow | 0 px | 0 px |
| reveals are not a monotone fade-up | fade share ≤ 0.7 or ≥ 3 motion kinds | same |
| at least one memorable moment (peaks) | a held scene, or a section driven by ≥ 3 scrubbed elements | same |
| no monotone zone | no section with ≥ 6 reveals of which ≥ 80 % are plain fades (page averages hide boring zones) | same |
| no dead zone | none ≥ 3 viewports (`--dead-vp`; upgrade zone scoring uses 1.5) | same |
| p95 frame while scrolling (timing) | ≤ 34 ms | ≤ 50 ms |
| janky frames > 33 ms (timing) | ≤ 12 % | ≤ 20 % |
| CLS during scroll (worst session window) | ≤ 0.1 (`--budget-cls`) | ≤ 0.1 |
| long tasks during scroll (timing) | ≤ 400 ms total | ≤ 1000 ms total |
| reduced motion: all content visible | 0 hidden | 0 hidden |
| reduced motion: nothing moves on its own | ≤ 2 elements | ≤ 2 elements |
| reduced motion: nothing animates on scroll (AOS, `whileInView` that ignores the setting) | 0 elements outside `aria-hidden` whose transform, clip-path or SVG geometry changes; opacity-only changes are listed as notes | same |

How to read the parts that are not pass/fail:
- **Holds** list the scroll ranges where a scene stays put. Compare them with the score's planned holds.
- **Theme timeline** comes from rendered edge pixels; "media" means an image or video fills the edge. Compare with the score's theme map.
- **Motion kinds** (fade-up, fade, masked-rise, clip, scale, rotate, horizontal, vertical-travel, ink-fill, `morph` for a changing SVG `d` or `points`, `draw` for a changing `stroke-dashoffset`, and combinations; morph and draw take precedence over fade) and the **per-section map** show where variety lives and which sections have no motion at all.
- **Early entrances** are elements whose only change happened while they were off screen, like the engine's `reveal()` fired 600 px ahead. Nobody sees them, so they don't count as reveals in the fade share or the monotone-zone check; the report lists them apart.
- **Long tasks** come with the scroll position and section they hit (the top five in the check's detail, a "Long tasks by section" line in the report) and the scripts behind long frames. Start there instead of bisecting the page by hand, and iterate with `--only smoothness --viewports mobile`.
- **Timing checks are noisy.** Identical builds measured up to 2× apart in long tasks on mobile. One run over budget is noise until a median confirms it: the audit starts two more runs on its own when the first lands near a timing budget, `--runs 3` forces them, and the verdict is on the median (WARN = the median passes, one run didn't). Never change code for one sample, and note other heavy processes running on the machine. The exit code ignores timing checks unless `--strict`.
- **"Cued-later observations"**: content that was invisible mid-screen at one step and visible later while still on screen. That is choreography inside a hold (a caption waiting for its moment), not a defect.
- **CLS sources** name the elements that shifted. GSAP pin elements (`pin-spacer` children) appearing here mean the hold should become a sticky stage or use `pinType: 'transform'`.

## 4. Reading slop-scan

- **The index** sums weighted findings with a cap per category, so many defaults agreeing with each other score high, while one isolated choice does not. Bands: ≤ 20 clean of known defaults, ≤ 45 some template tells, ≤ 70 generic, above that the AI-default template.
- **A finding is a question, not a failure.** If a match is deliberate and the concept says why, waive it in place: `/* slop-ok: <rule-id> <reason> */` (or `<!-- slop-ok: … -->`) on the same or previous line in code, or `data-slop-ok="<rule-id> <reason>"` on the element in URL mode. Waived findings are listed, not scored.
- **Second-order signals** (cream paper, serif italic display, mono uppercase labels, grain, numbered sections, acid accent, terracotta, marquee, bento, and the 2026 "tasteful AI" looks: dev-tool dark with masked grids and beam borders, cursor-spotlight cards, blur-in reveals, liquid glass, neo-brutal shadows, the scrapbook kit, retro dither, mocha/oat, black and gold, Klein blue, signal orange, portfolio chrome, the "no fluff / בגובה העיניים" voice) are fine one at a time; three or more together read as the anti-slop template, and two different looks on one page read as kit-assembled taste. Fix a hit from the subject's material or story, never by swapping to the neighbouring look.
- **Second-order waivers need a logged decision.** A plain `slop-ok` does not waive a second-order signal (the report lists it as ignored). A decision does: `/* slop-ok:<rule-id> decision:D<n> <reason> */` on the same or previous line in code, or `data-slop-ok="<rule-id> decision:D<n> <reason>"` on the element (URL mode, and in markup in code mode), where `D<n>` is the row in the project's decision log that chose the look from the client's world. A waived signal leaves the "signals together" count and is listed with its decision and every occurrence under "Second-order signals waived by decision", so a page of waived looks still shows as one. `all` does not work for second-order signals.
- **Quoted tells are ignored** ("is there a '✨ New' badge?" in an anti-AI checklist is a mention, not a use). In URL mode, testimonials and quotes count as the client's voice, not the owner's copy.
- **Rule families** (about 120 rules): colour, type and surface defaults; copy in English and Hebrew (AI vocabulary, question hooks, triads, em dashes, template section headings, vague proof, fake urgency, placeholder people; Israeli small-business clichés, AI-Hebrew calques such as "כאן נכנסים לתמונה", translationese density, over-formal register, mixed singular and plural address, maqaf and low quotes); imagery (generator and stock file names, 3D blobs, mesh gradients, device mockups, docs sample chart data, avatar stacks); motion signatures in code (hover lift everywhere, typewriter headlines, count-ups, scroll-jacking, parallax everywhere, split on every heading, cursor gimmicks, uniform stagger); untouched scaffold, shadcn and Tailwind UI defaults; and `marketplace-effect`, component names imported from effect marketplaces. Hebrew rules use their own word edges, because JavaScript's `\b` doesn't work on Hebrew letters.
- **URL mode** adds structural detectors on the rendered page: uniform card grids, repeated section shells, kicker labels, centred long copy, flat type scale, too many font families, arrow CTAs, dot meta strings, bento, zig-zag rows, logo cloud, pricing trio, stat band, CTA band, testimonial trio, steps trio, FAQ dumped at the end, four-column footer, split hero, pill buttons everywhere, one radius everywhere, placeholder-as-label, physical left/right classes on an RTL page, letter-spacing or faux italic on Hebrew, LTR arrows in RTL, two-beat headlines on every section, and `template-sequence` (four or more template blocks in their canonical order). These see any platform (WordPress, Wix, Webflow, Lovable).
- The QA scripts and project docs (README, AGENTS, BRIEF, CONCEPT and the like) are skipped in code mode; they aren't what visitors read.
- A clean score is not taste. It only means none of the known defaults were found; the critic pass judges the rest.

## 5. Reading a scroll film

- Open `film.html` for the contact sheet, or read frames directly. Frame names carry the scroll position (`f-0012-y005400.jpg`).
- Read the intro frames for the preloader and hero entrance timing.
- In holds, consecutive frames should show the scene changing while the page position advances.
- The continuous-scroll strip shows what settled stills cannot: velocity skew, scrub lag, marquee speed-up, theme flips mid-motion.
- Compare desktop and mobile beat by beat against the score's mobile column.

## 6. The QA hooks and capture discipline

Every build gets two query hooks (built into the engine): `?at=<px>` or `?at=<sceneId>:<0..1>` jumps the smooth-scroll engine and ScrollTrigger to that state after load and stamps `data-at` on `<html>`; `?reduce=1` forces the reduced-motion path. Use them to capture one range while building a section, and the static version of it, instead of filming the whole page: `scroll-film.mjs <url> --at story:0.2,story:0.5,story:0.9` takes the stills with motion on and waits for the stamp.

A capture is valid only after entrance motion has settled, with `scroll-behavior: auto`, starting from the top of the document. Screenshot just before and just after every seam between sections and judge continuity by composition. Scroll each signature moment forward, backward, slowly and with a fast flick: it must look intentional in all four.

## 7. Image budget for reviewing frames

Frames cost tokens, and requests have limits: the long edge is capped at 2576 px, and when a request holds more than 20 images each must be at most 2000 px per side. A 1440×900 frame is about 1,700 visual tokens; mobile frames at 390×844 with DPR 2 are 780×1688 and stay under 2000 px. Sample rather than read everything (critic.md §6), and review in a fresh-context subagent when you can, so the main context stays clean.

## 8. Known limits of headless measurement

- Frame times come from software rendering on the build machine; compare medians of runs on the same machine (§3), don't treat milliseconds as device truth. Check the signature moments on a real mid-range phone when possible.
- A full desktop + mobile audit takes about 6-9 minutes on a 10,000 px page, most of it the stepped map and the reduced pass; plan audits at milestones and use `--only` between them.
- Synthetic touch gestures sometimes don't scroll in headless mode; the scripts detect that and fall back to native scrolling, and stop with a message if a page refuses to scroll at all (a scroll lock left on, an overlay).
- Pages behind bot protection or geo-blocks may not load; motion-audit fails its first check loudly instead of passing an empty page.
- Video autoplay and codecs differ from Safari on iOS; test video-heavy scenes on a real iPhone before handoff.
- Headless Chrome follows the OS reduced-motion setting, and an OS with animation effects off reports `reduce` (Nati's machine does). scroll-film, motion-audit and the gates' own checks set `prefers-reduced-motion` per page through puppeteer. Lighthouse starts its own Chrome, so gates forces each mode with a Chrome switch: `--force-prefers-no-reduced-motion` for motion on, `--force-prefers-reduced-motion` for motion off, and first launches the same Chrome with each switch to confirm it still honours it. Verified 2026-10-15 (Lighthouse 12.8.2, Chrome 145) with a probe page that reports `matchMedia`: without a switch the Lighthouse run saw `reduce`, with each switch its own value. `--lh-motion both` doubles the Lighthouse time; use `on` while iterating on performance.
