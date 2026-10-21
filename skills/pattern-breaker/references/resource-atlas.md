# Resource atlas: every library, tool and inspiration source, and when to use it

Read this when choosing a component source, an animation library, an icon set, an inspiration site or a design-system reference, and when an effect from a library "looks cool". Versions and prices were checked on npm, GitHub and the vendors' sites on 2026-10-05.

**Inspiration is technique-stage only.** Every source here used for "finding a direction" (§4's inspiration rows: recent.design, designspells, Ripplix, Mobbin, dark.design, landings.dev, ui.live), like direction-bank.md and idea-bank.md, is opened only after CONCEPT.md exists, to find mechanisms and craft for the chosen concept, and harvested with §7. None of them is a concept-stage input (concept-lab.md §2); under site-director, inspiration sites are banned until this stage.

**The one rule: a library is a parts bin, never a design.** The concept, the visual language and the scroll score come first; then you reach in here for mechanisms (an accessible dialog, an animation engine, an icon set), never for looks (a hero, a background, an effect). Verdicts: **CORE** (default tool) · **SELECTIVE** (named jobs only) · **REFERENCE** (study, never install) · **AVOID** (don't ship in these builds).

## Contents
1. ui-skills.com (the skills hub)
2. UI component libraries
3. Animation, effects and video
4. Inspiration, icons and tools
5. Design systems and Material 3 motion tokens
6. Effects that now read as AI slop, and what to do instead
7. Harvesting inspiration: principles, not copies
8. Decision table: need X → use Y, never Z

---

## 1. ui-skills.com (the skills hub)

A registry of 341 agent skills for UI work (ibelick). `https://www.ui-skills.com/skills/registry.json` is the reliable entry point (the `npx ui-skills` CLI hung in testing); an MCP endpoint exists at `https://www.ui-skills.com/mcp`; install a listed skill with `npx skills add https://github.com/<owner>/<repo> --skill <name>`.

How to use it: as a router, never as the source of truth (catalog blurbs lag their upstream SKILL.md files: open the upstream file at its current commit). The 18 featured skills were read in full for this skill; their best ideas are already absorbed (frontend-design's five default clusters and convergence test, design-lab's variants on different axes, improve-ui's proof-and-falsify review, Emil Kowalski's frequency table and slow-motion feel check, better-ui's exact polish values). Treat every anti-slop list there as "justify it or change it", never as bans: applied literally, they would reject liavmatzri.co.il. Don't import ui-ux-pro-max palettes or fonts: 92 % of its primary colours are Tailwind default swatches and its top font is Inter.

## 2. UI component libraries

Three families with opposite roles:
- **Primitive layers** (behaviour and accessibility, little look): use them, restyled from the project's tokens.
- **Full kits** (behaviour plus a strong default look): legitimate for client admin panels and dashboards only.
- **Effect marketplaces** (copy-paste animated components): the main feedstock of vibe-coded sites. Read for mechanism; never paste the look.

| Library | Family | Verdict | Best use | Slop risk and how to de-template |
|---|---|---|---|---|
| ui.shadcn.com (CLI 4.21, Base UI default, Radix, React Aria) | primitive | **CORE (primitives)** | dialogs, menus, tabs, forms; `init --rtl` / `migrate rtl` makes any registry component RTL-safe | high if defaults stay: re-token radius, elevation, type and colour before the first commit; never adopt a shadcn style (Nova, Luma, Sera, Rhea) as the brand |
| headlessui.com (2.2) | primitive | SELECTIVE | Vue projects, or the smallest React primitive set | low |
| heroui.com (v3 on React Aria) | primitive + skin | SELECTIVE | booking forms, date pickers (React Aria handles RTL and the Hebrew calendar via `@internationalized/date`) | replace the soft blue skin; never reuse its demo cards |
| mantine.dev (9.x) | full kit | SELECTIVE (admin) | Hebrew client admin panels and content editors (DirectionProvider, forms, dates) | never on a marketing page |
| ant.design (6.x) | full kit | SELECTIVE (internal tools) | data-heavy internal tools (`ConfigProvider direction="rtl"`) | unmistakable enterprise look |
| preline.co (5.0) | full kit | SELECTIVE (non-React) | accessible vanilla-JS widgets for Astro or static sites | keep the plugin JS, drop the block markup |
| daisyui.com (5.x) | full kit (pure CSS) | SELECTIVE (prototypes, admin) | fast internal tools | never ship a named default theme |
| tremor.so (Tremor Raw, now free) | full kit (dashboards) | SELECTIVE (charts) | client dashboards; format Hebrew numbers with `Intl.NumberFormat('he-IL')` | the stock KPI card + area chart is itself a cliché |
| flowbite.com (4.x) | full kit | AVOID (marketing) | only a back office already on Flowbite | the 2021 Tailwind SaaS template look |
| floatui.com | full kit | AVOID | - | stale, generic sections |
| magicui.design | effects | AVOID | read Number Ticker for the counting technique only | its signature pieces are the canonical slop list (§6) |
| ui.aceternity.com | effects | AVOID | - | the most over-used effect set of 2024-26 (beams, spotlight, lamp, aurora, sparkles, 3D card, MacBook scroll) |
| 21st.dev (12,000+ components, MCP) | effects marketplace | AVOID for looks | `search_logo` for client logos; `search` to see what is already common (a negative reference) | never let an agent pull heroes or backgrounds from it: it is the slop pipeline itself |
| eldoraui.site | effects | AVOID | - | a clone of Magic UI |
| cult-ui.com | effects | REFERENCE | the "fluted glass" refraction technique, only if the concept is about glass or light | device mockups are a slop staple |
| spell.sh (Spell UI) | effects | REFERENCE | study Signature (handwriting from glyph paths) and Perspective Book; re-implement in GSAP | shimmer and blur-reveal text are landing-page staples |
| vengenceui.com | effects | REFERENCE | the displacement-hover mechanism | glass docks and spotlight navbars are slop |
| originui-ng.com | primitive + skin (Angular) | AVOID | - | wrong stack for React/Astro projects |

## 3. Animation, effects and video

| Tool | Version, licence | Verdict | Use for |
|---|---|---|---|
| gsap.com | `gsap` 3.15.0, free for commercial sites including every plugin (Standard no-charge licence) | **CORE** | scroll choreography (ScrollTrigger), text (SplitText with `mask`, `autoSplit`), Flip, DrawSVG/MorphSVG, Observer; 3.15 adds `easeReverse` (a different ease when a tween runs backwards) |
| lenis (darkroom) | `lenis` 1.3.26, MIT | **CORE** | smooth scrolling on desktop; respects reduced motion by default; touch stays native |
| motion.dev | `motion` (version pinned in foundations.md §2), MIT; Motion+ $399 | **CORE (UI state only)** | component state in React: presence/exit, `layout`/`layoutId`, gestures, `Reorder` (RTL since 13.1), `animateView` page transitions. GSAP owns scroll, Motion owns state; never both on one element |
| animejs.com | `animejs` 4.5, MIT | SELECTIVE | a small vanilla island needing timeline + SVG + drag, or tweening a three.js scene; never alongside GSAP |
| lottiefiles.com | `@lottiefiles/dotlottie-web` 0.80; Lottie Simple License | SELECTIVE (custom files only) | small custom animations (a success check, a menu morph), paused offscreen. Never a stock Lottie as a brand moment; a 356-path Lottie cost MediaWave 25-54 s of blocking time |
| shaders.com | proprietary, commercial use paid, WebGPU only | SELECTIVE with a static fallback | a shader that *is* the concept (caustics for a pool builder, paper grain for a print shop), behind content, paused offscreen. Free open alternative: Paper Shaders (`@paper-design/shaders-react`, Apache-2.0, WebGL2) |
| jitter.video | SaaS, from $12/editor/month | SELECTIVE (asset production) | the brand's own motion assets: logo sting, hero loop, reels, Lottie exports; start from the concept's motion verb, not the template gallery |
| swishy.ai | prompt-to-video SaaS | AVOID for sites | generic by construction; not scroll-linkable |
| animmasterlib.dev | paid videos of effects cloned from award sites | REFERENCE at most | understand a mechanism; never paste; licence unclear |

**Engine choice:** scroll choreography and pins → GSAP + Lenis with sticky stages; Hebrew headline reveals → SplitText by lines or words with a mask, never characters; React component state → Motion; page transitions → View Transitions (native or Motion's `animateView`); decorative scroll-linked CSS (a progress tint) → `animation-timeline` behind `@supports`; brand drawing → DrawSVG/MorphSVG; icon-scale animation → custom dotLottie or CSS.

## 4. Inspiration, icons and tools

| Source | Verdict | How to use it |
|---|---|---|
| recent.design | REFERENCE (positive) | daily curation including print, packaging, editorial and motion: pull principles from outside the web, the best antidote to web-only references |
| designspells.com | REFERENCE (positive) | 340 delightful micro-details; harvest principles (below) |
| ripplix.com | REFERENCE (motion) | 7,000+ real UI animations: step through frame by frame to measure real durations and easing |
| mobbin.com | SELECTIVE (UX) | real flows (booking, checkout, onboarding, forms, empty states) for features the site really has |
| dark.design | REFERENCE | dark-mode craft (contrast steps, light sources); dark + grid + glow is itself the AI-tech look |
| landings.dev, ui.live | REFERENCE (negative) | map the category's conventions (and what is trending, i.e. about to be generic), then break one deliberately |
| uiverse.io | AVOID as a source of looks | look up a pure-CSS mechanism, then restyle from tokens |
| phosphoricons.com | **CORE (feature icons)** | 1,512 icons × 6 weights; match weight to the typeface; `mirrored` for directional icons in RTL |
| lucide.dev | SELECTIVE (chrome) | close, chevrons, menu, external link; tune `strokeWidth`; the default set of shadcn and most AI UI, so not for brand moments |
| iconsax.io | SELECTIVE | a soft rounded duotone voice, only when the concept asks for it |

The inspiration rows above (recent.design to uiverse.io) are technique-stage only: they answer "how do we perform this chosen moment", never "what should this site be".

Icon rules: feature icons come from Phosphor or are drawn; Lucide only for chrome; mirror only directional icons in RTL (arrows, chevrons, reply), never logos, play buttons, checkmarks or clocks; never Lucide `Sparkles` as the "AI/magic" sign; never icons in pale tinted tiles.

**designspells, translated into principles** (budget: at most three per site, one functional, one feedback, one hidden; each traces to the concept, works by keyboard, has a reduced-motion fallback, speaks Hebrew):
- Browser chrome is canvas: draw progress into the favicon during a long upload or quote.
- Proximity, not hover: the logo notices the pointer within ~120 px (off on touch and under reduced motion).
- Hover adds information: the main CTA previews what happens next or the next free slot.
- Illustrations answer the input: the guest count fills the drawn hall; the tray grows with portions.
- A time-aware brand: morning and evening states computed in `Asia/Jerusalem`; Friday afternoon says "נחזור אליכם במוצאי שבת".
- Scroll as a time machine: one scrubbed value drives the sky, light and copy across a day (a bakery from 04:00 dough to 07:00 opening).
- Numbers are characters with physics: in a price calculator, digits roll and separators slide; `aria-live` announces only the final value.
- The completion animation is the metaphor of the action: the message card folds and flies toward WhatsApp.
- A skeuomorphic gesture that *is* the service: drag a VHS into the deck to play a before/after clip (with a keyboard button path).
- Collision-aware UI: the floating WhatsApp button moves aside instead of covering the footer CTA or the cookie banner.
- The 404 demonstrates the product: a tape that ran out; drag the playhead to rewind home.

## 5. Design systems and Material 3 motion tokens

| Source | Verdict | What to take |
|---|---|---|
| m3.material.io (motion) | **CORE (numbers only)** | easing, duration and spring tokens as calibration, never the Material look |
| open-ui.org/design-systems | REFERENCE (positive) | component naming; native HTML that replaces JS widgets: Popover API, `<details name>` exclusive accordions (an FAQ fits), invoker commands, customizable `select` |
| open-design.ai (152 DESIGN.md systems) | REFERENCE (format only) | the DESIGN.md format for the project's own design doc; never snap a client to a famous brand's system ("make it look like Stripe/Linear" is today's most common slop prompt) |
| github.com/mjmirza/apple-design-system | REFERENCE | principle and pattern names; Apple's SF fonts and SF Symbols are licensed for Apple-platform mock-ups, never for client websites |

Material 3 tokens, paste-ready (the concept picks the character, firm or expressive; M3 supplies defensible numbers: duration grows with distance, entrances decelerate, exits accelerate, spatial motion may overshoot, opacity and colour never do):

```css
:root {
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-standard-decel: cubic-bezier(0, 0, 0, 1);
  --ease-standard-accel: cubic-bezier(0.3, 0, 1, 1);
  --ease-emph-decel: cubic-bezier(0.05, 0.7, 0.1, 1);    /* entering */
  --ease-emph-accel: cubic-bezier(0.3, 0, 0.8, 0.15);    /* leaving */
  --spring-default-spatial: cubic-bezier(0.38, 1.21, 0.22, 1);  --dur-default-spatial: 500ms;
  --spring-default-effects: cubic-bezier(0.34, 0.8, 0.34, 1);   --dur-default-effects: 200ms;
  /* durations: short 50-200ms · medium 250-400ms · long 450-600ms · extra-long 700-1000ms (ambient only) */
}
```
GSAP: `CustomEase.create('m3Emph', 'M0,0 C0.05,0 0.133333,0.06 0.166666,0.4 0.208333,0.82 0.25,1 1,1')`. Motion: `{ type: 'spring', stiffness: 380, damping: 31 }`. Scroll-scrubbed motion uses `ease: 'none'` and puts its character into the scrub smoothing (0.3-0.8, scroll-score.md §3 rule 11).

## 6. Effects that now read as AI slop, and what to do instead

They ship as one-command installs and carry no meaning about the client. Keep a mechanism only if the concept needs it; delete the signature people recognise.

| Effect | Instead | Allowed only when |
|---|---|---|
| Background beams, spotlight cards, lamp, cursor glow | light that does something (a projector beam revealing the next scene); hover that adds information | light is the client's material, once |
| Aurora, mesh gradients, animated gradient backgrounds | a colour field sampled from the client's photos; a material texture of the trade | the colour field is the concept, behind content, with a static poster |
| Grid, dot and retro-grid backgrounds | a real measurement grid aligned to the layout, if grids are the trade | the grid is functional |
| Meteors, sparkles, particles, glowing stars, vortex | spend the motion budget on narrative beats | never |
| Shimmer, shiny, rainbow, glow and border-beam buttons | a solid brand button, a tactile press, a hover that previews the outcome | never |
| Rotating conic-gradient borders | one decisive static border with a meaning (the selected plan) | never looped |
| Gradient text | one key noun in the brand colour | never as default styling |
| Bento grids | a layout from the content hierarchy: one dominant item and its supporters, or a list | the content truly is peers of different weights |
| Marquee logo walls, infinite testimonial cards, tickers | few static logos with context; one large testimonial at the beat it proves | the data is live |
| Globes and world maps with arcs | the real neighbourhood or delivery radius, photographed | the business is truly global and shows real data |
| Animated beams, orbiting circles | the real process drawn step by step with DrawSVG | the product is an integration hub |
| Device mockups (MacBook scroll, iPhone/Safari frames) | real work full-bleed at real scale | an app studio showing its own app |
| Hero parallax, 3D tilt and wobble cards | one hero image with a concept-driven scroll camera move | never tilt for its own sake |
| Sticky-scroll reveals, tracing beams, stacking cards, pinned horizontal galleries | holds only where the content is sequential, a different mechanic per hold, sticky stages | the sequence exists in the content |
| Dock nav, floating glass navbars | quiet, high-contrast, RTL-native navigation | never |
| Number-ticker stat heroes | one specific, checkable fact in a sentence | the number is live or user-driven |
| Typewriter, word-rotate, flip-words, blur-reveal, scramble text | readable at first paint; a masked line reveal tied to one beat | decoding is the concept (security, cipher) |
| Liquid metal, chrome blobs, ASCII and dithered heroes | GPU effects only when the material is the concept | a metal workshop, a retro-computing brand |
| Glassmorphism, liquid glass | solid surfaces with deliberate contrast | an optics or glazier brand, once |
| Confetti on any success | rare, earned celebrations; a stamp or seal for guarantees | after a long form or a booking |
| Stock Lotties | custom animation authored to the brand | never stock |

Grep an existing codebase before judging (upgrade mode):
```bash
rg -n "<(BackgroundBeams\w*|Spotlight|CardSpotlight|LampContainer|AuroraBackground|BackgroundGradientAnimation|Meteors|SparklesCore|Particles|RetroGrid|DotPattern|GridPattern|ShimmerButton|RainbowButton|BorderBeam|ShineBorder|MovingBorder|AnimatedGradientText|AnimatedShinyText|Marquee|InfiniteMovingCards|BentoGrid|Globe|WorldMap|AnimatedBeam|OrbitingCircles|NumberTicker|TextGenerateEffect|TypewriterEffect|WordRotate|FlipWords|HyperText|HeroParallax|MacbookScroll|ContainerScroll|TracingBeam|StickyScroll|Dock|Confetti|MagicCard)\b" src
```
slop-scan catches the same names in code mode: `marketplace-effect` for the generic effects, and its specific rules for the rest (`typewriter-headline`, `count-up-numbers`, `marquee-lib`, `cursor-spotlight`, `conic-border-beam`, `mesh-gradient-bg`, `masked-grid-bg`, `device-mockup`, `celebration-confetti`, `bento-grid`).

## 7. Harvesting inspiration: principles, not copies

Copy reasons, never results. Assets, code, fonts, colour pairs, layouts and signature effects stay with their owners; what transfers is the intent, re-grounded in the client's world. Harvesting is a technique-stage step: it starts after the concept is chosen and serves its moments.

1. **Diversify:** at least three references from at least two domains, one of them not a website (print, packaging, editorial, film, architecture).
2. **Capture:** `scroll-film.mjs` on each web reference (desktop and mobile, `--video`); judging motion from stills misses it.
3. **Measure motion:** durations, eases, stagger, scrub smoothing, hold lengths in viewports, smooth-scroll settings. In DevTools: `document.getAnimations().map(a => a.effect.getTiming())`; where GSAP is exposed, `ScrollTrigger.getAll().map(s => ({ start: s.vars.start, end: s.vars.end, scrub: s.vars.scrub, pin: !!s.vars.pin }))`. Replay at 10 % speed.
4. **Decompose** each noteworthy moment into a principle card (below).
5. **Abstract:** rewrite each principle with no noun from the reference. Test: could the sentence produce three visibly different sites?
6. **Re-ground:** map each principle onto the client's material, trade and story beat.
7. **Mutate** at least two of: trigger, direction (RTL), material, timing, typography, colour role.
8. **Recognisability test:** compare the films side by side: would a designer name the source in two seconds? If yes, mutate again.

```md
### <moment name>  (ref: <site>, <section>, film <frames>)
- Observable: what moves, triggered by what, for how long (numbers)
- Intent: what the motion says about the content at this beat
- Mechanism: e.g. held stage 1.5 vp, scrub 0.6, image scale 1 → 1.12
- Principle (no reference nouns): "…"
- Do NOT carry over: palette, typeface, layout, the exact effect, the copy
- Client mapping: <beat> → <client material/verb>
- Mutations applied: <list>
```

Example: the reference uses overshoot (`back.out(2-3)`) on small brand shapes. Principle: "overshoot on small elements signals personality; its amount encodes temperament". A children's activity centre takes the bouncy end; a law office takes `power3.out` with no overshoot; a bakery might "rise" (scale from 0.96 with a long deceleration). Same principle, three unrecognisably different results. Record lineage in the project's DESIGN.md: `principle ← reference, date`.

## 8. Decision table: need X → use Y, never Z

| Need | Use | Never |
|---|---|---|
| Accessible dialog, menu, tabs, popover | shadcn primitives restyled from tokens; native `<dialog>` / `popover` when enough | stock shadcn card + Geist as the brand |
| RTL-safe components | `npx shadcn@latest init --rtl` or `migrate rtl`; Mantine DirectionProvider; React Aria | fixing `ml`/`mr` by hand later |
| Hebrew date picker | React Aria + `@internationalized/date` | a random marketplace picker |
| Client admin or content editor | Mantine or antd (RTL) | marketing effects |
| Scroll choreography | GSAP ScrollTrigger + Lenis, sticky stages | `whileInView` everywhere; default fixed pins |
| Hebrew headline reveal | SplitText lines/words with a mask, on one signature line | character cascades, typewriters |
| Component state | Motion (`m` + `LazyMotion`, presence, layout) | GSAP and Motion on the same element |
| Page transitions | View Transitions | copied curtain wipes |
| Durations and easing | M3 tokens tuned to the concept | magic numbers; bouncy opacity |
| Ambient texture | a concept material via Paper Shaders or shaders.com with a poster | aurora, mesh, beams, particles |
| Feature icons | Phosphor weighted to the type, or drawn | Lucide Sparkles; tinted icon tiles |
| Brand motion assets | Jitter, human-directed | prompt-generated video |
| Showing work | real work full-bleed with a scroll camera move | device mockups, hero parallax |
| Social proof | one checkable fact in a sentence; one large testimonial at its beat | count-up stat hero; testimonial marquee |
| Primary CTA | solid button, tactile press, outcome preview on hover | shimmer, glow, border-beam |
| FAQ | `<details name="faq">` with a height animation | a JS accordion component |
| Mechanisms for a chosen concept (technique stage only, never to find the direction) | recent.design, Ripplix, Mobbin, designspells, harvested with §7 | any inspiration source or bank before CONCEPT.md exists; landings.dev, dark.design, famous-brand DESIGN.md as templates |
| Typefaces | licensed web fonts chosen for the concept, Hebrew + Latin pairing | Apple SF on the web; the Geist + Instrument Serif default pairing |
