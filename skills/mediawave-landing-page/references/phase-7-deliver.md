# Phase 7: Deployment & Client Handoff Guide

## Complete reference for deploying Hebrew RTL landing pages and handing off to clients.

---

## 1. Deployment to Vercel

### Step-by-Step Deployment

#### 1.1 Push to GitHub

```bash
# Initialize repo (if not already)
git init
git add .
git commit -m "Initial landing page build"

# Create GitHub repo and push
gh repo create client-name-landing --private --source=. --push
```

#### 1.2 Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the GitHub repository
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: `.` (default)
5. Build command: `next build` (default)
6. Output directory: `.next` (default)

#### 1.3 Set Environment Variables

In Vercel project settings > Environment Variables, add:

| Variable | Value | Example |
|----------|-------|---------|
| `POSTGRES_URL` | Neon connection string | `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require` |
| `PAYLOAD_SECRET` | Random 32+ character string | `a7b3c9d2e5f8g1h4j6k0l3m7n2p5q8r1` |
| `NEXT_PUBLIC_SITE_URL` | Production URL | `https://www.client-domain.co.il` |
| `CRON_SECRET` | (optional) Secret for cron jobs | `random-cron-secret-string` |

**Important:** Set variables for all environments (Production, Preview, Development).

#### 1.4 Deploy and Verify

1. Click "Deploy" - Vercel runs `next build` and deploys
2. Verify the landing page loads at the Vercel preview URL (e.g., `project-name.vercel.app`)
3. Verify the admin panel works at `/admin`
4. Create the first admin user at `/admin`
5. Test form submission
6. Test WhatsApp button
7. Check mobile responsiveness

#### 1.5 Connect Custom Domain

1. In Vercel project settings > Domains
2. Add the client's domain: `www.client-domain.co.il`
3. Also add the apex domain: `client-domain.co.il`
4. Update DNS records at the domain registrar:
   - **A record**: `@` -> `76.76.21.21`
   - **CNAME record**: `www` -> `cname.vercel-dns.com`
5. Wait for DNS propagation (usually 5-30 minutes, up to 48 hours)

#### 1.6 SSL Certificate

- Vercel provides free SSL certificates automatically via Let's Encrypt
- HTTPS is enforced by default
- No manual SSL configuration needed
- Certificate auto-renews before expiration

---

## 2. Neon Database Setup

### Step-by-Step

#### 2.1 Create Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub account (recommended) or email
3. Free tier includes: 0.5 GB storage, 1 project, autosuspend after 5 min idle

#### 2.2 Create Database
1. Click "Create Project"
2. Project name: `client-name-landing`
3. Region: **AWS EU Frankfurt** (closest to Israel) or **AWS US East** (closest to Vercel default)
4. Database name: `landing_page` (or default `neondb`)
5. Click "Create Project"

#### 2.3 Get Connection String
1. In the Neon dashboard, find the connection string
2. Format: `postgresql://username:password@ep-xxxx-xxxx-xxxx.region.aws.neon.tech/dbname?sslmode=require`
3. Copy the **pooled connection string** (recommended for serverless)
4. Add `?sslmode=require` if not already present

#### 2.4 Run Payload Migrations

```bash
# Generate migration files
npx payload migrate:create

# Run migrations against Neon database
POSTGRES_URL="postgresql://..." npx payload migrate
```

Or configure in `package.json`:
```json
{
  "scripts": {
    "payload:migrate": "payload migrate",
    "payload:migrate:create": "payload migrate:create"
  }
}
```

#### 2.5 Neon Configuration Tips
- Enable **autosuspend** to save compute on the free tier (resumes in ~500ms)
- Enable **connection pooling** for better serverless performance
- Branching feature (paid) is useful for staging environments
- Monitor storage usage in dashboard

---

## 3. Analytics Setup

### 3.1 Google Analytics 4 (GA4)

#### Create GA4 Property
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create new property
3. Select "Web" as platform
4. Enter the domain
5. Get the Measurement ID (format: `G-XXXXXXXXXX`)

#### Integrate in Next.js

```tsx
// app/(frontend)/layout.tsx - Add to <head>
import Script from 'next/script'

// Inside the layout component, before closing </head> or after <body>:
<>
  <Script
    strategy="afterInteractive"
    src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  />
  <Script
    id="google-analytics"
    strategy="afterInteractive"
    dangerouslySetInnerHTML={{
      __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('consent', 'default', {
          'analytics_storage': 'granted'
        });
        gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
          page_title: document.title,
          page_location: window.location.href,
        });
      `,
    }}
  />
</>
```

Add to `.env.local`:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### Track Conversions

```tsx
// utils/analytics.ts
export function trackFormSubmit() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'generate_lead', {
      event_category: 'form',
      event_label: 'contact_form',
      value: 1,
    })
  }
}

export function trackWhatsAppClick() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'contact', {
      event_category: 'whatsapp',
      event_label: 'whatsapp_click',
      value: 1,
    })
  }
}

export function trackCTAClick(ctaName: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'cta_click', {
      event_category: 'engagement',
      event_label: ctaName,
    })
  }
}
```

```tsx
// In ContactForm.tsx, after successful submission:
import { trackFormSubmit } from '@/utils/analytics'

// Inside handleSubmit, after successful response:
trackFormSubmit()

// In WhatsAppButton.tsx:
import { trackWhatsAppClick } from '@/utils/analytics'

<a
  href={whatsappUrl}
  onClick={trackWhatsAppClick}
  // ...
>
```

### 3.2 Facebook Pixel (Optional)

For clients running Facebook/Instagram ad campaigns:

```tsx
// app/(frontend)/layout.tsx
<Script
  id="facebook-pixel"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
      fbq('track', 'PageView');
    `,
  }}
/>
```

Track conversions:
```tsx
// On form submit:
if (typeof window !== 'undefined' && window.fbq) {
  window.fbq('track', 'Lead')
}

// On WhatsApp click:
if (typeof window !== 'undefined' && window.fbq) {
  window.fbq('track', 'Contact')
}
```

### 3.3 Conversion Event Summary

| Event | Trigger | GA4 Event | FB Pixel Event |
|-------|---------|-----------|---------------|
| Form submitted | Contact form success | `generate_lead` | `Lead` |
| WhatsApp clicked | WhatsApp button click | `contact` | `Contact` |
| CTA clicked | Any CTA button click | `cta_click` | `ViewContent` |
| Phone number clicked | Phone link click | `click` (phone) | `Contact` |

---

## 4. Client Handoff Document

### The following document should be delivered to the client in Hebrew. Save as a PDF or formatted document.

---

## מדריך שימוש - פאנל ניהול האתר

### כניסה לפאנל הניהול

1. **כתובת הגישה:** `https://www.your-domain.co.il/admin`
2. **שם משתמש:** (האימייל שלכם)
3. **סיסמה:** (הסיסמה שנקבעה בהתקנה)
4. **שכחתם סיסמה?** לחצו על "Forgot Password" במסך הכניסה

### כניסה ראשונה
בפעם הראשונה שנכנסים לפאנל, המערכת תבקש ליצור משתמש ראשון. הזינו:
- כתובת אימייל
- סיסמה חזקה (מינימום 8 תווים, עם אותיות ומספרים)

---

### עריכת תוכן העמוד

#### שינוי כותרות וטקסטים
1. בפאנל, לחצו על **"Site Settings"** בתפריט הצדדי
2. תראו את כל הטקסטים של האתר מסודרים לפי אזורים
3. ערכו את הטקסט הרצוי
4. **חשוב:** לחצו **"Save"** בפינה הימנית העליונה

#### אזור ה-Hero (הכותרת הראשית)
- **כותרת ראשית:** המשפט הגדול שמופיע ראשון באתר
- **כותרת משנה:** הטקסט הקטן יותר מתחת לכותרת
- **טקסט כפתור:** מה כתוב על הכפתור הראשי (למשל: "קבלו הצעת מחיר")
- **תמונת רקע:** ניתן להחליף את תמונת הרקע

#### אזור היתרונות (Features)
- **כותרת האזור:** למשל "למה לבחור בנו"
- **כל יתרון כולל:** אייקון, כותרת, ותיאור קצר
- ניתן לערוך, להוסיף, או למחוק יתרונות

---

### ניהול המלצות

1. בפאנל, לחצו על **"Testimonials"** בתפריט הצדדי
2. תראו את רשימת כל ההמלצות

#### הוספת המלצה חדשה
1. לחצו על **"Create New"**
2. מלאו את השדות:
   - **שם הלקוח:** השם שיוצג
   - **תפקיד/חברה:** (אופציונלי)
   - **ציטוט:** הטקסט של ההמלצה
   - **דירוג:** מספר כוכבים (1-5)
   - **תמונה:** (אופציונלי) תמונת הלקוח
3. לחצו **"Save"**

#### עריכת המלצה קיימת
1. לחצו על ההמלצה ברשימה
2. ערכו את השדות הרצויים
3. לחצו **"Save"**

#### מחיקת המלצה
1. לחצו על ההמלצה
2. גללו לתחתית
3. לחצו **"Delete"** ואשרו

---

### ניהול שאלות נפוצות (FAQ)

1. בפאנל, לחצו על **"FAQ Items"** בתפריט הצדדי

#### הוספת שאלה חדשה
1. לחצו על **"Create New"**
2. מלאו:
   - **שאלה:** הטקסט של השאלה
   - **תשובה:** הטקסט של התשובה
   - **סדר:** מספר שקובע את סדר ההצגה (1 = ראשון)
3. לחצו **"Save"**

#### עריכה ומחיקה
- זהה לתהליך של המלצות (לחיצה על הפריט > עריכה > שמירה)

---

### החלפת תמונות

1. בפאנל, לחצו על **"Media"** בתפריט הצדדי
2. תראו את כל התמונות באתר

#### העלאת תמונה חדשה
1. לחצו **"Create New"**
2. גררו תמונה או לחצו לבחירת קובץ
3. **חובה:** הכניסו תיאור לתמונה (Alt Text) - חשוב לנגישות ו-SEO
4. לחצו **"Save"**

#### המלצות לתמונות
- **תמונת Hero:** מינימום 1920x1080 פיקסלים
- **תמונות כלליות:** מינימום 800x600 פיקסלים
- **תמונות לקוחות:** מינימום 200x200 פיקסלים, רצוי ריבועיות
- **פורמט מומלץ:** JPG או WebP
- **גודל מקסימלי:** עד 5MB לתמונה

---

### עדכון פרטי העסק

1. בפאנל, לחצו על **"Site Settings"**
2. חפשו את אזור "פרטי העסק":
   - **שם העסק:** השם שמופיע בכותרת ובפוטר
   - **טלפון:** מספר הטלפון שמוצג באתר
   - **אימייל:** כתובת האימייל ליצירת קשר
   - **כתובת:** הכתובת הפיזית (אם רלוונטי)
   - **מספר WhatsApp:** המספר לכפתור הוואטסאפ (בפורמט בינלאומי)
3. לחצו **"Save"**

---

### צפייה בפניות שהתקבלו

1. בפאנל, לחצו על **"Form Submissions"**
2. תראו את כל הפניות שהתקבלו דרך טופס יצירת הקשר
3. כל פנייה כוללת: שם, טלפון, אימייל, הודעה, ותאריך שליחה
4. **טיפ:** בדקו את הפניות באופן יומי כדי לא לפספס לקוחות!

---

### מה לא לגעת

> **חשוב מאוד!** הדברים הבאים הם חלק מהקוד והגדרות טכניות. שינוי שלהם עלול לגרום לתקלות באתר.

- **אל תשנו** הגדרות ב-Settings שלא מוזכרות במדריך זה
- **אל תמחקו** את משתמש ה-Admin האחרון
- **אל תשנו** slugs של collections (השמות הטכניים)
- **אם משהו נשבר** - צרו קשר איתנו מיד, אל תנסו לתקן לבד

---

### צריכים עזרה?

- **טלפון:** XXX-XXX-XXXX
- **וואטסאפ:** XXX-XXX-XXXX
- **אימייל:** support@mediawave.co.il
- **שעות תמיכה:** ימים א'-ה', 09:00-18:00

---

## 5. Pre-Launch Checklist

### These are Tier 4 questions asked via AskUserQuestion before final deployment.

| # | Check Item | Status | Notes |
|---|-----------|--------|-------|
| Q23 | **כל התוכן נבדק ואושר?** - All content reviewed and approved by client | YES / NO | Must be YES to launch |
| Q24 | **גרסת מובייל נבדקה?** - Mobile version verified on real device | YES / NO | Test on iPhone + Android |
| Q25 | **כל כפתורי ה-CTA עובדים?** - All CTAs functional (forms, WhatsApp, phone) | YES / NO | Click every button |
| Q26 | **העמוד נטען תוך 3 שניות?** - Page loads under 3 seconds | YES / NO | Test via PageSpeed Insights |
| Q27 | **המסר תואם למקור התנועה?** - Message matches traffic source (ad, social, search) | YES / NO | "Message match" principle |
| Q28 | **מדיניות פרטיות קיימת?** - Privacy policy / terms present | YES / NO | Legal requirement |
| Q29 | **מעקב אנליטיקס מותקן?** - Analytics tracking installed and verified | YES / NO | GA4 real-time test |

### Checklist Execution Flow:
1. Present all 7 items to the client
2. If any item is NO, address it before launch
3. ALL items must be YES before deploying to production domain
4. Document the checklist completion with timestamps

---

## 6. Post-Launch Monitoring

### Immediate (First 24 Hours)

- [ ] Verify site loads on production domain
- [ ] Check SSL certificate is active (green lock in browser)
- [ ] Submit a test form and verify it appears in admin panel
- [ ] Click WhatsApp button and verify it opens with correct number
- [ ] Test phone number link on mobile device
- [ ] Check Google Analytics real-time report shows visits
- [ ] Run [PageSpeed Insights](https://pagespeed.web.dev/) and note scores
- [ ] Run [Lighthouse](https://developer.chrome.com/docs/lighthouse/) audit (aim for 90+ on all categories)

### First Week

- [ ] Monitor form submissions daily
- [ ] Check analytics for bounce rate, session duration, conversion rate
- [ ] Verify mobile vs. desktop traffic split
- [ ] Check for 404 errors in Vercel logs
- [ ] Verify social media sharing shows correct preview (Open Graph)
- [ ] Test the page from different networks (WiFi, mobile data)

### Ongoing Monthly

- [ ] Check Vercel deployment health
- [ ] Review analytics trends (traffic, conversions, bounce rate)
- [ ] Check Neon database storage usage
- [ ] Verify SSL certificate renewal (automatic on Vercel)
- [ ] Review and respond to new form submissions
- [ ] Update testimonials with fresh customer reviews
- [ ] Update FAQ based on common customer questions

---

## 7. Lighthouse Score Targets

| Category | Target | Notes |
|----------|--------|-------|
| Performance | 90+ | Image optimization, font loading, minimal JS |
| Accessibility | 95+ | Proper `lang`, `dir`, alt text, color contrast |
| Best Practices | 95+ | HTTPS, no console errors, safe links |
| SEO | 95+ | Meta tags, structured data, mobile-friendly |

### Common Fixes for Low Scores

**Performance:**
- Use `next/image` with proper `sizes` attribute
- Add `priority` to hero image only
- Minimize client-side JavaScript
- Use font `display: 'swap'`
- Ensure Tailwind purges unused CSS

**Accessibility:**
- All images have descriptive `alt` text in Hebrew
- Color contrast ratio meets WCAG AA (4.5:1 for body text, 3:1 for large text)
- All interactive elements have focus styles
- Form inputs have associated labels
- `aria-expanded` on accordion items
- `lang="he"` and `dir="rtl"` on `<html>`

**SEO:**
- Unique, descriptive `<title>` tag
- `<meta name="description">` with Hebrew text
- Open Graph tags for social sharing
- FAQ schema markup (JSON-LD)
- Canonical URL
- Mobile-friendly viewport meta tag

---

## 8. Environment Variables Reference

### Required

| Variable | Where | Description |
|----------|-------|-------------|
| `POSTGRES_URL` | Vercel + `.env.local` | Neon database connection string |
| `PAYLOAD_SECRET` | Vercel + `.env.local` | Secret key for Payload CMS authentication |
| `NEXT_PUBLIC_SITE_URL` | Vercel + `.env.local` | Full production URL including protocol |

### Optional

| Variable | Where | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_GA_ID` | Vercel + `.env.local` | Google Analytics 4 Measurement ID |
| `NEXT_PUBLIC_FB_PIXEL_ID` | Vercel + `.env.local` | Facebook Pixel ID |
| `SMTP_HOST` | Vercel | Email server for form notifications |
| `SMTP_USER` | Vercel | Email username |
| `SMTP_PASS` | Vercel | Email password |
| `NOTIFICATION_EMAIL` | Vercel | Email to receive form notifications |

---

## 9. Domain & DNS Quick Reference

### Israeli Domain Registrars
- **InterSpace** (interspace.net) - `.co.il` domains
- **Domain The Net** (domaintheNet.com) - `.co.il` domains
- **Namecheap** - international domains (.com, .net, etc.)

### DNS Records for Vercel

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | 3600 |
| CNAME | www | cname.vercel-dns.com | 3600 |

### Verifying DNS Propagation
```bash
# Check A record
nslookup client-domain.co.il

# Check CNAME
nslookup www.client-domain.co.il

# Or use online tool: dnschecker.org
```

---

## 10. Backup & Recovery

### What Vercel Handles
- Automatic deployments from Git
- Instant rollback to any previous deployment
- Edge network and CDN caching

### What Needs Manual Backup
- **Neon database**: Enable point-in-time recovery (PITR) on paid plan, or schedule manual exports
- **Uploaded media**: If using local storage, ensure media directory is in Git; if using cloud storage (UploadThing, S3), data is persisted there
- **Environment variables**: Keep a secure copy of all env vars in a password manager

### Rollback Procedure
1. Go to Vercel dashboard > Deployments
2. Find the last working deployment
3. Click "..." menu > "Promote to Production"
4. Site instantly reverts to that deployment
