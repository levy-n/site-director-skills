# Schema Markup Library for Israeli Landing Pages

> **Pre-made JSON-LD templates with Hebrew content and Israeli formatting.**
> All templates use a fictional bakery in Rehovot as the primary example.
> Replace `{{PLACEHOLDER}}` values with real business data.

---

## Table of Contents

1. [LocalBusiness Schema (+ Sub-Types)](#1-localbusiness-schema)
2. [FAQPage Schema](#2-faqpage-schema)
3. [BreadcrumbList Schema](#3-breadcrumblist-schema)
4. [Organization Schema](#4-organization-schema)
5. [WebPage Schema](#5-webpage-schema)
6. [ContactPoint Schema](#6-contactpoint-schema)
7. [OpeningHoursSpecification](#7-openinghoursspecification)
8. [GeoCoordinates](#8-geocoordinates)
9. [Review / AggregateRating](#9-review--aggregaterating)
10. [Service Schema](#10-service-schema)
11. [Product Schema](#11-product-schema)
12. [Event Schema](#12-event-schema)
13. [Implementation Guide (Next.js App Router)](#13-implementation-guide)
14. [Validation Checklist](#14-validation-checklist)

---

## Placeholder Reference

| Placeholder | Description | Example |
|---|---|---|
| `{{BUSINESS_NAME_HE}}` | Business name in Hebrew | מאפיית הלחם של שרון |
| `{{BUSINESS_NAME_EN}}` | Business name in English | Sharon's Bakery |
| `{{STREET_HE}}` | Street address in Hebrew | רחוב הרצל 42 |
| `{{CITY_HE}}` | City in Hebrew | רחובות |
| `{{CITY_EN}}` | City in English | Rehovot |
| `{{POSTAL_CODE}}` | Israeli postal code (7 digits) | 7610001 |
| `{{PHONE}}` | Phone in +972 format | +972-8-946-1234 |
| `{{PHONE_MOBILE}}` | Mobile in +972 format | +972-54-123-4567 |
| `{{WHATSAPP}}` | WhatsApp number | +972541234567 |
| `{{EMAIL}}` | Business email | info@example.co.il |
| `{{WEBSITE}}` | Full website URL | https://www.example.co.il |
| `{{LOGO_URL}}` | Logo image URL | https://www.example.co.il/logo.png |
| `{{IMAGE_URL}}` | Business photo URL | https://www.example.co.il/storefront.jpg |
| `{{LAT}}` | Latitude | 31.8928 |
| `{{LNG}}` | Longitude | 34.8113 |
| `{{DESCRIPTION_HE}}` | Hebrew description | מאפייה מקומית ברחובות... |
| `{{YEAR_FOUNDED}}` | Year established | 2015 |

---

## 1. LocalBusiness Schema

### 1.1 Base LocalBusiness Template

The foundational template. All sub-types below extend this structure.

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "{{WEBSITE}}/#localbusiness",
  "name": "{{BUSINESS_NAME_HE}}",
  "alternateName": "{{BUSINESS_NAME_EN}}",
  "description": "{{DESCRIPTION_HE}}",
  "url": "{{WEBSITE}}",
  "telephone": "{{PHONE}}",
  "email": "{{EMAIL}}",
  "image": "{{IMAGE_URL}}",
  "logo": "{{LOGO_URL}}",
  "priceRange": "{{PRICE_RANGE}}",
  "currenciesAccepted": "ILS",
  "paymentAccepted": "Cash, Credit Card, Bit, PayBox",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{STREET_HE}}",
    "addressLocality": "{{CITY_HE}}",
    "addressRegion": "מחוז המרכז",
    "postalCode": "{{POSTAL_CODE}}",
    "addressCountry": "IL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{LAT}}",
    "longitude": "{{LNG}}"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      "opens": "08:00",
      "closes": "19:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Friday",
      "opens": "08:00",
      "closes": "14:00"
    }
  ],
  "areaServed": [
    {
      "@type": "City",
      "name": "{{CITY_HE}}"
    }
  ],
  "sameAs": [
    "https://www.facebook.com/{{FB_PAGE}}",
    "https://www.instagram.com/{{IG_HANDLE}}",
    "https://g.page/{{GOOGLE_BUSINESS_ID}}"
  ]
}
```

---

### 1.2 Bakery (מאפייה)

```json
{
  "@context": "https://schema.org",
  "@type": "Bakery",
  "@id": "https://www.maafia-sharon.co.il/#bakery",
  "name": "מאפיית הלחם של שרון",
  "alternateName": "Sharon's Bakery Rehovot",
  "description": "מאפייה אורטיזנלית ברחובות המתמחה בלחמים מחמצת, מאפים טריים ועוגות בהזמנה אישית. חומרי גלם טבעיים בלבד, ללא חומרים משמרים.",
  "url": "https://www.maafia-sharon.co.il",
  "telephone": "+972-8-946-1234",
  "email": "info@maafia-sharon.co.il",
  "image": "https://www.maafia-sharon.co.il/images/storefront.jpg",
  "logo": "https://www.maafia-sharon.co.il/images/logo.png",
  "priceRange": "₪₪",
  "currenciesAccepted": "ILS",
  "paymentAccepted": "Cash, Credit Card, Bit, PayBox",
  "servesCuisine": "מאפים, לחמים, עוגות",
  "menu": "https://www.maafia-sharon.co.il/menu",
  "hasMenu": {
    "@type": "Menu",
    "url": "https://www.maafia-sharon.co.il/menu",
    "name": "תפריט מאפיית שרון"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "רחוב הרצל 42",
    "addressLocality": "רחובות",
    "addressRegion": "מחוז המרכז",
    "postalCode": "7610001",
    "addressCountry": "IL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "31.8928",
    "longitude": "34.8113"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      "opens": "06:30",
      "closes": "19:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Friday",
      "opens": "06:30",
      "closes": "14:00"
    }
  ],
  "areaServed": [
    { "@type": "City", "name": "רחובות" },
    { "@type": "City", "name": "נס ציונה" },
    { "@type": "City", "name": "ראשון לציון" }
  ],
  "sameAs": [
    "https://www.facebook.com/sharonbakery",
    "https://www.instagram.com/sharon_bakery_rehovot"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

---

### 1.3 Restaurant (מסעדה)

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": "{{WEBSITE}}/#restaurant",
  "name": "{{BUSINESS_NAME_HE}}",
  "alternateName": "{{BUSINESS_NAME_EN}}",
  "description": "מסעדה {{CUISINE_TYPE}} ב{{CITY_HE}}. {{SPECIALTIES}}. אווירה {{ATMOSPHERE}}, מתאים לזוגות ומשפחות.",
  "url": "{{WEBSITE}}",
  "telephone": "{{PHONE}}",
  "email": "{{EMAIL}}",
  "image": "{{IMAGE_URL}}",
  "logo": "{{LOGO_URL}}",
  "priceRange": "₪₪₪",
  "currenciesAccepted": "ILS",
  "paymentAccepted": "Cash, Credit Card, Bit",
  "servesCuisine": "{{CUISINE_TYPE_HE}}",
  "menu": "{{WEBSITE}}/menu",
  "hasMenu": {
    "@type": "Menu",
    "url": "{{WEBSITE}}/menu",
    "name": "תפריט {{BUSINESS_NAME_HE}}"
  },
  "acceptsReservations": "True",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{STREET_HE}}",
    "addressLocality": "{{CITY_HE}}",
    "addressRegion": "{{REGION_HE}}",
    "postalCode": "{{POSTAL_CODE}}",
    "addressCountry": "IL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{LAT}}",
    "longitude": "{{LNG}}"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      "opens": "12:00",
      "closes": "23:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Friday",
      "opens": "12:00",
      "closes": "15:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "20:00",
      "closes": "23:30"
    }
  ],
  "areaServed": [
    { "@type": "City", "name": "{{CITY_HE}}" }
  ],
  "sameAs": [
    "https://www.facebook.com/{{FB_PAGE}}",
    "https://www.instagram.com/{{IG_HANDLE}}"
  ]
}
```

---

### 1.4 HairSalon (מספרה)

```json
{
  "@context": "https://schema.org",
  "@type": "HairSalon",
  "@id": "{{WEBSITE}}/#hairsalon",
  "name": "{{BUSINESS_NAME_HE}}",
  "alternateName": "{{BUSINESS_NAME_EN}}",
  "description": "מספרה מקצועית ב{{CITY_HE}}. תספורות גברים ונשים, צביעה, החלקות, טיפולי שיער. צוות מעצבי שיער מנוסה עם מוצרי פרימיום.",
  "url": "{{WEBSITE}}",
  "telephone": "{{PHONE_MOBILE}}",
  "email": "{{EMAIL}}",
  "image": "{{IMAGE_URL}}",
  "logo": "{{LOGO_URL}}",
  "priceRange": "₪₪",
  "currenciesAccepted": "ILS",
  "paymentAccepted": "Cash, Credit Card, Bit",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{STREET_HE}}",
    "addressLocality": "{{CITY_HE}}",
    "addressRegion": "{{REGION_HE}}",
    "postalCode": "{{POSTAL_CODE}}",
    "addressCountry": "IL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{LAT}}",
    "longitude": "{{LNG}}"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      "opens": "09:00",
      "closes": "20:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Friday",
      "opens": "08:00",
      "closes": "14:00"
    }
  ],
  "areaServed": [
    { "@type": "City", "name": "{{CITY_HE}}" }
  ],
  "sameAs": [
    "https://www.facebook.com/{{FB_PAGE}}",
    "https://www.instagram.com/{{IG_HANDLE}}"
  ]
}
```

---

### 1.5 HealthAndBeautyBusiness (יופי ובריאות)

```json
{
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  "@id": "{{WEBSITE}}/#healthbeauty",
  "name": "{{BUSINESS_NAME_HE}}",
  "alternateName": "{{BUSINESS_NAME_EN}}",
  "description": "מכון יופי וטיפוח ב{{CITY_HE}}. טיפולי פנים, לייזר, מניקור ופדיקור, שעווה, עיצוב גבות. קוסמטיקאיות מוסמכות עם ניסיון של מעל {{YEARS}} שנים.",
  "url": "{{WEBSITE}}",
  "telephone": "{{PHONE_MOBILE}}",
  "email": "{{EMAIL}}",
  "image": "{{IMAGE_URL}}",
  "logo": "{{LOGO_URL}}",
  "priceRange": "₪₪",
  "currenciesAccepted": "ILS",
  "paymentAccepted": "Cash, Credit Card, Bit",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{STREET_HE}}",
    "addressLocality": "{{CITY_HE}}",
    "addressRegion": "{{REGION_HE}}",
    "postalCode": "{{POSTAL_CODE}}",
    "addressCountry": "IL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{LAT}}",
    "longitude": "{{LNG}}"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      "opens": "09:00",
      "closes": "20:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Friday",
      "opens": "09:00",
      "closes": "13:00"
    }
  ],
  "areaServed": [
    { "@type": "City", "name": "{{CITY_HE}}" }
  ],
  "sameAs": [
    "https://www.facebook.com/{{FB_PAGE}}",
    "https://www.instagram.com/{{IG_HANDLE}}"
  ]
}
```

---

### 1.6 Plumber (שרברב)

```json
{
  "@context": "https://schema.org",
  "@type": "Plumber",
  "@id": "{{WEBSITE}}/#plumber",
  "name": "{{BUSINESS_NAME_HE}}",
  "alternateName": "{{BUSINESS_NAME_EN}}",
  "description": "שרברב מוסמך ב{{CITY_HE}} והסביבה. פתיחת סתימות, תיקון נזילות, התקנת דוד שמש, צנרת חדשה, שיפוץ חדרי אמבטיה. שירות מהיר עם אחריות.",
  "url": "{{WEBSITE}}",
  "telephone": "{{PHONE_MOBILE}}",
  "email": "{{EMAIL}}",
  "image": "{{IMAGE_URL}}",
  "logo": "{{LOGO_URL}}",
  "priceRange": "₪₪",
  "currenciesAccepted": "ILS",
  "paymentAccepted": "Cash, Credit Card, Bit, Bank Transfer",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{STREET_HE}}",
    "addressLocality": "{{CITY_HE}}",
    "addressRegion": "{{REGION_HE}}",
    "postalCode": "{{POSTAL_CODE}}",
    "addressCountry": "IL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{LAT}}",
    "longitude": "{{LNG}}"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      "opens": "07:00",
      "closes": "19:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Friday",
      "opens": "07:00",
      "closes": "13:00"
    }
  ],
  "areaServed": [
    { "@type": "City", "name": "{{CITY_HE}}" },
    { "@type": "City", "name": "{{NEARBY_CITY_1}}" },
    { "@type": "City", "name": "{{NEARBY_CITY_2}}" },
    { "@type": "City", "name": "{{NEARBY_CITY_3}}" }
  ],
  "knowsAbout": [
    "פתיחת סתימות",
    "תיקון נזילות",
    "התקנת דוד שמש",
    "שיפוץ אמבטיות",
    "צנרת חדשה"
  ],
  "sameAs": [
    "https://www.facebook.com/{{FB_PAGE}}"
  ]
}
```

---

### 1.7 Electrician (חשמלאי)

```json
{
  "@context": "https://schema.org",
  "@type": "Electrician",
  "@id": "{{WEBSITE}}/#electrician",
  "name": "{{BUSINESS_NAME_HE}}",
  "alternateName": "{{BUSINESS_NAME_EN}}",
  "description": "חשמלאי מוסמך ב{{CITY_HE}} והסביבה. תיקוני חשמל, לוחות חשמל, התקנת תאורה, תקלות חשמל, חיווט דירות חדשות. רישיון חשמלאי מוסמך.",
  "url": "{{WEBSITE}}",
  "telephone": "{{PHONE_MOBILE}}",
  "email": "{{EMAIL}}",
  "image": "{{IMAGE_URL}}",
  "logo": "{{LOGO_URL}}",
  "priceRange": "₪₪",
  "currenciesAccepted": "ILS",
  "paymentAccepted": "Cash, Credit Card, Bit, Bank Transfer",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{STREET_HE}}",
    "addressLocality": "{{CITY_HE}}",
    "addressRegion": "{{REGION_HE}}",
    "postalCode": "{{POSTAL_CODE}}",
    "addressCountry": "IL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{LAT}}",
    "longitude": "{{LNG}}"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      "opens": "07:00",
      "closes": "19:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Friday",
      "opens": "07:00",
      "closes": "13:00"
    }
  ],
  "areaServed": [
    { "@type": "City", "name": "{{CITY_HE}}" },
    { "@type": "City", "name": "{{NEARBY_CITY_1}}" },
    { "@type": "City", "name": "{{NEARBY_CITY_2}}" }
  ],
  "knowsAbout": [
    "תיקוני חשמל",
    "לוחות חשמל",
    "התקנת תאורה",
    "חיווט דירות",
    "גילוי תקלות חשמל"
  ],
  "sameAs": [
    "https://www.facebook.com/{{FB_PAGE}}"
  ]
}
```

---

### 1.8 Attorney (עורך דין)

```json
{
  "@context": "https://schema.org",
  "@type": "Attorney",
  "@id": "{{WEBSITE}}/#attorney",
  "name": "{{BUSINESS_NAME_HE}}",
  "alternateName": "{{BUSINESS_NAME_EN}}",
  "description": "משרד עורכי דין ב{{CITY_HE}} המתמחה ב{{PRACTICE_AREAS_HE}}. ייצוג מקצועי, ליווי משפטי אישי, ייעוץ ראשוני ללא עלות.",
  "url": "{{WEBSITE}}",
  "telephone": "{{PHONE}}",
  "email": "{{EMAIL}}",
  "image": "{{IMAGE_URL}}",
  "logo": "{{LOGO_URL}}",
  "priceRange": "₪₪₪",
  "currenciesAccepted": "ILS",
  "paymentAccepted": "Credit Card, Bank Transfer, Check",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{STREET_HE}}",
    "addressLocality": "{{CITY_HE}}",
    "addressRegion": "{{REGION_HE}}",
    "postalCode": "{{POSTAL_CODE}}",
    "addressCountry": "IL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{LAT}}",
    "longitude": "{{LNG}}"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Friday",
      "opens": "09:00",
      "closes": "13:00"
    }
  ],
  "areaServed": [
    { "@type": "City", "name": "{{CITY_HE}}" },
    { "@type": "Country", "name": "ישראל" }
  ],
  "knowsAbout": [
    "{{PRACTICE_AREA_1}}",
    "{{PRACTICE_AREA_2}}",
    "{{PRACTICE_AREA_3}}"
  ],
  "sameAs": [
    "https://www.facebook.com/{{FB_PAGE}}",
    "https://www.linkedin.com/in/{{LINKEDIN_HANDLE}}"
  ]
}
```

---

### 1.9 Dentist (רופא שיניים)

```json
{
  "@context": "https://schema.org",
  "@type": "Dentist",
  "@id": "{{WEBSITE}}/#dentist",
  "name": "{{BUSINESS_NAME_HE}}",
  "alternateName": "{{BUSINESS_NAME_EN}}",
  "description": "מרפאת שיניים ב{{CITY_HE}}. טיפולי שיניים כלליים, השתלות, יישור שיניים, הלבנה, טיפולי שורש. צוות רופאים מומחים עם ציוד חדשני.",
  "url": "{{WEBSITE}}",
  "telephone": "{{PHONE}}",
  "email": "{{EMAIL}}",
  "image": "{{IMAGE_URL}}",
  "logo": "{{LOGO_URL}}",
  "priceRange": "₪₪₪",
  "currenciesAccepted": "ILS",
  "paymentAccepted": "Credit Card, Bank Transfer",
  "medicalSpecialty": "Dentistry",
  "availableService": [
    {
      "@type": "MedicalProcedure",
      "name": "השתלת שיניים",
      "procedureType": "https://schema.org/SurgicalProcedure"
    },
    {
      "@type": "MedicalProcedure",
      "name": "טיפול שורש"
    },
    {
      "@type": "MedicalProcedure",
      "name": "הלבנת שיניים"
    },
    {
      "@type": "MedicalProcedure",
      "name": "יישור שיניים (Invisalign)"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{STREET_HE}}",
    "addressLocality": "{{CITY_HE}}",
    "addressRegion": "{{REGION_HE}}",
    "postalCode": "{{POSTAL_CODE}}",
    "addressCountry": "IL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{LAT}}",
    "longitude": "{{LNG}}"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      "opens": "08:00",
      "closes": "19:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Friday",
      "opens": "08:00",
      "closes": "13:00"
    }
  ],
  "areaServed": [
    { "@type": "City", "name": "{{CITY_HE}}" }
  ],
  "sameAs": [
    "https://www.facebook.com/{{FB_PAGE}}",
    "https://www.instagram.com/{{IG_HANDLE}}"
  ]
}
```

---

### 1.10 ProfessionalService (שירות מקצועי)

Covers accountants, consultants, coaches, agencies, and any other professional service.

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "{{WEBSITE}}/#professionalservice",
  "name": "{{BUSINESS_NAME_HE}}",
  "alternateName": "{{BUSINESS_NAME_EN}}",
  "description": "{{SERVICE_TYPE_HE}} ב{{CITY_HE}}. {{SERVICE_DESCRIPTION_HE}}. ניסיון של מעל {{YEARS}} שנים, ליווי אישי ומקצועי.",
  "url": "{{WEBSITE}}",
  "telephone": "{{PHONE}}",
  "email": "{{EMAIL}}",
  "image": "{{IMAGE_URL}}",
  "logo": "{{LOGO_URL}}",
  "priceRange": "₪₪",
  "currenciesAccepted": "ILS",
  "paymentAccepted": "Credit Card, Bank Transfer, Bit",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{STREET_HE}}",
    "addressLocality": "{{CITY_HE}}",
    "addressRegion": "{{REGION_HE}}",
    "postalCode": "{{POSTAL_CODE}}",
    "addressCountry": "IL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{LAT}}",
    "longitude": "{{LNG}}"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Friday",
      "opens": "09:00",
      "closes": "13:00"
    }
  ],
  "areaServed": [
    { "@type": "City", "name": "{{CITY_HE}}" },
    { "@type": "Country", "name": "ישראל" }
  ],
  "sameAs": [
    "https://www.facebook.com/{{FB_PAGE}}",
    "https://www.linkedin.com/company/{{LINKEDIN_HANDLE}}"
  ]
}
```

---

### 1.11 AutomotiveBusiness (רכב)

```json
{
  "@context": "https://schema.org",
  "@type": "AutomotiveBusiness",
  "@id": "{{WEBSITE}}/#automotive",
  "name": "{{BUSINESS_NAME_HE}}",
  "alternateName": "{{BUSINESS_NAME_EN}}",
  "description": "מוסך מורשה ב{{CITY_HE}}. טיפולים שוטפים, תיקון מנועים, מערכות חשמל לרכב, פחחות וצבע, מיזוג אוויר לרכב. אחריות על כל עבודה.",
  "url": "{{WEBSITE}}",
  "telephone": "{{PHONE}}",
  "email": "{{EMAIL}}",
  "image": "{{IMAGE_URL}}",
  "logo": "{{LOGO_URL}}",
  "priceRange": "₪₪",
  "currenciesAccepted": "ILS",
  "paymentAccepted": "Cash, Credit Card, Bank Transfer",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{STREET_HE}}",
    "addressLocality": "{{CITY_HE}}",
    "addressRegion": "{{REGION_HE}}",
    "postalCode": "{{POSTAL_CODE}}",
    "addressCountry": "IL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{LAT}}",
    "longitude": "{{LNG}}"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      "opens": "07:30",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Friday",
      "opens": "07:30",
      "closes": "13:00"
    }
  ],
  "areaServed": [
    { "@type": "City", "name": "{{CITY_HE}}" },
    { "@type": "City", "name": "{{NEARBY_CITY_1}}" }
  ],
  "sameAs": [
    "https://www.facebook.com/{{FB_PAGE}}"
  ]
}
```

---

## 2. FAQPage Schema

### 2.1 Generic Business FAQ Template

Replace questions and answers with real, relevant content for the specific business.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "מה שעות הפתיחה של {{BUSINESS_NAME_HE}}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "אנחנו פתוחים ימים א'-ה' בין השעות {{OPEN_HOURS_WEEKDAY}}, ובימי שישי בין {{OPEN_HOURS_FRIDAY}}. בשבת ובחגים המקום סגור."
      }
    },
    {
      "@type": "Question",
      "name": "איך אפשר להגיע ל{{BUSINESS_NAME_HE}}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "אנחנו ממוקמים ב{{STREET_HE}}, {{CITY_HE}}. יש חניה חינם ברחוב ותחנת אוטובוס קו {{BUS_LINE}} במרחק דקת הליכה."
      }
    },
    {
      "@type": "Question",
      "name": "האם צריך לקבוע תור מראש?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{APPOINTMENT_ANSWER_HE}}"
      }
    },
    {
      "@type": "Question",
      "name": "אילו אמצעי תשלום אתם מקבלים?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "אנחנו מקבלים מזומן, כרטיסי אשראי, ביט ו-PayBox. ניתן גם לשלם בתשלומים עד 3 תשלומים ללא ריבית."
      }
    },
    {
      "@type": "Question",
      "name": "האם אתם נותנים אחריות על העבודה?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{WARRANTY_ANSWER_HE}}"
      }
    },
    {
      "@type": "Question",
      "name": "מה אזור השירות שלכם?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "אנחנו מספקים שירות ב{{CITY_HE}} ובערים הסמוכות כולל {{NEARBY_CITIES_LIST}}. לפרטים נוספים התקשרו אלינו."
      }
    },
    {
      "@type": "Question",
      "name": "כמה עולה {{PRIMARY_SERVICE}}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{PRICING_ANSWER_HE}}. אנחנו מציעים הצעת מחיר ללא התחייבות. התקשרו או שלחו הודעה בוואטסאפ לקבלת הצעה מותאמת."
      }
    },
    {
      "@type": "Question",
      "name": "יש לכם המלצות מלקוחות?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "בהחלט! יש לנו מעל {{REVIEW_COUNT}} ביקורות בגוגל עם ציון ממוצע של {{RATING}} כוכבים. אתם מוזמנים לקרוא את חוות הדעת של לקוחות שלנו בעמוד הגוגל שלנו."
      }
    }
  ]
}
```

### 2.2 Bakery FAQ Example (Complete)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "מה שעות הפתיחה של מאפיית הלחם של שרון?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "המאפייה פתוחה ימים א'-ה' מ-06:30 עד 19:00, ובימי שישי מ-06:30 עד 14:00. בשבת ובחגים המאפייה סגורה."
      }
    },
    {
      "@type": "Question",
      "name": "האם אפשר להזמין עוגה ליום הולדת?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "כן, אנחנו מכינים עוגות מעוצבות בהזמנה אישית לימי הולדת, בר/בת מצווה ואירועים. מומלץ להזמין לפחות 3 ימים מראש. צרו קשר בוואטסאפ לקבלת תמונות וקטלוג."
      }
    },
    {
      "@type": "Question",
      "name": "יש לכם מאפים ללא גלוטן?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "כן, יש לנו מבחר לחמים ומאפים ללא גלוטן שנאפים מדי יום. מומלץ להתקשר מראש כדי לוודא זמינות של המוצר הספציפי שאתם מחפשים."
      }
    },
    {
      "@type": "Question",
      "name": "איך מגיעים למאפיית שרון ברחובות?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "המאפייה ממוקמת ברחוב הרצל 42, רחובות, ליד כיכר הרצל. יש חניה חינם ברחוב ותחנת אוטובוס קו 174 במרחק 50 מטר."
      }
    },
    {
      "@type": "Question",
      "name": "האם הלחמים שלכם עם חומרים משמרים?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "לא. כל הלחמים והמאפים שלנו נאפים מחומרי גלם טבעיים בלבד, ללא חומרים משמרים, ללא צבעי מאכל מלאכותיים וללא שמנים מוקשים. אנחנו משתמשים בקמח איכותי, מחמצת טבעית ומלח ים."
      }
    },
    {
      "@type": "Question",
      "name": "אפשר לקנות בכמויות גדולות לאירועים?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "בוודאי! אנחנו מספקים מאפים לאירועים, חתונות, בריתות וכנסים. יש הנחה על הזמנות מעל 200 שקל. צרו קשר לקבלת הצעת מחיר מותאמת."
      }
    },
    {
      "@type": "Question",
      "name": "האם יש משלוחים מהמאפייה?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "כרגע אנחנו מציעים משלוח בוואלה ובוולט לאזור רחובות ונס ציונה. ניתן גם לבצע הזמנה טלפונית ולאסוף מהמאפייה."
      }
    }
  ]
}
```

---

## 3. BreadcrumbList Schema

### 3.1 Single-Page Site Breadcrumbs

Even single-page landing pages benefit from breadcrumb schema. It helps Google understand page hierarchy.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "דף הבית",
      "item": "{{WEBSITE}}"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "{{SERVICE_NAME_HE}}",
      "item": "{{WEBSITE}}/#{{SERVICE_SLUG}}"
    }
  ]
}
```

### 3.2 Multi-Page Site Breadcrumbs

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "דף הבית",
      "item": "{{WEBSITE}}"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "שירותים",
      "item": "{{WEBSITE}}/services"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "{{SPECIFIC_SERVICE_HE}}",
      "item": "{{WEBSITE}}/services/{{SERVICE_SLUG}}"
    }
  ]
}
```

### 3.3 Bakery Example (Complete)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "מאפיית הלחם של שרון",
      "item": "https://www.maafia-sharon.co.il"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "מאפייה ברחובות",
      "item": "https://www.maafia-sharon.co.il/#bakery"
    }
  ]
}
```

---

## 4. Organization Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "{{WEBSITE}}/#organization",
  "name": "{{BUSINESS_NAME_HE}}",
  "alternateName": "{{BUSINESS_NAME_EN}}",
  "description": "{{DESCRIPTION_HE}}",
  "url": "{{WEBSITE}}",
  "logo": {
    "@type": "ImageObject",
    "url": "{{LOGO_URL}}",
    "width": "600",
    "height": "600"
  },
  "image": "{{IMAGE_URL}}",
  "telephone": "{{PHONE}}",
  "email": "{{EMAIL}}",
  "foundingDate": "{{YEAR_FOUNDED}}",
  "founder": {
    "@type": "Person",
    "name": "{{FOUNDER_NAME_HE}}"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{STREET_HE}}",
    "addressLocality": "{{CITY_HE}}",
    "addressRegion": "{{REGION_HE}}",
    "postalCode": "{{POSTAL_CODE}}",
    "addressCountry": "IL"
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "{{PHONE}}",
      "contactType": "customer service",
      "areaServed": "IL",
      "availableLanguage": ["Hebrew", "English"]
    }
  ],
  "sameAs": [
    "https://www.facebook.com/{{FB_PAGE}}",
    "https://www.instagram.com/{{IG_HANDLE}}",
    "https://www.linkedin.com/company/{{LINKEDIN_HANDLE}}",
    "https://www.youtube.com/@{{YT_HANDLE}}"
  ]
}
```

### 4.1 Bakery Organization Example (Complete)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.maafia-sharon.co.il/#organization",
  "name": "מאפיית הלחם של שרון",
  "alternateName": "Sharon's Bakery Rehovot",
  "description": "מאפייה אורטיזנלית ברחובות. לחמים מחמצת, מאפים טריים ועוגות בהזמנה אישית מחומרי גלם טבעיים.",
  "url": "https://www.maafia-sharon.co.il",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.maafia-sharon.co.il/images/logo.png",
    "width": "600",
    "height": "600"
  },
  "image": "https://www.maafia-sharon.co.il/images/storefront.jpg",
  "telephone": "+972-8-946-1234",
  "email": "info@maafia-sharon.co.il",
  "foundingDate": "2015",
  "founder": {
    "@type": "Person",
    "name": "שרון לוי"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "רחוב הרצל 42",
    "addressLocality": "רחובות",
    "addressRegion": "מחוז המרכז",
    "postalCode": "7610001",
    "addressCountry": "IL"
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+972-8-946-1234",
      "contactType": "customer service",
      "areaServed": "IL",
      "availableLanguage": ["Hebrew", "English"]
    }
  ],
  "sameAs": [
    "https://www.facebook.com/sharonbakery",
    "https://www.instagram.com/sharon_bakery_rehovot"
  ]
}
```

---

## 5. WebPage Schema

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "{{WEBSITE}}/#webpage",
  "url": "{{WEBSITE}}",
  "name": "{{PAGE_TITLE_HE}} | {{BUSINESS_NAME_HE}}",
  "description": "{{META_DESCRIPTION_HE}}",
  "inLanguage": "he",
  "isPartOf": {
    "@type": "WebSite",
    "@id": "{{WEBSITE}}/#website",
    "url": "{{WEBSITE}}",
    "name": "{{BUSINESS_NAME_HE}}",
    "inLanguage": "he"
  },
  "about": {
    "@id": "{{WEBSITE}}/#localbusiness"
  },
  "datePublished": "{{DATE_PUBLISHED}}",
  "dateModified": "{{DATE_MODIFIED}}",
  "primaryImageOfPage": {
    "@type": "ImageObject",
    "url": "{{OG_IMAGE_URL}}"
  },
  "breadcrumb": {
    "@id": "{{WEBSITE}}/#breadcrumb"
  }
}
```

### 5.1 Bakery WebPage Example (Complete)

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.maafia-sharon.co.il/#webpage",
  "url": "https://www.maafia-sharon.co.il",
  "name": "מאפיית הלחם של שרון | מאפייה ברחובות",
  "description": "מאפיית הלחם של שרון - מאפייה אורטיזנלית ברחובות. לחמים מחמצת, מאפים טריים ועוגות בהזמנה. חומרי גלם טבעיים בלבד.",
  "inLanguage": "he",
  "isPartOf": {
    "@type": "WebSite",
    "@id": "https://www.maafia-sharon.co.il/#website",
    "url": "https://www.maafia-sharon.co.il",
    "name": "מאפיית הלחם של שרון",
    "inLanguage": "he"
  },
  "about": {
    "@id": "https://www.maafia-sharon.co.il/#bakery"
  },
  "datePublished": "2024-01-15",
  "dateModified": "2025-03-20",
  "primaryImageOfPage": {
    "@type": "ImageObject",
    "url": "https://www.maafia-sharon.co.il/images/og-image.jpg"
  },
  "breadcrumb": {
    "@id": "https://www.maafia-sharon.co.il/#breadcrumb"
  }
}
```

---

## 6. ContactPoint Schema

### 6.1 Standard Phone Contact

```json
{
  "@type": "ContactPoint",
  "telephone": "{{PHONE}}",
  "contactType": "customer service",
  "areaServed": "IL",
  "availableLanguage": ["Hebrew", "English"],
  "hoursAvailable": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    "opens": "08:00",
    "closes": "19:00"
  }
}
```

### 6.2 WhatsApp Contact

```json
{
  "@type": "ContactPoint",
  "telephone": "{{PHONE_MOBILE}}",
  "contactType": "customer service",
  "contactOption": "https://schema.org/TollFree",
  "areaServed": "IL",
  "availableLanguage": ["Hebrew", "English"]
}
```

> **Note on WhatsApp:** Schema.org does not have a native WhatsApp type. Use standard `ContactPoint` with the mobile number. Add WhatsApp link functionality in the HTML/UI layer, not in schema markup.

### 6.3 Multiple Contact Points

```json
"contactPoint": [
  {
    "@type": "ContactPoint",
    "telephone": "+972-8-946-1234",
    "contactType": "customer service",
    "areaServed": "IL",
    "availableLanguage": ["Hebrew", "English"]
  },
  {
    "@type": "ContactPoint",
    "telephone": "+972-54-123-4567",
    "contactType": "sales",
    "areaServed": "IL",
    "availableLanguage": ["Hebrew"]
  },
  {
    "@type": "ContactPoint",
    "telephone": "+972-54-123-4567",
    "contactType": "emergency",
    "areaServed": "IL",
    "availableLanguage": ["Hebrew"],
    "hoursAvailable": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "00:00",
      "closes": "23:59"
    }
  }
]
```

### 6.4 Israeli Phone Format Reference

| Type | Format | Example |
|---|---|---|
| Landline (02) | +972-2-XXX-XXXX | +972-2-623-4567 |
| Landline (03) | +972-3-XXX-XXXX | +972-3-512-3456 |
| Landline (04) | +972-4-XXX-XXXX | +972-4-831-2345 |
| Landline (08) | +972-8-XXX-XXXX | +972-8-946-1234 |
| Landline (09) | +972-9-XXX-XXXX | +972-9-774-5678 |
| Mobile (050) | +972-50-XXX-XXXX | +972-50-123-4567 |
| Mobile (052) | +972-52-XXX-XXXX | +972-52-234-5678 |
| Mobile (053) | +972-53-XXX-XXXX | +972-53-345-6789 |
| Mobile (054) | +972-54-XXX-XXXX | +972-54-456-7890 |
| Mobile (058) | +972-58-XXX-XXXX | +972-58-567-8901 |

---

## 7. OpeningHoursSpecification

### 7.1 Standard Office Hours (Sun-Thu + Fri Short)

The most common Israeli business schedule.

```json
"openingHoursSpecification": [
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    "opens": "09:00",
    "closes": "18:00"
  },
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": "Friday",
    "opens": "09:00",
    "closes": "13:00"
  }
]
```

### 7.2 Restaurant Hours (With Saturday Evening)

```json
"openingHoursSpecification": [
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    "opens": "12:00",
    "closes": "23:00"
  },
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": "Friday",
    "opens": "12:00",
    "closes": "15:00"
  },
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": "Saturday",
    "opens": "20:00",
    "closes": "23:30"
  }
]
```

### 7.3 Extended Hours / Evening Service

For businesses like salons or gyms that stay open late.

```json
"openingHoursSpecification": [
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    "opens": "07:00",
    "closes": "22:00"
  },
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": "Friday",
    "opens": "07:00",
    "closes": "15:00"
  },
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": "Saturday",
    "opens": "19:00",
    "closes": "22:00"
  }
]
```

### 7.4 24/7 Emergency Service

For plumbers, locksmiths, tow services, etc.

```json
"openingHoursSpecification": [
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Sunday", "Monday", "Tuesday", "Wednesday",
      "Thursday", "Friday", "Saturday"
    ],
    "opens": "00:00",
    "closes": "23:59"
  }
]
```

### 7.5 Split Hours (Morning + Evening, Closed Afternoon)

Common for some medical clinics and traditional shops.

```json
"openingHoursSpecification": [
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Sunday", "Tuesday", "Thursday"],
    "opens": "08:00",
    "closes": "13:00"
  },
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Sunday", "Tuesday", "Thursday"],
    "opens": "16:00",
    "closes": "19:00"
  },
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Wednesday"],
    "opens": "08:00",
    "closes": "13:00"
  },
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": "Friday",
    "opens": "08:00",
    "closes": "12:00"
  }
]
```

### 7.6 Important Notes on Israeli Hours

- **Saturday (Shabbat):** Most businesses are closed. If open, usually only Saturday evening after Shabbat ends.
- **Friday:** Short day. Almost all businesses close by 14:00-15:00 at the latest.
- **Sunday:** This is the FIRST workday of the week in Israel. Always include Sunday in opening hours.
- **Holidays:** Schema does not directly support holiday hours. Handle holidays with `specialOpeningHoursSpecification` or update seasonally.

---

## 8. GeoCoordinates

### 8.1 Basic Template

```json
{
  "@type": "GeoCoordinates",
  "latitude": "{{LAT}}",
  "longitude": "{{LNG}}"
}
```

### 8.2 Common Israeli City Coordinates (Approximate Centers)

Use these as starting points, then adjust to exact business location.

| City | Latitude | Longitude |
|---|---|---|
| תל אביב (Tel Aviv) | 32.0853 | 34.7818 |
| ירושלים (Jerusalem) | 31.7683 | 35.2137 |
| חיפה (Haifa) | 32.7940 | 34.9896 |
| רחובות (Rehovot) | 31.8928 | 34.8113 |
| נתניה (Netanya) | 32.3215 | 34.8532 |
| באר שבע (Beer Sheva) | 31.2530 | 34.7915 |
| ראשון לציון (Rishon LeZion) | 31.9500 | 34.8000 |
| פתח תקווה (Petah Tikva) | 32.0841 | 34.8878 |
| אשדוד (Ashdod) | 31.8014 | 34.6435 |
| הרצליה (Herzliya) | 32.1627 | 34.8447 |
| כפר סבא (Kfar Saba) | 32.1781 | 34.9065 |
| רעננה (Ra'anana) | 32.1836 | 34.8714 |
| מודיעין (Modiin) | 31.8969 | 35.0104 |
| נס ציונה (Ness Ziona) | 31.9293 | 34.7957 |

### 8.3 Accuracy Requirements

- Coordinates must point to the **exact business location**, not just the city center.
- Use Google Maps to get precise coordinates: right-click on the location, click the coordinates to copy.
- Accuracy matters for Google Maps integration and "near me" searches.
- Always verify coordinates by pasting them back into Google Maps.
- Use at least 4 decimal places for precision (within ~11 meters).

---

## 9. Review / AggregateRating

### 9.1 AggregateRating Template

```json
{
  "@type": "AggregateRating",
  "ratingValue": "{{RATING}}",
  "reviewCount": "{{REVIEW_COUNT}}",
  "bestRating": "5",
  "worstRating": "1"
}
```

### 9.2 Individual Review Template

```json
{
  "@type": "Review",
  "author": {
    "@type": "Person",
    "name": "{{REVIEWER_NAME}}"
  },
  "datePublished": "{{REVIEW_DATE}}",
  "reviewBody": "{{REVIEW_TEXT_HE}}",
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "{{REVIEW_RATING}}",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

### 9.3 Bakery Example with Reviews (Complete)

```json
{
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "reviewCount": "127",
  "bestRating": "5",
  "worstRating": "1"
},
"review": [
  {
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": "יעל כהן"
    },
    "datePublished": "2025-02-15",
    "reviewBody": "הלחם הכי טוב ברחובות! לחם מחמצת מדהים, חלות לשבת שאין כמוהן. תמיד טרי ואיכותי.",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "5",
      "bestRating": "5",
      "worstRating": "1"
    }
  },
  {
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": "דני לוי"
    },
    "datePublished": "2025-01-28",
    "reviewBody": "הזמנתי עוגת יום הולדת לבת שלי - יצא מושלם! עיצוב יפהפה וטעם מעולה. כולם שאלו מאיפה זה.",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "5",
      "bestRating": "5",
      "worstRating": "1"
    }
  }
]
```

### 9.4 CRITICAL: Review Integrity Rules

- **NEVER fabricate reviews.** Only use real reviews from real customers.
- Reviews in schema must correspond to actual reviews visible on the page.
- The `aggregateRating` must match the real Google Business Profile rating.
- If the business has no reviews yet, do NOT include AggregateRating or Review schema.
- Google can issue a manual action (penalty) for fake or misleading review markup.
- Best practice: pull `ratingValue` and `reviewCount` from Google Business Profile and keep it updated.

---

## 10. Service Schema

### 10.1 Single Service Template

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "{{WEBSITE}}/#service-{{SERVICE_SLUG}}",
  "name": "{{SERVICE_NAME_HE}}",
  "description": "{{SERVICE_DESCRIPTION_HE}}",
  "provider": {
    "@id": "{{WEBSITE}}/#localbusiness"
  },
  "areaServed": [
    { "@type": "City", "name": "{{CITY_HE}}" },
    { "@type": "City", "name": "{{NEARBY_CITY_1}}" }
  ],
  "serviceType": "{{SERVICE_TYPE_HE}}",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "ILS",
    "price": "{{PRICE}}",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "priceCurrency": "ILS",
      "price": "{{PRICE}}",
      "unitText": "{{UNIT_HE}}"
    }
  }
}
```

### 10.2 Multiple Services Template

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "{{WEBSITE}}/#localbusiness",
  "name": "{{BUSINESS_NAME_HE}}",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "שירותים",
    "itemListElement": [
      {
        "@type": "OfferCatalog",
        "name": "{{SERVICE_CATEGORY_1_HE}}",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "{{SERVICE_1_NAME_HE}}",
              "description": "{{SERVICE_1_DESC_HE}}"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "{{SERVICE_2_NAME_HE}}",
              "description": "{{SERVICE_2_DESC_HE}}"
            }
          }
        ]
      }
    ]
  }
}
```

### 10.3 Bakery Services Example (Complete)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://www.maafia-sharon.co.il/#service-custom-cakes",
  "name": "עוגות בהזמנה אישית",
  "description": "עוגות מעוצבות בהזמנה אישית לימי הולדת, בר/בת מצווה, חתונות ואירועים. עיצוב לפי בקשה עם חומרי גלם טבעיים ואיכותיים.",
  "provider": {
    "@id": "https://www.maafia-sharon.co.il/#bakery"
  },
  "areaServed": [
    { "@type": "City", "name": "רחובות" },
    { "@type": "City", "name": "נס ציונה" },
    { "@type": "City", "name": "ראשון לציון" }
  ],
  "serviceType": "הכנת עוגות",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "ILS",
    "price": "250",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "priceCurrency": "ILS",
      "minPrice": "250",
      "maxPrice": "800",
      "unitText": "לעוגה"
    }
  }
}
```

### 10.4 Service with Price Range (No Fixed Price)

When there is no fixed price and you want to indicate "call for quote":

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "{{SERVICE_NAME_HE}}",
  "description": "{{SERVICE_DESCRIPTION_HE}}. לקבלת הצעת מחיר מותאמת צרו קשר.",
  "provider": {
    "@id": "{{WEBSITE}}/#localbusiness"
  },
  "areaServed": [
    { "@type": "City", "name": "{{CITY_HE}}" }
  ]
}
```

> **Note:** If no fixed price exists, omit the `offers` field entirely rather than using fake prices.

---

## 11. Product Schema

For businesses that sell physical products (not just services).

### 11.1 Basic Product Template

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{{PRODUCT_NAME_HE}}",
  "description": "{{PRODUCT_DESCRIPTION_HE}}",
  "image": "{{PRODUCT_IMAGE_URL}}",
  "brand": {
    "@type": "Brand",
    "name": "{{BUSINESS_NAME_HE}}"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "ILS",
    "price": "{{PRICE}}",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@id": "{{WEBSITE}}/#localbusiness"
    }
  }
}
```

### 11.2 Bakery Product Example (Complete)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "לחם מחמצת כפרי",
  "description": "לחם מחמצת טבעית, נאפה באבן. קמח מלא, מלח ים ומחמצת בת 8 שנים. ללא חומרים משמרים. משקל כ-800 גרם.",
  "image": "https://www.maafia-sharon.co.il/images/sourdough-bread.jpg",
  "brand": {
    "@type": "Brand",
    "name": "מאפיית הלחם של שרון"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "ILS",
    "price": "32",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@id": "https://www.maafia-sharon.co.il/#bakery"
    }
  }
}
```

### 11.3 When to Use Product vs Service Schema

| Use Product Schema | Use Service Schema |
|---|---|
| Physical goods for sale | Work performed for a customer |
| Items with SKU/barcode | Activities with no physical product |
| Bakery items, retail goods | Plumbing, legal services |
| Items with fixed inventory | Appointment-based work |

---

## 12. Event Schema

### 12.1 Basic Event Template

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "{{EVENT_NAME_HE}}",
  "description": "{{EVENT_DESCRIPTION_HE}}",
  "startDate": "{{START_DATE_ISO}}",
  "endDate": "{{END_DATE_ISO}}",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "{{BUSINESS_NAME_HE}}",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "{{STREET_HE}}",
      "addressLocality": "{{CITY_HE}}",
      "addressRegion": "{{REGION_HE}}",
      "postalCode": "{{POSTAL_CODE}}",
      "addressCountry": "IL"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "{{BUSINESS_NAME_HE}}",
    "url": "{{WEBSITE}}"
  },
  "offers": {
    "@type": "Offer",
    "url": "{{WEBSITE}}/events",
    "priceCurrency": "ILS",
    "price": "{{PRICE}}",
    "availability": "https://schema.org/InStock",
    "validFrom": "{{TICKETS_AVAILABLE_DATE}}"
  },
  "image": "{{EVENT_IMAGE_URL}}",
  "inLanguage": "he"
}
```

### 12.2 Bakery Workshop Example (Complete)

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "סדנת אפיית לחם מחמצת למתחילים",
  "description": "סדנת אפייה חווייתית במאפיית הלחם של שרון. תלמדו להכין לחם מחמצת מאפס - מהכנת המחמצת ועד אפייה בתנור. כולל חומרי גלם, סינר ולחם לקחת הביתה.",
  "startDate": "2025-04-15T10:00:00+03:00",
  "endDate": "2025-04-15T13:00:00+03:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "מאפיית הלחם של שרון",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "רחוב הרצל 42",
      "addressLocality": "רחובות",
      "addressRegion": "מחוז המרכז",
      "postalCode": "7610001",
      "addressCountry": "IL"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "מאפיית הלחם של שרון",
    "url": "https://www.maafia-sharon.co.il"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://www.maafia-sharon.co.il/workshops",
    "priceCurrency": "ILS",
    "price": "220",
    "availability": "https://schema.org/InStock",
    "validFrom": "2025-03-01"
  },
  "image": "https://www.maafia-sharon.co.il/images/workshop.jpg",
  "maximumAttendeeCapacity": 12,
  "inLanguage": "he"
}
```

### 12.3 Israeli Date/Time Format Notes

- **Timezone:** Always use `+03:00` for Israel Standard Time (IST) or `+02:00` for winter (before DST).
- **ISO 8601 format:** `2025-04-15T10:00:00+03:00`
- **DST transition:** Israel switches to summer time (IDT, +03:00) usually in late March and back to winter time (IST, +02:00) in late October. Check the exact date for the relevant year.

---

## 13. Implementation Guide

### 13.1 Adding JSON-LD to Next.js (App Router)

#### Method 1: In `layout.tsx` or `page.tsx` (Recommended)

```tsx
// app/layout.tsx or app/page.tsx
export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "name": "מאפיית הלחם של שרון",
    // ... rest of schema
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Page content */}
    </>
  );
}
```

#### Method 2: Dedicated Schema Component

```tsx
// components/JsonLd.tsx
interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

Usage:

```tsx
import { JsonLd } from "@/components/JsonLd";

export default function Page() {
  return (
    <>
      <JsonLd data={localBusinessSchema} />
      <JsonLd data={faqSchema} />
      {/* Page content */}
    </>
  );
}
```

### 13.2 Multiple Schema Types with @graph

Combine all schemas into a single JSON-LD block using `@graph`. This is cleaner and preferred by Google.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.maafia-sharon.co.il/#webpage",
      "url": "https://www.maafia-sharon.co.il",
      "name": "מאפיית הלחם של שרון | מאפייה ברחובות",
      "description": "מאפייה אורטיזנלית ברחובות. לחמים מחמצת, מאפים טריים ועוגות בהזמנה.",
      "inLanguage": "he",
      "isPartOf": { "@id": "https://www.maafia-sharon.co.il/#website" },
      "about": { "@id": "https://www.maafia-sharon.co.il/#bakery" },
      "breadcrumb": { "@id": "https://www.maafia-sharon.co.il/#breadcrumb" },
      "datePublished": "2024-01-15",
      "dateModified": "2025-03-20"
    },
    {
      "@type": "WebSite",
      "@id": "https://www.maafia-sharon.co.il/#website",
      "url": "https://www.maafia-sharon.co.il",
      "name": "מאפיית הלחם של שרון",
      "inLanguage": "he"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.maafia-sharon.co.il/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "מאפיית הלחם של שרון",
          "item": "https://www.maafia-sharon.co.il"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "מאפייה ברחובות",
          "item": "https://www.maafia-sharon.co.il/#bakery"
        }
      ]
    },
    {
      "@type": "Bakery",
      "@id": "https://www.maafia-sharon.co.il/#bakery",
      "name": "מאפיית הלחם של שרון",
      "alternateName": "Sharon's Bakery Rehovot",
      "description": "מאפייה אורטיזנלית ברחובות המתמחה בלחמים מחמצת, מאפים טריים ועוגות בהזמנה אישית. חומרי גלם טבעיים בלבד.",
      "url": "https://www.maafia-sharon.co.il",
      "telephone": "+972-8-946-1234",
      "email": "info@maafia-sharon.co.il",
      "image": "https://www.maafia-sharon.co.il/images/storefront.jpg",
      "logo": "https://www.maafia-sharon.co.il/images/logo.png",
      "priceRange": "₪₪",
      "currenciesAccepted": "ILS",
      "paymentAccepted": "Cash, Credit Card, Bit, PayBox",
      "servesCuisine": "מאפים, לחמים, עוגות",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "רחוב הרצל 42",
        "addressLocality": "רחובות",
        "addressRegion": "מחוז המרכז",
        "postalCode": "7610001",
        "addressCountry": "IL"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "31.8928",
        "longitude": "34.8113"
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
          "opens": "06:30",
          "closes": "19:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Friday",
          "opens": "06:30",
          "closes": "14:00"
        }
      ],
      "areaServed": [
        { "@type": "City", "name": "רחובות" },
        { "@type": "City", "name": "נס ציונה" },
        { "@type": "City", "name": "ראשון לציון" }
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127",
        "bestRating": "5",
        "worstRating": "1"
      },
      "sameAs": [
        "https://www.facebook.com/sharonbakery",
        "https://www.instagram.com/sharon_bakery_rehovot"
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://www.maafia-sharon.co.il/#organization",
      "name": "מאפיית הלחם של שרון",
      "url": "https://www.maafia-sharon.co.il",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.maafia-sharon.co.il/images/logo.png",
        "width": "600",
        "height": "600"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+972-8-946-1234",
        "contactType": "customer service",
        "areaServed": "IL",
        "availableLanguage": ["Hebrew", "English"]
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "מה שעות הפתיחה של מאפיית הלחם של שרון?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "המאפייה פתוחה ימים א'-ה' מ-06:30 עד 19:00, ובימי שישי מ-06:30 עד 14:00. בשבת ובחגים המאפייה סגורה."
          }
        },
        {
          "@type": "Question",
          "name": "האם אפשר להזמין עוגה ליום הולדת?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "כן, אנחנו מכינים עוגות מעוצבות בהזמנה אישית. מומלץ להזמין לפחות 3 ימים מראש. צרו קשר בוואטסאפ לקבלת תמונות וקטלוג."
          }
        },
        {
          "@type": "Question",
          "name": "יש לכם מאפים ללא גלוטן?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "כן, יש לנו מבחר לחמים ומאפים ללא גלוטן. מומלץ להתקשר מראש לוודא זמינות."
          }
        },
        {
          "@type": "Question",
          "name": "האם יש משלוחים מהמאפייה?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "כן, אנחנו מציעים משלוח בוואלה ובוולט לאזור רחובות ונס ציונה. ניתן גם להזמין טלפונית ולאסוף מהמאפייה."
          }
        }
      ]
    }
  ]
}
```

### 13.3 Next.js Implementation with @graph

```tsx
// lib/schema.ts
export function generateSchema(businessData: BusinessData) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      generateWebPageSchema(businessData),
      generateWebSiteSchema(businessData),
      generateBreadcrumbSchema(businessData),
      generateLocalBusinessSchema(businessData),
      generateOrganizationSchema(businessData),
      generateFAQSchema(businessData),
    ],
  };
}

// app/page.tsx
import { generateSchema } from "@/lib/schema";

export default function Home() {
  const schema = generateSchema(businessData);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* Page content */}
    </>
  );
}
```

### 13.4 Validation

- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema Markup Validator:** https://validator.schema.org/
- **Google Search Console:** Check the "Enhancements" section for schema issues after deployment.

### 13.5 Common Mistakes to Avoid

| Mistake | Why it is Wrong | Fix |
|---|---|---|
| Fake reviews in schema | Google penalty risk | Only use real reviews |
| Name mismatch with GBP | Confuses Google | Exact match with Google Business Profile |
| Wrong coordinates | Affects local search | Verify on Google Maps |
| Missing `@context` | Schema will not be parsed | Always include `"@context": "https://schema.org"` |
| Using `http://` in URLs | Should be HTTPS | Use `https://` everywhere |
| Incorrect phone format | Validation error | Use `+972-X-XXX-XXXX` |
| Saturday listed as open | Misleading for Israeli business | Remove Saturday or only list post-Shabbat evening |
| Duplicate schema types | Conflicting signals | Use `@graph` with `@id` references |
| Price in USD | Wrong currency for Israel | Use `ILS` as `priceCurrency` |
| Missing `inLanguage` | Google may not detect Hebrew | Set `"inLanguage": "he"` |
| `addressCountry: "Israel"` | Should be ISO code | Use `"addressCountry": "IL"` |
| Old dates in `dateModified` | Signals stale content | Update when content changes |

---

## 14. Validation Checklist

Use this checklist before deploying any schema markup.

### 14.1 Required Fields Verification

- [ ] `@context` is set to `"https://schema.org"`
- [ ] `@type` matches the correct business type
- [ ] `name` is in Hebrew and matches Google Business Profile exactly
- [ ] `address` includes `streetAddress`, `addressLocality`, `postalCode`, `addressCountry`
- [ ] `addressCountry` is `"IL"` (ISO code, not "Israel")
- [ ] `telephone` is in `+972-X-XXX-XXXX` format
- [ ] `url` starts with `https://`
- [ ] `geo` has accurate `latitude` and `longitude` (4+ decimal places)
- [ ] `openingHoursSpecification` reflects actual business hours
- [ ] `openingHoursSpecification` uses Sunday as first workday
- [ ] Saturday is omitted or only lists post-Shabbat evening hours

### 14.2 Consistency Checks

- [ ] Business name matches GBP name character-for-character
- [ ] Address format matches GBP address exactly
- [ ] Phone number matches GBP phone number
- [ ] Opening hours match GBP hours
- [ ] Categories/type match GBP primary category
- [ ] Logo URL returns a valid image (200 response, not 404)
- [ ] Image URLs return valid images
- [ ] All URLs use HTTPS

### 14.3 Technical Validation

- [ ] JSON-LD parses without errors (valid JSON)
- [ ] No trailing commas in JSON
- [ ] No duplicate keys
- [ ] All `@id` references point to existing objects
- [ ] `@graph` structure properly links related entities
- [ ] Google Rich Results Test passes with no errors
- [ ] Schema Markup Validator shows no critical warnings
- [ ] `inLanguage` is set to `"he"` on WebPage and WebSite

### 14.4 Content Quality

- [ ] Hebrew text is natural and grammatically correct
- [ ] Description is accurate and not keyword-stuffed
- [ ] FAQ questions reflect real customer questions
- [ ] FAQ answers are genuinely helpful (not just keyword repetition)
- [ ] Reviews are real (not fabricated)
- [ ] AggregateRating matches actual Google rating
- [ ] Prices are accurate and in ILS

### 14.5 Post-Deployment Monitoring

- [ ] Check Google Search Console "Enhancements" after 1-2 weeks
- [ ] Verify Rich Results appear in search (may take days/weeks)
- [ ] Monitor for "Unparsable structured data" errors
- [ ] Update `dateModified` whenever content changes
- [ ] Update `aggregateRating` periodically to match current GBP rating
- [ ] Update `openingHoursSpecification` for holiday hours or permanent changes

---

## Quick Copy Reference

### Minimal Viable Schema for a Landing Page

The absolute minimum schema to include on any Israeli business landing page:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "{{BUSINESS_TYPE}}",
      "name": "{{BUSINESS_NAME_HE}}",
      "url": "{{WEBSITE}}",
      "telephone": "{{PHONE}}",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "{{STREET_HE}}",
        "addressLocality": "{{CITY_HE}}",
        "postalCode": "{{POSTAL_CODE}}",
        "addressCountry": "IL"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "{{LAT}}",
        "longitude": "{{LNG}}"
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
          "opens": "{{WEEKDAY_OPEN}}",
          "closes": "{{WEEKDAY_CLOSE}}"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Friday",
          "opens": "{{FRIDAY_OPEN}}",
          "closes": "{{FRIDAY_CLOSE}}"
        }
      ]
    },
    {
      "@type": "WebPage",
      "url": "{{WEBSITE}}",
      "name": "{{PAGE_TITLE_HE}}",
      "inLanguage": "he"
    }
  ]
}
```

This covers LocalBusiness + WebPage -- the two most critical schema types for local SEO.

---

## Israeli Address Region Reference

| Region (Hebrew) | Region (English) | Major Cities |
|---|---|---|
| מחוז המרכז | Central District | תל אביב, רמת גן, פתח תקווה, ראשון לציון, חולון, בת ים |
| מחוז תל אביב | Tel Aviv District | תל אביב-יפו |
| מחוז הדרום | Southern District | באר שבע, אשדוד, אשקלון |
| מחוז הצפון | Northern District | נצרת, עפולה, כרמיאל, טבריה |
| מחוז חיפה | Haifa District | חיפה, קריות |
| מחוז ירושלים | Jerusalem District | ירושלים, בית שמש, מעלה אדומים |
| מחוז השרון | Sharon Region | נתניה, הרצליה, רעננה, כפר סבא, הוד השרון |
| מחוז השפלה | Shfela Region | רחובות, נס ציונה, מודיעין, לוד, רמלה |

> **Note:** `addressRegion` is optional in schema but recommended. Use the district name in Hebrew.
