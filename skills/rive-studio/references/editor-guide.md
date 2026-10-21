# Editor guide: the Rive concepts this skill builds with

What the Rive editor offers (2026 state) and how to use it for the patterns in `motion-craft.md`. Used for build sheets, Editor MCP work and RML (the same object model). Exact current details: `https://rive.app/docs/llms.txt` and each page as `.md`.

## Contents
1. Files, artboards and components
2. Drawing, rigging and constraints
3. Timelines and easing
4. State machines
5. Data binding
6. Layouts
7. Text, fonts and Hebrew
8. Scripting and shaders
9. Audio
10. Accessibility in the file
11. Assets, export and plans
12. File-size rules
13. Build recipes
14. Old patterns

---

## 1. Files, artboards and components

- An artboard is a draft until it is flagged as a **Component** (Shift+N). Only Components and the default artboard are exported, so a runtime that cannot find an artboard usually means it was never flagged.
- Component instances size by **Mode**: Node scales its contents, Leaf fits them (Contain, Cover...), Layout resizes the instance's artboard so the layouts inside reflow.
- **Stateful Components** expose view model properties on each instance, as inputs or outputs: build a control once, use it many times with different data.
- An instance's source can be data-bound, so the app can swap which component shows.
- Libraries share components, view models and enums across files (Voyager plan).
- Naming: one exported component per UI unit, one state machine per artboard (`Main`), names from the contract (`rive-contract.md` §2). No `/` in names: it is the path separator for nested properties.

## 2. Drawing, rigging and constraints

- Tools: procedural shapes, Pen, Shape Builder, Shape Bend, Bucket, Pencil, Brush (pressure-sensitive variable width) and Eraser. SVG files import as editable shapes.
- Fill rules: Non-Zero, Even-Odd and Clockwise. **Feathering needs Clockwise** and the Rive Renderer.
- Rigging: bones and meshes; joysticks scrub X/Y timelines and can follow a cursor-driven object through their handle source.
- Constraints: IK, Distance, Scale, Rotation, Transform, Translation, Follow Path and Scroll (elastic or clamped physics, snap, index or percent, virtualised lists and carousels).
- Prefer bones, IK and constraints over keying vertices: smaller files and natural arcs.

## 3. Timelines and easing

- **Keyframes default to Linear interpolation.** Change every keyframe to Cubic (or Hold where a snap is intended); Linear everywhere is the most common reason Rive work feels mechanical.
- Cubic takes four numbers, so the personality curves type straight in:

| Use | Cubic values |
|---|---|
| precise, standard move | 0.2, 0, 0, 1 |
| entering (decelerate) | 0.05, 0.7, 0.1, 1 |
| exiting (accelerate) | 0.3, 0, 0.8, 0.15 |
| cinematic in-out | 0.65, 0, 0.35, 1 |
| playful back-out (overshoot) | 0.34, 1.56, 0.64, 1 |

- Elastic interpolation (amplitude, period) is for playful brands only. The graph editor's cubic value handles allow overshoot too.
- One timeline per action (`hoverIn`, `press`, `successPayoff`), loops only where the contract says so. Idle loops play once and settle (WCAG 2.2.2).

## 4. State machines

- **Layers** run at the same time, one active state each; when two layers drive the same property the lower layer wins. Use a layer per channel (pointer, status, focus, eyes) instead of multiplying states.
- **States:** Entry, Exit, Any State, single-timeline states, 1D Blend (one number) and Additive Blend (several numbers).
- **Transitions:** duration, interpolation, exit time, "pause source when exiting", and "allow exit during transition" (turn it on for interruptible motion). Conditions read view model properties or built-in artboard width, height and ratio (responsive breakpoints). Conditions on one transition are ANDed; parallel transitions between the same states give OR. Randomize Exit picks outgoing paths by weight (blinks, idle variety). Actions run at the start or end of a transition.
- **Listeners** fire on pointer enter, exit, move, down, up, drag, click, focus, blur, keyboard, gamepad, text input, semantic action and view model change. Actions: view model change, align target, focus target or traversal, report event, scripted action. Opaque Target stops pointer events reaching listeners underneath. Listeners can write their own values (pointer X/Y, the key pressed) into view model properties.
- Interactive states recipe: a pointer layer (enter, exit, down, up, plus click with a semantic tap), a status layer (transitions on the status enum), a focus layer (focus and blur drive the ring). Pointer transitions only while `isDisabled` is false. On touch there is no hover: pressed appears on pointer down.

## 5. Data binding

- A **view model** defines properties; **instances** hold values (the default instance is named "Instance"); bindings connect properties to anything bindable in the scene. Global view models are not tied to an artboard and bind by name.
- **Property types:** number, string, boolean, color, trigger, enum, image, font, blob, artboard (a Component, also from another file), nested view model, list.
- **Binding direction:** source to target (default), target to source (the file writes, the app observes), bidirectional (prefer one side), bind once.
- **Converters:** string pad, trim, convert to string, remove trailing zeros; number round, calculate, range map, interpolator (eases toward each new value over time, also for colors), formula (`{Input}`, `{{VM/prop}}`, `random()`), convert to number; boolean toggle; list number-to-list and list-to-length; script converters; groups chain them.
- **Lists** render through an artboard list; each item gets an `Index` property (staggers: index into a formula).
- **Property groups** are keyable values local to an artboard that bridge timelines and view models.
- Use enums for mutually exclusive modes, triggers for one-shot actions, target-to-source outputs for "done" or progress signals.

## 6. Layouts

- Row and Column (each with reverse), Grid and Stack; Fixed, Hug or Fill sizing with min and max; padding, margin, gap, wrap, absolute or relative position, clip.
- **Direction:** a layout's left-to-right or right-to-left setting cascades to children set to Inherit and flips row order and text alignment. Use it for Hebrew layouts.
- Layout animation: none, inherit or custom (duration and easing).
- N-Slicing on any number of axes; raster tiles stretch, repeat or hide; vector groups can be N-sliced.
- At runtime `Fit.Layout` sizes the artboard to the view so layouts reflow. Test with two viewport sizes (CLI `--viewport`).

## 7. Text, fonts and Hebrew

- Text runs with styles (font, size, weight, line height, fills, strokes, variable axes, OpenType features); auto width, auto height or fixed; overflow visible, hidden, clipped, ellipsis, fit or fit font size. Text modifiers animate characters, words or lines (position, rotation, scale, opacity, follow path, variable axes). Flatten to Shape ends editing and localisation: avoid it for anything translatable.
- Font export "Include": All glyphs, Glyphs used (only what was typed at design time), or Custom by writing system. Text set at runtime needs Custom with Hebrew, or All.
- Right-to-left text and layouts: the runtimes shape with HarfBuzz and order bidirectional text with SheenBidi. Minimum runtimes: web 2.26.7, Apple 6.7.4, Android 10.0.4, Flutter 0.14.0, React Native (new runtime) 0.1.4. Fallback fonts for missing glyphs: web 2.37.1, Apple 6.1, Android 9.7; Flutter has none, so the embedded font must hold every glyph.
- No per-text direction field is documented for the editor; scripting has a text direction with `auto` per paragraph. **Always render a check**: Hebrew with digits, Latin, punctuation, the shekel sign and nikud if used, and the direction of any modifier wipe.
- Content text belongs in HTML or native UI (standing rule 7); keep text inside Rive to labels and illustration.

## 8. Scripting and shaders

- Luau scripts by protocol: Node (custom drawing through init, advance, update, draw), Layout, Converter, Path Effect, Transition Condition, Listener Action, Blank (shared helpers) and Test. WGSL vertex and fragment shaders render to a GPU canvas.
- Minimum runtimes: web 2.34, Apple 6.13, Android 11.1, Flutter 0.14.1, React Native 0.1.5. Files with scripts must be signed to play on the web (`build-cli.md` §6).
- Use the narrowest protocol, typed inputs instead of reaching into the scene, the same view model contract as the app, no per-frame work that is not needed, and Test scripts for reusable logic. Scripts come last in the simplest-mechanism order: procedural effects, generative patterns and logic that the native tools cannot express.

## 9. Audio

MP3, WAV or FLAC, or the built-in sound library; sounds play through audio events on transitions or from scripts, with per-asset volume. Keep UI sounds under 300 ms, on direct user actions only, and bind a mute boolean.

## 10. Accessibility in the file

- Semantics give elements a role, properties, traits, state and actions; pair each click listener with a semantic tap listener. Runtime support starts at web 2.39, Apple 6.21, Android 11.10, Flutter 0.15, React Native 0.5 (iOS).
- Reduced motion is not automatic: a `prefersReducedMotion` boolean in the view model, set by the app, switches to a reduced path (instant transitions, final frames), or sets animation speed to 0 through toggle and convert-to-number converters, or swaps movement for opacity or color changes.
- Bind colors to color properties so contrast can change with the theme; no more than 3 flashes per second.

## 11. Assets, export and plans

- Assets are Embedded, Referenced (the code supplies them at load) or Hosted on Rive's CDN (Voyager plan). Referenced assets keep the file small and cacheable; the new Apple runtime no longer auto-loads hosted assets.
- Plans (2026): **Free** exports `.riv` files that play a Rive splash screen and has 3 collaborative files; **Cadet** (about $9 per seat per month yearly) removes the splash; **Voyager** adds libraries, hosted assets and premium agent models; Enterprise adds SSO and custom runtimes. For client sites, budget Cadet at least, and tell the user before an export that would ship a splash or watermark. Rive states there is no runtime fee and exports keep working.
- Community and Marketplace files are CC BY 4.0: commercial use with attribution. Remix copies a file into the account. Credit the author in the site's credits and the contract.
- Runtimes are MIT licensed. Mark `*.riv` as binary in `.gitattributes`.

## 12. File-size rules

Subset fonts (Glyphs used or Custom); size raster images to their display size and use WebP, or reference them; keep vertex counts low; Prevent Export on unused items; avoid artboard-level clipping and heavy blend modes on the web; idle animations play once; transition out of blend states when done; bones, IK and constraints instead of vertex keys; rebuild Lottie animations natively instead of importing them (an imported Lottie is typically many times larger than the native rebuild).

## 13. Build recipes

| Pattern | Build |
|---|---|
| Interactive control | stateful component; layers for pointer, status and focus (§4); view model `isDisabled`, `status` enum, `tapped` output trigger |
| Cursor parallax hero | pointer move listener writes pointer X and Y into the view model; one range map converter per depth layer (for example x0.2, x0.5, x1.0); an interpolator converter for a soft lag; on touch an idle drift instead |
| Eyes that look at something | align target with IK or distance constraints, or a joystick driven by a bound number |
| Mascot face | additive blend over expression timelines driven by numbers; Randomize Exit for blink variety; a `mood` enum drives the main layer |
| Count-up number or gauge | number property through an interpolator converter, convert to string and remove trailing zeros for the label; range map for the gauge angle |
| Staggered list | artboard list from a list property; each item's `Index` into a formula for its delay |
| Responsive breakpoints | transitions on artboard width; layouts with Fit.Layout |
| Scroll-linked moment | the page sends scroll progress 0-1 as a number; a 1D blend or a bound timeline position follows it |
| Reduced motion | `prefersReducedMotion` gates every looping and moving transition; the reduced path lands on the final pose |

## 14. Old patterns

Replaced, still loading in old files: state machine inputs (the editor's "Convert Inputs to View Models" migrates them), general events (use triggers and observed properties; open-url and audio events still work), nested text runs, nested artboards (now components), playing timelines directly from code (use state machines). Do not add new inputs or events to a file; extend its view model.
