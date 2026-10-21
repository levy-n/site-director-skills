# Typography System Reference

## Font Ban List

The following fonts are BANNED as primary typefaces in any project:

| Font | Reason |
|------|--------|
| Inter | Default of every AI tool, Figma, and template. Distributional convergence — using Inter signals "I let the tool choose." |
| Roboto | Android system font. Ubiquitous to the point of invisibility. Zero personality. |
| Arial | The Helvetica knockoff that ships with Windows. Screams "I didn't choose a font." |
| Open Sans | The Google Docs default. Corporate blandness distilled into a typeface. |
| system-ui / sans-serif (as primary) | Abdication of design responsibility. Acceptable ONLY as final fallback. |
| Lato | Overused in 2015-era templates. Still haunts Bootstrap sites. |
| Montserrat | The "geometric sans that isn't Inter" — but equally overused in AI-generated designs. |

**WHY this matters**: When every AI model defaults to the same 5 fonts, the output becomes
statistically indistinguishable. This is distributional convergence: models trained on the same
data produce the same outputs. Typography is the single highest-signal indicator of whether a
human designer made intentional choices. A distinctive font immediately separates your work
from the 10 million Inter+Tailwind sites generated this year. If a visitor can't tell whether
a human or GPT built the site, you have already failed.

---

## Recommended Fonts by Context

### Display / Headlines

| Font | Character | Best For | Weight Range |
|------|-----------|----------|--------------|
| Playfair Display | High-contrast transitional serif | Luxury, editorial, elegant brands | 400-900 |
| Clash Display | Geometric display sans with sharp terminals | Tech, bold statements, hero text | 200-700 |
| Cabinet Grotesk | Warm grotesque with subtle quirks | Startups, friendly-professional | 100-900 |
| Bricolage Grotesque | Variable with optical size axis | Large headlines, responsive display | 200-800 |
| Space Mono | Fixed-width with retro character | Developer tools, creative tech | 400, 700 |
| JetBrains Mono | Programmer ligatures, tall x-height | Code-adjacent branding, SaaS | 100-800 |
| DM Serif Display | Refined transitional with sharp serifs | Publishing, content platforms | 400, 400i |
| Fraunces | Variable "Old Style" with wonky axis | Organic brands, artisanal feel | 100-900 |
| Syne | Brutalist geometric with wide proportions | Bold creative, art direction | 400-800 |

### Body / Running Text

| Font | Character | Best For | Weight Range |
|------|-----------|----------|--------------|
| Satoshi | Modern geometric with humanist touches | SaaS, product UI, clean reads | 300-900 |
| General Sans | Versatile neo-grotesque | Professional sites, dashboards | 200-700 |
| Switzer | Swiss-inspired with warmth | Corporate-but-not-boring | 100-900 |
| Plus Jakarta Sans | Rounded terminals, friendly geometry | Consumer apps, friendly brands | 200-800 |
| Source Serif 4 | Variable serif with optical sizes | Long-form reading, editorial | 200-900 |

### Hebrew Display

| Font | Character | Best For | Source |
|------|-----------|----------|--------|
| Noa Shalev | Elegant calligraphic serif | Headlines, luxury Hebrew branding | Custom / local |
| Alef | Clean geometric, bilingual-ready | Modern Hebrew display, UI | Google Fonts |
| Frank Ruhl Libre | Classic didone serif | Editorial Hebrew, serious tone | Google Fonts |

### Hebrew Body

| Font | Character | Best For | Source |
|------|-----------|----------|--------|
| Heebo | Clean grotesque, excellent readability | Default Hebrew body text | Google Fonts |
| Rubik | Rounded corners, friendly geometry | Consumer apps, approachable | Google Fonts |
| Assistant | Wide proportions, open counters | UI text, dashboards | Google Fonts |
| Yarden | Handwritten warmth, organic feel | Friendly brands, personal tone | Custom / local |

### Monospace

| Font | Character | Best For |
|------|-----------|----------|
| JetBrains Mono | Ligatures, tall x-height | Code blocks, terminal UIs |
| Fira Code | Programming ligatures, Mozilla DNA | Developer documentation |
| IBM Plex Mono | Corporate precision, IBM heritage | Enterprise code, technical writing |

---

## Modular Type Scales

Use mathematical ratios to generate harmonious size progressions. Never pick font sizes
arbitrarily. Every size must be derivable from the base size multiplied by the ratio.

| Scale | Ratio | Character | Use Case |
|-------|-------|-----------|----------|
| Perfect Fourth | 1.333 | Moderate contrast | General websites, balanced hierarchy |
| Major Third | 1.25 | Subtle, refined | Dense UIs, dashboards, documentation |
| Golden Ratio | 1.618 | Dramatic contrast | Landing pages, editorial, hero-heavy layouts |

### Fluid Typography with clamp()

```css
/* Perfect Fourth scale (1.333) — fluid from 320px to 1440px viewport */
--fs-sm:   clamp(0.75rem,  0.7rem  + 0.25vw, 0.875rem);   /* 12-14px */
--fs-base: clamp(0.875rem, 0.8rem  + 0.4vw,  1.125rem);   /* 14-18px */
--fs-md:   clamp(1.125rem, 1rem    + 0.6vw,  1.5rem);     /* 18-24px */
--fs-lg:   clamp(1.5rem,   1.2rem  + 1.5vw,  2rem);       /* 24-32px */
--fs-xl:   clamp(2rem,     1.5rem  + 2.5vw,  3rem);       /* 32-48px */
--fs-2xl:  clamp(2.5rem,   1.8rem  + 3.5vw,  4.5rem);     /* 40-72px */
--fs-3xl:  clamp(3rem,     2rem    + 5vw,    6rem);        /* 48-96px */
```

The clamp() formula is: `clamp(min, preferred, max)` where preferred uses viewport units
for fluid scaling. Generate these with Utopia.fyi for precise control.

---

## Weight Contrast

### The Rule: Extreme or Nothing

Weight contrast must be DRAMATIC to register visually. Subtle weight differences (400 vs 600)
look like a rendering bug, not a design choice.

**BANNED**: 400 vs 500, 400 vs 600, 500 vs 700 — these are NOT contrast, they are ambiguity.

**USE**: 200 vs 800, 300 vs 900, 200 vs 700 — these create unmistakable hierarchy.

```css
/* BAD — ambiguous weight pairing */
h2 { font-weight: 600; }
p  { font-weight: 400; }
/* Result: "Is the heading bold? Or is the body light? I can't tell." */

/* GOOD — extreme weight contrast */
h2 { font-weight: 800; }
p  { font-weight: 300; }
/* Result: Instant visual hierarchy. No ambiguity. */

/* BEST — extralight eyebrow + black headline */
.eyebrow  { font-weight: 200; font-size: var(--fs-sm); text-transform: uppercase; letter-spacing: 0.1em; }
.headline { font-weight: 900; font-size: var(--fs-3xl); }
/* Result: The eyebrow whispers, the headline shouts. Tension creates interest. */
```

---

## Size Jumps

### The Rule: 3x Minimum for Hero Headlines

A heading that is 1.5x body size looks like slightly bigger body text. A heading that is 3-5x
body size creates undeniable visual hierarchy.

```
Body:     18px  (1rem)       — baseline
          ----
Subhead:  24px  (1.33x)     — subtle step, good for card titles
H3:       32px  (1.78x)     — moderate emphasis, section subheadings
H2:       48px  (2.67x)     — clear heading, section titles
H1:       72px  (4x)        — HERO level — minimum for real impact
Display:  96px  (5.33x)     — maximum drama, landing page hero
```

For hero sections, the display text should be AT LEAST 3.5x body size, ideally 4-6x.
Anything less and your hero looks like a paragraph with ambitions.

---

## Letter-spacing Rules

| Size Context | Letter-spacing | Reason |
|-------------|----------------|--------|
| Display (48px+) | -0.02em to -0.04em | Large text has too much optical spacing at default; tighten it |
| Headlines (24-48px) | -0.01em to -0.02em | Slight tightening improves word cohesion |
| Body (14-18px) | 0 (normal) | Body text is optimized by the type designer at this range |
| Small caps / Labels | +0.05em to +0.1em | Opens up small text, improves legibility of capitals |
| ALL-CAPS text | +0.05em to +0.15em | Uppercase removes ascender/descender cues; spacing compensates |

### CRITICAL: Hebrew Text

**NEVER apply negative letter-spacing to Hebrew text.** Hebrew letters connect contextually
and visually. Negative spacing causes:
- Letters to overlap and become unreadable
- Connected letter forms (ligatures) to break
- Rendering artifacts in browser engines

**NEVER apply positive letter-spacing to Hebrew body text either.** It disconnects letters
that should appear as a cohesive word unit. The only exception is very large display Hebrew
(64px+) where a tiny +0.01em to +0.02em may aid readability at extreme sizes.

```css
/* CORRECT approach for Hebrew */
.hebrew-headline { letter-spacing: normal; }
.hebrew-body     { letter-spacing: normal; }

/* WRONG — will break Hebrew rendering */
.hebrew-text     { letter-spacing: -0.02em; } /* NEVER */
.hebrew-text     { letter-spacing: 0.05em; }  /* NEVER on body */
```

---

## Pairing Rules

### Morphological Contrast Principle

Font pairings work when the two fonts are **structurally different** but share an underlying
proportion or rhythm. Pair across categories, never within the same category.

| Pairing Strategy | Example | Why It Works |
|-----------------|---------|--------------|
| Serif display + Sans body | Playfair Display + Satoshi | Maximum structural contrast, shared proportions |
| Geometric display + Humanist body | Clash Display + Source Serif 4 | Cold/warm tension creates visual interest |
| Monospace accent + Sans body | Space Mono + General Sans | Technical edge with readable body |
| Variable wonky + Clean sans | Fraunces + Plus Jakarta Sans | Personality in headlines, clarity in body |

**Design principle**: Typographic research consistently shows that readers perceive pairings
with high structural contrast and shared x-height proportions as more professional and
trustworthy than low-contrast pairings (e.g., two geometric sans fonts). The key is
morphological opposition — pair across structural categories (serif + sans, geometric + humanist)
while maintaining proportional harmony through matching x-heights and visual weight.

### Anti-Patterns

- **Two geometric sans-serifs** (Inter + Montserrat) — no contrast, looks like a mistake
- **Two high-contrast serifs** (Playfair + Didot) — competes for attention, reader confusion
- **Display font as body text** — unreadable at small sizes, defeats its purpose
- **More than 2 font families** on one page (3 max if monospace is needed for code blocks)

---

## Tools

| Tool | URL | Purpose |
|------|-----|---------|
| Fontjoy | https://fontjoy.com | AI-powered font pairing generator with contrast slider |
| Precise Type | https://precisetype.com | Visual type scale calculator |
| Utopia.fyi | https://utopia.fyi/type/calculator | Fluid type scale generator with clamp() output |
| Google Fonts | https://fonts.google.com | Font library with variable font support |
| Bunny Fonts | https://fonts.bunny.net | GDPR-compliant Google Fonts mirror (EU-hosted) |

### Google Fonts URL Patterns

```html
<!-- Single font with specific weights (Google Fonts) -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap" rel="stylesheet">

<!-- Multiple Google Fonts in one request (ampersand-separated) -->
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;700&family=Source+Serif+4:opsz,wght@8..60,200..900&display=swap" rel="stylesheet">

<!-- Variable font with full weight range (Google Fonts) -->
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900&display=swap" rel="stylesheet">
```

### Fontshare Fonts (Clash Display, Cabinet Grotesk, Satoshi, General Sans, Switzer)

These fonts are NOT on Google Fonts. Load them from Fontshare CDN:

```html
<!-- Fontshare — use the API link from each font's page at fontshare.com -->
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet">
```

---

## CSS Implementation

Complete custom properties pattern for a production typography system:

```css
:root {
  /* --- Font Families --- */
  --ff-display: 'Clash Display', 'Arial Black', sans-serif;
  --ff-body: 'Satoshi', 'Helvetica Neue', sans-serif;
  --ff-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --ff-hebrew-display: 'Noa Shalev', 'Frank Ruhl Libre', serif;
  --ff-hebrew-body: 'Heebo', 'Rubik', sans-serif;

  /* --- Fluid Type Scale (Perfect Fourth 1.333) --- */
  --fs-xs:   clamp(0.625rem, 0.6rem + 0.15vw, 0.75rem);
  --fs-sm:   clamp(0.75rem,  0.7rem + 0.25vw, 0.875rem);
  --fs-base: clamp(0.875rem, 0.8rem + 0.4vw,  1.125rem);
  --fs-md:   clamp(1.125rem, 1rem   + 0.6vw,  1.5rem);
  --fs-lg:   clamp(1.5rem,   1.2rem + 1.5vw,  2rem);
  --fs-xl:   clamp(2rem,     1.5rem + 2.5vw,  3rem);
  --fs-2xl:  clamp(2.5rem,   1.8rem + 3.5vw,  4.5rem);
  --fs-3xl:  clamp(3rem,     2rem   + 5vw,    6rem);

  /* --- Font Weights --- */
  --fw-light:    200;
  --fw-regular:  400;
  --fw-bold:     700;
  --fw-black:    900;

  /* --- Line Heights --- */
  --lh-tight:    1.1;   /* Display text */
  --lh-snug:     1.3;   /* Headlines */
  --lh-normal:   1.6;   /* Body text (Latin) */
  --lh-hebrew:   1.75;  /* Body text (Hebrew) — CRITICAL: never less than 1.7 */
  --lh-loose:    2.0;   /* Small text, captions */

  /* --- Letter Spacing --- */
  --ls-tight:    -0.03em;  /* Large display text */
  --ls-snug:     -0.01em;  /* Headlines */
  --ls-normal:   0;        /* Body text */
  --ls-wide:     0.05em;   /* Small caps, labels */
  --ls-caps:     0.1em;    /* All-caps text */
}

/* === Utility Classes === */

.text-display {
  font-family: var(--ff-display);
  font-size: var(--fs-3xl);
  font-weight: var(--fw-black);
  line-height: var(--lh-tight);
  letter-spacing: var(--ls-tight);
}

.text-heading {
  font-family: var(--ff-display);
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  line-height: var(--lh-snug);
  letter-spacing: var(--ls-snug);
}

.text-body {
  font-family: var(--ff-body);
  font-size: var(--fs-base);
  font-weight: var(--fw-regular);
  line-height: var(--lh-normal);
  letter-spacing: var(--ls-normal);
}

.text-label {
  font-family: var(--ff-body);
  font-size: var(--fs-sm);
  font-weight: var(--fw-bold);
  line-height: var(--lh-loose);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
}

/* === Hebrew Overrides === */

[lang="he"] .text-display,
[dir="rtl"] .text-display {
  font-family: var(--ff-hebrew-display);
  letter-spacing: normal;  /* NEVER adjust Hebrew letter-spacing */
}

[lang="he"] .text-body,
[dir="rtl"] .text-body {
  font-family: var(--ff-hebrew-body);
  line-height: var(--lh-hebrew);
  letter-spacing: normal;
}
```

---

## Hebrew-specific Typography

### Critical Rules

1. **NO ITALICS** — Hebrew has no italic tradition. Italic Hebrew looks broken, not emphasized.
   Use **bold weight** or **color change** for emphasis instead. CSS `font-style: italic` on
   Hebrew text is always wrong.

2. **Line-height: 1.7-1.8** — Hebrew characters are taller with more complex shapes. Standard
   Latin line-height (1.4-1.5) causes Hebrew lines to feel cramped and hard to scan.

3. **No text opacity on connected letters** — CSS `opacity` or `color: rgba()` with alpha on
   Hebrew text causes anti-aliasing artifacts where letter connections become visible seams.
   Use full-opacity colors and adjust the hex/hsl value itself for lighter appearances.

4. **No negative letter-spacing** — Hebrew letters share connecting strokes. Tightening spacing
   breaks these visual connections and reduces readability dramatically.

5. **Font size bump** — Hebrew fonts often appear 5-10% smaller than Latin fonts at the same
   pixel size due to different design conventions. Compensate by setting Hebrew body text
   0.5-1px larger than the equivalent Latin text.

### Recommended Foundry

**AlefAlefAlef** (https://www.alefalefalef.co.il/) is Israel's premier Hebrew type foundry.
Their catalog includes high-quality Hebrew typefaces designed for digital use, with proper
OpenType features and web font formats. Check their free and commercial offerings before
defaulting to Google Fonts Hebrew options. Notable typefaces: Karantina, Miri, Gan.

### Hebrew + Latin Pairing

When a page mixes Hebrew and Latin text, ensure both fonts share:
- Similar x-height proportions
- Compatible stroke contrast (both high-contrast or both low-contrast)
- Matching visual weight at the same CSS font-weight value

Tested pairings that work:
- Frank Ruhl Libre + Playfair Display (both high-contrast serifs)
- Heebo + Satoshi (both clean grotesques, matching x-heights)
- Rubik + Plus Jakarta Sans (both rounded, friendly, open counters)
- Assistant + General Sans (both wide proportions, neutral tone)
