# PageSpeed Optimization Techniques

Quick reference for specific optimization techniques.

## Table of Contents

1. [Image Optimization](#image-optimization)
2. [JavaScript Optimization](#javascript-optimization)
3. [CSS Optimization](#css-optimization)
4. [Font Optimization](#font-optimization)
5. [Resource Hints](#resource-hints)
6. [LCP Optimization](#lcp-optimization)
7. [CLS Prevention](#cls-prevention)
8. [TBT Reduction](#tbt-reduction)
9. [Caching Strategy](#caching-strategy)
10. [Build Configuration](#build-configuration)

---

## Image Optimization

### Convert to Modern Formats

| Format | Use case | Savings |
|--------|----------|---------|
| WebP | Photos, complex images | 25-35% smaller than JPEG |
| AVIF | Modern browsers only | 50% smaller than JPEG |
| SVG | Icons, logos, illustrations | Vector, scales perfectly |

```bash
# Convert with sharp-cli
npx sharp -i image.png -o image.webp --format webp --quality 85
npx sharp -i image.png -o image.avif --format avif --quality 80
```

### Responsive Images

```html
<picture>
  <source srcset="image.avif" type="image/avif" />
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Description" loading="lazy" />
</picture>
```

### Lazy Loading

```html
<!-- Native lazy loading -->
<img src="image.webp" loading="lazy" alt="Description" />

<!-- With dimensions to prevent CLS -->
<img src="image.webp" loading="lazy" width="800" height="600" alt="Description" />
```

---

## JavaScript Optimization

### Dynamic Imports

```typescript
// Before - loads immediately
import HeavyComponent from './HeavyComponent'

// After - loads on demand
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

### Route-Based Splitting (React Router)

```typescript
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Suspense>
  )
}
```

### Defer Non-Critical Scripts

```html
<!-- Blocking -->
<script src="analytics.js"></script>

<!-- Non-blocking -->
<script src="analytics.js" defer></script>
<script src="analytics.js" async></script>
```

---

## CSS Optimization

### Critical CSS Inlining

```html
<head>
  <!-- Inline critical CSS for above-fold content -->
  <style>
    .hero { min-height: 100vh; }
    .nav { position: fixed; }
  </style>

  <!-- Load rest async -->
  <link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
</head>
```

### Remove Unused CSS

```bash
# Using PurgeCSS
npx purgecss --css styles.css --content index.html --output purged.css
```

### Use CSS containment

```css
.independent-section {
  contain: layout paint;  /* Isolate repaints */
}

.animated-element {
  will-change: transform;  /* Hint to browser */
}
```

---

## Font Optimization

### Preload Critical Fonts

```html
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin />
```

### Font Display Strategy

```css
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/myfont.woff2') format('woff2');
  font-display: swap;  /* Show fallback immediately, swap when loaded */
}
```

### Subset Fonts (Hebrew + English only)

```bash
# Using pyftsubset
pyftsubset input.ttf --unicodes="U+0000-00FF,U+0590-05FF" --output-file=output.woff2
```

---

## Resource Hints

### Preconnect

```html
<!-- For third-party origins you'll fetch from -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://api.example.com" />
```

### Preload

```html
<!-- For critical resources needed immediately -->
<link rel="preload" href="/hero.webp" as="image" fetchpriority="high" />
<link rel="preload" href="/critical.css" as="style" />
<link rel="preload" href="/main.js" as="script" />
```

### Prefetch

```html
<!-- For resources needed soon (next page) -->
<link rel="prefetch" href="/about.html" />
<link rel="prefetch" href="/about-image.webp" as="image" />
```

### DNS Prefetch

```html
<!-- For origins you might connect to -->
<link rel="dns-prefetch" href="//analytics.example.com" />
```

---

## LCP Optimization

### Identify LCP Element

```javascript
// Using Performance API
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    console.log('LCP candidate:', entry.element);
  }
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

### Common LCP Elements

| Element | Optimization |
|---------|--------------|
| Hero image | Preload, WebP, fetchpriority="high" |
| Logo | Preload, WebP, inline SVG |
| Hero text | Preload fonts, inline critical CSS |
| Video poster | Preload poster image |

### LCP Image Optimization

```html
<img
  src="/hero.webp"
  srcset="/hero-400.webp 400w, /hero-800.webp 800w, /hero-1200.webp 1200w"
  sizes="100vw"
  loading="eager"
  fetchpriority="high"
  decoding="async"
  alt="Hero"
/>
```

---

## CLS Prevention

### Always Set Dimensions

```html
<!-- Images -->
<img src="photo.jpg" width="800" height="600" alt="Photo" />

<!-- Videos -->
<video width="1920" height="1080" poster="poster.jpg">...</video>

<!-- Iframes -->
<iframe width="560" height="315" src="..."></iframe>
```

### Use Aspect Ratio

```css
.image-container {
  aspect-ratio: 16 / 9;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### Reserve Space for Dynamic Content

```css
/* Ads, embeds, lazy-loaded content */
.ad-slot {
  min-height: 250px;
}

.skeleton {
  min-height: 400px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## TBT Reduction

### Break Up Long Tasks

```typescript
// Before - blocks main thread
function processLargeArray(items) {
  items.forEach(item => heavyComputation(item))
}

// After - yields to main thread
async function processLargeArray(items) {
  for (const item of items) {
    heavyComputation(item)
    // Yield every 10 items
    if (items.indexOf(item) % 10 === 0) {
      await new Promise(r => setTimeout(r, 0))
    }
  }
}
```

### Use requestIdleCallback

```typescript
requestIdleCallback(() => {
  // Non-critical work
  analytics.track('pageview')
  preloadNextPage()
}, { timeout: 2000 })
```

### Web Workers for Heavy Computation

```typescript
// worker.js
self.onmessage = (e) => {
  const result = heavyComputation(e.data)
  self.postMessage(result)
}

// main.js
const worker = new Worker('worker.js')
worker.postMessage(data)
worker.onmessage = (e) => console.log(e.data)
```

---

## Caching Strategy

### HTTP Cache Headers

```
Cache-Control: public, max-age=31536000, immutable  # Static assets
Cache-Control: no-cache  # HTML (always revalidate)
Cache-Control: private, max-age=3600  # User-specific
```

### Service Worker (PWA)

```typescript
// Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll(['/styles.css', '/app.js', '/logo.svg'])
    })
  )
})
```

---

## Build Configuration

### Vite Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2020',  // Modern browsers
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor'
            if (id.includes('framer-motion')) return 'framer-motion'
            return 'vendor'
          }
        },
      },
    },
  },
})
```

### Tree Shaking Hints

```typescript
// Mark as side-effect free in package.json
{
  "sideEffects": false
}

// Or specific files
{
  "sideEffects": ["*.css", "*.scss"]
}
```
