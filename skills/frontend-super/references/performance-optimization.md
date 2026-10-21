# Performance Optimization Reference

Performance is a design constraint, not optional polish. A beautiful site that takes 5s to load is a failure.

---

## Core Web Vitals Targets (2026)

| Metric | Good | Needs Work | Poor | What It Measures |
|--------|------|------------|------|-----------------|
| **LCP** | < 2.5s | 2.5-4.0s | > 4.0s | Largest element render time |
| **INP** | < 200ms | 200-500ms | > 500ms | Interaction responsiveness (replaced FID) |
| **CLS** | < 0.1 | 0.1-0.25 | > 0.25 | Visual stability |

### Secondary Metrics

| Metric | Target |
|--------|--------|
| FCP (First Contentful Paint) | < 1.8s |
| Speed Index | < 3.4s |
| Initial JS bundle | < 100KB |
| Total page weight | < 500KB (mobile) |

---

## 6-Phase Optimization Workflow

Apply optimizations in this order for maximum impact.

### Phase 1: Quick Wins (Fonts & Images)

**Fonts:**
```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/display.woff2" as="font" type="font/woff2" crossorigin>

<!-- Use font-display: swap -->
<style>
@font-face {
  font-family: 'Display';
  src: url('/fonts/display.woff2') format('woff2');
  font-display: swap;
}
</style>
```

- Use **variable fonts** — single file replaces 4-6 weight files
- Self-host fonts instead of Google Fonts CDN (eliminates DNS lookup)
- Subset fonts to only include needed characters

**Images:**
```html
<!-- Responsive images with modern formats -->
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero" width="1200" height="600" loading="lazy" decoding="async">
</picture>
```

- AVIF > WebP > JPEG (50-80% smaller)
- Always include `width` and `height` attributes (prevents CLS)
- `loading="lazy"` on below-fold images
- `fetchpriority="high"` on LCP image
- Generate responsive `srcset` for multiple viewport sizes

### Phase 2: Bundle Optimization

```javascript
// Route-level code splitting (React)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

// Component-level code splitting
const HeavyChart = lazy(() => import('./components/HeavyChart'));
```

- Analyze bundle: `npx vite-bundle-visualizer` or `npx @next/bundle-analyzer`
- Split vendor chunks from application code
- Tree-shake unused exports
- Remove unused dependencies from `package.json`

### Phase 3: Runtime Optimization

```tsx
// Lazy load below-fold content
const BelowFold = lazy(() => import('./BelowFold'));

function Page() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<Skeleton />}>
        <BelowFold />
      </Suspense>
    </>
  );
}
```

- Defer non-critical JavaScript with `defer` or dynamic imports
- Use `requestIdleCallback` for non-urgent work
- Virtualize long lists (react-window, @tanstack/virtual)
- Memoize expensive computations

### Phase 4: CSS-First Replacements

Replace JavaScript libraries with native CSS (see `references/css-2026.md`):

| Replace This | With This | Savings |
|---|---|---|
| Scroll animation library | CSS `animation-timeline: scroll()` | 45KB+ |
| Tooltip positioning JS | CSS anchor positioning | 200+ LOC |
| Masonry layout JS | CSS Grid Lanes (`display: grid-lanes`, feature-detect) | Library |
| Page transition JS | View Transitions API | Library |

### Phase 5: Build Optimization

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['motion'],
        },
      },
    },
    cssMinify: 'lightningcss',
    minify: 'terser',
  },
});
```

- Enable Brotli/gzip compression on server
- Use `terser` for better minification (smaller output than esbuild)
- CSS minification with Lightning CSS
- Remove source maps in production

### Phase 6: Architecture (if needed)

If LCP still > 2.5s after phases 1-5:

**Option A: Server-Side Rendering (Next.js)**
- Pre-renders HTML on server — content visible before JS loads
- Typical LCP improvement: 40-60%

**Option B: Islands Architecture (Astro)**
- Ships 0-15KB JS vs 85-250KB for typical React SPA
- Interactive "islands" hydrate independently
- Static content = zero JS overhead
- Browser-native View Transitions make MPA feel like SPA

**Option C: Static Site Generation (SSG)**
- Pre-build all pages at build time
- Fastest possible TTFB
- Best for content that doesn't change frequently

---

## SPA Performance Limits

React SPAs have inherent performance limitations:
- Nothing renders until JS loads and executes
- Typically max **75-80** Lighthouse score without SSR
- To reach 90+, need SSR (Next.js) or SSG (Astro)

---

## Performance Audit Workflow

### Run Lighthouse

```powershell
npm run build && npm run preview
# In another terminal:
npx lighthouse http://localhost:4173 --output=json --output-path=lighthouse.json --chrome-flags="--headless --no-sandbox" --only-categories=performance --quiet
```

### Read Results

```powershell
node -e "const r=require('./lighthouse.json'); console.log('Score:', Math.round(r.categories.performance.score*100), 'LCP:', r.audits['largest-contentful-paint'].displayValue, 'INP/TBT:', r.audits['total-blocking-time'].displayValue, 'CLS:', r.audits['cumulative-layout-shift'].displayValue)"
```

### Verify After Each Phase

Re-run Lighthouse after each optimization phase. Scores vary ±5 points — run multiple times and average.

---

## Third-Party Script Management

Third-party scripts are the #1 threat to Core Web Vitals.

```html
<!-- NEVER: synchronous third-party scripts -->
<script src="https://analytics.example.com/tracker.js"></script>

<!-- ALWAYS: async or defer -->
<script defer src="https://analytics.example.com/tracker.js"></script>

<!-- BEST: load after interaction -->
<script>
  document.addEventListener('click', () => {
    const s = document.createElement('script');
    s.src = 'https://analytics.example.com/tracker.js';
    document.head.appendChild(s);
  }, { once: true });
</script>
```

---

## Performance Budget

Set these limits and enforce them:

| Asset | Budget |
|-------|--------|
| Total JS (compressed) | < 100KB |
| Total CSS (compressed) | < 30KB |
| Largest image | < 200KB |
| Total page weight | < 500KB |
| Third-party scripts | < 3 |
| Web fonts | < 2 families |
| LCP element | < 100KB |

### Business Impact

Ecommerce conversion rate improves ~20% when page load drops from 3s to 1s.
