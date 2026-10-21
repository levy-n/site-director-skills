# Foundations: session one of a greenfield site

Read this in greenfield step 4, after the concept and the scroll score are approved and before any real section is built. In Upgrade mode, read §3 and §4 for the parts that fix measured failures (fonts, engine, accessibility switch, crawler access) and keep the existing stack. Everything here exists to prevent a known repair session; each decision names the failure it prevents. Versions and measurements are from 2026-10-05 (npm registry, MDN browser-compat data 8.1.4, headless Chrome builds of the default stack).

## Contents
1. Stack: the default and when to deviate
2. Toolchain pins
3. Foundation decisions
4. Failure modes these decisions prevent
5. Scaffold
6. Session one: order of work
7. The foundation gate

---

## 1. Stack: the default and when to deviate

**Default for a motion-led brand or marketing site:** Astro 7.3 with static output (a multi-page site, no client router), Tailwind 4.3 through `@tailwindcss/vite`, the Astro Fonts API, content collections, and the skill's engine (`assets/engine/motion-engine.js`) loaded by one `<script>` in the base layout after first paint (§5). React islands (`client:visible`) only for stateful widgets such as a multi-step form or a calculator; islands never create ScrollTriggers.

Why it prevents repair sessions: nothing hydrates, so there are no hydration mismatches and no hydration task competing with the intro animation; the HTML crawlers and no-JS visitors get is the HTML that was written; a full page load resets every trigger, so there is no route-change cleanup to forget; and the motion is the whole JavaScript budget, loaded as one deferred chunk so the first frame never waits for it. Measured: the motion set (GSAP + ScrollTrigger + SplitText + Lenis + engine) is 52.2 KB gzip and the page ships no framework code. React 19.3's client runtime alone is about 79 KB gzip.

| Situation | Use | Extra rule |
|---|---|---|
| Upgrade of an existing site | keep its stack | apply §3-§4 where they fix measured failures; change the rendering setup only if routing is touched anyway |
| Something must persist across pages (a canvas, WebGL, video or audio; shared-element page transitions choreographed with GSAP) | React Router 8 framework mode with `prerender`, or Astro + `<ClientRouter />` with `transition:persist` | start the engine on `astro:page-load`, `destroy()` it on `astro:before-swap`; in React, `useScene` reverts on unmount |
| App-like features (accounts, dashboards, client-side data), or the client already runs Next.js on Vercel | Next.js 16 (`output: 'export'` unless a server feature is truly needed) | motion only in `'use client'` leaves; sections stay Server Components |
| Content managed in Payload CMS 3 (which runs inside a Next.js app) | either the site lives in that Next app (row above), or an Astro site pulls Payload's REST/GraphQL API at build time and rebuilds on a publish webhook | record the choice in DECISIONS.md; the Astro route keeps the motion budget |
| One campaign page, no CMS, no shared chrome | Astro anyway (one toolchain), or a single Vite page | - |

The reference site runs on React + Vite with SSR. Its motion would behave the same on the default stack; its stack is not part of the method.

## 2. Toolchain pins

| Item | Pin | Why |
|---|---|---|
| Node | 24 LTS, in `.node-version` and `"engines"` | Node 22.14 (Nati's machine today) is below React Router 8 (≥ 22.22), Lighthouse 13.5 (≥ 22.19) and an Astro 7 dependency (≥ 22.19) |
| TypeScript | `~6.0.3` | `typescript@latest` is 7.0.2, outside the peer ranges of `@astrojs/check` and `typescript-eslint`; `astro check` is clean on 6.0.3 |
| astro | `~7.3.5` | Vite 8 underneath; the Rust `.astro` compiler no longer silently corrects invalid HTML, so markup must be valid |
| tailwindcss, @tailwindcss/vite | `~4.3.3` | - |
| gsap | `3.15.0` | every plugin is in the public package and free for commercial use; no private registry or tokens |
| lenis | `~1.3.26` | Lenis 2 is in pre-release (`dev` tag); don't drift onto it |
| @gsap/react | `2.1.2` | only with React |
| motion | `~14.1.0` | the one place this skill pins Motion. `npm view motion dist-tags` on 2026-10-12: latest 14.1.0 (2026-10-09). 14.0.0's only change removed internal APIs kept for `framer-motion` 13.0-13.4, and 14.1 adds fixes on top. `motion` 14.1.0 pins `framer-motion` 14.1.0, so a site that also imports `framer-motion` directly moves those imports to `motion/react` (one copy). Re-run `npm view motion dist-tags` before pinning |
| @playwright/test · @axe-core/playwright | 1.63 · 4.13 | WCAG 2.2 rule set |
| lighthouse | 13.5 CLI | `@lhci/cli` 0.15 still bundles Lighthouse 12.6. Lighthouse 13.5 needs Node ≥ 22.19; on older Node (an upgrade on Nati's machine) use `lighthouse@12.8` (Node ≥ 18.16) and compare only runs from the same version |

## 3. Foundation decisions

### 3.1 Structure
| Decision | Prevents |
|---|---|
| Four layers: `src/content/` (what is said), `src/sections/` (markup at rest), `src/motion/scenes/` (one module per section, keyed by `data-scene`), `src/styles/tokens.css` (how it looks) | copy edits breaking animations; motion code scattered through markup; agents restyling by hand |
| One engine owns Lenis, ScrollTrigger config, the fonts gate, reduced motion, refresh, teardown and the `?at=` QA jump; scenes never create a Lenis or call `ScrollTrigger.refresh()` | two smooth scrollers; refresh storms; triggers created out of order |
| Markup is written at its rest state: final positions, real text, real numbers. Motion adds offsets at runtime, after `html.motion-ready` | invisible content for crawlers, no-JS visitors and failed scripts; prerender snapshots caught mid-animation |
| Scenes are created in DOM order; each scene's main trigger gets `id: '<sceneId>'` | wrong start and end positions below a held scene; QA jumps that drift between builds |

### 3.2 Tokens (Tailwind 4.3, OKLCH)
```css
/* src/styles/tokens.css - values come from CONCEPT.md, never from this example */
@import "tailwindcss";
@theme {
  --color-*: initial;                      /* removes the default palette: no bg-blue-500 reflex */
  --color-ground: oklch(/* concept */);  --color-ink: oklch(/* concept */);
  --color-accent: oklch(/* concept */);  --color-accent-ink: oklch(/* accent text that passes 4.5:1 on ground */);
  --font-display: "Brand Display", "Brand Display Fallback", sans-serif;
}
@theme inline { --font-body: var(--font-body-face); }   /* the Astro Fonts API exposes the hashed family as a variable */
@theme static { --ease-brand: cubic-bezier(/* concept */); } /* emitted even when unused, because JavaScript reads it */
:root { --surface: var(--color-ground); --text: var(--color-ink);
  --z-sticky: 20; --z-header: 30; --z-fab: 40; --z-overlay: 50; --z-modal: 60; --z-consent: 70; --z-toast: 80; }
[data-theme="dark"] { --surface: var(--color-ink); --text: var(--color-ground); }
```
| Decision | Prevents |
|---|---|
| Default palette removed; only concept-derived colours exist | agents reaching for stock Tailwind colours |
| A semantic layer (`--surface`, `--text`, `--accent-ink`) rebound per `[data-theme]`; a theme change crossfades only in the fixed theme layers (opacity, move T-01) and the tokens switch instantly, never through a transition on `--surface`, `--text` or `color` | per-section colour hacks; a whole-document restyle on every frame of a colour transition (measured in moves-recipes.md T-01) |
| `@theme static` (or plain `:root`) for any token JavaScript reads | GSAP reading an empty string because Tailwind emitted only the variables in use |
| The accent has its own text token, checked to 4.5:1 | a light accent used as text on a light ground (MediaWave's sky on white measured 1.6:1) |
| One z-index scale; every floating widget (accessibility tab, WhatsApp, chat, consent) sits in one corner stack | measured MediaWave defects: the accessibility tab over the menu button, the consent banner over the chat input |
| Motion values (durations, distances, eases, the early trigger offset) live in `src/motion/tokens.ts` | 31 hand-written triggers with different margins (measured on MediaWave) |

### 3.3 Type pipeline
| Decision | Prevents |
|---|---|
| Self-hosted `woff2` only (Fontsource or licensed files); no Google Fonts CSS | the Google Fonts `media="print"` swap trick held first paint about 1 s (measured) |
| Subsets per script: Hebrew `U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F` plus a Latin file (Heebo variable, Hebrew subset = 12 KB). Licensed fonts: `pyftsubset Font.ttf --unicodes="<Hebrew range>" --layout-features='*' --flavor=woff2 --output-file=font-he.woff2` (keep all layout features so niqqud marks stay positioned) | shipping unused scripts; broken niqqud after subsetting |
| At most 2 families and 4 files; preload only the Hebrew file of the faces visible above the fold | preloads competing with the LCP image |
| Body face `font-display: optional`; display face `swap` with a measured fallback | late body swaps reflowing whole paragraphs |
| **Fallbacks measured on Hebrew text** with `node <skill>/scripts/font-fallback.mjs <files> --family "<Name>"`. It emits a fallback face per script (`unicode-range`) and proves the swap doesn't rewrap. Generators average Latin widths: Astro 7.3's generated Heebo fallback was 22.7 % too wide on Hebrew; the measured one is within 1 %. A variable display face set at a non-default instance (a condensed width, a light weight) needs its own fallback, measured at that instance with `--axes "wdth=60,wght=300"` and used only on elements set at it (measured: size-adjust 47 % at wdth 60 against about 98 % at the default instance). Where the script can't reach the instance, cut a static one and measure that file: `python -m fontTools.varLib.instancer font.ttf wdth=60 wght=300 -o font-hero.ttf` | lines rewrapping when the font arrives, i.e. layout shift, even with "optimized fallbacks" |
| A unitless `line-height` on every text style | vertical shifts at swap: Heebo's `normal` line box is 1.45 em against Arial's 1.10 em, and iOS ignores `ascent-override` |
| SplitText only after fonts load, with `autoSplit` and the animation returned from `onSplit` (the engine's `splitLines`) | split lines measured on fallback metrics |
| Font licence and source recorded in DECISIONS.md | self-hosting a commercial Hebrew font beyond its licence (terms vary by foundry) |

Astro wiring (built and measured with Astro 7.3.5):
```js
// astro.config.mjs
fonts: [{ provider: fontProviders.fontsource(), name: "Heebo", cssVariable: "--font-body-face",
          weights: ["100 900"], subsets: ["hebrew", "latin"],
          fallbacks: ["Heebo Fallback", "sans-serif"], optimizedFallbacks: false }]
// base.css: paste the @font-face rules font-fallback.mjs prints ("Heebo Fallback")
// Base.astro <head>: <Font cssVariable="--font-body-face" preload />  (it preloads both subsets; on a
// Hebrew page write the Hebrew preload <link> by hand if the Latin file isn't needed above the fold)
```

### 3.4 Images, video, sequences
| Asset | Decision |
|---|---|
| Content images | `<Picture formats={['avif','webp']} widths={[480,800,1200,1600]} sizes="…">` with intrinsic width and height; lazy below the fold |
| LCP image or heading | in the HTML, eager, `fetchpriority="high"` (images ≤ 150 KB at phone width), painted at first frame: never revealed from `opacity: 0`, `visibility: hidden`, a clip-path or a mask. Measured: each of those moved LCP to the reveal moment (1.5 s in the test); a CSS keyframe reveal made Chrome report a tiny earlier element as LCP instead, which looks good and measures the wrong thing |
| Ambient loop | `ffmpeg -i in.mov -vf "scale=1280:-2,fps=30" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart -an loop.mp4`; `muted playsinline loop preload="none"` with a poster; mounted when idle or in view; paused offscreen and under reduced motion; a pause control when it runs over 5 s |
| Scrubbed video (desktop only) | all-intra: `-g 1 -keyint_min 1 -sc_threshold 0 -bf 0` (120 of 120 frames became keyframes; about 2× the size); ≤ 1080p, ≤ 10 s, no audio |
| Image sequence (all devices) | `ffmpeg -i in.mov -vf "fps=24,scale=1280:-2" -q:v 4 hi/%03d.jpg`; tiers `lo` 640 w (loads first everywhere), `pt` 540×960 portrait for phones, `hi` 1280 w on desktop after `lo`; ≤ 168 frames and 13-18 px of scroll per frame; phone tier ≤ 4 MB per scene; fetch two viewports ahead; draw to a canvas from a bounded decode window (a decoded 1280×720 frame is 3.7 MB) |
| Lottie | only below about 100 shape paths, with the canvas renderer through `lottie-web` directly (measured: a 356-path file cost 25-54 s of blocking time on the SVG renderer); the dotLottie WebAssembly player (487 KB gzip) never on a phone's critical path |

### 3.5 Content model
| Decision | Prevents |
|---|---|
| Content collections with Zod schemas (`services`, `faq`, `testimonials`, `projects`); `src/data/site.ts` holds business name, address, phone, WhatsApp, hours and socials once | copy hard-coded in components; three different phone numbers |
| Testimonials require `source` and `consent` fields; an empty collection hides the section | invented reviews (also a legal exposure) |
| Every number a counter animates exists as final text in the HTML | crawlers and screenshots reading "0" |
| Sections take typed props; a CMS loader later replaces the file loader without touching sections | CMS migrations that rewrite sections |

### 3.6 Search engines and AI crawlers
| Item | Decision |
|---|---|
| Document | `<html lang="he" dir="rtl">`, one `h1`, ordered headings, `og:locale` `he_IL` |
| Per page | unique title and description, absolute self-canonical (one trailing-slash policy), 1200×630 OG image with alt text |
| Structured data | `LocalBusiness` or `ProfessionalService`, `WebSite`, `BreadcrumbList`, and `FAQPage` where an FAQ exists, typed with `schema-dts`, fed from `site.ts` |
| Files | sitemap (without 404 and thank-you pages), `robots.txt` with a `Sitemap:` line |
| AI crawlers | they don't run JavaScript (Vercel/MERJ study, 2024), so every word lives in the HTML at rest. Allow the crawlers the client wants (`OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, `ClaudeBot`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`). On Cloudflare, check the AI-bot settings on day one: MediaWave's zone answered 403 to every AI crawler in July 2026 |

### 3.7 Accessibility (WCAG 2.2 AA; Israeli standard IS 5568)
| Decision | Why |
|---|---|
| Every scene has a reduced branch: no Lenis, scrubbed scenes become static compositions, sequences show the poster, loops stop | the visitor's setting; headless capture also defaults to reduced motion |
| An on-page "stop animations" switch (Israeli visitors expect an accessibility menu): it sets `html[data-motion="off"]`, calls `engine.destroy()` and boots a new engine, which then runs reduced (`stopAnimations()` in §5; React: `useStopAnimations()`, motion-engine.md §11). Settings never persist across visits | WCAG 2.2.2; the MediaWave stuck-state incident |
| Anything that moves on its own for more than 5 s has a visible pause control | 2.2.2 (Level A) |
| Focus ring token; `html { scroll-padding-top: <header height + gap> }` is the only header offset, for anchors (with and without Lenis) and for focus scrolling; the engine's `anchorOffset` stays 0, and its anchor handler moves focus to the target; sticky UI and consent never cover the focused element | 2.4.7, 2.4.11; Lenis 1.3 already subtracts scroll-padding, so adding `anchorOffset` stacks a second offset (measured: anchors landed 153 px down with motion, 80 px reduced) |
| Skip link first in the DOM, landmarks, targets ≥ 24 px (44 preferred) | 2.4.1, 2.5.8 |
| Drag interactions (before/after sliders, physics toys) have a click or keyboard alternative | 2.5.7 |
| Focus landing inside a held horizontal track scrolls the page to the matching progress (`focusin` handler) | keyboard users landing off-screen |
| Stage content fits `100svh` at 390×664 and at 200 % zoom; reduced motion collapses holds into normal flow | 1.4.4, 1.4.10 |
| Hebrew accessibility statement page (standard, date, what was checked, known exceptions, contact) | Israeli regulation; build to WCAG 2.2 AA, which covers IS 5568's WCAG basis. The statement's exact required contents are not verified here: reuse a legal module the business already trusts |

### 3.8 Performance budgets
These are the brief's budgets (the BRIEF template's success criteria carry the same numbers). Field, from real users at p75: LCP ≤ 2.5 s, INP ≤ 200 ms. Lab (mobile, 4× CPU, gzip server):

| Budget | Value |
|---|---|
| JavaScript | ≤ 110 KB gzip in total on the default stack: the rest ≤ 56 KB before first paint, the motion set (≈ 54) as a chunk loaded after it; ≤ 200 KB on React stacks |
| Preloaded fonts | ≤ 2 files, ≤ 60 KB |
| LCP / blocking time (lab) | ≤ 2.0 s / ≤ 200 ms; measure the no-JS floor first |
| CLS through a full scroll (motion-audit) | ≤ 0.05, and 0 for the foundation skeleton; motion-audit's built-in 0.1 is only a smoke floor, so pass `--budget-cls 0.05`. Any GSAP default pin fails this (measured 1.0-3.9) |
| Per section | one signature move; holds per scroll-score.md §2-§3, all sticky stages |

Heavy motion costs where it touches input: INP doesn't measure scrolling, but a tap during a scroll-linked long task waits for it. Character splits multiply DOM nodes, so keep them to display lines; animate transform, opacity and clip-path; no large blur scrubs; `will-change` only while a scene is active.

### 3.9 Consent and analytics (Israel, Privacy Protection Law Amendment 13, in force since 2025-08-14)
| Decision | Basis (interpretation, not legal advice) |
|---|---|
| Default analytics: first-party, cookieless, aggregate (an own `/api/event` endpoint, or Cloudflare Web Analytics) | avoids tracking that needs consent; whether a banner is still needed is a question for a lawyer before promising "no banner" |
| Any ad pixel or GA4: an opt-in banner with an equal-weight "reject", nothing pre-ticked, scripts loaded only after consent, Google Consent Mode v2 | the Privacy Protection Authority's consent opinion of 2026-02-25: consent must be informed and free; dark patterns invalidate it |
| The banner is an overlay on the consent layer: it never pushes layout, never covers the chat or the main call to action, manages focus, and gets `data-lenis-prevent` if it scrolls | layout shift; measured MediaWave defects |

### 3.10 Forms and errors
| Decision | Prevents |
|---|---|
| Native `<form>` with labels, `autocomplete` (`name`, `tel`, `email`), `inputmode="tel"`, `dir="ltr"` on phone and email, errors through `aria-invalid` and `aria-describedby`, focus moved to the success message | inaccessible validation |
| An endpoint (a Worker or Pages Function with Turnstile and a honeypot); until one exists, an honest WhatsApp hand-off, never a fake success | lost leads |
| A collection notice beside submit; a separate, unticked marketing-consent checkbox (Communications Law §30A) | privacy and spam-law exposure |
| No held scenes or scrubs around form fields | the on-screen keyboard resizing the viewport and jumping the page |
| A real 404 status (`src/pages/404.astro`; on Workers `assets.not_found_handling: "404-page"`), `noindex` | soft 404s |

### 3.11 Testing and agent docs
| Layer | Decision |
|---|---|
| Smoke (Playwright) | every route 200, no console errors, no horizontal overflow at 320/390/768/1440, no text stuck invisible after a full scroll, `html.motion-ready` present on desktop and mobile and `motion-reduced` under reduced motion |
| Visual regression | screenshots of deterministic states only: the reduced-motion page and `?at=<sceneId>:<progress>` jumps; never mid-tween |
| Motion | `motion-audit.mjs` (scroll CLS, stuck content, reduced-motion parity, idle motion, monotone zones, peaks) and `scroll-film.mjs`; puppeteer captures always use `captureBeyondViewport: false` |
| Slop | `slop-scan.mjs <src>` and `--url` on the preview |
| Accessibility | axe after a settle long enough for the consent banner to finish fading. Before the harness exists, the skill's `gates.mjs` runs axe, anchor landing, overflow at four widths, the no-JS census and form checks against any URL |
| CI | install → `astro check` → lint → build → preview → smoke, axe, motion-audit, slop-scan → preview deploy per branch; production deploys only from `main`, with the client's own Git account. motion-audit exits 1 when a non-timing check fails, so it can turn CI red; leave `--strict` (frame timing) out on shared runners |
| Agent docs | `AGENTS.md` canonical (commands, non-negotiables: markup at rest, scenes in DOM order, no `pin` without an audit, tokens only, Hebrew rules), linking to `design/CONCEPT.md` and `design/SCROLL-SCORE.md` rather than copying them; `CLAUDE.md` = `@AGENTS.md` plus Claude-only notes; `PRODUCT.md`; `DECISIONS.md` (numbered, append-only: the durable decision log, which `design/LEDGER.md` points to); `.context/HANDOFF.md`. `DESIGN.md` is written at handoff |

## 4. Failure modes these decisions prevent

Evidence: **M** measured on Nati's projects or in this research, **D** official documentation, **E** field reports not yet filmed.

| # | Symptom | Prevention | Ev |
|---|---|---|---|
| 1 | Hebrew paragraphs rewrap when the web font arrives | Hebrew-measured fallback (`font-fallback.mjs`), body `optional`, unitless line-heights | M |
| 2 | Split lines break mid-word after load | split after fonts; `autoSplit` + return the tween from `onSplit` | D |
| 3 | LCP is late although the hero "appears fast" | the LCP element is painted at first frame; its intro is transform-only or applied to other layers | M |
| 4 | Blank sections for crawlers, no-JS visitors or a failed chunk | no CSS pre-hiding; hidden states only under `.motion-ready`; smoke test for hidden text | M |
| 5 | A prerendered page flashes and LCP moves past 4 s | real static rendering (Astro) or `hydrateRoot`; never `createRoot` over prerendered HTML | M |
| 6 | Production HTML shows the reduced-motion version | rest-state markup is identical in both branches; headless prerender sets motion explicitly or uses `__PRERENDER__`, and scenes write no inline styles while prerendering (motion-engine.md §10) | M |
| 7 | Hydration warnings, doubled nodes (React) | client-only values only in effects; motion never changes markup during render | D |
| 8 | Footer jumps on route load (CLS 0.50) | no lazy routes for content pages; any fallback at least `120vh` tall | M |
| 9 | First paint held about 1 s | self-hosted fonts, no Google Fonts CSS | M |
| 10 | LCP image arrives last | eager, `fetchpriority="high"`, sized, in the HTML | D |
| 11 | "Blocks jump while I scroll" on phones | one early trigger (about 600 px ahead); routine entrances ≤ 0.35 s and ≤ 18 px (the engine's `reveal()`); anything bigger is scrubbed (mid-entrance scroll steps went from 18/21 to 0/21) | M |
| 12 | CLS 1.0-3.9 while scrolling | sticky stages instead of GSAP default pins | M |
| 13 | Animations below a held scene start early or late | scenes in DOM order; no ScrollTriggers inside islands; one refresh after boot | D |
| 14 | Positions drift after images load or an accordion opens | sized media; refresh after fonts and after layout-changing interactions | D/M |
| 15 | The page jumps when the phone's address bar hides | `ignoreMobileResize`; `svh` stages; refresh only after the finger lifts | D/M |
| 16 | Micro-jitter in scrubbed scenes | Lenis on the GSAP ticker, `lagSmoothing(0)` | D |
| 17 | A modal, chat or menu won't scroll | `data-lenis-prevent`; `lenis.stop()` while a dialog is open | D |
| 18 | Skip link and anchors do nothing, land under the header, or land lower with motion than without | `html { scroll-padding-top }` as the only offset (Lenis and native scrolling both honour it); the engine's anchor handler with `anchorOffset` left at 0; `gates.mjs` compares landing with motion on and reduced | D/M |
| 19 | Dead triggers or doubled splits after navigation | multi-page default; otherwise `destroy()` on swap, `useScene` in React | D |
| 20 | Split text vanishes after a React state change | split only in leaf components or in the vanilla engine | E |
| 21 | A fixed header scrolls away inside a scene | fixed UI lives outside scene containers (transformed ancestors trap `position: fixed`) | D |
| 22 | The page wiggles sideways on phones | `overflow-x: clip` per section; no `100vw`; start states inside the container; overflow check at 320 px | M |
| 23 | A sticky stage doesn't stick | `overflow: clip` instead of `hidden` on ancestors | M |
| 24 | Elements hide behind each other | the z-index token scale; `isolation: isolate` per section | M |
| 25 | Consent covers the chat; the accessibility tab covers the menu | one corner stack with consent and dialogs above floating buttons; tap test at 390 px | M |
| 26 | Text clipped at 200 % zoom or 320 px | `svh` stages whose content fits; reduced motion collapses holds | D |
| 27 | Blocking time in tens of seconds where an illustration plays | canvas-renderer Lottie under ~100 paths, paused offscreen, or video | M |
| 28 | A heavy library loads on every page | keep a wrapper and its sub-dependencies in the same manual chunk; check `dist` sizes after each heavy dependency | M |
| 29 | Hero video is a still on iPhones | the poster is a designed fallback; catch the `play()` rejection; the story never depends on autoplay | E |
| 30 | Scrubbed video stutters | all-intra encode; desktop only; sequences on phones | M |
| 31 | A sequence janks or crashes the tab on phones | tiers, a bounded decode window, canvas, the proxy tier first | M |
| 32 | Search or AI answers show "0+ clients" | final numbers in the HTML; SplitText `aria: 'auto'` | D |
| 33 | The site is absent from AI answers | day-one check of the edge's AI-bot settings and robots; curl with crawler user agents | M |
| 34 | Keyboard users get lost; motion can't be stopped | `focusin` handler for tracks; pause controls; the stop-animations switch; never persist | M/D |
| 35 | Audits report fiction; the toolchain fails on day one | `captureBeyondViewport: false`, motion explicitly on, scroll-primed captures; TypeScript 6.0.x; Node 24 | M |
| 36 | Motion silently missing on desktop only | with `gsap.matchMedia`, always include a complementary pair (`'(prefers-reduced-motion: no-preference)'` and `'(prefers-reduced-motion: reduce)'`): a conditions object where nothing matches never runs its callback; the smoke test asserts `html.motion-ready` | M |

## 5. Scaffold

| Path | Responsibility |
|---|---|
| `.node-version`, `package.json` | Node 24; pinned versions from §2; Node scripts only (Windows-safe) |
| `astro.config.mjs` | `site`, static output, `vite.plugins: [tailwindcss()]`, sitemap, `fonts` (§3.3); `@astrojs/react` only once an island exists |
| `wrangler.jsonc` or the Vercel/Pages equivalent | static assets from `./dist`, `not_found_handling: "404-page"` |
| `public/_headers`, `robots.txt`, `og/default.jpg` | immutable caching for `/_astro/*`, fonts and `/seq/*`, security headers; crawler rules; share image |
| `public/seq/<scene>/<tier>/NNN.webp` + `manifest.json` | generated frames, never hand-edited |
| `src/data/site.ts`, `src/content.config.ts`, `src/content/**` | business facts once; collections; all copy as data |
| `src/layouts/Base.astro` | `lang`/`dir`, SEO and JSON-LD components, font preload, skip link, header, `<main id="main">`, footer, the one `<script>` that loads the engine after first paint |
| `src/components/chrome/*` | Header, Footer, SkipLink, A11yMenu (stop animations, never persists), Consent (only with trackers), CornerStack (every floating widget's position) |
| `src/sections/<Name>.astro` | one per section, markup at rest, root carries `data-scene` and `data-theme` |
| `src/islands/*.tsx` | stateful widgets only, `client:visible`, no ScrollTriggers |
| `src/pages/` | `index`, `404`, accessibility statement, privacy, thank-you |
| `src/motion/motion-engine.js`, `motion-engine.d.ts` | both copied from the skill's `assets/engine/`. The `.d.ts` gives TypeScript the engine's types; leave the `.js` itself unchecked (no `// @ts-check`: under `strict` it reports dozens of implicit-any errors and fails `astro check`) |
| `src/motion/boot.ts`, `tokens.ts`, `scenes/<id>.ts` | boot below; motion tokens; one scene per section with its reduced branch |
| `src/styles/tokens.css`, `base.css`, `motion.css` | §3.2; type scale with unitless line-heights, RTL defaults, focus ring; stage CSS, reduced-motion overrides |
| `scripts/` | `frames.mjs` and `video.mjs` (the §3.4 commands). Run the skill's QA scripts from the skill folder (`node <skill>/scripts/…`); copy them into the project only for CI, and then copy `slop-scan.mjs` together with `slop-rules.mjs` and `slop-dom.mjs`, which it imports |
| `tests/`, `.github/workflows/ci.yml` | §3.11 |
| `AGENTS.md`, `CLAUDE.md`, `PRODUCT.md`, `DECISIONS.md`, `.context/HANDOFF.md` | §3.11; the design files stay in `design/` (SKILL.md lists them), and `DESIGN.md` is added at handoff |

Boot (the only place scenes are started):
```ts
// src/motion/boot.ts: its own chunk, imported after first paint (Base.astro below)
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { createMotionEngine, themeLayers } from './motion-engine.js';   // types from motion-engine.d.ts
import { scenes } from './scenes';

export type Engine = ReturnType<typeof createMotionEngine>;
// A scene may return a cleanup that undoes its listeners, ticker callbacks and DOM edits
// (moves-recipes.md): destroy() runs it, so "stop animations" leaves nothing running.
export type Scene = (el: HTMLElement, engine: Engine) => void | (() => void);   // scenes: Record<string, Scene>

let engine: Engine | null = null;

export function boot(): Engine {
  engine?.destroy();
  // No anchorOffset: html { scroll-padding-top } is the only header offset (§3.7)
  const e = createMotionEngine({ gsap, ScrollTrigger, SplitText, Lenis });
  engine = e;
  for (const el of document.querySelectorAll<HTMLElement>('[data-scene]')) {   // DOM order = creation order
    const run = scenes[el.dataset.scene ?? ''];
    if (run) e.scene(() => run(el, e), el);
  }
  e.scene(() => { themeLayers(e); });        // inside a scene, so destroy() removes its trigger
  return e;
}

// The accessibility menu's "stop animations" (it imports this module the same way Base.astro does):
export function stopAnimations(): Engine {
  document.documentElement.dataset.motion = 'off';  // not persisted: the next visit starts fresh
  return boot();                                     // rebuilds every scene in its reduced form
}
```
```astro
<!-- Base.astro: the motion set loads after first paint, so the hero's first frame never depends on it -->
<script>
  const start = () => import('../motion/boot').then((m) => m.boot());
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 200));
  if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
</script>
```
The accessibility menu calls `import('../motion/boot').then((m) => m.stopAnimations())`; if the switch is used before the idle boot, the later `boot()` still runs reduced, because `data-motion="off"` stays on `<html>` for the page view.

## 6. Session one: order of work

Each step has a check that passes before the next one starts. The skill's scripts run as `node <skill>/scripts/<name>.mjs` against the build served by `serve.mjs` (`<url>` below); verification.md §2 lists their options.

| Step | Work | Check | Checked by |
|---|---|---|---|
| 0 | Environment: Node 24, ffmpeg, Playwright browsers; versions into DECISIONS.md | each tool answers with the pinned version | `node -v`; `ffmpeg -version`; `npx playwright --version` |
| 1 | Scaffold Astro + pinned dependencies; Tailwind through the Vite plugin; TypeScript 6.0.x | build and type check clean | `npm run build`; `npx astro check` |
| 2 | Agent docs (AGENTS.md ≤ ~150 lines, CLAUDE.md, PRODUCT.md, DECISIONS.md) | files exist | - |
| 3 | Tokens and base CSS from the approved concept | every text/surface pair ≥ 4.5:1 (3:1 for large text), in every theme | `gates.mjs` (axe colour-contrast) on the skeleton page, once per theme |
| 4 | Fonts: subsets, preload, display policy, fallbacks | the proof line says "no rewrap"; a 1.5 s delayed-font load shows CLS 0 | `font-fallback.mjs`; a Playwright test that delays the font request 1.5 s (`page.route`) and reads CLS |
| 5 | Content and SEO skeleton: collections with real copy (or clearly marked placeholders), `site.ts`, Base layout, SEO and JSON-LD, sitemap, robots, 404, accessibility statement, privacy | JS-disabled load shows all copy; an unknown path returns 404 | `gates.mjs` (no-JS census); `curl -s -o /dev/null -w "%{http_code}" <url>/no-such-page` |
| 6 | Engine + one trivial scene + one empty sticky stage | scroll CLS 0, nothing stuck hidden, reduced-motion parity, no idle motion under reduce; `?at=<id>:0.5` lands mid-stage | `motion-audit.mjs <url> --budget-cls 0` (desktop and mobile); `scroll-film.mjs <url> --at <id>:0.5` |
| 7 | Media scripts on a sample clip | keyframes = frames for scrub encodes; tier sizes inside §3.4 | `ffprobe`; file sizes |
| 8 | Chrome: header, footer, skip link, accessibility menu, corner stack, consent (only with trackers) | axe 0 at 390 and 1440; skip link and anchors land below the header with motion on and reduced; every floating control tappable at 390; keyboard pass with Lenis on | `gates.mjs` (axe, anchors); tapping and the keyboard pass by hand |
| 9 | Harness: Playwright, slop-scan baseline, Lighthouse on a gzip server, CI; with a deploy target, the preview deploy and a crawler check on the real domain | CI green (on the preview when one exists); crawler user agents get 200 | the CI run; `curl -I -A "GPTBot" <domain>` per crawler |

Session one deliberately builds no real section, no held scenes beyond the empty test stage, no Lottie, no tracking vendors and no motion library beyond the engine set.

## 7. The foundation gate

Every local row passes before the first real section is built. With no deploy target (a local or eval run), record the deploy rows as N/A in the LEDGER instead of waiting for them.

| Gate | Pass | Scope | Checked by |
|---|---|---|---|
| Toolchain | Node 24, TypeScript 6.0.x, Astro 7.3.x, lockfile committed | local | `node -v`; `npx tsc -v`; `npx astro --version`; `git ls-files` |
| Static truth | every word and number in the HTML; nothing hidden with JavaScript off | local | `gates.mjs` (no-JS census: hidden blocks, raw vs rendered words) |
| Type | Hebrew-measured fallback in place; unitless line-heights; CLS 0 on a delayed font swap | local | `font-fallback.mjs` proof line; the delayed-font test (§6 step 4) |
| Tokens | default palette removed; every text pair passes contrast; z-scale in use | local | `slop-scan.mjs src` (stock palette and scaffold defaults); `gates.mjs` (axe colour-contrast per theme) |
| Engine | one Lenis on the ticker; fonts gate; reduced branch; `?at=` works; scroll CLS 0; nothing stuck hidden | local | `motion-audit.mjs --budget-cls 0`; `scroll-film.mjs --at <id>:0.5` |
| Accessibility | axe 0; skip link and anchors land below the header with Lenis and under reduced motion; the stop-animations switch works and doesn't persist; sticky UI never hides focus | local | `gates.mjs` (axe, anchors); the switch and focus by hand |
| Layout | 0 px horizontal overflow at 320, 390, 768 and 1440 | local | `gates.mjs` (motion-audit also checks 390 and 1440) |
| Search | lang/dir, title, description, canonical, OG, JSON-LD, sitemap, robots, real 404 | local | `preserve.mjs snapshot` (lang/dir, title, description, canonical, JSON-LD types); `curl` for `sitemap.xml`, `robots.txt` and the 404 status; OG tags read from the head |
| Performance | no-JS floor measured; skeleton LCP ≤ 2.0 s, blocking time ≤ 200 ms, JS ≤ 110 KB gzip with the motion set loaded after first paint (lab, mobile) | local | `npx lighthouse` (§2 pin) ×3 against `serve.mjs`, median; chunk sizes in `dist` |
| Deploy | preview deploys from CI; AI crawlers not blocked; production path written down (account, branch, rollback) | deploy | the CI run; `curl -I -A` with each crawler's user agent on the real domain |
| Continuity | DECISIONS.md and `.context/HANDOFF.md` updated | local | - |

After the gate, every section runs the loop concept → scene → film → audit, and every new held scene or sequence re-runs motion-audit.
