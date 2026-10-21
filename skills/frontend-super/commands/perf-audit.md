---
description: Performance audit with Lighthouse — fix top 3 issues
argument-hint: [URL-path like / or /about]
---

Run a performance audit on `localhost:3000$ARGUMENTS` and fix the highest-impact issues.

## Process

### Step 1: Run Lighthouse
```powershell
npx lighthouse http://localhost:3000$ARGUMENTS --output=json --output-path=lighthouse-report.json --chrome-flags="--headless"
```

If Lighthouse CLI is not available:
```powershell
npx lighthouse http://localhost:3000$ARGUMENTS --output=html --output-path=lighthouse-report.html --chrome-flags="--headless"
```

### Step 2: Analyze Core Web Vitals
Extract and report:
- **LCP** (Largest Contentful Paint): target < 2.5s
- **INP** (Interaction to Next Paint): target < 200ms
- **CLS** (Cumulative Layout Shift): target < 0.1
- **Performance Score**: target >= 90

### Step 3: Identify Top Issues
Common frontend performance issues to check:
1. **Unoptimized images** — missing width/height, no lazy loading, oversized
2. **Render-blocking resources** — CSS/JS in head without async/defer
3. **Large JS bundles** — check with `npx vite-bundle-visualizer` for Vite projects
4. **Unused CSS/JS** — dead code inflating bundle
5. **Missing compression** — gzip/brotli not configured
6. **No caching headers** — static assets should have cache-control
7. **Web fonts** — font-display: swap missing, too many weights loaded
8. **Layout shifts** — images without dimensions, dynamic content pushing layout

### Step 4: Fix Top 3
Implement the 3 highest-impact fixes. For each:
- Describe the issue
- Show the fix
- Estimate the impact

### Step 5: Re-Run Lighthouse
```powershell
npx lighthouse http://localhost:3000$ARGUMENTS --output=json --output-path=lighthouse-report-after.json --chrome-flags="--headless"
```

### Step 6: Report

```
## Performance Audit: $ARGUMENTS

### Before
- Performance: XX/100
- LCP: X.Xs | INP: Xms | CLS: X.XX

### Fixes Applied
1. [Issue]: [Fix] — estimated impact: +X points
2. [Issue]: [Fix] — estimated impact: +X points
3. [Issue]: [Fix] — estimated impact: +X points

### After
- Performance: XX/100 (+X improvement)
- LCP: X.Xs | INP: Xms | CLS: X.XX
```
