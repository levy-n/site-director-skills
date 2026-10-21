---
name: mediawave-landing-page
description: Builds complete Hebrew RTL landing pages for Israeli small businesses with Next.js 15 + Payload CMS 3.x, the full MediaWave pipeline from proposal to post-launch monitoring. Covers StoryBrand/JTBD discovery, content collection, unique design systems with font and animation research, Hebrew copywriting with A/B variants, Hebrew admin panel, Israeli legal compliance (IS 5568, Amendment 13), Israeli SEO, revision workflow, deployment, and client handoff. Use for any MediaWave client landing page or website build.
when_to_use: '"דף נחיתה", "בנה אתר נחיתה", "אתר ללקוח", "לקוח חדש", "הצעת מחיר לאתר", "landing page for client", "build website for client", "MediaWave pipeline", "new client site", "landing page pipeline", "client proposal", or any request to build, revise, or deliver a client landing page or website.'
argument-hint: "[client-name] [phase]"
allowed-tools: Read, Grep, Glob, Bash, WebSearch, WebFetch
---

# MediaWave Landing Page Pipeline

Complete professional pipeline for building production-grade Hebrew RTL landing pages with Payload CMS.
Stack: **Next.js 15 + Payload CMS 3.x + Tailwind CSS 4 + Vercel + Neon (Postgres)**.

> **When site-director conducts the site, this skill runs only:** Phase 1 (Tier 1 with the world block W-Q1..W-Q6, Tier 1.5 SEO,
> competitive research), Phase 0.5, Phase 1.5 (content), Phase 4 (copy strategy layer only), 5E legal, 5F SEO without its robots.txt
> AI-crawler block (allow the crawlers the client wants, per pattern-breaker's foundations), the Payload setup when decision D1 chooses
> Next + Payload (5A-5B; from the 5D seed only the admin user, SiteSettings, FAQ and testimonials: page blocks follow the storyboard
> chapters, never the StoryBrand seed), Phase 6 (revision workflow; its quality gates yield to site-director's stage 5 QA) and Phases 7-8. site-director's creative direction and pattern-breaker replace Phase 2 (inspiration), Phase 3 (design system), the font and animation researcher agents, and the Tier 2 design questions Q11-Q17: do not run them.
> **Photos first:** send the content brief with the world shot list (10-20 workplace photos) right after the proposal is approved, so they arrive before the concept, not in parallel with the build. site-director's routing "Never run" list overrides anything in this file.

## Pipeline Overview

**Flow:** 0.5 Proposal → 1 Discovery → 2 Inspiration → 3 Design System + Fonts + Animations
→ 4 Copy + A/B Variants → 5 Build + CMS + Legal → 6 Optimize + Revisions
→ 7 Deploy + Handoff → 8 Post-Launch Monitoring.
Phase 1.5 (Content Collection) runs in **parallel** with Phases 2-3 and feeds Phase 4-5.

**CRITICAL RULES:**
- Hebrew is the DEFAULT language. `dir="rtl"` and `lang="he"` everywhere.
- Payload CMS admin panel MUST be in Hebrew. `defaultLocale: 'he'`.
- Every landing page gets a UNIQUE design system. Never reuse palettes/fonts.
- Mobile-first. Most Israeli users browse on mobile.
- WhatsApp CTA button is mandatory for Israeli market.
- Payload CMS uses Local API internally, never REST/GraphQL for internal queries.
- Neon (Postgres) for production, SQLite for local dev.
- **Context carries forward.** Every phase builds on previous answers. Nothing is generic.
- All interactive questions must acknowledge what is already known from prior phases.
- **כל שאלות `AskUserQuestion` חייבות להיות בעברית.** גם האפשרויות, גם ההקשר.

**Frontend-Super integration:** pair with the `frontend-super` skill: `/extract-reference`
(Phase 2), OKLCH color + typography references (Phase 3), `/evaluate-design` +
`/progressive-refine` per section (Phase 5), `/perf-audit` + `/mobile-audit` +
`/rtl-validate` (Phase 6). Full map: [references/frontend-super-integration.md](references/frontend-super-integration.md).

---

## Phase 0.5: Proposal Generation

**Read:** [references/phase-0.5-proposal.md](references/phase-0.5-proposal.md) for full proposal workflow.
**Template:** [templates/proposal-he.md](templates/proposal-he.md) for Hebrew proposal output.

Runs AFTER Tier 1 discovery questions, BEFORE any design work. Gates the whole project.

### Auto-Proposal Workflow
1. Map all Tier 1 discovery answers to proposal fields (auto-fill)
2. Recommend a price tier based on asset readiness, awareness level, complexity
3. Generate visual direction previews (2-3 mood board thumbnails; skip under site-director, which bans inspiration sites before its concept)
4. Produce professional Hebrew proposal document

### Price Tiers
| Tier | Price | Includes |
|------|-------|----------|
| Basic | 1,500₪ | Single-page, 2 revision rounds, no CMS training |
| Standard | 2,500₪ | Single-page + CMS, 3 rounds, WhatsApp integration |
| Premium | 4,000₪ | Multi-section + CMS + animations + legal pages, unlimited revisions (2 weeks) |
| Custom | ___₪ | Custom scope, quoted separately |

### שאלות אינטראקטיביות (P1-P5)
שאל באמצעות `AskUserQuestion`:
1. **חבילת מחיר:** איזו חבילה מתאימה ללקוח? (בסיסית 1,500₪ / סטנדרטית 2,500₪ / פרימיום 4,000₪ / מותאמת אישית)
2. **מבנה תשלום:** איך מחלקים את התשלום? (50/50 / 30/30/40 / 100% מראש עם 5% הנחה)
3. **סבבי תיקונים:** כמה סבבי תיקונים כלולים? (2 / 3 / ללא הגבלה לשבועיים)
4. **תחזוקה חודשית:** להציע תחזוקה? (200₪/חודש / 350₪/חודש / לא להציע)
5. **לוח זמנים:** מה ההבטחה ללקוח? (3 ימי עבודה / שבוע / שבועיים / מותאם)

**חובה לאשר את ההצעה לפני מעבר לשלב 1.**

---

## Phase 1: Client Discovery & Competitive Research

**Read:** [references/phase-1-discovery.md](references/phase-1-discovery.md) for full question engine.
**Read:** [references/question-engine.md](references/question-engine.md) for research-backed question bank.
**Template:** [templates/client-questionnaire-he.md](templates/client-questionnaire-he.md) for the Hebrew client questionnaire.

### Interactive Question Flow

Use `AskUserQuestion` to collect answers in tiers. NEVER dump all questions at once.

**Tier 1: Must-Have (8-10 questions plus the 6-question world block, gates everything):**
Ask business identity, one conversion goal, target customer, problem solved, differentiator,
traffic source, awareness level, transformation promise, existing assets and timeline, plus the Hebrew and English business names;
then the world block W-Q1..W-Q6 (Batch 1D: desk, documents, insider words, "good hands" moment, fears, photos).

**Tier 1.5: SEO Discovery (S1-S6, ask after Tier 1):**
**Read:** [references/seo/seo-master-guide.md](references/seo/seo-master-guide.md) for SEO strategy overview.
1. **Google Business Profile:** יש ללקוח פרופיל Google Business? (כן, תנו לי URL / לא, ניצור חדש / לא יודע)
2. **שירותים לקידום:** מה 3 השירותים/מוצרים הכי חשובים שהלקוח רוצה לקדם?
3. **אזור שירות:** מה אזור השירות? (מיקום אחד / מספר מיקומים / אזור שירות נייד / ארצי / אונליין בלבד)
4. **ערים ושכונות:** אילו ערים ושכונות לטרגט? ___
5. **Google Ads:** הלקוח מפרסם בגוגל? (כן / לא / בעבר)
6. **מודעות קידום:** מהי הרמה הנוכחית בגוגל? (מדורגים טוב / לא מופיעים / לא יודעים / עסק חדש)

**Tier 2: Design Decisions (5-7 questions with visual options; skipped when site-director runs, its stage 2 replaces them):**
Visual style direction, color preferences, page length, hero visual type,
social proof type, competitor references, essential page sections.

Wait for Tier 1 answers before asking Tier 2.

### Competitive Research
After collecting Tier 1 answers:
1. Fetch 3-5 competitor websites using WebFetch
2. Extract: color schemes, font choices, page structure, CTA patterns
3. Generate competitive analysis summary
4. Store findings in `discovery-output.json`

---

## Phase 1.5: Content Collection (Parallel to Phases 2-3)

**Read:** [references/content-collection-guide.md](references/content-collection-guide.md) for full workflow, shot lists, and the sharp asset pipeline.
**Template:** [templates/content-brief-he.md](templates/content-brief-he.md) for Hebrew client brief.

Runs in **parallel** with Phases 2-3 and unblocks the build by getting client assets early.
Under site-director: sent right after the proposal; the world photos come back before the concept.

### Content Brief Generation
Generate a context-aware Hebrew brief telling the client EXACTLY what to send:
- **Photography shot list** specific to their business type (6 industry presets: bakery, salon, clinic, restaurant, tech, general)
- **Testimonial templates:** fill-in-the-blank Hebrew sentences (5 templates)
- **Logo requirements:** format-specific instructions (SVG preferred, PNG acceptable)
- **Business details checklist:** address, phone, WhatsApp, email, hours, social links

### Asset Processing Pipeline
Automated processing via `sharp`: responsive `srcset` (640w-1920w), WebP/AVIF with
JPEG fallback, LQIP blur placeholders, favicon set, EXIF stripping, logo color
palette extraction. Output `asset-manifest.json` for the build phase (full spec in guide above).

### שאלות אינטראקטיביות (C1-C4)
1. **תמונות מקצועיות:** יש ללקוח תמונות מקצועיות? (כן, מוכנות / יש אבל לא מקצועיות / אין, נשתמש בסטוק)
2. **לוגו:** יש ללקוח לוגו וקטורי? (SVG מוכן / PNG בלבד / אין לוגו, צריך ליצור)
3. **המלצות:** יש ללקוח חוות דעת מלקוחות? (כן, כתובות / כן, צריך לאסוף / אין, ניצור תבניות)
4. **חילוץ צבעים:** לחלץ פלטת צבעים מהלוגו? (כן / לא, יש פלטה מוכנה / אין לוגו)

---

## Phase 2: Design Inspiration (skipped when site-director runs)

**Read:** [references/phase-2-inspiration.md](references/phase-2-inspiration.md)

1. Based on client industry + style preferences, search curated sources
2. Gather 5-8 reference screenshots/descriptions from: Awwwards, Dribbble,
   Landingfolio, Lapa.ninja, One Page Love
3. Present 3-5 distinct design directions to operator using `AskUserQuestion`
4. Operator picks 2-3 references that match client's vibe
5. Document chosen direction in `design-brief.md`

---

## Phase 3: Design System + Font Research + Animation Research (skipped when site-director runs)

**Read:** [references/phase-3-design-system.md](references/phase-3-design-system.md)
**Read:** [references/font-research-agent.md](references/font-research-agent.md) for font sourcing and evaluation.
**Read:** [references/animation-research-agent.md](references/animation-research-agent.md) for animation sourcing.
**Template:** [templates/design-system-template.md](templates/design-system-template.md) for design system output.

### Design System Generation
Generate a unique design system based on chosen inspiration + client brand:

1. **Color Palette**: Primary, secondary, accent, neutrals, semantic colors
2. **Typography**: Hebrew-first fonts (Heebo, Rubik, Assistant, Secular One, Karantina)
   - Font sizes 10% larger for Hebrew vs English in buttons/headings
3. **Spacing Scale**: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64, 96, 128)
4. **Component Tokens**: Border radius, shadows, transitions
5. **Motion Guidelines**: Subtle, purposeful animations

Output: `design-system.md` + Tailwind CSS custom theme config.

**ANTI-GENERIC RULE**: NEVER use Inter, Roboto, or purple gradients.
Every client gets a distinctive visual identity.

### Font Research
After the design direction is chosen, spawn the font research sub-agent via the
**Agent** tool (`subagent_type: general-purpose`), using
[agents/font-researcher.md](agents/font-researcher.md) as the prompt, to find
unique Hebrew fonts beyond the standard 5.

The agent searches Google Fonts Hebrew, Fontsource, Font Squirrel, Open Font
Library, GitHub, and Israeli foundries. Every candidate must pass 5 filters:
OFL/Apache/MIT license, full Hebrew coverage (27 letters + 5 finals), render
quality at 16px/48px, 3+ weights for body, <30KB per weight WOFF2 (<120KB total).
It returns 3 pairing proposals with licenses, sizes, Hebrew samples, and
`next/font` code. Full catalog + industry mapping in the font reference above.

### שאלות אינטראקטיביות: פונטים (F1-F4)
1. **רמת ייחודיות פונטים:** סטנדרטית (פונטים מוכרים) / ייחודית (פונטים פחות שכיחים) / נועזת (פונטים בולטים ויוצאי דופן)
2. **בחירת שילוב פונטים:** הצעה 1 / הצעה 2 / הצעה 3 / כיוון אחר
3. **פונט דיספליי:** כן, להוסיף פונט שלישי לאלמנטים מיוחדים / לא, מספיק שניים
4. **אישור סופי:** לאשר את השילוב שנבחר / לחפש חלופות

### Animation Research
Spawn the animation research sub-agent via the **Agent** tool
(`subagent_type: general-purpose`), using
[agents/animation-researcher.md](agents/animation-researcher.md) as the prompt.
It finds FREE animations matching the client's industry, chosen design style,
and color palette, from LottieFiles, Rive, SVGator, Animista, AOS, GSAP
ScrollTrigger (free), Framer Motion, Spline, CodePen, and Codrops.
**Performance budgets:** Minimal <5KB, Moderate <50KB, Rich <100KB, Maximum <200KB.
Present 5-8 animations organized by placement (hero, transitions, icons, CTA,
loading), each with preview, file size, license, RTL compatibility, integration method.

### שאלות אינטראקטיביות: אנימציות
1. **רמת אנימציה:** מינימלית (<5KB) / מתונה (<50KB) / עשירה (<100KB) / מקסימלית (<200KB)
2. **בחירת אנימציות:** בחר מתוך האנימציות שנמצאו (הצגה עם תצוגה מקדימה)
3. **תקציב ביצועים:** לעקוף את תקציב הביצועים שנקבע? (כן, הביצועים פחות חשובים / לא, לשמור על המגבלות)
4. **בקשות מיוחדות:** יש אנימציות ספציפיות שהיית רוצה? (טקסט חופשי)

יש להציג מערכת עיצוב + פונטים + אנימציות לאישור לפני הבנייה.

---

## Phase 4: Hebrew Copywriting + Copy Variants

**Read:** [references/phase-4-copy.md](references/phase-4-copy.md)
**Read:** [references/hebrew-rtl-guide.md](references/hebrew-rtl-guide.md)
**Read:** [references/copy-variants-framework.md](references/copy-variants-framework.md) for A/B variant generation.

### StoryBrand-Based Copy Structure
1. **Hero**: Headline addressing the customer's desire + subhead with the promise
2. **Stakes**: What happens if they don't act (StoryBrand "Failure")
3. **Value Proposition**: The 3-step plan (StoryBrand "Plan")
4. **Features/Benefits**: External problem → internal feeling → philosophical stake
5. **Social Proof**: Testimonials using real customer language
6. **FAQ**: Address top 3 objections from discovery
7. **CTA**: Direct + transitional CTAs

### Copy Rules
- WRITE in Hebrew. Do NOT translate from English.
- Use awareness level from discovery to set headline strategy
- Match messaging to traffic source (message match principle)
- Schema markup: LocalBusiness, FAQPage, Service

### Copy A/B Variants
Generate **3 strategic headline variants** using different frameworks:
- **PAS** (Problem-Agitate-Solve): leads with pain
- **AIDA** (Attention-Interest-Desire-Action): classic funnel
- **4U** (Useful-Urgent-Unique-Ultra-specific): direct response

Each variant includes: headline, subheadline, primary CTA text, reasoning.
Context-aware: adapts framework selection to awareness level and industry.

### שאלות אינטראקטיביות: קופי
1. **גישת כותרת:** איזו גישה מתאימה ללקוח? (הצגת 3 וריאנטים עם נימוק: PAS / AIDA / 4U)
2. **בדיקות A/B:** לבנות תשתית A/B? (רוטציה עם מעקב / לבחור את הטוב ביותר / לתת ללקוח להחליט)
3. **אימות טון:** הטון מתאים? (הצגת פסקת דוגמה לאישור)

**יש לאשר את הקופי עם האופרטור** לפני הבנייה.

---

## Phase 5: Build (Next.js + Payload CMS) + Legal Compliance

**Read:** [references/phase-5-build.md](references/phase-5-build.md)
**Read:** [references/payload-cms-setup.md](references/payload-cms-setup.md)
**Read:** [references/legal-templates-il.md](references/legal-templates-il.md) for Israeli legal requirements.

### 5A. Project Scaffold
```bash
npx create-payload-app@latest -t website
```
Or add Payload to existing Next.js project:
```bash
npm install payload @payloadcms/next @payloadcms/richtext-lexical \
  @payloadcms/db-postgres @payloadcms/db-vercel-postgres \
  @payloadcms/translations sharp
```

### 5B. Payload CMS Configuration
See [references/payload-cms-setup.md](references/payload-cms-setup.md) for complete config.
Collection starter code: [templates/payload-collections.ts](templates/payload-collections.ts).

Key points:
- `defaultLocale: 'he'` with `rtl: true`
- Admin panel i18n: Hebrew as fallback language
- Lexical editor (RTL-native)
- Collections: Pages, Media, Testimonials, FAQ, Users, FormSubmissions
- Globals: SiteSettings, Header, Footer
- All text fields: `localized: true`
- All labels: Hebrew + English

### 5C. Frontend Implementation
- `dir="rtl"` and `lang="he"` on HTML root
- Mobile-first responsive design
- Sections: Hero, Problem/Stakes, Solution, Features, Testimonials, CTA, FAQ, Contact, Footer
- WhatsApp floating button with +972 country code
- Contact form (Payload form builder or custom)
- Approved animations from Phase 3 (lazy-loaded via `next/dynamic`)
- A/B variant infrastructure if chosen in Phase 4
- `prefers-reduced-motion` fallbacks for all animations

### 5D. Content Seeding
Run seed script to populate Payload from `discovery-output.json` (under site-director: only the admin user, SiteSettings, FAQ and testimonials; see the banner):
- Map StoryBrand sections → Payload layout blocks
- Create initial page with all blocks in correct order
- Populate SiteSettings from business info
- Import processed assets from `asset-manifest.json`

### 5E. Legal Compliance Pages

**Templates:**
- [templates/accessibility-statement-he.md](templates/accessibility-statement-he.md): הצהרת נגישות (IS 5568)
- [templates/privacy-policy-he.md](templates/privacy-policy-he.md): מדיניות פרטיות (Amendment 13)
- [templates/terms-of-service-he.md](templates/terms-of-service-he.md): תנאי שימוש

Auto-generate legal pages in Hebrew, specific to the client's business type:
- **Accessibility statement**: Required by Israeli law (IS 5568 / WCAG 2.1 AA). Penalties up to 75,000 NIS.
- **Privacy policy**: Required by Amendment 13 (passed August 2024). Covers form data, analytics cookies, WhatsApp.
- **Terms of service**: Business-type-specific (food, health, financial, e-commerce disclaimers).
- All auto-filled from discovery data (business name, contact, data collected).
- Conditional sections based on business type and features (payments, cookies, WhatsApp).

### שאלות אינטראקטיביות: משפטי (L1-L4)
1. **סוג עסק:** מה סוג העסק לצרכי דרישות משפטיות? (מזון / בריאות / פיננסי / מסחר אלקטרוני / שירותים כלליים)
2. **תשלומים:** הלקוח גובה תשלומים דרך האתר? (כן / לא / בעתיד)
3. **עוגיות:** רמת באנר הסכמת עוגיות? (בסיסי: הודעה בלבד / מתקדם: עם אפשרויות בחירה / ללא: אין עוגיות)
4. **מדיניות קיימת:** יש ללקוח מדיניות פרטיות קיימת? (כן, לעדכן / לא, ליצור חדשה)

### 5F. SEO Implementation
**Read as needed:** [references/seo/on-page-seo.md](references/seo/on-page-seo.md) (Hebrew title/meta/headings),
[references/seo/schema-markup-library.md](references/seo/schema-markup-library.md) (JSON-LD),
[references/seo/technical-seo.md](references/seo/technical-seo.md) (sitemap, robots, llms.txt),
[references/seo/hebrew-keyword-research.md](references/seo/hebrew-keyword-research.md) (keyword strategy),
[references/seo/local-seo-israel.md](references/seo/local-seo-israel.md) (GBP + Israeli citations),
[references/seo/ai-seo-aeo.md](references/seo/ai-seo-aeo.md) (AI/answer-engine visibility).

Integrate SEO into the build using discovery answers from Tier 1.5 (S1-S6):

1. **Title Tag & Meta Description:** Hebrew-optimized (title: 50-55 chars, meta: 140-150 chars). Include city + service.
2. **Heading Hierarchy:** Single H1 with primary keyword, H2s for sections, H3s for sub-items.
3. **URL Slug Strategy:** Transliterated Hebrew slugs (`/afiya-rehovot` not `/אפייה-רחובות`).
4. **Schema Markup:** Auto-generate JSON-LD from discovery data: `LocalBusiness`
   (correct sub-type from 30+ mappings), `FAQPage`, `BreadcrumbList`, `Service`
   per promoted service, `OpeningHoursSpecification` (Israeli hours: Sun-Thu).
5. **FAQ Section:** Structure for both UX and SEO (FAQPage schema + "answer capsule" pattern for AEO).
6. **Google Maps Embed:** If physical location, embed map in contact section.
7. **Image Alt Text:** Hebrew alt text on all images, keyword-enriched for key images.
8. **Internal Linking:** Legal pages linked from footer, services cross-linked.
9. **AI Discoverability:** Add `llms.txt` file with business summary for AI citation.
10. **sitemap.ts & robots.ts:** Auto-generate using App Router API
    (code templates: [templates/robots-txt.md](templates/robots-txt.md), [templates/sitemap-template.xml](templates/sitemap-template.xml); under site-director, drop their AI-crawler `Disallow` rules).

**Run these scripts** (Python 3, stdlib only, no installs; `--help` for options):
- `python ${CLAUDE_SKILL_DIR}/scripts/generate-schema.py discovery-output.json --pretty`: JSON-LD from discovery data
- `python ${CLAUDE_SKILL_DIR}/scripts/generate-sitemap.py https://client-domain.co.il`: sitemap.xml + robots.txt
- `python ${CLAUDE_SKILL_DIR}/scripts/keyword-research-helper.py "<שירות>" "<עיר>"`: 56+ Hebrew keyword variations

### שאלות אינטראקטיביות: SEO בנייה (B1-B4)
1. **URL Slug:** איך לבנות את ה-URL? (טרנסליטרציה מעברית, מומלץ / אנגלית בלבד / לתת ללקוח לבחור)
2. **FAQ:** כמה שאלות נפוצות לכלול? (3-5 בסיסי / 6-10 מקיף / לפי מה שעלה בגילוי)
3. **Google Maps:** להטמיע מפת גוגל? (כן, מיקום פיזי / לא, עסק אונליין / כן, אזור שירות)
4. **ביקורות:** להציג ביקורות מגוגל? (כן, עם schema / כן, ידני בלבד / לא כרגע)

### 5G. Confirm with Operator
Before optimization, ask operator to review full build including legal pages and SEO implementation.

---

## Phase 6: Optimize + Revision Workflow

**Read:** [references/phase-6-optimize.md](references/phase-6-optimize.md)
**Read:** [references/revision-workflow.md](references/revision-workflow.md) for structured revision process.
**Template:** [templates/revision-request-he.md](templates/revision-request-he.md) for Hebrew revision form.

### Quality Gates (full checklists in the phase-6-optimize reference above)
- **Performance (target 90+ Lighthouse, goal 100):** WebP/AVIF + lazy loading +
  responsive srcset, `font-display: swap` + preload critical fonts, code
  splitting + tree shaking, critical CSS inlined.
- **SEO:** meta + OG tags (Hebrew content!), sitemap.xml, robots.txt, schema
  markup (LocalBusiness + FAQPage + BreadcrumbList), canonical URLs, Hebrew hreflang.
- **Accessibility (WCAG 2.1 AA minimum, IS 5568):** contrast 4.5:1 for text,
  keyboard navigation, Hebrew screen reader labels, focus indicators, Hebrew alt text.
- **Cross-browser:** iPhone Safari, Chrome Android, Desktop Chrome (minimum);
  RTL layout verified on all breakpoints.

### Revision Workflow
After first delivery to staging URL: collect feedback (Google Doc / structured
form / annotation tool), track every item in an auto-generated document
(pending/done/rejected), batch-execute pending revisions, classify each request
for scope creep (revision vs. new feature vs. gray area), and enforce contract
round limits with auto-generated polite Hebrew messages. Full process in the
revision-workflow reference above.

### שאלות אינטראקטיביות: תיקונים (R1-R3)
1. **אופן משוב:** איך הלקוח מעביר פידבק? (Google Doc עם צילומי מסך / טופס מובנה / כלי אנוטציה ויזואלית / וואטסאפ)
2. **רמת מורכבות:** מורכבות התיקונים? (טקסט בלבד / עיצוב קל / שינויים מהותיים)
3. **סבבים:** עדיין בתוך סבבי התיקונים הכלולים? (כן / לא, צריך הודעה ללקוח)

---

## Phase 7: Deploy & Deliver + Handoff Package

**Read:** [references/phase-7-deliver.md](references/phase-7-deliver.md)
**Read:** [references/client-handoff-guide.md](references/client-handoff-guide.md) for full handoff workflow.
**Template:** [templates/handoff-package-he.md](templates/handoff-package-he.md) for Hebrew handoff output.

### Deployment
1. Set up Neon database (free tier)
2. Deploy to Vercel with environment variables
3. Connect custom domain
4. SSL verification

### Analytics
- Google Analytics 4 OR Plausible
- Facebook Pixel (if running ads)
- Conversion tracking on CTA

### Client Handoff Package
Auto-generate a complete Hebrew handoff package adapted to the client's technical
level, with 5 components: CMS guide (step-by-step, including "What NOT to touch"),
credentials document (secure delivery: WhatsApp disappearing message, never plain
email), single-page quick reference card, maintenance guide (domain/SSL/hosting
renewals), and week-by-week recommended next steps for the first month.
Full component specs in the client-handoff guide above.

### שאלות אינטראקטיביות: מסירה (H1-H5)
1. **רמה טכנית:** מה הרמה הטכנית של הלקוח? (לא טכני / קצת טכני / טכני)
2. **הדרכת CMS:** באיזה פורמט להעביר הדרכה? (מדריך כתוב / הדרכה חיה / שניהם)
3. **בעלות דומיין:** מי הבעלים של הדומיין? (הלקוח / אנחנו מנהלים / צריך לרכוש)
4. **יחסים שוטפים:** מה מערכת היחסים אחרי המסירה? (חד-פעמית / ריטיינר חודשי / לפי שעה)
5. **שירותים נוספים:** להציע שירותים נוספים? (SEO שוטף / ניהול תוכן / קמפיינים / לא כרגע)

### Pre-Launch Checklist (Tier 4 questions)
Use `AskUserQuestion` with binary YES/NO:
- [ ] All content reviewed and approved
- [ ] Mobile version verified
- [ ] All CTAs functional (form, WhatsApp, phone)
- [ ] Page loads under 3 seconds
- [ ] Message matches ad/traffic source
- [ ] Privacy policy present
- [ ] Accessibility statement present
- [ ] Terms of service present
- [ ] Analytics tracking installed
- [ ] Legal pages reviewed
- [ ] Handoff package prepared
- [ ] SEO: Title tag & meta description optimized (Hebrew, correct length)
- [ ] SEO: Schema markup validated (Google Rich Results Test)
- [ ] SEO: sitemap.xml & robots.txt deployed
- [ ] SEO: Google Search Console ownership verified
- [ ] SEO: Google Business Profile linked (if applicable)
- [ ] SEO: All images have Hebrew alt text
- [ ] SEO: llms.txt deployed for AI discoverability

**Read:** [references/seo/seo-checklist.md](references/seo/seo-checklist.md) for full pre-launch SEO checklist.

ALL must be YES before going live.

---

## Phase 8: Post-Launch Monitoring

**Read:** [references/post-launch-monitoring.md](references/post-launch-monitoring.md) for health check automation, tooling, and monitoring tiers.
**Template:** [templates/week1-report-he.md](templates/week1-report-he.md) for Hebrew report output.

### Week-1 Health Check
Run automated checks 7 days after deployment (scripts and tools per check in the
monitoring reference above): Lighthouse 90+ all categories, Core Web Vitals
(LCP <2.5s, CLS <0.1, INP <200ms), uptime 99.5%+ (UptimeRobot free tier), SSL
valid + auto-renewing, zero broken images, form POST test, WhatsApp link opens,
Google indexing verified in Search Console.

### Hebrew Report Generation
Auto-generate "דוח שבוע ראשון" ([templates/week1-report-he.md](templates/week1-report-he.md)):
performance scores with traffic-light indicators, analytics summary (visitors,
sources, devices, bounce rate, conversions), CTA functionality, SEO indexing
status, issues found with recommendations, next steps. Monitoring tiers
(Free Basic $0 → Retainer): comparison in the post-launch-monitoring reference above.

### SEO Post-Launch Monitoring
**Read:** [references/seo/seo-monitoring.md](references/seo/seo-monitoring.md) for full SEO monitoring setup.
**Read:** [references/seo/link-building-israel.md](references/seo/link-building-israel.md) for directory submission workflow.

**Run these scripts:**
- `python ${CLAUDE_SKILL_DIR}/scripts/seo-audit.py <url> -k "<primary keyword>"`: on-page SEO audit (21 checks)
- `python ${CLAUDE_SKILL_DIR}/scripts/seo-report.py <url>`: Hebrew SEO health report ([templates/seo-report-he.md](templates/seo-report-he.md))

**Week 1:** verify GSC ownership (.co.il: HTML tag or DNS TXT), submit sitemap,
request indexing, submit Tier 1 Israeli directories (דפי זהב, B144, Dun's Guide),
verify Google Business Profile link, check AI citation status (ChatGPT, Perplexity, AI Overviews).
**Month 1:** Tier 2-3 directories, keyword rank tracking, GSC Hebrew query analysis, first client SEO report.
**Ongoing:** weekly GSC impressions/clicks + crawl errors; monthly full audit + directory status; quarterly content refresh + schema update + competitor re-analysis.

### שאלות אינטראקטיביות: ניטור (M1-M4)
1. **רמת ניטור:** באיזו רמה לנטר? (בסיסי חינמי / מלא חינמי / מקצועי ~$30-45/חודש / ריטיינר מותאם)
2. **פלטפורמת אנליטיקס:** איזו פלטפורמה? (GA4 / Plausible / שניהם / ללא)
3. **משלוח דוחות:** איך לשלוח דוחות? (אימייל אוטומטי שבועי / שבוע ראשון בלבד / סקירה ידנית)
4. **ריטיינר חודשי:** להציע תחזוקה חודשית שוטפת? (כן, כולל עדכוני תוכן ודוחות / לא כרגע)

### שאלות אינטראקטיביות: SEO ניטור (SEO-M1-M3)
1. **Google Search Console:** להגדיר GSC ללקוח? (כן, ניהול שלנו / כן, גישה ללקוח / לא כרגע)
2. **הגשה לאינדקסים:** להגיש לאינדקסים ישראליים? (כן, כל האינדקסים / רק דפי זהב ו-B144 / לא כרגע)
3. **דוח SEO ללקוח:** לייצר דוח SEO עברי ללקוח? (כן, מפורט / כן, מקוצר / לא)

---

Each phase links its own files inline. For anything else, consult the full
annotated catalog: [references/file-map.md](references/file-map.md).
