# Phase 6: Optimization

## Reference Document for MediaWave Landing Page Pipeline

This phase takes the built landing page (Phase 5) and optimizes it for performance, SEO, accessibility, and cross-browser compatibility. The goal: 90+ Lighthouse scores across all categories, with 100 as the target.

---

## 1. Performance Targets

### Lighthouse Score Targets

| Category | Minimum | Target |
|----------|---------|--------|
| Performance | 90 | 100 |
| Accessibility | 90 | 100 |
| Best Practices | 90 | 100 |
| SEO | 90 | 100 |

### Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|--------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | < 200ms | 200ms - 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |

### Performance Budget

```
Total page weight (initial load): < 500KB
  - HTML:        < 50KB
  - CSS:         < 50KB (after purge)
  - JavaScript:  < 150KB (after tree shaking)
  - Fonts:       < 100KB (subset Hebrew fonts)
  - Images:      < 150KB above the fold

Time to Interactive: < 3.0s on 3G
First Contentful Paint: < 1.8s
```

---

## 2. Image Optimization

### Format Selection

```
Priority Order:
  1. AVIF  - Best compression, growing support (Chrome 85+, Firefox 93+)
  2. WebP  - Good compression, wide support (all modern browsers)
  3. JPEG  - Fallback for older browsers
  4. PNG   - Only for images requiring transparency
  5. SVG   - For icons, logos, simple illustrations (inline when possible)
```

### Implementation with Next.js

```typescript
// next/image handles format negotiation automatically
import Image from 'next/image'

<Image
  src="/images/hero.jpg"
  alt="תיאור התמונה בעברית"    // Always Hebrew alt text
  width={1200}
  height={600}
  priority                      // Only for above-fold images (LCP)
  placeholder="blur"            // Blur placeholder while loading
  blurDataURL={blurBase64}      // Base64 blur placeholder
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px"
  quality={80}                  // 80 is a good balance
/>
```

### Responsive srcset Strategy

```
Breakpoints for srcset:
  - 320px   (small mobile)
  - 640px   (mobile)
  - 768px   (tablet)
  - 1024px  (small desktop)
  - 1280px  (desktop)
  - 1536px  (large desktop)
  - 1920px  (full HD)
```

### Image Processing with sharp

```typescript
// Server-side image processing (build time or on-demand)
import sharp from 'sharp'

// Generate optimized versions
await sharp(inputBuffer)
  .resize(1200, 600, { fit: 'cover' })
  .webp({ quality: 80 })
  .toFile('output.webp')

// Generate blur placeholder
const blurBuffer = await sharp(inputBuffer)
  .resize(10, 10, { fit: 'cover' })
  .blur()
  .toBuffer()
const blurBase64 = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`
```

### Lazy Loading Strategy

```
EAGER load (priority):
  - Hero image
  - Above-fold background
  - Logo

LAZY load (default):
  - All images below the fold
  - Testimonial photos
  - Feature icons (unless SVG inline)
  - Gallery images
  - Footer images
```

---

## 3. Font Loading

### Font Loading Strategy

```css
/* Critical: Use font-display: swap */
@font-face {
  font-family: 'Heebo';
  src: url('/fonts/Heebo-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;    /* Show fallback text immediately, swap when loaded */
}
```

### Preload Critical Hebrew Fonts

```html
<!-- In <head>, preload only the weights used above the fold -->
<link rel="preload" href="/fonts/Heebo-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/Heebo-Bold.woff2" as="font" type="font/woff2" crossorigin>
```

### Next.js Font Optimization

```typescript
// next/font automatically handles subsetting, preloading, and font-display
import { Heebo, Rubik } from 'next/font/google'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
})

const rubik = Rubik({
  subsets: ['hebrew', 'latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-heading',
})

// Apply in layout.tsx
<body className={`${heebo.variable} ${rubik.variable}`}>
```

### Font Subsetting

If using self-hosted fonts (not next/font/google):
```
Subset to include:
  - Hebrew characters (U+0590-U+05FF)
  - Hebrew presentation forms (U+FB1D-U+FB4F)
  - Latin basic (U+0000-U+007F) - for numbers, English words
  - Latin-1 supplement (U+0080-U+00FF) - for accented characters
  - Common punctuation and symbols

Tool: glyphhanger or fonttools for subsetting
Expected reduction: 60-80% file size reduction
```

---

## 4. Bundle Optimization

### Code Splitting

```typescript
// Dynamic imports for below-fold sections
import dynamic from 'next/dynamic'

// Only load heavy components when needed
const TestimonialsCarousel = dynamic(
  () => import('@/components/sections/Testimonials'),
  {
    loading: () => <TestimonialsSkeleton />,
    ssr: true  // Still SSR for SEO
  }
)

const FAQAccordion = dynamic(
  () => import('@/components/sections/FAQ'),
  { ssr: true }
)

const ContactForm = dynamic(
  () => import('@/components/sections/ContactForm'),
  {
    loading: () => <ContactFormSkeleton />,
    ssr: true
  }
)
```

### Tree Shaking

```typescript
// DO: Import specific functions
import { motion } from 'framer-motion'  // Only what you use

// DO NOT: Import entire libraries
// import _ from 'lodash'  // Imports entire lodash
import debounce from 'lodash/debounce'  // Import only debounce

// Verify tree shaking works:
// Run: npx next build && npx @next/bundle-analyzer
```

### Bundle Analysis

```bash
# Add to next.config.js for analysis
# npm install @next/bundle-analyzer

# Run analysis build:
# ANALYZE=true npx next build
```

```typescript
// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer({
  // ... config
})
```

---

## 5. Critical CSS

### Inline Above-Fold Styles

Next.js with Tailwind CSS handles critical CSS extraction automatically in production builds. Verify by checking:

1. View page source in production
2. Look for `<style>` tags in `<head>` with critical styles
3. Remaining CSS loaded asynchronously

### Manual Critical CSS (if needed)

```html
<!-- Inline critical CSS for above-fold content -->
<style>
  /* Hero section styles, navigation, primary typography */
  /* Keep under 14KB (fits in first TCP packet) */
</style>

<!-- Defer non-critical CSS -->
<link rel="preload" href="/styles/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/styles/main.css"></noscript>
```

### Tailwind CSS Purge Verification

```typescript
// tailwind.config.ts - ensure content paths are correct
content: [
  './src/**/*.{js,ts,jsx,tsx,mdx}',
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
],
// This ensures unused Tailwind classes are purged in production
// Verify: production CSS should be < 50KB
```

---

## 6. Next.js Specific Optimizations

### Incremental Static Regeneration (ISR) for CMS Content

```typescript
// app/page.tsx (App Router)
export const revalidate = 3600 // Revalidate every hour

// Or use on-demand revalidation from Payload CMS webhook
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  revalidatePath('/')
  return NextResponse.json({ revalidated: true })
}
```

### next/image Configuration

```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
}
```

### next/font Usage
See Font Loading section above. Always use `next/font/google` or `next/font/local` --- never load fonts via `<link>` tags or CSS `@import`.

---

## 7. Payload CMS Specific Optimizations

### Local API Calls (Server-Side, No Waterfall)

```typescript
// Payload 3.x Local API - runs on the server, no HTTP overhead
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getPageData() {
  const payload = await getPayload({ config: configPromise })

  // These run server-side with direct database access
  // No network waterfall, no REST API overhead
  const [hero, features, testimonials, faq] = await Promise.all([
    payload.findGlobal({ slug: 'hero' }),
    payload.find({ collection: 'features', limit: 6 }),
    payload.find({ collection: 'testimonials', limit: 3 }),
    payload.find({ collection: 'faq', limit: 10 }),
  ])

  return { hero, features, testimonials, faq }
}
```

### Avoid Client-Side Data Fetching

```typescript
// DO: Fetch in Server Components (RSC)
// app/page.tsx
export default async function Page() {
  const data = await getPageData() // Server-side, no client JS
  return <LandingPage data={data} />
}

// DO NOT: Fetch in Client Components
// This creates waterfall and adds JS bundle size
// 'use client'
// const { data } = useSWR('/api/page-data', fetcher)  // BAD
```

### Payload Image Handling

```typescript
// Payload 3.x upload configuration for optimized images
// collections/Media.ts
import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: '../public/media',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 512, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'טקסט חלופי (Alt Text)',
    },
  ],
}
```

---

## 8. SEO Checklist

### Title Tag
```
Requirements:
  - Under 60 characters (Hebrew characters count the same)
  - Include primary keyword in Hebrew
  - Include business name
  - Format: "[Primary keyword] | [Business Name]"

Example:
  "עורך דין תעבורה בתל אביב | משרד כהן ושות'"
  "מסעדת שף איטלקית בהרצליה | לה פיאצה"
```

### Meta Description
```
Requirements:
  - Under 160 characters
  - Include primary and secondary keywords in Hebrew
  - Include a call to action
  - Compelling enough to increase CTR from SERP

Example:
  "עו״ד תעבורה מומחה עם 15 שנות ניסיון. ייעוץ ראשוני חינם. ביטול רישיונות, דוחות תנועה,
   תאונות דרכים. צרו קשר עכשיו ← 03-1234567"
```

### Open Graph Tags
```html
<meta property="og:title" content="[Title in Hebrew]" />
<meta property="og:description" content="[Description in Hebrew]" />
<meta property="og:image" content="[Absolute URL to OG image, 1200x630]" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="[Image description in Hebrew]" />
<meta property="og:url" content="[Canonical URL]" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="he_IL" />
<meta property="og:site_name" content="[Business Name]" />
```

### Sitemap.xml
```typescript
// app/sitemap.ts (Next.js App Router)
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.co.il'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Add additional pages as needed
  ]
}
```

### robots.txt
```typescript
// app/robots.ts (Next.js App Router)
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.co.il'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

### Schema Markup Implementation
```typescript
// app/layout.tsx or page.tsx
export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: '[Business Name]',
    // ... full schema from Phase 4
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    // ... FAQ schema from Phase 4
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Page content */}
    </>
  )
}
```

### Canonical URL
```html
<link rel="canonical" href="https://example.co.il/" />
```

### hreflang Tags (Hebrew)
```html
<link rel="alternate" hreflang="he" href="https://example.co.il/" />
<link rel="alternate" hreflang="x-default" href="https://example.co.il/" />
```

### Heading Hierarchy
```
Rules:
  - ONE H1 per page (the hero headline)
  - H2 for section headings
  - H3 for sub-sections within H2 sections
  - Never skip levels (no H1 -> H3 without H2)
  - Headings should include keywords naturally (not keyword-stuffed)

Structure:
  H1: [Hero headline - primary keyword]
  H2: [Problem section heading]
  H2: [Solution section heading]
    H3: [Feature 1]
    H3: [Feature 2]
  H2: [Testimonials heading]
  H2: [FAQ heading] ("שאלות נפוצות")
    H3: [Each question can be H3 if using heading markup]
  H2: [CTA section heading]
```

### Full SEO Meta Implementation

```typescript
// app/layout.tsx or app/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '[Primary Keyword] | [Business Name]',
  description: '[Meta description in Hebrew, under 160 chars]',
  openGraph: {
    title: '[OG Title in Hebrew]',
    description: '[OG Description in Hebrew]',
    url: 'https://example.co.il',
    siteName: '[Business Name]',
    images: [
      {
        url: 'https://example.co.il/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '[Image description in Hebrew]',
      },
    ],
    locale: 'he_IL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '[Title in Hebrew]',
    description: '[Description in Hebrew]',
    images: ['https://example.co.il/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://example.co.il',
    languages: {
      'he': 'https://example.co.il',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
```

---

## 9. Accessibility (WCAG 2.1 AA)

### Color Contrast

```
Requirements:
  - Normal text (< 18px): 4.5:1 contrast ratio minimum
  - Large text (>= 18px bold or >= 24px regular): 3:1 minimum
  - UI components and graphical objects: 3:1 minimum
  - Focus indicators: 3:1 against adjacent colors

Testing:
  - Use Chrome DevTools > Accessibility panel
  - Or browser extension: axe DevTools, WAVE
  - Verify EVERY text/background combination used on the page

Common Failures:
  - Light gray text on white background
  - White text on light-colored buttons
  - Placeholder text with insufficient contrast
  - Disabled state text that is unreadable
```

### Keyboard Navigation (RTL Specific)

```
Requirements:
  - All interactive elements reachable via Tab key
  - Tab order follows visual order (RTL: right to left, top to bottom)
  - Focus is visible on every interactive element
  - Escape closes modals/dropdowns
  - Enter/Space activates buttons and links
  - Arrow keys navigate within components (dropdowns, carousels)

RTL Tab Order:
  - Tab moves focus RIGHT to LEFT within a row
  - Tab moves TOP to BOTTOM between rows
  - Test: hold Tab and verify focus moves logically in RTL layout

Implementation:
  - Do NOT use tabindex > 0 (disrupts natural order)
  - Use tabindex="0" to add non-interactive elements to tab order (rare)
  - Use tabindex="-1" for programmatic focus management only
```

### Screen Reader Labels in Hebrew

```html
<!-- Navigation landmark -->
<nav aria-label="ניווט ראשי">

<!-- Main content landmark -->
<main aria-label="תוכן ראשי">

<!-- Form labels (always in Hebrew) -->
<label for="name">שם מלא</label>
<input id="name" type="text" aria-required="true" />

<label for="phone">טלפון</label>
<input id="phone" type="tel" aria-required="true" />

<!-- Buttons with clear purpose -->
<button aria-label="שלח טופס יצירת קשר">שלח/י הודעה</button>

<!-- Expandable FAQ items -->
<button
  aria-expanded="false"
  aria-controls="faq-answer-1"
>
  כמה זה עולה?
</button>
<div id="faq-answer-1" role="region" aria-hidden="true">
  [Answer content]
</div>

<!-- Carousel -->
<div role="region" aria-label="חוות דעת לקוחות" aria-roledescription="קרוסלה">
  <button aria-label="חוות דעת הבאה">→</button>
  <button aria-label="חוות דעת קודמת">←</button>
</div>

<!-- Image alt text (always in Hebrew) -->
<img alt="צוות המסעדה מכין ארוחה במטבח" />
<!-- NOT: alt="team cooking" or alt="image1" -->
```

### Focus Indicators

```css
/* Visible focus indicators */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-brand);
}

/* Remove default outline only if custom focus is provided */
*:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast focus for buttons */
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.2);
}
```

### Alt Text on All Images

```
Rules:
  - ALL images must have alt text in Hebrew
  - Decorative images: alt="" (empty, not missing)
  - Informative images: describe the content and purpose
  - Functional images (links/buttons): describe the action

Examples:
  Hero image:        alt="[Business name] - [what the image shows]"
  Team photo:        alt="צוות [business name] במשרד"
  Food photo:        alt="מנת פסטה ברוטב עגבניות של השף"
  Service icon:      alt="" (decorative, text nearby explains)
  Testimonial photo: alt="[person name], [role]"
  Logo:              alt="לוגו [business name]"
```

### Form Accessibility

```html
<!-- Every form field needs: -->
<!-- 1. Associated label -->
<!-- 2. Error messages linked via aria-describedby -->
<!-- 3. Required fields marked with aria-required -->

<form aria-label="טופס יצירת קשר" novalidate>
  <div>
    <label for="contact-name">שם מלא *</label>
    <input
      id="contact-name"
      type="text"
      aria-required="true"
      aria-invalid="false"
      aria-describedby="name-error"
    />
    <span id="name-error" role="alert" aria-live="polite">
      <!-- Error message appears here -->
    </span>
  </div>

  <div>
    <label for="contact-phone">מספר טלפון *</label>
    <input
      id="contact-phone"
      type="tel"
      aria-required="true"
      aria-describedby="phone-error"
      inputmode="tel"
      dir="ltr"  <!-- Phone numbers are LTR even in RTL page -->
    />
    <span id="phone-error" role="alert" aria-live="polite"></span>
  </div>

  <button type="submit">שלח/י הודעה</button>
</form>
```

### Skip Navigation Link

```html
<!-- First element in <body> -->
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded"
>
  דלג/י לתוכן הראשי
</a>

<!-- Main content target -->
<main id="main-content" tabindex="-1">
  <!-- Page content -->
</main>
```

### Reduced Motion

```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 10. Cross-Browser Testing Checklist

### Priority Devices and Browsers

| Priority | Device/Browser | What to Test |
|----------|---------------|--------------|
| **P0** | iPhone Safari (latest) | RTL layout, fonts, forms, scroll behavior |
| **P0** | Chrome Android (latest) | RTL layout, fonts, forms, touch targets |
| **P0** | Desktop Chrome (latest) | Full functionality, all breakpoints |
| **P1** | Desktop Firefox (latest) | RTL rendering, font differences |
| **P1** | Desktop Safari (Mac) | Font rendering, smooth scroll |
| **P2** | Desktop Edge (latest) | Should match Chrome (same engine) |
| **P2** | Samsung Internet | Popular in Israel, check RTL |

### Breakpoint Testing

| Breakpoint | Width | Represents |
|------------|-------|------------|
| **xs** | 320px | iPhone SE, smallest phones |
| **sm** | 375px | iPhone 12/13/14 standard |
| **md** | 768px | iPad portrait, large phones landscape |
| **lg** | 1024px | iPad landscape, small laptops |
| **xl** | 1440px | Standard desktop monitors |

### Testing Checklist Per Breakpoint

```
For EACH breakpoint, verify:

Layout:
  [ ] RTL direction is correct (text right-aligned, layout mirrored)
  [ ] No horizontal overflow (no horizontal scrollbar)
  [ ] All sections visible and properly stacked
  [ ] Images scale correctly (no stretching or cropping issues)
  [ ] Grid layouts collapse properly on smaller screens

Typography:
  [ ] Hebrew text is readable at all sizes
  [ ] No text overflow or truncation
  [ ] Line lengths are comfortable (not too wide on desktop, not too narrow on mobile)
  [ ] Font weights render correctly

Navigation:
  [ ] Mobile menu works (opens, closes, animations smooth)
  [ ] Desktop nav links are aligned correctly (RTL)
  [ ] Active state visible
  [ ] Logo links to top/home

Interactive Elements:
  [ ] Buttons are large enough for touch (minimum 44x44px)
  [ ] Forms are usable (input fields, dropdowns, submit)
  [ ] FAQ accordion opens/closes correctly
  [ ] Carousel/slider works with touch and mouse
  [ ] Phone number is clickable (tel: link) on mobile

Performance:
  [ ] Images load lazily below the fold
  [ ] Hero image loads quickly (LCP)
  [ ] No layout shifts during load (CLS)
  [ ] Smooth scrolling
  [ ] Animations are smooth (no jank)
```

### RTL-Specific Browser Issues to Watch

```
Common RTL Issues:
  1. Scrollbar position (should be on left side in RTL)
  2. CSS logical properties not supported in older browsers
     - Use margin-inline-start instead of margin-right for RTL
  3. Flexbox direction: row defaults to RTL when dir="rtl"
     - Make sure flex items appear in intended order
  4. Absolute/fixed positioning: right/left may need swapping
     - Prefer inset-inline-start/end (CSS logical properties)
  5. Border-radius: if asymmetric, corners may need swapping
  6. Background-position: percentages flip in RTL
  7. Transform: translateX values need negating for RTL animations
  8. Input fields with type="tel" or type="email": should have dir="ltr"
```

---

## 11. Full Optimization Checklist

### Performance
- [ ] All images converted to WebP/AVIF with fallbacks
- [ ] Responsive srcset implemented for all images
- [ ] Above-fold images use `priority` (no lazy load)
- [ ] Below-fold images lazy loaded
- [ ] Blur placeholders for all images
- [ ] Hebrew fonts preloaded (critical weights only)
- [ ] Font-display: swap on all @font-face rules
- [ ] Fonts subsetted to Hebrew + Latin characters
- [ ] JavaScript bundle under 150KB (gzipped)
- [ ] Code splitting for below-fold sections
- [ ] Tree shaking verified (no unused imports)
- [ ] CSS purged (unused Tailwind classes removed)
- [ ] Critical CSS inlined for above-fold content
- [ ] No render-blocking resources
- [ ] ISR configured for CMS content
- [ ] Payload Local API used (no client-side data fetching)
- [ ] Lighthouse Performance: 90+ (target 100)

### SEO
- [ ] Title tag: under 60 chars, Hebrew, includes primary keyword
- [ ] Meta description: under 160 chars, Hebrew, includes CTA
- [ ] OG tags complete: title, description, image (1200x630), locale he_IL
- [ ] Twitter card tags configured
- [ ] Sitemap.xml generated and valid
- [ ] robots.txt configured (allow /, disallow /admin/ and /api/)
- [ ] Schema markup: LocalBusiness + FAQPage + BreadcrumbList (+ Service if applicable)
- [ ] Canonical URL set
- [ ] hreflang="he" tag present
- [ ] H1: exactly one per page, contains primary keyword
- [ ] Heading hierarchy: H1 > H2 > H3 (no skips)
- [ ] All images have Hebrew alt text
- [ ] Internal links use descriptive anchor text
- [ ] No broken links (404s)
- [ ] Lighthouse SEO: 90+ (target 100)

### Accessibility
- [ ] Color contrast: 4.5:1 minimum for all text
- [ ] Color contrast: 3:1 for large text and UI components
- [ ] Keyboard navigation: all interactive elements reachable via Tab
- [ ] Tab order follows RTL visual order
- [ ] Focus indicators visible on all interactive elements
- [ ] Screen reader labels in Hebrew (aria-label, aria-describedby)
- [ ] All images have alt text (Hebrew for content images, empty for decorative)
- [ ] Form fields have associated labels
- [ ] Form errors announced via aria-live
- [ ] Skip navigation link present
- [ ] Reduced motion respected (prefers-reduced-motion)
- [ ] Touch targets: minimum 44x44px
- [ ] No ARIA misuse (correct roles, states, properties)
- [ ] Page language: lang="he" on html element
- [ ] Lighthouse Accessibility: 90+ (target 100)

### Cross-Browser / Responsive
- [ ] iPhone Safari: RTL layout correct, forms work, fonts render
- [ ] Chrome Android: RTL layout correct, touch interactions work
- [ ] Desktop Chrome: all features work at all breakpoints
- [ ] Desktop Firefox: RTL rendering correct, fonts match
- [ ] 320px: no horizontal overflow, content readable
- [ ] 375px: mobile layout clean and usable
- [ ] 768px: tablet layout transitions correctly
- [ ] 1024px: desktop layout active
- [ ] 1440px: content properly contained, not too wide

### Core Web Vitals
- [ ] LCP < 2.5s (test on mobile 3G simulation)
- [ ] INP < 200ms (test all interactive elements)
- [ ] CLS < 0.1 (verify no layout shifts during load)
- [ ] TTFB < 800ms (server response time)
- [ ] FCP < 1.8s (first meaningful content visible)

---

## 12. Optimization Tools

### Testing Tools

| Tool | Purpose | How to Use |
|------|---------|------------|
| **Lighthouse** (Chrome DevTools) | All-in-one audit | F12 > Lighthouse tab > Generate report |
| **PageSpeed Insights** | Real-world Core Web Vitals | pagespeed.web.dev |
| **WebPageTest** | Detailed waterfall analysis | webpagetest.org |
| **axe DevTools** | Accessibility testing | Browser extension |
| **WAVE** | Accessibility visualization | wave.webaim.org |
| **Contrast Checker** | Color contrast ratios | webaim.org/resources/contrastchecker |
| **BrowserStack** | Cross-browser testing | browserstack.com |
| **Schema Validator** | Structured data testing | validator.schema.org or Google Rich Results Test |
| **next/bundle-analyzer** | JS bundle analysis | npm package |

### Performance Monitoring

```typescript
// Add Web Vitals reporting
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Automated Testing Script

```bash
# Run Lighthouse CI in CI/CD pipeline
npx @lhci/cli autorun --config=lighthouserc.json
```

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

---

## Phase 6 Completion Criteria

The optimization phase is complete when:

1. **Lighthouse scores:** All four categories at 90+ (screenshot as proof)
2. **Core Web Vitals:** LCP < 2.5s, INP < 200ms, CLS < 0.1
3. **Accessibility:** No axe DevTools errors, keyboard navigation verified
4. **SEO:** All checklist items verified, schema validated
5. **Cross-browser:** Tested on all P0 and P1 devices/browsers
6. **All breakpoints:** Verified at 320px, 375px, 768px, 1024px, 1440px

Present final scores to operator via AskUserQuestion:

```
Optimization complete for [Client Name] landing page:

Lighthouse Scores:
  - Performance:    [score]/100
  - Accessibility:  [score]/100
  - Best Practices: [score]/100
  - SEO:            [score]/100

Core Web Vitals:
  - LCP: [value]s (target: < 2.5s)
  - INP: [value]ms (target: < 200ms)
  - CLS: [value] (target: < 0.1)

Cross-browser: Tested on [list of devices/browsers]

Any areas you want me to investigate further or specific optimizations to prioritize?
```
