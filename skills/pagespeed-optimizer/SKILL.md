---
name: pagespeed-optimizer
description: "Optimizes PageSpeed and Core Web Vitals for React/Vite websites. Runs a systematic 6-phase optimization — quick wins (fonts/images), Framer Motion, Lottie, Vite build tuning, cleanup, and advanced (SSR) — verifying with Lighthouse after every phase. Fixes LCP, TBT, and CLS issues, cuts bundle size, and reduces Time to Interactive. Target: Lighthouse Performance 85+."
when_to_use: 'When a site scores poorly on PageSpeed Insights or Lighthouse, or feels slow to load. Triggers: "PageSpeed", "Lighthouse score", "slow website", "improve performance", "optimize Core Web Vitals", "fix LCP", "fix TBT", "reduce bundle size", "אתר איטי", "שפר ביצועים", "אופטימיזציה של ביצועים", "האתר נטען לאט".'
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
argument-hint: "[target-score or 'audit']"
---

# PageSpeed Optimizer

Systematic performance optimization for React/Vite websites.
Target: Improve Lighthouse Performance score to 85+.

## Quick Reference

| Command | What it does |
|---------|--------------|
| `/pagespeed-optimizer audit` | Run Lighthouse, identify issues |
| `/pagespeed-optimizer 85` | Optimize until score reaches 85 |
| `/pagespeed-optimizer` | Full optimization workflow |

---

## Workflow

### Step 1: Audit Current Performance

Run Lighthouse and identify the main bottlenecks (Git Bash on Windows; requires Chrome installed):

```bash
# Build first, then serve the build in the background (Vite preview default port: 4173)
npm run build
npm run preview &
sleep 5

npx lighthouse http://localhost:4173 --output=json --output-path=./lighthouse-audit.json --chrome-flags="--headless --no-sandbox" --only-categories=performance --quiet

# When done auditing, stop the preview server
kill %1
```

Parse results:

```bash
node -e "const r=require('./lighthouse-audit.json'); console.log('Score:', Math.round(r.categories.performance.score*100)); console.log('LCP:', r.audits['largest-contentful-paint'].displayValue); console.log('TBT:', r.audits['total-blocking-time'].displayValue); console.log('CLS:', r.audits['cumulative-layout-shift'].displayValue)"
```

### Step 2: Identify LCP Element

The LCP element is the most important thing to optimize:

```bash
node -e "const r=require('./lighthouse-audit.json'); console.log(JSON.stringify(r.audits['largest-contentful-paint-element'].details, null, 2))"
```

### Step 3: Apply Optimizations (6 Phases)

Follow the phases in order — details in [references/phases.md](references/phases.md). Copy this checklist and mark each phase as it completes:

```
Phase 0: Baseline audit (score + LCP/TBT/CLS recorded)      [ ]
Phase 1: Quick wins — fonts, images (+8-12 pts)             [ ]
Phase 2: Framer Motion optimization (+6-10 pts)             [ ]
Phase 3: Lottie optimization (+4-6 pts)                     [ ]
Phase 4: Vite build optimization (+5-8 pts)                 [ ]
Phase 5: Cleanup — unused deps, dead code (+2-4 pts)        [ ]
Phase 6: Advanced — SSR/prerender if target not met (+5-10) [ ]
Final:   Lighthouse x3, average >= target                   [ ]
```

### Step 4: Verify After Each Phase

Re-run the Step 1 Lighthouse command after each phase to measure impact. If a phase drops the score, revert it before continuing.

---

## Key Metrics & Targets

| Metric | Target | What it measures |
|--------|--------|------------------|
| **LCP** | < 2.5s | Largest element render time |
| **TBT** | < 200ms | Main thread blocking |
| **CLS** | < 0.1 | Visual stability |
| **FCP** | < 1.8s | First content paint |
| **SI** | < 3.4s | Speed Index |

---

## Framework Detection

Before applying optimizations, detect the tech stack:

```bash
grep -E '"(react|vue|angular|svelte|next|nuxt|vite)"' package.json
```

This skill is optimized for:
- **React + Vite** (primary)
- Next.js (SSR benefits built-in)
- Vue + Vite (similar patterns)

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| LCP > 4s | Preload LCP element, optimize image format |
| TBT > 500ms | Code splitting, defer non-critical JS |
| CLS > 0.25 | Add width/height to images, reserve space |
| Large bundle | Lazy load below-fold content |
| Render blocking | Async/defer scripts, inline critical CSS |

---

## Supporting Documentation

- [references/phases.md](references/phases.md) - Detailed 6-phase optimization guide
- [references/techniques.md](references/techniques.md) - Specific optimization techniques
- [references/checklist.md](references/checklist.md) - Pre-deploy performance checklist
- [references/limitations.md](references/limitations.md) - What can't be optimized (SPA limits)

---

## Important Notes

### SPA Performance Limits

React SPAs have inherent performance limitations:
- Nothing renders until JS loads and executes
- Typically max 75-80 score without SSR
- To reach 90+, consider Next.js or SSG

### Order Matters

Apply optimizations in this order for best results:
1. Quick wins (fonts, images)
2. Bundle optimization (code splitting)
3. Runtime optimization (lazy loading)
4. Build optimization (compression)
5. Advanced (SSR if needed)

### Always Measure

Lighthouse scores vary ±5 points between runs. Run multiple times and average.
