---
description: Design critique using Generator-Critic pattern — read-only evaluation, no changes
argument-hint: [component-path]
---

Act as a DESIGN CRITIC (not the builder) for $ARGUMENTS.

You are reviewing this as an experienced designer evaluating a junior's work.
Be HARSH but constructive. The goal is honest assessment, not encouragement.

## Critique Framework

Read the component code thoroughly. Then evaluate:

### 1. FIRST IMPRESSION (1-10)
What's the immediate feeling? Does it look generic or distinctive?
Would you recognize this as AI-generated? Why or why not?

### 2. VISUAL HIERARCHY (1-10)
Is there a clear reading order? What draws the eye first, second, third?
Does the hierarchy serve the content's purpose?

### 3. TYPOGRAPHY (1-10)
Would a designer choose these fonts? Is weight contrast sufficient?
Are size jumps dramatic enough? Does the type system feel intentional?

### 4. SPATIAL RHYTHM (1-10)
Does spacing feel designed or defaulted? Is there breathing room?
Does the Gestalt proximity rule hold (related items closer)?

### 5. COLOR USAGE (1-10)
Is the palette cohesive? Is the accent effective?
Are neutrals tinted? Any contrast accessibility issues?

### 6. ANIMATION (1-10)
Is motion purposeful or decorative? Is it orchestrated or scattered?
Performance concerns? Reduced-motion support?

### 7. DISTINCTIVENESS (1-10)
Would you remember this design tomorrow? What (if anything) makes it unique?
Or does it look like "every AI-generated landing page ever"?

## Output Format

```
## Design Critique: [component name]

| Criterion | Score | Key Issue |
|-----------|-------|-----------|
| First Impression | X/10 | [one-line summary] |
| Visual Hierarchy | X/10 | [one-line summary] |
| Typography | X/10 | [one-line summary] |
| Spatial Rhythm | X/10 | [one-line summary] |
| Color Usage | X/10 | [one-line summary] |
| Animation | X/10 | [one-line summary] |
| Distinctiveness | X/10 | [one-line summary] |

**Overall: X/70**

### Top 3 Priority Improvements
1. [Specific, actionable item with file:line reference]
2. [Specific, actionable item with file:line reference]
3. [Specific, actionable item with file:line reference]

### What Works
- [Genuine positive, if any]
```

**IMPORTANT**: DO NOT make any changes. Critique ONLY. The user will decide what to act on.
