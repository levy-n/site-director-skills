# Question Engine Reference

## Master Question Bank for Landing Page Client Discovery
### Synthesized from StoryBrand, JTBD, Copyhackers, CXL, Unbounce, and Agency Best Practices

---

## Contents

1. Overview
2. Tier 1: Must-Have Discovery (Q1-Q10)
3. Israeli Market Supplement (QIL-1 to QIL-3)
4. World Block: The Client's Professional World (W-Q1 to W-Q6)
5. Tier 2: Design Decisions (Q11-Q17), skipped when site-director runs
6. Tier 3: Copy Validation (Q18-Q22)
7. Tier 4: Pre-Launch Checklist (Q23-Q29)
8. Question Flow Best Practices (conditional logic, format rules, easy-hard-easy arc)
9. Output Mapping Table
10. Key Statistics

---

## Overview

This question engine powers the client discovery phase of the MediaWave Landing Page Pipeline. Every question maps directly to a landing page element. The questions are organized into 4 tiers with progressive depth, plus the World block (W-Q1 to W-Q6) that runs with Tier 1, designed to extract maximum information with minimum client friction.

**Key Principles:**
- Progressive disclosure: 2-3 questions per screen, never all at once
- Easy-hard-easy arc: start with facts, move to strategy, end with confirmations
- Every question has a purpose: no question exists without mapping to a page element
- "I don't know / decide for me" is always an option for design questions
- Conditional logic: skip irrelevant questions based on prior answers

---

## Tier 1: Must-Have Discovery (10 Core + 3 Israeli Supplement)

### Q1: Business Identity

**Question:** מה שם העסק שלכם? (בעברית ובאנגלית)

**Format:** Open text (two fields)
- Field 1: שם בעברית (Hebrew name)
- Field 2: English name (for domain/branding)

**Options:** N/A (open text)

**Why This Matters:**
- **Framework:** Foundational (all frameworks)
- The Hebrew name appears in headlines, meta tags, footer, and admin panel
- The English name is used for domain, social media, and international-facing elements
- Mismatched Hebrew/English names cause confusion in SEO and branding

**Maps To:**
- Hero headline (Hebrew name)
- Page `<title>` tag
- Footer business name
- Open Graph `og:site_name`
- Admin panel branding

---

### Q2: Business Description

**Question:** תתארו את העסק שלכם במשפט אחד. מה אתם עושים ולמי?

**Format:** Open text (1-2 sentences)

**Options:** N/A

**Why This Matters:**
- **Framework:** StoryBrand (the "one-liner"), JTBD (functional job)
- StoryBrand's one-liner formula: Character + Problem + Plan + Success
- This sentence becomes the foundation for all page copy
- If the client can't describe their business in one sentence, the page won't have a clear message

**Maps To:**
- Hero subheadline
- Meta description
- Open Graph description
- Above-the-fold value proposition

---

### Q3: Single Conversion Goal

**Question:** מה הפעולה האחת שאתם רוצים שמבקר באתר יעשה?

**Format:** Single select

**Options:**
- [ ] למלא טופס יצירת קשר (Fill out contact form)
- [ ] לשלוח הודעה בוואטסאפ (Send WhatsApp message)
- [ ] להתקשר (Call directly)
- [ ] להירשם / להשאיר פרטים (Register / leave details)
- [ ] לקנות מוצר / שירות (Purchase product/service)
- [ ] להוריד קובץ / מדריך (Download file/guide)
- [ ] אחר (Other - specify)

**Why This Matters:**
- **Framework:** Unbounce (Attention Ratio 1:1), CXL (single-focus pages)
- Single-CTA pages convert at 13.5% vs. 11.9% for multi-CTA
- This determines the primary CTA button text and behavior
- Every section on the page must guide toward this one action
- Unbounce data: pages with 1 link have highest conversion rates

**Maps To:**
- Primary CTA button (text + action)
- Hero CTA button
- Mid-page CTA sections
- Contact form configuration
- WhatsApp button message
- Form fields selection

---

### Q4: Ideal Customer Profile

**Question:** תתארו את הלקוח האידיאלי שלכם. מי בדיוק הם?

**Format:** Open text with prompts:
- גיל: (Age range)
- מגדר: (Gender, if relevant)
- מיקום: (Location)
- מקצוע / תחום: (Profession / industry)
- מצב: (Situation that triggers need)

**Options:** N/A (open text with guided fields)

**Why This Matters:**
- **Framework:** JTBD (hiring context), Copyhackers (voice of customer), StoryBrand (the character)
- JTBD: People don't buy products, they "hire" them for a job. Understanding the customer reveals the job.
- The landing page must speak directly to this person's language, concerns, and aspirations
- Hebrew copy style changes dramatically between B2B (formal) and B2C (casual)
- Israeli market specifics: age group determines platform (Facebook 35+, Instagram 25-40, TikTok 18-30)

**Maps To:**
- Copy tone and formality level (formal Hebrew vs. casual Hebrew)
- Feature descriptions (what matters to THIS customer)
- Testimonial selection (matching demographics)
- Visual style (professional vs. casual vs. luxury)
- Traffic source strategy

---

### Q5: Customer Problem + Feeling

**Question:** מה הבעיה העיקרית שהלקוחות שלכם מתמודדים איתה? איך הם מרגישים בגלל הבעיה הזו?

**Format:** Open text (two parts)
- Part 1: הבעיה (The problem)
- Part 2: הרגש (The feeling - frustration, fear, overwhelm, embarrassment, etc.)

**Options:** N/A

**Why This Matters:**
- **Framework:** StoryBrand (external problem + internal problem), Copyhackers (pain points)
- StoryBrand distinguishes three levels of problems:
  - External (practical): "My website doesn't get leads"
  - Internal (emotional): "I feel invisible and behind my competitors"
  - Philosophical (moral): "Small businesses deserve to succeed"
- The emotional problem is what actually drives purchasing decisions
- Copy that addresses feelings converts 2-3x better than feature-only copy
- Hebrew allows for more emotionally direct language than English

**Maps To:**
- Hero headline (addresses the problem or the transformation)
- Problem section (if included)
- Feature descriptions (framed as solutions to the problem)
- Testimonial quotes (should mention the problem they had)
- FAQ items (addressing problem-related concerns)

---

### Q6: Differentiator

**Question:** למה שלקוח יבחר בכם ולא במתחרים? מה הדבר האחד שרק אתם מציעים?

**Format:** Open text

**Options:** N/A (but provide examples to spark thinking):
- "יש לנו 15 שנות ניסיון בתחום"
- "אנחנו היחידים שמציעים אחריות לכל החיים"
- "יש לנו את הטכנולוגיה הכי מתקדמת"
- "המחירים שלנו הכי תחרותיים"
- "אנחנו מעניקים שירות אישי 24/7"

**Why This Matters:**
- **Framework:** CXL (value proposition), StoryBrand (the guide's authority), JTBD (competitive alternatives)
- CXL: A value proposition must be: clear, credible, unique, and relevant
- This becomes the #1 reason to choose this business over alternatives
- Without a clear differentiator, the page becomes generic and low-converting
- JTBD: Understanding what customers are currently "hiring" instead reveals the competitive landscape

**Maps To:**
- Hero headline or subheadline (the core promise)
- Features section (proof of the differentiator)
- Trust badges / certifications section
- "Why us" section
- Social proof selection

---

### Q7: Traffic Source

**Question:** איך אנשים יגיעו לעמוד הנחיתה?

**Format:** Multi-select

**Options:**
- [ ] קמפיין פייסבוק / אינסטגרם (Facebook / Instagram ads)
- [ ] גוגל אדס - חיפוש (Google Ads - Search)
- [ ] גוגל אדס - דיספליי (Google Ads - Display)
- [ ] SEO / חיפוש אורגני (Organic search)
- [ ] וואטסאפ / SMS (WhatsApp / SMS marketing)
- [ ] רשתות חברתיות - אורגני (Social media - organic)
- [ ] הפניות / שיתופי פעולה (Referrals / partnerships)
- [ ] אחר (Other)

**Why This Matters:**
- **Framework:** Unbounce (message match), CXL (traffic temperature)
- Unbounce's "message match" principle: the landing page headline must match the ad headline
- Traffic source determines visitor awareness level (cold from display vs. warm from search)
- Facebook traffic: emotional, visual-driven, short attention span
- Google Search traffic: intent-driven, seeking specific solution
- Referral traffic: warm, needs reinforcement not persuasion
- This affects page length, content order, and proof intensity

**Maps To:**
- Page length (longer for cold traffic, shorter for warm)
- Headline strategy (match ad message)
- First section content (hook style)
- Amount of social proof needed
- Form length (more fields for warm, fewer for cold)

---

### Q8: Awareness Level (Schwartz's 5 Levels)

**Question:** כמה הלקוחות שלכם מודעים לבעיה ולפתרון שלכם?

**Format:** Single select

**Options:**
1. **לא מודעים לבעיה כלל** (Unaware) - "הם לא יודעים שיש להם בעיה"
2. **מודעים לבעיה אבל לא לפתרון** (Problem-Aware) - "הם יודעים שמשהו לא עובד, אבל לא יודעים מה הפתרון"
3. **מודעים שיש פתרונות בשוק** (Solution-Aware) - "הם יודעים שיש פתרונות, אבל לא מכירים אתכם"
4. **מכירים אתכם אבל לא בטוחים** (Product-Aware) - "הם שמעו עליכם, אבל עדיין לא החליטו"
5. **מוכנים לקנות, צריכים דחיפה אחרונה** (Most-Aware) - "הם כמעט מוכנים, צריכים רק סיבה אחרונה"

**Why This Matters:**
- **Framework:** Eugene Schwartz's 5 Levels of Awareness (Breakthrough Advertising), Copyhackers
- This is the MOST important strategic question for landing page copy
- It determines EVERYTHING: headline approach, page length, content structure, proof level
- Unaware visitors need long pages with education; Most-Aware need short pages with offers
- Getting this wrong = page talks to the wrong awareness level = low conversion

**Mapping by Awareness Level:**

| Level | Headline Style | Page Length | Content Focus |
|-------|---------------|-------------|---------------|
| Unaware | Story/curiosity | Very long | Education + problem agitation |
| Problem-Aware | Name the problem | Long | Problem + solution introduction |
| Solution-Aware | Differentiation | Medium | Why you vs. alternatives |
| Product-Aware | Offer/proof | Medium-short | Testimonials + FAQ + offer |
| Most-Aware | Direct CTA | Short | Offer + urgency + CTA |

**Maps To:**
- Page length and section order
- Headline strategy and copy approach
- Amount of educational content
- Social proof quantity and type
- CTA urgency level
- FAQ content (objection handling vs. education)

---

### Q9: Transformation Promise

**Question:** מה המצב של הלקוח לפני שהוא עובד איתכם, ומה המצב אחרי?

**Format:** Open text (two fields)
- Field 1: לפני (Before) - "הלקוח מגיע כש..."
- Field 2: אחרי (After) - "אחרי שעובדים איתנו, הלקוח..."

**Options:** N/A

**Why This Matters:**
- **Framework:** StoryBrand (transformation), JTBD (desired outcome), Copyhackers (before/after)
- StoryBrand: The customer is the hero. The brand is the guide. The story is the transformation.
- JTBD: People buy the "after" state, not the product
- Before/After is the most powerful copywriting framework for landing pages
- This directly generates the hero headline, features framing, and CTA messaging

**Maps To:**
- Hero headline (the "after" state)
- Features section (how each feature enables the transformation)
- Testimonials (stories of transformation)
- CTA button text (inviting the transformation)
- Before/After section (if included)

---

### Q10: Existing Assets & Timeline

**Question:** מה כבר יש לכם? ומה לוח הזמנים?

**Format:** Multi-select + open text

**Part A - Existing Assets:**
- [ ] לוגו (Logo)
- [ ] צבעי מותג (Brand colors)
- [ ] תמונות מקצועיות (Professional photos)
- [ ] תוכן כתוב (Written content)
- [ ] המלצות מלקוחות (Customer testimonials)
- [ ] סרטונים (Videos)
- [ ] דומיין (Domain name - specify)
- [ ] אין כלום, צריך הכל (Nothing, need everything)

**Part B - Timeline:**
- Field: מתי צריך שהעמוד יהיה מוכן? (When does the page need to be ready?)

**Why This Matters:**
- **Framework:** Agency best practice (scope management)
- Determines what needs to be created vs. what already exists
- Existing assets speed up the project and reduce costs
- No logo or brand colors = need to make design decisions
- No testimonials = need to source social proof creatively
- Timeline affects what's feasible and what corners can be cut

**Maps To:**
- Design system (existing brand colors or new)
- Media library (existing photos or stock/AI)
- Testimonials section (real quotes or need to collect)
- Project timeline and scope

---

### Israeli Market Supplement

### QIL-1: Preferred Contact Method

**Question:** איך הלקוחות שלכם מעדיפים ליצור קשר?

**Format:** Multi-select with ranking (drag to reorder by priority)

**Options:**
- [ ] וואטסאפ (WhatsApp) - #1 in Israel
- [ ] טלפון (Phone call)
- [ ] טופס באתר (Website form)
- [ ] אימייל (Email)
- [ ] הודעה בפייסבוק/אינסטגרם (Social media DM)

**Why This Matters:**
- **Framework:** Israeli market research, CXL (reduce friction)
- WhatsApp is the #1 communication channel in Israel for business
- 95% of Israelis use WhatsApp daily
- Including WhatsApp as a contact method can increase conversions by 40%+ in the Israeli market
- Phone calls are still preferred for high-ticket services
- This determines which contact methods to emphasize and which to hide

**Maps To:**
- WhatsApp button (show/hide, position, message)
- Contact form (show/hide, field selection)
- Phone number display (clickable in header/footer)
- CTA button destination (form vs. WhatsApp vs. phone)

---

### QIL-2: Page Language

**Question:** באיזו שפה העמוד צריך להיות?

**Format:** Single select

**Options:**
- [ ] עברית בלבד (Hebrew only) - Default
- [ ] עברית + אנגלית (Hebrew + English version)
- [ ] אנגלית בלבד (English only)
- [ ] עברית + ערבית (Hebrew + Arabic)
- [ ] אחר (Other)

**Why This Matters:**
- **Framework:** Localization best practice
- Determines RTL/LTR setup, font selection, and content structure
- Hebrew-only is the most common for Israeli SMBs
- English version may be needed for international clients or English-speaking immigrants
- Arabic version is relevant for some businesses (restaurants, medical, government)

**Maps To:**
- `dir` and `lang` attributes on `<html>`
- Font selection (Hebrew fonts vs. multilingual)
- Content creation scope
- URL structure (single page vs. `/en` route)

---

### QIL-3: Israeli-Specific Needs

**Question:** יש צרכים ספציפיים לשוק הישראלי?

**Format:** Multi-select

**Options:**
- [ ] עמוד נגיש (נגישות לאתרי אינטרנט - חוק שוויון זכויות) - Accessibility compliance (Israeli law)
- [ ] תעודת עוסק מורשה / ח.פ. בפוטר (Business registration number in footer)
- [ ] מדיניות פרטיות בעברית (Hebrew privacy policy)
- [ ] תנאי שימוש (Terms of service)
- [ ] תמיכה בסליקת אשראי ישראלית (Israeli credit card processing) - If e-commerce
- [ ] חשבונית / קבלה (Invoice/receipt) - If e-commerce
- [ ] אין צרכים מיוחדים (No special needs)

**Why This Matters:**
- **Framework:** Israeli legal requirements, accessibility law
- Israeli accessibility law (תקנות שוויון זכויות) requires website accessibility
- Privacy policy is required by Israeli privacy protection law
- Business registration number builds trust in the Israeli market
- These are legal requirements that can result in fines if not met

**Maps To:**
- Footer content (business number, legal links)
- Privacy policy page
- Terms of service page
- Accessibility widget / compliance
- Additional legal pages

---

## World Block: The Client's Professional World (W-Q1 to W-Q6)

Runs right after QIL-3, as Batch 1D of Phase 1 (SKILL.md links both files). The answers are stored under the `world` key of `discovery-output.json`. When site-director conducts the site, they are the first input of its creative-direction stage: every answer becomes one or more items in the world dossier (`design/world-dossier.rtl.md` in the client project, from site-director's `assets/templates/world-dossier.template.rtl.md`), and the dossier turns each item into a design decision on one axis: grid, typography, colour, interaction, motion, content or shape.

Rules for the whole block:
- The client answers in open text, never from preset options: a list of options puts our cliches in the client's mouth. When Nati answers through `AskUserQuestion` (it needs 2-4 options), the options come only from evidence (photos, reviews, questionnaire answers, trade research), never from generic industry lists.
- Concrete answers only: objects, documents, words, moments. "איכותי" or "מקצועי" is not an answer; ask for the thing itself.
- Never invent an answer. A missing answer is recorded as `[לבירור]` and asked again, by WhatsApp when only the client knows it.
- Hebrew wording for the client: `templates/client-questionnaire-he.md`, section "העולם המקצועי שלך" (items 11-16).

Block-level skip logic:
- Skip a question that is already answered (filled questionnaire, earlier conversation, a site-director world round). Confirm the answer instead of asking again.
- Never skip the whole block when site-director runs: its stage 2 cannot start without these answers and the photos.
- Without site-director the block still runs: W-Q3 and W-Q5 feed the copy (Phase 4), and W-Q6 feeds the content brief. Phase 2 then still uses inspiration sites, so the two templates must not promise a design built from the client's work: before sending, follow the operator note in each template. The questionnaire's opening line ("...לא מתוך אתרים של אחרים.") becomes "כל מה שתשלח/י כאן עוזר לנו להכיר את העבודה שלך."; the content brief opens its photo section with the same sentence and softens two more lines, as its note lists.

---

### W-Q1: The Desk

**Question:** מה יש על השולחן שלכם כשאתם עובדים?

**Format:** Open text, with a prompt: "או בארגז הכלים, ברכב, מאחורי הדלפק. כלים, חומרים, מכשירים, דפים: מה שנמצא בהישג יד ביום רגיל."

**Why This Matters:**
- **Framework:** site-director P1 (references from the client's world)
- The objects a professional touches every day are raw material for a design that could belong to no other business
- They are the best candidates for the persistent object (one thing from the client's world that stays on screen and changes state along the story) and for the hero interaction (what the visitor does with it, the way the professional does)
- Without them the design falls back to stock industry imagery and style presets

**Maps To (world dossier):**
- Items of type כלי, חומר, מכשיר מדידה
- "מועמדים לאובייקט הקבוע" and "מועמדים לאינטראקציית ההירו"
- Axes: shape, interaction, motion, colour (a material's real colour can give the accent its meaning)
- `world.desk[]`

**Skip When:** already answered. If W-Q6 photos of the workspace arrived first, ask only what each object is and what it is used for.

---

### W-Q2: The Document

**Question:** איזה מסמך או טופס אתם נותנים ללקוח?

**Format:** Open text, plus an optional photo of a sample with the customer's details covered. Prompt examples: הצעת מחיר, דוח, תעודה, כרטיס עבודה, קבלה, תעודת אחריות.

**Why This Matters:**
- **Framework:** site-director P1 and P2 (a grid taken from the client's world)
- A document carries the trade's own grid, numbering, units, stamps and signatures: a layout system the client's customers already trust
- The order of the fields often follows the order in which things happen for the customer, a ready skeleton for the story chapters
- Its numbers and labels guide the choice of the "instrument" font (the second family, for numbers, labels and indexes)
- The dossier needs at least one item of type מסמך or טופס

**Maps To (world dossier):**
- Items of type מסמך, טופס
- Axes: grid, typography, content
- `world.documents[]`

**Skip When:** already answered. If the client hands out nothing on paper or screen, record "none" and ask what the customer receives at the end of the job (a message, a photo, a label).

---

### W-Q3: Insider Words

**Question:** אילו מילים רק אנשי המקצוע אומרים?

**Format:** Open text, 3-10 words or phrases, each with one line on what it means.

**Why This Matters:**
- **Framework:** site-director P1; Copyhackers voice of customer, from the other side
- Q19 collects the customer's words; W-Q3 collects the trade's words. Together they show where the site must translate and where a precise word earns trust
- Insider words can name chapters, labels, index lines and microcopy, and they replace the field's cliche words
- An insider word appears on the site only where the visitor can see what it means (copy voice: no unexplained jargon)

**Maps To (world dossier):**
- Items of type ז'רגון
- Axes: content, typography
- `world.insiderWords[]`

**Skip When:** already answered. Dedupe against Q19: a phrase from Q19 that is really trade jargon moves here.

---

### W-Q4: The "Good Hands" Moment

**Question:** מה הרגע שבו הלקוח מבין שהוא בידיים טובות?

**Format:** Open text: one real moment (what the professional did, what the customer saw or heard).

**Why This Matters:**
- **Framework:** site-director P3 (story instead of a feature list; proof inside a chapter)
- Trust is born in one specific moment of the work, not in a list of features. That moment is the strongest proof the site can show
- It usually marks the turning chapter of the story, and it is a strong candidate for the hero interaction or a signature motion moment
- Q21 (best quote) is what the customer said afterwards; W-Q4 is the moment itself, from the professional's side

**Maps To (world dossier):**
- Items of type רגע (the dossier needs at least one)
- Axes: interaction, motion, content (the proof of a chapter)
- `world.goodHandsMoment`

**Skip When:** already answered. Never replace it with the Q21 quote.

---

### W-Q5: Fears Before Contact

**Question:** ממה הלקוח חושש לפני שהוא פונה אליכם?

**Format:** Open text, 1-3 fears in the customer's words.

**Why This Matters:**
- **Framework:** site-director P3; Copyhackers objection handling
- The fear before the first call is what stops a visitor at the contact button, so it decides what the page answers before the CTA
- Q5 asks for the problem and its feeling; Q20 asks why prospects say "no" after hearing the offer. W-Q5 comes earlier: the fear of making contact at all (being overcharged, judged, ignored, left with a mess)
- Each fear becomes an objection answered inside a chapter or in the FAQ, with real proof only

**Maps To (world dossier and copy):**
- Content axis: the first chapter's tension, the objection FAQ, the microcopy next to the contact form
- Phase 4 copy strategy (awareness level, objection-driven FAQ)
- `world.fears[]`

**Skip When:** Q5's feeling already names the fear of making contact; confirm it instead. When Q20 is asked later (Tier 3), dedupe it against W-Q5.

---

### W-Q6: Workplace Photos

**Question:** תוכלו לצלם 10-20 תמונות מהעבודה: כלים, חומרים, מסמכים והמקום עצמו?

**Format:** Photo upload (WhatsApp as "מסמך", Google Drive or WeTransfer), plus a consent line and the name of whoever took them.

**Why This Matters:**
- **Framework:** site-director P1 (client photos and trade research)
- Photos show what words miss: real colours, wear, labels, the order on the desk
- They are evidence for the dossier, not site assets. A photo appears on the site only after its own consent is recorded
- They must arrive before the creative direction (site-director stage 2), not in parallel with the build: request them in the questionnaire, and again in the content brief right after the proposal is approved

**Maps To (world dossier):**
- The "מקורות" table (what arrived, who took it, consent) and the source column of each item
- Saved as `design/world/photos/NN-<what>.jpg` in the client project
- `world.photos[]` (`file`, `what`, `takenBy`, `consentToPublish`)
- The client's shot list: `templates/content-brief-he.md`, section "קודם כל: תמונות מהעבודה שלך"

**Skip When:** never. If the photos do not arrive, send the request again and continue with the answers and trade research; every dossier item that waits for a photo is marked `[לבירור]`.

---

## Tier 2: Design Decisions (7 Questions)

> **Skipped when site-director runs (stage 2 replaces them).** When site-director conducts the site, do not ask Q11-Q17. Style presets, preset palettes, hero types and liked sites would decide the design before the world dossier exists. site-director's creative direction (world dossier, two or more directions with the safe one rejected, decision log, storyboard) and pattern-breaker make these decisions instead. Without site-director, ask them as written.

### Q11: Visual Style Direction (skipped when site-director runs)

**Question:** איזה סגנון עיצובי מתאים לעסק שלכם?

**Format:** Visual selector (image grid, pick 1-2)

**Options (with reference images):**
1. **מינימליסטי ונקי** (Minimalist & Clean) - Lots of white space, simple typography, subtle colors
2. **מודרני ועכשווי** (Modern & Contemporary) - Bold colors, geometric shapes, dynamic layouts
3. **חם ואישי** (Warm & Personal) - Soft colors, rounded shapes, friendly feel
4. **יוקרתי ומקצועי** (Luxurious & Professional) - Dark backgrounds, gold accents, serif fonts
5. **צבעוני ואנרגטי** (Colorful & Energetic) - Bright colors, playful elements, bold typography
6. **טכנולוגי וחדשני** (Tech & Innovative) - Gradients, glass morphism, futuristic feel

**Extra option:** "לא בטוח/ה - תחליטו בשבילי" (Not sure - decide for me)

**Why This Matters:**
- **Framework:** CXL (visual hierarchy), design psychology
- Visual style must match the target audience expectations
- Luxury services need premium design; friendly services need warm design
- Mismatched visual style erodes trust (e.g., law firm with playful design)
- This determines: color palette, font choice, spacing, corner radius, shadow style

**Maps To:**
- Tailwind design tokens (border-radius, shadows, spacing scale)
- Color palette selection
- Font pairing choice
- Image treatment (sharp vs. rounded, colorful vs. muted)
- Animation style (subtle vs. dynamic)
- Overall page atmosphere

---

### Q12: Color Preferences (skipped when site-director runs)

**Question:** בחרו את שילוב הצבעים שמתאים לכם (או שלחו צבעי מותג קיימים)

**Format:** Color palette grid (pick 1) OR custom input

**Pre-built Palette Options:**

| Palette | Primary | Accent | Vibe |
|---------|---------|--------|------|
| A. Ocean Blue | #2563EB | #F97316 | Professional, trustworthy |
| B. Forest Green | #059669 | #F59E0B | Natural, growth |
| C. Royal Purple | #7C3AED | #EC4899 | Creative, premium |
| D. Warm Red | #DC2626 | #FBBF24 | Energetic, urgent |
| E. Sky Blue | #0EA5E9 | #10B981 | Fresh, modern |
| F. Charcoal | #1F2937 | #6366F1 | Elegant, sophisticated |
| G. Coral | #F43F5E | #8B5CF6 | Friendly, approachable |
| H. Custom | [color picker] | [color picker] | Client-defined |

**Extra option:** "יש לנו צבעי מותג - הנה הם: ____" (We have brand colors)

**Why This Matters:**
- **Framework:** Color psychology, CXL (visual design impact on conversion)
- Colors evoke specific emotions and associations
- Blue = trust (finance, health), Green = growth (wellness, eco), Red = urgency (sales, food)
- The primary color becomes the dominant brand element across the page
- The accent color is used for CTAs and must have high contrast for clickability

**Maps To:**
- `tailwind.config.ts` primary and accent color scales
- Hero background
- CTA button colors
- Link colors
- Section background variations
- Footer color scheme

---

### Q13: Page Length Preference (skipped when site-director runs)

**Question:** כמה ארוך העמוד צריך להיות?

**Format:** Single select (with recommendation based on Q8 awareness level)

**Options:**
1. **קצר וממוקד** (Short & focused) - Hero + CTA + Contact form only
   - *מומלץ כש:* הקהל כבר מכיר אתכם (Most-Aware / Product-Aware)
2. **בינוני** (Medium) - Hero + Features + Testimonials + CTA + Contact
   - *מומלץ כש:* הקהל מכיר את הפתרון אבל לא אתכם (Solution-Aware)
3. **ארוך ומפורט** (Long & detailed) - All sections including FAQ, about, multiple CTAs
   - *מומלץ כש:* הקהל לא מכיר את הבעיה או הפתרון (Unaware / Problem-Aware)
4. **תחליטו בשבילי** (Decide for me) - Based on awareness level from Q8

**Auto-recommendation logic:**
- If Q8 = Unaware or Problem-Aware -> Recommend "Long"
- If Q8 = Solution-Aware -> Recommend "Medium"
- If Q8 = Product-Aware or Most-Aware -> Recommend "Short"

**Why This Matters:**
- **Framework:** CXL (page length research), Copyhackers (long copy vs. short copy)
- Long copy outsells short copy for high-price, complex, or new products
- Short copy wins for simple, known products with aware audiences
- CXL research: page length should match the complexity of the decision
- Forcing a long page on an aware audience wastes their time
- Forcing a short page on an unaware audience leaves too many questions unanswered

**Maps To:**
- Number of sections to build
- Content depth per section
- Number of CTA sections
- FAQ inclusion/exclusion
- Build time estimation

---

### Q14: Hero Visual Type (skipped when site-director runs)

**Question:** מה תרצו באזור ה-Hero (החלק הראשון שרואים)?

**Format:** Visual selector (pick 1)

**Options:**
1. **תמונת רקע גדולה** (Large background image) - Full-width photo with overlay
2. **גרדיאנט / צבע רקע** (Gradient / solid color) - Color-based, no photo needed
3. **תמונה בצד + טקסט בצד** (Split layout) - Image on one side, text on the other
4. **סרטון ברקע** (Background video) - Subtle looping video
5. **אילוסטרציה** (Illustration) - Custom or stock illustration
6. **תחליטו בשבילי** (Decide for me)

**Why This Matters:**
- **Framework:** CXL (hero section optimization), Unbounce (above-the-fold impact)
- The hero section gets 80% of visitor attention
- Background image: great for emotional businesses (restaurants, travel, events)
- Gradient: clean and professional, no photo dependency, fastest loading
- Split layout: shows product/person while keeping text readable
- Video: attention-grabbing but slower loading (watch LCP)

**Maps To:**
- Hero component variant
- Image requirements (need professional photo or not)
- Page load performance
- Mobile hero layout
- Background image/gradient in Tailwind

---

### Q15: Social Proof Type (skipped when site-director runs)

**Question:** איזה סוג הוכחה חברתית יש לכם?

**Format:** Multi-select

**Options:**
- [ ] המלצות כתובות מלקוחות (Written testimonials)
- [ ] סרטוני המלצה (Video testimonials)
- [ ] לוגואים של לקוחות/שותפים (Client/partner logos)
- [ ] מספרים ונתונים (Statistics: "1,000+ לקוחות מרוצים")
- [ ] דירוגים ב-Google / Facebook (Google/Facebook ratings)
- [ ] תעודות / הסמכות (Certificates/certifications)
- [ ] סיפורי הצלחה / case studies (Success stories)
- [ ] אין לי כלום עדיין (Nothing yet - need to create)

**Why This Matters:**
- **Framework:** Copyhackers (social proof hierarchy), CXL (trust signals)
- Video testimonials increase conversion by 80%
- Logo bars increase trust by 25%
- Specific numbers ("1,247 לקוחות") are more convincing than round numbers
- Google ratings leverage existing trust ("4.8 כוכבים ב-Google")
- Having NO social proof is a red flag; at minimum, create a numbers section

**Maps To:**
- Testimonials section design (text cards, video embeds, or logo bar)
- Trust badges placement
- Numbers/stats section
- Star rating component
- Hero social proof snippet ("500+ לקוחות מרוצים")

---

### Q16: Competitor References (skipped when site-director runs)

**Question:** תנו 3 אתרים שאתם אוהבים (של מתחרים או לא). מה בדיוק אהבתם?

**Format:** 3x URL + open text

**Fields:**
1. URL 1: __________ | מה אהבתם: __________
2. URL 2: __________ | מה אהבתם: __________
3. URL 3: __________ | מה אהבתם: __________

**Options:** N/A (open text)

**Why This Matters:**
- **Framework:** Agency best practice (competitive analysis, design direction)
- "I'll know it when I see it" is the most common design challenge
- Reference sites eliminate guesswork in visual direction
- Clients are better at pointing to what they like than describing it
- Analysis reveals: color preferences, layout preferences, interaction patterns
- Also reveals competitive landscape and differentiation opportunities

**Maps To:**
- Overall visual direction
- Layout structure and section order
- Animation/interaction level
- Color palette inspiration
- Competitive differentiation strategy

---

### Q17: Essential Page Sections (skipped when site-director runs)

**Question:** בחרו את האזורים שחייבים להיות בעמוד (גררו לסדר הרצוי)

**Format:** Multi-select with drag-to-reorder

**Options (default order):**
- [x] Hero - כותרת ראשית + כפתור פעולה (Always included, cannot remove)
- [ ] יתרונות / תכונות (Features/Benefits)
- [ ] המלצות לקוחות (Testimonials)
- [ ] שאלות נפוצות (FAQ)
- [ ] אודות / הסיפור שלנו (About / Our Story)
- [ ] גלריית עבודות / פורטפוליו (Gallery / Portfolio)
- [ ] תהליך עבודה (Process / How It Works)
- [ ] מחירון (Pricing)
- [ ] צוות (Team)
- [ ] שותפים / לקוחות (Partners / Clients logo bar)
- [ ] בלוג / מאמרים (Blog / Articles)
- [ ] טופס יצירת קשר (Contact form) (Always included, cannot remove)
- [ ] פוטר (Footer) (Always included, cannot remove)

**Why This Matters:**
- **Framework:** CXL (information architecture), Unbounce (page structure)
- Not every page needs every section
- Too many sections on a simple product page = information overload
- Too few sections on a complex product page = not enough persuasion
- Section order affects the persuasion flow (attract -> convince -> prove -> convert)
- Client input on order prevents "why did you put testimonials before features?"

**Maps To:**
- Component list to build
- Page component assembly order in `page.tsx`
- Navigation structure (if section anchors are used)
- Build time estimation
- Content requirements list

---

## Tier 3: Copy Validation (5 Questions)

### Q18: Headline Validation

**Question:** איזו כותרת מדברת אליכם הכי חזק?

**Format:** A/B/C selection (generated based on Q2, Q5, Q6, Q9 answers)

**Options (generated dynamically):**
- **A:** [Problem-focused headline] - e.g., "נמאס לכם לשלם על שיווק שלא עובד?"
- **B:** [Solution-focused headline] - e.g., "שיווק דיגיטלי שמביא תוצאות - מהיום הראשון"
- **C:** [Transformation-focused headline] - e.g., "הפכו את העסק שלכם למכונת לידים"
- **D:** "אף אחת - אני רוצה כותרת אחרת" (None - I want a different headline)

**Why This Matters:**
- **Framework:** Copyhackers (headline testing), CXL (headline optimization)
- Headlines get 80% of visitor attention (Copyblogger data)
- 8 out of 10 people read the headline; only 2 out of 10 read the rest
- Client validation prevents "this doesn't sound like us" feedback later
- Three approaches test different persuasion angles: pain, gain, transformation

**Maps To:**
- Hero `<h1>` headline
- `<title>` tag
- Open Graph `og:title`
- Ad headline (for message match)

---

### Q19: Customer Language Check

**Question:** איזה מהביטויים הבאים הלקוחות שלכם באמת משתמשים בהם?

**Format:** Multi-select (phrases generated from Q4, Q5 answers)

**Options (generated dynamically, example for a marketing agency):**
- [ ] "אני צריך יותר לקוחות" (I need more customers)
- [ ] "המתחרים שלי מקדמים בגוגל ואני לא" (My competitors rank on Google and I don't)
- [ ] "ניסיתי הכל ושום דבר לא עובד" (I've tried everything and nothing works)
- [ ] "אין לי זמן לעסוק בשיווק" (I don't have time for marketing)
- [ ] "אני לא מבין בדיגיטל" (I don't understand digital)
- [ ] "אני רוצה תוצאות מהר" (I want quick results)
- [ ] Custom: __________ (add your own phrase)

**Why This Matters:**
- **Framework:** Copyhackers (Voice of Customer), JTBD (switching language)
- Copyhackers #1 rule: Use the customer's exact words, not marketing jargon
- "Voice of Customer" (VoC) data converts 2-3x better than invented copy
- Israeli customers speak differently than how businesses describe themselves
- Hebrew has formal (אתם) and informal (אתה) registers - which does the customer use?

**Maps To:**
- Feature descriptions (use their words, not industry jargon)
- FAQ questions (phrased how customers actually ask)
- Problem statement copy
- Headline language
- CTA button text

---

### Q20: Objection Handling

**Question:** מה 3 הסיבות העיקריות שלקוח פוטנציאלי אומר "לא"?

**Format:** Open text (3 fields, ranked by frequency)

**Fields:**
1. הסיבה הנפוצה ביותר: __________
2. סיבה שנייה: __________
3. סיבה שלישית: __________

**Common examples to provide as hints:**
- "יקר מדי" (Too expensive)
- "אני צריך לחשוב על זה" (I need to think about it)
- "אני כבר עובד עם מישהו אחר" (I already work with someone else)
- "אני לא בטוח שזה יעבוד" (I'm not sure it'll work)
- "אני לא מוכן עכשיו" (I'm not ready now)
- "אני לא סומך על שירותים אונליין" (I don't trust online services)

**Why This Matters:**
- **Framework:** Copyhackers (objection handling), CXL (reducing friction)
- Every objection not addressed on the page = a lost conversion
- The #1 job of a landing page is to overcome objections before the CTA
- FAQ section is the primary objection-handling tool
- Israeli market: price sensitivity is extremely high; "why this price" must be addressed

**Maps To:**
- FAQ section (each objection becomes a Q&A)
- Guarantee/trust section
- Pricing justification
- Social proof selection (testimonials that address objections)
- CTA surrounding copy
- Risk reversal elements

---

### Q21: Best Customer Quote

**Question:** מה המשפט הכי טוב שלקוח אמר עליכם? (ציטוט מדויק)

**Format:** Open text

**Options:** N/A

**Prompt:** "חשבו על ביקורת בגוגל, הודעת וואטסאפ, או מה שלקוח אמר לכם פנים אל פנים. ציטוט מדויק עדיף על ניסוח מחדש."

**Why This Matters:**
- **Framework:** Copyhackers (voice of customer), social proof research
- A real customer quote is worth more than any copywriter's words
- Authentic language builds trust instantly
- The "best" quote is one that addresses an objection, describes a transformation, or expresses an emotion
- Hebrew quotes in particular convey authenticity ("sounds like a real Israeli, not marketing copy")

**Maps To:**
- Featured testimonial (hero area or standalone callout)
- Testimonials section (highlight this one)
- Social proof snippet near CTA
- Page copy inspiration

---

### Q22: CTA Button Text Validation

**Question:** איזה טקסט לכפתור הפעולה הראשי?

**Format:** A/B/C selection + custom option

**Options (generated based on Q3 conversion goal):**

If Q3 = Contact form:
- A: "השאירו פרטים" (Leave your details)
- B: "קבלו הצעת מחיר" (Get a quote)
- C: "דברו איתנו" (Talk to us)

If Q3 = WhatsApp:
- A: "שלחו הודעה בוואטסאפ" (Send WhatsApp message)
- B: "דברו איתנו עכשיו" (Talk to us now)
- C: "התחילו שיחה" (Start a conversation)

If Q3 = Phone call:
- A: "התקשרו עכשיו" (Call now)
- B: "חייגו לייעוץ חינם" (Call for free consultation)
- C: "לשיחת ייעוץ" (For a consultation call)

Custom: "אני רוצה טקסט אחר: ______"

**Why This Matters:**
- **Framework:** CXL (CTA optimization), Unbounce (button copy testing)
- Personalized CTAs convert 202% better than generic ones (HubSpot)
- CTA text should describe the VALUE the visitor gets, not the action they take
- "קבלו הצעת מחיר" (Get a quote) > "שליחה" (Submit)
- Hebrew CTA buttons should use plural imperative (אתם form) for respect: "השאירו" not "השאר"

**Maps To:**
- Hero CTA button text
- Mid-page CTA button text
- Contact form submit button text
- WhatsApp button tooltip
- Mobile sticky CTA text

---

## Tier 4: Pre-Launch Checklist (7 Binary YES/NO)

### Q23: Content Complete

**Question:** כל התוכן נבדק ואושר?

**Format:** YES / NO

**Checklist within:**
- All Hebrew text proofread for typos
- Business name spelled correctly
- Phone number correct
- Email address correct
- Address correct (if applicable)
- All testimonial quotes approved by the quoted customers
- No placeholder/lorem ipsum text remaining

---

### Q24: Mobile Verified

**Question:** הגרסה למובייל נבדקה?

**Format:** YES / NO

**Verification steps:**
- Tested on actual mobile device (not just browser resize)
- All text readable without zooming
- All buttons tappable (min 44x44px touch target)
- No horizontal scroll
- Images load correctly
- WhatsApp button accessible and not blocking content
- Form is usable on mobile

---

### Q25: CTA Functional

**Question:** כל כפתורי ה-CTA עובדים?

**Format:** YES / NO

**Verification steps:**
- Hero CTA button scrolls to form / opens WhatsApp / dials phone
- Mid-page CTA buttons work
- Contact form submits successfully
- WhatsApp button opens WhatsApp with correct number and message
- Phone links dial on mobile
- Email links open email client
- Form submission creates entry in admin panel

---

### Q26: Speed Acceptable

**Question:** העמוד נטען תוך 3 שניות?

**Format:** YES / NO

**How to verify:**
- Run Google PageSpeed Insights (pagespeed.web.dev)
- Performance score should be 90+
- LCP (Largest Contentful Paint) should be under 2.5s
- FID/INP should be under 200ms
- CLS should be under 0.1

**Why 3 seconds matters:**
- 1-second load: 3x better conversion than 5-second load
- 53% of mobile visitors leave if page takes > 3 seconds
- Google uses Core Web Vitals as a ranking factor

---

### Q27: Message Match Confirmed

**Question:** המסר בעמוד תואם למקור התנועה?

**Format:** YES / NO

**What to verify:**
- If traffic comes from Facebook ads: does the landing page headline match the ad headline?
- If traffic comes from Google Search: does the page answer the search query?
- If traffic comes from referrals: does the page reinforce what the referrer said?
- Visual consistency: do ad images match landing page visuals?

**Why this matters (Unbounce):**
- Message match = the scent trail from ad to page
- Poor message match = visitors bounce immediately ("this isn't what I clicked on")
- Strong message match = +50% conversion improvement

---

### Q28: Legal/Privacy Present

**Question:** מדיניות פרטיות ותנאים קיימים?

**Format:** YES / NO

**Israeli requirements:**
- Privacy policy (מדיניות פרטיות) - required by Israeli Privacy Protection Law
- Cookie notice (if using analytics/tracking)
- Business registration number (ח.פ.) in footer - recommended
- Accessibility statement - required by Equal Rights for People with Disabilities Regulations

---

### Q29: Tracking Installed

**Question:** מעקב אנליטיקס מותקן ומאומת?

**Format:** YES / NO

**Verification steps:**
- Google Analytics 4 installed
- Real-time report shows your visit
- Form submission event fires correctly
- WhatsApp click event fires correctly
- Facebook Pixel installed (if using Facebook ads)
- Pixel fires `PageView` on load
- Pixel fires `Lead` on form submit

---

## Question Flow Best Practices

### Progressive Disclosure
- Present 2-3 questions per screen, never more than 5
- Each screen has a clear theme (identity, strategy, design, validation)
- Progress indicator shows completion percentage
- "Save and continue later" option for longer sessions

### Conditional Logic Rules

| If Answer | Then Skip | Reason |
|-----------|-----------|--------|
| Q3 = WhatsApp only | Skip form design questions | No form needed |
| Q8 = Most-Aware | Skip Q13 (page length) - auto "Short" | Already decided by awareness |
| Q10 = Has brand colors | Skip Q12 (color preferences) | Already have colors |
| Q10 = Has testimonials | Skip Q15 social proof sourcing | Already have proof |
| QIL-2 = English only | Skip Hebrew font questions | Not Hebrew page |
| Q15 = No social proof | Add "collect testimonials" to action items | Critical gap |
| site-director conducts the site | Skip Q11-Q17 | Stage 2 (creative direction) replaces them |
| Questionnaire items 11-16 answered | Skip the matching W-Q questions; confirm instead | Already answered |
| Q5 names the fear of making contact | Confirm W-Q5 instead of asking; later dedupe Q20 against W-Q5 | Avoid asking twice |
| W-Q6 photos not received | Never skip; ask again after the proposal | Stage 2 needs them before the concept |

### Format Rules

| Question Type | Best Format |
|---------------|-------------|
| Strategic decisions | Single select with explanation |
| Inventory questions | Multi-select with checkboxes |
| Design preferences | Visual selector with images |
| Narrative/story | Open text with guided prompts |
| Validation | A/B/C selection |
| Confirmation | Binary YES/NO |

### Easy-Hard-Easy Arc

```
Screen 1: Q1, Q2         (Easy - factual identity)
Screen 2: Q3, QIL-1      (Easy - preferences)
Screen 3: Q4, Q5         (Medium - customer insight)
Screen 4: Q6, Q7, Q8     (Hard - strategy)
Screen 5: Q9             (Medium - transformation)
Screen 6: Q10, QIL-2, QIL-3  (Easy - inventory)
Screen 7: W-Q1, W-Q2     (Easy - objects and documents)
Screen 8: W-Q3, W-Q4, W-Q5  (Medium - the trade from inside)
Screen 9: W-Q6           (Easy - photo request)
Screen 10: Q11, Q12      (Easy - visual preferences; skipped when site-director runs)
Screen 11: Q13, Q14, Q15 (Medium - design decisions; skipped when site-director runs)
Screen 12: Q16, Q17      (Easy - references and sections; skipped when site-director runs)
Screen 13: Q18, Q19      (Medium - copy validation)
Screen 14: Q20, Q21      (Hard - objection/quote)
Screen 15: Q22           (Easy - button text)
---
Pre-launch: Q23-Q29      (Easy - binary checklist)
```

---

## Output Mapping Table

### Which Question Maps to Which Landing Page Element

| Question | Page Element |
|----------|-------------|
| Q1 | `<title>`, footer, OG tags, hero |
| Q2 | Hero subheadline, meta description |
| Q3 | CTA button action, form config, WhatsApp config |
| Q4 | Copy tone, visual style, feature framing |
| Q5 | Hero headline, problem section, FAQ |
| Q6 | Hero/subheadline, features, trust section |
| Q7 | Page length, headline style, proof amount |
| Q8 | Page structure, content depth, CTA urgency |
| Q9 | Hero headline, features framing, CTA text |
| Q10 | Asset inventory, build scope, timeline |
| QIL-1 | WhatsApp button, form, phone display |
| QIL-2 | `dir`, `lang`, fonts, content language |
| QIL-3 | Footer legal, privacy page, accessibility |
| W-Q1 | World dossier: tools and materials; persistent object and hero interaction candidates |
| W-Q2 | World dossier: documents and forms; grid, instrument font, chapter order |
| W-Q3 | World dossier: trade jargon; chapter names, labels, microcopy |
| W-Q4 | World dossier: the "good hands" moment; turning chapter, proof, hero interaction |
| W-Q5 | Objection FAQ, first chapter tension, contact-form microcopy |
| W-Q6 | World dossier sources; `design/world/photos/` |
| Q11 | Design tokens, border-radius, shadows, spacing (Q11-Q17 skipped when site-director runs) |
| Q12 | Tailwind color config (primary + accent) |
| Q13 | Section count, page length |
| Q14 | Hero component variant |
| Q15 | Testimonials section design, trust badges |
| Q16 | Overall design direction, layout patterns |
| Q17 | Component list, section order, nav structure |
| Q18 | `<h1>` headline |
| Q19 | Feature copy, FAQ language, body text |
| Q20 | FAQ section, guarantee section |
| Q21 | Featured testimonial, social proof |
| Q22 | CTA button text (all instances) |
| Q23-Q29 | Launch readiness verification |

---

## Key Statistics

These statistics inform the question design and are used to justify recommendations to clients:

| Statistic | Source | Application |
|-----------|--------|-------------|
| Form length reduction = **120% conversion lift** | Unbounce | Minimize form fields (name + phone sufficient) |
| Headlines get **80% of visitor attention** | Copyblogger | Invest most effort in headline (Q18) |
| Single-CTA pages: **13.5% conversion** | Unbounce | Always recommend one primary CTA (Q3) |
| Personalized CTAs: **202% better** | HubSpot | Use customer language in CTA (Q22) |
| Video testimonials: **+80% conversion** | Wyzowl | Recommend video if available (Q15) |
| 1-second page load: **3x better** than 5-second | Google | Optimize aggressively (Q26) |
| **83% traffic is mobile** | StatCounter Israel | Mobile-first design always (Q24) |
| Structured questionnaires: **67% fewer stalled projects** | Agency research | This entire question engine |
| Trust badges: **+25% trust** | CXL | Always include social proof (Q15) |
| Message match: **+50% conversion** | Unbounce | Align ad and page messaging (Q27) |
| Above-the-fold content: **57% of viewing time** | Nielsen | Hero section is critical (Q14, Q18) |
| FAQ schema: **+2-3% CTR** in Google | Search Engine Journal | Always include FAQ with schema (FAQ component) |
| WhatsApp in Israel: **95% daily active** | WhatsApp Business | Always include WhatsApp button (QIL-1) |
| Hebrew text readability: **+10% size** needed vs English | Typography research | Font size compensation in CSS |
