# Design rules: sharp decisions (P2)

Read this for any P2 decision: the accent, the fonts, the grid, the focal point, the contrast table, the banned defaults, the swap tests and the decision log. Every rule here produces a row in the project's decision log (`design/design-decisions.rtl.md`, or the root `DECISIONS.md` / `DECISIONS.rtl.md` when the project has one).

`<skill>` is this skill's folder and `<skills>` is the skills root, as SKILL.md defines them.

## Contents
1. One accent, one meaning
2. The accent audit
3. Two font families
4. A grid from the client's world
5. One focal point per section
6. The contrast table, before any build
7. Banned defaults
8. The two swap tests
9. Decision-log rules

---

## 1. One accent, one meaning

- **One accent colour.** Its meaning comes from the client's world, and it appears only where that meaning happens. Heron's red appears almost only on violations and alerts: less colour noise gives a warning more weight.
- **Write the meaning before the hex.** D2 holds three things: the hex, the meaning in one sentence, and the complete list of places it appears. Everything else is built from the ground, the ink and one or two support colours.
- Illustrations of the pattern (not facts about any client): a plumber's gauge red zone means "a problem was found"; a lawyer's stamp ink means "this is signed"; a confectioner's order-slip stamp means "confirmed"; a tour's trail-mark colour means "your route".
- **The primary button** gets the accent only when pressing it is the meaning (D2 says so). Otherwise it is built from ink and ground, with its own states.
- **Area:** about 5% of the page at most (pattern-breaker concept-lab.md §5, the palette role).
- **Never from a mood word or a random seed.** impeccable's palette seed picker and "warm and trustworthy" palettes do not apply here.
- **Contrast:** accent text needs 4.5:1 against its ground, an accent UI mark or graphic 3:1. A pastel or neon accent works as a fill, never as text on a light ground. Check it on every theme layer (§6).
- **One token, named by role:** `--signal` (pattern-breaker visual-language.md §8), so a change is one edit plus the contrast table and the audit.

## 2. The accent audit

Run at stage 5 and after any colour change:

```bash
node <skill>/scripts/shots.mjs <url> --out design/shots --accent "#hex"   # D2's hex
```

Besides the screenshot matrix it writes `design/shots/accent.json`: per route and viewport, every visible element whose own text colour, background, border, SVG fill or stroke equals the accent (within 2 per RGB channel, oklch and other syntaxes converted), with its selector, a text snippet and the scroll steps where it was seen. Check every hit against D2: a use that does not carry D2's meaning is a finding. Remove it, or log a new decision row that changes D2.

For a quick look while building, paste this into the browser console on one page. It lists every visible element whose text, background, border, outline or SVG fill or stroke is the accent, whatever colour syntax the CSS uses (hex, rgb, oklch), and skips zero-width borders. It cannot see accents inside images, canvas or gradients: check those on the screenshots.

```js
((hex, tol = 2) => {
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const memo = new Map();
  const rgb = (v) => {
    if (memo.has(v)) return memo.get(v);
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = v; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data, r = d[3] > 0 ? [d[0], d[1], d[2]] : null;
    memo.set(v, r); return r;
  };
  const want = rgb(hex);
  const same = (v) => { const c = v && v !== 'none' && rgb(v); return !!c && c.every((x, i) => Math.abs(x - want[i]) <= tol); };
  const hits = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!el.getClientRects().length) continue;
    const cs = getComputedStyle(el), used = [];
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (ownText && same(cs.color)) used.push('text');
    if (same(cs.backgroundColor)) used.push('background');
    for (const s of ['Top', 'Right', 'Bottom', 'Left'])
      if (parseFloat(cs[`border${s}Width`]) > 0 && same(cs[`border${s}Color`])) { used.push('border'); break; }
    if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 && same(cs.outlineColor)) used.push('outline');
    if (el instanceof SVGElement && (same(cs.fill) || same(cs.stroke))) used.push('svg');
    if (used.length) hits.push({ el: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].join('.') : ''), used: used.join(' '), text: el.textContent.trim().slice(0, 40) });
  }
  console.table(hits);
  return hits;
})('#C0FFEE') // placeholder: replace with D2's hex
```

## 3. Two font families

- **At most two families:** a display face with presence (headlines, chapter verbs, type as image) and an instrument face (numbers, labels, indexes, units). The instrument face usually also sets running text; if the display family has a real text cut, running text may use it instead. pattern-breaker's visual-language.md §2 sets the same cap; a third face is only a glyph fallback (below).
- **Nati picks** from 3-4 pairs rendered on the real hero and one chapter at 1440 and 390, as one image labelled A/B/C/D (nati-design-prefs). Never on autopilot. The merged ban: nati-design-prefs' banned list always; pattern-breaker's saturated and Hebrew reflex fonts (`<skills>/pattern-breaker/references/reflexes.md` §2 and §5, `<skills>/pattern-breaker/references/hebrew-rtl.md` §5) only with a dossier reason in the decision row.
- **The instrument face's digits carry the numbers.** Tabular figures for anything that updates or aligns (`font-variant-numeric: tabular-nums`). Precedent in nati-design-prefs: a display face with weak digits keeps its headlines, and every date, time and range is set in the other face.
- **Monospace only for numbers and measurements,** never as a "technical" costume (impeccable's craft floor makes the same distinction). A mono instrument face sets digits, units and Latin codes only. If it has no Hebrew, Hebrew labels and running text go to the other family.
- **Glyph fallback rule.** When a chosen face lacks glyphs the content needs (geresh ׳, gershayim ״, digits, Latin), the missing code points come from the other chosen family through an extra `@font-face` rule with a `unicode-range`, under the same family name. Only when neither family has them may a third face supply exactly those code points the same way: it is not a third family, and it gets its own decision row. Glyphs that exist but are weak (digits) are set in the instrument face by markup (a class on the number), not by `unicode-range`. MediaWave's display face lacks ׳ ״ in its free edition; they come from the text face (U+05F3-05F4):

```css
@font-face { font-family: "Display"; src: url(/fonts/display.woff2) format("woff2"); font-display: swap; }
@font-face { font-family: "Display"; src: url(/fonts/instrument-600.woff2) format("woff2"); unicode-range: U+05F3-05F4; }
```

- **Loading** (pattern-breaker hebrew-rtl.md §5): self-hosted woff2, subset to the Hebrew, Latin, digits and punctuation used; preload the display weight when the H1 is the LCP element; a one-weight face is declared with a weight range (`font-weight: 100 900`) so the browser never synthesises bold; a metric-matched fallback measured on Hebrew with `node <skills>/pattern-breaker/scripts/font-fallback.mjs <font files> --family "<name>"`.
- **Hebrew:** no italics, no letter-spacing.

## 4. A grid from the client's world

- **Take the grid from a document, tool or surface in the dossier**, and name it in D5 with its W item. Examples of sources: the columns of an order slip, a drawing sheet's frame with coordinates (Heron used an invisible coordinate system with labels running to the viewport edges), a ledger's ruled lines, a contract's margin and clause numbering, the squares of a topographic map, the face of a gauge.
- **Measure the real thing** from the client's photo: margins as a share of the width, the column count and ratios, the spacing of ruled lines, the numbering scheme, where labels sit. Translate the numbers into tokens: columns, gutters and margins per breakpoint, rule spacing, label positions.
- **Let it show at least once,** carrying information: real numbering, rules, margin labels or coordinates. Numbering only on a real sequence.
- **Break it on purpose** (a full-bleed moment, type crossing columns), and name each break in the storyboard beat where it happens.
- **1440 and 390 are two compositions** from the same source: the slip's three columns can become one column with the column names as row heads.
- **Centring is allowed on every site** (Nati's ruling). A symmetric source (a stamp, a gauge face) can make the centre axis the grid itself.

## 5. One focal point per section

- At each section's resting frame, and at each beat's last frame, one element wins: the largest, the highest contrast, or the only accent. Everything else supports it. Heron set one focal point per section to stay out of the text-left, image-right rut.
- Write it in the storyboard's "מוקד" column for the hero and every chapter.
- **Check on the screenshot:** shrink it to a quarter or blur it. The first thing you see is the focal point. If two elements compete at the same weight, demote one.
- The persistent object can be the focal point in one chapter and the text in another. When the accent's meaning is active in a section, it sits on or next to the focal point.

## 6. The contrast table, before any build

1. Before any page code, list every text and ground pair on every theme layer: body, muted text, headings, the accent on each ground, button labels on buttons, links, focus rings, input borders, error text. Write them to `design/contrast-pairs.json`.
2. Targets (WCAG 2.2 AA): body text 4.5:1; large text (24 px and up, or bold 18.66 px and up) 3:1; UI components and graphics that carry meaning (focus rings, input borders, meaningful icons) 3:1 (WCAG 1.4.11).
3. Generate the table with this script, saved as `design/contrast.mjs` (six-digit hex values only):

```js
// node design/contrast.mjs design/contrast-pairs.json > design/contrast.md
// pairs: [{ "theme": "light", "role": "body text", "fg": "#16181D", "bg": "#F2F0EA", "min": 4.5 }]
import { readFileSync } from 'node:fs';
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16 & 255, n >> 8 & 255, n & 255].map((c) => (c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
console.log('| Theme | Role | Text | Ground | Ratio | Needs | Pass |\n|---|---|---|---|---|---|---|');
for (const p of JSON.parse(readFileSync(process.argv[2], 'utf8'))) {
  const r = ratio(p.fg, p.bg);
  console.log(`| ${p.theme} | ${p.role} | ${p.fg} | ${p.bg} | ${r.toFixed(2)} | ${p.min} | ${r >= p.min ? 'yes' : 'NO'} |`);
}
```

4. Every "NO" changes a colour before any build. Link `design/contrast.md` from D2's reason, and regenerate it at every colour change. At stage 5, axe colour-contrast must report zero violations in every state.

## 7. Banned defaults

Rows marked "No exception" are absolute. The others are banned unless a decision row gives a dossier reason.

| Banned | Why, and what instead |
|---|---|
| Fonts on nati-design-prefs' banned list | Nati's rule. No exception. |
| Content hidden until JavaScript runs (opacity 0 by default) | Content is visible without JS; reveals enhance a visible default. No exception. |
| pattern-breaker's reflex fonts without a reason | reflexes.md §2 and §5: allowed with a dossier reason in the row, and Nati picks. |
| Cards inside cards | Hierarchy comes from scale and space, not nested boxes. |
| Low contrast | Anything under the §6 targets; pastel text on a light ground. No exception. |
| The centred-hero template: two buttons, then a logo strip, then three cards | The template is banned, not centring. Centring is allowed on every site (Nati's ruling); a centred hero with one button and a secondary link needs no reason. No exception. |
| The three-feature-card grid (and any grid of identical feature cards) | Features appear only as proof inside a chapter (P3). No exception. |
| A root font size in `vw` only (`html { font-size: 0.57vw }`) | It ignores the visitor's text size; it may explain part of Heron's 6.8 accessibility score. Use `clamp()` with a `rem` floor. No exception. |
| Static underlines under UI links, lines under button labels, hovers that leave their element | Nati's locked taste. Hover underlines and prose links in articles are fine. No exception. |

Everything else in pattern-breaker's first-instinct check (its SKILL.md) needs a written reason too. Several of these are caught mechanically: `node <skills>/pattern-breaker/scripts/slop-scan.mjs --url <url>`.

## 8. The two swap tests

| Test | Swap in | Passes when |
|---|---|---|
| Other field | a business from a different trade: its name, words and photos | something visible besides the words breaks: the grid, the accent's meaning, the persistent object, the hero interaction |
| Same field | a competitor from the same city and trade (pattern-breaker concept-lab.md §6 check 1) | what breaks is tied to the one true claim in the brief |

- **When:** at stage 2 on every direction before it is shown, and at stage 5 on screenshots of the built site.
- **If only the copy breaks, it fails:** go back to the dossier, not to the palette.
- **Record** what breaks, concretely, under "מבחני החלפה" in the decision log.
- Primary source: Heron's retrospective judged their site one where the logo could not be swapped for another brand without anyone noticing.

## 9. Decision-log rules

- **One log per project:** `design/design-decisions.rtl.md`, or the root `DECISIONS.md` / `DECISIONS.rtl.md` when it exists, with the same columns: # | החלטה | ציר | נימוק | פריטים מהתיק | אישר.
- **A decision without a reason is deleted.**
- **A design decision without a dossier item goes back to the dossier:** find the item, or drop the decision. "אין" in the dossier column is allowed only on the technical axis.
- **A reason passes the translation test** (pattern-breaker concept-lab.md §6 check 1c): "behaves like <W item> because <mechanism>, so <rule>". "Premium", "bold", "modern" or "unlike AI" is not a reason.
- **Append only.** A changed decision gets a new row that says "מחליפה את D<n>"; old rows stay.
- **Numbering:** D1 is the stack and CMS (stage 0); D2-D8 are the standard stage-2 set (accent, display face, instrument face, grid, persistent object, hero interaction, standout-moment budget); further rows follow.
- **Standout moments:** the budget is 2-3, written in D8 as n/3. The hero interaction, scroll transitions, page transitions, a logo ident and a contact companion each count. A custom cursor needs a dossier item, counts, and never hides the native cursor. Every moment beyond 3 gets its own row, labelled "רגע נוסף", with a reason (check-artifacts counts these rows).
- **Reflex matches** (a value on pattern-breaker's reflex lists) are kept only with their reason in the same row.
- **Nati's corrections become rows at once,** with "אישר: נתי".
- **Approver column:** נתי for fonts and gate decisions; the client for facts about the business.
- **Reasons never ship.** The site's HTML carries only the IDs (`data-chapter`, `data-dossier`); no reasons, contract text or log content goes into comments, hidden DOM or bundles.
