# Screenshot Matrix — what to capture and how

A complete capture set is the visual evidence you analyze before writing anything. Skipping captures = inferring blindly.

## Tools (in priority order)

1. **Playwright MCP** — primary
   - `browser_navigate(url)` — load page
   - `browser_resize(width, height)` — change viewport
   - `browser_take_screenshot(path, fullPage?)` — save PNG
   - `browser_hover(selector)` — trigger hover state
   - `browser_evaluate(js)` — run JS for scroll/click/state changes

2. **chrome-devtools-mcp** — fallback (similar primitives, slightly different names)

3. **None available** → STOP. Tell user to install one.

## Viewports (all four are required for a real audit)

| Name    | Width x Height | Why                                                      |
|---------|----------------|----------------------------------------------------------|
| mobile  | 375 x 812      | iPhone baseline — most traffic on most marketing sites   |
| tablet  | 768 x 1024     | iPad portrait — common breakpoint boundary               |
| desktop | 1280 x 800     | Standard laptop — what most users actually see           |
| wide    | 1920 x 1080    | Verifies max-width behavior; hero only                   |

## Capture sequence (per viewport unless noted)

### A. Above-the-fold (hero, default state)
1. Navigate to URL
2. Resize to viewport
3. Wait 1500ms for fonts + above-the-fold images
4. Screenshot (`fullPage: false`)
5. Save as `{viewport}-hero-default.png`

### B. Full page (desktop only is sufficient)
1. Same as above but `fullPage: true`
2. Save as `desktop-full-default.png`
3. This is the master reference for section composition.

### C. Each major section (desktop only)
1. Identify section boundaries from `<section id=...>` elements (use `browser_evaluate` to query all sections)
2. For each section: scroll to it via `element.scrollIntoView({block: 'center'})`, wait 800ms, screenshot
3. Save as `desktop-section-{id-or-index}.png`

### D. Hover states (desktop only — a few key elements)
For each of these (skip if not present):
- Primary CTA button (`button[type=submit]`, or `.btn-primary`, or first `<a>` styled as a button in hero)
- Top navigation link (the second link, not the home link)
- Service/feature card (first card in a grid)
- Image thumbnail (first item in a gallery)

Sequence per element:
1. Hover via `browser_hover(selector)`
2. Wait 400ms for transition
3. Screenshot the viewport region around the element
4. Save as `desktop-{element-name}-hover.png`

### E. Mobile-specific captures
1. Mobile nav open: tap the hamburger via `browser_click('.menu-toggle')` or equivalent, screenshot, save as `mobile-nav-open.png`
2. Mobile hero: full-page screenshot, save as `mobile-full-default.png`

### F. Form / input states (only if site has a contact form)
1. Scroll to form
2. Click first input (focus state)
3. Screenshot, save as `desktop-form-focus.png`

## What to look for in each screenshot

When reviewing the captured set, build the design DNA model:

### Hero (mobile + desktop + wide)
- Is the hero photographic, illustrative, video, or solid color?
- Is text overlaid or beside the imagery?
- How dominant is the headline (size relative to viewport)?
- Is there a primary CTA visible above the fold? What does it look like?

### Section transitions (full-page desktop)
- Are sections separated by hard color boundaries, gradients, or imagery?
- Is there consistent rhythm (same vertical padding everywhere) or intentional variation?
- Do sections respect a max-width or run full-bleed?

### Hover states
- Subtle (color shift only) or pronounced (scale, shadow, motion)?
- Underline appearance pattern on links?
- Card lift on hover?

### Typography
- Is the display font serif, sans-serif, or a custom display face?
- Is body and display the same family (single-family pairing) or contrasted?
- Are headings ALL-CAPS, sentence case, or title case? (For Hebrew/Arabic: not applicable.)

### Color
- 3-5 dominant colors. Are they warm, cool, neutral, saturated, muted?
- Where does the accent color appear (CTA, links, ornaments, headlines)?
- Background: white, off-white, dark, mixed?

### Spacing density
- Tight (Stripe, Linear) — busy, info-dense
- Generous (Apple, photography portfolios) — lots of whitespace
- Extreme (luxury fashion, art galleries) — single image dominates a viewport height

### Motion language (look at multiple captures of same section)
- Static? — no animation visible across captures
- Subtle? — fades, slow Ken Burns
- Animated? — scroll parallax, scroll-reveal, scrub-driven motion

## Storage and security

- Save all screenshots to `./design-audit/screenshots/` (project-relative if user is local; else `./claude-design-audit/screenshots/`).
- Never upload screenshots to any third-party service.
- Never include localhost URLs in deliverables shown to the user (they go in audit notes only).
- For sites behind auth: tell the user to either (a) use a logged-out preview URL, or (b) skip Phase 2 and run code-only audit.

## When the matrix is overkill

If the user says "fast preview, just give me something" — capture only:
1. `desktop-hero-default.png`
2. `desktop-full-default.png`
3. `mobile-hero-default.png`

That's a 3-shot baseline. Note in `audit-summary.md` that hover states and per-section captures were skipped. Quality of output drops accordingly.
