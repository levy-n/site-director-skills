# RTL & Hebrew Web Development Reference

## Root Setup

Every Hebrew page MUST have the correct root attributes and CSS:

```html
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
</head>
```

```css
html {
  direction: rtl;
  unicode-bidi: embed;
}
```

Both the HTML attribute AND the CSS declaration are required. The HTML `dir` attribute affects browser heuristics (form controls, default alignment). The CSS `direction` property affects layout calculations.

---

## CSS Logical Properties -- MANDATORY

Physical properties are BANNED in RTL projects. Always use logical equivalents.

### Complete Mapping Table

| Physical (NEVER use)            | Logical (ALWAYS use)                |
|---------------------------------|-------------------------------------|
| `margin-left`                   | `margin-inline-start`               |
| `margin-right`                  | `margin-inline-end`                 |
| `padding-left`                  | `padding-inline-start`              |
| `padding-right`                 | `padding-inline-end`                |
| `text-align: left`             | `text-align: start`                 |
| `text-align: right`            | `text-align: end`                   |
| `float: left`                  | `float: inline-start`               |
| `float: right`                 | `float: inline-end`                 |
| `left: 8px`                    | `inset-inline-start: 8px`           |
| `right: 8px`                   | `inset-inline-end: 8px`             |
| `border-left`                  | `border-inline-start`               |
| `border-right`                 | `border-inline-end`                 |
| `border-radius: 8px 0 0 8px`  | `border-start-start-radius: 8px; border-end-start-radius: 8px` |
| `border-radius: 0 8px 8px 0`  | `border-start-end-radius: 8px; border-end-end-radius: 8px`     |
| `margin-top`                   | `margin-block-start`                |
| `margin-bottom`                | `margin-block-end`                  |
| `padding-top`                  | `padding-block-start`               |
| `padding-bottom`               | `padding-block-end`                 |
| `top`                          | `inset-block-start`                 |
| `bottom`                       | `inset-block-end`                   |

### Properties That Stay Physical

These do NOT have logical equivalents and remain unchanged:
- `width` / `height` / `min-width` / `max-height` -- unchanged
- `transform` -- unchanged (but values may need manual flipping)
- `background-position` -- use logical keywords `start` / `end` where supported
- `box-shadow` -- manually flip X-offset for RTL

---

## Hebrew Typography Rules

### Critical Restrictions

1. **NEVER use `letter-spacing` on Hebrew text.** Hebrew letters connect visually within words. Adding letter-spacing disconnects them, making text unreadable. If you need to space out a heading, use `word-spacing` instead.

2. **NEVER use `font-style: italic` on Hebrew text.** Italic Hebrew is controversial and often poorly rendered. Use `font-weight: bold` or `color` changes for emphasis instead.

3. **NEVER use `text-transform: uppercase`** -- Hebrew has no uppercase/lowercase distinction. This property has no effect and signals a lack of awareness.

4. **NEVER use text opacity or RGBA transparency on Hebrew body text.** Semi-transparent text causes rendering artifacts between connected letters in some browsers, creating visible gaps.

### Recommended Settings

```css
body {
  line-height: 1.7;           /* Hebrew needs more line-height than Latin (1.5) */
  font-size: 1rem;            /* 16px minimum for Hebrew readability */
  word-spacing: 0.05em;       /* Slight word spacing improves Hebrew readability */
}

h1, h2, h3 {
  line-height: 1.4;           /* Headings can be tighter */
  font-weight: 700;           /* Bold for emphasis, never italic */
}
```

### Font Stack Recommendations

**Display / Headlines:**
```css
font-family: 'Noa Shalev', 'Heebo', sans-serif;
```

**Body Text:**
```css
font-family: 'Yarden', 'Heebo', sans-serif;
```

---

## Hebrew Font Stack -- Web Fonts

### Google Fonts (Free)
- **Heebo** -- Clean, modern sans-serif. Excellent for body text. Weights 100-900.
- **Rubik** -- Friendly, slightly rounded sans-serif. Good for UI and headings.
- **Assistant** -- Modern, geometric sans-serif. Good for tech sites.
- **Alef** -- Classic, well-balanced serif-like sans. Good for formal content.
- **Frank Ruhl Libre** -- Serif font, good for editorial and print-inspired design.
- **Secular One** -- Bold display font for impactful headings.

### Premium Fonts
- **AlefAlefAlef Foundry** (by Avraham Cornfeld) -- Boutique Hebrew type foundry producing distinctive Hebrew typefaces. Premium quality for brands that need unique typography.
- **Fontef** -- Israeli type foundry with contemporary Hebrew fonts.
- **Fontimonim** -- Curated collection of high-quality Hebrew fonts.

### Google Fonts Hebrew Subset
When loading Google Fonts, use the Hebrew subset for optimal performance:
```html
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700&subset=hebrew&display=swap" rel="stylesheet">
```

---

## Directional Elements

### Elements That MUST Be Flipped in RTL

- Arrows and chevrons (navigation, breadcrumbs)
- Breadcrumb separators (`>` becomes `<` or flip the icon)
- Progress indicators and step wizards (flow right-to-left)
- Sliders and carousels (advance direction reverses)
- Text input icons (search icon moves to right side)
- List bullet indentation (indent from right)
- Sidebar navigation (appears on right)
- Back/forward navigation buttons

### Elements That Must NOT Be Flipped

- Media player controls (play/pause/stop are universal)
- Checkmarks and X marks
- Clock icons and timers
- Phone and communication icons
- Mathematical operators (+, -, =)
- Music notation
- Brand logos
- Maps and compasses

### CSS Flipping Technique

```css
.icon-flip-rtl {
  transform: scaleX(-1);
}

/* Or conditionally: */
[dir="rtl"] .directional-icon {
  transform: scaleX(-1);
}
```

---

## Animation Direction

In RTL layouts, entrance animations must come from the RIGHT side.

### Framer Motion RTL Adjustments

```tsx
// LTR: elements enter from left
const ltrEntrance = { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 } };

// RTL: elements enter from right (flip the X value)
const rtlEntrance = { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 } };
```

### Stagger Direction

In RTL, staggered animations should reveal from RIGHT to LEFT:
```tsx
// Items at index 0 appear first (rightmost in RTL)
const staggerDelay = index * 0.1;
```

### Scroll-Triggered Slides

```tsx
// Slide-in from right for RTL
const slideInRTL = {
  hidden: { x: 60, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.5 } }
};
```

---

## Tailwind CSS RTL Support

Use the `rtl:` prefix variant for directional utilities:

```html
<div class="space-x-4 rtl:space-x-reverse">
  <span>First</span>
  <span>Second</span>
</div>

<div class="pl-4 rtl:pr-4 rtl:pl-0">
  Padded content
</div>

<div class="text-left rtl:text-right">
  Aligned text
</div>

<div class="ml-auto rtl:mr-auto rtl:ml-0">
  Auto-margin element
</div>
```

Enable in `tailwind.config.js` if not already:
```js
module.exports = {
  // dir="rtl" on html element activates rtl: variant automatically
}
```

---

## RTL Compliance Validation Checklist

Use this 10-point checklist to verify RTL compliance before shipping:

- [ ] 1. `<html dir="rtl" lang="he">` is set on root element
- [ ] 2. Zero physical direction properties in CSS (`margin-left`, `padding-right`, `left`, `right`, `text-align: left/right`)
- [ ] 3. No `letter-spacing` applied to Hebrew text elements
- [ ] 4. No `font-style: italic` on Hebrew text
- [ ] 5. Line-height is 1.7+ for body text
- [ ] 6. All directional icons (arrows, chevrons, breadcrumbs) are flipped
- [ ] 7. Non-directional icons (play, checkmark, phone) are NOT flipped
- [ ] 8. Animations enter from the right side
- [ ] 9. Flexbox/Grid layouts visually flow right-to-left
- [ ] 10. Mixed-direction content (numbers, English within Hebrew) renders correctly with proper `<bdi>` tags where needed

---

## Award-Winning Hebrew Design References

Study these sites for inspiration on Hebrew web design:

- **Rikover & Co** -- Clean editorial Hebrew typography with generous whitespace
- **Butcher.studio** -- Bold creative direction in Hebrew, proves Hebrew can be adventurous
- **500Tech** -- Developer-focused site with excellent Hebrew tech content layout
- **Wix Hebrew sites** -- Large-scale reference for Hebrew UI patterns and component design
- **Kan (Israeli Broadcasting)** -- News layout patterns for Hebrew content-heavy sites
- **Bank Hapoalim** -- Financial/corporate Hebrew design with accessibility focus

---

## Common Gotchas

### Numbers in Hebrew Text
Numbers always flow LTR within RTL context. The browser handles this automatically via the Unicode Bidirectional Algorithm. Do NOT try to manually reverse numbers.

```html
<!-- This renders correctly: the number 2024 reads left-to-right within the RTL sentence -->
<p>הפרויקט הושלם בשנת 2024</p>
```

### Mixed-Direction Content
When embedding LTR content (English words, code snippets) inside Hebrew text, use `<bdi>` to isolate bidirectional runs:

```html
<p>השתמשנו ב-<bdi>React</bdi> לפיתוח הממשק</p>
```

### Flexbox Auto-Reversal
`flex-direction: row` automatically reverses in RTL context. The first flex child appears on the RIGHT. Do NOT manually set `flex-direction: row-reverse` to "fix" RTL -- it will double-reverse.

### CSS Grid
Grid column numbering does NOT change in RTL. Column 1 is still on the left. But `grid-auto-flow` and visual placement respect the document direction. Use logical properties for grid placement when possible.

### Scroll Direction
Horizontal scroll remains left-to-right in most browsers. Do not assume `scrollLeft` values will be negative in RTL -- behavior varies across browsers. Use `Element.scrollIntoView()` instead of manual scroll calculations.