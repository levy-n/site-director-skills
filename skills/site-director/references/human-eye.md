# The human eye: Nati sets the level

Read this at stage 2 (the eye round, beside the world round), at the stage 3 and stage 5 gates (side by side), and whenever Nati brings a site or a moment he loves.

## Contents

1. Why
2. Who does what
3. Where to hunt
4. The moment library and the moment card
5. The eye round
6. The side-by-side gate
7. What transfers and what never does

## 1. Why

Nati's ruling (19.10.2026): award-level precision comes from a human eye, not from a prompt. A model left alone reaches for the statistically safe choice even when told not to, and it cannot tell "good" from "on another level". Nati can. So the eye picks the level and the moments; this skill dissects them, translates them into the client's world, builds them and proves them side by side.

The world dossier still decides what the site is about (that keeps it original). The moments Nati picks decide how good it has to feel.

## 2. Who does what

| Nati | This skill |
|---|---|
| Picks 3-5 moments he loves and says in one line what he feels | Films the exact range, measures it, reads the code when it is open |
| Picks which moment becomes the hero | Translates the mechanic into the client's world: 2-3 options from dossier items |
| Judges ours against the reference, side by side | Iterates on the one thing he names, re-films, logs the verdict |

Never: the skill picks the references for Nati, or declares its own build "SOTD level". A critic score informs; Nati's side-by-side verdict decides. If Nati asks for candidates, offer them from the library and from award pages, labelled as candidates, and let him pick.

## 3. Where to hunt

Send Nati this list with the eye-round question. Fifteen minutes, on the phone first, one moment per site at most: the moment that made him stop scrolling.

| Source | Good for | Code |
|---|---|---|
| Awwwards: Site of the Day pages and the Inspiration clips (awwwards.com/inspiration/) | each winner's featured elements as short clips, plus the jury's scores | closed |
| Godly (godly.website) | whole sites shown as video: the fastest scan of motion | closed |
| The FWA (thefwa.com) | another jury, more experimental | closed |
| GSAP showcase (gsap.com/showcase) | sites built on our own engine, so every moment there is buildable with our stack | closed |
| Codrops (tympanus.net/codrops) | the "how": demos with code, and case studies written by winning teams | open for most demos; check each licence |
| Rive community files (rive.app) | characters and objects that react to input; remixable | per file licence |

Open-source sites with a verified award (checked 19.10.2026):

| Site | Award | Code |
|---|---|---|
| Mr. Pandas Paper Portfolio, solo developer Andrew Woan | Awwwards SOTD 11.3.2026, 7.44 (`design/research/02-awwwards.md` in the MediaWave repo) | github.com/andrewwoan/mr-pandas-psychologically-safe-portfolio (check the licence before reusing code) |
| Bruno Simon, folio 2025 | Awwwards SOTD 21.1.2026, 8.11, and SOTM January 2026 | github.com/brunosimon/folio-2025, MIT |

Open code at this level is rare: studios keep theirs. Solo developers sometimes publish. Before adding a site here, confirm both the award page and the repository's licence. Repositories titled "awwwards website" are mostly course clones; never list them.

## 4. The moment library and the moment card

The library is shared by every project: `G:/Projects/moment-library/INDEX.md`, with films in `G:/Projects/moment-library/films/<slug>/`. It lives outside the skills and outside client repositories (films are large and are someone else's work). Each entry:

```markdown
## <slug> · <date> · picked by Nati
- URL:
- Where: <section, scroll position, or seconds into the film>
- Nati's line: "<what he feels, in his words>"
- Tags: scroll-linked object | transition | reveal | character | typography | cursor | sound
- Code: open (<repo>, <licence>) | closed
- Harvest: <path to the harvest file> | not yet
- Mechanic: <one sentence, no noun from the reference> | not yet
- Used in: <project, chapter, side-by-side verdict> | not yet
```

Nati fills the first four lines (a URL and his line are enough); the skill fills the rest.

## 5. The eye round (stage 2)

1. **Ask once** for 3-5 moments, from the library or new, with the source list from section 3. Wait for his picks; do not hunt for him.
2. **Harvest the site's visual DNA first, then the moment.** Fill the reference DNA sheet (`direction-proof.md` §2: ground, material, type scale, structure, density, imagery, motion signature, opening) for every site Nati picked: the mechanics are not the level, the DNA is. Then:
   **harvest each moment, that range only:** run `sotd-harvest.md` steps 2-9 on it (film at 390 and 1440, the console check, `document.getAnimations()`, `ScrollTrigger.getAll()`). Open code: read the files that drive the moment and record the numbers (scroll distance per unit of motion, easing, lag, what is linked to what), with file paths. Closed code: read the bundle as text per `sotd-harvest.md` section 1 and mark what is inferred. A material, a shader or any WebGL moment: read its shaders and shoot it with the GPU before building anything (`fidelity.md` §2-4); screenshots alone cost six rejected rounds on mediawave.co.il.
3. **Write the mechanic** in one sentence with no noun from the reference, then test it: could it produce three visibly different sites? Example: "a part of the object turns in step with the wheel, so the reader feels they are driving it."
4. **Translate:** the mechanic times one dossier item is a chapter's moment. Show Nati 2-3 translations as stills or a 10-second sketch; he picks. Example for MediaWave (tape conversion): a cassette's two reels turn with the scroll wheel, and the tape winds from one reel to the other as the page is read.
5. **Log it:** the moment slug, the translation and Nati's pick go into the decision log and into the library entry ("Used in").

## 6. The side-by-side gate (stage 3, again at stage 5)

1. Film our moment at the same viewport and scroll speed as the reference (`scroll-film.mjs --video`), 390 first.
2. Put the two films side by side:

   ```bash
   ffmpeg -i ref.mp4 -i ours.mp4 -filter_complex "[0:v]scale=-2:844[a];[1:v]scale=-2:844[b];[a][b]hstack" side-by-side.mp4
   ```

   For a material (dots, grain, squares, an edge), also put zoomed stills side by side: the same crop of both, 4x nearest neighbour (`<skill>/scripts/gpu-frames.mjs --zoom`).
3. Send Nati the side-by-side file and ask one question: same level, or not yet and what is missing (one line).
4. "Not yet": fix that one thing, re-film, ask again. After three rounds, offer to drop the moment or pick another.
5. Record the verdict in the library entry.

## 7. What transfers and what never does

- Transfers: the mechanic, the numbers that make it feel right (timing, easing, ratio of scroll to motion), and the reason behind it.
- Never transfers: palette, fonts, layout, illustrations, models, copy (`sotd-harvest.md` section 1). A copied moment also fails the swap test.
- Open code under a permissive licence may be reused with its licence notice. The visual still stays with its owner: translate the moment, reuse at most the technique.
