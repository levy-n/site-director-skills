# Frontend Super-Skill Memory

> Persistent learnings across sessions. Update after significant design discoveries.
> Commands like /evaluate-design, /audit, and /critique append findings here.

## Project-Specific Learnings
<!-- Add entries as: - [Date] [Project]: [Learning] -->

## Design Patterns That Worked
<!-- Add entries as: - [Pattern]: [Why it worked, project context] -->

## Anti-Patterns Discovered
<!-- Add entries as: - [Pattern]: [Why it failed, what happened] -->
- [2026-02-05] Hallucinated academic citations: AI-generated reference files may include fake citations with realistic formatting (journal names, author names, specific metrics). Always verify citations with web search before including them.
- [2026-02-05] Fontshare vs Google Fonts confusion: Fonts from Fontshare (Clash Display, Cabinet Grotesk, Satoshi, General Sans, Switzer) are NOT available on Google Fonts. Using a Google Fonts API URL for these fonts fails silently. Always verify font CDN sources match the actual font provider.

## Tool Configuration Notes
<!-- Add entries as: - [Tool]: [Configuration that works in this environment] -->
- [2026-02-05] Playwright MCP (Windows): Must use `cmd /c` wrapper: `claude mcp add playwright -- cmd /c npx -y @playwright/mcp@latest`. Bare `npx` command without `cmd /c` fails on Windows.
- [2026-02-05] Claude Code skill paths: Use relative paths (`references/typography-system.md`) in command files, not absolute Windows paths. Absolute paths break portability.

## Hebrew/RTL Notes
<!-- Add entries as: - [Finding]: [RTL-specific learning] -->

## Skill Upgrade History
- [2026-02-05] **Verification pass completed** (see VERIFICATION-LOG.md):
  - All 10 reference files verified against web sources
  - All 19 font names confirmed as real (9 display, 5 body, 3 Hebrew display, 4 Hebrew body, 3 monospace)
  - All Framer Motion API patterns confirmed correct for v11+
  - All 3 animated component libraries confirmed (Magic UI, Aceternity UI, Cult UI)
  - 5 issues found and fixed (2 in typography-system.md, 1 in testing-verification.md, 1 path portability across 6 command files, 1 SKILL.md frontmatter)
  - GSD integration confirmed registered
  - Interactive command testing (Gap 1) and Playwright MCP testing (Gap 3) deferred to separate sessions
