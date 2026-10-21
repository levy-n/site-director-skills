# Design Token Extraction Tools

## CLI Tools

### Dembrandt (RECOMMENDED)
- **URL:** https://github.com/dembrandt/dembrandt
- **Install:** `npx dembrandt <url>` (no install needed)
- **Extracts:** Colors, typography, spacing, borders, shadows
- **Output:** W3C Design Tokens JSON format
- **Free:** Yes, open-source

## Chrome Extensions (Free)

### ExtractCSS
- **URL:** https://www.extractcss.dev/
- **Does:** Select any component on a website, converts to Tailwind CSS
- **Best for:** Extracting specific component styles

### Peek
- **URL:** https://trypeek.app/
- **Does:** Extracts colors, fonts, assets in organized formats
- **Best for:** Quick overview of a site's design system

### Design Token Extractor
- **URL:** Chrome Web Store search "Design Token Extractor"
- **Does:** Exports colors, fonts, spacing, shadows
- **Output:** CSS, JSON, Figma, Sketch formats

### CSS Pully
- **Does:** Detects all fonts, color palettes, typography details
- **Best for:** Font identification

## Chrome DevTools (Built-in)

### CSS Overview
1. F12 -> More Tools -> CSS Overview -> Capture Overview
2. Shows: all colors, all fonts, unused declarations
3. Best for: complete palette and font audit

### Animations Panel
1. F12 -> More Tools -> Animations
2. Captures CSS animations and transitions
3. Shows: duration, delay, easing function
4. Can slow down to 10% speed

### Box Model Inspector
1. Hover over elements in Elements panel
2. Shows: margins (orange), padding (green), border (yellow)
3. Check Computed tab for exact values

### Grid/Flex Visualizer
1. Click "grid" or "flex" badges in Elements panel
2. Visualizes the layout structure
3. Shows column counts, gaps, alignment

## Web Platforms

### Brandfetch
- **URL:** https://brandfetch.dev/
- **Does:** Extracts colors, typography, spacing, components
- **Output:** JSON or Markdown
- **Free:** 3 extractions per day

## Screenshot to Code Tools

### Screenshot to Code (Open Source)
- **URL:** https://github.com/abi/screenshot-to-code
- **Does:** Drop screenshot, get HTML/Tailwind/React/Vue code
- **Models:** Supports Claude and Gemini
- **Free:** Self-hosted

### UI2Code.ai
- **URL:** https://ui2code.ai/
- **Does:** Screenshot to professional code
- **Output:** React, HTML, Tailwind

### Fronty
- **URL:** https://fronty.com/
- **Does:** AI image to HTML/CSS
- **Best for:** Quick prototyping

## Recommended Workflow

1. **Quick audit:** Chrome DevTools CSS Overview (free, instant)
2. **Full extraction:** `npx dembrandt <url>` (free, comprehensive)
3. **Specific components:** ExtractCSS extension (free, targeted)
4. **Screenshot-based:** Screenshot to Code + manual refinement
5. **Manual verification:** DevTools inspection for spacing/animation details
