# Routing reference

## 1. Decision procedure

Run the questions in order. **First match wins — stop asking.** Never score, never
combine, never route to two classes. A request that trips Q0 leaves this skill entirely.

| # | Question | Class if yes |
|---|---|---|
| Q0 | Did the user name one impeccable verb and ask for nothing past it? | **not ours** — plain impeccable call (§5) |
| Q1 | Is this about Lighthouse scores, bundle size, load time, or a slow site? | **DELEGATE-perf** |
| Q2 | Is the complaint bound to a phone — and only a phone? | **DELEGATE-mobile** |
| Q3 | Is this a pre-ship / pre-handover / whole-site gate audit? | **DELEGATE-gate** |
| Q4 | Does it ask to write design facts down (docs, tokens, rules)? | **DOCUMENT** |
| Q5 | Does it demand proof or measurement of the current state, with no change requested? | **VERIFY** |
| Q6 | Is it a question about quality rather than an instruction to change? | **OPINION** |
| Q7 | Does it name a concrete, observable defect? | **DEFECT** |
| Q8 | Does it ask for a different register or volume, with no defect named? | **TONE** |
| Q9 | Does something already exist and is it judged bland, generic, or template-like? | **GENERIC** |
| Q10 | Otherwise — something must be created that does not exist yet | **NEW** |

Q0–Q3 exist to protect other owners. They come first on purpose: this router must lose
those arguments, not win them.

## 2. The ten classes

Leg codes: **T** = taste layer (`references/taste-core.md`), **I** = impeccable,
**B** = browser measurement (Puppeteer, 320/390/768/1440 + axe + named-rule gate).

| Class | Meaning | Legs, in order | impeccable verb |
|---|---|---|---|
| NEW | A section, page or component that does not exist yet | T → I → B | `craft` (attended only) · `shape` first if the requirement is vague |
| GENERIC | It exists, it works, it has no character | T → I → B | `bolder`, then `delight` if still flat after one browser pass |
| VERIFY | Prove the current state at four widths; change nothing | B (+ T for the rule gate) | `audit` |
| DEFECT | A named, observable failure | B → I → B | per §3 sub-map |
| TONE | Register shift: louder, quieter, warmer, more serious | T → I → B | `quieter` · `bolder` · `polish` |
| DOCUMENT | Capture what the design already is | I → T | `document` · `extract` |
| OPINION | Judgement asked for, no change authorised | T → B (never I) | none unattended; `critique` only when the user is present |
| DELEGATE-gate | Ten-gate pre-ship audit | — | — |
| DELEGATE-mobile | Phone-only defect | — | — |
| DELEGATE-perf | Score, bundle, speed | — | — |

### Cue phrases

| Class | Hebrew cues | English cues |
|---|---|---|
| NEW | "תבנה לי סקשן", "צריך עמוד תודה", "אין לנו X, תעשה", "מאפס", "תוסיף בלוק של" | "build a section", "we need a page for", "from scratch", "add a block that" |
| GENERIC | "נראה גנרי", "נראה כמו תבנית", "משעמם", "חסר אופי", "כמו כל אתר", "תעשה משהו", "זה סתם קופסאות" | "looks generic", "template-y", "boring", "no personality", "AI slop", "do something with it" |
| VERIFY | "תוכיח שזה עובד", "תראה לי צילומי מסך", "תבדוק שזה באמת בסדר", "לפני ואחרי", "עבר או לא עבר" | "prove it", "show me screenshots", "before and after", "did it actually pass" |
| DEFECT | "לא קריא", "יוצא מהמסך", "יש גלילה לצדדים", "צר מדי ב-320", "לא רואים פוקוס", "קופץ", "נדבק", "האנימציה תקועה" | "unreadable", "overflows", "horizontal scroll", "cramped at 320", "no focus ring", "janky", "stuck" |
| TONE | "יותר רגוע", "צעקני מדי", "יותר נועז", "יותר יוקרתי", "פחות אגרסיבי", "רועש" | "calmer", "too loud", "bolder", "more premium", "dial it down", "make it shout" |
| DOCUMENT | "תעד את זה", "תכתוב ל-DESIGN.md", "תוציא את הטוקנים", "תרשום את הכללים" | "document this", "write it into DESIGN.md", "extract the tokens", "record the rules" |
| OPINION | "מה דעתך", "איזה עדיף", "זה טוב?", "תגיד לי בכנות", "מה לא עובד פה" | "what do you think", "which is better", "is this good", "be honest", "what's wrong here" |
| DELEGATE-gate | "לפני מסירה ללקוח", "בדיקת שערים", "עשר שערים", "בדיקה לפני עלייה לאוויר" | "gate check", "run the gates", "pre-launch audit", "before we hand it over" |
| DELEGATE-mobile | "נראה רע בטלפון", "קופץ בגלילה במובייל", "תקן מובייל", "שורת הכתובת קופצת" | "broken on my phone", "fix mobile", "scroll jump", "address bar jump" |
| DELEGATE-perf | "האתר איטי", "ציון לייטהאוס", "ביצועים", "הבאנדל גדול", "LCP", "CLS" | "lighthouse score", "slow site", "bundle size", "core web vitals", "TBT" |

Hebrew cues carry more weight than English ones here: the user writes Hebrew by default,
and a Hebrew phrase that fires a cue is almost never accidental.

## 3. DEFECT sub-map

Symptom, as reported or as the browser leg measured it, maps to exactly one verb. If the
browser leg produced the symptom, trust it over the user's wording.

| Symptom | Verb | Notes |
|---|---|---|
| Contrast below 4.5:1, washed-out text, sky used as a text colour | `colorize` | This is the Sky-Ink Rule failing. Fix moves text to ink/navy; never darken the sky fill into a new accent. |
| Horizontal overflow, content cut off, cramped or colliding at 320 | `layout` | Use when the structure itself is wrong at every width. |
| Reads fine at 1440, breaks only at 320/390 | `adapt` | Use when the desktop composition is correct and only the small-width behaviour is missing. |
| Confusing label, vague error text, unclear CTA, dead-end empty state | `clarify` | Hebrew copy only; keep dugri, outcome-first, no tech jargon. |
| Missing focus ring, keyboard trap, unlabelled control, axe violation | `harden` | axe findings from the browser leg feed straight in as the input list. |
| Jank on scroll, layout thrash, animation that stalls the main thread | `optimize` | Only for motion/paint cost inside a component. Whole-site speed is DELEGATE-perf. |
| Motion absent, wrong easing, entrance that feels dead or wrong | `animate` | Output must import `m`, and take easing only from `src/config/motion.ts` (`EASE_BRAND`). |
| Heading levels flat, size ramp wrong, line length or leading off | `typeset` | Hebrew: no italic, no letter-spacing, leading 1.7–1.8. |
| Too many accents, competing emphasis, decorative noise | `quieter` | One-Accent Rule: sky is the only accent; navy is structure, never an accent. |
| Flat, no focal point, nothing earns attention | `bolder` | If it fires twice on the same target, the real class was GENERIC — re-route. |

Ambiguous symptom with two candidate verbs: run the browser leg **first**, then pick the
verb whose measurement actually failed. Never guess a verb before a measurement exists.

## 4. Tie-breaking

1. **Ordering beats similarity.** If a request matches two classes, the one with the lower
   question number in §1 wins. This is mechanical and needs no judgement.
2. **Exception — same question number.** Only DEFECT (Q7) can hold two competing symptoms.
   Resolve with the browser leg, per §3.
3. **Exception — genuinely underspecified.** If the request is short enough that Q7, Q8 and
   Q9 all plausibly fire ("זה לא טוב, תסדר"), do not guess. Ask exactly one question, offer
   2–3 options, then route on the answer:

   > מה בדיוק לתקן פה?
   > (1) יש משהו שבור — לא קריא / יוצא מהמסך / לא נגיש
   > (2) זה עובד אבל נראה גנרי — צריך אופי
   > (3) הטון לא נכון — צעקני מדי או שקט מדי

   English form: "Which is it — (1) something is broken, (2) it works but has no character,
   (3) the register is wrong?"

4. Ask that question **once per run**. If the answer is still ambiguous, take DEFECT and let
   the browser leg decide — a measurement is cheaper than a second round of questions.
5. Never ask a clarifying question when the class is a DELEGATE. Hand off immediately.

## 5. Anti-collision — requests that are not ours

| Owner | Hebrew cues | English cues | Handoff line to print |
|---|---|---|---|
| `site-gate-audit` | "לפני מסירה ללקוח", "בדיקת שערים", "עשר שערים", "האתר מוכן?" | "gate check", "run the gates", "pre-launch audit", "is the site ready to ship" | "זה שער ייצור מלא, לא סבב עיצוב — מעביר ל-site-gate-audit." |
| `mobile-ux-fixer` | "נראה רע בטלפון", "קופץ בגלילה", "שורת הכתובת", "תקן מובייל" | "broken on my phone", "scroll jump", "viewport height", "fix mobile" | "זו תקלת מובייל ייעודית — mobile-ux-fixer מטפל בזה." |
| `pagespeed-optimizer` | "לייטהאוס", "ציון", "איטי", "באנדל", "LCP/CLS/TBT" | "lighthouse", "score", "slow", "bundle", "core web vitals" | "זה ביצועים ומדידת ציונים — pagespeed-optimizer מטפל בזה." |
| plain `impeccable` | "תריץ polish על ההירו", "תעשה harden לטופס" | "run polish on the hero", "just run harden on the form" | "פועל ישירות עם impeccable — אין צורך בלולאה." |

Strictness rules:

- A user who names a verb has already routed. Do not wrap a named single verb in a loop,
  do not add a browser leg they did not ask for, do not open a run ledger.
- A phone complaint that is *also* a contrast failure at every width is DEFECT, not mobile.
  The mobile owner takes it only when the defect is phone-specific.
- "האתר איטי" is always perf, even when the cause turns out to be an animation. Report the
  suspicion in the handoff line; do not act on it.
- If the user rejects a handoff and insists this skill runs it, comply, but say once which
  owner would have done it better.

## 6. Worked example

**Request:** `הסקשן הזה נראה גנרי, תעשה משהו` (with the Services section on screen)

| Step | Result |
|---|---|
| Q0 | No verb named. Continue. |
| Q1–Q3 | No score, no phone, no gate language. Continue. |
| Q4–Q6 | Not documentation, not a proof request, not a question — it is an instruction. Continue. |
| Q7 | No observable defect named. "גנרי" is a judgement, not a symptom. Continue. |
| Q8 | No register named — not "רועש", not "רגוע". Continue. |
| Q9 | The section exists and is called generic. **Match — GENERIC. Stop.** |

Route: **T → I → B**, verb `bolder`, target `src/components/sections/Services.tsx`.

1. **T** — read the taste layer, then PRODUCT.md and DESIGN.md. Extract the constraints that
   bound this change: sky is a fill only, no warm hexes, one accent, no static underlines,
   `m` imports, `EASE_BRAND` easing.
2. **I** — from the project root, absolute skill path, `bolder` on the Services section with
   the constraint list handed in as the brief. Unattended-safe: `bolder` asks nothing.
3. **B** — Puppeteer at 320/390/768/1440 on `/`, plus the axe pass and the named-rule gate.

Expected artifacts under `G:/Web-Dev/MediaWaveIsrael/.design-loop/<runId>/`:

| Artifact | Content |
|---|---|
| `ledger.md` | class GENERIC, verb `bolder`, target file, constraint list, iteration count |
| `before/*.png` | four widths, captured before impeccable ran |
| `after/*.png` | four widths, same routes, same scroll positions |
| `axe.json` | axe results, before and after, diffed |
| `rules.json` | named-rule gate: warm-hex scan, `motion` import scan, easing-source scan, sky-as-text scan, localStorage scan for the accessibility widget |
| `verdict.md` | pass/fail per gate; on any fail, the next verb and a second iteration |

Loop exit: no axe regression, no named-rule violation, no new overflow at 320, and the after
screenshots differ visibly from the before ones. A run with identical screenshots is a failed
run, not a finished one — report it as such rather than claiming done.
