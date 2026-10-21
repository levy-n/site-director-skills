---
name: rive-studio
description: 'Designs and ships beautiful, distinctive Rive (rive.app) interactive animations for websites and apps. Runs a guided AskUserQuestion interview, shows running motion sketches the user picks from, fixes a file-to-code contract (artboards, state machines, view models), builds the .riv with the Rive CLI (RML), live in the Rive Editor through its MCP server, or as an exact build sheet, then integrates and verifies it on the web (React, Next.js, Astro) and native (Android Compose, iOS, Flutter, React Native) with data binding, accessibility, reduced motion, RTL and performance budgets.'
when_to_use: 'Any Rive work: an interactive animation, micro-interaction, animated button, toggle or icon, a mascot or reacting character, loading and success states, an interactive hero or scroll moment, a data-driven widget; connecting Rive to Claude Code (Editor MCP or Rive CLI); wiring, auditing or debugging a .riv file, state machines, data binding or view models. Hebrew: "Rive", "רייב", "אנימציית Rive", "אנימציה אינטראקטיבית", "תעצב לי ב-Rive", "דמות מונפשת", "מסקוט", "כפתור מונפש", "מיקרו-אינטראקציות", "אנימציית טעינה", "חבר את Rive", "Rive MCP", "קובץ riv". Not for whole scroll-story sites (pattern-breaker), Lottie, video, or CSS-only effects.'
argument-hint: "[what to design, or a path to a .riv file]"
license: Proprietary (MediaWave)
metadata:
  author: mediawave
  version: "1.1.0"
  calibrated-for: "claude-opus-5-5 (2026-10)"
  research-date: "2026-10-12"
---

# Rive Studio

Takes a Rive piece from intent to a shipped, verified file: a guided interview, motion the user sees running before anything is built, a contract between the file and the code, a build in Rive, an integration on the target platform, and a verification of every state. Nothing is finished until each state has been rendered and measured.

Request: **$ARGUMENTS**

Skill folder: `${CLAUDE_SKILL_DIR}`. In the reference files and templates, `<skill>` (or `${CLAUDE_SKILL_DIR}`) means this folder and `<skills>` means `${CLAUDE_SKILL_DIR}/..` (the skills root); `references/`, `assets/` and `scripts/` are inside this folder; `design/rive/` means the target project.

## The stance

Rive work looks generic when it starts from the tool's showcase: the blob mascot, elastic buttons, the day and night toggle, eyes that follow the cursor. It looks exceptional when it starts from one sentence only this brand could say, expresses it through states the product really has, and moves with one consistent personality. So this skill decides the motion before the art, shows it before building it, binds it through names both sides agree on, and judges the rendered result rather than the code.

## Standing rules

Each rule carries its reason; generalise from the reasons.

1. **Run the intake before any design decision** (`references/intake.md`, Hebrew bank `references/intake-bank.rtl.md`). A vague start produces the category median. Recommended option first, every payload linted, questions only from the main thread.
2. **The user chooses motion they have seen.** Concepts are picked from running sketches (`references/motion-sketches.md`), never from descriptions: words like "soft bounce" mean something different to everyone.
3. **Contract first; names are an API** (`references/rive-contract.md`). The file and the code talk only through names, and drift fails silently. Never rename without approval and a matching code change.
4. **Data binding is the interface.** View model properties, triggers and enums for everything new; state machine inputs only for legacy files and runtimes without data binding.
5. **Rive earns its bytes.** Use it for state, interactivity, character or live data. A fade or slide that CSS or the native toolkit can do stays there.
6. **Simplest mechanism first:** timeline, then state machine, then view model and bindings, then listeners, layouts and constraints, and Luau scripts last. Every extra mechanism is something to debug on every platform.
7. **Meaning lives outside the canvas.** Text, headings and controls stay in HTML or native UI; the canvas decorates and reacts. Keyboard and screen-reader paths drive the same view model as the pointer. Search engines and assistive tech cannot read a canvas.
8. **Every state is designed, and idle rests.** Rest poses for idle, hover, pressed, disabled, loading, success, error and empty as the role needs; idle and keyboard focus are always designed for interactive pieces (the DOM control keeps its focus ring, an `isFocused` pose may add to it); every transition interruptible; decorative motion stops by itself or can be paused within 5 seconds (WCAG 2.2.2); reduced motion shows final frames.
9. **RTL is designed, not assumed.** The canvas never mirrors itself: direction-bearing motion gets an RTL variant through an `isRtl` property or a layout's right-to-left direction. The runtimes shape Hebrew (HarfBuzz and SheenBidi, from the versions in `editor-guide.md` §7), but Hebrew text inside Rive ships only after a rendered check with digits, Latin, punctuation and nikud, and only with the Hebrew glyphs exported.
10. **Budgets are part of the design.** File size follows the intensity (60, 150 or 600 KB), pieces below the fold load lazily, everything pauses off screen, the canvas box is reserved so nothing shifts, one runtime package per site.
11. **Judge the rendered piece, with honest evidence.** Label every claim Verified (observed rendering), Inspected (configuration read, not run) or Unverified (with the check that remains). Never claim to have edited or verified a `.riv` without the tools that prove it.
12. **Live docs over memory.** Rive's CLI, MCP and runtimes change monthly. Before writing RML, runtime code or editor steps from memory, check `rive docs` and `rive schema`, or the official page as markdown (`https://rive.app/docs/<path>.md`; index at `https://rive.app/docs/llms.txt`), and note differences from these references in the ledger.
13. **Nati's house rules.** Questions in Hebrew; no en dash, em dash or maqaf in any output, chat included (use "-"); fonts are chosen from rendered specimens (`anthropic-skills:nati-design-prefs`); facts, numbers and testimonials are never invented. Brief and contract are written in English (they hold ASCII names and code facts); anything written for Nati to read in Hebrew goes in a `.rtl.md` file.

## First-instinct check

Check the plan against these before the sketches and the build against them before handoff. A match needs a brief-specific reason written next to it; otherwise change it. Full catalog with alternatives: `references/motion-craft.md` §11.

1. A round blob mascot with big eyes that waves and blinks.
2. Elastic overshoot on everything.
3. The teddy bear that covers its eyes on the password field; the day and night toggle with sun, moon and stars.
4. Eyes following the cursor as the only interaction.
5. Confetti on every success; a gradient ring spinner.
6. A liquid or gooey button; hover equals scale 1.1 plus glow.
7. Big idle loops that never rest.
8. Neon glow, glass and feathered blur everywhere; a purple-to-blue palette.
9. Text and headings drawn inside the canvas.
10. Rive used for a fade that CSS could do.

## Choose the mode

| The user... | Mode | Start with |
|---|---|---|
| wants a new piece: a control, a character, a hero moment, system states | **Create** | `references/intake.md` |
| has a `.riv` to wire up (from a designer or the Rive community) | **Integrate** | probe the file, then `intake-bank.rtl.md` §9, the contract, the platform reference |
| has a site or app that feels static | **Upgrade** | screenshots of the product, `intake-bank.rtl.md` §9, then Create from round 2 |
| wants Claude connected to Rive | **Connect** | `references/build-cli.md` §2 and `references/build-mcp.md` §1 |
| has a Rive integration that misbehaves | **Fix** | `scripts/rive-audit.mjs`, the probe, the platform reference's troubleshooting |

If it is unclear whether a file already exists, ask that one question first.

**Find the project before writing anything.** If the working directory holds no build file for the product the user names (`package.json`, `build.gradle.kts`, `pubspec.yaml`, `Package.swift`), ask for the project path. Design files, payloads and installs go into that project, never into the home folder. Only Create, Integrate and Upgrade run the intake; Connect and Fix go straight to their references.

## Create

1. **Intake rounds 0-2** (`intake.md`, `intake-bank.rtl.md`, and `motion-craft.md` §2, §3 and §11 for round 2). Silent research first: the stack, tokens, fonts, existing `.riv` files, design docs (on a site-director project also its dossier, decision log and storyboard, which settle most questions: `intake.md` §9), and which Rive tools work (`rive doctor`, the MCP tool list). After round 2, write the States list into the brief. A single component runs the short flow in `intake.md` §3 (one round, two sketches, one concept call, budget subtle).
2. **Motion lab** (`motion-sketches.md`). Two or three sketches from different forcing constraints, each stepped through state by state in the browser before the user sees them; show the board; then round 3.
3. **Contract** (`rive-contract.md`), written once the concept is chosen: names, types, directions, states, Rive-to-app triggers, the motion spec from the chosen sketch, accessibility and reduced motion. Compile `design/rive/MOTION-BRIEF.md`; ask round 4 with the brief as preview.
4. **Build in Rive** on the chosen path (below), verifying after each stage.
5. **Probe** the exported `.riv` against the contract in the real runtime.
6. **Integrate** on the platform (`web-runtime.md`, `mobile-runtimes.md`), starting from `assets/code/`.
7. **Verify** (`references/verification.md`): every state captured on desktop and mobile, reduced motion, RTL, keyboard, budgets, then a fresh-context critic pass with the rubric.
8. **Handoff**: brief and contract current, the typed constants generated, a "how to extend" note, the ledger closed.

The ledger is the `## Ledger` section of `design/rive/MOTION-BRIEF.md`; copy this checklist into it and keep it current:

```
- [ ] 0 evidence gathered (stack, tokens, files, tools)
- [ ] 1 intake rounds answered or assumed
- [ ] 2 sketches built, clicked through, shown; concept chosen
- [ ] 3 contract written; brief confirmed
- [ ] 4 built on path: ____ ; verified per stage
- [ ] 5 probe clean against the contract
- [ ] 6 integrated on: ____
- [ ] 7 states captured, reduced motion, RTL, keyboard, budgets, critic >= 26/33
- [ ] 8 handoff written
```

## Build paths

| Path | Choose when | Reference |
|---|---|---|
| **Claude builds in code** (Rive CLI, RML) | the default: geometric, typographic, layout, data-driven or procedural pieces; every state can be screenshotted headlessly | `references/build-cli.md` |
| **Claude builds in the Editor** (MCP) | illustration, bones and meshes, co-editing with the user, or wiring structure inside an existing editor file | `references/build-mcp.md` |
| **Build sheet** | no tools, or a designer builds | `assets/templates/BUILD-SHEET.template.rtl.md` plus `references/editor-guide.md` |
| **Existing or community file** | a `.riv` already exists | probe it; for community files check the license and replace what is generic |

Paths combine: the CLI can build structure and motion and write a `.rev` for an art pass in the editor; `rive create --from-remote-file` brings an editor file back into the text loop. Installing the CLI, registering the MCP server, any npm install in the user's project, `rive push`, `rive pull` and `--publish` all change things beyond the design files: ask before each, and never take them on autopilot.

## Integrate

| Platform | Reference | Starter |
|---|---|---|
| Next.js, React | `references/web-runtime.md` | `assets/code/RiveStage.tsx` |
| Astro, plain HTML, any static page | `references/web-runtime.md` | `assets/code/rive-stage.js` |
| Android (Jetpack Compose) | `references/mobile-runtimes.md` | `assets/code/RiveStage.kt` |
| iOS, Flutter, React Native | `references/mobile-runtimes.md` | the reference's minimal examples |

## Verify

Read `references/verification.md` for the full gate. In short: `rive-probe.mjs --contract --shots` on every exported file; for CLI projects the screenshot loop; the integrated page or app captured in every state at 1440x900, 1440x700 and a phone viewport on the web, on device for native; reduced motion, RTL and keyboard checked; file size, layout shift and frame cost within budget; then one critic agent scores the captures with the rubric (`motion-craft.md` §12) against the approved sketch. Fix and re-capture until it passes.

## Files

```
design/rive/
  MOTION-BRIEF.md            project-level brief and ledger
  .ask/                      linted question payloads
  <piece>/
    CONTRACT.md              names, types, directions, states, motion spec
    sketches/                a.html b.html c.html, and board.html (generated, self-contained)
    svg/                     cleaned shapes for import
    cli/                     the Rive CLI project (CLI path)
    BUILD-SHEET.rtl.md       build sheet path only
    shots/                   captures used as evidence
```

## Delegation

- **Sketches:** one agent per forcing constraint, launched in one message, each writing one sketch file (`motion-sketches.md` §3).
- **Critic:** one fresh agent at high effort at each milestone (after the first complete build, when every state renders, and again before handoff), given only the captures, the approved sketch, the contract and the rubric.
- Do the building, the questions and the user-facing decisions in the main thread. The question tool does not exist inside subagents.

## Tools

All scripts are Node ESM (Node 20+); run them from the project root. `rive-probe` needs `puppeteer-core` (no browser download; it finds the local Chrome or Edge) or `puppeteer`, and uses the runtime the project ships: `@rive-app/canvas-lite` when `package.json` lists it (or its React wrapper), else `@rive-app/webgl2`, else `@rive-app/canvas` (CDN fallback otherwise). `lint-ask.mjs` is a vendored copy of pattern-breaker's; refresh it from there instead of editing it here. Ask before installing anything into the user's project; or keep tooling in a separate folder and pass `--modules <folder>`. Install on a drive with free space; `npm_config_cache`, `TEMP` and `TMP` can point elsewhere when the system drive is full.

```bash
node ${CLAUDE_SKILL_DIR}/scripts/lint-ask.mjs design/rive/.ask/round1.json        # validate a question payload
node ${CLAUDE_SKILL_DIR}/scripts/rive-probe.mjs public/rive/hero.riv               # list artboards, machines, view models, enums
node ${CLAUDE_SKILL_DIR}/scripts/rive-probe.mjs public/rive/hero.riv --contract design/rive/hero/CONTRACT.md --shots design/rive/hero/shots
node ${CLAUDE_SKILL_DIR}/scripts/rive-probe.mjs --contract design/rive/hero/CONTRACT.md --emit-ts src/rive/hero.contract.ts
node ${CLAUDE_SKILL_DIR}/scripts/sketch-board.mjs design/rive/hero/sketches        # self-contained board.html from a.html, b.html, c.html
node ${CLAUDE_SKILL_DIR}/scripts/rive-audit.mjs .                                   # legacy packages and APIs, cleanup, a11y, reduced motion, sizes
node ${CLAUDE_SKILL_DIR}/scripts/selftest.mjs                                       # after editing this skill
```

## Gotchas

- Keyframes default to Linear interpolation; set Cubic with the personality's curve on every key.
- An artboard is exported only when it is flagged as a Component (or is the default artboard); "artboard not found" at runtime usually means a draft.
- Free-plan exports play a Rive splash screen and CLI `--publish` watermarks without a Cadet workspace: tell the user before shipping client work on the free plan.
- Rotation is degrees through the Editor MCP and radians in RML; RML animation time is frames (60 fps). Read the schema before writing any value.
- Data-binding writes apply on the next advance: pausing in the same tick shows the old values (the starters wait two frames before holding a frame).
- A CLI screenshot without `--advance` shows the authored rest pose, not the running state.
- A `.riv` with Luau scripts must be built with `--publish` (signed) to play on the web; unsigned scripts are rejected. `--publish` watermarks unless the file is bound to a Cadet-plan workspace.
- The Editor MCP only exists while the desktop Editor runs with a file open; start Claude Code after it.
- A listener without a target is not exported to the runtime.
- Headless Chrome may report `prefers-reduced-motion: reduce`; set the emulation explicitly in every capture or you film the reduced branch.
- Set every app-to-Rive property in the load callback (`onLoad`, React `onRiveReady`), before the first frame, or the page flashes the file's default pose (the wrong direction on a Hebrew page).
- `rive <dir>` (the CLI preview) never exits: start it in the background or in the user's terminal tab.

## Other design skills

When site-director conducts a client site, it decides whether Rive is used and where, and hands a piece here only after that piece's storyboard row exists. Round 0 then reads the world dossier, the decision log and the storyboard and does not re-ask what they settle; the row and its dossier items are the Material of the sketches, so no second concept lab runs; reduced motion is strict, and the piece joins the site's one clock (`references/web-runtime.md` §11).

When pattern-breaker runs the site, on its own or under site-director, a Rive piece is one of its signature moves: the scroll score (under site-director, the storyboard, which is also the score) decides where it lives, this skill designs and builds it, and scroll progress reaches the file as a view model number written from the engine's clock. impeccable and frontend-super own the rest of the interface; their "motion sparingly" defaults are right for product UI and stay the default here too. Use `anthropic-skills:nati-design-prefs` for any text set inside a Rive file, site-gate-audit before shipping a client site, and mobile-ux-fixer for device-specific defects.

## References

| File | Read when |
|---|---|
| `references/intake.md`, `references/intake-bank.rtl.md` | starting Create, Integrate or Upgrade (not Connect or Fix) |
| `references/motion-craft.md` | round 2 of the intake (§2, §3, §11), the sketches, and the critic |
| `references/motion-sketches.md` | building and showing the sketches |
| `references/rive-contract.md` | writing or changing the contract |
| `references/build-cli.md` | the CLI path, or installing the CLI |
| `references/build-mcp.md` | the Editor MCP path, or connecting it |
| `references/editor-guide.md` | editor concepts: state machines, data binding, layouts, text, scripting; writing a build sheet |
| `references/web-runtime.md` | web integration, React, Next.js, Astro, the one clock with the site's motion engine, rest frame and late load, troubleshooting |
| `references/mobile-runtimes.md` | Android Compose, iOS, Flutter, React Native |
| `references/verification.md` | the verification gate and the probe |
| `assets/templates/*` | MOTION-BRIEF, CONTRACT, BUILD-SHEET |
| `assets/sketch/sketch.template.html` | the sketch engine (one file per concept) |
| `assets/code/*` | starter components per platform |

## Portability

Everything works in any Agent Skills client. Where this file says "the question tool", "subagents" or "a browser", use the equivalent you have; without a question tool, ask the same questions as one numbered message and wait, never answering them yourself. Without the Rive CLI or the Editor MCP, the build sheet path still produces a precise, verifiable result.
