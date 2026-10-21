# Idea bank: whole-page concepts that break the template

Read this in the concept lab (concept-lab.md) and in upgrade directions (U7), when a concept needs a spine. `moves.md` is the catalog of single motions inside a section; this file is one level up: ideas that decide how a whole page, or its main act, is organised and what the visitor does there.

Collected 2026-10-13 from a short scan (Awwwards' unusual-navigation collection, Figma's 2026 trends list, scrollytelling roundups) and filtered through this skill's method. Most entries are written for this skill and have no single source; where a real site shows the idea, it is named. Sources at the end.

## How to use an idea

- **One spine per site.** Pick at most one idea from this file as the page's organising concept, plus at most one small one (marked *light*) elsewhere. Two spines compete like two motifs.
- **It must say a sentence about this client.** Write the sentence next to it ("the page builds itself because building sites is what we sell"). An idea that could belong to any business is decoration; drop it.
- **The content is in the HTML.** Every idea below works with JS off and under reduced motion: the last frame (or the plain document) is complete, crawlable text. The idea only enhances it.
- **Check it against reflexes.md.** The *risk* line names the nearest reflex. A match needs a written reason, as with tokens.
- Cost: *light* (CSS, or under ~2 KB of JS), *medium* (a scene with the engine, or a small island), *heavy* (canvas, WebGL, many assets). Prefer light: most of these are wow because of the idea, not the GPU.

## The 20

### I-01 · The page builds itself (האתר נבנה מול העיניים)
- **Says:** "this is how your site gets made, and it is made with care."
- **The idea:** a held stage shows a website mid-construction. Scroll advances it through real stages: grey wireframe boxes, then real type, then colour and brand, then photos, then the frame turns into a phone, then a live URL with a green dot. Captions name each stage. It replaces the generic "how we work" steps.
- **Build:** medium. One sticky stage; the mock's layers switch by `data-stage` derived from scroll progress (never stored); CSS transitions between stages. Label the mock as an illustration.
- **Mobile:** the same, with the phone stage first-class. **Last frame:** the finished mock beside the list of stages.
- **Fits:** web studios, builders, renovators, anyone selling a process. **Risk:** low; it fails only if the mock looks fake (use a real past project with consent).

### I-02 · Your name in the headline (השם שלכם בכותרת)
- **Says:** "this is about your business, not ours."
- **The idea:** the hero holds an inline field inside the sentence ("האתר של ____"). As the visitor types their business name, the headline and a small preview (a sign, a site, a label, a cake) render it in the brand's style. The CTA carries the name ("בואו נבנה את האתר של מספרת דנה") and pre-fills the WhatsApp message.
- **Build:** light. One input, `aria-live` on the preview, nothing sent until they press the CTA. Sensible default text when empty.
- **Mobile:** the field sits under the headline; the keyboard must not cover the preview (scroll it into view on focus). **Last frame:** the default sentence with a placeholder name.
- **Fits:** anything made for a named customer: sites, signs, cakes, engraving, tattoos. **Risk:** low; gimmick if the preview is cheap.

### I-03 · The letter (מכתב מבעל העסק)
- **Says:** "you talk to a person."
- **The idea:** the homepage opens as a short, signed letter from the owner instead of a hero: set large, generous margins, a real signature. It ends with a reply section, not a contact form: the reply is the CTA.
- **Build:** light; it is typography. The signature is a real scan (SVG). Copy must be the owner's own words.
- **Mobile:** natural. **Last frame:** the letter.
- **Fits:** one-person businesses, clinics, crafts, "speak directly with the developer". **Risk:** medium if the letter is AI-sounding; low when it is genuinely written by the owner.

### I-04 · The reply builder (מרכיבים את ההודעה)
- **Says:** "telling us what you need takes ten seconds."
- **The idea:** instead of a form, the visitor taps chips that assemble a sentence ("אני צריך / אתר / לעסק / עם תורים / עד חג"). The sentence is shown as it grows and goes to WhatsApp or email as written. Seen in spirit in Figma's 2026 list as "adaptive forms".
- **Build:** light; chips are real checkboxes and radios in a `<form>`, so it works without JS as a normal form.
- **Mobile:** ideal (thumbs). **Last frame:** the form.
- **Fits:** lead sites, services with a few known variables. **Risk:** low; keep it to 3-5 choices.

### I-05 · X-ray mode (מצב רנטגן)
- **Says:** "look how carefully this is built."
- **The idea:** one switch (or holding a key) turns the page into its own blueprint: the grid, spacing, type sizes, contrast ratios and the HTML element names appear as an overlay on the real page. For studios whose product is the build.
- **Build:** light to medium; CSS outlines plus `data-` labels written at build time. A real toggle button with `aria-pressed`.
- **Mobile:** the switch stays; labels thin out. **Last frame:** the normal page.
- **Fits:** web and product studios, architects, engineers. **Risk:** medium (dev-tool cargo cult) unless the brand sells craft.

### I-06 · Before and after across the whole page (לפני ואחרי לכל העמוד)
- **Says:** "this is the difference we make."
- **The idea:** a vertical divider runs through the hero (or the whole first screen): to its right the "before" (an old site, an old photo, a messy space), to its left the "after". The visitor drags it; on scroll it sweeps once by itself.
- **Build:** light; clip-path on one layer, a keyboard-operable slider (`role="slider"`, arrow keys).
- **Mobile:** horizontal divider or a tap toggle. **Last frame:** the "after", with the "before" as a small inset.
- **Fits:** redesigns, renovation, restoration, tape and photo restoration. **Risk:** low; needs a real before (with consent).

### I-07 · The product's own interface as the navigation (הממשק של המוצר)
- **Says:** "we live inside this tool."
- **The idea:** the site's chrome is borrowed from the client's own instrument: an editing timeline (scroll is the playhead), a vending keypad (sections are selection codes), a till receipt, a VCR on-screen menu, a lift panel. Navigation and progress speak that language.
- **Build:** medium; the instrument is the header and progress, the content stays normal HTML.
- **Mobile:** the instrument shrinks to one bar. **Last frame:** the bar at its end state.
- **Fits:** any business with a recognisable instrument. **Risk:** medium (novelty); the instrument must be truly the client's.

### I-08 · The receipt (הקבלה)
- **Says:** "here is exactly what you get, itemised."
- **The idea:** the offer or the process is a long printed receipt: monospaced lines, dotted leaders, a total, a perforated tear line where the CTA sits ("לגזור ולשלוח").
- **Build:** light; CSS (mask for the zigzag edge, `::after` perforation).
- **Mobile:** natural, it is a narrow strip. **Last frame:** the receipt.
- **Fits:** clear packages, fixed-price services, food. **Risk:** medium (seen in portfolios); fine when the items are real.

### I-09 · Index-first homepage (תוכן העניינים)
- **Says:** "everything is here, choose."
- **The idea:** no hero. The homepage is a giant typographic index of the site, one line per page or service, each line set at display size. Hovering or focusing a line opens its summary in place; clicking goes deep.
- **Build:** light; a list of links with `<details>` or a hover panel.
- **Mobile:** tap to open in place. **Last frame:** the index.
- **Fits:** studios with several services, archives, menus. **Risk:** low; strong for SEO (clear internal links).

### I-10 · Choose how to read (בחרו איך לקרוא)
- **Says:** "you decide how much you want."
- **The idea:** a small switch at the top re-lays the same content three ways: "בקצרה" (one screen of essentials), "בפירוט" (the full page), "בתמונות" (a visual run). Inspired by ENID's navigation layout selector (Awwwards).
- **Build:** medium; one DOM, three layouts by a class on `<main>`; the choice is not persisted (the user's a11y-persistence rule applies to any preference).
- **Mobile:** default to "בקצרה". **Last frame:** the full page.
- **Fits:** B2B, mixed audiences (decision makers skim, users read). **Risk:** low.

### I-11 · One screen, no scroll (מסך אחד)
- **Says:** "simple. it all fits."
- **The idea:** the whole site is one viewport. Sections swap in place through one control (a dial, a lever, numbered keys); the URL updates per section for sharing and SEO.
- **Build:** medium; real routes underneath (each section is a real page), View Transitions between them.
- **Mobile:** works, the control sits at the thumb. **Last frame:** each page plain.
- **Fits:** small menus, single products, events. **Risk:** medium; never for long-form content.

### I-12 · The dial (חוגה)
- **Says:** "tune in."
- **The idea:** a radial control (a rotary dial, a radio tuner, a sundial) chooses the chapter; turning it with scroll, drag or arrow keys moves through sections. Figma's 2026 list names radial menus (Locomotive, Google Arts and Culture).
- **Build:** medium; a real `role="slider"` with keyboard support; sections remain in the document.
- **Mobile:** a half-dial at the bottom edge. **Last frame:** a normal list of chapters.
- **Fits:** radio, audio, hospitality, anything "tuned". **Risk:** medium.

### I-13 · The site changes with the hour (האתר לפי השעה)
- **Says:** "we are open, and it is real time here."
- **The idea:** the palette, the hero line or the photo follows the visitor's local time: morning light, afternoon, evening; Friday afternoon and Shabbat states for Israeli businesses. Light and alive without moving anything.
- **Build:** light; the server renders the default, a tiny script sets `data-hour` on load; every state passes contrast.
- **Mobile:** same. **Last frame:** the default state.
- **Fits:** cafés, bakeries, gyms, studios with opening hours. **Risk:** low; keep the states few.

### I-14 · The brochure button (גרסת הדפסה מעוצבת)
- **Says:** "take us to the meeting."
- **The idea:** a "שמרו כ-PDF" button prints the page through a designed print stylesheet: one or two A4 pages laid out as a real brochure (logo, services, contact, QR). B2B decision makers forward PDFs.
- **Build:** light; `@media print` and `window.print()`, nothing else.
- **Mobile:** share sheet. **Last frame:** n/a.
- **Fits:** B2B, institutions, venues. **Risk:** none; rarely done.

### I-15 · Film credits footer (כתוביות סיום)
- **Says:** "this was a production, and these are the people."
- **The idea:** the footer rolls like end credits: roles and names (who built it, who filmed, the clients who agreed to be named, the tools), centred, slow, then the contact as the last card.
- **Build:** light; CSS scroll-driven scroll of a credits block, or plain static on reduced motion.
- **Mobile:** same. **Last frame:** the credits as a static list.
- **Fits:** video, events, theatre, any team. **Risk:** low; only real names.

### I-16 · Split-flap headline (לוח רכבת)
- **Says:** "arrivals and departures; what is next."
- **The idea:** one headline is set in split-flap tiles that flip to change the word (services, cities, dates). Hebrew whole words flip per tile row, not per letter.
- **Build:** light to medium; CSS 3D flip per tile; the full sentence is real text for screen readers.
- **Mobile:** fewer tiles. **Last frame:** the final word.
- **Fits:** travel, logistics, schedules, deliveries. **Risk:** medium (retro gimmick); one per site.

### I-17 · The card catalogue (מגירות הקטלוג)
- **Says:** "organised, findable, kept with care."
- **The idea:** services or products live in drawers of a library card catalogue: pulling a drawer (click or scroll) slides out its index cards; each card is a real page link.
- **Build:** medium; `<details>` drawers with CSS transforms.
- **Mobile:** stacked drawers, one open at a time. **Last frame:** all drawers open as lists.
- **Fits:** archives, libraries, tape and photo digitising, accountants. **Risk:** medium.

### I-18 · Margin notes (הערות בשוליים)
- **Says:** "here is our honest thinking."
- **The idea:** the page carries a second voice in the margin: short notes from the maker beside the main text ("כאן רוב האתרים שמים מספרים מנופחים. אין לנו כאלה עדיין."). Tufte-style sidenotes on desktop.
- **Build:** light; sidenotes as `<aside>` placed in the margin by grid, inline on mobile.
- **Mobile:** notes become inline callouts. **Last frame:** same.
- **Fits:** consultants, studios, anyone selling honesty. **Risk:** low when the notes are genuinely candid.

### I-19 · Stories on the phone (סטורי בנייד)
- **Says:** "this is the format you already use."
- **The idea:** on phones only, the homepage's first act is a tap-through story (progress bars, tap right/left), the native language of an Instagram-first audience; on desktop it is a normal section. The content is the same DOM.
- **Build:** medium; each slide is a real section; tap zones are buttons; swipe is optional.
- **Mobile:** this is the mobile version. **Last frame:** the slides stacked as sections.
- **Fits:** consumer brands, salons, food, events. **Risk:** medium; never trap the visitor (a skip link to the rest of the page).

### I-20 · The page asks first (העמוד שואל קודם)
- **Says:** "we listen before we pitch."
- **The idea:** the hero is one question with two or three answers ("יש לכם אתר?" כן / לא / יש אבל הוא ישן). The answer reorders the page below it: the most relevant section moves up and the headline adapts. Nothing is hidden; only the order and one line change.
- **Build:** light; the default order is server-rendered; the answer sets a class that changes `order` in a flex column; it is not persisted.
- **Mobile:** ideal. **Last frame:** the default order.
- **Fits:** services with distinct customer types (new vs redesign, host vs buyer). **Risk:** low.

## Pairings that work

- I-03 the letter + I-04 the reply builder: the letter ends in the reply.
- I-01 builds itself + I-05 X-ray: the finished stage offers the X-ray switch.
- I-07 instrument + I-15 credits (for video businesses).
- I-20 asks first + I-09 index: the answer opens the matching line of the index.

## Pairings that fail

- Two spines (I-01 and I-11, I-12 and I-07): they fight for the scroll.
- I-19 stories on a B2B decision-maker audience.
- I-13 hour states on a site whose palette is already rotating fields (two colour logics).

## Sources

- Awwwards, "Navigation layout selector - Enid" (enid.fm) and the related unusual-navigation set: https://www.awwwards.com/inspiration/navigation-layout-selector-enid
- Awwwards, "Experimental Scroll Navigation": https://www.awwwards.com/inspiration/experimental-scroll-navigation
- Figma, web design trends 2026 (radial menus, hidden drawers, map navigation, nonlinear journeys, adaptive forms): https://www.figma.com/resource-library/web-design-trends/
- Really Good Designs, scrollytelling examples (Esimple's room-by-room story, Bellroy): https://reallygooddesigns.com/scrollytelling-website-examples/
- EuroDNS on when unconventional design works and when it doesn't: https://www.eurodns.com/blog/breaking-the-mold-why-unconventional-website-design-works-and-when-it-doesnt
