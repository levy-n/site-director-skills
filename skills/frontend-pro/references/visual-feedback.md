# Visual Feedback Reference

## Table of Contents
- [Chrome Integration Details](#chrome-integration-details)
- [Playwright MCP Configuration](#playwright-mcp-configuration)
- [Chrome DevTools MCP](#chrome-devtools-mcp)
- [Figma MCP Workflows](#figma-mcp-workflows)
- [Screenshot-Based Workflows](#screenshot-based-workflows)
- [Choosing the Right Tool](#choosing-the-right-tool)

## Chrome Integration Details

### Setup

```bash
# Launch Claude Code with Chrome
claude --chrome

# Install extension from Chrome Web Store: "Claude in Chrome"
```

### Capabilities
- Navigate to any URL, click elements, fill form fields
- Capture viewport screenshots and record interaction GIFs
- Read browser console output

### Workflow: Fix-and-Verify in One Prompt

```
"Fix the navigation dropdown on /dashboard. Open the page in Chrome,
click the user menu, take a screenshot showing the bug, fix it,
then take another screenshot proving it works."
```

Claude will: open page → screenshot before → edit code → hot reload → screenshot after.

### Limitations
- Requires visible Chrome window (no headless mode)
- Only Chrome proper — Brave, Arc, and Edge not supported
- Auth sessions: uses your existing cookies, but cannot handle OAuth redirects automatically
- Cannot interact with elements inside iframes reliably
- No network throttling or device emulation

## Playwright MCP Configuration

### Installation

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

Config persists in `~/.claude.json`. Add `--scope project` to share it via the
project's `.mcp.json` (version-controlled).

### Project Config File (.mcp.json)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

For headless (CI/CD):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--headless"]
    }
  }
}
```

### Key Tools (fully-qualified names)
- `mcp__playwright__browser_navigate` — go to URL
- `mcp__playwright__browser_take_screenshot` — capture viewport
- `mcp__playwright__browser_click` / `mcp__playwright__browser_fill_form` — interact
- `mcp__playwright__browser_console_messages` — read logs
- `mcp__playwright__browser_resize` — set viewport for breakpoint testing

### Critical Gotcha

First time: say "use playwright MCP to navigate to..." explicitly.
Otherwise Claude may run `npx playwright` via Bash, bypassing MCP entirely.

### Multi-Breakpoint Screenshot Workflow

```
"Use playwright MCP to navigate to localhost:3000.
Set viewport to 375x812, take screenshot.
Set viewport to 768x1024, take screenshot.
Set viewport to 1280x800, take screenshot.
Report any layout issues across breakpoints."
```

## Chrome DevTools MCP

Google's official MCP server — live browser debugging with DevTools power.

### Installation

```bash
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest
```

Alternative plugin install (MCP + bundled skills):
`/plugin marketplace add ChromeDevTools/chrome-devtools-mcp` then
`/plugin install chrome-devtools-mcp@chrome-devtools-plugins`.

### What It Adds Over Playwright MCP
- Performance traces (Core Web Vitals, LCP/CLS breakdown)
- Network request inspection
- CPU and network throttling emulation
- Full console access on a real Chrome instance

Tools arrive as `mcp__chrome-devtools__*`.

### When to Prefer It
Debugging ("why is this slow / broken in the browser") → Chrome DevTools MCP.
Scripted testing and screenshots at breakpoints → Playwright MCP.

## Figma MCP Workflows

### Setup (Remote Server — Simplest)

```bash
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
- Incremental updates — Claude regenerates rather than patching
- Complex interactions/animations not visible in static frames
- Responsive breakpoints if not explicitly designed in Figma
- Pixel-perfect reproduction (expect ~90% accuracy)

**Recommendation**: Use Figma MCP for initial scaffolding, then iterate with Chrome integration.

## Screenshot-Based Workflows

### Quick Paste (No MCP Required)

macOS: `Shift+Command+Control+4` → select area → `Control+V` in Claude Code.
Windows: `Win+Shift+S` → select area → `Ctrl+V` in Claude Code.

### When to Use
- Quick bug reports: "This button is misaligned, fix it" + screenshot
- Design reference: "Make this section look like this" + screenshot of reference
- Visual QA: "Compare these two screenshots and report differences"

### Limitations
- No interactivity (can't click, scroll, test hover states)
- Single viewport only
- No console access
- Manual process — doesn't scale for testing

## Choosing the Right Tool

| Scenario | Tool | Why |
|----------|------|-----|
| Daily development, quick iterations | Chrome | Uses your auth, real-time |
| E2E test generation | Playwright MCP | Auto-generates test files |
| CI/CD visual checks | Playwright MCP (headless) | No GUI needed |
| Performance/network debugging | Chrome DevTools MCP | Traces, throttling, request inspection |
| Design-to-code from Figma | Figma MCP | Extracts tokens and layout |
| Quick bug fix with visual proof | Chrome | Fix + verify in one prompt |
| Responsive testing across breakpoints | Playwright MCP | Programmatic viewport control |
| One-off visual reference | Screenshot paste | Zero setup |

### Combining Tools

Use Figma MCP for initial generation → Chrome for interactive iteration →
Playwright MCP for automated regression testing. They complement, not replace, each other.
