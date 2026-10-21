/**
 * Payload CMS 3.x Collection & Global Templates
 * MediaWave Landing Page Pipeline
 *
 * Copy these files into your project's collections/ and globals/ directories.
 * All labels are bilingual (Hebrew + English), Hebrew is default locale.
 *
 * Usage:
 *   collections/Pages.ts    - Landing page with layout blocks
 *   collections/Media.ts    - Image uploads with responsive sizes
 *   collections/Testimonials.ts - Customer reviews
 *   collections/FAQ.ts      - Frequently asked questions
 *   collections/Users.ts    - Admin users with roles
 *   globals/SiteSettings.ts - Business info, colors, social
 *   globals/Header.ts       - Navigation + CTA button
 *   globals/Footer.ts       - Copyright + links
 */

// ============================================================
// collections/Pages.ts - Landing Page with Layout Blocks
// ============================================================

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
        // --- Hero Block ---
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
            {
              name: 'heroStyle',
              type: 'select',
              label: { he: 'סגנון Hero', en: 'Hero Style' },
              defaultValue: 'gradient',
              options: [
                { label: { he: 'תמונת רקע', en: 'Background Image' }, value: 'background-image' },
                { label: { he: 'גרדיאנט', en: 'Gradient' }, value: 'gradient' },
                { label: { he: 'תמונה בצד', en: 'Split Layout' }, value: 'split' },
              ],
            },
          ],
        },

        // --- Features Block ---
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
              name: 'sectionSubtitle',
              type: 'textarea',
              localized: true,
              label: { he: 'תת-כותרת מקטע', en: 'Section Subtitle' },
            },
            {
              name: 'items',
              type: 'array',
              label: { he: 'פריטים', en: 'Items' },
              labels: {
                singular: { he: 'יתרון', en: 'Feature' },
                plural: { he: 'יתרונות', en: 'Features' },
              },
              maxRows: 6,
              fields: [
                {
                  name: 'icon',
                  type: 'text',
                  label: { he: 'אייקון (emoji או Lucide name)', en: 'Icon' },
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

        // --- Testimonials Section Block ---
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

        // --- FAQ Section Block ---
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

        // --- CTA Block ---
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
            {
              name: 'style',
              type: 'select',
              label: { he: 'סגנון', en: 'Style' },
              defaultValue: 'primary',
              options: [
                { label: { he: 'ראשי (צבע רקע)', en: 'Primary (colored bg)' }, value: 'primary' },
                { label: { he: 'משני (רקע לבן)', en: 'Secondary (white bg)' }, value: 'secondary' },
                { label: { he: 'כהה', en: 'Dark' }, value: 'dark' },
              ],
            },
          ],
        },

        // --- Gallery Block ---
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
              name: 'layout',
              type: 'select',
              label: { he: 'תצוגה', en: 'Layout' },
              defaultValue: 'grid',
              options: [
                { label: { he: 'רשת', en: 'Grid' }, value: 'grid' },
                { label: { he: 'קרוסלה', en: 'Carousel' }, value: 'carousel' },
                { label: { he: 'מזוניזם', en: 'Masonry' }, value: 'masonry' },
              ],
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

        // --- Contact Block ---
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
            {
              name: 'formFields',
              type: 'select',
              label: { he: 'שדות טופס', en: 'Form Fields' },
              hasMany: true,
              defaultValue: ['name', 'phone', 'message'],
              options: [
                { label: { he: 'שם מלא', en: 'Full Name' }, value: 'name' },
                { label: { he: 'טלפון', en: 'Phone' }, value: 'phone' },
                { label: { he: 'אימייל', en: 'Email' }, value: 'email' },
                { label: { he: 'הודעה', en: 'Message' }, value: 'message' },
                { label: { he: 'נושא', en: 'Subject' }, value: 'subject' },
              ],
            },
          ],
        },

        // --- Process / How It Works Block ---
        {
          slug: 'process',
          labels: {
            singular: { he: 'תהליך עבודה', en: 'Process' },
            plural: { he: 'תהליכי עבודה', en: 'Processes' },
          },
          fields: [
            {
              name: 'sectionTitle',
              type: 'text',
              localized: true,
              label: { he: 'כותרת מקטע', en: 'Section Title' },
            },
            {
              name: 'steps',
              type: 'array',
              label: { he: 'שלבים', en: 'Steps' },
              labels: {
                singular: { he: 'שלב', en: 'Step' },
                plural: { he: 'שלבים', en: 'Steps' },
              },
              fields: [
                {
                  name: 'stepNumber',
                  type: 'number',
                  label: { he: 'מספר שלב', en: 'Step Number' },
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
                {
                  name: 'icon',
                  type: 'text',
                  label: { he: 'אייקון', en: 'Icon' },
                },
              ],
            },
          ],
        },

        // --- Logo Bar / Partners Block ---
        {
          slug: 'logo-bar',
          labels: {
            singular: { he: 'שותפים / לקוחות', en: 'Partners / Clients' },
            plural: { he: 'שותפים / לקוחות', en: 'Partners / Clients' },
          },
          fields: [
            {
              name: 'sectionTitle',
              type: 'text',
              localized: true,
              label: { he: 'כותרת מקטע', en: 'Section Title' },
            },
            {
              name: 'logos',
              type: 'array',
              label: { he: 'לוגואים', en: 'Logos' },
              fields: [
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: { he: 'לוגו', en: 'Logo' },
                },
                {
                  name: 'name',
                  type: 'text',
                  label: { he: 'שם החברה', en: 'Company Name' },
                },
                {
                  name: 'url',
                  type: 'text',
                  label: { he: 'קישור', en: 'URL' },
                },
              ],
            },
          ],
        },
      ],
    },

    // --- SEO Fields ---
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
          admin: { description: { he: 'עד 60 תווים', en: 'Up to 60 characters' } },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { he: 'תיאור SEO', en: 'SEO Description' },
          admin: { description: { he: 'עד 160 תווים', en: 'Up to 160 characters' } },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: { he: 'תמונת שיתוף', en: 'OG Image' },
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          label: { he: 'הסתר מגוגל', en: 'No Index' },
          defaultValue: false,
        },
      ],
    },
  ],
}

// ============================================================
// collections/Media.ts - Image Uploads with Responsive Sizes
// ============================================================

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
      admin: {
        description: {
          he: 'תיאור קצר של התמונה - חשוב לנגישות ו-SEO',
          en: 'Short image description - important for accessibility and SEO',
        },
      },
    },
  ],
}

// ============================================================
// collections/Testimonials.ts - Customer Reviews
// ============================================================

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
      admin: { description: { he: 'לדוגמה: "בעלת מספרה בתל אביב"', en: 'e.g. "Salon owner in Tel Aviv"' } },
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

// ============================================================
// collections/FAQ.ts - Frequently Asked Questions
// ============================================================

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

// ============================================================
// collections/Users.ts - Admin Users with Roles
// ============================================================

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

// ============================================================
// collections/FormSubmissions.ts - Contact Form Submissions
// ============================================================

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  labels: {
    singular: { he: 'פנייה', en: 'Submission' },
    plural: { he: 'פניות', en: 'Submissions' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'createdAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: { he: 'שם', en: 'Name' },
    },
    {
      name: 'phone',
      type: 'text',
      label: { he: 'טלפון', en: 'Phone' },
    },
    {
      name: 'email',
      type: 'email',
      label: { he: 'אימייל', en: 'Email' },
    },
    {
      name: 'message',
      type: 'textarea',
      label: { he: 'הודעה', en: 'Message' },
    },
    {
      name: 'source',
      type: 'text',
      label: { he: 'מקור', en: 'Source' },
      admin: { position: 'sidebar', description: { he: 'מאיפה הגיע (URL)', en: 'Referrer URL' } },
    },
  ],
}

// ============================================================
// globals/SiteSettings.ts - Business Info, Colors, Social
// ============================================================

import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { he: 'הגדרות האתר', en: 'Site Settings' },
  fields: [
    // --- Business Info ---
    {
      name: 'businessName',
      type: 'text',
      required: true,
      localized: true,
      label: { he: 'שם העסק', en: 'Business Name' },
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
      label: { he: 'סלוגן', en: 'Tagline' },
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
      admin: { description: { he: 'פורמט בינלאומי: 972XXXXXXXXX (ללא + או 0)', en: 'International: 972XXXXXXXXX (no + or 0)' } },
    },
    {
      name: 'whatsappMessage',
      type: 'text',
      localized: true,
      label: { he: 'הודעת וואטסאפ ראשונית', en: 'WhatsApp Default Message' },
      admin: { description: { he: 'ההודעה שתופיע כשלוחצים על כפתור וואטסאפ', en: 'Pre-filled message for WhatsApp button' } },
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
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      label: { he: 'אייקון (Favicon)', en: 'Favicon' },
    },

    // --- Colors ---
    {
      name: 'colors',
      type: 'group',
      label: { he: 'צבעים', en: 'Colors' },
      fields: [
        { name: 'primary', type: 'text', label: { he: 'ראשי', en: 'Primary' }, admin: { description: 'HEX: #XXXXXX' } },
        { name: 'primaryLight', type: 'text', label: { he: 'ראשי בהיר', en: 'Primary Light' } },
        { name: 'primaryDark', type: 'text', label: { he: 'ראשי כהה', en: 'Primary Dark' } },
        { name: 'secondary', type: 'text', label: { he: 'משני', en: 'Secondary' } },
        { name: 'accent', type: 'text', label: { he: 'הדגשה', en: 'Accent' } },
      ],
    },

    // --- Social Media ---
    {
      name: 'social',
      type: 'group',
      label: { he: 'רשתות חברתיות', en: 'Social Media' },
      fields: [
        { name: 'facebook', type: 'text', label: 'Facebook' },
        { name: 'instagram', type: 'text', label: 'Instagram' },
        { name: 'tiktok', type: 'text', label: 'TikTok' },
        { name: 'linkedin', type: 'text', label: 'LinkedIn' },
        { name: 'youtube', type: 'text', label: 'YouTube' },
      ],
    },

    // --- Analytics ---
    {
      name: 'analyticsId',
      type: 'text',
      label: { he: 'Google Analytics ID', en: 'Google Analytics ID' },
      admin: { description: 'G-XXXXXXXXXX' },
    },
    {
      name: 'facebookPixelId',
      type: 'text',
      label: { he: 'Facebook Pixel ID', en: 'Facebook Pixel ID' },
    },

    // --- Legal ---
    {
      name: 'businessNumber',
      type: 'text',
      label: { he: 'ח.פ. / עוסק מורשה', en: 'Business Registration Number' },
    },
  ],
}

// ============================================================
// globals/Header.ts - Navigation + CTA Button
// ============================================================

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
        {
          name: 'style',
          type: 'select',
          label: { he: 'סגנון', en: 'Style' },
          defaultValue: 'primary',
          options: [
            { label: { he: 'ראשי', en: 'Primary' }, value: 'primary' },
            { label: { he: 'משני', en: 'Outline' }, value: 'outline' },
          ],
        },
      ],
    },
    {
      name: 'showPhone',
      type: 'checkbox',
      label: { he: 'הצג טלפון בכותרת', en: 'Show Phone in Header' },
      defaultValue: true,
    },
  ],
}

// ============================================================
// globals/Footer.ts - Copyright + Links
// ============================================================

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: { he: 'כותרת תחתונה', en: 'Footer' },
  fields: [
    {
      name: 'copyright',
      type: 'text',
      localized: true,
      label: { he: 'זכויות יוצרים', en: 'Copyright' },
      admin: { description: { he: 'ישתמש בשנה הנוכחית אוטומטית', en: 'Will use current year automatically' } },
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
    {
      name: 'showBusinessNumber',
      type: 'checkbox',
      label: { he: 'הצג ח.פ.', en: 'Show Business Number' },
      defaultValue: true,
    },
    {
      name: 'creditText',
      type: 'text',
      localized: true,
      label: { he: 'קרדיט', en: 'Credit' },
      defaultValue: 'נבנה על ידי MediaWave',
    },
  ],
}
