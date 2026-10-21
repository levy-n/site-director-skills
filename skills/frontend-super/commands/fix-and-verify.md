---
description: Fix a bug with test-first approach and visual verification
argument-hint: [bug description]
---

Fix the following issue: $ARGUMENTS

## Process

### Step 1: Find Root Cause
- Search the codebase for relevant files
- Read the code to understand the issue
- Identify the exact cause (don't guess)

### Step 2: Write Failing Test
- Write a test that reproduces the bug
- Run the test — confirm it FAILS
- This proves the bug exists and the test catches it

### Step 3: Implement Fix
- Make the minimal change needed to fix the issue
- Do NOT refactor unrelated code
- Do NOT add features

### Step 4: Verify Test Passes
- Run the specific test — confirm it PASSES
- Run the full test suite — confirm no regressions

### Step 5: Visual Verification (if UI bug)
- If Playwright MCP available: navigate to the page, take screenshot showing the fix
- If not: describe what changed visually
- Check at mobile (375px) and desktop (1280px) if layout-related

### Step 6: Self-Review
Check the fix for:
- No new bugs introduced
- No security issues (XSS, injection)
- No hardcoded values
- No console.log left behind
- No unused imports added

Report: "Fixed: [summary]. Test: [test name] passes. No regressions."
