# Build path: Rive CLI and RML

The default path when Claude builds a piece from scratch. The Rive CLI compiles RML (Rive Markup Language, an XML text format) plus Luau scripts and WGSL shaders into a `.riv` for the runtimes or a `.rev` the Rive Editor can open. Everything is text in a folder: it diffs, versions, and verifies headlessly, which is what makes it the most reliable path for an agent. Official docs: https://rive.app/docs/cli/overview (each page also served as `.md`).

## Contents
1. When to use this path
2. Setup (once per machine)
3. Project layout
4. The build loop
5. Verifying every state headlessly
6. Shipping the .riv
7. Handing off to the Rive Editor
8. Gotchas

---

## 1. When to use this path

- Claude builds the piece and the user approves results, not individual edits.
- The piece is geometric, typographic, layout-driven or procedural (Luau): icons, controls, meters, loaders, data-driven widgets, logo-geometry scenes.
- For hand-drawn illustration or character art, build the structure here (artboard, view model, state machine, motion) from the sketch's SVG shapes, then hand the art pass to the editor (section 7) or use the MCP path.

## 2. Setup (once per machine)

Installing runs a remote script from Rive's release server, so ask the user before running it:

```powershell
irm https://releases.rive.app/cli/install.ps1 | iex
rive doctor
```

- macOS and Linux: `curl -fsSL https://releases.rive.app/cli/install.sh | sh`, then add `$HOME/.rive/bin` to `PATH`.
- No sign-in is needed to create, preview, verify, screenshot, test or build an unsigned `.riv`. `rive login` (the user signs in in the browser; never type credentials for them) is needed for `--publish`, `--rev`, `push` and `pull`. On Windows the credentials live in the Windows Credential Manager.
- `rive doctor` checks version, updates, auth and the project; run it first when anything behaves oddly.

## 3. Project layout

Create one CLI project per piece inside the product repo:

```
design/rive/<piece>/
  CONTRACT.md          the contract (rive-contract.md)
  sketches/            the approved sketch
  cli/                 rive create design/rive/<piece>/cli
    rive.yaml          project settings: default artboard, publish options, push.fileId once bound
    scene.rml          the scene (split into more .rml files when it grows; they compile in path order)
    data/              view models, when split out (sample rml_split shows the pattern)
    *.luau  *.wgsl     scripts and shaders, picked up by extension
    AGENTS.md CLAUDE.md  the CLI's own agent instructions: read them before writing RML
    build/<name>.riv   build output
```

`rive create` generates a starter scene (an artboard, a timeline and a state machine that plays on load). `rive samples` copies reference projects; the most useful for this skill are `rml_vm_input` (view model data driving the scene), `rml_split` (view models in `data/`), `pointer_reactive` (pointer to view model to bindings) and `tests_demo` (Luau tests).

## 4. The build loop

1. Read the project's `AGENTS.md`, then `rive docs format` and `rive docs gotchas` (some mistakes fail silently).
2. Translate the contract into RML in stages, the order Rive recommends: wireframe (artboard, layout boxes), structure (groups, components), content (shapes from the sketch SVG), then detail (animations, state machine, bindings). Verify after each stage.
3. Look up every type before using it instead of guessing names: `rive schema <Type>` for properties, defaults and enums; `--bindable` and `--animatable` for what data binding and keyframes can reach; `rive schema --search <text>` to find a type.
4. RML facts that bite: one root `<Rive version="1" kind="fragment">`; element names are Rive type names, attributes are properties; references are attributes ending in `Id` with ids like `0:12`, unique across all files; colors are ARGB hex without `#` (`FF2457FF`); rotation is in radians; animation timing is in frames (60 fps by default, so 150 ms is 9 frames); a fragment never declares a `Backboard` (settings go in `rive.yaml`).
5. Keep the user's preview running in its own terminal: `rive design/rive/<piece>/cli`. It rebuilds and reloads on every save, so the user watches the piece grow.
6. After each stage: `rive <dir> --verify --format=json` (exit 1 on errors), then `rive inspect <dir> --summary` and check that `problems` is empty in `rive inspect <dir> --json`. A clean compile does not prove correct behaviour or looks, so section 5 follows.

## 5. Verifying every state headlessly

Screenshot each contract state by driving the view model and the pointer. Create the output folder first; paths resolve against the current directory, not the project.

```bash
mkdir -p design/rive/<piece>/shots
rive <dir> --screenshot=design/rive/<piece>/shots/rest.png --advance=1
rive <dir> --screenshot=design/rive/<piece>/shots/hover.png --pointer=move@120,60 --advance=12
rive <dir> --screenshot=design/rive/<piece>/shots/loading.png --data=status=loading --advance=30
rive <dir> --screenshot=design/rive/<piece>/shots/progress-70.png --data=progress=70 --advance=30
rive <dir> --screenshot=design/rive/<piece>/shots/narrow.png --viewport=320x700 --advance=1
```

- `--data=path=value` sets a property on the artboard's bound view model instance (paths are relative to it, nested view models use `/`); repeat the flag for several values.
- `--pointer=kind@x,y` with `move`, `down`, `up`, `exit`, `click`, `drag`, in artboard coordinates. Quote drags: `--pointer='drag@200,300>200,80:12'`. Put `--advance` between clicks on the same control, because a value written by a listener is visible to the next listener only one frame later.
- `--advance` takes frames, `Ns` or `Nms`. Without it the capture shows the authored rest pose, not the running state.
- `--data-dump` exports view model values as JSON during the run: use it to prove that triggers and listeners changed the values the code will read.
- **Prove interactions both ways.** For a toggle, capture rest, one click and two clicks: rest and on must differ, and off must equal rest.
- Responsiveness: capture at two `--viewport` sizes. Without layout components the artboard crops instead of reflowing.
- Performance: `rive <dir> --bench=600` reports advance and render time per frame and WASM memory growth. Record the numbers in the ledger.
- Luau logic gets unit tests (`Tests` scripts) run by `rive <dir> --test --format=json` (exit 6 on failures).

Review the PNGs yourself against the approved sketch and the motion craft rubric before showing them. Then show a contact sheet of the states to the user.

## 6. Shipping the .riv

| Build | Command | Use |
|---|---|---|
| Unsigned | `rive <dir> --once` | development, and production files without scripts |
| Signed | `rive <dir> --publish` (requires login) | any file with scripts that ships to the web: web runtimes and the Rive CDN reject unsigned scripts |

- `--publish` adds a watermark unless the project is bound to a file in a workspace on the Cadet plan or higher. Bind it with `rive push` (it records `push.fileId` in `rive.yaml`). Tell the user before publishing if the plan is unknown.
- Whatever the build mode, screenshot the shipped `.riv` through the probe before handoff and look for a splash screen or watermark: plan rules change, the rendered file is the evidence.
- `--optimize` shrinks the output. Copy the built file to the runtime path in the contract, then run `scripts/rive-probe.mjs` on it: it loads the file in the real web runtime and checks it against the contract.

## 7. Handing off to the Rive Editor

- `rive push` uploads the build to the bound file in the user's Rive account (requires login; overwrites the live editor file, so confirm with the user first). `rive pull` brings editor changes back and overwrites the local project.
- `rive <dir> --rev=<path>` writes an editor `.rev` the user can open and polish.
- `rive create <dir> --from-remote-file` converts a file from the user's account into an RML project; `--from-rev=<file.rev>` converts a downloaded `.rev`. This is how an editor-made file comes back into the text loop.

## 8. Gotchas

- In agent shells, commands that overwrite (`push`, `pull`) stop and ask unless given `--yes`. Never pass `--yes` without the user's go-ahead.
- `--screenshot` to a missing folder fails with only `screenshot failed: <path>`.
- `--viewport` resizes the artboard itself, so it tests layout, not scaling.
- The CLI is new and changes often: trust `rive docs`, `rive schema` and `rive --help` over this file when they disagree, and note the difference in the ledger.
