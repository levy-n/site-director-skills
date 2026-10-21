# Verification: the gate before anything is called done

A Rive piece is done when every state has been rendered and seen, the file matches the contract, and the budgets hold on a phone, not when the code compiles or the editor preview looks right.

## Contents
1. Evidence labels
2. The gate
3. Probe the file
4. Capture the integrated piece
5. Reduced motion, RTL, keyboard, long motion
6. Budgets and how to measure them
7. The critic pass
8. Reporting

---

## 1. Evidence labels

| Label | Means | Example |
|---|---|---|
| **Verified** | the behaviour was observed rendering in the target runtime | probe shot of `status=error` shows the tilt; browser capture at 390 px |
| **Inspected** | configuration or code was read, but not run | the state machine has a transition on `isHovered` |
| **Unverified** | a needed file, tool, device or doc was unavailable; name the remaining check | "iOS not run: needs a Mac; check the success payoff on device" |

Editor evidence is not runtime evidence, and a clean compile is not a correct look. Each check below says which label it can earn.

## 2. The gate

| Check | How | Pass |
|---|---|---|
| Contract | `rive-probe.mjs --contract` | no missing or mistyped name (errors); every extra name reviewed (warnings) |
| States | probe `--shots`, CLI screenshots, browser captures | every contract state captured; states differ where they should (toggle proof: rest differs from on, off equals rest) |
| Motion against the sketch | frame strips of each beat (start, 25%, 50%, end) beside the sketch's timing table | durations within 20%, same easing character |
| Interruption | hover out mid-transition, double trigger, `status` changed mid-loop | no snap, no stuck state |
| Reduced motion | emulate `prefers-reduced-motion: reduce` | client websites: final frames, no loops, no parallax, no scrubbed values, no pointer following (strict, §5); apps: the reduced behaviour the brief records; meaning kept in both |
| RTL | the page with `dir="rtl"` | every direction-bearing motion mirrored |
| Keyboard and screen reader | Tab, Enter, Space; read the accessible name | focus visible, the same states reached, name announced |
| Long motion | watch 6 seconds | decorative motion stopped or pausable |
| File size | bytes of each `.riv` | within the brief's budget |
| Layout shift | load the page and scroll | the piece adds 0 to CLS (its box is reserved) |
| Largest paint | a performance trace with and without the piece | LCP unchanged, or a poster image carries it |
| Frame cost | CLI `--bench=600`, or a browser performance trace | controls under about 2 ms per frame on desktop; a hero under about 6 ms on a mid-range phone |
| Off screen | scroll it away, switch tabs | rendering stops |
| Clock at rest | on a page with the pattern-breaker engine, after a fresh load with no input, after input, after a window resize and after scrolling the piece out and back: wait the settle window, then read `engine.frameJobCount` and the piece's `rive.frameCount` twice, 1 s apart | 0 jobs; `frameCount` does not rise (the machine rests, `rive.isPlaying` is false) (`web-runtime.md` §11) |
| Late load | a piece with an intro: delay the `.riv` past the cutoff (DevTools throttling or a delayed local server) | the rest frame stays, the intro never starts late, the late instance is cleaned up (`web-runtime.md` §12) |
| Memory | mount and unmount 20 times (route changes) | no growth: instances are cleaned up |
| Critic | section 7 | at least 26 of 33, no zero |

## 3. Probe the file

`scripts/rive-probe.mjs` loads a `.riv` in headless Chrome with the official web runtime and reports what the runtime really sees.

```bash
npm i -D puppeteer-core                              # once, after asking; uses the local Chrome or Edge, no download
node ${CLAUDE_SKILL_DIR}/scripts/rive-probe.mjs public/rive/hero.riv --modules G:/tools/rive-qa   # or keep tooling outside the client repo
node ${CLAUDE_SKILL_DIR}/scripts/rive-probe.mjs public/rive/hero.riv
node ${CLAUDE_SKILL_DIR}/scripts/rive-probe.mjs public/rive/hero.riv --contract design/rive/hero/CONTRACT.md
node ${CLAUDE_SKILL_DIR}/scripts/rive-probe.mjs public/rive/hero.riv --contract design/rive/hero/CONTRACT.md --shots design/rive/hero/shots
node ${CLAUDE_SKILL_DIR}/scripts/rive-probe.mjs --help
```

- Without flags it prints artboards, state machines with their inputs, view models with typed properties, and enums, and writes the same as json with `--out`.
- `--contract` compares against the json block of the contract: missing or mistyped artboards, state machines, view models, properties, enum values and an exceeded `maxKB` are errors (exit 1); properties in the file but not in the contract are warnings.
- `--shots <dir>` renders each entry of the contract's `shots` array: sets the listed properties, fires the listed triggers, advances the given time, and writes a PNG per shot plus a contact sheet.
- `--emit-ts <file>` writes typed constants from the contract (no file needed).
- It uses the runtime the project ships, so it tests the version that ships: `@rive-app/canvas-lite` when `package.json` lists it or `@rive-app/react-canvas-lite`, else `@rive-app/webgl2` when installed, else `@rive-app/canvas`; force one with `--renderer canvas-lite|canvas|webgl2`. When the chosen runtime is not installed it loads the CDN build and says so: `--runtime-version` when given, else the exact canvas-lite version pinned in `package.json`, else 2.44.2. The first output line names the runtime and whether it came from the project or the CDN.
- A project that declares only `@rive-app/react-canvas-lite`, with nothing installed, gets a hint: the wrapper pins its own canvas-lite version, so pass that version as `--runtime-version` (`npm view @rive-app/react-canvas-lite@<version> dependencies`; for example 4.36.0 depends on canvas-lite 2.44.0), or the probe tests a runtime the site does not ship.
- It needs puppeteer, or puppeteer-core with a local Chrome or Edge (auto-detected; `--chrome <path>` otherwise). Events cannot be listed statically: an event in the contract counts as verified only when it fires during the shots.

The probe can earn **Verified** for structure and for the look of each shot in the web runtime. It cannot prove native runtimes.

## 4. Capture the integrated piece

- Drive the real page in a browser (the built-in browser pane, Playwright or puppeteer) at 1440x900, 1440x700 and 390x844. The short desktop catches a box sized from the viewport height that crops the piece, a sticky stage that no longer fits one screen, and a hero whose canvas drops below the fold.
- Set `prefers-reduced-motion: no-preference` explicitly for the normal pass; some headless browsers default to reduce.
- Reach states the way users do: hover, press, focus with Tab, and the product's own events (submit the form, finish the upload). For states that are hard to reach, the starter components accept a QA query hook, `?rive=<property>:<value>` (for example `?rive=status:error` or `?rive=celebrate:fire`). It is active only on local hosts (localhost, 127.0.0.1, `*.localhost`), so it also works on a local production build and never on the live site.
- Capture a short frame strip of each transition (several screenshots at fixed delays) instead of a single still, and compare it with the sketch.
- Review the frames yourself before showing them; then show the user a contact sheet of the states.

## 5. Reduced motion, RTL, keyboard, long motion

- Reduced motion: emulate the media feature, reload, and capture every state again. Each must show its final frame; nothing loops, nothing is scrubbed by the scroll, nothing follows the pointer; a state may swap instantly when the visitor reaches it. This single strict tier is the policy for client sites, including every site site-director conducts.
- Documented exception: MediaWave's own site (mediawave.co.il) runs a two-tier policy in its engine. REDUCE (its accessibility stop switch, `?reduce=1`, the prerender) shows the rest frames and never loads Rive; CALM (the OS setting) keeps the visitor's own pointer, press and scroll-driven motion and drops loops and intros; `?motion=full` forces full motion for QA. Judge MediaWave pieces against that policy, and never copy it to a client site.
- RTL: capture with `dir="rtl"` on the page; arrows, progress direction, swipes and parallax must run the other way. The `isRtl` (or equivalent) property in the contract decides it inside the file.
- Keyboard: Tab to the control, check the visible focus, press Enter and Space, and confirm the same states as the pointer path. Check the accessible name in the accessibility tree.
- Long motion: anything decorative that moves on its own for more than 5 seconds must stop by itself or offer a pause (WCAG 2.2.2).

## 6. Budgets and how to measure them

| Budget | Subtle | Balanced | Showpiece |
|---|---|---|---|
| `.riv` size per page | 60 KB | 150 KB | 600 KB plus out-of-band assets |
| Above the fold | not recommended | poster or static first frame | poster image required |
| Frame cost (phone) | under 2 ms | under 4 ms | under 6 ms |
| Concurrent canvases | up to 3 | up to 3, others paused | 1 scene, controls paused |

Measure: file size from disk; CLS and LCP with a performance trace or Lighthouse on mobile settings; frame cost with `rive <dir> --bench=600` for CLI projects or the browser's performance panel for others. Above budget: remove unused artboards and timelines, subset or drop embedded fonts, move raster images out of band, simplify feathered shapes, and pause pieces that are not in view.

## 7. The critic pass

Launch one fresh agent at high effort (Agent tool) at each milestone: after the first complete build (every contract state renders), and again before handoff. Give it only: the shots and frame strips, the approved sketch, the contract, the brief's avoid list, and the rubric in `motion-craft.md` §12. It scores each criterion 0-3 with one line of evidence per score and lists the three changes with the biggest gain. The main thread vets each finding (the critic can be wrong), fixes what holds, re-captures, and records scores in the brief's ledger. Ship at 26 of 33 or more with no zero.

## 8. Reporting

End with: what was built (paths), the gate table with the label each check earned, the critic score, the budgets measured, and every Unverified item with the exact check that remains. If an assumption shaped the result (autopilot), name it.
