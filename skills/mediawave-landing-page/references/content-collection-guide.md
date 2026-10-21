# Content Collection Engine

## Contents

1. Overview
2. Why Parallel Content Collection
3. Client Content Brief (with the world shot list)
4. Photography Shot Lists by Industry
5. Testimonial Collection
6. Logo Requirements
7. Asset Processing Pipeline (sharp-based)
8. Interactive Questions (via AskUserQuestion)
9. Color Extraction from Logo (sharp)
10. Content Deadline Management
11. Delivery Instructions for Client
12. Asset Quality Checklist
13. Integration with Build Phase

## Overview

This workflow runs **in parallel with Phases 2-3** (Design Inspiration + Design System).
While the builder designs, the client collects content. By the time Phase 4 (Copy) starts,
all raw assets are processed and ready.

**Trigger:** Proposal approved (Phase 0.5 complete).
**Runs alongside:** Phase 2 (Inspiration) and Phase 3 (Design System).
**Output:** Processed assets + `asset-manifest.json` consumed by Phase 5 (Build).
**Template:** `templates/content-brief-he.md`, the document sent to the client.

**Under site-director:** Phases 2-3 do not run (its creative direction replaces them). The brief
still goes out right after the proposal, but its first section, the world shot list, must come
back **before** the concept (site-director stage 2). The rest of the content may still arrive in
parallel with the build.

---

## Why Parallel Content Collection

Content collection is the #1 bottleneck in landing page projects. Clients delay sending photos,
forget testimonials, and don't know what "high resolution" means. By:

1. Sending a clear, friendly Hebrew brief immediately after proposal approval
2. Running collection in parallel with design work
3. Processing assets automatically with sharp when they arrive

...we eliminate the gap between "design is ready" and "waiting for content."

---

## Client Content Brief

Send `templates/content-brief-he.md` immediately after proposal approval.

Under site-director the brief opens with "קודם כל: תמונות מהעבודה שלך" (10-20 workplace photos for
the world dossier). Those photos come before the concept, and that section is never skipped
because of Q10 or C1: those answers are about site assets, while the world photos are working
material. They stay in the project's `design/world/photos/` and go through the asset pipeline
below only after the client approves a photo for publication.

### Context-Aware Brief Generation

The brief is NOT generic. It auto-fills based on discovery answers:

| Discovery Answer | Brief Customization |
|---|---|
| Q1: Business Name | Brief title and personalization |
| Q2: Business Description | Industry-specific shot list selection |
| Q3: Conversion Goal | Required form fields / booking info |
| Q10: Existing Assets | Skip sections client already has (logo, photos); never the world shot list |
| QIL-1: Contact Method | Required business details (WhatsApp number, phone) |
| P5: Timeline | Content deadline calculation (brief deadline = project deadline minus 5 days) |
| W-Q1, W-Q2: Desk and documents (world block) | `[WORLD_SHOTS_EXTRA]`: 2-3 trade-specific shots as checklist lines ("the pressure gauge you use"); delete the placeholder when there are none |
| Proposal approval date | `[WORLD_PHOTOS_DEADLINE]`: a date before the creative direction starts (site-director stage 2); without site-director, before Phase 2 starts |

### Brief Delivery Method
- Generate from template with all placeholders filled
- Send as PDF or WhatsApp-friendly message (short version)
- Include a checklist the client can mark off
- Set a clear deadline with automated reminder at 50% and 80% of time elapsed

---

## Photography Shot Lists by Industry

These are included in the content brief based on the business type detected from Q2.

### Bakery / Pastry Shop (מאפייה / קונדיטוריה)

| Shot | Purpose | Technical Notes |
|---|---|---|
| Exterior storefront | Hero background or About section | Wide angle, daytime, signage visible |
| Display case / showcase | Products section | Eye-level, good lighting, arranged neatly |
| 3-5 signature items (close-up) | Product gallery / hero | Overhead or 45° angle, natural light, minimal props |
| Kitchen / workspace | Behind-the-scenes / trust | Action shot if possible (hands kneading, decorating) |
| Staff / owner portrait | About section / testimonial | Warm, smiling, wearing work attire |
| Packaging / branded items | Branding consistency | Clean background, logo visible |

**Industry-specific tips:**
- Photograph baked goods within 30 minutes of finishing (before they settle)
- Use a light-colored surface or wooden board as background
- Avoid overhead fluorescent lighting: natural window light is best
- Capture steam or fresh-out-of-oven texture if possible

---

### Hair Salon / Beauty (מספרה / יופי)

| Shot | Purpose | Technical Notes |
|---|---|---|
| Interior, full salon | Hero or About | Wide angle, clean stations, good lighting |
| Individual stations / chairs | Services section | Detail shots showing quality equipment |
| Before/after transformations (3-5) | Social proof / gallery | Same angle, same lighting, same distance |
| Products used / displayed | Trust / partnerships | Branded products arranged neatly |
| Team photo | About section | Professional but approachable, salon setting |
| Close-up detail work | Hero or gallery | Hands styling, coloring, cutting; shows expertise |

**Industry-specific tips:**
- Before/after photos MUST use identical conditions (lighting, angle, background)
- Get written permission from clients appearing in photos
- Show diversity in hair types and styles if possible
- Avoid clutter in the background: clean the station first

---

### Clinic / Medical / Dental (מרפאה / רפואה / שיניים)

| Shot | Purpose | Technical Notes |
|---|---|---|
| Reception / waiting area | First impression / trust | Clean, welcoming, organized |
| Treatment rooms | Services section | Equipment visible, sterile appearance |
| Equipment (key tools) | Trust / expertise | Close-up, clean, modern-looking |
| Team / doctor portrait | About section | White coat or professional attire, warm expression |
| Building exterior | Contact / directions | Clear signage, accessible entrance |
| Certificates / diplomas (if displayed) | Trust section | Readable, well-framed |

**Industry-specific tips:**
- Medical environments must look CLEAN: no clutter, no personal items
- Avoid showing patients (privacy regulations)
- Warm lighting over clinical fluorescent when possible
- Doctor portraits should balance professionalism with approachability

---

### Restaurant / Cafe (מסעדה / בית קפה)

| Shot | Purpose | Technical Notes |
|---|---|---|
| 5-8 signature dishes | Hero / menu / gallery | Overhead and 45° angles, natural light, styled |
| Interior ambiance | About / atmosphere | Wide angle, dim/warm lighting OK, occupied tables ideal |
| Exterior / entrance | Contact / directions | Daytime, signage visible, outdoor seating if exists |
| Chef / kitchen team | About section | Action shot in kitchen, or portrait |
| Bar / drink preparation | Gallery / atmosphere | Motion or detail shot |
| Table setting / details | Ambiance | Close-up, utensils, napkins, decor |

**Industry-specific tips:**
- Food photography is CRITICAL: this is the #1 conversion driver
- Natural daylight near a window is best for food
- Use a matte plate (not shiny) to avoid glare
- Style the plate: wipe edges, add garnish, position utensils intentionally
- Avoid flash: it kills food photography

---

### Tech / Startup / SaaS (טכנולוגיה / סטארטאפ)

| Shot | Purpose | Technical Notes |
|---|---|---|
| Office / workspace | About / culture | Natural light, clean desks, brand elements visible |
| Team photo (casual) | About section | Relaxed setting, genuine expressions |
| Product screenshots | Hero / features | High-res, clean browser chrome or device mockup |
| Individual team members | Team section | Consistent style (same background, similar framing) |
| Workspace details | Culture section | Whiteboards, monitors, coffee; tech atmosphere |
| Event / conference | Social proof | Team presenting, booth, audience |

**Industry-specific tips:**
- Product screenshots should be in device mockups (laptop, phone frames)
- Team photos should feel genuine, not corporate
- Show the actual product, not stock photos of "people using computers"
- Consistent editing style across all team member portraits

---

### General Services / Default

For business types not listed above, use this base shot list:

| Shot | Purpose |
|---|---|
| Business owner portrait | About section |
| Workspace / office | Background / trust |
| 3-5 work examples or results | Portfolio / gallery |
| Team (if applicable) | About section |
| Exterior / location | Contact / directions |
| Logo / branding elements | Header / footer |

---

## Testimonial Collection

### Fill-in-the-Blank Hebrew Templates

Send these to the client for them to distribute to their customers. The fill-in-the-blank format
removes the "blank page" problem: clients get testimonials 3x faster with templates.

#### Template 1: The Arrival Story
```
הגעתי ל[שם העסק] בגלל _______________ ומאז אני _______________.
מה שהכי הפתיע אותי זה _______________.
```

#### Template 2: The Special Factor
```
מה שמיוחד ב[שם העסק] זה _______________.
בהשוואה ל_______________ שניסיתי בעבר, פה _______________.
```

#### Template 3: The Recommendation
```
הייתי ממליץ/ה על [שם העסק] כי _______________.
אם את/ה מחפש/ת _______________, זה המקום.
```

#### Template 4: The Result
```
לפני שהגעתי ל[שם העסק], הבעיה שלי הייתה _______________.
אחרי _______________, התוצאה הייתה _______________.
```

#### Template 5: The Short & Sweet (for Google/FB reviews)
```
_______________, ממליץ/ה בחום! ⭐⭐⭐⭐⭐
```

### Testimonial Collection Instructions for Client

```
שלח/י את התבניות האלה ל-3-5 לקוחות מרוצים שלך.
בקש/י שימלאו תבנית אחת לפחות.
עדיף: שם מלא + תמונה + תפקיד/עיסוק (מגביר אמינות ב-30%).
אם יש ביקורות קיימות בגוגל או פייסבוק, מעולה, נשתמש גם בהן.
```

### From Existing Reviews
If the client has Google or Facebook reviews:
1. Extract the best 3-5 reviews
2. Clean up spelling/grammar (keep the voice)
3. Add reviewer name (public info)
4. Format for the testimonials CMS collection

---

## Logo Requirements

### Technical Specifications

| Priority | Format | Notes |
|---|---|---|
| Best | SVG or AI (vector) | Infinite scalability, smallest file size |
| Good | PNG with transparent background | At least 1000px wide |
| Acceptable | High-res JPEG | At least 1000px wide, will need background removal |
| Not usable | Low-res JPEG, screenshot, Word doc | Ask client for original source file |

### What to Ask the Client

```
את/ה יכול/ה לשלוח את הלוגו? עדיף בפורמט:
1. SVG או AI (וקטורי): האופציה הכי טובה
2. PNG עם רקע שקוף, ברזולוציה גבוהה
3. אם יש רק JPEG: לפחות 1000 פיקסל רוחב

💡 טיפ: בדרך כלל המעצב/ת שיצר/ה את הלוגו שלך שומר/ת את הקובץ המקורי.
אם אין, גם תמונה באיכות גבוהה תעבוד.
```

### Logo Processing Tasks
1. If raster: upscale if needed, remove background
2. Extract dominant colors for palette consideration (Phase 3)
3. Generate favicon set: 16px, 32px, 180px (Apple touch), 512px (PWA)
4. Create light and dark variants if applicable
5. Generate OG image version (1200x630) with logo centered

---

## Asset Processing Pipeline (sharp-based)

### Overview

All client-provided images are processed through a sharp pipeline before being used in the build.
This ensures consistent quality, optimal file sizes, and responsive image support.

### Processing Steps

```
Client uploads images
        │
        ▼
┌─────────────────────────┐
│  1. EXIF Strip          │  Remove metadata (GPS, camera info, timestamps)
│     + Auto-rotate       │  Fix mobile photo orientation
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  2. Resize to srcset    │  Generate responsive variants:
│     widths              │  640w / 768w / 1024w / 1366w / 1920w
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  3. Format conversion   │  Each size in 3 formats:
│     WebP + AVIF + JPEG  │  WebP (quality 80), AVIF (quality 50), JPEG (quality 85)
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  4. LQIP generation     │  Low Quality Image Placeholder:
│     (blur placeholder)  │  20px wide, blurred, base64-encoded
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  5. Favicon generation  │  From logo only:
│     (logo only)         │  16px, 32px, 180px (Apple), 512px (PWA)
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  6. Asset manifest      │  Generate asset-manifest.json
│     generation          │  Maps original → processed files + metadata
└─────────────────────────┘
```

### Sharp Processing Script

```javascript
// scripts/process-assets.mjs
import sharp from 'sharp';
import { readdir, mkdir, writeFile } from 'fs/promises';
import { join, parse } from 'path';

const SRCSET_WIDTHS = [640, 768, 1024, 1366, 1920];
const FORMATS = [
  { name: 'webp', options: { quality: 80 } },
  { name: 'avif', options: { quality: 50, effort: 4 } },
  { name: 'jpeg', options: { quality: 85, mozjpeg: true } },
];
const LQIP_WIDTH = 20;
const FAVICON_SIZES = [16, 32, 180, 512];

async function processImage(inputPath, outputDir) {
  const { name } = parse(inputPath);
  const metadata = await sharp(inputPath).metadata();
  const results = { original: inputPath, variants: [], lqip: null };

  // Strip EXIF and auto-rotate
  const baseImage = sharp(inputPath)
    .rotate() // auto-rotate based on EXIF
    .withMetadata({ orientation: undefined }); // strip EXIF

  // Generate responsive variants
  for (const width of SRCSET_WIDTHS) {
    // Skip sizes larger than original
    if (width > metadata.width) continue;

    for (const format of FORMATS) {
      const filename = `${name}-${width}w.${format.name}`;
      const outputPath = join(outputDir, filename);

      await baseImage
        .clone()
        .resize(width, null, { withoutEnlargement: true })
        .toFormat(format.name, format.options)
        .toFile(outputPath);

      results.variants.push({
        width,
        format: format.name,
        path: outputPath,
        filename,
      });
    }
  }

  // Generate LQIP (Low Quality Image Placeholder)
  const lqipBuffer = await baseImage
    .clone()
    .resize(LQIP_WIDTH)
    .blur(10)
    .webp({ quality: 20 })
    .toBuffer();

  results.lqip = `data:image/webp;base64,${lqipBuffer.toString('base64')}`;

  return results;
}

async function processLogo(logoPath, outputDir) {
  const faviconDir = join(outputDir, 'favicons');
  await mkdir(faviconDir, { recursive: true });
  const results = [];

  for (const size of FAVICON_SIZES) {
    const filename = size === 180
      ? 'apple-touch-icon.png'
      : size === 512
        ? 'icon-512.png'
        : `favicon-${size}x${size}.png`;

    await sharp(logoPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(join(faviconDir, filename));

    results.push({ size, filename, path: join(faviconDir, filename) });
  }

  // Generate ICO-compatible 32px for favicon.ico
  await sharp(logoPath)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(faviconDir, 'favicon.png'));

  return results;
}

async function generateManifest(imageResults, faviconResults, outputDir) {
  const manifest = {
    generated: new Date().toISOString(),
    images: imageResults.map((img) => ({
      original: img.original,
      lqip: img.lqip,
      srcset: Object.groupBy
        ? Object.groupBy(img.variants, (v) => v.format)
        : img.variants.reduce((acc, v) => {
            (acc[v.format] = acc[v.format] || []).push(v);
            return acc;
          }, {}),
    })),
    favicons: faviconResults,
  };

  await writeFile(
    join(outputDir, 'asset-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  return manifest;
}

// Main execution
async function main() {
  const inputDir = process.argv[2] || './client-assets';
  const outputDir = process.argv[3] || './public/optimized';

  await mkdir(outputDir, { recursive: true });

  const files = await readdir(inputDir);
  const imageFiles = files.filter((f) =>
    /\.(jpe?g|png|webp|tiff?)$/i.test(f)
  );
  const logoFile = files.find((f) => /logo/i.test(f));

  console.log(`Processing ${imageFiles.length} images...`);

  const imageResults = [];
  for (const file of imageFiles) {
    console.log(`  Processing: ${file}`);
    const result = await processImage(join(inputDir, file), outputDir);
    imageResults.push(result);
  }

  let faviconResults = [];
  if (logoFile) {
    console.log(`Generating favicons from: ${logoFile}`);
    faviconResults = await processLogo(join(inputDir, logoFile), outputDir);
  }

  const manifest = await generateManifest(imageResults, faviconResults, outputDir);
  console.log(`\nAsset manifest generated: ${outputDir}/asset-manifest.json`);
  console.log(`Total variants: ${manifest.images.reduce((sum, img) => sum + img.srcset.webp?.length + img.srcset.avif?.length + img.srcset.jpeg?.length, 0)}`);
}

main().catch(console.error);
```

### Usage

```bash
# Install sharp
npm install sharp

# Process all images in client-assets folder
node scripts/process-assets.mjs ./client-assets ./public/optimized

# Or with custom paths
node scripts/process-assets.mjs "C:/path/to/client/photos" "./public/images"
```

### Asset Manifest Format

```json
{
  "generated": "2026-03-22T10:00:00.000Z",
  "images": [
    {
      "original": "./client-assets/hero-bakery.jpg",
      "lqip": "data:image/webp;base64,UklGR...",
      "srcset": {
        "webp": [
          { "width": 640, "format": "webp", "filename": "hero-bakery-640w.webp" },
          { "width": 768, "format": "webp", "filename": "hero-bakery-768w.webp" },
          { "width": 1024, "format": "webp", "filename": "hero-bakery-1024w.webp" },
          { "width": 1366, "format": "webp", "filename": "hero-bakery-1366w.webp" },
          { "width": 1920, "format": "webp", "filename": "hero-bakery-1920w.webp" }
        ],
        "avif": [ ... ],
        "jpeg": [ ... ]
      }
    }
  ],
  "favicons": [
    { "size": 16, "filename": "favicon-16x16.png" },
    { "size": 32, "filename": "favicon-32x32.png" },
    { "size": 180, "filename": "apple-touch-icon.png" },
    { "size": 512, "filename": "icon-512.png" }
  ]
}
```

### Using the Manifest in Next.js

```tsx
// components/OptimizedImage.tsx
import manifest from '@/public/optimized/asset-manifest.json';

interface OptimizedImageProps {
  src: string; // original filename (e.g., "hero-bakery.jpg")
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function OptimizedImage({ src, alt, className, sizes, priority }: OptimizedImageProps) {
  const asset = manifest.images.find((img) => img.original.includes(src));
  if (!asset) return <img src={src} alt={alt} className={className} />;

  const webpSrcset = asset.srcset.webp
    ?.map((v) => `/optimized/${v.filename} ${v.width}w`)
    .join(', ');
  const avifSrcset = asset.srcset.avif
    ?.map((v) => `/optimized/${v.filename} ${v.width}w`)
    .join(', ');
  const fallbackSrc = `/optimized/${asset.srcset.jpeg?.[asset.srcset.jpeg.length - 1]?.filename}`;

  return (
    <picture>
      {avifSrcset && <source type="image/avif" srcSet={avifSrcset} sizes={sizes} />}
      {webpSrcset && <source type="image/webp" srcSet={webpSrcset} sizes={sizes} />}
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        style={{ backgroundImage: `url(${asset.lqip})`, backgroundSize: 'cover' }}
      />
    </picture>
  );
}
```

---

## Interactive Questions (via AskUserQuestion)

These are asked at proposal approval time or early in Phase 2. They determine how the content
brief is customized.

### Question C1: Professional Photography

```
יש לך תמונות מקצועיות של העסק?

1. ✅ כן, יש לי תמונות מקצועיות מוכנות
2. 📷 לא, נשתמש בתמונות סטוק מעוצבות (כלול במחיר)
3. 🔀 מיקס: יש חלק, צריך להשלים עם סטוק
```

**Context-aware follow-up:**
- If "Yes": Send the full industry-specific shot list, and ask the client to review what they have vs. gaps
- If "No": Skip shot list, prepare styled stock selection based on industry + color palette
- If "Mix": Send shot list, mark what client has, plan stock for the rest

### Question C2: Logo Format

```
באיזה פורמט הלוגו שלך?

1. SVG / AI (וקטורי): מעולה, זה הפורמט הטוב ביותר
2. PNG בלבד (תמונה ברזולוציה גבוהה)
3. אין לי לוגו, רוצה לוגו טקסטי מעוצב
4. אין לי לוגו, אצטרך עיצוב לוגו (לא כלול, תתומחר בנפרד)
```

**Context-aware follow-up:**
- If "SVG/AI": Perfect, proceed directly to color extraction
- If "PNG only": Check resolution. If below 500px, flag for upscaling or request original
- If "Text logo": Generate using design system fonts from Phase 3
- If "Need logo design": Quote separately (typically 500-800₪), or suggest text logo for now

### Question C3: Existing Testimonials

```
יש לך המלצות מלקוחות?

1. 📝 כן, טקסט (וואטסאפ / אימייל / מסמך)
2. ⭐ כן, ביקורות בגוגל או פייסבוק
3. ❌ אין, נשלח תבניות ללקוחות שלך למילוי
```

**Context-aware follow-up:**
- If "Text": Ask client to send as-is, we'll format and clean up
- If "Google/FB reviews": Extract top 3-5, format for testimonials section
- If "None": Include testimonial templates in the content brief, set 5-day deadline

### Question C4: Color Extraction from Logo

```
רוצה שנחלץ צבעים מהלוגו שלך לעיצוב האתר?

1. ✅ כן, תשתמשו בצבעי הלוגו כבסיס
2. ❌ לא, יש לי צבעים אחרים בראש (ציין/י אותם)
```

**Context-aware follow-up:**
- If "Yes": Use sharp to extract dominant colors, feed into Phase 3 design system
- If "No": Ask for specific colors or references, skip extraction

---

## Color Extraction from Logo (sharp)

When the client says "yes" to C4, extract the dominant palette:

```javascript
// scripts/extract-colors.mjs
import sharp from 'sharp';

async function extractDominantColors(logoPath, numColors = 5) {
  // Resize to small size for faster processing
  const { data, info } = await sharp(logoPath)
    .resize(100, 100, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Simple color frequency analysis
  const colorMap = new Map();

  for (let i = 0; i < data.length; i += 3) {
    const r = Math.round(data[i] / 16) * 16;
    const g = Math.round(data[i + 1] / 16) * 16;
    const b = Math.round(data[i + 2] / 16) * 16;
    const key = `${r},${g},${b}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  // Sort by frequency and return top colors
  const sorted = [...colorMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, numColors)
    .map(([rgb]) => {
      const [r, g, b] = rgb.split(',').map(Number);
      return {
        rgb: `rgb(${r}, ${g}, ${b})`,
        hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
      };
    });

  return sorted;
}

// Usage
const colors = await extractDominantColors('./client-assets/logo.png');
console.log('Dominant colors:', colors);
// Feed these into Phase 3 design system generation
```

---

## Content Deadline Management

### Timeline Calculation

```
Project deadline (from P5)          = Day X
Content deadline                    = Day X - 5 business days
First reminder                      = Content deadline - 3 days (50% elapsed)
Second reminder (urgent)            = Content deadline - 1 day (80% elapsed)
Escalation (project delay warning)  = Content deadline + 1 day
```

### Reminder Messages (Hebrew)

**First reminder (friendly):**
```
היי [CLIENT_NAME]! 👋
תזכורת ידידותית: צריך את התוכן (תמונות, לוגו, המלצות) עד [DEADLINE].
יש שאלות? אני כאן.
```

**Second reminder (urgent):**
```
היי [CLIENT_NAME],
מזכיר/ה שהדד-ליין לתוכן הוא [DEADLINE], כלומר מחר!
חסר לנו: [MISSING_ITEMS_LIST]
בלי זה לא נוכל לעמוד בלוח הזמנים.
```

**Escalation (delay warning):**
```
היי [CLIENT_NAME],
עדיין לא קיבלנו את [MISSING_ITEMS].
לוח הזמנים יידחה ביום עבודה אחד על כל יום עיכוב בתוכן.
תאריך ההשקה החדש: [NEW_LAUNCH_DATE].
```

---

## Delivery Instructions for Client

### How to Send Assets

Include these in the content brief:

```
📤 איך לשלוח את החומרים:

אופציה 1 (מועדף): Google Drive
- העלו את כל הקבצים לתיקייה אחת
- שתפו איתנו קישור עם הרשאת צפייה

אופציה 2: WeTransfer
- היכנסו ל-wetransfer.com
- העלו את הקבצים
- שלחו את הקישור ל-[BUILDER_EMAIL]

אופציה 3: WhatsApp
- שלחו כ"מסמך" (לא כתמונה, כך האיכות נשמרת!)
- ⚠️ חשוב: לחצו על סמל המהדק → "מסמך" → בחרו את התמונה
- אם שולחים כ"תמונה", וואטסאפ מקטין את האיכות!

❌ נא לא לשלוח:
- צילומי מסך של תמונות
- תמונות מוורד או PDF
- לוגו בגודל קטן (פחות מ-500 פיקסל)
```

---

## Asset Quality Checklist

Before processing, validate each asset:

| Check | Pass | Fail Action |
|---|---|---|
| Image resolution >= 1000px wide | OK | Request higher resolution |
| Image is not a screenshot | OK | Request original photo |
| Image is not blurry | OK | Request retake or alternative |
| Logo has transparent background | OK | Remove background with sharp |
| Logo resolution >= 500px | OK | Request vector or higher resolution |
| Testimonial has reviewer name | OK | Request name (first name OK) |
| Testimonial is in Hebrew | OK | Translate or request Hebrew version |
| Business info is complete | OK | Follow up on missing fields |

---

## Integration with Build Phase

The content collection engine outputs:

1. **`asset-manifest.json`**: consumed by the `OptimizedImage` component in Phase 5
2. **Processed images** in `public/optimized/`: WebP, AVIF, JPEG at all srcset widths
3. **Favicons** in `public/optimized/favicons/`: all sizes
4. **Testimonials**: formatted for Payload CMS testimonials collection
5. **Business info**: structured data for footer, contact page, schema.org markup

All of these feed directly into Phase 5 (Build) without any manual copying or processing.
