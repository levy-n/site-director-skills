# Masterpiece anatomy: liavmatzri.co.il

Read this when you need a concrete picture of what "breaks the template" looks like at full scale: before writing a scroll score, when a critic says a page feels like a stack of components, or when you are tempted to copy a reference's surface. Everything here was measured on 2026-10-04: a full local mirror, the 2,886-line choreography file (author comments in Hebrew), scroll films at 1440×900 and 390×844 with motion enabled, a motion audit, and a controlled CLS experiment.

## Contents
1. The one-sentence lesson
2. The film, act by act (desktop, 29,806 px)
3. The method behind it (transferable)
4. The visual system (and why it is NOT the lesson)
5. The engineering that keeps it smooth
6. Mobile is re-choreographed, not shrunk
7. Measured numbers
8. What not to copy

---

## 1. The one-sentence lesson

The site does not stand out by avoiding "AI tells". It uses several of them on purpose: near-black with one acid-lime accent, mono uppercase labels, "01 / 08" counters, "A · B" meta strings. These are frontend-design v3's default clusters #2 and #5. It stands out because of three things a template cannot fake:

1. **Real material.** The founder's own cutout portrait, eight unedited selfie videos of real clients, screen recordings of real client sites, and an AI-generated cinematic sequence *of the founder himself*.
2. **Type as image.** A custom Hebrew display face (Sataf) set huge, including one headline that is several screens wide and has to be travelled through.
3. **A scroll choreography where every section performs one argument.** The author's own header comment: "The page changes theme on scroll, and each section carries one move of its own. Each move is tagged with an ID from the library." A legacy block states the doctrine: "One language, one grid, and motion that explains instead of decorating."

So the skill teaches the method that produced this site. It never teaches the look.

## 2. The film, act by act (desktop 1440×900)

The scroll position is the start of each beat. "Held" means pinned or sticky: the page keeps scrolling but the scene stays put.

| y (px) | Theme | Beat | Signature move (author ID) | What the motion argues |
|---|---|---|---|---|
| 0 | black | Preloader | 6 brand shapes swap in the centre (0.26 s each), each lighting its mini twin in a row below; then the curtain lifts (yPercent −100, 0.9 s) | "This studio has its own visual alphabet" (no logo, no % counter) |
| 0 | light #f1f1f1 | Hero | headline lines rise from a mask (yPercent 110→0, 1.1 s, stagger 0.1); a lime underline draws under "closer"; brand shapes pop in and float; mouse parallax by depth | the promise, with the one marked word |
| 450 | **flips dark** | Proof first: "You don't have to believe me. Hear it from them." | - | the dark flip marks act 2 |
| 1,800-3,600 | dark | **Held**: horizontal track of 8 client selfie videos (G65) | track scrubbed sideways; the centred card grows and autoplays muted; tap opens a full-screen player with sound | one real face at a time, not a logo wall |
| 4,050 | dark | Quote marquee, two rows | scroll velocity speeds the rows up to ×4 | volume of praise, glimpsed in passing |
| 4,500-6,300 | dark | Work index (G43): "This is how your business can look too." | a laptop preview follows the cursor, tilts with mouse velocity (±10° z, ±18° y), and plays that client's screen recording | the copy says "look", the motion rewards looking |
| 6,750-15,750 | dark | **Held 9,000 px**: cinematic image sequence in 3 scenes (founder with laptop → eyes closed → a bulb lights → a new site) | canvas frame scrub, 18 px per frame; Ken Burns hold between scenes; captions land at 68 % of each scene: "The business moved forward. The site stayed behind." → "It's time the site kept your pace." | the "why now" story, paced by the visitor's own scroll. ~29 % of the page goes to emotion |
| 15,750-18,000 | dark | Method: "You know the business. The site is on me." (G107) | a sticky step number rolls like an odometer; the active step is computed from position, so fast scrolling never shows a stale number | the process is finite and you always know where you are |
| 18,900-21,150 | dark | **Held**: a WhatsApp-style chat advances with scroll | "typing…" bubble before each reply; day dividers get shorter beats | responsiveness is performed, not claimed |
| 22,050 | dark | Work marquee (LM8): "Every business its own colour." | scroll only accelerates and skews it (±6°), never moves its position | speed without sloppiness |
| 22,950-26,100 | **flips white** | **Held**: "Anyone can put up a site. Not everyone knows what to build." | the headline is one line several screens wide, travelling sideways; 8 brand shapes fly past at different depths (paths simulated so no two ever cross); skew from scroll velocity; a lime underline lands under "what to build" | you literally spend scroll time getting to "what to build" ("years to learn") |
| 26,550 | light | About (G15) | portrait revealed from below with clip-path, then numbers count up | the person arrives |
| 27,900 | light → dark | Contact | a form; on success, 18 brand shapes burst from the button and fall with gravity | celebration in the brand's own shapes |
| 28,800 | dark | Footer, revealed behind the page | the 6 brand shapes drop onto the giant wordmark with real physics; drag and throw them | the opening motif closes the story; "a person made this for fun" |

**Rhythm.** Held scenes alternate with free scroll: held → free → held (long) → free → held → free → held → free. No two held scenes touch, and each uses a different mechanic: horizontal track, frame sequence, chat timeline, travelling headline.

## 3. The method behind it (transferable)

1. **A thesis per section, then a move that performs it.** Write the sentence first ("months became days"), then find motion that *is* that sentence: the word "months" is struck while a dot crawls a long track, the track shrinks, "within days" fills in lime. Writing a figure would have been an unprovable claim; distance and speed make the point without numbers. If a move does not carry its section's sentence, cut it.
2. **A private moves library.** Moves have IDs (G43, G60, G107, LM8, B29…) and are reused across pages. One page never uses the same move twice; each section gets its own.
3. **A motif with many jobs.** Six brand shapes (squircle, spark, aster, comb, pin, diamond) appear as preloader, hero constellation, section badges, flying parallax actors, form-success burst and footer toys. Recurrence makes the site cohesive; each new job is a small surprise.
4. **The theme is a chapter marker.** The whole viewport flips light → dark → white at act breaks, using fixed background layers that crossfade; text colour flips 200 ms into the 350 ms fade. Few flips, each meaningful.
5. **Proof before claims.** Real client faces come right after the hero. Owner copy contains 0 self-superlatives, 0 exclamation marks, 0 em-dashes; all praise is in client voices (see content-voice.md).
6. **Scroll budget follows the argument.** ~29 % of the scroll goes to the emotional "why now" story, ~13 % to proof, ~3 % to the bio.
7. **The last frame is the argument.** Under reduced motion every move jumps to its final statement: the struck word, the filled marker, the full chat, the real numbers printed in the HTML. Motion adds tension; meaning never depends on it.
8. **Honesty is designed in.** The chat carries a caption "an illustration of the process as a WhatsApp chat"; the timeline uses no invented numbers; the SEO FAQ says "Google decides the ranking".
9. **Built with AI, openly.** The founder has a page titled "Why I build websites with AI". His moat is the line "AI tools put up a site in a day; what takes years to learn is how it should look and what it should say." That is this skill's thesis too.

## 4. The visual system (and why it is NOT the lesson)

| Token | Value | How it is used |
|---|---|---|
| Background | `#f1f1f1`, white `#fff`, dark `#0a0a0b` / `#141416` | three theme layers |
| Ink | `#0a0a0b`; greys `#5a5a5a`, `#6b6b6b` | text |
| Accent | lime `#d8fc73` | buttons, underlines, the active nav pill, the chat bubble; rationed |
| Second accent | orange `#F17105` | only inside the brand shapes |
| Display | Sataf (Hebrew), 300-800 | `--fs-hero: clamp(40px, 6.4vw, 112px)`, `--fs-h2: clamp(34px, 4.6vw, 80px)` |
| Body | Begin (Hebrew), 300-700 | `--fs-body: clamp(16px, 1vw, 18px)`, line-height 1.55 |
| Labels | IndexMono 11 px, uppercase, tracked, in English | "02 / SELECTED WORK", "UNEDITED", "3 STEPS" |
| Grid | 12 columns, 25 px margin (16 px mobile), 15 px gutter, max 1680 px | |
| Section spacing | 96 → 128 → 160 → 180 px by breakpoint | |
| Radii | 4 / 12 / 20 px | |
| Easing | `cubic-bezier(.2,.6,.2,1)`, `cubic-bezier(.16,1,.3,1)`; GSAP `power3.out` default | |

Two registers carry the voice: a cold English mono index for labels and counts, and warm Hebrew prose for persuasion. That contrast is a real idea. But as a *surface* (black, acid lime, mono caps, giant display) this exact system is one of the five most common AI-default looks in 2026. Copying it produces a new template. Take the *idea* (two registers, one rationed accent, one motif family, giant native-script display) and find this brand's own version.

## 5. The engineering that keeps it smooth

These are the decisions that let 30 viewports of choreography run at a steady 60 fps (p95 frame 16.9 ms in the audit). Each is a gotcha the author hit and fixed; most are in motion-engine.md as recipes.

- **Lenis on the GSAP ticker.** `new Lenis({ lerp: 0.1, wheelMultiplier: 1, syncTouch: false })`, `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`. Lenis is created only when reduced motion is off. It is stopped during the preloader, the mobile menu and the video lightbox, and started again after.
- **Touch is native.** `syncTouch: false`: phones keep native momentum scrolling.
- **Mobile resize discipline.** `ScrollTrigger.config({ ignoreMobileResize: true })`. A refresh waits until the finger lifts and scrolling has been calm for 350 ms. The author's comment: the iOS toolbar showing and hiding during scroll used to rebuild every pin mid-gesture, and the page "got stuck and jumped back". Resize handlers only react to width changes.
- **Fonts before splitting.** SplitText runs only after `document.fonts.ready` (raced against an 1,800 ms timeout); line splits measured with fallback fonts break when the real font arrives.
- **Pin order.** A pinned section that sits *above* other pins but is created after them gets `refreshPriority: 1`. On pages where the order differs, the code resets priorities and calls `ScrollTrigger.sort()` then `refresh()`.
- **CSS sticky for the image sequence, not a pin.** The author's comment: "the stage is sticky in CSS, not pin, so as not to add a pin-spacer". Measured on 2026-10-04: GSAP's default pin (position: fixed) emits layout shifts every time a pin starts or ends. The site's two GSAP pins produced ~2.0 CLS each during a scroll; its sticky sequence produced 0. A controlled page confirmed it: default pin CLS 1.0-3.4, `pinType: 'transform'` 0, CSS sticky 0.
- **Image sequence loader.** Three tiers (640×360 proxies first, 1280×720 for desktop, 540×960 for portrait phones), loaded one scene at a time in priority order, decoded a few frames ahead, and **always drawing the nearest frame that exists, never a black frame**. Ken Burns zoom (1 → 1.05) during holds so a stop never feels like a freeze.
- **Video discipline.** A `<video>` gets its `src` only when it should play, is revealed only once its first frame actually plays (`playing` event), and pauses when it leaves the viewport. A 380 ms dwell before loading means a fast scroll down the list does not fetch every clip.
- **Velocity, damped.** Velocity-driven skew and marquee speed decay every frame (×0.88-0.92) and are clamped (±6-8°, ×3-×8).
- **Footer reveal.** The footer is fixed behind the page; the body gets `padding-bottom` equal to the footer height (margin would collapse and Lenis would mis-measure the page).
- **Accessible overlays.** The lightbox opens with a FLIP from the card's rect, traps focus (Tab cycles close ↔ video), closes on Escape, and returns focus to the card.
- **Content without JS.** The real stats are in the prerendered HTML ("for crawlers and without JS"); the count-up starts from zero only when JS runs.
- **A QA hook.** `?at=N` jumps Lenis and ScrollTrigger to scroll position N and stamps `data-at` on `<html>`, so any scroll position can be screenshotted deterministically.
- **RTL as a multiplier.** One `FLIP = lang === 'en' ? -1 : 1` constant multiplies every direction-bearing horizontal motion, so the English page mirrors the Hebrew choreography from the same file.

## 6. Mobile is re-choreographed, not shrunk

| Section | Desktop | Mobile (390×844) |
|---|---|---|
| Work index | cursor-following tilted laptop | a sticky laptop above the list; whichever row crosses 74 % of the screen becomes active and its recording plays |
| Taste headline | one line several screens wide travelling sideways | two lines start pressed together, then open apart to reveal a strip of real work between them (clip-path inset 50 % → 0) |
| Image sequence | 1280×720 frames | dedicated 540×960 portrait clips, 13 px per frame instead of 18 |
| Chat | pinned `+=2400` | pinned `+=1800`; the heading fades immediately so it never shows through the header gradient |
| Marquees | ×3 max speed | ×7 max (touch flicks are shorter) |
| Pins | start at `top top` | start computed from the header height |

Mobile page: 23,310 px, p95 frame 16.8 ms, 0 errors, and nothing moves on its own under reduced motion.

## 7. Measured numbers (motion-audit, desktop)

- Page 29,806 px (~33 viewports); held scenes 45 % of the scroll; theme flips at 450, ~6,750 (media), 22,950, 27,900.
- 145 animated elements: 43 scrubbed, 102 triggered; 11 distinct motion kinds; plain fades are only 25 % of reveals.
- No dead zone of 3 viewports or more.
- p50/p95 frame 16.7/16.9 ms, 0 % janky frames, 0 ms long tasks during scroll.
- Reduced motion: all content visible, 0 elements moving on their own.
- slop-scan on its sources: 15/100 ("clean of known defaults"). The remaining hits come from round stats ("1,000+", "24/7") inside its own anti-AI checklist.

## 8. What not to copy

- The palette, the fonts, the mono-label voice, the six shapes. They belong to this brand, and as a combination they are a 2026 default.
- The move list as a checklist. A preloader + horizontal track + sequence + chat + marquee + travelling headline + physics footer applied to a bakery is the "Awwwards kit" reflex (reflexes.md, item 11). Each of these moves exists here because a sentence needed it.
- Its length. 33 viewports suit a studio selling choreography. Most small businesses need 8-14.
- Its weak spots. Two of the eight "unedited" videos are captioned reel edits, and the "100+" and "200+" stats are round and unsourced: the site's own sign #6. Keep proof labels honest under scrutiny.
