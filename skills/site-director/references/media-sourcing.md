# Media sourcing: free, licence-checked images and video of the client's world

Read this when the client has no photos or video of their world, or not enough, and the site still needs pictures or loops. It covers the honesty order, how to search from dossier items, what makes a pick unique, the licence of every source, `find-media.mjs`, the media ledger, video and optimisation.

## Contents

1. When to use
2. The honesty order
3. Searching from the dossier
4. What makes a pick unique
5. Sources and licences
6. find-media.mjs
7. The download rule
8. The media ledger and credits
9. Video
10. Optimisation
11. Checklist
12. Credit

## 1. When to use

- **After the world dossier exists** (`design/world-dossier.rtl.md`, stage 2 step 3). A search that starts before the dossier finds the trade's generic stock, not this client's world.
- **The client's own material comes first, always.** Before searching, send the world shot list again (stage 1, `references/world-questions.rtl.md`). Found media fills gaps; it never replaces a photo the client can take this week.
- **Typical gaps it fills:** materials and textures (flour, burlap, magnetic tape), the trade's tools and documents as objects, the trade's history (engravings, catalogues, archive photographs), ambient loops (a reel turning, steam, a tape winding).
- **Never for:** the client's people, premises, products, results or customers. Those are the client's photos, or a drawn treatment (§2 level 4).

## 2. The honesty order

Per slot, use the first level that exists:

1. **The client's own photos and video,** with consent recorded in the dossier's sources table.
2. **Generated media of the real subject:** made from the client's own material (a still of the client's oven animated, a cut-out of the client's real order slip). Never a generated person, a generated premises or an invented product presented as real.
3. **Licence-checked free media of the client's world:** objects, materials, processes, history, the place. Through `find-media.mjs` (§6) or by hand from the sources in §5.
4. **A drawn or typographic treatment:** the dossier object drawn in SVG, type as image, a colour field.

Hard rules:

- **No stock people.** No recognisable person in found media on a client site: never as staff, customers, reviewers or "the team". A hand at work seen from behind may pass when nothing identifies the person and the licence allows it. MediaWave's own site is the exception Nati made (20.10.2026: people and labels in frame are fine, a human dimension is welcome), still inside each licence's rules on people and brands, and never presented as clients or staff.
- **Never pass found media off as the client's own.** No caption, alt text, heading or placement that says or implies "ours". A found picture of dough is dough, not "our dough".
- **Label where needed.** If a visitor could take a found or generated image for the client's own product or place, replace it with level 1 or 4, or label it in small text next to it: "תמונה להמחשה".
- **Proof stays real** (`references/story.md`): found media is never the proof of a chapter.
- **Nothing of another business:** no logo, trademark, packaging, signage or recognisable product of another brand in frame. Crop it out or reject the file. No watermark, no burned-in text.

## 3. Searching from the dossier

Every search serves one dossier item (`W03`), and the item travels with the file into the ledger (`--item W03`).

1. Pick the items whose "איך הוא הופך לאתר" needs a picture or a loop. Most items become type, grid, colour or interaction; only some need media.
2. Translate the Hebrew item into English search terms in three layers:
   - the object by its trade name ("שק קמח": `flour sack`, `burlap sack`, `mill sack`);
   - its material or surface, close up (`burlap texture`, `flour dust`);
   - its process or moment (`kneading dough`, `sifting flour`).
   Add a medium or an era where archives answer: `engraving`, `trade catalogue`, `patent drawing`, `1950s photograph`.
3. Search where each source is strong: the museums (`artic`, `met`) match one or two words and hold engravings, prints, tools and objects; Wikimedia Commons holds documents, tools, processes, history and video; Openverse spans Flickr and many collections; Pexels and Pixabay hold modern close-ups and loops (keys needed).
4. Two or three queries per item. If nothing honest fits, go to level 4 and draw it.

Examples from two briefs:

| Dossier item | Object terms | Material, close-up | Process, moment |
|---|---|---|---|
| שק קמח | flour sack, burlap sack, mill sack | burlap texture, flour dust | pouring flour, sifting |
| טיימר תנור | oven timer, kitchen timer, mechanical timer | enamel dial | timer ringing |
| פתק הזמנה | order slip, order pad, carbon copy book | handwriting on paper | writing an order |
| בצק | dough, sourdough, proofing basket | flour on wood | kneading, dough rising |
| קלטת VHS | VHS cassette, videocassette, tape label | magnetic tape close-up | tape rewinding |
| מכשיר וידאו | VCR, video cassette recorder | front panel buttons | inserting a tape |
| סליל פילם | film reel, 8mm film, film splicer | film strip, sprocket holes | film running through a projector |
| ציר זמן בעריכה | video editing timeline, film editing table | film strip on a light box | cutting, splicing |
| מסך עורך קוד | (take a real screenshot of our own editor: level 1) | - | - |

Search terms to avoid: "person at laptop", "business meeting", "happy customer", "team", "handshake", "office", "success", the trade's generic word alone ("bakery"). They return the stock world every competitor already uses.

## 4. What makes a pick unique

- **Not the first page of the most popular results.** Look past page 1 (`--page 2`), prefer archives and museum objects, and treat heavy download counts as a warning (Pixabay reports them; the script notes files with 50,000 downloads or more).
- **A specific object, not a mood.** A mechanical oven timer with a worn enamel dial beats "a kitchen".
- **One light and colour family** across the site: the same light direction, temperature and contrast. Reject a pick that would need a different grade from the rest.
- **Crop and grade to the palette.** Crop to the ratios the grid uses; one treatment for every picture (untouched, monochrome, or multiply on a field). Record the edit in the ledger.
- **One source family per site:** all museum engravings, or all modern close-ups, or all archive photographs of one era. Mixed families read as a scrapbook.
- **Big enough:** about twice the CSS width it is shown at. A 1280 px file is a half-width picture at most.
- **The same-field swap test** (`references/design-rules.md` §8): if the picture would sit equally well on the site of a competitor from the same city and trade, it is not specific enough.

## 5. Sources and licences

Verified 2026-10-15 against each source's own licence page and API documentation (links below). Licences change: the source page is the authority at download time, and its licence goes into the ledger.

| Source | Licence | Commercial | Credit | Main restrictions | Script access |
|---|---|---|---|---|---|
| Pexels (photo, video) | Pexels License (some files CC0) | yes | not required; the API guidelines ask to credit photographers when possible and to show a prominent link to Pexels | no sale or distribution of unaltered copies (prints, wallpapers, merchandise) or on other stock or wallpaper platforms; no implied endorsement by people or brands shown; no offensive use of identifiable people, nor showing them as suffering from or medicating for an ailment; trademarks in frame not for commercial use relating to goods and services; not part of a trademark or business name; scraping banned, including for machine learning | `pexels`, needs `PEXELS_API_KEY` (Authorization header; 200 requests per hour, 20,000 per month by default) |
| Unsplash (photo) | Unsplash License | yes | not required | no selling without significant modification; no compiling photos into a similar or competing service; the licence page says nothing about people, trademarks or releases, so treat recognisable people and brands as not cleared | none: the API terms require hotlinking the returned image URLs, a download event and a photographer credit with links wherever an image is shown, which does not fit self-hosted optimised files. Download by hand from unsplash.com under the licence |
| Pixabay (photo, video) | Pixabay Content License | yes | not required | no standalone sale or distribution (including through a stock platform, prints, merchandise); recognisable people not in immoral, illegal, defamatory or political use; trademarks and brands not for commercial use relating to goods and services; no suggested endorsement or affiliation; not part of a trademark or business name; no claiming authorship; scraping banned, including for machine learning | `pixabay`, needs `PIXABAY_API_KEY` (key parameter; 100 requests per 60 s; results cached 24 h; no permanent hotlinking, so download what you use; show where results come from; files at most 1280 px without full API access) |
| Openverse (image index: Flickr, Wikimedia, museums, libraries) | each item's own CC licence or mark | CC0, PDM, BY, BY-SA yes; BY-ND yes but no adaptations; NC no | per licence | Openverse does not verify licences: you must verify at the source; scraping banned; a product built on the API says prominently that it was made using Openverse and is not endorsed or certified by Openverse (the contact sheet carries that line) | `openverse`, no key (anonymous: 20 requests per minute, 200 per day, measured from the response headers; limited page size and depth) |
| Wikimedia Commons (image, video, documents, history) | per file, on the file page (mostly CC BY, CC BY-SA, public domain) | yes for the free licences | per licence; credit the author named on the file page, with the licence and its link | personality rights, trademarks and insignia apply apart from copyright; hotlinking possible but not recommended | `wikimedia`, no key (a descriptive User-Agent with contact is required, generic agents get HTTP 403; requests in series, not in parallel) |
| Art Institute of Chicago | CC0 for images labelled "CC0 Public Domain Designation" | yes, free, no permission needed | requested caption: "Artist. Title, Date. The Art Institute of Chicago." | third-party permissions are the user's responsibility; images not marked CC0 go through Art Resource | `artic`, no key (60 requests per minute per IP; optional AIC-User-Agent header with name and contact; no parallel scraping; IIIF width 843 recommended, 1686 for public-domain images) |
| The Met Open Access | CC0 for objects marked Open Access (public-domain works) | yes | not required | works under copyright are not Open Access (`isPublicDomain` false) | `met`, no key (at most 80 requests per second, but its CDN answered HTTP 403 to about 90 uncached requests in 3 minutes, so the script asks once per second; the search returns ids only, one more request per object; `/v1/search` was retired on 2026-10-01, `/v1.1/search` with offset and limit replaces it) |
| NASA Image and Video Library | generally not subject to copyright in the United States (NASA does not state the status elsewhere) | yes, without implying endorsement | NASA as the source | NASA insignia and logos are protected and not public domain; no explicit or implied NASA endorsement; permission needed for identifiable people in commercial use, and current astronauts and employees never in products, ads or promotion; third-party material carries its owner's credit and needs that owner's permission | `nasa`, no key, opt-in (`--sources nasa`) |
| Mixkit (video) | per clip: Stock Video Free License, or Stock Video Restricted License (personal projects only) | Free License: yes | not required (Mixkit FAQ) | no selling items without altering them; not available on a stock basis; watermarks stay; no scripts or bots for mass download | none (no API; scripted mass download banned). By hand; record which of the two licences the clip carries |
| Coverr (video) | Coverr license | yes | not required for site downloads | no reselling or offering inside video services; no competing service; no AI training or datasets; Coverr holds model releases for people but does not pass them on to users, and holds none for brands, trademarks, property or landmarks; terms may change | none: the API needs an account key and requires Coverr attribution for API videos. By hand |

Sources, read 2026-10-15:
- Pexels: https://www.pexels.com/license/, https://www.pexels.com/terms-of-service/ (last updated 15 Nov 2024), https://www.pexels.com/api/documentation/
- Unsplash: https://unsplash.com/license, https://unsplash.com/api-terms, https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines
- Pixabay: https://pixabay.com/service/license-summary/, https://pixabay.com/service/terms/ (last updated 18 Nov 2024), https://pixabay.com/api/docs/
- Openverse: https://docs.openverse.org/terms_of_service.html, https://api.openverse.org/v1/ (schema and rate-limit headers)
- Wikimedia: https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia, https://foundation.wikimedia.org/wiki/Policy:User-Agent_policy, https://www.mediawiki.org/wiki/API:Etiquette
- Art Institute of Chicago: https://www.artic.edu/open-access/open-access-images, https://www.artic.edu/image-licensing, https://api.artic.edu/docs/
- The Met: https://metmuseum.github.io/ (API), https://www.metmuseum.org/policies/image-resources and https://www.metmuseum.org/press/news/2017/open-access (metmuseum.org refused automated reads with HTTP 429; the CC0 policy was confirmed through search results quoting these pages, so confirm the Open Access mark on each object page)
- NASA: https://www.nasa.gov/nasa-brand-center/images-and-media/
- Mixkit: https://mixkit.co/license/, https://mixkit.co/terms/ (the licence texts were not readable by the fetcher; the Free License terms come from Mixkit's FAQ, so read the licence shown with the clip)
- Coverr: https://coverr.co/license, https://coverr.co/developers
- Creative Commons: https://wiki.creativecommons.org/wiki/Recommended_practices_for_attribution, https://creativecommons.org/faq/

Creative Commons basics (from CC's pages above):
- A credit names the **title, author, source and licence** (TASL), with links; the title is required for 3.0 and earlier, optional for 4.0. Say when the work was modified ("cropped and colour graded from the original").
- **ND** licences do not allow sharing adaptations. Treat any crop, grade or overlay as a possible adaptation: use the file whole and untouched, or skip it. The script marks ND as "needs-check".
- **SA** licences require an adapted version to be shared under the same licence.
- CC licences do **not** license trademarks or publicity, personality and privacy rights.
- CC0 and the Public Domain Mark need no credit; crediting the source anyway is recommended.

**Without a key:** a video page on Pexels may sit behind a bot check; never try to pass one. Search in the built-in browser the way a person does (a few pages, not a crawl, since the sources ban scraping), note the ids and file links, and after Nati's yes download only those files. For repeat work Nati creates the free key himself.

## 6. find-media.mjs

```bash
node <skill>/scripts/find-media.mjs --q "flour sack" --q "burlap texture" --item W04
node <skill>/scripts/find-media.mjs --q "oven timer" --page 2 --item W06
node <skill>/scripts/find-media.mjs --q "film reel" --type video --sources wikimedia,nasa --item W09
node <skill>/scripts/find-media.mjs --download wikimedia-108164988=W04,artic-32192=W04
```

- Run it from the project root. It writes `design/media/candidates/candidates.json`, `design/media/candidates/index.html` (the contact sheet) and a 24 h response cache in `.cache/` there. Earlier candidates stay unless `--fresh`.
- Sources: `openverse`, `wikimedia`, `artic`, `met`, `pexels`, `pixabay` by default (those that carry the requested type); `nasa` on request. `pexels` and `pixabay` run only when `PEXELS_API_KEY` or `PIXABAY_API_KEY` is set in the environment; otherwise they are skipped with a message. Keys are never printed or written to disk. Do not sign up for a key on Nati's behalf.
- Every candidate records: id, source, title, page URL, file URL, width, height, duration and size for video, author, licence code, label and URL, attribution text, `commercialOk`, `creditRequired`, `status` and notes.
- Licence filter: NC licences are dropped and counted (Openverse is asked for commercial-use licences only, so its NC results never arrive and are not counted). ND, unknown licences, US-only public domain, files with named restrictions and Commons files whose licence is not yet confirmed (a "License review needed" or deletion category) stay with `status: "needs-check"`. Too small, off subject and duplicates are counted too. Duplicates: ids already in `candidates.json`, and Openverse copies of Commons files (same page id or file name) that Commons itself returned, in this run or an earlier one; Commons is searched first, and its own record wins. Off subject: Openverse, Commons, the museums and NASA match words anywhere (transcripts, page text, loose museum search), so each record's own fields must hold the query words as whole words (all of them; all but one for three words or more), with at least one in the title, tags or categories, not only in a long description. Pexels and Pixabay keep their own ranking.
- Politeness: a User-Agent naming the tool and a contact (`FIND_MEDIA_CONTACT` overrides the contact), sequential requests with a pause per source, small pages, two retries on connection errors and server errors. Timeouts: 20 s; Openverse 40 s and asked once more after a timeout (a query it has not seen can take over 20 s; in tests on 2026-10-15 a repeat a few seconds later answered within a second). A source that answers HTTP 429 or 403, or times out twice in a row (each time after its repeat, if it has one), is not asked again in that run; the results read before stay. Wait a few minutes before the next run.
- **A timeout:** run the same command again. The cache keeps what was found, `candidates.json` keeps the earlier candidates, and the source usually answers fast the second time.
- The contact sheet is RTL, groups candidates by query, shows the licence status, and builds the `--download` command from ticked boxes. When Openverse results are on it, it says they were found through Openverse, which does not verify licences, and that it is made using Openverse without its endorsement (Openverse's terms ask for that line). Its thumbnails load from the sources for local preview only; never publish it.
- `--download <id,id>` fetches only the listed ids, reads each record again from the source first (never from the cache, except Pixabay, whose API terms require 24 h caching) and refuses a licence that changed to non-commercial, a "needs-check" file without `--allow-needs-check`, and video over `--max-mb` (25 MB). It saves `<id>.<ext>` into the candidates folder (and `<id>-poster.<ext>` for video), and adds one ledger row per file.
- Exit code: 0 ok, 1 no results or a source error, 2 usage error. A source error does not stop the other sources.

## 7. The download rule

The agent never downloads on its own. After a search:

1. Open the contact sheet and choose. At most two or three candidates per dossier item, one source family for the site (§4).
2. Ask Nati once, in one question, with one list. Per file: the id, the dossier item and the slot it fills, the source and its page URL, the licence (and whether a credit is required), the size (pixels; length and MB for video). Recommended set first; options: approve all, approve some, none.
3. Only after a yes, run `--download` with exactly the approved ids. A "needs-check" file needs Nati's explicit approval of that file, then `--allow-needs-check`.
4. Look at every downloaded file at full size before using it. A title is not a picture.

## 8. The media ledger and credits

- `design/media-ledger.rtl.md`, from `<skill>/assets/templates/media-ledger.template.rtl.md` (the script creates it on the first download). One row per file on the site, the client's own photos included: id, dossier item, type, source page, author, licence, attribution text, download date, local path, edits made.
- Fill "עריכות שבוצעו" after processing: crop, grade, resize, format, trim, audio removed.
- **Credits on the page** (only where the licence requires one: Nati prefers no credit line otherwise, 20.10.2026): one credits line in the footer, or a `/credits` page the footer links to, at a readable size and full contrast. For CC BY, BY-SA and BY-ND: title, author, source link, licence link and the modification note. CC0, public domain, Pexels and Pixabay need none, but a short credit is good practice, and the Art Institute asks for its caption. Never only in alt text or metadata.
- A file that leaves the site leaves the ledger and the credits line with it.
- Before delivery, every image and video in the built site has a ledger row, and every ledger row is still used on the site.

## 9. Video

- **Short loops:** 5-15 s that loop without a visible jump. Trim a longer clip; a ten-minute archive film is material, not a loop.
- **Silent:** no audio track (`-an`), `muted playsinline loop`, `aria-hidden="true"` when decorative. Whatever the clip says that matters belongs in the text beside it.
- **Poster frame:** the loop's first frame, exported as AVIF and WebP. It shows before playback, under reduced motion and on slow connections, so it must work as a picture on its own. The LCP element is text or this poster, never the video.
- **Reduced motion (strict on client sites):** no autoplay; the poster stays. A loop that plays longer than 5 s gets a visible pause control (WCAG 2.2.2).
- **Encode for the web.** H.264 MP4 is the universal file; an AV1 MP4 goes first for browsers that decode it; a light mobile encode at 960 px wide. Commands verified with ffmpeg 7.1 on 2026-10-15 (a synthetic 4 s clip; output checked with ffprobe: no audio stream, yuv420p, AV1 Main level 4.0 at 1080p):

  ```bash
  ffmpeg -i in.mov -ss 3 -t 8 -vf "scale=1920:-2,fps=30" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart -an loop-1080.mp4
  ffmpeg -i in.mov -ss 3 -t 8 -vf "scale=1920:-2,fps=30" -c:v libaom-av1 -crf 34 -b:v 0 -cpu-used 6 -row-mt 1 -pix_fmt yuv420p -movflags +faststart -an loop-1080-av1.mp4
  ffmpeg -i in.mov -ss 3 -t 8 -vf "scale=960:-2,fps=30" -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart -an loop-mobile.mp4
  ffmpeg -i loop-1080.mp4 -frames:v 1 -update 1 poster.png
  ```

  ```html
  <video muted playsinline loop preload="none" poster="/media/reel-poster.avif" width="1920" height="1080" aria-hidden="true">
    <source src="/media/reel-mobile.mp4" type="video/mp4" media="(max-width: 768px)">
    <source src="/media/reel-1080-av1.mp4" type='video/mp4; codecs="av01.0.08M.08"'>
    <source src="/media/reel-1080.mp4" type="video/mp4">
  </video>
  ```

  `av01.0.08M.08` means Main profile, level 4.0, Main tier, 8 bit (MDN codecs parameter); check the level with `ffprobe -show_entries stream=level` (8 = 4.0) and change it if the encode differs. MDN browser-compat-data lists `media` on `<source>` inside `<video>` for Chrome, Safari and Firefox 120 and later (Firefox 53-119 honoured it only inside `<picture>`). Mount the video after load and idle when it is about a viewport away, play it only while it is on screen, and pause it offscreen.
- **A showreel of many takes** (a media-led hero): short takes, a desktop and a tall phone cut, VP9 WebM beside H.264, and the engine that plays them: `media-material.md` §3. Seamless loops with `xfade` need `fps=25,settb=1/25` on each branch.
- **Size budget (MediaWave policy):** hero loop at most 3 MB for the desktop file and 1 MB for the mobile encode; any other loop at most 2 MB; one or two loops per page. `find-media.mjs` refuses source files over 25 MB, which are raw material, not page assets.
- **Never mask, filter or clip a `<video>` with SVG `url()` effects:** Safari ignores them (WebKit 184601). Ink and mask effects go on the poster or a still (`references/motion-system.md`).

## 10. Optimisation

- **Formats:** AVIF first, WebP as the fallback, through `<picture>` or the framework's component (Astro: `<Picture formats={['avif','webp']} ...>`, pattern-breaker foundations). Without a framework, ffmpeg (verified 2026-10-15 with ffmpeg 7.1):

  ```bash
  ffmpeg -i in.jpg -vf "scale=1600:-2" -c:v libaom-av1 -still-picture 1 -crf 32 -cpu-used 6 -pix_fmt yuv420p out-1600.avif
  ffmpeg -i in.jpg -vf "scale=1600:-2" -c:v libwebp -quality 78 out-1600.webp
  ```

- **Widths:** export the widths the layout uses (for example 480, 800, 1200, 1600, and 2400 for a full-bleed hero) with `srcset` and `sizes`. Never upscale a small source.
- **Dimensions:** `width` and `height` on every `<img>` and `<video>` (or CSS `aspect-ratio`), so nothing shifts while loading. A background colour from the palette on the container.
- **The LCP image is never lazy:** no `loading="lazy"`, `fetchpriority="high"`, no entrance from opacity 0. Every other image: `loading="lazy" decoding="async"`.
- **Self-host:** download, optimise and serve from the site. Never hotlink (Pixabay forbids permanent hotlinking; Commons does not recommend it).
- **Client photos:** remove location metadata before publishing, and check with a metadata viewer.

## 11. Checklist

- [ ] The dossier exists and the client's own material was requested first
- [ ] Each search served a dossier item (`--item`), with two or three queries per item
- [ ] No recognisable person, no logo or brand of another business, no watermark
- [ ] Nothing found is presented as the client's own; "תמונה להמחשה" where needed
- [ ] One source family and one treatment for the whole site
- [ ] Nati approved the download list in one question; only those ids were downloaded
- [ ] Every file has a ledger row with licence, attribution and edits
- [ ] Credits line or page carries every CC BY, BY-SA and BY-ND file with its modification note
- [ ] Video: 5-15 s loop, no audio, poster, AV1 + H.264 + mobile encode, inside the budget, pause control
- [ ] Images: AVIF and WebP, widths and sizes, dimensions set, LCP image not lazy

## 12. Credit

`find-media.mjs` and this reference were written after reading taste-skill's asset finder script (assets.mjs) and its imagery reference (imagery.md), by Leonxlnx, https://github.com/Leonxlnx/taste-skill (MIT License, Copyright (c) 2026 Leonxlnx): the open-collection source list, the honesty order of imagery, licence normalisation and credit lines, the word filter for the museums' loose search, picking a web rendition of a Commons video, and short clips first. Small helpers are adapted from assets.mjs (the stop-word list, the query-word split and on-subject check, the argument tables); the rest of the code and all of the text are new.
