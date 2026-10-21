# Lead capture: a popup that opens on intent, never on a timer

Read this when a site has a lead popup, a WhatsApp nudge or any interruption that asks for contact details. Nati's rule (2026-10-15): the popup opens when the visitor shows intent, not "after X seconds".

`<skill>` is this skill's folder, as SKILL.md defines it.

## Contents
1. Why not a timer
2. The default: lead-intent.js
3. Signals and the calm gate
4. Wiring it into a site
5. Testing
6. Rules that always hold

## 1. Why not a timer

A timer fires for the visitor who is still reading and for the one who already left in their head. On mediawave.co.il "10 s after halfway" opened the popup in the middle of the story for anyone who read slowly: in the phone film, frames 21-37 of 37 were the popup (diagnosis, 2026-10-15). An interruption at the wrong moment also costs the Awwwards usability score (30% of the site score).

## 2. The default: lead-intent.js

`<skill>/assets/lead/lead-intent.js`: a framework-free ES module with no dependencies and one 500 ms timer, nothing per frame. Copy it into the project (`src/utils/lead-intent.js`; for TypeScript add a `.d.ts` like MediaWave's `src/utils/lead-intent.d.ts`).

```js
import { createLeadIntent } from './lead-intent.js';
const intent = createLeadIntent({
  onOpen: (reason) => { track('lead_modal_open', { reason }); openPopup(); },
  isBusy: () => document.body.classList.contains('consent-open'), // the site's own vetoes
});
// close button / Escape: intent.dismissed()   lead sent: intent.converted()   unmount: intent.destroy()
```

## 3. Signals and the calm gate

Each signal is worth one point; the popup opens at 2 points (`threshold`), or at once on a strong signal.

| Signal | Fires when (defaults) |
|---|---|
| engaged-reading | 25 s of active time and 45% of the page seen |
| interest-<id> | a `[data-intent="interest"]` section (process, pricing, FAQ) in view for 8 s of active time |
| considering | two uses of `[data-intent-signal]` elements (FAQ toggles, "details") |
| came-back | the tab was hidden for 20 s and the visitor returns after reading 30% |
| scroll-back | after half the page, a fast run up of 1.5 screens within 1 s (the phone's nearest proxy for leaving) |
| **exit-intent** (strong) | desktop with a fine pointer: the pointer leaves through the top edge after 15 s active and 25% seen |
| **read-all-then-back** (strong) | the end of the story (`[data-intent="end"]`) was seen, then the visitor runs back up |

"Active" means the tab is visible and there was input (pointer, wheel, touch, scroll, key) in the last 5 s.

The calm gate blocks every open:
- in the first 12 s of active time;
- while scrolling (a scroll in the last 0.9 s);
- for 1.5 s after an in-page anchor click;
- after keyboard navigation in the last 4 s, or while a control has keyboard focus (`:focus-visible`; mouse focus left on a clicked button does not block);
- while typing in a field;
- while the contact form (`[data-intent="contact"]`) is 30% in view;
- while any `[aria-modal="true"]` or `dialog[open]` is shown (chat, accessibility panel, mobile menu);
- whenever the site's own `isBusy()` returns true (a cookie banner waiting for an answer).

A score open waits up to 20 s for a calm moment. A dropped exit intent is not retried, because it is stale a moment later.

Memory: a WhatsApp, `tel:` or `mailto:` click, a `[data-convert]` click or any form submit means converted, and the popup never opens again on this device. A dismissal keeps the popup quiet for the session and for `cooldownDays` (3). Keys from an older popup can be honoured with `legacyConverted` and `legacyDismissed`.

## 4. Wiring it into a site

1. Mark the markup: `data-intent="interest"` on 1-3 consideration chapters, `data-intent-signal` on FAQ toggles, `data-intent="contact"` on the contact section, and `data-intent="end"` on the footer or the closing chapter. Sections that mount later (Suspense, islands) are picked up by a rescan every 2 s.
2. Create one instance where the popup lives (React: in a `useEffect` with `[]`, destroyed in its cleanup; Astro: in the page's motion boot on `astro:page-load`, destroyed on `astro:before-swap`).
3. Track `lead_modal_open` with its `reason`, so the signals can be tuned from data, not opinion.
4. Under strict reduced motion the popup still opens on intent, without its entrance animation.
5. Log the decision in the decision log: the signals in use, their thresholds, and the reason.

## 5. Testing

The scenario test runs 10 behaviours, each in a fresh browser context, with timings scaled down x0.1. Run it from a project where puppeteer resolves:

```bash
node <skill>/assets/lead/test/test.mjs
```

It expects no open for a visitor idle on the hero, one who keeps scrolling, one typing in a field, after a WhatsApp click, with the contact form in view, or after a dismissal. It expects an open for engaged reading with dwell, FAQ use, exit intent, and read-all-then-back on a phone. It exits 1 on any failure.

On the real site, `?lead=debug` logs every signal and mirrors the state into `html[data-lead-intent]`, `?lead=now` opens at the first calm moment, and `?lead=off` disables the popup.

## 6. Rules that always hold

- No popup ever opens on a timer alone.
- Never steal focus from typing, keyboard navigation or another dialog.
- Close with Escape and the X button, return focus to where the visitor was, and trap Tab inside (WCAG 2.4.3, 2.1.2).
- One popup per session at most; never after a conversion.
- The popup repeats the site's real offer in the site's voice. No fake urgency, no countdown, no "only 2 spots left".
