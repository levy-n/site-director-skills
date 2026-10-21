# Payload CMS 3.x Setup - Hebrew RTL Landing Pages

## Table of Contents
1. Prerequisites
2. Installation
3. Core Configuration
4. Collections
5. Globals
6. Content Seeding
7. Frontend Integration
8. Deploy Configuration

---

## 1. Prerequisites

Before installing Payload CMS, verify:
- **Next.js project** with App Router (`app/` directory, NOT pages/)
- **Node.js** >= 18.17
- **Package manager**: npm or pnpm
- **Discovery output** from Phase 1 (`discovery-output.json`) - optional but recommended

Check prerequisites:
```bash
node --version          # Must be >= 18.17
ls app/                 # Must exist (App Router)
cat package.json        # Must have "next" in dependencies
```

If no Next.js project exists, create one with Payload included:
```bash
npx create-payload-app@latest -t website
```

---

## 2. Installation

### New Project (recommended)
```bash
npx create-payload-app@latest -t website
# Follow prompts: choose database adapter, name, etc.
```

### Adding to Existing Next.js Project
```bash
npm install payload @payloadcms/next @payloadcms/richtext-lexical sharp

# Production DB (Neon Postgres serverless)
npm install @payloadcms/db-vercel-postgres

# Dev DB (SQLite for local development)
npm install @payloadcms/db-sqlite

# Hebrew translations
npm install @payloadcms/translations
```

---

## 3. Core Configuration - `payload.config.ts`

Create at the ROOT of the project:

```typescript
import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
// For local dev, uncomment:
// import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { he } from '@payloadcms/translations/languages/he'
import { en } from '@payloadcms/translations/languages/en'
import sharp from 'sharp'

import { Pages } from './collections/Pages'
import { Media } from './collections/Media'
import { Testimonials } from './collections/Testimonials'
import { FAQ } from './collections/FAQ'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'

export default buildConfig({
  // Lexical editor - RTL-native, best for Hebrew
  editor: lexicalEditor({}),

  // Database - Neon Postgres for production
  db: vercelPostgresAdapter({
    pool: { connectionString: process.env.POSTGRES_URL },
  }),
  // For local dev, swap to:
  // db: sqliteAdapter({ client: { url: 'file:./payload.db' } }),

  // CRITICAL: Hebrew RTL as default locale
  localization: {
    locales: [
      {
        label: 'עברית',
        code: 'he',
        rtl: true,
      },
      {
        label: 'English',
        code: 'en',
      },
    ],
    defaultLocale: 'he',
    fallback: true,
  },

  // Admin Panel UI in Hebrew
  i18n: {
    supportedLanguages: { he, en },
    fallbackLanguage: 'he',
  },

  collections: [Pages, Media, Testimonials, FAQ, Users],
  globals: [SiteSettings, Header, Footer],

  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- MediaWave',
    },
  },

  sharp,

  cors: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'],

  typescript: {
    outputFile: './payload-types.ts',
  },
})
```

### Key Rules
- `defaultLocale: 'he'` - Hebrew is ALWAYS the default
- `rtl: true` on Hebrew locale - enables RTL in admin panel
- `fallbackLanguage: 'he'` for admin UI - clients see Hebrew admin
- Lexical editor only - it has native RTL support
- Local API for all internal queries - NEVER use REST/GraphQL internally

---

## 4. Collections

### `collections/Pages.ts` - Landing Page with Layout Blocks

```typescript
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: { he: 'עמוד', en: 'Page' },
    plural: { he: 'עמודים', en: 'Pages' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { he: 'כותרת העמוד', en: 'Page Title' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: { he: 'כתובת URL', en: 'URL Slug' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'layout',
      type: 'blocks',
      label: { he: 'תוכן העמוד', en: 'Page Content' },
      blocks: [
        // Hero Block
        {
          slug: 'hero',
          labels: {
            singular: { he: 'כותרת ראשית', en: 'Hero' },
            plural: { he: 'כותרות ראשיות', en: 'Heroes' },
          },
          fields: [
            {
              name: 'headline',
              type: 'text',
              required: true,
              localized: true,
              label: { he: 'כותרת', en: 'Headline' },
            },
            {
              name: 'subheadline',
              type: 'textarea',
              localized: true,
              label: { he: 'תת-כותרת', en: 'Subheadline' },
            },
            {
              name: 'ctaText',
              type: 'text',
              localized: true,
              label: { he: 'טקסט כפתור', en: 'CTA Button Text' },
            },
            {
              name: 'ctaLink',
              type: 'text',
              label: { he: 'קישור כפתור', en: 'CTA Link' },
            },
            {
              name: 'backgroundImage',
              type: 'upload',
              relationTo: 'media',
              label: { he: 'תמונת רקע', en: 'Background Image' },
            },
          ],
        },

        // Features Block
        {
          slug: 'features',
          labels: {
            singular: { he: 'יתרונות', en: 'Features' },
            plural: { he: 'יתרונות', en: 'Features' },
          },
          fields: [
            {
              name: 'sectionTitle',
              type: 'text',
              localized: true,
              label: { he: 'כותרת מקטע', en: 'Section Title' },
            },
            {
              name: 'items',
              type: 'array',
              label: { he: 'פריטים', en: 'Items' },
              labels: {
                singular: { he: 'יתרון', en: 'Feature' },
                plural: { he: 'יתרונות', en: 'Features' },
              },
              fields: [
                {
                  name: 'icon',
                  type: 'text',
                  label: { he: 'אייקון (emoji או SVG)', en: 'Icon' },
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: { he: 'כותרת', en: 'Title' },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  localized: true,
                  label: { he: 'תיאור', en: 'Description' },
                },
              ],
            },
          ],
        },

        // Testimonials Block
        {
          slug: 'testimonials-section',
          labels: {
            singular: { he: 'חוות דעת', en: 'Testimonials' },
            plural: { he: 'חוות דעת', en: 'Testimonials' },
          },
          fields: [
            {
              name: 'sectionTitle',
              type: 'text',
              localized: true,
              label: { he: 'כותרת מקטע', en: 'Section Title' },
            },
            {
              name: 'testimonials',
              type: 'relationship',
              relationTo: 'testimonials',
              hasMany: true,
              label: { he: 'חוות דעת', en: 'Testimonials' },
            },
          ],
        },

        // FAQ Block
        {
          slug: 'faq-section',
          labels: {
            singular: { he: 'שאלות ותשובות', en: 'FAQ' },
            plural: { he: 'שאלות ותשובות', en: 'FAQ' },
          },
          fields: [
            {
              name: 'sectionTitle',
              type: 'text',
              localized: true,
              label: { he: 'כותרת מקטע', en: 'Section Title' },
            },
            {
              name: 'faqs',
              type: 'relationship',
              relationTo: 'faq',
              hasMany: true,
              label: { he: 'שאלות', en: 'Questions' },
            },
          ],
        },

        // CTA Block
        {
          slug: 'cta',
          labels: {
            singular: { he: 'קריאה לפעולה', en: 'Call to Action' },
            plural: { he: 'קריאות לפעולה', en: 'Calls to Action' },
          },
          fields: [
            {
              name: 'headline',
              type: 'text',
              required: true,
              localized: true,
              label: { he: 'כותרת', en: 'Headline' },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              label: { he: 'תיאור', en: 'Description' },
            },
            {
              name: 'ctaText',
              type: 'text',
              localized: true,
              label: { he: 'טקסט כפתור', en: 'Button Text' },
            },
            {
              name: 'ctaLink',
              type: 'text',
              label: { he: 'קישור', en: 'Link' },
            },
          ],
        },

        // Gallery Block
        {
          slug: 'gallery',
          labels: {
            singular: { he: 'גלריה', en: 'Gallery' },
            plural: { he: 'גלריות', en: 'Galleries' },
          },
          fields: [
            {
              name: 'sectionTitle',
              type: 'text',
              localized: true,
              label: { he: 'כותרת מקטע', en: 'Section Title' },
            },
            {
              name: 'images',
              type: 'array',
              label: { he: 'תמונות', en: 'Images' },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: { he: 'תמונה', en: 'Image' },
                },
                {
                  name: 'caption',
                  type: 'text',
                  localized: true,
                  label: { he: 'כיתוב', en: 'Caption' },
                },
              ],
            },
          ],
        },

        // Contact Block
        {
          slug: 'contact',
          labels: {
            singular: { he: 'יצירת קשר', en: 'Contact' },
            plural: { he: 'יצירת קשר', en: 'Contact' },
          },
          fields: [
            {
              name: 'sectionTitle',
              type: 'text',
              localized: true,
              label: { he: 'כותרת מקטע', en: 'Section Title' },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              label: { he: 'תיאור', en: 'Description' },
            },
            {
              name: 'showPhone',
              type: 'checkbox',
              label: { he: 'הצג מספר טלפון', en: 'Show Phone Number' },
              defaultValue: true,
            },
            {
              name: 'showWhatsApp',
              type: 'checkbox',
              label: { he: 'הצג כפתור וואטסאפ', en: 'Show WhatsApp Button' },
              defaultValue: true,
            },
            {
              name: 'showForm',
              type: 'checkbox',
              label: { he: 'הצג טופס יצירת קשר', en: 'Show Contact Form' },
              defaultValue: true,
            },
          ],
        },
      ],
    },
    // SEO fields
    {
      name: 'meta',
      type: 'group',
      label: { he: 'SEO', en: 'SEO' },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          label: { he: 'כותרת SEO', en: 'SEO Title' },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { he: 'תיאור SEO', en: 'SEO Description' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: { he: 'תמונת שיתוף', en: 'OG Image' },
        },
      ],
    },
  ],
}
```

### `collections/Media.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { he: 'מדיה', en: 'Media' },
    plural: { he: 'מדיה', en: 'Media' },
  },
  upload: {
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 512, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: { he: 'טקסט חלופי (נגישות)', en: 'Alt Text' },
    },
  ],
}
```

### `collections/Testimonials.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: { he: 'חוות דעת', en: 'Testimonial' },
    plural: { he: 'חוות דעת', en: 'Testimonials' },
  },
  admin: { useAsTitle: 'name' },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: { he: 'שם הלקוח', en: 'Customer Name' },
    },
    {
      name: 'role',
      type: 'text',
      localized: true,
      label: { he: 'תפקיד / עסק', en: 'Role / Business' },
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      localized: true,
      label: { he: 'ציטוט', en: 'Quote' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: { he: 'תמונה', en: 'Photo' },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      label: { he: 'דירוג (1-5)', en: 'Rating (1-5)' },
    },
    {
      name: 'order',
      type: 'number',
      label: { he: 'סדר תצוגה', en: 'Display Order' },
      admin: { position: 'sidebar' },
    },
  ],
}
```

### `collections/FAQ.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const FAQ: CollectionConfig = {
  slug: 'faq',
  labels: {
    singular: { he: 'שאלה נפוצה', en: 'FAQ' },
    plural: { he: 'שאלות נפוצות', en: 'FAQs' },
  },
  admin: { useAsTitle: 'question' },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      localized: true,
      label: { he: 'שאלה', en: 'Question' },
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
      localized: true,
      label: { he: 'תשובה', en: 'Answer' },
    },
    {
      name: 'category',
      type: 'text',
      localized: true,
      label: { he: 'קטגוריה', en: 'Category' },
    },
    {
      name: 'order',
      type: 'number',
      label: { he: 'סדר תצוגה', en: 'Display Order' },
      admin: { position: 'sidebar' },
    },
  ],
}
```

### `collections/Users.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { he: 'משתמש', en: 'User' },
    plural: { he: 'משתמשים', en: 'Users' },
  },
  auth: true,
  admin: { useAsTitle: 'email' },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: { he: 'שם', en: 'Name' },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      label: { he: 'תפקיד', en: 'Role' },
      options: [
        { label: { he: 'מנהל', en: 'Admin' }, value: 'admin' },
        { label: { he: 'עורך תוכן', en: 'Editor' }, value: 'editor' },
      ],
    },
  ],
}
```

---

## 5. Globals

### `globals/SiteSettings.ts`

```typescript
import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { he: 'הגדרות האתר', en: 'Site Settings' },
  fields: [
    {
      name: 'businessName',
      type: 'text',
      required: true,
      localized: true,
      label: { he: 'שם העסק', en: 'Business Name' },
    },
    {
      name: 'phone',
      type: 'text',
      label: { he: 'טלפון', en: 'Phone' },
      admin: { description: { he: 'פורמט: 05X-XXX-XXXX', en: 'Format: 05X-XXX-XXXX' } },
    },
    {
      name: 'whatsapp',
      type: 'text',
      label: { he: 'וואטסאפ', en: 'WhatsApp' },
      admin: { description: { he: 'פורמט בינלאומי: 972XXXXXXXXX', en: 'International: 972XXXXXXXXX' } },
    },
    {
      name: 'email',
      type: 'email',
      label: { he: 'אימייל', en: 'Email' },
    },
    {
      name: 'address',
      type: 'textarea',
      localized: true,
      label: { he: 'כתובת', en: 'Address' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: { he: 'לוגו', en: 'Logo' },
    },
    {
      name: 'colors',
      type: 'group',
      label: { he: 'צבעים', en: 'Colors' },
      fields: [
        { name: 'primary', type: 'text', label: { he: 'ראשי', en: 'Primary' }, admin: { description: 'HEX: #XXXXXX' } },
        { name: 'secondary', type: 'text', label: { he: 'משני', en: 'Secondary' } },
        { name: 'accent', type: 'text', label: { he: 'הדגשה', en: 'Accent' } },
      ],
    },
    {
      name: 'social',
      type: 'group',
      label: { he: 'רשתות חברתיות', en: 'Social Media' },
      fields: [
        { name: 'facebook', type: 'text', label: 'Facebook' },
        { name: 'instagram', type: 'text', label: 'Instagram' },
        { name: 'tiktok', type: 'text', label: 'TikTok' },
        { name: 'linkedin', type: 'text', label: 'LinkedIn' },
      ],
    },
    {
      name: 'analyticsId',
      type: 'text',
      label: { he: 'Google Analytics ID', en: 'Google Analytics ID' },
      admin: { description: 'G-XXXXXXXXXX' },
    },
  ],
}
```

### `globals/Header.ts`

```typescript
import type { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'header',
  label: { he: 'כותרת עליונה', en: 'Header' },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: { he: 'לוגו', en: 'Logo' },
    },
    {
      name: 'nav',
      type: 'array',
      label: { he: 'תפריט ניווט', en: 'Navigation' },
      labels: {
        singular: { he: 'קישור', en: 'Link' },
        plural: { he: 'קישורים', en: 'Links' },
      },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true, label: { he: 'טקסט', en: 'Label' } },
        { name: 'url', type: 'text', required: true, label: { he: 'קישור', en: 'URL' } },
      ],
    },
    {
      name: 'ctaButton',
      type: 'group',
      label: { he: 'כפתור CTA', en: 'CTA Button' },
      fields: [
        { name: 'text', type: 'text', localized: true, label: { he: 'טקסט', en: 'Text' } },
        { name: 'link', type: 'text', label: { he: 'קישור', en: 'Link' } },
      ],
    },
  ],
}
```

### `globals/Footer.ts`

```typescript
import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: { he: 'כותרת תחתונה', en: 'Footer' },
  fields: [
    {
      name: 'copyright',
      type: 'text',
      localized: true,
      label: { he: 'זכויות יוצרים', en: 'Copyright' },
    },
    {
      name: 'links',
      type: 'array',
      label: { he: 'קישורים', en: 'Links' },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true, label: { he: 'טקסט', en: 'Label' } },
        { name: 'url', type: 'text', required: true, label: { he: 'קישור', en: 'URL' } },
      ],
    },
    {
      name: 'showSocial',
      type: 'checkbox',
      label: { he: 'הצג אייקוני רשתות חברתיות', en: 'Show Social Icons' },
      defaultValue: true,
    },
  ],
}
```

---

## 6. Content Seeding from Discovery

Create `seed/seed.ts` to populate Payload from `discovery-output.json`:

```typescript
import payload from 'payload'
import discoveryData from '../discovery-output.json'

async function seed() {
  // 1. Create admin user
  await payload.create({
    collection: 'users',
    data: {
      email: 'admin@mediawave.co.il',
      password: 'CHANGE_ME_IMMEDIATELY',
      role: 'admin',
      name: 'MediaWave Admin',
    },
  })

  // 2. Populate SiteSettings
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      businessName: discoveryData.business.nameHe,
      phone: discoveryData.business.phone,
      whatsapp: discoveryData.business.whatsapp,
      email: discoveryData.business.email,
      address: discoveryData.business.address,
    },
  })

  // 3. Create testimonials
  if (discoveryData.testimonials) {
    for (const t of discoveryData.testimonials) {
      await payload.create({
        collection: 'testimonials',
        data: {
          name: t.name,
          role: t.role,
          quote: t.quote,
          rating: t.rating || 5,
        },
        locale: 'he',
      })
    }
  }

  // 4. Create FAQ items
  if (discoveryData.faqs) {
    for (const [i, faq] of discoveryData.faqs.entries()) {
      await payload.create({
        collection: 'faq',
        data: {
          question: faq.question,
          answer: { root: { children: [{ type: 'paragraph', children: [{ text: faq.answer }] }] } },
          order: i + 1,
        },
        locale: 'he',
      })
    }
  }

  // 5. Create landing page with layout blocks
  const sb = discoveryData.storyBrand
  await payload.create({
    collection: 'pages',
    data: {
      title: discoveryData.business.nameHe,
      slug: 'home',
      layout: [
        {
          blockType: 'hero',
          headline: sb.character + ' - ' + sb.callToAction,
          subheadline: sb.guide.empathy,
          ctaText: discoveryData.business.cta_goal,
          ctaLink: '#contact',
        },
        {
          blockType: 'features',
          sectionTitle: 'למה לבחור בנו',
          items: sb.plan.map((step, i) => ({
            icon: ['🎯', '⚡', '✨'][i] || '📌',
            title: `שלב ${i + 1}`,
            description: step,
          })),
        },
        {
          blockType: 'cta',
          headline: sb.success,
          description: sb.failure ? `אל תתנ/י ל: ${sb.failure}` : '',
          ctaText: discoveryData.business.cta_goal,
          ctaLink: '#contact',
        },
        {
          blockType: 'contact',
          sectionTitle: 'צור/י קשר',
          showPhone: true,
          showWhatsApp: true,
          showForm: true,
        },
      ],
    },
    locale: 'he',
  })

  console.log('✅ Seed completed successfully!')
}

seed()
```

### Seeding Mapping Table

| Discovery Output | Payload Target |
|---|---|
| `business.nameHe` | SiteSettings → businessName |
| `business.phone` | SiteSettings → phone |
| `business.whatsapp` | SiteSettings → whatsapp |
| `storyBrand.character` + `callToAction` | Hero → headline |
| `storyBrand.guide.empathy` | Hero → subheadline |
| `storyBrand.plan[]` | Features → items[] |
| `storyBrand.success` | CTA → headline |
| `storyBrand.failure` | CTA → description |
| `testimonials[]` | Testimonials collection |
| `faqs[]` | FAQ collection |

---

## 7. Frontend Integration - `lib/payload-helpers.ts`

```typescript
import { getPayload } from 'payload'
import config from '../payload.config'

// ALWAYS use Local API - no HTTP overhead
export async function getPage(slug: string, locale = 'he') {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    locale,
    depth: 2, // populate relationships (testimonials, FAQ, media)
  })
  return result.docs[0] || null
}

export async function getGlobal(slug: string, locale = 'he') {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug, locale })
}

export async function getTestimonials(limit = 10, locale = 'he') {
  const payload = await getPayload({ config })
  return payload.find({
    collection: 'testimonials',
    sort: 'order',
    limit,
    locale,
  })
}

export async function getFAQ(locale = 'he') {
  const payload = await getPayload({ config })
  return payload.find({
    collection: 'faq',
    sort: 'order',
    locale,
  })
}
```

---

## 8. Deploy Configuration

### `.env.example`
```
# Database (Neon Postgres)
POSTGRES_URL=postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Payload
PAYLOAD_SECRET=your-random-secret-at-least-32-chars

# Site
NEXT_PUBLIC_SITE_URL=https://your-domain.co.il
```

### `vercel.json`
```json
{
  "env": {
    "POSTGRES_URL": "@postgres-url",
    "PAYLOAD_SECRET": "@payload-secret",
    "NEXT_PUBLIC_SITE_URL": "@site-url"
  }
}
```

### Post-Install Verification
1. `npx payload generate:types` - generate TypeScript types
2. `npm run build` - verify no build errors
3. `npm run dev` → navigate to `http://localhost:3000/admin`
4. Verify admin panel loads in Hebrew
5. Create first admin user
6. Run seed script if discovery output exists
7. Verify content appears correctly in RTL layout
