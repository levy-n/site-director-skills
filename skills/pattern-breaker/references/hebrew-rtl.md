# Hebrew and RTL

Read this whenever the site is Hebrew (or has a Hebrew version), before choosing type and before building any horizontal motion. Models transplant Latin devices onto Hebrew by reflex; each item below says why that breaks.

## Contents
1. Document setup
2. Typography
3. Direction-bearing motion
4. Mixed-direction content
5. Hebrew fonts: choosing and loading
6. Checks

---

## 1. Document setup

- `<html lang="he" dir="rtl">`. A bilingual site sets `lang`/`dir` per page (or per section for embedded English), not with CSS `direction` alone; screen readers and line breaking read the attributes.
- Use logical properties everywhere: `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `text-align: start`, `border-inline-start`. Physical left/right properties are the main source of RTL bugs when a component is reused.
- Tailwind v4: logical utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`); use `rtl:` and `ltr:` variants only where direction genuinely differs.
- Grids and flex rows reverse automatically under `dir="rtl"`; absolute positioning and transforms don't.

## 2. Typography

- **No italics on Hebrew.** Hebrew has no true italic; browsers synthesise a slanted fake that distorts the letterforms. Emphasise with weight, colour, a marker, or a different face.
- **No letter-spacing on Hebrew text.** Hebrew has no case, so "tracked uppercase labels" don't translate; tracking breaks word shapes. If the concept needs a tracked label voice, set those labels in Latin or numerals deliberately (a two-register voice), or use weight and size instead.
- **Line height:** body 1.6-1.8 (Hebrew letters sit high and dense); display 0.95-1.15 depending on the face, checked with niqqud-free real copy.
- **Measure:** 45-75 characters per line for body.
- **Numerals:** use the face's tabular figures for counters and prices (`font-variant-numeric: tabular-nums`) so rolling numbers don't jitter.
- **No faux bold:** load the real weights you use; synthetic bold smears Hebrew strokes.
- **Headlines end with a period** in the reference's voice; Hebrew display copy reads calmer without exclamation marks.

## 3. Direction-bearing motion

Anything that moves along the reading direction must mirror in RTL.

- Keep one multiplier for every horizontal motion, as the reference does: `const DIR = document.documentElement.dir === 'rtl' ? 1 : -1` (choose the sign once for your coordinate convention) and multiply every `x`, `xPercent`, track distance and swipe offset by it. One file then serves both directions.
- **Horizontal tracks:** in RTL the first card sits on the right and the track travels toward the left as the visitor scrolls down (the reading direction). Test that the first card is fully visible at the start and the last at the end.
- **Arrows:** forward arrows point left in RTL (←). Flip arrows, chevrons, "send" and progress icons; never flip logos, checkmarks, media-playback icons (▶ means play in every language), or brand shapes.
- **Entrances:** content that slides in from the reading side enters from the right.
- **Marquees:** decide direction from the concept (rows often alternate directions), not from LTR habit.
- **Text splitting:** prefer lines or words for Hebrew. Character splits are technically safe with GSAP SplitText (it segments by grapheme with `Intl.Segmenter`, so niqqud stays attached, and `aria: 'auto'` keeps the sentence readable to screen readers), but a character cascade reads as a Latin device. Never split Arabic into characters (it breaks letter joining).
- **SplitText line splits are broken on RTL text** (measured with gsap 3.15): its line test assumes left-to-right, so every `dir="rtl"` paragraph comes back as one "line" and a line-by-line reveal becomes a single block. The engine's `splitLines` fixes it: the element is `direction: ltr` only while SplitText measures, then each line and the element itself get `rtl` back, so split targets keep their own direction and their `::before`/`::after`, `text-align: start` and inline-start spacing stay where the author put them. Line texts match the native breaks, also after `autoSplit` re-splits on a width change or a late font. When calling SplitText directly on Hebrew, do the same, and keep the element ltr through every re-split (SplitText reverts before it re-measures). Word splits are unaffected.
- **Masks and clip-path insets:** `inset(0 100% 0 0)` hides from the right in LTR thinking; double-check which side a wipe starts from in RTL.

## 4. Mixed-direction content

- English brand names, URLs, emails, phone numbers and prices inside Hebrew text: wrap them in `<span dir="ltr">` (or `<bdi>`) so punctuation and numbers don't jump to the wrong side.
- Phone and email inputs: give the input itself `dir="ltr"` (the value reads left to right; `text-align: start` then aligns it left), keep its label in Hebrew, and use `type="tel"` with `inputmode="tel"` or `type="email"`.
- Mono index labels in English on a Hebrew page (the reference's two-register voice) need `dir="ltr"` on the label element.
- Mixed bidi inside fixed-width previews (terminal boxes, ASCII wireframes) misaligns; keep Hebrew out of the box and put it in the surrounding text.

## 5. Hebrew fonts: choosing and loading

- Heebo, Assistant and Rubik are the Hebrew equivalent of Inter: fine for body text, a reflex as the brand voice (reflexes.md §5). Choose the display face from the concept: prefer a commercial Hebrew foundry face (for example the families from Fontef, HaGilda, AlefAlefAlef, Fontimonim, Masterfont, or independent designers) or a custom wordmark-driven treatment. Google's Hebrew display set is small and its members are reflex picks (slop-scan rule `default-font-he-2` flags Karantina, Bellefair, Suez One, Secular One, Amatic SC and others): use one only with a written, brief-specific reason and a `slop-ok` waiver. Check the licence covers web use for the client.
- Check the face has every weight you plan, real Hebrew punctuation (geresh ׳, gershayim ״, the maqaf U+05BE), and matching Latin and numerals; otherwise pair it with a Latin face that shares its proportions.
- Self-host `woff2`, subset to Hebrew + basic Latin + numerals + punctuation used, preload the one display weight above the fold. Body face `font-display: optional`, display face `swap` with a metric-matched fallback (`size-adjust`, `ascent-override`; `font-fallback.mjs` measures it on Hebrew), so a late font never re-flows paragraphs (foundations.md §3.3).
- Split text into lines only after `document.fonts.ready` (with a timeout of about 1.8 s); line breaks measured with the fallback font are wrong once the real font arrives.

## 6. Checks

- Scroll-film both viewports and look at the first and last frame of every horizontal scene: is the content entering from the reading side?
- Search the CSS for `letter-spacing`, `font-style: italic` and `left:`/`right:`/`margin-left` in components that render Hebrew.
- Read every arrow on the page in RTL: does it point where the visitor goes next?
- Run slop-scan; it flags Heebo/Assistant/Rubik as the brand voice and Hebrew marketing clichés for justification.
