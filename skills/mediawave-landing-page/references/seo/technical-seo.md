# Technical SEO for Next.js Landing Pages
## Israel-Focused Implementation Guide
### Last Updated: March 2026

---

## Table of Contents

1. [Crawlability & Rendering](#1-crawlability--rendering)
2. [Core Web Vitals Targets](#2-core-web-vitals-targets)
3. [Sitemap Generation](#3-sitemap-generation)
4. [robots.txt Configuration](#4-robotstxt-configuration)
5. [AI Crawler Rules](#5-ai-crawler-rules)
6. [Canonical Tags](#6-canonical-tags)
7. [SSL/HTTPS on Vercel](#7-sslhttps-on-vercel)
8. [Mobile-First Indexing](#8-mobile-first-indexing)
9. [Page Speed Optimization](#9-page-speed-optimization)
10. [Structured Data Validation](#10-structured-data-validation)
11. [hreflang Tags](#11-hreflang-tags)
12. [llms.txt Implementation](#12-llmstxt-implementation)
13. [IndexNow: Instant Indexing](#13-indexnow-instant-indexing)
14. [Server-Side Rendering for SEO](#14-server-side-rendering-for-seo)

---

## 1. Crawlability & Rendering

### Next.js SSG vs SSR for Landing Pages

For Israeli small business landing pages, **Static Site Generation (SSG)** is the preferred approach:

| Approach | SEO Impact | Use Case |
|----------|-----------|----------|
| **SSG (Static)** | Best - pre-rendered HTML, fastest TTFB | Landing pages with infrequent content changes |
| **SSR (Server)** | Good - fresh content per request, slightly slower TTFB | Pages with dynamic/personalized content |
| **ISR (Incremental)** | Good - static + periodic regeneration | Landing pages updated via CMS |
| **CSR (Client)** | Poor - Google may not index content | Never use for SEO-critical content |

### Ensuring Google Renders the Page

1. **Use `generateStaticParams` or SSG** for the main landing page
2. **Avoid client-only content**: Critical SEO content (H1, meta, schema) MUST be in the initial HTML response
3. **Test rendering**: Use Google Search Console's URL Inspection > "View Tested Page" to see what Google actually sees
4. **Check for hydration mismatches**: RTL/Hebrew content can cause mismatches if `dir="rtl"` and `lang="he"` aren't set server-side

### Pre-rendering Verification Checklist

```bash
# View the raw HTML Google sees (no JS execution)
curl -s https://your-domain.co.il | grep -i "<h1\|<title\|<meta name=\"description"

# Or use Chrome DevTools:
# 1. Open page > View Source (Ctrl+U): this is what crawlers see initially
# 2. Compare with Inspect Element (F12): this is after JS execution
# 3. They should be identical for SSG/SSR pages
```

### Common Crawlability Issues with Next.js

- **Dynamic imports with `ssr: false`**: Content inside won't be in initial HTML
- **useEffect-only content**: Anything fetched only in useEffect is invisible to crawlers
- **Conditional rendering based on window**: `typeof window !== 'undefined'` guards hide content from SSR
- **Image alt text in state**: Ensure alt text is in the static HTML, not loaded dynamically

---

## 2. Core Web Vitals Targets

### Target Metrics (March 2026)

| Metric | Good | Needs Improvement | Poor | Our Target |
|--------|------|-------------------|------|------------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s - 4.0s | > 4.0s | **≤ 1.8s** |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200ms - 500ms | > 500ms | **≤ 100ms** |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 - 0.25 | > 0.25 | **≤ 0.05** |

### LCP Optimization (Next.js + Tailwind)

The LCP element on landing pages is typically the **hero image** or **hero heading**.

```tsx
// Hero image: use Next.js Image with priority
import Image from 'next/image';

<Image
  src="/hero-bakery.webp"
  alt="מאפיית הבית ברחובות - לחם טרי כל יום"
  width={1200}
  height={600}
  priority          // Preloads above-the-fold image
  sizes="100vw"     // Full-width hero
  quality={85}      // Balance quality vs size
  placeholder="blur" // Show blur while loading
  blurDataURL="..."  // Base64 blur placeholder
/>
```

**Key LCP strategies:**
- Use `priority` prop on hero image (adds `<link rel="preload">`)
- Serve images in WebP/AVIF format (Next.js Image does this automatically)
- Set explicit `width` and `height` to prevent layout shift
- Preload hero fonts in `layout.tsx`:
  ```tsx
  // app/layout.tsx
  import { Heebo } from 'next/font/google';

  const heebo = Heebo({
    subsets: ['hebrew', 'latin'],
    display: 'swap',        // Prevents FOIT
    preload: true,
    weight: ['400', '500', '700'],
  });
  ```
- Inline critical CSS (Tailwind + Next.js handles this well with built-in CSS optimization)

### INP Optimization

For landing pages, INP issues typically come from:

1. **Click handlers on CTA buttons**: Keep event handlers lightweight
2. **Form submissions**: Use optimistic UI updates
3. **Scroll-triggered animations**: Use CSS animations or `will-change` instead of JS-driven animations
4. **Third-party scripts**: Defer non-critical scripts (analytics, chat widgets)

```tsx
// Defer third-party scripts
import Script from 'next/script';

<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"
  strategy="afterInteractive"  // Load after page is interactive
/>

// For chat widgets, use lazyOnload
<Script
  src="https://widget.example.com/chat.js"
  strategy="lazyOnload"  // Load when browser is idle
/>
```

### CLS Optimization

Common CLS causes on Hebrew landing pages:

1. **Font swap from Latin to Hebrew**: Pre-declare font dimensions
2. **Images without dimensions**: Always set width/height
3. **Dynamic content injection**: Reserve space for dynamic elements
4. **RTL layout shifts**: Test that RTL doesn't cause unexpected reflows

```tsx
// Reserve space for elements that load dynamically
// Example: Google Maps embed
<div className="w-full aspect-[16/9] bg-gray-100">
  {/* Map loads here - space is reserved */}
  <iframe
    loading="lazy"
    src="https://www.google.com/maps/embed?..."
    className="w-full h-full"
    title="מיקום העסק במפה"
  />
</div>

// Reserve space for testimonial carousel
<div className="min-h-[300px]">
  <TestimonialSlider />
</div>
```

---

## 3. Sitemap Generation

### Next.js App Router sitemap.ts

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.example.co.il';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // If there are additional pages (privacy, terms, etc.)
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2026-01-15'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2026-01-15'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
```

This auto-generates `/sitemap.xml` at build time.

### For Multi-Language Sites

```typescript
// app/sitemap.ts - with hreflang alternates
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.example.co.il';

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: {
          he: `${baseUrl}`,
          en: `${baseUrl}/en`,
        },
      },
    },
  ];
}
```

---

## 4. robots.txt Configuration

### Next.js App Router robots.ts

```typescript
// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.example.co.il';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',        // Block API routes
          '/_next/',      // Block Next.js internals
          '/admin/',      // Block admin if exists
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

This generates `/robots.txt` at build time.

---

## 5. AI Crawler Rules

### Understanding AI Crawlers (2026)

| Crawler | Company | Purpose | Recommendation |
|---------|---------|---------|---------------|
| **Googlebot** | Google | Search indexing + AI Overviews | Always ALLOW |
| **OAI-SearchBot** | OpenAI | ChatGPT Search (brings traffic) | ALLOW |
| **ChatGPT-User** | OpenAI | ChatGPT browsing (user-initiated) | ALLOW |
| **PerplexityBot** | Perplexity | AI search (brings traffic + citations) | ALLOW |
| **GPTBot** | OpenAI | AI training data collection | BLOCK (optional) |
| **ClaudeBot** | Anthropic | AI training data collection | BLOCK (optional) |
| **CCBot** | Common Crawl | Training data for many AI models | BLOCK (optional) |
| **Bytespider** | ByteDance | TikTok AI training | BLOCK |
| **Google-Extended** | Google | Gemini training (not search) | BLOCK (optional) |

### Extended robots.ts with AI Rules

```typescript
// app/robots.ts: with AI crawler rules
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.example.co.il';

  return {
    rules: [
      // Standard search crawlers: ALLOW
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
      // AI Search crawlers (bring traffic via citations): ALLOW
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      // AI Training crawlers (no traffic benefit): BLOCK
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'Bytespider',
        disallow: '/',
      },
      {
        userAgent: 'Google-Extended',
        disallow: '/',
      },
      // Default: allow everything else
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

### Why This Strategy

- **AI search bots (OAI-SearchBot, PerplexityBot)** bring traffic by citing your business in search answers. Blocking them means your business won't appear in AI search results.
- **AI training bots (GPTBot, ClaudeBot)** scrape content for model training but don't bring traffic. Blocking them protects your content without losing visibility.
- **Note**: robots.txt is advisory, not enforced. But reputable AI companies respect it.

---

## 6. Canonical Tags

### Implementation in Next.js App Router

```typescript
// app/layout.tsx or app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.example.co.il',
  },
};
```

### www vs non-www

**Choose ONE and redirect the other.** For Israeli sites, `www` is slightly more common but either works.

On Vercel:
1. Go to Project Settings > Domains
2. Add both `example.co.il` and `www.example.co.il`
3. Set one as primary (recommended: `www.example.co.il`)
4. Vercel auto-redirects the other with 308

### Trailing Slashes

Next.js by default does NOT use trailing slashes. Keep it consistent:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,  // Use https://example.co.il/page NOT /page/
};

module.exports = nextConfig;
```

### Self-Referencing Canonicals

Every page should have a canonical tag pointing to itself. This prevents duplicate content issues from:
- URL parameters (e.g., `?utm_source=...`)
- www vs non-www
- HTTP vs HTTPS
- Trailing slash variations

---

## 7. SSL/HTTPS on Vercel

### Automatic SSL

Vercel provides **free automatic SSL** for all deployments:
- Auto-provisions Let's Encrypt certificates
- Auto-renews before expiration
- Supports custom domains

### Verification for Custom Domains

After connecting a `.co.il` domain:

1. **Check HTTPS redirect**: Visit `http://example.co.il`; it should redirect to `https://`
2. **Check certificate**: Click the lock icon in browser and verify it shows your domain
3. **Mixed content**: Ensure no resources load over HTTP (check Console for warnings)
4. **HSTS**: Vercel sets `Strict-Transport-Security` header automatically

```bash
# Verify SSL and redirect
curl -I http://example.co.il
# Should show: HTTP/1.1 308 Permanent Redirect
# Location: https://example.co.il/
```

---

## 8. Mobile-First Indexing

### Why It's Critical for Israel

- **58% of Israeli searches** happen on mobile devices
- Google uses **mobile-first indexing**: the mobile version of your page is what gets indexed
- Israeli users expect fast, thumb-friendly experiences
- WhatsApp sharing (extremely popular in Israel) always opens on mobile

### Mobile Optimization Requirements

1. **Responsive design**: Tailwind handles this with `sm:`, `md:`, `lg:` breakpoints
2. **Touch targets**: Minimum 44x44px for buttons (especially CTA buttons and phone links)
3. **Viewport meta tag**: Next.js sets this automatically
4. **No horizontal scroll**: Test with Chrome DevTools mobile emulation
5. **Readable text**: Minimum 16px font size for Hebrew body text (Hebrew is denser than Latin)
6. **Click-to-call**: Use `tel:` links for phone numbers
   ```html
   <a href="tel:+972-50-1234567" dir="ltr">050-123-4567</a>
   ```

### Verification Steps

1. **Google Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
2. **Chrome DevTools**: F12 > Toggle Device Toolbar > Test iPhone SE, Pixel 7, iPad
3. **Google Search Console**: Mobile Usability report
4. **Real device testing**: Test on actual Israeli-popular devices (Samsung Galaxy, iPhone)

### Hebrew-Specific Mobile Issues

- **RTL overflow**: Long Hebrew words without `overflow-wrap: break-word` can cause horizontal scroll
- **Mixed direction content**: Phone numbers and URLs in Hebrew text need `dir="ltr"` spans
- **Keyboard input**: Hebrew keyboard is wider, so test form inputs on mobile

```css
/* Prevent RTL overflow */
.hebrew-content {
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
}
```

---

## 9. Page Speed Optimization

### Integration with pagespeed-optimizer and site-gate-audit

- **site-gate-audit** verifies speed before any client site ships: Lighthouse mobile on every route plus lab Core Web Vitals, inside its ten production gates (no-JS content, AI-crawler access, WCAG AA, structured data, RTL and more). Its targets are stricter than the table below; when they differ, follow site-gate-audit.
- **pagespeed-optimizer** runs a systematic 6-phase optimization with Lighthouse verification after each phase. It is written for React/Vite sites such as mediawave.co.il; do not run it on Next.js or Astro: use the quick wins below and verify with site-gate-audit.

### Quick Wins for Next.js Landing Pages

1. **Images**: Use Next.js `<Image>` component with WebP/AVIF
2. **Fonts**: Use `next/font` with `display: 'swap'` and subset to `hebrew` + `latin`
3. **Third-party scripts**: Use `next/script` with `afterInteractive` or `lazyOnload`
4. **CSS**: Tailwind purges unused CSS automatically at build time
5. **Bundle size**: Use dynamic imports for below-the-fold components

```tsx
// Lazy load below-the-fold sections
import dynamic from 'next/dynamic';

const Testimonials = dynamic(() => import('@/components/Testimonials'), {
  loading: () => <div className="min-h-[400px] bg-gray-50" />,
});

const FAQ = dynamic(() => import('@/components/FAQ'), {
  loading: () => <div className="min-h-[300px]" />,
});

const ContactForm = dynamic(() => import('@/components/ContactForm'), {
  ssr: true,  // Keep SSR for SEO (form has structured data)
});
```

### Target Scores (Lighthouse)

| Category | Minimum | Target |
|----------|---------|--------|
| Performance | 90 | 95+ |
| Accessibility | 90 | 95+ |
| Best Practices | 90 | 95+ |
| SEO | 95 | 100 |

---

## 10. Structured Data Validation

### Testing Tools

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
   - Tests if your structured data qualifies for rich results
   - Shows warnings and errors
   - Supports both URL and code snippet testing

2. **Schema.org Validator**: https://validator.schema.org/
   - Validates JSON-LD syntax against Schema.org specification
   - More strict than Google's tool
   - Catches schema violations Google might ignore

3. **Google Search Console > Enhancements**:
   - Shows structured data issues for already-indexed pages
   - Tracks rich result eligibility over time

### Validation Process

```
1. Build page with schema markup
2. Test with Rich Results Test (paste URL or HTML)
3. Fix any errors (red) and warnings (yellow)
4. Validate with Schema.org Validator for strict compliance
5. Deploy and monitor in Search Console
```

### Common Schema Issues with Hebrew Content

- **Name/description in Hebrew**: Valid, Google supports Hebrew in all text fields
- **Phone number format**: Use international format `+972-X-XXX-XXXX`
- **Address format**: Use Hebrew address with `addressCountry: "IL"`
- **Opening hours**: Use ISO 8601 format, Israel timezone (UTC+2/+3)
- **Price currency**: Use `ILS` for Israeli Shekel

---

## 11. hreflang Tags

### Implementation for Hebrew Sites

For a landing page that's primarily Hebrew with an optional English version:

```typescript
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.example.co.il',
    languages: {
      'he': 'https://www.example.co.il',
      'en': 'https://www.example.co.il/en',
      'x-default': 'https://www.example.co.il',  // Default = Hebrew
    },
  },
};
```

This generates:
```html
<link rel="alternate" hreflang="he" href="https://www.example.co.il" />
<link rel="alternate" hreflang="en" href="https://www.example.co.il/en" />
<link rel="alternate" hreflang="x-default" href="https://www.example.co.il" />
```

### hreflang Rules

- **`x-default`**: Points to the default language version (usually Hebrew for Israeli businesses)
- **Must be bidirectional**: If page A points to page B with hreflang, page B must point back to page A
- **Use in sitemap too**: The sitemap.ts example in Section 3 shows how

### For Hebrew-Only Sites

If the landing page is Hebrew only (most common case):

```typescript
// No hreflang needed for single-language sites
// Just set the lang attribute correctly:
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      {/* ... */}
    </html>
  );
}
```

---

## 12. llms.txt Implementation

### What is llms.txt?

`llms.txt` is a proposed standard (llmstxt.org) that provides a structured, markdown-formatted file at `/llms.txt` to help LLMs understand your site quickly. Think of it as a "README for AI", useful for getting your business cited correctly in AI search answers.

### File Format

```markdown
# Business Name - מאפיית הבית

> מאפיית הבית היא מאפייה בוטיק ברחובות המתמחה בלחם מחמצת, מאפים טריים ועוגות בהזמנה.

## About
- **Location**: רחובות, ישראל
- **Services**: מאפייה בוטיק: לחם, מאפים, עוגות
- **Phone**: 050-123-4567
- **Hours**: Sunday-Thursday 07:00-19:00, Friday 07:00-14:00

## Key Information
- Family-owned bakery since 2015
- All products baked fresh daily on premises
- Specializes in sourdough bread and custom cakes
- Delivery available in Rehovot area
- Kosher certified (Rabbanut Rehovot)

## Links
- [Website](https://www.example.co.il)
- [Google Maps](https://maps.google.com/...)
- [Menu](https://www.example.co.il/#menu)

## Optional
- [Full llms-full.txt](https://www.example.co.il/llms-full.txt): Extended information including full menu and pricing
```

### Next.js Implementation

Place as a static file in the `public/` directory:

```
public/
  llms.txt          # Main LLM-readable file
  llms-full.txt     # Optional: extended version with more detail
```

These are automatically served at:
- `https://www.example.co.il/llms.txt`
- `https://www.example.co.il/llms-full.txt`

### Why It Matters for Israeli Businesses

- AI search (ChatGPT Search, Perplexity) increasingly answers local queries
- Having structured information helps AI cite your business correctly
- Prevents AI hallucination about your business details (wrong hours, wrong location)
- Early adoption advantage: most Israeli businesses don't have this yet

---

## 13. IndexNow: Instant Indexing

### What is IndexNow?

IndexNow is a protocol that lets you instantly notify search engines when content changes. Supported by **Bing, Yandex, Seznam, and Naver** (not Google; Google has its own Indexing API).

### Why Use It for Landing Pages

- New landing page gets indexed within minutes instead of days/weeks
- Content updates are reflected faster
- Free, no API quota for small sites

### Implementation

#### 1. Generate an API Key

```bash
# Generate a random key (any hex string works)
# Use this same key in your code and verification file
```

#### 2. Add Verification File

```
public/
  {your-api-key}.txt    # Contains just the API key
```

The file content is just the key itself:
```
abc123def456
```

#### 3. Submit URLs After Deployment

```typescript
// scripts/indexnow.ts: run after deployment
const INDEXNOW_KEY = 'your-api-key-here';
const SITE_URL = 'https://www.example.co.il';

async function submitToIndexNow() {
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'www.example.co.il',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: [
        SITE_URL,
        `${SITE_URL}/sitemap.xml`,
      ],
    }),
  });

  console.log(`IndexNow response: ${response.status}`);
  // 200 = OK, 202 = Accepted
}

submitToIndexNow();
```

#### 4. Run After Each Deployment

```json
// package.json
{
  "scripts": {
    "postdeploy": "tsx scripts/indexnow.ts"
  }
}
```

### Google Indexing Alternative

For Google, submit the URL via Google Search Console:
1. URL Inspection tool > Enter URL > Request Indexing
2. Or submit sitemap in Search Console > Sitemaps

---

## 14. Server-Side Rendering for SEO

### Why SSR/SSG Matters More Than Ever

**AI crawlers generally cannot execute JavaScript.** Unlike Googlebot (which has a full Chrome renderer), most AI crawlers fetch only the raw HTML response:

| Crawler | JavaScript Execution |
|---------|---------------------|
| Googlebot | Yes (full Chrome rendering) |
| Bingbot | Yes (limited) |
| OAI-SearchBot | No |
| PerplexityBot | No |
| GPTBot | No |
| ClaudeBot | No |

**Implication**: If your content is rendered client-side (CSR), AI search engines won't see it. Your business won't be cited in AI answers.

### Next.js SSG Guarantees

With Next.js App Router using default Server Components:

```tsx
// app/page.tsx: This is a Server Component by default
// All content is in the HTML response, no JS needed to render

export default function HomePage() {
  return (
    <main dir="rtl" lang="he">
      <h1>מאפיית הבית ברחובות</h1>
      <p>מאפייה בוטיק המתמחה בלחם מחמצת טרי ומאפים ביתיים</p>
      {/* This content is in the HTML: all crawlers can read it */}
    </main>
  );
}
```

### What to Keep Server-Side

| Content | Render | Why |
|---------|--------|-----|
| Business name, description | Server | Must be crawlable |
| Schema/JSON-LD | Server | Must be in HTML |
| Meta tags | Server | Must be in HTML |
| Headings (H1-H6) | Server | SEO signals |
| Core page content | Server | Crawlability |
| Contact information | Server | Crawlable + schema |
| Testimonials | Server | Social proof for AI answers |
| FAQ content | Server | AI frequently cites FAQs |
| Interactive animations | Client OK | Not SEO-critical |
| Form submission logic | Client OK | Behavior, not content |
| Analytics/tracking | Client OK | Not crawled |

### Testing What Crawlers See

```bash
# Fetch page without JS execution (like AI crawlers)
curl -s https://www.example.co.il | head -200

# Check if critical content is in raw HTML
curl -s https://www.example.co.il | grep "מאפיית הבית"
```

---

## Quick Reference: File Locations in Next.js App Router

```
app/
  layout.tsx          # <html lang="he" dir="rtl">, fonts, metadata
  page.tsx            # Main landing page (Server Component)
  sitemap.ts          # Auto-generates /sitemap.xml
  robots.ts           # Auto-generates /robots.txt
  manifest.ts         # Optional: PWA manifest

public/
  llms.txt            # AI-readable business info
  llms-full.txt       # Extended AI-readable info (optional)
  {indexnow-key}.txt  # IndexNow verification
  favicon.ico         # Favicon
  og-image.jpg        # Open Graph image (1200x630)
```

---

## Sources & Tools

- [Google Search Central: Technical SEO](https://developers.google.com/search/docs)
- [Next.js SEO Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Web.dev Core Web Vitals](https://web.dev/vitals/)
- [Schema.org Validator](https://validator.schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [IndexNow Protocol](https://www.indexnow.org/)
- [llms.txt Specification](https://llmstxt.org/)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
