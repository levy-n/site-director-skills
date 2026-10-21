# Motion System Reference

## Philosophy

**ONE orchestrated moment per view or section.** Do not scatter unrelated micro-interactions across a page. Every animation must answer: "What did this motion communicate?" If the answer is "nothing — it just moves," remove it.

Animation exists to:
- **Orient** — show where something came from or went to
- **Focus** — draw attention to what matters right now
- **Connect** — reveal relationships between elements
- **Delight** — reward interaction (sparingly, never gratuitously)

A page with one beautifully choreographed entrance sequence is more impressive than a page where every element wiggles independently.

---

## Animation Stack Decision Matrix

**Always try CSS-native first. Add JS libraries only when CSS can't achieve the effect.**

| Need | Best Choice | Size | License |
|------|-------------|------|---------|
| Simple transitions, hover states | CSS-native / TailwindCSS Motion | 0-5KB | N/A |
| Scroll-driven effects | CSS `scroll-timeline` + `animation-timeline` | 0KB | Native |
| Page/route transitions | View Transitions API | 0KB | Native |
| React project animations | **Motion** (formerly Framer Motion) | ~85KB | MIT |
| Complex scroll timelines, SVG animation | **GSAP** + ScrollTrigger | ~78KB | 100% free incl. all plugins (since v3.13 / Webflow acquisition) |
| Smooth scrolling | **Lenis** | ~3KB | MIT |
| 3D scene timeline animation | Theatre.js | Varies | Apache 2.0 |
| Tooltip/dropdown positioning | CSS anchor positioning | 0KB | Native |

For CSS scroll-driven animations and View Transitions → see `references/css-2026.md`.

---

## GSAP (GreenSock Animation Platform)

### When to Use GSAP Over Motion
- Complex timeline choreography with precise sequencing
- SVG animation (morphing, drawing, path following)
- Scroll-triggered animations with scrubbing (frame-by-frame control during scroll)
- Non-React projects or vanilla JS

### License Warning
As of April 2025, Webflow made GSAP 100% free. However, the license prohibits use in tools that compete with Webflow, and Webflow can terminate the license at discretion. For guaranteed long-term stability, prefer **Motion (MIT license)** for React projects.

### Basic GSAP Pattern

```typescript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Timeline with scroll trigger
gsap.timeline({
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top center',
    end: 'bottom center',
    scrub: 1, // Smooth scrub — animation follows scroll position
  },
})
  .from('.hero-title', { y: 100, opacity: 0, duration: 0.8 })
  .from('.hero-subtitle', { y: 60, opacity: 0, duration: 0.6 }, '-=0.4')
  .from('.hero-cta', { scale: 0.9, opacity: 0, duration: 0.4 }, '-=0.2');
```

---

## Lenis Smooth Scroll

Ultra-lightweight (3KB) smooth scroll engine. Uses native `scrollTo`, not transforms — so `position: sticky` works correctly.

### Setup

```typescript
import Lenis from 'lenis';

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // ease-out expo
  smoothWheel: true,
});

function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

### Lenis + GSAP Integration

```typescript
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const lenis = new Lenis();

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

---

## Motion (formerly Framer Motion) — Core Patterns

Motion is the primary React animation library. MIT licensed, 16M+ downloads/month. Master these patterns in order of importance.

### Basic motion component

```tsx
import { motion } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
  Content appears here
</motion.div>
```

- `initial` — state before animation begins (mount state)
- `animate` — target state to animate toward
- `exit` — state to animate to before unmounting (requires `AnimatePresence`)
- `transition` — timing, easing, spring config

### AnimatePresence for mount/unmount

```tsx
import { AnimatePresence, motion } from "motion/react";

function Notification({ message, isVisible }: Props) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

`mode="wait"` ensures the exiting element fully leaves before the entering element appears. Use this for route transitions and content swaps.

### Spring physics

Springs feel more natural than duration-based easing. Use them for interactive and responsive animations.

```tsx
<motion.div
  animate={{ scale: 1 }}
  whileHover={{ scale: 1.05 }}
  transition={{
    type: "spring",
    stiffness: 400,
    damping: 25,
    mass: 1,
  }}
/>
```

**Spring tuning guide:**

| Feel | Stiffness | Damping | Mass |
|------|-----------|---------|------|
| Snappy, responsive | 400-600 | 25-35 | 0.5-1 |
| Smooth, confident | 200-350 | 20-28 | 1 |
| Soft, gentle | 100-200 | 15-22 | 1-1.5 |
| Bouncy, playful | 300-500 | 10-18 | 1 |

**Rule of thumb:** high stiffness + high damping = snappy. Low stiffness + low damping = wobbly. Match the feel to the interaction weight.

### useInView for scroll-triggered animations

```tsx
import { useInView, motion } from "motion/react";
import { useRef } from "react";

function RevealSection({ children }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,       // animate only on first appearance
    margin: "-100px", // trigger 100px before element enters viewport
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

Always use `once: true` for scroll reveals — elements re-animating on every scroll pass is disorienting and annoying.

### Staggered children with variants

```tsx
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

function FeatureGrid({ features }: Props) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {features.map((feature) => (
        <motion.div key={feature.id} variants={itemVariants}>
          <FeatureCard {...feature} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

**Stagger timing:** 0.05-0.1s per item for 3-6 items. For longer lists (8+), reduce to 0.03-0.05s or stagger only the first 5-6 and instant-show the rest.

### Layout animations with layoutId

Shared element transitions — the same visual element morphs between two states or positions:

```tsx
function ProjectList({ projects, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {projects.map((project) => (
        <motion.div
          key={project.id}
          layoutId={`project-${project.id}`}
          onClick={() => onSelect(project.id)}
          className="cursor-pointer rounded-xl bg-surface p-4"
        >
          <motion.h3 layoutId={`title-${project.id}`}>
            {project.title}
          </motion.h3>
        </motion.div>
      ))}
    </div>
  );
}

function ProjectDetail({ project, onClose }: Props) {
  return (
    <motion.div
      layoutId={`project-${project.id}`}
      className="fixed inset-4 rounded-2xl bg-surface p-8"
    >
      <motion.h3 layoutId={`title-${project.id}`}>
        {project.title}
      </motion.h3>
      <p>{project.description}</p>
      <button onClick={onClose}>Close</button>
    </motion.div>
  );
}
```

Both components must be rendered within the same `AnimatePresence` or `LayoutGroup` for the transition to work.

### Gesture animations

```tsx
<motion.button
  whileHover={{ scale: 1.04, y: -2 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
  className="rounded-lg bg-accent px-6 py-3 text-accent-text"
>
  Click me
</motion.button>

<motion.div
  whileHover={{ boxShadow: "0 8px 30px oklch(0% 0 0 / 0.12)" }}
  transition={{ duration: 0.2 }}
  className="rounded-xl bg-surface p-6"
>
  Card with hover shadow
</motion.div>
```

Keep hover/tap effects subtle. `scale: 1.02-1.05` for hover, `scale: 0.95-0.98` for tap. Anything larger feels cartoonish.

---

## Staggered Page Load Reveal — Full Implementation

The single most useful animation pattern. Use this as the default page/section entrance:

```tsx
import { motion } from "motion/react";

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0], // custom ease-out
    },
  },
};

const fadeScale = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

function HeroSection() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.span variants={fadeUp} className="text-accent">
        Tagline
      </motion.span>
      <motion.h1 variants={fadeUp}>
        Main Headline
      </motion.h1>
      <motion.p variants={fadeUp}>
        Supporting description text
      </motion.p>
      <motion.div variants={fadeScale}>
        <Button>Primary CTA</Button>
      </motion.div>
    </motion.section>
  );
}
```

---

## CSS @keyframes Fallback

For non-React contexts, lightweight pages, or progressive enhancement:

```css
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal-item {
  opacity: 0;
  animation: fade-up 0.5s ease-out forwards;
}

/* Staggered children via nth-child */
.reveal-item:nth-child(1) { animation-delay: 0.0s; }
.reveal-item:nth-child(2) { animation-delay: 0.1s; }
.reveal-item:nth-child(3) { animation-delay: 0.2s; }
.reveal-item:nth-child(4) { animation-delay: 0.3s; }
.reveal-item:nth-child(5) { animation-delay: 0.4s; }

/* Or use custom properties for dynamic stagger */
.reveal-item {
  animation-delay: calc(var(--index, 0) * 0.1s);
}
```

---

## Easing Curves

| Context | Easing | CSS Value | Framer Motion | Reason |
|---------|--------|-----------|---------------|--------|
| Element entering | ease-out | `cubic-bezier(0.25, 0.1, 0.25, 1.0)` | `ease: "easeOut"` | Decelerates into resting position — feels like arriving |
| Element exiting | ease-in | `cubic-bezier(0.42, 0, 1, 1)` | `ease: "easeIn"` | Accelerates away — feels like departing |
| Interactive (hover, tap) | spring | N/A | `type: "spring"` | Physical, responsive, alive |
| Continuous/looping | linear | `linear` | `ease: "linear"` | Only for progress bars, spinners, marquees |

**NEVER use linear easing for UI transitions.** Linear motion looks robotic and unnatural. The only exceptions are continuous animations (spinners, progress indicators, ticker scrolls).

---

## Duration Guidelines

| Category | Duration | Examples |
|----------|----------|---------|
| Micro-interactions | 100-200ms | Button press, toggle, checkbox |
| UI transitions | 200-400ms | Panel slide, accordion, tab switch |
| Modal/overlay | 250-400ms | Dialog open, drawer slide |
| Page transitions | 300-600ms | Route change, view swap |
| Decorative entrance | 500-1200ms | Hero reveal, scroll animations |
| **Maximum** | **1200ms** | Nothing should take longer |

### Performance-critical rules:
- **ONLY animate `transform` and `opacity`** — these are composited by the GPU
- **NEVER animate `width`, `height`, `top`, `left`, `margin`, `padding`** — these trigger layout recalculation
- Use `transform: scale()` instead of animating dimensions
- Use `transform: translate()` instead of animating position properties

---

## Accessibility

### prefers-reduced-motion

Always respect the user's motion preferences. This is not optional.

**CSS approach:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Framer Motion approach:**
```tsx
import { useReducedMotion, motion } from "motion/react";

function AnimatedCard({ children }: Props) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.4, ease: "easeOut" }
      }
    >
      {children}
    </motion.div>
  );
}
```

**Best practice:** For reduced motion, provide instant state changes (duration: 0) rather than removing the animation entirely. The user should still see the final state — they just should not see the movement getting there.

---

## Animated Component Libraries

Use these as inspiration and reference for pre-built patterns. Study their implementations to understand timing and choreography:

| Library | Focus | URL |
|---------|-------|-----|
| **Magic UI** | Animated React components, text effects, borders | magicui.design |
| **Aceternity UI** | Dramatic scroll effects, 3D cards, spotlight | ui.aceternity.com |
| **Cult UI** | Minimal animated primitives, text reveals | www.cult-ui.com |

Do not blindly copy from these libraries. Extract the timing, easing, and choreography principles, then implement them within your own design system.

---

## Performance Rules

### Only animate compositable properties
The browser can GPU-accelerate `transform` and `opacity`. Everything else triggers expensive layout or paint recalculations.

```tsx
// GOOD — GPU composited
<motion.div animate={{ x: 100, opacity: 0.5, scale: 1.1, rotate: 45 }} />

// BAD — triggers layout
<motion.div animate={{ width: "200px", height: "100px", marginTop: 20 }} />
```

### will-change
Use sparingly and only on elements that will actually animate:
```css
/* Only on the element about to animate */
.about-to-animate { will-change: transform, opacity; }

/* Remove after animation completes if possible */
```
Do NOT apply `will-change` to every element — it consumes GPU memory and can degrade performance.

### layout prop costs
Framer Motion's `layout` prop enables automatic layout animations but measures DOM positions on every render. Guidelines:
- Use `layoutId` for specific shared-element transitions (targeted, efficient)
- Avoid `layout` on large lists or deeply nested trees
- Wrap layout-animated elements in `LayoutGroup` to scope recalculations

### Scroll-based animation performance
- Use `useInView` (IntersectionObserver-based) instead of scroll event listeners
- Set `once: true` on scroll-triggered animations to avoid repeated re-renders
- Avoid animating during active scroll — trigger animations when elements enter the viewport, not continuously as the user scrolls

---

## RTL Layout Note

In right-to-left layouts, horizontal animations must enter from the RIGHT side to match the reading direction.

**Standard (LTR) entrance — element slides in from left:**
```tsx
const ltrSlideIn = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};
```

**RTL entrance — element slides in from right:**
```tsx
const rtlSlideIn = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};
```

**Direction-aware helper:**
```tsx
function useDirectionalVariants(distance = 30) {
  const isRtl = document.documentElement.dir === "rtl";

  return {
    slideIn: {
      hidden: { opacity: 0, x: isRtl ? distance : -distance },
      visible: { opacity: 1, x: 0 },
    },
    slideOut: {
      hidden: { opacity: 1, x: 0 },
      visible: { opacity: 0, x: isRtl ? -distance : distance },
    },
  };
}
```

Vertical animations (`y` axis) are direction-agnostic and do not need RTL adjustment.
