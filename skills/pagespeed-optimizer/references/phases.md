# 6-Phase Optimization Guide

Systematic approach to PageSpeed optimization for React/Vite websites.

## Table of Contents

1. [Phase 1: Quick Wins (+8-12 points)](#phase-1-quick-wins-expected-8-12-points)
2. [Phase 2: Framer Motion Optimization (+6-10 points)](#phase-2-framer-motion-optimization-expected-6-10-points)
3. [Phase 3: Lottie Optimization (+4-6 points)](#phase-3-lottie-optimization-expected-4-6-points)
4. [Phase 4: Vite Build Optimization (+5-8 points)](#phase-4-vite-build-optimization-expected-5-8-points)
5. [Phase 5: Cleanup (+2-4 points)](#phase-5-cleanup-expected-2-4-points)
6. [Phase 6: Advanced (+5-10 points)](#phase-6-advanced-expected-5-10-points)
7. [Verification Script](#verification-script)

---

## Phase 1: Quick Wins (Expected: +8-12 points)

### 1.1 Font Loading Optimization

**Problem:** Multiple font sources, render-blocking fonts.

**Solution:**
```html
<!-- index.html -->
<!-- Preconnect to font origins -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Async font loading -->
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=YourFont:wght@400;700&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=YourFont:wght@400;700&display=swap" media="print" onload="this.media='all'" />
```

**Alternative - Use @fontsource:**
```bash
npm install @fontsource/heebo
```
```typescript
// main.tsx
import '@fontsource/heebo/400.css'
import '@fontsource/heebo/700.css'
```

### 1.2 Decorative Elements Optimization

**Problem:** CSS animations consuming GPU.

**Solution:**
```typescript
// Add to animated elements
style={{
  willChange: 'transform, opacity',
  contain: 'layout paint',
  transform: 'translateZ(0)', // Force GPU layer
}}

// Increase animation duration (less CPU)
transition={{ duration: 15 + Math.random() * 5 }}
```

### 1.3 Conditional Media Loading

**Problem:** Heavy media loads on all devices.

**Solution:**
```typescript
const [isDesktop, setIsDesktop] = useState(false)

useEffect(() => {
  const mq = window.matchMedia('(min-width: 768px)')
  setIsDesktop(mq.matches)
  const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
  mq.addEventListener('change', handler)
  return () => mq.removeEventListener('change', handler)
}, [])

// Only render video on desktop
{isDesktop && <video autoPlay muted loop ... />}
```

---

## Phase 2: Framer Motion Optimization (Expected: +6-10 points)

### 2.1 LazyMotion Setup

**Problem:** Framer Motion loads all features (~100KB).

**Solution:**
```typescript
// MotionProvider.tsx
import { LazyMotion, domAnimation } from 'framer-motion'

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}
```

### 2.2 Replace motion with m

**Problem:** `motion.div` doesn't tree-shake.

**Solution:**
```typescript
// Before
import { motion } from 'framer-motion'
<motion.div animate={{ opacity: 1 }}>

// After
import { m } from 'framer-motion'
<m.div animate={{ opacity: 1 }}>
```

**Bulk replace regex:**
```
Find: import \{ motion(.*?)\} from 'framer-motion'
Replace: import { m$1} from 'framer-motion'

Find: <motion\.
Replace: <m.

Find: </motion\.
Replace: </m.
```

---

## Phase 3: Lottie Optimization (Expected: +4-6 points)

### 3.1 Full Lazy Loading

**Problem:** Lottie library (317KB) loads immediately.

**Solution:**
```typescript
import { lazy, Suspense, useState, useEffect, useRef } from 'react'

// Dynamic import - loads only when needed
const LottieComponent = lazy(() => import('lottie-react'))

export function LottieIcon({ animationPath, size = 64 }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [animationData, setAnimationData] = useState(null)

  // IntersectionObserver - trigger load when visible
  useEffect(() => {
    if (shouldLoad) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [shouldLoad])

  // Fetch animation JSON only when triggered
  useEffect(() => {
    if (!shouldLoad || !animationPath) return
    fetch(animationPath).then(r => r.json()).then(setAnimationData)
  }, [shouldLoad, animationPath])

  if (!shouldLoad || !animationData) {
    return <div ref={containerRef} style={{ width: size, height: size }} />
  }

  return (
    <div ref={containerRef} style={{ width: size, height: size }}>
      <Suspense fallback={<div className="animate-pulse bg-gray-100" />}>
        <LottieComponent animationData={animationData} loop autoplay />
      </Suspense>
    </div>
  )
}
```

---

## Phase 4: Vite Build Optimization (Expected: +5-8 points)

### 4.1 Compression Plugin

```bash
npm install -D vite-plugin-compression
```

```typescript
// vite.config.ts
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
})
```

### 4.2 Manual Chunks (Code Splitting)

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer-motion': ['framer-motion'],
          'lottie': ['lottie-react'],
        },
      },
    },
  },
})
```

### 4.3 Lazy Load Below-Fold Sections

```typescript
// App.tsx
const Services = lazy(() => import('./components/sections/Services'))
const Portfolio = lazy(() => import('./components/sections/Portfolio'))
const Contact = lazy(() => import('./components/sections/Contact'))

function HomePage() {
  return (
    <>
      <Hero /> {/* Above fold - load immediately */}

      <Suspense fallback={<div style={{ minHeight: '400px' }} />}>
        <Services />
      </Suspense>

      <Suspense fallback={<div style={{ minHeight: '500px' }} />}>
        <Portfolio />
      </Suspense>

      <Suspense fallback={<div style={{ minHeight: '400px' }} />}>
        <Contact />
      </Suspense>
    </>
  )
}
```

---

## Phase 5: Cleanup (Expected: +2-4 points)

### 5.1 Disable Heavy Effects on Mobile

```typescript
export function GrainOverlay({ opacity = 0.03 }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Skip expensive SVG filter on mobile
  if (isMobile) return null

  return <div className="grain-overlay" style={{ opacity }} />
}
```

### 5.2 Image Preloading

```html
<!-- index.html -->
<!-- Preload LCP image -->
<link rel="preload" href="/images/hero.webp" as="image" type="image/webp" />

<!-- Preload logo (if it's the LCP element) -->
<link rel="preload" href="/images/logo.webp" as="image" type="image/webp" fetchpriority="high" />
```

---

## Phase 6: Advanced (Expected: +5-10 points)

### 6.1 Optimize LCP Element

1. **Find LCP element** in Lighthouse report
2. **Preload it** in index.html
3. **Convert to WebP** (50-70% smaller than PNG)
4. **Add fetchpriority="high"**
5. **Skip animations** that block render

```typescript
// For header logo (often the LCP element)
<img
  src="/images/logo.webp"
  loading="eager"
  fetchpriority="high"
  decoding="async"
  width={320}
  height={144}
  alt="Logo"
/>
```

### 6.2 Skip Initial Animations for LCP

```typescript
// Don't animate LCP elements on entry
<m.div
  initial={false}  // Skip entry animation
  whileHover={{ scale: 1.02 }}  // Keep interaction animations
>
```

### 6.3 Convert Images to WebP

```bash
# Install sharp-cli
npm install -D sharp-cli

# Convert PNG to WebP
npx sharp -i input.png -o output.webp --format webp --quality 85
```

### 6.4 Aspect Ratio for CLS Prevention

```typescript
<div style={{ aspectRatio: '16 / 9' }}>
  <img src="/image.webp" className="w-full h-full object-cover" />
</div>
```

---

## Verification Script

After each phase, run:

```bash
npm run build
npm run preview &
sleep 3
npx lighthouse http://localhost:4173 --output=json --output-path=./lighthouse.json --chrome-flags="--headless" --only-categories=performance --quiet
node -e "const r=require('./lighthouse.json');console.log('Score:',Math.round(r.categories.performance.score*100),'LCP:',r.audits['largest-contentful-paint'].displayValue,'TBT:',r.audits['total-blocking-time'].displayValue)"
```
