# Implementation Guide — Build, Video Background, MediaWave, Examples

Detailed implementation material for Phases 5-7.

## Contents

- Token-First Development
- Build Order (strict)
- Section Prompt Template
- Video Background Implementation
- MediaWave Pipeline Integration
- Worked Examples

---

## Token-First Development

ALWAYS define design tokens before any components:

```css
@theme {
  --color-bg: oklch(...);
  --color-section: oklch(...);
  --color-heading: oklch(...);
  --color-body: oklch(...);
  --color-accent: oklch(...);
  --font-heading: 'Font Name', serif;
  --font-body: 'Font Name', sans-serif;
}
```

Token values come from the design brief (references/design-brief-template.md) —
exact OKLCH values, never vague directions like "make it warm".

## Build Order (strict)

1. **Design tokens** — theme variables in CSS/Tailwind
2. **Layout skeleton** — page structure with placeholders
3. **One section completely** — establish the design baseline
4. **Replicate pattern** — apply to remaining sections
5. **Animations last** — after static design is correct
6. **Responsive refinement** — test all breakpoints

## Section Prompt Template

For each section:

```
SECTION: [Name]
INSPIRATION: [Which site/screenshot, what to take]
TOKENS: [Which design tokens apply]
LAYOUT: [Columns, alignment, spacing]
COMPONENTS: [Headings, text, images, buttons]
ANIMATION: [What moves, when, how]
RESPONSIVE: [Mobile adaptation]
CONSTRAINTS: [RTL, a11y, performance]
```

---

## Video Background Implementation

```html
<video autoplay muted loop playsinline poster="/images/poster.jpg"
  class="absolute inset-0 w-full h-full object-cover">
  <source src="/video/hero.mp4" type="video/mp4" />
</video>
```

**Rules:**
- `autoplay muted playsinline` — REQUIRED for all browsers (iOS Safari refuses autoplay otherwise)
- `poster` image matching the first frame (prevents flash of empty background)
- Duration 15-30 sec, file under 5MB, 720p resolution
- Mobile: replace video with static image fallback (save bandwidth + battery)
- Add a color overlay (e.g., `oklch(0 0 0 / 0.4)`) for text readability
- Compress with FFmpeg: `ffmpeg -i raw.mp4 -vf scale=-2:720 -c:v libx264 -crf 28 -an hero.mp4`
- `-an` strips audio (muted anyway); check output size, raise `-crf` if over 5MB

---

## MediaWave Pipeline Integration

When this skill is used for a **client landing page** (Israeli market, Hebrew):
suggest activating the `mediawave-landing-page` skill using question 11 in
references/discovery-questions.md.

### Integration Points

| This Skill Phase | MediaWave Phase | What Happens |
|-----------------|----------------|-------------|
| Phase 1 (Audit) | Phase 2 (Inspiration) | Competitive research + reference gathering |
| Phase 2 (Tokens) | Phase 3 (Design System) | UNIQUE design system per client, Hebrew fonts |
| Phase 3 (Brief) | Phase 4 (Copywriting) | StoryBrand Hebrew copy + A/B variants |
| Phase 5 (Build) | Phase 5 (Build) | Next.js + Payload CMS + legal compliance |
| Phase 7 (QA) | Phase 6 (Optimize) | Lighthouse 90+, IS 5568 accessibility, SEO |

### MediaWave Quality Standards (on top of frontend-super rules)

- **WhatsApp CTA mandatory** for Israeli market
- **Privacy policy** — Amendment 13 compliance
- **Accessibility statement** — IS 5568 (penalties up to 75,000 NIS)
- **SEO** — Hebrew title tags 50-55 chars, LocalBusiness schema
- **Post-launch** — Week-1 health checks, Google indexing verification

---

## Worked Examples

### Example 1: Photography Portfolio with Video (Hila Project)

User: "אהבתי את agataphotography.co.uk ואת paulreiffer.com — תעשה לי כמו"

1. WebFetch both sites, visual audit
2. Ask Hebrew questions: what elements, hero type, gallery style, CTA
3. Extract tokens: Agata's layout + Paul Reiffer's video approach
4. Create brief: video hero + off-canvas nav + masonry gallery + WhatsApp CTA
5. Quality check via frontend-super: no Inter, OKLCH colors, extreme weight contrast
6. Implement token-first with RTL rules
7. Section-by-section review with Hebrew feedback questions
8. Quality score each section (70+ required)

### Example 2: Client Landing Page (MediaWave Integration)

User: "צריך דף נחיתה ללקוח — תיקח השראה מהאתרים האלה"

1. Activate MediaWave pipeline
2. Run discovery questions (Tier 1 + Tier 2)
3. Audit inspiration sites + competitive research
4. Create UNIQUE design system (never reuse)
5. Hebrew copywriting with StoryBrand + A/B variants
6. Build with frontend-super quality enforcement + RTL validation
7. Legal compliance (privacy, accessibility, terms)
8. Pre-launch checklist: SEO + Lighthouse 90+ + IS 5568

### Example 3: Multi-Source Combination

User: "Layout from site A, colors from B, animations from C"

1. Audit all three separately
2. Extract tokens, validate against frontend-super anti-slop rules
3. Replace any banned defaults (Inter → distinctive font, pure gray → tinted neutral)
4. Create unified brief in OKLCH, 8pt grid, extreme weight contrast
5. Build with CSS-first animations, 0.6s max
6. Score each section 0-100, refine below 70
