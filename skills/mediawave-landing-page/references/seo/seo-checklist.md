# Complete SEO Checklists
## For Israeli Small Business Landing Pages (Next.js + Tailwind)
### Last Updated: March 2026

---

## Overview

These checklists align with the MediaWave Landing Page pipeline phases:
- **Phase 4-5**: Pre-Build + Build
- **Phase 6**: Pre-Launch
- **Phase 7**: Post-Launch
- **Phase 8**: Ongoing Maintenance

Each item includes a brief explanation. Items marked with **(CRITICAL)** must not be skipped.

---

## Phase 4-5: Pre-Build Checklist

Complete these before writing any code.

### Keyword Research
- [ ] **(CRITICAL)** Primary keyword identified - `[שירות] + [עיר]` format (e.g., "מאפייה רחובות")
- [ ] 3-5 secondary keywords identified with search volume data
- [ ] Long-tail keyword variations listed (with modifiers: מומלץ, מחיר, שעות פתיחה)
- [ ] Competitor keywords analyzed - top 3-5 competitors' keyword targets reviewed
- [ ] Search intent confirmed - verify the keyword triggers local results on Google.co.il
- [ ] Hebrew spelling variations documented (synonyms, alternative transliterations)
- [ ] FAQ questions collected from "People Also Ask" in Hebrew Google
- [ ] Keyword-to-section map created - which keywords go in which page sections

### URL Strategy
- [ ] Domain chosen (prefer `.co.il` for Israeli businesses for local trust signal)
- [ ] www vs non-www decided (pick one, redirect the other)
- [ ] Trailing slash policy decided (recommend: no trailing slash)
- [ ] URL structure planned (for single landing page: root domain `/`)
- [ ] If multi-page: URL slugs planned (Hebrew slugs OK but English slugs safer)

### Schema Types Planned
- [ ] **(CRITICAL)** Primary schema type selected (usually `LocalBusiness` or a subtype)
- [ ] Schema subtypes identified (e.g., `Bakery`, `Plumber`, `LegalService`)
- [ ] Required schema properties listed:
  - name, description, address, telephone, openingHours, geo, image, url
- [ ] Optional schema properties planned:
  - priceRange, paymentAccepted, areaServed, review, aggregateRating
- [ ] FAQ schema planned if FAQ section will exist
- [ ] BreadcrumbList schema planned (even for single page, for sitelinks)

### Content Planning
- [ ] H1 tag content decided - includes primary keyword naturally
- [ ] Title tag formula decided - `[Primary Keyword] | [Business Name]`
- [ ] Meta description drafted - 150-160 chars, Hebrew, includes CTA
- [ ] Content sections planned with heading hierarchy (H1 > H2 > H3)
- [ ] Image list prepared with planned alt text in Hebrew
- [ ] Business hours documented in machine-readable format
- [ ] NAP (Name, Address, Phone) standardized for citation consistency

---

## Phase 5: During-Build Checklist

Complete these during development.

### HTML Head & Meta Tags
- [ ] **(CRITICAL)** `<html lang="he" dir="rtl">` set in layout.tsx
- [ ] **(CRITICAL)** `<title>` tag: 50-60 characters, primary keyword + business name
  ```
  Example: מאפייה רחובות - מאפיית הבית | לחם מחמצת טרי כל יום
  ```
- [ ] **(CRITICAL)** `<meta name="description">`: 150-160 chars, Hebrew, includes keyword + CTA
  ```
  Example: מאפיית הבית ברחובות - מאפייה בוטיק עם לחם מחמצת טרי, מאפים ביתיים ועוגות בהזמנה. ☎ 050-123-4567
  ```
- [ ] `<meta name="viewport">` set (Next.js does this automatically)
- [ ] Favicon configured (`/app/favicon.ico` or `icon.tsx`)
- [ ] Apple touch icon configured

### Heading Hierarchy
- [ ] **(CRITICAL)** Exactly ONE `<h1>` tag per page containing primary keyword
- [ ] H2 tags for each major section (services, about, testimonials, FAQ, contact)
- [ ] H3 tags for subsections where needed
- [ ] No heading level skips (H1 > H3 without H2)
- [ ] Headings use Hebrew keywords naturally (not keyword-stuffed)

### Schema Markup
- [ ] **(CRITICAL)** JSON-LD `LocalBusiness` schema in page head
- [ ] Schema includes: name, description, address (Hebrew), telephone, url
- [ ] Schema includes: openingHoursSpecification (with Israeli days - Sunday-Thursday primary)
- [ ] Schema includes: geo coordinates (latitude, longitude)
- [ ] Schema includes: image (business photo URL)
- [ ] Schema includes: priceRange (e.g., "₪₪" for mid-range)
- [ ] FAQ schema added if FAQ section exists (FAQPage type)
- [ ] Schema validates with Rich Results Test (no errors)

### Sitemap & robots.txt
- [ ] **(CRITICAL)** `app/sitemap.ts` created and generating valid XML
- [ ] **(CRITICAL)** `app/robots.ts` created with correct rules
- [ ] AI crawler rules configured (allow OAI-SearchBot, PerplexityBot; optionally block GPTBot, ClaudeBot for training)
- [ ] Sitemap includes all public pages with correct lastmod dates
- [ ] robots.txt blocks: /api/, /_next/, /admin/

### Canonical & hreflang
- [ ] **(CRITICAL)** Canonical URL set in metadata (self-referencing)
- [ ] hreflang tags added if bilingual (he + en)
- [ ] x-default hreflang set to Hebrew version
- [ ] If single language: `lang="he"` on html tag is sufficient

### Open Graph & Social
- [ ] **(CRITICAL)** `og:title` set (can differ from title tag - more engaging)
- [ ] **(CRITICAL)** `og:description` set
- [ ] **(CRITICAL)** `og:image` set - 1200x630px image with Hebrew text overlay
- [ ] `og:url` set to canonical URL
- [ ] `og:type` set to "website"
- [ ] `og:locale` set to "he_IL"
- [ ] Twitter card tags set (twitter:card, twitter:title, twitter:description, twitter:image)
- [ ] Social image tested with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

### Images & Media
- [ ] **(CRITICAL)** All images have descriptive `alt` text in Hebrew
  ```
  Good:  alt="לחם מחמצת טרי על מדף עץ במאפיית הבית ברחובות"
  Bad:   alt="bread" or alt="" or missing alt
  ```
- [ ] Hero image uses `priority` prop (Next.js Image)
- [ ] All images use Next.js `<Image>` component (automatic WebP/AVIF, lazy loading)
- [ ] Image dimensions specified (width + height) to prevent CLS
- [ ] Below-fold images use `loading="lazy"` (default in Next.js Image)
- [ ] Images have descriptive filenames (not IMG_001.jpg)

### llms.txt
- [ ] `public/llms.txt` created with business information in markdown
- [ ] Includes: business name, location, services, hours, phone, key facts
- [ ] Written in a way LLMs can easily parse and cite

### Content Quality
- [ ] Primary keyword appears in first 100 words of body content
- [ ] Keywords appear naturally throughout (not keyword-stuffed)
- [ ] Content provides genuine value (not thin/duplicate)
- [ ] Hebrew grammar is correct (have a native speaker review)
- [ ] Phone number uses `tel:` link format with `dir="ltr"`
- [ ] Address appears in plain text (not only in image/map)
- [ ] Business hours appear in plain text (not only in schema)

### Technical
- [ ] All internal links use Next.js `<Link>` component
- [ ] No broken links (test with browser console or tool)
- [ ] No orphan pages (every page reachable from navigation)
- [ ] 404 page configured with helpful Hebrew content
- [ ] No `console.error` messages in browser

---

## Phase 6: Pre-Launch Checklist

Complete these before deploying to production.

### SEO Audit
- [ ] **(CRITICAL)** Schema validates with [Rich Results Test](https://search.google.com/test/rich-results) - zero errors
- [ ] Schema validates with [Schema.org Validator](https://validator.schema.org/) - zero errors
- [ ] All meta tags render correctly (View Source, not Inspect)
- [ ] Sitemap accessible at `/sitemap.xml` and contains valid XML
- [ ] robots.txt accessible at `/robots.txt` with correct rules
- [ ] Canonical URLs are correct (no duplicates, no trailing slash mismatches)

### Image Audit
- [ ] **(CRITICAL)** Every `<img>` has an alt attribute with Hebrew description
- [ ] No images larger than 200KB (use Next.js Image optimization)
- [ ] OG image is 1200x630 and displays correctly
- [ ] Favicon displays correctly

### Mobile Testing
- [ ] **(CRITICAL)** Page passes [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [ ] Tested on iPhone SE (smallest common screen - 375px)
- [ ] Tested on Samsung Galaxy (most common in Israel - 360-412px)
- [ ] Tested on iPad (tablet - 768px)
- [ ] No horizontal scroll on any device
- [ ] Touch targets are at least 44x44px
- [ ] Text is readable without zooming (16px+ for Hebrew body)
- [ ] Forms are usable on mobile (input fields, buttons)
- [ ] Click-to-call works on mobile (`tel:` links)

### Page Speed
- [ ] **(CRITICAL)** Lighthouse Performance score: 90+ (target 95+)
- [ ] Lighthouse Accessibility score: 90+
- [ ] Lighthouse Best Practices score: 90+
- [ ] Lighthouse SEO score: 95+ (target 100)
- [ ] LCP under 2.5 seconds (target 1.8s)
- [ ] INP under 200ms (target 100ms)
- [ ] CLS under 0.1 (target 0.05)

### Link Verification
- [ ] All internal links work (no 404s)
- [ ] All external links work and open in new tab
- [ ] Phone number links dial correctly
- [ ] Email links open mail client
- [ ] Google Maps link/embed works
- [ ] Social media links work
- [ ] WhatsApp link works (`https://wa.me/972501234567`)

### Legal & Compliance
- [ ] Privacy policy page present and linked
- [ ] Terms of service page present and linked (if applicable)
- [ ] Cookie consent banner implemented (if using analytics cookies)
- [ ] Accessibility statement present (Israeli law requires for businesses with 50+ employees; good practice for all)
- [ ] Israeli Accessibility regulations complied with (WCAG 2.1 AA)

### Final Checks
- [ ] Page works without JavaScript (critical content visible in raw HTML)
- [ ] RTL layout renders correctly (no misaligned elements)
- [ ] Mixed LTR content (phone numbers, URLs, English brand names) displays correctly
- [ ] No lorem ipsum or placeholder content remaining
- [ ] Client has approved all content

---

## Phase 7: Post-Launch Checklist

Complete within the first 1-2 weeks after going live.

### Search Engine Registration
- [ ] **(CRITICAL)** Google Search Console property created and verified
  - Verify method: DNS TXT record (most reliable for .co.il domains)
  - Add both `example.co.il` and `www.example.co.il`
- [ ] **(CRITICAL)** Sitemap submitted in Google Search Console
  - Go to Sitemaps > Add new > Enter `sitemap.xml`
- [ ] URL Inspection: Request indexing of the main page
- [ ] Bing Webmaster Tools registered (optional but easy - import from GSC)

### Instant Indexing
- [ ] **(CRITICAL)** IndexNow ping sent for main URL (instant Bing indexing)
- [ ] Google Search Console: "Request Indexing" used for main URL
- [ ] Verify page appears in Google within 24-48 hours (search `site:example.co.il`)

### Google Business Profile
- [ ] **(CRITICAL)** GBP verified and fully optimized
- [ ] GBP website field points to the new landing page
- [ ] GBP photos uploaded (10+ photos)
- [ ] GBP posts created (first post announcing the new website)
- [ ] GBP Q&A section pre-populated with common questions

### Directory Submissions
- [ ] Week 1 directories submitted: דפי זהב, B144, Dun's Guide
- [ ] Week 2 directories submitted: Yad2, Walla!, niche directories
- [ ] NAP consistency verified across all submissions
- [ ] Citation tracking spreadsheet started

### Review Collection
- [ ] Review request template created (Hebrew WhatsApp message)
- [ ] Google review link generated and shortened
- [ ] First wave of review requests sent to existing satisfied customers
- [ ] Review response process established (who responds, within what timeframe)

### Analytics & Monitoring
- [ ] Google Analytics 4 (GA4) installed and tracking
- [ ] GA4 events configured: form submissions, phone clicks, WhatsApp clicks
- [ ] Google Search Console email alerts enabled
- [ ] Initial benchmark metrics recorded:
  - Page speed scores
  - Search Console: initial impressions/clicks (will be zero, that's OK)
  - Number of indexed pages (should be 1+ within a few days)

### Social Proof Launch
- [ ] Share new website on business Facebook page
- [ ] Share in relevant local Facebook groups (if allowed by group rules)
- [ ] Send to existing customers via WhatsApp / email
- [ ] Ask satisfied customers to share

---

## Phase 8: Ongoing Checklist

Recurring tasks for long-term SEO health.

### Weekly Tasks
- [ ] Respond to all new Google reviews (within 48 hours)
- [ ] Check Google Business Profile for suggested edits (reject incorrect changes)
- [ ] Post on GBP (weekly update, offer, or news)
- [ ] Quick manual ranking check: search primary keyword in incognito on Google.co.il
- [ ] Check Google Search Console for new crawl errors or security issues

### Monthly Tasks
- [ ] **Google Search Console deep review**:
  - Top queries report: identify new keywords driving traffic
  - Average position: track changes for target keywords
  - Click-through rate: identify opportunities to improve titles/descriptions
  - Index coverage: ensure page is indexed, check for errors
- [ ] **Content refresh**: Update any outdated information (prices, hours, seasonal content)
- [ ] **Review performance**: How many new reviews this month? Average rating trend?
- [ ] **Directory status check**: Verify top 5 directory listings are still active and accurate
- [ ] **Competitor check**: Quick search of primary keyword - any new competitors? Position changes?
- [ ] **Page speed check**: Run Lighthouse - has anything degraded?

### Quarterly Tasks
- [ ] **Full SEO audit**: Re-run all pre-launch checks
- [ ] **Schema validation**: Re-test with Rich Results Test (Google changes requirements)
- [ ] **Keyword refresh**: Check if new keywords have emerged (Google Search Console data)
- [ ] **Content expansion consideration**: Would additional pages help? (FAQ page, service-specific pages)
- [ ] **AI citation check**: Search for business on ChatGPT, Perplexity, Google AI Overviews
- [ ] **Link profile review**: Any new backlinks? Any spammy links to disavow?
- [ ] **GBP insights review**: What searches trigger your profile? Photo views? Direction requests?

### Annual Tasks
- [ ] **Major content update**: Refresh all copy, testimonials, photos
- [ ] **Holiday hours update**: Update GBP for all Israeli holidays
- [ ] **Legal compliance check**: Privacy policy, accessibility, terms of service
- [ ] **SSL certificate verify**: Should auto-renew on Vercel, but verify
- [ ] **Technology audit**: Is Next.js version current? Any security patches needed?
- [ ] **Strategy review**: Is the landing page still meeting business goals? Consider expansion.

---

## Quick Copy: Most Critical Items (Top 20)

If time is limited, these 20 items have the highest SEO impact:

1. [ ] `<html lang="he" dir="rtl">` set
2. [ ] Title tag with primary Hebrew keyword (50-60 chars)
3. [ ] Meta description with keyword + CTA (150-160 chars)
4. [ ] Single H1 with primary keyword
5. [ ] LocalBusiness JSON-LD schema with all required fields
6. [ ] Schema validates with Rich Results Test
7. [ ] sitemap.xml auto-generated and valid
8. [ ] robots.txt configured with AI crawler rules
9. [ ] Canonical URL set
10. [ ] All images have Hebrew alt text
11. [ ] Hero image has `priority` prop (LCP optimization)
12. [ ] Lighthouse Performance 90+, SEO 95+
13. [ ] Mobile-friendly test passes
14. [ ] Google Search Console verified + sitemap submitted
15. [ ] Google Business Profile optimized with website link
16. [ ] Top 3 directories submitted (d.co.il, B144, Dun's)
17. [ ] IndexNow ping sent
18. [ ] llms.txt created in public/
19. [ ] OG image 1200x630 with Hebrew text
20. [ ] Review collection process started

---

## Sources

- [Google Search Central SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Next.js SEO Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Web.dev SEO Checklist](https://web.dev/lighthouse-seo/)
- MediaWave Landing Page Pipeline documentation
- Companion reference files: technical-seo.md, hebrew-keyword-research.md, link-building-israel.md
