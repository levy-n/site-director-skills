# Design Quality Evaluation Criteria

This reference defines a structured, reproducible scoring system for evaluating frontend design quality. Use it after generating any component, section, or full page to assess quality and determine next steps.

---

## Evaluation JSON Schema

Every evaluation MUST output this JSON structure:

```json
{
  "overall_score": 0,
  "categories": {
    "typography": { "score": 0, "issues": [] },
    "color": { "score": 0, "issues": [] },
    "spacing": { "score": 0, "issues": [] },
    "layout": { "score": 0, "issues": [] },
    "motion": { "score": 0, "issues": [] },
    "accessibility": { "score": 0, "issues": [] }
  },
  "verdict": "PASS | REFINE | REDESIGN",
  "priority_fixes": []
}
```

### Field Definitions

- **overall_score**: Weighted average of all category scores (0-100)
- **categories**: Six evaluation dimensions, each scored 0-100
- **issues**: Array of specific, actionable problems found in that category
- **verdict**: Decision gate based on overall_score threshold
- **priority_fixes**: Top 3 most impactful items to fix first (ordered by impact)

---

## Score Ranges

| Range   | Label                        | Description                                                            |
|---------|------------------------------|------------------------------------------------------------------------|
| 0-30    | Generic / Broken             | AI slop. No design system. Default everything. Looks like a template.  |
| 31-50   | Functional but Unremarkable  | Works but forgettable. Generic fonts, default spacing, flat hierarchy. |
| 51-70   | Good with Notable Issues     | Shows intent but has 2-3 significant problems dragging it down.        |
| 71-85   | Strong, Distinctive Design   | Clear aesthetic direction. Minor polish needed.                        |
| 86-100  | Exceptional, Portfolio-Worthy | Distinctive, polished, memorable. Ships as-is.                         |

---

## Detailed Scoring Rubric

### Typography (0-100)

Each criterion is worth 0-20 points. Total: 100.

| Criterion               | 20 Points                                          | 10 Points                                    | 5 Points                              | 0 Points                                |
|--------------------------|-----------------------------------------------------|----------------------------------------------|----------------------------------------|------------------------------------------|
| Font Distinctiveness     | Unique, project-specific font pair                  | Good font, but commonly seen                 | Acceptable but generic                 | Banned fonts (Inter, Roboto, Arial)      |
| Weight Contrast          | Dramatic contrast (200 vs 800, or 300 vs 900)       | Good contrast (300 vs 700)                   | Mild contrast (400 vs 600)             | Single weight throughout                 |
| Size Scale Consistency   | Modular scale (1.25 or 1.333 ratio)                 | Mostly consistent with minor deviations      | Somewhat random but not terrible       | Random sizes with no system              |
| Hierarchy Clarity        | 4+ distinct levels clearly differentiated            | 3 clear levels                                | 2 levels, hierarchy is flat            | No visible hierarchy                     |
| Line-Height & Spacing    | Proper per-element (1.7+ body, 1.3 headings)        | Mostly correct                                | Default browser values                 | Incorrect or cramped                     |

**Hebrew-Specific Deductions:**
- `-20` if `letter-spacing` is applied to Hebrew text
- `-20` if `font-style: italic` is used on Hebrew text
- `-10` if line-height is below 1.6 for Hebrew body text

### Color (0-100)

| Criterion               | 20 Points                                          | 10 Points                                    | 5 Points                              | 0 Points                                |
|--------------------------|-----------------------------------------------------|----------------------------------------------|----------------------------------------|------------------------------------------|
| Palette Cohesion         | Intentional palette with clear rationale             | Mostly cohesive with 1 off-brand color       | Loosely related colors                 | Random colors with no relationship       |
| Contrast Compliance      | All text passes WCAG AA (4.5:1 normal, 3:1 large)   | Most text passes, 1-2 near misses            | Several failures on secondary text     | Major contrast failures on primary text  |
| Accent Effectiveness     | Single accent used purposefully for CTAs/highlights  | Accent used well but slightly overused       | Accent everywhere, loses meaning       | No accent color, or 3+ competing accents |
| Neutral Treatment        | Tinted neutrals matching palette (warm gray, etc.)   | Slightly tinted neutrals                      | Pure gray (#666, #999)                 | Harsh black on white with no nuance      |
| Theme Consistency        | Surfaces layered with subtle shade differences       | Some surface variation                        | Flat single-color backgrounds          | Inconsistent surface colors              |

### Spacing (0-100)

| Criterion               | 20 Points                                          | 10 Points                                    | 5 Points                              | 0 Points                                |
|--------------------------|-----------------------------------------------------|----------------------------------------------|----------------------------------------|------------------------------------------|
| Grid Adherence           | Consistent 4pt or 8pt grid system                    | Mostly on-grid with minor deviations         | Some grid awareness                    | Arbitrary pixel values everywhere        |
| Gestalt Grouping         | Related items tight, groups separated (ratio 1:3+)   | Good grouping with minor issues              | Equal spacing everywhere               | Inverted grouping (groups apart, items apart) |
| Section Breathing Room   | Generous section padding (80px+ / 5rem+)             | Adequate section spacing (48-80px)            | Tight sections (24-48px)               | Cramped sections (<24px)                 |
| Responsive Adaptation    | Spacing scales fluidly with clamp() or fluid units   | Spacing adjusts at breakpoints               | Fixed spacing, slightly tight on mobile| Same spacing at all viewports            |
| Consistency              | Systematic spacing tokens used throughout            | Mostly consistent, 1-2 one-offs              | Mix of consistent and random           | Ad-hoc spacing with no system            |

### Layout (0-100)

| Criterion               | 20 Points                                          | 10 Points                                    | 5 Points                              | 0 Points                                |
|--------------------------|-----------------------------------------------------|----------------------------------------------|----------------------------------------|------------------------------------------|
| Visual Interest          | Asymmetric composition with clear focal point        | Some asymmetry or visual variation            | 3-equal-cards syndrome                 | Single column, no composition            |
| Responsive Behavior      | 3+ breakpoints with layout changes at each           | 2 breakpoints (mobile + desktop)              | 1 breakpoint, some overlap issues      | Desktop only, broken on mobile           |
| Content Hierarchy        | Clear primary, secondary, tertiary content zones     | Good hierarchy with minor ambiguity           | Flat -- everything feels same priority | Chaotic, no discernible order            |
| Whitespace Usage         | Generous, intentional whitespace creating rhythm      | Good whitespace in most areas                 | Adequate but unremarkable              | Cramped, content packed too tight        |
| Grid Composition         | Intentional grid breaks and full-bleed moments       | Solid grid with some variation                | Rigid, uniform grid throughout         | No grid, random element placement        |

### Motion (0-100)

| Criterion               | 20 Points                                          | 10 Points                                    | 5 Points                              | 0 Points                                |
|--------------------------|-----------------------------------------------------|----------------------------------------------|----------------------------------------|------------------------------------------|
| Purposefulness           | Every animation communicates state or guides eye     | Most animations serve a purpose               | Decorative animation on some elements  | Random animation with no intent          |
| Orchestration            | Staggered, sequenced reveals with clear choreography | Some staggering and sequence awareness        | All elements animate simultaneously    | No coordination between elements         |
| Performance              | Only `transform` and `opacity` animated              | Mostly performant, 1 layout animation         | Several layout-triggering animations   | Animating `width`, `height`, `top`, `left` |
| Reduced Motion Support   | Full `prefers-reduced-motion` implementation         | Partial support (some animations respect it)  | No support but animations are subtle   | No support and animations are aggressive |
| Timing                   | Appropriate duration per element type (0.15-0.5s UI) | Mostly appropriate timing                     | Too slow (>0.8s for UI interactions)   | Way too slow or instant (no easing)      |

**Motion-Specific Notes:**
- In RTL: entrance animations from the RIGHT get +5 bonus, from the LEFT get -10 penalty
- Bounce/elastic easing on UI elements: automatic -10
- Linear easing on UI transitions: automatic -5

### Accessibility (0-100)

| Criterion               | 20 Points                                          | 10 Points                                    | 5 Points                              | 0 Points                                |
|--------------------------|-----------------------------------------------------|----------------------------------------------|----------------------------------------|------------------------------------------|
| Contrast Ratios          | All text passes WCAG AA, decorative text passes AAA  | All primary text passes AA                    | Most text passes, some near-misses     | Major contrast failures                  |
| Focus Indicators         | Custom visible focus rings matching design system    | Default browser focus rings preserved         | Focus rings partially removed          | `outline: none` with no replacement      |
| ARIA Labels              | All interactive elements have descriptive labels     | Most interactive elements labeled             | Some labels missing on icons/buttons   | No ARIA labels anywhere                  |
| Keyboard Navigation      | Full keyboard access, logical tab order, skip links  | Full keyboard access, no skip links           | Partial keyboard access                | Keyboard access broken or impossible     |
| Heading Hierarchy        | Logical h1 > h2 > h3 with no skipped levels         | Mostly logical, 1 skipped level               | Multiple skipped levels                | No heading structure or all same level   |

---

## Verdict Thresholds

| Verdict    | Score Range | Action                                                                |
|------------|-------------|-----------------------------------------------------------------------|
| PASS       | >= 70       | Ship it. Minor polish optional.                                       |
| REFINE     | 40-69       | Address priority_fixes. Run iterative improvement pass.               |
| REDESIGN   | < 40        | Fundamental issues. Revisit aesthetic direction and start fresh.       |

### Decision Flow

```
Score >= 70  -->  PASS      -->  Commit and move to next component
Score 40-69  -->  REFINE    -->  Fix top 3 priority items, re-evaluate
Score < 40   -->  REDESIGN  -->  Step back, reconsider design direction, rebuild
```

---

## Computing the Overall Score

The overall score is the **simple average** of all six category scores:

```
overall_score = (typography + color + spacing + layout + motion + accessibility) / 6
```

Round to the nearest integer. No category weighting -- all six dimensions matter equally.

---

## How To Use This Evaluation

### Step-by-Step Process

1. **Read the component code** -- Examine the full source: JSX/TSX, CSS/Tailwind classes, animation definitions.

2. **Check each criterion** -- Go through every row in every category table. Assign the appropriate points based on what you observe in the code.

3. **Document issues** -- For any criterion scoring below 15, add a specific issue string describing the problem and how to fix it.

4. **Compute category scores** -- Sum the five criteria per category (max 100 each). Apply any Hebrew-specific or motion-specific deductions.

5. **Compute overall score** -- Average all six categories.

6. **Determine verdict** -- Apply the threshold: PASS (>=70), REFINE (40-69), REDESIGN (<40).

7. **Identify priority fixes** -- From all documented issues, select the top 3 with the highest impact on the overall score. These should be concrete and actionable.

8. **Output the JSON** -- Format the complete evaluation as the JSON schema defined above.

### Example Evaluation Output

```json
{
  "overall_score": 62,
  "categories": {
    "typography": { "score": 75, "issues": ["Body line-height is 1.5, should be 1.7+ for Hebrew"] },
    "color": { "score": 70, "issues": ["Pure gray #999 used for secondary text instead of tinted neutral"] },
    "spacing": { "score": 55, "issues": ["Equal spacing between all cards, no Gestalt grouping", "Section padding only 32px"] },
    "layout": { "score": 50, "issues": ["Three equal cards in a row with no size hierarchy"] },
    "motion": { "score": 65, "issues": ["All cards animate simultaneously, no stagger"] },
    "accessibility": { "score": 60, "issues": ["Missing ARIA labels on icon buttons", "One heading level skipped (h2 to h4)"] }
  },
  "verdict": "REFINE",
  "priority_fixes": [
    "Break the 3-equal-cards layout: make the first card span 2 columns or use asymmetric sizing",
    "Add 0.1s stagger delay between card entrance animations",
    "Increase section padding to 5rem and add Gestalt spacing (tight within groups, generous between)"
  ]
}
```

### When To Evaluate

- **After generating any new component or section** -- immediate self-check
- **After a round of refinements** -- verify improvements moved the score up
- **Before marking a task as complete** -- final quality gate
- **When the user asks for feedback** -- provide the structured evaluation

### Evaluation Integrity Rules

- Be honest. Do not inflate scores to avoid rework.
- A score of 50 means "average" -- do not treat it as failure.
- Every issue must be specific and actionable (not "improve colors" but "change #999 to #6B5E50 for warm tinted neutral").
- The priority_fixes must be immediately implementable -- no vague suggestions.
- If the same issue spans multiple categories, count it in each but list the fix only once in priority_fixes.