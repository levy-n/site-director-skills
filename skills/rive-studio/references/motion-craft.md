# Motion craft: what makes a Rive piece beautiful

Read before the motion sketches and again before the critic pass. Rive-specific mechanics (layers, blend states, listeners, data binding) are in `editor-guide.md`; this file is about the motion itself.

## Contents
1. Principles
2. Motion personalities (timing and easing)
3. Designing states
4. The animation principles, applied to interface
5. Idle and rest
6. Characters and mascots
7. Pattern recipes
8. Color, depth and texture
9. Sound and haptics
10. Reduced motion
11. Reflex catalog: generic Rive defaults and what to do instead
12. Beauty rubric (used by the critic)

---

## 1. Principles

1. **Motion explains something.** Every movement answers one of: what changed, what can I do, what happened, where did it go, who is this. If it answers none, cut it.
2. **One focal motion at a time.** The eye follows one thing. Secondary motion is smaller, later or slower.
3. **States first, animations second.** Design the rest pose of every state, then the transitions between them, then the delight. A beautiful transition into an undesigned state is still broken.
4. **Interruptible always.** Users hover out, click twice, lose the network mid-load. Every transition must blend from wherever it is, never snap back to a start frame.
5. **Specific beats pretty.** The animation should only make sense for this brand: its shapes, its materials, its sentence. The competitor swap test (section 12) catches generic work.
6. **Rest is part of the rhythm.** A piece that never stops moving reads as noise and costs battery. Motion is punctuation, not wallpaper.

## 2. Motion personalities (timing and easing)

Pick one personality per product in the intake and apply it everywhere; mixing them is what makes interfaces feel assembled from parts.

| Personality | Feedback (press, toggle) | State change | Entrances / large moves | Easing | Overshoot | Fits |
|---|---|---|---|---|---|---|
| Precise and quiet | 80-120 ms | 150-220 ms | 250-350 ms | strong ease-out, cubic-bezier(0.2, 0, 0, 1) | none | law, medicine, finance, B2B |
| Lively and playful | 100-150 ms | 220-350 ms | 350-550 ms | spring or back-out | 5-15% then settle | kids, food, consumer apps, education |
| Luxurious and cinematic | 120-180 ms | 300-450 ms | 500-900 ms | long ease-in-out, cubic-bezier(0.65, 0, 0.35, 1) | none, slow settle | hospitality, fashion, real estate |
| Technical and energetic | 60-100 ms | 120-200 ms | 200-320 ms | sharp ease-out, linear segments for data | none or 2-4% | SaaS, dashboards, dev tools, sport |

Rules that hold in every personality:
- Entrances decelerate (ease-out), exits accelerate (ease-in) and run about 20-30% shorter than entrances, moves within the frame ease-in-out.
- Linear only for continuous loops (rotation, scrolling textures) and for values mapped directly to data, scroll or drag.
- Desktop runs about 20% faster than phone: distances are shorter relative to the pointer.
- Stagger list items 20-40 ms apart (through each item's index) and a handful of hero elements 40-80 ms apart; more than 6 staggered beats reads as slow, so group them.
- In Rive every keyframe starts as Linear interpolation: set Cubic with the personality's curve on each one (`editor-guide.md` §3). Leftover Linear keys are the most common reason Rive work feels mechanical.
- Show a loader only after about 300 ms of waiting; faster results go straight to the payoff.
- Never more than 3 flashes per second (WCAG 2.3.1).
- Anticipation lasts about 10-20% of the action it precedes (60-100 ms before a 500 ms jump).
- Nothing that blocks the user's next action lasts more than 400 ms. Showpiece timing (600 ms and up) is only for moments the user is watching anyway: a hero intro, a success payoff, a scroll scene.

## 3. Designing states

Inventory for an interactive element (use only those that apply, but decide each one explicitly):

| State | Must communicate | Typical motion |
|---|---|---|
| idle | at rest, available | still, or a very slow "alive" cue (section 5) |
| hover (pointer only) | this reacts to you | small lift, light shift, 1-3 px or 2-4% scale |
| pressed | I received the press | compress 3-8% or 1-2 px down, fastest timing in the system |
| focus-visible | keyboard focus is here | the DOM control keeps its own focus ring (WCAG 2.4.7); an optional `isFocused` pose in Rive adds a shape change that does not depend on color alone |
| disabled | not available now, and why if possible | desaturate, lower contrast, no hover reaction |
| loading | working, how long | a seamless loop that can exit at any frame |
| success | it worked | one payoff, then return to a calm resting state |
| error | it failed, what to do | a short shake or tilt (max 3 oscillations, 300-400 ms, ≤ 6 px), then a clear rest pose |
| empty | nothing here yet, what to do next | gentle, inviting, low motion |
| selected / on | chosen | a stable visible difference, not only a transition |

For each pair of reachable states decide the transition duration and what happens when it is interrupted halfway. Keep independent channels on separate state machine layers (body, eyes, glow) instead of multiplying states: 3 channels with 3 states each are 9 states on layers, 27 on one layer.

Hover does not exist on touch. Every hover-only reaction needs a touch equivalent (pressed, or a tap reaction) or must be unnecessary.

## 4. The animation principles, applied to interface

| Principle | In an interface |
|---|---|
| Squash and stretch | press feedback: compress on one axis, stretch slightly on the other, keep the volume; at most 10-15% (bones or a mesh for organic shapes) |
| Anticipation | a 30-60 ms dip to 0.96-0.98 scale or a 2-4 px pull back before a launch, a tiny inhale before a character speaks |
| Staging | one focal motion; dim, blur or still everything else during it |
| Pose to pose | design the key poses of each state first; Rive keyframes are poses, the interpolation is the motion |
| Follow-through and overlap | secondary parts (ears, ribbon, shadow, label) settle 40-80 ms after the main body; in Rive, constraints below 100% strength produce the lag |
| Slow in and slow out | easing; no linear movement for physical objects |
| Arcs | organic things move on arcs (bones, paths), not straight diagonals |
| Secondary action | a blink during idle, a shadow that breathes with the body |
| Timing | section 2 |
| Exaggeration | scale it with the personality: playful 10-15% overshoot, precise none |
| Solid drawing | consistent volumes, light direction and perspective across all poses |
| Appeal | shape language: round reads friendly, angular reads fast or technical, square reads stable |

## 5. Idle and rest

- An idle that loops a large motion forever is the most common way Rive work feels cheap. Idle should be still or nearly still.
- "Alive" cues, if the brand wants them: a blink every 3-6 s with random variation, breathing of ≤ 2% scale on a 2-4 s cycle, a look toward the pointer or focused field.
- Decorative motion that starts automatically and lasts more than 5 seconds needs a way to pause it, or must stop by itself (WCAG 2.2.2 Pause, Stop, Hide). The simplest compliant design: the idle settles to a still pose after one cycle and wakes only on interaction.
- Pause everything that is off screen or in a hidden tab (runtime details in `web-runtime.md`).

## 6. Characters and mascots

- Start from the brand's own shapes (logo geometry, product forms, the founder's world), never from a generic blob with big eyes.
- Silhouette test: the character reads at 32 px as a black shape.
- 3-5 colors, one accent. Expression set before any animation: neutral, happy, surprised, thinking, concerned. The eyes carry most of the emotion; design them first.
- React to the product's real events: success earns joy, an error earns concern and help, never mockery. A character that laughs at the user's failed payment is a brand risk.
- Attention budget: a character may call attention at most once per screen visit. After that it reacts, it does not perform.
- Drive mood from data (an enum such as `mood` with the expression set) so the product, not a timer, decides how the character feels.
- Proven patterns from shipped characters: separate head and body parts multiply variety cheaply (Duolingo's Lily: 8 x 8 parts, the whole file under 1 MB); a "pondering" state hides real latency (an AI reply, a network call); mouth shapes on their own layer driven by timing data make speech believable; a character with no mouth can show speaking through a bound audio-volume number (Brilliant's Koji).

## 7. Pattern recipes

Each recipe lists the structure; build details are in `editor-guide.md` and the contract format is in `rive-contract.md`.

| Pattern | View model properties (example names) | Structure | Timing notes |
|---|---|---|---|
| Animated CTA background | `isHovered`, `isPressed`, `isFocused`, `isDisabled` bools, `status` enum (idle, loading, success, error), `celebrate` trigger | decorative canvas behind a real DOM `<button>`; the label stays in HTML; the button's pointer and focus events set the booleans (recipe in `web-runtime.md` §4) | hover 150 ms, press 90 ms, success payoff 500 ms then back to idle after about 1.2 s |
| Toggle | `isOn` bool | one layer for the thumb, one for the track color | 200-250 ms; overshoot only if playful; mirrored in RTL |
| Loader to result | `status` enum (idle, loading, success, error) | the loading loop exits at any frame into success or error | loop 0.8-1.4 s; payoff 400-700 ms |
| Progress, gauge, meter | `progress` number 0-100 | the number drives the drawn value directly; smoothing in the file, not in code | linear mapping, eased display |
| Icon morph (menu to close, play to pause) | `isOpen` bool | path morph or bones | 200-300 ms; arrows mirror in RTL |
| Counter or badge | `count` number, `bump` trigger | the bump plays on each increment | 250-350 ms, small overshoot |
| Rating or reaction | `value` number 1-5 or `reaction` enum | blend between key expressions | 150-250 ms per step |
| Hero scene | `pointerX`, `pointerY` numbers -1..1, `scroll` number 0-1 | 2-3 depth layers with parallax ratios about 0.2 / 0.5 / 1.0 | a strong, complete first frame; nothing important waits for motion |
| Empty or onboarding illustration | `step` number or enum | one gentle loop that settles, a small reaction on tap | settles after one cycle |
| Pull or swipe (mobile) | `drag` number 0-1, `release` trigger | the drag number scrubs, the release trigger plays the commit | follows the finger 1:1, release 250-350 ms |
| Tab bar icon (app) | `isSelected` bool | selected pose differs in shape, not only color | 200-250 ms, synced with the haptic tick |

## 8. Color, depth and texture

- Colors come from the project's tokens. Bind them as view model color properties so the light and dark themes come from the site or app, not from duplicated artboards.
- Depth from 2-3 layers, light from one consistent direction, soft shadows through feathering used sparingly (one or two per scene; many feathered shapes cost render time).
- Gradients are subtle and on-brand; purple-to-blue, neon glow and glass are reflexes (section 11).
- Raster textures and embedded photos multiply file size; prefer vector texture (hatching, dots, grain made of shapes) or reference the image as an out-of-band asset.

## 9. Sound and haptics

- Sound only on a direct user action, never on load, always quiet, and always with a mute path. Most websites should ship without sound.
- In apps, sync the haptic tick to the visual impact frame, not to the start of the transition.

## 10. Reduced motion

Under `prefers-reduced-motion: reduce` (or the OS setting on mobile):
- no autoplay, no idle loops, no parallax or scroll scrubbing;
- state changes become instant (client websites, the strict policy in `verification.md` §5); apps may use a crossfade of 150 ms or less;
- feedback survives through color, opacity and shape, so nothing loses meaning;
- each scene shows its final, complete frame. Design the last frame of every moment as a full statement, because that is what these users see.

Implementation: a `prefersReducedMotion` boolean in the view model (the name Rive's docs use) that the state machine uses to take instant transitions, set from the platform setting at load and on change.

## 11. Reflex catalog: generic Rive defaults and what to do instead

These are the first things models and template designers reach for. A match is allowed only when the brief gives a reason; write that reason in the motion brief.

| # | Reflex | Instead |
|---|---|---|
| 1 | Round blob mascot with big eyes that waves and blinks | a character built from the brand's own shapes and world (section 6) |
| 2 | Elastic overshoot on everything | one personality; overshoot only where the personality allows it |
| 3 | The teddy bear that covers its eyes on the password field | a reaction only this brand could have, or no character at all |
| 4 | Day/night toggle with sun, moon and stars | a toggle whose two states are the product's own two states |
| 5 | Eyes following the cursor as the only interaction | interaction tied to what the user is doing (field focus, progress, choice) |
| 6 | Confetti burst on every success | a payoff made from the brand's material, scaled to the size of the success |
| 7 | Gradient ring spinner | a loader that shows the product's process, or a skeleton without Rive |
| 8 | Liquid or gooey button morph | press physics that match the personality |
| 9 | Hover equals scale 1.1 plus glow | 2-4% scale or 1-3 px lift, a shape or light change specific to the element |
| 10 | Big idle loops that never rest | stillness plus rare alive cues (section 5) |
| 11 | Neon glow, glassmorphism, feathered blur everywhere | one light source, one or two soft shadows |
| 12 | Purple-to-blue gradient palette | the project's tokens |
| 13 | Every element enters with the same fade and slide up | entrances that differ by role, or none |
| 14 | Rive used for a fade CSS can do | CSS; Rive earns its bytes only with state, interactivity, character or data |
| 15 | Text and headings drawn inside the canvas | text in HTML or native UI unless it is part of the illustration |

## 12. Beauty rubric (used by the critic)

Score each criterion 0-3 (0 missing, 1 weak, 2 good, 3 excellent). Ship at ≥ 26 of 33 with no zero.

| Criterion | 3 means |
|---|---|
| Purpose | every motion answers what changed, what to do, what happened, where it went or who this is |
| Focus | one focal motion at a time; secondary motion clearly subordinate |
| Timing and easing | matches the chosen personality everywhere, no outliers |
| Interruption | every transition blends from mid-flight; no snaps, no stuck states |
| State completeness | every state in the contract has a designed rest pose, including focus, disabled and error |
| Restraint | idle is calm; nothing loops without reason; motion stops off screen |
| Specificity | passes the competitor swap test: on a competitor's product it would look wrong |
| Craft | arcs, overlap, follow-through, consistent light and volume |
| Accessibility | reduced motion handled, focus visible, pause for long motion, meaning not only in motion or color |
| RTL and language | direction-bearing motion mirrored; text outside the canvas or verified for Hebrew shaping |
| Performance | within the file-size and frame budgets in the brief; paused when hidden |

**Competitor swap test:** imagine the piece on the closest competitor's site or app. If it would look wrong there, it **passes**: it belongs to this brand. If it would fit there unchanged, it **fails**: it is generic, so find the brand-specific shape, material or sentence and rebuild around it. Every file in this skill uses "passes" and "fails" in this sense.
