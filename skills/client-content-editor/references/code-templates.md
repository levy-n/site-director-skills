# Working code

Taken from a live build. A complete reference implementation lives at
`g:/Web-Dev/Ben-David/CMS/platform-source/` - copy from there rather than
retyping, then adapt.

---

## Install

```bash
npm i payload@3.88.0 \
      @payloadcms/next@3.88.0 \
      @payloadcms/ui@3.88.0 \
      @payloadcms/db-postgres@3.88.0 \
      @payloadcms/richtext-lexical@3.88.0 \
      @payloadcms/plugin-multi-tenant@3.88.0 \
      @payloadcms/translations@3.88.0 \
      next@15.4.11 react@^19 react-dom@^19 sharp
```

Check `npm view payload dist-tags` first. If `latest` has moved to a new major,
stop and ask rather than upgrading.

---

## App router files (six of them)

Do not use `create-payload-app` in an automated run; it prompts and hangs.

```
src/app/(payload)/layout.tsx
src/app/(payload)/custom.scss
src/app/(payload)/admin/[[...segments]]/page.tsx
src/app/(payload)/admin/[[...segments]]/not-found.tsx
src/app/(payload)/api/[...slug]/route.ts
src/app/(payload)/api/graphql/route.ts
```

`layout.tsx` - note the CSS import, which is the single easiest thing to omit:

```tsx
import type { ServerFunctionClient } from 'payload'
import config from '@payload-config'
import '@payloadcms/next/css'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap.js'
import './custom.scss'

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

const Layout = ({ children }: { children: React.ReactNode }) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)
export default Layout
```

After adding any custom component: `npx payload generate:importmap`.

---

## payload.config.ts

```ts
import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { he } from '@payloadcms/translations/languages/he'
import sharp from 'sharp'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  sharp,                                    // see gotchas #1

  admin: {
    user: 'users',
    meta: { titleSuffix: ' | ניהול האתר' },
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      providers: ['/components/RoleClass#RoleClass'],
      graphics: { Logo: '/components/Brand#Logo', Icon: '/components/Brand#Icon' },
      views: { dashboard: { Component: '/components/ClientHome#ClientHome' } },
    },
  },

  i18n: { fallbackLanguage: 'he', supportedLanguages: { he } },

  localization: {                           // see gotchas #9
    locales: [{ label: 'עברית', code: 'he' }, { label: 'English', code: 'en' }],
    defaultLocale: 'he',
    fallback: true,
  },

  collections: [Users, Tenants, Slots, Media, PublishJobs],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI || '' } }),

  plugins: [
    multiTenantPlugin({
      tenantsSlug: 'tenants',
      tenantSelectorLabel: 'בחירת אתר',
      collections: { slots: {}, 'publish-jobs': {} },
      userHasAccessToAllTenants: (user: any) => user?.role === 'admin',
    }),
  ],
})
```

The plugin injects its own `tenant` field into every listed collection. **Do not
declare one yourself** or the build fails with `DuplicateFieldName`.

---

## Slots collection, the important parts

```ts
const adminOnly = { update: isAdminField, create: isAdminField }
const hideFromClient = (_d: any, _s: any, ctx: any) => ctx?.user?.role === 'admin'

export const Slots: CollectionConfig = {
  slug: 'slots',
  labels: { singular: 'מקום באתר', plural: 'מה אפשר לשנות באתר' },
  admin: { useAsTitle: 'label', group: 'האתר שלי' },
  versions: { maxPerDoc: 20, drafts: false },
  access: {
    create: isAdmin, delete: isAdmin,
    read:   ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),   // field level does the real work
  },
  hooks: {
    afterChange: [async ({ doc, req }) => {
      const id = typeof doc.tenant === 'object' ? doc.tenant?.id : doc.tenant
      if (id) schedulePublish(String(id), req.payload)
      return doc
    }],
  },
  fields: [
    // meta: admin only, and hidden from the client's form entirely
    { name: 'key',   type: 'text', required: true, access: adminOnly, admin: { condition: hideFromClient } },
    { name: 'label', type: 'text', required: true, access: adminOnly, admin: { condition: hideFromClient } },
    { name: 'help',  type: 'textarea',             access: adminOnly, admin: { condition: hideFromClient } },
    { name: 'group', type: 'text',                 access: adminOnly, admin: { condition: hideFromClient } },
    { name: 'order', type: 'number',               access: adminOnly, admin: { condition: hideFromClient } },
    { name: 'type',  type: 'select', required: true, access: adminOnly, admin: { condition: hideFromClient },
      options: [
        { label: 'תמונה', value: 'image' }, { label: 'טקסט קצר', value: 'text' },
        { label: 'טקסט ארוך', value: 'textarea' }, { label: 'קישור לסרטון', value: 'video' },
        { label: 'גלריה', value: 'gallery' },
      ] },

    // values: what the client came for
    { name: 'imageValue', type: 'upload', relationTo: 'media', label: 'תמונה',
      admin: { condition: (d) => d?.type === 'image',
               description: 'תמונה מהטלפון בסדר גמור. המערכת מקטינה אותה לבד.' } },

    { name: 'textValue', type: 'text', label: 'הטקסט', localized: true,
      admin: { condition: (d) => d?.type === 'text' } },

    { name: 'longTextValue', type: 'textarea', label: 'הטקסט', localized: true,
      admin: { condition: (d) => d?.type === 'textarea' } },

    { name: 'videoValue', type: 'text', label: 'קישור לסרטון',
      admin: { condition: (d) => d?.type === 'video' },
      validate: (v: any) => !v
        || /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(String(v))
        || 'הדביקו קישור מיוטיוב. אפשר להעתיק אותו משורת הכתובת.' },

    { name: 'galleryValue', type: 'array', label: 'תמונות הגלריה',
      admin: { condition: (d) => d?.type === 'gallery' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'תמונה' },
        { name: 'title', type: 'text', label: 'כותרת', localized: true },
        { name: 'description', type: 'textarea', label: 'תיאור קצר', localized: true },
      ] },
  ],
}
```

Gallery items carry a title and description on real sites. An array of bare
uploads loses them.

---

## Media collection

```ts
upload: {
  staticDir: process.env.MEDIA_DIR || '/opt/mediawave/media',
  mimeTypes: ['image/*'],
  hideRemoveFile: true,
  crop: false,
  focalPoint: false,
  imageSizes: [
    { name: 'mobile',  width: 640,  withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 78 } } },
    { name: 'tablet',  width: 1024, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 80 } } },
    { name: 'desktop', width: 1920, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 82 } } },
  ],
}
```

---

## Publish pipeline

Debounce, concurrency 1, and **copy the media into the site** so the built site
never depends on the CMS.

```ts
export function schedulePublish(tenantId: string, payload: any) {
  clearTimeout(timers.get(tenantId))
  timers.set(tenantId, setTimeout(() => { timers.delete(tenantId); enqueue(tenantId, payload) }, DEBOUNCE_MS))
}

// inside publish():
const slots = await payload.find({
  collection: 'slots',
  where: { tenant: { equals: tenantId } },
  locale: 'all',            // gives { he, en } for localized fields
  depth: 2, limit: 500, pagination: false,
})

await fs.writeFile(path.join(repoPath, 'src', 'content.json'), JSON.stringify(content, null, 2), 'utf8')

const outDir = path.join(repoPath, 'public', 'cms-media')
await fs.rm(outDir, { recursive: true, force: true })
await fs.mkdir(outDir, { recursive: true })
for (const f of usedFiles) await fs.copyFile(path.join(MEDIA_DIR, f), path.join(outDir, f))

await run(tenant.buildCmd, { cwd: repoPath, timeout: 10 * 60 * 1000, maxBuffer: 20 * 1024 * 1024 })
if (tenant.deployCmd) await run(tenant.deployCmd, { cwd: repoPath, timeout: 10 * 60 * 1000 })
```

Record every job in a `publish-jobs` collection so the client's status indicator
has something to poll, and so failures are diagnosable later.

---

## Site side: `src/lib/cms.ts`

Every accessor falls back. The site must build with `content.json` missing.

```ts
import raw from '../content.json'
const content: Record<string, any> = (raw as any) || {}

const pick = (v: any): string =>
  typeof v === 'string' ? v : (v && typeof v === 'object' ? (v.he || v.en || '') : '')

export function cmsText(key: string, fallback = ''): string { return pick(content[key]) || fallback }

export function cmsImage(key: string) {
  const v = content[key]
  return v && typeof v === 'object' && v.url ? { url: v.url, alt: v.alt || '' } : null
}

export function cmsGallery(key: string) {
  const v = content[key]
  if (!Array.isArray(v) || !v.length) return null
  const out = v.filter((i: any) => i?.image?.url).map((i: any) => ({
    src: i.image.url, alt: i.image.alt || '', title: pick(i.title), description: pick(i.description) || undefined,
  }))
  return out.length ? out : null
}

export function videoEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return vm ? `https://player.vimeo.com/video/${vm[1]}` : null
}
```

**For a bilingual site with a runtime i18n table**, merge CMS values over the
table rather than touching every component. One patch covers every text slot:

```ts
import cmsContent from '../content.json'
for (const [key, value] of Object.entries(cmsContent as Record<string, any>)) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.url) continue
  if (!('he' in value) && !('en' in value)) continue
  const prev = translations[key] || { he: '', en: '' }
  translations[key] = { he: (value as any).he || prev.he, en: (value as any).en || prev.en }
}
```

Components with images, galleries and video still need individual wiring:

```astro
---
import { cmsGallery } from '../lib/cms';
const cmsItems = cmsGallery('parochot.items');
const displayImages = cmsItems ?? parochotImages;   // fallback keeps the page intact
---
{displayImages.map((image, index) => ( ... ))}
```

---

## Client-mode CSS

Set a body class from a provider, then strip chrome for that role only.

```tsx
'use client'
import { useAuth } from '@payloadcms/ui'
export function RoleClass({ children }) {
  const { user } = useAuth() as any
  useEffect(() => {
    document.body?.classList.toggle('mw-is-admin', user?.role === 'admin')
    document.body?.classList.toggle('mw-is-client', !!user && user?.role !== 'admin')
  }, [user])
  return <>{children}</>
}
```

```scss
body.mw-is-client .nav,
body.mw-is-client .nav-toggler,
body.mw-is-client .doc-controls__meta,
body.mw-is-client .doc-tabs { display: none !important; }

/* required, see gotchas #4 */
body.mw-is-client .template-default { grid-template-columns: 1fr !important; }
body.mw-is-client .template-default__wrap { grid-column: 1 / -1 !important; width: 100% !important; min-width: 0 !important; }

/* Payload's .icon has no size cap and rendered at 374px */
body.mw-is-client svg.icon, body.mw-is-client .icon { width: 20px !important; height: 20px !important; }

/* upload previews render at natural size and overflow the viewport */
body.mw-is-client img { max-width: 100%; height: auto; }
```

---

## Verification harness

```js
const settle = async (page) => {
  await page.waitForFunction(() => {
    const el = document.getElementById('page-loader')
    return !el || getComputedStyle(el).visibility === 'hidden'
  }, { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(600)
}

// meta fields must not be rendered. Check inputs, not body text.
for (const f of ['key', 'label', 'help', 'group', 'order', 'type']) {
  const n = await p.locator(`#field-${f}, [name="${f}"]`).count()
  ok(`meta field "${f}" not rendered for client`, n === 0)
}

// a real round trip, with a unique marker
const MARKER = `בדיקה-${Date.now()}`
cms(`set about.title ${JSON.stringify(MARKER)}`)
cms('publish'); cms('wait')
ok('THE EDIT IS LIVE', (await s.locator('body').innerText()).includes(MARKER))
cms(`set about.title ${JSON.stringify(original)}`)

// fate separation
execSync('ssh host "systemctl stop cms"')
ok('site survives the editor being down', (await s2.goto(SITE)).status() === 200)
execSync('ssh host "systemctl start cms"')
```
