# BRIEF · <client-slug> · v<n> · <date>

> The single source of truth for this build. Update this file (not the conversation) when something changes.

## Why this site exists
- Client: <name, what they do, where>
- Who it is for: <audience and the state they arrive in>
- What the site must make visitors do: <the ask, e.g. send a WhatsApp with a prefilled message>
- What it must make them feel: <one line>
- Why distinctiveness matters here: <e.g. MediaWave portfolio piece; competitors all look alike>

## The one true claim
<the sentence that is true only of this client, with its evidence: reviews, facts, owner's words>

## World dossier (condensed)
> Only when site-director wrote `design/world-dossier.rtl.md`. The lane packet carries this section verbatim (the lanes see the dossier only here), so list the items a concept can be built from, one line each, with the dossier's own IDs.
- W01 <item>: <how it becomes the site>
- W02 <item>: <how it becomes the site>

## Real materials
| Material | Exists? | Source / owner | Notes |
|---|---|---|---|
| Photos of the place / work / people | | | |
| Video (even phone clips) | | | |
| Owner willing to be photographed | | | |
| Customer proof (reviews, selfie videos, results) | | | |
| Existing brand (logo, colours, fonts) | | | |

## Direction
- Intensity: <quiet | alive | orchestrated | cinematic> · target length <n> vp desktop · signature moments <n>
- Character (max 2): <"X without Y">
- Avoid (anti-references): <items, with where they were seen>
- Brand constraints: <what is locked>
- Pinned by the brief: <the persistent object and its states, a process-as-scroll story, or "nothing"> (allowed past concept-lab.md §6 check 1b only if it passes logic before wow)
- Concept: <letter · name> (filled after the concept round; details in CONCEPT.md)
- Languages / direction: <he rtl | he+en | …>

## Build
- Stack: <framework + versions, host> (foundations.md; under site-director, decision D1)
- Pages: <list>
- Content source: <who writes copy; what exists>
- Deadline and budget notes: <…>
- Integrations: <WhatsApp number, form endpoint, booking, analytics/consent>

## Success criteria (verification checks these)
- Motion: held scenes <n> (≤ floor(length in vp / 5), none touching), distinct moves ≥ <n>, no dead zone ≥ 3 vp, fade share ≤ 0.5
- Performance: LCP ≤ 2.0 s lab (mobile) and ≤ 2.5 s field p75, CLS during scroll ≤ 0.05 (0 for the foundation skeleton; run motion-audit with `--budget-cls 0.05`, its built-in 0.1 is a smoke floor), INP ≤ 200 ms, p95 scroll frame ≤ <n> ms
- Accessibility: WCAG 2.2 AA contrast, visible focus, reduced motion shows every beat's last frame, content readable without JS, accessibility statement page
- Slop-scan index ≤ 20, every reflex hit justified in CONCEPT.md

## Upgrade plan (upgrade mode only)
- Verdict: <polish | upgrade | rebuild in place | replatform> (DIAGNOSIS §1)
- Direction: <letter · name>
- Change list: `design/upgrade/CHANGES.md` (this brief's plan section; every change cites a zone and its evidence)
- Sacred: <anchors, H1/H2 order, service names, form fields, brand marks>
- Proof confirmed by the owner: <items, or "none yet">

## Inferred (from evidence, not asked; only sources actually read)
- <fact>: <source>

## Assumed (recommended option taken without an answer)
- <assumption>: <why it was the recommendation>
