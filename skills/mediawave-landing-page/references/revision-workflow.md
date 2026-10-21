# Revision Workflow Reference

> **Addition 5** - Post-build revision management for Hebrew RTL landing pages.
> Context-aware: knows how many rounds were agreed, detects scope creep, enforces limits.

---

## Overview

Revisions are the #1 source of scope creep for freelance web projects. The average freelancer
loses $15,000-$25,000/year on unpaid revision work. This workflow prevents that by:

1. Collecting feedback in a structured, single-batch format
2. Tracking every change request with status
3. Detecting when requests cross from "revision" into "new feature"
4. Enforcing the agreed revision limit with a professional Hebrew message
5. Executing all approved changes in one Claude Code session

---

## Revision Collection Mechanisms

The operator chooses ONE method per project. Ask the client which they prefer.

### Option 1: Google Doc Method

Best for: Clients who think visually and prefer commenting next to what they see.

**Setup:**
1. Take numbered screenshots of each section of the live page
2. Create a Google Doc with each screenshot pasted in order
3. Number each screenshot (e.g., "1 - Hero", "2 - Services", "3 - Testimonials")
4. Share the Doc with the client (edit access)
5. Client writes comments next to each screenshot describing what to change

**Instructions to send client (Hebrew):**
```
שלום [CLIENT_NAME],
צירפתי מסמך Google עם צילומי מסך ממוספרים של כל חלקי האתר.
בבקשה כתוב/י את ההערות שלך ליד כל צילום מסך רלוונטי.

חשוב:
- אספ/י את *כל* ההערות במסמך אחד
- אל תשלח/י הערות בנפרד בוואטסאפ
- כשסיימת - הודיע/י לי ואני אתחיל לעבוד

קישור למסמך: [GOOGLE_DOC_URL]
```

**After receiving:** Convert Google Doc comments into the Revision Tracking Document (below).

### Option 2: Structured Form (Markdown Table)

Best for: Organized clients, text-oriented changes, clean handoff.

Send the client the `templates/revision-request-he.md` form (File 4 of this addition).
The client fills in the table and sends it back. This is the cleanest method because
the table maps directly to the tracking document.

### Option 3: Visual Annotation Tool

Best for: Clients who want to point at things on the actual live page.

**Recommended tools (free tiers):**

| Tool | Free Tier | Best For |
|------|-----------|----------|
| [Markup.io](https://markup.io) | 3 active projects | Direct page annotation with arrows and comments |
| [Pastel](https://usepastel.com) | 3 active sites | Simple, client-friendly - no signup needed for client |
| [BugHerd](https://bugherd.com) | 14-day trial | Most powerful - pins feedback to DOM elements |

**Setup with Pastel (recommended for Hebrew clients):**
1. Create a Pastel project with the live URL
2. Send the share link to the client
3. Client clicks anywhere on the page to leave a comment
4. Export all comments as a list
5. Convert to the Revision Tracking Document

**Setup with Markup.io:**
1. Paste the live URL into Markup.io
2. Share the annotation link with the client
3. Client uses arrows, boxes, and text to mark changes
4. Download the annotated screenshots + comment list

---

## Revision Tracking Document (Auto-Generated)

Claude Code generates this document after receiving client feedback (from any of the 3 methods above).
Store it at: `[PROJECT_ROOT]/.context/revisions/round-[N].md`

```markdown
# מעקב תיקונים - [BUSINESS_NAME]

## פרטי סבב
- **סבב:** [ROUND_NUMBER] מתוך [TOTAL_INCLUDED]
- **תאריך קבלת הערות:** [DATE_RECEIVED]
- **דד-ליין לביצוע:** [DEADLINE]
- **שיטת איסוף:** [Google Doc / טופס / כלי ויזואלי]

## רשימת שינויים

| # | מקטע | שינוי מבוקש | עדיפות | סטטוס | הערות |
|---|-------|------------|--------|--------|-------|
| 1 | Hero | שינוי כותרת ראשית | חובה | ⏳ ממתין | - |
| 2 | Hero | החלפת תמונת רקע | חובה | ⏳ ממתין | הלקוח ישלח תמונה |
| 3 | Services | שינוי ניסוח בכרטיס שלישי | רצוי | ⏳ ממתין | - |
| 4 | FAQ | הוספת שאלה חדשה | רצוי | ⏳ ממתין | - |
| 5 | Footer | עדכון מספר טלפון | חובה | ⏳ ממתין | - |

## סיכום
- **סה"כ שינויים:** [COUNT]
- **חובה:** [MUST_COUNT]
- **רצוי:** [NICE_COUNT]
- **חריגות מהיקף (ראה למטה):** [SCOPE_ISSUES_COUNT]

## חריגות מהיקף שזוהו
[LIST_OF_SCOPE_CREEP_ITEMS - or "לא זוהו חריגות"]
```

### Status Values

| Status | Meaning |
|--------|---------|
| `⏳ ממתין` | Not started yet |
| `🔄 בתהליך` | Currently being worked on |
| `✅ בוצע` | Completed |
| `⚠️ חריגה` | Flagged as scope creep - requires separate discussion |
| `❌ נדחה` | Client decided to skip this change |
| `🔒 ממתין לחומר` | Blocked - waiting for client to provide content/image |

---

## Batch Revision Execution

When the operator says "execute revisions" or "בצע תיקונים":

### Step 1: Read the Tracking Document
```
Read [PROJECT_ROOT]/.context/revisions/round-[N].md
```

### Step 2: Filter Actionable Items
- Only process items with status `⏳ ממתין`
- Skip items with status `⚠️ חריגה` (scope creep - needs separate approval)
- Skip items with status `🔒 ממתין לחומר` (blocked)

### Step 3: Execute Changes
For each actionable item:
1. Identify the file(s) that need modification
2. Make the change
3. Update the tracking document status to `✅ בוצע`
4. Add a note with what was changed

### Step 4: Generate Summary
After all changes are executed, output:

```markdown
## סיכום ביצוע - סבב [N]

**בוצעו:** [DONE_COUNT] מתוך [TOTAL_COUNT] שינויים
**נותרו:** [REMAINING_COUNT] (ממתין לחומר / חריגות מהיקף)

### שינויים שבוצעו:
1. ✅ Hero - כותרת שונתה ל"[NEW_TEXT]"
2. ✅ Services - ניסוח כרטיס שלישי עודכן
3. ✅ Footer - מספר טלפון עודכן ל-[NEW_PHONE]

### ממתינים:
4. 🔒 Hero - ממתין לתמונה מהלקוח
5. ⚠️ FAQ - הוספת שאלה - זוהה כחריגה מהיקף

### קבצים ששונו:
- `src/app/(pages)/home/page.tsx`
- `src/payload/seed/faq.ts`
- `src/components/Footer.tsx`
```

---

## Scope Creep Detection Rules

When processing client feedback, Claude Code classifies each request:

### This is a REVISION (included in the package)

| Category | Examples |
|----------|---------|
| Text changes | Change heading, fix typo, rewrite paragraph, update phone number |
| Color tweaks | Change button color, adjust background shade, modify text color |
| Image swap | Replace hero image, swap testimonial photo (client provides new image) |
| Spacing/alignment | "Make this section taller", "Add more space between cards" |
| Reorder content | "Move testimonials above FAQ", "Swap service card order" |
| Show/hide | "Remove the third FAQ item", "Hide the phone number in footer" |
| Minor styling | Font size adjustment, border radius change, shadow modification |

### This is a NEW FEATURE (extra cost)

| Category | Examples |
|----------|---------|
| New section | "Add a pricing table", "Add a team section", "Add a blog" |
| New page | "I also need an About page", "Can you add a portfolio page?" |
| Full redesign | "I changed my mind - I want a completely different look" |
| New functionality | Booking system, e-commerce, member login, payment processing |
| Complex animations | Parallax scrolling, animated counters, complex hover effects |
| Third-party integration | Calendar booking (Calendly), chat widget, CRM integration |
| SEO/Marketing add-on | Google Ads landing page variant, A/B testing setup |
| Different layout | "Can the mobile version look completely different from desktop?" |

### Gray Area (discuss with operator)

| Request | Likely Classification |
|---------|----------------------|
| "Add one more testimonial" | Revision (if adding content to existing section) |
| "Add a testimonial section" | New feature (if section doesn't exist) |
| "Change the contact form fields" | Revision (minor field changes) |
| "Add a multi-step form" | New feature (new functionality) |
| "Make the logo bigger" | Revision |
| "Design me a new logo" | Completely out of scope |

### Automatic Scope Creep Response

When a scope creep item is detected, flag it in the tracking document with `⚠️ חריגה` status
and generate this message for the operator to send:

```
שלום [CLIENT_NAME],
בבקשת התיקונים שלך, שמתי לב שהפריט "[ITEM_DESCRIPTION]" הוא למעשה תוספת חדשה ולא תיקון של תוכן קיים.

זה כולל [BRIEF_EXPLANATION - e.g., "בניית מקטע חדש שלא היה בתכנון המקורי"].

אשמח להוסיף את זה! העלות הנוספת תהיה [PRICE]₪.
רוצה שאוסיף את זה לפרויקט?

את שאר התיקונים אני כבר מבצע כחלק מסבב [ROUND_NUMBER] 😊
```

---

## Revision Limit Enforcement

### Configuration
Set these values during Phase 0.5 (Proposal) or Phase 1 (Discovery):

```
TOTAL_REVISION_ROUNDS = [number agreed in contract, typically 2-3]
EXTRA_ROUND_PRICE = [price per additional round, e.g., 300]
```

### Tracking
After each round is completed, check:
```
if CURRENT_ROUND >= TOTAL_REVISION_ROUNDS:
    → generate limit-reached message
    → do NOT start new round without operator approval
```

### Limit Reached Message (Hebrew)

```
שלום [CLIENT_NAME],

סיימנו את [X] סבבי התיקונים שכלולים בחבילה שלך - ואני שמח/ה שהאתר הולך ומשתפר! 🎉

מכאן והלאה, סבבי תיקונים נוספים מחויבים ב-[EXTRA_ROUND_PRICE]₪ לסבב.
כל סבב כולל עד [MAX_ITEMS_PER_ROUND, default: 10] פריטי תיקון.

רוצה להמשיך עם סבב נוסף?

- כן - אשלח לך את טופס התיקונים לסבב הבא
- לא - מעולה! האתר מוכן לשיגור 🚀
```

### What Counts as a "Round"

One round = one batch of feedback submitted together. NOT individual items.

Rules:
- Client sends ONE document/form with ALL changes = 1 round
- Client sends changes drip-by-drip over WhatsApp = still 1 round (operator consolidates)
- After operator executes and client confirms = round is closed
- New batch of feedback = new round
- Items marked "waiting for material" carry over to next round without costing an extra round

---

## Interactive Questions (Post-First-Delivery)

Ask these when the operator completes the first delivery and the client needs to provide feedback:

### Question 1: Feedback Method
```
How should the client submit feedback?
1. Google Doc - I'll prepare screenshots, client comments next to them
2. Structured form - I'll send the Hebrew revision form template
3. Visual tool - Client annotates directly on the live site (Pastel/Markup.io)
4. WhatsApp/Email - Client sends however they want, I'll organize it
```

### Question 2: Change Complexity Assessment
```
Based on the client's feedback, what's the complexity level?
1. Minor text only - just wording changes, typos, phone numbers
2. Layout adjustments - reordering sections, spacing, sizing
3. Major structural - adding/removing entire sections
4. Scope change - they want something fundamentally different
```

### Question 3: Revision Round Status
```
Is this within the included revision rounds?
1. Yes - this is round [__] of [__] included rounds
2. No - rounds are exhausted, this is extra (₪[PRICE] per round)
3. Not sure - let me check the proposal/contract
```

### Question 4: Urgency
```
When does the client need this completed?
1. Standard - within [DEFAULT_TURNAROUND, e.g., 3 business days]
2. Urgent - within 24 hours (may have rush fee)
3. No rush - whenever convenient
```

---

## File Storage Convention

```
[PROJECT_ROOT]/
└── .context/
    └── revisions/
        ├── round-1.md          # Tracking document for round 1
        ├── round-1-summary.md  # Execution summary for round 1
        ├── round-2.md          # Tracking document for round 2
        ├── round-2-summary.md  # Execution summary for round 2
        └── scope-changes.md    # Log of all scope creep detections
```

---

## Sources & Best Practices

This workflow is informed by industry best practices:

- Always collect ALL feedback in one batch - reduces back-and-forth by ~40%
- Number every revision item - prevents "I also mentioned..." disputes
- Separate "must have" from "nice to have" - helps prioritize execution
- Track everything in writing - protects both operator and client
- Generate the limit-reached message automatically - removes emotional burden from the operator
- Always acknowledge what was completed before discussing limits - keeps relationship positive
