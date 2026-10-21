# Design System - [שם הלקוח]

*נוצר על ידי MediaWave Pipeline | תאריך: [DATE]*

---

## 1. Color Palette

### Primary Colors
| Name | HEX | Usage |
|------|-----|-------|
| Primary | `#______` | כפתורים, קישורים, אלמנטים עיקריים |
| Primary Light | `#______` | רקע בהיר, hover states |
| Primary Dark | `#______` | טקסט על רקע בהיר, pressed states |

### Secondary Colors
| Name | HEX | Usage |
|------|-----|-------|
| Secondary | `#______` | אלמנטים משניים, borders |
| Secondary Light | `#______` | רקעים משניים |

### Accent Color
| Name | HEX | Usage |
|------|-----|-------|
| Accent | `#______` | CTAs בולטים, badges, highlights |

### Neutrals
| Name | HEX | Usage |
|------|-----|-------|
| Gray 900 | `#______` | טקסט ראשי |
| Gray 700 | `#______` | טקסט משני |
| Gray 500 | `#______` | placeholder, disabled |
| Gray 300 | `#______` | borders, dividers |
| Gray 100 | `#______` | רקע שני |
| White | `#FFFFFF` | רקע ראשי |

### Semantic Colors
| Name | HEX | Usage |
|------|-----|-------|
| Success | `#______` | הודעות הצלחה, אישור |
| Warning | `#______` | אזהרות |
| Error | `#______` | שגיאות טפסים |

---

## 2. Typography

### Hebrew Font (Primary)
- **Font Family**: `______` (Google Fonts)
- **Weights**: Regular (400), Medium (500), Bold (700)
- **Usage**: כל הטקסט העברי - כותרות, גוף, כפתורים

### English/Numbers Font (Secondary)
- **Font Family**: `______` (Google Fonts)
- **Usage**: מספרי טלפון, URLs, שמות מותגים באנגלית

### Type Scale
| Level | Size (Desktop) | Size (Mobile) | Weight | Line Height | Usage |
|-------|---------------|---------------|--------|-------------|-------|
| H1 | 48px / 3rem | 36px / 2.25rem | 700 | 1.2 | Hero headline |
| H2 | 36px / 2.25rem | 28px / 1.75rem | 700 | 1.25 | Section titles |
| H3 | 24px / 1.5rem | 20px / 1.25rem | 600 | 1.3 | Sub-sections |
| H4 | 20px / 1.25rem | 18px / 1.125rem | 600 | 1.35 | Card titles |
| Body Large | 18px / 1.125rem | 16px / 1rem | 400 | 1.6 | Hero subtext |
| Body | 16px / 1rem | 16px / 1rem | 400 | 1.6 | Paragraphs |
| Small | 14px / 0.875rem | 14px / 0.875rem | 400 | 1.5 | Captions, meta |
| Button | 16px / 1rem | 16px / 1rem | 600 | 1 | Buttons, CTAs |

**Note**: Hebrew font sizes are ~10% larger than English equivalents in headings and buttons.

---

## 3. Spacing Scale

Base unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing, icon gaps |
| `space-2` | 8px | Inline element spacing |
| `space-3` | 12px | Small component padding |
| `space-4` | 16px | Default padding, form gaps |
| `space-6` | 24px | Card padding, between elements |
| `space-8` | 32px | Section internal padding |
| `space-12` | 48px | Between major components |
| `space-16` | 64px | Section gaps (mobile) |
| `space-24` | 96px | Section gaps (desktop) |
| `space-32` | 128px | Hero padding top/bottom |

---

## 4. Component Tokens

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | `______px` | Tags, badges |
| `radius-md` | `______px` | Inputs, cards |
| `radius-lg` | `______px` | Buttons, modals |
| `radius-full` | `9999px` | Avatars, pills |

### Shadows
| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards, subtle depth |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Dropdowns, popovers |
| `shadow-lg` | `0 10px 25px rgba(0,0,0,0.1)` | Modals, hero cards |

### Transitions
| Token | Value | Usage |
|-------|-------|-------|
| `transition-fast` | `150ms ease` | Hover states, color changes |
| `transition-normal` | `250ms ease` | Layout changes, transforms |
| `transition-slow` | `400ms ease-out` | Page transitions, modals |

---

## 5. Motion Guidelines

- **Entrance animations**: Subtle fade + slight translate (max 20px)
- **Duration**: 300-500ms for entrances, 150-200ms for micro-interactions
- **Easing**: `ease-out` for entrances, `ease-in-out` for transforms
- **Stagger**: 50-100ms between sequential elements
- **Scroll-triggered**: Use Intersection Observer, trigger once only
- **AVOID**: bounce, spin, excessive parallax, auto-playing carousels

---

## 6. Tailwind CSS Theme Config

```typescript
// tailwind.config.ts - paste this into the project
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#______',
          light: '#______',
          dark: '#______',
        },
        secondary: {
          DEFAULT: '#______',
          light: '#______',
        },
        accent: '#______',
      },
      fontFamily: {
        hebrew: ['______', 'sans-serif'],
        english: ['______', 'sans-serif'],
      },
      borderRadius: {
        sm: '______px',
        md: '______px',
        lg: '______px',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 7. Anti-Generic Checklist

- [ ] NOT using Inter, Roboto, or system-ui as primary font
- [ ] NOT using purple/blue gradients
- [ ] Color palette is UNIQUE to this client
- [ ] At least one distinctive design element exists
- [ ] Hebrew fonts tested at all weights
- [ ] Colors pass WCAG 2.1 AA contrast ratio (4.5:1)
- [ ] Design system reviewed and approved by operator
