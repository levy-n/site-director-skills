# Animation Research Agent Reference

Comprehensive workflow for discovering, evaluating, and integrating animations into Hebrew RTL landing pages. Context carries forward: animations must match the client's industry, design system colors, and performance budget established in earlier phases.

---

## Animation Sources Catalog

### JSON / Vector Animation Libraries

| Source | URL | Best For | License | Notes |
|--------|-----|----------|---------|-------|
| **LottieFiles** | [lottiefiles.com](https://lottiefiles.com) | JSON animations, lightweight, scalable. Largest library of micro-animations, icons, illustrations, hero backgrounds | Lottie Simple License (free for commercial use, no attribution required) | 90KB+ runtime - always lazy-load. Use `@lottiefiles/react-lottie-player` or `lottie-react` |
| **LottieFiles Free** | [lottiefiles.com/free-animations](https://lottiefiles.com/free-animations) | Curated free collection. Search by keyword: "food", "tech", "health", etc. | Free for commercial use | Filter by "Free" tag. Check individual animation license before use |
| **Rive** | [rive.app/community](https://rive.app/community) | Interactive, state-based animations. Responds to hover, click, scroll, and data inputs | Free tier available. Community files shareable | Ultra-lightweight vector files. Smaller than Lottie equivalents. Used by Spotify, Duolingo, Google |
| **SVGator** | [svgator.com](https://svgator.com) | Animated SVGs. Logo animations, icon transitions, decorative elements | Free tier: 3 projects, limited exports. Paid for commercial | Good for custom brand animations. Exports clean SVG code |

### CSS-Only Animation Libraries (Zero JS)

| Source | URL | Best For | License | Notes |
|--------|-----|----------|---------|-------|
| **Animista** | [animista.net](https://animista.net) | CSS animation presets. Entrances, exits, attention seekers, text effects | Free, open source | Zero JS overhead. Copy-paste CSS. Perfect for "Minimal" tier budgets |
| **Hover.css** | [github.com/IanLunn/Hover](https://github.com/IanLunn/Hover) | Hover effect library. Button transforms, icon transitions, background effects | MIT License (free commercial) | ~100+ hover effects. CSS-only. Great for CTA buttons |
| **AOS (Animate On Scroll)** | [michalsnik.github.io/aos](https://michalsnik.github.io/aos) | Scroll-triggered reveal animations. Fade, slide, zoom, flip | MIT License | 14KB. Data-attribute driven. Easy integration. `data-aos="fade-up"` |

### Professional Animation Frameworks

| Source | URL | Best For | License | Notes |
|--------|-----|----------|---------|-------|
| **GSAP + ScrollTrigger** | [gsap.com](https://gsap.com) | Professional scroll-driven animations. Parallax, pinning, scrubbing, timeline | **100% free for all uses including commercial** (since Webflow acquisition 2024) | Industry standard. All plugins now free: SplitText, MorphSVG, ScrollSmoother. ~60KB core |
| **Motion (Framer Motion)** | [motion.dev](https://motion.dev) | React animation library. Layout animations, gestures, drag, exit animations | MIT License | Full-featured but heavier (~30KB). Deep React integration. `AnimatePresence` for page transitions |
| **Motion One** | [motion.dev](https://motion.dev) | Lightweight alternative to Framer Motion. Simple entrance/exit animations | MIT License | Only 3.8KB. Uses Web Animation API. For projects where bundle size is critical |

### 3D & Creative Animation

| Source | URL | Best For | License | Notes |
|--------|-----|----------|---------|-------|
| **Three.js** | [threejs.org](https://threejs.org) | 3D backgrounds: particles, waves, gradients, geometric shapes | MIT License | Heavy (~600KB). Only use for premium-tier pages. Always lazy-load |
| **Spline** | [spline.design](https://spline.design) | 3D web animations, interactive 3D scenes. No-code 3D editor | Free tier available | Embed via iframe or React component. Good for hero sections |
| **Vanta.js** | [vantajs.com](https://www.vantajs.com) | Animated 3D backgrounds: birds, fog, waves, globe, net | MIT License | Easy setup. Multiple effects. Requires Three.js dependency |

### Community & Inspiration

| Source | URL | Best For | License | Notes |
|--------|-----|----------|---------|-------|
| **CodePen** | [codepen.io](https://codepen.io) | Community animations. Search by keyword: "landing page hero", "scroll animation" | Varies per pen (check each) | Great for finding creative solutions. Always verify license |
| **Codrops** | [tympanus.net/codrops](https://tympanus.net/codrops) | Creative UI demos, experimental animations, page transitions | MIT License (most demos) | High-quality creative references. Tutorials included |
| **Uiverse** | [uiverse.io](https://uiverse.io) | UI elements with animations: buttons, cards, loaders, toggles | Open source | Community-contributed. Copy-paste ready |

---

## Industry-Specific Animation Mapping

For each business type, recommended search terms and sources. Always cross-reference with the client's design direction from Phase 2.

### Food & Hospitality
| Business Type | Search Keywords | Best Sources | Animation Examples |
|---------------|----------------|--------------|-------------------|
| Bakery | food, cooking, steam, warmth, plate, baking, dough, pastry, oven | LottieFiles, CodePen | Rising bread Lottie, steam/smoke CSS, warm gradient backgrounds |
| Restaurant | dining, chef, plate presentation, cutlery, serving | LottieFiles, Rive | Plate reveal, fork/knife icon animations, menu card flip |
| Cafe | coffee, cup, steam, beans, pour, latte art | LottieFiles | Coffee pour Lottie, steam rise CSS, bean scatter |
| Catering | party, celebration, serving tray, buffet | LottieFiles | Serving tray reveal, confetti burst for events |

### Beauty & Personal Care
| Business Type | Search Keywords | Best Sources | Animation Examples |
|---------------|----------------|--------------|-------------------|
| Hair Salon | flowing hair, scissors, comb, elegant, shimmer | LottieFiles, SVGator | Hair flow Lottie, scissors snip, mirror reflection CSS |
| Beauty Salon | makeup, brush, mirror, skincare, glow, sparkle | LottieFiles, Rive | Brush stroke animation, shimmer/glow CSS overlay |
| Spa/Wellness | zen, calm, water ripple, stones, candle, lotus | LottieFiles, CodePen | Water ripple CSS, lotus bloom Lottie, breathing circle |
| Nail Salon | nail polish, manicure, hands, color palette | LottieFiles | Polish brush stroke, color swatch rotation |

### Technology & SaaS
| Business Type | Search Keywords | Best Sources | Animation Examples |
|---------------|----------------|--------------|-------------------|
| SaaS / Tech | data flow, particles, geometric, code, dashboard, API | Three.js, Spline, GSAP | Particle network background, data flow visualization, morphing geometries |
| Agency | creative, portfolio, showcase, grid, layout | GSAP, Framer Motion | Staggered grid reveal, image parallax, smooth page transitions |
| E-commerce | shopping cart, product, package, delivery | LottieFiles, Rive | Cart icon micro-animation, package delivery Lottie |

### Health & Wellness
| Business Type | Search Keywords | Best Sources | Animation Examples |
|---------------|----------------|--------------|-------------------|
| Health / Medical | heartbeat, pulse, medical, health, care, stethoscope | LottieFiles | Heartbeat line, pulse animation, medical icon set |
| Fitness / Gym | energy, pulse, dynamic, movement, heartbeat, workout | LottieFiles, CSS | Energy pulse radial, dynamic movement lines, progress ring |
| Yoga / Meditation | breathing, circle, nature, calm, waves, mandala | CodePen, CSS | Breathing circle expand/contract, wave motion, mandala rotation |
| Nutrition | food, healthy, leaf, growth, fruit, vitamins | LottieFiles | Leaf growth, fruit bounce, nutrition icon set |

### Professional Services
| Business Type | Search Keywords | Best Sources | Animation Examples |
|---------------|----------------|--------------|-------------------|
| Education | books, lightbulb, growth tree, graduation, learning, pencil | LottieFiles, Rive | Book page flip, lightbulb glow, tree growth |
| Real Estate | buildings, doors, key, house, construction, skyline | LottieFiles, Spline | Building rise, door opening, key turning Lottie |
| Law / Legal | scales, gavel, shield, document, handshake, justice | LottieFiles | Scales balance, shield protect, document signing |
| Finance / Accounting | growth chart, coins, calculator, piggy bank, graph | LottieFiles | Chart line draw, coin stack, upward trend |
| Insurance | umbrella, shield, family, protection, safety | LottieFiles | Umbrella open, shield icon, family protection |

### Creative & Events
| Business Type | Search Keywords | Best Sources | Animation Examples |
|---------------|----------------|--------------|-------------------|
| Photography | camera, shutter, lens, flash, gallery, frame | LottieFiles, GSAP | Camera shutter Lottie, image reveal mask, gallery grid stagger |
| Event Planning | confetti, celebration, party, calendar, invitation | LottieFiles | Confetti burst, calendar flip, invitation open |
| Music / DJ | equalizer, sound wave, headphones, vinyl, notes | LottieFiles, CSS | Sound wave visualization, equalizer bars, vinyl spin |

---

## Animation Placement Guide

Where each animation type belongs on the landing page. Every placement must serve a purpose: guide attention, reinforce brand, or increase engagement.

### Hero Section (Above the Fold)
- **Purpose:** Immediate visual impact, set brand tone
- **Recommended:** 1-2 background or illustrative animations
- **Options:**
  - Lottie illustration matching client industry (e.g., bakery: rising bread, tech: data flow)
  - Rive interactive scene (responds to mouse movement)
  - CSS gradient animation (subtle color shift background)
  - Three.js/Vanta.js particle background (premium tier only)
  - GSAP text reveal for headline (character-by-character or word-by-word)
- **Performance:** Hero animations load first, so keep under 40KB. Use `loading="eager"` only for critical hero Lottie.
- **RTL Note:** Hero text reveals must animate right-to-left. Slide-in elements enter from the right.

### Section Transitions (Scroll Reveals)
- **Purpose:** Guide user through the page narrative, create rhythm
- **Recommended:** Scroll-triggered reveals on each major section
- **Options:**
  - AOS library: `data-aos="fade-up"` with stagger delays
  - GSAP ScrollTrigger: pin, scrub, parallax effects
  - Framer Motion: `whileInView` with viewport threshold
  - CSS `@scroll-timeline` (progressive enhancement, limited support)
- **Performance:** Lightweight. CSS/AOS preferred over GSAP for simple reveals.
- **RTL Note:** `fade-right` in LTR becomes `fade-left` in RTL. Always test direction.

### Feature/Benefit Icons
- **Purpose:** Draw attention to key features, make content scannable
- **Recommended:** Animated icon set (matching design system colors)
- **Options:**
  - Lottie micro-animations: icon plays once when scrolled into view
  - SVGator custom animated icons matching brand
  - CSS icon hover effects (scale, color change, rotation)
- **Performance:** Keep each icon animation under 5KB. Use a single Lottie sprite if possible.
- **RTL Note:** Icon order should flow right-to-left in feature grids.

### CTA Buttons
- **Purpose:** Draw attention, create urgency, encourage clicks
- **Recommended:** Micro-interactions on hover and click
- **Options:**
  - CSS hover effects: scale, shadow lift, gradient shift, shimmer sweep
  - Hover.css library effects (zero JS)
  - Framer Motion `whileHover` and `whileTap` transforms
  - Lottie arrow/icon animation inside button
- **Performance:** Must be CSS-only or near-zero overhead. CTAs are critical path.
- **RTL Note:** Arrow icons point left (indicating "forward" in RTL). Shimmer sweeps right-to-left.

### Loading States
- **Purpose:** Brand-consistent loading experience, reduce perceived wait time
- **Recommended:** Custom Lottie loader matching brand colors
- **Options:**
  - Lottie loading animation (brand-colored spinner, progress bar)
  - CSS skeleton screens with pulse animation
  - SVG animated logo mark
- **Performance:** Loaders should be under 3KB. Inline SVG preferred over Lottie for initial load.

### Floating Elements
- **Purpose:** WhatsApp button, scroll-to-top, chat widget
- **Recommended:** Subtle pulse or bounce to attract attention
- **Options:**
  - CSS pulse animation on WhatsApp FAB
  - Lottie WhatsApp icon (animated phone ring)
  - CSS bounce for scroll-to-top arrow
- **Performance:** CSS-only. These persist on screen, so zero JS overhead.

---

## Per-Animation Documentation Format

For every animation discovered, document using this template before presenting to the operator:

```markdown
### Animation: [Descriptive Name]
- **Preview:** [URL to preview / LottieFiles page]
- **Description:** [What it shows, 1-2 sentences]
- **File Size:** [KB] | **Format:** [Lottie JSON / dotLottie / SVG / CSS / Rive]
- **Performance Impact:** [Minimal / Moderate / Notable]
- **License:** [License name] - Free for commercial use: [Yes/No]
- **Attribution Required:** [Yes/No] - [If yes, what attribution]
- **Integration Method:** [npm package / copy-paste CSS / embed code / download JSON]
- **RTL Compatible:** [Yes / Needs adjustment / No]
  - RTL Notes: [e.g., "Arrow points right, needs CSS `transform: scaleX(-1)` for RTL"]
- **Color Customization:** [Yes, via JSON edit / Yes, via CSS variables / No, fixed colors]
  - Palette Match: [Can match design system: Yes/No. Notes on recoloring.]
- **Placement:** [Hero / Icons / Transitions / CTA / Loading / Floating]
- **Reduced Motion Fallback:** [Static image / Hidden / CSS alternative]
```

### Example Documentation

```markdown
### Animation: Bakery Fresh Bread Rising
- **Preview:** https://lottiefiles.com/animations/bread-rising-abc123
- **Description:** Loaf of bread rising in an oven with steam, warm color palette
- **File Size:** 18KB | **Format:** Lottie JSON
- **Performance Impact:** Minimal
- **License:** Lottie Simple License - Free for commercial use: Yes
- **Attribution Required:** No
- **Integration Method:** npm `@lottiefiles/react-lottie-player`, download JSON to `/public/animations/`
- **RTL Compatible:** Yes (symmetric animation, no directional bias)
- **Color Customization:** Yes, via JSON edit (change fill colors in JSON or use LottieFiles editor)
  - Palette Match: Can match warm tones from design system. Adjust `#FFA500` to client primary.
- **Placement:** Hero (illustrative, beside headline)
- **Reduced Motion Fallback:** Static image of bread at final risen state
```

---

## Performance Budget Rules

Budget tiers align with the design system tier selected in Phase 3. Total animation payload = all animation files + runtime libraries.

### Tier Breakdown

| Tier | Label | Total Budget | Runtime Libraries | Animation Files | Approach |
|------|-------|-------------|-------------------|-----------------|----------|
| **Minimal** | Basic | < 5KB | None (CSS only) | 0KB | CSS `@keyframes`, Animista presets, `transition` properties. Zero JavaScript. |
| **Moderate** | Standard | < 50KB | AOS (14KB) or Motion One (3.8KB) | < 35KB | Lottie icon set + CSS transitions. AOS for scroll reveals. |
| **Rich** | Premium | < 100KB | lottie-react (82KB gzipped) or GSAP (60KB) | < 40KB | Hero Lottie + micro-interactions. GSAP ScrollTrigger for scroll-driven. Lazy-load everything below fold. |
| **Maximum** | Full | < 200KB | GSAP + lottie-react or Framer Motion (30KB) | < 80KB | Full animated experience. Multiple Lotties, 3D elements, page transitions. Aggressive lazy-loading and code splitting. |

### Budget Enforcement Rules

1. **Measure before integrating.** Check file sizes before adding any animation.
2. **Runtime counts once.** If using `lottie-react` (82KB), that budget is shared across all Lottie animations. The JSON files are additional.
3. **Lazy-load everything below fold.** Only hero animations load eagerly.
4. **Compress Lottie JSON.** Use dotLottie format (50-70% smaller than JSON). Or gzip JSON files.
5. **Prefer CSS over JS.** If an effect can be achieved with CSS `transition` or `@keyframes`, do not use a JS library.
6. **One library maximum** for Rich tier. Do not combine GSAP + Framer Motion + Lottie. Pick a primary approach.
7. **Monitor CWV impact.** Animations must not degrade Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), or Interaction to Next Paint (INP).

### Performance Testing Checklist
- [ ] Total animation payload within budget tier
- [ ] No layout shift caused by animation loading (reserve space with CSS)
- [ ] Hero animation plays within 1s of page load
- [ ] Below-fold animations lazy-loaded (IntersectionObserver or next/dynamic)
- [ ] `prefers-reduced-motion` respected (see Accessibility section)
- [ ] Lighthouse Performance score remains 90+
- [ ] Mobile 3G simulation: page usable within 3s

---

## Integration with Next.js 15

### Lottie Integration

```tsx
// components/LottieAnimation.tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy-load lottie-react to keep initial bundle small
const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg" />,
});

interface LottieAnimationProps {
  path: string;        // Path to JSON file in /public/animations/
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

export default function LottieAnimation({
  path,
  className = '',
  loop = true,
  autoplay = true,
}: LottieAnimationProps) {
  // Respect reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Return static fallback
    return <div className={`${className} animation-fallback`} />;
  }

  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-lg" />}>
      <Lottie
        path={path}
        loop={loop}
        autoPlay={autoplay}
        className={className}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice',
        }}
      />
    </Suspense>
  );
}
```

### Alternative: @lottiefiles/react-lottie-player (lighter)

```tsx
'use client';

import dynamic from 'next/dynamic';

const Player = dynamic(
  () => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player),
  { ssr: false }
);

export function LottiePlayer({ src, ...props }: { src: string; [key: string]: any }) {
  return (
    <Player
      autoplay
      loop
      src={src}
      style={{ height: '300px', width: '300px' }}
      {...props}
    />
  );
}
```

### GSAP ScrollTrigger Integration

```tsx
// components/ScrollReveal.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
}: {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'right' | 'left';  // RTL: 'right' = natural entry direction
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues and reduce initial bundle
    const initGSAP = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      // Check reduced motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(ref.current, { opacity: 1 });
        return;
      }

      const directionMap = {
        up: { y: 40 },
        down: { y: -40 },
        right: { x: 40 },   // RTL: elements enter from right
        left: { x: -40 },
      };

      gsap.from(ref.current, {
        ...directionMap[direction],
        opacity: 0,
        duration: 0.8,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    };

    initGSAP();
  }, [direction, delay]);

  return <div ref={ref}>{children}</div>;
}
```

### AOS (Simplest Scroll Reveal)

```tsx
// app/layout.tsx - initialize AOS globally
'use client';

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export function AOSInit() {
  useEffect(() => {
    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,           // Only animate once
      mirror: false,
      anchorPlacement: 'top-bottom',
    });
  }, []);

  return null;
}

// Usage in any component:
// <div data-aos="fade-up" data-aos-delay="100">Content</div>
// RTL: use data-aos="fade-left" instead of "fade-right" for natural entry
```

### RTL Animation Direction Rules

```tsx
// utils/rtl-animation.ts

/**
 * RTL Animation Direction Mapping
 * In RTL layouts, "forward" is right-to-left.
 * Animations that imply progression should move accordingly.
 */
export const RTL_DIRECTION_MAP = {
  // Slide directions (swap horizontal)
  'slide-in': 'slideInRight',    // Elements enter from the right in RTL
  'slide-out': 'slideOutLeft',   // Elements exit to the left in RTL

  // AOS data attributes
  'aos-enter': 'fade-left',     // In RTL, natural entry is from the right (AOS "fade-left" = enter from right)
  'aos-exit': 'fade-right',

  // Arrow/chevron icons
  'arrow-forward': 'rotate-180', // Flip horizontal for RTL
  'arrow-back': '',              // No flip needed

  // Progress indicators
  'progress-direction': 'rtl',   // Progress bars fill right-to-left

  // Carousel / slider
  'next': 'left',               // "Next" moves left in RTL
  'prev': 'right',              // "Previous" moves right in RTL
} as const;

/**
 * CSS for flipping directional animations in RTL
 */
export const RTL_ANIMATION_CSS = `
  /* Shimmer sweep: right-to-left in RTL */
  [dir="rtl"] .shimmer::after {
    animation-direction: reverse;
  }

  /* Slide animations: reverse horizontal direction */
  [dir="rtl"] .slide-in {
    transform: translateX(100%); /* Start from right */
  }

  /* Progress bars: fill from right */
  [dir="rtl"] .progress-bar {
    direction: rtl;
    transform-origin: right;
  }

  /* Directional arrows: flip for RTL */
  [dir="rtl"] .arrow-forward {
    transform: scaleX(-1);
  }
`;
```

### prefers-reduced-motion Global Handler

```css
/* globals.css - always include this */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Hide decorative animations entirely */
  .animation-decorative {
    display: none;
  }

  /* Show static fallbacks */
  .animation-fallback {
    display: block;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .animation-fallback {
    display: none;
  }
}
```

---

## Interactive Questions (via AskUserQuestion)

These questions are asked during Phase 5 (Build), after the design system and copy are approved.

### Question 1: Animation Level

```
What level of animation do you want for [Client Name]'s landing page?

A) Minimal - CSS reveals only (fade-in on scroll, hover effects). Zero JS overhead. Best for fast, simple pages.
B) Moderate - Lottie icons + CSS transitions + scroll reveals. Balanced impact and performance. (<50KB total)
C) Rich - Hero Lottie animation + micro-interactions + scroll-driven effects. Strong visual impact. (<100KB total)
D) Maximum - Full animated experience. Multiple Lotties, 3D elements, page transitions. Maximum impact. (<200KB total)

Recommendation based on [Client Type]: [Auto-suggest based on industry]
```

### Question 2: Animation Selection (after research)

```
I found [N] animations matching [Client Type / Industry]. Here are the top candidates grouped by placement:

**Hero:**
1. [Name] - [description] ([size]KB) [Preview URL]
2. [Name] - [description] ([size]KB) [Preview URL]

**Icons:**
3. [Name] - [description] ([size]KB) [Preview URL]
4. [Name] - [description] ([size]KB) [Preview URL]

**Transitions:**
5. [Name] - [description] ([size]KB) [Preview URL]
6. [Name] - [description] ([size]KB) [Preview URL]

Total budget if all selected: [X]KB / [Budget]KB

Which animations should I integrate? (Select numbers, e.g., "1, 3, 4, 5")
```

### Question 3: Performance Budget Override

```
The current animation budget is [Budget]KB ([Tier] tier).
Selected animations total [X]KB.

A) Stay within budget - I'll optimize or remove lower-priority animations
B) Allow up to [Higher Tier]KB - upgrade the animation tier
C) Performance is secondary to visual impact - integrate everything with lazy loading
```

### Question 4: Custom Requests

```
Any specific animation requests or things to avoid?

Examples:
- "I want a particle background like [URL]"
- "No auto-playing animations - only on hover/scroll"
- "Match the animation style of [competitor URL]"
- "Avoid anything too playful - this is a law firm"

(Open text, or skip if no special requests)
```

---

## Research Workflow Summary

1. **Read design system output** from Phase 3 (colors, fonts, style direction, industry)
2. **Determine animation tier** based on operator preference (Question 1)
3. **Search animation sources** using industry-specific keywords from the mapping table
4. **Document each candidate** using the Per-Animation Documentation Format
5. **Filter results** by: free commercial license, within budget, RTL compatible
6. **Check recoloring** - can animation colors match design system palette?
7. **Group by placement** (hero, icons, transitions, CTA, loading)
8. **Present to operator** (Question 2) with preview links and budget summary
9. **Confirm budget** (Question 3) if selections exceed tier
10. **Integrate approved animations** with Next.js dynamic imports and lazy loading
11. **Add reduced motion fallbacks** for all animations
12. **Test RTL direction** - verify all directional animations flow correctly in RTL
13. **Measure performance** - Lighthouse audit before and after animation integration
