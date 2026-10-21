---
description: Scaffold a new React component with TypeScript, Tailwind, Framer Motion, and tests
argument-hint: ComponentName
---

Create a new component called `$ARGUMENTS` following the frontend-super design system.

## Before Starting

1. Read the project's CLAUDE.md for design direction and font/color choices
2. If the project has a `<frontend_aesthetics>` block, follow it strictly
3. Check existing components for patterns to match

## Scaffold Structure

Create these files:

### 1. Component File: `src/components/$ARGUMENTS/$ARGUMENTS.tsx`

```tsx
// TypeScript interface for all props
// Tailwind CSS for styling (no inline styles)
// Mobile-first responsive (base = mobile, add md: and lg:)
// Framer Motion for entrance animation
// Loading, error, and empty states
// Keyboard accessible (proper ARIA attributes)
```

Requirements:
- Named export (not default)
- TypeScript strict props interface
- Tailwind utility classes only (no arbitrary values like `w-[347px]`)
- Use CSS custom properties for colors (not hardcoded hex)
- Mobile-first responsive: base styles = mobile, add `md:` and `lg:` for larger
- Include at least one Framer Motion animation (entrance or hover)
- Handle edge cases: empty data, loading, error

### 2. Test File: `src/components/$ARGUMENTS/$ARGUMENTS.test.tsx`

Using React Testing Library:
- Renders correctly with required props
- Renders all visual states (loading, error, empty, populated)
- Interactive elements respond to user events
- Accessibility: proper ARIA roles, keyboard navigation

### 3. Index File: `src/components/$ARGUMENTS/index.ts`

Re-export the component and its types.

## Design Checklist

Before finishing, verify:
- [ ] No banned fonts (Inter, Roboto, Arial as primary)
- [ ] Weight contrast: bold headings vs light body
- [ ] Spacing follows 8pt grid
- [ ] Colors use CSS variables, not hardcoded values
- [ ] Touch targets >= 44x44px on interactive elements
- [ ] prefers-reduced-motion respected if animations present
- [ ] RTL-compatible if project uses dir="rtl" (logical CSS properties)
