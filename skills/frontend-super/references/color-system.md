# Color System Reference

## OKLCH Color Space

OKLCH is the preferred color space for modern design systems. Unlike hex, RGB, or HSL, OKLCH is **perceptually uniform** — a lightness value of 0.7 looks equally bright regardless of hue. HSL's "lightness" is a lie: `hsl(60, 100%, 50%)` (yellow) appears far brighter than `hsl(240, 100%, 50%)` (blue) despite identical L values.

**Syntax:**
```css
color: oklch(70% 0.15 250);
/*           L%   C    H   */
/* L: 0-100% lightness (perceptually uniform) */
/* C: 0-0.4  chroma (saturation intensity)    */
/* H: 0-360  hue angle                        */
```

**Why OKLCH wins:**
- Predictable lightness: adjust L and the perceived brightness changes linearly
- Consistent saturation: same chroma value = same visual intensity across hues
- Easy palette generation: rotate hue, keep L and C constant = harmonious colors
- Native CSS support: all modern browsers (Chrome 111+, Safari 15.4+, Firefox 113+)
- Graceful fallback: provide hex/hsl before the oklch declaration

---

## Palette Construction — 60/30/10 Rule

Every color palette follows a proportion hierarchy:

| Role | Ratio | Application | Example |
|------|-------|-------------|---------|
| **Dominant** | 60% | Backgrounds, large surfaces, body areas | `oklch(97% 0.01 80)` warm cream |
| **Secondary** | 30% | Cards, containers, navigation, supporting UI | `oklch(25% 0.02 260)` deep charcoal-blue |
| **Accent** | 10% | CTAs, highlights, focus rings, active states | `oklch(70% 0.18 45)` warm amber |

The 60% color is what users "feel" — it sets the emotional tone. The 30% provides structure and hierarchy. The 10% demands attention and drives action.

**Construction method:**
1. Pick your accent (10%) first — this is your brand's voice
2. Derive the dominant (60%) by dropping chroma to 0.005-0.015 and raising lightness to 92-98%
3. Build the secondary (30%) by dropping lightness to 20-35% and keeping very low chroma

---

## Tinted Neutrals

**NEVER use pure gray.** Pure gray (`#808080`, `gray-500`, `oklch(60% 0 0)`) is lifeless and disconnected from any palette. Always inject a subtle hue into your neutrals.

### Warm-tinted neutrals (toward orange/yellow, hue 60-90):
```css
--neutral-50:  oklch(97% 0.008 75);   /* barely-there warm cream  */
--neutral-100: oklch(94% 0.010 75);
--neutral-200: oklch(87% 0.010 75);
--neutral-300: oklch(78% 0.010 75);
--neutral-400: oklch(65% 0.008 75);
--neutral-500: oklch(55% 0.008 75);
--neutral-600: oklch(45% 0.008 75);
--neutral-700: oklch(35% 0.010 75);
--neutral-800: oklch(25% 0.012 75);
--neutral-900: oklch(18% 0.012 75);
--neutral-950: oklch(12% 0.010 75);
```

### Cool-tinted neutrals (toward blue, hue 250-270):
```css
--neutral-50:  oklch(97% 0.006 260);
--neutral-100: oklch(94% 0.008 260);
--neutral-200: oklch(87% 0.010 260);
--neutral-300: oklch(78% 0.010 260);
--neutral-400: oklch(65% 0.008 260);
--neutral-500: oklch(55% 0.008 260);
--neutral-600: oklch(45% 0.008 260);
--neutral-700: oklch(35% 0.012 260);
--neutral-800: oklch(25% 0.015 260);
--neutral-900: oklch(18% 0.015 260);
--neutral-950: oklch(12% 0.012 260);
```

The chroma range of **0.005 to 0.02** is the sweet spot — enough to feel connected to the palette, not enough to read as an obvious color.

---

## Techniques That Work

### Dark mode first
Design dark mode before light mode. Dark mode forces you to solve contrast, hierarchy, and surface layering up front. A design that works in dark mode almost always translates well to light. The reverse is not true.

### Monochromatic + one accent
Pick a single hue family for all neutrals and surfaces, then introduce ONE contrasting accent for interactive elements. This is the fastest path to sophisticated, cohesive design. Varying only lightness and chroma within one hue creates natural harmony.

### Complementary extremes
Pair hues that are roughly 180 degrees apart on the color wheel for maximum visual tension:
- Deep navy `oklch(25% 0.06 260)` + Electric orange `oklch(75% 0.18 55)`
- Forest green `oklch(30% 0.08 155)` + Coral `oklch(72% 0.16 25)`
- Midnight purple `oklch(22% 0.07 310)` + Lime gold `oklch(82% 0.15 100)`

Use the warm hue as accent (10%) and the cool hue in surfaces (30%).

### Surface layers
Build depth through a surface hierarchy system where each level is slightly lighter (light mode) or slightly brighter (dark mode):

```
bg       -> base page background
surface  -> cards, panels (L +3-5% from bg)
elevated -> dropdowns, modals (L +5-8% from bg)
overlay  -> tooltips, popovers (L +8-12% from bg)
```

---

## Anti-Pattern Colors

These are overused, generic, and signal "template" rather than "crafted":

| Anti-Pattern | Why It Fails |
|-------------|-------------|
| Purple-to-blue gradient heroes | Every AI/SaaS startup uses this. Invisible. |
| Purple gradients on white | The default "modern" look — now it means "generic" |
| Rainbow gradient buttons | Screams "no design direction" |
| Gray-on-white low-contrast text | Fails accessibility, looks washed out, lazy |
| Identical saturation across all colors | Flat, no hierarchy, everything competes equally |
| Neon green on dark (#00ff00) | Cliche "hacker" aesthetic, poor readability |
| Pure black (#000000) backgrounds | Harsh, unnatural. Use oklch(8-12% ...) instead |

---

## Contrast Requirements

### WCAG AA (minimum — always meet this):
- **Body text** (< 18px bold, < 24px regular): **4.5:1** contrast ratio
- **Large text** (>= 18px bold or >= 24px regular): **3:1** contrast ratio
- **UI components** (borders, icons, focus indicators): **3:1** contrast ratio

### WCAG AAA (target for body text):
- **Body text**: **7:1** contrast ratio

### Quick OKLCH contrast check:
A lightness difference of **>= 0.40** (40 percentage points) between text and background reliably meets AA for body text. For large text, **>= 0.30** is usually sufficient.

```
/* Example: AA-compliant pair */
background: oklch(95% 0.01 75);  /* L = 95% */
color:      oklch(25% 0.02 75);  /* L = 25% */
/* Difference: 0.70 — exceeds both AA and AAA */
```

Always verify with a proper contrast checker tool — the OKLCH lightness heuristic is a fast approximation, not a guarantee.

---

## CSS Variables Pattern — Full Light/Dark Theme

```css
:root {
  color-scheme: light dark;

  /* --- Light theme (default) --- */
  --color-bg:           oklch(97% 0.008 75);
  --color-surface:      oklch(99% 0.005 75);
  --color-elevated:     oklch(100% 0.000 0);
  --color-overlay:      oklch(100% 0.000 0 / 0.9);

  --color-text:         oklch(20% 0.015 75);
  --color-text-muted:   oklch(45% 0.010 75);
  --color-text-subtle:  oklch(60% 0.008 75);

  --color-border:       oklch(88% 0.010 75);
  --color-border-hover: oklch(78% 0.012 75);

  --color-accent:       oklch(65% 0.19 45);
  --color-accent-hover: oklch(58% 0.20 45);
  --color-accent-text:  oklch(98% 0.005 45);

  --color-danger:       oklch(55% 0.22 25);
  --color-success:      oklch(55% 0.15 155);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg:           oklch(12% 0.012 260);
    --color-surface:      oklch(18% 0.015 260);
    --color-elevated:     oklch(23% 0.015 260);
    --color-overlay:      oklch(10% 0.010 260 / 0.9);

    --color-text:         oklch(92% 0.008 75);
    --color-text-muted:   oklch(70% 0.008 75);
    --color-text-subtle:  oklch(55% 0.006 75);

    --color-border:       oklch(28% 0.015 260);
    --color-border-hover: oklch(38% 0.015 260);

    --color-accent:       oklch(72% 0.18 45);
    --color-accent-hover: oklch(78% 0.16 45);
    --color-accent-text:  oklch(15% 0.02 45);

    --color-danger:       oklch(65% 0.20 25);
    --color-success:      oklch(65% 0.14 155);
  }
}
```

---

## Theme Construction — Surface Hierarchy

Build your theme around layers, not individual colors. Each layer gets text and border variants:

```css
/* Layer 0: Page background */
--bg:              /* base canvas */
--bg-text:         /* primary text on bg */
--bg-border:       /* dividers on bg */

/* Layer 1: Surface (cards, sidebars) */
--surface:         /* card fill */
--surface-text:    /* text on cards */
--surface-border:  /* card borders */

/* Layer 2: Elevated (dropdowns, dialogs) */
--elevated:        /* dropdown fill */
--elevated-text:   /* text in dropdowns */
--elevated-border: /* dropdown borders */

/* Layer 3: Overlay (tooltips, toasts) */
--overlay:         /* tooltip fill */
--overlay-text:    /* tooltip text */
--overlay-border:  /* tooltip borders */
```

Each ascending layer increases lightness by 3-6% in light mode (or increases by 4-8% in dark mode). This creates natural visual depth without shadows or borders alone.

---

## Tailwind Integration

Map your OKLCH custom properties into Tailwind's config for seamless utility class usage:

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        bg:       'var(--color-bg)',
        surface:  'var(--color-surface)',
        elevated: 'var(--color-elevated)',
        overlay:  'var(--color-overlay)',
        text: {
          DEFAULT: 'var(--color-text)',
          muted:   'var(--color-text-muted)',
          subtle:  'var(--color-text-subtle)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          hover:   'var(--color-border-hover)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover:   'var(--color-accent-hover)',
          text:    'var(--color-accent-text)',
        },
        danger:  'var(--color-danger)',
        success: 'var(--color-success)',
      },
    },
  },
};
```

Usage in components:
```html
<div class="bg-surface text-text border border-border rounded-lg p-6">
  <h2 class="text-text">Card Title</h2>
  <p class="text-text-muted">Supporting text with muted color.</p>
  <button class="bg-accent text-accent-text hover:bg-accent-hover">
    Action
  </button>
</div>
```

This approach means theme switching (light/dark or brand themes) requires changing only the CSS custom properties — zero Tailwind class changes in components.
