#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MediaWave Hebrew Keyword Research Helper
==========================================
Generates keyword variations for Hebrew local SEO campaigns.
Produces location-based, modifier-based, conversational, and
transliterated keyword expansions with intent classification.

Usage:
    python keyword-research-helper.py "מאפייה" "רחובות"
    python keyword-research-helper.py "שיפוצניק" "תל אביב" -o keywords.json
    python keyword-research-helper.py "עורך דין" "ירושלים" --format csv
"""

import argparse
import csv
import io
import json
import os
import sys


# ---------------------------------------------------------------------------
# Hebrew Transliteration Map (simplified)
# ---------------------------------------------------------------------------

TRANSLITERATION_MAP = {
    "א": "",
    "ב": "b",
    "ג": "g",
    "ד": "d",
    "ה": "h",
    "ו": "v",
    "ז": "z",
    "ח": "ch",
    "ט": "t",
    "י": "y",
    "כ": "k",
    "ך": "k",
    "ל": "l",
    "מ": "m",
    "ם": "m",
    "נ": "n",
    "ן": "n",
    "ס": "s",
    "ע": "a",
    "פ": "p",
    "ף": "f",
    "צ": "tz",
    "ץ": "tz",
    "ק": "k",
    "ר": "r",
    "ש": "sh",
    "ת": "t",
}

# Common city transliterations
CITY_TRANSLITERATIONS = {
    "תל אביב": "tel aviv",
    "ירושלים": "jerusalem",
    "חיפה": "haifa",
    "באר שבע": "beer sheva",
    "רחובות": "rehovot",
    "פתח תקווה": "petah tikva",
    "ראשון לציון": "rishon lezion",
    "נתניה": "netanya",
    "אשדוד": "ashdod",
    "הרצליה": "herzliya",
    "רמת גן": "ramat gan",
    "כפר סבא": "kfar saba",
    "רעננה": "raanana",
    "הוד השרון": "hod hasharon",
    "גבעתיים": "givatayim",
    "בני ברק": "bnei brak",
    "בת ים": "bat yam",
    "מודיעין": "modiin",
    "אילת": "eilat",
    "טבריה": "tiberias",
    "עכו": "akko",
    "נצרת": "nazareth",
    "לוד": "lod",
    "רמלה": "ramla",
    "חולון": "holon",
    "אשקלון": "ashkelon",
    "קריית גת": "kiryat gat",
    "קריית אתא": "kiryat ata",
    "עפולה": "afula",
    "צפת": "tzfat",
}

# Common business type transliterations
BUSINESS_TRANSLITERATIONS = {
    "מאפייה": "maapiya",
    "מסעדה": "misada",
    "בית קפה": "beit kafe",
    "מספרה": "mispara",
    "מכון יופי": "machon yofi",
    "עורך דין": "orech din",
    "רואה חשבון": "roe cheshbon",
    "שיפוצניק": "shiputznik",
    "חשמלאי": "chashmalai",
    "אינסטלטור": "instalator",
    "שרברב": "shravrav",
    "מוסך": "musach",
    "רופא שיניים": "rofe shinayim",
    "גן ילדים": "gan yeladim",
    "חדר כושר": "chadar kosher",
    "סטודיו": "studio",
    "מכבסה": "michbasa",
    "חנות": "chanut",
    "פיצה": "pizza",
    "סושי": "sushi",
    "פלאפל": "falafel",
    "שווארמה": "shawarma",
    "קייטרינג": "catering",
    "צלם": "tzalam",
    "מעצבת פנים": "meatzevet pnim",
    "אדריכל": "adrichal",
    "יועץ משכנתאות": "yoetz mashkantaot",
    "סוכן ביטוח": "sochen bituach",
}


def transliterate_hebrew(text):
    """Transliterate Hebrew text to Latin characters."""
    # Check known words first
    text_stripped = text.strip()

    # Try known business types
    if text_stripped in BUSINESS_TRANSLITERATIONS:
        return BUSINESS_TRANSLITERATIONS[text_stripped]

    # Try known cities
    if text_stripped in CITY_TRANSLITERATIONS:
        return CITY_TRANSLITERATIONS[text_stripped]

    # Character-by-character transliteration
    result = []
    for char in text:
        if char in TRANSLITERATION_MAP:
            result.append(TRANSLITERATION_MAP[char])
        elif char == " ":
            result.append(" ")
        elif char.isascii():
            result.append(char)
        # Skip unknown characters

    return "".join(result).strip()


# ---------------------------------------------------------------------------
# Keyword Modifiers
# ---------------------------------------------------------------------------

QUALITY_MODIFIERS = [
    ("מומלץ", "recommended"),
    ("טוב", "good"),
    ("הכי טוב", "best"),
    ("מקצועי", "professional"),
    ("אמין", "reliable"),
    ("איכותי", "quality"),
]

PRICE_MODIFIERS = [
    ("זול", "cheap"),
    ("מחיר", "price"),
    ("מחירון", "price list"),
    ("עלות", "cost"),
    ("הנחה", "discount"),
    ("מבצע", "deal/special"),
]

PROXIMITY_MODIFIERS = [
    ("ליד", "near"),
    ("קרוב", "nearby"),
    ("באזור", "in the area"),
    ("קרובה", "nearby (feminine)"),
    ("קרוב אליי", "near me"),
]

INFO_MODIFIERS = [
    ("שעות פתיחה", "opening hours"),
    ("טלפון", "phone number"),
    ("כתובת", "address"),
    ("ביקורות", "reviews"),
    ("חוות דעת", "opinions"),
    ("המלצות", "recommendations"),
]

URGENCY_MODIFIERS = [
    ("24 שעות", "24 hours"),
    ("חירום", "emergency"),
    ("דחוף", "urgent"),
    ("עכשיו", "now"),
    ("היום", "today"),
    ("פתוח עכשיו", "open now"),
]


# ---------------------------------------------------------------------------
# Intent Classification
# ---------------------------------------------------------------------------

def classify_intent(keyword_he, keyword_type):
    """Classify search intent for a keyword."""
    # Transactional intent indicators
    transactional_words = ["מחיר", "עלות", "הזמנה", "הזמן", "קנה", "מבצע", "הנחה"]
    # Informational intent indicators
    informational_words = ["שעות", "טלפון", "כתובת", "ביקורות", "חוות דעת",
                           "איך", "מה", "למה", "מתי", "איפה יש"]
    # Navigational
    navigational_words = ["אתר", "עמוד", "דף"]

    keyword_lower = keyword_he.lower()

    if keyword_type == "conversational":
        return "informational"
    elif keyword_type == "transliterated":
        return "navigational"
    elif any(w in keyword_lower for w in transactional_words):
        return "transactional"
    elif any(w in keyword_lower for w in informational_words):
        return "informational"
    elif any(w in keyword_lower for w in navigational_words):
        return "navigational"
    elif keyword_type in ("location", "primary"):
        return "local"
    elif keyword_type == "proximity":
        return "local"
    else:
        return "local"


# ---------------------------------------------------------------------------
# Keyword Generator
# ---------------------------------------------------------------------------

def generate_keywords(base_keyword, city, include_transliteration=True):
    """
    Generate keyword variations for Hebrew local SEO.

    Returns dict with categories:
    - primary: Core keyword + city combinations
    - location: Location-based variations
    - modifier_quality: Quality modifiers
    - modifier_price: Price modifiers
    - modifier_info: Information-seeking modifiers
    - modifier_urgency: Urgency modifiers
    - proximity: Near/close variations
    - conversational: Question-based queries
    - transliterated: English transliterations
    """
    keywords = {
        "primary": [],
        "location": [],
        "modifier_quality": [],
        "modifier_price": [],
        "modifier_info": [],
        "modifier_urgency": [],
        "proximity": [],
        "conversational": [],
        "transliterated": [],
    }

    # ----- PRIMARY -----
    primary_combos = [
        f"{base_keyword} {city}",
        f"{base_keyword} ב{city}",
        f"ה{base_keyword} ב{city}",
        f"ה{base_keyword} {city}",
        f"{base_keyword}",
    ]
    for kw in primary_combos:
        keywords["primary"].append({
            "keyword_he": kw,
            "intent": "local",
            "priority": "high"
        })

    # ----- LOCATION -----
    location_combos = [
        f"{base_keyword} {city} והסביבה",
        f"{base_keyword} במרכז {city}",
        f"{base_keyword} ב{city} והסביבה",
    ]

    # Add "near area" keywords
    area_terms = ["מרכז", "צפון", "דרום"]
    for area in area_terms:
        location_combos.append(f"{base_keyword} {area} {city}")

    for kw in location_combos:
        keywords["location"].append({
            "keyword_he": kw,
            "intent": "local",
            "priority": "medium"
        })

    # ----- QUALITY MODIFIERS -----
    for modifier_he, modifier_en in QUALITY_MODIFIERS:
        kw = f"{base_keyword} {modifier_he} ב{city}"
        keywords["modifier_quality"].append({
            "keyword_he": kw,
            "intent": classify_intent(kw, "modifier"),
            "priority": "medium",
            "modifier": modifier_he,
            "modifier_en": modifier_en
        })
    # Also without city
    for modifier_he, modifier_en in QUALITY_MODIFIERS[:3]:
        kw = f"{base_keyword} {modifier_he}"
        keywords["modifier_quality"].append({
            "keyword_he": kw,
            "intent": "local",
            "priority": "medium",
            "modifier": modifier_he
        })

    # ----- PRICE MODIFIERS -----
    for modifier_he, modifier_en in PRICE_MODIFIERS:
        kw = f"{base_keyword} {modifier_he} {city}"
        keywords["modifier_price"].append({
            "keyword_he": kw,
            "intent": "transactional",
            "priority": "high",
            "modifier": modifier_he,
            "modifier_en": modifier_en
        })

    # ----- INFO MODIFIERS -----
    for modifier_he, modifier_en in INFO_MODIFIERS:
        kw = f"{base_keyword} {city} {modifier_he}"
        keywords["modifier_info"].append({
            "keyword_he": kw,
            "intent": "informational",
            "priority": "medium",
            "modifier": modifier_he,
            "modifier_en": modifier_en
        })

    # ----- URGENCY MODIFIERS -----
    for modifier_he, modifier_en in URGENCY_MODIFIERS:
        kw = f"{base_keyword} {modifier_he} {city}"
        keywords["modifier_urgency"].append({
            "keyword_he": kw,
            "intent": "transactional",
            "priority": "medium",
            "modifier": modifier_he,
            "modifier_en": modifier_en
        })

    # ----- PROXIMITY -----
    for prox_he, prox_en in PROXIMITY_MODIFIERS:
        kw = f"{base_keyword} {prox_he}"
        keywords["proximity"].append({
            "keyword_he": kw,
            "intent": "local",
            "priority": "high",
            "modifier": prox_he,
            "modifier_en": prox_en
        })

    # ----- CONVERSATIONAL -----
    conversational_templates = [
        f"איפה יש {base_keyword} טובה ב{city}?",
        f"מה ה{base_keyword} הכי טובה ב{city}?",
        f"איזה {base_keyword} מומלצת ב{city}?",
        f"למי לפנות ל{base_keyword} ב{city}?",
        f"איפה {base_keyword} {city}?",
        f"מי ה{base_keyword} הכי טוב ב{city}?",
        f"כמה עולה {base_keyword} ב{city}?",
        f"{base_keyword} ב{city} שעות פתיחה",
        f"ביקורות על {base_keyword} ב{city}",
        f"המלצה על {base_keyword} ב{city}",
    ]
    for kw in conversational_templates:
        keywords["conversational"].append({
            "keyword_he": kw,
            "intent": "informational",
            "priority": "medium"
        })

    # ----- TRANSLITERATED -----
    if include_transliteration:
        biz_translit = transliterate_hebrew(base_keyword)
        city_translit = transliterate_hebrew(city)

        translit_combos = [
            f"{biz_translit} {city_translit}",
            f"{biz_translit} {city}",
            f"{base_keyword} {city_translit}",
        ]
        # Also try known transliterations
        if base_keyword in BUSINESS_TRANSLITERATIONS:
            known_biz = BUSINESS_TRANSLITERATIONS[base_keyword]
            if known_biz != biz_translit:
                translit_combos.append(f"{known_biz} {city_translit}")
        if city in CITY_TRANSLITERATIONS:
            known_city = CITY_TRANSLITERATIONS[city]
            if known_city != city_translit:
                translit_combos.append(f"{biz_translit} {known_city}")

        for kw in translit_combos:
            keywords["transliterated"].append({
                "keyword_he": kw,
                "intent": "navigational",
                "priority": "low"
            })

    return keywords


# ---------------------------------------------------------------------------
# Output Formatters
# ---------------------------------------------------------------------------

def format_text(keywords, base_keyword, city):
    """Format keywords as readable text report."""
    lines = []
    lines.append("=" * 65)
    lines.append("  MEDIAWAVE KEYWORD RESEARCH")
    lines.append(f'  Base Keyword: "{base_keyword}" | City: "{city}"')
    lines.append("=" * 65)

    total = sum(len(v) for v in keywords.values())
    lines.append(f"  Total keywords generated: {total}")
    lines.append("")

    category_names = {
        "primary": "PRIMARY KEYWORDS (highest priority)",
        "location": "LOCATION-BASED",
        "modifier_quality": "QUALITY MODIFIERS",
        "modifier_price": "PRICE MODIFIERS",
        "modifier_info": "INFORMATION-SEEKING",
        "modifier_urgency": "URGENCY MODIFIERS",
        "proximity": "PROXIMITY / NEAR ME",
        "conversational": "CONVERSATIONAL QUERIES",
        "transliterated": "ENGLISH TRANSLITERATIONS",
    }

    intent_labels = {
        "local": "[LOCAL]",
        "informational": "[INFO]",
        "transactional": "[TRANS]",
        "navigational": "[NAV]",
    }

    for cat, name in category_names.items():
        if not keywords.get(cat):
            continue
        lines.append(f"  --- {name} ---")
        for item in keywords[cat]:
            intent = intent_labels.get(item.get("intent", ""), "")
            priority = item.get("priority", "")
            kw = item["keyword_he"]
            lines.append(f"    {intent:7s} [{priority:6s}]  {kw}")
        lines.append("")

    # Plural form reminder
    lines.append("  --- NOTES ---")
    lines.append(f'  * Check plural forms manually: "{base_keyword}" -> plural form')
    lines.append(f'  * Consider definite article: "ה{base_keyword}"')
    lines.append(f'  * Consider construct state (smikhut) if applicable')
    lines.append(f'  * Verify transliterations match common user spelling')
    lines.append("=" * 65)

    return "\n".join(lines)


def format_json(keywords, base_keyword, city):
    """Format keywords as JSON."""
    output = {
        "meta": {
            "base_keyword": base_keyword,
            "city": city,
            "total_keywords": sum(len(v) for v in keywords.values()),
            "generated": __import__("datetime").datetime.now().isoformat(),
        },
        "keywords": keywords,
        "notes": {
            "plural_reminder": f'Check plural forms for "{base_keyword}"',
            "definite_article": f'"ה{base_keyword}"',
            "intent_types": {
                "local": "User looking for local business",
                "informational": "User seeking information",
                "transactional": "User ready to buy/book",
                "navigational": "User looking for specific site"
            }
        }
    }
    return json.dumps(output, ensure_ascii=False, indent=2)


def format_csv(keywords, base_keyword, city):
    """Format keywords as CSV."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["category", "keyword", "intent", "priority"])

    for cat, items in keywords.items():
        for item in items:
            writer.writerow([
                cat,
                item["keyword_he"],
                item.get("intent", ""),
                item.get("priority", "")
            ])

    return output.getvalue()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="MediaWave Hebrew Keyword Research Helper - Generate SEO keyword variations",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python keyword-research-helper.py "מאפייה" "רחובות"
  python keyword-research-helper.py "שיפוצניק" "תל אביב" --format json
  python keyword-research-helper.py "עורך דין" "ירושלים" -o keywords.csv --format csv
  python keyword-research-helper.py "מסעדה" "חיפה" --no-transliteration
        """
    )
    parser.add_argument("keyword",
                        help='Base keyword in Hebrew (e.g., "מאפייה")')
    parser.add_argument("city",
                        help='Target city in Hebrew (e.g., "רחובות")')
    parser.add_argument("-o", "--output",
                        help="Write output to file")
    parser.add_argument("--format",
                        choices=["text", "json", "csv"],
                        default="text",
                        help="Output format (default: text)")
    parser.add_argument("--no-transliteration", action="store_true",
                        help="Skip English transliteration generation")

    args = parser.parse_args()

    # Generate keywords
    keywords = generate_keywords(
        args.keyword,
        args.city,
        include_transliteration=not args.no_transliteration
    )

    # Format output
    if args.format == "json":
        result = format_json(keywords, args.keyword, args.city)
    elif args.format == "csv":
        result = format_csv(keywords, args.keyword, args.city)
    else:
        result = format_text(keywords, args.keyword, args.city)

    # Write or print
    if args.output:
        out_path = os.path.abspath(args.output)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(result)
        total = sum(len(v) for v in keywords.values())
        print(f"Generated {total} keywords -> {out_path}")
    else:
        print(result)


if __name__ == "__main__":
    main()
