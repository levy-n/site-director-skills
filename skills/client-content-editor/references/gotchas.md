# Twenty three failures, and how to avoid repeating them

Every item here cost real time on a live build. They are ordered by how early
they bite. Most fail **silently**: the config looks right, the build succeeds,
and the damage only shows up when the client is looking at their own website.

---

## 1. `sharp` is not a peer dependency

**Symptom:** `imageSizes` produces nothing. No error, no warning. The client
uploads an 8MB phone photo and the site serves 8MB.

**Cause:** `npm view payload peerDependencies` returns only `graphql`. Payload
takes sharp as an explicit injection.

```ts
import sharp from 'sharp'

export default buildConfig({
  sharp,          // without this line, imageSizes is a no-op
  // ...
})
```

**Verify by counting, never by reading config:**
```bash
ls -la /path/to/media/ | grep <basename>
# a 184KB JPEG should yield three WebP files, roughly 33KB / 69KB / 97KB
```

---

## 2. `formatOptions` at the top level does not convert the sizes

**Symptom:** three derivatives generated, none of them WebP.

**Cause:** formatting is per size. A top-level `formatOptions` does not cascade.

```ts
imageSizes: [
  { name: 'mobile',  width: 640,  formatOptions: { format: 'webp', options: { quality: 78 } } },
  { name: 'tablet',  width: 1024, formatOptions: { format: 'webp', options: { quality: 80 } } },
  { name: 'desktop', width: 1920, formatOptions: { format: 'webp', options: { quality: 82 } } },
]
```

Verify with `file -b --mime-type` on the output, not by reading the config back.

---

## 3. Missing `@payloadcms/next/css` leaves the whole admin unstyled

**Symptom:** the login form is bare HTML. Inputs have default borders, the submit
button is transparent and 20px tall. It looks like a broken deployment.

**Cause:** `src/app/(payload)/layout.tsx` must import Payload's stylesheet. It is
easy to omit when hand-building the app router files instead of scaffolding.

```ts
import config from '@payload-config'
import '@payloadcms/next/css'        // <-- this
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap.js'
import './custom.scss'
```

**Why it is dangerous:** you start writing custom CSS to fix "layout problems"
that are really just a missing stylesheet, and you build a pile of overrides that
then conflict once the real CSS loads. Check for it before styling anything:

```js
[...document.styleSheets].map(s => { try { return s.cssRules.length } catch { return -1 } })
// Payload's sheet contributes several hundred rules. Two small sheets means it is missing.
```

---

## 4. Hiding the nav collapses the content to zero width

**Symptom:** after fixing #3, the client's screen renders 32px wide, text
wrapping one letter per line.

**Cause:** `.template-default` is a two column grid, `[nav] [content]`. On mobile
Payload sets `--nav-width: 100vw` because the nav is a full-screen drawer.
`display: none` on the nav removes it from grid flow, so the content div slides
into the nav's zero-width column.

```scss
body.mw-is-client .template-default {
  grid-template-columns: 1fr !important;
  grid-template-areas: none !important;
}
body.mw-is-client .template-default__wrap {
  grid-column: 1 / -1 !important;
  width: 100% !important;
  min-width: 0 !important;
}
```

Measure `grid-template-columns` on the parent before guessing. It reads
`"0px 390px"` when this is happening.

---

## 5. Next.js version range excludes the obvious choice

**Symptom:** peer dependency conflict, or subtle runtime breakage.

Payload 3.88's range is:
```
>=15.2.9 <15.3.0 || >=15.3.9 <15.4.0 || >=15.4.11 <15.5.0 || >=16.2.6 <17.0.0
```
**`next@15.5.x` is excluded**, and 15.5 is what `next@15` resolves to. Pin
`next@15.4.11`. Always run `npm view @payloadcms/next@<ver> peerDependencies`
before choosing, and never run `npm update` afterwards.

Pin every `@payloadcms/*` package to the same exact version as `payload`.

---

## 6. Payload Globals cannot be multi-tenant

**Symptom:** you design the slot model on Globals, then discover every tenant
shares one document.

**Cause:** a Global is a singleton with no tenant field. The multi-tenant plugin
documents this: globals must be configured as collections, with `isGlobal: true`
if you want to hide the list view.

This is a hard constraint. Design on a collection from the start.

---

## 7. A slot key that nothing renders

**Symptom:** the client edits "the main headline", saves, sees "site updated",
and the website is identical. They call, and they stop trusting the tool.

**Real example:** four `hero.*` keys existed in the translations table and no
component rendered any of them. Separately, an entire `Gallery.astro` was dead
code that no page imported.

**Before seeding any slot:**
```bash
grep -rl 'data-i18n="<key>"' src/        # must return a file
grep -rn "GalleryComponent" src/pages/   # the component must be imported
```

Treat an unverified key as a bug, not a detail.

---

## 8. Label keys and value keys collide

**Symptom:** the "Phone" label on the contact card is replaced by a phone number.

**Cause:** `contact.phone` in the i18n table was the *label* `"טלפון"`. Using the
same key for the value overwrites the label when the CMS values are merged over
the translation table.

Use distinct keys for values: `contact.phoneNumber`, `contact.whatsappUrl`,
`contact.instagramUrl`.

---

## 9. Bilingual sites need real localization

**Symptom:** the client edits Hebrew; the English half of the site keeps showing
the old text forever, silently.

```ts
localization: {
  locales: [{ label: 'עברית', code: 'he' }, { label: 'English', code: 'en' }],
  defaultLocale: 'he',
  fallback: true,
}
// then on the text fields only
{ name: 'textValue', type: 'text', localized: true }
```

Show the locale switcher **only** when the tenant is flagged bilingual. A
monolingual client must never see it.

---

## 10. `curl` cannot verify a JS-rendered edit

**Symptom:** you deploy, `curl | grep` finds nothing, and you conclude the deploy
failed. It did not. The user opens the page in a browser and sees the change.

**Cause:** text swapped in at runtime from `content.json` is absent from the raw
HTML, which still holds the original string.

Drive a real browser, wait for any preloader to clear, then read `innerText`.
Images are the exception; they are real `src` attributes and do show in `curl`.

---

## 11. A preloader hides content from your assertions

**Symptom:** `innerText` is empty or stale in tests; screenshots show a splash.

Many sites have a `#page-loader` overlay that hides for up to 3 seconds. Wait for
it before asserting:

```js
await page.waitForFunction(() => {
  const el = document.getElementById('page-loader')
  return !el || getComputedStyle(el).visibility === 'hidden'
}, { timeout: 20000 }).catch(() => {})
```

---

## 12. Asserting on default text proves nothing

**Symptom:** a green test that would pass even if the CMS were switched off.

If you assert that the live site contains the text the site already ships, you
have tested nothing. Write a **unique marker**, publish, confirm it reaches the
live page, then restore.

Two related traps:
- A leftover marker in a stale build can reach production. **Restoring the slot
  is not enough: republish.** The restore updates the database, but
  `content.json` and `dist/` on disk keep the marker until the next publish. On
  a real run that stale file was then pulled into the repo and committed, and a
  colleague had to clean it up. End the round trip with
  `cms set ... && cms publish && cms wait`, and deploy to a **preview branch
  first** and look at it.
- Substring assertions on Hebrew give false failures. `"סדר"` is inside `"בסדר"`.
  Assert on rendered inputs (`#field-order`), not on body text.

---

## 13. A Git-connected host overrides CMS content

**Symptom:** the client's edits vanish after you push code.

**Cause:** if the static host builds from GitHub, a push rebuilds from the repo,
where `content.json` is empty. The site falls back to hardcoded copy.

The site does not break, but the edits disappear from view. Either:
- run `cms publish` after every push to the production branch, or
- commit `content.json` and the copied media as a safety net, or
- disconnect Git and use direct upload only.

**The database is the source of truth, not the repo.** Say so in the runbook.

---

## 14. Scripts that fail silently

**Symptom:** `payload run seed.ts` exits 0, prints nothing, writes nothing.

**Cause:** calling an async `run()` without awaiting swallows the rejection.

```ts
process.on('unhandledRejection', (e) => { console.error('UNHANDLED:', e); process.exit(1) })
await run().catch((e) => { console.error('FAILED:', e); process.exit(1) })
```

Also exclude the scripts directory from the Next build's type checking, or a
throwaway debug script will break `npm run build`:

```json
{ "exclude": ["node_modules", "src/scripts"] }
```

---

## Two operational notes

**Do not scaffold with `create-payload-app` in an automated run.** It prompts for
an AI assistant choice and hangs headless. Hand-build the app router files; there
are only six, and they are listed in `code-templates.md`.

**Nested shell quoting will corrupt Hebrew and Python.** Write the script to a
local file and pipe it: `ssh host 'bash -s' < script.sh`. Do not try to escape
multi-level quotes inline; it silently mangles both.

---

## 15. Do not over-scope the Cloudflare token

**Symptom:** you stop and ask the account owner for a wider token before a
deploy that would have worked with the token already on the server.

`Account > Cloudflare Pages > Edit` alone is enough to **list, create and deploy**
Pages projects, including brand new ones. `Workers Scripts > Edit` is needed only
if you deploy to Workers Static Assets instead of Pages. The publish pipeline
uses `wrangler pages deploy`, so it does not need it.

**Test a token's permission without mutating anything.** POST an intentionally
invalid body and read the status code:

```python
# 403 -> no permission.  400/422 -> permission fine, payload rejected.
req = urllib.request.Request(
    "https://api.cloudflare.com/client/v4/accounts/%s/pages/projects" % ACC,
    data=json.dumps({}).encode(),
    headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json"},
    method="POST")
```

A real run returned `400 "You must set a production branch"`, which proved create
permission without creating a project. Probing with GET alone cannot tell you
whether a write would succeed.

---

## 16. Cloudflare Pages rejects any asset over 25 MiB

**Symptom:** the build succeeds and the deploy fails, or a video silently never
appears.

Limits: **25 MiB per single asset**, 20,000 files per deployment on the free plan
(100,000 on paid), and roughly 100 MB for the whole project.

A single client video will usually exceed 25 MiB on its own. This is the concrete
reason behind the iron rule that **video is a link, never an upload**. Raw footage
committed to a repo is the usual culprit.

**Check before deploying, not after:**
```bash
npm run build
du -sh dist
find dist -size +20M -exec ls -lh {} +      # anything here will fail or nearly fail
find dist -iname "*.mp4" -exec du -h {} +
```

Only what lands in `dist/` is uploaded. In Astro, `public/` is copied verbatim,
while `src/assets/` is bundled only when imported and a folder at the project root
is not copied at all. So raw footage is harmless in `assets/raw/` at the root, and
fatal in `public/assets/raw/`. Confirm which one it is rather than assuming.

---

## 17. Provisioning from the wrong branch silently un-wires the site

**Symptom:** you fetch the client's repo onto the server, everything reports
success, and the next publish deploys a site that ignores every slot the client
edits.

**Cause:** the tenant's branch defaults to `main`, but the CMS wiring
(`src/lib/cms.ts`, the component changes, `content.json`) often lives on a
feature branch until it is merged. Cloning `main` gives you a tree with no CMS
layer at all, and nothing in the build complains.

Check the tree after provisioning, not the log:

```bash
ls src/lib/cms.ts                                     # must exist
grep -l "cmsText\|cmsImage\|cmsGallery" src/components/*.astro | wc -l   # must be > 0
```

Better, make the provisioning itself refuse to look healthy: after the install,
warn loudly when `src/lib/cms.ts` is absent. A green "ready" on an unwired tree
is worse than a failure.

**Related trap in the same flow:** a shallow clone sets
`remote.origin.fetch` to the cloned branch only, so later switching branches
fails with `'origin/<branch>' is not a commit`. Fetch with an explicit refspec:

```bash
git fetch --depth 1 origin "+refs/heads/<branch>:refs/remotes/origin/<branch>"
git checkout -B <branch> "origin/<branch>"
```

---

## 18. Never delete the target before you clone into it

**Symptom:** a failed clone leaves no site at all.

The site directory on the server is a **deploy target**, not a scratch checkout.
It holds `node_modules`, the baked `content.json` and `public/cms-media`, and on
the first site it may have no `.git` at all because it was copied in by hand.

Clone into a temporary directory and swap it in only after success:

```
target.provision-tmp  ->  clone here
target                ->  rename to target.previous
target.provision-tmp  ->  rename to target
```

Two more rules for the same code path:
- **Discarding local state on sync destroys baked content.** The publish
  pipeline writes into this directory, so use fetch plus checkout, which leaves
  untracked build inputs alone.
- **Strip the token from `.git/config`.** Inject it into the remote URL for the
  fetch, then rewrite the remote to the plain URL, and scrub it from every log
  line and database row before persisting.

---

## 19. Read a token's permissions, do not assume them

GitHub's repo API returns a `permissions` block showing `push` and `admin` that
reflects **your own role**, not what the token was granted. A read-only
fine-grained token on a repo you administer still shows `push: true`.

Probe the actual grant with a write that cannot succeed:

```bash
curl -X POST -H "Authorization: Bearer $TOK" \
  https://api.github.com/repos/<org>/<repo>/git/refs \
  -d '{"ref":"refs/heads/perm-probe","sha":"0000000000000000000000000000000000000000"}'
# 403 -> read only.  422 -> the token can write.
```

Same shape as the Cloudflare probe in #15. And note that a public repo returns
200 unauthenticated, so reaching one proves nothing about scope.

---

## 20. A Workers tenant fails at the very last step

**Symptom:** content is written, the site builds, `dist/` is produced, and then
the publish dies. It looks like everything worked until the final moment.

```
A request to the Cloudflare API (/accounts/<id>/workers/services/<name>) failed.
Authentication error [code: 10000]
```

**Cause:** a Pages tenant deploys with `wrangler pages deploy` and needs only
`Pages:Edit`. A tenant that is a **Worker with Static Assets** deploys with plain
`wrangler deploy` and needs `Workers Scripts:Edit`. One token has to carry both
once the platform hosts a mix.

Note the shape of `deployCmd` differs too: `wrangler deploy`, not
`wrangler pages deploy`. And it needs `--yes` because publishing runs under
systemd with no terminal, where `npx` otherwise blocks on an install prompt.

**There is no preview branch for a Worker.** `wrangler deploy` goes straight to
production. `wrangler versions upload` then `versions deploy` gives a preview
URL, but **do not** make `versions upload` the tenant's `deployCmd`: every client
save would upload a version nobody promotes, the client would see "site updated",
and the site would never change. Keep `deployCmd` as the real deploy and use
versions manually.

---

## 21. `cloudflared tunnel route dns` will happily invent a subdomain

**Symptom:** you route a hostname from a second domain and get a nonsense record.

```
cloudflared tunnel route dns mediawave admin.other-domain.com
INF Added CNAME admin.other-domain.com.the-authorized-zone.com
```

**Cause:** the certificate from `cloudflared tunnel login` is scoped to the one
zone you picked in the browser. A hostname outside it is treated as a label
inside it, and the command reports success.

To serve a second domain, re-run `cloudflared tunnel login` and authorize that
zone too, then add it to the ingress list. And list the zone's records after any
routing command rather than trusting the log line.

---

## 22. An install with no manifest exits 0 having done nothing

**Symptom:** provisioning reports success, then the build fails on missing
dependencies.

`npm install` in a directory with no `package.json` succeeds silently. Worse, npm
walks **up** the directory tree, so with a manifest above the tenant directory it
will operate on a different project entirely. Keep the sites directory free of
any parent manifest, and check explicitly:

```bash
[ -f package.json ] || echo "no manifest, dependencies were not installed"
```

Report it in the provisioning log instead of letting a green result hide it.

---

## 23. A documented flag that no code reads is a lie

A tenant carried a `bilingual` checkbox described as "controls whether the client
sees a language switcher". Nothing read it. Every client saw the switcher, and
the first monolingual one would have been shown a control that does nothing.

The same trap hit the readiness check: it looked for a hardcoded
`src/lib/cms.ts`, which only exists on Astro sites, so a hand-written HTML tenant
got a false warning. Drive that from a per-tenant field with a sensible default,
and let blank disable the check.

When you add a field with a description promising behaviour, wire it in the same
change or do not add it.
