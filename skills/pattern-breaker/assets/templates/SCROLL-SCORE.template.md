# SCROLL SCORE · <client-slug> · v<n>

> One row per beat. Every column is required. Units: vp = one viewport of scrolling (1440×900 desktop). See references/scroll-score.md for the rules this must satisfy.
> Under site-director the score lives in `design/storyboard.rtl.md` (its beats table carries every column below, with chapters above the beats): don't create this file there.

| vp | act | beat: the sentence the visitor takes away | theme | hold (vp) | move ID (moves.md) | what the visitor does | reduced-motion last frame | mobile (keep / shorten / replace / remove + how) |
|---|---|---|---|---|---|---|---|---|
| 0-1 | I | | | - | | | | |
| | | | | | | | | |

## Totals (check against scroll-score.md §2-§3)
- Length: <n> vp desktop, <n> vp mobile
- Held share: <n>% (budget for this intensity: <range>)
- Holds: <n> (≤ floor(length in vp / 5), never two touching, ≥ 1 vp of free scroll between), each a different mechanic: <list>
- Distinct moves: <n>; longest stretch without a new move: <n> vp (≤ 3)
- Peaks: first at <vp>, main at <vp> (<% of page>), closing delight at <vp>
- Theme map: <theme> at 0 → <theme> at <vp> → …

## Signature moments
1. <beat>: <move>, performs "<sentence>"

## Handoffs
| Seam | How the exit of A meets the entry of B |
|---|---|
| | |

## Engine notes
- Smooth scroll: <lenis settings or native>
- Holds built as: <sticky stage | pin (why) >
- Media budget: <sequence frames, videos, sizes>
