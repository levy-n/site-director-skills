#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MediaWave SEO Audit Tool
========================
Automated on-page SEO audit for Hebrew RTL landing pages.
Checks title, meta, headings, images, schema, OG tags, and more.
Uses only Python stdlib - no external dependencies required.

Usage:
    python seo-audit.py https://example.co.il
    python seo-audit.py path/to/page.html
    python seo-audit.py page.html --keyword "מאפייה רחובות"
"""

import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.error
from html.parser import HTMLParser
from collections import OrderedDict


# ---------------------------------------------------------------------------
# HTML Parser
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
        self.headings = []  # list of (level, text)
        self.images = []    # list of {src, alt}
        self.links = []     # list of {href, text, rel}
        self.schema_scripts = []
        self.html_lang = None
        self.html_dir = None
        self.word_count = 0

        # Internal state
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
            http_equiv = attrs_dict.get("http-equiv", "").lower()

            if name == "description":
                self.meta_description = content
            elif name == "robots":
                self.meta_robots = content
            elif name == "viewport":
                self.meta_viewport = content

            # Open Graph
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
            alt = attrs_dict.get("alt", None)  # None = missing, "" = empty
            role = attrs_dict.get("role", "")
            self.images.append({"src": src, "alt": alt, "role": role})

        elif tag_lower == "script":
            script_type = attrs_dict.get("type", "").lower()
            self._in_script = True
            self._script_type = script_type
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
            self._script_type = None

        elif tag_lower == "a" and self._in_a:
            text = "".join(self._a_parts).strip()
            self.links.append({
                "href": self._a_href or "",
                "text": text,
                "rel": self._a_rel or ""
            })
            self._in_a = False

        elif tag_lower == "body":
            self._in_body = False
            full_text = " ".join(self._body_text_parts)
            # Count words (handles Hebrew and English)
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
# SEO Checks
# ---------------------------------------------------------------------------

class SEOCheck:
    """Represents a single SEO check result."""

    PASS = "PASS"
    FAIL = "FAIL"
    WARN = "WARN"

    def __init__(self, name, status, message, detail=None):
        self.name = name
        self.status = status
        self.message = message
        self.detail = detail

    def __str__(self):
        icon = {"PASS": "[PASS]", "FAIL": "[FAIL]", "WARN": "[WARN]"}[self.status]
        line = f"  {icon} {self.name}: {self.message}"
        if self.detail:
            line += f"\n         {self.detail}"
        return line


def run_audit(parsed: SEOHTMLParser, keyword: str = None, source_url: str = None):
    """Run all SEO checks and return a list of SEOCheck objects."""
    checks = []

    # -----------------------------------------------------------------------
    # 1. Title Tag
    # -----------------------------------------------------------------------
    if parsed.title is None:
        checks.append(SEOCheck("Title Tag", SEOCheck.FAIL,
                               "Missing <title> tag"))
    elif len(parsed.title) == 0:
        checks.append(SEOCheck("Title Tag", SEOCheck.FAIL,
                               "Title tag is empty"))
    else:
        title_len = len(parsed.title)
        if title_len > 55:
            checks.append(SEOCheck("Title Tag", SEOCheck.WARN,
                                   f"Title length is {title_len} chars (recommended <=55 for Hebrew)",
                                   f'Title: "{parsed.title}"'))
        else:
            checks.append(SEOCheck("Title Tag", SEOCheck.PASS,
                                   f"Title present ({title_len} chars)",
                                   f'Title: "{parsed.title}"'))

        if keyword and keyword.lower() not in parsed.title.lower():
            checks.append(SEOCheck("Title Keyword", SEOCheck.WARN,
                                   f'Target keyword "{keyword}" not found in title'))
        elif keyword:
            checks.append(SEOCheck("Title Keyword", SEOCheck.PASS,
                                   "Target keyword found in title"))

    # -----------------------------------------------------------------------
    # 2. Meta Description
    # -----------------------------------------------------------------------
    if parsed.meta_description is None:
        checks.append(SEOCheck("Meta Description", SEOCheck.FAIL,
                               "Missing meta description"))
    elif len(parsed.meta_description) == 0:
        checks.append(SEOCheck("Meta Description", SEOCheck.FAIL,
                               "Meta description is empty"))
    else:
        desc_len = len(parsed.meta_description)
        if desc_len > 150:
            checks.append(SEOCheck("Meta Description", SEOCheck.WARN,
                                   f"Description length is {desc_len} chars (recommended <=150 for Hebrew)",
                                   f'Description: "{parsed.meta_description[:80]}..."'))
        elif desc_len < 50:
            checks.append(SEOCheck("Meta Description", SEOCheck.WARN,
                                   f"Description is short ({desc_len} chars, recommended 50-150)",
                                   f'Description: "{parsed.meta_description}"'))
        else:
            checks.append(SEOCheck("Meta Description", SEOCheck.PASS,
                                   f"Meta description present ({desc_len} chars)"))

    # -----------------------------------------------------------------------
    # 3. H1 Tag
    # -----------------------------------------------------------------------
    h1_tags = [h for h in parsed.headings if h[0] == 1]
    if len(h1_tags) == 0:
        checks.append(SEOCheck("H1 Tag", SEOCheck.FAIL, "No H1 tag found"))
    elif len(h1_tags) > 1:
        checks.append(SEOCheck("H1 Tag", SEOCheck.WARN,
                               f"Multiple H1 tags found ({len(h1_tags)})",
                               "Recommended: exactly one H1 per page"))
    else:
        checks.append(SEOCheck("H1 Tag", SEOCheck.PASS,
                               f'Single H1 found: "{h1_tags[0][1][:60]}"'))
        if keyword and keyword.lower() not in h1_tags[0][1].lower():
            checks.append(SEOCheck("H1 Keyword", SEOCheck.WARN,
                                   f'Target keyword "{keyword}" not found in H1'))
        elif keyword:
            checks.append(SEOCheck("H1 Keyword", SEOCheck.PASS,
                                   "Target keyword found in H1"))

    # -----------------------------------------------------------------------
    # 4. Heading Hierarchy
    # -----------------------------------------------------------------------
    heading_levels = [h[0] for h in parsed.headings]
    hierarchy_ok = True
    hierarchy_issues = []
    for i in range(1, len(heading_levels)):
        if heading_levels[i] > heading_levels[i - 1] + 1:
            hierarchy_ok = False
            hierarchy_issues.append(
                f"H{heading_levels[i-1]} -> H{heading_levels[i]} (skips H{heading_levels[i-1]+1})"
            )
    if hierarchy_ok:
        checks.append(SEOCheck("Heading Hierarchy", SEOCheck.PASS,
                               "No heading level skips detected"))
    else:
        checks.append(SEOCheck("Heading Hierarchy", SEOCheck.WARN,
                               "Heading hierarchy has gaps",
                               "; ".join(hierarchy_issues)))

    # -----------------------------------------------------------------------
    # 5. Images Alt Text
    # -----------------------------------------------------------------------
    if not parsed.images:
        checks.append(SEOCheck("Image Alt Text", SEOCheck.PASS,
                               "No images found (N/A)"))
    else:
        missing_alt = [img for img in parsed.images
                       if img["alt"] is None]
        empty_alt_non_decorative = [img for img in parsed.images
                                    if img["alt"] == "" and img.get("role") != "presentation"]
        if missing_alt:
            srcs = [img["src"][:50] for img in missing_alt[:3]]
            checks.append(SEOCheck("Image Alt Text", SEOCheck.FAIL,
                                   f"{len(missing_alt)} image(s) missing alt attribute",
                                   f"e.g.: {', '.join(srcs)}"))
        elif empty_alt_non_decorative:
            checks.append(SEOCheck("Image Alt Text", SEOCheck.WARN,
                                   f"{len(empty_alt_non_decorative)} image(s) have empty alt (not marked decorative)"))
        else:
            checks.append(SEOCheck("Image Alt Text", SEOCheck.PASS,
                                   f"All {len(parsed.images)} images have alt text"))

    # -----------------------------------------------------------------------
    # 6. Canonical URL
    # -----------------------------------------------------------------------
    if parsed.canonical:
        checks.append(SEOCheck("Canonical URL", SEOCheck.PASS,
                               f"Canonical set: {parsed.canonical[:70]}"))
    else:
        checks.append(SEOCheck("Canonical URL", SEOCheck.FAIL,
                               "No canonical URL found"))

    # -----------------------------------------------------------------------
    # 7. Hreflang
    # -----------------------------------------------------------------------
    he_hreflang = [h for h in parsed.hreflang_tags if h["hreflang"].startswith("he")]
    if he_hreflang:
        checks.append(SEOCheck("Hreflang (he)", SEOCheck.PASS,
                               f"Hebrew hreflang found: {he_hreflang[0]['hreflang']}"))
    else:
        checks.append(SEOCheck("Hreflang (he)", SEOCheck.WARN,
                               "No hreflang tag with 'he' found",
                               "Recommended for Hebrew pages"))

    # -----------------------------------------------------------------------
    # 8. Open Graph Tags
    # -----------------------------------------------------------------------
    required_og = ["og:title", "og:description", "og:image"]
    for og_key in required_og:
        if og_key in parsed.og_tags and parsed.og_tags[og_key]:
            checks.append(SEOCheck(f"OG: {og_key}", SEOCheck.PASS,
                                   f'Value: "{parsed.og_tags[og_key][:60]}"'))
        else:
            checks.append(SEOCheck(f"OG: {og_key}", SEOCheck.FAIL,
                                   f"Missing {og_key} tag"))

    og_locale = parsed.og_tags.get("og:locale", "")
    if og_locale == "he_IL":
        checks.append(SEOCheck("OG: og:locale", SEOCheck.PASS,
                               "og:locale is he_IL"))
    elif og_locale:
        checks.append(SEOCheck("OG: og:locale", SEOCheck.WARN,
                               f'og:locale is "{og_locale}" (expected he_IL)'))
    else:
        checks.append(SEOCheck("OG: og:locale", SEOCheck.WARN,
                               "Missing og:locale (recommended: he_IL)"))

    # -----------------------------------------------------------------------
    # 9. Schema Markup (JSON-LD)
    # -----------------------------------------------------------------------
    if parsed.schema_scripts:
        valid_count = 0
        for script_content in parsed.schema_scripts:
            try:
                data = json.loads(script_content)
                valid_count += 1
            except json.JSONDecodeError:
                pass
        if valid_count > 0:
            checks.append(SEOCheck("Schema Markup", SEOCheck.PASS,
                                   f"{valid_count} valid JSON-LD block(s) found"))
        else:
            checks.append(SEOCheck("Schema Markup", SEOCheck.WARN,
                                   "JSON-LD scripts found but none are valid JSON"))
    else:
        checks.append(SEOCheck("Schema Markup", SEOCheck.FAIL,
                               "No JSON-LD schema markup found"))

    # -----------------------------------------------------------------------
    # 10. Robots Meta
    # -----------------------------------------------------------------------
    if parsed.meta_robots:
        if "noindex" in parsed.meta_robots.lower():
            checks.append(SEOCheck("Robots Meta", SEOCheck.FAIL,
                                   "Page is set to noindex!",
                                   f'robots: "{parsed.meta_robots}"'))
        else:
            checks.append(SEOCheck("Robots Meta", SEOCheck.PASS,
                                   f'robots: "{parsed.meta_robots}"'))
    else:
        checks.append(SEOCheck("Robots Meta", SEOCheck.PASS,
                               "No robots meta (defaults to index, follow)"))

    # -----------------------------------------------------------------------
    # 11. Lang Attribute
    # -----------------------------------------------------------------------
    if parsed.html_lang:
        if parsed.html_lang.startswith("he"):
            checks.append(SEOCheck("HTML lang", SEOCheck.PASS,
                                   f'lang="{parsed.html_lang}"'))
        else:
            checks.append(SEOCheck("HTML lang", SEOCheck.WARN,
                                   f'lang="{parsed.html_lang}" (expected "he" for Hebrew page)'))
    else:
        checks.append(SEOCheck("HTML lang", SEOCheck.FAIL,
                               "Missing lang attribute on <html> tag"))

    # -----------------------------------------------------------------------
    # 12. Dir Attribute
    # -----------------------------------------------------------------------
    if parsed.html_dir:
        if parsed.html_dir.lower() == "rtl":
            checks.append(SEOCheck("HTML dir", SEOCheck.PASS,
                                   'dir="rtl"'))
        else:
            checks.append(SEOCheck("HTML dir", SEOCheck.WARN,
                                   f'dir="{parsed.html_dir}" (expected "rtl" for Hebrew page)'))
    else:
        checks.append(SEOCheck("HTML dir", SEOCheck.FAIL,
                               "Missing dir attribute on <html> tag (expected rtl)"))

    # -----------------------------------------------------------------------
    # 13. Mobile Viewport
    # -----------------------------------------------------------------------
    if parsed.meta_viewport:
        if "width=device-width" in parsed.meta_viewport:
            checks.append(SEOCheck("Mobile Viewport", SEOCheck.PASS,
                                   "Viewport meta tag present with device-width"))
        else:
            checks.append(SEOCheck("Mobile Viewport", SEOCheck.WARN,
                                   "Viewport meta found but missing width=device-width",
                                   f'viewport: "{parsed.meta_viewport}"'))
    else:
        checks.append(SEOCheck("Mobile Viewport", SEOCheck.FAIL,
                               "Missing viewport meta tag"))

    # -----------------------------------------------------------------------
    # 14. Links Analysis
    # -----------------------------------------------------------------------
    internal_links = []
    external_links = []
    for link in parsed.links:
        href = link["href"]
        if not href or href.startswith("#") or href.startswith("javascript:"):
            continue
        if href.startswith("mailto:") or href.startswith("tel:"):
            continue
        if source_url:
            # Determine internal vs external based on source URL
            from urllib.parse import urlparse
            source_domain = urlparse(source_url).netloc
            link_domain = urlparse(href).netloc
            if not link_domain or link_domain == source_domain:
                internal_links.append(href)
            else:
                external_links.append(href)
        else:
            # For local files, relative = internal, absolute = external
            if href.startswith("http://") or href.startswith("https://"):
                external_links.append(href)
            else:
                internal_links.append(href)

    checks.append(SEOCheck("Internal Links", SEOCheck.PASS
                           if internal_links else SEOCheck.WARN,
                           f"{len(internal_links)} internal link(s) found"))
    checks.append(SEOCheck("External Links", SEOCheck.PASS,
                           f"{len(external_links)} external link(s) found"))

    # -----------------------------------------------------------------------
    # 15. Word Count
    # -----------------------------------------------------------------------
    wc = parsed.word_count
    if wc < 300:
        checks.append(SEOCheck("Word Count", SEOCheck.WARN,
                               f"{wc} words (recommended >=300 for SEO)",
                               "Thin content may rank poorly"))
    else:
        checks.append(SEOCheck("Word Count", SEOCheck.PASS,
                               f"{wc} words"))

    return checks


# ---------------------------------------------------------------------------
# Report Formatter
# ---------------------------------------------------------------------------

def format_report(checks, source):
    """Format the audit results into a readable report."""
    lines = []
    lines.append("=" * 70)
    lines.append("  MEDIAWAVE SEO AUDIT REPORT")
    lines.append("=" * 70)
    lines.append(f"  Source: {source}")
    lines.append("-" * 70)

    pass_count = sum(1 for c in checks if c.status == SEOCheck.PASS)
    warn_count = sum(1 for c in checks if c.status == SEOCheck.WARN)
    fail_count = sum(1 for c in checks if c.status == SEOCheck.FAIL)
    total = len(checks)

    lines.append(f"  Results: {pass_count} PASS | {warn_count} WARN | {fail_count} FAIL  (Total: {total})")
    lines.append("")

    # Group by status
    if fail_count:
        lines.append("  --- FAILURES ---")
        for c in checks:
            if c.status == SEOCheck.FAIL:
                lines.append(str(c))
        lines.append("")

    if warn_count:
        lines.append("  --- WARNINGS ---")
        for c in checks:
            if c.status == SEOCheck.WARN:
                lines.append(str(c))
        lines.append("")

    if pass_count:
        lines.append("  --- PASSED ---")
        for c in checks:
            if c.status == SEOCheck.PASS:
                lines.append(str(c))
        lines.append("")

    # Score
    score = round((pass_count / total) * 100) if total else 0
    lines.append("-" * 70)
    lines.append(f"  SEO Score: {score}/100")
    if score == 100:
        lines.append("  Status: ALL CHECKS PASSED")
    elif fail_count == 0:
        lines.append("  Status: WARNINGS ONLY - Review recommended")
    else:
        lines.append("  Status: FAILURES DETECTED - Action required")
    lines.append("=" * 70)

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def fetch_html(source):
    """Fetch HTML from URL or read from local file."""
    if source.startswith("http://") or source.startswith("https://"):
        try:
            req = urllib.request.Request(
                source,
                headers={"User-Agent": "MediaWave-SEO-Audit/1.0"}
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                charset = response.headers.get_content_charset() or "utf-8"
                return response.read().decode(charset, errors="replace"), source
        except urllib.error.URLError as e:
            print(f"Error fetching URL: {e}", file=sys.stderr)
            sys.exit(2)
    else:
        path = os.path.abspath(source)
        if not os.path.isfile(path):
            print(f"Error: File not found: {path}", file=sys.stderr)
            sys.exit(2)
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            return f.read(), None


def main():
    parser = argparse.ArgumentParser(
        description="MediaWave SEO Audit - On-page SEO checker for Hebrew landing pages",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python seo-audit.py https://example.co.il
  python seo-audit.py page.html --keyword "מאפייה רחובות"
  python seo-audit.py build/index.html -k "שיפוצניק תל אביב" -o report.txt
        """
    )
    parser.add_argument("source",
                        help="URL or local HTML file path to audit")
    parser.add_argument("-k", "--keyword",
                        help="Target keyword to check in title/H1")
    parser.add_argument("-o", "--output",
                        help="Write report to file instead of stdout")

    args = parser.parse_args()

    # Fetch HTML
    html_content, source_url = fetch_html(args.source)

    # Parse
    seo_parser = SEOHTMLParser()
    try:
        seo_parser.feed(html_content)
    except Exception as e:
        print(f"Error parsing HTML: {e}", file=sys.stderr)
        sys.exit(2)

    # Run audit
    checks = run_audit(seo_parser, keyword=args.keyword, source_url=source_url)

    # Generate report
    report = format_report(checks, args.source)

    # Output
    if args.output:
        out_path = os.path.abspath(args.output)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"Report written to: {out_path}")
    else:
        print(report)

    # Exit code
    fail_count = sum(1 for c in checks if c.status == SEOCheck.FAIL)
    warn_count = sum(1 for c in checks if c.status == SEOCheck.WARN)

    if fail_count > 0:
        sys.exit(2)
    elif warn_count > 0:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
