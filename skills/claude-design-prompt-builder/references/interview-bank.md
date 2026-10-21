# Interview Question Bank — AskUserQuestion calls

Two batches. Phase 1 acquires sources. Phase 4 captures intent. Each batch is one AskUserQuestion call with multiple sub-questions.

## Phase 1 — Source acquisition (single call, 4 questions)

```
Question 1: Source type
Header: "Source"
Multi-select: false
Options:
  - { label: "Live URL", description: "Public production website" }
  - { label: "Local dev server", description: "I have it running on localhost" }
  - { label: "Git repo path", description: "I have the code locally" }
  - { label: "GitHub URL", description: "Public GitHub repo, no local copy" }
  - { label: "Live URL + repo", description: "I have both — analyze both" }

Question 2: Project root path
Header: "Repo path"
Open answer (free text). Skip if user picked "Live URL" only.
Hint: "absolute path on disk, e.g. G:\\Web-Dev\\my-project"

Question 3: Live URL or dev port
Header: "URL/port"
Open answer (free text). Skip if user picked "Git repo" only with no live preview.
Hint: "https://example.com or http://localhost:5173"

Question 4: Figma file
Header: "Figma"
Multi-select: false
Options:
  - { label: "No Figma file", description: "Skip the .fig upload" }
  - { label: "Yes, here is the path", description: "I will provide the absolute path" }
```

## Phase 4 Batch 1 — Brand intent (single call, 4 questions)

```
Question 1: Brand voice (3 adjectives)
Header: "Voice"
Multi-select: true (allow up to 3)
Options:
  - { label: "warm / intimate" }
  - { label: "bold / confident" }
  - { label: "quiet / elegant" }
  - { label: "playful / energetic" }
  - { label: "technical / precise" }
  - { label: "luxurious / aspirational" }
  - { label: "friendly / approachable" }
  - { label: "editorial / sophisticated" }
  - { label: "raw / honest" }
  - { label: "premium / refined" }

Question 2: Audience
Header: "Audience"
Open answer (free text).
Hint: "1-2 sentences. e.g. 'Israeli families booking lifestyle photography' or 'B2B SaaS engineers evaluating dev tools'"

Question 3: Direction
Header: "Direction"
Multi-select: false
Options:
  - { label: "Preserve", description: "Match the current visual identity exactly" }
  - { label: "Refresh", description: "Keep the bones, elevate the polish" }
  - { label: "Pivot", description: "Current site is a starting reference, not a target" }
  - { label: "New surface", description: "Same brand, different surface (e.g. site -> product UI)" }

Question 4: Primary use of Claude Design
Header: "Use case"
Multi-select: false
Options:
  - { label: "Marketing / landing pages" }
  - { label: "App / product UI" }
  - { label: "Pitch decks / one-pagers" }
  - { label: "Mixed", description: "Multiple of the above" }
```

## Phase 4 Batch 2 — Constraints & taste (single call, 3 questions)

Only ask AFTER Batch 1 has been answered. Do not bundle into one giant call.

```
Question 1: Hard constraints
Header: "Constraints"
Multi-select: true
Options:
  - { label: "RTL / Hebrew / Arabic", description: "CSS logical properties only" }
  - { label: "WCAG AA accessibility" }
  - { label: "Mobile-first" }
  - { label: "Performance budget", description: "LCP under 2.5s, no heavy JS" }
  - { label: "Locked fonts", description: "Brand uses specific fonts that must not change" }
  - { label: "None of the above" }

Question 2: Anti-patterns
Header: "Avoid"
Open answer (free text). Optional — user may say "none".
Hint: "Things you have seen and hate. e.g. 'no purple/orange gradients', 'no glassmorphism', 'no rounded cards with left-border accents', 'no Stripe-clone hero with floating dashboard'"

Question 3: Reference brands or sites
Header: "References"
Open answer (free text). Optional — user may say "none".
Hint: "Up to 3 brands or URLs that represent 'good' to you"
```

## Validation logic

After each batch:

1. **Cross-check against extracted evidence.** If user says "minimal" but the site has 12 sections with stacked animations, surface the contradiction:
   > "The codebase shows 12 sections with parallax + Ken Burns + scroll-reveal animations. You said 'minimal'. Should I write a Notes section that asks Claude Design to retire most of these motions, or treat 'minimal' as the new direction (i.e. the current site is the 'before')?"

2. **If RTL was NOT selected but RTL was DETECTED in code** → confirm:
   > "I detected `dir=rtl` in your index.html and Hebrew text in components. You did not check RTL as a constraint. Should I include the RTL block in Notes anyway? (Strongly recommended — Claude Design will produce broken Hebrew layouts without it.)"

3. **If constraints conflict with use case** (e.g. "App / product UI" + "no Tailwind" + extracted Tailwind setup) → ask which wins.

## When to skip the interview

Never skip Batch 1. It is the minimum.

You MAY skip Batch 2 only if the user explicitly says "skip taste questions, use defaults" — in which case write `[USER OPTED OUT — defaults applied: WCAG AA, mobile-first, no anti-pattern list]` in `audit-summary.md`.
