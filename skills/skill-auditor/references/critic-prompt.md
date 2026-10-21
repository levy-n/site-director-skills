# The fresh critic: one reviewer for what the script cannot judge

Read this when SKILL.md's critic triggers apply. The critic is one fresh-context reviewer that reads the skill's files, not this conversation: a reviewer that did not write the skill finds triggering gaps, contradictions and broken procedures that self-review misses. One critic per audit; the main thread does not re-review its own fixes in between.

## Contents
1. Setup
2. Fill in before sending
3. The prompt
4. Output schema
5. Severity scale
6. Vetting the findings

## 1. Setup

- **With subagents:** spawn one Agent (`subagent_type: general-purpose`, high effort) with the prompt in §3, filled in. It gets file paths, never the builder's reasoning.
- **Without subagents:** do a separate pass that starts by reading the files in §2 as if you have never seen the skill, and answer §3 in the §4 shape. Do not skim your own draft.
- The critic only reads. It never edits files, runs the skill's scripts beyond `--help`, installs anything or uses the network.

## 2. Fill in before sending

| Placeholder | Value |
|---|---|
| `{{SKILL_DIR}}` | the skill folder, absolute, forward slashes |
| `{{SIBLINGS}}` | every other skill the skill names (routing tables, "Not for" lists, precedence rules), as absolute folder paths; "none" if it names none |
| `{{AUDIT_REPORT}}` | the last `audit-skill.mjs` text report for this skill, pasted |
| `{{CONTEXT}}` | one or two sentences: who uses the skill and for what (for MediaWave skills: Nati, Hebrew-speaking, Windows, MediaWave client sites) |

## 3. The prompt

```text
You are reviewing an Agent Skill with fresh eyes. You did not write it. Do not edit anything.

Skill folder: {{SKILL_DIR}}
Sibling skills it names: {{SIBLINGS}}
Who uses it: {{CONTEXT}}
The structural audit already ran; its report is below. Do not repeat its findings unless you
disagree with one or see a consequence it missed.
{{AUDIT_REPORT}}

Read SKILL.md, every file under references/, the header comment and --help text of every script,
and evals/evals.json. Then answer, citing file and line with an exact quote for every finding:

1. Triggering. Claude chooses skills from the listing: name, description, " - ", when_to_use,
   cut at 1536 characters. Judge from that text alone.
   a. Write 5 realistic requests that SHOULD trigger this skill: mix Hebrew and English, vary
      the wording, and include at least two that never name the skill or its tools.
   b. Write 5 near-miss requests that should NOT trigger it: requests a sibling skill owns, or
      that share keywords with this skill but need something else.
   c. For each of the 10, say whether the listing text would make Claude pick this skill, and why.
   d. Check that the first sentence is the key use case, the description is third person, and the
      "Not for" list names the skill to use instead. Propose a rewrite only if (c) found misses.
2. Contradictions. Read each sibling's SKILL.md and any sibling file this skill points to. List
   every rule that conflicts: who owns a step, values, versions, file names, artifacts, order of
   steps. For each, say which skill wins under the precedence this skill states, or that none is
   stated.
3. Ambiguity. Instructions with two readings, undefined terms, steps without a done criterion,
   choices left open where the skill should fix one default and an escape hatch.
4. Duplication. The same rule in two files of this skill (drift risk), or a procedure copied from
   a sibling instead of routed to it.
5. Stale facts. Versions, model ids, tool names, APIs and dates with no source or dated
   "Verified" line, or that you believe are out of date. Say which source would settle it.
6. Broken procedures. Walk every workflow as if executing it: missing inputs, commands whose
   flags differ from the script's --help, bare relative paths, paths that do not exist, Windows
   or Git Bash pitfalls, loops with no exit, gates with no named approver.
7. Safety. Steps or scripts that touch the network, install packages, delete or overwrite files,
   push, deploy, send messages or need credentials. Does the skill ask first? Should it set
   disable-model-invocation: true?
8. House rules the script cannot see: commands handed to the user must be Windows (cmd or
   PowerShell); Hebrew text reads as natural Israeli Hebrew; one default plus an escape hatch;
   numbered steps and a checklist for workflows; standing instructions, not narration.

Report every issue with severity and confidence. Do not filter by severity; filtering happens
later. Return only the JSON object described below, nothing else.
```

## 4. Output schema

```json
{
  "skill": "skill-name",
  "summary": "two or three sentences: what the skill does well, and its biggest risk",
  "triggering": {
    "should_trigger": [
      { "prompt": "the request", "verdict": "triggers | misses | unclear", "why": "which listing words decide it" }
    ],
    "should_not_trigger": [
      { "prompt": "the request", "verdict": "stays out | false trigger | unclear", "owner": "the skill that should take it", "why": "..." }
    ],
    "description_rewrite": null
  },
  "findings": [
    {
      "id": "C1",
      "category": "triggering | contradiction | ambiguity | duplication | stale | procedure | safety | house-rule",
      "severity": "high | medium | low",
      "confidence": "high | medium | low",
      "file": "references/<file>.md",
      "line": 12,
      "evidence": "the exact quoted text",
      "problem": "what goes wrong, for whom, when",
      "fix": "the smallest change that removes it"
    }
  ]
}
```

`description_rewrite` is a string only when §3 item 1c found a miss or a false trigger; otherwise `null`.

## 5. Severity scale

| Severity | Meaning | Examples |
|---|---|---|
| high | the skill fails its job or can cause harm | misses common requests or takes a sibling's; a step that cannot run; two skills that give opposite orders with no precedence; a network, delete or deploy step with no gate; a stale fact that produces broken output |
| medium | it works, but noticeably worse or fragile | a step likely to be read two ways; a rule duplicated in two files; no default where one is needed; weak trigger coverage in one language |
| low | polish | wording, order, a small redundancy |

Confidence is the critic's certainty that the problem is real: high when the quote proves it, medium when it depends on context the critic could not see, low when it is a hunch worth checking.

## 6. Vetting the findings

The main thread processes the JSON before changing anything:

1. Confirm each quote exists at the cited place. Drop findings whose evidence is not in the file.
2. Reproduce procedure findings: read the script's `--help`, check the path, or run the step in a scratch folder.
3. Check stale-fact findings against a real source (installed package, official docs) and note the source and date.
4. For each finding decide: fix, or keep with a one-line reason. High findings are never kept without telling Nati.
5. Description and when_to_use rewrites go to Nati with the trigger table from §4; apply them only after he approves.
6. After the fixes, run `audit-skill.mjs` again; it must still report 0 errors.
