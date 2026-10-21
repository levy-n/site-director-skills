---
description: Comprehensive mobile UX audit — thumb zones, touch targets, safe areas, performance
argument-hint: [component-path or URL-path]
---

Perform a comprehensive mobile UX audit on `$ARGUMENTS`.

**Before starting:** Load `references/mobile-ux.md` for the full mobile UX reference.

## Audit Process

### Step 1: Read the Code

Read all component files at `$ARGUMENTS`. Identify:
- All interactive elements (buttons, links, inputs, toggles)
- Layout structure and breakpoint handling
- Fixed/sticky positioned elements
- Images and media
- Form elements
- Animation definitions

### Step 2: Check Each Category

#### A. Touch Targets (Critical)
- [ ] All buttons/links >= 44x44px (48px preferred)
- [ ] 8px minimum spacing between adjacent targets
- [ ] Icon-only buttons have extended hit area (padding trick)
- [ ] No overlapping touch targets

#### B. Thumb Zone Compliance
- [ ] Primary CTA in bottom 30% of viewport (or sticky bottom)
- [ ] Navigation accessible from thumb zone (bottom nav or sticky header)
- [ ] Destructive actions NOT in easy-reach zone
- [ ] No critical interactions requiring top-of-screen reach

#### C. Safe Areas
- [ ] `viewport-fit=cover` in meta tag
- [ ] `env(safe-area-inset-bottom)` on fixed bottom elements
- [ ] `env(safe-area-inset-top)` on full-bleed headers
- [ ] No content hidden behind notch/dynamic island area

#### D. Typography
- [ ] Body text >= 16px (1rem) on mobile
- [ ] Input fields >= 16px font-size (prevents iOS zoom)
- [ ] Headings use fluid sizing (clamp() or responsive classes)
- [ ] Line-height >= 1.5 for body (1.7+ for Hebrew)
- [ ] No text overflow without `overflow-wrap: break-word`

#### E. Layout & Spacing
- [ ] No horizontal scroll at any mobile viewport (375-430px)
- [ ] `100dvh` used instead of `100vh` for full-height layouts
- [ ] Page padding >= 16px (1rem) on mobile
- [ ] Grids collapse to single column on mobile
- [ ] Forms are single-column on mobile

#### F. Performance Indicators
- [ ] Images have `loading="lazy"` (below fold) and `width`/`height`
- [ ] Images use `srcset`/`sizes` for responsive loading
- [ ] No parallax effects on mobile viewport
- [ ] Animations use only `transform` and `opacity`
- [ ] `prefers-reduced-motion` respected

#### G. Mobile Interactions
- [ ] Tap feedback (`:active` state) on all interactive elements
- [ ] No hover-only interactions (all hover actions have tap equivalent)
- [ ] Keyboard dismisses on form submit
- [ ] Forms use correct `type`/`inputmode`/`autocomplete`
- [ ] Modals replaced with bottom sheets on mobile (or properly sized)

#### H. Mobile Navigation
- [ ] Navigation accessible without reaching top of screen
- [ ] Hamburger menu has proper touch target (>= 44px)
- [ ] Sticky header has `scroll-margin-top` on anchor targets
- [ ] Back navigation works correctly

### Step 3: If Playwright MCP is Available

1. Navigate to the page
2. Set viewport to 375x812 (iPhone SE) → screenshot → analyze
3. Set viewport to 430x932 (iPhone Pro Max) → screenshot → analyze
4. Check: thumb zones, overflow, text sizes, spacing

### Step 4: Score & Report

Output the mobile UX score using this JSON format:

```json
{
  "mobile_ux_score": 0,
  "categories": {
    "touch_targets": { "score": 0, "issues": [] },
    "thumb_zone": { "score": 0, "issues": [] },
    "safe_areas": { "score": 0, "issues": [] },
    "mobile_typography": { "score": 0, "issues": [] },
    "mobile_layout": { "score": 0, "issues": [] },
    "mobile_performance": { "score": 0, "issues": [] },
    "mobile_interactions": { "score": 0, "issues": [] },
    "mobile_navigation": { "score": 0, "issues": [] }
  },
  "verdict": "PASS | REFINE | REDESIGN",
  "priority_fixes": []
}
```

**Scoring**: Each category 0-100. Overall = average of 8 categories.
**Verdicts**: PASS >= 70, REFINE 40-69, REDESIGN < 40.

### Step 5: Fix Priority Issues

If verdict is REFINE or REDESIGN:
1. Fix the top 3 priority items immediately
2. Re-audit the affected categories
3. Report the delta (before/after scores)

## Output Format

```
## Mobile UX Audit: $ARGUMENTS

### Overall Score: XX/100 — [VERDICT]

### Category Breakdown
| Category | Score | Issues |
|----------|-------|--------|
| Touch Targets | XX | [count] |
| Thumb Zone | XX | [count] |
| Safe Areas | XX | [count] |
| ... | ... | ... |

### Critical Issues (fix immediately)
1. [issue + file:line + fix]
2. [issue + file:line + fix]
3. [issue + file:line + fix]

### Recommendations (improve later)
- [recommendation]
- [recommendation]

[JSON score block]
```
