# Pre-Deploy Performance Checklist

Use this checklist before deploying any website to production.

## Table of Contents

1. [Critical (Must Pass)](#critical-must-pass)
2. [High Priority](#high-priority)
3. [Medium Priority](#medium-priority)
4. [Verification Commands](#verification-commands)
5. [Quick Fixes Reference](#quick-fixes-reference)
6. [Score Targets by Site Type](#score-targets-by-site-type)

---

## Critical (Must Pass)

### Images
- [ ] All images converted to WebP/AVIF
- [ ] LCP image has `fetchpriority="high"` and `loading="eager"`
- [ ] Below-fold images have `loading="lazy"`
- [ ] All images have explicit `width` and `height` attributes
- [ ] Hero/banner images preloaded in `<head>`

### JavaScript
- [ ] Route-based code splitting implemented
- [ ] Heavy libraries lazy-loaded (Lottie, charts, maps)
- [ ] No render-blocking scripts in `<head>`
- [ ] `defer` or `async` on non-critical scripts
- [ ] Bundle analyzer checked for large dependencies

### CSS
- [ ] Critical CSS inlined or preloaded
- [ ] No unused CSS in production bundle
- [ ] `font-display: swap` on all custom fonts
- [ ] Fonts preloaded in `<head>`

### Core Web Vitals
- [ ] LCP < 2.5s (test on 3G throttled)
- [ ] CLS < 0.1 (no layout shifts)
- [ ] TBT < 200ms (main thread not blocked)
- [ ] FCP < 1.8s (something visible fast)

---

## High Priority

### Build Configuration
- [ ] Minification enabled (JS + CSS)
- [ ] Gzip/Brotli compression configured
- [ ] Tree shaking working (check bundle)
- [ ] Source maps disabled in production
- [ ] Manual chunks for large vendor libraries

### Resource Hints
- [ ] `preconnect` for third-party origins
- [ ] `dns-prefetch` for external domains
- [ ] `preload` for critical resources
- [ ] `prefetch` for likely next pages

### Animations
- [ ] Heavy animations disabled on mobile
- [ ] `will-change` used sparingly
- [ ] No animations on LCP element initial render
- [ ] `contain: layout paint` on independent sections

---

## Medium Priority

### Caching
- [ ] Static assets have long cache headers
- [ ] HTML has `no-cache` (always revalidate)
- [ ] Service worker for offline support (PWA)
- [ ] CDN configured for global delivery

### Third-Party Scripts
- [ ] Analytics loaded asynchronously
- [ ] Chat widgets lazy-loaded
- [ ] Social embeds loaded on interaction
- [ ] Tag managers evaluated for necessity

### Mobile Performance
- [ ] Tested on real mobile device
- [ ] Touch targets >= 44px
- [ ] No horizontal scroll
- [ ] Viewport meta tag correct

---

## Verification Commands

```bash
# Build and preview
npm run build && npm run preview

# Run Lighthouse CLI
npx lighthouse http://localhost:4173 \
  --output=json \
  --output-path=./lighthouse.json \
  --chrome-flags="--headless --no-sandbox" \
  --only-categories=performance \
  --quiet

# Parse score
node -e "const r=require('./lighthouse.json');console.log('Score:',Math.round(r.categories.performance.score*100))"

# Analyze bundle
npx vite-bundle-visualizer
```

---

## Quick Fixes Reference

| Issue | Quick Fix |
|-------|-----------|
| LCP slow | Preload LCP image, use WebP, add `fetchpriority="high"` |
| CLS high | Add `width`/`height` to images, reserve space for dynamic content |
| TBT high | Lazy load heavy libraries, break long tasks |
| FCP slow | Inline critical CSS, preload fonts |
| Large bundle | Code split routes, lazy load below-fold |

---

## Score Targets by Site Type

| Site Type | Realistic Target | Max Without SSR |
|-----------|------------------|-----------------|
| Landing page | 90-100 | 95 |
| React SPA | 70-85 | 85 |
| E-commerce | 60-80 | 80 |
| Dashboard | 50-70 | 75 |
| Content-heavy | 80-95 | 90 |

Note: SPA scores are limited by JavaScript-dependent rendering. SSR/SSG can add 10-20 points.
