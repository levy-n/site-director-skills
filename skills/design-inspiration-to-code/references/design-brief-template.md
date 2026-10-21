# Design Brief Template

Copy and fill this template for every project that takes inspiration from existing websites.

## Contents (of the template below)

1. Project Context · 2. Inspiration Sources · 3. Color Palette · 4. Typography Scale ·
5. Spacing System · 6. Layout Patterns (hero/sections/gallery/nav/footer) ·
7. Component Specifications · 8. Animation Patterns · 9. Image and Media ·
10. Responsive Breakpoints · 11. Constraints (RTL, accessibility, performance)

---

```markdown
# Design Brief: [Project Name]

## 1. Project Context
- **What:** [What you are building - e.g., "Hebrew RTL photography portfolio"]
- **Who:** [Target audience - e.g., "Israeli families looking for a photographer"]
- **Tone:** [e.g., "elegant and minimal", "warm and approachable"]
- **Platform priority:** [Mobile-first / Desktop-first / Equal]

## 2. Inspiration Sources (MANDATORY: specify what from where)
| Source | URL | What to Take | What to Skip |
|--------|-----|-------------|-------------|
| Site A | | Layout structure, hero design | Color palette |
| Site B | | Color harmony, typography | Navigation style |
| Site C | | Animation patterns | Everything else |

## 3. Color Palette
| Token Name | Value (OKLCH/HEX) | Usage |
|------------|-------------------|-------|
| bg-primary | | Page background |
| bg-section | | Alternating sections |
| bg-card | | Card backgrounds |
| text-heading | | H1, H2, H3 |
| text-body | | Body paragraphs |
| text-muted | | Captions, secondary |
| accent | | CTAs, links, hover |
| accent-hover | | Hover state of accent |
| border | | Dividers, card borders |
| overlay | | Video/image overlays |

## 4. Typography Scale
| Element | Font Family | Weight | Size | Line Height | Letter Spacing |
|---------|------------|--------|------|-------------|---------------|
| H1 | | | | | |
| H2 | | | | | |
| H3 | | | | | |
| Body | | | | | |
| Small | | | | | |
| Caption | | | | | |
| Button | | | | | |
| Nav link | | | | | |

**Font loading:** [Google Fonts / self-hosted / system fonts]

## 5. Spacing System
- **Base unit:** [4px / 8px]
- **Scale:** [list the values used, e.g., 4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
- **Section gap:** [mobile] / [desktop]
- **Content max-width:** [e.g., 1200px]
- **Container padding:** [mobile] / [desktop]

## 6. Layout Patterns

### Hero Section
- **Structure:** [Full-screen video / split image+text / centered text over image]
- **Height:** [100vh / auto / 80vh]
- **Content alignment:** [center / left / right]
- **CTA placement:** [below heading / inline / bottom of hero]
- **Mobile adaptation:** [stack / maintain / simplify]

### Content Sections
- **Grid:** [columns on desktop, mobile behavior]
- **Image treatment:** [aspect ratio, object-fit, border-radius]
- **Text alignment:** [start / center]

### Gallery
- **Layout:** [grid / masonry / carousel / lightbox]
- **Columns:** [desktop] / [tablet] / [mobile]
- **Gap:** [value]
- **Hover effect:** [zoom / overlay / caption slide]

### Navigation
- **Type:** [sticky / fixed / transparent-to-solid]
- **Height:** [value]
- **Mobile:** [hamburger / bottom nav / slide-in]
- **Breakpoint for mobile nav:** [value]

### Footer
- **Structure:** [simple / multi-column / minimal]
- **Content:** [links, social, contact, copyright]

## 7. Component Specifications

### Buttons
- **Primary:** padding, bg-color, text-color, border-radius, font-weight
- **Secondary:** padding, border, text-color, border-radius
- **Hover:** transition property, duration, easing
- **Active/Press:** transform or color change

### Cards
- **Padding:** [value]
- **Border-radius:** [value]
- **Shadow:** [value or none]
- **Hover:** [translateY / shadow increase / border change]

### Form Inputs (if applicable)
- **Height:** [value]
- **Border:** [style]
- **Focus:** [ring color, transition]
- **Label:** [position, size]

## 8. Animation Patterns
| Trigger | Effect | Duration | Easing | Delay/Stagger |
|---------|--------|----------|--------|---------------|
| Page load | Hero text fade-in | | | |
| Scroll | Section reveal | | | |
| Hover | Button color change | | | |
| Hover | Card lift | | | |
| Hover | Image zoom | | | |
| Click | Menu open | | | |

**General rules:**
- Entrance: [ease-out]
- Exit: [ease-in]
- Hover: [ease or ease-in-out]
- Duration range: [0.2s - 0.6s]
- Never use: [linear for UI, bounce unless playful brand]

## 9. Image and Media
- **Hero image/video:** [dimensions, treatment]
- **Gallery images:** [aspect ratio, sizes]
- **Profile/about image:** [shape, size]
- **Optimization:** [format: WebP/AVIF, max-width, lazy loading]

### Video Background (if applicable)
- **Duration:** [15-30 sec]
- **File size:** [under 5MB]
- **Resolution:** [720p]
- **Mobile fallback:** [poster image]
- **Overlay:** [color + opacity for text readability]

## 10. Responsive Breakpoints
| Breakpoint | Width | Key Changes |
|-----------|-------|-------------|
| Mobile | < 640px | [single column, stacked, hamburger] |
| Tablet | 640-1024px | [2 columns, adjusted spacing] |
| Desktop | > 1024px | [full layout, max-width container] |

## 11. Constraints and Special Rules

### RTL/Hebrew (if applicable)
- [ ] CSS logical properties only
- [ ] No letter-spacing on Hebrew
- [ ] No italic on Hebrew
- [ ] No uppercase on Hebrew
- [ ] Line-height: 1.7 body, 1.4 headings
- [ ] Font weight 300 default

### Accessibility
- [ ] Color contrast ratio >= 4.5:1
- [ ] Focus visible on all interactive elements
- [ ] Alt text on all images
- [ ] Semantic HTML structure

### Performance
- [ ] Lighthouse > 90
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] Images lazy-loaded below fold
```
