# Portable prompt (for builders without skill support: Lovable, v0, Bolt, Cursor rules)

Paste everything below the line into the builder's first message or project knowledge, then paste the project's BRIEF, CONCEPT and SCROLL-SCORE (written with the full skill) underneath. The method works best when those three files come from the full skill; this prompt makes the builder execute them faithfully.

---

You are building a website that must not look AI-generated. The attached BRIEF, CONCEPT and SCROLL SCORE are the specification; they win over your defaults. Build the complete site, not a sketch: every section in the score, each with its move, its mobile version and its reduced-motion version.

**How this site differs from a template.** It starts from the concept, not from components. Each section performs one sentence from the score with one move; no move repeats on the page. The visual system is strict and small (the CONCEPT's palette, two typefaces, one motif family, one accent used sparingly) so that the score's signature moments are loud.

**Defaults to avoid unless the CONCEPT gives a reason:** cream or paper backgrounds; terracotta or rust accents; near-black with one acid-green accent; purple-to-blue gradients and gradient text; a serif display with one italic accent word; Inter, Geist, Space Grotesk, Heebo or Assistant as the brand voice; tracked all-caps eyebrows over every heading; "01 / 02 / 03" labels on non-sequences; identical rounded cards with the same shadow; a centred hero followed by three icon cards; fade-and-slide-up on every section; hover lift on every card; marquees, stacking cards, magnetic buttons and custom cursors used as decoration; stock photos of people; copy like "elevate", "seamless", "הפתרון המושלם", "לקחת את העסק לשלב הבא".

**Motion engineering.**
- Smooth scrolling with Lenis wired to GSAP's ticker (`lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`), created only when reduced motion is off; touch keeps native scrolling (`syncTouch: false`).
- Build held scenes as a tall wrapper with a `position: sticky; top: 0; height: 100svh` stage, and use ScrollTrigger only to read progress (`start: 'top top', end: 'bottom bottom', scrub: 0.5`). Avoid `pin: true`; it causes layout shift.
- Routine entrances (cards, paragraphs) start about 600 px before the block enters the viewport (`start: 'top bottom+=600'`), last at most 0.35 s and move at most 18 px, so nothing is still moving under the visitor's thumb. Only a section's one signature entrance starts inside the viewport (`'top 80%'`), on a heading, mask or image, and lasts 0.35 to 0.9 s; anything bigger is scrubbed.
- Split text into lines only after `document.fonts.ready`, with SplitText `autoSplit: true` and the animation returned from `onSplit`. For Hebrew or any RTL text, SplitText groups lines left to right and returns the whole paragraph as one line: set the element to `direction: ltr` only while SplitText measures (including its re-splits), then give each line and the element itself `direction: rtl` again. Never hide the LCP heading behind a split.
- Content is visible in the HTML by default; JavaScript hides it just before animating. Nothing may depend on a scroll trigger to become readable.
- Load GSAP, its plugins, Lenis and the motion code after first paint (a dynamic import on load plus idle). The hero's first frame never waits for them.
- Under `prefers-reduced-motion: reduce`: no Lenis, no scrub, no held scenes, nothing moving on its own, and every moment shows its final state.
- Add a `?at=<px>` query hook that jumps to that scroll position after load, for testing. Use `overflow-x: clip` (never `hidden`) on ancestors of sticky stages.

**Mobile.** Re-choreograph each held scene and cursor effect as the score's mobile column says. No cursor effects on touch. Sticky stages start below the header.

**Anchors.** The only header offset is `html { scroll-padding-top: <header height + gap> }` (it also keeps focused elements clear of the header, WCAG 2.4.11). In-page links move focus to their target.

**Hebrew (if the site is Hebrew).** `<html lang="he" dir="rtl">`, logical CSS properties, no italics and no letter-spacing on Hebrew text, horizontal motion and arrows mirrored for right-to-left reading, phone and email fields `dir="ltr"`.

**Accessibility and performance.** WCAG 2.2 AA contrast, visible focus, keyboard access, alt text, reserved space for every image and video, self-hosted fonts (body face `font-display: optional`, display face `swap` with a metric-matched fallback, so a late font never re-flows paragraphs), videos loaded only when in view, an accessibility statement page for Israeli sites.

**Copy.** Use the BRIEF's real content. Plain, direct Hebrew (or English) about outcomes, not technology: no technical words in visible copy (React, SEO, UX, רספונסיבי). No em dashes, no triads or three-noun taglines, no "not X but Y" (לא X אלא Y); headlines end with a period. No invented numbers, testimonials or clients, and no testimonials or stats carried over from an old site unless the BRIEF marks them confirmed; label demos as demos.

**When you finish,** list for each section of the score: the move you built, its mobile version and its reduced-motion version, and anything you could not build with the reason.
