---
description: Generates ready-to-paste inputs for Claude Design's "Set up your design system" form (claude.ai/design) plus a full 9-section DESIGN.md from any existing website. Audits the site visually with browser MCP screenshots across viewports, extracts CSS tokens and typography from code when local, and runs a structured AskUserQuestion interview to capture intent. Triggers include "claude design prompt", "design system prompt", "DESIGN.md from my site", "פרומפט ל-Claude Design", "תכין לי פרומפט לאתר".
when_to_use: User has an existing website (live URL, local dev server, or git repo) and wants to feed it into Claude Design (claude.ai/design) for scaffolding a new project, generating brand-matched marketing assets, or refreshing an existing design. Also "set up claude design", "audit my site for claude design", onboarding a site/repo into Claude Design.
allowed-tools: Read, Glob, Grep, Bash, Write, AskUserQuestion, WebFetch
---

# Claude Design Prompt Builder

You are running a structured discovery + audit pipeline that produces ready-to-paste inputs for Claude Design's "Set up your design system" form (claude.ai/design). The goal is **perfect first-shot output** — no back-and-forth refinement once the user submits the form.

## Core principle

The Help Center says skipping the design system step is the single biggest quality regression in Claude Design. Conversely, a thorough design system input is the single biggest quality lever. Your job is to make this step bulletproof.

**The output is only as good as three things:** (1) what the site visually looks like, (2) what is actually in the code, (3) what the user *intends* but has not said yet. You cover all three before writing anything.

## Pipeline (5 phases)

Run phases in order. Do not skip. Do not parallelize phases — only steps within a phase.

### Phase 1 — Source acquisition

Single AskUserQuestion call. See `references/interview-bank.md` Phase 1 block for exact wording. You need:

1. **Source type** — Live URL / Local dev server / Git repo path / GitHub URL / Multiple of the above
2. **Project root path** (if local) — absolute path on disk
3. **Live URL or dev port** (if applicable)
4. **Has a Figma .fig file?** — Yes (path) / No

After the answer:
- If repo path given → run `git remote -v` from the repo root to capture the GitHub URL automatically.
- If live URL given → confirm it loads with a `WebFetch` HEAD probe.
- If local dev needed → ask the user to run `npm run dev` (or detect from `package.json`) and confirm port. Do NOT start dev servers automatically — the user controls their environment.

### Phase 2 — Visual audit (screenshots)

Use whichever browser MCP is available — prefer in this order:

1. `playwright` MCP — `browser_navigate`, `browser_take_screenshot`, `browser_resize`, `browser_hover`
2. `chrome-devtools-mcp` — same primitives
3. If neither is available → tell the user to install one before continuing. Do NOT fall back to manual instructions for screenshots — the visual evidence is non-negotiable.

**Capture matrix.** See `references/screenshot-matrix.md` for the full grid. Minimum coverage:

| Viewport          | What to capture                                                            |
|-------------------|----------------------------------------------------------------------------|
| Mobile 375x812    | Hero, full-page scroll, primary nav open                                   |
| Tablet 768x1024   | Hero, mid-page section                                                     |
| Desktop 1280x800  | Hero, every major section, hover state on primary CTA, hover on nav link  |
| Wide 1920x1080    | Hero only — verify max-width behavior                                      |

Save screenshots to `./design-audit/screenshots/` (project-relative if local; otherwise `./claude-design-audit/screenshots/`). Filename pattern: `{viewport}-{section}-{state}.png` (example: `desktop-hero-default.png`, `desktop-cta-hover.png`).

After capture, **look at every screenshot**. Build a mental model of:
- Dominant colors (3 to 5)
- Typography pairing (display + body)
- Spacing density (tight / generous / extreme)
- Motion language (static / subtle / animated)
- Photographic vs illustrative vs flat
- Editorial vs functional vs playful vs corporate

### Phase 3 — Code extraction (if local or GitHub)

If the user provided code access, extract — do not guess — these. See `references/extraction-recipes.md` for framework-specific recipes (Tailwind v3/v4, CSS-in-JS, MUI, Chakra, vanilla CSS, Sass).

1. **CSS custom properties / theme tokens** — search `:root`, `@theme`, `:host`, `data-theme=`, design-token files. Extract every `--color-*`, `--font-*`, `--spacing-*`, `--radius-*`, `--shadow-*`.
2. **Font loading** — search `index.html`, `_document.tsx`, `layout.tsx`, `global.css` for Google Fonts links, `@font-face`, `@import`. Capture exact family names + weights loaded.
3. **Component inventory** — Glob `src/components/**/*.{jsx,tsx,vue,svelte}`. Note every section component, reusable primitive (Button, Card, Input), layout primitive.
4. **Page structure** — Read top-level `App.{jsx,tsx}` or routes — capture section order.
5. **i18n / RTL detection** — Check `<html dir="...">`, `<html lang="...">`, presence of `direction: rtl` in CSS. If RTL or Hebrew/Arabic detected → flag in output (Claude Design must know).
6. **Repo URL** — `git remote -v` if not yet captured.

Write findings to `./design-audit/extracted-tokens.md` as you go.

### Phase 4 — Discovery interview

Now you know what the site *is*. You do not yet know what the user *wants*. Use **AskUserQuestion** in two batches. See `references/interview-bank.md` for exact question text and option lists.

**Batch 1 — Brand intent (4 questions, single call):** voice, audience, direction, primary use of Claude Design.

**Batch 2 — Constraints & taste (3 questions, single call) — only after Batch 1:** hard constraints, anti-patterns, reference brands.

**Do not skip the interview, even if extraction was rich.** The interview is what separates this skill from a dumb scraper. The user knows things the code does not.

### Phase 5 — Synthesis

Write three deliverables to `./claude-design-audit/`:

1. **`form-fields.md`** — six fields, each in a fenced code block, ready to copy-paste. Use `references/form-template.md` for structure and field-specific rules.
2. **`DESIGN.md`** — full 9-section canonical design system doc. Use `references/design-md-template.md`. The user can either fill the form OR drop this file as context in any Claude Design project.
3. **`audit-summary.md`** — transparency log: what was extracted from code (verifiable), what was inferred from screenshots (visual judgment), what was confirmed by the user (intent), what is still unknown.

Then **show the user**:
- Paths to all three files
- The contents of `form-fields.md` inline
- A single-sentence summary of the design DNA you captured ("The site reads as: ___")
- A reminder: open claude.ai/design, click "Set up your design system", and paste field by field.

## Hard rules

1. **Verifiable beats confident.** Every claim in the output must be either extracted from code, visible in a screenshot, or stated by the user. Drop anything you cannot classify that way.
2. **Hex/OKLCH values, not brand-name colors.** Write "Warm brown #8B5A3C" not "Hila warm brown".
3. **Never invent a brand voice the user did not approve.** If the interview was skipped or vague, write `[USER TO CONFIRM]` placeholders — do not fabricate.
4. **Hebrew/RTL is non-negotiable when detected.** If `<html dir="rtl">` or Hebrew text exists, the Notes field MUST contain the RTL block from `references/form-template.md`. Skipping it produces broken output.
5. **No emoji in deliverables.** The output is a brand document.
6. **Keep each section <= 150 words.** Density of signal beats verbosity.
7. **Save screenshots locally.** Never upload them anywhere. Never share paths to private dev servers in deliverables.

## When to escalate

Stop and ask if:
- No browser MCP is available (Phase 2 blocker)
- Live URL returns non-200 status
- Code shows multiple competing design systems and you cannot tell which is canonical
- User interview answers contradict the visual evidence — surface the contradiction, do not paper over it.

## Reference files

- `references/form-template.md` — exact structure for the six form fields, with field-specific rules and Hebrew/RTL block.
- `references/design-md-template.md` — full 9-section DESIGN.md spec.
- `references/interview-bank.md` — AskUserQuestion question bank with options and validation logic.
- `references/extraction-recipes.md` — concrete recipes for extracting tokens from Tailwind v3/v4, CSS-in-JS, MUI, Chakra, vanilla CSS, Sass.
- `references/screenshot-matrix.md` — exact viewport sizes, sections, and states to capture.
