# WKND Site Migration Plan (→ EDS with da.live content source)

## Overview
Migrate the key pages of **https://wknd.site/us/en.html** (Adobe WKND Adventures reference site) into this Edge Delivery Services project, using **da.live (Document Authoring)** as the content source. The plan maps WKND's page types to reusable **templates**, reuses existing blocks where possible, and identifies the **new blocks** to build.

> Note: This is a planning artifact only. Actual execution (scraping, block creation, content import, upload to da.live) requires **Execute mode**.

## Source Pages Analyzed
| Page | URL | Purpose |
|------|-----|---------|
| Home | `/us/en.html` | Landing: hero carousel, featured teaser, recent articles, adventure cards |
| Magazine (landing) | `/us/en/magazine.html` | Article listing + members-only teasers |
| Article (detail) | `/us/en/magazine/western-australia.html` | Long-form article with author, pull quote, related content |
| Adventures (listing) | `/us/en/adventures.html` | Filterable carousel/grid of adventure cards |
| Adventure (detail) | `/us/en/adventures/*.html` | Trip detail: hero, description, gallery, itinerary |
| FAQs | `/us/en/faqs.html` | Heading + paragraph Q&A, hero, contact block |
| About Us | `/us/en/about-us.html` | Static content page |

## Existing Blocks (reuse — no work needed)
`hero`, `cards`, `carousel`, `columns`, `teaser`, `article-list`, `accordion`, `quote`, `banner`, `breadcrumb`, `embed`, `table`, `tabs`, `video`, `search`, `header`, `footer`, `fragment`, `form`, `modal`, `employee-list`, `widget`

Most WKND needs are already covered:
- **Hero carousel** → `carousel` + `hero`
- **Recent/related articles grid** → `article-list` or `cards`
- **Featured teaser / members-only teaser** → `teaser`
- **Adventure destination cards** → `cards`
- **Pull quote (wanderlust definition)** → `quote`
- **FAQ Q&A** → default content (headings + paragraphs), optionally `accordion`

## Templates Needed (7)
| Template | Based on | Blocks used |
|----------|----------|-------------|
| `home` | Home page | carousel(hero), teaser, article-list/cards, cards |
| `magazine-landing` | Magazine listing | hero, article-list, teaser |
| `article` | Article detail | hero, breadcrumb, default text, quote, `author-bio` (new), `related-articles` |
| `adventure-listing` | Adventures listing | `adventure-filter` (new) + cards/carousel |
| `adventure-detail` | Adventure detail | hero, `adventure-details` (new), carousel(gallery), `itinerary` (new/accordion) |
| `faq` | FAQs | hero/banner, default content (or accordion), contact `columns` |
| `content-page` | About Us / generic | hero + default content + columns |

## New Blocks Required (after reuse analysis)
1. **`author-bio`** — Article contributor block: photo, bio, social links. (No existing equivalent; `employee-list` is close but not a fit for single-author byline.)
2. **`adventure-details`** — Structured trip facts (length, price, difficulty, group size) as a labeled details panel.
3. **`adventure-filter`** — Category filter tabs (All/Climbing/Cycling/Skiing/Surfing/Travel) driving a card/carousel list. May be built by extending `tabs` + `cards`.
4. **`related-articles`** — "You might also like" grid. *Candidate to reuse `article-list`/`cards` instead — decision below.*
5. **`itinerary`** *(optional)* — Day-by-day plan; likely satisfiable with existing `accordion`.

## Decisions Needed From You
- Which pages are in scope for the first migration pass (all 7 templates vs. subset)?
- Whether to build dedicated new blocks vs. reuse `cards`/`article-list`/`accordion` for related-articles and itinerary.
- Confirm the da.live org/repo (Document Authoring content source) target path.

## Checklist

### Phase 1 — Setup & Discovery
- [ ] Confirm migration scope (which templates/pages) and da.live target org/repo/path
- [ ] Run URL discovery on wknd.site to enumerate all key pages per template
- [ ] Catalog site templates and group similar pages
- [ ] Inventory existing blocks against WKND component needs (confirm reuse map above)

### Phase 2 — Template & Block Design
- [ ] Define the 7 page templates and their section/block structure
- [ ] Finalize new-block decisions (author-bio, adventure-details, adventure-filter; reuse vs. build for related-articles/itinerary)
- [ ] Build/extend new blocks: `author-bio`, `adventure-details`, `adventure-filter`
- [ ] Migrate site design tokens (colors, fonts, spacing) from WKND into `styles.css`

### Phase 3 — Content Import
- [ ] Scrape each representative page (HTML, images, metadata)
- [ ] Generate import parsers & transformers per block variant
- [ ] Build and run the bulk import script to produce content HTML
- [ ] Migrate header/navigation and footer from source

### Phase 4 — Verification & Upload
- [ ] Preview imported pages locally and visually compare against wknd.site
- [ ] Run validation across pages; fix divergences
- [ ] Lint (`npm run lint`) and check performance
- [ ] Upload/publish pages to da.live (Document Authoring)

> **Execution requires Execute mode.** Approve this plan (and answer the scope/target questions) to proceed.
