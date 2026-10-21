# Visual language: from the concept to tokens

Read this after the concept is chosen, when turning it into colour, type, grid, imagery, motif and motion tokens. The output is the tokens file of the project (`src/styles/tokens.css` or the Tailwind `@theme` block) plus the "Visual system" section of `design/CONCEPT.md`.

The governing idea: **restraint in the system, extravagance in the moments.** A strict, small system makes the two or three signature moments loud. Anthropic's frontend-design puts it as "spend your boldness in one place". The reference site has one accent, one grid, one motif family, and then a 9,000-pixel cinematic sequence.

## Contents
1. Colour
2. Type
3. Grid and composition
4. Imagery
5. The motif
6. Surfaces and details
7. Motion tokens
8. Token naming and output
9. Standing preferences (Nati)

---

## 1. Colour

- **Derive the palette from the subject's world**, not from a mood word. Photograph or find the real materials (clay, brass, paper stock, the shop's tiles, the product), sample them, and pick 4-6 named colours with roles. A palette that could belong to any business in the category is not done.
- **Roles, not swatches:** a ground (page), an ink (text), one signal accent, one or two support colours, and the theme layers if the page flips. Write the role and the maximum share of area next to each hex.
- **One accent, one meaning.** The accent's meaning comes from the client's world, and the accent appears only where that meaning applies. Name the meaning and the places it may appear in the decision log (on a drawing, a redline marks a violation; on a form, a stamp's ink marks "checked"). Heron AI's single red (#FA3600) appears almost only on violations. Rationing by placement alone (the reference's lime on buttons, one underline per section, the active nav pill and the chat bubble) gives the eye a path but says nothing; an accent on everything is noise. When the meaning is "the one action you can take", that is the meaning, and the accent then marks nothing else.
- **Contrast first.** Body text at least 4.5:1 against its ground, large text and UI at least 3:1. Pastel or neon accents work as fills and surfaces, not as text on light grounds. Check every theme layer, not just the default one.
- **Work in OKLCH** when tuning lightness steps (`oklch(L C h)`), so a theme flip keeps perceived contrast; keep a hex fallback for tools that need it.
- **Theme layers for chapters.** If the score flips themes, define each theme as a full set (ground, ink, muted, line, accent-on-ground) and test contrast in each.
- **Check the plan against reflexes.md §2:** cream/sand grounds, terracotta or rust accents, near-black with one acid accent, purple-blue gradients. Each needs a reason from the concept or it changes.

## 2. Type

- **At most two families:** a display face with presence and a second face, clearly different, that does the reading work and the instrument work (numbers, labels, indexes: tabular figures and a label style from its own weights and features). Characters one chosen family lacks (Latin, digits, geresh and gershayim) come from the other chosen family, declared with `unicode-range` under the first family's name. A third face is allowed only as a **glyph fallback** for characters neither chosen family has, inside the same voice, metric-matched (font-fallback.mjs); it never gets a job or a voice of its own (mono labels, a numbers face, a Latin index). MediaWave's own site shows the rule: EFT Betaamango lacks the geresh and gershayim, so U+05F3-05F4 in its headings come from its text face IBM Plex Sans Hebrew. Its Outfit Latin and digits under the display face are a project decision (#59), not the rule: when the other chosen family has the glyphs (Plex has Latin and digits), use it.
- **The user picks the pair** from 3-4 specimens rendered on the real layout (intake.md §3); the concept proposes the candidates.
- **Choose candidates from the concept.** Material lane: a face whose construction echoes the material (stencil for crates, high contrast for engraving, rounded for dough). Tradition lane: the borrowed tradition's type behaviour. Transformation lane: a face with a range (weights, widths) the transformation can travel through. Travelling through those axes on scroll re-lays out the text every frame, the most expensive kind of motion on a phone, so the concept names its touch version too: stepped instances or a compositor scale (moves.md E-09).
- **Type as image.** At least one moment where type is the visual: a headline several screens wide, a word that fills the viewport, a line that is struck, filled or split open. This is the cheapest way to be unforgettable and the hardest to template.
- **A real scale.** Body 16-20 px; display at least 2.5× body on desktop, often 4-7×; use `clamp()` with viewport units for fluid sizes. A flat scale (largest heading under 2× body) reads as a document, not a designed page. Size ceilings from product-UI skills (for example "display ≤ 6rem") don't apply to signature moments; they do apply to running UI.
- **Leading:** display tight (0.9-1.1 for Latin; check Hebrew in hebrew-rtl.md), body 1.5-1.8.
- **Hebrew:** no italics, no letter-spacing, real weights only; see hebrew-rtl.md.
- **Check against reflexes.md:** Inter/Geist/Space Grotesk/Satoshi/Clash; Fraunces/Playfair/Instrument Serif with an italic accent word; Heebo/Assistant/Rubik as the brand voice; mono uppercase labels as default scaffolding.

## 3. Grid and composition

- **Set a real grid** (12 columns, a concept-specific grid, or a modular grid from the borrowed tradition), with margin and gutter tokens per breakpoint. A grid makes breaking it meaningful.
- **Break it on purpose:** a full-bleed moment, type crossing columns, an image overlapping a section boundary, an asymmetric hero. Each break should be a decision you can name.
- **Vary section rhythm.** Change padding, width, alignment and density between sections. Three or more sections with the same padding and the same centred container read as a template (slop-scan's `repeated-section-shells`).
- **Hierarchy by scale and space, not boxes.** Chopping content into identical cards is the SaaS-card default. Prefer lists, rows that reveal on hover or scroll, editorial spreads, one large item with smaller satellites.
- **Open the hero with the most characteristic thing in the subject's world** (frontend-design v3): the product in hand, the place, the person, the material. The stat-hero (a big number, a small label, a gradient) is a default.
- **Mobile is its own composition.** Restack, re-crop and re-pace for 390 px; don't just shrink.

## 4. Imagery

Priority order:
1. The client's own photos and video, art-directed (consistent light, crop and treatment).
2. Commissioned shots, or AI-generated media **of the real subject** (the founder's likeness with consent, the actual product, the actual place), art-directed and labelled honestly when it matters. The reference's cinematic sequence is AI-generated from the founder's likeness; that is why it is personal, not stock.
3. Typographic or illustrative treatments built from the concept and motif.
4. Stock, last, and never stock people.

Never ship: AI stock people, isometric 3D blobs, glossy gradient meshes as "visuals", laptop-on-gradient mockups of nothing, fake dashboards, coloured boxes where a real image belongs.

Reserve space for every image and video (`width`/`height` or `aspect-ratio`) to avoid layout shift; give videos a poster that equals their first frame.

## 5. The motif

A motif is one small visual family that recurs with different jobs. It is how a long scroll stays cohesive while each section surprises.

- **Source it** from the logo's geometry, a material, a tool, a letterform, or the borrowed tradition. The reference's six brand shapes come from its logo system.
- **Make it a set of SVG symbols** (`<symbol>` + `<use>`), coloured with `currentColor`, so it can be reused at any size.
- **Give it 3-6 jobs**: preloader, hero actors, section markers, transition carriers, success state, footer. Write the list in CONCEPT.md.
- **Give it motion verbs** from the motion grammar (the reference's shapes pop with overshoot, spin when hovered, float slowly, fall with gravity).
- One motif family per site. Two compete.

## 6. Surfaces and details

- **A radius system with hierarchy**: small for controls, medium for media, large or none for sections; nested radii concentric (outer = inner + padding). One radius on everything is a kit tell.
- **Borders for structure, shadows for elevation**, not both on everything.
- **Hover states contained to their element** (no effect that drifts onto a neighbour).
- **Focus is designed**, visible, and never animated in.
- **No decoration without a job:** grain, noise, gradient blobs and glow need a sentence from the concept.
- **Theme the browser surfaces** (cheap, and it reads as built rather than assembled): `::selection`, `caret-color`, scrollbar colours, focus rings, `text-underline-offset`, tabular numerals for figures.
- **Type-as-image set-pieces may exceed reading-size caps** (a headline several screens wide, a 200 px counter) as long as they stay real text, never cause horizontal overflow, and carry the boldness budget. Running headlines keep a sensible ceiling.

## 7. Motion tokens

Two families, because product-UI motion and narrative motion obey different rules (the skills that say "under 300 ms" are right about buttons and wrong about a scroll story).

| Family | Use | Durations | Easing |
|---|---|---|---|
| UI | buttons, menus, form feedback, toggles | 100-300 ms | ease-out for enter and exit (`cubic-bezier(0.23, 1, 0.32, 1)`), ease-in-out for on-screen moves |
| Narrative | entrances, holds, scene changes | 0.35-1.4 s triggered, or scroll-scrubbed (scrub 0.3-0.8) | one or two named eases from the concept's easing character (for example `power3.out` and `power3.inOut`); a short ease-in exit is fine when attention moves on |

Overshoot (`back.out`) only on brand actors (the motif), never on controls. Press feedback: one scale token (0.96-0.97). Stagger: 30-60 ms for lists, 80-100 ms for hero chunks, 40-80 ms for split words.

## 8. Token naming and output

- Name tokens by **role**, not by colour: `--ground`, `--ink`, `--muted`, `--line`, `--signal`, `--theme-dark-ground`. Names like `--cream` or `--paper` are both a reflex and a maintenance trap (MediaWave carries `--color-orange`, whose value became sky blue and, in the launch-night look's legacy scope, Klein blue #002FA7).
- Put every value in one tokens file (CSS custom properties or Tailwind v4 `@theme`), including spacing, radii, type scale, motion durations and eases.
- Record the tokens with one-line reasons in CONCEPT.md's "Visual system" table. The critic checks the build against it.

## 9. Standing preferences (Nati)

From his recorded design decisions; apply to his projects unless the client says otherwise:
- Readability is non-negotiable; he notices low contrast immediately. Run a contrast check every design round.
- No static underlines under links in UI (hover-only underlines are fine; prose links in articles may keep them).
- Hover and magnetic effects stay visually inside their own element; an effect drifting toward a neighbouring link reads as "the wrong button is being pressed".
- Accessibility-widget settings never persist between visits.
- Centring is allowed on every site; what is banned is the template (a two-button hero, a logo strip, three cards).
- Fonts: he picks from rendered A/B/C/D specimens, never on autopilot (intake.md §3); at most two families.
