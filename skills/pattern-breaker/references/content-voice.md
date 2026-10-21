# Content and voice: copy that sounds like a person, proof that is real

Read this before writing any visible text, and when reviewing copy in the critic pass. Copy slop is as visible as visual slop, and on a scroll-story site the words are the script the motion performs.

## Contents
1. Standing rules for Nati's projects
2. Rules that make a site feel human-made
3. Proof architecture
4. Motion performs the sentence
5. Hebrew register
6. Copy patterns to replace
7. A line-by-line review procedure

---

## 1. Standing rules for Nati's projects

These are the user's locked preferences (recorded 2026-07). They apply to every site unless a client explicitly asks otherwise.

- **Outcomes, not technology.** Never name the stack or use jargon in visible copy (React, SEO, UX, רספונסיבי, אופטימיזציה, SSL). Translate every feature into a plain benefit: "אתר מהיר שלא נתקע", "נראה מצוין בטלפון ובמחשב".
- **Dugri Israeli Hebrew.** Short, direct, no hype, no filler adjectives, no triads, no em-dashes, no "לא X אלא Y" constructions. It should sound like a person said it, not like a translation.
- **Benchmark line:** "ליווי אישי / מדברים ישירות עם המפתח, בלי מתווכים". Bring every line to that level of plainness and specificity.
- **Never invent proof.** No made-up client counts, testimonials or numbers. Only verifiable facts; label demos and illustrations as "הדגמה".

## 2. Rules that make a site feel human-made

Derived from liavmatzri.co.il, measured across six pages of its copy (see masterpiece-anatomy.md for context).

1. **Prove before you claim.** Put real people (faces, voices, work) in the first scroll after the hero, before any list of services.
2. **Outsource every compliment.** The owner describes actions and promises; clients supply the adjectives. Target: zero self-superlatives in owner copy.
3. **One named person, honest pronouns.** "I" when the author will call back, "we" when a team member will. The pronoun tells the visitor who answers.
4. **Anchor the promise in a social moment, then call it back.** The reference's promise is "a site you'll be proud to send to your clients"; it returns in step 3 ("now you can send the link with pride") and on another page. Bookend the H1 in the closing section.
5. **Use the customer's actual words.** Quote the questions customers ask all day; write FAQ entries as the visitor's own doubts in the first person ("יש לי אינסטגרם. זה לא מספיק?"); make the submit button what the visitor would say ("בוא נדבר", "שיחזרו אליי").
6. **Units and mechanisms instead of adjectives.** Weeks, one business day, a 30-minute call, 8 questions, 1 minute. Pair each claim with how it is achieved.
7. **State limits out loud.** "Google decides the ranking; what's in my hands is that nothing on the site gets in its way." Explain how price is set instead of hiding it. Label dramatisations.
8. **Name the enemy concretely.** A visible list of what generic looks like, a parody, a self-check the visitor can take. Abstract enemies ("outdated solutions") persuade nobody.
9. **One idea per section.** If a section needs two ideas, it is two beats.
10. **Short sentences, headlines end with a period, no performative punctuation.** About 5-7 words per sentence. Exclamation marks and emoji only inside dramatised dialogue or a success message.
11. **Two registers when the brand supports it.** A cool index register for labels, counts and promises, and a warm native register for persuasion. The contrast makes the prose feel personal. (The reference uses English mono for labels; for another brand the cool register might be numerals, units, or a technical vocabulary of the trade.)
12. **Specifics no template could invent.** A neighbourhood, a family origin, a real customer type, real domains under screenshots, the name of the kiln, the year of the machine.
13. **Segment the whole story, not just the H1.** When there are several audiences, change the pains, the proof subset, who calls back, the FAQ and the success message per audience.

## 3. Proof architecture

Proof is the strongest anti-template material because it can't be generated. Order of preference:

1. Real video of customers, unedited (if labelled "unedited", it must be uncut and uncaptioned).
2. Real photos of the owner, the place, the hands, the work.
3. Screen recordings of real work, inside device frames, with live links.
4. Named reviews with a source (Google, a date, a first name and town).
5. Numbers with a source and a date. Round unsourced numbers ("500+", "99.9 %", "24/7") are a known AI tell; prefer an exact count ("312 בוגרים מאז 2019").

Attach proof to objections: after each pain or doubt, show the one piece of proof that answers it.

When there is no proof yet (a new business), don't fake it. Use the founder's own story, the process shown honestly, or the work in progress, and say so.

**Inherited proof is unverified until the owner confirms it.** In an upgrade, every testimonial, rating, client count and round stat already on the site goes into DIAGNOSIS under "proof to confirm", with its evidence (a stock or placeholder avatar, a generic name, no source), and intake round 1 asks which items are real (the הוכחות question). Unconfirmed items do not ship in the upgraded page. In autopilot, remove the items with placeholder evidence (pravatar or randomuser avatars, John Doe-style names, unsourced round stats), keep the section and its anchor alive with honest content (how the work is done, a practical tip, a link to the Google Business reviews) plus a marked slot for confirmed quotes, and record each removal in `intended.json` and under Assumed. Items without placeholder evidence stay in the candidate, listed under Assumed, and are confirmed with the owner at the production-deploy gate. Never re-skin unverified proof behind a "to confirm" note: measured in an upgrade eval, the run that kept three placeholder testimonials verbatim behind such a note shipped them, while the unaided baseline removed them and left a ready slot.

## 4. Motion performs the sentence

Write the sentence first, then the move (moves.md). Each signature move has a content line it acts out:

- "Months became days" → a word struck through while a dot crawls a long track; the track shrinks; the new word fills.
- "AI tools produce sameness" → a generic prompt types itself and grows a generic three-box skeleton labelled "another site that looks like everyone else".
- "You talk directly with me" → a chat advances with scroll, with a typing pause before each reply.
- "Not everyone knows what to build" → a headline several screens wide that takes real scroll time to cross.

If you can't name the sentence a move performs, it is decoration; cut it or replace it with a quiet beat.

## 5. Hebrew register

- Plural "you" (אתם) for general audiences; singular only when the brand is intimate and the audience is one person (a coach, a therapist), and then consistently.
- Avoid calques from English marketing: "להעצים", "לקחת לשלב הבא", "פתרונות" for everything, "חוויית משתמש" in visible copy.
- Avoid the over-formal register of AI Hebrew: "אנו", "הנכם", "באמצעות", "על מנת ש" in marketing copy. Prefer "אנחנו", "אתם", "עם", "כדי ש".
- Numbers and units stay as numerals ("3 שלבים", "תוך 24 שעות").
- Mixed-direction strings (English brand names, prices, phone numbers inside Hebrew) need `dir="ltr"` spans or `unicode-bidi: isolate` (hebrew-rtl.md).
- **AI-Hebrew tells a native copywriter almost never writes** (each comes from an English phrase pushed through translation): "כאן אנחנו נכנסים לתמונה", "משנה את כללי המשחק", "בהיר כקריסטל", "בעולם של היום" / "בעידן הדיגיטלי", "בואו נצלול", "המסע שלכם", "המקום שבו X פוגש Y", "שילוב מושלם של", "למנף", "לשחרר את הפוטנציאל", "לעשות את ההבדל", "חשוב לציין", "יתרה מכך", "בסופו של יום". Delete the frame and keep the claim.
- **Translation-sounding density:** "עבורכם" (say "לכם"), "באופן מקצועי" (show how), "על מנת ל" ("כדי ל"), "לבצע הזמנה" ("להזמין"), "מאפשר לכם ל" (let the visitor do the verb), "מגוון רחב של" (give the number and the list). One is normal; several in a page is the tell.
- **One address for the whole site.** "השאירו פרטים ונחזור אליך" mixes plural and singular in one sentence, a sign of stitched templates. Pick plural אתם (gender-inclusive) and use "אני" only where one person really calls back. No slash forms ("לקוח/ה").
- **Punctuation:** no em dashes in Hebrew owner copy; a plain hyphen rather than the typeset maqaf (ב-2025, never the maqaf U+05BE between the letter and the number) in small-business copy; straight quotes, never low quotes („…").
- **The anti-AI voice is a voice too.** "בגובה העיניים", "בלי בולשיט", "בלי מילים גדולות", "דוגרי" announce honesty instead of showing it. Show it: a stated limit, how the price is set, a named client.

## 6. Copy patterns to replace

| Generic | Replace with |
|---|---|
| "הפתרון המושלם עבורך" | what actually changes for the customer, in one plain sentence |
| "לקחת את העסק לשלב הבא" | the concrete next state ("לקוחות חדשים מגיעים גם בלי המלצה") |
| "שירות מקצועי ואמין" | a mechanism ("עונים בוואטסאפ תוך שעה בימי עבודה") |
| "ניסיון של 15 שנה" | one story from those years, or the count of something specific |
| "צרו קשר" / "Get started" | what the visitor would say ("בוא נדבר", "שלחו לי את הפרטים") |
| "Unlock / Elevate / Seamless" | the verb that describes the real action |
| "Not just X. It's Y." | a direct statement of Y |
| Three-noun taglines | one sentence with a subject and a verb |
| "500+ לקוחות מרוצים" | an exact, sourced number, or a named customer quote |

## 7. A line-by-line review procedure

For each visible line, ask in order and fix the first "no":

1. Could a competitor in the same city use this line unchanged? (It should be no.)
2. Does it name a feature or technology instead of an outcome? (It should be an outcome.)
3. Would an Israeli say it out loud like this, to a friend?
4. Is every number real and sourced, and every demo labelled?
5. Is there a self-compliment that a client should be saying instead?
6. Is there a list of three: nouns, verbs ("רושמים, מדווחים וסוגרים") or parallel clauses ("מי ש..., מי ש..., ומי ש...")? Keep the one that matters, or turn a factual inventory into a plain list.
7. Is it longer than it needs to be? Cut the first and last words and reread.

Slop-scan catches the mechanical part (buzzwords, clichés and calques in Hebrew and English, translationese density, mixed address, template section headings, manufactured contrast, round stats, stock CTAs, default form messages). The judgment part is yours.
