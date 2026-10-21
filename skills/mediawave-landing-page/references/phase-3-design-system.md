# Phase 3: Design System Generation

## Reference Document for MediaWave Landing Page Pipeline

This phase transforms the approved design brief (from Phase 2) into a concrete, codeable design system. Every visual decision is tokenized and documented so that Phase 5 (build) has zero ambiguity.

---

## 1. Color Palette Generation

### Palette Structure

Every landing page needs these color categories:

```
PRIMARY          - Brand's main color, used for primary buttons, key accents
PRIMARY_LIGHT    - Lighter variant for hover states, backgrounds
PRIMARY_DARK     - Darker variant for active states, text on light bg

SECONDARY        - Supporting brand color, used for secondary elements
SECONDARY_LIGHT  - Background tints, cards
SECONDARY_DARK   - Text, borders

ACCENT           - Eye-catching contrast color for CTAs, badges, highlights
ACCENT_LIGHT     - Softer variant
ACCENT_DARK      - Emphasis variant

NEUTRAL_50       - Lightest (page background, typically near-white)
NEUTRAL_100      - Cards, elevated surfaces
NEUTRAL_200      - Borders, dividers
NEUTRAL_300      - Disabled elements, placeholders
NEUTRAL_400      - Secondary text, icons
NEUTRAL_500      - Body text (secondary)
NEUTRAL_600      - Body text (primary)
NEUTRAL_700      - Headings
NEUTRAL_800      - Darkest heading text
NEUTRAL_900      - Highest contrast text (if on light bg)

SUCCESS          - #16A34A range - confirmations, positive indicators
WARNING          - #F59E0B range - alerts, caution states
ERROR            - #DC2626 range - errors, destructive actions
INFO             - #2563EB range - informational messages
```

### Color Extraction Algorithm

1. **Start with the design brief's chosen references** from Phase 2
2. **Identify the dominant colors** from each reference (usually 2-3 per reference)
3. **Map to the client's industry** (see Phase 2 industry aesthetics)
4. **If the client has existing brand colors:** use those as primary, derive the rest
5. **If no brand colors exist:** propose a unique palette based on industry + references

### Color Generation Steps

```
Step 1: Choose PRIMARY
  - From brand guidelines, OR
  - Dominant color from top chosen reference, OR
  - Industry-appropriate starting hue

Step 2: Generate PRIMARY scale
  - PRIMARY_LIGHT: increase lightness by 20-30%, reduce saturation slightly
  - PRIMARY_DARK: decrease lightness by 15-25%, increase saturation slightly

Step 3: Choose SECONDARY
  - Analogous: 30-60 degrees from primary on color wheel (harmonious)
  - Complementary: 180 degrees from primary (high contrast, use carefully)
  - Split-complementary: 150 or 210 degrees (balanced contrast)

Step 4: Choose ACCENT
  - Should POP against both primary and secondary
  - Often warm if primary is cool (and vice versa)
  - Used sparingly --- CTA buttons, badges, highlights only

Step 5: Generate NEUTRAL scale
  - Start with a slightly tinted gray (add tiny amount of primary hue)
  - Pure gray (#808080) feels cold and generic
  - Warm neutrals: add 2-5% of an orange/brown hue
  - Cool neutrals: add 2-5% of the primary blue/green hue
  - Generate 50-900 scale using consistent lightness steps

Step 6: Assign SEMANTIC colors
  - Keep standard green/yellow/red/blue for semantic meaning
  - Optionally tint them slightly toward the primary hue for cohesion
```

### Accessibility Color Requirements

- **Text on backgrounds:** minimum 4.5:1 contrast ratio (WCAG AA)
- **Large text (18px+):** minimum 3:1 contrast ratio
- **Interactive elements:** minimum 3:1 against adjacent colors
- **Test every combination** that will be used (heading on bg, body on card, button text on button bg)
- **Tool:** Use the WCAG contrast ratio formula or reference a contrast checker

```
Contrast Ratio Formula:
(L1 + 0.05) / (L2 + 0.05)
Where L1 = lighter color relative luminance, L2 = darker
```

---

## 2. Typography Scale for Hebrew

### Hebrew-First Font Selection

**Display / Heading Fonts (for impact):**

| Font | Character | Best For | Weight Range |
|------|-----------|----------|--------------|
| **Secular One** | Bold, condensed, high impact | Headlines, hero text | 400 only |
| **Karantina** | Decorative, strong personality | Display text, special elements | 300, 400, 700 |
| **Rubik** | Geometric, modern, versatile | Headings + body (flexible) | 300-900 |
| **Heebo** | Clean, professional, neutral | Corporate, medical, legal | 100-900 |
| **Assistant** | Friendly, rounded, approachable | Education, food, wellness | 200-800 |

**Body / Reading Fonts (for readability):**

| Font | Character | Best For | Weight Range |
|------|-----------|----------|--------------|
| **Heebo** | Clean, excellent readability | General purpose body text | 100-900 |
| **Rubik** | Slightly rounded, friendly | Approachable brands | 300-900 |
| **Noto Sans Hebrew** | Neutral, universal | Multi-language content | 100-900 |
| **Assistant** | Soft, readable | Casual / friendly brands | 200-800 |
| **Alef** | Traditional, bookish | Content-heavy pages | 400, 700 |

### Font Pairing Rules

**Rule 1: Contrast in Style, Harmony in Feeling**
- Pair a display/decorative heading font with a clean body font
- Both fonts should convey the same brand feeling (e.g., both modern, or both warm)

**Rule 2: Hebrew + English Pairing**
When the page has mixed Hebrew and English content (common for brand names, tech terms):

```
Hebrew Heading:  Secular One
English Heading: Paired with a bold sans-serif (e.g., Outfit, DM Sans)

Hebrew Body:     Heebo
English Body:    Paired with Inter, DM Sans, or similar x-height match

Hebrew Display:  Karantina
English Display: Paired with a display font of similar weight/character
```

**Rule 3: Maximum 2 Font Families**
- One for headings (can be same family, just bolder weight)
- One for body
- Exception: a third "accent" font for special elements (e.g., handwritten for a food brand)

**Rule 4: Weight Pairing**
```
Heading:  700 or 800 (bold)
Subhead:  600 (semi-bold)
Body:     400 (regular)
Caption:  400 (regular, smaller size)
Button:   600 or 700 (semi-bold to bold)
```

### Hebrew-Specific Typography Rules

**Font Size: 10% Larger for Hebrew Buttons and Headings**
Hebrew characters are visually denser than Latin characters at the same font size. To achieve equivalent visual impact:
- Buttons: if English would be 16px, Hebrew should be 17-18px
- H1: if English would be 48px, Hebrew should be 52-54px
- H2: if English would be 36px, Hebrew should be 40px
- Body text: same size is usually fine (16px)

**Line Height for Hebrew**
- Body text: 1.7-1.8 (more than English standard of 1.5-1.6)
- Headings: 1.2-1.3 (can be tighter since headings are short)
- Buttons: 1.2 (single line)

**Letter Spacing for Hebrew**
- Body text: 0 (NEVER add letter-spacing to Hebrew body text)
- Headings: 0 or -0.01em maximum (very slight tightening is OK for large display)
- NEVER use wide tracking (letter-spacing > 0.05em) on Hebrew --- it breaks readability

**Paragraph Width**
- Optimal: 55-70 characters per line
- Max-width for body text containers: 680px-720px

### Type Scale

Use a modular scale based on a ratio. Recommended: **1.25 (Major Third)** for landing pages.

```
text-xs:    12px  / 0.75rem   - Fine print, labels
text-sm:    14px  / 0.875rem  - Captions, metadata
text-base:  16px  / 1rem      - Body text (Hebrew base)
text-lg:    18px  / 1.125rem  - Lead paragraphs, large body
text-xl:    20px  / 1.25rem   - Small headings, subtitles
text-2xl:   24px  / 1.5rem    - H4 equivalent
text-3xl:   30px  / 1.875rem  - H3 equivalent
text-4xl:   36px  / 2.25rem   - H2 equivalent (Hebrew: 40px)
text-5xl:   48px  / 3rem      - H1 equivalent (Hebrew: 54px)
text-6xl:   60px  / 3.75rem   - Hero display (Hebrew: 66px)
text-7xl:   72px  / 4.5rem    - Large hero display (Hebrew: 80px)
```

---

## 3. Spacing Scale

### Base Unit: 4px

All spacing values are multiples of 4px. This creates visual rhythm and consistency.

```
space-0:    0px
space-0.5:  2px    - Micro adjustments (icon gaps)
space-1:    4px    - Tightest spacing (inline elements)
space-2:    8px    - Small gaps (between icon and label)
space-3:    12px   - Medium-small (input padding, card padding mobile)
space-4:    16px   - Base spacing (paragraph margins, button padding)
space-6:    24px   - Section sub-spacing
space-8:    32px   - Card padding, form field gaps
space-12:   48px   - Section padding mobile
space-16:   64px   - Section padding tablet
space-24:   96px   - Section padding desktop
space-32:   128px  - Large section separation
```

### Usage Guidelines

```
Component Internal Padding:
  - Buttons:     space-3 (12px) vertical, space-6 (24px) horizontal
  - Cards:       space-6 (24px) to space-8 (32px)
  - Inputs:      space-3 (12px) vertical, space-4 (16px) horizontal
  - Badges:      space-1 (4px) vertical, space-2 (8px) horizontal

Between Elements:
  - Related items:     space-2 (8px) to space-4 (16px)
  - Unrelated items:   space-6 (24px) to space-8 (32px)
  - Section heading to content: space-4 (16px) to space-6 (24px)

Section Spacing (vertical padding):
  - Mobile:   space-12 (48px) to space-16 (64px)
  - Tablet:   space-16 (64px) to space-24 (96px)
  - Desktop:  space-24 (96px) to space-32 (128px)
```

---

## 4. Border Radius Tokens

```
radius-none:   0px      - Sharp corners (legal, corporate, editorial)
radius-sm:     4px      - Subtle rounding (inputs, small cards)
radius-md:     8px      - Standard rounding (cards, buttons)
radius-lg:     12px     - Pronounced rounding (feature cards, modals)
radius-xl:     16px     - Soft rounding (hero cards, images)
radius-2xl:    24px     - Very soft (badges, pills, floating elements)
radius-full:   9999px   - Pill shape (buttons, tags, avatars)
```

### Choosing a Radius Strategy
- **Sharp (0-4px):** Professional, editorial, high-end --- law, finance, luxury
- **Standard (6-8px):** Modern, balanced --- most businesses
- **Soft (12-16px):** Friendly, approachable --- food, wellness, education
- **Round (20px+):** Playful, casual --- not appropriate for most service businesses

**Rule:** Pick ONE radius strategy and be consistent. Do not mix sharp cards with round buttons.

---

## 5. Shadow Tokens

```
shadow-none:   none
shadow-xs:     0 1px 2px rgba(0,0,0,0.05)
shadow-sm:     0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
shadow-md:     0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)
shadow-lg:     0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
shadow-xl:     0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)
shadow-2xl:    0 25px 50px rgba(0,0,0,0.15)
shadow-inner:  inset 0 2px 4px rgba(0,0,0,0.06)
```

### Colored Shadows (Brand Touch)
Instead of pure black shadows, tint them with the primary color:

```
shadow-primary: 0 10px 30px rgba([primary-rgb], 0.2)
shadow-accent:  0 10px 30px rgba([accent-rgb], 0.2)
```

This adds a subtle brand-consistent glow to elevated elements.

---

## 6. Transition Tokens

```
transition-none:     none
transition-fast:     150ms ease-out    - Micro interactions (hover, focus)
transition-base:     200ms ease-out    - Standard transitions (color changes)
transition-moderate: 300ms ease-out    - Element transforms (scale, translate)
transition-slow:     500ms ease-out    - Layout changes (accordion open/close)
transition-slower:   700ms ease-out    - Page-level transitions
```

### Easing Functions
```
ease-default:    cubic-bezier(0.4, 0, 0.2, 1)   - General purpose
ease-in:         cubic-bezier(0.4, 0, 1, 1)      - Elements entering
ease-out:        cubic-bezier(0, 0, 0.2, 1)      - Elements exiting
ease-bounce:     cubic-bezier(0.34, 1.56, 0.64, 1) - Playful bounce
```

---

## 7. Tailwind CSS 4 Configuration Output

The design system MUST be output as a Tailwind CSS 4 compatible configuration.

### tailwind.config.ts Theme Extension

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#[PRIMARY]',
          light: '#[PRIMARY_LIGHT]',
          dark: '#[PRIMARY_DARK]',
          50: '#[lightest]',
          100: '#[...]',
          200: '#[...]',
          300: '#[...]',
          400: '#[...]',
          500: '#[PRIMARY]',
          600: '#[...]',
          700: '#[...]',
          800: '#[...]',
          900: '#[darkest]',
        },
        secondary: {
          DEFAULT: '#[SECONDARY]',
          light: '#[SECONDARY_LIGHT]',
          dark: '#[SECONDARY_DARK]',
        },
        accent: {
          DEFAULT: '#[ACCENT]',
          light: '#[ACCENT_LIGHT]',
          dark: '#[ACCENT_DARK]',
        },
        neutral: {
          50: '#[NEUTRAL_50]',
          100: '#[NEUTRAL_100]',
          200: '#[NEUTRAL_200]',
          300: '#[NEUTRAL_300]',
          400: '#[NEUTRAL_400]',
          500: '#[NEUTRAL_500]',
          600: '#[NEUTRAL_600]',
          700: '#[NEUTRAL_700]',
          800: '#[NEUTRAL_800]',
          900: '#[NEUTRAL_900]',
        },
        success: '#[SUCCESS]',
        warning: '#[WARNING]',
        error: '#[ERROR]',
        info: '#[INFO]',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'], // optional accent font
      },
      fontSize: {
        // Hebrew-adjusted scale
        'hero': ['3.75rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'h1': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'h2': ['2.25rem', { lineHeight: '1.25' }],
        'h3': ['1.875rem', { lineHeight: '1.3' }],
        'h4': ['1.5rem', { lineHeight: '1.35' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75' }],
        'body': ['1rem', { lineHeight: '1.75' }],
        'body-sm': ['0.875rem', { lineHeight: '1.7' }],
        'caption': ['0.75rem', { lineHeight: '1.6' }],
      },
      spacing: {
        // Additional custom spacing if needed beyond Tailwind defaults
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'brand': '[CHOSEN_RADIUS]', // e.g., '8px' or '12px'
      },
      boxShadow: {
        'brand': '0 10px 30px rgba([primary-rgb], 0.15)',
        'card': '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)',
        'card-hover': '0 10px 20px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.06)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'moderate': '300ms',
        'slow': '500ms',
      },
      keyframes: {
        // Custom animations defined per project
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
```

### CSS Variables (in globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: [PRIMARY];
    --color-secondary: [SECONDARY];
    --color-accent: [ACCENT];
    --color-background: [NEUTRAL_50];
    --color-foreground: [NEUTRAL_800];

    --font-heading: '[Heading Font Name]', sans-serif;
    --font-body: '[Body Font Name]', sans-serif;

    --radius-brand: [chosen radius];
  }

  html {
    direction: rtl;
    scroll-behavior: smooth;
  }

  body {
    font-family: var(--font-body);
    color: var(--color-foreground);
    background-color: var(--color-background);
    line-height: 1.75;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    line-height: 1.2;
    letter-spacing: -0.01em;
  }
}
```

---

## 8. Component Patterns

### Hero Section Variants

**Variant 1: Centered Hero**
```
[Background: full-width color or image]
  [Container: centered, max-w-4xl]
    [Badge/Tag: small colored pill]
    [H1: large display heading]
    [Subhead: 1-2 sentence value proposition]
    [CTA Button Group: primary + secondary ghost]
    [Social Proof: logos or review stars]
```

**Variant 2: Split Hero (Image + Text)**
```
[Grid: 2 columns, gap-12]
  [Right Column (RTL first): text content]
    [H1 + Subhead + CTA]
  [Left Column: image or illustration]
```

**Variant 3: Hero with Background Media**
```
[Full-viewport background image/video]
  [Overlay: gradient or semi-transparent]
    [Centered content: H1 + CTA]
```

### Features Grid
```
[Section: bg-neutral-50 or bg-white]
  [Section Header: centered H2 + subtitle]
  [Grid: 2-col mobile, 3-col desktop, gap-8]
    [Feature Card] x6
      [Icon: custom or branded]
      [Title: font-heading, text-xl]
      [Description: text-body-sm, text-neutral-500]
```

### Testimonials Carousel
```
[Section: bg-primary-50 or bg-white]
  [Section Header]
  [Carousel Container]
    [Testimonial Card]
      [Quote text: text-lg, italic or with quotation marks]
      [Author: name + title + photo]
      [Star rating: if applicable]
  [Navigation: dots or arrows]
```

### CTA Section
```
[Section: bg-primary or bg-accent, text-white]
  [Container: centered, max-w-3xl]
    [Heading: compelling action statement]
    [Subtext: reinforce value, reduce friction]
    [CTA Button: large, contrasting color]
    [Trust element: "No obligation" or "Free consultation"]
```

### FAQ Accordion
```
[Section: bg-white]
  [Section Header: "שאלות נפוצות"]
  [Accordion Container: max-w-3xl, centered]
    [FAQ Item] x5-8
      [Question: font-heading, clickable, with +/- icon]
      [Answer: font-body, collapsible, with smooth transition]
```

### Contact Form
```
[Section: bg-neutral-50]
  [Grid: 2 columns]
    [Right (RTL): form]
      [Name input]
      [Phone input]
      [Email input (optional)]
      [Message textarea]
      [Submit button: full-width or auto, primary color]
    [Left: contact info + map or image]
      [Phone number]
      [Email]
      [Address]
      [Business hours]
```

### Footer
```
[Footer: bg-neutral-800 or bg-neutral-900, text-white]
  [Grid: 3-4 columns]
    [Column 1: logo + short description]
    [Column 2: navigation links]
    [Column 3: contact info]
    [Column 4: social media icons]
  [Bottom bar: copyright + privacy + terms]
```

---

## 9. Motion / Animation Guidelines

### Core Principles

1. **Purposeful, not decorative.** Every animation must serve a UX purpose:
   - Communicate state change
   - Guide attention
   - Provide feedback
   - Smooth transitions between states

2. **Subtle by default.** Most animations should be nearly invisible --- the user should feel the smoothness without consciously noticing animations.

3. **Performance first.** Only animate `transform` and `opacity` (GPU-accelerated). Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`.

### Recommended Animations

| Element | Animation | Duration | Trigger |
|---------|-----------|----------|---------|
| Cards on scroll | Fade in + slight translateY (10-20px) | 400-600ms | Intersection Observer |
| Buttons on hover | Scale 1.02 + shadow increase | 150ms | Hover |
| Mobile menu | Slide in from right (RTL) | 300ms | Toggle |
| FAQ accordion | Height auto + opacity | 300ms | Click |
| Form success | Fade in + scale from 0.95 | 300ms | Submit response |
| Hero text | Stagger fade in (children) | 400ms each, 100ms delay | Page load |
| Numbers/stats | Count up animation | 1000ms | Intersection Observer |

### What NOT to Animate
- Do NOT use generic "fade-in-up on every element" scroll animations (this is the #1 cliche)
- Do NOT animate more than 3 elements simultaneously on scroll
- Do NOT use parallax scrolling unless specifically requested
- Do NOT add loading animations to a static landing page
- Do NOT use bounce effects on professional/corporate sites
- Do NOT animate text color changes
- Reduce motion for `prefers-reduced-motion: reduce` users

### Scroll Animation Implementation
```typescript
// Use Intersection Observer, NOT scroll event listeners
// Trigger animations when elements enter viewport
// Add stagger delays for grouped elements (100-150ms between items)
// Use will-change: transform on elements that will animate (sparingly)
```

---

## 10. Anti-Generic Checklist

Before finalizing the design system, verify:

- [ ] **Colors:** Not default Tailwind blue/indigo/violet. Custom palette derived from brand/industry
- [ ] **Fonts:** Not Inter or Roboto. Hebrew-first font selection that matches brand personality
- [ ] **Shadows:** Not default Tailwind shadows. Custom shadow with brand color tint
- [ ] **Radius:** Consistent radius strategy (not mixing sharp and round randomly)
- [ ] **Spacing:** Generous and intentional (not cramped default spacing)
- [ ] **Animations:** Purposeful and subtle (not "animate everything on scroll")
- [ ] **Icons:** Consistent icon set with matching style (not mixing different icon libraries)
- [ ] **Imagery direction:** Defined (client photos, illustration style, or curated stock approach)
- [ ] **The system feels unique:** If you removed the logo, you could still tell which brand this is

---

## 11. Design System Documentation (design-system.md)

Output file: `design-system.md` in the project root.

```markdown
# Design System: [Client Name]

## Colors

### Brand Colors
| Token | Hex | Usage |
|-------|-----|-------|
| primary | #xxx | Primary buttons, key accents |
| primary-light | #xxx | Hover states, light backgrounds |
| primary-dark | #xxx | Active states, dark text |
| secondary | #xxx | Secondary elements |
| accent | #xxx | CTAs, highlights, badges |

### Neutral Scale
| Token | Hex | Usage |
|-------|-----|-------|
| neutral-50 | #xxx | Page background |
| neutral-100 | #xxx | Card backgrounds |
| ... | ... | ... |
| neutral-900 | #xxx | Heading text |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| success | #xxx | Confirmations |
| warning | #xxx | Alerts |
| error | #xxx | Errors |
| info | #xxx | Information |

### Contrast Verification
| Combination | Ratio | Pass/Fail |
|-------------|-------|-----------|
| neutral-800 on neutral-50 | X:1 | PASS AA |
| white on primary | X:1 | PASS AA |
| white on accent | X:1 | PASS AA |
| neutral-500 on neutral-50 | X:1 | PASS/FAIL AA |

## Typography

### Fonts
- **Heading:** [Font Name] (weights: 600, 700, 800)
- **Body:** [Font Name] (weights: 400, 500, 600)
- **Display:** [Font Name] (weight: 700) - optional

### Scale
| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| hero | 60px | 1.15 | Hero heading |
| h1 | 48px | 1.2 | Page title |
| h2 | 36px | 1.25 | Section title |
| h3 | 30px | 1.3 | Sub-section |
| h4 | 24px | 1.35 | Card title |
| body-lg | 18px | 1.75 | Lead paragraphs |
| body | 16px | 1.75 | Body text |
| body-sm | 14px | 1.7 | Secondary text |
| caption | 12px | 1.6 | Labels, fine print |

## Spacing
[4px base unit scale documentation]

## Components
[Brief description of each component pattern used]

## Animations
[List of approved animations and their triggers]
```

---

## 12. Approval Gate

Before proceeding to Phase 4 (Copy), present the design system to the operator via AskUserQuestion:

```
Design system generated for [Client Name]:

Colors:
  - Primary: [hex] [visual swatch description]
  - Secondary: [hex]
  - Accent: [hex]

Typography:
  - Headings: [Font Name]
  - Body: [Font Name]

Style:
  - Border radius: [description]
  - Shadows: [description]
  - Animation approach: [description]

Component sections planned:
1. [Hero variant]
2. [Features]
3. [Testimonials]
4. [CTA]
5. [FAQ]
6. [Contact]
7. [Footer]

Does this design system match the vision? Any adjustments needed before we move to copywriting?
```

---

## Phase 3 Checklist

- [ ] Color palette generated with all categories (primary, secondary, accent, neutral, semantic)
- [ ] All color combinations tested for WCAG AA contrast (4.5:1 minimum)
- [ ] Hebrew-first fonts selected (heading + body, with English pairings if needed)
- [ ] Typography scale defined with Hebrew adjustments (10% larger headings/buttons)
- [ ] Spacing scale documented (4px base unit)
- [ ] Border radius strategy chosen and consistent
- [ ] Shadow tokens defined (with brand-tinted variants)
- [ ] Transition/animation tokens defined
- [ ] Component patterns selected for the landing page sections
- [ ] Motion guidelines established (purposeful, not generic)
- [ ] Anti-generic checklist passed
- [ ] design-system.md created with full documentation
- [ ] tailwind.config.ts theme extension generated
- [ ] globals.css with CSS variables and base styles generated
- [ ] Operator approved the design system via AskUserQuestion
- [ ] Ready to proceed to Phase 4: Copywriting
