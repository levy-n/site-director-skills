# Frontend Task Templates for GSD PLAN-X.md

> Use these XML templates when creating GSD plans for frontend phases.
> Each template includes `<domain-skill>` tags that reference frontend-super reference files.
> Follow the format from GSD's XML-TEMPLATES.md.

---

## Design System Setup Task

```xml
<task type="auto" id="task-1">
  <name>Set up design system tokens and fonts</name>
  <domain-skill>typography-system, color-system, spacing-system</domain-skill>
  <files>src/styles/tokens.css, src/styles/fonts.css, tailwind.config.ts</files>
  <outputs>CSS custom properties, font declarations, Tailwind theme config</outputs>
  <action>
    Follow typography-system.md for font selection:
    1. Choose display + body font pair (NO Inter/Roboto/Arial)
    2. Set up modular type scale with clamp() for fluid sizing
    3. Define weight contrast tokens (light: 200, bold: 800/900)

    Follow color-system.md for palette:
    1. Define 60/30/10 palette using OKLCH color space
    2. Create tinted neutrals (never pure gray)
    3. Set up surface hierarchy: bg → surface → elevated → overlay
    4. Ensure WCAG AA contrast ratios

    Follow spacing-system.md for spacing:
    1. Define 8pt grid scale (4, 8, 12, 16, 24, 32, 48, 64, 96)
    2. Name spatial concepts: inset, stack, inline, section-gap
    3. Map to Tailwind spacing config

    Use design-tokens-template.md as starting point.
    If RTL project: add Hebrew fonts first in stack (rtl-hebrew.md).
  </action>
  <verify>npm run build (no errors), check tokens render correctly</verify>
  <expected>All tokens defined, fonts loading, Tailwind config extended</expected>
</task>
```

## Component Creation Task

```xml
<task type="human-verify" id="task-2" depends="task-1">
  <name>Build [ComponentName] component</name>
  <domain-skill>framework-tips, typography-system</domain-skill>
  <files>src/components/[Name]/[Name].tsx, src/components/[Name]/[Name].test.tsx</files>
  <inputs>Design tokens from task-1</inputs>
  <action>
    Follow framework-tips.md React + Vite patterns:
    1. TypeScript strict props interface
    2. Tailwind CSS utility classes (no inline styles, no arbitrary values)
    3. Use design tokens from tokens.css (var(--color-accent), etc.)
    4. Mobile-first responsive (base = mobile, add md: and lg:)
    5. Handle states: loading, error, empty, populated

    Add Framer Motion entrance animation:
    - Use motion.div with initial={{ opacity: 0, y: 20 }}
    - Animate to {{ opacity: 1, y: 0 }}
    - Spring transition: type: "spring", stiffness: 400, damping: 25

    Write tests with React Testing Library:
    - Renders with required props
    - All states render correctly
    - Interactive elements work
    - Accessible (ARIA roles, keyboard)

    If RTL project: use CSS logical properties only (rtl-hebrew.md).
  </action>
  <verify>npm test -- [Name].test.tsx && npm run type-check</verify>
  <expected>All tests pass, no type errors, component renders correctly</expected>
  <human-check>Visual design matches direction from CONTEXT.md</human-check>
</task>
```

## Responsive Layout Task

```xml
<task type="human-verify">
  <name>Build responsive [section-name] layout</name>
  <domain-skill>spacing-system, framework-tips</domain-skill>
  <files>src/components/sections/[Section].tsx</files>
  <action>
    Follow spacing-system.md layout composition:
    1. Use 8pt grid for all spacing
    2. Asymmetric layout (NOT 3-equal-columns)
    3. Section breaks >= 48-64px between major sections
    4. Gestalt proximity: internal spacing <= external spacing
    5. Generous whitespace in hero/key areas (2-3x normal)

    Responsive breakpoints:
    - Mobile (base): single column, stacked content
    - Tablet (md:768px): 2-column where appropriate
    - Desktop (lg:1024px): full layout with asymmetric grid

    Touch targets >= 44x44px on mobile.
    No horizontal scroll at any breakpoint.
  </action>
  <verify>
    Run /responsive-check /[path]
    Check at 375px, 768px, 1280px
  </verify>
  <expected>No overflow, proper stacking, touch targets OK</expected>
  <human-check>Layout looks balanced and intentional at all 3 breakpoints</human-check>
</task>
```

## Animation Implementation Task

```xml
<task type="human-verify" depends="task-2">
  <name>Add animations to [section/component]</name>
  <domain-skill>motion-system</domain-skill>
  <files>src/components/[path].tsx</files>
  <action>
    Follow motion-system.md — focus on ONE orchestrated moment:

    1. Page load staggered reveal:
       - Parent: variants with staggerChildren: 0.1
       - Children: fade + slide up (opacity 0→1, y 20→0)
       - Use useInView for scroll-triggered activation

    2. Interactive elements:
       - whileHover: subtle scale or color shift (150ms)
       - whileTap: scale 0.98 for press feedback
       - Spring physics: stiffness 400, damping 25

    3. Transitions between states:
       - AnimatePresence for mount/unmount
       - mode="wait" for sequential transitions

    Performance:
    - Only animate transform and opacity
    - No width/height animations
    - Use will-change sparingly

    Accessibility:
    - Add useReducedMotion hook
    - Provide instant alternatives when reduced motion preferred
    - Max 600ms for UI animations, 1200ms for decorative

    If RTL: horizontal animations enter from RIGHT (x: -20 instead of x: 20)
  </action>
  <verify>npm run dev, check animations visually, check prefers-reduced-motion</verify>
  <expected>Smooth 60fps animations, reduced-motion fallback works</expected>
  <human-check>Animations feel purposeful and enhance the experience</human-check>
</task>
```

## Visual Polish Task

```xml
<task type="human-verify">
  <name>Visual polish and design evaluation</name>
  <domain-skill>evaluation-criteria, anti-patterns</domain-skill>
  <files>[all modified component files]</files>
  <action>
    Run design evaluation and refinement cycle:

    1. Run /evaluate-design on each section/page
    2. If any score < 70: run /progressive-refine
       - Layout > Typography > Color > Spacing > Motion (in order)
       - Each stage must score >= 70 before proceeding
    3. After refinement: run /polish for micro-detail pass
    4. Final: run /evaluate-design for overall score

    Check against anti-patterns.md:
    - No banned fonts
    - No purple gradients
    - No uniform spacing
    - No generic stock icons
    - No AI-slop indicators

    Maximum 3 refinement iterations.
    If still below target after 3 passes, flag for human review.
  </action>
  <verify>Run /evaluate-design [page-path], check all scores >= target</verify>
  <expected>Overall score >= [target from CONTEXT.md quality target]</expected>
  <human-check>Design feels distinctive, not generic. Would you remember it?</human-check>
</task>
```

## RTL Adaptation Task

```xml
<task type="auto">
  <name>Adapt components for RTL/Hebrew</name>
  <domain-skill>rtl-hebrew, typography-system</domain-skill>
  <files>[all component files]</files>
  <action>
    Follow rtl-hebrew.md for complete RTL conversion:

    1. Set dir="rtl" and lang="he" on root HTML element
    2. Convert ALL physical CSS to logical properties:
       - margin-left/right → margin-inline-start/end
       - padding-left/right → padding-inline-start/end
       - text-align: left/right → text-align: start/end
       - left/right positioning → inset-inline-start/end
       - border-left/right → border-inline-start/end
       - Tailwind: ml-/mr- → ms-/me-, pl-/pr- → ps-/pe-

    3. Hebrew typography:
       - Remove ALL letter-spacing on Hebrew text
       - Replace italic with bold for emphasis
       - Set line-height 1.7-1.8 for Hebrew body text
       - Add Hebrew font to font stack (Heebo, Rubik, etc.)

    4. Directional elements:
       - Flip arrow/chevron icons (scaleX(-1))
       - Reverse breadcrumb separators
       - Keep media controls, checkmarks, clocks unchanged

    5. Animation direction:
       - Change x: 20 to x: -20 for entrance animations
       - Change translateX positive to negative for RTL entry
  </action>
  <verify>Run /rtl-validate [component-directory]</verify>
  <expected>Zero critical violations, zero warnings, RTL renders correctly</expected>
</task>
```
