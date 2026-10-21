# Gates — the machine-checkable rule catalogue

These are not style notes. A gate failure fails the run: the loop does not report done, and
the router re-enters the fix leg with the failing ids as the brief. Every gate must return
three things or it is not a gate — the rule id, a `file:line` (or `route + selector` for
browser rules), and the **measured value** that violated the threshold. "Looks wrong" is not
a gate result. A rule that cannot produce a measured value belongs in `references/taste-core.md`
as judgement, not here.

Two measurement families:

| Family | Engine | Runs against |
|---|---|---|
| `static` | line-wise scan of `src/**` (`.ts`, `.tsx`, `.css`) | working tree, no server needed |
| `browser` | Puppeteer + computed styles, plus the axe engine already in devDependencies | the preview server on port 4173 (built output), 4 viewports x 6 routes, same rig as `scripts/design-verify.mjs` |

Static gates run first and cheap. Browser gates only run after a build succeeds. A static
failure short-circuits the browser leg — no point measuring a tree that already violates law.

---

## The rule table

| id | Rule | Source | How measured | Fails when | Fix verb |
|---|---|---|---|---|---|
| `SKY_INK` | Sky `#7DD3FC` is a fill, never text on a light surface | DESIGN.md — Sky-Ink Rule | browser | any text node whose computed `color` resolves to sky/sky-dark (`#7DD3FC`, `#38BDF8`, or `var(--color-orange*)`) sits on a surface lighter than `#334155` | `colorize` |
| `LEGACY_NAME` | Legacy warm hexes are extinct; only the names survive | DESIGN.md — Legacy-Name Rule | static | any literal `#F5A623`, `#FFBE4D`, `#D4890F`, `#E07B54`, `#F28B82`, `#8BB4A0`, `#FDFBF7`, `#F5F0E8`, `#EDE5D8` appears outside `docs/`, `CLAUDE.md`, `DESIGN.md` | `colorize` |
| `ONE_ACCENT` | Sky is the only accent; navy carries structure only | DESIGN.md — One-Accent Rule | static + browser | a second saturated hue (HSL saturation > 25% and hue outside 185–210) is used for a link colour, border colour, icon fill, or focus ring | `colorize` |
| `NO_GRADIENT_TEXT` | No gradient-clipped text | DESIGN.md | static | `background-clip: text` / `-webkit-background-clip: text` or Tailwind `bg-clip-text` in any component | `quieter` |
| `NO_STATIC_UNDERLINE` | No underline at rest outside blog prose | DESIGN.md | browser | an `<a>` at rest (no hover/focus) has computed `text-decoration-line: underline`, outside the prose container | `polish` |
| `FOCUS_RING` | Every interactive element has a visible focus ring | PRODUCT.md a11y floor | browser | after programmatic `.focus()`, the element's `outline-width` is `0px` **and** no `box-shadow` ring appears in the diff of computed styles | `harden` |
| `MOTION_IMPORT` | Import `m`, never `motion` | CLAUDE.md + DESIGN.md motion | static | a source file imports the `motion` export from the framer library (`import { motion }`, `motion as`, or `motion.` member access on that import) while the app is wrapped in `LazyMotion strict` — which only ships the `m` component | `animate` |
| `EASE_SOURCE` | Easing comes only from `src/config/motion.ts` | DESIGN.md motion | static | an inline cubic-bezier array or `ease: "easeOut"`-style string literal appears in a component instead of importing `EASE_BRAND` (`[0.16, 1, 0.3, 1]`) or a sibling export from the motion config | `animate` |
| `HEBREW_TYPE` | No italic, no letter-spacing on Hebrew | DESIGN.md typography | static + browser | `font-style: italic` / Tailwind `italic`, or `letter-spacing` ≠ `normal`/`0px`, on any element inside a `dir="rtl"` subtree carrying Hebrew glyphs | `typeset` |
| `NO_BLEND_TEXT` | Text never relies on blend modes to be legible | DESIGN.md | static | `mix-blend-mode` or `background-blend-mode` on an element that has text children | `quieter` |
| `A11Y_NO_PERSIST` | Accessibility widget settings never persist | DESIGN.md — locked | static | the accessibility widget source reads or writes `localStorage` / `sessionStorage` / `document.cookie` for any of its settings keys | `harden` |
| `BOX_SHADOW_ANIM` | Never animate `box-shadow`, `width`, `height`, `top`, `left` | DESIGN.md motion | static | those properties appear in a `transition` shorthand/`transition-property`, in a Framer `animate`/`whileHover` object, or in a `@keyframes` block | `optimize` |
| `OVERFLOW_X` | No horizontal scroll at any supported width | PRODUCT.md | browser | `document.documentElement.scrollWidth > innerWidth + 1` at 320, 390, 768 or 1440 | `adapt` |
| `CONSOLE_ERROR` | Clean console on every route | project baseline | browser | any `console.error`, unhandled rejection, or failed same-origin request during load + 2s idle | `harden` |
| `AXE_CONTRAST` | WCAG AA contrast, no serious/critical violations | PRODUCT.md a11y floor | browser | the axe engine reports any violation of impact `serious` or `critical`, or any `color-contrast` node at all | `colorize` |
| `BLANK_RENDER` | Every route paints real content | project baseline | browser | after load, the route's `<main>` has `textContent.trim().length < 40` or occupies less than 20% of viewport height | `harden` |
| `TOKEN_DRIFT` | Colours, radii and spacing come from tokens | DESIGN.md tokens | static | a raw hex, `rgb()`, or `px` radius appears in a component where an equivalent CSS custom property or Tailwind token already exists | `distill` |

---

## Detection notes that are easy to get wrong

- **`SKY_INK`** — resolve the *effective* background by walking ancestors until a non-transparent
  `background-color` is found; comparing against the element's own transparent background
  produces phantom passes. Report the computed foreground hex, the resolved background hex,
  and the contrast ratio.
- **`ONE_ACCENT`** — greys are not accents. Convert to HSL and exempt anything with saturation
  ≤ 25%. Brand imagery, video posters, and third-party embeds are content, not chrome: only
  inspect `color`, `border-*-color`, `outline-color`, `fill`, `stroke`, and `--*` token values.
- **`MOTION_IMPORT`** — also catch the re-export shape (`export { motion }`) and dynamic
  `import()` of the same specifier. The failure is not stylistic: under `LazyMotion strict`
  the `motion` component throws at runtime, so this gate is really a crash detector.
- **`EASE_SOURCE`** — an array literal `[0.16, 1, 0.3, 1]` written out by hand still fails.
  The point is one source of truth, not one numeric value.
- **`FOCUS_RING`** — drive focus with the keyboard path (`Tab` from `document.body`) as well as
  `.focus()`; some rings are gated on `:focus-visible` and never appear under programmatic focus.
  Measure before/after computed style, not the stylesheet.
- **`BOX_SHADOW_ANIM`** — `transition: all` counts as a hit for every banned property. Report it
  as `all` so the fix is obvious.
- **`AXE_CONTRAST`** — run the same configuration as `.gsd/temp/contrast-audit.mjs`; do not
  silence rules to make a run green. Silencing is an exception, and exceptions are recorded.

---

## False positives and justified exceptions

| Rule | Legitimate exception | Scope |
|---|---|---|
| `NO_STATIC_UNDERLINE` | Links inside blog prose (`/blog/:slug` article body) — underlines are correct there | prose container only |
| `NO_STATIC_UNDERLINE` | Chat-bubble components, where an underlined link is the expected affordance | those components only |
| `TOKEN_DRIFT`, `ONE_ACCENT`, `AXE_CONTRAST`, `FOCUS_RING` | The `/studio` route — third-party UI the project does not style | route excluded wholesale |
| `LEGACY_NAME` | `DESIGN.md`, `CLAUDE.md`, and this file, which quote the dead hexes in order to ban them | docs only |
| `HEBREW_TYPE` | LTR runs — phone numbers, e-mail, code — which may carry tracking | elements marked `dir="ltr"` |
| `CONSOLE_ERROR` | None. A console error is always a defect or a gate bug; fix one or the other | — |

Exceptions are **data, not code edits**. Never widen a pattern to make a hit disappear.
Record it in `G:/Web-Dev/MediaWaveIsrael/.design-loop/exceptions.json`:

```json
{
  "id": "NO_STATIC_UNDERLINE",
  "match": "src/components/blog/ProseBody.tsx",
  "reason": "blog prose — underlines are the correct affordance in long-form reading",
  "approvedBy": "DESIGN.md prose carve-out",
  "added": "2026-09-05"
}
```

The gate loads that file, marks matching hits `waived`, and still counts them in the run
summary. A waiver with no `reason` is treated as a failure. Waivers are never added by the
loop on its own — only when the user or a named project document authorises the carve-out.

---

## `failures.json` — what the gate writes

Written to `G:/Web-Dev/MediaWaveIsrael/.design-loop/<runId>/failures.json`. The loop reads
`pass` to decide whether to iterate, and `failures[]` to build the next fix brief.

```json
{
  "runId": "2026-09-05T14-22-08",
  "pass": false,
  "ranAt": "2026-09-05T14:24:51.113Z",
  "counts": { "checked": 17, "failed": 2, "waived": 1, "skipped": 0 },
  "skipped": [{ "id": "AXE_CONTRAST", "reason": "build failed, browser leg not run" }],
  "failures": [
    {
      "id": "SKY_INK",
      "family": "browser",
      "severity": "fail",
      "route": "/",
      "viewport": 390,
      "selector": "section.hero > p.lede",
      "file": "src/components/sections/Hero.tsx",
      "line": 84,
      "measured": { "color": "#7DD3FC", "background": "#F8FAFC", "ratio": 1.61 },
      "threshold": "ratio >= 4.5 for text",
      "fixVerb": "colorize",
      "message": "sky used as body text on cream — 1.61:1"
    },
    {
      "id": "MOTION_IMPORT",
      "family": "static",
      "severity": "fail",
      "file": "src/components/ui/Card.tsx",
      "line": 3,
      "measured": { "statement": "import { motion } from the framer package" },
      "threshold": "only the m export is available under LazyMotion strict",
      "fixVerb": "animate",
      "message": "motion export imported; LazyMotion strict ships only m"
    }
  ]
}
```

Field contract: `id`, `family`, `severity` (`fail` | `waived`), `measured`, `threshold`,
`fixVerb`, `message` are mandatory on every entry. `file`/`line` are mandatory for `static`;
`route`/`viewport`/`selector` are mandatory for `browser`, with `file`/`line` best-effort.
`pass` is `true` only when `counts.failed === 0` **and** `counts.skipped === 0` — a skipped
gate is not a pass, and the loop must say so out loud rather than reporting done.

---

## Adding a rule when DESIGN.md gains one

1. Give it a `SCREAMING_SNAKE` id and add a row to the table above — all six columns filled.
2. Decide the family. If it needs computed styles, layout, or the axe engine, it is `browser`;
   otherwise `static` and it runs on every pass for free.
3. Write the threshold as a number or an exact string match. "Too much", "feels heavy" and
   "should be subtle" are not thresholds — send those to the taste layer instead.
4. Implement the detector, then **prove it** both ways: introduce a deliberate violation and
   confirm a fail with the right `file:line`, then revert and confirm a clean pass. A detector
   that has never gone red has never been tested.
5. Pick the remediation verb from the impeccable set so the loop can route the fix without a
   human choosing.
6. Sweep the existing tree. A new rule usually has pre-existing hits: either fix them in the
   same pass or waive them explicitly with a reason. Landing a rule that is red on `main` and
   leaving it red trains everyone to ignore the gate.
7. Add the known-exception row if one exists, before the first run rather than after the first
   false positive.

A rule in DESIGN.md with no mechanical check here is decoration. It will be violated within
three edits and no one will notice.
