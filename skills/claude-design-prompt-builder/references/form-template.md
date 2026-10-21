# Form Template — claude.ai/design "Set up your design system"

The form has six fields. Each has different rules. Output `form-fields.md` with each field as a fenced code block.

## Field 1 — Company name and blurb

**Rules:**
- 60-120 words. Tight.
- Lead with company name + (Hebrew/native name if applicable).
- One sentence: who they are + who they serve.
- One sentence: aesthetic in 5-8 keywords.
- One sentence on language/RTL constraint if applicable.
- No marketing fluff. No "leading provider of". No "world-class".

**Template:**
```
{Company Name} ({native-language name if applicable}) — {one sentence: what they do + who they serve}. The brand voice is {3 adjectives from interview}, {one descriptor of the emotional tone in plain language}. Aesthetic: {5-8 keyword list — e.g. "near-white canvas, serif display, generous whitespace, photographic, editorial, unhurried scroll"}. {If RTL: "All UI text is in {language} (RTL); design must respect {language} typographic rules."}
```

## Field 2 — Link code on GitHub

**Rules:**
- Just the URL. No prose.
- If repo is private → flag this in audit-summary.md and tell user to either make public or use the local-folder upload instead.

**Template:**
```
{git remote URL stripped of .git suffix}
```

## Field 3 — Link code from your computer

**Rules:**
- For most users: skip if GitHub link is provided. Note this explicitly.
- If user has no GitHub: recommend the **frontend-focused subfolder** (the Help Center explicitly recommends this for large codebases). Usually `src/` for React/Vue, `app/` for Next.js, `pages/` for older Next.js.

**Template:**
```
SKIP — GitHub link covers it.
{or, if no GitHub:}
Drag this folder: {absolute path to src/ or app/ subfolder}
```

## Field 4 — Upload a .fig file

**Rules:**
- If user said "no Figma" in Phase 1 → write SKIP.
- If yes → give the absolute path.

**Template:**
```
SKIP — no Figma file for this project.
{or}
Upload: {absolute path to .fig file}
```

## Field 5 — Add fonts, logos and assets

**Rules:**
- Fonts loaded from Google Fonts via CSS or `<link>` are auto-detected from the codebase — Claude Design will see them. Do NOT recommend uploading these.
- DO recommend uploading: brand logo (SVG > PNG), 3-5 representative photographs/imagery samples, any custom self-hosted fonts (woff2 files).
- For photography portfolios: 3-5 images that show the photographer's range. Pull from `public/gallery/` or equivalent.
- Provide absolute paths.

**Template:**
```
Drag these files:
- {path to logo if exists}
- {path to representative image 1}
- {path to representative image 2}
- {path to representative image 3}
{etc.}

Note: Google Fonts ({list font families}) load via index.html and will be auto-detected from the GitHub link. No upload needed.
```

## Field 6 — Any other notes?

**This is the highest-leverage field. Spend time here.**

**Rules:**
- 200-500 words. Structured. Density of signal.
- Use ALL-CAPS section headers (DESIGN DIRECTION, COLOR PALETTE, TYPOGRAPHY, etc.).
- Reference exact values from extraction (OKLCH, hex, font names, weights).
- Include any client-stated direction changes (e.g. "client requested near-white background — retire the dusty-rose page background").
- For Hebrew/Arabic/RTL projects → MUST include the RTL block below.

**Template:**
```
DESIGN DIRECTION
{1-3 sentences capturing the strategic intent from the interview. Mention any change-of-direction the client has stated. Mention reference brands the user named.}

COLOR PALETTE
- PRIMARY BACKGROUND: {token name + value, with role}
- SECONDARY BACKGROUND (sparingly): {token + value}
- ACCENT (hover, lines, ornaments): {token + value}
- TEXT: {token + value for body}, {token + value for headings}
- AVOID as backgrounds: {tokens that exist in code but should not be used as primary surfaces}
{All values as OKLCH or hex. Never as brand-name colors.}

TYPOGRAPHY
- Display/headings: {exact font family + weight + line-height + key constraint}
- Body: {exact font family + weight + line-height}
{Per-language constraints if multilingual.}

SPACING & LAYOUT
{1-2 sentences on density. Mention specific values: section padding, max-widths, grid columns.}

INTERACTION & MOTION
{Bullet list of motion language: hover effects, scroll behaviors, transitions. Reference exact CSS animation keyframes if extracted.}
- Always honor @media (prefers-reduced-motion: reduce).

VOICE & TONE (if copy will be generated)
{1-2 sentences on writing style + audience. Include 2-3 signature phrases the brand uses.}

PAGE STRUCTURE (if multi-section site)
{Section order as a single line: Navbar -> Hero -> About -> Services -> Gallery -> Testimonials -> Contact -> Footer}

CONSTRAINTS
- {framework + version}
- {any hard constraint from the interview: WCAG, performance budget, no-JS-on-load, etc.}
- {RTL block goes here if applicable}

ANTI-PATTERNS (do not produce these)
- {1-3 anti-patterns from the interview}
{e.g. "no purple/orange gradients", "no glassmorphism", "no Stripe-clone hero with floating SaaS dashboard"}
```

## Hebrew/RTL block — REQUIRED if RTL detected

Append this verbatim inside the CONSTRAINTS section of Field 6:

```
HEBREW / RTL — MANDATORY
- Site is dir="rtl", lang="he". Use CSS logical properties only (inset-inline-start, margin-block-start) — NEVER left/right or top/bottom margin.
- Never apply letter-spacing to Hebrew text (breaks letter connections).
- Never use italic or uppercase on Hebrew text — Hebrew has no case distinction and renders italic poorly.
- Headings line-height: 1.4 (Hebrew needs more vertical room than English).
- Frank Ruhl Libre and Heebo are common Hebrew/Latin pairings; Assistant, Rubik, and Noto Sans Hebrew are also acceptable.
```

For Arabic: same rules, swap font names. Drop the letter-spacing rule for Arabic (Arabic shaping handles this differently — instead say "do not break Arabic letter shaping with `letter-spacing` or `text-decoration: line-through` on individual letters").
