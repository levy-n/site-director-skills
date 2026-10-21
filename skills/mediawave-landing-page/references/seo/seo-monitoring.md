# Ongoing SEO Monitoring
## For Israeli Small Business Landing Pages
### Last Updated: March 2026

---

## Table of Contents

1. [Google Search Console Setup](#1-google-search-console-setup)
2. [Key GSC Metrics to Track](#2-key-gsc-metrics-to-track)
3. [Hebrew Search Query Analysis](#3-hebrew-search-query-analysis)
4. [Ranking Monitoring](#4-ranking-monitoring)
5. [AI Citation Monitoring](#5-ai-citation-monitoring)
6. [Monthly SEO Report Template](#6-monthly-seo-report-template)
7. [Alerts & Troubleshooting](#7-alerts--troubleshooting)
8. [Integration with Post-Launch Phase](#8-integration-with-post-launch-phase)

---

## 1. Google Search Console Setup

### Verification Methods for Israeli Sites

For `.co.il` domains, use one of these verification methods:

#### Option A: DNS TXT Record (Recommended)
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property" > "Domain" > Enter `example.co.il`
3. Google provides a TXT record like: `google-site-verification=XXXX`
4. Add this TXT record at your domain registrar (common Israeli registrars: isoc.org.il, InterSpace, Galcomm)
5. Click "Verify" - may take up to 48 hours for DNS propagation
6. **Advantage**: Verifies ALL subdomains and protocols (www, non-www, http, https)

#### Option B: HTML Tag
1. Add Property > "URL prefix" > Enter `https://www.example.co.il`
2. Google provides a meta tag: `<meta name="google-site-verification" content="XXXX" />`
3. Add to `app/layout.tsx`:

```typescript
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  verification: {
    google: 'your-verification-code-here',
  },
  // ... other metadata
};
```

4. Deploy and click "Verify"
5. **Note**: Only verifies the exact URL prefix (add both www and non-www separately)

#### Option C: Vercel Integration (Easiest)
1. If your domain is managed through Vercel:
   - Vercel may auto-verify via DNS
   - Or use the Vercel GSC integration in Project Settings

### Post-Verification Steps

1. [ ] Submit sitemap: Sitemaps > Add > `sitemap.xml`
2. [ ] Check URL inspection for main page: paste URL > check "URL is on Google"
3. [ ] If not indexed: Click "Request Indexing"
4. [ ] Set up email alerts: Settings > Email preferences > Enable all alerts
5. [ ] Add all property variants if using URL prefix method:
   - `https://www.example.co.il`
   - `https://example.co.il`
   - (http variants redirect, but good to cover)

---

## 2. Key GSC Metrics to Track

### Performance Report - Primary Metrics

| Metric | What It Tells You | Healthy Range | Warning Sign |
|--------|------------------|---------------|-------------|
| **Impressions** | How often your page appears in search results | Growing month-over-month | Sudden 30%+ drop |
| **Clicks** | How many people click through to your page | Growing MoM | Drop without impression drop |
| **CTR** | Click-through rate (clicks / impressions) | 3-10% for local businesses | Below 2% |
| **Average Position** | Average ranking position for all queries | 1-10 (first page) | Rising above 20 |

### How to Read GSC Performance

```
Scenario: High Impressions + Low Clicks
→ Problem: Title/description not compelling enough
→ Fix: Rewrite title tag and meta description with stronger CTA

Scenario: Low Impressions + High CTR
→ Problem: Ranking for too few queries
→ Fix: Expand content to target more keywords

Scenario: Dropping Impressions
→ Problem: Possible ranking loss or indexing issue
→ Fix: Check Index Coverage report for errors, check if competitors changed

Scenario: Dropping Position
→ Problem: Competitors may be outranking you
→ Fix: Content refresh, more reviews, more citations
```

### Index Coverage Report

Check monthly:
- **Valid**: Pages successfully indexed (should include your landing page)
- **Valid with warnings**: Pages indexed but with issues (investigate)
- **Errors**: Pages that couldn't be indexed (fix immediately)
- **Excluded**: Pages intentionally or accidentally excluded

**For a single landing page, you should see:**
- 1 valid page (your main page)
- Possibly 1-2 more (privacy, terms)
- Sitemap should show as "Success"

### Core Web Vitals Report

GSC shows real-world CWV data from Chrome users (CrUX data):
- **LCP**: Largest Contentful Paint - target "Good" (green)
- **INP**: Interaction to Next Paint - target "Good" (green)
- **CLS**: Cumulative Layout Shift - target "Good" (green)

**Note**: CWV data only appears after your page gets enough traffic (usually ~1000+ visits/month). For new sites, use Lighthouse instead.

---

## 3. Hebrew Search Query Analysis

### Finding Your Hebrew Keywords in GSC

Go to Performance > Search Results > Queries tab.

### What to Look For

#### High-Value Queries to Optimize For

```
Look for queries where:
- Impressions > 50/month but CTR < 3%
  → Your page appears but people don't click
  → Action: Improve title tag to match this query better

- Position between 4-10 (bottom of page 1)
  → Close to top positions, worth investing in
  → Action: Add this keyword more prominently to content

- Position between 11-20 (page 2)
  → Almost on page 1, content refresh may push it over
  → Action: Strengthen content targeting this query
```

#### Hebrew Query Patterns to Monitor

| Query Pattern | What It Means | Action |
|--------------|---------------|--------|
| `[שירות] + [עיר]` | Core commercial intent | Maintain strong ranking |
| `[שירות] + מומלץ + [עיר]` | Trust intent | Ensure testimonials/reviews visible |
| `[שירות] + מחיר` | Price intent | Consider adding pricing info |
| `[שם העסק]` | Brand search | Ensure GBP + landing page appear |
| `[שירות] + שעות פתיחה` | Informational | Ensure hours are in schema + visible |
| Unexpected queries | New opportunity | Consider adding content for these |

### Query Comparison: Month over Month

Export query data monthly and compare:

```
Month 1:
  "מאפייה רחובות" - Position: 8, Clicks: 15, Impressions: 500

Month 2:
  "מאפייה רחובות" - Position: 5, Clicks: 35, Impressions: 600
  → Improvement! Position rose, CTR improved

Month 3:
  "מאפייה רחובות" - Position: 5, Clicks: 20, Impressions: 400
  → Concern: Impressions dropped. Check: seasonal? algorithm update? competitor?
```

### New Query Discovery

GSC often reveals queries you didn't target:

```
Unexpected query found: "לחם ללא גלוטן רחובות"
  → You don't offer gluten-free bread
  → Option A: Add this to your offerings
  → Option B: Ignore (don't mislead)

Unexpected query found: "מאפייה פתוחה בשישי רחובות"
  → You ARE open on Friday
  → Action: Make Friday hours more prominent on the page
```

---

## 4. Ranking Monitoring

### Manual Ranking Checks

**Why manual?** For small businesses with a single landing page, manual checks are sufficient and free.

#### How to Check Correctly

1. Open Chrome in **Incognito mode** (Ctrl+Shift+N)
2. Go to `google.co.il` (not google.com)
3. Make sure location services are off, or set to the target city
4. Search your primary keyword: `מאפייה רחובות`
5. Record your position (organic results AND local pack separately)

**Important**: Your ranking varies by:
- User location (Google personalizes by GPS)
- Search history (even incognito may have some personalization)
- Time of day
- Device (mobile vs desktop)

#### What to Track

| Keyword | Date | Organic Position | Local Pack? | Notes |
|---------|------|-----------------|-------------|-------|
| מאפייה רחובות | 2026-03-22 | #6 | Yes (#2) | - |
| מאפייה מומלצת רחובות | 2026-03-22 | #4 | No | - |
| לחם מחמצת רחובות | 2026-03-22 | Not found | No | Need more content |

### Tool-Based Ranking Monitoring (Optional)

For businesses that want automated tracking:

| Tool | Hebrew Support | Cost | Features |
|------|---------------|------|----------|
| **SE Ranking** | Good | From $55/mo | Daily rank tracking, Israeli SERPs |
| **SEMrush** | Good | From $130/mo | Rank tracking + full SEO suite |
| **Ahrefs** | Basic | From $99/mo | Rank tracking + backlink monitoring |
| **SERPWatcher (Mangools)** | Good | From $49/mo | Simple, affordable rank tracking |
| **Free: Google Search Console** | Perfect | Free | Average position data (with 2-day delay) |

**Recommendation for small businesses**: Google Search Console is sufficient. Only invest in paid tools if managing multiple client sites.

### Google SERP Feature Monitoring

Track which SERP features appear for your keywords:

| SERP Feature | What It Looks Like | Impact on Your Ranking |
|-------------|-------------------|----------------------|
| **Local Pack (3-pack)** | Map with 3 business listings | HIGH - aim to be in the 3-pack |
| **AI Overview** | AI-generated answer at top | HIGH - can push organic down |
| **Featured Snippet** | Highlighted answer box | HIGH - position zero |
| **People Also Ask** | Expandable Q&A boxes | MEDIUM - opportunity for FAQ |
| **Knowledge Panel** | Business info sidebar | MEDIUM - powered by GBP |
| **Images Pack** | Image results inline | LOW-MEDIUM |
| **Ads (top)** | Paid search ads | Pushes organic down |

---

## 5. AI Citation Monitoring

### Why Monitor AI Citations?

As of 2026, a growing percentage of Israeli searches are answered by AI:
- **Google AI Overviews**: Appear for ~30% of Israeli searches
- **ChatGPT Search**: Growing usage in Israel
- **Perplexity**: Popular among tech-savvy users
- **Gemini**: Integrated into Google ecosystem

If your business appears in AI answers, it drives awareness and potentially clicks.

### How to Check AI Citations

#### Google AI Overviews
1. Search your primary keyword on Google.co.il
2. Look for the "AI Overview" box at the top of results
3. Check if your business is mentioned or linked
4. **Note**: AI Overviews vary by query and user - check from different devices/accounts

#### ChatGPT (with Search enabled)
1. Go to chat.openai.com (or use the app)
2. Enable web search (if not default)
3. Ask: "מה המאפייה הכי טובה ברחובות?" or "recommend a bakery in Rehovot"
4. Check if your business is mentioned
5. Check if the information is accurate (name, hours, services)
6. **Fix inaccuracies**: Ensure your llms.txt, schema, and GBP are accurate - AI pulls from these

#### Perplexity
1. Go to perplexity.ai
2. Ask: "מאפייה מומלצת ברחובות" or "best bakery in Rehovot"
3. Check if your business is cited
4. Perplexity shows sources - check if it links to your page

#### Google Gemini
1. Go to gemini.google.com
2. Ask similar local business questions
3. Check for citations

### AI Citation Improvement Strategy

If your business doesn't appear in AI answers:

| Action | Why It Helps |
|--------|-------------|
| Improve Google reviews (quantity + quality) | AI models weight reviews heavily |
| Add FAQ content with common questions | AI pulls from FAQ-structured content |
| Create/update llms.txt | Direct machine-readable business info |
| Ensure schema markup is comprehensive | Structured data is easy for AI to parse |
| Get listed in more directories | More citations = more training data = more likely to appear |
| Create content that answers questions | AI cites pages that directly answer queries |

### Tracking Template: AI Citations

| Platform | Query Tested | Mentioned? | Accurate? | Date | Notes |
|----------|-------------|-----------|-----------|------|-------|
| Google AI Overview | מאפייה רחובות | No | - | 2026-03-22 | Need more reviews |
| ChatGPT Search | best bakery rehovot | Yes | Hours wrong | 2026-03-22 | Update GBP hours |
| Perplexity | מאפייה מומלצת רחובות | No | - | 2026-03-22 | - |
| Gemini | מאפייה ברחובות | Yes | Correct | 2026-03-22 | Linked to GBP |

---

## 6. Monthly SEO Report Template

### Hebrew Report Template (for client or internal use)

```markdown
# דוח SEO חודשי - [שם העסק]
## תאריך: [חודש שנה]

---

### סיכום מנהלים
[2-3 משפטים על הביצועים הכלליים של החודש]

### מדדים עיקריים

| מדד | חודש קודם | חודש נוכחי | שינוי |
|-----|-----------|-----------|-------|
| חשיפות בגוגל (Impressions) | X | Y | +Z% |
| קליקים מגוגל (Clicks) | X | Y | +Z% |
| שיעור הקלקה (CTR) | X% | Y% | +Z% |
| מיקום ממוצע (Avg Position) | X | Y | ↑/↓ |
| ביקורות גוגל (חדשות) | X | Y | +Z |
| דירוג ממוצע בביקורות | X.X | Y.Y | - |
| ציון מהירות (Lighthouse) | X | Y | - |

### מילות מפתח מובילות

| מילת מפתח | מיקום | חשיפות | קליקים | CTR |
|-----------|-------|---------|--------|-----|
| [מילה 1] | X | Y | Z | W% |
| [מילה 2] | X | Y | Z | W% |
| [מילה 3] | X | Y | Z | W% |

### מילות מפתח חדשות שהתגלו
- [מילה חדשה 1] - [מיקום] - [פוטנציאל]
- [מילה חדשה 2] - [מיקום] - [פוטנציאל]

### ביקורות גוגל
- ביקורות חדשות החודש: [מספר]
- דירוג ממוצע: [X.X/5]
- ביקורות שדורשות תגובה: [מספר]

### סטטוס ספריות עסקיות

| ספרייה | סטטוס | הערות |
|--------|-------|-------|
| Google Business Profile | פעיל ✅ | עדכון שעות נדרש |
| דפי זהב | פעיל ✅ | - |
| B144 | פעיל ✅ | - |
| [אחר] | [סטטוס] | [הערות] |

### בעיות שזוהו
1. [בעיה 1] - [חומרה: גבוהה/בינונית/נמוכה] - [סטטוס]
2. [בעיה 2] - [חומרה] - [סטטוס]

### ציטוטים ב-AI

| פלטפורמה | מוזכר? | מידע מדויק? |
|----------|--------|-------------|
| Google AI Overview | כן/לא | כן/לא |
| ChatGPT Search | כן/לא | כן/לא |
| Perplexity | כן/לא | כן/לא |

### המלצות לחודש הבא
1. [המלצה 1]
2. [המלצה 2]
3. [המלצה 3]

### פעולות שבוצעו החודש
- [x] [פעולה 1]
- [x] [פעולה 2]
- [ ] [פעולה שלא הושלמה - לחודש הבא]
```

### Metrics Collection Process

1. **Google Search Console**: Performance report, 28-day filter, export CSV
2. **Lighthouse**: Run in Chrome DevTools (Incognito, throttled to mobile)
3. **Google Reviews**: Count new reviews, note average rating
4. **Manual ranking check**: Primary keyword in incognito on google.co.il
5. **AI citations**: Test queries on ChatGPT, Perplexity, Google (5 minutes)
6. **Directory check**: Quick visit to top 3 directory listings (still active?)

**Time investment**: ~30-45 minutes per month for a single landing page.

---

## 7. Alerts & Troubleshooting

### Setting Up Alerts

#### Google Search Console Alerts (Automatic)
- GSC automatically sends email alerts for:
  - Manual actions (Google penalty - CRITICAL, respond immediately)
  - Security issues (malware, hacking - CRITICAL)
  - Crawl errors
  - Coverage issues
- **Ensure email is enabled**: Settings > Email preferences > All issues

#### Google Alerts (Brand Monitoring)
- Go to [google.com/alerts](https://www.google.com/alerts)
- Create alerts for:
  - `"מאפיית הבית"` (your business name in Hebrew)
  - `"Beit HaMaafia"` (English brand name if applicable)
  - `"מאפיית הבית" + ביקורת` (brand + review)
- Frequency: As-it-happens or Daily
- Language: Hebrew

#### Uptime Monitoring
- Use a free uptime monitor to ensure the site is always accessible:
  - [UptimeRobot](https://uptimerobot.com/) (free for 50 monitors)
  - [BetterUptime](https://betteruptime.com/) (free tier)
- Set up: Enter URL, set check interval to 5 minutes, enable email + SMS alerts

### Common Issues & Fixes

#### Issue: Page Drops from Google Index

**Symptoms**: `site:example.co.il` returns no results

**Diagnosis**:
1. Check GSC > URL Inspection - what status does it show?
2. Check robots.txt - is the page accidentally blocked?
3. Check for `noindex` meta tag - was it accidentally added?
4. Check Vercel deployments - did a broken deploy go live?

**Fixes**:
- Remove any `noindex` tags
- Fix robots.txt if blocking the page
- Request re-indexing via GSC URL Inspection
- Check if domain DNS is still pointing to Vercel

#### Issue: Ranking Drops Suddenly

**Symptoms**: Position drops 10+ places in a week

**Diagnosis**:
1. Was there a Google algorithm update? Check [Google Search Status Dashboard](https://status.search.google.com/)
2. Did a competitor improve their page?
3. Did your page change? (Content, schema, technical issue)
4. Did your backlinks change? (Lost important links)
5. Is it a seasonal pattern? (Check Google Trends)

**Fixes**:
- If algorithm update: review Google's guidance for the update type
- If competitor: improve your content, get more reviews, build citations
- If technical: fix the issue and re-request indexing
- If seasonal: normal, wait for the cycle to return

#### Issue: Low CTR Despite Good Position

**Symptoms**: Position 3-5 but CTR below 3%

**Diagnosis**:
1. Is the title tag compelling? Does it match search intent?
2. Is the meta description attractive? Does it include a CTA?
3. Are there rich results (stars, FAQ) pushing your listing down visually?
4. Are there many ads above organic results?

**Fixes**:
- Rewrite title tag - make it more specific and compelling in Hebrew
- Rewrite meta description - add a clear value proposition and CTA
- Add FAQ schema to get FAQ rich results (expandable questions under your listing)
- Add review schema if you have enough reviews (star ratings in search results)

#### Issue: CLS (Layout Shift) Increase

**Symptoms**: CLS score in GSC or Lighthouse rises above 0.1

**Diagnosis**:
1. Was a new image added without width/height?
2. Was a new font loaded that causes a layout shift?
3. Was a new above-the-fold component added?
4. Is there a dynamic element (ad, banner, chat widget) loading late?

**Fixes**:
- Add explicit dimensions to all images
- Use `font-display: swap` and pre-load fonts
- Reserve space for dynamic elements with CSS (min-height, aspect-ratio)

#### Issue: Site Not Appearing in Local Pack

**Symptoms**: You rank organically but not in the Google Maps 3-pack

**Diagnosis**:
1. Is your GBP verified and complete?
2. Is your business category correct and specific?
3. Is your NAP consistent across all directories?
4. Do you have enough reviews? (Competitors may have more)
5. Is your business address in the city you're targeting?

**Fixes**:
- Complete all GBP fields (especially photos, hours, services)
- Get more Google reviews (quantity + recency matter)
- Ensure NAP consistency across all citations
- Add more directory citations (see link-building-israel.md)

---

## 8. Integration with Post-Launch Phase

### Phase 8 Monitoring Calendar

```
WEEK 1 of each month:
  □ Export GSC data for previous month
  □ Run Lighthouse audit
  □ Manual ranking check for top 3 keywords
  □ Check AI citations (ChatGPT, Perplexity, Google AI)

WEEK 2:
  □ Review and respond to new Google reviews
  □ Verify top 3 directory listings are accurate
  □ Post on Google Business Profile (weekly post)

WEEK 3:
  □ Compile monthly report
  □ Identify action items for next month
  □ Send report to client (if MediaWave project)

WEEK 4:
  □ Implement any content updates identified
  □ Submit any new directory listings
  □ Plan next month's GBP posts

ONGOING (daily/as-needed):
  □ Respond to reviews within 48 hours
  □ Monitor uptime alerts
  □ Check GSC email alerts
```

### Automation Opportunities

For agencies managing multiple client sites:

| Task | Automation | Tool |
|------|-----------|------|
| Ranking tracking | Auto daily check | SE Ranking, SEMrush |
| GSC data export | API integration | Google Search Console API |
| Uptime monitoring | Auto check + alert | UptimeRobot |
| Review monitoring | Alert on new review | Google Alerts, BrightLocal |
| Report generation | Template + data pull | Google Looker Studio (free) |
| Lighthouse checks | Scheduled runs | Lighthouse CI, PageSpeed Insights API |

### Google Looker Studio Dashboard (Free)

For a visual dashboard that auto-updates:

1. Go to [Looker Studio](https://lookerstudio.google.com/)
2. Create new report
3. Add Google Search Console as data source
4. Add Google Analytics 4 as data source
5. Build visualizations:
   - Line chart: Impressions + Clicks over time
   - Table: Top queries with position and CTR
   - Scorecard: Total clicks, average position
   - Bar chart: Clicks by device (mobile vs desktop)
6. Share with client as view-only link

### When to Escalate

Contact SEO specialist or agency if:
- Manual action received in GSC (Google penalty)
- Security issue detected
- Ranking drops for ALL keywords simultaneously (not just one)
- Page completely deindexed and won't re-index
- Negative SEO attack suspected (sudden influx of spammy backlinks)

---

## Tools Quick Reference

| Tool | URL | Cost | Use For |
|------|-----|------|---------|
| Google Search Console | search.google.com/search-console | Free | Ranking data, indexing, technical issues |
| Google Analytics 4 | analytics.google.com | Free | Traffic, behavior, conversions |
| Google PageSpeed Insights | pagespeed.web.dev | Free | Core Web Vitals, performance |
| Google Rich Results Test | search.google.com/test/rich-results | Free | Schema validation |
| Google Alerts | google.com/alerts | Free | Brand monitoring |
| UptimeRobot | uptimerobot.com | Free | Uptime monitoring |
| Looker Studio | lookerstudio.google.com | Free | Visual dashboards |
| Chrome DevTools (Lighthouse) | Built into Chrome | Free | Performance audit |
| Google Mobile-Friendly Test | search.google.com/test/mobile-friendly | Free | Mobile compatibility |

---

## Sources

- [Google Search Console Help](https://support.google.com/webmasters)
- [Google Search Status Dashboard](https://status.search.google.com/)
- [Web.dev Core Web Vitals](https://web.dev/vitals/)
- [Google Looker Studio](https://lookerstudio.google.com/)
- Companion reference files: technical-seo.md, seo-checklist.md
