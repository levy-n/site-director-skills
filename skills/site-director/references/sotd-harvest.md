# SOTD harvest: breaking down an award-winning site

Read this in harvest mode: Nati shares a site that won an award (Awwwards Site of the Day, FWA, CSSDA) or one he loves, and wants to learn how it was made. The output is one file of principles, not looks, at `<skill>/references/harvest/<site-slug>.md`. It is optional and never part of a client's stage 2: a harvest file enters a client project only at the technique stage, after the creative-direction gate.

`<skill>` is this skill's folder and `<skills>` is the skills root, as SKILL.md defines them.

## Contents
1. Rules
2. Steps
3. The harvest file template
4. Using a harvest file in a project
5. Checklist

---

## 1. Rules

- **Read only.** Look at the site the way a visitor does. No logging in, no paywalls, decline non-essential cookies.
- **Never execute downloaded code.** Bundles are fetched as text and searched; never run, imported or evaluated. Property names in an obfuscated bundle are inferred and marked as such.
- **Facts carry sources.** Every fact has a URL, the date it was read, and a status: confirmed (seen in a primary source), inferred (reconstructed, for example from obfuscated code), or not read.
- **Paraphrase.** At most one short quote per source, under 15 words, in quotation marks with credit. Everything else is in your own words.
- **Principles, not looks.** Palette, fonts, layout, signature effects, copy, code and assets stay with their owners. What transfers is the reason behind a decision.
- **Films stay outside the skill and outside client repositories**, in a scratch folder: they are large and they are someone else's work.

## 2. Steps

1. **Name it.** Pick a short slug (`heron-ai`) and a scratch folder for the films.
2. **Open the site in the built-in browser** (the Browser pane: open it with the URL), at desktop size first.
3. **Run this console check verbatim** in the page (the browser's JavaScript tool) and paste the raw result into the harvest file:

   ```js
   ({ gsap: window.gsap?.version, scrollTrigger: !!window.ScrollTrigger, lenis: !!window.Lenis || document.documentElement.classList.contains('lenis'), three: !!window.THREE, webflow: !!document.documentElement.getAttribute('data-wf-site'), scripts: [...document.scripts].map(s => s.src).filter(Boolean) })
   ```

   A missing global does not mean a missing library: bundled code exposes no globals. `gsap` reports the core version only.
4. **Read the versions from the script URLs,** one by one. CDN URLs carry them (`gsap@3.12.5/dist/gsap.min.js`, `lenis@1.1.5`). Plugins can differ from the core: on Heron, the GSAP core and ScrollTrigger load from 3.12.5 while SplitText and TextPlugin load from 3.13.0. Record an unversioned URL as "unpinned" and a major-only one as "major 11". Code with no URL is "bundled, version unknown" unless a version string appears in the bundle's text. Never guess a version.
5. **Hosting and builder:** `data-wf-site` on `<html>` means the page was built in Webflow; the response headers in the browser's network requests name the host. Heron was designed in Webflow and served from Netlify, with its own Vite bundle.
6. **Film it** with pattern-breaker's Harvest mode, motion forced on:

   ```bash
   node <skills>/pattern-breaker/scripts/scroll-film.mjs <url> --out <scratch>/<slug>/film --viewports desktop,short,mobile --video
   ```

   Set `TEMP` and `TMP` as in stage 0 first. Then measure the motion as pattern-breaker's resource atlas describes (`<skills>/pattern-breaker/references/resource-atlas.md` §7 step 3): `document.getAnimations()` timings, and `ScrollTrigger.getAll()` when GSAP is exposed. Watch the video at low speed.
7. **Read the case study,** if one exists: Codrops (tympanus.net/codrops) often publishes the team's own breakdown. If a fetch is refused (Codrops answered 403 to a plain fetch), read the page's text in the built-in browser instead.
8. **Read the award pages,** if they exist. The Awwwards page of the site (`awwwards.com/sites/<slug>`) shows the overall score, the four category scores and the Developer Award breakdown. Awwwards weights its site score design 40%, usability 30%, creativity 20%, content 10%; the Developer Award weights its six criteria (Awwwards developer jury guidelines) WPO 20%, responsive 20%, semantics/SEO 20%, markup/meta-data 15%, animations/transitions 15%, accessibility 10%, and is awarded above 7. FWA and CSSDA pages can be rendered by script; if they do not read, mark the award "not read" rather than trusting a search snippet.
9. **Search the bundle as text** for what the article claims: `registerPlugin` calls, `matchMedia` queries, numeric constants. Record what you found and where.
10. **Write principle cards** in the shape of `resource-atlas.md` §7: observable, intent, mechanism, the principle with no noun from the reference, what not to carry over. Test each principle: could it produce three visibly different sites?
11. **Write the harvest file** from the template below, then check it for long dashes: `node <skill>/scripts/lint-dashes.mjs <skill>/references/harvest/<site-slug>.md`.

## 3. The harvest file template

```md
# Harvest: <site name> (<url>)

Verified <YYYY-MM-DD> by <who>. Status: confirmed = seen in a primary source; inferred = reconstructed; not read.

## Facts
| Fact | Value | Source | Status |
|---|---|---|---|
| Awards and dates | | | |
| Team and schedule | | | |
| Builder and host | | console check, response headers | |
| Libraries and versions | | console check, script URLs | |
| Palette | hex values from the site's CSS | | |
| Type | | the site's CSS | |
| Scroll and motion engine | | | |

## Console check (raw)
<the object the check returned>

## Scores
| Award | Overall | Breakdown | Source |
|---|---|---|---|
| Awwwards site | | design / usability / creativity / content | |
| Awwwards Developer | | semantics/SEO, animations, accessibility, WPO, responsive, markup/meta | |

## How it was made (paraphrased)
- <process facts: where references came from, rejected directions and why, schedule>

## Principles (no nouns from the reference)
### <moment name> (film: <frame files>)
- Observable: <what moves, triggered by what, for how long>
- Intent: <what the motion says about the content at this point>
- Mechanism: <for example: sticky stage 1.5 vp, scrub 0.6, scale 1 to 1.12>
- Principle: <one sentence that could produce three different sites>
- Do NOT carry over: <palette, type, layout, the exact effect, copy>

## What NOT to copy
- <everything that belongs to this brand, and anything that scored low>

## Weak spots
- <the lowest scores, and the evidence that may explain them>

## Sources
- <url> (read <YYYY-MM-DD>, how: browser text, fetch, bundle text search)
```

## 4. Using a harvest file in a project

- Only at the technique stage, after Nati approved the direction at stage 2. Never in the concept lab's packet.
- Re-ground each principle in the client's dossier: which W item does it serve, which chapter, which sentence.
- Mutate at least two of trigger, direction (RTL), material, timing, type and colour role, then run the recognisability test (`resource-atlas.md` §7 step 8): if a designer would name the source within two seconds, mutate again.
- Record the lineage in the project's DESIGN.md (`principle <- reference, date`), and give every use its decision row with a dossier item.

## 5. Checklist

```
Harvest: <site>
- [ ] Opened in the built-in browser; cookies declined; nothing executed
- [ ] Console check run verbatim, raw result saved
- [ ] Versions read per script URL (plugins checked separately from the core)
- [ ] Builder and host recorded
- [ ] Film: desktop, short and mobile, with video
- [ ] Case study and award pages read, or marked "not read"
- [ ] Every fact with a source, a date and a status
- [ ] Principle cards with no reference nouns; "do not copy" filled
- [ ] Quotes: at most one per source, under 15 words
- [ ] lint-dashes passes on the harvest file
```
