# On-Page SEO Reference for Hebrew Landing Pages
## Hebrew-Specific Guidance for Israeli Small Business Landing Pages
### Last Updated: March 2026

---

## Table of Contents

1. [Title Tags (Hebrew)](#1-title-tags-hebrew)
2. [Meta Descriptions (Hebrew)](#2-meta-descriptions-hebrew)
3. [Heading Hierarchy](#3-heading-hierarchy)
4. [Hebrew Content Optimization](#4-hebrew-content-optimization)
5. [URL Structure](#5-url-structure)
6. [Image SEO](#6-image-seo)
7. [Internal Linking](#7-internal-linking)
8. [Open Graph Tags](#8-open-graph-tags)

---

## 1. Title Tags (Hebrew)

### Why Hebrew Title Tags Are Different

Hebrew characters are **visually wider** than Latin characters in Google SERPs. A Hebrew title that looks like 60 characters will often be truncated earlier than an equivalent-length English title. Google measures pixel width, not character count, and Hebrew characters consume more horizontal pixels in the SERP font.

### Recommended Length

- **Target: 50-55 Hebrew characters** (shorter than the English guideline of 55-60)
- Google typically truncates Hebrew titles around **480-510 pixels** in desktop SERPs
- On mobile, the display is even narrower -- aim for the **primary keyword + brand within the first 45 characters**
- Always check truncation with a SERP preview tool (e.g., Mangools SERP Simulator, SERPsim)

### Recommended Formats

**Format A: Keyword-First (Preferred for Local SEO)**
```
[Primary Keyword] [Location] | [Business Name]
```

**Format B: Brand-First (For Established Brands)**
```
[Business Name] - [Primary Keyword] [Location]
```

**Format C: With Value Proposition**
```
[Primary Keyword] [Location] | [Business Name] - [Value Prop]
```

### Hebrew Title Tag Examples

#### Plumber (אינסטלטור)
```html
<!-- Format A -- 46 chars -->
<title>אינסטלטור בתל אביב | שירותי צנרת מקצועיים 24/7</title>

<!-- Format B -- 48 chars -->
<title>אופק אינסטלציה - אינסטלטור מקצועי בתל אביב</title>
```

#### Lawyer (עורך דין)
```html
<!-- Format A -- 49 chars -->
<title>עורך דין תעבורה בתל אביב | משרד כהן ושות׳</title>

<!-- Format B -- 51 chars -->
<title>משרד כהן ושות׳ - עורך דין תעבורה בתל אביב יפו</title>
```

#### Bakery (מאפייה)
```html
<!-- Format A -- 44 chars -->
<title>מאפייה ברחובות | מאפיית הכרמל - לחם ומאפים</title>

<!-- With value proposition -- 52 chars -->
<title>מאפייה ברחובות | מאפיית הכרמל - אפייה טרייה כל יום</title>
```

#### Dentist (רופא שיניים)
```html
<!-- Format A -- 50 chars -->
<title>רופא שיניים בהרצליה | ד״ר לוי - מרפאת שיניים</title>

<!-- With specialty -- 53 chars -->
<title>השתלת שיניים בהרצליה | ד״ר לוי - מרפאת שיניים מובילה</title>
```

#### Beauty Salon (מכון יופי)
```html
<!-- Format A -- 48 chars -->
<title>מכון יופי בראשון לציון | סטודיו גלאם - טיפולי פנים</title>
```

### Title Tag Best Practices for Hebrew

1. **Place the primary keyword at the beginning** -- even though Hebrew is RTL, Google still gives slight weight to words appearing early in the title tag. The `<title>` tag content is read left-to-right in the source code regardless of display direction
2. **Include the city name** -- mandatory for local landing pages ("בתל אביב", "בירושלים", "ברחובות")
3. **Use the pipe `|` or a plain hyphen `-` as separators** -- not colons or commas. Pipes are cleanest in Hebrew SERPs
4. **Do not repeat keywords** -- "אינסטלטור בתל אביב | אינסטלטור מקצועי" wastes space. Use synonyms instead
5. **Include brand name** -- but keep it short. If the brand name is long, abbreviate or shorten it
6. **Avoid English words** in the title unless the brand name is in English. Mixed Hebrew-English titles look messy in SERPs
7. **Use Hebrew quotation marks** -- גרשיים (״) and not standard quotes (") for terms like ושות׳

### Common Mistakes

| Mistake | Example | Problem |
|---------|---------|---------|
| Too long | "אינסטלטור מקצועי ואמין בתל אביב יפו עם ניסיון של 20 שנה - שירותי אינסטלציה במחירים הוגנים" | Truncated after ~55 chars, loses meaning |
| Keyword stuffing | "אינסטלטור תל אביב אינסטלציה תל אביב שרברב" | Spammy, hurts CTR, may trigger penalty |
| No location | "אינסטלטור מקצועי - שירות מהיר ואמין" | Misses local intent completely |
| English mixed in | "Professional אינסטלטור in תל אביב" | Confusing in SERPs, poor user experience |
| Missing brand | "אינסטלטור בתל אביב - שירות 24/7" | No differentiation from competitors |

---

## 2. Meta Descriptions (Hebrew)

### Why Hebrew Meta Descriptions Need Special Handling

- Google truncates meta descriptions based on **pixel width**, not character count
- Hebrew characters are wider, so the **effective character limit is 140-150 characters** (vs. 155-160 for English)
- Google may truncate **mid-word** in Hebrew, creating awkward display -- shorter is safer
- Google rewrites meta descriptions ~70% of the time, but a well-crafted one still influences CTR and provides a fallback

### Recommended Length

- **Sweet spot: 140-150 Hebrew characters**
- **Absolute minimum: 80 characters** (below this, Google is more likely to generate its own)
- **Safe zone for mobile: 120 characters** (mobile SERPs show fewer characters)

### Structure Formula for Hebrew Meta Descriptions

```
[Value proposition in Hebrew] + [Key differentiator] + [CTA with contact method]
```

### Hebrew Meta Description Examples

#### Plumber (אינסטלטור)
```html
<meta name="description" content="אינסטלטור מקצועי בתל אביב. שירות מהיר תוך שעה, מחירים הוגנים ללא הפתעות. זמינים 24/7 כולל שבת וחגים. התקשרו עכשיו: 054-123-4567">
<!-- 139 chars -->
```

#### Lawyer (עורך דין)
```html
<meta name="description" content="עורך דין תעבורה מנוסה בתל אביב. ייצוג בנהיגה בשכרות, תאונות דרכים ודוחות תנועה. ייעוץ ראשוני חינם. צרו קשר: 03-123-4567">
<!-- 126 chars -->
```

#### Bakery (מאפייה)
```html
<meta name="description" content="מאפיית הכרמל ברחובות - לחם טרי, עוגות מעוצבות ומאפים מיוחדים לאירועים. אפייה יומית מחומרי גלם איכותיים. הזמנות בוואטסאפ: 050-987-6543">
<!-- 143 chars -->
```

#### Dentist (רופא שיניים)
```html
<meta name="description" content="מרפאת שיניים מתקדמת בהרצליה. השתלות, יישור, הלבנה וטיפולים אסתטיים. ציוד דיגיטלי חדשני. קבעו תור: 09-876-5432 או בוואטסאפ">
<!-- 131 chars -->
```

#### Moving Company (הובלות)
```html
<meta name="description" content="הובלות דירה ומשרד בגוש דן. אריזה מקצועית, פירוק והרכבת רהיטים. ביטוח מלא. מחיר משתלם עם הצעת מחיר חינם. חייגו: 050-111-2222">
<!-- 132 chars -->
```

#### Beauty Salon (מכון יופי)
```html
<meta name="description" content="סטודיו גלאם בראשון לציון - טיפולי פנים, לייזר, פדיקור ומניקור. מוצרים מקצועיים ואווירה מפנקת. לקביעת תור: 054-333-4444">
<!-- 127 chars -->
```

### Hebrew CTA Phrases for Meta Descriptions

| CTA (Hebrew) | When to Use |
|--------------|-------------|
| התקשרו עכשיו: [phone] | Phone-call-driven businesses |
| צרו קשר בוואטסאפ: [phone] | WhatsApp-preferred businesses (most Israeli SMBs) |
| קבעו תור עוד היום | Appointment-based services (doctors, salons) |
| הצעת מחיר חינם | Services that require quotes (contractors, movers) |
| ייעוץ ראשוני חינם | Professional services (lawyers, accountants) |
| הזמינו עכשיו | Product/e-commerce |
| בדקו זמינות | Event-based services |
| חייגו 24/7 | Emergency/urgent services |

### Including Phone Numbers in Meta Descriptions

Including a phone number directly in the meta description is highly effective for Israeli local businesses:

- On mobile, the phone number does **not** become a clickable link in the meta description itself, but it serves as a strong **psychological CTA** -- the user sees the number and may tap the organic result specifically to call
- It differentiates you from competitors who only have generic descriptions
- **Format:** Use the local Israeli format (054-XXX-XXXX) rather than international (+972-54-XXX-XXXX) -- Israeli users recognize and prefer the local format in SERPs

### How Google Truncates Hebrew Text

Google's SERP rendering engine truncates based on pixel width. Specific behaviors with Hebrew:

1. **Mid-word truncation** -- Google may cut in the middle of a Hebrew word, adding "..." (three dots). Example: "אינסטל..." instead of "אינסטלטור". This looks broken and hurts CTR
2. **Right-to-left ellipsis** -- The "..." appears on the left side (end of the visual line in RTL)
3. **Parenthetical content is often dropped** -- If you include content in parentheses at the end, it will be the first thing truncated

**Mitigation strategy:** Write the most important information within the first 120 characters. Treat characters 120-150 as a bonus zone that may or may not display.

---

## 3. Heading Hierarchy

### The One-H1 Rule

Every landing page must have **exactly one `<h1>` tag** -- this is the hero headline and must contain the primary keyword.

### Heading Hierarchy Structure for a Landing Page

```
<h1> מילת מפתח ראשית + שם עיר (כותרת הגיבור)
│
├── <h2> שירותים / מה אנחנו מציעים
│   ├── <h3> שירות 1
│   ├── <h3> שירות 2
│   └── <h3> שירות 3
│
├── <h2> למה לבחור בנו / יתרונות
│
├── <h2> איך זה עובד / תהליך העבודה
│   ├── <h3> שלב 1
│   ├── <h3> שלב 2
│   └── <h3> שלב 3
│
├── <h2> מה הלקוחות אומרים / המלצות
│
├── <h2> גלריה / עבודות שביצענו
│
├── <h2> שאלות נפוצות
│   (questions as <h3> or within <details>/<summary>)
│
└── <h2> צרו קשר / דברו איתנו
```

### Hebrew H1 Examples by Business Type

| Business Type | Hebrew H1 Example |
|--------------|-------------------|
| Plumber | `<h1>אינסטלטור מקצועי בתל אביב - שירות מהיר 24/7</h1>` |
| Lawyer | `<h1>עורך דין תעבורה בתל אביב - ייצוג משפטי מנוסה</h1>` |
| Bakery | `<h1>מאפיית הכרמל ברחובות - לחם טרי ומאפים כל יום</h1>` |
| Dentist | `<h1>מרפאת שיניים בהרצליה - ד״ר לוי</h1>` |
| Moving Company | `<h1>הובלות דירה ומשרד בגוש דן - מהירות ובטיחות</h1>` |
| Beauty Salon | `<h1>מכון יופי בראשון לציון - טיפולי פנים וגוף</h1>` |
| Electrician | `<h1>חשמלאי מוסמך בירושלים - תיקונים והתקנות</h1>` |
| Photographer | `<h1>צלם אירועים בחיפה - צילום חתונות ובר מצווה</h1>` |

### Hebrew H2 Examples for Common Sections

| Section | Hebrew H2 Example |
|---------|-------------------|
| Services | `<h2>השירותים שלנו</h2>` or `<h2>שירותי אינסטלציה בתל אביב</h2>` |
| Why Us | `<h2>למה לבחור באופק אינסטלציה?</h2>` |
| Process | `<h2>איך זה עובד?</h2>` or `<h2>תהליך העבודה שלנו</h2>` |
| Testimonials | `<h2>מה אומרים הלקוחות שלנו</h2>` |
| Gallery | `<h2>עבודות שביצענו</h2>` or `<h2>פרויקטים אחרונים</h2>` |
| FAQ | `<h2>שאלות נפוצות</h2>` |
| Contact | `<h2>צרו איתנו קשר</h2>` or `<h2>דברו איתנו עוד היום</h2>` |
| About | `<h2>קצת עלינו</h2>` or `<h2>הסיפור שלנו</h2>` |
| Pricing | `<h2>מחירון שירותים</h2>` |
| Coverage Area | `<h2>אזורי שירות</h2>` |

### Complete Example: Plumber Landing Page Heading Structure

```html
<h1>אינסטלטור מקצועי בתל אביב - שירות מהיר 24/7</h1>

<h2>שירותי אינסטלציה בתל אביב והסביבה</h2>
  <h3>תיקון נזילות ואיתור נזילות סמויות</h3>
  <h3>פתיחת סתימות ביוב וניקוז</h3>
  <h3>התקנת דוד שמש ודוד חשמלי</h3>
  <h3>שיפוץ חדרי אמבטיה ושירותים</h3>

<h2>למה לבחור באופק אינסטלציה?</h2>

<h2>איך מזמינים שירות?</h2>
  <h3>שלב 1: יצירת קשר</h3>
  <h3>שלב 2: אבחון ומתן הצעת מחיר</h3>
  <h3>שלב 3: ביצוע העבודה</h3>

<h2>מה הלקוחות שלנו אומרים</h2>

<h2>שאלות נפוצות על אינסטלציה בתל אביב</h2>

<h2>צרו קשר עוד היום</h2>
```

### Heading Best Practices for Hebrew

1. **Never skip heading levels** -- do not jump from `<h2>` to `<h4>`. Always use `<h3>` in between
2. **Include keywords naturally** -- the keyword should read as natural Hebrew, not forced
3. **Keep headings concise** -- H2 headings should be 5-10 words in Hebrew. They serve as scannable anchors
4. **Use question form for FAQ H3s** -- "כמה עולה אינסטלטור בתל אביב?" reads naturally and targets voice search
5. **Do not use headings for styling** -- if text needs to look big but is not a structural heading, use CSS instead
6. **Each heading should be unique** -- no duplicate H2 or H3 text on the same page

---

## 4. Hebrew Content Optimization

### Natural Keyword Density in Hebrew

Hebrew has a fundamentally different word structure than English, which affects keyword density:

- **Target: 1-2% keyword density** for the primary keyword
- In Hebrew, this translates to roughly **8-15 mentions of the primary keyword per 1,000 words**
- However, Hebrew morphology means the keyword naturally appears in multiple forms (see below), and each form counts toward topical relevance

**What "natural" looks like in Hebrew:**

If the primary keyword is "אינסטלטור בתל אביב", natural usage across 1,000 words might include:
- "אינסטלטור בתל אביב" -- 3-4 times (exact match)
- "אינסטלטור מקצועי" -- 2-3 times (partial match)
- "שירותי אינסטלציה" -- 2-3 times (semantic variation)
- "שרברב" -- 1-2 times (common synonym)
- "בעיות צנרת" -- 1-2 times (related topic)

**Total topical signal: strong, without any one phrase being repeated unnaturally.**

### Hebrew Synonym Handling

Hebrew is rich in synonyms. Google understands many Hebrew synonyms, but not all. Using synonyms naturally improves topical coverage and avoids keyword stuffing.

#### Common Business-Type Synonyms

| Primary Term | Synonyms to Include |
|-------------|-------------------|
| אינסטלטור (plumber) | שרברב, טכנאי צנרת, בעל מקצוע אינסטלציה |
| עורך דין (lawyer) | עו״ד, יועץ משפטי, פרקליט |
| רופא שיניים (dentist) | דנטיסט, רופא/ת שיניים |
| מכון יופי (beauty salon) | סטודיו לטיפולי יופי, מכון לטיפולי פנים, מכון אסתטיקה |
| הובלות (moving) | שינוע, העברת דירה, מעבר דירה |
| שיפוץ (renovation) | חידוש, שיפוצים, עבודות שיפוץ, קבלן שיפוצים |
| מנעולן (locksmith) | בעל מלאכה למנעולים, טכנאי מנעולים |
| חשמלאי (electrician) | טכנאי חשמל, חשמלאי מוסמך |
| מעצב פנים (interior designer) | אדריכל פנים, מעצב/ת דירות |
| צלם (photographer) | צלם/ת אירועים, צילום מקצועי |

#### Service-Related Synonyms

| Primary Term | Synonyms |
|-------------|----------|
| שירות (service) | מענה, טיפול, סיוע |
| מקצועי (professional) | מומחה, מנוסה, בכיר, מוסמך |
| מהיר (fast) | זריז, בדחיפות, תוך שעה, מיידי |
| אמין (reliable) | מהימן, אחראי, אפשר לסמוך |
| מחיר (price) | עלות, תעריף, מחירון, הצעת מחיר |
| הזמנה (booking) | קביעת תור, תיאום, הזמנת שירות |

### Morphological Variations in Hebrew

Hebrew uses a root-based (shoresh) system where a single root generates many word forms. Google partially understands this, but does not always connect all forms. Include multiple forms naturally in content.

#### Example: Root ש-ר-ת (service)
| Form | Usage |
|------|-------|
| שירות | "אנו מספקים שירות מקצועי" |
| שירותים | "שירותים שלנו כוללים..." |
| שירותי | "שירותי אינסטלציה" |
| לשרת | "אנחנו כאן לשרת אתכם" |
| משרתים | "משרתים את אזור תל אביב" |

#### Example: Root ת-ק-ן (repair/fix)
| Form | Usage |
|------|-------|
| תיקון | "תיקון נזילות" |
| תיקונים | "תיקונים דחופים" |
| לתקן | "אנחנו יודעים לתקן כל תקלה" |
| מתקנים | "מתקנים תקלות צנרת" |
| תוקן | "הבעיה תוקן תוך שעה" |

#### Example: Root ב-נ-ה (build)
| Form | Usage |
|------|-------|
| בנייה | "עבודות בנייה" |
| בניין | "שיפוץ בניין" |
| לבנות | "לבנות בית" |
| נבנה | "נבנה עבורכם" |
| בונים | "בונים לכם את הבית" |

### Write in Hebrew -- Do Not Translate from English

Translated Hebrew content is immediately recognizable and performs poorly both with users and search engines.

**Translated (BAD):**
> "אנחנו מספקים שירותי אינסטלציה ברמה הגבוהה ביותר. הצוות שלנו מחויב למתן שירות לקוחות מעולה ועומד בסטנדרטים הגבוהים ביותר של התעשייה."

**Written natively in Hebrew (GOOD):**
> "צריכים אינסטלטור? אנחנו מגיעים תוך שעה לכל מקום בתל אביב. מחיר הוגן, עבודה נקייה, ואחריות מלאה. כבר 15 שנה שאנחנו מטפלים בבעיות צנרת ומים לדירות, משרדים ועסקים."

**Key differences:**
- Native Hebrew is direct and to the point (Israeli communication style)
- Uses colloquial phrasing ("צריכים אינסטלטור?") not formal ("אנחנו מספקים שירותי...")
- Addresses the reader directly ("אתם", "לכם")
- Includes specific local context ("כל מקום בתל אביב")
- Mentions practical details Israelis care about (price, warranty, speed)

### Include City and Neighborhood Names Naturally

For local SEO, weave location references throughout the content -- not just in the H1.

**Effective location weaving example (for a plumber in Tel Aviv):**

> "מספקים שירותי אינסטלציה בכל רחבי **תל אביב**, כולל **הצפון הישן**, **פלורנטין**, **נווה צדק**, **רמת אביב** ואזור **יפו**. בין אם אתם גרים בדירה ב**לב העיר** או בבית פרטי ב**אפקה**, אנחנו מגיעים אליכם."

**Neighborhood mention guidelines:**
- Mention 3-5 neighborhoods naturally throughout the page
- Include them in testimonials ("שירות מעולה, הגיעו תוך חצי שעה לדירה שלנו ברמת אביב")
- Add them in the services section ("שירות ביוב בפלורנטין ובדרום תל אביב")
- Use in FAQ answers ("כן, אנחנו מגיעים לכל האזורים בתל אביב כולל יפו ובת ים")

### Optimal Content Length

- **Landing page total: 800-1,500 words** of Hebrew content
- This is measured across ALL text sections on the page (hero, services, about, FAQ, etc.)
- Below 500 words, Google may consider the page thin content
- Above 2,000 words on a landing page may dilute conversion focus

**Word count distribution across sections:**

| Section | Target Word Count |
|---------|------------------|
| Hero (H1 + subtitle + value props) | 30-50 words |
| Services | 150-250 words |
| About / Why Us | 100-150 words |
| Process / How It Works | 80-120 words |
| Testimonials | 100-200 words (across 3-5 reviews) |
| FAQ | 250-400 words (5-8 questions) |
| Contact | 30-50 words |
| **Total** | **740-1,220 words** |

### The "Answer Capsule" Pattern

After each H2 heading, include a **concise 20-25 word summary** that directly answers the implied question of that section. This serves two purposes:

1. **Featured snippet targeting** -- Google often pulls short, direct answers for Hebrew queries
2. **Improved readability** -- Israeli users scan pages quickly and appreciate upfront answers

**Example:**

```html
<h2>כמה עולה אינסטלטור בתל אביב?</h2>
<p><strong>מחירי אינסטלציה בתל אביב נעים בין 150 ל-500 ₪ לקריאת שירות, תלוי בסוג העבודה ובשעת ההגעה.</strong></p>
<p>הנה פירוט מלא של המחירים שלנו...</p>
```

```html
<h2>למה לבחור בנו?</h2>
<p><strong>אנחנו אינסטלטורים מוסמכים עם 15 שנות ניסיון בתל אביב, אחריות מלאה על כל עבודה ומחירים שקופים ללא הפתעות.</strong></p>
<p>הנה כמה סיבות נוספות...</p>
```

```html
<h2>איך מזמינים שירות אינסטלציה?</h2>
<p><strong>התקשרו או שלחו הודעה בוואטסאפ, נתאם הגעה תוך שעה, ונטפל בבעיה באותו ביקור עם הצעת מחיר מראש.</strong></p>
```

### Content Quality Signals for Hebrew Pages

Google evaluates Hebrew content for E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness):

- **Experience**: Include real project photos, specific case details, years of operation
- **Expertise**: Mention certifications, licenses, professional memberships (e.g., "חבר באיגוד בעלי מקצוע")
- **Authoritativeness**: Link to Google reviews, show aggregate ratings, display industry awards
- **Trustworthiness**: Show full NAP, display privacy policy link, include business registration number (ח.פ.)

---

## 5. URL Structure

### Decision Framework: Hebrew Slugs vs. Transliterated vs. English

| Approach | Example | Recommended? |
|----------|---------|-------------|
| Hebrew characters | `/אינסטלטור-תל-אביב/` | Not recommended |
| Transliterated | `/instalator-tel-aviv/` | Recommended |
| English | `/plumber-tel-aviv/` | Acceptable |
| Mixed | `/plumber-תל-אביב/` | Never |

### Recommendation: Transliterated Slugs

For landing pages, use **transliterated Hebrew in Latin characters**:

```
https://www.example.co.il/instalator-tel-aviv
https://www.example.co.il/maapiya-brehovot
https://www.example.co.il/orech-din-tvura-tel-aviv
https://www.example.co.il/rofeh-shinayim-herzliya
https://www.example.co.il/hovlaot-gush-dan
```

### Why Transliterated Slugs Win

1. **Cross-platform compatibility** -- Hebrew URLs become `%D7%90%D7%99%D7%A0%D7%A1%D7%98...` when copied into email, SMS, WhatsApp, or analytics tools. This is unreadable and looks suspicious to recipients
2. **No encoding issues** -- Hebrew characters in URLs require percent-encoding. Some CMS tools, email clients, and link shorteners mishandle this
3. **Clean in analytics** -- Transliterated URLs are readable in Google Analytics, Search Console, and server logs. Hebrew URLs show as percent-encoded strings
4. **Social media sharing** -- When shared on Facebook, Twitter, or LinkedIn, transliterated URLs display cleanly. Hebrew URLs show encoded characters
5. **Minimal SEO impact** -- Google has confirmed that URL keywords are a **very minor ranking factor**. The actual on-page Hebrew content and title tags carry the weight

### URL Format Rules

- **Lowercase only**: `instalator-tel-aviv` not `Instalator-Tel-Aviv`
- **Hyphens as separators**: `orech-din-tvura` not `orech_din_tvura`
- **No special characters**: no `?`, `&`, `=`, `#` (except for query parameters)
- **Include location**: `hovlaot-gush-dan` not just `hovlaot`
- **Keep short**: 3-5 words maximum. `/instalator-tel-aviv` not `/shirutei-instalatzia-miktzoit-batel-aviv-yafo`

### Transliteration Guide for Common Words

| Hebrew | Transliteration |
|--------|----------------|
| תל אביב | tel-aviv |
| ירושלים | yerushalayim |
| חיפה | haifa |
| באר שבע | beer-sheva |
| ראשון לציון | rishon-lezion |
| פתח תקווה | petah-tikva |
| נתניה | netanya |
| הרצליה | herzliya |
| רחובות | rehovot |
| אשדוד | ashdod |
| אינסטלטור | instalator |
| עורך דין | orech-din |
| רופא שיניים | rofeh-shinayim |
| מאפייה | maapiya |
| חשמלאי | hashmalai |
| מנעולן | manulan |
| שיפוצים | shiputzim |
| הובלות | hovlaot |

### For Single Landing Pages (Root Domain)

If the landing page is the entire website (the most common scenario for Israeli small businesses), the URL is simply:

```
https://www.example.co.il/
```

No slug needed. The homepage IS the landing page. In this case, URL keyword optimization is irrelevant -- focus entirely on title tags, meta descriptions, and on-page content.

---

## 6. Image SEO

### Hebrew Alt Text

Every image on the landing page must have descriptive Hebrew alt text. This serves both accessibility (screen readers) and SEO (Google image search, topical signals).

#### Alt Text Best Practices for Hebrew

**Good Hebrew alt text:**
```html
<img src="/images/plumber-fixing-pipe.jpg"
     alt="אינסטלטור מתקן צנרת בדירה בתל אביב" />

<img src="/images/bakery-fresh-bread.jpg"
     alt="לחם טרי ומאפים במאפיית הכרמל ברחובות" />

<img src="/images/dental-clinic-interior.jpg"
     alt="פנים מרפאת השיניים של ד״ר לוי בהרצליה" />

<img src="/images/team-photo.jpg"
     alt="צוות אופק אינסטלציה - אינסטלטורים מקצועיים בתל אביב" />

<img src="/images/before-after-renovation.jpg"
     alt="שיפוץ חדר אמבטיה - לפני ואחרי - דירה ברמת אביב" />
```

**Bad Hebrew alt text (keyword stuffed):**
```html
<!-- DON'T -->
<img alt="אינסטלטור תל אביב אינסטלטור מקצועי אינסטלציה תל אביב שרברב" />
```

**Bad alt text (not descriptive):**
```html
<!-- DON'T -->
<img alt="תמונה" />
<img alt="img1234" />
<img alt="" /> <!-- Only acceptable for purely decorative images -->
```

#### Hebrew Alt Text Formula

```
[What is shown] + [Context/Location if relevant] + [Business name if appropriate]
```

### File Naming Convention

Use **English or transliterated names** for image files (not Hebrew characters):

```
GOOD:
plumber-fixing-pipe-tel-aviv.jpg
bakery-fresh-bread-rehovot.webp
dental-clinic-interior-herzliya.jpg
team-photo-ofek-plumbing.jpg

BAD:
אינסטלטור-מתקן-צנרת.jpg       (Hebrew chars cause encoding issues in URLs)
IMG_20240315_142233.jpg        (non-descriptive)
image1.jpg                      (non-descriptive)
photo (1).jpg                   (spaces and parentheses cause issues)
```

### Image Format Priority

| Format | Use Case | Support |
|--------|----------|---------|
| **WebP** | Primary format for all images | 97%+ browser support |
| **AVIF** | Best compression, use when supported | ~93% browser support (growing) |
| **JPEG** | Fallback for legacy browsers | Universal |
| **PNG** | Only for images requiring transparency (logos) | Universal |
| **SVG** | Icons, logos, simple graphics | Universal |

### Implementation with Next.js Image Component

```tsx
// Hero image -- above the fold, priority loading
<Image
  src="/images/hero-plumber-tel-aviv.webp"
  alt="אינסטלטור מקצועי מטפל בצנרת בדירה בתל אביב"
  width={1200}
  height={600}
  priority  // Critical: preloads the LCP image
  sizes="100vw"
  quality={85}
/>

// Service photo -- below the fold, lazy loaded (default)
<Image
  src="/images/pipe-repair-service.webp"
  alt="תיקון צנרת מים בבית פרטי"
  width={600}
  height={400}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Testimonial avatar -- small image, lazy loaded
<Image
  src="/images/customer-david.webp"
  alt="דוד כהן, לקוח מרוצה מרמת אביב"
  width={80}
  height={80}
  className="rounded-full"
/>
```

### Responsive Images with srcset

Next.js handles `srcset` automatically through the `<Image>` component. If implementing manually:

```html
<img
  src="/images/service-photo-800.webp"
  srcset="
    /images/service-photo-400.webp 400w,
    /images/service-photo-800.webp 800w,
    /images/service-photo-1200.webp 1200w
  "
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
  alt="שירות אינסטלציה בתל אביב - תיקון דוד שמש"
  width="800"
  height="600"
  loading="lazy"
/>
```

### Image Loading Strategy

| Image Location | Loading Strategy | Next.js Prop |
|---------------|-----------------|--------------|
| Hero / LCP image | Eager (preloaded) | `priority` |
| Above-the-fold secondary images | Eager | `priority` or `loading="eager"` |
| Below-the-fold content images | Lazy (default) | Default behavior |
| Testimonial photos | Lazy | Default behavior |
| Gallery images | Lazy | Default behavior |
| Footer logos | Lazy | Default behavior |

### OG Image (Social Sharing)

Create a dedicated Open Graph image for social sharing:

- **Dimensions:** 1200 x 630 pixels
- **Format:** JPEG or PNG (not WebP -- some platforms do not support WebP for OG images)
- **Hebrew text on the image:** Include the business name and primary keyword in Hebrew
- **High contrast:** Ensure Hebrew text is readable at small preview sizes
- **File name:** `og-image-[business-name].jpg`

---

## 7. Internal Linking

### Internal Linking on a Single Landing Page

For a single-page landing page (the most common scenario), internal links are **anchor links** between sections:

```html
<!-- Navigation links to page sections -->
<nav>
  <a href="#services">שירותים</a>
  <a href="#about">אודות</a>
  <a href="#testimonials">המלצות</a>
  <a href="#faq">שאלות נפוצות</a>
  <a href="#contact">צרו קשר</a>
</nav>

<!-- Section anchors -->
<section id="services">
  <h2>השירותים שלנו</h2>
  ...
</section>

<section id="about">
  <h2>למה לבחור בנו</h2>
  ...
</section>
```

### Links to Legal Pages (Required by Israeli Law)

Every landing page must link to legal pages. These are the **only external-to-landing-page internal links** that single-page sites typically have:

```html
<!-- Footer legal links -->
<footer>
  <nav aria-label="קישורים משפטיים">
    <a href="/privacy-policy">מדיניות פרטיות</a>
    <a href="/accessibility-statement">הצהרת נגישות</a>
    <a href="/terms-of-service">תנאי שימוש</a>
  </nav>
</footer>
```

**Note:** The accessibility statement (הצהרת נגישות) is **legally required** for all Israeli commercial websites under the Equal Rights for Persons with Disabilities Act (חוק שוויון זכויות לאנשים עם מוגבלות).

### Anchor Text Best Practices in Hebrew

| Link Purpose | Good Anchor Text (Hebrew) | Bad Anchor Text |
|-------------|--------------------------|----------------|
| To services section | "ראו את השירותים שלנו" or "שירותי אינסטלציה" | "לחצו כאן" |
| To contact section | "צרו איתנו קשר" or "דברו איתנו" | "לחצו" |
| To FAQ section | "שאלות נפוצות על אינסטלציה" | "שאלות" |
| To testimonials | "קראו מה הלקוחות אומרים" | "עוד" |
| To Google reviews | "דרגו אותנו בגוגל" | "לינק" |

**Rules for Hebrew anchor text:**
- Use descriptive, natural Hebrew phrases
- Include a keyword when natural and relevant
- Avoid generic "לחצו כאן" (click here) -- poor for accessibility and SEO
- Keep anchor text concise (2-5 words)

### Footer Link Structure

```html
<footer>
  <!-- Section quick links -->
  <nav aria-label="ניווט מהיר">
    <h3>ניווט מהיר</h3>
    <a href="#services">שירותים</a>
    <a href="#about">אודות</a>
    <a href="#testimonials">המלצות</a>
    <a href="#faq">שאלות נפוצות</a>
    <a href="#contact">צרו קשר</a>
  </nav>

  <!-- Legal links -->
  <nav aria-label="מידע משפטי">
    <h3>מידע</h3>
    <a href="/privacy-policy">מדיניות פרטיות</a>
    <a href="/accessibility-statement">הצהרת נגישות</a>
    <a href="/terms-of-service">תנאי שימוש</a>
  </nav>

  <!-- External links (noopener, noreferrer for security) -->
  <nav aria-label="קישורים חיצוניים">
    <h3>עקבו אחרינו</h3>
    <a href="https://www.facebook.com/business" target="_blank" rel="noopener noreferrer">פייסבוק</a>
    <a href="https://www.instagram.com/business" target="_blank" rel="noopener noreferrer">אינסטגרם</a>
    <a href="https://g.co/kgs/XXXXX" target="_blank" rel="noopener noreferrer">גוגל מפות</a>
  </nav>
</footer>
```

### CTA Links Throughout the Page

Each section should include a link or button that drives the visitor toward the primary conversion action:

```html
<!-- After services section -->
<a href="#contact" class="cta-button">רוצים לשמוע עוד? דברו איתנו</a>

<!-- After testimonials -->
<a href="tel:+972541234567" class="cta-button">התקשרו עכשיו: 054-123-4567</a>

<!-- Floating WhatsApp button -->
<a href="https://wa.me/972541234567?text=היי%2C%20ראיתי%20את%20האתר%20שלכם%20ואשמח%20לשמוע%20פרטים"
   target="_blank"
   rel="noopener noreferrer"
   aria-label="שלחו לנו הודעה בוואטסאפ">
  WhatsApp
</a>
```

---

## 8. Open Graph Tags

### Complete OG Implementation for Hebrew Landing Pages

Open Graph tags control how the page appears when shared on Facebook, LinkedIn, WhatsApp, Telegram, and other platforms. For Israeli businesses, WhatsApp sharing is especially important.

### Required OG Tags

```html
<head>
  <!-- Essential OG tags -->
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="he_IL" />
  <meta property="og:url" content="https://www.example.co.il/" />
  <meta property="og:site_name" content="אופק אינסטלציה" />

  <!-- Hebrew title -- can differ from <title> tag -->
  <meta property="og:title" content="אינסטלטור מקצועי בתל אביב | אופק אינסטלציה" />

  <!-- Hebrew description -- optimized for social sharing, not SERPs -->
  <meta property="og:description" content="צריכים אינסטלטור בתל אביב? שירות מהיר תוך שעה, מחירים הוגנים, זמינות 24/7. התקשרו עכשיו!" />

  <!-- OG Image -->
  <meta property="og:image" content="https://www.example.co.il/images/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="אופק אינסטלציה - אינסטלטור מקצועי בתל אביב" />
  <meta property="og:image:type" content="image/jpeg" />
</head>
```

### Twitter Card Tags

```html
<head>
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="אינסטלטור מקצועי בתל אביב | אופק אינסטלציה" />
  <meta name="twitter:description" content="צריכים אינסטלטור בתל אביב? שירות מהיר תוך שעה, מחירים הוגנים, זמינות 24/7." />
  <meta name="twitter:image" content="https://www.example.co.il/images/og-image.jpg" />
  <meta name="twitter:image:alt" content="אופק אינסטלציה - אינסטלטור מקצועי בתל אביב" />
</head>
```

### Next.js Metadata API Implementation

```typescript
// app/page.tsx (or app/layout.tsx)
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'אינסטלטור בתל אביב | אופק אינסטלציה - שירות 24/7',
  description: 'אינסטלטור מקצועי בתל אביב. שירות מהיר תוך שעה, מחירים הוגנים ללא הפתעות. זמינים 24/7 כולל שבת וחגים. התקשרו: 054-123-4567',
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: 'https://www.example.co.il',
    siteName: 'אופק אינסטלציה',
    title: 'אינסטלטור מקצועי בתל אביב | אופק אינסטלציה',
    description: 'צריכים אינסטלטור בתל אביב? שירות מהיר תוך שעה, מחירים הוגנים, זמינות 24/7. התקשרו עכשיו!',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'אופק אינסטלציה - אינסטלטור מקצועי בתל אביב',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'אינסטלטור מקצועי בתל אביב | אופק אינסטלציה',
    description: 'צריכים אינסטלטור בתל אביב? שירות מהיר תוך שעה, מחירים הוגנים, זמינות 24/7.',
    images: [
      {
        url: '/images/og-image.jpg',
        alt: 'אופק אינסטלציה - אינסטלטור מקצועי בתל אביב',
      },
    ],
  },
}
```

### OG Image Design Guidelines for Hebrew

The OG image (1200x630) is what people see when the page is shared on social platforms. For Hebrew landing pages:

1. **Hebrew text placement**: Place Hebrew text on the **right side** of the image (natural reading start in RTL)
2. **Include:**
   - Business name in Hebrew (large, prominent)
   - Primary keyword or tagline
   - Phone number or WhatsApp number
   - Logo
3. **Font size**: Minimum 48px for business name, 32px for tagline -- the image is often displayed at small sizes
4. **Contrast**: Ensure Hebrew text passes WCAG AA contrast ratios against the background
5. **Format**: JPEG or PNG (not WebP -- some platforms like WhatsApp and Telegram do not support WebP for OG images)
6. **File size**: Keep under 300KB for fast loading in share previews

### OG Tag Differences from Meta Description

The `og:description` and `<meta name="description">` can (and often should) differ:

| Tag | Purpose | Tone | Length |
|-----|---------|------|--------|
| `<meta name="description">` | Google SERP snippet | Professional, includes phone, keyword-focused | 140-150 chars |
| `og:description` | Social media preview | Conversational, action-oriented, sharing-friendly | 100-120 chars |
| `og:title` | Social media title | Can be slightly different from `<title>` | 50-60 chars |

**Example of different approaches:**

```html
<!-- For Google (formal, keyword-rich, includes phone) -->
<meta name="description"
  content="אינסטלטור מקצועי בתל אביב. שירות מהיר תוך שעה, מחירים הוגנים ללא הפתעות. זמינים 24/7 כולל שבת וחגים. התקשרו: 054-123-4567" />

<!-- For social sharing (conversational, action-driven) -->
<meta property="og:description"
  content="צריכים אינסטלטור בתל אביב? מגיעים תוך שעה, מחיר הוגן, אחריות מלאה. התקשרו עכשיו!" />
```

### Complete OG Example by Business Type

#### Bakery in Rehovot
```typescript
openGraph: {
  type: 'website',
  locale: 'he_IL',
  url: 'https://www.maapeyet-hacarmel.co.il',
  siteName: 'מאפיית הכרמל',
  title: 'מאפיית הכרמל ברחובות | לחם טרי ומאפים כל יום',
  description: 'הכי טעים ברחובות! לחם טרי, עוגות מעוצבות, ומאפים מיוחדים לאירועים. בואו לטעום!',
  images: [{
    url: '/images/og-bakery-rehovot.jpg',
    width: 1200,
    height: 630,
    alt: 'מאפיית הכרמל ברחובות - לחם טרי ומאפים',
  }],
}
```

#### Lawyer in Jerusalem
```typescript
openGraph: {
  type: 'website',
  locale: 'he_IL',
  url: 'https://www.law-cohen.co.il',
  siteName: 'משרד עו״ד כהן',
  title: 'עורך דין פלילי בירושלים | משרד עו״ד כהן',
  description: 'עורך דין פלילי מנוסה בירושלים. ייעוץ ראשוני חינם, ייצוג בבתי משפט, תוצאות מוכחות.',
  images: [{
    url: '/images/og-law-office-jerusalem.jpg',
    width: 1200,
    height: 630,
    alt: 'משרד עו״ד כהן - עורך דין פלילי בירושלים',
  }],
}
```

#### Beauty Salon in Rishon LeZion
```typescript
openGraph: {
  type: 'website',
  locale: 'he_IL',
  url: 'https://www.studio-glam.co.il',
  siteName: 'סטודיו גלאם',
  title: 'סטודיו גלאם בראשון לציון | טיפולי יופי מתקדמים',
  description: 'טיפולי פנים, לייזר, ציפורניים ועוד. הצוות המקצועי ביותר בראשון לציון. קבעו תור!',
  images: [{
    url: '/images/og-beauty-salon-rishon.jpg',
    width: 1200,
    height: 630,
    alt: 'סטודיו גלאם - מכון יופי בראשון לציון',
  }],
}
```

### Validating OG Tags

After implementation, validate using:
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
- **WhatsApp**: Simply share the URL in a WhatsApp chat to yourself and verify the preview

**Important:** Facebook and WhatsApp cache OG data aggressively. After making changes, use the Facebook Sharing Debugger to **scrape** the URL again and clear the cache.

---

## Quick Reference Checklist

### On-Page SEO Checklist for Hebrew Landing Pages

#### Title Tag
- [ ] Primary Hebrew keyword appears in the title
- [ ] City name is included
- [ ] Total length is 50-55 Hebrew characters
- [ ] Brand name is present
- [ ] No keyword repetition
- [ ] Uses `|` or `-` as separator

#### Meta Description
- [ ] Written in natural Hebrew (not translated)
- [ ] Length is 140-150 characters
- [ ] Includes a CTA phrase
- [ ] Phone or WhatsApp number included (for local business)
- [ ] Primary keyword appears naturally
- [ ] Most important info within first 120 characters

#### Headings
- [ ] Exactly one `<h1>` with primary keyword + city
- [ ] Each major section has an `<h2>`
- [ ] Sub-items use `<h3>` within their parent `<h2>` section
- [ ] No skipped heading levels
- [ ] Keywords included naturally (not forced)
- [ ] Each heading is unique on the page

#### Content
- [ ] Written natively in Hebrew (not translated)
- [ ] Total word count is 800-1,500 words
- [ ] Primary keyword density is 1-2%
- [ ] Hebrew synonyms are used throughout
- [ ] Multiple morphological forms of key terms are included
- [ ] City and 3-5 neighborhood names appear naturally
- [ ] "Answer capsule" (20-25 words) follows each H2
- [ ] Content is direct, practical, and Israeli in tone

#### URLs
- [ ] Transliterated Latin characters (no Hebrew in URL)
- [ ] Lowercase with hyphens
- [ ] Location included in slug (if not root domain)
- [ ] Short (3-5 words maximum)

#### Images
- [ ] All images have Hebrew alt text
- [ ] Alt text is descriptive, not keyword-stuffed
- [ ] File names are in English/transliterated (no Hebrew characters)
- [ ] Hero image uses `priority` (Next.js) or `loading="eager"`
- [ ] Below-fold images are lazy-loaded
- [ ] WebP format with JPEG fallback
- [ ] Explicit width and height set on all images

#### Internal Links
- [ ] Section anchor links work correctly
- [ ] Legal pages linked in footer (privacy, accessibility, terms)
- [ ] Anchor text is descriptive Hebrew (no "לחצו כאן")
- [ ] Footer includes quick navigation links
- [ ] CTA links appear after each major section

#### Open Graph
- [ ] `og:locale` set to `he_IL`
- [ ] `og:title` in Hebrew (may differ from `<title>`)
- [ ] `og:description` in Hebrew (conversational tone)
- [ ] OG image is 1200x630, JPEG/PNG format
- [ ] OG image includes Hebrew text (business name, keyword)
- [ ] Twitter card configured as `summary_large_image`
- [ ] OG tags validated with Facebook Sharing Debugger
- [ ] WhatsApp share preview tested manually

---

*This reference is part of the MediaWave Landing Page skill, focused on Hebrew-specific on-page SEO for Israeli small business landing pages. Last updated March 2026.*
