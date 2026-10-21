#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MediaWave Schema Markup Generator
==================================
Generates validated JSON-LD structured data from discovery output.
Produces LocalBusiness, FAQPage, BreadcrumbList, Organization,
WebPage, and Service schemas with Israeli-specific formatting.

Usage:
    python generate-schema.py discovery-output.json
    python generate-schema.py discovery-output.json -o schema.json
    python generate-schema.py discovery-output.json --pretty
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime


# ---------------------------------------------------------------------------
# Israeli Phone Formatter
# ---------------------------------------------------------------------------

def format_phone_il(phone):
    """Convert Israeli phone to +972 international format."""
    if not phone:
        return None
    # Strip all non-digits
    digits = re.sub(r'[^\d]', '', phone)
    # Already international
    if digits.startswith("972"):
        return f"+{digits}"
    # Local format starting with 0
    if digits.startswith("0") and len(digits) >= 9:
        return f"+972{digits[1:]}"
    # Mobile without leading 0
    if len(digits) == 9 and digits[0] in ("5", "7"):
        return f"+972{digits}"
    # Return as-is if unclear
    return phone


# ---------------------------------------------------------------------------
# Business Type Detection
# ---------------------------------------------------------------------------

BUSINESS_TYPE_MAP = {
    # Hebrew keyword -> schema.org type
    "מסעדה": "Restaurant",
    "בית קפה": "CafeOrCoffeeShop",
    "קפה": "CafeOrCoffeeShop",
    "מאפייה": "Bakery",
    "קונדיטוריה": "Bakery",
    "מספרה": "HairSalon",
    "ספר": "HairSalon",
    "מכון יופי": "BeautySalon",
    "קוסמטיקה": "BeautySalon",
    "רופא שיניים": "Dentist",
    "מרפאת שיניים": "Dentist",
    "רופא": "Physician",
    "מרפאה": "MedicalClinic",
    "בית מרקחת": "Pharmacy",
    "עורך דין": "LegalService",
    "משרד עורכי דין": "LegalService",
    "רואה חשבון": "AccountingService",
    "שיפוצניק": "HomeAndConstructionBusiness",
    "שיפוצים": "HomeAndConstructionBusiness",
    "חשמלאי": "Electrician",
    "אינסטלטור": "Plumber",
    "שרברב": "Plumber",
    "מוסך": "AutoRepair",
    "חנות": "Store",
    "סופרמרקט": "GroceryStore",
    "מכולת": "GroceryStore",
    "חנות בגדים": "ClothingStore",
    "חנות ספרים": "BookStore",
    "מלון": "Hotel",
    "צימר": "LodgingBusiness",
    "גן ילדים": "ChildCare",
    "בית ספר": "School",
    "חדר כושר": "HealthClub",
    "ספא": "DaySpa",
    "מכבסה": "DryCleaningOrLaundry",
    "דפוס": "ProfessionalService",
    "סטודיו": "ProfessionalService",
    "משרד": "ProfessionalService",
}


def detect_business_type(category, name="", services=None):
    """Detect Schema.org LocalBusiness sub-type from Hebrew category."""
    search_text = f"{category} {name} {' '.join(services or [])}".lower()

    for keyword, schema_type in BUSINESS_TYPE_MAP.items():
        if keyword in search_text:
            return schema_type

    return "LocalBusiness"


# ---------------------------------------------------------------------------
# Israeli Business Hours
# ---------------------------------------------------------------------------

DAY_MAP_HE_TO_EN = {
    "ראשון": "Sunday",
    "שני": "Monday",
    "שלישי": "Tuesday",
    "רביעי": "Wednesday",
    "חמישי": "Thursday",
    "שישי": "Friday",
    "שבת": "Saturday",
}


def format_hours(hours_data):
    """
    Convert hours data to schema.org OpeningHoursSpecification.

    Accepts:
    - dict with day names as keys and time ranges as values
    - list of strings like "ראשון-חמישי: 08:00-18:00"
    - string like "ראשון-חמישי 08:00-18:00, שישי 08:00-14:00"
    """
    specs = []

    if isinstance(hours_data, dict):
        for day_he, time_range in hours_data.items():
            day_en = DAY_MAP_HE_TO_EN.get(day_he)
            if day_en and time_range and time_range.lower() != "סגור":
                times = time_range.replace(" ", "").split("-")
                if len(times) == 2:
                    specs.append({
                        "@type": "OpeningHoursSpecification",
                        "dayOfWeek": day_en,
                        "opens": times[0],
                        "closes": times[1]
                    })
    elif isinstance(hours_data, list):
        for entry in hours_data:
            specs.extend(_parse_hours_string(entry))
    elif isinstance(hours_data, str):
        parts = hours_data.split(",")
        for part in parts:
            specs.extend(_parse_hours_string(part.strip()))

    # Default Israeli business hours if nothing provided
    if not specs:
        default_days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]
        for day in default_days:
            specs.append({
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": day,
                "opens": "09:00",
                "closes": "18:00"
            })

    return specs


def _parse_hours_string(s):
    """Parse a Hebrew hours string like 'ראשון-חמישי: 08:00-18:00'."""
    specs = []
    if not s:
        return specs

    # Try to extract day range and time
    match = re.match(r'([\u0590-\u05FF]+)(?:-([\u0590-\u05FF]+))?\s*:?\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})', s)
    if match:
        start_day_he = match.group(1)
        end_day_he = match.group(2)
        opens = match.group(3)
        closes = match.group(4)

        he_days_ordered = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]

        if end_day_he:
            # Day range
            try:
                start_idx = he_days_ordered.index(start_day_he)
                end_idx = he_days_ordered.index(end_day_he)
                for i in range(start_idx, end_idx + 1):
                    day_en = DAY_MAP_HE_TO_EN.get(he_days_ordered[i])
                    if day_en:
                        specs.append({
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": day_en,
                            "opens": opens,
                            "closes": closes
                        })
            except ValueError:
                pass
        else:
            # Single day
            day_en = DAY_MAP_HE_TO_EN.get(start_day_he)
            if day_en:
                specs.append({
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": day_en,
                    "opens": opens,
                    "closes": closes
                })

    return specs


# ---------------------------------------------------------------------------
# Schema Generators
# ---------------------------------------------------------------------------

def generate_local_business(data, biz_type):
    """Generate LocalBusiness schema."""
    schema = {
        "@type": biz_type,
        "@id": data.get("url", "#business"),
        "name": data.get("name", ""),
        "description": data.get("description", ""),
        "url": data.get("url", ""),
        "inLanguage": "he",
    }

    # Phone
    phone = format_phone_il(data.get("phone"))
    if phone:
        schema["telephone"] = phone

    # Email
    if data.get("email"):
        schema["email"] = data["email"]

    # Address
    address_data = data.get("address", {})
    if isinstance(address_data, str):
        address_data = {"streetAddress": address_data}

    address = {
        "@type": "PostalAddress",
        "addressCountry": "IL",
        "addressLocality": data.get("city", address_data.get("city", "")),
        "streetAddress": address_data.get("street", address_data.get("streetAddress", "")),
    }
    if address_data.get("postalCode") or address_data.get("zipCode"):
        address["postalCode"] = address_data.get("postalCode", address_data.get("zipCode", ""))
    if address_data.get("region"):
        address["addressRegion"] = address_data["region"]

    schema["address"] = address

    # Geo coordinates
    coords = data.get("coordinates", data.get("geo", {}))
    if coords and (coords.get("lat") or coords.get("latitude")):
        schema["geo"] = {
            "@type": "GeoCoordinates",
            "latitude": coords.get("lat", coords.get("latitude")),
            "longitude": coords.get("lng", coords.get("lon", coords.get("longitude")))
        }

    # Hours
    hours = data.get("hours", data.get("openingHours", data.get("businessHours")))
    if hours:
        schema["openingHoursSpecification"] = format_hours(hours)

    # Image
    if data.get("image") or data.get("logo"):
        schema["image"] = data.get("image", data.get("logo"))

    # Price range
    if data.get("priceRange"):
        schema["priceRange"] = data["priceRange"]

    # Areas served
    if data.get("areasServed"):
        schema["areaServed"] = data["areasServed"]

    return schema


def generate_organization(data):
    """Generate Organization schema."""
    schema = {
        "@type": "Organization",
        "@id": f"{data.get('url', '')}#organization",
        "name": data.get("name", ""),
        "url": data.get("url", ""),
        "inLanguage": "he",
    }

    if data.get("logo"):
        schema["logo"] = {
            "@type": "ImageObject",
            "url": data["logo"],
        }

    phone = format_phone_il(data.get("phone"))
    if phone:
        schema["telephone"] = phone

    if data.get("email"):
        schema["email"] = data["email"]

    # Social profiles
    social = data.get("social", data.get("socialMedia", {}))
    same_as = []
    if isinstance(social, dict):
        for platform, url in social.items():
            if url:
                same_as.append(url)
    elif isinstance(social, list):
        same_as = social

    if same_as:
        schema["sameAs"] = same_as

    return schema


def generate_webpage(data):
    """Generate WebPage schema."""
    return {
        "@type": "WebPage",
        "@id": data.get("url", ""),
        "name": data.get("pageTitle", data.get("name", "")),
        "description": data.get("description", ""),
        "url": data.get("url", ""),
        "inLanguage": "he",
        "isPartOf": {
            "@type": "WebSite",
            "@id": f"{data.get('url', '')}#website",
            "name": data.get("name", ""),
            "url": data.get("url", ""),
            "inLanguage": "he"
        },
        "datePublished": data.get("datePublished", datetime.now().strftime("%Y-%m-%d")),
        "dateModified": data.get("dateModified", datetime.now().strftime("%Y-%m-%d")),
    }


def generate_faq(data):
    """Generate FAQPage schema from FAQ data."""
    faq_items = data.get("faq", data.get("faqs", []))
    if not faq_items:
        return None

    main_entity = []
    for item in faq_items:
        question = item.get("question", item.get("q", ""))
        answer = item.get("answer", item.get("a", ""))
        if question and answer:
            main_entity.append({
                "@type": "Question",
                "name": question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": answer
                }
            })

    if not main_entity:
        return None

    return {
        "@type": "FAQPage",
        "@id": f"{data.get('url', '')}#faq",
        "mainEntity": main_entity,
        "inLanguage": "he"
    }


def generate_breadcrumbs(data):
    """Generate BreadcrumbList schema."""
    items = [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "דף הבית",
            "item": data.get("url", "/")
        }
    ]

    # If there's a category page
    if data.get("category"):
        items.append({
            "@type": "ListItem",
            "position": 2,
            "name": data["category"],
        })

    # Current page
    items.append({
        "@type": "ListItem",
        "position": len(items) + 1,
        "name": data.get("pageTitle", data.get("name", "")),
    })

    return {
        "@type": "BreadcrumbList",
        "@id": f"{data.get('url', '')}#breadcrumbs",
        "itemListElement": items
    }


def generate_services(data):
    """Generate Service schema for each service offered."""
    services = data.get("services", [])
    if not services:
        return []

    schemas = []
    for svc in services:
        if isinstance(svc, str):
            svc_name = svc
            svc_desc = ""
            svc_price = None
        elif isinstance(svc, dict):
            svc_name = svc.get("name", svc.get("title", ""))
            svc_desc = svc.get("description", "")
            svc_price = svc.get("price")
        else:
            continue

        if not svc_name:
            continue

        service_schema = {
            "@type": "Service",
            "name": svc_name,
            "provider": {
                "@type": "LocalBusiness",
                "name": data.get("name", "")
            },
            "areaServed": {
                "@type": "City",
                "name": data.get("city", "")
            },
            "inLanguage": "he",
        }
        if svc_desc:
            service_schema["description"] = svc_desc
        if svc_price:
            service_schema["offers"] = {
                "@type": "Offer",
                "price": str(svc_price),
                "priceCurrency": "ILS"
            }
        schemas.append(service_schema)

    return schemas


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def validate_schema(graph):
    """Basic validation of the generated schema."""
    errors = []

    if not isinstance(graph, list):
        errors.append("@graph must be an array")
        return errors

    for i, item in enumerate(graph):
        if "@type" not in item:
            errors.append(f"Item {i}: missing @type")
        if item.get("@type") in ("LocalBusiness", "Restaurant", "Bakery", "HairSalon",
                                  "BeautySalon", "LegalService", "Store"):
            if not item.get("name"):
                errors.append(f"Item {i} ({item.get('@type')}): missing name")
            if not item.get("address"):
                errors.append(f"Item {i} ({item.get('@type')}): missing address")

    return errors


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="MediaWave Schema Generator - JSON-LD structured data for Israeli businesses",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python generate-schema.py discovery-output.json
  python generate-schema.py data.json -o schema.json --pretty
  python generate-schema.py data.json --types local faq breadcrumbs

Discovery JSON should contain fields like:
  name, category, address, city, phone, email, hours,
  services, faq, url, coordinates, social, logo, etc.
        """
    )
    parser.add_argument("input",
                        help="Path to discovery output JSON file")
    parser.add_argument("-o", "--output",
                        help="Write output to file (default: stdout)")
    parser.add_argument("--pretty", action="store_true",
                        help="Pretty-print JSON output")
    parser.add_argument("--types", nargs="+",
                        choices=["local", "org", "webpage", "faq",
                                 "breadcrumbs", "services", "all"],
                        default=["all"],
                        help="Schema types to generate (default: all)")

    args = parser.parse_args()

    # Read input
    input_path = os.path.abspath(args.input)
    if not os.path.isfile(input_path):
        print(f"Error: File not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    try:
        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {input_path}: {e}", file=sys.stderr)
        sys.exit(1)

    types_to_generate = args.types
    if "all" in types_to_generate:
        types_to_generate = ["local", "org", "webpage", "faq", "breadcrumbs", "services"]

    # Detect business type
    category = data.get("category", data.get("businessType", ""))
    biz_type = detect_business_type(
        category,
        data.get("name", ""),
        [s if isinstance(s, str) else s.get("name", "")
         for s in data.get("services", [])]
    )

    # Generate schemas
    graph = []

    if "local" in types_to_generate:
        graph.append(generate_local_business(data, biz_type))

    if "org" in types_to_generate:
        graph.append(generate_organization(data))

    if "webpage" in types_to_generate:
        graph.append(generate_webpage(data))

    if "faq" in types_to_generate:
        faq_schema = generate_faq(data)
        if faq_schema:
            graph.append(faq_schema)

    if "breadcrumbs" in types_to_generate:
        graph.append(generate_breadcrumbs(data))

    if "services" in types_to_generate:
        service_schemas = generate_services(data)
        graph.extend(service_schemas)

    # Validate
    errors = validate_schema(graph)
    if errors:
        print("Schema validation warnings:", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)

    # Build final JSON-LD
    jsonld = {
        "@context": "https://schema.org",
        "@graph": graph
    }

    # Output
    indent = 2 if args.pretty else None
    json_output = json.dumps(jsonld, ensure_ascii=False, indent=indent)

    if args.output:
        out_path = os.path.abspath(args.output)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(json_output)
        print(f"Schema written to: {out_path}", file=sys.stderr)
    else:
        print(json_output)

    # Print summary
    type_names = [item.get("@type", "Unknown") for item in graph]
    print(f"\nGenerated {len(graph)} schema(s): {', '.join(type_names)}", file=sys.stderr)
    if biz_type != "LocalBusiness":
        print(f"Auto-detected business type: {biz_type}", file=sys.stderr)


if __name__ == "__main__":
    main()
