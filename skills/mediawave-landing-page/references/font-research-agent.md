# Font Research Agent Reference - מחקר פונטים

> מסמך רפרנס מקיף לסוכן מחקר הפונטים. כולל קטלוג מקורות, מיפוי תעשייה-לפונט,
> כללי ביצועים, ומדריך אינטגרציה ב-Next.js 15.

---

## קטלוג מקורות פונטים עבריים

### מקורות חינמיים

| מקור | URL | סוג | הערות |
|------|-----|------|-------|
| Google Fonts (Hebrew) | `fonts.google.com/?subset=hebrew` | 50+ פונטים עבריים | עדיפות ראשונה, `next/font/google` |
| Fontsource | `fontsource.org` | חבילות npm | self-hosting קל, `next/font/local` |
| Font Squirrel | `fontsquirrel.com` | פונטים חינמיים | סנן לפי Hebrew |
| Open Font Library | `fontlibrary.org` | OFL license | מגוון מצומצם יותר |
| GitHub Hebrew Fonts | חיפוש github | open source | פרויקטים ישראליים |
| Culmus Project | `culmus.sourceforge.io` | סריף + סנס | ותיק, קלאסי |

### פונטרייות ומעצבים ישראליים

| מקור | URL | סגנון | הערות |
|------|-----|-------|-------|
| Fontef | `fontef.com` | מגוון | פונטרייה ישראלית מובילה |
| Hagilda | `hagilda.com` | ייחודי/אמנותי | סטודיו לעיצוב פונטים |
| Oded Ezer Typography | `odedezer.com` | ניסיוני/אמנותי | פונטים ייחודיים מאוד |
| Meir Sadan | `meirsadan.com` | מודרני | מעצב פונטים ישראלי |
| Masterfont | `masterfont.co.il` | מסחרי | מחירים לבדיקה |

### פרימיום עם אפשרות חינמית

| מקור | URL | תנאים |
|------|-----|-------|
| Adobe Fonts | `fonts.adobe.com` | Creative Cloud membership |
| Font Share | `fontshare.com` | חינמי לשימוש אישי ומסחרי |

---

## Google Fonts עבריים - מעבר ל-5 הנפוצים

הפונטים הנפוצים (Heebo, Rubik, Assistant, Secular One, Karantina) ידועים. הנה פונטים פחות מוכרים שכדאי לבדוק:

### פונטי גוף (Body)

| פונט | אופי | משקלים | גודל ~WOFF2 | מתאים ל |
|------|------|--------|------------|---------|
| **Noto Sans Hebrew** | אוניברסלי, ניטרלי | 100-900 | ~18KB/weight | רב-שפתי, תאגידי |
| **Varela Round** | מעוגל, ידידותי | 400 | ~15KB | קז'ואל, ילדים, מזון |
| **Alef** | מיוחד, ספרותי | 400, 700 | ~20KB | פרימיום, תרבות |
| **Suez One** | סריף, רשמי | 400 | ~22KB | יוקרה, משפטי, תרבות |
| **Frank Ruhl Libre** | סריף קלאסי | 300-900 | ~25KB | יוקרה, משפטי, אקדמי |
| **David Libre** | סריף, מסורתי | 400, 500, 700 | ~20KB | מסורתי, רשמי |
| **Bellefair** | סריף אלגנטי | 400 | ~12KB | יוקרה, אירועים |
| **Amatic SC** | כתב-יד, קליל | 400, 700 | ~15KB | קפה, מזון, קריאייטיב |

### פונטי כותרות (Display/Heading)

| פונט | אופי | משקלים | גודל ~WOFF2 | מתאים ל |
|------|------|--------|------------|---------|
| **Secular One** | בולד מאוד, אימפקט | 400 | ~15KB | כותרות hero, הכל |
| **Karantina** | דקורטיבי, חזק | 300, 400, 700 | ~12KB | דיספליי בלבד |
| **Bona Nova** | סריף, אלגנטי | 400, 400i, 700 | ~20KB | פרימיום, תרבות |
| **Miriam Libre** | ייחודי, מודרני | 400, 700 | ~18KB | טכנולוגיה, מודרני |
| **Suez One** | סריף כבד | 400 | ~22KB | יוקרה, כותרות |
| **Tinos** | סריף Times-like | 400, 400i, 700, 700i | ~22KB | רשמי, אקדמי |
| **M PLUS Rounded 1c** | מעוגל, יפני-עברי | 100-900 | ~20KB | טכנולוגיה, מודרני |

### פונטים Variable (משקלים דינמיים)

| פונט | טווח משקלים | גודל variable | יתרון |
|------|------------|--------------|-------|
| **Heebo** | 100-900 | ~45KB | קובץ אחד, כל המשקלים |
| **Rubik** | 300-900 | ~50KB | כולל italic |
| **Assistant** | 200-800 | ~40KB | קל ומהיר |
| **Noto Sans Hebrew** | 100-900 | ~48KB | כיסוי אוניברסלי |
| **Frank Ruhl Libre** | 300-900 | ~55KB | סריף variable |

---

## מיפוי תעשייה → פונט מומלץ

### לפי סוג עסק

| תעשייה | כותרות (מומלץ) | גוף (מומלץ) | אופי |
|---------|----------------|-------------|------|
| **מאפייה/מזון** | Amatic SC / Karantina | Varela Round / Assistant | חם, ביתי, ידידותי |
| **מסעדה/שף** | Suez One / Bona Nova | Heebo / Rubik | יוקרתי, מזמין |
| **סלון יופי** | Bellefair / Frank Ruhl Libre | Assistant / Heebo | אלגנטי, נשי, רך |
| **קליניקה רפואית** | Heebo 800 / Noto Sans Hebrew | Heebo / Noto Sans Hebrew | מקצועי, אמין |
| **עורך דין** | Suez One / David Libre | Frank Ruhl Libre / Heebo | רשמי, סמכותי |
| **רואה חשבון** | Heebo 700 / Miriam Libre | Heebo / Noto Sans Hebrew | מקצועי, ברור |
| **סטארטאפ/טכנולוגיה** | Rubik 700 / Miriam Libre | Rubik / Heebo | מודרני, חדשני |
| **חינוך/קורסים** | Assistant 700 / Rubik | Assistant / Varela Round | ידידותי, נגיש |
| **אירועים** | Karantina / Bellefair | Rubik / Assistant | חגיגי, מיוחד |
| **ספורט/כושר** | Secular One / Rubik 900 | Rubik / Heebo | אנרגטי, חזק |
| **נדל"ן** | Suez One / Heebo 800 | Heebo / Frank Ruhl Libre | יוקרתי, מקצועי |
| **אופנה** | Bellefair / Alef | Heebo / Assistant | אלגנטי, מודרני |
| **גינון/טבע** | Varela Round / Amatic SC | Assistant / Rubik | טבעי, רגוע |
| **פסיכולוגיה/טיפול** | Assistant 600 / Bellefair | Assistant / Heebo | רך, מרגיע, אמין |

### לפי סגנון עיצובי

| סגנון | כותרות | גוף | הערות |
|-------|--------|------|-------|
| **מינימליסטי** | Heebo 300-700 | Heebo 400 | weight contrast בלבד |
| **מודרני-נועז** | Secular One / Rubik 900 | Rubik 400 | ניגודיות חזקה |
| **אלגנטי-פרימיום** | Suez One / Bellefair | Frank Ruhl Libre | סריף עם אופי |
| **שובב-ידידותי** | Karantina / Amatic SC | Varela Round | דקורטיבי + מעוגל |
| **תאגידי-מקצועי** | Heebo 800 / Noto Sans | Heebo 400 | נקי, אמין |
| **וינטג'/רטרו** | David Libre / Alef | Alef / Frank Ruhl Libre | קלאסי, ספרותי |
| **ברוטליסטי** | Secular One / Rubik 900 | Heebo 400 | משקל כבד, פשוט |

---

## כללי ביצועים

### תקציב גודל פונטים

| רמה | תקציב כולל | פרטים |
|------|-----------|--------|
| **מינימלי** | < 50KB | פונט אחד, 2 משקלים |
| **סטנדרטי** | < 80KB | 2 פונטים, 3-4 משקלים |
| **עשיר** | < 120KB | 2-3 פונטים, 5+ משקלים או variable |
| **מקסימום** | < 150KB | שילובים מורכבים, 3 משחות |

### אופטימיזציה

```
1. WOFF2 בלבד - הפורמט הקטן ביותר
2. Subset - hebrew + latin בלבד (לא latin-ext, cyrillic)
3. font-display: swap - תמיד
4. preload - לפונט הגוף הראשי בלבד
5. Variable fonts - עדיפים כשצריך 3+ משקלים
6. next/font - תמיד (automatic optimization + self-hosting)
```

### next/font Configuration

```typescript
// Google Fonts - אופטימיזציה אוטומטית
import { Heebo, Secular_One } from 'next/font/google'

const bodyFont = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '700'],
})

const headingFont = Secular_One({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: '400',
})

// Local Fonts - פונטים self-hosted
import localFont from 'next/font/local'

const customFont = localFont({
  src: [
    { path: './fonts/Custom-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Custom-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-custom',
  display: 'swap',
})

// Variable Font - קובץ אחד, כל המשקלים
const variableFont = localFont({
  src: './fonts/Custom-Variable.woff2',
  variable: '--font-body',
  display: 'swap',
})
```

### Tailwind Integration

```typescript
// tailwind.config.ts
fontFamily: {
  heading: ['var(--font-heading)', 'var(--font-body)', 'sans-serif'],
  body: ['var(--font-body)', 'Arial', 'sans-serif'],
  display: ['var(--font-display)', 'var(--font-heading)', 'sans-serif'],
}
```

---

## שילובי פונטים מוכחים (מעבר לסטנדרטיים)

### שילובים ייחודיים מומלצים

| # | כותרות | גוף | אופי | מתאים ל |
|---|--------|------|------|---------|
| 1 | Suez One | Heebo | יוקרתי-מקצועי | נדל"ן, משפטים, פיננסים |
| 2 | Bellefair | Assistant | אלגנטי-רך | יופי, אירועים, אופנה |
| 3 | Karantina 700 | Varela Round | נועז-ידידותי | מזון, ילדים, פנאי |
| 4 | Frank Ruhl Libre 700 | Frank Ruhl Libre 400 | ספרותי-קלאסי | תרבות, חינוך, טיפול |
| 5 | Miriam Libre 700 | Rubik 400 | מודרני-ייחודי | טכנולוגיה, סטארטאפ |
| 6 | Alef 700 | Noto Sans Hebrew | מיוחד-אוניברסלי | מותגים ייחודיים |
| 7 | Amatic SC 700 | Assistant 400 | כתב-יד-קריא | מאפייה, קפה, יצירתי |
| 8 | Bona Nova 700 | Heebo 400 | קלאסי-נקי | מסעדות יוקרה, יין |
| 9 | David Libre 700 | Heebo 400 | מסורתי-מודרני | מסורת, אמנות |
| 10 | Rubik 900 | Heebo 300 | ניגודיות חזקה | כושר, ספורט, טכנולוגיה |

---

## שאלות אינטראקטיביות (בעברית)

שאל באמצעות `AskUserQuestion`:

### F1 - רמת ייחודיות הפונט
```
שאלה: "באיזו רמת ייחודיות אתה רוצה את הפונטים?"
אפשרויות:
- "סטנדרטי - פונטים מוכרים ובטוחים (Heebo, Rubik)"
- "ייחודי - שילוב מיוחד שייבדל מהמתחרים (מומלץ)"
- "נועז - פונט דיספליי דרמטי לכותרות, אפילו סריף"
- "אחר - יש לי פונט ספציפי בראש"
```

### F2 - בחירת שילוב
```
שאלה: "הנה 3 שילובי פונטים שמתאימים ל[שם הלקוח]. איזה מהם מדבר אליך?"
אפשרויות: [3 שילובים מותאמים לתעשייה + preview text]
```

### F3 - פונט דיספליי
```
שאלה: "רוצה פונט דיספליי נוסף לאלמנטים מיוחדים (מספרים גדולים, ציטוטים, badge)?"
אפשרויות:
- "כן - תציע פונט שלישי לאלמנטים מיוחדים"
- "לא - מספיק 2 פונטים"
```

### F4 - אישור סופי
```
שאלה: "בחרת [Font A] + [Font B]. לפני שממשיכים, הנה דגימה: [preview]. מאשר?"
אפשרויות:
- "מאושר - ממשיכים"
- "שינויים - רוצה לראות אלטרנטיבות"
- "אחר - יש לי הערה"
```

---

## בדיקות RTL ספציפיות לפונטים

### צ'קליסט חובה

- [ ] אותיות סופיות מרונדרות נכון: ך, ם, ן, ף, ץ
- [ ] גרש (׳) וגרשיים (״) מופיעים בצד הנכון
- [ ] kerning תקין - אין רווחים מוזרים בין אותיות
- [ ] line-height נוח - 1.6-1.8 לגוף, 1.2-1.3 לכותרות
- [ ] קריא ב-mobile - 320px width minimum
- [ ] סימני פיסוק מעורבים (עברית+אנגלית) מרונדרים נכון
- [ ] מספרים (0-9) מרונדרים LTR גם בהקשר RTL
- [ ] bold weights קריאים ולא "נדבקים" (אותיות לא מתמזגות)
- [ ] fallback font (sans-serif) לא יוצר layout shift משמעותי

### בדיקת Layout Shift

```
1. פתח את האתר עם throttled network (Slow 3G)
2. צפה האם הטקסט "קופץ" כשהפונט נטען
3. אם כן - בדוק font-size-adjust או שנה ל-font-display: optional
4. מטרה: CLS < 0.05 מפונטים
```

---

## פלט הסוכן

הסוכן מייצר דו"ח שמועבר ל-Phase 3 (Design System) ומשם ל-Phase 5 (Build):

```markdown
# דו"ח מחקר פונטים - [שם הלקוח]

## קונטקסט
- תעשייה: [סוג]
- סגנון: [כיוון]
- אופי: [מילות מפתח]

## שילוב נבחר
- כותרות: [Font Name] - [weights]
- גוף: [Font Name] - [weights]
- דיספליי: [Font Name] - [weight] (אופציונלי)

## אינטגרציה
- [next/font/google code]
- [tailwind config]
- [CSS variables]

## ביצועים
- גודל כולל: [X]KB
- Variable fonts: כן/לא
- Preload: [font name]

## בדיקות RTL
- [תוצאות הבדיקות]
```
