# The house skill standard (binding)

The rules every skill in `<skills>/` follows, distilled from the July 2026 skill standard (`~/.claude/skill-standard-2026.md`, itself from Anthropic's Agent Skills best practices and the Claude Code skills docs) and updated where it went stale. Where the two differ, this file wins. Each rule names the audit check that enforces it; rules with no check are the critic's job (`critic-prompt.md` in this folder).

Verified 2026-10-15 against the installed Claude Code 2.1.296 binary: the frontmatter field list, the YAML parse-failure behaviour, the 1536-character listing cap, the 1% listing budget, the `${CLAUDE_SKILL_DIR}` substitution scope, the effort values and the model table. Verified 2026-10-15 again in 2.1.299: the frontmatter regex and the retry are unchanged.

## Contents
1. Frontmatter fields
2. YAML that loads
3. Name
4. Description and when_to_use
5. Body
6. References
7. Paths and placeholders
8. Scripts
9. Evals
10. Facts that go stale
11. Nati's house rules
12. Check map

## 1. Frontmatter fields

Only these top-level fields (check `frontmatter-field`):

| Field | Rule |
|---|---|
| `name` | required by house rule (see §3) |
| `description` | required by house rule (see §4) |
| `when_to_use` | trigger phrases and example requests; appended to the description in the listing |
| `argument-hint` | autocomplete hint such as `"[path] [--flag]"`; quote it, or YAML reads `[x]` as a list |
| `arguments` | named positional arguments for `$name` substitution, a list or a space-separated string |
| `disable-model-invocation` | `true` when only the user may start it (deploy, commit, destructive fixes) |
| `user-invocable` | `false` hides it from the `/` menu (background knowledge only) |
| `allowed-tools`, `disallowed-tools` | tools pre-approved or removed while the skill is active; a YAML list is safest |
| `model` | a model override or `inherit` |
| `effort` | `low`, `medium`, `high`, `xhigh`, `max`, or an integer |
| `context`, `agent` | `context: fork` runs the skill in a subagent (self-contained tasks only); `agent` names its type and needs `context: fork` |
| `hooks` | hooks scoped to the skill (a mapping) |
| `paths` | globs that limit auto-activation |
| `shell` | `bash` (default) or `powershell` for `` !`cmd` `` injection |
| `license` | free text |
| `metadata` | a mapping: `author`, `version`, `calibrated-for`, `research-date`, `compatibility`, `tags` |

Migrations: `triggers` merges into `when_to_use`; `skill_id` is deleted; top-level `version`, `author`, `tags`, `category` and `compatibility` move into `metadata`. Claude Code also reads a top-level `version`, and skill-creator's `quick_validate.py` accepts a top-level `compatibility`, but the house standard keeps both in `metadata` so every skill has one shape. That validator allows only `name`, `description`, `license`, `allowed-tools`, `metadata` and `compatibility`, so it rejects `when_to_use` and the other Claude Code fields: this audit, not `quick_validate.py`, is the judge for skills in `<skills>/`.

Value types (check `frontmatter-value`): booleans unquoted; `effort`, `context`, `shell` from the lists above; `metadata` and `hooks` are mappings; `agent` without `context: fork` does nothing.

## 2. YAML that loads

The frontmatter must be valid YAML for a strict parser (check `frontmatter-parse`): skill-creator's `quick_validate.py` (PyYAML `safe_load`) and other tools reject the whole block on one mistake. Claude Code is more forgiving, once. Verified 2026-10-15 in the Claude Code 2.1.296 code (steps 1-4 rechecked in 2.1.299), with the outcomes reproduced under Bun's YAML parser:

1. It finds the block with `/^---\s*\n([\s\S]*?)---\s*\n?/`, which is not anchored to a line: the frontmatter ends at the first `---` anywhere, even inside a value. A value containing `---` loses the rest of the block: the cut YAML either breaks (step 4) or parses with the later fields moved into the body. Never write `---` inside the frontmatter (check `frontmatter-parse`).
2. It parses the block with `Bun.YAML.parse`.
3. When that fails, it retries once: every top-level single-line plain value that contains one of `` {}[]*&#!|>%@` `` or `: ` is wrapped in double quotes, and leading tabs become spaces.
4. When the retry fails too, the skill still loads but with every field dropped: the name falls back to the folder, the description to the first line of the body, and `allowed-tools`, `model` and `disable-model-invocation` stop applying. The only trace is a warn-level log line.

So a single-line `description: Checks things: fast` loads in Claude Code but fails skill-creator's validator, while the same value continued on a second line, a value that ends with `:`, or any broken quote drops everything. The audit message names the outcome. The usual causes:

- an unquoted value that contains `: ` or ends with `:`;
- an unquoted value that starts with `@`, a backtick, `*`, `&`, `!`, `%`, `[` or `{`;
- a quoted value with text after the closing quote, or an unterminated quote;
- an unknown escape such as `\d` inside double quotes;
- tabs in indentation, duplicate keys (Bun keeps the last value), `key:value` with no space.

Default fix: wrap long values in single quotes and double every inner `'`. An unquoted ` #` starts a YAML comment and cuts the rest of the line from the value (check `frontmatter-comment`).

## 3. Name

- Lowercase letters, digits and single hyphens, at most 64 characters, no leading or trailing hyphen (check `name-invalid`).
- Equal to the folder name, which is the `/command` (check `name-mismatch`). Never rename a skill folder.
- No reserved words `claude` or `anthropic` (check `name-reserved`).
- Claude Code treats `name` as optional (it defaults to the folder); the house standard requires it so the two never drift (check `name-missing`).

## 4. Description and when_to_use

- Third person: "Builds...", "Audits...". Never "I", "you", "we" or an imperative opening such as "Use when" (check `description-person`).
- The first sentence is the key use case, so it survives truncation. Then what it does and when to use it, with words users actually say.
- At most 1024 characters (check `description-length`); target about 700 (check `description-long`).
- No XML-like tags (check `description-xml`); avoid `<` and `>` entirely, because skill-creator's `quick_validate.py` rejects them (check `description-angle`).
- The listing shows description, `" - "`, when_to_use, and cuts the result at 1536 characters by default (check `listing-length`). The whole listing gets about 1% of the context window, so every wasted character costs every other skill.
- Hebrew trigger phrases are intentional: keep them, and put long trigger lists in `when_to_use`, together with a short "Not for:" list that names the sibling skill to use instead.

## 5. Body

- SKILL.md body at most 500 lines (check `body-length`). Overflow goes to `references/<topic>.md` by progressive disclosure.
- Concise: Claude is smart. State what to do; skip narration and explanations of well-known concepts.
- One default approach plus an escape hatch, not a menu of options.
- Workflows get numbered steps and a copyable checklist; validators get a loop: run, fix, run again.
- Low freedom for fragile operations (exact commands and scripts), high freedom for heuristic work (guidelines).
- One term per concept throughout.
- Skill content stays in context for the whole session once invoked, so write standing instructions, not one-time narration.
- No time-sensitive wording (check `time-sensitive`): state the fact plainly, put a dated fact on a line containing "Verified" and the date, and keep superseded methods in a collapsed "Old patterns" section.

## 6. References

- One level deep: SKILL.md points to `references/<topic>.md`, and that file never sends the reader to another reference for a required step (checks `reference-chain`, `reference-depth`). Pointing to another file for optional background is fine.
- Every reference is named in SKILL.md, ideally in a "Read when" table (check `reference-orphan`).
- A reference over 100 lines starts with `## Contents` and a numbered list of its sections within its first 40 lines (check `toc-missing`).
- Every skill path a file names must exist (checks `link-broken` for SKILL.md, `ref-link-broken` elsewhere, `cross-skill-link` for sibling skills). Templates are exempt: their paths are project paths. A bare path such as `scripts/x.mjs` counts only when its first folder exists in the skill, and not in a sentence that talks about the project or a repo; a path that goes on with a placeholder (`<skill>/references/harvest/<slug>.md`) is an output pattern, not a link. Write `<skill>/...` when a skill path must be unambiguous.
- Only one `SKILL.md` per skill, at the root (check `nested-skill-md`).

## 7. Paths and placeholders

- Forward slashes only, in every path, also on Windows (check `backslash-path`).
- In SKILL.md, bundled files are `${CLAUDE_SKILL_DIR}/...`; Claude Code substitutes it in the SKILL.md text and in `allowed-tools` only, with forward slashes. Never a bare `scripts/<file>` in a command: the working directory is the project, not the skill (check `skill-dir-placeholder`).
- Reference files are read without substitution. SKILL.md defines `<skill>` = `${CLAUDE_SKILL_DIR}` and `<skills>` = `${CLAUDE_SKILL_DIR}/..`, and references use those placeholders (check `skill-dir-placeholder`).
- `${CLAUDE_PROJECT_DIR}` for project files; `$ARGUMENTS`, `$ARGUMENTS[N]`, `$N` and named `$name` for arguments.
- No user-specific absolute paths in skill files (check `absolute-user-path`: the Windows, macOS and Git Bash forms `<drive>:/Users/<name>/`, `/Users/<name>/` and `/<drive>/Users/<name>/`); `~/.claude/...` is fine in prose.

## 8. Scripts

- Scripts solve, not punt: explicit error handling and messages that list the valid options.
- Every runnable script prints its usage on `--help` (check `script-help`). Library modules that only export functions are exempt.
- No unexplained constants: a comment gives the reason for each value.
- Say whether Claude runs a script ("Run" followed by the full command) or reads it for the algorithm.
- State dependencies (`npm i -D puppeteer`) and the Node version; never assume something is installed.
- Scripts that touch the network, install packages or write outside the project say so in their help and in SKILL.md.

## 9. Evals

`evals/evals.json` must parse (check `json-invalid`) and use this shape (check `evals-shape`):

```json
{
  "skill_name": "<name>",
  "evals": [{ "id": 0, "name": "short-slug", "prompt": "...", "expected_output": "...", "files": [] }],
  "trigger_evals": [{ "query": "...", "should_trigger": true }]
}
```

`trigger_evals` is optional; skill-creator's description optimizer reads the same `query` and `should_trigger` pairs.

## 10. Facts that go stale

- **Models.** The current family is `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5` and `claude-fable-5-1` (Verified 2026-10-15 in the Claude Code 2.1.296 model table). Older ids and names (the 3.x and 4.x lines, `claude-opus-5`, `claude-sonnet-5`, `claude-fable-5`, "Opus 5", "Sonnet 5") are flagged in markdown, in eval files and in `scripts/` code, unless the line marks them as old (in code: a comment such as `// legacy id`) or also names a current model, which makes it a comparison (check `model-stale`). New skills record `calibrated-for: "claude-opus-5-5 (2026-10)"` in `metadata`.
- **Tools.** The Task tool was renamed Agent: subagents are spawned with the Agent tool and `subagent_type`, and `allowed-tools` lists `Agent` (check `task-tool`).
- **Versions and APIs** come from installed code or official docs, with the source and date noted; a version in a skill without a dated source is a critic finding.

## 11. Nati's house rules

- **Only the plain hyphen-minus `-`** (U+002D) in every file of a skill, in every language: no en dash U+2013, em dash U+2014 or Hebrew maqaf U+05BE, also in code strings and comments (check `dash`; a file with an unknown extension, such as `.ipynb` or none, is read when it is valid UTF-8 with no NUL byte in its first 8 KB). Ranges are `15-30`; Hebrew prefixes are `ב-2025`.
- **Hebrew documents end in `.rtl.md`** (check `hebrew-not-rtl`, more than 30% Hebrew letters). SKILL.md keeps its name. Never rename a file that other files link to without updating the links in the same edit.
- **Windows commands for the user.** Commands Claude runs itself may use the Bash tool (Git Bash); commands handed to Nati to type are cmd or PowerShell, with forward-slash paths in quotes. The critic checks this.
- **Folders `.git/`, `.claude/` and `.context/` inside a skill are never edited.**

## 12. Check map

| Check | Severity | Rule |
|---|---|---|
| `skill-md-missing`, `frontmatter-missing`, `frontmatter-parse` | error | §2 |
| `frontmatter-field`, `frontmatter-value` | error (some values warn) | §1 |
| `frontmatter-comment` | warning | §2 |
| `name-missing`, `name-invalid`, `name-mismatch`, `name-reserved` | error | §3 |
| `description-missing`, `description-length`, `description-xml`, `listing-length` | error | §4 |
| `description-long`, `description-person`, `description-angle` | warning | §4 |
| `body-length` | error | §5 |
| `time-sensitive` | warning | §5 |
| `link-broken` | error | §6 |
| `ref-link-broken`, `cross-skill-link`, `reference-chain`, `reference-depth`, `reference-orphan`, `toc-missing`, `nested-skill-md` | warning | §6 |
| `backslash-path` | error | §7 |
| `skill-dir-placeholder`, `absolute-user-path` | warning | §7 |
| `script-help` | warning | §8 |
| `json-invalid` | error in `evals/`, warning elsewhere | §9 |
| `evals-shape` | warning | §9 |
| `model-stale`, `task-tool` | warning | §10 |
| `dash` | error | §11 |
| `hebrew-not-rtl` | warning | §11 |

Waivers: a warning is waived by `audit-ok:<check-id>` (comma-separated for several) on the same line or the line above, always with a reason. Errors cannot be waived.
