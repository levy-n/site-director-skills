# SPA Performance Limitations

Understanding the inherent limitations of Single Page Applications helps set realistic expectations.

## Table of Contents

1. [Why SPAs Can't Reach 95+ (Without SSR)](#why-spas-cant-reach-95-without-ssr)
2. [Specific Limitations](#specific-limitations)
3. [Score Ceiling by Architecture](#score-ceiling-by-architecture)
4. [When to Consider Migration](#when-to-consider-migration)
5. [Migration Options](#migration-options)
6. [What You CAN Optimize in SPA](#what-you-can-optimize-in-spa)
7. [Key Takeaways](#key-takeaways)

---

## Why SPAs Can't Reach 95+ (Without SSR)

### The Core Problem

In a client-side React SPA, **nothing renders until JavaScript loads and executes**.

```
Timeline:
1. Browser requests HTML         → 50ms
2. HTML parsed, JS requested     → 100ms
3. JS downloaded                 → 500ms (varies by bundle size)
4. JS parsed and executed        → 300ms
5. React hydrates                → 200ms
6. First meaningful paint        → 1150ms total
```

### LCP is Blocked by JavaScript

Even with a preloaded image:
- The `<img>` is inside a React component
- React must execute before the component renders
- The image only appears after hydration

**Lighthouse calls this "Render Delay"** - often 70-90% of LCP time.

---

## Specific Limitations

### 1. Framer Motion / Animation Libraries

**Problem:**
```tsx
// This img won't render until Framer Motion loads
<motion.img src="/hero.webp" initial={{ opacity: 0 }} />
```

**Impact:** Animation library (~30-50KB) blocks first paint.

**Mitigation:**
- Use `initial={false}` for above-fold elements
- Use LazyMotion with `domAnimation` features
- Consider CSS animations for hero content

**Best achievable:** Skip ~0.5s but can't eliminate JS dependency.

---

### 2. React Hydration Cost

**Problem:**
React must "hydrate" the entire component tree before anything is interactive.

**Impact:** 200-500ms on mobile devices.

**Mitigation:**
- Suspense boundaries for progressive hydration
- Lazy load below-fold components
- Use `React.memo` for stable components

**Best achievable:** Reduce TBT but can't eliminate hydration.

---

### 3. Bundle Size Floor

**Problem:**
React + ReactDOM alone is ~130KB (40KB gzipped).

Add common dependencies:
- React Router: +15KB gzipped
- Framer Motion: +30KB gzipped
- State management: +10-20KB gzipped

**Minimum viable bundle:** ~100KB gzipped

**Impact:** Takes 1-2s to download on 3G.

**Mitigation:**
- Aggressive code splitting
- Replace heavy libraries with lighter alternatives
- Use dynamic imports for everything below fold

**Best achievable:** ~60-80KB initial, rest lazy loaded.

---

### 4. Third-Party Scripts

**Problem:**
Analytics, chat widgets, and tracking scripts often:
- Load synchronously
- Execute on the main thread
- Add to TBT significantly

**Impact:** +200-500ms TBT per script.

**Mitigation:**
- Load in `requestIdleCallback`
- Use `defer` or `async`
- Consider removing non-essential scripts

**Best achievable:** Defer but can't eliminate.

---

## Score Ceiling by Architecture

| Architecture | Typical Score | Max Score | Notes |
|--------------|---------------|-----------|-------|
| **Static HTML** | 95-100 | 100 | No JS dependency |
| **SSR (Next.js)** | 85-95 | 98 | HTML pre-rendered |
| **SSG (Astro)** | 90-100 | 100 | Zero JS by default |
| **React SPA** | 50-75 | 85 | JS-dependent rendering |
| **Vue SPA** | 55-80 | 85 | Similar to React |
| **Angular** | 40-65 | 75 | Larger framework |

---

## When to Consider Migration

### Migrate to SSR/SSG if:
- PageSpeed score is critical for SEO/business
- Content is primarily static (blog, marketing site)
- Target audience is on slow networks
- You're consistently hitting the 75-85 ceiling

### Stay with SPA if:
- App is highly interactive (dashboard, editor)
- SEO is not primary concern
- Users are on fast networks
- Score of 70-85 is acceptable

---

## Migration Options

### 1. Next.js (React + SSR/SSG)
```bash
# Add to existing React app
npm install next
# Migrate pages to pages/ directory
```

**Effort:** Medium (2-5 days for simple site)
**Gain:** +15-25 points typical

### 2. Astro (Islands Architecture)
```bash
# Zero JS by default, add React where needed
npm create astro@latest
```

**Effort:** High (rewrite required)
**Gain:** +30-40 points typical

### 3. Remix (React + SSR)
```bash
npm create remix@latest
```

**Effort:** Medium-High
**Gain:** +20-30 points typical

---

## What You CAN Optimize in SPA

Even with limitations, these optimizations help:

| Technique | Typical Gain |
|-----------|--------------|
| WebP images + preload | -1-2s LCP |
| Lazy load below-fold | -500ms TBT |
| Code splitting | -300ms TBT |
| Defer animations | -200ms LCP |
| Font preload | -100ms FCP |
| Compression (brotli) | -20% transfer |

**Combined effect:** Can move from 50 → 75-80 score.

---

## Key Takeaways

1. **Know your ceiling** - React SPA maxes around 85
2. **Optimize what you can** - Still worth doing
3. **Set realistic expectations** - 70-80 is good for SPA
4. **Consider SSR for critical sites** - If 90+ is required
5. **Measure on real devices** - Mobile scores are always lower
6. **Focus on user experience** - Perceived speed matters too
