---
name: design-inspiration-to-code
description: >
  Extracts design elements from inspiration websites, screenshots, or videos and recreates
  them as original, production-ready code. Pipeline: visual audit → token extraction →
  design brief → guided implementation. Input methods: screenshots, FFmpeg video frames,
  Playwright MCP live capture, manual capture for anti-bot sites. Enforces "principles,
  not pixels" — combines sources into transformative work; design-quality rules and scoring
  delegate to the frontend-super skill. Do NOT use for general frontend work without a
  specific inspiration source.
when_to_use: >
  "take inspiration from", "I like this website", "build something similar to", "design like",
  "copy the style of", "extract design from", "design audit", "moodboard to code",
  "screenshot to code", "video to code", "recreate this animation",
  "תעתיק את האנימציה", "עיצוב כמו", "השראה מאתר", "תיקח מהאתר הזה", "תעשה לי כמו",
  "עיצוב דומה ל", or the user provides a URL/video/screenshot and asks to recreate
  or be inspired by its design.
argument-hint: "[inspiration-url-or-file]"
metadata:
  author: Nati
  version: 2.1.0
  category: frontend-design
---

# Design Inspiration to Code

Transform website inspiration into an original professional implementation.

**Core principle: take PRINCIPLES, not PIXELS.** Combine elements from multiple sources
into something transformative. Never pixel-copy a single site.

**Design quality**: this skill owns the extraction pipeline. Anti-AI-slop rules, design
scoring (0-100), animation craft, and full RTL typography rules live in the
**frontend-super** skill — invoke it during Phase 5 (implementation) and Phase 7 (QA)
instead of duplicating its rules here.

## Reference Files

| File | Content |
|------|---------|
| `references/discovery-questions.md` | All Hebrew AskUserQuestion blocks, phase by phase |
| `references/visual-capture-methods.md` | Full recipes: screenshots, FFmpeg, Playwright MCP, manual fallback |
| `references/extraction-tools.md` | Token extraction tools: Dembrandt, DevTools, Chrome extensions |
| `references/design-brief-template.md` | 11-section design brief template to copy and fill |
| `references/implementation-guide.md` | Build order, video background, MediaWave integration, worked examples |
| `references/ethical-guidelines.md` | Legal/illegal/risky table, transformation rule |

## Pipeline Checklist

- [ ] Phase 1: Collect & understand (visual audit + Hebrew discovery questions)
- [ ] Phase 2: Extract design tokens
- [ ] Phase 3: Create design brief (exact values, source mapping)
- [ ] Phase 4: Visual capture (choose method via decision tree)
- [ ] Phase 5: Implementation (token-first, frontend-super quality rules)
- [ ] Phase 6: Video background (if applicable)
- [ ] Phase 7: QA (feedback loop + brief verification)

---

## Phase 1: Collect and Understand

For EACH inspiration URL, use WebFetch to analyze, then document a visual audit:

```markdown
## Visual Audit: [URL]
### Overall Feel
- Mood: [e.g., "elegant minimal", "bold editorial", "warm approachable"]
- Dominant aesthetic: [light/dark, warm/cool, dense/spacious]
### Why It Works (PRINCIPLES, not visuals)
- Why premium? [e.g., "light font weight + generous whitespace"]
- Why does hierarchy work? [e.g., "large serif headings vs small sans body"]
- Why balanced? [e.g., "asymmetric grid with intentional negative space"]
- Why smooth? [e.g., "subtle fade-up, 0.3s ease-out, no bounce"]
### Elements to Take / Elements to Skip
- [checklists: palette approach, typography pairing, layout, animations, components]
```

Then run the MANDATORY Hebrew discovery rounds — questions 1-2 in
`references/discovery-questions.md` (what they loved, priority sections, assets,
required differences). If multiple inspiration URLs: also question 3 (multi-source).

## Phase 2: Extract Design Tokens

**Automated (preferred):** suggest the user run and share output:

```bash
npx dembrandt https://example.com   # full design system as W3C tokens JSON
# Alternative: Chrome DevTools > More Tools > CSS Overview > Capture Overview
```

More tools (extensions, platforms, screenshot-to-code): `references/extraction-tools.md`.

**Manual fallback:** WebFetch the URL and extract from HTML/CSS:
- **Colors** — bg-primary/section, text-heading/body/muted, accent, border
- **Typography** — family/weight/size/line-height for H1-H3, body, small, button
- **Spacing** — base unit, section gaps, content max-width, component padding
- **Animation** — hover transitions, scroll reveals, page-load effects

Record everything in the token tables of `references/design-brief-template.md`.

## Phase 3: Create Design Brief

First ask the MANDATORY design-direction questions — questions 4-5 in
`references/discovery-questions.md` (style, platform, gallery type, navbar, hero, CTA).

Then fill `references/design-brief-template.md`. The brief MUST specify:

1. **Source mapping** — "Layout from Site A, colors from Site B, typography from Site C"
2. **Exact token values** — not "make it warm", but `oklch(0.97 0.01 90)`
3. **Component specs** — button padding, border-radius, hover states
4. **Animation specs** — duration, easing function, trigger event
5. **Constraints** — RTL rules, accessibility, performance budget
6. **Mobile behavior** — how each section adapts

## Phase 4: Visual Capture

Claude can "see" static images, video frames, and live websites.
First ask which visual input exists — question 6 in `references/discovery-questions.md`.

### Decision Tree

```
User has...
├── Screenshot/image file → Method A: Direct Image Read
├── Video file (.mp4/.mov/.gif) → Method B: FFmpeg Frame Extraction
├── Live website URL → Method C: Playwright MCP Live Capture
├── Screen recording of animation → Method B (FFmpeg) on the recording
└── Website with anti-bot protection → Method D: Manual Screenshots
```

Full step-by-step recipes for all methods: `references/visual-capture-methods.md`.
Summary:

- **Method A — Screenshots**: Read images directly; request focused per-section shots,
  mobile + desktop views, hover states, annotations.
- **Method B — FFmpeg**: `ffprobe` metadata → extract frames at a rate matched to video
  duration (fps=1 for ≤30s, scene detection for 1-5min, keyframes for 5min+).
  **NEVER read frames in the main conversation** — spawn Agent-tool sub-agents in batches
  of 8-10 frames; each writes a text analysis file; main agent reads only summaries.
- **Method C — Playwright MCP**: `claude mcp add playwright npx @playwright/mcp@latest --caps vision`,
  then capture default state, hover/scroll/click states, 375/768/1440px viewports, and
  animation sequences (screenshot every 200-300ms during the animation).
- **Method D — Manual fallback**: for anti-bot sites, ask the user to capture with
  ShareX/ScreenToGif/OBS (question 7 in discovery-questions.md), then route to A or B.

Document every animation found using the Animation Pattern format in
`references/visual-capture-methods.md` (trigger, element, before/after states, duration,
easing, stagger, CSS implementation).

## Phase 5: Implementation

Before writing ANY code, ask the MANDATORY pre-implementation questions — question 8 in
`references/discovery-questions.md` (build pace, priority animations).

**Invoke the frontend-super skill now** for anti-slop enforcement (banned fonts/colors/layouts),
OKLCH color rules, 8pt grid, extreme weight contrast, CSS-first animation, and mobile UX rules.

Build order (strict, details in `references/implementation-guide.md`):

1. **Design tokens** — theme variables in CSS/Tailwind (token-first, always)
2. **Layout skeleton** — page structure with placeholders
3. **One section completely** — establish the design baseline
4. **Replicate pattern** — apply to remaining sections
5. **Animations last** — after static design is correct
6. **Responsive refinement** — test all breakpoints

For each section use the Section Prompt Template (`references/implementation-guide.md`):
SECTION / INSPIRATION / TOKENS / LAYOUT / COMPONENTS / ANIMATION / RESPONSIVE / CONSTRAINTS.

### RTL/Hebrew (when target is Hebrew)

Full rules in frontend-super. Non-negotiables while building:

- CSS logical properties ONLY (`inset-inline-start`, not `left`)
- NO letter-spacing / italic / uppercase on Hebrew text
- `dir="rtl"` + `lang="he"` on root; animations enter from the RIGHT
- Hebrew body text ~10% larger than English; line-height 1.7 body / 1.4 headings
- Hebrew fonts: Heebo, Rubik, Assistant, Secular One, Karantina (OFL license, clear at 16px)

## Phase 6: Video Background (when applicable)

```html
<video autoplay muted loop playsinline poster="/images/poster.jpg"
  class="absolute inset-0 w-full h-full object-cover">
  <source src="/video/hero.mp4" type="video/mp4" />
</video>
```

Rules: `autoplay muted playsinline` required for all browsers; poster matches first frame;
15-30s, under 5MB, 720p; static image fallback on mobile; overlay for text readability.
Compression command and details: `references/implementation-guide.md`.

## Phase 7: Quality Assurance

**Feedback loop**: if user chose section-by-section, ask question 9
(`references/discovery-questions.md`) after each section; at the end, ask question 10
(final review). Score each section with frontend-super's design scoring —
**any category below 70 → refine that category before proceeding**.

Verify against the design brief:

- [ ] Colors match tokens (DevTools color picker)
- [ ] Typography scale matches all levels
- [ ] Spacing consistent (DevTools box model)
- [ ] Layout correct at all breakpoints
- [ ] Animations have correct duration/easing
- [ ] Hover states on all interactive elements
- [ ] Images: correct aspect ratios and object-fit
- [ ] Design is TRANSFORMATIVE, not identical to source
- [ ] RTL works correctly (if applicable)
- [ ] Performance acceptable (Lighthouse > 90)

---

## MediaWave Integration (client landing pages, Israeli market)

If the project is a client landing page for an Israeli business, offer the
`mediawave-landing-page` skill (question 11 in `references/discovery-questions.md`).
Phase mapping and MediaWave quality standards (WhatsApp CTA, Amendment 13 privacy,
IS 5568 accessibility, Hebrew SEO): `references/implementation-guide.md`.

## Ethics

Full framework: `references/ethical-guidelines.md`. Quick rules:

- LEGAL: similar layout structure, color harmony, same open-source fonts
- LEGAL: combining elements from 3+ sources into something new
- ILLEGAL: copying custom illustrations, photos, or source code
- RISKY: pixel-perfect recreation of a unique single-source design

## Troubleshooting

| Problem | Cause → Fix |
|---------|-------------|
| Design looks AI-generated | Default fonts/colors/layouts → apply frontend-super banned-defaults list |
| Design "off" despite correct tokens | Spacing relationships → internal spacing must be smaller than external (Gestalt) |
| Fonts differ from inspiration | Weight/size/line-height are a system → tune together |
| Colors feel wrong despite matching values | Colors are context-dependent → test in context, use OKLCH |
| Animations feel cheap | Wrong easing/duration → ONE orchestrated moment per section, ease-out, 0.3-0.6s, never linear |
| Mobile looks broken | `100dvh` not `100vh`, 44x44px touch targets, thumb-zone CTAs |
| FFmpeg not found | `winget install ffmpeg`, restart terminal |
| Playwright MCP not working | `claude mcp add playwright npx @playwright/mcp@latest --caps vision` |
| Context overload from frames | NEVER read frames in main context → Agent-tool sub-agents, batches of 8-10 |
| Site blocks Playwright/scraping | Fall back to Method D (manual capture) |
| Animation missing from screenshots | Use Method B (video → frames) or Method C (sequential Playwright captures) |
