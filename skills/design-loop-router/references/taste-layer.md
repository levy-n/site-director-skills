# Taste Layer — getting direction before code

## 1. Precedence stack

Read top down. A lower level may only fill gaps the levels above it left open. It may never
overturn them.

| # | Source | Weight | Where it lives |
|---|--------|--------|----------------|
| 1 | The user's explicit instruction **this turn** | absolute | the request text |
| 2 | Project law — `DESIGN.md`, `PRODUCT.md` | overrides everything below | `G:/Web-Dev/MediaWaveIsrael/DESIGN.md`, `.../PRODUCT.md` |
| 3 | Committed patterns already in the codebase | strong; a shipped pattern is a decision | `src/components/**`, `src/config/motion.ts`, `src/styles/index.css` |
| 4 | Vendored taste core | fills gaps only | `references/taste-core.md` in this skill |
| 5 | Generic defaults | last resort, and the thing we are escaping | nowhere — they leak in by accident |

Level 1 beats level 2 only for the current turn's scope, and only when the user is
unambiguous. "Make the hero background darker" is an instruction. "Make it pop" is not — that
is a vague request and resolves against level 2 and 3, not against your instincts.

If level 1 asks for something level 2 forbids (a warm orange CTA, a persisting a11y toggle),
do not silently comply and do not silently refuse. State the conflict in one line, name the
rule, offer the closest compliant option, then do what the user says next.

### Worked conflict

> Taste core: "consider a fully drenched, saturated surface — one colour flooding the whole
> section, type reversed out of it."
> DESIGN.md: sky `#7DD3FC` is a **fill** colour on light surfaces; the palette is locked light;
> One-Accent Rule — sky is the only accent, navy carries structure but is never an accent.

DESIGN.md wins. Reasoning, in order:

1. The taste core is a **general** heuristic library written without knowledge of this brand.
   DESIGN.md is a **specific** ruling made about this brand by its owner. Specific beats general.
2. The drench move implies reversing Hebrew body type out of saturated sky, which breaks the
   Sky-Ink Rule at the contrast level, not just the taste level — it fails measurement, so it
   would come back as an axe failure two steps later anyway.
3. Taste-core moves are means, not ends. The end here is "this section reads as one confident
   block." The compliant expression of that same end: a `--color-cream` (`#F8FAFC`) block that
   spans full-bleed, ink `#1E293B` type, one sky fill element (a rule, an icon plate, a card
   edge) doing the accent work. Same intent, inside the law.

The general rule this instantiates: **when the taste core proposes a mechanism the project law
forbids, keep the intent, discard the mechanism, and find a compliant mechanism for the same
intent.** Never keep the mechanism and argue the law is stale.

## 2. The Design Read

One sentence, written *before* any code or any impeccable call, that fixes the intent of the
work. It goes in `brief.md` and is quoted back in the run report.

Required shape:

> **[Section] should feel [adjective], achieved by [the single structural move], because
> [what the Hebrew-speaking visitor needs to believe].**

Rules: exactly one adjective; exactly one structural move (if you need "and", you have two
briefs); the *because* clause is about the visitor, never about the design.

| Section | Design Read |
|---|---|
| Hero | The hero should feel **settled**, achieved by a single left-weighted headline block over generous empty cream with one sky fill mark, because a visitor who landed from a WhatsApp link needs to know in two seconds that this is a real Israeli business, not a template. |
| Services grid | The services grid should feel **legible**, achieved by equal-height cards on one rhythm with the service name carrying all the weight and the description dropping to muted ink, because a visitor is scanning for the one word that matches their problem, not reading six paragraphs. |
| Testimonials | The testimonial block should feel **credible**, achieved by giving the quote itself display size and demoting the attribution to small ink-muted text under a plain sky rule, because Hebrew-speaking small-business owners buy on somebody-like-me proof, and decoration around a quote reads as manufactured. |
| Contact | The contact section should feel **easy**, achieved by collapsing to a short single-column form with the WhatsApp path given equal visual rank to the fields, because the visitor is deciding whether contacting you costs them anything, and every extra field is a reason to close the tab. |
| Blog post body | The post body should feel **quiet**, achieved by one narrow measure with no card, no border and no background tint, because the reader came for the text and any chrome around it competes with the only thing on the page that matters. |

## 3. The three dials

Each 1–10. Set them in `brief.md`. They are the only tuning knobs passed to execution.

| Dial | 1 means | 10 means | Project default |
|---|---|---|---|
| **variance** | every element on the same grid, same scale, same weight | wild scale jumps, asymmetry, broken grid, one element 10× another | **4** |
| **motion** | opacity only, ≤200ms, nothing on scroll | orchestrated timelines, staggered reveals, scroll-linked transforms | **3** |
| **density** | airy, one idea per screen, large gutters | packed, information-dense, tight gutters, small type | **4** |

Why these defaults: the palette is locked to a restrained light sky theme, so variance cannot
come from colour and has to come from scale and space — but this is a small-business trust
site, and high variance reads as unserious in Hebrew SMB context. Motion sits low because
`LazyMotion strict` plus a single brand easing (`EASE_BRAND` from `src/config/motion.ts`)
deliberately narrows the vocabulary, and because the site's perf guardrails already gate
animation on idle, in-view and `prefers-reduced-motion`. Density sits mid-low because Hebrew at
`line-height: 1.7–1.8` needs vertical room; tight density fights the typography.

Inferring from the request:

| Request signal | Dial move |
|---|---|
| "boring", "flat", "it's fine but forgettable", "תעשה משהו" | variance +2 |
| "too much", "loud", "distracting", "צעקני" | variance −2, motion −2 |
| "feels dead", "static", "add life" | motion +2 |
| "janky", "slow", accessibility or perf context | motion → 1–2 |
| "too much whitespace", "everything is far apart" | density +2 |
| "cramped", "cluttered", "עמוס" | density −2 |
| a named defect ("the CTA is invisible") | do not move dials; fix the defect at current settings |

Presets:

| Preset | var | mot | den | Use for |
|---|---|---|---|---|
| Trust | 3 | 2 | 4 | terms, privacy, accessibility, contact |
| House | 4 | 3 | 4 | default for every new section |
| Showcase | 6 | 5 | 4 | hero, portfolio, anything that has to prove capability |
| Reading | 2 | 1 | 3 | blog post body |
| Repair | keep | keep | keep | any DEFECT run — inherit whatever the section already is |

## 4. Vendored taste core — parts switched OFF

The taste core is a general-purpose library. These sections of it do not apply here. Do not
follow them, do not quote them, do not propose them as options.

| Switched off | Why | What applies instead |
|---|---|---|
| **Stack opinions** — any recommendation of a framework, meta-framework, CSS approach, component library, animation library, or build tool | The stack is fixed and shipped: React 18.3.1, Vite 6.0.5, TypeScript 5.6.2, Tailwind CSS v4.1.18, Framer Motion 12.26.2 | Work inside the existing stack. `m` not `motion`. Easing only from `src/config/motion.ts`. No new dependency is ever part of a design answer. |
| **Dark-mode protocol** — dual-token systems, `prefers-color-scheme` branches, "design dark first", contrast pairs per theme | The site is light-only by decision. There is no dark theme to keep in sync | Design against `--color-cream` `#F8FAFC` surfaces with ink `#1E293B` type, one palette, no theme branch. |
| **Palette generation** — "pick a hero colour", "build a ramp", "try a complementary accent", brand-colour exercises | The palette is locked, and the variable names are legacy warm names carrying cool values (Legacy-Name Rule): `--color-orange` = `#7DD3FC`, `--color-orange-dark` = `#38BDF8`, `--color-cream` = `#F8FAFC` | Use the existing variables. The retired warm hexes `#F5A623`, `#E07B54`, `#F28B82` must never reappear in any diff, comment or example. Sky is the only accent (One-Accent Rule); navy may carry structure but is never an accent for links, borders or icons. |
| **"Try a new typeface"** moves | Fonts are chosen, subset and preloaded; a new face is a perf regression, not a design win | Change size, weight and measure, never the family. |
| **Persisting user preferences** in a settings/a11y widget | Project rule: accessibility widget settings must never persist to `localStorage` | Session-only state. |
| **Underline-at-rest** link styling | Project rule: no static underlines at rest outside blog prose | Underline on hover/focus; blog prose keeps its underlines. |

## 5. RTL / Hebrew layer — the taste core does not cover this

Checklist. Every item is verified before a section is called done.

- [ ] `dir="rtl"` is inherited; no component re-declares direction except LTR-forced fields.
- [ ] **No italic on Hebrew.** Emphasis comes from weight or ink colour. `font-style: italic`
      on a Hebrew string is a defect, including inside blockquotes.
- [ ] **No `letter-spacing` on Hebrew.** Hebrew letterforms do not tolerate tracking; it reads
      as broken rendering. Negative tracking on Hebrew display type is equally forbidden.
- [ ] Body `line-height` between **1.7 and 1.8**. Display headings may drop to ~1.15–1.25.
- [ ] **No em-dashes or en-dashes in Hebrew display copy.** Use a comma, a full stop, or a
      line break. The em-dash reads as machine-written Hebrew.
- [ ] No straight-quote pairs used as Hebrew punctuation decoration; gershayim belong only
      inside acronyms where the copy already has them.
- [ ] **Logical properties only**: `margin-inline-start` / `-end`, `padding-inline-*`,
      `inset-inline-*`, `border-inline-*`, `text-align: start | end`. Any `left`/`right`,
      `ml-*`/`mr-*`, `pl-*`/`pr-*` in a diff is a defect unless it is deliberately physical
      (a decorative absolutely-positioned blob that must not mirror).
- [ ] **Entrances come from the right.** An `x` offset that animates in should start positive
      (toward the inline start in RTL) so content arrives from the reading edge, not against it.
      Mirror any borrowed LTR animation before using it.
- [ ] Icons that imply direction (arrows, chevrons, "next") point **left** for forward motion.
      Non-directional icons are never mirrored.
- [ ] **Email and phone inputs force LTR**: `dir="ltr"` plus `text-align: left` on the field,
      while the label stays RTL. Same for URLs and any numeric ID displayed to the user.
- [ ] Mixed Hebrew/Latin strings in one line (a brand name inside a Hebrew sentence) are
      checked visually — bidi reordering moves trailing punctuation.
- [ ] Numbers, currency and dates render LTR inside RTL text without a stray isolate wrapper
      that adds visible whitespace.
- [ ] Focus rings, scroll shadows and any `::before` rule ornament sit on the inline-start
      side, not a hardcoded left.
- [ ] Copy voice: outcome-first, plain Hebrew, no tech jargon, nothing that reads translated.

## 6. `brief.md` template

Step 2 writes exactly this file to
`G:/Web-Dev/MediaWaveIsrael/.design-loop/<runId>/brief.md`. Headings verbatim, in this order,
no extras — execution reads it positionally.

```markdown
# Brief — <runId>

## Request
<the user's words, verbatim, one block quote>

## Intent class
<NEW | GENERIC | VERIFY | DEFECT | TONE | DOCUMENT | OPINION>

## Design Read
<one sentence in the required shape>

## Dials
variance: <1-10>
motion: <1-10>
density: <1-10>
preset: <Trust | House | Showcase | Reading | Repair>

## Scope
files: <explicit relative paths>
routes: <routes that render them>
out of scope: <what must not change>

## Locked constraints
- Palette: sky #7DD3FC fill only, ink #1E293B type, cream #F8FAFC surface. One accent.
- Legacy variable names carry cool values. Warm hexes are retired.
- Framer Motion: import m, easing from src/config/motion.ts only.
- Light-only. No new dependencies. No new typefaces.
- A11y widget state never persists. No static underlines at rest outside blog prose.
- RTL checklist applies in full.

## Success criteria
- <measurable, one per line — what the browser step must observe>

## Known risks
- <what could regress; empty is a valid answer>
```
