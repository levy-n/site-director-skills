# Phase 5: Next.js Build Guide

## Complete reference for building Hebrew RTL landing pages with Payload CMS 3.x + Next.js 15 + Tailwind CSS 4.

---

## Project Structure

```
project/
├── app/
│   ├── (frontend)/                # The landing page itself
│   │   ├── page.tsx               # Main landing page (server component)
│   │   └── layout.tsx             # Root layout with dir="rtl" lang="he"
│   ├── (payload)/                 # Admin Panel (auto-generated)
│   │   └── admin/
│   │       └── [[...segments]]/
│   │           └── page.tsx
│   ├── api/
│   │   └── [...payload]/
│   │       └── route.ts           # Payload REST API
│   └── my-route/
│       └── route.ts               # Custom API routes (form handling, etc.)
├── collections/                   # Payload collections
│   ├── Pages.ts
│   ├── Media.ts
│   ├── Testimonials.ts
│   ├── FAQItems.ts
│   └── FormSubmissions.ts
├── globals/                       # Payload globals
│   ├── SiteSettings.ts            # Business info, phone, social links
│   ├── HeroContent.ts
│   └── FooterContent.ts
├── blocks/                        # Payload block definitions
│   ├── HeroBlock.ts
│   ├── FeaturesBlock.ts
│   ├── TestimonialsBlock.ts
│   ├── FAQBlock.ts
│   ├── CTABlock.ts
│   └── ContactFormBlock.ts
├── components/                    # React components
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Testimonials.tsx
│   ├── FAQ.tsx
│   ├── CTA.tsx
│   ├── ContactForm.tsx
│   ├── WhatsAppButton.tsx
│   └── Footer.tsx
├── lib/
│   ├── payload-helpers.ts         # Data fetching utilities
│   └── fonts.ts                   # Hebrew font configuration
├── public/
│   ├── fonts/                     # Self-hosted fonts (if needed)
│   └── images/                    # Static images
├── payload.config.ts              # Payload CMS configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── next.config.mjs                # Next.js configuration
└── .env.local                     # Environment variables
```

---

## Root Layout Setup

### `app/(frontend)/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Heebo, Secular_One } from 'next/font/google'
import './globals.css'

// Body font: clean sans-serif, great for Hebrew body text
const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
  weight: ['300', '400', '500', '700', '900'],
})

// Display font: bold, impactful for headlines
const secularOne = Secular_One({
  subsets: ['hebrew', 'latin'],
  variable: '--font-secular',
  display: 'swap',
  weight: '400',
})

export const metadata: Metadata = {
  title: 'Business Name | One-Line Value Proposition',
  description: 'Hebrew meta description for SEO - up to 155 characters',
  openGraph: {
    locale: 'he_IL',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.variable} ${secularOne.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

### Key Points for Root Layout
- `dir="rtl"` on `<html>` element ensures entire page is RTL
- `lang="he"` tells browsers and screen readers the language is Hebrew
- Load Hebrew-compatible fonts via `next/font/google` for zero layout shift
- Use CSS variables (`--font-heebo`, `--font-secular`) to reference fonts in Tailwind config
- `display: 'swap'` ensures text is visible during font load
- Always include both `hebrew` and `latin` subsets (Hebrew pages contain English brand names, numbers, etc.)

---

## Component Patterns

### 1. Hero Section

```tsx
// components/Hero.tsx
import Image from 'next/image'
import Link from 'next/link'

interface HeroProps {
  headline: string          // Main headline in Hebrew
  subheadline: string       // Supporting text
  ctaText: string           // Button text, e.g., "קבלו הצעת מחיר"
  ctaLink: string           // Scroll to form or WhatsApp link
  backgroundImage?: string  // Payload media URL
}

export function Hero({ headline, subheadline, ctaText, ctaLink, backgroundImage }: HeroProps) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-bl from-primary-600 to-primary-900" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          {headline}
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          {subheadline}
        </p>
        <Link
          href={ctaLink}
          className="inline-block bg-accent-500 hover:bg-accent-600 text-white text-lg font-bold
                     px-8 py-4 rounded-xl transition-all duration-300
                     hover:scale-105 hover:shadow-xl shadow-accent-500/30"
        >
          {ctaText}
        </Link>
      </div>
    </section>
  )
}
```

**Hero Design Rules:**
- Full-width, minimum 80vh height
- Single, clear headline (maximum 8-10 words in Hebrew)
- One CTA button, prominent and contrasting color
- Background: large image with overlay OR bold gradient
- `priority` on hero image for LCP optimization
- Hebrew headlines need larger font sizes than English equivalents (~10% larger)

---

### 2. Features Section

```tsx
// components/Features.tsx
interface Feature {
  icon: string    // Emoji, SVG component name, or Lucide icon name
  title: string
  description: string
}

interface FeaturesProps {
  sectionTitle: string
  features: Feature[]
}

export function Features({ sectionTitle, features }: FeaturesProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          {sectionTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-primary-50
                         transition-colors duration-300 group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Features Design Rules:**
- Grid layout: 3 columns on desktop, 2 on tablet, 1 on mobile
- Each card: icon/emoji + title + short description (2-3 lines max)
- 3 or 6 features recommended (fills grid evenly)
- Icons should be visually consistent (all emoji, all line icons, or all filled icons)
- Center-aligned text works best for RTL card grids

---

### 3. Testimonials Section

```tsx
// components/Testimonials.tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'

interface Testimonial {
  name: string
  role?: string
  quote: string
  image?: string
  rating: number    // 1-5
}

interface TestimonialsProps {
  sectionTitle: string
  testimonials: Testimonial[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 justify-center mb-3" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export function Testimonials({ sectionTitle, testimonials }: TestimonialsProps) {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          {sectionTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md
                         transition-shadow duration-300 text-center"
            >
              {testimonial.image && (
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={80}
                  height={80}
                  className="rounded-full mx-auto mb-4 object-cover"
                />
              )}
              <StarRating rating={testimonial.rating} />
              <blockquote className="text-gray-700 mb-4 leading-relaxed text-lg">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <p className="font-bold text-gray-900">{testimonial.name}</p>
              {testimonial.role && (
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Testimonials Design Rules:**
- Grid or carousel (grid is simpler and more accessible)
- Each card: photo (optional) + star rating + quote + name + role
- Star rating component should use `dir="ltr"` (stars always left-to-right)
- Use real customer quotes whenever possible
- 3 testimonials is the minimum for credibility
- Quotation marks (`&ldquo;` / `&rdquo;`) enhance visual distinction

---

### 4. FAQ Section (Accordion)

```tsx
// components/FAQ.tsx
'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  sectionTitle: string
  items: FAQItem[]
}

export function FAQ({ sectionTitle, items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // Schema markup for SEO
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          {sectionTitle}
        </h2>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-start
                           bg-white hover:bg-gray-50 transition-colors duration-200"
                aria-expanded={openIndex === index}
              >
                <span className="font-bold text-lg text-gray-900">
                  {item.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-300 shrink-0 ms-4
                              ${openIndex === index ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out
                            ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="p-5 pt-0 text-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**FAQ Design Rules:**
- Accordion pattern: one item open at a time
- Use `text-start` instead of `text-right` for proper RTL alignment
- Include JSON-LD schema markup for FAQ rich snippets in Google
- Smooth open/close animation with `max-h` and `opacity` transitions
- Chevron icon rotates on open/close
- Use `ms-4` (margin-start) for the icon spacing (RTL-aware)
- `aria-expanded` for accessibility
- Maximum 5-8 FAQ items (keep it scannable)

---

### 5. CTA Section

```tsx
// components/CTA.tsx
import Link from 'next/link'

interface CTAProps {
  headline: string
  description?: string
  buttonText: string
  buttonLink: string
}

export function CTA({ headline, description, buttonText, buttonLink }: CTAProps) {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-bl from-primary-600 to-primary-800">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
          {headline}
        </h2>
        {description && (
          <p className="text-lg text-white/85 mb-8 max-w-xl mx-auto">
            {description}
          </p>
        )}
        <Link
          href={buttonLink}
          className="inline-block bg-white text-primary-700 text-lg font-bold
                     px-10 py-4 rounded-xl transition-all duration-300
                     hover:scale-105 hover:shadow-xl"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  )
}
```

**CTA Design Rules:**
- Bold background color or gradient that contrasts with surrounding sections
- Single, clear headline with urgency or value proposition
- One button only (no decision fatigue)
- Button color inverts the section (white on dark, or accent on light)
- Can appear multiple times on long pages (after features, after testimonials, at bottom)

---

### 6. Contact Form

```tsx
// components/ContactForm.tsx
'use client'

import { useState } from 'react'

interface ContactFormProps {
  sectionTitle: string
  submitButtonText?: string  // Default: "שליחה"
}

export function ContactForm({
  sectionTitle,
  submitButtonText = 'שליחה',
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          message: formData.get('message'),
        }),
      })

      if (!res.ok) throw new Error('שגיאה בשליחה')

      setIsSubmitted(true)
    } catch (err) {
      setError('אירעה שגיאה. אנא נסו שוב או צרו קשר בטלפון.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <section className="py-16 md:py-24 bg-gray-50" id="contact">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
            <div className="text-5xl mb-4">&#10003;</div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">תודה רבה!</h3>
            <p className="text-green-700">קיבלנו את פנייתכם ונחזור אליכם בהקדם.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-gray-50" id="contact">
      <div className="container mx-auto px-4 max-w-lg">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          {sectionTitle}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              שם מלא
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="הכניסו את שמכם"
              className="w-full px-4 py-3 rounded-xl border border-gray-300
                         focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                         outline-none transition-all duration-200 text-lg"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              טלפון
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              dir="ltr"
              placeholder="05X-XXX-XXXX"
              className="w-full px-4 py-3 rounded-xl border border-gray-300
                         focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                         outline-none transition-all duration-200 text-lg text-left"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              אימייל
            </label>
            <input
              type="email"
              id="email"
              name="email"
              dir="ltr"
              placeholder="example@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300
                         focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                         outline-none transition-all duration-200 text-lg text-left"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              הודעה
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="איך נוכל לעזור?"
              className="w-full px-4 py-3 rounded-xl border border-gray-300
                         focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                         outline-none transition-all duration-200 text-lg resize-none"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white text-lg font-bold
                       py-4 rounded-xl transition-all duration-300
                       hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'שולח...' : submitButtonText}
          </button>
        </form>
      </div>
    </section>
  )
}
```

**Contact Form Design Rules:**
- Minimal fields: name (required), phone (required), email (optional), message (optional)
- Phone and email inputs MUST have `dir="ltr"` (numbers and emails are LTR)
- Phone placeholder: Israeli format `05X-XXX-XXXX`
- All labels and placeholder text in Hebrew
- Error messages in Hebrew
- Success state replaces the entire form
- Loading state on submit button with Hebrew text ("...שולח")
- Form submits to API route that creates a Payload FormSubmission document
- `id="contact"` on the section for anchor links from CTA buttons

---

### 7. WhatsApp Floating Button

```tsx
// components/WhatsAppButton.tsx
'use client'

import { useState } from 'react'

interface WhatsAppButtonProps {
  phoneNumber: string   // Format: "972XXXXXXXXX" (no +, no leading 0, no dashes)
  message?: string      // Pre-filled message, e.g., "היי, אשמח לשמוע פרטים נוספים"
  tooltipText?: string  // Tooltip on hover, e.g., "דברו איתנו בוואטסאפ"
}

export function WhatsAppButton({
  phoneNumber,
  message = 'היי, אשמח לשמוע פרטים נוספים',
  tooltipText = 'דברו איתנו בוואטסאפ',
}: WhatsAppButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <div className="fixed bottom-6 start-6 z-50">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-16 start-0 bg-gray-900 text-white text-sm
                        py-2 px-4 rounded-lg whitespace-nowrap shadow-lg">
          {tooltipText}
        </div>
      )}

      {/* Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full
                   shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
        aria-label="WhatsApp"
      >
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  )
}
```

**WhatsApp Button Design Rules:**
- Fixed position: bottom-left (`start-6` in RTL = left side)
- In RTL context, the WhatsApp button should be on the LEFT side (start) since right side is the natural reading start
- Phone number format: `972XXXXXXXXX` (remove leading 0, remove +, remove dashes)
- Example: `054-123-4567` becomes `972541234567`
- Pre-filled message in Hebrew
- Green color: `#25D366` (official WhatsApp brand color)
- Tooltip on hover with Hebrew text
- Opens in new tab
- z-index 50 to stay above all content
- Pulse animation optional for attention

---

### 8. Footer

```tsx
// components/Footer.tsx
import Link from 'next/link'

interface FooterProps {
  businessName: string
  phone: string
  email: string
  address?: string
  socialLinks?: {
    facebook?: string
    instagram?: string
    linkedin?: string
  }
  navigationLinks?: {
    label: string
    href: string
  }[]
}

export function Footer({
  businessName,
  phone,
  email,
  address,
  socialLinks,
  navigationLinks,
}: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Business Info */}
          <div>
            <h3 className="text-white font-bold text-xl mb-4">{businessName}</h3>
            <div className="space-y-2">
              <a href={`tel:${phone.replace(/-/g, '')}`} dir="ltr" className="block hover:text-white transition-colors">
                {phone}
              </a>
              <a href={`mailto:${email}`} dir="ltr" className="block hover:text-white transition-colors">
                {email}
              </a>
              {address && <p>{address}</p>}
            </div>
          </div>

          {/* Navigation */}
          {navigationLinks && (
            <div>
              <h3 className="text-white font-bold text-xl mb-4">ניווט</h3>
              <ul className="space-y-2">
                {navigationLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Social Links */}
          {socialLinks && (
            <div>
              <h3 className="text-white font-bold text-xl mb-4">עקבו אחרינו</h3>
              <div className="flex gap-4">
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                     className="hover:text-white transition-colors" aria-label="Facebook">
                    {/* Facebook SVG icon */}
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                     className="hover:text-white transition-colors" aria-label="Instagram">
                    {/* Instagram SVG icon */}
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {businessName}. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  )
}
```

**Footer Design Rules:**
- Dark background for visual separation
- Three column grid: business info, navigation, social links
- Phone and email links use `dir="ltr"` for proper rendering
- Phone link uses `tel:` protocol (auto-dials on mobile)
- Email link uses `mailto:` protocol
- Copyright with dynamic year
- Hebrew: "כל הזכויות שמורות" = "All rights reserved"

---

## Tailwind CSS 4 Integration

### `tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-heebo)', 'Arial', 'sans-serif'],
        display: ['var(--font-secular)', 'var(--font-heebo)', 'Arial', 'sans-serif'],
      },
      colors: {
        // Design system tokens - customized per client
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
  plugins: [],
}

export default config
```

### Design System Token Strategy
- **Primary color**: Main brand color used for backgrounds, buttons, links
- **Accent color**: Contrast color for CTAs, highlights, emphasis
- Colors are defined as full shade ranges (50-950) for flexibility
- Each client gets custom primary/accent colors based on their brand
- Container is auto-centered with responsive padding

### `globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Hebrew text defaults */
  html {
    scroll-behavior: smooth;
  }

  body {
    @apply text-gray-800 bg-white;
    font-size: 16px;
    line-height: 1.7;
  }

  /* Hebrew-optimized heading sizes (10% larger than typical English) */
  h1 {
    @apply text-4xl md:text-5xl lg:text-6xl font-bold leading-tight;
  }

  h2 {
    @apply text-3xl md:text-4xl font-bold leading-tight;
  }

  h3 {
    @apply text-xl md:text-2xl font-bold;
  }

  /* Smooth focus styles */
  *:focus-visible {
    @apply outline-2 outline-offset-2 outline-primary-500;
  }
}

@layer utilities {
  /* Custom utilities for Hebrew landing pages */
  .text-balance {
    text-wrap: balance;
  }
}
```

---

## Responsive Design: Mobile-First Breakpoints

### Breakpoint Strategy

| Breakpoint | Min Width | Typical Device |
|-----------|----------|----------------|
| Default   | 0px      | Mobile phones  |
| `sm:`     | 640px    | Large phones / small tablets |
| `md:`     | 768px    | Tablets        |
| `lg:`     | 1024px   | Laptops        |
| `xl:`     | 1280px   | Desktops       |
| `2xl:`    | 1536px   | Large screens  |

### Mobile-First Patterns

```tsx
// Grid: 1 col -> 2 col -> 3 col
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Font sizes: small -> medium -> large
<h1 className="text-3xl md:text-4xl lg:text-6xl">

// Padding: compact -> spacious
<section className="py-12 md:py-16 lg:py-24">

// Hide on mobile, show on desktop
<div className="hidden md:block">

// Full width on mobile, contained on desktop
<div className="w-full lg:max-w-lg">
```

### Mobile-Specific Considerations for Israeli Market
- 83% of traffic is mobile (higher than global average)
- WhatsApp button must be easily tappable (min 44x44px touch target)
- Phone number should be clickable (`tel:` link)
- Form inputs need large touch targets (min 48px height)
- Sticky CTA bar on mobile can boost conversions
- Test on both iOS Safari and Android Chrome

---

## Animation Patterns

### CSS-Only Animations (Recommended for Performance)

```css
/* Fade in on scroll - use with Intersection Observer */
.animate-fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.animate-fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Pulse for WhatsApp button */
@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
}

.animate-pulse-ring::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 9999px;
  background: #25D366;
  animation: pulse-ring 2s ease-out infinite;
}
```

### Intersection Observer for Scroll Animations

```tsx
// hooks/useScrollAnimation.ts
'use client'

import { useEffect, useRef, useState } from 'react'

export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()  // Only animate once
        }
      },
      { threshold }
    )

    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}
```

### Framer Motion (Optional, for Complex Animations)

```tsx
// Only if client requests advanced animations
'use client'

import { motion } from 'framer-motion'

// Staggered children entrance
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

// Usage
<motion.div
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  {features.map((feature) => (
    <motion.div key={feature.id} variants={itemVariants}>
      {/* Feature card */}
    </motion.div>
  ))}
</motion.div>
```

**Animation Rules:**
- Prefer CSS-only animations for better performance
- Use Framer Motion only when CSS cannot achieve the effect
- All animations should be subtle (not distracting)
- Use `prefers-reduced-motion` media query to respect user preferences
- Animate once on first appearance (`viewport={{ once: true }}`)
- Keep animation duration under 600ms for entrance effects
- Use `ease-out` for entrance, `ease-in-out` for transitions

---

## Image Handling

### Payload Media Collection

```ts
// collections/Media.ts
import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 512, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'תיאור תמונה (Alt Text)',
    },
  ],
}
```

### Using next/image with Payload Media

```tsx
import Image from 'next/image'

// In a component:
<Image
  src={media.url}                    // Payload provides the URL
  alt={media.alt}                    // Alt text from Payload
  width={media.width}               // Original dimensions
  height={media.height}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="rounded-xl object-cover"
  priority={isAboveFold}             // true for hero images
/>
```

### Image Optimization Rules
- Always provide `alt` text (in Hebrew for Hebrew pages)
- Use `priority` attribute only for above-the-fold images (hero, first feature)
- Provide `sizes` attribute for responsive images
- Use Payload's built-in image resizing to serve appropriately sized images
- WebP/AVIF automatic format selection via Next.js Image component
- Lazy loading is default for non-priority images

---

## Form Handling

### Option A: API Route (Recommended)

```ts
// app/api/submit-form/route.ts
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email, message } = body

    // Validation
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'שם וטלפון הם שדות חובה' },
        { status: 400 }
      )
    }

    // Save to Payload CMS
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'form-submissions',
      data: { name, phone, email, message, submittedAt: new Date().toISOString() },
    })

    // Optional: Send email notification
    // await sendNotificationEmail({ name, phone, email, message })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.json(
      { error: 'שגיאה פנימית' },
      { status: 500 }
    )
  }
}
```

### Option B: Server Action

```ts
// app/actions/submitForm.ts
'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export async function submitForm(formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const message = formData.get('message') as string

  if (!name || !phone) {
    return { error: 'שם וטלפון הם שדות חובה' }
  }

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'form-submissions',
      data: { name, phone, email, message, submittedAt: new Date().toISOString() },
    })
    return { success: true }
  } catch (error) {
    return { error: 'אירעה שגיאה. אנא נסו שוב.' }
  }
}
```

### FormSubmissions Collection

```ts
// collections/FormSubmissions.ts
import { CollectionConfig } from 'payload'

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'email', 'submittedAt'],
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'שם' },
    { name: 'phone', type: 'text', required: true, label: 'טלפון' },
    { name: 'email', type: 'email', label: 'אימייל' },
    { name: 'message', type: 'textarea', label: 'הודעה' },
    { name: 'submittedAt', type: 'date', label: 'תאריך שליחה', admin: { readOnly: true } },
  ],
}
```

---

## RTL-Specific CSS Patterns

### Key RTL Adjustments

```css
/* Gradient direction flips in RTL */
/* LTR: left-to-right becomes RTL: right-to-left */
.bg-gradient-to-r  /* In RTL context, this goes right-to-left */
.bg-gradient-to-l  /* In RTL context, this goes left-to-right */

/* Use logical gradient directions for explicit control */
.bg-gradient-to-bl  /* Bottom-left: same visual in both directions */
```

### Tailwind RTL Utilities

```tsx
// Use logical properties (RTL-aware automatically)
<div className="ms-4">       {/* margin-start: right margin in RTL */}
<div className="me-4">       {/* margin-end: left margin in RTL */}
<div className="ps-4">       {/* padding-start: right padding in RTL */}
<div className="pe-4">       {/* padding-end: left padding in RTL */}
<div className="start-0">    {/* right: 0 in RTL */}
<div className="end-0">      {/* left: 0 in RTL */}
<div className="text-start">  {/* text-align: right in RTL */}
<div className="text-end">    {/* text-align: left in RTL */}

// For RTL-specific overrides
<div className="rtl:flex-row-reverse">
<div className="rtl:space-x-reverse">
```

### Common RTL Gotchas
1. **Flexbox `row`**: Already reversed in RTL, usually no action needed
2. **Absolute positioning**: Use `start/end` instead of `left/right`
3. **Border radius**: `rounded-s-xl` (start side) and `rounded-e-xl` (end side)
4. **Transforms**: `translateX` values may need to be negated in RTL
5. **Icons with direction**: Arrows, chevrons, and progress indicators need mirroring
6. **Box shadow direction**: Shadows with X-offset need adjustment

---

## Payload CMS Configuration

### `payload.config.ts`

```ts
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { uploadthingStorage } from '@payloadcms/storage-uploadthing'
import sharp from 'sharp'

import { Media } from './collections/Media'
import { Testimonials } from './collections/Testimonials'
import { FAQItems } from './collections/FAQItems'
import { FormSubmissions } from './collections/FormSubmissions'
import { SiteSettings } from './globals/SiteSettings'

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
    Media,
    Testimonials,
    FAQItems,
    FormSubmissions,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.POSTGRES_URL! },
  }),
  sharp,
  typescript: {
    outputFile: 'payload-types.ts',
  },
})
```

### Data Fetching Helper

```ts
// lib/payload-helpers.ts
import { getPayload } from 'payload'
import config from '@payload-config'

export async function getSiteSettings() {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'site-settings' })
}

export async function getTestimonials() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'testimonials',
    sort: 'order',
    limit: 10,
  })
  return result.docs
}

export async function getFAQItems() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'faq-items',
    sort: 'order',
    limit: 20,
  })
  return result.docs
}
```

---

## Main Landing Page Assembly

### `app/(frontend)/page.tsx`

```tsx
import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { Testimonials } from '@/components/Testimonials'
import { FAQ } from '@/components/FAQ'
import { CTA } from '@/components/CTA'
import { ContactForm } from '@/components/ContactForm'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Footer } from '@/components/Footer'
import { getSiteSettings, getTestimonials, getFAQItems } from '@/lib/payload-helpers'

export default async function LandingPage() {
  // Fetch all data in parallel
  const [settings, testimonials, faqItems] = await Promise.all([
    getSiteSettings(),
    getTestimonials(),
    getFAQItems(),
  ])

  return (
    <main>
      <Hero
        headline="כותרת ראשית חזקה ומשכנעת"
        subheadline="תיאור קצר שמסביר את הערך המוסף שלכם ללקוח"
        ctaText="קבלו הצעת מחיר"
        ctaLink="#contact"
      />

      <Features
        sectionTitle="למה לבחור בנו"
        features={[
          { icon: '🎯', title: 'יתרון ראשון', description: 'תיאור קצר של היתרון הראשון' },
          { icon: '⚡', title: 'יתרון שני', description: 'תיאור קצר של היתרון השני' },
          { icon: '🛡️', title: 'יתרון שלישי', description: 'תיאור קצר של היתרון השלישי' },
        ]}
      />

      <CTA
        headline="מוכנים להתחיל?"
        description="צרו קשר עוד היום וקבלו ייעוץ חינם"
        buttonText="דברו איתנו"
        buttonLink="#contact"
      />

      <Testimonials
        sectionTitle="מה הלקוחות שלנו אומרים"
        testimonials={testimonials}
      />

      <FAQ
        sectionTitle="שאלות נפוצות"
        items={faqItems}
      />

      <ContactForm sectionTitle="צרו קשר" />

      <Footer
        businessName={settings.businessName}
        phone={settings.phone}
        email={settings.email}
        address={settings.address}
      />

      <WhatsAppButton
        phoneNumber={settings.whatsappNumber}
        message="היי, אשמח לשמוע פרטים נוספים"
      />
    </main>
  )
}
```

**Page Assembly Rules:**
- Server component (no `'use client'`) for the main page
- Fetch all data in parallel with `Promise.all`
- Section order follows the natural sales funnel: attract, convince, prove, answer, convert
- CTA section can appear multiple times (between major sections)
- `id="contact"` on ContactForm for anchor link from CTAs
- WhatsApp button rendered last (it's position: fixed, so DOM order doesn't matter visually)
