#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MediaWave SEO Health Report Generator
=======================================
Generates a Hebrew-language markdown SEO report suitable for clients.
Includes executive summary, scores, findings, recommendations, and next steps.

Usage:
    python seo-report.py https://example.co.il
    python seo-report.py page.html -o report.md
    python seo-report.py https://example.co.il --discovery discovery-output.json
"""

import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.error
from datetime import datetime
from html.parser import HTMLParser


# ---------------------------------------------------------------------------
# HTML Parser (reused from seo-audit)
# ---------------------------------------------------------------------------

class SEOHTMLParser(HTMLParser):
    """Custom HTML parser that extracts SEO-relevant elements."""

    def __init__(self):
        super().__init__()
        self.title = None
        self.meta_description = None
        self.meta_robots = None
        self.meta_viewport = None
        self.canonical = None
        self.hreflang_tags = []
        self.og_tags = {}
        self.headings = []
        self.images = []
        self.links = []
        self.schema_scripts = []
        self.html_lang = None
        self.html_dir = None
        self.word_count = 0

        self._in_title = False
        self._title_parts = []
        self._in_heading = False
        self._heading_level = 0
        self._heading_parts = []
        self._in_body = False
        self._in_script = False
        self._script_type = None
        self._script_parts = []
        self._in_a = False
        self._a_href = None
        self._a_rel = None
        self._a_parts = []
        self._body_text_parts = []
        self._in_style = False
        self._in_noscript = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        tag_lower = tag.lower()

        if tag_lower == "html":
            self.html_lang = attrs_dict.get("lang", None)
            self.html_dir = attrs_dict.get("dir", None)
        elif tag_lower == "title":
            self._in_title = True
            self._title_parts = []
        elif tag_lower == "meta":
            name = attrs_dict.get("name", "").lower()
            prop = attrs_dict.get("property", "").lower()
            content = attrs_dict.get("content", "")
            if name == "description":
                self.meta_description = content
            elif name == "robots":
                self.meta_robots = content
            elif name == "viewport":
                self.meta_viewport = content
            if prop.startswith("og:"):
                self.og_tags[prop] = content
        elif tag_lower == "link":
            rel = attrs_dict.get("rel", "").lower()
            href = attrs_dict.get("href", "")
            hreflang = attrs_dict.get("hreflang", "")
            if rel == "canonical":
                self.canonical = href
            if hreflang:
                self.hreflang_tags.append({"hreflang": hreflang, "href": href})
        elif tag_lower in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self._in_heading = True
            self._heading_level = int(tag_lower[1])
            self._heading_parts = []
        elif tag_lower == "img":
            src = attrs_dict.get("src", "")
            alt = attrs_dict.get("alt", None)
            role = attrs_dict.get("role", "")
            self.images.append({"src": src, "alt": alt, "role": role})
        elif tag_lower == "script":
            self._in_script = True
            self._script_type = attrs_dict.get("type", "").lower()
            self._script_parts = []
        elif tag_lower == "a":
            self._in_a = True
            self._a_href = attrs_dict.get("href", "")
            self._a_rel = attrs_dict.get("rel", "")
            self._a_parts = []
        elif tag_lower == "body":
            self._in_body = True
        elif tag_lower == "style":
            self._in_style = True
        elif tag_lower == "noscript":
            self._in_noscript = True

    def handle_endtag(self, tag):
        tag_lower = tag.lower()
        if tag_lower == "title":
            self._in_title = False
            self.title = "".join(self._title_parts).strip()
        elif tag_lower in ("h1", "h2", "h3", "h4", "h5", "h6") and self._in_heading:
            text = "".join(self._heading_parts).strip()
            self.headings.append((self._heading_level, text))
            self._in_heading = False
        elif tag_lower == "script" and self._in_script:
            if self._script_type == "application/ld+json":
                content = "".join(self._script_parts).strip()
                if content:
                    self.schema_scripts.append(content)
            self._in_script = False
        elif tag_lower == "a" and self._in_a:
            text = "".join(self._a_parts).strip()
            self.links.append({"href": self._a_href or "", "text": text, "rel": self._a_rel or ""})
            self._in_a = False
        elif tag_lower == "body":
            self._in_body = False
            full_text = " ".join(self._body_text_parts)
            words = re.findall(r'[\w\u0590-\u05FF]+', full_text)
            self.word_count = len(words)
        elif tag_lower == "style":
            self._in_style = False
        elif tag_lower == "noscript":
            self._in_noscript = False

    def handle_data(self, data):
        if self._in_title:
            self._title_parts.append(data)
        if self._in_heading:
            self._heading_parts.append(data)
        if self._in_script:
            self._script_parts.append(data)
        if self._in_a:
            self._a_parts.append(data)
        if self._in_body and not self._in_script and not self._in_style and not self._in_noscript:
            self._body_text_parts.append(data)


# ---------------------------------------------------------------------------
# SEO Scoring
# ---------------------------------------------------------------------------

def compute_seo_scores(parsed):
    """
    Compute SEO scores across multiple categories.
    Returns dict of {category: {score, max, items}}.
    """
    scores = {}

    # -- Technical SEO --
    tech_score = 0
    tech_max = 7
    tech_items = []

    if parsed.title and len(parsed.title) > 0:
        tech_score += 1
        tech_items.append(("pass", "Title tag exists"))
    else:
        tech_items.append(("fail", "Missing title tag"))

    if parsed.meta_description and len(parsed.meta_description) > 0:
        tech_score += 1
        tech_items.append(("pass", "Meta description exists"))
    else:
        tech_items.append(("fail", "Missing meta description"))

    if parsed.canonical:
        tech_score += 1
        tech_items.append(("pass", "Canonical URL set"))
    else:
        tech_items.append(("fail", "Missing canonical URL"))

    if parsed.meta_viewport and "width=device-width" in (parsed.meta_viewport or ""):
        tech_score += 1
        tech_items.append(("pass", "Mobile viewport configured"))
    else:
        tech_items.append(("fail", "Mobile viewport missing or misconfigured"))

    if not parsed.meta_robots or "noindex" not in (parsed.meta_robots or "").lower():
        tech_score += 1
        tech_items.append(("pass", "Page is indexable"))
    else:
        tech_items.append(("fail", "Page has noindex!"))

    if parsed.schema_scripts:
        valid = any(
            _try_parse_json(s) for s in parsed.schema_scripts
        )
        if valid:
            tech_score += 1
            tech_items.append(("pass", "Schema markup (JSON-LD) present"))
        else:
            tech_items.append(("fail", "Schema markup invalid"))
    else:
        tech_items.append(("fail", "No schema markup found"))

    he_hreflang = [h for h in parsed.hreflang_tags if h["hreflang"].startswith("he")]
    if he_hreflang:
        tech_score += 1
        tech_items.append(("pass", "Hebrew hreflang set"))
    else:
        tech_items.append(("warn", "Hebrew hreflang missing"))

    scores["technical"] = {"score": tech_score, "max": tech_max, "items": tech_items}

    # -- Content SEO --
    content_score = 0
    content_max = 5
    content_items = []

    h1_tags = [h for h in parsed.headings if h[0] == 1]
    if len(h1_tags) == 1:
        content_score += 1
        content_items.append(("pass", "Single H1 tag"))
    elif len(h1_tags) == 0:
        content_items.append(("fail", "No H1 tag"))
    else:
        content_items.append(("warn", f"Multiple H1 tags ({len(h1_tags)})"))

    # Heading hierarchy
    heading_levels = [h[0] for h in parsed.headings]
    hierarchy_ok = True
    for i in range(1, len(heading_levels)):
        if heading_levels[i] > heading_levels[i - 1] + 1:
            hierarchy_ok = False
            break
    if hierarchy_ok:
        content_score += 1
        content_items.append(("pass", "Heading hierarchy is correct"))
    else:
        content_items.append(("warn", "Heading hierarchy has gaps"))

    if parsed.word_count >= 300:
        content_score += 1
        content_items.append(("pass", f"Sufficient content ({parsed.word_count} words)"))
    else:
        content_items.append(("warn", f"Thin content ({parsed.word_count} words)"))

    if parsed.title and len(parsed.title) <= 55:
        content_score += 1
        content_items.append(("pass", "Title length is optimal"))
    elif parsed.title:
        content_items.append(("warn", f"Title too long ({len(parsed.title)} chars)"))
    else:
        content_items.append(("fail", "No title"))

    if parsed.meta_description and 50 <= len(parsed.meta_description) <= 150:
        content_score += 1
        content_items.append(("pass", "Meta description length is optimal"))
    elif parsed.meta_description:
        content_items.append(("warn", f"Meta description length not ideal ({len(parsed.meta_description)} chars)"))
    else:
        content_items.append(("fail", "No meta description"))

    scores["content"] = {"score": content_score, "max": content_max, "items": content_items}

    # -- Hebrew/RTL --
    rtl_score = 0
    rtl_max = 3
    rtl_items = []

    if parsed.html_lang and parsed.html_lang.startswith("he"):
        rtl_score += 1
        rtl_items.append(("pass", "lang='he' set"))
    else:
        rtl_items.append(("fail", "Hebrew lang attribute missing"))

    if parsed.html_dir and parsed.html_dir.lower() == "rtl":
        rtl_score += 1
        rtl_items.append(("pass", "dir='rtl' set"))
    else:
        rtl_items.append(("fail", "RTL direction attribute missing"))

    og_locale = parsed.og_tags.get("og:locale", "")
    if og_locale == "he_IL":
        rtl_score += 1
        rtl_items.append(("pass", "og:locale is he_IL"))
    else:
        rtl_items.append(("warn", "og:locale not set to he_IL"))

    scores["hebrew_rtl"] = {"score": rtl_score, "max": rtl_max, "items": rtl_items}

    # -- Images & Media --
    img_score = 0
    img_max = 2
    img_items = []

    if parsed.images:
        missing_alt = [img for img in parsed.images if img["alt"] is None]
        if not missing_alt:
            img_score += 1
            img_items.append(("pass", "All images have alt text"))
        else:
            img_items.append(("fail", f"{len(missing_alt)} images missing alt text"))

        empty_alt = [img for img in parsed.images
                     if img["alt"] == "" and img.get("role") != "presentation"]
        if not empty_alt:
            img_score += 1
            img_items.append(("pass", "No non-decorative images with empty alt"))
        else:
            img_items.append(("warn", f"{len(empty_alt)} images with empty alt (not decorative)"))
    else:
        img_score = 2
        img_items.append(("pass", "No images to check"))

    scores["images"] = {"score": img_score, "max": img_max, "items": img_items}

    # -- Social / OG --
    social_score = 0
    social_max = 4
    social_items = []

    for og_key in ["og:title", "og:description", "og:image"]:
        if og_key in parsed.og_tags and parsed.og_tags[og_key]:
            social_score += 1
            social_items.append(("pass", f"{og_key} set"))
        else:
            social_items.append(("fail", f"{og_key} missing"))

    if og_locale == "he_IL":
        social_score += 1
        social_items.append(("pass", "og:locale correct"))
    else:
        social_items.append(("warn", "og:locale not he_IL"))

    scores["social"] = {"score": social_score, "max": social_max, "items": social_items}

    return scores


def _try_parse_json(s):
    try:
        json.loads(s)
        return True
    except (json.JSONDecodeError, ValueError):
        return False


# ---------------------------------------------------------------------------
# Traffic Light Indicator
# ---------------------------------------------------------------------------

def traffic_light(score, max_score):
    """Return traffic light emoji/text based on score percentage."""
    if max_score == 0:
        return "N/A", "N/A"
    pct = (score / max_score) * 100
    if pct >= 80:
        return "green", "ירוק"
    elif pct >= 50:
        return "yellow", "צהוב"
    else:
        return "red", "אדום"


def traffic_light_icon(color):
    """Return text indicator for traffic light."""
    icons = {
        "green": "[V]",   # checkmark-like
        "yellow": "[!]",  # warning
        "red": "[X]",     # fail
    }
    return icons.get(color, "[?]")


# ---------------------------------------------------------------------------
# Hebrew Report Generator
# ---------------------------------------------------------------------------

def generate_hebrew_report(parsed, scores, source, discovery_data=None):
    """Generate a Hebrew markdown SEO report."""
    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")

    # Calculate overall score
    total_score = sum(s["score"] for s in scores.values())
    total_max = sum(s["max"] for s in scores.values())
    overall_pct = round((total_score / total_max) * 100) if total_max else 0

    business_name = ""
    if discovery_data:
        business_name = discovery_data.get("name", "")

    lines = []

    # Header
    lines.append(f"# דוח בריאות SEO")
    if business_name:
        lines.append(f"## {business_name}")
    lines.append("")
    lines.append(f"**תאריך:** {date_str}")
    lines.append(f"**כתובת אתר:** {source}")
    lines.append(f"**ציון כולל:** {overall_pct}/100")
    lines.append("")
    lines.append("---")
    lines.append("")

    # -- Executive Summary --
    lines.append("## סיכום מנהלים")
    lines.append("")

    if overall_pct >= 80:
        lines.append("האתר במצב טוב מבחינת SEO. רוב הבדיקות עברו בהצלחה.")
        lines.append("יש מספר שיפורים קטנים שניתן לבצע לשיפור נוסף.")
    elif overall_pct >= 50:
        lines.append("האתר דורש שיפורים מספר תחומי SEO.")
        lines.append("מומלץ לטפל בנושאים המסומנים באדום בהקדם.")
    else:
        lines.append("האתר דורש שיפור משמעותי בתחומי SEO מרכזיים.")
        lines.append("מומלץ לטפל בנושאים הקריטיים מיידית לשיפור הנראות במנועי חיפוש.")
    lines.append("")

    # Key stats
    lines.append(f"- **מילים בדף:** {parsed.word_count}")
    lines.append(f"- **תמונות:** {len(parsed.images)}")
    h1_tags = [h for h in parsed.headings if h[0] == 1]
    lines.append(f"- **כותרות H1:** {len(h1_tags)}")
    lines.append(f"- **קישורים:** {len(parsed.links)}")
    if parsed.schema_scripts:
        lines.append(f"- **בלוקי Schema:** {len(parsed.schema_scripts)}")
    lines.append("")
    lines.append("---")
    lines.append("")

    # -- SEO Scores --
    lines.append("## ציוני SEO")
    lines.append("")

    category_names_he = {
        "technical": "SEO טכני",
        "content": "תוכן",
        "hebrew_rtl": "עברית ו-RTL",
        "images": "תמונות ומדיה",
        "social": "רשתות חברתיות (OG)",
    }

    for cat_key, cat_data in scores.items():
        cat_name = category_names_he.get(cat_key, cat_key)
        score = cat_data["score"]
        max_s = cat_data["max"]
        color, color_he = traffic_light(score, max_s)
        icon = traffic_light_icon(color)
        pct = round((score / max_s) * 100) if max_s else 0

        lines.append(f"### {icon} {cat_name}: {pct}% ({score}/{max_s})")
        lines.append("")

        for status, desc in cat_data["items"]:
            if status == "pass":
                lines.append(f"- [V] {desc}")
            elif status == "fail":
                lines.append(f"- [X] {desc}")
            else:
                lines.append(f"- [!] {desc}")
        lines.append("")

    lines.append("---")
    lines.append("")

    # -- Key Findings --
    lines.append("## ממצאים עיקריים")
    lines.append("")

    # Collect all failures and warnings
    failures = []
    warnings = []
    passes = []

    for cat_key, cat_data in scores.items():
        cat_name = category_names_he.get(cat_key, cat_key)
        for status, desc in cat_data["items"]:
            if status == "fail":
                failures.append((cat_name, desc))
            elif status == "warn":
                warnings.append((cat_name, desc))
            else:
                passes.append((cat_name, desc))

    if failures:
        lines.append("### בעיות קריטיות (דורשות טיפול מיידי)")
        lines.append("")
        for cat, desc in failures:
            lines.append(f"1. **{cat}** - {desc}")
        lines.append("")

    if warnings:
        lines.append("### אזהרות (מומלץ לטפל)")
        lines.append("")
        for cat, desc in warnings:
            lines.append(f"1. **{cat}** - {desc}")
        lines.append("")

    if passes and not failures:
        lines.append("### נקודות חיוביות")
        lines.append("")
        for cat, desc in passes[:5]:
            lines.append(f"- {desc}")
        lines.append("")

    lines.append("---")
    lines.append("")

    # -- Recommendations --
    lines.append("## המלצות")
    lines.append("")
    lines.append("ההמלצות מסודרות לפי עדיפות (השפעה גבוהה ראשונה):")
    lines.append("")

    recommendations = _generate_recommendations(parsed, scores, failures, warnings)

    for i, rec in enumerate(recommendations, 1):
        impact_he = {"high": "גבוהה", "medium": "בינונית", "low": "נמוכה"}
        lines.append(f"### {i}. {rec['title']}")
        lines.append(f"**השפעה:** {impact_he.get(rec['impact'], rec['impact'])}")
        lines.append(f"**תיאור:** {rec['description']}")
        if rec.get("action"):
            lines.append(f"**פעולה:** {rec['action']}")
        lines.append("")

    lines.append("---")
    lines.append("")

    # -- Next Steps --
    lines.append("## צעדים הבאים")
    lines.append("")

    next_steps = _generate_next_steps(failures, warnings, overall_pct)
    for i, step in enumerate(next_steps, 1):
        lines.append(f"{i}. {step}")
    lines.append("")

    lines.append("---")
    lines.append("")
    lines.append(f"*דוח זה נוצר אוטומטית על ידי MediaWave SEO Tools בתאריך {date_str}*")
    lines.append("")

    return "\n".join(lines)


def _generate_recommendations(parsed, scores, failures, warnings):
    """Generate prioritized recommendations based on audit results."""
    recs = []

    # Check each potential issue
    if not parsed.title:
        recs.append({
            "title": "הוספת תגית כותרת (Title Tag)",
            "impact": "high",
            "description": "לדף חסרה תגית כותרת. זהו אחד הגורמים החשובים ביותר ל-SEO.",
            "action": "הוסיפו תגית <title> עם מילת המפתח העיקרית ושם העסק. מומלץ עד 55 תווים."
        })
    elif parsed.title and len(parsed.title) > 55:
        recs.append({
            "title": "קיצור תגית הכותרת",
            "impact": "medium",
            "description": f"תגית הכותרת ארוכה ({len(parsed.title)} תווים). גוגל עלול לקצץ אותה בתוצאות החיפוש.",
            "action": "קצרו את הכותרת ל-55 תווים או פחות."
        })

    if not parsed.meta_description:
        recs.append({
            "title": "הוספת תיאור מטא (Meta Description)",
            "impact": "high",
            "description": "חסר תיאור מטא. זה משפיע על שיעור הלחיצות בתוצאות החיפוש.",
            "action": "הוסיפו תיאור מטא בן 50-150 תווים הכולל את מילת המפתח וקריאה לפעולה."
        })

    h1_tags = [h for h in parsed.headings if h[0] == 1]
    if len(h1_tags) == 0:
        recs.append({
            "title": "הוספת כותרת H1",
            "impact": "high",
            "description": "לדף חסרה כותרת H1. כל דף צריך כותרת ראשית אחת.",
            "action": "הוסיפו כותרת H1 אחת הכוללת את מילת המפתח העיקרית."
        })
    elif len(h1_tags) > 1:
        recs.append({
            "title": "צמצום כותרות H1",
            "impact": "medium",
            "description": f"נמצאו {len(h1_tags)} כותרות H1. מומלץ כותרת H1 יחידה לדף.",
            "action": "שנו את הכותרות הנוספות ל-H2 או H3."
        })

    if not parsed.canonical:
        recs.append({
            "title": "הגדרת כתובת קנונית (Canonical URL)",
            "impact": "high",
            "description": "חסרה תגית canonical. זה עלול לגרום לבעיות תוכן כפול.",
            "action": 'הוסיפו <link rel="canonical" href="URL"> בתגית <head>.'
        })

    if not parsed.schema_scripts:
        recs.append({
            "title": "הוספת Schema Markup (נתונים מובנים)",
            "impact": "high",
            "description": "לא נמצאו נתונים מובנים. Schema markup עוזר לגוגל להבין את העסק.",
            "action": "הוסיפו JSON-LD עם LocalBusiness, FAQPage, ו-BreadcrumbList."
        })

    if not parsed.html_lang or not parsed.html_lang.startswith("he"):
        recs.append({
            "title": "הגדרת שפת הדף לעברית",
            "impact": "medium",
            "description": "תגית השפה בדף אינה מוגדרת לעברית.",
            "action": 'הוסיפו lang="he" לתגית <html>.'
        })

    if not parsed.html_dir or parsed.html_dir.lower() != "rtl":
        recs.append({
            "title": "הגדרת כיוון RTL",
            "impact": "medium",
            "description": "כיוון הטקסט לא מוגדר ל-RTL.",
            "action": 'הוסיפו dir="rtl" לתגית <html>.'
        })

    missing_alt_imgs = [img for img in parsed.images if img["alt"] is None]
    if missing_alt_imgs:
        recs.append({
            "title": "הוספת טקסט חלופי לתמונות",
            "impact": "medium",
            "description": f"{len(missing_alt_imgs)} תמונות חסרות טקסט חלופי (alt).",
            "action": "הוסיפו תיאור בעברית לכל תמונה בתגית alt."
        })

    required_og = ["og:title", "og:description", "og:image"]
    missing_og = [k for k in required_og if k not in parsed.og_tags]
    if missing_og:
        recs.append({
            "title": "השלמת תגיות Open Graph",
            "impact": "medium",
            "description": f"חסרות תגיות: {', '.join(missing_og)}. אלה משפיעות על שיתוף ברשתות.",
            "action": "הוסיפו את תגיות ה-OG החסרות לשיפור הנראות בפייסבוק ו-WhatsApp."
        })

    if not parsed.meta_viewport:
        recs.append({
            "title": "הוספת תגית Viewport למובייל",
            "impact": "high",
            "description": "חסרה תגית viewport. הדף לא מותאם למובייל.",
            "action": 'הוסיפו <meta name="viewport" content="width=device-width, initial-scale=1">.'
        })

    if parsed.word_count < 300:
        recs.append({
            "title": "הרחבת התוכן בדף",
            "impact": "medium",
            "description": f"הדף מכיל רק {parsed.word_count} מילים. תוכן דל עלול לפגוע בדירוג.",
            "action": "הוסיפו תוכן איכותי ורלוונטי. מומלץ לפחות 300 מילים."
        })

    # Sort by impact
    impact_order = {"high": 0, "medium": 1, "low": 2}
    recs.sort(key=lambda r: impact_order.get(r["impact"], 3))

    # If no issues found
    if not recs:
        recs.append({
            "title": "האתר במצב מצוין!",
            "impact": "low",
            "description": "לא נמצאו בעיות SEO משמעותיות. המשיכו לעקוב אחר הביצועים.",
            "action": "בצעו בדיקה חודשית לוודא שהכל תקין."
        })

    return recs


def _generate_next_steps(failures, warnings, overall_pct):
    """Generate prioritized next steps."""
    steps = []

    if failures:
        steps.append("טפלו בבעיות הקריטיות (מסומנות באדום) בהקדם האפשרי")

    if warnings:
        steps.append("סקרו את האזהרות ותקנו לפי סדר עדיפות")

    steps.append("בצעו בדיקת SEO חוזרת לאחר תיקון הבעיות")
    steps.append("ודאו שה-Google Search Console מחובר ופעיל")
    steps.append("בדקו את הביצועים ב-Google PageSpeed Insights")

    if overall_pct < 80:
        steps.append("שקלו ייעוץ SEO מקצועי לשיפור נוסף")

    steps.append("בצעו בדיקת SEO חודשית שוטפת")

    return steps


# ---------------------------------------------------------------------------
# Fetch HTML
# ---------------------------------------------------------------------------

def fetch_html(source):
    """Fetch HTML from URL or read from local file."""
    if source.startswith("http://") or source.startswith("https://"):
        try:
            req = urllib.request.Request(
                source,
                headers={"User-Agent": "MediaWave-SEO-Report/1.0"}
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                charset = response.headers.get_content_charset() or "utf-8"
                return response.read().decode(charset, errors="replace"), source
        except urllib.error.URLError as e:
            print(f"Error fetching URL: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        path = os.path.abspath(source)
        if not os.path.isfile(path):
            print(f"Error: File not found: {path}", file=sys.stderr)
            sys.exit(1)
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            return f.read(), None


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="MediaWave SEO Report - Hebrew SEO health report generator for clients",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python seo-report.py https://example.co.il
  python seo-report.py page.html -o seo-report.md
  python seo-report.py https://example.co.il --discovery discovery-output.json
        """
    )
    parser.add_argument("source",
                        help="URL or local HTML file path to analyze")
    parser.add_argument("-o", "--output",
                        help="Output markdown file path (default: seo-report-YYYY-MM-DD.md)")
    parser.add_argument("--discovery",
                        help="Path to discovery output JSON for additional context")
    parser.add_argument("--stdout", action="store_true",
                        help="Print report to stdout instead of file")

    args = parser.parse_args()

    # Load discovery data if provided
    discovery_data = None
    if args.discovery:
        discovery_path = os.path.abspath(args.discovery)
        if os.path.isfile(discovery_path):
            try:
                with open(discovery_path, "r", encoding="utf-8") as f:
                    discovery_data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"Warning: Could not parse discovery JSON: {e}", file=sys.stderr)
        else:
            print(f"Warning: Discovery file not found: {discovery_path}", file=sys.stderr)

    # Fetch and parse HTML
    html_content, source_url = fetch_html(args.source)

    seo_parser = SEOHTMLParser()
    try:
        seo_parser.feed(html_content)
    except Exception as e:
        print(f"Error parsing HTML: {e}", file=sys.stderr)
        sys.exit(1)

    # Compute scores
    scores = compute_seo_scores(seo_parser)

    # Generate report
    report = generate_hebrew_report(seo_parser, scores, args.source, discovery_data)

    # Output
    if args.stdout:
        print(report)
    else:
        if args.output:
            output_path = os.path.abspath(args.output)
        else:
            date_str = datetime.now().strftime("%Y-%m-%d")
            output_path = os.path.abspath(f"seo-report-{date_str}.md")

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"SEO report written to: {output_path}")

    # Print summary to stderr
    total_score = sum(s["score"] for s in scores.values())
    total_max = sum(s["max"] for s in scores.values())
    overall_pct = round((total_score / total_max) * 100) if total_max else 0
    print(f"\nOverall SEO Score: {overall_pct}/100 ({total_score}/{total_max})", file=sys.stderr)


if __name__ == "__main__":
    main()
