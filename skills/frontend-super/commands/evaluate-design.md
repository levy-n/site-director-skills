---
description: Evaluate current design quality with structured JSON scoring (0-100 per category)
argument-hint: [URL-path or component-path]
---

Evaluate the design quality of $ARGUMENTS.

## Process

1. **Load scoring rubric**: Read `references/evaluation-criteria.md` (relative to this skill's directory)

2. **Gather visual information**:
   - If Playwright MCP is available: navigate to the URL, take screenshots at 375px, 768px, and 1280px viewports
   - If argument is a file path: read the component code directly
   - If neither: ask the user for a screenshot or describe what they see

3. **Evaluate all 6 categories** (score each 0-100):
   - **Typography**: Font distinctiveness, weight contrast, size scale, hierarchy, line-height
   - **Color**: Palette cohesion, WCAG AA contrast, accent effectiveness, neutral treatment
   - **Spacing**: 8pt grid adherence, Gestalt grouping, section breaks, consistency
   - **Layout**: Visual interest/asymmetry, responsive behavior, content hierarchy, whitespace
   - **Motion**: Purposefulness, orchestration, performance, reduced-motion support
   - **Accessibility**: Contrast ratios, focus indicators, ARIA labels, keyboard nav, heading hierarchy

4. **Output structured evaluation** as JSON:
   ```json
   {
     "overall_score": <average of 6 categories>,
     "categories": {
       "typography": { "score": <0-100>, "issues": ["..."] },
       "color": { "score": <0-100>, "issues": ["..."] },
       "spacing": { "score": <0-100>, "issues": ["..."] },
       "layout": { "score": <0-100>, "issues": ["..."] },
       "motion": { "score": <0-100>, "issues": ["..."] },
       "accessibility": { "score": <0-100>, "issues": ["..."] }
     },
     "verdict": "PASS | REFINE | REDESIGN",
     "priority_fixes": ["fix 1", "fix 2", "fix 3"]
   }
   ```

5. **Verdict thresholds**:
   - **PASS** (score >= 70): Design is strong. Minor polish only.
   - **REFINE** (score 40-69): Good foundation, needs improvement. Suggest `/progressive-refine`.
   - **REDESIGN** (score < 40): Fundamental issues. Suggest `/bolder` or rethink direction.

6. **Provide 3 priority fixes** as specific, actionable items with file:line references where possible.

7. If verdict is REFINE, suggest: "Run `/progressive-refine $ARGUMENTS` to improve through staged refinement."
