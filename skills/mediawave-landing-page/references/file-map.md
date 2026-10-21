# File Map - Complete Skill Catalog

Annotated index of every bundled file in this skill. All paths are relative to the skill root.

## Table of Contents
1. [Core References](#core-references)
2. [Enhancement References](#enhancement-references)
3. [SEO References](#seo-references)
4. [Scripts](#scripts)
5. [Core Templates](#core-templates)
6. [Enhancement Templates](#enhancement-templates)
7. [SEO Templates](#seo-templates)
8. [Agents](#agents)

## Core References

| File | Content |
|------|---------|
| references/phase-0.5-proposal.md | Proposal generation workflow, pricing tiers, payment structures, auto-fill logic |
| references/phase-1-discovery.md | Discovery process, competitive analysis |
| references/phase-2-inspiration.md | Inspiration sources, mood boarding |
| references/phase-3-design-system.md | Design token generation |
| references/phase-4-copy.md | Hebrew copywriting, CRO principles |
| references/phase-5-build.md | Next.js build patterns |
| references/phase-6-optimize.md | Performance, SEO, accessibility |
| references/phase-7-deliver.md | Deploy, analytics, handoff |
| references/payload-cms-setup.md | Complete Payload CMS configuration |
| references/hebrew-rtl-guide.md | Hebrew/RTL patterns and fonts |
| references/question-engine.md | Full research-backed question bank |
| references/frontend-super-integration.md | Per-phase frontend-super skill activation map |
| references/file-map.md | This file |

## Enhancement References

| File | Content |
|------|---------|
| references/content-collection-guide.md | Content briefs, shot lists, asset processing pipeline (sharp) |
| references/animation-research-agent.md | Animation sources, industry mapping, performance budgets |
| references/copy-variants-framework.md | PAS/AIDA/4U frameworks, Hebrew examples, A/B infrastructure |
| references/legal-templates-il.md | IS 5568, Amendment 13, consumer protection, business disclaimers |
| references/revision-workflow.md | Revision tracking, scope creep detection, batch execution |
| references/post-launch-monitoring.md | Lighthouse CI, UptimeRobot, GA4, health check automation, monitoring tiers |
| references/client-handoff-guide.md | CMS guide, credentials, quick reference, maintenance |
| references/font-research-agent.md | קטלוג פונטים עבריים, מיפוי תעשייה-לפונט, תקציבי ביצועים, שילובים מוכחים |

## SEO References

| File | Content |
|------|---------|
| references/seo/seo-master-guide.md | SEO strategy overview, Israeli SEO formula, quick wins, file map |
| references/seo/on-page-seo.md | Hebrew title tags (50-55 chars), meta descriptions, headings, content optimization |
| references/seo/technical-seo.md | Crawlability, Core Web Vitals, sitemap.ts, robots.ts, AI crawler rules, llms.txt |
| references/seo/local-seo-israel.md | GBP optimization, Israeli directories (20+), citations, Waze, reviews |
| references/seo/hebrew-keyword-research.md | Hebrew morphology (7 prefixes), keyword expansion, tools, search intent |
| references/seo/schema-markup-library.md | Complete JSON-LD library: LocalBusiness (30+ sub-types), FAQPage, Service, etc. |
| references/seo/link-building-israel.md | 22 Israeli directories in 5 tiers, submission workflow, review strategy |
| references/seo/ai-seo-aeo.md | Answer Engine Optimization, AI citation strategies, llms.txt spec |
| references/seo/seo-checklist.md | Pre-launch and post-launch SEO checklists (5 phases, 100+ items) |
| references/seo/seo-monitoring.md | GSC setup, ranking tracking, AI citation monitoring, Hebrew reports |

## Scripts

All scripts are Python 3, standard library only - no pip installs required.
Run via `python ${CLAUDE_SKILL_DIR}/scripts/<name>.py` (use `--help` for full options).

| File | Content |
|------|---------|
| scripts/seo-audit.py | On-page SEO audit - 21 checks, URL or HTML input, exit codes 0/1/2 |
| scripts/generate-schema.py | JSON-LD generator from discovery JSON - auto-detects business sub-type |
| scripts/generate-sitemap.py | XML sitemap + robots.txt generator with hreflang="he" |
| scripts/keyword-research-helper.py | Hebrew keyword expansion - 56+ variations, 7 categories |
| scripts/seo-report.py | Hebrew SEO health report - 5 scoring categories, traffic-light indicators |

## Core Templates

| File | Content |
|------|---------|
| templates/client-questionnaire-he.md | Hebrew client questionnaire |
| templates/design-system-template.md | Design system output template |
| templates/client-handoff-he.md | Hebrew client handoff guide (original) |
| templates/payload-collections.ts | Payload CMS collection templates (9 blocks, 6 collections, 3 globals) |

## Enhancement Templates

| File | Content |
|------|---------|
| templates/proposal-he.md | Hebrew proposal with scope, pricing, terms, signature |
| templates/content-brief-he.md | Hebrew content brief sent to clients |
| templates/accessibility-statement-he.md | הצהרת נגישות - IS 5568 compliance |
| templates/privacy-policy-he.md | מדיניות פרטיות - Amendment 13 compliance |
| templates/terms-of-service-he.md | תנאי שימוש - business-type-specific |
| templates/revision-request-he.md | Hebrew revision request form for clients |
| templates/week1-report-he.md | Hebrew post-launch week-1 report |
| templates/handoff-package-he.md | Hebrew client handoff package |

## SEO Templates

| File | Content |
|------|---------|
| templates/robots-txt.md | robots.txt template with Next.js App Router code + AI crawler rules |
| templates/sitemap-template.xml | XML sitemap template with Next.js sitemap.ts code |
| templates/seo-report-he.md | Hebrew SEO report template for client delivery |

## Agents

Spawn with the **Agent** tool (`subagent_type: general-purpose`), passing the agent file content as the prompt.

| File | Content |
|------|---------|
| agents/font-researcher.md | סוכן-משנה לחקר פונטים ייחודיים, הערכה ושילובים |
| agents/animation-researcher.md | Sub-agent for animation discovery and evaluation |
