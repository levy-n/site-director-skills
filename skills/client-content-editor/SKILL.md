---
name: client-content-editor
description: Builds a Hebrew RTL content editor that lets a non-technical client change their own text, images and videos on a static site, without being able to break it. Multi-tenant Payload 3 on one VPS serving every client, content baked into each site's build so the editor is never in the critical path. Covers the slot model, the publish pipeline, Cloudflare deployment, and the client handover guide.
when_to_use: >
  "שהלקוח יוכל לערוך", "מערכת ניהול תוכן", "CMS ללקוח", "עורך תוכן", "לתת ללקוח גישה",
  "client editor", "let the client edit", "CMS for client", "content editor",
  "add CMS to site", "client wants to update content themselves",
  or adding a new tenant to an existing MediaWave editor platform.
argument-hint: "[site-path]"
metadata:
  author: MediaWave Israel
  version: 1.0.0
  category: infrastructure
  tags: [cms, payload, hebrew, rtl, multi-tenant, cloudflare, astro, static]
---

# Client Content Editor

Give a non-technical client a screen where they change their own content, from a
phone, without a support call, and without any way to break the site.

**The single success measure:** a 55 year old business owner replaces an image
on their own, first try, from their phone, in under two minutes.

Every decision is judged against that sentence. A feature that complicates that
screen does not go in.

---

## The platform already exists

Nati runs one live instance that serves every client. **Do not build a second
one.** For a new client, read `references/infrastructure.md` for the server,
paths, domains and credential locations, then follow "Adding a client" in
`references/operations.md`.

Build from scratch only when standing this up for a different agency.

---

## Before you write any code

**Read `references/gotchas.md` first.** It lists twenty three failures that each cost
real hours, most of which fail *silently* and look fine right up until the client
sees an unchanged website. Four of them will bite you in the first hour.

The three that break things fastest:

1. **`sharp` is not a peer dependency of Payload.** If you do not pass it to
   `buildConfig({ sharp })`, `imageSizes` does nothing, with no error. The client
   uploads 8MB from their phone and the site serves 8MB.
2. **`import '@payloadcms/next/css'` in `app/(payload)/layout.tsx`.** Miss it and
   the entire admin renders unstyled. You will waste an afternoon writing CSS to
   patch symptoms of a missing stylesheet.
3. **A slot key that nothing renders.** The client edits it, saves, sees "site
   updated", and the site is unchanged. This is the worst possible first
   experience. Verify every key against the actual markup before you seed it.

---

## Architecture, and why

```
   client (phone) ──▶ Payload, one instance for ALL clients
                        VPS + Postgres, reached via Cloudflare Tunnel
                              │  afterChange, debounced queue
                              ▼
                      build the site ON the VPS
                              │  content + images baked into dist/
                              ▼
   visitors ────────▶ static host (Cloudflare Pages / Workers)
```

**One instance for every client.** Per-client infrastructure costs roughly $45 a
month each once you account for a paid host and a database that does not sleep.
One shared instance is a single fixed cost the whole agency shares.

**Content is baked into the build.** The editor going down must never take a
client site down. Copy the images physically into the site's `public/` during
publish; never let the live site fetch from the CMS at runtime. Test this by
stopping the CMS and loading every client site.

**Multi-tenancy forces the data model.** Payload Globals are singletons with no
tenant field, so they cannot be per-client. The official plugin says so directly:
globals must be configured as collections. This is a constraint, not a preference.

---

## The slot model

One generic `slots` collection. **The Hebrew label is data, not code**, so adding
a client is inserting rows, never writing components.

```
tenants                          slots  (multi-tenant scoped)
  name, slug, siteUrl              tenant
  repoPath   (path on VPS)         key, label, help, group, order,   ◀ admin only
  buildCmd, deployCmd              type, recommendedSize                field-level
  bilingual  (checkbox)            ─────────────────────────────────    access
  logo                             imageValue    (condition: type=image)   ◀ client
                                   textValue     (localized)
                                   longTextValue (localized)
                                   videoValue    (youtube/vimeo validated)
                                   galleryValue  (array: image+title+desc)
```

- **Field-level access** on the meta fields, not just collection-level. A client
  must not be able to change a label or type even through the API.
- `admin.useAsTitle: 'label'` so the edit screen is headed "התמונה הראשית", not an id.
- **Max 12 slots.** Filter by "will they really change this more than once a year?"
- Versions on, `drafts: false`. Two steps confuse people; one green button.

Working code for all of this is in `references/code-templates.md`.

---

## Phases

Update a `progress.md` after each phase. This will not fit in one context window.

### 1. Scan the site (approval gate)
Framework, where content actually lives, every media asset with real dimensions.

**Four checks that have each changed a plan before:**
- **Is the site bilingual?** Look for `data-i18n`, a translations file, `{he, en}`
  shapes. If yes, set `bilingual` and use Payload `localization`, or the client
  editing Hebrew silently strands the English on its old value.
- **Hebrew filenames or folders?** Very common on Israeli sites. Works in the
  site, breaks across the publish chain. Plan a UTF-8 path check.
- **Local video files?** Distinguish a design asset (background, ambient), which
  stays and is not a slot, from content video, which becomes a link slot.
- **Do not trust the project's `CLAUDE.md`.** It goes stale and describes files
  that no longer exist. Verify every path against the disk.

### 2. Slot map (approval gate)
Propose max 12 slots with Hebrew label, help text, type, group, recommended size.

**Verify every key renders before you seed it:**
```bash
grep -rl 'data-i18n="<key>"' src/     # must return a file
grep -rn "ComponentName" src/pages/   # must be imported somewhere
```
On a real project this caught four keys defined in the translations table that no
component rendered, and a whole gallery component no page imported.

**Watch for label/value key collisions.** `contact.phone` was the *label* "טלפון";
using that key for the phone number would have replaced the label with a number.
Use distinct keys like `contact.phoneNumber` for values.

### 3. Wire the site
Add a `src/lib/cms.ts` with a fallback on every accessor, reading `src/content.json`.

**The site must build correctly with an empty or missing `content.json`.** That is
what makes the editor non-critical, and it means a client deleting everything
falls back to the original design instead of an empty page.

### 4. Publish pipeline
`afterChange` → debounce → queue with concurrency 1 → write `content.json` → copy
media into `public/` → build → deploy.

Debounce matters: five rapid saves must produce one build, not five.
Concurrency 1 matters: two concurrent Astro builds will starve a small VPS.

### 5. The client screen
This is the part that decides whether the whole thing works. Payload gives you
auth, versions, image processing and permissions for free; you replace only the
screen the client sees.

- Big cards with a **thumbnail of what is there right now**. They recognise
  visually, they do not read labels.
- One green sticky "שמירה ופרסום". No drafts, no two-step.
- Publish status: "● האתר מתעדכן..." → "✓ האתר עודכן" + "צפה באתר".
- 44px tap targets, 16px+ text, tested at 390px.
- Strip Payload's chrome for the client role only, via a body class. See the
  grid trap in `references/gotchas.md` before you hide the nav.

### 6. Verify, in a browser
**`curl` cannot verify this.** Text rendered by JS from `content.json` is absent
from the raw HTML, so `curl | grep` reports a false negative while everything
works. Drive a real browser.

Minimum checks: RTL at 390px, zero horizontal scroll, meta fields absent from the
client's form, tenant isolation, an edit reaching the live site, and the site
still serving with the CMS stopped.

### 7. Client guide
`מדריך-עדכון-האתר.rtl.md`. Assume zero knowledge. Banned words: CMS, deploy,
build, collection, field, cache, API, panel, slot, tenant. Every step says what
they should see afterwards, and what to do if they do not.

Template in `references/client-guide-template.md`.

---

## Iron rules

1. **Slots, not a page builder.** Fixed places only. Build a page builder and you failed.
2. **Full Hebrew, real RTL.** Zero English on any client-visible screen, errors and emails included.
3. **Mobile first.** Verified at 390px before anything counts as done.
4. **Impossible to break.** No delete, no create, no settings. Update values only.
5. **Video is a link, never an upload.** This is the decision that saves the biggest bill.
6. **Images processed automatically.** Verify by counting the generated derivatives, not by trusting config.
7. **Fate separation.** Content baked into the build; the editor is never in the critical path.
8. **The label is data.** Adding a client is row inserts, not new components.
9. **Pin every `@payloadcms/*` to one exact version**, and check Next's peer range.
10. **No long dashes** anywhere. Only `-`.
11. **Never trust memory on API shape.** Read the installed types in `node_modules`.

---

## Bundled files

| File | Use |
|------|-----|
| `references/infrastructure.md` | **The live server**: access, paths, domains, where secrets live |
| `references/gotchas.md` | **Read first.** Twenty three real failures and their fixes |
| `references/code-templates.md` | Working config, collections, publish queue, client screen |
| `references/client-guide-template.md` | The Hebrew handover guide skeleton |
| `references/operations.md` | Runbook: deploy, backup, restore, add a tenant |
