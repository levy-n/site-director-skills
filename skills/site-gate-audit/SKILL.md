---
name: site-gate-audit
description: Runs the MediaWave 10-gate production audit on a prerendered React/Vite site (or any client site) — no-JS content, AI-crawler access, Lighthouse mobile on every route, axe/WCAG AA, structured data, RTL, regressions, crawl health, conversion tracking — with the measured pitfalls and fixes from the mediawave.co.il July-2026 upgrade baked in. Use before shipping any client site or when a site "feels done" and needs verification against real gates. Triggers - "site audit", "gate check", "בדיקת שערים", "לפני מסירה ללקוח", "audit the site before launch", "run the gates".
---

# Site Gate Audit — the 10 gates, with the traps that actually bit

Measure, don't assume. Every gate below was red on a "finished" production site
that looked fine in the browser. Baseline first, fix second, re-measure on a
**preview deployment** (localhost lies: no CDN compression, no real TTFB, and
headless Chrome defaults to `prefers-reduced-motion: reduce`).

## The gates

| # | Gate | How to measure | Trap that actually happened |
|---|------|----------------|------------------------------|
| G1 | Content without JS | `curl` every route; check H1, body text, FAQ **answers**, contact, JSON-LD in raw HTML | Accordion answers conditionally mounted → questions in HTML, answers only in JSON-LD. Fix: always-mount + collapse via height. |
| G2 | AI crawlers can read | curl with real UAs of GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot + robots.txt | **Cloudflare zone setting blocked all six with 403 at the edge** and injected `Disallow` into robots.txt — invisible from the repo. Test the CUSTOM DOMAIN; pages.dev previews bypass zone rules. Owner must flip AI Crawl Control. |
| G3 | Lighthouse mobile ≥95/100/95/100 | LH CLI, 3 runs/route, median, vs preview/production | See "Prerendered SPA physics" below — the whole section exists because of this gate. |
| G4 | Lab CWV: LCP≤2.0s CLS≤0.05 TBT≤150ms | same runs | Suspense page-fallback shorter than viewport → footer mid-screen → CLS exactly 0.50. Fallback must be ≥120vh. |
| G5 | axe zero critical/serious + keyboard + SR | axe-core (wcag2a/aa/21a/21aa tags) on every route + manual Tab pass | One color-only in-text link fired on ALL 22 pages; footer h4 after h1; widget dialogs without Tab traps or focus-return; a11y-widget toggle that didn't actually stop the background videos (WCAG 2.2.2). |
| G6 | Valid JSON-LD | extract + parse every ld+json block; validator.schema.org | Blocks injected at runtime by React ARE captured by prerender — check the raw HTML, not the source. BreadcrumbList usually missing on legal/service pages. |
| G7 | RTL correctness | inspection + screenshots | `dir="ltr"` islands for phones/emails/Latin ≈ `<bdi>`; typewriter/marquee duplicates need aria-hidden + a static sr-only sentence. |
| G8 | No regressions | tsc + lint + build + 390px/1440px before/after screenshots you LOOK at | `eslint .` failing on non-site files (agent templates) — scope ignores. Bundle-size diff vs baseline. |
| G9 | Nothing broken | full crawl: console errors, links, sitemap, canonicals, 404 status | **Duplicate canonicals**: hardcoded template canonical + helmet's per-route one → every inner page canonicalized to homepage. Soft-404: `/* /index.html 200` catch-all serves 200 for garbage URLs — prerender a 404.html and narrow the catch-all. CF Pages: `/x/*` splat does NOT match bare `/x`. |
| G10 | Conversion tracking | code review: every WhatsApp/tel/mailto/form path fires a distinct event | Zero analytics is the norm, not the exception. Minimal honest fix: first-party `track()` (sendBeacon, no cookies) → Pages Function; durable sink is an owner decision. |

## Prerendered SPA physics (the G3/G4 playbook)

A prerendered React SPA that re-mounts with `createRoot` will score ~70 mobile
while real users get LCP ~1s. Measured chain of causes and fixes:

1. **Paint-first mount.** The entry `<script type=module>` beats the first
   frame; createRoot tears down the prerendered DOM; Lantern chains FCP/LCP to
   the whole JS graph. Fix in the prerender step: replace the entry script with
   an inline loader that injects it **150ms after `window.load`** (plus a ~3.5s
   safety timeout). Paint-event/rAF triggers are NOT enough — the next frame
   still lands inside the JS window.
2. **Strip ALL modulepreloads** (build-emitted and runtime-injected) from
   prerendered HTML — ~100KB of JS in the pre-paint bandwidth window at 1.6Mbps.
3. **No Google-Fonts `media=print onload` trick** — it held first paint ~1s
   (measured 1434→480ms). Self-host via @fontsource. Preload above-the-fold
   fonts + `font-display: optional` = zero swap repaint.
4. **Demote the hero image** if the LCP is text (`fetchpriority=low`) — a 66KB
   poster at high priority costs ~330ms of text-critical bandwidth.
5. **Skip entrance animations when prerendered** (module-scope flag: root has
   children before createRoot). The skip branch must render the SAME markup the
   prerender captured — note headless prerendering runs with
   `prefers-reduced-motion: reduce`, so it captures the reduced-motion branch.
6. **`startTransition` around the initial render** — TBT 201→15-90ms.
7. **Idle-mount floating widgets** (chat/cookie/a11y) — `lazy()` alone still
   fetches chunks in the load window.
8. **Lottie**: count `"ty":"sh"` shape paths per JSON. Hundreds of paths on the
   SVG renderer = seconds of TBT (measured 25-54s!). Canvas renderer via
   lottie-web directly (lottie-react DROPS its renderer prop). Pin BOTH
   lottie packages in vite manualChunks or Rollup hoists the sub-dep into the
   biggest chunk (it landed in a 5MB Sanity chunk → loaded on every page).

## The static floor — measure it BEFORE promising scores

Strip ALL JavaScript from the built page and Lighthouse it. That number is the
architecture's floor; no JS optimization goes below it. On MediaWave the no-JS
floor was **LCP 2.49s** (TTFB 0.62s + ~140KB preloaded brand fonts + first-frame
render at 4× CPU) — above a 2.0s gate before React entered the picture. The gap
from floor to gate is a PRODUCT conversation (font weight budget, static-first
hero when a Lottie is the LCP element, HTML edge-caching), not an engineering
ticket. Also: if a page's LCP element is an animated Lottie/video, its LCP is
structurally chained to JS + asset fetch — no loader trick fixes that.

## Measurement rig

- Local iteration server MUST gzip (uncompressed serving inflates Lantern seconds).
- Control-run `npx lighthouse https://example.com` first — if IT is slow, your
  harness is broken, not the site.
- PSI API (`googleapis.com/pagespeedonline/v5/runPagespeed`) = keyless second
  opinion from Google infra; anonymous quota is small, use sparingly.
- pages.dev previews carry an injected `x-robots-tag: noindex` — expected;
  judge the LH SEO "is-crawlable" audit on production only.
- Fresh-eyes verification: a subagent with ONLY the gates + the URL, prompted
  to FAIL the site, finds what the builder can't see.

## Ship discipline

Preview gates green → merge → re-run the full set against production →
before/after table with real numbers. Record the previous deployment ID and the
one-line rollback before merging. Any gate red → don't merge; write the
evidence and what's needed.
