# Upgrade mode: bring an existing site to life without breaking it

Read this at the start of upgrade mode, before asking anything. An upgrade is a controlled experiment, not a redesign: first freeze what must not change, then measure where the site is generic or lifeless zone by zone, then change only what the diagnosis earns, in waves that each prove they broke nothing.

## Contents
1. The pipeline (and small sites)
2. Pre-scan (silent, first step of the audit)
3. Baseline: the preservation contract and the "before"
4. The audit: four instruments, one zone map
5. Scoring zones
6. DIAGNOSIS.md
7. Verdict: polish, upgrade, rebuild in place, or replatform
8. Directions
9. Waves
10. The motion layer for existing sites
11. Coexisting with what the site already has
12. Platform playbooks
13. Gates for every wave, rollout and rollback
14. Measuring the result honestly

---

## 1. The pipeline

Artifacts live in `design/upgrade/` unless a path says otherwise.

| Step | Action | Artifact | Exit |
|---|---|---|---|
| U0 | silent pre-scan (§2) | `prescan.json` | platform, host, repo access, no-JS floor and crawler access known |
| U1 | baseline: preservation snapshot, films, motion-audit, slop-scan, `gates.mjs` (Lighthouse included) | `baseline/*` | every "before" number exists, the contract is frozen |
| U2 | audit: the four critics as separate passes, reporting everything (coverage mode, §4) | `critics/*.json` | every zone has observations |
| U3 | zone map: segment, score, triage false positives | `zones.json`, `triage.md` | scores computed, false positives logged with reasons |
| U4 | write the diagnosis, with a provisional verdict from §7 rules 2-6 | `design/DIAGNOSIS.md` (+ `design/DIAGNOSIS.rtl.md` for the client) | every claim points to evidence |
| U5 | intake round 1 (`intake-upgrade.rtl.md`): עומק (recommended option = the provisional verdict), לא לגעת, להחיות (options = the top-priority zones), עוצמה (derived from the audit) | `intake.json` | depth, sacred list, zones and intensity chosen; which inherited proof is real |
| U6 | final verdict: §7 rule 1 against the chosen intensity | `verdict.json`; the verdict in DIAGNOSIS updated | rule and numbers shown in DIAGNOSIS |
| U7 | 2-3 directions (§8), intake round 2 | `directions.md`, `chosen.json`, `ban-list.json` | the user picked |
| U8 | change list, intake round 3; compile `design/BRIEF.md` (intake.md) with `CHANGES.md` as its plan | `CHANGES.md`, `intended.json`, `design/BRIEF.md` | every change cites a zone and its evidence |
| W0-W4 | waves, each verified (§9, §13) | `waves/Wn/*` | all gates pass, the user approves |
| after | rollout, then measure (§13, §14) | `rollout.md`, `before-after.md` | keep, iterate or roll back recorded |

Human gates: the three intake rounds (round 2 is the direction choice), approval of each wave, and the production deploy. At each one, ask and stop until it is answered; everything between them runs on its own.

**Small sites** (≤ 3 routes and no measurable traffic) take a shorter path: one preservation snapshot, one film per viewport, motion-audit, slop-scan, then the verdict. Skip §5 scoring when §7 rule 3 or 4 fires; otherwise score a light G per zone, because rules 2 and 5 need it. When the verdict is rebuild in place, every zone is rebuilt, so the להחיות question drops out (intake.md: no question whose answer would not change the build), W0-W3 are built as one pass, and the §13 gates run once at the end; rollout and §14's measurement windows don't apply to a site without traffic.

## 2. Pre-scan (silent, first step of the audit)

Opus 5.5 gets to work quickly; in upgrade mode, explore broadly first, and ask nothing until the diagnosis exists (U5). In about 30 seconds of scripts:

| Check | How |
|---|---|
| Platform fingerprint | raw HTML and headers. Next: `/_next/static/`, `__NEXT_DATA__`. Astro: `/_astro/`, `<astro-island>`. TanStack Start (new Lovable apps): `<script class="$tsr">`. Vite SPA: an empty `<div id="root">` + `/assets/index-*.js`. WordPress: `/wp-content/`; Elementor: `elementor-` classes. Webflow: `data-wf-page` on `<html>`. Wix: `static.wixstatic.com`. Framer: `framerusercontent.com`. Shopify: `cdn.shopify.com`. Plus scroll-film's `meta.json` globals (gsap, Lenis, THREE, Motion…) |
| Repo access | `package.json`, framework config, git remote |
| No-JS content | the HTML with JS off: is the H1 there, and how many words compared with the rendered page? (legacy Lovable SPAs show an empty shell to anything but verified crawlers) |
| AI crawler access | `curl -A "GPTBot"`, `ClaudeBot`, `PerplexityBot` + robots.txt |
| Host | response headers (`server: cloudflare`, `x-vercel-id`) decide the rollout mechanism |

## 3. Baseline: the preservation contract and the "before"

Nothing changes until these exist.

**The preservation contract.** `node <skill>/scripts/preserve.mjs snapshot <url[,url…]|sitemap.xml> --out design/upgrade/baseline/preservation.json` records two views of every URL, with JavaScript off (what GPTBot, ClaudeBot and Perplexity read) and on (what people and Googlebot see): status, final URL, canonical, robots, hreflang, lang/dir, title, description, H1/H2/H3 text and order, word counts, links, CTA hrefs (tel, mailto, WhatsApp), form fields, image alts, JSON-LD types, and a hash of the main text. After each wave, snapshot the candidate the same way and run `node <skill>/scripts/preserve.mjs diff design/upgrade/baseline/preservation.json design/upgrade/waves/Wn/preservation.json --intended design/upgrade/intended.json`; it fails on any difference not declared in `intended.json`. The baseline is usually the live site and the candidate a local `serve.mjs` build or a preview deploy, so diff maps the candidate's origin onto the baseline's before comparing (URL keys, final URLs, canonical, hreflang, internal links). It infers the mapping when each file holds one origin; otherwise pass `--map <candidate origin>=<baseline origin>`, for example `--map http://localhost:4173=https://client.co.il`. Without a mapping every page reports "missing from candidate" and nothing is compared.

| Field | Rule |
|---|---|
| status, final URL, canonical, robots, hreflang, lang/dir | identical |
| title, description | identical unless intended |
| H1 | identical text, exactly one per page |
| H2 sequence | identical texts in the same DOM order (visual reordering through CSS only) |
| words | raw word count drops at most 3 %; raw vs rendered stays within 10 % (or content is hiding behind JS) |
| links | no internal link removed |
| menu anchors | same order, every target exists |
| CTAs, form fields, form action | identical: conversions are sacred |
| image alts | none lost |
| JSON-LD types | none lost, none invalid; added types are listed as notes |
| main-text hash | changes only with an intended copy edit |

**The "before".** Films (desktop and mobile, with `--video`; take one with the cookie banner and chat widgets dismissed too); motion-audit with `--dead-vp 1.5` (zone scoring in §5 needs the shorter dead stretches; those of 3 vp or more are still the page-level failures); slop-scan in code mode and URL mode; `node <skill>/scripts/gates.mjs <url[,url…]> --out design/upgrade/baseline/gates` (axe, every in-page link's landing with motion on and reduced, overflow at 320/390/768/1440, the no-JS census, forms, console errors, and Lighthouse mobile ×3 per template as a median when a `lighthouse` binary is on PATH, version per foundations.md §2) plus the no-JS floor; and, if possible, analytics baselines (leads, CTA clicks) and a reach-per-zone heatmap. If the site has no lead events, add them in W0 before any visual change, or there will be no "before" to compare with.

## 4. The audit: four instruments, one zone map

**Zones, not pages.** Page averages hide boredom. Measured on mediawave.co.il: the page-level fade share was 0.63 with 6 motion kinds, which passes the monotony gate, yet the FAQ was 16 of 16 plain fades and the process section 16 trigger-only reveals with no scrub and no hold, and the page had zero held moments. Segment the page into zones: each `section`, `header`, `footer`, `main > *` and `[data-section]` taller than 30 vh (merge thin bars into a neighbour); on div-heavy builders cut by background changes or gaps over 120 px seen in the film. Tag each zone's role (hero, proof, offer, process, about, pricing, faq, cta, contact, footer, content) and flags: above the fold, on the conversion path, brand moment.

Run the four critics as separate passes in the main thread, each starting from the files rather than from the previous pass's notes; use one auditor subagent per route group only past about 10 routes (SKILL.md, Delegation). Each critic reports every generic or boring observation with confidence and severity and does not filter (filtering is a later step; reviewers told to report only important issues miss things):

| Critic | Reads | Looks for |
|---|---|---|
| Visual | `film.html` contact sheet, then full-resolution stills of suspect zones | reflexes.md defaults, stock imagery, incoherent illustration styles, empty-not-composed whitespace, decoration repeated under every heading, the "tasteful AI" look |
| Copy | the no-JS text per zone | generic claims, the swap test (could a competitor paste this line unchanged?), AI cadence (triads, "not X but Y", em-dashes), proof density; Hebrew lexicon in content-voice.md |
| Structure | DOM outline per zone and the zone sequence | template distance from `hero → logos → features → steps → testimonials → pricing → faq → cta → footer` (distance ≤ 2 = a component stack), zones with no story function, missing acts |
| Motion | `motion-audit.json` and the scroll strip | per-zone fade share and motion kinds, dead stretches, peaks (held scenes and scrubbed sequences of at least 1 vp), idle movement under reduced motion, scroll entrances that still play under reduced motion (AOS, `whileInView` without `MotionConfig`) |

**Triage before fixing.** Tool false positives become bad "fixes". Known ones: nav links hidden on mobile by a media query reported as stuck-hidden (check the still); CLS reported on GSAP pin handoffs (watch the film: if nothing jumps visibly, record it, and still prefer sticky stages); detectors reading HTML comments or `<noscript>`; contrast flakes while a banner fades (settle 2.5 s before axe); blank full-page screenshots (use the film). Log each dropped finding with its reason in `triage.md`.

## 5. Scoring zones

Starting weights, to be calibrated against Nati's own rankings of a few sites:

```
Genericness G (0-100) = 0.40·Visual + 0.35·Copy + 0.25·Structure
Deadness    D (0-100) = share of the zone inside dead stretches (≥ 1.5 vp: motion-audit --dead-vp 1.5), else
                        70·zone fade share + 20·[≤ 1 motion kind] + 10·[no scrub, no hold, taller than 1.5 vp]
Monotony    M (0-100) = how much the zone repeats its neighbours' layout (critic judgement; optional SSIM of downscaled stills)
Boredom     B = 0.45·G + 0.35·D + 0.20·M
Impact      I = Position (above fold 3, first 3 vp 2, else 1) × Path (CTA/form 3, on path 2, else 1)
              × Brand (brand moment 1.5) × Reach (0.3 + share of sessions reaching it, if measured)
Effort E, Risk R = 1-5 each (risk = touches SEO text, forms, legal, the LCP element)
Priority    P = B × I / (E + R)
```

Cheap, boring zones with low SEO risk (an FAQ, a process list) often rank first: re-choreographing them is a pure motion-and-layout change, and it can give the page its first peak. The hero usually has the biggest impact and the highest risk (it holds the LCP element and the H1), so it gets its own wave.

## 6. DIAGNOSIS.md

Fill `assets/templates/DIAGNOSIS.template.md` into `design/DIAGNOSIS.md`. Rules: the numbers come from the tool outputs (never retype them); every claim about a zone points to evidence (a frame path, a JSON path, a quoted line); strengths come first (an owner accepts a diagnosis that respects the site, and the keep-list feeds the contract); each top zone gets a desktop and a mobile still side by side. Include three numbers to beat (for example: peaks 0 → ≥ 2; worst-zone fade share 1.00 → ≤ 0.4; Slop Index 52 → ≤ 25), the named ban list for this project, the keep list, the debts to pay first (every failed motion-audit and `gates.mjs` check, axe criticals, scroll entrances that still play under reduced motion, the performance floor, widget clutter), the proof to confirm, and the provisional verdict with its rule (final after intake round 1, U6).

**Proof to confirm.** Every testimonial, rating, client count and round stat on the old site is unverified until the owner confirms it (content-voice.md §3 holds the rule). List each one with its evidence (a stock or placeholder avatar, a generic name, no source); intake round 1 asks which are real; unconfirmed items don't ship in the upgraded page (on autopilot, content-voice.md §3 says which to remove and how the section stays alive). Each removal is declared in `intended.json`, so the preservation diff stays honest.

Write a short Hebrew version for Nati and the client in `design/DIAGNOSIS.rtl.md`: one screen of text plus pictures, no jargon ("קטע שבו גוללים ושום דבר לא קורה", "כל השאלות מופיעות בדיוק באותה צורה", "אין באתר רגע אחד שעוצר את הגולש", "משפט שכל מתחרה יכול להדביק אצלו בלי לשנות מילה").

## 7. Verdict: polish, upgrade, rebuild in place, or replatform

| Class | Changes | Keeps |
|---|---|---|
| Polish | tokens, type details, micro-interactions, 1-2 moments | structure, layouts, copy |
| Upgrade | zone-by-zone treatments in waves, token re-map, motion layer, sharper headlines | URLs, information architecture, heading order, CMS, platform |
| Rebuild in place | templates, layouts, visual system and interaction layer | platform, CMS content, URLs, brand marks ("the platform was not the limitation; the template was") |
| Replatform | the platform (and usually the templates) | URLs with a 301 map, content, brand |

First matching rule wins. Rules 2-6 need only the audit, so they give the provisional verdict in DIAGNOSIS (U4); rule 1 needs the intensity chosen in intake round 1 and is applied at U6.
1. The intensity asked for is above the platform's ceiling (§12), or the platform cannot serve crawlable text or meet the performance floor → **replatform** (offer the bridge first if the owner edits weekly: Wix Headless, Lovable's migration to TanStack Start, WordPress as a headless CMS).
2. The skeleton is the template (template distance ≤ 2 and most zones have no story function) and ≥ 60 % of impact-weighted height is generic → **rebuild in place**.
3. A shared theme or template is visible and competitors use the same skeleton, and the goal is to stand out → **rebuild in place**.
4. The change list costs ≥ 60 % of a rebuild → **rebuild in place**.
5. Less than 25 % generic and at least one peak already → **polish**.
6. Otherwise → **upgrade**.

**The message comes before motion.** If half or more of the conversion-path zones fail the swap test, add a copy track before W1, whatever the verdict: motion amplifies a message and can't create one. Never recommend a rebuild without a rule 1-4 trigger, and when the verdict is a rebuild, still price the best upgrade-only path and say what it cannot deliver.

## 8. Directions

Run the concept lab (concept-lab.md) constrained by the keep list, the sacred elements and the ban list, and produce 2-3 directions. The lanes get the upgrade packet that concept-lab.md describes (the diagnosis lists pasted as text, in place of a brief) under its usual lane rules. Each direction has: a concept line from the business (not a style); a palette (ground, ink, one accent; when brand colours are sacred, ration them rather than replace them); a Hebrew-capable type pair (name the default it replaces); one signature move placed in the top-priority brand zone; a motion temperament (calm 1 peak, bold 2-3, cinematic 4+); its bans; and whether it is reachable on this platform. Real content exists in an upgrade, so for bold intensities render each direction as a real-hero mockup (the actual H1, photo and CTA restyled) and run `node <skill>/scripts/slop-scan.mjs --url <mockup url>` on it; drop any direction with three or more second-order signals (it is the "tasteful AI" template).

## 9. Waves

Each wave is one branch, one deploy and one rollback unit.

| Wave | Goal | Typical changes | Extra exit gate |
|---|---|---|---|
| W0 Foundations | pay the debts, install the layer, no visible change beyond removed debts | fix every failed motion-audit and `gates.mjs` check; remove AOS-style libraries and duplicate scrollers; remove unverified inherited proof the owner did not confirm (§6), keeping its section alive; add the engine, the head snippet and kill switches; add a semantic token layer (new names, same values); add lead and zone-view events; consolidate floating widgets | preservation diff shows nothing outside `intended.json` (proof removals declared there); every debt check passes; Lighthouse not worse than the baseline (§13) |
| W1 First impression + one peak | the first 1.5 s, the new skin, the first peak | switch token values to the direction; rebuild the hero around real material with an LCP-safe entrance; idle-mount widgets; one signature move in the top brand zone | peaks ≥ 1; LCP and CLS not worse; Slop Index down |
| W2 Conversion path | a path to the lead that feels alive and has no friction | CTA states, form micro-interactions and inline validation, real proof, a contact-zone moment; no held scene between the hero and the first CTA on mobile | lead events fire; INP ≤ 200 ms on fields; nothing fixed covers a CTA |
| W3 Story + structure | acts and rhythm | theme map at act boundaries, 1-2 held scenes as sticky stages, zone revival in priority order (one move per zone, never the same move in neighbouring zones) | peaks reach the diagnosis target; no zone fade share > 0.5; no dead stretch ≥ 1.5 vp (motion-audit `--dead-vp 1.5`); reduced-motion parity |
| W4 Delight + polish | the details people mention | velocity response, cursor and touch details, footer moment, 404, press and loading states, microcopy | second-order signals ≤ 2; a reviewer told to find "the template zone" comes back empty |

Remove AOS, WOW.js and theme `fadeInUp` classes in W0 and let those zones sit static until their wave: AOS hides content in CSS until its script adds a class, so a failed script leaves the page blank, and it is unmaintained (last published 2022).

## 10. The motion layer for existing sites

Motion is added to markup that already works; it never makes markup work. Drive it with data attributes so the same engine works on any platform that lets you add attributes or classes:

| Hook | On | Engine | Reduced motion | No JS |
|---|---|---|---|---|
| `data-pb-zone="Z03"` | the zone root | one scope per zone; `?pb-off=Z03` skips it | same | nothing |
| `data-pb="<move ID>"` | an element in a zone | runs the move from moves.md | the move's final state | element in its final state |
| `data-pb-opts='{"stagger":0.06}'` | same element | per-element options | timing ignored | - |
| `data-pb-stage` | a tall wrapper whose child is sticky | ScrollTrigger without pin writes `--pb-p` (0 → 1) for CSS to read | wrapper not tall, final state | final state |
| `data-pb-act="dark"` | act-boundary zones | switches theme tokens when the zone crosses mid-screen | instant | static colours |
| `data-pb-pre` | above-the-fold, non-LCP elements only | may be pre-hidden by a head snippet until the engine runs, fail-open after 2.5 s | never pre-hidden | never pre-hidden |
| `.pb--<move ID>` | builders that allow classes but not attributes | normalised to attributes at boot (double hyphen: Tailwind owns `pb-*`) | same | same |

Invariants, the reasons the layer is safe: the final state is the default in HTML and CSS; the layer never changes DOM order, heading levels, link targets or text; **the LCP element is never pre-hidden and never animated from opacity 0** (an opacity entrance moves LCP to the end of the animation); no DOM-wrapping `pin` in upgrades (pin spacers break existing child selectors and gaps, and pins emit layout shifts; use sticky stages); counters animate to the number already in the HTML; nothing lives only in canvas, WebGL, video or Lottie; loops longer than 5 seconds get a pause control (WCAG 2.2.2).

Kill switches, fastest first: `?motion=0` for one visitor, `data-pb-off` on one zone, `<html data-pb-off>` shipped by a one-line redeploy, then the host's rollback.

The head snippet (inline, before blocking stylesheets):

```html
<script>
(function (d, w) {
  var h = d.documentElement;
  if (/[?&]motion=0/.test(w.location.search) || w.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  h.classList.add('pb-pre');
  w.setTimeout(function () { h.classList.remove('pb-pre'); }, 2500); // fail-open: never trap content
})(document, window);
</script>
<style>
  .pb-pre [data-pb-pre] { visibility: hidden; }
  html.pb-on:not(.pb-reduced) [data-pb-stage] { height: var(--pb-len, 250svh); } /* tall only while animated */
  [data-pb-stage] > .pb-sticky { position: sticky; top: 0; min-height: 100svh; }
</style>
```

The layer is `assets/engine/attribute-layer.js` (built on `motion-engine.js`; copy both). Load it after first paint (an idle callback or a short timeout) and call `startLayer({ gsap, ScrollTrigger, SplitText, Lenis })`. Built-in moves: `reveal` (routine, fires early), `mask-lines` (E-01, RTL-safe), `clip` (E-02, scrubbed), `count` (E-05, to the number already in the HTML), `drift` (one or two depth layers). Add the concept's own moves with `layer.register('id', { full, reduced })`, built from moves-recipes.md. Stages expose `--pb-p` (0 → 1) for CSS-driven held scenes; give each stage an id (`data-pb-stage="story"`) so `?at=story:0.5` lands mid-scene, and film a list of states while building with `node <skill>/scripts/scroll-film.mjs <url> --at story:0.2,story:0.5,story:0.9`.

## 11. Coexisting with what the site already has

| Found | Rule |
|---|---|
| Motion/framer-motion `whileInView` fade-ups (the Lovable/v0 signature) | keep Motion for component state (presence, layout, gestures, menus); strip scroll-reveal props from zones the layer owns; one owner per element per property; wrap the app in `<MotionConfig reducedMotion="user">` |
| AOS, WOW.js, Animate.css, theme `fadeInUp` | remove in W0 |
| `html { scroll-behavior: smooth }` | remove when Lenis runs (current lenis.css no longer neutralises it, and native smoothing fights Lenis) |
| page-level CSS `scroll-snap-type` | drop it, or use `lenis/snap` (Lenis does not support CSS snap) |
| an existing GSAP (theme bundle, Webflow integration) | use one GSAP: build the engine with gsap as an external mapped to `window.gsap`; give your triggers ids; never `ScrollTrigger.killAll()` |
| Locomotive Scroll, ScrollSmoother or another smooth scroller | one scroller only; replace it with Lenis in W0 |
| Lottie players | pause offscreen, render small; a 356-path Lottie measured 25-54 s of blocking time on MediaWave |
| Webflow Classic interactions or Elementor motion effects on the same element | remove the native interaction where the layer takes over |
| Tailwind `animate-*` / `tw-animate-css` for accordions and dialogs | keep: these are interaction states |
| chat, WhatsApp, accessibility and cookie widgets | idle-mount after the first interaction or 4 s; at most one floating widget visible at a time |

## 12. Platform playbooks

| Platform | Ceiling | Tokens live in | Engine goes | Attributes reach elements via | Traps |
|---|---|---|---|---|---|
| Lovable / Bolt (Vite or TanStack Start + React + Tailwind v4 + shadcn) | none | `:root` / `@theme` in the global CSS | a client-only effect with a dynamic import (never a top-level import in an SSR route file) | JSX | legacy Lovable SPAs serve an empty shell to unverified agents (audit the rendered DOM; offer the migration to TanStack Start or a prerender step); the owner's later Lovable prompts can strip the layer, so keep motion in `src/motion/` and markup changes to `data-pb*` |
| Next.js (App Router; v0 exports) | none | global CSS, `next/font` | one `'use client'` MotionRoot that starts the engine and restarts it on `pathname` change | data attributes work in Server Components | type changes through `next/font` with metric-matched fallbacks to avoid CLS |
| Astro | none | global CSS | `astro:page-load` starts it, `astro:before-swap` stops it (with `<ClientRouter />`) | markup | bundled scripts run once per session: use the lifecycle events |
| WordPress (block theme / Elementor) | high | child-theme `theme.json` (Global Styles in the database override it: snapshot both) / Elementor Kit | an mu-plugin that enqueues the engine with `strategy: defer`, skipped in editors and previews | "Additional CSS class(es)" with the `.pb--` aliases; Elementor attributes field | caching "delay/combine JS" must exclude the head snippet; no Lenis inside editor iframes; Elementor div soup is heavy on mobile |
| Webflow | high | Variables / classes | Site settings → GSAP integration (Webflow's own copy, plugins included), code before `</body>` inside `DOMContentLoaded` | Custom attributes | "Interactions with GSAP" is native and the default on new sites: use it for local motion; it cannot be authored on non-primary locales, so Hebrew as a secondary locale needs the attribute layer |
| Framer | medium-high | Framer styles; RTL via Site settings → Layout direction → Reverse layout | a code component that starts on mount, stops on unmount | code overrides | page-wide acts with one scroll engine are fragile across client navigations |
| Wix | low | theme colours and fonts | only inside a custom element or iframe | - | no site-wide engine, no Lenis; a realistic glow-up is a re-skin + real imagery + sharper copy + native scroll animations used sparingly + one isolated custom-element moment; a choreography brief means replatform or Wix Headless |
| Static HTML | none | a CSS file | a module script | markup | self-host and pin versions |

shadcn-based sites (Lovable, v0, Bolt) carry an exact fingerprint: `--radius: 0.625rem`, an achromatic OKLCH ramp (`--foreground: oklch(0.145 0 0)`, `--primary: oklch(0.205 0 0)`, `--muted-foreground: oklch(0.556 0 0)`), Lucide icons in `rounded-xl border bg-card shadow-sm` cards, a badge pill above the H1. De-template by changing values while keeping variable names (every component follows): tint neutrals toward the brand hue, one accent, a radius personality from the concept, tonal surfaces without resting shadows, a real display/text pair, rhythm by act. The CLI helps: `npx shadcn@latest migrate rtl` converts physical classes to logical ones on a Hebrew project built LTR; `apply --only theme,font` swaps theme and fonts (without `--only` it reinstalls components and overwrites local edits; commit first).

## 13. Gates for every wave, rollout and rollback

| Gate | Pass rule |
|---|---|
| Preservation | `preserve.mjs diff` (with `--map` for a preview or local candidate) shows nothing outside `intended.json` |
| Crawler view | H1 present with JS off; raw/rendered words ≥ 0.9; no JSON-LD type lost, none invalid (`preserve.mjs diff`, `gates.mjs` no-JS census) |
| Motion honesty | motion-audit: nothing stuck invisible (after triage), reduced motion shows all content and nothing entering on scroll, ≤ 2 idle movers, 0 page errors |
| Smoothness | within the budgets in verification.md, and no metric more than 10 % worse than the baseline, judged on medians (`node <skill>/scripts/motion-audit.mjs <url> --only smoothness --runs 3` on baseline and candidate, same machine) |
| Boredom delta | treated zones: fade share down, motion kinds up, peaks up; Slop Index down; second-order signals ≤ 2 |
| Film A/B | before/after stills paired by zone (not by scroll position, since heights change); the visual critic signs off zone by zone |
| Lab performance | Lighthouse mobile ×3 median: LCP and TBT within 10 % of the baseline (differences under 100 ms and 50 ms count as noise), CLS within the brief's budget (`gates.mjs --baseline design/upgrade/baseline/gates/gates.json`) |
| Accessibility | `gates.mjs --baseline …`: axe 0 new violations; focus order unchanged |
| Anchors | `gates.mjs`: every in-page link and the skip link land below the fixed header, at the same spot with motion on and reduced, and take focus |
| Conversions | every tel, WhatsApp, mailto and form submit still fires (`preserve.mjs diff` keeps the CTA hrefs and form fields; `gates.mjs` checks that each form reaches an action or a submit handler; the lead events show in the analytics debug view) |
| Adversarial review | a fresh reviewer told to fail the wave and find "the template zone" finds nothing blocking |

Rollout by host: Cloudflare Pages (MediaWave's host) has instant rollback to any earlier production deployment but no gradual rollout, so use preview URL → owner approval → 100 %. Vercel Pro has Rolling Releases (10 % → 50 % → 100 %). Cloudflare Workers support percentage deploys. On any host, motion-only waves can be bucketed client-side with a cookie the engine reads.

## 14. Measuring the result honestly

Compare 2-4 week windows before and after (same weekdays, campaign spikes excluded): leads per session, lead clicks per zone, zone reach, quick-back rate, p75 LCP/INP/CLS from real users (install `web-vitals` reporting in W0 so a "before" exists). Detecting a lead-rate change from 3.0 % to 3.6 % at 80 % power takes about 13,900 visitors per arm, which most small Israeli business sites never reach: read the numbers as directional and decide on guardrails. Roll back when a guardrail breaks (a Core Web Vital crosses into "needs improvement", rage or dead clicks rise by half, any lead event stops firing, the owner reports a broken flow); keep when guardrails hold and reach past the treated zone holds or improves; iterate when guardrails hold but the treated zone's reach drops (the moment is slowing people down).
