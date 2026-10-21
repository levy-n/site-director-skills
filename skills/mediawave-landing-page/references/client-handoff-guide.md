# Client Handoff Guide Reference

> **Addition 8** - Comprehensive handoff documentation for Hebrew RTL landing pages.
> Context-aware: adapts guide complexity to client's technical level.

---

## Overview

The handoff is the final touchpoint with the client. A professional handoff:

1. Empowers the client to manage their own content
2. Protects you from "how do I..." support requests
3. Sets clear expectations about ongoing maintenance
4. Creates an opportunity to offer monthly retainers
5. Leaves a lasting professional impression

---

## Handoff Package Components

Every client receives ALL of these, adapted to their technical level:

### Component 1: CMS Guide (Payload CMS)

Step-by-step instructions for managing content. Each step includes Hebrew captions
and should be accompanied by screenshots (generated during the live walkthrough).

#### Step 1: Login to Admin Panel
```
1. גלוש/י ל: [SITE_URL]/admin
2. הכנס/י את האימייל והסיסמה שנשלחו אליך
3. לוח הבקרה ייפתח - זהו מרכז הניהול של האתר
```

#### Step 2: Dashboard Overview
```
תפריט הצד כולל:
- עמודים - עריכת תוכן העמודים
- מדיה - תמונות וקבצים
- חוות דעת - המלצות לקוחות
- שאלות נפוצות - שאלות ותשובות
- פניות - טפסים שהתקבלו מהאתר
- הגדרות האתר - פרטי עסק, טלפון, שעות פעילות
```

#### Step 3: Edit Page Text
```
1. בתפריט הצדדי → לחצ/י על "עמודים"
2. בחר/י את העמוד שרוצים לערוך
3. גלול/י לבלוק הרלוונטי (כותרת, שירותים, יתרונות וכו')
4. לחצ/י על שדה הטקסט ← ערוך/י
5. לחצ/י "שמור" בפינה העליונה
6. רענן/י את האתר כדי לראות את השינוי
```

#### Step 4: Replace an Image
```
1. בתפריט → לחצ/י על "מדיה"
2. לחצ/י "צור חדש" → העלה/י את התמונה החדשה
3. חזור/י לעמוד הרלוונטי
4. לחצ/י על שדה התמונה → "בחר מדיה קיימת"
5. בחר/י את התמונה החדשה שהעלית
6. חשוב: מלא/י את שדה "טקסט חלופי" (alt) - זה חשוב לנגישות ו-SEO

טיפ לתמונות:
- פורמט מומלץ: WebP או JPG
- גודל מומלץ: עד 500KB
- רזולוציה: 1200px רוחב מקסימלי
```

#### Step 5: Add a Testimonial
```
1. בתפריט → לחצ/י על "חוות דעת"
2. לחצ/י "צור חדש"
3. מלא/י את השדות:
   - שם הלקוח/ה
   - תפקיד / שם העסק
   - ציטוט (חוות הדעת עצמה)
   - דירוג (1-5 כוכבים)
   - תמונה (אופציונלי)
4. לחצ/י "שמור"
5. חוות הדעת תופיע אוטומטית באתר
```

#### Step 6: Edit FAQ
```
1. בתפריט → לחצ/י על "שאלות נפוצות"
2. לעריכה: בחר/י שאלה קיימת ← ערוך/י ← שמור/י
3. להוספה: לחצ/י "צור חדש" ← מלא/י שאלה + תשובה ← שמור/י
4. למחיקה: פתח/י את השאלה ← גלול/י למטה ← "מחק"
5. סדר השאלות נקבע לפי שדה "סדר" (מספר נמוך = מופיע קודם)
```

#### Step 7: Update Contact Info
```
1. בתפריט → לחצ/י על "הגדרות האתר"
2. עדכנ/י את השדות הרלוונטיים:
   - טלפון
   - אימייל
   - כתובת
   - שעות פעילות
   - קישורי רשתות חברתיות
3. לחצ/י "שמור"
4. השינויים ישתקפו בכל האתר (הדר, פוטר, עמוד צור קשר)
```

#### Step 8: View Form Submissions
```
1. בתפריט → לחצ/י על "פניות"
2. תראה/י רשימה של כל מי ששלח טופס מהאתר
3. לחצ/י על פנייה לראות פרטים מלאים
4. ניתן לסנן לפי תאריך או לחפש לפי שם
```

#### "WHAT NOT TO TOUCH" Section (CRITICAL)

Include this prominently in every handoff:

```
⚠️ מה לא לגעת ⚠️

אל תשנ/י את הדברים הבאים (זה עלול לשבור את האתר):

❌ אל תשנ/י את שדה "Slug" (כתובת URL) של עמודים
❌ אל תמחק/י בלוקים שלמים - רק ערוך/י את התוכן שבתוכם
❌ אל תשנ/י הגדרות משתמשים או הרשאות
❌ אל תמחק/י את אוסף "הגדרות האתר"
❌ אל תשנ/י שדות שנראים טכניים (קוד, מזהים, API)

אם משהו לא עובד כמצופה:
1. אל תנסה/י לתקן - זה עלול להחמיר
2. צור/י קשר עם MediaWave
3. נתקן את זה מהר
```

---

### Component 2: Credentials Document (Secure Delivery)

**SECURITY WARNING:** Never send credentials in plain email.

```markdown
# פרטי גישה - [BUSINESS_NAME]
## ⚠️ מסמך חסוי - שמור/י במקום בטוח

### ניהול האתר (Payload CMS)
- כתובת: [SITE_URL]/admin
- אימייל: [ADMIN_EMAIL]
- סיסמה: [ADMIN_PASSWORD]

### אחסון (Vercel) - אם רלוונטי
- כתובת: vercel.com
- חשבון: [EMAIL]
- סיסמה: [PASSWORD]

### דומיין - אם רלוונטי
- רשם: [REGISTRAR_NAME]
- כתובת ניהול: [REGISTRAR_URL]
- חשבון: [EMAIL]
- סיסמה: [PASSWORD]

### אנליטיקס - אם רלוונטי
- כלי: [GA4 / Plausible / Vercel Analytics]
- כתובת: [URL]
- חשבון: [EMAIL]
```

**Secure delivery methods (in order of preference):**

1. **WhatsApp disappearing message** - set to 24 hours, then the client saves credentials locally
2. **Phone call** - read credentials aloud, client writes them down
3. **Password manager share** - 1Password, Bitwarden shared vault
4. **Encrypted document** - password-protected PDF, share PDF and password separately
5. **NEVER plain email** - emails are stored forever, forwarded, compromised

**Hebrew message to accompany credentials:**
```
שלום [CLIENT_NAME],

מצורפים פרטי הגישה לאתר שלך.

⚠️ חשוב:
- שמור/י את הפרטים במקום בטוח
- אל תשלח/י אותם באימייל רגיל
- אם שכחת סיסמה - צור/י קשר ואאפס לך

הסיסמה הזמנית תפוג בעוד 7 ימים - מומלץ להחליף לסיסמה משלך.
```

---

### Component 3: Quick Reference Card (Single Page)

A one-page summary the client can print or save to phone favorites.

```markdown
╔══════════════════════════════════════╗
║      [BUSINESS_NAME] - האתר שלך      ║
╠══════════════════════════════════════╣
║                                      ║
║  🌐 האתר: [SITE_URL]                 ║
║                                      ║
║  📝 לעדכון תוכן: [SITE_URL]/admin    ║
║                                      ║
║  📞 תמיכה: [MEDIAWAVE_PHONE]         ║
║                                      ║
║  📧 אימייל: [MEDIAWAVE_EMAIL]        ║
║                                      ║
║  📦 החבילה שלך: [PACKAGE_SUMMARY]    ║
║                                      ║
║  📅 הושק: [LAUNCH_DATE]              ║
║                                      ║
║  🔄 דומיין מתחדש: [RENEWAL_DATE]     ║
║                                      ║
╚══════════════════════════════════════╝
```

---

### Component 4: Maintenance Guide

What the client needs to know about ongoing costs and maintenance:

```markdown
# מדריך תחזוקה - [BUSINESS_NAME]

## דומיין
- **שם:** [DOMAIN]
- **רשם:** [REGISTRAR]
- **תאריך חידוש:** [RENEWAL_DATE]
- **עלות חידוש:** ~50-100₪/שנה
- **פעולה נדרשת:** וודא/י שכרטיס האשראי מעודכן ברשם הדומיין
- **מה קורה אם לא מחדשים:** האתר יפסיק לעבוד תוך 30-90 יום

## אחסון (Hosting)
- **ספק:** Vercel
- **תוכנית:** [Free / Pro - $20/month]
- **חידוש:** [אוטומטי / ידני]
- **מה כלול:** אחסון, SSL, CDN גלובלי, deploys אוטומטיים
- **פעולה נדרשת:** [אין - הכל אוטומטי / לוודא תשלום חודשי]

## תעודת SSL (אבטחה)
- **סוג:** Let's Encrypt via Vercel
- **חידוש:** אוטומטי ✅
- **פעולה נדרשת:** אין - Vercel מטפל בזה אוטומטית

## מסד נתונים
- **ספק:** Neon
- **תוכנית:** [Free tier / Pro]
- **גיבוי:** [אוטומטי יומי / ידני]
- **פעולה נדרשת:** [אין / לוודא תשלום]

## מה לעשות אם...

### האתר לא נטען
1. בדוק/י אם הבעיה רק אצלך (נסה/י מטלפון אחר)
2. בדוק/י אם הדומיין חודש
3. פנ/י ל-MediaWave - אנחנו נבדוק

### שכחתי את הסיסמה לניהול
1. גלוש/י ל-[SITE_URL]/admin
2. לחצ/י "שכחתי סיסמה"
3. בדוק/י אימייל עם קישור לאיפוס
4. אם לא עובד - פנ/י ל-MediaWave

### רוצה לשנות משהו ולא בטוח/ה איך
1. **לפני שעושים שינוי** - צלם/י מסך של המצב הנוכחי
2. נסה/י לפי המדריך שקיבלת
3. אם לא בטוח/ה - פנ/י ל-MediaWave לפני שמשנים
4. **לעולם אל תמחק/י בלוקים** - רק ערוך/י את התוכן שבתוכם

### משהו נשבר
1. **עצור/י** - אל תנסה/י לתקן
2. צלם/י מסך של השגיאה
3. פנ/י ל-MediaWave עם צילום המסך
4. אנחנו נתקן - בדרך כלל תוך יום עסקים
```

---

## Client Technical Level Adaptation

### Level 1: Non-Technical (ללא רקע טכני)

**Characteristics:** Never managed a website, doesn't know what CMS means,
communicates via WhatsApp, may be uncomfortable with computers.

**Guide style:**
- Maximum screenshots (every single click)
- Video walkthrough recording (screen share on Zoom/Google Meet, record, send)
- Use emoji markers as visual anchors
- Simple language - no technical terms whatsoever
- Number every single step
- "If something goes wrong" section is prominent
- Printed PDF + WhatsApp link to video

**Extra deliverables:**
- 15-30 minute live training session (screen share)
- Record the session and send to client
- Create a 1-page "cheat sheet" they can stick next to their computer
- Follow-up check after 3 days: "Did you try logging in? Any questions?"

### Level 2: Somewhat Technical (עם קצת רקע)

**Characteristics:** Has used some CMS before (Wix, WordPress), comfortable
with browsers, can follow written instructions.

**Guide style:**
- Written instructions with key screenshots (not every click)
- Skip explaining what a "browser" is
- Include keyboard shortcuts and tips
- Brief video overview (5-10 minutes)
- Can handle a simple FAQ

**Extra deliverables:**
- Written PDF guide
- Optional brief walkthrough (10-15 minutes)

### Level 3: Technical (טכני)

**Characteristics:** Developer, designer, or tech-savvy business owner.
Knows what a CMS is, can figure things out.

**Guide style:**
- Credentials + brief overview
- Skip basics entirely
- Focus on architecture decisions and customization options
- Include API endpoints if relevant
- Note any custom code or non-standard configurations

**Extra deliverables:**
- Credentials document
- Architecture overview (what's deployed where)
- List of environment variables
- Git repo access (if client wants it)

---

## Interactive Questions (Before Generating Handoff)

Ask these when preparing the handoff package:

### Question 1: Client Technical Level
```
What is the client's technical level?
1. Very non-technical - needs screenshots, video, hand-holding
2. Somewhat technical - used Wix/WordPress, can follow written instructions
3. Technical - developer or tech-savvy, just needs credentials + overview
```

### Question 2: Training Format
```
How should we deliver the training?
1. Written PDF only - I'll send it and answer questions
2. Live walkthrough + recording - schedule a call, record, send video
3. Both - written guide + live walkthrough
4. Self-service - client will figure it out with the written guide
```

### Question 3: Domain Ownership
```
Who owns the domain?
1. Client owns it - they purchased and manage it
2. I purchased it - needs to be transferred to client
3. I purchased it - included in hosting fee, I manage it
4. No custom domain - using Vercel subdomain for now
```

### Question 4: Ongoing Relationship
```
What's the ongoing relationship after handoff?
1. One-time delivery - handoff and done
2. Monthly retainer - [PRICE]₪/month for maintenance + updates
3. On-demand hourly - client contacts when needed, [RATE]₪/hour
4. Not discussed yet - include retainer offer in handoff
```

### Question 5: Additional Services to Offer
```
Should we offer any additional services in the handoff?
1. Monthly retainer (content updates + monitoring)
2. SEO package (ongoing optimization)
3. Google Ads management
4. Social media content
5. Additional landing pages for other services
6. None - clean handoff only
```

---

## Handoff Delivery Sequence

Recommended order for delivering the handoff package:

### Day 1: Pre-Handoff Preparation
1. Generate all documents from templates
2. Take screenshots for the CMS guide
3. Prepare credentials document
4. Run post-launch health checks
5. Generate week-1 report (if enough data)

### Day 2: Live Handoff Session (if applicable)
1. Schedule a 30-minute video call
2. Screen-share the admin panel
3. Walk through each CMS operation
4. Let the client try one edit live
5. Record the entire session

### Day 3: Document Delivery
1. Send CMS guide (PDF or Google Doc)
2. Send credentials (via secure channel - WhatsApp disappearing or phone)
3. Send quick reference card
4. Send maintenance guide
5. Send week-1 report
6. Send video recording of training session

### Day 4: Follow-Up
1. Check if client logged in successfully
2. Ask if they have questions
3. Confirm they received all documents
4. Offer monthly retainer (if not already discussed)

---

## File Storage Convention

```
[PROJECT_ROOT]/
└── .context/
    └── handoff/
        ├── cms-guide.md              # CMS instructions (Hebrew)
        ├── credentials.md            # Credentials (SECURE)
        ├── quick-reference.md        # One-page quick reference
        ├── maintenance-guide.md      # Ongoing maintenance info
        ├── handoff-package.md        # Combined handoff document
        └── training-notes.md         # Notes from live training session
```

---

## Sources

- [Training Manual Templates Guide](https://www.docsie.io/blog/articles/the-ultimate-training-manual-template-guide-in-2023/) - Template design best practices
- [Scope Creep Prevention](https://www.hellobonsai.com/blog/how-to-avoid-scope-creep) - 7 tactics for freelancers
- [Handling Revision Requests](https://99designs.com/blog/freelancing/handling-revision-requests/) - Professional revision management
- [Managing Client Revisions](https://moldstud.com/articles/p-mastering-client-revisions-essential-strategies-for-freelance-app-developers) - Strategies for freelance developers
