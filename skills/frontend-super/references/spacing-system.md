# Spacing System Reference

## The 8pt Grid

All spacing in your designs must be multiples of **8px**. This is the fundamental unit.

| Multiple | Value | Token Name | Common Use |
|----------|-------|------------|------------|
| 0.5x | 4px | `--space-1` | Tight UI: icon-to-label gap, badge padding |
| 1x | 8px | `--space-2` | Minimum comfortable spacing, input padding-y |
| 1.5x | 12px | `--space-3` | Compact list items, small card padding |
| 2x | 16px | `--space-4` | Default body spacing, paragraph gap, button padding-x |
| 3x | 24px | `--space-6` | Card padding, form group spacing |
| 4x | 32px | `--space-8` | Section sub-spacing, large card padding |
| 6x | 48px | `--space-12` | Small section breaks, content block spacing |
| 8x | 64px | `--space-16` | Medium section breaks |
| 12x | 96px | `--space-24` | Large section breaks |
| 16x | 128px | `--space-32` | Hero section padding, major page divisions |

**Exception**: 4px is allowed for tight UI elements (icon gaps, borders, badge padding).
Never use 1px, 2px, 3px, 5px, 6px, 7px, 9px, 10px, or other off-grid values for spacing.

---

## Named Spatial Concepts (Nathan Curtis / EightShapes)

### Inset — Content Padding

Padding inside a container. Always equal on all sides (or symmetric pairs).

| Size | Value | Use Case |
|------|-------|----------|
| Inset XS | 8px | Badges, tags, compact buttons |
| Inset SM | 16px | Cards, input fields, small panels |
| Inset MD | 24px | Modals, dialogs, medium panels |
| Inset LG | 32px | Page sections, large panels |
| Inset XL | 48px | Hero content areas, feature sections |

### Stack — Vertical Spacing Between Siblings

Vertical gap between sibling elements in a column layout.

| Size | Value | Use Case |
|------|-------|----------|
| Stack XS | 4px | Label-to-input, icon-to-text |
| Stack SM | 8px | List items, tight groups |
| Stack MD | 16px | Paragraphs, form fields |
| Stack LG | 24px | Content sections within a card |
| Stack XL | 32px | Major content groups |

### Inline — Horizontal Spacing Between Elements

Horizontal gap between inline or row elements.

| Size | Value | Use Case |
|------|-------|----------|
| Inline XS | 4px | Icon + label |
| Inline SM | 8px | Button groups, tag sets |
| Inline MD | 16px | Navigation items, toolbar buttons |
| Inline LG | 24px | Card grids gap |
| Inline XL | 32px | Dashboard panel gaps |

### Section — Vertical Spacing Between Page Sections

| Size | Value | Use Case |
|------|-------|----------|
| Section SM | 48px | Between related sections |
| Section MD | 64px | Standard section breaks |
| Section LG | 96px | Major topic changes |
| Section XL | 128px | Hero-to-content transition |

---

## Gestalt Proximity Rule

**CRITICAL**: This is the most commonly violated spacing principle. Internal spacing MUST
be less than or equal to external spacing. Related items must be closer together than
unrelated items.

```
WRONG — Equal spacing everywhere (kills hierarchy):

  +------------------+     +------------------+
  |                  |     |                  |
  |   Card Title     |     |   Card Title     |
  |                  |     |                  |
  |   Description    |     |   Description    |
  |                  |     |                  |
  |   [Button]       |     |   [Button]       |
  |                  |     |                  |
  +------------------+     +------------------+
         24px                      24px
  <------------- 24px gap ------------->


CORRECT — Proximity creates grouping:

  +------------------+            +------------------+
  |  Card Title      |            |  Card Title      |
  |    8px           |            |    8px           |
  |  Description     |            |  Description     |
  |       16px       |            |       16px       |
  |  [Button]        |            |  [Button]        |
  +------------------+            +------------------+
         16px inset                      16px inset
  <-------------- 32px gap -------------->
```

The card gap (32px) is LARGER than internal spacing (8-16px), so the cards read as
separate units. The title-to-description gap (8px) is SMALLER than description-to-button
(16px), so title+description read as a group.

---

## The Spacing Scale

Complete scale with CSS custom properties and Tailwind mapping:

```css
:root {
  --space-0:  0px;
  --space-px: 1px;       /* Borders only, never spacing */
  --space-1:  4px;       /* 0.25rem  | tw: p-1, gap-1    */
  --space-2:  8px;       /* 0.5rem   | tw: p-2, gap-2    */
  --space-3:  12px;      /* 0.75rem  | tw: p-3, gap-3    */
  --space-4:  16px;      /* 1rem     | tw: p-4, gap-4    */
  --space-6:  24px;      /* 1.5rem   | tw: p-6, gap-6    */
  --space-8:  32px;      /* 2rem     | tw: p-8, gap-8    */
  --space-12: 48px;      /* 3rem     | tw: p-12, gap-12  */
  --space-16: 64px;      /* 4rem     | tw: p-16, gap-16  */
  --space-24: 96px;      /* 6rem     | tw: p-24, gap-24  */
  --space-32: 128px;     /* 8rem     | tw: p-32, gap-32  */
}
```

---

## Common AI Mistakes

### 1. Equal Spacing Everywhere

AI models default to uniform `gap-4` or `p-4` on everything. This creates a flat,
lifeless layout with no visual hierarchy. Spacing IS hierarchy.

**Fix**: Use at least 3 different spacing values on every page. Section gaps > card gaps >
internal content gaps.

### 2. Insufficient Section Breaks

Sections separated by 32px or less feel like they are part of the same block. Users cannot
mentally parse where one section ends and another begins.

**Fix**: Minimum 64px between page sections. 96-128px for major transitions (e.g.,
hero-to-features, features-to-testimonials).

### 3. No Breathing Room in Hero Sections

Hero sections with tight padding (32px or less) feel cramped and cheap. The hero is the
first thing users see; it needs room to breathe.

**Fix**: Minimum 96px vertical padding on hero sections. 128px is better. On desktop,
the hero should feel spacious and confident.

### 4. Symmetric Column Splits

50/50 column layouts are boring and predictable. They signal "template" instantly.

**Fix**: Use asymmetric splits: 60/40, 66/33, 70/30. Let one column dominate.

---

## Layout Composition Techniques

### Break the Grid — Asymmetric Columns

```css
/* BORING — 50/50 split */
.grid-boring { display: grid; grid-template-columns: 1fr 1fr; }

/* BETTER — Asymmetric 2/3 + 1/3 */
.grid-dynamic { display: grid; grid-template-columns: 2fr 1fr; }

/* BEST — Golden ratio split */
.grid-golden { display: grid; grid-template-columns: 1.618fr 1fr; }
```

### Overlapping Elements with Negative Margins

```css
.overlap-card {
  margin-block-start: -48px;  /* Pulls up into previous section */
  position: relative;
  z-index: 1;
}

.hero-image {
  margin-inline-end: -64px;   /* Bleeds outside container */
}
```

### Full-bleed Alternating with Contained

Alternate between full-width background sections and max-width contained content
to create rhythm and visual interest:

```css
.section-contained {
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: var(--space-6);
}

.section-full-bleed {
  width: 100%;
  padding-block: var(--space-24);
  background: var(--color-surface-alt);
}
```

### Diagonal Dividers with clip-path

```css
.section-diagonal {
  clip-path: polygon(0 0, 100% 4%, 100% 100%, 0 96%);
  padding-block: calc(var(--space-24) + 4vw); /* Extra padding to compensate for clip */
}

.section-wave {
  clip-path: url(#wave-clip);  /* SVG-based for organic shapes */
}
```

---

## Generous Whitespace

### The Rule: 2-3x What Feels "Normal"

For hero and marketing sections, double or triple the spacing that feels "sufficient."
What looks "too much" on a design canvas feels "just right" in a browser at actual viewport size.

| Context | Minimum Spacing | Recommended |
|---------|----------------|-------------|
| Hero vertical padding | 64px | 96-128px |
| Section breaks | 48px | 64-96px |
| Card grid gap | 16px | 24-32px |
| CTA button padding | 12px 24px | 16px 32px |

For **data-dense UIs** (dashboards, admin panels, tables), use tighter spacing:
reduce by 30-50% from marketing values. Dense UIs need efficiency, not drama.

---

## CSS Implementation

```css
:root {
  /* --- Spacing Scale (8pt grid) --- */
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-24: 6rem;      /* 96px */
  --space-32: 8rem;      /* 128px */

  /* --- Named Spacing Aliases --- */
  --inset-sm:    var(--space-4);   /* 16px card/panel padding */
  --inset-md:    var(--space-6);   /* 24px modal/dialog padding */
  --inset-lg:    var(--space-8);   /* 32px section content padding */
  --stack-sm:    var(--space-2);   /* 8px tight element groups */
  --stack-md:    var(--space-4);   /* 16px standard content flow */
  --stack-lg:    var(--space-6);   /* 24px content section groups */
  --section-sm:  var(--space-12);  /* 48px related section breaks */
  --section-md:  var(--space-16);  /* 64px standard section breaks */
  --section-lg:  var(--space-24);  /* 96px major topic transitions */
  --section-xl:  var(--space-32);  /* 128px hero/footer mega-breaks */
}

/* Tailwind spacing scale mapping (add to tailwind.config.js):
   theme: {
     extend: {
       spacing: {
         '18': '4.5rem',  // 72px
         '22': '5.5rem',  // 88px
       }
     }
   }
*/
```

---

## RTL Spacing Note

**MANDATORY for RTL/Hebrew layouts**: Use CSS logical properties ONLY. Never use physical
directional properties (left, right, margin-left, padding-right).

```css
/* WRONG — breaks in RTL */
.card { margin-left: 16px; padding-right: 24px; text-align: left; }

/* CORRECT — works in both LTR and RTL */
.card { margin-inline-start: 16px; padding-inline-end: 24px; text-align: start; }
```

### Complete Logical Properties Reference

| Physical (NEVER use) | Logical (ALWAYS use) |
|----------------------|---------------------|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |
| `border-left` | `border-inline-start` |
| `border-right` | `border-inline-end` |
| `left` | `inset-inline-start` |
| `right` | `inset-inline-end` |
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |
| `float: left` | `float: inline-start` |
| `float: right` | `float: inline-end` |

Vertical/block properties are also available but less critical for RTL:
- `margin-top` -> `margin-block-start`
- `margin-bottom` -> `margin-block-end`
- `padding-top` -> `padding-block-start`
- `padding-bottom` -> `padding-block-end`

Using logical properties ensures your layouts work correctly in both LTR and RTL contexts
without any additional CSS overrides or direction-specific stylesheets.
