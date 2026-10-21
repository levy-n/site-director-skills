# Post-Launch Monitoring Reference

> **Addition 7** - Automated health checks, analytics summary, and reporting for Hebrew RTL landing pages.
> Context-aware: adapts monitoring level to client's budget, generates Hebrew reports.

---

## Overview

The first 7 days after launch are critical. This reference covers:

1. Automated health checks (performance, uptime, SSL, broken assets, forms)
2. Analytics collection and summary
3. Hebrew report generation
4. Ongoing monitoring setup options

---

## Automated Health Checks

### 1. Lighthouse Performance Scores

Run Lighthouse from the command line to get performance, accessibility, SEO, and best practices scores.

**Command (local machine):**
```bash
npx lighthouse [URL] --output=json --output=html --output-path=./lighthouse-report --chrome-flags="--headless" --locale=he
```

**Target scores:**
| Category | Target | Action if below |
|----------|--------|-----------------|
| Performance | 90+ | Optimize images, reduce JS bundle, check LCP |
| Accessibility | 90+ | Fix contrast, ARIA labels, alt text |
| SEO | 90+ | Check meta tags, sitemap, robots.txt |
| Best Practices | 90+ | Fix console errors, HTTPS issues |

**Lighthouse CI (for recurring checks):**
```bash
npm install -g @lhci/cli@0.15.x
```

Create `lighthouserc.js` at project root:
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['[SITE_URL]'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouseci',
    },
  },
};
```

Run: `lhci autorun`

### 2. PageSpeed Insights API (Free, No Key Required)

**Command:**
```bash
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=[URL]&strategy=mobile&locale=he" -o pagespeed-mobile.json
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=[URL]&strategy=desktop&locale=he" -o pagespeed-desktop.json
```

**Extract key metrics with Node.js:**
```javascript
const data = require('./pagespeed-mobile.json');
const metrics = data.lighthouseResult.audits;

console.log('LCP:', metrics['largest-contentful-paint'].displayValue);
console.log('CLS:', metrics['cumulative-layout-shift'].displayValue);
console.log('TBT:', metrics['total-blocking-time'].displayValue);
console.log('FCP:', metrics['first-contentful-paint'].displayValue);
console.log('Speed Index:', metrics['speed-index'].displayValue);
console.log('Performance Score:', data.lighthouseResult.categories.performance.score * 100);
```

### 3. Uptime Monitoring

**Option A: UptimeRobot (Recommended Free Tier)**

- Free plan: 50 monitors, 5-minute check interval
- Alerts via email, Telegram, Slack, SMS
- Status page included

**Setup via API:**
```bash
curl -X POST "https://api.uptimerobot.com/v2/newMonitor" ^
  -H "Content-Type: application/json" ^
  -d "{\"api_key\":\"[YOUR_API_KEY]\",\"friendly_name\":\"[BUSINESS_NAME]\",\"url\":\"[SITE_URL]\",\"type\":1,\"alert_contacts\":\"[ALERT_CONTACT_ID]\"}"
```

Monitor types:
- `type: 1` = HTTP(s) - checks if site returns 200
- `type: 3` = Keyword - checks if specific text appears on page
- `type: 4` = Port - checks if port is open
- `type: 5` = Heartbeat/Cron - for scheduled tasks

**Get uptime stats:**
```bash
curl -X POST "https://api.uptimerobot.com/v2/getMonitors" ^
  -H "Content-Type: application/json" ^
  -d "{\"api_key\":\"[YOUR_API_KEY]\",\"monitors\":\"[MONITOR_ID]\",\"custom_uptime_ratios\":\"7\"}"
```

**Option B: Quick Manual Check**
```bash
curl -o /dev/null -s -w "HTTP Status: %%{http_code}\nTime Total: %%{time_total}s\nTime Connect: %%{time_connect}s\n" [SITE_URL]
```

### 4. SSL Certificate Check

```bash
curl -vI https://[DOMAIN] 2>&1 | findstr "expire date"
```

Or with OpenSSL (if available):
```bash
echo | openssl s_client -servername [DOMAIN] -connect [DOMAIN]:443 2>/dev/null | openssl x509 -noout -dates
```

**Vercel SSL note:** Vercel auto-renews SSL certificates. This check is mainly for
custom domain configurations or if the client moved DNS away from Vercel.

### 5. Broken Images Check

**Node.js script - save as `scripts/check-images.mjs`:**
```javascript
import { JSDOM } from 'jsdom';

const url = process.argv[2] || '[SITE_URL]';

async function checkImages() {
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);
  const images = dom.window.document.querySelectorAll('img');

  console.log(`Found ${images.length} images on ${url}\n`);

  let broken = 0;
  for (const img of images) {
    const src = img.getAttribute('src');
    if (!src) {
      console.log(`  ❌ Image with no src: ${img.outerHTML.substring(0, 80)}`);
      broken++;
      continue;
    }

    const fullUrl = src.startsWith('http') ? src : new URL(src, url).href;
    try {
      const imgResponse = await fetch(fullUrl, { method: 'HEAD' });
      if (!imgResponse.ok) {
        console.log(`  ❌ ${imgResponse.status} - ${fullUrl}`);
        broken++;
      } else {
        console.log(`  ✅ ${fullUrl}`);
      }
    } catch (err) {
      console.log(`  ❌ FAILED - ${fullUrl} - ${err.message}`);
      broken++;
    }
  }

  console.log(`\nResult: ${images.length - broken}/${images.length} images OK`);
  if (broken > 0) console.log(`⚠️ ${broken} broken image(s) found!`);
}

checkImages();
```

Run: `node scripts/check-images.mjs [SITE_URL]`

### 6. Contact Form Test

**Automated POST to form endpoint:**
```bash
curl -X POST "[SITE_URL]/api/form-submissions" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@mediawave.co.il\",\"phone\":\"0501234567\",\"message\":\"Automated form test - please ignore\"}"
```

**Verify:**
1. Check HTTP response is 200/201
2. Check Payload admin panel: `[SITE_URL]/admin/collections/form-submissions`
3. Check if email notification was sent (if configured)
4. Delete the test submission after verification

### 7. WhatsApp Link Verification

```bash
curl -o /dev/null -s -w "HTTP Status: %%{http_code}\nRedirect URL: %%{redirect_url}\n" "https://wa.me/972XXXXXXXXX"
```

Expected: HTTP 301 or 302 redirect. If 404, the phone number format is wrong.

**Common WhatsApp link issues:**
- Missing country code: use `972` not `0`
- Leading zero in number: `972501234567` not `9720501234567`
- Spaces or dashes: no spaces, no dashes

### 8. Load Time from Israel

**Option A: PageSpeed Insights with Hebrew locale**
```bash
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=[URL]&strategy=mobile&locale=he" -o pagespeed-israel.json
```

**Option B: WebPageTest from specific location**
Use [webpagetest.org](https://www.webpagetest.org/) with:
- Test Location: "Israel - EC2" or closest available
- Browser: Chrome
- Connection: 4G

**Option C: Vercel Analytics**
If on Vercel, enable Analytics in the dashboard. It shows Real Experience Score
with geographic breakdown - look for visitors from Israel specifically.

---

## Analytics Summary (After 7 Days)

### Metrics to Collect

| Metric | Source | What it tells you |
|--------|--------|-------------------|
| Total unique visitors | GA4 / Vercel Analytics | Overall reach |
| Page views | GA4 / Vercel Analytics | Engagement depth |
| Top traffic sources | GA4 | Where visitors come from (direct, social, search, referral) |
| Device breakdown | GA4 | Mobile vs desktop vs tablet split |
| Bounce rate | GA4 | % who leave without interaction |
| Avg session duration | GA4 | How long visitors stay |
| Form submissions | Payload CMS admin | Conversion count |
| WhatsApp clicks | GA4 events / custom tracking | CTA effectiveness |
| Phone call clicks | GA4 events | If tel: links are tracked |

### Collecting from GA4

If GA4 is set up, use the GA4 dashboard or API:
- **Realtime:** GA4 > Reports > Realtime
- **7-day summary:** GA4 > Reports > Acquisition > Traffic acquisition (set date range)
- **Device info:** GA4 > Reports > Tech > Tech details

### Collecting from Vercel Analytics

If using Vercel Analytics (free tier):
- Dashboard: vercel.com > Project > Analytics tab
- Shows: visitors, page views, top pages, referrers, countries, devices
- Web Vitals: LCP, FID, CLS real user data

### Collecting from Payload CMS

Form submissions count:
1. Go to `[SITE_URL]/admin/collections/form-submissions`
2. Count total entries (filter by date range if needed)
3. Or query via API: `GET [SITE_URL]/api/form-submissions?where[createdAt][greater_than]=[START_DATE]`

---

## Report Generation

Use `templates/week1-report-he.md` (File 5 of this addition) to generate the Hebrew report.

### Auto-Fill Logic

Claude Code fills the template by:

1. Running Lighthouse and extracting scores
2. Querying PageSpeed Insights API for Core Web Vitals
3. Querying UptimeRobot API for uptime percentage
4. Checking SSL, images, form, WhatsApp link
5. Pulling analytics from GA4 / Vercel (operator provides access or screenshot)
6. Counting form submissions from Payload admin

### Status Emoji Logic

```
Score >= 90 or metric in green range  → ✅
Score 70-89 or metric in yellow range → ⚠️
Score < 70 or metric in red range     → ❌
```

**Specific thresholds:**

| Metric | Green ✅ | Yellow ⚠️ | Red ❌ |
|--------|---------|----------|------|
| Lighthouse Performance | 90-100 | 70-89 | <70 |
| Lighthouse Accessibility | 90-100 | 70-89 | <70 |
| Lighthouse SEO | 90-100 | 70-89 | <70 |
| LCP | <2.5s | 2.5-4.0s | >4.0s |
| CLS | <0.1 | 0.1-0.25 | >0.25 |
| Uptime | 99.9%+ | 99.0-99.9% | <99.0% |
| Bounce Rate | <50% | 50-70% | >70% |

### Recommendations Engine

Based on findings, auto-generate Hebrew recommendations:

```javascript
const recommendations = [];

if (perfScore < 90) {
  recommendations.push('מומלץ לבצע אופטימיזציה נוספת לתמונות כדי לשפר את ציון המהירות');
}
if (bounceRate > 70) {
  recommendations.push('שיעור נטישה גבוה - מומלץ לבדוק התאמה בין המודעה לעמוד הנחיתה');
}
if (formSubmissions === 0) {
  recommendations.push('לא התקבלו פניות - מומלץ לבדוק שהטופס עובד ושה-CTA בולט מספיק');
}
if (mobilePercent > 70 && perfScoreMobile < 85) {
  recommendations.push('רוב המבקרים גולשים מהנייד - שיפור מהירות במובייל הוא קריטי');
}
if (whatsappClicks === 0) {
  recommendations.push('אין לחיצות על כפתור וואטסאפ - מומלץ לבדוק שהקישור עובד ושהכפתור בולט');
}
if (uptimePercent < 99.9) {
  recommendations.push('זוהו בעיות זמינות - מומלץ לבדוק את לוג השגיאות ב-Vercel');
}
if (sslDaysLeft < 30) {
  recommendations.push('תעודת SSL תפוג בקרוב - יש לבדוק חידוש אוטומטי');
}
if (indexStatus === 'not_indexed') {
  recommendations.push('האתר עדיין לא מופיע בגוגל - מומלץ לשלוח את ה-sitemap ל-Google Search Console');
}
```

---

## Monitoring Setup Options

### Option 1: Free Basic (Recommended Default)

| Component | Tool | Setup |
|-----------|------|-------|
| Uptime | UptimeRobot Free | 50 monitors, 5-min interval, email alerts |
| Analytics | Vercel Analytics Free | Basic visitor stats, Web Vitals |
| Performance | Manual Lighthouse | Run before/after changes |

**Cost:** $0/month
**Effort:** 15 minutes initial setup, manual checks as needed

### Option 2: Free Full

| Component | Tool | Setup |
|-----------|------|-------|
| Uptime | UptimeRobot Free | Same as above |
| Analytics | GA4 + Vercel Analytics | Full traffic analysis |
| SEO | Google Search Console | Index status, search queries, errors |
| Performance | PageSpeed Insights API | Automated via cron or CI |

**Cost:** $0/month
**Effort:** 45 minutes initial setup, weekly review

### Option 3: Paid Professional

| Component | Tool | Cost | Features |
|-----------|------|------|----------|
| Uptime | Better Uptime or Checkly | ~$20/mo | 30-second checks, status page, incident management |
| Analytics | GA4 + Plausible | ~$9/mo | Privacy-friendly, simple dashboard |
| Performance | DebugBear or Calibre | ~$14/mo | Continuous Lighthouse, historical trends |
| SEO | Google Search Console (free) | $0 | Search performance |

**Cost:** ~$30-45/month
**Effort:** 30 minutes setup, mostly automated

### Option 4: Monthly Retainer Service

Offer the client a monthly retainer that includes:
- Weekly performance check
- Monthly report (auto-generated from template)
- Priority support for content changes
- Uptime monitoring + instant alerts

**Suggested pricing:** 200-500₪/month depending on scope

---

## Interactive Questions (Post-Deployment)

Ask these after the site is deployed to production:

### Question 1: Monitoring Level
```
What level of monitoring should we set up?
1. Free tier only - UptimeRobot + Vercel Analytics (recommended minimum)
2. Free full - add GA4 + Search Console (best free option)
3. Paid service - Better Uptime / Checkly (~$20/mo)
4. Manual only - I'll check manually when needed
```

### Question 2: Analytics Setup
```
What analytics are already set up?
1. GA4 is configured - give me the measurement ID
2. Plausible - give me the domain
3. Both GA4 and Plausible
4. None - set up basic analytics now
5. Vercel Analytics only (already enabled)
```

### Question 3: Report Delivery
```
How should we handle the post-launch report?
1. Auto-generate weekly for the first month, I'll send to client
2. Generate first-week report only, then stop
3. I'll forward the report manually each time
4. Set up automated email delivery to client
```

### Question 4: Monthly Retainer
```
Should we offer a monthly retainer to the client?
1. Client already accepted - [PRICE]₪/month
2. Client declined - one-time handoff only
3. Haven't offered yet - remind me to include it in handoff
4. Not appropriate for this client
```

---

## File Storage Convention

```
[PROJECT_ROOT]/
└── .context/
    └── monitoring/
        ├── lighthouse-report.html     # Latest Lighthouse report
        ├── lighthouse-report.json     # Latest Lighthouse JSON data
        ├── pagespeed-mobile.json      # Latest PageSpeed mobile results
        ├── pagespeed-desktop.json     # Latest PageSpeed desktop results
        ├── week1-report.md            # Generated week-1 Hebrew report
        └── monitoring-config.md       # Which tools are set up
```

---

## Quick Reference: Post-Launch Checklist

Run through this checklist within 24 hours of deployment:

```
□ Lighthouse score 90+ on all categories
□ Mobile PageSpeed score 90+
□ LCP < 2.5s, CLS < 0.1
□ UptimeRobot monitor created and active
□ SSL certificate valid and auto-renewing
□ All images loading correctly (no 404s)
□ Contact form submits successfully
□ Form notification emails arriving
□ WhatsApp link opens correct number
□ Google Search Console verified + sitemap submitted
□ Analytics tracking confirmed (test with real visit)
□ Custom domain resolving correctly
□ www → non-www redirect working (or vice versa)
□ 404 page renders correctly
□ Open Graph / social sharing tags working
□ favicon and web manifest present
```

---

## Sources

- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Automated Lighthouse for CI/CD
- [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started) - Free performance API
- [UptimeRobot](https://uptimerobot.com/) - Free uptime monitoring (50 monitors)
- [UptimeRobot API](https://uptimerobot.com/api/) - REST API for automation
- [web.dev Lighthouse CI Guide](https://web.dev/articles/lighthouse-ci) - Setup walkthrough
- [WebPageTest](https://www.webpagetest.org/) - Free performance testing from global locations
