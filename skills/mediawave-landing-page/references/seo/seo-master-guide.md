# SEO Sub-Skill Master Guide
## For Israeli Small Business Landing Pages
### MediaWave Landing Page Pipeline

---

## 1. SEO Sub-Skill Overview

### What This Sub-Skill Does

This is the SEO intelligence layer of the MediaWave Landing Page Pipeline. It provides Israeli-market-specific SEO strategy, implementation guidance, and automated tooling for every landing page we build. It replaces generic SEO advice with research-backed, Hebrew-first, local-intent optimization tailored to small businesses operating in Israel.

### When It Runs in the Pipeline

The SEO sub-skill is not a standalone phase. It integrates across multiple pipeline phases:

| Pipeline Phase | SEO Integration |
|---|---|
| **Phase 1: Discovery** | SEO-specific questions added to discovery flow (GBP status, target keywords, service area, ranking awareness) |
| **Phase 4: Copy** | Keywords inform headline and body copy. FAQ section is written for both conversion and schema markup. Answer capsules placed after H2 headings. |
| **Phase 5: Build** | Schema markup (LocalBusiness + FAQPage + Service) injected as JSON-LD. Meta tags, canonical URL, sitemap.xml, robots.txt, llms.txt, and hreflang all generated. OG tags set with `he_IL` locale. |
| **Phase 6: Optimize** | Full SEO audit run against built page. Core Web Vitals checked. Schema validated with Rich Results Test. Mobile rendering verified. |
| **Phase 7: Deploy** | Google Search Console setup. Sitemap submitted. Directory submissions initiated. GBP linked to live URL. |
| **Phase 8: Monitor** | Ranking tracking for target keywords. GSC error monitoring. Review velocity tracking. Monthly content freshness updates. |

### What It Covers

- On-page SEO optimized for Hebrew content and RTL layout
- Local SEO for the Israeli market (GBP, directories, citations, Waze)
- Technical SEO for Next.js static landing pages
- Schema markup library with Hebrew examples
- Hebrew keyword research framework addressing morphological complexity
- Link building and citation strategies specific to Israel
- Answer Engine Optimization (AEO) for AI search visibility
- Pre-launch and post-launch SEO checklists
- Ongoing monitoring and reporting

---

## 2. Realistic Expectations

### What a Single Landing Page CAN Achieve

A well-optimized landing page paired with Google Business Profile CAN:

- **Rank for 1-3 local intent keywords** in the format "[service] + [city]" (e.g., "אינסטלטור בתל אביב")
- **Appear in the Local Pack** (Google Maps top 3) for the target city/service combination
- **Capture featured snippets** for FAQ-style queries about the service
- **Get cited by AI search engines** (ChatGPT, Gemini, Perplexity) for specific local questions
- **Outperform 67% of Israeli business websites** on mobile performance alone (most Israeli business sites score below 50 on PageSpeed)
- **Generate direct leads** through local search within 2-3 months of launch

### What a Single Landing Page CANNOT Achieve

A single landing page CANNOT:

- Compete for broad, non-local keywords (e.g., "web design" nationally)
- Rank for dozens of different keyword topics simultaneously
- Replace a full content marketing strategy with blog posts and topic clusters
- Build significant domain authority without supporting pages or backlinks over time
- Compensate for a poorly optimized or nonexistent Google Business Profile

### Timeline Expectations (Israeli Market)

| Milestone | Expected Timeframe |
|---|---|
| Google indexes the page | 1-7 days (with GSC submission) |
| Local Pack appearance (with optimized GBP) | 2-3 months |
| Organic ranking movement for target keywords | 3-5 months |
| Consistent top-10 ranking for local keywords | 4-6 months |
| AI search engine citations (ChatGPT/Perplexity) | 2-4 months (faster with schema + llms.txt) |

### The Bottom Line

A landing page is a **precision tool**, not a broad strategy. It works best as the conversion endpoint for a specific local service + city combination. Paired with GBP and directory citations, it can absolutely dominate a local niche. Expecting it to rank nationally for competitive terms is unrealistic.

---

## 3. The Israeli SEO Formula

The following combination is what works for Israeli small businesses. Every element reinforces the others. Skipping any one of them weakens the whole system.

### 3.1 Google Business Profile (36% of Local Ranking Weight)

GBP is the single most impactful free tool for Israeli local SEO. It determines Local Pack placement and feeds AI search engines with structured business data.

**Requirements:**
- 100% complete profile in Hebrew
- Correct primary and secondary categories matching how Israelis search
- Business hours including Friday/Shabbat schedule (critical in Israel)
- Weekly Google Posts in Hebrew (each post is a fresh data point for AI)
- Respond to ALL reviews within 24-48 hours
- Photos uploaded regularly (storefront, team, products)
- GBP website URL points to the landing page

**Reference:** `local-seo-israel.md` sections 1-3

### 3.2 LocalBusiness Schema + FAQ Schema

Schema markup makes the business machine-readable. Pages with thorough schema markup are 36% more likely to appear in AI-generated summaries.

**Requirements:**
- `LocalBusiness` JSON-LD with the most specific subtype (Plumber, Bakery, HairSalon, etc.)
- Hebrew name, description, and address in schema
- `FAQPage` JSON-LD for all FAQ content
- `Service` schema for each service offered
- Israeli phone format (+972-X-XXXXXXX)
- Opening hours with Friday specification, no Saturday unless business operates on Shabbat
- GeoCoordinates for accurate map placement
- Validated with Google Rich Results Test before launch

**Reference:** `schema-markup-library.md`

### 3.3 Hebrew-First Content with Bilingual Support

Google uses visible page content to determine language. Hebrew content must be primary, written natively (not translated from English), and structured for both human readers and AI systems.

**Requirements:**
- Title tag: primary Hebrew keyword + city name (max 60 characters)
- Meta description: Hebrew with CTA (max 155 characters)
- H1: primary keyword in Hebrew (one per page)
- Content: 800-1,500 words of quality Hebrew text
- FAQ section: 5-8 questions in natural Hebrew
- Answer capsules: 20-25 word summary after every H2 heading
- `<html lang="he" dir="rtl">` on the HTML root
- Hreflang tags if bilingual (he-IL + en + x-default)

**Reference:** `on-page-seo.md`, `hebrew-keyword-research.md`

### 3.4 NAP Consistency Across All Platforms

Name, Address, and Phone must be identical everywhere the business appears. Inconsistent NAP creates "entity confusion" where Google may treat variations as separate entities, diluting ranking power.

**Check against:**
- Landing page (visible text + schema markup)
- Google Business Profile
- All Israeli directory listings
- Facebook Business Page
- Apple Maps, Bing Places, Waze
- Any other platform where the business is listed

**Reference:** `local-seo-israel.md` section 4

### 3.5 Israeli Directory Citations

Directory citations build local authority and provide backlinks. The Israeli directory landscape has specific high-value targets.

**Top 5 priority directories:**

| # | Directory | URL | Impact |
|---|---|---|---|
| 1 | Dapei Zahav (d.co.il) | d.co.il | HIGH |
| 2 | B144 (Bezeq) | b144.co.il | HIGH |
| 3 | Dun's Guide | dunsguide.co.il | HIGH |
| 4 | Yad2 | yad2.co.il | MEDIUM-HIGH |
| 5 | Janglo | janglo.net | MEDIUM |

Maintain consistent NAP across all listings. Aim for 10+ directory submissions at launch with at least the top 5 completed.

**Reference:** `link-building-israel.md`

### 3.6 Review Strategy (Google + Facebook)

Reviews are a major ranking factor for local search in Israel. Google reviews directly influence Local Pack placement. Facebook reviews matter because Facebook is a dominant platform for Israeli local business discovery.

**Strategy:**
- Prioritize Google Reviews above all else
- Maintain active Facebook Business Page with reviews enabled
- Register on Dapei Zahav and encourage reviews there
- Respond to ALL reviews on ALL platforms in Hebrew
- Create a review request template in Hebrew for satisfied customers
- Never ignore negative reviews - Israelis expect direct, honest responses

**Reference:** `local-seo-israel.md` section 5

### 3.7 Mobile-First (58% of Israeli Searches Are Mobile)

Mobile performance is the single biggest technical differentiator in the Israeli market. 89% of top-3 ranking Israeli pages score above 75 on mobile PageSpeed Insights. 67% of Israeli business websites score below 50. Simply having good mobile performance puts you ahead of two-thirds of the competition.

**Targets:**
- PageSpeed Insights mobile score: 75+ (target 90+)
- LCP (Largest Contentful Paint): < 2.5 seconds
- INP (Interaction to Next Paint): < 200ms
- CLS (Cumulative Layout Shift): < 0.1
- RTL layout verified across all mobile breakpoints
- Touch targets appropriately sized
- Clickable phone number (`tel:+972...`)
- WhatsApp CTA button functional on mobile

**Reference:** `technical-seo.md`

### 3.8 AEO / AI Visibility Layer

Answer Engine Optimization adds a layer on top of traditional SEO to capture visibility in AI search results (ChatGPT, Google AI Overviews, Perplexity).

**Requirements:**
- Answer capsules (20-25 words) after every H2 heading
- FAQ sections with question-based headings and direct 2-4 sentence answers
- `llms.txt` file at site root with business summary, services, contact info
- robots.txt allows AI search crawlers (OAI-SearchBot, ChatGPT-User, PerplexityBot)
- Schema markup (LocalBusiness, FAQPage, Service) in JSON-LD
- Content freshness - update key content at least monthly
- Author/owner bio section with credentials

**Reference:** `ai-seo-aeo.md`

---

## 4. Quick Wins

The 5 highest-impact SEO actions for minimal effort. Do these first, in this order.

### Quick Win 1: Complete Google Business Profile in Hebrew

**Effort:** 30-60 minutes
**Impact:** CRITICAL - accounts for 36% of local ranking weight

Complete every field. Write the business description in Hebrew with target keywords. Set correct categories. Upload photos. Set Friday/Shabbat hours. Link to the landing page URL. Publish the first Google Post.

### Quick Win 2: Implement LocalBusiness + FAQ JSON-LD Schema

**Effort:** 15-30 minutes (using the schema library templates)
**Impact:** HIGH - pages with schema are 36% more likely to appear in AI summaries

Use the most specific LocalBusiness subtype. Include Hebrew name, description, address. Add FAQPage schema for all FAQ content. Validate with Rich Results Test.

### Quick Win 3: Optimize Title Tag and Meta Description in Hebrew

**Effort:** 10-15 minutes
**Impact:** HIGH - directly affects CTR from search results

Title: Primary Hebrew keyword + city name + brand. Max 60 characters.
Meta description: Compelling Hebrew text with CTA. Max 155 characters.
Example: `אינסטלטור בתל אביב | שם העסק - שירות 24/7` and `אינסטלטור מקצועי בתל אביב. שירות מהיר, מחירים הוגנים, זמינות 24/7. התקשרו: 050-1234567`

### Quick Win 4: Submit to Top 5 Israeli Directories

**Effort:** 1-2 hours total
**Impact:** MEDIUM-HIGH - builds local authority and citation signals

Submit to Dapei Zahav, B144, Dun's Guide, Yad2, and Janglo. Ensure NAP is identical across all listings and matches the landing page and GBP exactly.

### Quick Win 5: Create llms.txt File

**Effort:** 10 minutes
**Impact:** MEDIUM - positions the business for AI search visibility with zero downside

Create a Markdown file at the site root with business name, summary, services, contact info, and links to key pages. This gives AI systems a structured overview of the business.

---

## 5. File Reference Map

| Reference File | What It Covers | When to Read |
|---|---|---|
| **`on-page-seo.md`** | Title tags, meta descriptions, heading hierarchy, Hebrew content optimization, URL structure, image SEO, internal linking for single-page sites | Phase 4 (Copy), Phase 5 (Build), Phase 6 (Optimize) |
| **`local-seo-israel.md`** | Google Business Profile optimization in Hebrew, Israeli directory submissions, citation building, NAP consistency, Google Maps optimization, Waze integration, review strategy | Phase 1 (Discovery), Phase 5 (Build), Phase 7 (Deploy) |
| **`technical-seo.md`** | Crawlability for Next.js SSG, Core Web Vitals targets, sitemap.xml and robots.txt generation, canonical tags, SSL/HTTPS, mobile-first indexing, structured data validation | Phase 5 (Build), Phase 6 (Optimize) |
| **`hebrew-keyword-research.md`** | Hebrew morphological complexity (prefixes, suffixes, spelling variations), keyword research tools for Hebrew, Israeli search behavior patterns, search intent mapping, long-tail Hebrew keyword generation | Phase 1 (Discovery), Phase 4 (Copy) |
| **`schema-markup-library.md`** | Ready-to-use JSON-LD templates for all relevant schema types with Hebrew examples: LocalBusiness (all subtypes), FAQPage, Service, Organization, BreadcrumbList, ContactPoint, OpeningHoursSpecification, AggregateRating, Review, WebPage | Phase 5 (Build) |
| **`link-building-israel.md`** | Prioritized Israeli directory list (20+ directories with status, cost, DA, impact), NAP consistency rules, guest posting on Israeli websites, influencer partnerships, local PR, community engagement, link building platforms | Phase 7 (Deploy), Phase 8 (Monitor) |
| **`ai-seo-aeo.md`** | Answer Engine Optimization strategy, how AI search engines select sources, content structure for AI citation (answer capsules), llms.txt specification and implementation, entity establishment, conversational Hebrew keyword optimization, robots.txt for AI crawlers | Phase 4 (Copy), Phase 5 (Build), Phase 8 (Monitor) |
| **`seo-checklist.md`** | Pre-launch SEO checklist (technical, on-page, content, schema, local), post-launch SEO checklist (GSC, indexing, directories, monitoring), categorized by priority and effort level | Phase 6 (Optimize), Phase 7 (Deploy) |
| **`seo-monitoring.md`** | Google Search Console setup and configuration, ranking tracking for target keywords, Core Web Vitals monitoring, crawl error detection, SEO health report generation, recommended monitoring tools (free and paid) | Phase 7 (Deploy), Phase 8 (Monitor) |

### Supporting Research Files (Already Completed)

| Research File | Content |
|---|---|
| **`israeli-local-seo-research.md`** | Comprehensive research report: Israeli search market, GBP optimization, Hebrew keyword challenges, tools, technical RTL SEO, hreflang, structured data, directories (20+), review platforms, link building, content strategy, AI Overviews impact, Waze, Facebook, complete checklist, 50+ sources |
| **`landing-page-seo-research.md`** | Landing page vs full website SEO, schema markup for landing pages, local intent ranking factors, Next.js SEO implementation (metadata API, sitemap, robots, JSON-LD, Core Web Vitals), content structure, FAQ optimization, heading hierarchy, complete code templates |
| **`../../AEO-AI-SEO-Research-Report.md`** | AEO fundamentals, how AI engines select sources (ChatGPT, Gemini, Perplexity), content structure for citation, llms.txt standard, local AEO strategy, entity establishment, conversational Hebrew keywords, technical implementation checklist, 40+ sources |

---

## 6. Integration Points

### Phase 1: Discovery

**SEO questions added to the discovery flow:**

1. Does the client have an existing Google Business Profile? [Yes (URL) / No (we create one) / Don't know]
2. What are the client's top 3 services/products they want to rank for?
3. Service area type: [Single location / Multiple locations / Service area (mobile business) / Nationwide / Online only]
4. Target city and neighborhoods: ___
5. Does the client currently run Google Ads? [Yes / No / Previously]
6. Current Google ranking awareness: [Ranks well / Doesn't appear / Doesn't know / New business]

These answers feed into keyword research, schema markup generation, and directory submission strategy.

### Phase 4: Copy

**SEO informs copy decisions:**

- Primary keyword determines H1 heading text
- Secondary keywords inform H2 section headings
- FAQ section is written with dual purpose: address real customer objections AND target search queries
- Answer capsules (20-25 words) are placed after every H2 for AI citation
- Copy includes city name and neighborhood mentions naturally (not keyword-stuffed)
- CTA text includes location reference where natural
- Content length targets 800-1,500 words (SEO sweet spot for local landing pages)

### Phase 5: Build

**SEO elements built into the page:**

- `<html lang="he" dir="rtl">` on root element
- Next.js Metadata API: title, description, OG tags, Twitter cards
- Canonical URL set
- `app/sitemap.ts` generates sitemap.xml
- `app/robots.ts` generates robots.txt (with AI crawler directives)
- JSON-LD `<script>` tags for LocalBusiness + FAQPage + Service schemas
- Hreflang tags if bilingual
- `public/llms.txt` created with business summary
- Image alt text in Hebrew
- Clickable phone (`tel:+972...`) and WhatsApp links
- NAP displayed consistently in hero/contact/footer sections

### Phase 6: Optimize

**SEO audit runs against the built page:**

- Schema markup validation (Rich Results Test)
- Meta tag verification (title length, description length, OG completeness)
- Heading hierarchy check (single H1, proper H2/H3 nesting)
- Core Web Vitals measurement (LCP, INP, CLS)
- Mobile rendering verification
- Image optimization check (alt text, lazy loading, responsive sizes)
- Content length verification
- NAP consistency check (page vs schema)
- Broken link detection
- PageSpeed Insights score (target: 90+ mobile)

### Phase 7: Deploy

**SEO post-deployment actions:**

- Google Search Console property created and verified
- Sitemap.xml submitted to GSC
- Page indexing requested
- Google Business Profile updated with live URL
- Top 5 Israeli directory submissions initiated (Dapei Zahav, B144, Dun's Guide, Yad2, Janglo)
- Google review request process established for the client
- Apple Maps and Bing Places listings created (if applicable)

### Phase 8: Monitor

**Ongoing SEO monitoring:**

- GSC: crawl errors, indexing status, search performance (clicks, impressions, CTR, position)
- Core Web Vitals tracking (field data from CrUX)
- Ranking position for target keywords (weekly for first 3 months, then monthly)
- Review velocity monitoring (Google, Facebook)
- Content freshness reminders (update key content monthly)
- AI citation monitoring (run target queries through ChatGPT/Perplexity quarterly)
- Generate Hebrew SEO health report for client

---

## 7. Key Statistics

These numbers are from research conducted in March 2026. They should be re-verified quarterly.

### Israeli Search Market

| Statistic | Value | Implication |
|---|---|---|
| Google search market share in Israel | **98.31%** | Optimize exclusively for Google. Bing, Yahoo, and others are negligible. |
| Israeli consumers who search for local businesses on Google | **87%** | Local SEO is not optional for Israeli businesses. |
| Local searches that convert within 24 hours | **28%** | Local search has extremely high commercial intent. |
| Israeli searches conducted on mobile | **58%** | Mobile-first optimization is mandatory. |
| Israelis who do not scroll past page 1 | **76%** | Top-10 ranking is the minimum viable position. |
| Clicks captured by positions 1-3 | **68%+** | The difference between position 4 and position 3 is massive. |

### Local SEO Ranking Factors

| Statistic | Value | Implication |
|---|---|---|
| GBP weight in local ranking algorithm | **36%** | GBP optimization is the single highest-ROI action. |
| Top-3 ranking Israeli pages scoring 75+ on mobile PageSpeed | **89%** | Mobile performance is a hard requirement for top rankings. |
| Israeli business websites scoring below 50 on mobile PageSpeed | **67%** | Simply having good performance puts you ahead of most competitors. |
| ROI for small businesses investing in SEO (year one) | **275%** average | SEO delivers strong returns even for small businesses. |

### AI Search / AEO

| Statistic | Value | Implication |
|---|---|---|
| AI-cited URLs that also rank in Google top 10 | **76%** | Strong traditional SEO is the foundation for AI visibility. |
| FAQ schema pages more likely to appear in AI Overviews | **60%** | FAQ schema is one of the highest-leverage AEO actions. |
| Pages with schema markup more likely to appear in AI summaries | **36%** | Schema markup serves both traditional SEO and AEO. |
| Zero-click Google searches (2025) | **69%** | Significant and growing share of searches never result in a click. |
| Predicted organic traffic shift to AI chatbots by 2026 | **25%** | AI search is not a future concern - it is a present reality. |
| Organic CTR reduction when AI Overview appears | **34-61%** | Position-one content is most affected. Local/transactional queries are less impacted. |
| Content updated within 30 days: higher AI citation rate | **82%** (Perplexity), **76%** (ChatGPT) | Content freshness dramatically increases AI citation probability. |

---

## How to Use This Guide

1. **At project start:** Read sections 2 (Expectations) and 3 (Formula) to understand what we are building toward.
2. **During discovery (Phase 1):** Use section 6 integration points to ask the right SEO questions. Read `hebrew-keyword-research.md` for keyword strategy.
3. **During copy (Phase 4):** Refer to section 3.3 (Hebrew content) and the answer capsule pattern from `ai-seo-aeo.md`.
4. **During build (Phase 5):** Follow section 6 build integration. Use `schema-markup-library.md` for JSON-LD templates. Use `technical-seo.md` for sitemap/robots/canonical setup.
5. **During optimize (Phase 6):** Run the SEO audit from `seo-checklist.md`. Validate schema with Rich Results Test.
6. **During deploy (Phase 7):** Follow section 6 deploy actions. Use `link-building-israel.md` for directory submissions.
7. **During monitor (Phase 8):** Follow `seo-monitoring.md` for GSC setup and tracking. Generate reports from `seo-report-he.md` template.

**When in doubt, start with the Quick Wins (section 4).** They deliver the highest impact for the least effort and form the foundation everything else builds on.

---

*This document was created March 2026 as part of the MediaWave Landing Page Pipeline SEO sub-skill. It should be reviewed and updated quarterly as the Israeli SEO landscape, Google's algorithms, and AI search systems continue to evolve.*
