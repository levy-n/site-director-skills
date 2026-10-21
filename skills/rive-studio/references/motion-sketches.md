# Motion sketches: the user sees the motion before Rive

Choosing motion from words fails: "playful with a soft bounce" means something different to everyone. A sketch takes minutes and saves hours of Rive rework. Sketches are disposable: they prove timing, easing, choreography and states, not final art.

## Contents
1. What a sketch is
2. Forcing constraints
3. Building the sketches
4. Showing them
5. Carrying the chosen sketch into Rive

---

## 1. What a sketch is

- One HTML file per concept, made from `assets/sketch/sketch.template.html`: SVG shapes animated with the Web Animations API through the template's `to()` and `loop()` helpers, which are interruptible like Rive transitions.
- It implements every state in the brief's States list (written after intake round 2: idle, hover, pressed, focus, loading, success, error, whatever the role needs) behind state buttons, and the pointer and keyboard drive the same states.
- It uses the personality's timings and curves (`motion-craft.md` §2) and fills the timing table: beat, ms, easing, what moves. That table is the most valuable output.
- It has working controls for speed (down to 0.25x, to judge easing), reduced motion, RTL and dark theme, all from the template.
- Shapes come from the brand (logo paths, a rough trace of a real object), never from clip art. They may be rough; the motion may not.
- No libraries, no network, about 150-300 lines each.

## 2. Forcing constraints

Three concepts built from the same brief converge unless each starts from a different constraint. Assign one per sketch:

| Sketch | Constraint | Question it answers |
|---|---|---|
| A | **Material** | what is this business physically made of or working with, and how does that material move? |
| B | **Gesture** | what is the user doing (press, scroll, wait, succeed), and how can that action itself become the brand's sentence? |
| C | **Transformation** | what turns into what for this customer (before and after, problem and solved), shown as one shape becoming another? |

A single component gets A and B only. Each sketch states its sentence in the `idea` field, is checked against the reflex catalog (`motion-craft.md` §11), and notes in one line why it passes the competitor swap test, that is, why it would look wrong on the closest competitor's product (`motion-craft.md` §12).

**When site-director conducts the site** (`intake.md` §9), the concept was already chosen at site level, from the client's world. The piece's storyboard row and the dossier items it cites are the Material of every sketch, and the lab does not open a second concept round:

| Sketch | Constraint under site-director |
|---|---|
| A | **The row as written**: the object, its states and the motion the storyboard names, at the personality's timings |
| B | **Gesture**: the same object and states; what the visitor does changes (drag instead of hover, scroll instead of press, a touch path). If B is chosen, update the "מה המבקר עושה" and "מובייל" columns of the piece's beats in `design/storyboard.rtl.md` and add a decision row to the decision log (one that replaces D7 when the piece is the hero interaction) |
| C | **Timing**: the same object, states and gesture; the choreography changes (order of the parts, where the weight lands, how one state hands over to the next) |

Each sketch names the dossier items it uses in its `idea` field. A sketch that needs a material or a motif outside the row is out of scope here: raise it with the user as a change to the storyboard, not as a third concept.

## 3. Building the sketches

Files live in `design/rive/<piece>/sketches/`: `a.html`, `b.html`, `c.html`, plus the generated `board.html`.

For a full piece, launch one agent per constraint in a single message (Agent tool, general-purpose). Give each: the compiled brief so far with its States list, the personality row from `motion-craft.md` §2, its constraint, the absolute path of `${CLAUDE_SKILL_DIR}/assets/sketch/sketch.template.html`, and its output path. Each returns only its file path and a three-line summary (sentence, swap-test note, risk). Agents cannot ask the user anything; the main thread reviews the three files, fixes anything that breaks the template's controls, then shows them.

For a single component, build both sketches in the main thread.

Then build the board: `node ${CLAUDE_SKILL_DIR}/scripts/sketch-board.mjs design/rive/<piece>/sketches --title "<piece>"`. It inlines every sketch into one self-contained `board.html` (iframes with `srcdoc`), so it works from any location and can be sent as a single file.

Before showing, open the board in the browser pane and step through every state of every sketch: click the state buttons, or run `document.querySelectorAll('iframe')[i].contentWindow.go('<state>')`, and read the console for errors. A sketch with a broken state wastes the user's judgement. If the pane shows the file as a static snapshot (file URLs outside the session's project folders), run the board command again with `--serve` in the background and open the printed `http://127.0.0.1` address instead.

## 4. Showing them

1. Show the board where the user is: it is already open in the browser pane; when SendUserFile is available, also send `board.html` with `display: "render"` so it reaches the user's other devices.
2. In the message, one line per sketch: its sentence and what makes it specific. No paragraphs.
3. Then ask round 3 of the intake (`קונספט` with the concept previews). The user may combine two sketches through Other; record the combination precisely (which beats from which sketch).

If the user dislikes all of them, ask one targeted question about what was wrong (too busy, too slow, too generic, wrong material) and run one more lab round with the answer as a new constraint. Two rounds maximum, then build the closest one and refine in Rive.

## 5. Carrying the chosen sketch into Rive

- The timing table becomes the contract's Motion spec section, row by row: keyframe times, easing as cubic-bezier values (Rive keyframes accept custom cubic interpolation), amplitudes in px or %.
- The SVG shapes are a starting point for the artboard: clean them, then import the SVG into the Rive editor (build sheet or MCP path). Rebuild organic parts with bones or path animation where the sketch used scale tricks.
- States in the sketch map one to one to states or view model values in the contract, which is written now, from the chosen sketch. If the sketch needed a state the States list lacked, add it to the brief and the contract together.
- Keep the sketch files: they are the reference for the verification step ("does the Rive version move like the approved sketch?").
