---
name: creative-seeds
description: Injects creative absurdity before brainstorming, naming, or writing tasks to break AI pattern-thinking. Randomly samples 3 surreal micro-stories from a 50-seed collection and uses them internally as cognitive disruptors to spark unconventional output.
when_to_use: Before brainstorming names, concepts, or taglines; before creative writing; when output feels generic or predictable; user asks for fresh, unexpected, or out-of-the-box ideas. Triggers - "creative seeds", "fresh ideas", "think differently", "break the pattern", "רעיונות מקוריים", "צא מהקופסה".
allowed-tools: Bash, Read
---

# Creative Seeds

Before any creative task, sample 3 random seeds to disrupt default patterns.

## Seeds for this session

!`grep -v -e '^#' -e '^>' -e '^---' -e '^[[:space:]]*$' "${CLAUDE_SKILL_DIR}/seeds.md" | shuf -n 3`

If no seeds appear above, run this (verified working in Git Bash on this machine — `shuf` is at /usr/bin/shuf; the grep filters out headings, separators, and blank lines so only seed paragraphs are sampled):

```bash
grep -v -e '^#' -e '^>' -e '^---' -e '^[[:space:]]*$' "${CLAUDE_SKILL_DIR}/seeds.md" | shuf -n 3
```

## Instructions

1. Read the 3 sampled seeds — let the absurdist logic seep in
2. Proceed with the actual creative task with that mental residue active
3. Do NOT explain or mention the seeds to the user unless asked — use them internally to shift your thinking frame
4. If more disruption is needed, read `${CLAUDE_SKILL_DIR}/seeds.md` and re-run the sampling command for a fresh batch

The seeds are not prompts. They are cognitive disruptors. They work by contaminating your pattern-matching with nonsense, forcing novel connections.
