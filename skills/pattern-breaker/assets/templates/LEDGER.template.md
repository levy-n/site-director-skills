# LEDGER · <client-slug>

> Open items, critic findings and verification results. Keep it current: while any item below is open, the work is not finished; continue instead of ending the turn with a summary. Exception: at a human gate (wave approval, production deploy, and any intake, font, concept or direction question), ask with the question tool, or in one numbered message without it, and stop until answered. Record the gate as an open item owned by the user.

## Open
- [ ] <item>: <owner / next action>

## Done
- [x] <item>: <evidence: file, frame, command output>

## Decisions
The decisions themselves live in the project's one decision log (numbered, append-only): `design/design-decisions.rtl.md` when it exists (site-director), else a root `DECISIONS.md` or `DECISIONS.rtl.md` (an existing root log always wins). Here, one pointer per decision:
- D<n>: <one line> (<date>)

## Critic findings
| Milestone (1 plan · 2 first build · 3 before handoff · W1 · handoff) | Finding | Severity | Outcome (fixed / rejected / deferred) | Evidence |
|---|---|---|---|---|

## Verification log
| Date | Command | Result |
|---|---|---|
| | node <skill>/scripts/motion-audit.mjs <url> --out design/audit --budget-cls 0.05 | <n>/<n> pass |
| | node <skill>/scripts/gates.mjs <url> --out design/audit | <n>/<n> pass |
| | node <skill>/scripts/slop-scan.mjs src --out design/audit | index <n> |
| | node <skill>/scripts/scroll-film.mjs <url> --out design/film | <n> frames |

## Assumptions to confirm with the user
- <assumption>: <impact if wrong>
