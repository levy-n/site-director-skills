# Legal Templates Reference - Israeli Law

> Comprehensive reference for generating legally compliant Hebrew pages for Israeli small business websites.
> All legal pages auto-fill from discovery data collected in Phase 1.

---

## Israeli Legal Requirements Overview

### 1. Accessibility Law (חוק שוויון זכויות לאנשים עם מוגבלות, תשנ"ח-1998)

**What it requires:**
- All public-facing websites must comply with **Israeli Standard IS 5568**
- IS 5568 is based on **WCAG 2.1 Level AA** (updated from original WCAG 2.0 basis)
- Came into full force October 2017; small businesses (revenue > 100,000 NIS) must comply since October 2020
- Businesses with average annual revenue **under 100,000 NIS are exempt**

**Mandatory actions:**
- Publish an **accessibility statement** (הצהרת נגישות) on the website
- Designate an **accessibility coordinator** (רכז/ת נגישות) with published contact details
- Ensure keyboard navigation, screen reader support, color contrast ratios (4.5:1 for text)
- All images must have Hebrew alt text
- Forms must have labels and accessible error messages

**Penalties:**
- Up to **75,000 NIS per violation** (some sources cite 50,000 NIS for initial violations)
- Private individuals may pursue litigation
- Enforcement by the Commission for Equal Rights of Persons with Disabilities

**Key regulations:**
- תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), תשע"ג-2013
- Israeli Standard IS 5568 (תקן ישראלי ת"י 5568)

---

### 2. Privacy Protection Law (חוק הגנת הפרטיות, תשמ"א-1981)

**Amendment 13 (תיקון 13) - Effective August 2024:**
- Shifts focus from protecting "databases" to protecting **"personal information" itself**
- Aligns Israeli law closer to GDPR principles
- Requires publishing a **public privacy policy** (מדיניות פרטיות)

**Key requirements for websites:**
- **Notification**: Must inform users what data is collected and why
- **Consent**: Must obtain consent for data collection (cookie banners, form notices)
- **Cookie consent**: Websites using cookies, analytics, or tracking must show cookie notice
- **Privacy policy**: Must detail types of data collected, purposes, retention periods, user rights
- **Data subject rights**: Right to access, correct, and delete personal data
- **Cross-border transfer**: Restrictions on transferring data outside Israel
- **Database registration**: Required if holding >10,000 records with the Privacy Protection Authority

**Practical requirements for small business sites:**
1. Publish clear privacy policy page
2. Add data collection notice on all forms
3. Install cookie consent banner (if using analytics/tracking)
4. Ensure basic data security (HTTPS, secure storage)

---

### 3. Consumer Protection Law (חוק הגנת הצרכן, תשמ"א-1981)

**Applies when the website sells products or services:**
- **14-day cancellation right** for distance/online transactions
- Must disclose: business name, address in Israel, product features, total price, payment terms, delivery method
- Seller may charge cancellation fee of **5% or 100 NIS, whichever is less**
- Exceptions: undergarments, food, medicine, assembled furniture

**Website disclosure requirements:**
- Full business name and registered address
- Contact information (phone, email)
- Total price including VAT before checkout
- Clear terms of purchase

---

### 4. E-Commerce Regulations

**For websites accepting payments:**
- Must display total price including VAT
- Secure payment processing (PCI compliance through payment provider)
- Order confirmation must be sent
- Return and cancellation policy must be clearly published
- Shipping terms and timelines

---

## Business-Type Specific Requirements

| Business Type | Extra Disclaimers Needed | Template Sections to Enable |
|---|---|---|
| **Food & Beverage** | Allergen notices, food safety disclaimer, "אין תחליף לייעוץ תזונתי מקצועי" | `FOOD_DISCLAIMER` |
| **Health & Wellness** | Medical disclaimer: "המידע באתר אינו מהווה תחליף לייעוץ רפואי מקצועי", license info | `HEALTH_DISCLAIMER` |
| **Financial Services** | Investment risk disclaimers, "אין באמור לעיל משום המלצה או ייעוץ", regulatory body notices | `FINANCIAL_DISCLAIMER` |
| **Education** | Enrollment terms, refund policy for courses, certification disclaimers | `EDUCATION_DISCLAIMER` |
| **E-commerce** | Return policy (14 days), shipping policy, payment security, cancellation fees | `ECOMMERCE_SECTION` |
| **Beauty & Personal Care** | Results disclaimer "תוצאות עשויות להשתנות מאדם לאדם", allergy warnings | `BEAUTY_DISCLAIMER` |
| **Legal Services** | "אין באמור משום ייעוץ משפטי", engagement terms | `LEGAL_DISCLAIMER` |
| **Standard Service** | Basic legal pages sufficient | No extra sections |

---

## Auto-Fill Logic: Discovery Data to Legal Templates

### Placeholder Mapping

| Discovery Data Field | Placeholder | Used In |
|---|---|---|
| Business name (Hebrew) | `[BUSINESS_NAME_HE]` | All documents |
| Business name (English) | `[BUSINESS_NAME_EN]` | All documents |
| Site URL | `[SITE_URL]` | Accessibility, Privacy |
| Owner/contact name | `[CONTACT_NAME]` | All documents |
| Email address | `[CONTACT_EMAIL]` | All documents |
| Phone number | `[CONTACT_PHONE]` | All documents |
| WhatsApp number | `[WHATSAPP_NUMBER]` | Accessibility, Privacy |
| Physical address | `[BUSINESS_ADDRESS]` | Terms, Privacy |
| City | `[CITY]` | Terms (jurisdiction) |
| Business type | Triggers conditional sections | Terms, Privacy |
| Accessibility contact name | `[ACCESSIBILITY_CONTACT_NAME]` | Accessibility |
| Accessibility contact email | `[ACCESSIBILITY_CONTACT_EMAIL]` | Accessibility |
| Accessibility contact phone | `[ACCESSIBILITY_CONTACT_PHONE]` | Accessibility |
| Form fields built | `[FORM_FIELDS_LIST]` | Privacy (data collection) |
| Analytics tools used | `[ANALYTICS_TOOLS]` | Privacy (cookies section) |
| Payment integration | `[PAYMENT_PROVIDER]` | Privacy, Terms |
| Date generated | `[DATE]` | All documents |
| Last audit date | `[LAST_AUDIT_DATE]` | Accessibility |
| Known accessibility issues | `[KNOWN_ISSUES]` | Accessibility |

### Conditional Section Logic

```
IF business_type == "food_beverage":
    ENABLE sections: FOOD_DISCLAIMER in terms
    ENABLE sections: ALLERGEN_NOTICE in terms

IF business_type == "health_wellness":
    ENABLE sections: HEALTH_DISCLAIMER in terms
    ENABLE sections: MEDICAL_NOTICE in terms

IF business_type == "ecommerce" OR has_payment:
    ENABLE sections: ECOMMERCE_SECTION in terms
    ENABLE sections: PAYMENT_DATA in privacy
    ENABLE sections: RETURN_POLICY in terms

IF has_whatsapp:
    ENABLE sections: WHATSAPP_CLAUSE in privacy

IF has_analytics (GA4, Facebook Pixel, etc.):
    ENABLE sections: ANALYTICS_COOKIES in privacy
    ENABLE sections: COOKIE_POLICY in privacy

IF uses_payload_cms:
    ENABLE sections: DATA_STORAGE_CLAUSE in privacy
```

---

## Interactive Questions (via AskUserQuestion)

Before generating legal pages, ask the following:

### Question 1: Business Type for Legal
```
What type of business is this? This determines which legal disclaimers are needed.
Options:
- Standard service business (שירותים כלליים)
- Food & Beverage (מזון ומשקאות)
- Health & Wellness (בריאות ורווחה)
- Financial Services (שירותים פיננסיים)
- Education (חינוך והדרכה)
- E-commerce (מכירות אונליין)
- Beauty & Personal Care (יופי וטיפוח)
- Legal Services (שירותים משפטיים)
- Other: ___
```

### Question 2: Payments
```
Does the website accept payments?
- Yes - currently active
- No - informational site only
- Future plan - not yet but planned
```

### Question 3: Cookie Consent
```
What level of cookie consent banner should we implement?
- Full GDPR-style (opt-in with categories - recommended for analytics + marketing)
- Simple notice (notification banner with accept - sufficient for basic analytics)
- Skip (no cookies used at all)
```

### Question 4: Existing Legal Pages
```
Does the business have existing legal pages (privacy policy, terms)?
- Yes - provide URL so we can review and update
- No - generate everything from scratch
```

---

## Generation Rules

### Language & Tone
- Professional Hebrew legal language - but **READABLE by normal people**
- Short paragraphs with clear headers
- No overly complex legal jargon; explain concepts plainly
- Use standard legal Hebrew terminology where required by law

### Structure
- Business name appears prominently at the top of every document
- Contact details for exercising rights clearly visible
- Date of last update always included at bottom
- Each page is a **standalone component** in Payload CMS (collection: `legal-pages`)

### Technical Implementation
- Each legal page becomes a Payload CMS document with:
  - `slug`: `accessibility` / `privacy-policy` / `terms-of-service`
  - `title`: Page title in Hebrew
  - `content`: Rich text content (RTL)
  - `lastUpdated`: Date field
  - `isPublished`: Boolean
- Pages render as standard Next.js routes: `/nagishut`, `/mediniut-pratiyut`, `/tnaei-shimush`
- RTL direction enforced on all legal page templates
- Print-friendly CSS applied

### Compliance Checklist (verify before delivery)
- [ ] Accessibility statement published with coordinator contact
- [ ] Privacy policy covers all data collection points on the site
- [ ] Cookie consent banner matches privacy policy claims
- [ ] Terms of service include correct jurisdiction city
- [ ] Business-type disclaimers included where applicable
- [ ] All placeholders replaced with actual business data
- [ ] Dates are current
- [ ] Contact information is complete and accurate
- [ ] Pages are accessible (pass their own accessibility requirements)
- [ ] Hebrew text renders correctly in RTL

---

## Sources & Legal References

- חוק שוויון זכויות לאנשים עם מוגבלות, תשנ"ח-1998
- תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), תשע"ג-2013
- תקן ישראלי ת"י 5568 (IS 5568) - based on WCAG 2.1 Level AA
- חוק הגנת הפרטיות, תשמ"א-1981
- תיקון 13 לחוק הגנת הפרטיות, תשפ"ד-2024
- חוק הגנת הצרכן, תשמ"א-1981
- הנחיות הרשות להגנת הפרטיות
- WCAG 2.1 (W3C Web Content Accessibility Guidelines)
