# Hebrew RTL Development Guide

## Comprehensive reference for building right-to-left Hebrew web interfaces with Next.js and Tailwind CSS.

---

## 1. HTML Fundamentals

### Required Attributes on `<html>` Element

```html
<html lang="he" dir="rtl">
```

- **`dir="rtl"`**: Sets the base direction of text to right-to-left for the entire document. This affects:
  - Text alignment (default becomes right-aligned)
  - Flexbox and grid flow direction
  - Table column order
  - Scrollbar position
  - Margin/padding interpretation for shorthand properties

- **`lang="he"`**: Tells browsers and assistive technologies that the content language is Hebrew. This affects:
  - Screen reader pronunciation
  - Browser spell-checking
  - Search engine indexing
  - Hyphenation algorithms
  - Font selection fallback behavior

### Important: These must be on `<html>`, not `<body>`

Setting `dir` on `<body>` will miss elements that render outside the body (e.g., some modal portals, browser chrome). Always set both attributes on the `<html>` element.

---

## 2. CSS RTL Patterns

### Logical Properties (Preferred Approach)

CSS Logical Properties automatically adapt to the document's direction. They are the best approach for RTL-compatible CSS.

| Physical Property | Logical Replacement | RTL Behavior |
|-------------------|---------------------|-------------|
| `margin-left` | `margin-inline-start` | Becomes right margin |
| `margin-right` | `margin-inline-end` | Becomes left margin |
| `padding-left` | `padding-inline-start` | Becomes right padding |
| `padding-right` | `padding-inline-end` | Becomes left padding |
| `left` | `inset-inline-start` | Becomes right |
| `right` | `inset-inline-end` | Becomes left |
| `text-align: left` | `text-align: start` | Becomes right-aligned |
| `text-align: right` | `text-align: end` | Becomes left-aligned |
| `border-left` | `border-inline-start` | Becomes right border |
| `border-right` | `border-inline-end` | Becomes left border |
| `float: left` | `float: inline-start` | Becomes float right |
| `float: right` | `float: inline-end` | Becomes float left |

### Flexbox in RTL

```css
/* Flexbox row direction is AUTOMATICALLY REVERSED in RTL */
/* No code changes needed in most cases */
.flex-container {
  display: flex;
  flex-direction: row;
  /* In LTR: items flow left -> right */
  /* In RTL: items flow right -> left (automatically!) */
}

/* gap, justify-content, align-items all work correctly */
/* No special handling needed */
```

**Key flexbox RTL behaviors:**
- `flex-direction: row` flows right-to-left automatically
- `flex-direction: row-reverse` flows left-to-right (opposite of RTL default)
- `justify-content: flex-start` aligns to the right
- `justify-content: flex-end` aligns to the left
- `order` property works the same (lower numbers = right side in RTL)

### Grid in RTL

```css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  /* In RTL: columns flow right -> left */
  /* First column (1fr) is on the right */
  /* Last column (1fr) is on the left */
}
```

### Text Alignment

```css
/* Default in RTL is right-aligned */
body {
  text-align: start; /* right in RTL, left in LTR */
}

/* Center-aligned content (headings, CTAs) is direction-neutral */
.heading {
  text-align: center; /* Same in both RTL and LTR */
}

/* For content that must be left-aligned (code, numbers) */
.ltr-content {
  text-align: left;
  direction: ltr;
}
```

### Border Radius in RTL

```css
/* Physical border-radius does NOT flip automatically */
/* Use Tailwind logical utilities or manual handling */

/* Instead of: */
.card {
  border-radius: 0 8px 8px 0; /* top-right + bottom-right */
}

/* Use Tailwind logical utilities: */
/* rounded-s-lg = start side (right in RTL) */
/* rounded-e-lg = end side (left in RTL) */
```

### Background Gradients

```css
/* Gradients with directional keywords flip in RTL */
/* "to right" becomes "to left" in RTL context when using dir="rtl" */

/* For predictable behavior, use angle-based gradients */
.gradient-safe {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Angles don't change with direction - same result in RTL and LTR */
}
```

### Transforms and Translations

```css
/* translateX values do NOT automatically flip in RTL */
/* You must handle this manually */

/* LTR: slide in from left */
.slide-in-ltr {
  transform: translateX(-100%);
}

/* RTL: slide in from right */
.slide-in-rtl {
  transform: translateX(100%);
}

/* Or use a CSS custom property approach: */
:root {
  --dir-multiplier: 1;
}
:root[dir="rtl"] {
  --dir-multiplier: -1;
}
.slide-in {
  transform: translateX(calc(-100% * var(--dir-multiplier)));
}
```

---

## 3. Tailwind CSS RTL Utilities

### Logical Spacing (Margin and Padding)

Use these instead of `ml-*`/`mr-*` and `pl-*`/`pr-*`:

| Tailwind Class | CSS Property | RTL Behavior |
|----------------|-------------|--------------|
| `ms-4` | `margin-inline-start: 1rem` | Right margin in RTL |
| `me-4` | `margin-inline-end: 1rem` | Left margin in RTL |
| `ps-4` | `padding-inline-start: 1rem` | Right padding in RTL |
| `pe-4` | `padding-inline-end: 1rem` | Left padding in RTL |

### Logical Positioning

| Tailwind Class | CSS Property | RTL Behavior |
|----------------|-------------|--------------|
| `start-0` | `inset-inline-start: 0` | `right: 0` in RTL |
| `start-4` | `inset-inline-start: 1rem` | `right: 1rem` in RTL |
| `end-0` | `inset-inline-end: 0` | `left: 0` in RTL |
| `end-4` | `inset-inline-end: 1rem` | `left: 1rem` in RTL |

### Logical Text Alignment

| Tailwind Class | RTL Behavior |
|----------------|--------------|
| `text-start` | Right-aligned |
| `text-end` | Left-aligned |
| `text-center` | Center (same) |

### Logical Border Radius

| Tailwind Class | RTL Behavior |
|----------------|--------------|
| `rounded-s-lg` | Right corners rounded |
| `rounded-e-lg` | Left corners rounded |
| `rounded-ss-lg` | Top-right corner |
| `rounded-se-lg` | Top-left corner |
| `rounded-es-lg` | Bottom-right corner |
| `rounded-ee-lg` | Bottom-left corner |

### RTL Variant Prefix

For styles that should ONLY apply in RTL context:

```html
<div class="rtl:flex-row-reverse">
  <!-- Only applies flex-row-reverse when dir="rtl" -->
</div>

<div class="rtl:space-x-reverse">
  <!-- Reverses horizontal spacing in RTL -->
</div>

<div class="rtl:text-right ltr:text-left">
  <!-- Explicit direction-based styling -->
</div>
```

### Complete RTL Class Mapping Reference

```
ml-* -> ms-*    (margin-left -> margin-start)
mr-* -> me-*    (margin-right -> margin-end)
pl-* -> ps-*    (padding-left -> padding-start)
pr-* -> pe-*    (padding-right -> padding-end)
left-* -> start-*
right-* -> end-*
text-left -> text-start
text-right -> text-end
rounded-l-* -> rounded-s-*
rounded-r-* -> rounded-e-*
rounded-tl-* -> rounded-ss-*
rounded-tr-* -> rounded-se-*
rounded-bl-* -> rounded-es-*
rounded-br-* -> rounded-ee-*
border-l-* -> border-s-*
border-r-* -> border-e-*
divide-x -> divide-x (add rtl:divide-x-reverse)
space-x -> space-x (add rtl:space-x-reverse)
```

---

## 4. Hebrew Fonts

### Recommended Google Fonts with Hebrew Support

#### Body Text Fonts

**Heebo** - Clean sans-serif, the most popular choice for Hebrew web
- Weights: 100, 200, 300, 400, 500, 600, 700, 800, 900
- Best for: Body text, UI elements, general purpose
- Character: Professional, clean, neutral
- Usage: `font-family: 'Heebo', sans-serif`
```tsx
import { Heebo } from 'next/font/google'
const heebo = Heebo({ subsets: ['hebrew', 'latin'], display: 'swap' })
```

**Rubik** - Rounded, friendly, versatile
- Weights: 300, 400, 500, 600, 700, 800, 900
- Best for: Headings and body text, SaaS products, modern brands
- Character: Warm, approachable, contemporary
- Usage: `font-family: 'Rubik', sans-serif`
```tsx
import { Rubik } from 'next/font/google'
const rubik = Rubik({ subsets: ['hebrew', 'latin'], display: 'swap' })
```

**Assistant** - Light, modern, excellent readability
- Weights: 200, 300, 400, 500, 600, 700, 800
- Best for: Long-form content, blogs, documentation
- Character: Light, airy, elegant
- Usage: `font-family: 'Assistant', sans-serif`
```tsx
import { Assistant } from 'next/font/google'
const assistant = Assistant({ subsets: ['hebrew', 'latin'], display: 'swap' })
```

**Noto Sans Hebrew** - Google's universal Hebrew font
- Weights: 100, 200, 300, 400, 500, 600, 700, 800, 900
- Best for: Maximum compatibility, system-like appearance
- Character: Universal, complete glyph coverage, reliable
- Usage: `font-family: 'Noto Sans Hebrew', sans-serif`
```tsx
import { Noto_Sans_Hebrew } from 'next/font/google'
const notoSansHebrew = Noto_Sans_Hebrew({ subsets: ['hebrew', 'latin'], display: 'swap' })
```

**Varela Round** - Rounded, casual
- Weight: 400 only
- Best for: Casual brands, children's content, friendly vibes
- Character: Rounded, playful, casual
- Usage: `font-family: 'Varela Round', sans-serif`

#### Display / Heading Fonts

**Secular One** - Bold display font
- Weight: 400 only (inherently bold)
- Best for: Hero headlines, large display text, impact statements
- Character: Strong, commanding, attention-grabbing
- Usage: `font-family: 'Secular One', sans-serif`
```tsx
import { Secular_One } from 'next/font/google'
const secularOne = Secular_One({ subsets: ['hebrew', 'latin'], weight: '400', display: 'swap' })
```

**Karantina** - Decorative display font
- Weights: 300, 400, 700
- Best for: Very large headlines, decorative use only
- Character: Bold, artistic, eye-catching
- Warning: Do NOT use for body text, only headlines and hero text
- Usage: `font-family: 'Karantina', system-ui`

**Alef** - Unique serif-like character
- Weights: 400, 700
- Best for: Distinctive branding, premium feel
- Character: Unique letterforms, stands out from typical sans-serif Hebrew
- Usage: `font-family: 'Alef', sans-serif`

### Font Pairing Recommendations

| Heading Font | Body Font | Style |
|-------------|-----------|-------|
| Secular One | Heebo | Bold + Clean (most versatile) |
| Rubik 700 | Rubik 400 | Single-family (consistent) |
| Karantina | Assistant | Decorative + Light (creative) |
| Heebo 900 | Heebo 400 | Single-family, weight contrast |
| Alef 700 | Noto Sans Hebrew | Distinctive + Universal |

### Font Size Adjustment for Hebrew

Hebrew characters are visually smaller than Latin characters at the same font-size. Compensate:

```css
/* Hebrew text should be approximately 10% larger than English
   for equivalent perceived readability */

/* Body text */
body {
  font-size: 16px; /* Minimum for Hebrew body text */
  /* English equivalent visual size would be ~14.5px */
}

/* Headings - be generous */
h1 {
  font-size: 2.5rem; /* 40px minimum for Hebrew h1 */
  /* English equivalent visual size would be ~36px */
}

/* Buttons - must be readable at a glance */
.btn {
  font-size: 1.125rem; /* 18px minimum for Hebrew buttons */
  /* English equivalent would be ~16px */
}

/* Small text - avoid going below 14px for Hebrew */
.small-text {
  font-size: 0.875rem; /* 14px absolute minimum */
}
```

### Loading Fonts in Next.js

```tsx
// lib/fonts.ts
import { Heebo, Secular_One } from 'next/font/google'

export const bodyFont = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
})

export const displayFont = Secular_One({
  subsets: ['hebrew', 'latin'],
  variable: '--font-display',
  display: 'swap',
  weight: '400',
})
```

```tsx
// app/(frontend)/layout.tsx
import { bodyFont, displayFont } from '@/lib/fonts'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${bodyFont.variable} ${displayFont.variable} font-body`}>
        {children}
      </body>
    </html>
  )
}
```

```ts
// tailwind.config.ts
fontFamily: {
  body: ['var(--font-body)', 'Arial', 'sans-serif'],
  display: ['var(--font-display)', 'var(--font-body)', 'Arial', 'sans-serif'],
}
```

---

## 5. Bidirectional Text Handling

### Hebrew Text with English Brand Names

Hebrew content frequently contains English words (brand names, technical terms, product names). The Unicode Bidirectional Algorithm (BiDi) handles most cases automatically, but some need manual intervention.

#### The `<bdi>` Element (Bidirectional Isolation)

Use `<bdi>` to isolate a segment of text that might have a different direction:

```html
<!-- Correct: Brand name isolated -->
<p>אנחנו עובדים עם <bdi>Google Workspace</bdi> לניהול הפרויקט</p>

<!-- Without bdi, punctuation and surrounding text may render incorrectly -->
```

#### Common Mixed-Content Patterns

```html
<!-- Phone number in Hebrew text -->
<p>התקשרו אלינו: <span dir="ltr">054-123-4567</span></p>

<!-- Email in Hebrew text -->
<p>שלחו אימייל: <a href="mailto:info@example.com" dir="ltr">info@example.com</a></p>

<!-- URL in Hebrew text -->
<p>בקרו באתר: <a href="https://example.com" dir="ltr">example.com</a></p>

<!-- Price with currency symbol -->
<p>מחיר: <span dir="ltr">&#8362;199</span></p>
<!-- &#8362; is the shekel sign (₪) -->

<!-- Percentage -->
<p>הנחה של <span dir="ltr">25%</span></p>
```

#### Unicode BiDi Control Characters

For edge cases where HTML elements aren't practical:

| Character | Unicode | Purpose |
|-----------|---------|---------|
| LRM (Left-to-Right Mark) | `\u200E` or `&lrm;` | Forces LTR at insertion point |
| RLM (Right-to-Left Mark) | `\u200F` or `&rlm;` | Forces RTL at insertion point |
| LRE (Left-to-Right Embedding) | `\u202A` | Start LTR embedding |
| RLE (Right-to-Left Embedding) | `\u202B` | Start RTL embedding |
| PDF (Pop Directional Formatting) | `\u202C` | End directional embedding |

**Use sparingly.** Prefer HTML elements (`<bdi>`, `<span dir="...">`) when possible.

---

## 6. Phone Number Formatting

### Israeli Phone Number Formats

| Type | Local Format | International Format | Notes |
|------|-------------|---------------------|-------|
| Mobile | 05X-XXX-XXXX | +972-5X-XXX-XXXX | Most common |
| Landline | 0X-XXX-XXXX | +972-X-XXX-XXXX | Area code required |
| Toll-free | 1-800-XXX-XXX | N/A | Israel only |
| Short | *XXXX | N/A | Service numbers |

### Phone Number Display in RTL

```html
<!-- Phone numbers MUST be displayed LTR even in RTL context -->
<a href="tel:+972541234567" dir="ltr" class="inline-block">
  054-123-4567
</a>

<!-- With icon -->
<a href="tel:+972541234567" class="flex items-center gap-2">
  <span>טלפון:</span>
  <span dir="ltr">054-123-4567</span>
</a>
```

### `tel:` Link Format
- Remove dashes, spaces, and parentheses
- Use international format with `+`
- Example: `tel:+972541234567`

---

## 7. WhatsApp Integration

### URL Format

```
https://wa.me/972XXXXXXXXX
```

**Conversion rules:**
1. Remove the leading `0` from the Israeli number
2. Prepend country code `972`
3. Remove all dashes, spaces, parentheses
4. Do NOT include `+` sign in the URL

**Examples:**
| Local Number | WhatsApp URL |
|-------------|--------------|
| 054-123-4567 | `https://wa.me/972541234567` |
| 050-987-6543 | `https://wa.me/972509876543` |
| 03-123-4567 | `https://wa.me/97231234567` |

### Pre-filled Message

```
https://wa.me/972541234567?text=היי%2C%20אשמח%20לשמוע%20פרטים%20נוספים
```

Use `encodeURIComponent()` in JavaScript:
```ts
const phone = '972541234567'
const message = 'היי, אשמח לשמוע פרטים נוספים'
const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
```

### WhatsApp Button Placement

- **Position**: Fixed, bottom-left corner in RTL (`start` side)
- **Why left?** In RTL, the natural reading start is the right side. The WhatsApp button goes on the less-dominant left side to avoid blocking content flow, while still being easily reachable by thumb (most users hold phone in right hand, thumb reaches left side)
- **Z-index**: 50 (above content, below modals)
- **Size**: Minimum 56x56px for touch target accessibility
- **Color**: `#25D366` (official WhatsApp brand green)

---

## 8. Form Inputs in RTL

### Form Container

```html
<form dir="rtl">
  <!-- All labels and Hebrew text fields inherit RTL -->
</form>
```

### Field-Specific Direction

```html
<!-- Hebrew text fields: inherit RTL from parent -->
<div>
  <label for="name">שם מלא</label>
  <input type="text" id="name" name="name" placeholder="הכניסו את שמכם" />
</div>

<!-- Phone field: MUST be LTR -->
<div>
  <label for="phone">טלפון</label>
  <input type="tel" id="phone" name="phone" dir="ltr"
         placeholder="05X-XXX-XXXX" class="text-left" />
</div>

<!-- Email field: MUST be LTR -->
<div>
  <label for="email">אימייל</label>
  <input type="email" id="email" name="email" dir="ltr"
         placeholder="your@email.com" class="text-left" />
</div>

<!-- URL field: MUST be LTR -->
<div>
  <label for="website">אתר אינטרנט</label>
  <input type="url" id="website" name="website" dir="ltr"
         placeholder="https://www.example.com" class="text-left" />
</div>

<!-- Number field: SHOULD be LTR -->
<div>
  <label for="quantity">כמות</label>
  <input type="number" id="quantity" name="quantity" dir="ltr" class="text-left" />
</div>

<!-- Textarea for Hebrew: inherits RTL -->
<div>
  <label for="message">הודעה</label>
  <textarea id="message" name="message" placeholder="איך נוכל לעזור?"></textarea>
</div>
```

### Label Positioning

In RTL forms, labels should be:
- **Above the input** (most common and safest for RTL)
- Or **to the right of the input** (inline labels)
- Never to the left in RTL context (feels disconnected from the field)

```tsx
// Recommended: Label above input
<div className="flex flex-col gap-1">
  <label className="font-medium text-sm text-gray-700">שם מלא</label>
  <input className="..." />
</div>
```

### Error Messages

```tsx
// Error messages in Hebrew, positioned under the field
<div>
  <label>טלפון</label>
  <input className="border-red-500" />
  <p className="text-red-600 text-sm mt-1">נא להזין מספר טלפון תקין</p>
</div>
```

### Common Hebrew Form Labels

| Field | Hebrew Label | Placeholder |
|-------|-------------|-------------|
| Full name | שם מלא | הכניסו את שמכם |
| First name | שם פרטי | שם פרטי |
| Last name | שם משפחה | שם משפחה |
| Phone | טלפון | 05X-XXX-XXXX |
| Email | אימייל | your@email.com |
| Message | הודעה | איך נוכל לעזור? |
| Company | חברה | שם החברה |
| City | עיר | עיר |
| Subject | נושא | במה נוכל לעזור? |
| Submit button | שליחה | - |
| Submitting... | ...שולח | - |
| Required field | שדה חובה | - |

### Common Hebrew Error Messages

| Error | Hebrew Text |
|-------|-------------|
| Required field | שדה חובה |
| Invalid email | כתובת אימייל לא תקינה |
| Invalid phone | מספר טלפון לא תקין |
| Too short | הטקסט קצר מדי |
| Too long | הטקסט ארוך מדי |
| General error | אירעה שגיאה, אנא נסו שוב |
| Success | תודה! פנייתכם התקבלה בהצלחה |

### Common Hebrew Success Messages

| Context | Hebrew Text |
|---------|-------------|
| Form submitted | תודה רבה! קיבלנו את פנייתכם ונחזור אליכם בהקדם |
| Message sent | ההודעה נשלחה בהצלחה |
| Registered | ההרשמה בוצעה בהצלחה |

---

## 9. Common RTL Bugs and Fixes

### Bug 1: Icons/Arrows Pointing Wrong Direction

**Problem:** Arrow icons, chevrons, and directional icons point the wrong way in RTL.

**Fix:**
```css
/* Mirror horizontal icons in RTL */
[dir="rtl"] .icon-arrow-right {
  transform: scaleX(-1);
}

/* Tailwind approach */
<svg className="rtl:-scale-x-100">
  <!-- arrow pointing right -->
</svg>
```

**Icons that SHOULD be mirrored in RTL:**
- Arrows (left/right)
- Chevrons (left/right)
- "Back" / "Forward" navigation icons
- Progress indicators
- Reply / Forward email icons
- Breadcrumb separators

**Icons that should NOT be mirrored:**
- Checkmarks
- Plus / Minus
- Up / Down arrows
- Search (magnifying glass)
- Clock icons
- Play / Pause (media controls)
- Social media logos

### Bug 2: Scrollbar Position

**Problem:** In RTL, the scrollbar should appear on the left side of the page.

**Fix:** This is automatic when `dir="rtl"` is set on `<html>`. If it's not working:
```css
/* Force scrollbar position */
html[dir="rtl"] {
  overflow-y: scroll;
}
```

**Note:** Firefox and Chrome handle this differently. Firefox correctly moves the scrollbar to the left. Chrome also handles it correctly in modern versions, but older versions may need the `overflow-y: scroll` fix.

### Bug 3: Checkbox/Radio Label Alignment

**Problem:** Checkbox or radio button appears on wrong side relative to label.

**Fix:**
```html
<!-- In RTL, flexbox row puts checkbox on the right (correct) -->
<label class="flex items-center gap-2">
  <input type="checkbox" />
  <span>אני מסכים לתנאי השימוש</span>
</label>
```

The checkbox appears on the right in RTL (because flex-direction: row flows right-to-left), which is the correct behavior.

### Bug 4: Dropdown Menu Alignment

**Problem:** Dropdown menus open on the wrong side.

**Fix:**
```css
/* Position dropdown from the start side (right in RTL) */
.dropdown-menu {
  position: absolute;
  inset-inline-start: 0;
  top: 100%;
}

/* Tailwind */
<div className="absolute start-0 top-full">
```

### Bug 5: Modal/Popup Positioning

**Problem:** Close button and content in modals may be misaligned.

**Fix:**
```html
<!-- Close button should be on start side (right in RTL) -->
<div class="relative">
  <button class="absolute top-4 start-4">✕</button>
  <!-- In RTL, start-4 puts it on the right (correct for RTL close button) -->
</div>
```

### Bug 6: Carousel/Slider Direction

**Problem:** Carousel "next" and "previous" are reversed.

**Fix:**
```tsx
// Swap next/prev button behavior in RTL
const isRTL = document.documentElement.dir === 'rtl'

function handleNext() {
  if (isRTL) {
    goToPrevSlide() // In RTL, "next" is to the left
  } else {
    goToNextSlide()
  }
}
```

Or use a carousel library that supports RTL natively (e.g., Swiper.js with `rtl: true`).

### Bug 7: CSS `text-overflow: ellipsis` Direction

**Problem:** Ellipsis appears on wrong side of truncated text.

**Fix:**
```css
.truncate-rtl {
  direction: rtl;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  /* Ellipsis correctly appears on the left (end) in RTL */
}
```

### Bug 8: Box Shadow Direction

**Problem:** Shadows with horizontal offset look wrong in RTL.

**Fix:**
```css
/* Negate x-offset for RTL */
.card-ltr { box-shadow: 4px 4px 8px rgba(0,0,0,0.1); }
.card-rtl { box-shadow: -4px 4px 8px rgba(0,0,0,0.1); }

/* Or use non-directional shadows (recommended) */
.card { box-shadow: 0 4px 8px rgba(0,0,0,0.1); } /* No x-offset = safe */
```

### Bug 9: Number Display in Sentences

**Problem:** Numbers in Hebrew sentences can display in wrong order.

**Fix:**
```html
<!-- Wrap numbers in LTR span -->
<p>יש לנו <span dir="ltr">1,234</span> לקוחות מרוצים</p>

<!-- For percentages -->
<p>חסכו עד <span dir="ltr">50%</span> בהזמנה הראשונה</p>
```

### Bug 10: Sticky/Fixed Elements

**Problem:** Fixed/sticky elements positioned with `left`/`right` appear on wrong side.

**Fix:**
```css
/* Use logical properties */
.floating-button {
  position: fixed;
  inset-inline-start: 1.5rem;  /* right in RTL */
  bottom: 1.5rem;
}

/* Tailwind */
<div className="fixed bottom-6 start-6">
```

---

## 10. Testing RTL

### Browser Differences

| Feature | Chrome | Firefox | Safari |
|---------|--------|---------|--------|
| Scrollbar position | Left (correct) | Left (correct) | Left (correct) |
| Logical properties | Full support | Full support | Full support |
| `dir` attribute | Full support | Full support | Full support |
| BiDi algorithm | Good | Excellent | Good |
| Font rendering | Crisp | Slightly different | Smooth |

### Testing Checklist

- [ ] All text is right-aligned by default
- [ ] Navigation flows right-to-left
- [ ] Flexbox layouts flow right-to-left
- [ ] Icons with direction (arrows, chevrons) are mirrored
- [ ] Phone numbers display left-to-right
- [ ] Email addresses display left-to-right
- [ ] Form labels are right-aligned or above fields
- [ ] Form inputs for phone/email have `dir="ltr"`
- [ ] Dropdown menus open on the correct side
- [ ] Scrollbar is on the left side
- [ ] WhatsApp button is on the left side (start side in RTL)
- [ ] Gradients flow in the expected direction
- [ ] Shadows look natural
- [ ] Carousel/slider navigation is correct
- [ ] Fixed/absolute positioned elements are on correct side
- [ ] Border radius is applied to correct corners
- [ ] Padding and margin spacing is correct
- [ ] Tab order follows RTL flow
- [ ] No text overflow or clipping issues

### Quick RTL Toggle for Development

```tsx
// dev-only component for testing
'use client'

export function RTLToggle() {
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <button
      onClick={() => {
        const html = document.documentElement
        const isRTL = html.dir === 'rtl'
        html.dir = isRTL ? 'ltr' : 'rtl'
        html.lang = isRTL ? 'en' : 'he'
      }}
      className="fixed top-4 end-4 z-50 bg-red-500 text-white px-3 py-1 rounded text-sm"
    >
      Toggle RTL/LTR
    </button>
  )
}
```

---

## 11. Accessibility for Hebrew RTL

### ARIA and Screen Readers

```html
<!-- Correct language declaration -->
<html lang="he" dir="rtl">

<!-- For English sections within Hebrew page -->
<section lang="en" dir="ltr">
  <p>English content here</p>
</section>

<!-- For inline English in Hebrew text -->
<p>השתמשו ב-<span lang="en">Google Analytics</span> למעקב</p>
```

### Focus Order

In RTL, focus order (Tab key) follows the visual order, which is right-to-left, top-to-bottom. Ensure:
- Tab order matches visual reading order
- Focus trap in modals works correctly
- Skip navigation link is present and works

### Screen Reader Considerations

- Hebrew screen readers (like NVDA with Hebrew voice) read RTL correctly
- Ensure `lang="he"` is present for correct pronunciation
- Use `aria-label` in Hebrew for interactive elements without visible text
- Number announcement: screen readers handle numbers in RTL context, but test with NVDA/VoiceOver

---

## 12. SEO for Hebrew RTL Pages

### Meta Tags

```html
<head>
  <title>שם העסק | תיאור קצר</title>
  <meta name="description" content="תיאור בעברית עד 155 תווים" />
  <meta property="og:locale" content="he_IL" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="שם העסק | תיאור קצר" />
  <meta property="og:description" content="תיאור בעברית" />
  <meta property="og:url" content="https://www.example.co.il" />
  <meta property="og:site_name" content="שם העסק" />
  <link rel="canonical" href="https://www.example.co.il" />
</head>
```

### Hreflang (If Multilingual)

```html
<!-- Only needed if the site has both Hebrew and English versions -->
<link rel="alternate" hreflang="he" href="https://www.example.co.il" />
<link rel="alternate" hreflang="en" href="https://www.example.co.il/en" />
<link rel="alternate" hreflang="x-default" href="https://www.example.co.il" />
```

### Structured Data Language

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "שם העסק",
  "description": "תיאור העסק בעברית",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "תל אביב",
    "addressCountry": "IL"
  },
  "telephone": "+972-54-123-4567",
  "inLanguage": "he"
}
```
