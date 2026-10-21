---
name: skill-auditor
description: 'Audits Agent Skills folders against the house skill standard and reports every defect with file and line: frontmatter YAML that Claude Code would drop, invalid fields, name and description limits, the 1536-character listing cap, body length, broken links, backslash and absolute paths, en dash, em dash and maqaf, stale model ids, time-sensitive wording, missing tables of contents and Hebrew files without .rtl.md. Runs a read-only script, then a fix loop until zero errors, then one fresh-context critic for triggering, contradictions and stale facts. Use after creating or editing any skill.'
when_to_use: 'Triggers: "בדוק סקיל", "ביקורת סקיל", "תבקר את הסקיל", "בדוק את כל הסקילים", "האם הסקיל תקין", "למה הסקיל לא נטען", "skill audit", "audit this skill", "is this skill valid", "lint the skill", "check my skills", "review SKILL.md". Also after any edit to a skill, before sharing a skill, and when a skill stops triggering or loses its settings. Not for: writing a new skill from zero or benchmarking its output with evals (skill-creator).'
argument-hint: "[skill-dir ...] [--json]"
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(node ${CLAUDE_SKILL_DIR}/scripts/audit-skill.mjs *)
  - Bash(node ${CLAUDE_SKILL_DIR}/scripts/selftest.mjs *)
license: Proprietary (MediaWave)
metadata:
  author: mediawave
  version: "1.0.0"
  calibrated-for: "claude-opus-5-5 (2026-10)"
  research-date: "2026-10-15"
---

# Skill Auditor

Checks a skill folder against the house standard (`references/standard.md`) with a script, fixes what the script finds in a loop, and sends what a script cannot judge (triggering, contradictions, stale facts) to one fresh-context critic. The script only reads files: it never runs the audited skill's code and never uses the network.

Paths: `<skill>` means `${CLAUDE_SKILL_DIR}` and `<skills>` means `${CLAUDE_SKILL_DIR}/..` (the skills root). Reference files use these placeholders.

## Run the audit

```bash
node ${CLAUDE_SKILL_DIR}/scripts/audit-skill.mjs <skill-dir> [more dirs] [--json] [--strict] [--limit N] [--each]
```

- `<skill-dir>`: a skill folder, or its `SKILL.md`. A bare skill name means `<skills>/<name>`.
- `--each`: treat every folder argument as a folder of skills and audit each child that has a `SKILL.md` (for example `--each <skills>` for the whole skills root). Do not mix it with single skill folders in one run.
- `--json`: one JSON object (`totals`, and per skill `findings` with `severity`, `check`, `file`, `line`, `message`, `waived`). Use it when you post-process; read the text report otherwise.
- `--strict`: warnings also fail. `--limit 0`: print every finding (default 5 per check and file).
- Exit codes: 0 clean (or warnings only), 1 errors (or warnings with `--strict`), 2 usage error.
- Needs Node 20 or newer, nothing else.

$ARGUMENTS names the targets. With no arguments, audit the skills created or edited in this session; if there are none, ask which skill.

For Nati in his own terminal (cmd or PowerShell; forward slashes work in both):
`node "%USERPROFILE%/.claude/skills/skill-auditor/scripts/audit-skill.mjs" <skill-folder>` (PowerShell: `$env:USERPROFILE` in place of `%USERPROFILE%`).

## Workflow

Copy this checklist and tick it as you go:

- [ ] 1. Run the script on each target. Note the counts per skill.
- [ ] 2. Read the report: errors first, then warnings, then the HOW TO FIX lines.
- [ ] 3. If you were asked only to audit, or the skill is not yours to edit, stop here and report (step 7).
- [ ] 4. Fix loop: fix the errors, run the script again, repeat until 0 errors (at most 3 rounds; then report what is left and why).
- [ ] 5. Warnings: fix each one, or waive it on purpose (below). Every warning left gets a reason in the report.
- [ ] 6. Fresh critic when the trigger list below applies.
- [ ] 7. Report to Nati: counts before and after, what changed in which file, waivers with reasons, critic findings and what was done with each.

## Reading the report

Each finding is `check-id  file:line  message`. Errors break loading, the listing or a house rule and can never be waived. Warnings are judgment calls.

| Errors | Meaning |
|---|---|
| `skill-md-missing` | the folder has no `SKILL.md` |
| `frontmatter-missing`, `frontmatter-parse` | no `---` block, YAML that a strict parser rejects (skill-creator's validator does), or a `---` inside the frontmatter, where Claude Code ends the block early. The message says what Claude Code does with it: it loads the skill with every field dropped, its retry rescues a single-line value, or the fields after the `---` become body text. Usual causes: `: ` or a final `:` in an unquoted value, a broken quote, `---` used as a dash |
| `frontmatter-field`, `frontmatter-value` | a field outside the valid list, or a value of the wrong type (`effort`, `context`, `shell`, booleans, `metadata`). A few `frontmatter-value` findings are warnings: `argument-hint` read as a list, quoted booleans, `agent` without `context: fork`, an older `model` id |
| `name-missing`, `name-invalid`, `name-mismatch`, `name-reserved` | name absent, not lowercase-hyphen, not the folder name, or containing a reserved word |
| `description-missing`, `description-length`, `description-xml` | no description, over 1024 characters, or an XML-like tag |
| `listing-length` | description + `" - "` + when_to_use over 1536 characters: the listing cuts the rest |
| `body-length` | SKILL.md body over 500 lines |
| `link-broken` | SKILL.md names a skill file that does not exist |
| `backslash-path` | a backslash path in a markdown file |
| `dash` | U+2013, U+2014 or U+05BE in any text file of the skill (a file with an unknown extension counts as text when it is valid UTF-8 with no NUL byte) |
| `json-invalid` (in `evals/`) | an eval file that does not parse |

| Warnings | Meaning |
|---|---|
| `description-long`, `description-person`, `description-angle` | over about 700 characters; not third person; contains `<` or `>` |
| `frontmatter-comment` | an unquoted ` #` cuts the rest of the line from the value |
| `toc-missing` | a reference over 100 lines with no table of contents in its first 40 lines |
| `reference-chain`, `reference-depth`, `reference-orphan` | a reference that sends the reader to another reference for a required step; nested deeper than `references/`; never named in SKILL.md |
| `ref-link-broken`, `cross-skill-link` | a missing skill path named in a non-SKILL.md file; a missing path in a sibling skill |
| `skill-dir-placeholder` | `<skill>` used but not defined, a bundled script run by a bare relative path, or `${CLAUDE_SKILL_DIR}` in a reference file (only SKILL.md and `allowed-tools` get it substituted) |
| `absolute-user-path` | a user-specific absolute path: `<drive>:/Users/<name>/` (either slash), `/Users/<name>/`, or the Git Bash form `/<drive>/Users/<name>/` |
| `time-sensitive` | a time word outside a dated `Verified` line or an "Old patterns" section |
| `model-stale`, `task-tool` | an older model id or name (also in `scripts/` code) not marked as old; the `Task` tool, which was renamed Agent |
| `hebrew-not-rtl` | a `.md` file with more than 30% Hebrew letters that does not end in `.rtl.md` |
| `script-help` | a runnable script without `--help` |
| `json-invalid` (outside `evals/`), `evals-shape`, `nested-skill-md` | broken JSON data; an eval file in the wrong shape; a second SKILL.md inside the skill |

The full rule behind each check, with its source, is in `references/standard.md` §12.

## Fixing

Fix errors with the smallest edit that keeps the meaning:

- **YAML:** wrap the value in single quotes and double every inner `'`. Never change the words while doing it.
- **Invalid fields:** `triggers` merges into `when_to_use`; `version`, `author`, `tags`, `compatibility` move under `metadata`; `skill_id` is deleted.
- **Dashes:** replace with `-` (ranges `15-30`, Hebrew `ב-2025`), `:` or a rewrite. Code that must match these characters writes them as code-point escapes or `String.fromCharCode(0x2013)`, never as the literal character.
- **Paths:** forward slashes; `${CLAUDE_SKILL_DIR}/scripts/<file>` in SKILL.md; `<skill>/scripts/<file>` in references, with `<skill>` defined in SKILL.md.
- **Body over 500 lines:** move whole sections to `references/<topic>.md` and leave a one-line pointer with "read when". Restructure, never delete domain knowledge.
- **Broken links:** fix the path when the file exists elsewhere; when the file was never written, report it (do not invent its content).

A warning that is right to keep gets a waiver on the same line or the line above, with a reason: `<!-- audit-ok:time-sensitive quoting a dated changelog -->` in markdown, `// audit-ok:script-help library module` in code. Waivers work for warnings only, and the report still counts them.

Run the script again after every round of edits. Done means 0 errors, every warning fixed or waived with a reason, and `--strict` clean when the skill is new.

## Never fix without Nati

- **Description and when_to_use wording**: they decide triggering. Propose the new text and the critic's should-trigger and should-not-trigger results; Nati approves. Quoting the YAML without changing words is fine.
- **The name and the folder**: the folder is the `/command`. Never rename it.
- **Hebrew trigger phrases**: keep them; add, never remove, unless Nati asks.
- **Renaming files for `.rtl.md`**: only with every link updated in the same edit, and only in skills you were asked to change.
- **Deleting files** (orphans, old references), and any file in `.git/`, `.claude/` or `.context/`.
- **Facts**: model ids, versions and APIs change only after checking a real source (installed code, official docs) and noting it.
- **Skills synced from claude.ai** (for example nati-design-prefs, anything under `<skills>/synced/`) and skills Nati marked do-not-touch: audit read-only and report.

## Fresh critic

The script cannot judge whether the description triggers on the right requests, whether the skill contradicts a sibling skill, or whether its facts are stale. Use one fresh-context reviewer when:

- a skill is new, or its description or when_to_use changed;
- a restructure moved more than a few sections;
- before the skill is handed to someone else;
- a skill stopped triggering or triggers on the wrong requests.

Spawn one Agent (general-purpose) with `references/critic-prompt.md` filled in: the skill path, the sibling skills it names, and the script's last report. Give it files, not this conversation. Without subagents, do a separate pass that starts by reading the files as if new. Vet every finding against its quoted evidence before acting, fix the confirmed ones, and run the script again.

## Self-test

After editing this skill, run `node ${CLAUDE_SKILL_DIR}/scripts/selftest.mjs` (it builds nine fixture skills in a temp folder, checks that every check fires and that correct but tricky content raises nothing, tests the exit codes, and audits this skill with 0 errors), then the audit on this folder with `--strict`.

## References

| File | Read when |
|---|---|
| `references/standard.md` | deciding whether a finding is right, writing or fixing any part of a skill, or explaining a rule |
| `references/critic-prompt.md` | running the fresh critic |
| `evals/evals.json` | testing this skill's triggering and behaviour |
