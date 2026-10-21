# Frontend Verification Checklist for GSD

> Append these checks to the standard `gsd verify` output when the frontend domain profile is active.

---

## Frontend Domain Checks

### Visual Quality
- [ ] Design evaluation score >= target from CONTEXT.md (run `/evaluate-design`)
- [ ] No anti-patterns detected (check against `anti-patterns.md`)
- [ ] Typography: no banned fonts (Inter, Roboto, Arial, Open Sans as primary)
- [ ] Typography: weight contrast uses extremes (200 vs 800, not 400 vs 600)
- [ ] Color: WCAG AA contrast compliance (4.5:1 body, 3:1 large text)
- [ ] Color: no pure grays, neutrals are tinted
- [ ] Spacing: 8pt grid adherence throughout
- [ ] Spacing: Gestalt proximity (internal <= external)

### Responsive
- [ ] Renders correctly at 375px (mobile)
- [ ] Renders correctly at 768px (tablet)
- [ ] Renders correctly at 1280px (desktop)
- [ ] No horizontal scroll at any breakpoint
- [ ] Touch targets >= 44x44px on mobile
- [ ] Text readable at all sizes (>= 16px body on mobile)

### Animation & Motion
- [ ] `prefers-reduced-motion` respected
- [ ] UI animations <= 600ms, decorative <= 1200ms
- [ ] Only transform/opacity animated (no width/height)
- [ ] Animations serve a purpose (not just decoration)

### Accessibility
- [ ] Focus indicators visible on all interactive elements
- [ ] ARIA labels on icon-only buttons
- [ ] Alt text on all images
- [ ] Keyboard navigation works for all interactive elements
- [ ] Heading hierarchy is semantic (h1 → h2 → h3, no skips)
- [ ] Skip-to-content link present (if multi-section page)

### RTL/Hebrew (if applicable)
- [ ] `dir="rtl"` set on root element
- [ ] CSS logical properties only (no margin-left/right, padding-left/right)
- [ ] No letter-spacing on Hebrew text
- [ ] No italics on Hebrew text
- [ ] Hebrew font in font stack
- [ ] Animations enter from RIGHT
- [ ] Directional icons flipped

### Performance
- [ ] Lighthouse performance score >= 90
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] Images optimized (lazy loading, proper dimensions)
- [ ] No render-blocking resources

### Code Quality
- [ ] TypeScript: no errors (`npm run type-check`)
- [ ] Build passes (`npm run build`)
- [ ] No hardcoded color values (use CSS variables)
- [ ] No inline styles (use Tailwind or CSS modules)
- [ ] No arbitrary Tailwind values (`w-[347px]`)
- [ ] No console.log statements
- [ ] No unused imports

---

## Verification Commands

Quick commands to run during `gsd verify`:

```powershell
# Build check
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Run tests
npm test

# Lighthouse (if dev server is running)
npx lighthouse http://localhost:3000 --output=json --chrome-flags="--headless"

# Design evaluation
# Run /evaluate-design [path] for each major page/section
```

## Scoring

| Check Category | Weight | Pass Criteria |
|---|---|---|
| Visual Quality | 25% | Evaluation score >= target |
| Responsive | 20% | All 3 breakpoints clean |
| Animation | 10% | Reduced motion + performance |
| Accessibility | 20% | All WCAG AA checks pass |
| RTL (if applicable) | 10% | Zero critical violations |
| Performance | 10% | Lighthouse >= 90 |
| Code Quality | 5% | Build + types + lint pass |

**Overall PASS**: All categories meet criteria.
**Overall FAIL**: Any category fails → list specific failures and suggest fixes.
