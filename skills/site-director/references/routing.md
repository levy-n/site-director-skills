# Routing: which skill owns what

Read this at stage 0, and whenever a step could be done by more than one skill. This skill routes; it does not copy other skills' procedures. For each related skill: what to take from it, what never to run from it, and how to call it. Precedence when they disagree is in SKILL.md; this file applies it.

## Contents
1. Owner per stage
2. Skill by skill: take, never run
3. Stack and CMS decision (D1)
4. Payload ownership
5. Deploy targets and push rules
6. Skills to invoke by name

---

## 1. Owner per stage

| # | Stage | Owner | site-director hands it | Comes back | Approves |
|---|---|---|---|---|---|
| 0 | Setup | site-director | mode, stack and CMS choice (§3) | D1 in the decision log, pinned versions, environment | - |
| 1 | Business | mediawave-landing-page | the five world questions to add to its questionnaire; the world shot list for its content brief | discovery-output.json, approved proposal, photos (before stage 2) | Nati, then the client |
| 2 | Creative direction | site-director, with pattern-breaker (intake rounds, concept lab, critic milestone 1) and nati-design-prefs (font specimens) | the condensed dossier and the pinned persistent object in `design/BRIEF.md` | the three artifacts, BRIEF, CONCEPT | Nati (Nati and Moriah on mediawave.co.il) |
| 3 | Motion prototype | site-director's assets on pattern-breaker's engine; rive-studio for a drawn or stateful piece | the storyboard rows for the hero and one chapter | a running prototype, the screenshot matrix, a film | Nati |
| 4 | Build | pattern-breaker (foundations, sections in storyboard order); rive-studio; client-content-editor or Payload in Next (§4); mediawave-landing-page for copy strategy, legal pages and SEO | the storyboard as the score; slot constraints; the decision log | the site | - |
| 5 | QA | site-director's merged list (qa.md) with pattern-breaker's scripts, site-gate-audit, impeccable, mobile-ux-fixer, rive-studio's audit, one fresh critic | the three artifacts, the shots, the gates | the QA report | all checks pass |
| 6 | Delivery | mediawave-landing-page (deploy, handoff, monitoring); pattern-breaker (DESIGN.md, portfolio log) | the finished site and its decision log | handoff package, rollback command in `.context/HANDOFF.md` | Nati, per deploy |

Harvest mode (breaking down an award-winning site) uses pattern-breaker's Harvest mode for the films. A harvested moment that Nati picked enters a client project at stage 2, through the eye round (`human-eye.md`). This ruling (Nati, 19.10.2026) overrides pattern-breaker's resource-atlas rule that inspiration is technique-stage only; everything else in that rule stands (principles, not looks).

## 2. Skill by skill: take, never run

**pattern-breaker** (calibrated for Opus 5.5; second in precedence)
- Take: greenfield intake rounds (only what discovery left open), the concept lab and its lanes, probes, critic milestones, foundations (stack pins, the four-layer structure, the foundation gate), the motion engine, every verification script, upgrade mode for redesigns (DIAGNOSIS, `preserve.mjs` baseline and diff), the handoff DESIGN.md and its portfolio log.
- Replace: its root `DECISIONS.md` by `design/design-decisions.rtl.md` (unless the project already has a root `DECISIONS.md` or `DECISIONS.rtl.md`, which then stays the single log); its `design/SCROLL-SCORE.md` by `design/storyboard.rtl.md`.
- Never: let it pick fonts on autopilot (nati-design-prefs decides); open its direction or idea banks before the technique stage; let the concept lab reject the persistent object as a cliche once the brief pins it.

**mediawave-landing-page** (business, compliance, delivery)
- Take: Phase 1 Tier 1 (Q1-Q11 and QIL-1..3) and Tier 1.5 SEO (S1-S6); Phase 0.5 proposal; the content brief with the world shot list, sent right after the proposal so the photos arrive before stage 2; the strategy layer of Phase 4 copy (awareness level, message match, objection-driven FAQ, CTA gender handling) used inside the chapters; 5E legal pages (one slug scheme); 5F SEO and its scripts; its Payload schema and Hebrew admin labels as a base for Next + Payload sites; Phase 7-8 deploy, handoff and monitoring.
- Never run: the Tier 2 design questions (Q11-Q17) and the Q12 palettes; Phase 2 inspiration; Phase 3 design system; the font-researcher and animation-researcher agents; the frontend-super scoring loop; the phase-5 component templates; CSS fade classes that hide content until JavaScript runs; the AOS and stock-Lottie snippets; the StoryBrand section order as page structure; PAS or AIDA examples with invented numbers; the robots.txt block of AI crawlers.
- Verify before use (stale or contradictory in that skill when observed on 2026-10-15; re-check each one before relying on it): Next.js 15 (the client stack is 16.4); Tailwind configs in v3 style labelled v4; Node 18.17 as a floor (pin Node 24 LTS); `@payloadcms/db-vercel-postgres` (Vercel Postgres moved to Neon; check the current Payload Postgres adapter); a Payload v2 seed import (v3 uses `getPayload({ config })`); `vercel.json` env with `@secret` references; VAT 17 % (18 % since 1 January 2025); Amendment 13 dates (in force 14 August 2025); gtag consent granted by default (must be denied until consent); FAQ rich results and self-serving review stars promised as visibility levers; the sitelinks search box; retired Google tools; FID and TTI (INP replaced FID); `inLanguage` on LocalBusiness; `Disallow: /_next/`; the EXIF stripping call that keeps metadata; `discovery-output.json` keys that `generate-schema.py` does not read; three legal slug schemes; the IP-ownership clause that differs between the proposal and the terms.
- Its description also claims "new client site". When both skills load, site-director is the entry point and calls mediawave-landing-page for stages 1 and 6, legal and SEO.

**rive-studio**
- Take: everything about how a Rive piece is designed, built and verified: the interview, sketches, `CONTRACT.md` per piece, a generator script that emits the file and a static rest frame from the same numbers, `rive-probe.mjs --contract`, `rive-audit.mjs`, lazy loading after load and idle and near the element, an `aria-hidden` canvas with the meaning in HTML, a late-load cutoff that shows the rest frame.
- site-director decides whether and where: a storyboard row exists first, and the piece counts in the moment budget.
- Never: a whole scroll story in Rive (pattern-breaker owns that); a stock community file as a brand moment; Rive for ordinary buttons by default (the runtime's wasm must earn its bytes).

**client-content-editor** (static sites whose client edits a few slots)
- Take: Mode A, adding the client as a tenant on the existing multi-tenant platform; the slot map (12 slots at most, approved at its gate); the publish pipeline; the client screen; its verification (cms-preview branch, a unique marker round trip followed by restoring and republishing the originals, the site still serving with the CMS stopped); its Hebrew client guide; its operator CLI for the extreme-content matrix.
- site-director hands it: a slot proposal from the storyboard; the locked list (persistent object, motion assets, the accent's use, chapter structure, masks and cursor are never slots); constraints enforced in code (maxLength per text slot, gallery minimum and maximum, required alt, aspect ratio or focal point where motion depends on geometry); and the rule that the site's image accessor returns width, height and sizes.
- Never: build a second platform; copy its infrastructure identifiers (addresses, account and tunnel IDs) into any file that leaves the machine; trust its version pins without checking the registry (its templates pin Payload 3.88, while the Verified line in §3 pins 3.90.2); tell a client that password reset works by email (the platform has no mail adapter). Read its gotchas file before the first run.

**anthropic-skills:nati-design-prefs** (always-on rules; synced from claude.ai, never edited here)
- Take: fonts chosen by Nati from 3-4 specimens rendered on the real layout and labelled A/B/C/D; its banned-font list (reference it, don't copy it); the dash rule; RTL and LTR isolation; content honesty; the render check before handoff.
- Never apply to websites: its base64 font embedding (for exported documents only; websites self-host woff2 files).

**site-gate-audit**
- Take: the reasoning behind G1-G10, measurement on a preview deployment, the static floor, the measurement rig, its fresh-eyes brief (the gates and the URL, with the job of making the site fail), folded into the one fresh critic of qa.md step 14 so stage 5 never runs two reviewers, ship discipline (preview green, merge, re-run on production, record the rollback).
- Limits: its prerender physics (paint-first mount and the rest of the G3 playbook) fits React + Vite prerendered sites such as mediawave.co.il, not Astro or Next. Its G2 and G9 traps are Cloudflare-specific; translate them on Vercel. Its TBT row says 150 ms; this skill fails at 200 ms and aims for 150.

**impeccable** (keep 3.9.1)
- Take: `harden` for edge cases, `audit` and `critique` as the usability and accessibility half of the self-critique (with the storyboard and decision log as the brief), `scripts/detect.mjs` as a static gate (`node <skills>/impeccable/scripts/detect.mjs --json dist`, by full path because the skill is installed globally), typeset's font-loading guidance, `polish`, overdrive's discipline of 2-3 directions for a single moment.
- Never: `palette.mjs` on a client site (a random seed); its model-picks-the-font procedure; `shape` or `craft` as the main flow (brand anchors and stock photos); crossfade page transitions; a global reduced-motion kill switch; `init` or `document` writing a root DESIGN.md (pattern-breaker's handoff owns it).
- Version: stay on 3.9.1. Upgrading to v4 waits for Nati's explicit approval: v4.5.2 downloads a binary from GitHub releases, installs hooks that run outside tool approval, and calls its own server with telemetry on by default.

**design-loop-router** (late refine and repair only)
- Use: one measured repair pass on an existing section after the three artifacts exist, through `Skill('design-loop-router', '<intent> <file>')`; feed its brief from the storyboard chapter and the decision rows instead of its dials.
- Never: for direction, fonts, palette or motion intensity; as motion QA (its verify takes full-page shots with `captureBeyondViewport: true`, does not prime scroll, pins reduced motion off and has no 1440x700). Never add network calls to it (its offline guarantee).
- MediaWave-hardcoded: its ledger root is fixed to the MediaWave repo, so on a client project the ledger lands in MediaWave's repo; its colour rules encode MediaWave's old sky theme. On a client project pass `--root` to its gate and `--url` to its verify, and accept or avoid the ledger.

**mobile-ux-fixer**
- Use at QA for device defects. Override its fixes with these rules: `overflow-x: clip`, not `hidden`; sticky stages, not pins; no `normalizeScroll` while touch scroll must stay native; content visible without JavaScript; each moment's last frame under reduced motion; `gsap.matchMedia`, not `ScrollTrigger.matchMedia`; refresh on content-height change. Never auto-apply its checks 1.5, 2.3 or 3.5 unmodified.

**frontend-design** (Anthropic's official plugin skill)
- Not installed (observed 2026-10-15): it exists only in the downloaded marketplace and is absent from the skill listing, so it never triggers. Read it directly from `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/frontend-design/skills/frontend-design/SKILL.md`, or install the plugin with Nati's OK.
- Take as a principle layer while the direction is planned: ground the design in the subject's materials and vernacular, open the hero with the subject's most characteristic thing, its list of current AI tells.
- Override: "one orchestrated moment" becomes the 2-3 budget for a scroll story; type is Nati's pick; the palette has one accent with a meaning. Never feed it the MediaWave repo's old watercolour direction.

**frontend-super** (reference only)
- Take: the RTL property map and validation grep (fix its sign error first: entering from the right needs a positive x), the canvas DPR cap, the mobile reference, its JSON score format re-weighted to the Awwwards rubrics.
- Never: its design intake (inspiration galleries, long dashes in the Hebrew labels), aesthetics block, font recommendations, the "CSS replaces Lenis and GSAP" matrix, the stagger default, `100dvh` heroes (use `100svh`), its Lighthouse target, PROGRESS.md.

**pagespeed-optimizer** (legacy React + Vite only)
- Take: for mediawave.co.il and other React + Vite sites, its phases with a Lighthouse run after each; its Hebrew font-subset recipe.
- Never: its 85 target, the Google Fonts print trick, broad `will-change` or `translateZ`, `lottie-react`, its Git Bash job control.

**design-inspiration-to-code** (technique stage only)
- Use after the direction gate to dissect how a reference motion works (frame capture, subagent batches); each result becomes a decision row with a dossier reason.
- Never: palette, type, layout or "source mapping" from other sites; its Hebrew question bank; its hand-off to frontend-super.

**frontend-pro** (optional tooling): a lean CLAUDE.md for the client repo, Chrome DevTools MCP for performance traces. Never its 375/768/1280 viewport set, PROGRESS.md, or design questions.

**claude-design-prompt-builder** (after delivery only): pushes the finished site into Claude Design for brand-matched assets. Its DESIGN.md never overwrites the project's root DESIGN.md.

**creative-seeds** (optional, internal): may be sampled once while directions are generated. Never a gate, never shown to Nati, never the source of a decision.

**skill-auditor**: run after any edit to this skill or the skills it calls; it is not part of a client build.

## 3. Stack and CMS decision (D1)

Decided at stage 0, logged as D1 (axis "טכני", items "אין", approved by Nati). Pin animation libraries exactly, with every GSAP plugin on the core version.

| Situation | Stack | CMS | Set up by | Deploy |
|---|---|---|---|---|
| Default: a brand or service site; the client edits a few fields, rarely | Astro 7.3 static, Tailwind 4.3, gsap 3.15.0, lenis 1.3.26, the pattern-breaker engine | client-content-editor (shared multi-tenant Payload on the VPS; content baked in at build) | pattern-breaker foundations + client-content-editor Mode A | Cloudflare Pages, deployed by the platform |
| The CMS must live inside the site: many editors or roles, structured content beyond a dozen slots, drafts and preview, stored form submissions, or a client already on Next and Vercel | Next.js 16.4 + React 19.3 + Payload 3.90 (@gsap/react 2.1.2 for motion in client components) | Payload inside the Next app | mediawave-landing-page's Payload setup, with its stale items verified (§2) | Vercel |
| Something must persist across pages (a canvas, a shared-element transition) | Astro with ClientRouter and `transition:persist`, or Next | as in the rows above | pattern-breaker foundations | as above |
| One campaign page, no CMS | Astro anyway (one toolchain) | none | pattern-breaker | Cloudflare Pages or Vercel |
| Redesign of an existing site | keep its stack unless routing is rebuilt anyway | keep | pattern-breaker upgrade mode | keep |
| mediawave.co.il | React 18 + Vite + puppeteer prerender | none (Sanity only at `/studio`) | the MediaWave repo | Cloudflare Pages |

Choosing between the first two rows: client-content-editor's success test is a non-technical owner replacing an image from the phone, first try, in under two minutes. If the client's real needs fit 12 slots or fewer that change rarely, take the default. Otherwise Next + Payload, and say why in D1.

Verified 2026-10-15 (npm registry): astro 7.3.8, next 16.4.1, react 19.3.1, payload 3.90.2 (peer next >=16.3.3 <17, react ^19), tailwindcss 4.3.3, gsap 3.15.0 (Standard no-charge licence, all plugins free, not MIT), @gsap/react 2.1.2, lenis 1.3.26 (2.0 only as a dev build), @rive-app/react-canvas 4.36.0. Toolchain: pattern-breaker pins Node 24 LTS; Astro 6 needs Node 22.12 or newer, and an Astro 7 dependency and Lighthouse 13.5 need Node 22.19 or newer; the build machine ran Node 22.14 that day. Astro 7 runs on Vite 8 with the Rust compiler, so markup must be valid HTML.

## 4. Payload ownership

Two architectures exist, and each project uses exactly one (D1):

- **Static site:** client-content-editor owns Payload. It is one shared platform for all MediaWave clients; a client site becomes a tenant. Never stand up a second platform. A client edit triggers a rebuild and redeploy, not a live DOM change, so motion code must measure the rendered layout at runtime and survive any length the slot constraints allow.
- **Next site:** Payload lives inside the Next app, set up from mediawave-landing-page's Payload references and collection templates. site-director adds what those lack: access control, an `afterChange` hook that revalidates the affected pages (its handoff promises edits within seconds), maxLength guards, required alt text, image width and height, and blocks for chapters and the persistent object's states where the client may edit them. The smooth-scroll component mounts only in the site's own layout, never in Payload's admin route group.

Either way, the extreme-content matrix in qa.md runs after the CMS is wired, and the engine's content-height watch keeps ScrollTrigger positions right after late content.

## 5. Deploy targets and push rules

| Target | Used for | Specific rules |
|---|---|---|
| Cloudflare Pages | static sites on the client-content-editor platform (it builds on the VPS and deploys); mediawave.co.il (builds `main` on push) | 25 MiB per asset; the zone's AI-crawler setting can block crawlers at the edge, so test G2 on the custom domain; `pages.dev` previews carry `noindex`; MediaWave's `.co.il` domain is registered at box.co.il and only its DNS zone is on Cloudflare |
| Vercel | Next.js + Payload sites | Postgres through Neon; secrets through the dashboard or CLI, never `@secret` references in `vercel.json`; preview deployment first |

Rules for every deploy:
1. Deploy only with Nati's explicit approval, given for that deploy.
2. Before pushing to production, count what will ship: `git rev-list --count origin/main..HEAD`.
3. Tag a rollback point first and write the rollback command into `.context/HANDOFF.md`.
4. Preview gates green, then production, then re-run the gates on production and confirm the deploy by the served asset hash.
5. MediaWave pushes only through the GitHub account `mediawave-dev`: `git -c credential.helper= -c credential.helper='!gh auth git-credential' push`. The credential manager may serve a stale token for another account and get 403. Never switch gh accounts without Nati's OK. For a client repo, the account and the host are decided per client and logged as a technical decision.

## 6. Skills to invoke by name

The skill listing has a size budget, so a skill can appear in it with no description, and a skill without a description never triggers on its own. Observed 2026-10-15: client-content-editor, design-loop-router and frontend-pro had none, and mediawave-landing-page and site-director itself had none in some listings that day. Always call these with the Skill tool by their exact names: `mediawave-landing-page`, `client-content-editor`, `design-loop-router`, `frontend-pro`, `pattern-breaker`, `rive-studio`, `site-gate-audit`, `impeccable`, `mobile-ux-fixer`.

nati-design-prefs is listed as `anthropic-skills:nati-design-prefs`, and its description names documents and posters, not websites, so it does not trigger during a site build: call it explicitly at the font step and whenever copy is written.

frontend-design cannot be called at all while its plugin is not installed: read its SKILL.md by path (§2) at the direction step.

Announce each call in one line ("Running pattern-breaker's concept lab now"); ask first only before a heavy step (a fresh critic agent, a multi-agent evaluation) or when two skills compete.
