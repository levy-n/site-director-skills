# Visual Capture Methods — Full Recipes

Detailed procedures for the four visual input methods (Phase 4).
Choose via the decision tree in SKILL.md, then follow the matching method here.

## Contents

- Method A: Direct Screenshot/Image Read
- Method B: FFmpeg Video Frame Extraction (metadata, per-duration recipes, sub-agent analysis)
- Method C: Playwright MCP Live Website Capture (setup, states, animation sequences)
- Method D: Manual Screenshots (anti-bot fallback, Windows recording tools)
- Animation Pattern Documentation Format

---

## Method A: Direct Screenshot/Image Read

When user provides screenshots or images:

1. **Read the screenshot** using the Read tool (Claude sees images natively)
2. **Analyze** visual structure, spacing, colors, typography
3. **Map** each visual element to specific CSS/component code
4. **Ask** about interactive elements not visible in static screenshots

**Ask user to provide:**
- Focused screenshots (one section at a time, not full pages)
- Both mobile AND desktop views
- Hover/active states if they want specific interactions
- Annotations (circles/arrows) showing what they want

**Pro tip — multiple states capture.** Ask user to capture these specific states:
- Default state (page load)
- Hover state on key interactive elements
- Scroll state (after scrolling 50%, after scrolling to each section)
- Mobile viewport (375px width)

---

## Method B: FFmpeg Video Frame Extraction

For video files (screen recording, animation demo, Dribbble video, etc.).

**Prerequisites check:**
```bash
where ffmpeg && where ffprobe
```
If not installed: `winget install ffmpeg` (or `choco install ffmpeg`), restart terminal.

**Step B.1: Extract metadata**
```bash
ffprobe -v quiet -print_format json -show_format -show_streams video.mp4
```

**Step B.2: Extract frames based on video duration**

| Video Duration | Strategy | Command |
|---|---|---|
| 0-30 sec (animation) | Every 1 second | `ffmpeg -i video.mp4 -vf "fps=1" frames/f_%03d.png` |
| 30-60 sec (walkthrough) | Every 2 seconds | `ffmpeg -i video.mp4 -vf "fps=0.5" frames/f_%03d.png` |
| 1-5 min (full demo) | Scene detection | `ffmpeg -i video.mp4 -vf "select='gt(scene,0.3)'" -vsync vfr frames/f_%03d.png` |
| 5+ min (long recording) | Keyframes only | `ffmpeg -i video.mp4 -vf "select='eq(pict_type,I)'" -vsync vfr frames/f_%03d.png` |

**Step B.3: Analyze frames with sub-agents (context-efficient)**

NEVER read all frame images in the main conversation — it burns context fast.
Spawn sub-agents with the Agent tool instead:

```
For each batch of 8-10 frames:
  → Spawn sub-agent (Agent tool, subagent_type: "general-purpose")
  → Sub-agent reads images with Read tool
  → Sub-agent writes analysis to markdown file
  → Main agent reads only the text summary
```

**Sub-agent prompt template:**
```
Read these frame images and analyze for DESIGN EXTRACTION:
- frames/f_001.png through frames/f_010.png

For each frame, document:
1. Layout structure (grid, sections, alignment)
2. Color palette (dominant, secondary, accent colors)
3. Typography (font style, sizes, weights visible)
4. Spacing patterns (gaps, margins, padding)
5. Animation state (what moved compared to previous frame)
6. Interactive elements visible (buttons, hover states, menus)

Write your analysis to: analysis/batch_1.md
```

**Step B.4: Synthesize**
Read all batch analysis files → create unified design token list
→ identify animation patterns (what moves, timing, easing)
→ map to implementation plan.

**What to extract from video frames:**
- **Layout transitions** — how sections enter/exit viewport
- **Hover states** — before/after mouse interaction
- **Animation timing** — count frames between states × frame interval = duration
- **Scroll behavior** — parallax, sticky, reveal patterns
- **Color shifts** — dark/light mode transitions, gradient animations
- **Typography effects** — text reveal animations, size transitions

---

## Method C: Playwright MCP Live Website Capture

For a live URL where interactive behavior matters.

**Prerequisites — ensure Playwright MCP is configured:**
```bash
claude mcp add playwright npx @playwright/mcp@latest
```
For visual screenshots (recommended for design work), add vision capability:
```bash
claude mcp add playwright npx @playwright/mcp@latest --caps vision
```

**Step C.1: Navigate and capture default state**
1. Navigate to the URL
2. Take full-page screenshot (default state)
3. Read the screenshot with Read tool

**Step C.2: Capture interactive states**
- **Hover states** — move mouse over elements, screenshot
- **Scroll positions** — scroll to each section, screenshot
- **Click states** — open menus/modals, screenshot
- **Responsive views** — resize viewport to 375px/768px/1440px, screenshot each

**Step C.3: Extract computed styles (text-based, no vision needed)**
Playwright MCP's accessibility tree gives structured data about:
- Element hierarchy and roles
- Text content and labels
- Computed dimensions

**Step C.4: Capture animation sequence**
For scroll-triggered or timed animations:
1. Set viewport to target section
2. Take screenshot (before state)
3. Scroll slowly / trigger animation
4. Take multiple screenshots during animation (every 200-300ms)
5. Take screenshot (after state)
6. Analyze the sequence: before → during → after

**Capture script for design extraction:**
```
Navigate to [URL]
→ Screenshot: full page at 1440px width
→ Screenshot: full page at 375px width
→ For each major section:
  → Scroll to section
  → Wait 500ms (let animations trigger)
  → Screenshot: section view
  → Hover over interactive elements
  → Screenshot: hover states
→ If nav has menu:
  → Click hamburger/menu
  → Screenshot: open menu state
```

---

## Method D: Manual Screenshots (fallback for anti-bot sites)

Some websites block automated tools (Cloudflare etc.). In this case:

1. **Ask user to manually capture** — use question 7 in references/discovery-questions.md
2. **Recommended manual recording tools (Windows):**
   - **ShareX** — free, records MP4/GIF, auto-saves
   - **ScreenToGif** — free, captures GIF with frame-by-frame editing
   - **OBS Studio** — free, records MP4 in high quality
   - **Windows built-in** — `Win+Shift+S` for screenshots, `Win+G` for recording
3. After user provides manual captures → route to Method A (screenshots) or Method B (video)

---

## Animation Pattern Documentation Format

When analyzing ANY visual input, document each animation in this format:

```markdown
## Animation Pattern: [Name]
- **Trigger:** scroll-enter | hover | page-load | click
- **Element:** what moves (e.g., "section heading", "card", "image")
- **Before state:** opacity: 0, transform: translateY(20px)
- **After state:** opacity: 1, transform: translateY(0)
- **Duration:** [estimated from frames or computed]
- **Easing:** ease-out | cubic-bezier(0.16, 1, 0.3, 1)
- **Delay:** stagger pattern? (e.g., children +100ms each)
- **CSS implementation:**
  .element { animation: fadeUp 0.5s ease-out forwards; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
```
