---
description: Smart intake workflow — ask guiding questions in Hebrew to configure optimal skill usage
argument-hint: [optional: brief description of what you want to build or improve]
---

Run a structured intake to configure the frontend-super skill for maximum efficiency.
Use AskUserQuestion to gather context BEFORE loading any reference files or writing code.

**IMPORTANT: ALL questions MUST be asked in Hebrew.** The labels, descriptions, and questions below are in Hebrew. Do NOT translate them to English.

## Batch 1 — Core Context (always ask all 4)

Use AskUserQuestion with these 4 questions simultaneously:

**Question 1** — header: "סוג עבודה", multiSelect: false
- question: "מה סוג העבודה הפרונטנדית שצריך לעשות?"
- label: "בנייה חדשה" — description: "יצירת קומפוננטה, סקשן, או עמוד מאפס"
- label: "שיפור עיצוב" — description: "שיפור קומפוננטה או עמוד קיימים"
- label: "סקירת עיצוב" — description: "הערכת איכות עם ציון מובנה — ללא שינויי קוד"
- label: "תיקון טכני" — description: "ביצועים, נגישות, או בעיות רספונסיביות"

**Question 2** — header: "כיוון", multiSelect: false
- question: "יש לך רפרנס עיצובי?"
- label: "יש URL/Figma" — description: "חילוץ עקרונות עיצוב מלינק רפרנס שכבר יש לך"
- label: "חיפוש ב-Godly" — description: "עצור, דפדף ב-godly.website, מצא עיצוב שאהבת ושלח לי את הלינק"
- label: "רעיון אסתטי" — description: "תתאר את הכיוון הוויזואלי שאתה רוצה"
- label: "להיות נועז" — description: "AI מציע כיוון ייחודי, בולט ובלתי נשכח"

**Question 3** — header: "איכות", multiSelect: false
- question: "מה רמת האיכות שאתה מכוון אליה?"
- label: "מקצועי (70+)" — description: "איכות חזקה, מוכן לשליחה. 2 סבבי שיפור. (מומלץ)"
- label: "פורטפוליו (85+)" — description: "ייחודיות מקסימלית ופוליש. 3 סבבי שיפור."
- label: "שליחה מהירה (50+)" — description: "פונקציונלי קודם, פוליש אחר כך. סבב אחד."

**Question 4** — header: "RTL", multiSelect: false
- question: "האם זה פרויקט RTL/עברית?"
- label: "עברית RTL" — description: "תצוגה מימין-לשמאל מלאה עם כללי טיפוגרפיה עברית"
- label: "דו-לשוני" — description: "גם עברית וגם אנגלית צריכים תמיכת RTL"
- label: "LTR בלבד" — description: "שמאל-לימין סטנדרטי, ללא צורך ב-RTL"

## Batch 2 — Conditional Follow-Up (1-2 questions based on Batch 1 answers)

### If Work type = "בנייה חדשה":

Use AskUserQuestion with 1 question:

**Question** — header: "סוג בנייה", multiSelect: false
- question: "מה אתה בונה?"
- label: "הירו/לנדינג" — description: "סקשן דרמטי מעל הקפל עם רושם ראשוני חזק"
- label: "סקשן תוכן" — description: "כרטיסים, פיצ'רים, אודות, שירותים, המלצות"
- label: "UI אינטראקטיבי" — description: "טופס, ניווט, מודאל, דראוור, חיפוש"
- label: "עמוד מלא" — description: "עמוד שלם עם מספר סקשנים"

### If Work type = "שיפור עיצוב":

Use AskUserQuestion with 1 question:

**Question** — header: "מוקדים", multiSelect: true
- question: "אילו תחומים צריכים שיפור? (ניתן לבחור כמה)"
- label: "טיפוגרפיה" — description: "בחירת פונטים, גדלים, ניגודי משקל, היררכיה"
- label: "צבע וניגודיות" — description: "קוהרנטיות פלטה, יחסי ניגודיות, שימוש באקסנט"
- label: "מבנה ומרווחים" — description: "יישור גריד, רווח לבן, ברייקפוינטים רספונסיביים"
- label: "אנימציה ופוליש" — description: "אנימציות, טרנזישנים, הובר, מיקרו-דיטיילים"

### If Reference = "יש URL/Figma" OR "חיפוש ב-Godly":

**Step 1 (Godly only):** Tell the user (in Hebrew):
"לך ל-**godly.website** — גלריה עם 1,000+ עיצובי אתרים ברמה הכי גבוהה.
אפשר לסנן לפי סגנון, טיפוגרפיה, אנימציות, טכנולוגיה ועוד.
דפדף, מצא עיצוב שאתה אוהב ושמתאים לכיוון שלך."
Then WAIT for the user to come back with a URL.

**Step 2 (both — URL received):** Ask the user for the URL if not already provided.

**Step 3 — Auto-Detect Visual Tool & Analyze:**

Claude MUST auto-detect the best available visual analysis method. Do NOT ask the user to choose — detect and use automatically. Follow this priority order:

**Priority 1 — Playwright MCP (best for reference analysis):**
Check if Playwright MCP is available by attempting to use a `browser_navigate` tool from the playwright MCP server.
If available:
1. Tell user (Hebrew): "מזהה Playwright MCP — אנווט לאתר ואצלם אוטומטית ב-3 רזולוציות."
2. Navigate to URL
3. Set viewport 1280x800, take screenshot (desktop overview)
4. Set viewport 768x1024, take screenshot (tablet)
5. Set viewport 375x812, take screenshot (mobile)
6. Scroll down on desktop viewport, take additional screenshots to capture full page
7. Analyze ALL screenshots visually: color palette, typography style, spacing rhythm, layout approach, motion feel, composition, overall aesthetic
8. Generate `<frontend_aesthetics>` block from visual analysis

**Priority 2 — Chrome Integration:**
If Playwright MCP is not available, check if Chrome integration is connected (browser tools like `browser_navigate` from `claude-in-chrome` are available).
If available:
1. Tell user (Hebrew): "משתמש ב-Chrome — אנווט לאתר ואצלם."
2. Navigate to URL with `browser_navigate`
3. Take screenshot with `browser_screenshot`
4. Scroll down, take more screenshots to see full page
5. Analyze visually: colors, fonts, spacing, layout, composition
6. Generate `<frontend_aesthetics>` block from visual analysis

**Priority 3 — Screenshot Paste (universal fallback):**
If neither Playwright MCP nor Chrome integration is available:
1. Tell user (Hebrew): "אין לי כלי ניווט ויזואלי מותקן כרגע. בבקשה צלם screenshots של מה שאהבת בעיצוב:"
2. Instructions: "**Win+Shift+S** → בחר את האזור → **Ctrl+V** כאן. אפשר כמה screenshots — overview כללי ודיטיילים שאהבת."
3. Also suggest setup for next time (Hebrew): "💡 טיפ להבא: התקן Playwright MCP פעם אחת ואוכל לנווט לבד: `claude mcp add playwright -- cmd /c npx -y @playwright/mcp@latest`"
4. WAIT for paste
5. Analyze pasted screenshots visually: extract color palette, typography style, spacing rhythm, layout approach, motion feel, overall aesthetic
6. Generate `<frontend_aesthetics>` block from what you SEE

**After analysis (all methods):** Generate `<frontend_aesthetics>` block following `templates/aesthetics-block.md`. Extract design PRINCIPLES, not exact values — focus on typography philosophy, color approach, spacing rhythm, layout strategy, and motion feel.

### If Reference = "רעיון אסתטי":

Ask the user (in Hebrew): "תאר את הכיוון האסתטי שאתה רוצה במשפט-שניים." Use their description to generate a `<frontend_aesthetics>` block following `templates/aesthetics-block.md`.

## Answer-to-Configuration Mapping

After both batches, output a configuration summary **in Hebrew** and begin execution.

### Reference Files to Load

Map answers to specific reference files:

| Answer Combination | Load These References |
|---|---|
| בנייה חדשה + הירו/לנדינג | typography-system, spacing-system, motion-system |
| בנייה חדשה + סקשן תוכן | typography-system, spacing-system |
| בנייה חדשה + UI אינטראקטיבי | framework-tips |
| בנייה חדשה + עמוד מלא | typography-system, spacing-system, color-system |
| שיפור + טיפוגרפיה | typography-system |
| שיפור + צבע וניגודיות | color-system |
| שיפור + מבנה ומרווחים | spacing-system |
| שיפור + אנימציה ופוליש | motion-system |
| שיפור + (הכל נבחר) | evaluation-criteria (run /evaluate-design first) |
| סקירת עיצוב | evaluation-criteria, anti-patterns |
| תיקון טכני | testing-verification |
| *כל שילוב* + עברית RTL או דו-לשוני | ADD rtl-hebrew.md to the above |
| *כל שילוב* + להיות נועז | ADD anti-patterns.md to the above |
| *כל שילוב* + יש URL/Figma or חיפוש ב-Godly | Auto-detect visual tool (see below) |

### Visual Tool Auto-Detection (reference analysis)

Claude auto-detects the best available visual tool. **Do NOT ask the user to choose — detect and use automatically.**

| Priority | Tool | How to Detect | What Claude Sees |
|---|---|---|---|
| 1 | Playwright MCP | `browser_navigate` tool from playwright server is available | Full visual at 3 breakpoints (375/768/1280) — best for reference analysis |
| 2 | Chrome Integration | `browser_navigate` tool from `claude-in-chrome` is available | Full visual + interactive browsing |
| 3 | Screenshot Paste | Always available (fallback) | Full visual of what user captures manually |

**Setup tip for users** (suggest if falling back to screenshot):
```
claude mcp add playwright -- cmd /c npx -y @playwright/mcp@latest
```

### Command Sequence

Map answers to the recommended command execution order:

**בנייה חדשה:**
1. (If URL) `/extract-reference [URL]`
2. `/new-component [Name]`
3. `/evaluate-design [path]`
4. If score < threshold: `/progressive-refine [path]`
5. (If RTL) `/rtl-validate [path]`
6. `/polish [path]`

**שיפור עיצוב:**
1. (If URL) `/extract-reference [URL]`
2. `/evaluate-design [path]` — establish baseline score
3. If specific focus areas: `/progressive-refine [path]` — will auto-focus on selected stages
4. If general: `/progressive-refine [path]` — all 5 stages
5. `/evaluate-design [path]` — measure improvement
6. (If RTL) `/rtl-validate [path]`
7. If score >= threshold: `/polish [path]`

**סקירת עיצוב:**
1. `/critique [path]` — Generator-Critic evaluation
2. `/evaluate-design [path]` — structured JSON scoring
3. Report findings with priority fixes. No code changes.

**תיקון טכני:**
1. `/responsive-check [path]` — test at 3 breakpoints
2. `/perf-audit [path]` — Lighthouse audit
3. (If RTL) `/rtl-validate [path]`
4. Fix issues found. Re-run checks.

### Quality Thresholds

| Quality Choice | Score Threshold | Max Iterations | Focus |
|---|---|---|---|
| פורטפוליו (85+) | 85 | 3 full passes | ייחודיות מקסימלית |
| מקצועי (70+) | 70 | 2 full passes | איכות מוצקה |
| שליחה מהירה (50+) | 50 | 1 pass | בסיס פונקציונלי |

## Output Format

After mapping, present the summary to the user **in Hebrew**:

```
## סיכום אינטייק פרונטנד

**עבודה**: [סוג עבודה] — [סוג בנייה או מוקדי שיפור]
**כיוון עיצובי**: [גישת רפרנס]
**ניתוח ויזואלי**: [Playwright MCP (אוטומטי) / Chrome (אוטומטי) / Screenshot (ידני)]
**יעד איכות**: [סף ציון] (מקסימום [N] סבבים)
**RTL**: [כן/לא/דו-לשוני]

### תוכנית ביצוע
1. [פעולה ראשונה]
2. [פעולה שנייה]
3. ...

### רפרנסים שנטענו
- [reference-file-1.md]
- [reference-file-2.md]

מתחיל עם שלב 1...
```

Then BEGIN executing the plan. Do not wait for additional confirmation after showing the summary — the user already answered the intake questions.
