# Anti-Patterns Reference -- What NOT To Do

This is the consolidated list of design, code, motion, RTL, and prompting anti-patterns. Use this as a negative-space guide: avoiding these mistakes is half the battle.

---

## Visual Anti-Patterns

| AI Slop (NEVER do this)                  | Better Alternative                                        |
|------------------------------------------|-----------------------------------------------------------|
| Inter / Roboto / Arial as primary font   | Project-specific font pair (display + body)               |
| Purple gradient hero section             | Bold monochromatic or complementary color scheme          |
| 3 equal cards in a row                   | Asymmetric layout with size hierarchy (1 large + 2 small) |
| Rounded rectangles on everything         | Mix sharp edges + rounded based on element intent         |
| Gray placeholder content                 | Real or realistic content from day one                    |
| Uniform spacing throughout               | Dramatic whitespace variation (tight groups, generous gaps)|
| Generic stock icons (Heroicons defaults) | Custom or curated icon set matching brand personality     |
| White background as default              | Textured, tinted, dark, or atmospheric backgrounds        |
| Gray text on colored backgrounds         | Proper contrast with tinted neutrals matching the palette |
| Everything wrapped in card containers    | Let content breathe, use fewer containers                 |
| Centered everything                      | Asymmetric alignment creates visual interest and tension  |
| Default `shadow-md` on all cards         | Purpose-driven elevation system (0, 1, 2 levels max)     |
| Blue links on everything                 | Accent-colored links matching the site palette            |
| Gradient text on headings                | Solid color with weight/size contrast for impact          |
| Full-width sections stacked identically  | Varied section widths, breakouts, and edge-to-edge rhythm |
| Cookie-cutter testimonial layouts        | Pull quotes with distinctive typography treatment         |
| Hamburger menu on desktop                | Visible navigation with intentional layout                |

---

## Code Anti-Patterns

### Hardcoded Color Values
```css
/* NEVER */
color: #4A4A4A;
background: #F5A623;

/* ALWAYS -- use CSS custom properties or design tokens */
color: var(--color-text-primary);
background: var(--color-accent);
```

### Inline Styles
```tsx
/* NEVER */
<div style={{ marginLeft: '16px', backgroundColor: '#fff' }}>

/* ALWAYS -- use Tailwind classes or CSS modules */
<div className="ms-4 bg-surface">
```

### Arbitrary Tailwind Values
```html
<!-- NEVER -- magic numbers with no design rationale -->
<div class="w-[347px] mt-[13px] text-[17px]">

<!-- ALWAYS -- use design token scale values -->
<div class="w-80 mt-3 text-lg">
```

### `!important` Overrides
```css
/* NEVER -- fix the root cause instead */
.header { z-index: 9999 !important; }
.card { margin: 0 !important; }

/* ALWAYS -- fix specificity at the source */
.site-header { z-index: var(--z-header); }
.service-card { margin-block: var(--space-4); }
```

### Mixing CSS Units
```css
/* NEVER -- inconsistent units create unpredictable scaling */
padding: 12px;
margin: 1.5em;
font-size: 0.875rem;
gap: 20px;

/* ALWAYS -- stick to rem for sizing, use a consistent system */
padding: 0.75rem;
margin: 1.5rem;
font-size: 0.875rem;
gap: 1.25rem;
```

### Div Soup
```tsx
/* NEVER -- meaningless wrapper elements */
<div className="wrapper">
  <div className="container">
    <div className="inner">
      <div className="content">
        <p>Text</p>
      </div>
    </div>
  </div>
</div>

/* ALWAYS -- semantic HTML with minimal nesting */
<section className="services">
  <p>Text</p>
</section>
```

---

## Motion Anti-Patterns

### Bounce/Elastic Easing on UI Elements
```tsx
// NEVER -- feels toy-like and unprofessional
transition: { type: "spring", bounce: 0.8 }

// BETTER -- subtle spring for organic feel, or cubic-bezier for precision
transition: { type: "spring", stiffness: 300, damping: 30 }
transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
```

### Animations Longer Than 0.6s for UI Interactions
```tsx
// NEVER -- user waits for the animation to finish
transition: { duration: 1.5 }  // button hover
transition: { duration: 2.0 }  // dropdown open

// BETTER -- snappy interactions, longer for reveals
transition: { duration: 0.2 }  // button hover
transition: { duration: 0.3 }  // dropdown open
transition: { duration: 0.6 }  // section scroll reveal (acceptable)
```

### Animating Width/Height
```tsx
// NEVER -- triggers expensive layout recalculations
animate={{ width: '100%', height: 200 }}

// ALWAYS -- use transform for performance
animate={{ scale: 1, opacity: 1 }}
// Or use CSS clip-path for reveal effects
```

### Animation on Everything
```tsx
// NEVER -- motion sickness and performance degradation
{allElements.map(el => (
  <motion.div animate={{ ... }}>{el}</motion.div>  // 50 animated elements
))}

// BETTER -- animate key moments only
// Hero entrance, section reveals, interactive feedback
// Static by default, animated by exception
```

### Linear Easing for UI
```tsx
// NEVER -- feels robotic and unnatural for UI transitions
transition: { ease: "linear" }

// Linear is ONLY acceptable for:
// - Loading spinners
// - Continuous marquee/ticker animations
// - Progress bar fills

// ALWAYS for UI -- use easeOut (entering), easeIn (exiting), or easeInOut
transition: { ease: "easeOut" }
```

### No Reduced Motion Support
```tsx
// NEVER -- ship without respecting user preferences

// ALWAYS -- include reduced motion handling
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Framer Motion: use the built-in hook
import { useReducedMotion } from 'framer-motion';
```

---

## RTL Anti-Patterns

### Physical CSS Properties
```css
/* NEVER in RTL projects */
margin-left: 1rem;
padding-right: 2rem;
left: 0;
text-align: left;
border-right: 1px solid;

/* ALWAYS */
margin-inline-start: 1rem;
padding-inline-end: 2rem;
inset-inline-start: 0;
text-align: start;
border-inline-end: 1px solid;
```

### Letter-Spacing on Hebrew
```css
/* NEVER -- disconnects Hebrew letters, making words unreadable */
h1 { letter-spacing: 0.05em; }

/* If spacing is needed, use word-spacing instead */
h1 { word-spacing: 0.1em; }
```

### Italic Hebrew Text
```css
/* NEVER -- renders poorly in Hebrew */
em { font-style: italic; }

/* ALWAYS -- use weight or color for emphasis */
em { font-weight: 700; }
em { color: var(--color-accent); }
```

### Hardcoded Directional Positioning
```css
/* NEVER */
.sidebar { position: fixed; left: 0; }
.close-btn { position: absolute; right: 8px; top: 8px; }

/* ALWAYS */
.sidebar { position: fixed; inset-inline-start: 0; }
.close-btn { position: absolute; inset-inline-end: 8px; inset-block-start: 8px; }
```

### Animations Entering from the Wrong Side
```tsx
// NEVER in RTL -- elements sliding in from the left
initial={{ x: -30, opacity: 0 }}

// ALWAYS in RTL -- elements enter from the right
initial={{ x: 30, opacity: 0 }}
```

---

## Prompting Anti-Patterns

What NOT to say to Claude when requesting design/code work:

| Bad Prompt                              | Why It Fails                              | Better Prompt                                                  |
|-----------------------------------------|-------------------------------------------|----------------------------------------------------------------|
| "Make it look better"                   | Too vague, no direction                   | "Increase heading size to 3xl, add 2rem gap between cards"     |
| "Be creative with the design"           | Triggers generic "creative" aesthetics    | "Use asymmetric layout with one hero card and two small cards"  |
| "Just do it"                            | No constraints or scope                   | "Add a hover scale effect to the service cards, duration 0.2s" |
| "Fix all the CSS"                       | Unbounded, unclear priority               | "Fix the spacing in the Services section cards on mobile"       |
| Pasting 500-line error logs             | Wastes context window                     | Extract the relevant 5-10 lines and the error message           |
| "Make it more modern"                   | Subjective, means nothing specific        | "Replace the box shadows with subtle borders, use 2024 font"   |
| "Add some animations"                   | No specification of where or what kind    | "Add staggered fade-in on scroll for the 4 feature cards"       |
| "Make the colors pop"                   | Undefined and taste-dependent             | "Change the accent from muted orange to vibrant #F5A623"        |
| "It should work on all devices"         | Too broad to act on                       | "Ensure the nav collapses to hamburger below 768px"             |
| "Copy this site exactly"               | Copyright issues, wrong approach          | "Use a similar layout structure with our own typography/colors" |

---

## Performance Anti-Patterns (2026)

| Anti-Pattern | Better Alternative |
|---|---|
| Using JS scroll library for scroll animations | CSS `animation-timeline: scroll()` — 45KB+ savings |
| Popper.js / Floating UI for tooltips | CSS anchor positioning — 4 lines of CSS |
| Masonry.js for Pinterest layouts | CSS Grid Lanes (`display: grid-lanes`) — zero JS; feature-detect, still experimental outside Safari |
| Multiple static font files per weight | Variable fonts — single file, all weights |
| Synchronous third-party scripts | `defer` or load after first interaction |
| Full SPA with no SSR, expecting LCP < 2.5s | SSR (Next.js) or Islands (Astro) for content sites |
| Bundle everything together | Code-split by route with `lazy()` + `Suspense` |
| Loading all images eagerly | `loading="lazy"` + `fetchpriority="high"` on LCP |
| JPEG/PNG images | AVIF > WebP with `<picture>` fallback |
| Google Fonts CDN (extra DNS lookup) | Self-host, subset, preload critical fonts |

---

## AI Tool Anti-Patterns

| Anti-Pattern | Better Alternative |
|---|---|
| Accepting Claude's first design output | Run `/evaluate-design` and iterate until score >= 70 |
| "Make it look better" as feedback | Be specific: "Increase heading to 3xl, add 2rem gap" |
| Letting context window bloat past 80% | Document & Clear: save progress, `/clear`, reload |
| Using `/compact` as primary strategy | Document & Clear preserves more detail |
| Skipping visual verification | Use Chrome/Playwright MCP to screenshot at 3 breakpoints |
| No aesthetic direction before coding | Run `/design-intake` or write `<frontend_aesthetics>` block |
| Using v0/Bolt output as-is | Treat AI-generated UI as scaffolding, run through `/progressive-refine` |

---

## CSS 2026 Anti-Patterns

| Anti-Pattern | Better Alternative |
|---|---|
| `margin-left` / `padding-right` | `margin-inline-start` / `padding-inline-end` (RTL-safe) |
| Deeply nested `:has()` selectors | Keep `:has()` scoped — use direct child combinators |
| `@scope` without lower boundary | Always define the scope range with `to` where applicable |
| Overusing CSS nesting (5+ levels) | Max 3 levels deep — same rule as Sass |
| `scroll-timeline` without fallback | Wrap in `@supports (animation-timeline: view())` |
| Anchor positioning without fallback | Use `position-try-fallbacks` for repositioning |