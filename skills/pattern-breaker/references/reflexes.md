# Reflexes: the defaults to catch, and the probes that find this brief's defaults

Read this before choosing a concept (to check the plan) and after the first full build (to check the film). It has two parts: a catalog of the defaults current models reach for, and cheap probes that reveal the median answer *for this specific brief*.

How to use the catalog: every item is legitimate for some brief. A match is allowed when the concept needs it, and you write that reason next to the token ("near-black: the client's product is night photography"). A match with no brief-specific reason is a reflex: change it. Don't treat the list as bans. Bans would reject liavmatzri.co.il, which uses items 3 and 7 on purpose. Anthropic's own position: "All traits are legitimate for some briefs, but they are defaults rather than choices… where the brief leaves an axis free, don't spend that freedom on one of these defaults."

Why a named list and not "avoid generic": for Opus 5.5, Anthropic documents that a general instruction "mostly swaps one default for another"; naming the specific patterns is the form that works, and you extend the list with whatever the first result used instead.

## Contents
1. Layer 0: the naive default
2. Layer 1: the "tasteful" default (the current frontier-model fingerprint)
3. Layer 2: where models drift once Layer 1 is named
4. Motion and scroll reflexes
5. Hebrew and Israeli small-business reflexes
6. Copy reflexes
7. The probes (procedure)
8. Cross-project memory
9. Keeping this file current

---

## 1. Layer 0: the naive default

Still produced by un-steered models and by most site builders.

- Type: Inter, Roboto, Poppins, Montserrat, Open Sans, or the system stack as the brand voice.
- Colour: purple/indigo → blue (or pink) gradients; gradient-filled headline text; neon glow on dark.
- Surfaces: `rounded-2xl` + `shadow-lg` cards; glassmorphism nav (`backdrop-blur` + `bg-white/10`); blurred colour blobs behind the hero.
- Structure: centred hero (H1 + subline + two buttons) → logo strip → three identical icon cards → testimonials → three-tier pricing with the middle highlighted → FAQ accordion → CTA band → four-column footer. The reflex is the template, not the centring: a centred hero with one button and a secondary link needs no reason (Nati's ruling, all sites).
- Details: "✨ New" or "AI-powered" pill above the H1; emoji in headings; icons in pale tinted squares; stock avatars (pravatar, randomuser); round unsourced stats (99.9 %, 10,000+, 24/7); "Get Started" / "Learn More".

## 2. Layer 1: the "tasteful" default

What current frontier models produce when told to avoid Layer 0. Anthropic's frontend-design v3 (2026-09-02) lists these as five clusters; the Opus 4.8 and Opus 5.5 prompting docs describe the first one as Claude's "persistent" house style; the press called it "Claudian sameness" (New Yorker, 2026-06).

| # | Cluster | Typical values |
|---|---|---|
| 1 | Warm editorial | cream / sand / paper page `#F4F1EA`-ish (OKLCH L .84-.97, C < .06, h 40-100), tokens named `--paper`, `--bone`, `--cream`, `--linen`; a high-contrast serif display (Fraunces, Playfair, Instrument Serif, Newsreader, Cormorant, DM Serif, Georgia) with **one italic or coloured accent word**; terracotta / rust / clay accent `#D97757`, `#D9622B`, `#C2410C`, or amber |
| 2 | Night signal | tinted near-black `#0B0B0B` / `#111` with a single acid-lime or vermilion accent |
| 3 | Broadsheet | hairline rules, zero radius, dense newspaper columns, lowercase tracked metadata |
| 4 | SaaS-card kit | content chopped into identical rounded cards, one radius everywhere, the same soft `rgba(0,0,0,.1)` shadow under each, gradient washes as decoration, pill buttons |
| 5 | Template chrome | a tracked ALL-CAPS eyebrow above every heading; "01 / 02 / 03" on content that is not a sequence; "A · B · C" meta strings; "WORD" + em dash + "fragment" labels; a mono face for small labels; "→" appended to links and buttons |

Also part of the 2026 tasteful default: grain/noise overlays, gradient-mesh backgrounds, marquee or news-ticker bands, bento grids, the stat-hero (a big number with a small label and supporting stats), the single-word headline accent.

**Saturated typefaces** (a reason no other face satisfies is required; "it suits the subject" is not one): Fraunces, Playfair, Cormorant, Lora, Crimson, Newsreader, Syne, Space Grotesk, Space Mono, IBM Plex, Inter used as display, DM Sans/Serif, Outfit, Plus Jakarta Sans, Instrument Sans/Serif, Geist; and the Geist + Instrument Serif pairing. Treat the first palette as already spent when it is cream, paper or lamplight for a warm subject.

Added 2026-10 (coffee eval: the unaided baseline, one lane and the final build converged on it): Atkinson Hyperlegible (Next or Mono) as the "honest, legible" text face, paired with a variable-width display that swells as you scroll.

## 3. Layer 2: where models drift once Layer 1 is named

Naming a tell moves the model to the nearest family that is still "safe and impressive". Each landing below now has a code fingerprint in slop-scan, so it is testable rather than predicted.

| The instruction | Where the model lands instead |
|---|---|
| "No purple gradients, no blobs" | a shader wallpaper in another hue (aurora, silk, mesh), or the dev-tool dark kit: near-black, masked grid or dot background, beam borders, grey gradient text |
| "No Inter or Roboto" | Geist, Satoshi, Instrument Sans, Space Grotesk, Manrope, Outfit |
| "No cream and terracotta" | mocha/oat quiet luxury, Klein blue on off-white, sage and bone, black and gold for "premium" |
| "No fade-up on every section" | blur-in reveals, CSS `animation-timeline: view()` on every block, a clip-path wipe on every image, a character split on every heading |
| "No identical cards" | bento, hairline-ruled broadsheet lists, sticky stacking cards, zig-zag rows |
| "No stock photos" | AI "editorial" photos with grain, dithered or ASCII imagery, hand-drawn doodles |
| "Make it feel human" | the scrapbook kit: Caveat or Kalam, rough-notation circles, tilted polaroids, tape |
| "Be bold" | neo-brutal hard shadows, a giant tight headline, an acid or safety-orange accent, Swiss signal red |
| "Premium, luxury" | liquid glass; black, gold and a thin serif (in Israel, often with Frank Ruhl Libre) |
| "No generic copy" | the "No fluff. Just X." voice, "בגובה העיניים / בלי בולשיט", a two-beat headline on every section |
| "Make it award-level" | the full scroll kit (§4) applied regardless of content |

**A project waiver is not a rule change.** MediaWave's own site uses Klein blue #002FA7 on paper #FAFAF7 and IBM Plex Sans Hebrew as its text face, by its decisions #58 and #59 (`DECISIONS.rtl.md` in that repo); slop-scan flags both; there they are justified by those decisions, and any waiver cites them. The waiver covers that one project. On every other site both stay reflexes at full strength: "Klein blue on off-white" in the table above, IBM Plex in §2's saturated list, each needing its own brief-specific reason.

So this skill never fixes a reflex by naming its neighbour. It derives the replacement from the subject's material, vernacular or story, and writes that reason next to the token. Swapping aurora for silk is the same choice. Two different looks from this table on one page read as kit-assembled taste. The reference site's own formulas (a two-beat period headline per section, a mono English index over each Hebrew heading, one marker-underlined phrase per heading) are the next template: use each once or twice, where its content fits.

## 4. Motion and scroll reflexes

- **Generic motion** (v3's named tell): fade-and-slide-up on every section (opacity 0→1, y 20-40 px, ~0.6 s, stagger ~0.1) and a hover lift on every card.
- **The "Awwwards kit" applied by default.** Each piece is fine; the reflex is the bundle, unrelated to content: preloader with a % counter; character-split on every heading; marquee band; pinned horizontal gallery; sticky stacking cards; magnetic buttons; a dot-and-ring custom cursor; parallax on every image; clip-path image reveals; a giant footer wordmark; Lenis at default settings.
- **Ambient motion with no meaning**: floating blobs, drifting gradients, a scroll progress bar, particles.
- **Typewriter headlines, count-ups on every number, typing effects on body copy.**
- **Fade-up's 2026 successors**: blur-in reveals, `animation-timeline: view()` reveals on every block, spotlight glows that follow the cursor inside cards. Native CSS is the right tool, but not a different idea.
- **The opposite reflex**: "motion sparingly" (from product-UI skills such as frontend-design v3, baseline-ui, Emil Kowalski's bar) applied to a brief that *is* a scroll story. The result is a timid page with one fade.

The test for any moving element: what does this motion say about the content at this point in the story? Count surprises per scroll distance, not per section (scroll-score.md).

## 5. Hebrew and Israeli small-business reflexes

- Fonts picked by reflex: Heebo, Assistant, Rubik (the Hebrew Inter); Frank Ruhl Libre for "elegant"; Secular One or Suez One for "bold"; Karantina, Bellefair or Amatic SC for "characterful". Google's Hebrew display set is small, so its members are reflex picks (slop-scan rule `default-font-he-2` flags these and a few more; hebrew-rtl.md §5).
- Latin devices transplanted onto Hebrew: italic accent words (Hebrew has no true italic; browsers synthesise a slanted fake); letter-spacing on Hebrew labels (Hebrew has no case, and tracking breaks letter shapes and word images); "→" on CTAs (in RTL the forward arrow points left); horizontal tracks that move the wrong way for RTL reading.
- The Israeli SMB template: hero stock photo with a dark overlay + "צור קשר" + a floating WhatsApp bubble + three service cards with icons + a testimonial carousel + a generic accessibility-widget icon dropped in rather than designed.
- Copy: "הפתרון המושלם עבורך", "לקחת את העסק לשלב הבא", "שירות מקצועי ואמין", "ניסיון של X שנים", "אנחנו כאן בשבילך", translated-sounding verbs ("להעצים"), and "פתרונות" for everything.

## 6. Copy reflexes

- Abstractions instead of facts: Elevate, Unlock, Seamless, Empower, Transform, Revolutionize, cutting-edge, next-level, world-class.
- Manufactured contrast: "Not just X. It's Y." / "זה לא רק X, זה Y" (once is a choice; three times is a tic).
- Three-noun taglines ("Design. Build. Grow."), rhetorical-question hooks ("Tired of…?"), triads everywhere.
- Self-praise in owner copy ("the most professional", "the best service").
- Em-dash rhythm in every sentence; exclamation marks as energy.

## 7. The probes

A cheap experiment that turns frontend-design's advice "work through a similar prompt to see if you arrive somewhere similar" into data. It shows what *this* model produces for *this* brief, once when nobody steers it and once when it is asked to be distinctive. Run both after the intake brief exists and before the concept lab, and save each answer as `design/probe/<n>.json` (the critic and the lab read the files, not the conversation).

**The agent.** The probes must run without skills and without project instructions, or they sample the user's CLAUDE.md instead of the model. `assets/agents/pb-reflex-probe.md` is that agent definition (`tools: Read`, `effort: low`, `omitClaudeMd: true`); ask the user to copy it once to `~/.claude/agents/`. Without it, use a general-purpose agent with `effort: "low"` on the call, and note in the ledger that the probes ran with CLAUDE.md loaded.

**Reflex probes:** 1 to 3 fresh agents, each given only the one-paragraph brief and this request:

> Without any style guidance, write the plan you would build for this website. JSON only:
> `{ "page_bg": "#hex", "text": "#hex", "accent": "#hex", "display_font": "", "body_font": "", "hero": "one line", "sections": ["…"], "motion": ["three effects"], "buttons": "shape", "labels": "style", "imagery": "one line" }`

Run 3 when you can: variance shows how strong the attractor is. If all three pick the same display font, that font needs a very good reason.

**Ambition probe:** one more fresh agent of the same kind, with `effort: "medium"` on the call. It gets the paragraph plus the user's ambition words verbatim (for example "memorable, nothing like the usual AI-built coffee site, a scroll experience people talk about"; a run that paraphrased them away lost the signal) and this request:

> Make this site distinctive and specific to this client, not a template. JSON only:
> `{ "concept": "one sentence", "scroll_story": "first viewport → last", "signature_moment": "", "display_font": "", "text_font": "" }`

Measured on the coffee eval: the reflex probe saw only tokens and sections, while the unaided baseline and the skill's winning concept both landed on the same idea, the page roasting a batch as you scroll. The ambition probe's concept is the third rut in concept-lab.md §6 check 1b.

**Without subagents:** write both JSONs yourself *before* reading concept-lab.md, save them the same way, and treat them the same way.

**Diff.** Every value the real concept shares with a probe answer (colour family, display face, hero structure, motion effect; from the ambition probe also the concept, subject world, motif or signature moment) is a reflex hit. It stays only with a written, brief-specific reason in the concept's `reflex_hits`. Report the hit count to the user when presenting concepts. It is a useful, honest number.

## 8. Cross-project memory

Distinctiveness also means not repeating yourself across clients. Keep one line per finished project in `memory/portfolio-log.md` (inside this skill folder, or the user-level path the user prefers):

`date · client · concept name · palette hexes · display/body fonts · signature moments · motion grammar`

The concept lab reads the last 10 lines and avoids reusing a palette family, display face or signature device from them unless the user asks for continuity (a sister brand, a second page for the same client).

## 9. Keeping this file current

Defaults drift with every model release and every popular skill: today's alternative becomes tomorrow's default (the 2025 cookbook's recommended fonts are in today's house style). When the first full build matches something not listed here, add it under the right layer with the date. At each new model release, run the probe on five different briefs and update §2-§3.
