# Discovery & Feedback Questions (Hebrew AskUserQuestion Blocks)

All interactive question sets for the pipeline, in phase order. Use these EXACT questions.
Run all questions that fit in a single AskUserQuestion call (max 4 per call).

## Contents

- 1. Phase 1 Round 1 — What and Why (mandatory)
- 2. Phase 1 Round 1 — Assets and Direction (mandatory)
- 3. Phase 1 — Multi-Source Discovery
- 4. Phase 3 — Design Direction (mandatory)
- 5. Phase 3 — Component Preferences
- 6. Phase 4 — Visual Input Method (mandatory)
- 7. Phase 4 Method D — Anti-Bot Manual Capture
- 8. Phase 5 — Pre-Implementation Confirmation (mandatory)
- 9. Phase 7 — Section Review
- 10. Phase 7 — Final Review
- 11. MediaWave Pipeline Activation

---

## 1. Phase 1 Round 1 — What and Why (mandatory)

```
AskUserQuestion:
  questions:
    - question: "מה בדיוק אהבת באתר הזה? (אפשר לבחור כמה)"
      header: "מה אהבת"
      multiSelect: true
      options:
        - label: "הלייאאוט הכללי"
          description: "המבנה של העמוד — איך הסקשנים מסודרים, הפרופורציות, החלוקה"
        - label: "פלטת הצבעים"
          description: "הצבעים, הטונים, היחס בין צבעים כהים לבהירים"
        - label: "הטיפוגרפיה"
          description: "הפונטים, הגדלים, המשקלים, השילוב בין כותרות לטקסט"
        - label: "האנימציות והאינטראקציות"
          description: "אפקטי hover, אנימציות scroll, מעברים, וידאו ברקע"

    - question: "איזה סקשנים הכי חשובים לך?"
      header: "עדיפות"
      multiSelect: true
      options:
        - label: "Hero / חלק עליון"
          description: "האזור הראשון שרואים — כולל וידאו, תמונה, כותרת ראשית"
        - label: "גלריה / תיק עבודות"
          description: "הצגת התמונות והעבודות — grid, masonry, lightbox"
        - label: "ניווט / תפריט"
          description: "הנאבבר, תפריט המובייל, sticky header"
        - label: "יצירת קשר / CTA"
          description: "כפתורי פעולה, טופס, לינקים לוואטסאפ/אינסטגרם"
```

## 2. Phase 1 Round 1 — Assets and Direction (mandatory)

```
AskUserQuestion:
  questions:
    - question: "יש לך חומרים מוכנים שנעבוד איתם?"
      header: "חומרים"
      multiSelect: true
      options:
        - label: "תמונות/צילומים"
          description: "תמונות מקצועיות שלך מוכנות לשימוש"
        - label: "לוגו"
          description: "לוגו מעוצב (SVG/PNG)"
        - label: "וידאו"
          description: "סרטון קצר שיכול לשמש כרקע או showcase"
        - label: "עדיין לא — נעבוד עם placeholders"
          description: "נתחיל עם תמונות זמניות ונחליף אחר כך"

    - question: "מה צריך להיות שונה מאתר ההשראה?"
      header: "שינויים"
      multiSelect: true
      options:
        - label: "צבעים — יש לי פלטה משלי"
          description: "אני רוצה להשתמש בצבעי המותג שלי, לא של אתר ההשראה"
        - label: "תוכן בעברית RTL"
          description: "האתר שלי בעברית, צריך התאמה מלאה ל-RTL"
        - label: "מבנה תוכן שונה"
          description: "סקשנים אחרים, סדר אחר, תוכן אחר"
        - label: "סגנון פשוט יותר"
          description: "פחות אנימציות, יותר מינימליסטי, יותר נקי"
```

## 3. Phase 1 — Multi-Source Discovery (if user has multiple inspiration URLs)

```
AskUserQuestion:
  questions:
    - question: "אתה רוצה לשלב אלמנטים ממספר אתרים?"
      header: "מקורות"
      multiSelect: false
      options:
        - label: "כן — מכמה אתרים"
          description: "אקח layout מאתר אחד, צבעים מאתר שני, אנימציות מאתר שלישי"
        - label: "בעיקר מאתר אחד"
          description: "אתר השראה מרכזי אחד, עם שינויים שלי"
        - label: "יש לי screenshots"
          description: "אני אעלה screenshots של מה שאהבתי מאתרים שונים"
```

## 4. Phase 3 — Design Direction (mandatory, before generating the brief)

```
AskUserQuestion:
  questions:
    - question: "מה הסגנון הכללי שאתה רוצה?"
      header: "סגנון"
      multiSelect: false
      options:
        - label: "מינימליסטי ואלגנטי"
          description: "הרבה white space, פונטים דקים, צבעים מעטים, תחושה יוקרתית"
        - label: "מודרני ונועז"
          description: "טיפוגרפיה גדולה, קונטרסט חזק, אנימציות בולטות"
        - label: "חם ואישי"
          description: "גווני אדמה, תמונות גדולות, תחושה ביתית ומזמינה"
        - label: "קולנועי ודרמטי"
          description: "רקע כהה, וידאו, תאורה דרמטית, תחושת סיפור"

    - question: "מה הפלטפורמה העיקרית של הקהל שלך?"
      header: "פלטפורמה"
      multiSelect: false
      options:
        - label: "מובייל בעיקר (מומלץ)"
          description: "רוב הגולשים יגיעו מהטלפון — mobile-first design"
        - label: "דסקטופ בעיקר"
          description: "הקהל גולש בעיקר ממחשב"
        - label: "שניהם באותה מידה"
          description: "חשוב שייראה מעולה בשניהם"

    - question: "איזה סוג גלריה מתאים לך?"
      header: "גלריה"
      multiSelect: false
      options:
        - label: "גריד נקי"
          description: "תמונות בגדלים שווים, מסודרות ברשת — נקי ומקצועי"
        - label: "Masonry (פינטרסט)"
          description: "תמונות בגבהים שונים, זורם וטבעי"
        - label: "סליידר / קרוסלה"
          description: "תמונה אחת בכל פעם, גלילה הצידה"
        - label: "Lightbox עם thumbnails"
          description: "תמונות קטנות שנפתחות לגדול בלחיצה"
```

## 5. Phase 3 — Component Preferences

```
AskUserQuestion:
  questions:
    - question: "איזה סגנון ניווט (navbar) אתה מעדיף?"
      header: "ניווט"
      multiSelect: false
      options:
        - label: "שקוף שנהיה solid ב-scroll"
          description: "מתחיל שקוף על ה-hero, נהיה לבן/כהה כשגוללים"
        - label: "Sticky קבוע למעלה"
          description: "תמיד נראה, רקע קבוע"
        - label: "המבורגר בלבד"
          description: "גם בדסקטופ — תפריט נפתח, מינימליסטי מאוד"
        - label: "Off-canvas (נפתח מהצד)"
          description: "תפריט שנכנס מהצד כמו ב-Agata Photography"

    - question: "איזה סוג hero (חלק עליון) אתה רוצה?"
      header: "Hero"
      multiSelect: false
      options:
        - label: "וידאו ברקע"
          description: "סרטון שרץ אוטומטית עם טקסט מעל — קולנועי ומרשים"
        - label: "תמונה גדולה + טקסט"
          description: "תמונה מלאת מסך עם כותרת וכפתור CTA"
        - label: "סליידר תמונות"
          description: "כמה תמונות שמתחלפות אוטומטית"
        - label: "Split — תמונה + טקסט צד בצד"
          description: "חצי מסך תמונה, חצי מסך טקסט"

    - question: "מה ה-CTA (כפתור פעולה) הראשי שלך?"
      header: "CTA"
      multiSelect: false
      options:
        - label: "וואטסאפ"
          description: "כפתור שפותח שיחת WhatsApp ישירות"
        - label: "טלפון"
          description: "כפתור שמתקשר ישירות"
        - label: "טופס יצירת קשר"
          description: "טופס באתר עצמו"
        - label: "אינסטגרם"
          description: "כפתור שמוביל לפרופיל האינסטגרם"
```

## 6. Phase 4 — Visual Input Method (mandatory)

```
AskUserQuestion:
  questions:
    - question: "איך תרצה להראות לי את ההשראה הוויזואלית?"
      header: "קלט ויזואלי"
      multiSelect: true
      options:
        - label: "Screenshots / תמונות"
          description: "יש לי צילומי מסך או תמונות מוכנות שאעלה"
        - label: "סרטון / הקלטת מסך"
          description: "יש לי קובץ MP4/MOV/GIF של אנימציה או הקלטת מסך מהאתר"
        - label: "URL של אתר חי"
          description: "אתן כתובת ונגלוש לאתר בפועל עם Playwright MCP"
        - label: "רק URL לניתוח קוד"
          description: "אין לי חומר ויזואלי — תנתח את ה-HTML/CSS של האתר"
```

## 7. Phase 4 Method D — Anti-Bot Manual Capture

```
AskUserQuestion:
  questions:
    - question: "האתר חוסם כלים אוטומטיים. אפשר לצלם ידנית?"
      header: "צילום ידני"
      multiSelect: false
      options:
        - label: "אצלם screenshots"
          description: "אצלם מסך של כל סקשן ואעלה את התמונות"
        - label: "אקליט סרטון מסך"
          description: "אקליט את האתר עם OBS/ShareX/ScreenToGif ואעלה MP4"
        - label: "אנסה Chrome DevTools"
          description: "אשתמש ב-F12 > More Tools > CSS Overview לחלץ מידע"
```

## 8. Phase 5 — Pre-Implementation Confirmation (mandatory)

```
AskUserQuestion:
  questions:
    - question: "אני מוכן להתחיל לבנות. איך תרצה שנתקדם?"
      header: "התקדמות"
      multiSelect: false
      options:
        - label: "סקשן אחרי סקשן עם אישור"
          description: "אבנה כל סקשן ואראה לך — תאשר לפני שממשיכים לבא"
        - label: "תבנה הכל ביחד"
          description: "תבנה את כל האתר בבת אחת, אני אבדוק בסוף"
        - label: "קודם רק את ה-Hero"
          description: "תתחיל רק מהחלק העליון — נראה איך זה נראה ונמשיך"

    - question: "יש לך אנימציות מיוחדות שחשובות לך?"
      header: "אנימציות"
      multiSelect: true
      options:
        - label: "Fade-in כשגוללים"
          description: "אלמנטים מופיעים בהדרגה כשמגיעים אליהם בגלילה"
        - label: "Parallax"
          description: "שכבות זוזות במהירויות שונות בגלילה — עומק ויזואלי"
        - label: "Hover effects על תמונות"
          description: "זום, overlay, או caption שמופיע כשעוברים עם העכבר"
        - label: "בלי אנימציות — נקי ופשוט"
          description: "מעברים מינימליים בלבד, בלי אפקטים מיוחדים"
```

## 9. Phase 7 — Section Review (after each section, if user chose step-by-step)

```
AskUserQuestion:
  questions:
    - question: "איך נראה לך הסקשן הזה?"
      header: "פידבק"
      multiSelect: false
      options:
        - label: "מעולה — תמשיך לבא"
          description: "אני מרוצה, אפשר להמשיך לסקשן הבא"
        - label: "כמעט — צריך שינויים קטנים"
          description: "בגדול טוב, אבל יש כמה דברים לתקן"
        - label: "לא מתאים — תנסה גישה אחרת"
          description: "זה לא מה שדמיינתי, בוא ננסה כיוון אחר"
        - label: "תראה לי את זה במובייל"
          description: "רוצה לראות איך זה נראה בגודל טלפון קודם"
```

## 10. Phase 7 — Final Review

```
AskUserQuestion:
  questions:
    - question: "סיימנו את הבנייה! מה עכשיו?"
      header: "סיום"
      multiSelect: true
      options:
        - label: "תבדוק ביצועים (Lighthouse)"
          description: "בדיקת מהירות, נגישות, SEO — ציון מעל 90"
        - label: "תבדוק responsive בכל הגדלים"
          description: "בדיקה שהאתר נראה טוב בטלפון, טאבלט ודסקטופ"
        - label: "יש עוד שינויים ותיקונים"
          description: "אני רוצה לעשות עוד סבב של שינויים"
        - label: "מושלם — סיימנו!"
          description: "אני מרוצה מהתוצאה, אפשר לעשות deploy"
```

## 11. MediaWave Pipeline Activation (client landing page for Israeli business)

```
AskUserQuestion:
  questions:
    - question: "זה אתר ללקוח? אם כן, אפשר לשלב את Pipeline המלא של MediaWave"
      header: "MediaWave"
      multiSelect: false
      options:
        - label: "כן — תפעיל Pipeline מלא"
          description: "כולל discovery, קופי בעברית, CMS, SEO, נגישות, מסמכים משפטיים"
        - label: "רק את העיצוב"
          description: "לא צריך CMS או pipeline מלא — רק לבנות את הפרונטנד"
        - label: "כן אבל בלי CMS"
          description: "רוצה את ה-pipeline (קופי, SEO, נגישות) אבל בלי Payload CMS"
```
