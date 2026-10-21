# Heron: the verified case study

Heron AI (heronaiapp.com) is the award-winning site behind this skill's three principles. Read this to see the principles in a real project, or when someone asks what Heron did. Everything here was checked against the Codrops case study by Bearplus, the Awwwards page, the served HTML and CSS, and the site's script bundle (read only); where the first summaries of the case were wrong, the corrected fact is the one written here. The text is our paraphrase.

## Contents
1. Facts
2. Scores and how Awwwards weighs them
3. Process: how they found the direction
4. The decisions
5. The story
6. The motion craft
7. What not to copy
8. What site-director takes from it
9. Sources

---

## 1. Facts

| Item | Fact |
|---|---|
| Product | an AI agent for architects that catches problems in drawings (code violations) and helps fix them |
| Studio and team | Bearplus; 3 designers and 3 developers |
| Schedule | scoped at 10 weeks, delivered in a little over 12. The reasons they give: architecture software has a learning curve, and there was no finished product UI, so the team designed the app screens themselves. |
| Awards, in order | CSS Design Awards Website of the Day, 12 Sep 2026; FWA of the Day, 1 Oct 2026; Awwwards Site of the Day, 12 Oct 2026 (7.7), with the Awwwards Developer Award (7.01) and a nomination for the Honors in Business and Services. The three wins came on different days, not together. |
| Built with | designed in Webflow (the HTML carries Webflow's data attributes and generator tag), served from Netlify (the response header says so), with a separate custom Vite bundle of about 290 KB, obfuscated, loaded by a small `config.js` |
| Libraries | GSAP 3.12.5 core and ScrollTrigger, but SplitText and TextPlugin loaded from 3.13.0 (a version mix); Lenis 1.1.5; `@barba/core` and `@barba/prefetch` with no version pinned; Swiper pinned to major 11 only; jQuery 3.5.1 through Webflow |
| WebGL | none. WebGL with shaders was considered for the hero and dropped in favour of DOM and coordinate math. |
| Canvas | for the cursor only, per the article. The HTML has no `<canvas>` (it is created in script); the bundle is obfuscated, so other canvas use cannot be ruled out. |

Two of the award details rest on weaker sources: the FWA page renders client-side, so its award and date come from the Codrops article plus a search-index summary; the CSSDA page was not retrieved, and a search summary of its listing gives judges' scores of UI 7.97, UX 8.06 and innovation 8.00 (8.01 overall).

## 2. Scores and how Awwwards weighs them

**Site of the Day: 7.7** (18 jurors). Awwwards weighs the four criteria as follows:

| Criterion | Weight | Heron |
|---|---|---|
| Design | 40% | 7.75 |
| Usability | 30% | 7.48 |
| Creativity | 20% | 7.85 |
| Content | 10% | 7.81 |

**Developer Award: 7.01** (5 jurors, individual overalls 6.25 to 7.40). The award goes to sites scoring above 7. The weights come from the Awwwards Development Award Guidelines (document v0.7, with a revision announced but not dated); they reproduce Heron's 7.01 exactly, so they are the ones in use. The Heron page itself shows the six criteria without weights.

| Criterion | Weight | Heron |
|---|---|---|
| WPO (performance) | 0.20 | 7.00 |
| Responsive design | 0.20 | 7.00 |
| Semantics / SEO | 0.20 | 7.00 |
| Markup / Meta-data | 0.15 | **6.60** (lowest) |
| Animations / Transitions | 0.15 | 7.60 |
| Accessibility | 0.10 | **6.80** |

- **Markup / Meta-data (6.6) is Heron's weakest Developer score, not accessibility (6.8).** Our target is to beat both.
- Accessibility weighs only 10%; WPO, responsive and semantics weigh 20% each. Under WPO the guidelines ask to avoid filters and to ship no console logs or errors.
- The guidelines' accessibility checklist: keyboard, mouse and touch input; labelled controls; focus management and tab order; legible font sizes; contrast; no relevant information only on hover; text alternatives; `aria-hidden` on decorative elements; landmarks, roles, states and labels; browser history; a pause control for animation that starts by itself and runs over 5 s; content usable with no CSS and with no JS; working across browsers; Windows High Contrast mode.

## 3. Process: how they found the direction

- **Two rejected directions.** One was too safe: text and imagery, almost no interaction, raw product screenshots. The client liked it, but the team held back the sign-off and reframed the brief: what would a tool that helps architects catch and fix problems look like, with "AI" deleted from the brief? The other was architectural editorial, close to brutalist, built from type and floor plans; it was dropped because it made Heron look like "a studio or publication, not software that does something" (Bearplus, Codrops). The article does not make the order of the two clear (one caption calls the editorial one the first concept), so treat them as two rejections, not as a first and a second.
- **References from the client's own tools, not from inspiration sites.** The team says it did not start from Pinterest or inspiration galleries but from architecture software itself: floor plans, dimension lines, grids, redline markup and the way Revit lays out information on screen, plus blueprints, elevations, BIM viewports, technical drawings, annotations, violation highlights, UI states, brutalist forms and vintage paper.
- **Banned look:** purple gradients, glowing orbs, chatbot bubbles. The chosen direction: technical architecture meeting active intelligence.
- **No product UI to show,** so they designed the app screens themselves and reworked screenshots into deliberate visuals instead of dropping in raw captures.

## 4. The decisions

- **One accent with one meaning.** The base is off-white, near-black (`#282828`) and the drawing grid. Red (`#FA3600` in the site CSS as the brand token; the Awwwards palette sampled `#F15534`) is the one real accent and appears almost only on violations and alerts: the less colour noise, the more weight a warning carries. "Almost only" is the article's own hedge, not an absolute rule.
- **Two families: a display face and an instrument face.** BT Grotesk for display (400 to 700 with italics), against small type for indexes, coordinates and building codes set in Geist Mono 500. The article names only BT Grotesk; Geist Mono comes from the site's CSS (`@font-face` for Geistmono) and a mono class on the coordinate readouts.
- **A grid from the client's world:** a drawing sheet, with an invisible coordinate system and metadata and labels running to the viewport edges.
- **One focal point per section,** to escape the text-left, image-right rut.
- **Every element earns a role:** they stripped details until red meant a violation, a line meant the drawing, a coordinate meant the viewport, and motion meant a change in the agent's state.
- **The swap test.** In their retrospective, the team says this is not a site where you could put another brand's logo on it and notice nothing. That is the source of our swap test.

## 5. The story

- **Four states instead of a feature list.** The homepage follows the product's real workflow: Observe, Advise, Act, Learn. These are four states of one system, not four feature cards, and they give the scroll a spine.
- **One persistent object.** Scroll is the timeline and one architectural model stays on screen while an overlay changes state: watching, a violation appears, a suggestion is offered, the action is carried out. The context never resets.
- **A hero interaction taken from the work.** The hero is an ordinary architectural drawing; dragging a selection across it surfaces guardrails, handrails and code references. The pointer-to-reveal mapping stays close to 1:1, because heavy easing reads as an effect and directness reads as a tool. A drag registers after 2 px; the selection's highlight gradient points in the drag direction; markers are remapped to the image as displayed under `object-fit`.
- **The brand moment comes from the work too:** on the About page a floor plan catches a problem and its geometry lifts and resolves into the logo, with no brand copy needed.
- **Small surfaces speak the client's language:** the preloader shows live X/Y readouts in mono, and the metadata, coordinates and status labels all use drawing language. Most visitors never notice consciously; the team says that is the point.
- **The cursor's states come from the same world:** an HTML layer over the canvas dot inverts over dark areas, grows on links and contracts into a targeting reticle when pressed.
- **Polish the smallest transitions, in order:** geometry first, then the highlight, then the text. The team credits these, not the big moments, with making the site feel like a responsive tool.
- **Their lesson:** scroll, motion and responsive decisions can only be judged running live, so prototype in the browser early and build mobile alongside desktop from day one.

## 6. The motion craft

Values come from the article unless marked (bundle): those are read from the obfuscated bundle, where literal values are in clear text but the structure around them is reconstructed.

- **Smooth scroll:** Lenis driven from the GSAP ticker, `lagSmoothing(0)`, and `ScrollTrigger.update` on Lenis's scroll event. (bundle) Lenis is created per Barba container (wrapper = the container) and ScrollTrigger's default scroller is set to it; a class on the container toggles when Lenis velocity passes 0.1, with a 150 ms idle timeout, to suspend hover effects while scrolling.
- **Ink transitions:** a scroll-scrubbed SVG mask between a sketch and the finished render, top to bottom or centre-out. The edge filter: feTurbulence (fractalNoise, baseFrequency 0.045 0.055, 4 octaves, seed 5), then feDisplacementMap (scale 100, R and G channels), then feGaussianBlur (1.8), then an alpha ramp in feComponentTransfer (slope 2.2, intercept -0.6). The mask path morphs from a shallow quadratic curve to a deeper one. An opacity crossfade was tried first and dropped because it lost all the craft. The filter sits on a path inside an SVG `<mask>` applied to an SVG `<image>`: the mask is internal to the SVG.
- **Canvas cursor:** fine-pointer devices only, per the article. (bundle) A pointer effect is gated with `(any-hover: hover) and (any-pointer: fine)`; which component that gate guards is not provable from the obfuscated code, and the two research passes disagree (cursor or logo hover). A 9 px square dot; lerp 0.18; speed smoothed by 0.2; a trail while the smoothed speed is above 1.5, with trail points added when movement exceeds 0.05.
- **Footer pointer ink:** a circular mask following at lerp 0.09 with a pulse layer at 0.15; the radius grows in 0.55 s (the pulse to 1.05 times the radius at opacity 0.2 over 0.45 s) and shrinks in 0.8 s (the pulse in 1 s), all linear; under reduced motion the durations are 0.
- **Page transitions:** Barba in sync mode with the prefetch plugin ((bundle) `preventRunning: true` and a 5 s timeout); CSS variables for the mask percentage and a line width tweened on `html` over 0.8 s (`power1.in` leaving, `power1.out` entering).
- **Height:** 1440x900 and 1440x700 treated as different canvases; positions computed from `innerHeight` and measured content height; (bundle) on a height change (200 ms debounce, only if the value changed) `lenis.resize()` then `ScrollTrigger.refresh()`, with `invalidateOnRefresh: true`.
- **Text (bundle):** SplitText lines with a mask and `autoSplit` after `document.fonts.ready`; characters in one place only.
- **Performance framing:** fewer things running at once, rather than micro-optimising each animation.

## 7. What not to copy

| Heron did | Why not | We do |
|---|---|---|
| GSAP 3.12.5 core with 3.13.0 plugins, Barba unpinned, Swiper pinned to a major only | mixed and floating versions break silently | exact pins; every GSAP plugin on the core version |
| Separate requestAnimationFrame loops: the article describes one ticker callback, yet its own cursor and footer code wake their own loops, and the bundle has 21 `requestAnimationFrame` references | two clocks fight and idle loops cost every frame | `engine.onFrame`: join while moving, leave when settled |
| No skip link: the served homepage HTML has none, its only in-page link is `href="#"`, and its `<main>` has no id | keyboard and screen-reader users wade through the header on every page | a skip link to `<main id="main">`, focus moved to it |
| A root font size in `vw` only (`0.5787vw` on desktop, `1.199vw` below 992 px, `2.5445vw` below 768 px, 10 px at 1728, 834 and 393 px wide) | it ignores the visitor's browser font size; a likely part of the 6.8 | `clamp()` with a `rem` floor |
| Pointer-only content: the drag hero, as the article shows it, has no keyboard or touch path | the Developer checklist asks for keyboard, mouse and touch input and no relevant information only on hover | a keyboard and touch path for every reveal; the findings also in the HTML; the footer's static logo always visible |
| Lenis 1.1.5 (no reduced-motion support); a footer lens that keeps following under reduced motion with zero durations, and a bundle that appears to read the preference only once | reduced motion is a separate render path | lenis 1.3.26; strict reduced motion; listen for preference changes |
| A published ink snippet with mismatched mask ids, a `mask-image` without `#`, and CSS `mask-image: url()` on HTML | it fails in Safari and does not run as written | the technique, not the snippet: an SVG-internal mask, ids rewritten per instance |
| A full-size filter with 4 octaves | the most expensive way to draw the edge | a band around the edge, 3 octaves, a baked tier, one live filter in view |
| Leave and enter tweening `--size--line` and `--size-line` | a typo shipped to production | one variable name, set on the element that uses it |
| A production `config.js` that loads a localhost Vite bundle when `?dev` is set | a development loader in a client's production | never on client sites |

GSAP's licence, for completeness: Heron loads SplitText from 3.13.0, the first public build with the formerly paid plugins. GSAP is free for commercial sites under the Standard no-charge licence (not MIT); the prohibited use is a no-code animation builder that competes with Webflow, so we never build one on GSAP for a client.

## 8. What site-director takes from it

| Heron | site-director |
|---|---|
| References from architecture software, inspiration sites unused | P1: the world dossier; inspiration sites banned until the technique stage |
| Delete "AI" from the brief | P1: the cliche-word exercise |
| A too-safe direction held back even though the client liked it | P1: at least two directions; the safe one is shown and rejected with a reason |
| Red only for violations; BT Grotesk + Geist Mono; a drawing-sheet grid; one focus per section; every element earns a role | P2: one accent with a meaning; a display face and an instrument face; a grid from the client's world; one focal point; the decision log |
| You could not swap the logo and notice nothing | P2: the swap test, against another trade and against a competitor |
| Observe, Advise, Act, Learn over one model | P3: 3-5 chapters named by verbs around one persistent object |
| Drag to reveal violations, near 1:1 | P3: the hero interaction from the work, with keyboard and touch paths Heron lacked |
| Geometry, then highlight, then text | the polish order in QA |
| Ink, cursor, lens, overlapping page transitions | the effects in `<skill>/assets/`, rebuilt on one clock with strict reduced motion |
| 1440x900 against 1440x700; refresh on height change | the short-desktop viewport and the content-height watch |
| Prototype early, mobile with desktop | stage 3: hero and one chapter, desktop and mobile together |
| Dev Award 7.01; markup 6.6, accessibility 6.8 | the QA target: beat both, scored by a fresh critic with the Awwwards weights |

## 9. Sources

All read on 2026-10-15.

- Codrops case study by Bearplus: https://tympanus.net/codrops/2026/10/12/heron-ai/ (process, decisions, story, motion values, the article's own code)
- Awwwards: https://www.awwwards.com/sites/heron-ai (scores, juries, evaluation weights, palette, tags)
- Awwwards Development Award Guidelines (v0.7), linked from https://www.awwwards.com/inspiration/development-award-guidelines-doc, and https://www.awwwards.com/about-evaluation/
- The site: https://heronaiapp.com/ (HTML, response headers, inline CSS) and its Webflow stylesheet on cdn.prod.website-files.com (colour tokens, `@font-face`)
- The bundle: https://heronai-bp.netlify.app/config.js and https://heronai-bp.netlify.app/main.js (obfuscated; read for literal values only, never executed)
- FWA: https://thefwa.com/cases/heronai (client-rendered; award data from the article and a search-index summary)
- CSS Design Awards listing: not retrieved; date and scores from a search-index summary that matches the article
- GSAP licence: https://gsap.com/pricing/ and https://gsap.com/standard-license/
