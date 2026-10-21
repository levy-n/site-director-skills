# site-director and the skills it routes to

`site-director` is MediaWave's single entry point for website work, from brief to delivery.
It routes each stage to the skill that owns it, so it only works fully when those skills are installed next to it.
This repository holds `site-director` and every skill its routing table (`skills/site-director/references/routing.md`) names, as installed on Nati's machine on 2026-10-21.

## Install

Copy every folder under `skills/` into your Claude Code skills folder:

- Windows: `C:\Users\<you>\.claude\skills\`
- macOS / Linux: `~/.claude/skills/`

Then restart Claude Code.
Start any website task with the `site-director` skill; it calls the others by name.

## What is inside

| Skill | Role for site-director |
|---|---|
| `site-director` | The entry point: creative direction, storyboard, motion prototype, QA, handoff |
| `pattern-breaker` | Concept lab, foundations, motion engine, verification scripts (second in precedence) |
| `mediawave-landing-page` | Business discovery, proposal, copy strategy, legal pages, SEO, deploy and handoff |
| `rive-studio` | Rive interactive pieces |
| `client-content-editor` | The client CMS on the shared multi-tenant Payload platform |
| `nati-design-prefs` | Nati's font, typography and dash rules (font specimens A/B/C/D) |
| `site-gate-audit` | The 10-gate production audit before shipping |
| `impeccable` | Harden, audit, critique, polish (keep version 3.9.1) |
| `design-loop-router` | One measured repair pass on an existing section, late in the build |
| `mobile-ux-fixer` | Device defects at QA |
| `frontend-design` | Anthropic's official design principles skill |
| `frontend-super` | Reference only: RTL map, DPR cap, scoring format |
| `pagespeed-optimizer` | React + Vite performance phases |
| `design-inspiration-to-code` | Dissecting how a reference motion works |
| `frontend-pro` | Optional tooling: a lean CLAUDE.md, DevTools traces |
| `claude-design-prompt-builder` | After delivery: brand-matched assets in Claude Design |
| `creative-seeds` | Optional, internal: idea sampling while directions are generated |
| `skill-auditor` | Run after editing any of these skills |

## Notes

- **frontend-design** comes from Anthropic's official plugin marketplace (`claude-plugins-official`, licence in its folder).
  On Nati's machine it is read by path from the plugins folder; installed under `skills/` it becomes a normal skill.
- **impeccable** and **mobile-ux-fixer** are third-party skills; their licences stay with them.
- **client-content-editor/references/infrastructure.md**: server IPs, hostnames, the tailnet name, the Cloudflare account ID and the tunnel ID are replaced by `<PLACEHOLDERS>` in this copy.
  The real values stay on Nati's machine. No passwords or tokens are stored in any file here.
- Several skills point to paths on Nati's machine (`G:\Web-Dev\...`, `C:\Users\User\...`).
  Those paths are references, not requirements; adjust them on another machine.
