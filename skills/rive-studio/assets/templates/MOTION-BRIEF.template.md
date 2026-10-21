# Motion brief: <project>

Single source of truth for every Rive piece in this project. When something changes, update this file, not just the conversation. Written in English (it holds names and code facts); notes for Nati in Hebrew go in a `.rtl.md` file.

## Summary

| Field | Value |
|---|---|
| Role | <signature moment / micro-interactions / character / system states / other> |
| Platform | <Next.js / Astro / Android Compose / iOS / Flutter / React Native> |
| Build path | <CLI (RML) / Editor MCP / build sheet / existing or community file> |
| Drivers | <pointer, press, scroll, product data> |
| Personality | <precise / playful / cinematic / technical> |
| Intensity and budget | <subtle <= 60 KB / balanced <= 150 KB / showpiece <= 600 KB + assets> |
| Style | <logo geometry / monoline / soft depth / real object> |
| Avoid | <reflexes the user rejected> |
| Concept | <letter> "<name>": <the sentence it says> |
| Text strategy | <none in canvas / short labels / dynamic text> |
| Reduced motion | <final frame / short fade / reduced amplitude; client websites: final frame> |
| Site context | <site-director projects: storyboard row (chapter id), dossier items W.., decisions D..; other projects: none> |

## States (written after intake round 2; the sketches implement these)

- <idle, hover, pressed, focus, disabled, loading, success, error, empty: only what the role needs; idle and focus always for interactive pieces>

## Personality row (motion-craft.md section 2)

| press | state change | entrance | easing | overshoot |
|---|---|---|---|---|
| <ms> | <ms> | <ms> | <cubic-bezier> | <none / %> |

## Pieces

| Piece | Runtime file | Where it lives | Contract | Status |
|---|---|---|---|---|
| <hero> | <public/rive/hero.riv> | <home page hero> | design/rive/<hero>/CONTRACT.md | planned |

## Inferred (from evidence)

- <fact> (source: <file / URL / screenshot>)

## Assumed (recommended options taken without an answer)

- <question>: <option> because <evidence>

## Success criteria (checked in verification.md)

- [ ] Critic rubric >= 26 of 33 with no zero (motion-craft.md section 12)
- [ ] Probe: the file matches the contract, no missing or mistyped names; extra names reviewed
- [ ] Every contract state rendered and captured at 1440x900, 1440x700 and 390x844 (web); on the target device sizes (native)
- [ ] Reduced motion: final frames, no loops, no parallax
- [ ] Accessibility: label or decorative, keyboard path, visible DOM focus ring, pause or self-stop for motion longer than 5 s
- [ ] Budgets: each .riv within its KB budget, no layout shift, paused off screen, LCP unaffected
- [ ] RTL: every direction-bearing motion mirrored
- [ ] Matches the approved sketch's timing table within 20%
- [ ] No splash screen or watermark in the shipped file

## Ledger

### Checklist

```
- [ ] 0 evidence gathered (stack, tokens, files, tools)
- [ ] 1 intake rounds answered or assumed
- [ ] 2 sketches built, stepped through, shown; concept chosen
- [ ] 3 contract written; brief confirmed
- [ ] 4 built on path: ____ ; verified per stage
- [ ] 5 probe clean against the contract
- [ ] 6 integrated on: ____
- [ ] 7 states captured, reduced motion, RTL, keyboard, budgets, critic >= 26/33
- [ ] 8 handoff written
```

### Decisions and open items

| Date | Decision or open item | Why / status | Dossier item |
|---|---|---|---|
| <YYYY-MM-DD> | <decision> | <reason> | <W.. from design/world-dossier.rtl.md, or - when the project has no dossier> |

On a site-director project every design or motion decision names the dossier item it comes from; a decision without one goes back to the dossier before it is built. Technical decisions may say "-".

### Measurements

| Date | Piece | Size KB | Frame cost (bench or trace) | CLS | Critic score | Evidence label |
|---|---|---|---|---|---|---|

### Deviations from the skill's references

- <what `rive docs`, `rive schema` or the live docs said differently, and what was done>

### Backups

- <editor revision, exported .rev, or git commit taken before structural edits>
