# WKND Site Scope Analysis Plan

## Objective
Perform a complete EDS migration scope analysis for **https://wknd.site/us/en.html** — discovering all URLs, cataloging page templates and block variants, and producing a migration effort estimate.

## Approach
The scope workflow runs the site catalog pipeline (URL discovery → page analysis → template discovery → naming → block cataloging) and then generates a migration summary report. Site-planning mode is already enabled so the migration viewer surfaces in the UI.

## Current Progress
- ✅ Site-planning mode enabled in project config
- ✅ Task list created (7 phases)
- ✅ Catalog project scaffolded (`catalog/` folder + `.catalog-config.json`)
- ⏳ URL discovery — in progress (sitemap → crawl → Playwright fallback)

## Checklist
- [x] Enable site-planning mode
- [x] Set up catalog project structure
- [ ] **Determine & prepare URLs** — discover all site URLs via sitemap, then group/sample them
- [ ] **Analyze pages** — batch-analyze each page for content structure, sections, and blocks
- [ ] **Discover templates** — cluster similar pages into page templates
- [ ] **Name templates** — apply human-readable names to discovered templates
- [ ] **Catalog block variants** — enumerate and document reusable block variants
- [ ] **Generate summary** — produce `summary.json` with metrics and migration effort estimates
- [ ] **Present site catalog** — deliver the user-facing scope report

## Expected Deliverables
- `catalog/urls-all.json`, `urls-grouped.json`, `urls-sample.json` — discovered URLs
- `catalog/template-catalog.json` — named page templates
- `catalog/block-catalog.json` — block variant inventory
- `catalog/summary.json` — migration metrics & effort estimate
- `tools/importer/page-templates.json` — scoping output artifact
- Final user-facing scope report (URL count, template count, block variants, effort estimate)

## Notes
- Execution requires **Execute mode** — the workflow runs scripts and writes catalog files, which are not permitted in plan mode.
- Runtime scales with page count (~30 pages/min + ~10 min overhead); WKND is a small demo site, so this should complete quickly.
