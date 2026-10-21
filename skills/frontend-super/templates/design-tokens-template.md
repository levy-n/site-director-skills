# Design Tokens Template

Copy this into your project's CSS (e.g., `src/styles/tokens.css`) and customize the values.

```css
:root {
  /* ===== TYPOGRAPHY ===== */
  --font-display: '[Display Font]', sans-serif;
  --font-body: '[Body Font]', serif;
  --font-mono: 'JetBrains Mono', monospace;
  /* Hebrew projects: add Hebrew fonts first */
  /* --font-display: 'Noa Shalev', 'Heebo', sans-serif; */
  /* --font-body: 'Yarden', 'Heebo', sans-serif; */

  /* Type Scale — Perfect Fourth (1.333) */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.33vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --text-xl: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
  --text-2xl: clamp(2rem, 1.5rem + 2.5vw, 3rem);
  --text-3xl: clamp(2.5rem, 1.8rem + 3.5vw, 4.5rem);

  /* Font Weights — use extreme contrast */
  --weight-light: 200;
  --weight-regular: 400;
  --weight-bold: 700;
  --weight-black: 900;

  /* ===== SPACING (8pt grid) ===== */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */

  /* Named Spatial Concepts */
  --inset-sm: var(--space-2);    /* 8px — tight content padding */
  --inset-md: var(--space-4);    /* 16px — default content padding */
  --inset-lg: var(--space-6);    /* 24px — generous content padding */
  --stack-sm: var(--space-2);    /* 8px — tight vertical gap */
  --stack-md: var(--space-4);    /* 16px — default vertical gap */
  --stack-lg: var(--space-8);    /* 32px — generous vertical gap */
  --section-gap: var(--space-16); /* 64px — between page sections */

  /* ===== COLORS (OKLCH) ===== */
  /* Light theme */
  --color-bg: oklch(98% 0.005 80);
  --color-surface: oklch(95% 0.01 80);
  --color-elevated: oklch(100% 0 0);
  --color-text: oklch(25% 0.02 80);
  --color-text-muted: oklch(55% 0.02 80);
  --color-accent: oklch(65% 0.25 30);
  --color-accent-hover: oklch(60% 0.28 30);
  --color-border: oklch(85% 0.01 80);

  /* Dark theme (uncomment or use with .dark class) */
  /*
  --color-bg: oklch(15% 0.01 80);
  --color-surface: oklch(20% 0.015 80);
  --color-elevated: oklch(25% 0.02 80);
  --color-text: oklch(90% 0.01 80);
  --color-text-muted: oklch(60% 0.01 80);
  --color-accent: oklch(70% 0.22 30);
  --color-accent-hover: oklch(75% 0.25 30);
  --color-border: oklch(30% 0.015 80);
  */

  /* ===== MOTION ===== */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.87, 0, 0.13, 1);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;

  /* ===== LAYOUT ===== */
  --max-width: 1280px;
  --content-width: 720px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}
```

## Tailwind Integration

Map these tokens in `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

export default {
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        elevated: 'var(--color-elevated)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        border: 'var(--color-border)',
      },
    },
  },
} satisfies Config;
```
