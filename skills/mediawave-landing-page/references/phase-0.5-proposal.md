# Phase 0.5: Proposal Generator

## Overview

This phase runs **after Tier 1 discovery is complete** and **before any design work begins**.
It auto-generates a professional Hebrew proposal based on discovery answers, presents pricing
options to the client, and locks in project scope before Phase 2 starts.

**Trigger:** All Tier 1 answers (Q1-Q11 + Israeli supplement QIL-1 to QIL-3) are collected.
**Output:** Hebrew markdown proposal ready for PDF conversion. See `templates/proposal-he.md`.
**Gate:** Client must approve the proposal before proceeding to Phase 2 (Design Inspiration).

---

## Why a Formal Proposal Matters

- Sets clear expectations on scope, timeline, and cost - prevents scope creep
- Creates a professional first impression that justifies premium pricing
- Documents what's included and excluded - protects both sides
- Includes visual direction previews to build excitement
- Establishes payment milestones tied to deliverables
- Converts discovery insights into a value-based narrative the client can see

---

## Context-Aware Auto-Fill Rules

The proposal is NOT generated from scratch. It pulls from Tier 1 discovery data:

| Discovery Answer | Proposal Field |
|---|---|
| Q1: Business Name (Hebrew/English) | Document title, headers, scope description |
| Q2: Business Description | Project Summary paragraph |
| Q3: Conversion Goal | Scope items - form type, WhatsApp integration, booking system |
| Q4: Ideal Customer | Target audience mention in scope |
| Q5: Problem & Feeling | Value proposition framing in summary |
| Q6: Differentiator | Positioning approach in scope |
| Q7: Awareness Level | Content strategy complexity (affects tier recommendation) |
| Q8: Transformation Promise | Success metrics framing |
| Q9: Traffic Sources | Technical requirements (UTM tracking, pixel setup, SEO) |
| Q10: Existing Assets | Asset gaps → affects pricing (stock photos, logo design, copy) |
| Q11: Timeline | Timeline table dates |
| QIL-1: Contact Method | WhatsApp button, phone CTA, form type |
| QIL-2: Language | Bilingual complexity affects pricing |
| QIL-3: Israeli Elements | Payment gateway, invoice system, delivery integration |

### Intelligent Tier Recommendation

Based on discovery complexity, auto-suggest a tier:

```
IF assets are sparse (no logo, no photos, no copy)
   AND awareness level is low (Unaware/Problem Aware)
   AND bilingual is required
   → Recommend Premium (4,000₪) or Custom

IF assets are mostly available
   AND single language
   AND simple CTA (form or WhatsApp)
   → Recommend Standard (2,500₪)

IF client has everything (logo, photos, copy ready)
   AND just needs a clean page built fast
   → Recommend Basic (1,500₪)
```

---

## Price Tiers

### Tier 1: Basic - 1,500₪

**Ideal for:** Businesses with existing assets that need a clean, fast landing page.

| Included | Not Included |
|---|---|
| Single-page landing page | Payload CMS admin panel |
| Responsive design (mobile + desktop) | Content management system |
| Basic design from template foundations | Custom animations or interactions |
| WhatsApp CTA button | A/B copy variants |
| Contact form or click-to-call | Legal pages (privacy, terms) |
| Basic SEO meta tags | Ongoing maintenance |
| SSL + Vercel deployment | Stock photography sourcing |
| 2 revision rounds | Logo design |
| Google Analytics setup | Multi-language support |

**Timeline:** 3-5 business days
**Best when:** Client provides all content, photos, and logo ready to use.

---

### Tier 2: Standard - 2,500₪

**Ideal for:** Businesses that want to manage their own content after launch.

| Included | Not Included |
|---|---|
| Everything in Basic | Custom animations (parallax, scroll-triggered) |
| Payload CMS 3.x with Hebrew admin panel | A/B copy testing |
| Custom design system (unique palette, fonts, spacing) | Legal pages (privacy, terms, accessibility) |
| Content seeding (all sections populated) | Ongoing content writing |
| 3 revision rounds | Stock photography budget |
| Testimonials collection (structured) | Logo design (if needed, quoted separately) |
| FAQ section with CMS management | Multi-language support |
| Open Graph social sharing setup | Monthly maintenance |
| Performance optimization (Core Web Vitals) | |
| 1 week post-launch support | |

**Timeline:** 5-10 business days
**Best when:** Client wants independence to update content without a developer.

---

### Tier 3: Premium - 4,000₪

**Ideal for:** Businesses that want a complete, polished, conversion-optimized presence.

| Included | Not Included |
|---|---|
| Everything in Standard | E-commerce / online store |
| Scroll-triggered animations (Framer Motion) | Blog system |
| A/B copy variants (2 versions of hero + CTA) | Ongoing content creation |
| Legal pages: Privacy Policy, Terms, Accessibility Statement | Paid ad management |
| Analytics dashboard setup (Vercel Analytics + Google) | SEO campaign management |
| Performance monitoring (automated Lighthouse) | Logo redesign (quoted separately) |
| Favicon set from logo (16/32/180/512px) | Translation services |
| Schema.org structured data (LocalBusiness) | |
| Unlimited revisions for 2 weeks post-launch | |
| Monthly monitoring report (1st month free) | |
| WhatsApp Business API integration | |

**Timeline:** 10-15 business days
**Best when:** Client wants a premium, fully-managed build with optimization baked in.

---

### Tier 4: Custom - Quote Required

**Triggers for custom pricing:**
- Bilingual (Hebrew + English) with separate content per language
- Integration with external systems (CRM, booking, payment)
- Multiple landing pages for different campaigns
- E-commerce or product catalog needs
- Complex form flows (multi-step, conditional logic)
- Existing design system that must be matched exactly
- Tight timeline (under 3 days)

**Process:** Custom proposals are built the same way but with line-item pricing for each extra requirement.

---

## Payment Structures

### Option A: 50/50 (Recommended for Basic & Standard)
| Milestone | Amount | Trigger |
|---|---|---|
| Project kickoff (after proposal approval) | 50% | Signed proposal |
| Final delivery + deployment | 50% | Site goes live |

### Option B: 30/30/40 (Recommended for Premium & Custom)
| Milestone | Amount | Trigger |
|---|---|---|
| Project kickoff | 30% | Signed proposal |
| Design approval (after Phase 3) | 30% | Client approves design system |
| Final delivery + deployment | 40% | Site goes live |

### Option C: 100% Upfront (5% discount)
| Milestone | Amount | Trigger |
|---|---|---|
| Full payment | 100% (minus 5%) | Signed proposal |

**Notes:**
- All prices exclude VAT (מע"מ). VAT is 17% in Israel.
- Payment via bank transfer (העברה בנקאית) or Bit/PayBox.
- Invoice (חשבונית מס) issued upon each payment.

---

## Revision Policy

### What Counts as a "Revision Round"

A revision round is ONE consolidated list of changes submitted together. It includes:
- Text changes (headlines, body copy, CTAs)
- Color or font adjustments
- Image swaps (with client-provided images)
- Layout reordering of existing sections
- Spacing or sizing adjustments

A revision round does NOT include:
- Adding entirely new sections not in the original scope
- Changing the fundamental page structure or layout concept
- Switching design direction after design system approval
- Providing new content that requires full copy rewriting
- Adding new features (animations, integrations, pages)

### Revision Round Limits

| Tier | Rounds | Additional Rounds |
|---|---|---|
| Basic (1,500₪) | 2 rounds | 200₪ per additional round |
| Standard (2,500₪) | 3 rounds | 200₪ per additional round |
| Premium (4,000₪) | Unlimited for 2 weeks | After 2 weeks: 200₪ per round |

### Revision Workflow
1. Client submits all changes in a single list (WhatsApp, email, or shared doc)
2. Builder implements all changes from that list
3. Client reviews and either approves or submits next round
4. Partial feedback ("I'll look at the rest later") counts as a round start

---

## Monthly Maintenance Options

### Plan A: Basic Maintenance - 200₪/month
- Uptime monitoring (immediate alert on downtime)
- Monthly security updates (Next.js, Payload CMS, dependencies)
- SSL certificate renewal management
- 1 monthly performance report (Core Web Vitals)
- Bug fixes for existing functionality
- Vercel deployment management

### Plan B: Content + Maintenance - 350₪/month
- Everything in Plan A
- Up to 5 content updates per month (text, images, testimonials)
- Seasonal banner changes (holidays, promotions)
- New testimonial additions via CMS
- Monthly analytics summary report
- Priority response (within 24 hours on business days)

### No Maintenance
- Client receives full source code and deployment access
- Self-managed via Payload CMS admin panel
- Handoff documentation provided (see `templates/client-handoff-he.md`)
- Available for ad-hoc support at 150₪/hour

---

## Visual Direction Previews

Before the proposal is sent, generate 2-3 mood board thumbnails from Phase 2 sources:

### What to Include
1. **Color palette preview** - 4-5 color swatches based on industry + discovery answers
2. **Font pairing suggestion** - Hebrew headline font + body font sample
3. **Layout wireframe** - rough section order (hero → benefits → testimonials → CTA)
4. **Reference screenshot** - 1-2 existing sites with similar aesthetic (from Phase 2 inspiration)

### How to Generate
- Use discovery answers (Q2: business type, Q6: differentiator, Q10: existing assets)
- Pull from Phase 2 inspiration sources relevant to the business category
- Present as a simple visual collage - not a full mockup
- Label each direction: "כיוון A: מודרני ונקי" / "כיוון B: חם ואישי" / "כיוון C: מקצועי ורציני"

### Context-Aware Direction Selection
```
IF business type is medical/legal/financial
   → Professional, clean, trust-focused directions
IF business type is food/beauty/lifestyle
   → Warm, visual-heavy, personality-driven directions
IF business type is tech/startup
   → Modern, minimal, bold directions
```

---

## Interactive Questions (via AskUserQuestion)

Present these AFTER showing the auto-generated proposal draft. These finalize the agreement.

### Question P1: Price Tier

```
בחרנו עבורך את חבילת ה[AUTO_RECOMMENDED_TIER] על בסיס הצרכים שלך.
אפשר לשנות:

1. 🔹 בסיסי - 1,500₪ (דף נחיתה, עיצוב בסיסי, 2 סבבי תיקונים)
2. 🔸 סטנדרט - 2,500₪ (דף נחיתה + CMS, עיצוב מותאם, 3 סבבי תיקונים)
3. 🔶 פרימיום - 4,000₪ (הכל כלול + אנימציות + A/B + עמודים משפטיים + ניטור)
4. 💎 מותאם אישית - ספר/י מה עוד צריך: ___
```

### Question P2: Payment Structure

```
איך נוח לך לשלם?

1. 50/50 - חצי בהתחלה, חצי בסיום
2. 30/30/40 - שליש בהתחלה, שליש באישור עיצוב, 40% בהשקה
3. 100% מראש - הנחה של 5%
4. אחר: ___
```

### Question P3: Revision Rounds

```
כמה סבבי תיקונים?

1. 2 סבבים (כלול בחבילה הבסיסית)
2. 3 סבבים (כלול בסטנדרט)
3. ללא הגבלה ל-2 שבועות (כלול בפרימיום)
```

*Note: This question is auto-answered based on tier selection. Only shown if client chose Custom.*

### Question P4: Monthly Maintenance

```
רוצה תחזוקה חודשית אחרי ההשקה?

1. ✅ כן - 200₪/חודש (עדכונים + ניטור)
2. ✅ כן - 350₪/חודש (עדכונים + ניטור + שינויי תוכן)
3. ❌ לא - אנהל לבד (תקבל/י מדריך מלא)
```

### Question P5: Timeline

```
מה לוח הזמנים הרצוי?

1. שבוע (Basic בלבד, דורש תוכן מוכן)
2. שבועיים (Standard/Premium)
3. 3 שבועות (Premium + תוכן מורכב)
4. אחר: ___
```

---

## Proposal Generation Flow

```
┌─────────────────────────────────────────────┐
│         Tier 1 Discovery Complete           │
│      (Q1-Q11 + QIL-1 to QIL-3 answered)    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│      Auto-Fill Proposal from Discovery      │
│  - Business name, type, scope              │
│  - Recommended tier based on complexity     │
│  - Timeline based on asset readiness        │
│  - Scope items based on CTA + features      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│     Generate Visual Direction Previews      │
│  - 2-3 mood board thumbnails               │
│  - Color palette + font pairing            │
│  - Industry-appropriate styles             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│     Present Draft Proposal to Client        │
│  - Show auto-generated Hebrew proposal      │
│  - Highlight recommended tier + reasoning   │
│  - Include visual direction previews        │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│     Ask Finalization Questions (P1-P5)      │
│  - Tier confirmation or change              │
│  - Payment structure                        │
│  - Revisions (auto if not Custom)           │
│  - Maintenance preference                   │
│  - Timeline confirmation                    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│     Generate Final Proposal Document        │
│  - Fill templates/proposal-he.md            │
│  - Hebrew markdown, PDF-ready               │
│  - Client signs off (digital or print)      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│     Gate: Proceed to Phase 2                │
│  - Proposal approved → start design         │
│  - First payment collected                  │
│  - Content brief sent (parallel track)      │
└─────────────────────────────────────────────┘
```

---

## Output Format

The final proposal is generated by filling `templates/proposal-he.md` with all collected data.

### Placeholder Mapping

| Placeholder | Source |
|---|---|
| `[BUSINESS_NAME_HE]` | Q1 Hebrew name |
| `[DATE]` | Current date in DD/MM/YYYY format |
| `[CLIENT_NAME]` | Collected during proposal phase |
| `[PROJECT_SUMMARY]` | Generated from Q2 + Q5 + Q8 |
| `[SCOPE]` | Based on selected tier |
| `[EXCLUSIONS]` | Inverse of scope (what the tier doesn't include) |
| `[TIMELINE_TABLE]` | Based on P5 answer + tier complexity |
| `[PRICE]` | Based on P1 answer |
| `[PAYMENT_TERMS]` | Based on P2 answer |
| `[REVISION_POLICY]` | Based on P3 answer (or auto from tier) |
| `[MAINTENANCE_OPTIONS]` | Based on P4 answer |
| `[MOOD_BOARD_SECTION]` | Generated visual direction previews |
| `[GENERAL_TERMS]` | Standard terms (cancellation, IP, confidentiality) |

---

## General Terms (Hebrew)

Standard terms to include in every proposal:

1. **ביטול:** ניתן לבטל תוך 14 יום מחתימה. עבודה שכבר בוצעה תחויב לפי שעות (150₪/שעה).
2. **קניין רוחני:** כל הקוד, העיצוב והתוכן שנוצרו עוברים לבעלות הלקוח עם השלמת התשלום המלא.
3. **אחריות:** הבילדר אחראי לתקינות טכנית 30 יום אחרי ההשקה (באגים בלבד, לא תוכן).
4. **סודיות:** שני הצדדים מתחייבים לשמור על סודיות המידע העסקי.
5. **עיכובים:** אם הלקוח מעכב תוכן מעבר ל-7 ימי עסקים, לוח הזמנים מתעדכן בהתאם.
6. **צד שלישי:** שימוש בתמונות סטוק, פונטים ושירותי צד שלישי בכפוף לרישיונות שלהם.
7. **שינויים מעבר לסקופ:** כל דרישה שלא מופיעה בהצעה תתומחר בנפרד ותאושר בכתב.
