# The contract: names, types and directions

The `.riv` file and the code are two programs that talk only through names. A renamed property or a changed enum value breaks silently: no error, the animation just stops reacting. The contract makes that interface explicit, and the probe enforces it. Template: `assets/templates/CONTRACT.template.md`, one per piece, at `design/rive/<piece>/CONTRACT.md`.

## Contents
1. What the contract holds
2. Naming rules
3. Directions and mechanisms
4. Instances and binding
5. Keeping it true
6. Typed constants for the code

---

## 1. What the contract holds

- **Files:** the editor source, the runtime path, and how assets load (embedded, referenced and self-hosted, or Rive CDN).
- **Structure** as a json block the probe reads: artboards with their state machines and view model, view models with typed properties (each with its direction), enums with their values, legacy events if any, and `shots` (named states the probe renders).
- **Properties table:** meaning, direction, range, who sets it and what it drives.
- **States:** how each is reached, its rest pose, where it can go, and what happens when interrupted.
- **Signals** the file sends to the code: Rive-to-app triggers and properties the code observes.
- **Motion spec:** the approved sketch's timing table.
- **Accessibility and reduced motion:** the accessible name, the keyboard path, the reduced-motion behaviour.
- **Change log.**

Write the contract when the concept is chosen, before any building. Show its summary in the confirmation question.

## 2. Naming rules

Runtime-facing names are an API. Never rename one without the user's approval, a contract change-log entry, and the matching code change in the same step.

| Element | Rule | Examples |
|---|---|---|
| Any runtime name | ASCII letters and digits only: no spaces, no Hebrew, no punctuation; never ship editor defaults like "State Machine 1" | |
| Artboard, view model, enum | PascalCase noun | `Hero`, `CtaButton`, `HeroVM`, `Status` |
| State machine | `Main` when an artboard has one; otherwise its purpose | `Main`, `Mood` |
| Boolean property | camelCase starting with `is`, `has` or `should` | `isHovered`, `hasError`, `prefersReducedMotion` (the one agreed exception, named after the CSS media feature and Rive's docs) |
| Number property | camelCase; the range or unit goes in the contract, or in the name when not normalised | `progress` (0-100), `pointerX` (-1..1), `delayMs` |
| App-to-Rive trigger | an imperative verb | `celebrate`, `bump`, `shake` |
| Rive-to-app trigger | past tense, what happened | `ctaPressed`, `stepCompleted`, `impact` (a moment, for haptics) |
| Enum property and values | a singular noun; values lowercase | `status`: idle, loading, success, error |
| Rive event (legacy, open-url, audio only) | camelCase | `openPricing` |
| Layers, timelines (internal) | purpose names, so the build sheet and MCP edits stay readable | `body`, `eyes`, `glow`, `hoverIn` |

## 3. Directions and mechanisms

Every property has one direction:

| Direction | Owner | Mechanism (current method) | Example |
|---|---|---|---|
| app to Rive | the code sets it | view model property | `progress`, `status`, `isHovered` |
| app to Rive, one-shot | the code fires it | view model trigger | `celebrate` |
| Rive to app | a listener or script in the file sets it; the code observes it | view model property the code subscribes to | `selectedIndex` from a picker drawn in Rive |
| Rive to app, one-shot | the file announces a moment | a view model trigger the code observes: React `useViewModelInstanceTrigger(name, vmi, { onTrigger })`, web `vmi.trigger(name).on(cb)`, Android `getTriggerFlow`, iOS `stream(of:)` | `ctaPressed`, `impact` |
| Rive to app, legacy | open-url and audio, or an old file | Rive event | only where a trigger cannot do it |
| both | avoid; if unavoidable, write which side owns it at which moment | view model property | a slider that both the app and the user move |

**Current method:** data binding through view models for everything new. **Old patterns:** state machine inputs (number, boolean, trigger set by name, nested inputs by path). Use them only for existing files and runtimes that lack data binding, and do not migrate a working legacy file without a reason the user agrees to.

Keep meaning in the app and presentation in the file: the code says `status = "error"`; the file decides that error means a tilt, a color and a concern pose. Code never pokes internal shapes or timelines.

## 4. Instances and binding

- Each artboard is assigned a view model; the file carries a default instance with sensible defaults, so the piece looks right before the code sets anything.
- Named instances hold presets (for example `light` and `dark`); prefer binding theme colors from the app's tokens over duplicating instances.
- Several pieces on one page each get their own instance unless the contract says they share state.
- Initial values: the code sets every app-to-Rive property once right after load, so a slow network never shows a default that contradicts the page (a "success" pose on an empty form).
- Runtime calls for binding, observing and firing differ per platform: `web-runtime.md` and `mobile-runtimes.md`.

## 5. Keeping it true

- **Web runtime, any `.riv`:** `node ${CLAUDE_SKILL_DIR}/scripts/rive-probe.mjs <file.riv> --contract design/rive/<piece>/CONTRACT.md` loads the file in the real runtime, lists artboards, state machines, view models, properties and enums, and reports missing and mistyped names as errors and extra names as warnings. `--shots <dir>` renders each entry of `shots` plus a contact sheet.
- **CLI projects:** `rive inspect <dir> --json` and the screenshot loop in `build-cli.md`.
- **Editor MCP:** re-query names and types after every edit (`build-mcp.md`).

Run the probe after every export and before every handoff. A contract that drifted is worse than none, because everyone trusts it.

## 6. Typed constants for the code

`rive-probe.mjs --emit-ts <out.ts>` writes the contract as typed constants (artboard, state machine, view model and property names, enum unions), so components import names instead of repeating strings. Regenerate it whenever the contract changes; the type checker then finds every call site that the change breaks.
