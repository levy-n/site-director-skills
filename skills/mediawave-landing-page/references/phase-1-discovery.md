# Phase 1: Client Discovery & Competitive Research

## Contents

1. Overview
2. Step 1: Collect Tier 1 Answers (Batches 1A-1D)
3. Step 2: Israeli Market Supplement
4. Step 3: Competitive Research
5. Step 4: StoryBrand BrandScript
6. Output (`discovery-output.json`, including the `world` key)

## Overview
This phase collects all information needed to build a landing page that converts.
It uses a research-backed question flow synthesized from StoryBrand, JTBD, Copyhackers,
CXL, Unbounce, and agency onboarding best practices.

## Step 1: Collect Tier 1 Answers

Use `AskUserQuestion` to present questions in batches (not all at once): 1A-1C, then the Israeli supplement, then Batch 1D (world; its rules on options are below it).

### Batch 1A: Business Identity (4 questions)

```
Q1. Business Name
    Hebrew: ___  |  English: ___

Q2. Describe the business in 2-3 sentences
    (The "Grunt Test": can someone instantly understand what you do?)

Q3. What is the SINGLE most important action visitors should take?
    Options: Book a call / Fill a form / Buy a product / Send WhatsApp /
             Download something / Sign up / Other

Q4. Who is the ideal customer?
    Age range, location, occupation, what keeps them up at night.
```

### Batch 1B: Strategy & Positioning (4 questions)

```
Q5. What specific problem does the customer have before finding you?
    How does this problem make them FEEL? (StoryBrand: external + internal problem)

Q6. What makes you different from competitors or alternatives?
    Why choose you over doing nothing?

Q7. How familiar is the typical visitor with your solution?
    Options:
    a) Don't know they have a problem (Unaware)
    b) Know the problem, not that solutions exist (Problem Aware)
    c) Know solutions exist, haven't picked one (Solution Aware)
    d) Heard of you specifically (Product Aware)
    e) Ready to buy, just need a push (Most Aware)

Q8. What does the customer's life look like AFTER using your service?
    (The transformation promise: StoryBrand "Success")
```

### Batch 1C: Assets & Logistics (3 questions)

```
Q9. Where will visitors come from?
    Multi-select: Google Ads / Facebook-Instagram Ads / Organic SEO /
    Social posts / Email / WhatsApp / Referrals / Offline (QR, flyer)

Q10. Existing assets (check all that apply):
     Logo / Brand colors / Brand fonts / Professional photos / Video /
     Testimonials / Case studies / Existing website / Style guide

Q11. Timeline: ideal launch date and any driving event?
```

### Batch 1D: The Client's Professional World (6 questions)

Asked after the Israeli supplement (Step 2). Full question cards, reasons, dossier mapping and skip
logic: the question engine's World Block, W-Q1 to W-Q6 (SKILL.md Phase 1 links it). Hebrew wording for the client:
`templates/client-questionnaire-he.md`, section "העולם המקצועי שלך" (items 11-16).

```
W-Q1. What is on your desk (workbench, toolbox, van, counter) when you work?
      Tools, materials, instruments, papers.                     -> world.desk[]

W-Q2. Which document or form do you hand the client?
      Quote, report, certificate, job card, receipt, warranty.
      A photo of a sample, customer details covered.             -> world.documents[]

W-Q3. Which words does only your trade use?
      3-10 words or phrases, one line each on the meaning.       -> world.insiderWords[]

W-Q4. At which moment does the client understand they are in good hands?
      One real moment: what you did, what they saw or heard.     -> world.goodHandsMoment

W-Q5. What does the client fear before contacting you?
      1-3 fears, in the client's words.                          -> world.fears[]

W-Q6. 10-20 photos from the workplace: tools, materials,
      documents, the place itself. Consent line + who took them. -> world.photos[]
```

Rules:
- The client answers in open text, never from preset options. When Nati answers through
  `AskUserQuestion` (it needs 2-4 options), every option comes from evidence: the client's photos,
  reviews, questionnaire answers and trade research, as in site-director's world questions
  (version A). Never use generic industry options. Unknown answers are stored as `"[לבירור]"` and
  asked again; never invent one.
- When site-director conducts the site, this batch is mandatory: its creative-direction stage
  turns every answer into items of the world dossier (`design/world-dossier.rtl.md`). Ask Nati
  through `AskUserQuestion` what he already knows; send the rest to the client as a WhatsApp
  message.
- Photos (W-Q6) are requested here and again in the content brief right after the proposal is
  approved, so they arrive before the concept. Originals go to `design/world/photos/NN-<what>.jpg`.
- Dedupe (question numbers from the question engine): W-Q3 is the trade's words (Q19 is the
  customer's words); W-Q4 is the moment itself (Q21, the best quote, is what the customer said);
  W-Q5 is the fear of making contact (Q5 is the problem and its feeling, Q20 the objections to the offer).

## Step 2: Israeli Market Supplement

These are MANDATORY for Hebrew landing pages:

```
QIL-1. Primary contact method for customers?
       Options: WhatsApp / Phone call / Contact form / Email /
                Facebook Messenger / All of the above
       (Include phone number with +972 prefix)

QIL-2. Page language?
       Options: Hebrew only / English only / Bilingual (Hebrew primary) /
                Bilingual (English primary)

QIL-3. Israeli-specific elements needed?
       Options: Payment gateway / Invoice system (Hashbonit) /
                Business number display / Delivery integration / None
```

## Step 3: Competitive Research

After collecting answers, automatically research competitors:

### 3A. Identify Competitors
- Use competitor names/URLs from Q6 answers
- If none provided, search: `[business type] [city] site:.co.il`
- Find 3-5 direct competitors

### 3B. Analyze Each Competitor
For each competitor website, use `WebFetch` to extract:

```json
{
  "competitor": "name",
  "url": "https://...",
  "analysis": {
    "colors": ["primary", "secondary", "accent"],
    "fonts": ["heading font", "body font"],
    "sections": ["hero", "features", "testimonials", ...],
    "cta_type": "form / phone / whatsapp",
    "cta_text": "actual button text",
    "hero_headline": "their headline",
    "page_length": "short / medium / long",
    "mobile_friendly": true/false,
    "unique_elements": "what stands out"
  }
}
```

### 3C. Generate Analysis Report
Create `discovery-output.json` containing:
1. All client answers (Tier 1 + IL supplement + world block)
2. Competitor analysis array
3. Market positioning summary
4. Recommended differentiation strategy

## Step 4: StoryBrand BrandScript

Map discovery answers to the 7 StoryBrand elements:

| Element | Source |
|---------|--------|
| Character (hero) | Q4: ideal customer description |
| Problem (external, internal, philosophical) | Q5: customer problem + feeling |
| Guide (empathy + authority) | Q6: differentiator + Q10 assets |
| Plan (3 steps) | Synthesize from Q3 + Q6 |
| Call to Action | Q3: primary CTA goal |
| Failure (stakes) | Inverse of Q8 transformation |
| Success (transformation) | Q8: life after using service |

Store BrandScript in `discovery-output.json` under `storyBrand` key.

## Output

The phase produces `discovery-output.json`:
```json
{
  "business": {
    "nameHe": "...",
    "nameEn": "...",
    "description": "...",
    "cta_goal": "...",
    "phone": "+972...",
    "whatsapp": "+972..."
  },
  "customer": {
    "profile": "...",
    "problem": "...",
    "awareness_level": "...",
    "transformation": "..."
  },
  "positioning": {
    "differentiator": "...",
    "traffic_sources": [...],
    "tone": "..."
  },
  "assets": {
    "has_logo": true,
    "has_photos": false,
    ...
  },
  "competitors": [...],
  "world": {
    "desk": ["...", "..."],
    "documents": ["..."],
    "insiderWords": [{ "word": "...", "meaning": "..." }],
    "goodHandsMoment": "...",
    "fears": ["..."],
    "photos": [
      {
        "file": "design/world/photos/01-<what>.jpg",
        "what": "...",
        "takenBy": "...",
        "consentToPublish": false
      }
    ]
  },
  "storyBrand": {
    "character": "...",
    "problem": { "external": "...", "internal": "...", "philosophical": "..." },
    "guide": { "empathy": "...", "authority": "..." },
    "plan": ["step1", "step2", "step3"],
    "callToAction": "...",
    "failure": "...",
    "success": "..."
  },
  "timeline": "...",
  "language": "he",
  "israelSpecific": {...}
}
```

The `world` key holds Batch 1D. Unknown answers are never a guess: an unknown scalar
(`goodHandsMoment`) is the string `"[לבירור]"`; an unknown list (`desk`, `documents`, `fears`) is
`["[לבירור]"]`; unknown `insiderWords` is `[{ "word": "[לבירור]", "meaning": "" }]`; `photos` stays
`[]` until files arrive.
`photos[].file` is relative to the client project root; `consentToPublish` stays `false` until the
client approves that photo for the site itself (the dossier's "מקורות" table records it). The SEO
scripts do not read this key.
