# DESIGN.md Template — 9 canonical sections

Output `DESIGN.md` with these nine sections in this order. Each section <= 150 words. Use only verifiable claims (extracted from code, visible in screenshot, stated by user).

The user can drop this file as context in any Claude Design project as an alternative to (or alongside) the form.

```markdown
# DESIGN.md — {Brand Name}

## 1. Visual Theme & Atmosphere

{1-3 sentences describing the felt experience of the brand. What emotion does it evoke? What's the overall mood? What's the editorial sensibility? Reference 1-2 visual analogies if useful (e.g. "reads like a quiet print magazine, not a tech product page"). Stay concrete — no vague adjectives.}

## 2. Color Palette & Roles

```css
:root {
  /* Backgrounds */
  --bg-primary: {value};      /* {role description} */
  --bg-secondary: {value};    /* {role description, when to use} */

  /* Text */
  --text-primary: {value};    /* body */
  --text-heading: {value};    /* headings */
  --text-muted: {value};      /* secondary copy, captions */

  /* Accents */
  --accent: {value};          /* hover, lines, ornaments */
  --accent-hover: {value};

  /* Functional */
  --border: {value};
  --shadow: {value};
}
```

**Forbidden as backgrounds:** {tokens that exist in the codebase but should NOT be used as primary surfaces, per client direction.}

## 3. Typography Rules

- **Display / headings:** {family}, weight {N}, line-height {L}, no letter-spacing on Hebrew/Arabic.
- **Body:** {family}, weight {N}, line-height {L}.
- **Scale:** {provide a 6-step scale with rem values, e.g. 0.875rem / 1rem / 1.25rem / 1.5rem / 2rem / 3rem / 5rem}
- **Constraints:** {italic? uppercase? language-specific notes?}

## 4. Component Stylings

### Button (primary)
- Background: {token}, text: {token}, border: {none/value}
- Padding: {Y X}
- Radius: {value}
- Hover: {what changes}
- Transition: {duration ease}

### Card
- {same level of detail}

### Input
- {same}

### Navigation link
- {same}

(Add only the components that exist in the codebase. Do not invent.)

## 5. Layout Principles

- **Max content width:** {value} (`max-w-{N}` Tailwind class if applicable)
- **Section vertical padding:** {value} mobile, {value} desktop
- **Grid:** {N columns at desktop, N at tablet, N at mobile}
- **Spacing scale:** {3-5 base values, e.g. 8px, 16px, 24px, 48px, 96px}

## 6. Depth & Elevation

- **Shadows:** {1-3 named elevations with exact values, or "no shadows — flat editorial style"}
- **Borders:** {1px hairline at {color/opacity}? full borders? no borders?}
- **Layering:** {z-index strategy: base / overlay / modal — only if needed}

## 7. Do's and Don'ts

**Do:**
- {3-5 directives derived from the brand identity}

**Don't:**
- {3-5 anti-patterns from the user interview, plus universal anti-AI-slop guards}
- No purple/orange gradients
- No glassmorphism unless explicitly requested
- No emoji bullets or emoji in headings
- No rounded-cards-with-left-border-accent
- No Stripe-clone hero with floating SaaS dashboard

## 8. Responsive Behavior

- **Breakpoints:** {sm: Npx, md: Npx, lg: Npx, xl: Npx — match Tailwind defaults unless code says otherwise}
- **Mobile-first?** {yes/no}
- **Hero on mobile:** {does it shrink? does it crop differently? does the slider become single-image?}
- **Navigation on mobile:** {hamburger? horizontal scroll? collapsed?}

## 9. Agent Prompt Guide

When generating new artifacts in this design system, the agent MUST:
- Use OKLCH or hex values from section 2 — never invent new colors.
- Use only fonts loaded in the codebase ({list them}).
- Respect the spacing scale from section 5 — round to the nearest scale value.
- Apply the language/RTL rules: {include Hebrew/Arabic block here if applicable}.
- For motion: {static / subtle fades / scroll-reveals / parallax} — match what the existing site does, do not over-animate.

The agent MUST NOT:
- Add packages or dependencies not already in `package.json`.
- Use design tokens not declared in section 2.
- Introduce a new typeface.
- Mix radius scales (pick one: sharp 0px, soft 4-8px, or pill 9999px — and stick with it).
- Add emoji to copy unless the user explicitly asks.

If the request conflicts with this design system, the agent must surface the conflict before producing output.
```

## Filling rules

1. **Section 2 (Color Palette)** — list ONLY tokens that exist in the codebase. If a token exists but should not be used (per user direction), keep it in the file but list it under "Forbidden as backgrounds" with a one-line explanation.

2. **Section 4 (Components)** — only include components that are actually in `src/components/`. Do not invent a Button if there is no Button component in the code.

3. **Section 9 (Agent Prompt Guide)** — this is the most important section for downstream Claude Design quality. Be specific and use imperatives. The "MUST NOT" list is more valuable than the "MUST" list.

4. If a section has no signal (e.g. no shadows in the design), write "Not used in this design — flat editorial style" rather than fabricating values.
