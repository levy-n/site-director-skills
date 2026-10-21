# תבנית הצהרת נגישות - Accessibility Statement Template

> Auto-fills from discovery data. All `[PLACEHOLDER]` values are replaced during generation.
> This page is required by Israeli law for all public-facing websites.

---

## Generated Output (Hebrew RTL)

```markdown
# הצהרת נגישות

## מחויבות לנגישות

[BUSINESS_NAME_HE] מחויב/ת להנגשת האתר [SITE_URL] לכלל האוכלוסייה, לרבות אנשים עם מוגבלויות, וזאת בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות, התשנ"ח-1998, ולתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013.

אנו רואים חשיבות רבה במתן חוויית גלישה שוויונית ונגישה לכל המשתמשים, ללא קשר ליכולותיהם או לטכנולוגיה המסייעת בה הם משתמשים.

---

## תקן הנגישות

האתר עומד בדרישות תקן ישראלי ת"י 5568, המבוסס על הנחיות הנגישות לתוכן אינטרנט WCAG 2.1 ברמת AA של ארגון W3C העולמי.

---

## פעולות הנגשה שבוצעו

במסגרת הנגשת האתר בוצעו הפעולות הבאות:

### ניווט ומבנה
- האתר תומך בניווט מלא באמצעות מקלדת בלבד
- מבנה כותרות היררכי ותקין (H1-H6) לניווט קל
- שימוש ב-ARIA landmarks לזיהוי אזורים באתר
- קישורי דילוג לתוכן הראשי (Skip to content)

### תוכן ומדיה
- כל התמונות כוללות טקסט חלופי (alt text) בעברית
- סרטונים כוללים כתוביות בעברית (ככל שרלוונטי)
- תוכן כתוב בשפה ברורה ומובנת

### עיצוב ותצוגה
- יחס ניגודיות צבעים עומד בדרישות רמה AA (מינימום 4.5:1 לטקסט רגיל, 3:1 לטקסט גדול)
- האתר תומך בהגדלת טקסט עד 200% ללא אובדן תוכן או פונקציונליות
- האתר מותאם לתצוגה בגדלי מסך שונים (רספונסיבי)
- האתר תומך בכיוון קריאה מימין לשמאל (RTL) באופן מלא

### טפסים ואינטראקציה
- כל שדות הטפסים כוללים תוויות (labels) ברורות
- הודעות שגיאה מזוהות ומוצגות באופן נגיש
- הודעות הצלחה מועברות גם לטכנולוגיות מסייעות
- אלמנטים אינטראקטיביים בגודל לחיצה מספק (מינימום 44x44 פיקסלים)

### תאימות טכנולוגית
- האתר תואם לקוראי מסך מובילים (NVDA, JAWS, VoiceOver)
- תמיכה בדפדפנים מובילים: Chrome, Firefox, Safari, Edge
- תמיכה במערכות הפעלה: Windows, macOS, iOS, Android

---

## מגבלות ידועות

[KNOWN_ISSUES]

<!-- DEFAULT if no issues known: -->
<!-- נכון למועד כתיבת הצהרה זו, לא ידועות לנו מגבלות נגישות באתר. אם נתקלתם בבעיה כלשהי, נשמח לשמוע ולטפל בהקדם. -->

---

## רכז/ת נגישות

בהתאם לדרישות החוק, מינינו רכז/ת נגישות שתפקידו/ה לוודא את הנגישות השוטפת של האתר ולטפל בפניות הציבור:

| פרט | מידע |
|---|---|
| **שם** | [ACCESSIBILITY_CONTACT_NAME] |
| **אימייל** | [ACCESSIBILITY_CONTACT_EMAIL] |
| **טלפון** | [ACCESSIBILITY_CONTACT_PHONE] |

פניות בנושא נגישות יטופלו תוך **7 ימי עסקים** לכל היותר.

---

## דיווח על בעיית נגישות

נתקלת בבעיית נגישות באתר? נשמח לשמוע ולטפל בהקדם האפשרי.

**ניתן לפנות אלינו בדרכים הבאות:**

- **אימייל:** [ACCESSIBILITY_CONTACT_EMAIL]
- **טלפון:** [ACCESSIBILITY_CONTACT_PHONE]
- **וואטסאפ:** [WHATSAPP_NUMBER]

**בפנייתך, אנא ציין/י:**
- תיאור הבעיה שנתקלת בה
- העמוד או הקישור בו הבעיה מופיעה
- הדפדפן ומערכת ההפעלה בהם אתה/את משתמש/ת
- הטכנולוגיה המסייעת בה השתמשת (אם רלוונטי - לדוגמה: קורא מסך, מקלדת בלבד)

אנו מתחייבים לבחון כל פנייה ולתקן בעיות נגישות בהקדם.

---

## מידע נוסף

אם אינך מצליח/ה לגשת לתוכן מסוים באתר בשל בעיית נגישות, אנו מזמינים אותך ליצור קשר ישיר ונשמח לספק את המידע בדרך נגישה חלופית.

---

## תאריכים

| | תאריך |
|---|---|
| **תאריך פרסום הצהרה זו** | [DATE] |
| **בדיקת נגישות אחרונה** | [LAST_AUDIT_DATE] |
| **עדכון אחרון של ההצהרה** | [DATE] |
```

---

## Placeholder Reference

| Placeholder | Source | Required |
|---|---|---|
| `[BUSINESS_NAME_HE]` | Discovery: business name | Yes |
| `[SITE_URL]` | Discovery: website URL | Yes |
| `[ACCESSIBILITY_CONTACT_NAME]` | Discovery: owner name (default) or dedicated contact | Yes |
| `[ACCESSIBILITY_CONTACT_EMAIL]` | Discovery: email | Yes |
| `[ACCESSIBILITY_CONTACT_PHONE]` | Discovery: phone | Yes |
| `[WHATSAPP_NUMBER]` | Discovery: WhatsApp (if available, otherwise omit row) | Optional |
| `[KNOWN_ISSUES]` | Build phase: accessibility audit results | Yes (default: no known issues) |
| `[DATE]` | Generation date | Yes (auto) |
| `[LAST_AUDIT_DATE]` | Date of last accessibility check | Yes (default: same as DATE) |

## Notes for Generator

1. If `[WHATSAPP_NUMBER]` is not available, remove the WhatsApp line from the contact section entirely.
2. If no known accessibility issues exist, use the default text: "נכון למועד כתיבת הצהרה זו, לא ידועות לנו מגבלות נגישות באתר. אם נתקלתם בבעיה כלשהי, נשמח לשמוע ולטפל בהקדם."
3. The statement must be linked from the site footer on every page.
4. The accessibility coordinator is typically the business owner for small businesses.
5. Date format should be Hebrew: DD בחודש YYYY (e.g., "15 במרץ 2025").
