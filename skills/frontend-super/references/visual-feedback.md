# Visual Feedback Reference

## Table of Contents
- [Chrome Integration Details](#chrome-integration-details)
- [Playwright MCP Configuration](#playwright-mcp-configuration)
- [Figma MCP Workflows](#figma-mcp-workflows)
- [Screenshot-Based Workflows](#screenshot-based-workflows)
- [Choosing the Right Tool](#choosing-the-right-tool)
- [Integration with frontend-super](#integration-with-frontend-super)

## Chrome Integration Details

### Setup

```powershell
# Launch Claude Code with Chrome
claude --chrome

# Install extension from Chrome Web Store: "Claude in Chrome"

# Windows Chrome path (for reference):
# "C:\Program Files\Google\Chrome\Application\chrome.exe"
```

> **Windows Note:** Chrome is typically installed at `C:\Program Files\Google\Chrome\Application\chrome.exe`. If you need to launch Chrome manually or reference it in scripts, use this path (or check `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe` for 32-bit installs).

### Available Actions
- `browser_navigate(url)` -- open any URL
- `browser_click(selector)` -- click elements
- `browser_fill(selector, value)` -- fill form fields
- `browser_screenshot()` -- capture current viewport
- `browser_console_messages()` -- read console output
- `browser_record_gif()` -- record interaction sequence

### Workflow: Fix-and-Verify in One Prompt

```
"Fix the navigation dropdown on /dashboard. Open the page in Chrome,
click the user menu, take a screenshot showing the bug, fix it,
then take another screenshot proving it works."
```

Claude will: open page -> screenshot before -> edit code -> hot reload -> screenshot after.

### Limitations
- Requires visible Chrome window (no headless mode)
- Only Chrome proper -- Brave, Arc, and Edge not supported
- Auth sessions: uses your existing cookies, but cannot handle OAuth redirects automatically
- Cannot interact with elements inside iframes reliably
- No network throttling or device emulation

## Playwright MCP Configuration

### Installation

```powershell
# Windows requires cmd /c wrapper for npx
claude mcp add playwright -- cmd /c npx -y @playwright/mcp@latest
```

### Settings File Configuration

In `.claude\settings.json` (Windows requires `cmd` wrapper):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@playwright/mcp@latest"]
    }
  }
}
```

For headless (CI/CD):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@playwright/mcp@latest", "--headless"]
    }
  }
}
```

### Key Tools (25 total)
- `browser_navigate` -- go to URL
- `browser_take_screenshot` -- capture viewport
- `browser_click` / `browser_fill` -- interact
- `browser_console_messages` -- read logs
- `browser_generate_playwright_test` -- auto-generate test file from interaction

### Critical Gotcha

First time: say "use playwright MCP to navigate to..." explicitly.
Otherwise Claude may run `npx playwright` via shell, bypassing MCP entirely.

### Multi-Breakpoint Screenshot Workflow

```
"Use playwright MCP to navigate to localhost:5173.
Set viewport to 375x812, take screenshot.
Set viewport to 768x1024, take screenshot.
Set viewport to 1280x800, take screenshot.
Report any layout issues across breakpoints."
```

## Figma MCP Workflows

### Setup (Remote Server -- Simplest)

```powershell
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

Authenticate via the browser prompt on first use.

### Design-to-Code Flow

1. Copy Figma link to a specific frame/component
2. Prompt: "Look at this Figma design [link] and implement it as a React component with Tailwind"
3. Claude extracts: colors, spacing, typography, layout, component hierarchy

### What Works Well
- Initial component generation from Figma frames
- Extracting design tokens (colors, spacing, fonts)
- Understanding component hierarchy and layout intent

### What Doesn't Work Well
- Incremental updates -- Claude regenerates rather than patching
- Complex interactions/animations not visible in static frames
- Responsive breakpoints if not explicitly designed in Figma
- Pixel-perfect reproduction (expect ~90% accuracy)

**Recommendation**: Use Figma MCP for initial scaffolding, then iterate with Chrome integration.

## Screenshot-Based Workflows

### Quick Paste (No MCP Required)

Windows: `Win+Shift+S` -> select area -> `Ctrl+V` in Claude Code.

### When to Use
- Quick bug reports: "This button is misaligned, fix it" + screenshot
- Design reference: "Make this section look like this" + screenshot of reference
- Visual QA: "Compare these two screenshots and report differences"

### Saving Screenshots via PowerShell

```powershell
# Create screenshots directory
cmd /c mkdir screenshots 2>$null

# Headless Chrome screenshot
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--headless", "--screenshot=screenshots\page.png", "http://localhost:5173"
```

### Limitations
- No interactivity (can't click, scroll, test hover states)
- Single viewport only
- No console access
- Manual process -- doesn't scale for testing

## Choosing the Right Tool

| Scenario | Tool | Why |
|----------|------|-----|
| **Design reference analysis** | **Playwright MCP** | **Auto-navigate + screenshot at 3 viewports — best for extracting design principles** |
| Daily development, quick iterations | Chrome | Uses your auth, real-time |
| E2E test generation | Playwright MCP | Auto-generates test files |
| CI/CD visual checks | Playwright MCP (headless) | No GUI needed |
| Design-to-code from Figma | Figma MCP | Extracts tokens and layout |
| Quick bug fix with visual proof | Chrome | Fix + verify in one prompt |
| Responsive testing across breakpoints | Playwright MCP | Programmatic viewport control |
| One-off visual reference | Screenshot paste | Zero setup |

### Auto-Detection Priority (for `/design-intake` and reference analysis)

When a URL reference is provided, Claude auto-detects the best available visual tool — **do not ask the user to choose**:

1. **Playwright MCP** — Check if `browser_navigate` from playwright server is available. If yes: auto-navigate, screenshot at 1280x800, 768x1024, 375x812. Best for reference analysis.
2. **Chrome Integration** — Check if `browser_navigate` from `claude-in-chrome` is available. If yes: navigate + screenshot.
3. **Screenshot Paste** — Universal fallback. Ask user: "Win+Shift+S → Ctrl+V". Suggest Playwright MCP setup for next time.

### Combining Tools

Use Figma MCP for initial generation -> Chrome for interactive iteration ->
Playwright MCP for automated regression testing. They complement, not replace, each other.

## Integration with frontend-super

After capturing screenshots (via Chrome, Playwright MCP, or manual paste), always run the `/evaluate-design` command for structured scoring. This ensures every visual change is measured objectively rather than judged by feel alone.

### Workflow

1. **Take screenshots** at all three breakpoints (375px, 768px, 1280px) using Playwright MCP or Chrome.
2. **Run `/evaluate-design`** -- this scores the current state against the evaluation criteria defined in `evaluation-criteria.md`, producing a JSON report with per-category scores.
3. **Review the scores** -- identify any category below its pass threshold and prioritize fixes.
4. **Iterate** -- make changes, retake screenshots, and re-run `/evaluate-design` to confirm improvement.
5. **Log progression** -- track score deltas across iterations to demonstrate measurable progress.

### Why This Matters

Screenshots alone show what something looks like. The `/evaluate-design` scoring adds **quantified feedback**: typography score, color harmony, spacing consistency, motion quality, and more. This closes the loop between "it looks okay" and "it meets our standards."
