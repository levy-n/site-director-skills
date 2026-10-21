# Mobile UX Expert Reference

> The sub-skill that turns responsive websites into **native-feeling** mobile experiences.
> Load this reference when building mobile-first UI, optimizing touch interactions,
> or when `/mobile-audit` flags issues.

---

## Table of Contents

- [Philosophy](#philosophy)
- [Thumb Zone Design](#thumb-zone-design)
- [Touch Targets & Gestures](#touch-targets--gestures)
- [Safe Areas & Device Considerations](#safe-areas--device-considerations)
- [Mobile Navigation Patterns](#mobile-navigation-patterns)
- [Mobile Typography](#mobile-typography)
- [Mobile Spacing & Layout](#mobile-spacing--layout)
- [Mobile Forms](#mobile-forms)
- [Scroll Patterns](#scroll-patterns)
- [Performance on Mobile](#performance-on-mobile)
- [Responsive Images & Media](#responsive-images--media)
- [Mobile Animations](#mobile-animations)
- [Bottom Sheets & Overlays](#bottom-sheets--overlays)
- [PWA Patterns](#pwa-patterns)
- [Mobile Anti-Patterns](#mobile-anti-patterns)
- [Mobile Scoring Criteria](#mobile-scoring-criteria)
- [Device Breakpoint Reference](#device-breakpoint-reference)
- [RTL Mobile Considerations](#rtl-mobile-considerations)

---

## Philosophy

Mobile is not "desktop but smaller." Mobile users are:
- **Distracted** -- partial attention, multitasking, moving
- **Impatient** -- 53% abandon sites that take >3s to load (Google)
- **One-handed** -- 75% of phone interactions are single-thumb (Steven Hoober, 2013; confirmed in 2020 follow-up)
- **Context-rich** -- they have location, camera, haptics, gyroscope

**The test**: Can a user accomplish the primary task **one-handed, on a moving bus, with 3G**? If yes, the mobile UX is solid.

---

## Thumb Zone Design

Based on Steven Hoober's research and updated for modern device sizes (6.1"-6.7" screens).

### The Thumb Zone Map

```
┌─────────────────────────┐
│  ⚠️ HARD TO REACH       │  ← Top 20% of screen
│  (hamburger menus,      │     Avoid primary actions here
│   status bar actions)   │
├─────────────────────────┤
│                         │
│  ✅ COMFORTABLE         │  ← Middle 50%
│  (content, cards,       │     Content reading zone
│   secondary actions)    │
│                         │
├─────────────────────────┤
│  🎯 PRIME ZONE          │  ← Bottom 30%
│  (primary CTA, nav,     │     PRIMARY ACTIONS HERE
│   most-used controls)   │
└─────────────────────────┘
```

### Implementation Rules

1. **Primary CTAs** go in the bottom 30% of the viewport
2. **Navigation** belongs at the bottom (not top hamburger)
3. **Destructive actions** go in the hard-to-reach zone (top) -- this is intentional friction
4. **Floating action buttons (FAB)** should be bottom-right (LTR) or bottom-left (RTL)
5. **Search bars** that expand should push down, not require reaching up

### CSS for Bottom-Anchored CTAs

```css
.mobile-cta-container {
  position: fixed;
  inset-block-end: 0;
  inset-inline: 0;
  padding: 1rem;
  padding-block-end: calc(1rem + env(safe-area-inset-bottom));
  background: linear-gradient(transparent, var(--bg-surface) 30%);
  z-index: var(--z-sticky);
}
```

### Tailwind Bottom CTA

```html
<div class="fixed bottom-0 inset-x-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]
            bg-gradient-to-t from-white via-white/90 to-transparent z-40">
  <button class="w-full h-12 rounded-xl bg-primary text-white font-semibold">
    Primary Action
  </button>
</div>
```

---

## Touch Targets & Gestures

### Touch Target Sizing

| Standard | Minimum Size | Recommended | Spacing |
|----------|-------------|-------------|---------|
| Apple HIG | 44x44pt | 44x44pt | 8pt between |
| Material Design 3 | 48x48dp | 48x48dp | 8dp between |
| WCAG 2.2 (AAA) | 44x44px | 48x48px | No overlap |
| **Our standard** | **44x44px** | **48x48px** | **8px minimum** |

### Extending Touch Targets Beyond Visual Size

```css
/* Icon button that looks 24px but has 48px touch target */
.icon-button {
  position: relative;
  width: 24px;
  height: 24px;
}

.icon-button::before {
  content: '';
  position: absolute;
  inset: -12px; /* Extends 12px in each direction: 24 + 24 = 48px total */
}
```

### Tailwind Touch Target Extension

```html
<!-- Small visual, large touch area -->
<button class="relative p-3 -m-3">
  <svg class="w-5 h-5"><!-- icon --></svg>
</button>
```

### Touch Gestures Reference

| Gesture | Use Case | Implementation |
|---------|----------|----------------|
| Tap | Primary action | `onClick` / `onPointerUp` |
| Long press | Context menu, selection | `onPointerDown` + timeout (500ms) |
| Swipe horizontal | Dismiss, navigate, reveal actions | Touch event delta X > 50px |
| Swipe vertical | Scroll, pull-to-refresh | Native or custom with `touchmove` |
| Pinch | Zoom images/maps | `gesturechange` or pointer events |
| Double tap | Zoom, like | Two taps within 300ms |

### Gesture Conflict Prevention

```css
/* Prevent horizontal swipe from conflicting with scroll */
.swipeable-card {
  touch-action: pan-y; /* Allow vertical scroll, capture horizontal */
  overscroll-behavior-x: none;
}

/* Prevent pull-to-refresh when custom implementation exists */
body {
  overscroll-behavior-y: none;
}

/* Allow only vertical scroll in a list */
.scroll-list {
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}
```

### Tap Feedback (Non-Negotiable)

User MUST receive visual feedback within **100ms** of tapping:

```css
/* Active state for tap feedback */
.tappable {
  transition: transform 50ms ease-out, opacity 50ms ease-out;
  -webkit-tap-highlight-color: transparent; /* Remove default blue highlight */
}

.tappable:active {
  transform: scale(0.97);
  opacity: 0.8;
}
```

### Tailwind Tap Feedback

```html
<button class="active:scale-[0.97] active:opacity-80 transition-transform duration-50">
  Tap me
</button>
```

---

## Safe Areas & Device Considerations

### The Safe Area Problem

Modern devices have notches, dynamic islands, rounded corners, and home indicators that overlap content. CSS `env()` variables solve this.

### Required Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

**`viewport-fit=cover`** is CRITICAL. Without it, `env(safe-area-inset-*)` values are always 0.

### Safe Area CSS

```css
:root {
  /* Fallback for older browsers */
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
}

/* Fixed bottom bar respecting home indicator */
.bottom-bar {
  padding-block-end: calc(0.75rem + var(--safe-bottom));
}

/* Full-bleed hero respecting notch */
.hero-fullbleed {
  padding-block-start: calc(2rem + var(--safe-top));
  padding-inline-start: calc(1rem + var(--safe-left));
  padding-inline-end: calc(1rem + var(--safe-right));
}
```

### Tailwind Safe Area Plugin

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
};
```

### Device-Specific Considerations

| Device Feature | CSS Solution |
|----------------|-------------|
| iPhone notch/dynamic island | `env(safe-area-inset-top)` -- typically 47-59px |
| Home indicator (iPhone X+) | `env(safe-area-inset-bottom)` -- typically 34px |
| Android navigation bar | `env(safe-area-inset-bottom)` -- varies 0-48px |
| Rounded corners | Avoid placing content in corner 16px radius zones |
| Landscape rotation | Re-check `safe-area-inset-left/right` (notch moves) |
| Foldable devices | Use `@media (horizontal-viewport-segments: 2)` for fold detection |

---

## Mobile Navigation Patterns

### Bottom Navigation Bar (Preferred)

The dominant mobile navigation pattern. Used by: Instagram, Twitter/X, YouTube, Spotify, every major app.

```tsx
// React + Tailwind bottom nav
function BottomNav({ items, activeIndex }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md
                    border-t border-neutral-200
                    pb-[env(safe-area-inset-bottom)]
                    z-50">
      <div className="flex items-center justify-around h-14">
        {items.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] px-3",
              i === activeIndex
                ? "text-primary"
                : "text-neutral-500"
            )}
            aria-current={i === activeIndex ? "page" : undefined}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
```

### Bottom Nav Rules

- **Maximum 5 items** (3-5 is ideal)
- **Label every icon** -- icon-only nav is hostile to new users
- **Active state** must be clearly distinguishable (color + weight, not just color)
- **Touch targets** 48x48px minimum per item
- Account for safe area inset at bottom
- Add `padding-block-end` to `<main>` equal to nav height + safe area

### When to Use Which Pattern

| Navigation Type | When | Items |
|----------------|------|-------|
| Bottom tab bar | Primary app-style nav | 3-5 |
| Hamburger drawer | Secondary/settings nav | 6+ |
| Tab bar (scrollable) | Category browsing | 4-8 |
| Sticky header with back | Linear flows (checkout, forms) | N/A |
| Full-screen overlay | Sparse, editorial sites | Any |

### Sticky Header Rules

```css
.sticky-header {
  position: sticky;
  inset-block-start: 0;
  z-index: var(--z-header);
  /* Shrink on scroll to save space */
  transition: height 200ms ease-out, padding 200ms ease-out;
}

/* Compensate for sticky header on anchor links */
[id] {
  scroll-margin-block-start: 4rem; /* Match header height */
}
```

### Header Auto-Hide on Scroll Down

```tsx
// Show header on scroll up, hide on scroll down -- saves mobile viewport space
function useScrollDirection() {
  const [show, setShow] = useState(true);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShow(currentScroll < lastScroll.current || currentScroll < 80);
      lastScroll.current = currentScroll;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return show;
}
```

---

## Mobile Typography

### Size Rules

| Element | Minimum Mobile | Recommended | Max Width |
|---------|---------------|-------------|-----------|
| Body text | 16px (1rem) | 16-18px | 65ch / `max-w-prose` |
| Secondary text | 14px (0.875rem) | 14px | -- |
| Captions/labels | 12px (0.75rem) | 12-13px | -- |
| H1 (mobile) | 28px (1.75rem) | 32-36px | -- |
| H2 (mobile) | 22px (1.375rem) | 24-28px | -- |
| H3 (mobile) | 18px (1.125rem) | 20-22px | -- |

### Fluid Typography with clamp()

```css
/* Scales smoothly between mobile and desktop */
h1 {
  font-size: clamp(1.75rem, 4vw + 1rem, 3.5rem);
  line-height: 1.1;
}

h2 {
  font-size: clamp(1.375rem, 3vw + 0.75rem, 2.5rem);
  line-height: 1.2;
}

body {
  font-size: clamp(1rem, 0.5vw + 0.875rem, 1.125rem);
  line-height: 1.6;
}
```

### Tailwind Fluid Type

```html
<h1 class="text-[clamp(1.75rem,4vw+1rem,3.5rem)] leading-tight">
  Headline
</h1>
```

### Mobile Text Readability

- **Paragraph max-width**: `max-w-prose` (65ch) or `max-w-lg` on mobile
- **Line height**: 1.5-1.7 for body (1.7-1.8 for Hebrew)
- **Letter spacing**: 0 for Hebrew, slight positive for all-caps Latin headings
- **Word break**: Use `overflow-wrap: break-word` to prevent long URLs from breaking layout
- **Text rendering**: `-webkit-font-smoothing: antialiased` for cleaner mobile rendering

---

## Mobile Spacing & Layout

### Mobile-First Spacing Scale

| Token | Mobile | Tablet (md:) | Desktop (lg:) |
|-------|--------|-------------|--------------|
| Page padding (inline) | 16px (1rem) | 24px (1.5rem) | 32-48px |
| Section gap (block) | 48px (3rem) | 64px (4rem) | 80-96px |
| Card padding | 16px | 20px | 24px |
| Stack gap (items) | 12px | 16px | 16-20px |
| Inline gap (row items) | 8px | 12px | 16px |

### Mobile Layout Patterns

**Stack Everything on Mobile**
```html
<div class="flex flex-col gap-4 md:flex-row md:gap-8">
  <div class="md:w-1/2">Content A</div>
  <div class="md:w-1/2">Content B</div>
</div>
```

**Grid Collapse**
```html
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <!-- Cards stack on mobile, 2-col on tablet, 3-col on desktop -->
</div>
```

**Full-Bleed Sections on Mobile**
```html
<section class="-mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-xl">
  <!-- Breaks out of page padding on mobile for full-width feel -->
</section>
```

### Mobile Viewport Height

```css
/* Fix 100vh being taller than visible viewport on mobile Safari */
.full-height {
  min-height: 100dvh; /* Dynamic viewport height */
}

/* Fallback for older browsers */
@supports not (min-height: 100dvh) {
  .full-height {
    min-height: -webkit-fill-available;
  }
}
```

---

## Mobile Forms

### Input Type Optimization

The correct `type` attribute triggers the right mobile keyboard:

| Input Purpose | Type | Keyboard |
|--------------|------|----------|
| Email | `type="email"` | @ symbol visible |
| Phone number | `type="tel"` | Numeric keypad |
| URL | `type="url"` | .com / .co.il shortcuts |
| Number | `inputmode="numeric"` | Number pad (no spinner) |
| Credit card | `inputmode="numeric" autocomplete="cc-number"` | Number pad + autofill |
| Search | `type="search"` | Search/Go button on keyboard |
| Password | `type="password"` | Show/hide toggle by browser |
| Date | `type="date"` | Native date picker |

### Mobile Form Sizing

```css
/* Prevent iOS zoom on focus (happens when font-size < 16px) */
input, select, textarea {
  font-size: 1rem; /* 16px minimum! */
}

/* Generous touch-friendly inputs */
input, select {
  min-height: 48px;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}
```

### Autocomplete Attributes (Critical for Mobile UX)

```html
<input type="text" name="name" autocomplete="name" />
<input type="email" name="email" autocomplete="email" />
<input type="tel" name="phone" autocomplete="tel" />
<input type="text" name="address" autocomplete="street-address" />
<input type="text" name="city" autocomplete="address-level2" />
<input type="text" name="zip" autocomplete="postal-code" />
```

### Form UX Rules

1. **Single column ALWAYS on mobile** -- never side-by-side fields
2. **Labels above inputs** -- never floating labels (accessibility issues)
3. **Show/hide password toggle** -- critical on mobile where typing is error-prone
4. **Validate on blur, not on type** -- let users finish typing
5. **Error messages below the field** -- not in toast/alert
6. **Scroll to first error** on form submission failure
7. **Dismiss keyboard** on form submit or when tapping outside

---

## Scroll Patterns

### Scroll Snap for Mobile Carousels

```css
.carousel {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline-start: 1rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}

.carousel::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.carousel-item {
  scroll-snap-align: start;
  flex-shrink: 0;
  width: 80vw; /* Peek next card */
  max-width: 320px;
}
```

### Tailwind Scroll Snap Carousel

```html
<div class="flex gap-4 overflow-x-auto snap-x snap-mandatory
            scroll-pl-4 scrollbar-hide -mx-4 px-4">
  <div class="snap-start shrink-0 w-[80vw] max-w-xs">Card 1</div>
  <div class="snap-start shrink-0 w-[80vw] max-w-xs">Card 2</div>
  <div class="snap-start shrink-0 w-[80vw] max-w-xs">Card 3</div>
</div>
```

### Pull-to-Refresh (Custom)

```css
/* Disable browser's default pull-to-refresh when implementing custom */
body {
  overscroll-behavior-y: none;
}
```

### Infinite Scroll Best Practices

1. **Always provide "Load more" button** as alternative (accessibility)
2. **Show item count**: "Showing 20 of 156 results"
3. **Maintain scroll position** on back navigation (use `scrollRestoration`)
4. **Virtual scroll** for lists >100 items (react-window, react-virtuoso)
5. **Loading skeleton** at bottom, not a spinner

---

## Performance on Mobile

### Critical Metrics (Core Web Vitals)

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5-4.0s | > 4.0s |
| INP (Interaction to Next Paint) | < 200ms | 200-500ms | > 500ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |

### Mobile Performance Checklist

1. **Total page weight**: Target < 500KB initial load (before images)
2. **JavaScript budget**: < 300KB gzipped for initial bundle
3. **First paint**: < 1.5s on 4G
4. **Images**: Lazy load below-fold, use WebP/AVIF, correct `sizes`
5. **Fonts**: `font-display: swap`, subset to needed characters
6. **CSS**: Inline critical CSS, defer the rest
7. **Third-party scripts**: Load async/defer, audit for size

### Critical Resource Loading

```html
<!-- Preload hero image -->
<link rel="preload" as="image" href="/hero.webp"
      media="(max-width: 768px)" imagesrcset="/hero-mobile.webp 375w, /hero-tablet.webp 768w">

<!-- Preload critical font -->
<link rel="preload" as="font" href="/fonts/heading.woff2" type="font/woff2" crossorigin>

<!-- Prefetch next likely page -->
<link rel="prefetch" href="/about">
```

---

## Responsive Images & Media

### The `<picture>` Element Pattern

```html
<picture>
  <!-- Mobile-optimized: smaller file, possibly different crop -->
  <source media="(max-width: 639px)"
          srcset="/hero-mobile.avif" type="image/avif">
  <source media="(max-width: 639px)"
          srcset="/hero-mobile.webp" type="image/webp">

  <!-- Desktop -->
  <source media="(min-width: 640px)"
          srcset="/hero-desktop.avif" type="image/avif">
  <source media="(min-width: 640px)"
          srcset="/hero-desktop.webp" type="image/webp">

  <!-- Fallback -->
  <img src="/hero-desktop.jpg" alt="Description"
       width="1200" height="600" loading="lazy" decoding="async">
</picture>
```

### Responsive Image with srcset

```html
<img
  srcset="/img-320.webp 320w,
          /img-640.webp 640w,
          /img-960.webp 960w,
          /img-1280.webp 1280w"
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  src="/img-640.webp"
  alt="Description"
  width="640" height="400"
  loading="lazy"
  decoding="async"
/>
```

### Image Sizing Rules

- **Always specify `width` and `height`** -- prevents CLS
- **Use `loading="lazy"`** on all below-fold images
- **Use `loading="eager"`** (or omit) on hero/LCP image only
- **Use `decoding="async"`** on all images
- **Aspect ratio**: Use `aspect-ratio` CSS for responsive containers

```css
.image-container {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

## Mobile Animations

### Mobile-Specific Constraints

1. **Shorter durations**: Mobile animations should be 20-30% faster than desktop
2. **Simpler animations**: Fewer simultaneous animated properties
3. **No parallax on mobile**: Causes jank and motion sickness
4. **No autoplay video above fold**: Wastes data, blocks LCP
5. **Reduce stagger count**: Max 4-5 staggered items on mobile (vs 8+ on desktop)

### Framer Motion Mobile Adjustments

```tsx
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

const fadeInUp = {
  initial: { opacity: 0, y: isMobile ? 15 : 30 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: isMobile ? 0.3 : 0.5,
    ease: [0.25, 0.1, 0.25, 1]
  },
};

// Reduce stagger on mobile
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: isMobile ? 0.05 : 0.1,
      delayChildren: isMobile ? 0.1 : 0.2,
    },
  },
};
```

### Prefer `will-change` Sparingly

```css
/* Only apply to elements ABOUT to animate, remove after */
.about-to-animate {
  will-change: transform, opacity;
}

/* NEVER apply will-change to many elements simultaneously on mobile */
/* It consumes GPU memory which is limited on phones */
```

### Scroll-Triggered Animations on Mobile

```tsx
// Use Intersection Observer threshold carefully on mobile
// Lower threshold = triggers sooner = less waiting for slow scrollers
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.2 }} // 20% visible triggers
  variants={fadeInUp}
/>
```

---

## Bottom Sheets & Overlays

### Bottom Sheet Pattern (Mobile Alternative to Modals)

Bottom sheets are the mobile-native replacement for modals and dropdowns. They're thumb-friendly and feel natural on mobile.

### When to Use

| Desktop Pattern | Mobile Replacement |
|----------------|-------------------|
| Modal dialog | Bottom sheet |
| Dropdown menu | Bottom sheet or action sheet |
| Sidebar filter | Bottom sheet with sections |
| Tooltip/popover | Bottom sheet for complex content |
| Multi-select | Bottom sheet with checkboxes |

### Implementation Guidelines

```css
.bottom-sheet {
  position: fixed;
  inset-inline: 0;
  inset-block-end: 0;
  max-height: 90vh; /* Never cover full screen */
  border-radius: 1rem 1rem 0 0;
  padding-block-end: env(safe-area-inset-bottom);
  background: var(--surface);
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* Drag handle indicator */
.bottom-sheet::before {
  content: '';
  display: block;
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--neutral-300);
  margin: 0.5rem auto 1rem;
}
```

### Overlay Rules

1. **Backdrop** must dim the background (`bg-black/50`)
2. **Dismiss** on backdrop tap AND swipe down
3. **Focus trap** inside the sheet (accessibility)
4. **Max height 90vh** -- never cover the entire screen
5. **Drag handle** visible at top for swipe-to-dismiss affordance
6. **Animate** from bottom with spring physics

---

## PWA Patterns

### Minimal PWA Setup for Native Feel

```json
// manifest.json
{
  "name": "App Name",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FDFBF7",
  "theme_color": "#F5A623",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Theme Color for Browser Chrome

```html
<!-- Match browser toolbar to your site header -->
<meta name="theme-color" content="#FDFBF7" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)">

<!-- iOS status bar -->
<meta name="apple-mobile-web-app-status-bar-style" content="default">
```

### Offline-Ready Patterns

1. **Cache critical assets** with Service Worker
2. **Offline fallback page** for network failures
3. **Queue actions** when offline, sync when online
4. **Show connection status** indicator when offline

---

## Mobile Anti-Patterns

### Critical Failures (Score -20 each)

| Anti-Pattern | Why It Fails | Fix |
|-------------|-------------|-----|
| Touch targets < 44px | Impossible to tap accurately | Min 44x44px, extend with padding |
| Body text < 16px | Unreadable, triggers iOS zoom | `font-size: 1rem` minimum |
| Horizontal scroll on content | Breaks one-handed use | `overflow-x: hidden` on body, fix width |
| No tap feedback | Feels broken/unresponsive | `:active` state within 100ms |
| Fixed elements blocking thumb zone | Can't interact with content underneath | Use `position: sticky` or bottom-anchor |
| Desktop modal on mobile | Can't dismiss, content cut off | Replace with bottom sheet |
| Tiny close buttons on overlays | Frustration, accidental taps | 44x44px close button, backdrop dismiss |
| Input font < 16px | iOS auto-zooms the viewport | Always `font-size: 1rem` on inputs |
| No viewport-fit=cover | Safe area insets return 0 | Add to viewport meta tag |
| 100vh for full height | Address bar makes content overflow | Use `100dvh` |

### Moderate Issues (Score -10 each)

| Anti-Pattern | Why It Fails | Fix |
|-------------|-------------|-----|
| Hover-only interactions | No hover on touch devices | Tap/click equivalent for all hover actions |
| Parallax scrolling on mobile | Jank, battery drain, motion sickness | Disable parallax below `md:` breakpoint |
| Autoplay video with sound | Annoying, wastes data | Muted autoplay or poster image on mobile |
| No loading skeletons | Content jump (CLS) | Skeleton placeholders for async content |
| Same image sizes mobile/desktop | Wastes bandwidth | Responsive images with `srcset`/`sizes` |
| No keyboard dismiss on form submit | Keyboard blocks success message | `document.activeElement.blur()` |
| Side-by-side form fields on mobile | Too narrow to type | Single column always on mobile |

---

## Mobile Scoring Criteria

Extension to the main `evaluation-criteria.md` -- add this category when evaluating mobile:

### Mobile UX (0-100)

| Criterion | 20 Points | 10 Points | 5 Points | 0 Points |
|-----------|-----------|-----------|----------|----------|
| Touch targets | All >= 48px with 8px spacing | All >= 44px | Some < 44px but > 36px | Critical targets < 36px |
| Thumb zone | Primary actions in bottom 30% | Primary actions in middle | Primary actions at top | No thumb zone consideration |
| Safe areas | Full env() support with fallbacks | Partial safe area handling | Only bottom safe area | No safe area support |
| Mobile typography | Fluid clamp(), 16px+ body, proper scale | Correct sizes but not fluid | Some text < 16px on mobile | Desktop sizes on mobile |
| Mobile performance | LCP < 2.5s, < 500KB initial | LCP < 4s, < 800KB initial | LCP < 6s, > 1MB initial | LCP > 6s or > 2MB initial |

### Integration with Overall Score

When evaluating a page/component for mobile, the overall score becomes:

```
overall_score = (typography + color + spacing + layout + motion + accessibility + mobile_ux) / 7
```

---

## Device Breakpoint Reference

### Common Devices (2024-2026)

| Device | Viewport | DPR | Safe Area Top | Safe Area Bottom |
|--------|----------|-----|---------------|------------------|
| iPhone SE (3rd) | 375x667 | 2x | 20px | 0px |
| iPhone 14 | 390x844 | 3x | 47px | 34px |
| iPhone 14 Pro | 393x852 | 3x | 59px | 34px |
| iPhone 15 Pro Max | 430x932 | 3x | 59px | 34px |
| iPhone 16 Pro | 402x874 | 3x | 62px | 34px |
| Samsung Galaxy S24 | 360x780 | 3x | 0px | 0px |
| Pixel 8 | 412x915 | 2.625x | 0px | 0px |
| iPad (10th gen) | 820x1180 | 2x | 24px | 20px |
| iPad Pro 12.9" | 1024x1366 | 2x | 24px | 20px |

### Recommended Test Breakpoints

| Name | Width | Tests |
|------|-------|-------|
| Mobile S | 375px | Smallest modern phone |
| Mobile L | 430px | Large phone (Pro Max) |
| Tablet Portrait | 768px | iPad portrait |
| Tablet Landscape | 1024px | iPad landscape |
| Desktop | 1280px | Standard laptop |
| Desktop L | 1536px | Large monitor |

---

## RTL Mobile Considerations

When building Hebrew/Arabic mobile experiences, add these to the standard RTL checklist:

### RTL Thumb Zone (Mirrored)

```
┌─────────────────────────┐
│  ⚠️ HARD TO REACH       │
│  (same as LTR)          │
├─────────────────────────┤
│  ✅ COMFORTABLE         │
│  (same as LTR)          │
├─────────────────────────┤
│  🎯 PRIME ZONE          │
│  FAB: bottom-LEFT       │  ← Mirrored from LTR
│  (RTL primary hand)     │
└─────────────────────────┘
```

### RTL-Specific Mobile Rules

1. **Swipe direction reverses**: Swipe LEFT to go forward, RIGHT to go back
2. **Carousel scrolls right-to-left**: First item on the right
3. **Bottom nav**: Same position (bottom-center), text remains in reading order
4. **FAB position**: Bottom-left instead of bottom-right
5. **Slide-in menus**: Enter from the RIGHT side
6. **Progress indicators**: Fill from right to left
7. **Back button**: Points RIGHT (→) instead of left (←)

### RTL Mobile Navigation

```tsx
// Bottom nav -- same code works for RTL because flexbox auto-reverses
<nav className="fixed bottom-0 inset-x-0 flex items-center justify-around
                pb-[env(safe-area-inset-bottom)]"
     dir="rtl">
  {/* Items auto-arrange right-to-left */}
</nav>
```

---

## Quick-Reference: Mobile Checklist

Use this 15-point checklist before shipping any mobile UI:

- [ ] 1. Touch targets >= 44x44px (48px preferred)
- [ ] 2. Body text >= 16px (1rem)
- [ ] 3. Input font >= 16px (prevents iOS zoom)
- [ ] 4. `viewport-fit=cover` in meta tag
- [ ] 5. Safe area insets applied (`env(safe-area-inset-*)`)
- [ ] 6. Primary CTA in thumb zone (bottom 30%)
- [ ] 7. No horizontal scroll on any viewport
- [ ] 8. Tap feedback < 100ms on all interactive elements
- [ ] 9. `100dvh` instead of `100vh` for full-height layouts
- [ ] 10. Images lazy-loaded with `width`/`height` attributes
- [ ] 11. Responsive images with `srcset` and `sizes`
- [ ] 12. Forms use correct `type`/`inputmode`/`autocomplete`
- [ ] 13. Single-column form layout on mobile
- [ ] 14. Bottom sheet instead of modal on mobile
- [ ] 15. `prefers-reduced-motion` respected for all animations
