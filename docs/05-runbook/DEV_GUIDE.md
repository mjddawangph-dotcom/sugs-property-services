# Sug's Property Services — Developer / DeepSeek Harness Guide

## 1. Purpose and ownership

This repository supports the marketing and operations of Sug's Property Services.

Business owner: Gustavo Lopez
Phone: 909-582-6445
Email: guslopez370@gmail.com
Base: Victorville, California
Hours: 7:00 AM–7:00 PM, seven days per week

The landing page is an owner-operated property-maintenance website:
professional, direct, neighborly, reliable, and fairly priced.

Business source of truth:
`docs/00-business-plan/foundation.md`

Do not rewrite that foundation file as a side effect of website edits.

The business is service-area based. Do not publish the residential street
address, directions to it, or a walk-in-office claim without explicit owner
approval. Public contact details currently show Victorville, CA 92392.

## 2. Repository and deployment boundaries

Relevant structure:

    sugs-property-services/
    ├── README.md
    ├── docs/
    │   ├── 00-business-plan/foundation.md
    │   └── 05-runbook/DEV_GUIDE.md
    ├── site/
    │   ├── index.html
    │   ├── styles.css
    │   ├── script.js
    │   └── assets/              # create when adding deployable media
    │       ├── brand/
    │       └── media/
    ├── assets/
    │   ├── brand/               # source originals; not published
    │   └── media/               # source originals; not published
    └── automations/

Only `site/` is deployed.

Do not use `../assets/...` in HTML: the repository-level assets directory
does not exist in the published website.

Never move private docs, credentials, automation configuration, customer
information, or source photo metadata into `site/`.

### File responsibilities

- `site/index.html`
  Semantic structure, marketing copy, service prices, photos, contact links,
  sample reviews, modal markup, SEO metadata, structured data.

- `site/styles.css`
  Tokens, mobile-first layout, typography, colors, components, transitions,
  responsive breakpoints, reduced-motion and print rules.

- `site/script.js`
  ZIP allowlist/checking, modal behavior, live status banner, scroll reveals,
  copyright year. No framework, build step, database, or backend.

- `docs/05-runbook/DEV_GUIDE.md`
  This handoff and launch checklist. Keep current when behavior changes.

## 3. Editing protocol for DeepSeek Harness

Before editing:

1. Read this guide and the business foundation.
2. Inspect the affected files.
3. Preserve existing IDs and data attributes unless updating every reference.
4. Make the smallest coherent change.
5. Test the relevant flow and review the diff.
6. Report changed files, checks performed, and remaining launch blockers.
7. Never claim a browser test was run if it was only a source-code review.

Search for `DEEPSEEK_EDIT:` to find intended edit points.

Useful markers:

| Marker | Location | Purpose |
|---|---|---|
| SEO Title and Description | index.html head | Search metadata |
| Launch Gate | index.html head | Staging noindex |
| Business Structured Data | index.html head | Business JSON-LD |
| Hero Headline and Starting Price | index.html hero | Main local headline |
| Service List and Prices | index.html services | Priority services |
| Owner Story | index.html about | Gustavo's introduction |
| Placeholder Reviews | index.html reviews | Sample social-proof layout |
| Service Area Names | index.html service-area | Visible communities |
| Contact Details | index.html contact | Name, phone, email, hours |
| Design Tokens | styles.css :root | Colors and spacing |
| Service ZIP Allowlist | script.js | Coverage configuration |
| ZIP Validation Logic | script.js | Input classification |
| Scroll Animation Controller | script.js | Reveal behavior |
| Service-Area Modal Controller | script.js | Modal flow |

Do not add GSAP, AOS, jQuery, React, or another animation/UI dependency
for this landing page.

## 4. CSS tokens and responsive layout

All authored colors and layout spacing are defined at the top of
`site/styles.css` inside `:root`.

Required brand colors:

    --primary-green: #2E4F3A;
    --bg-color: #F4F7F6;
    --accent-green: #8FA68E;
    --text-dark: #1A202C;

Other tokens cover:
- Accessible muted text and border colors
- White and dark-section text
- Modal backdrop and shadows
- Spacing scale: --space-0 through --space-24
- Section padding, gutters, layout gaps
- Typography sizes and line heights
- Component dimensions and border radii
- Motion durations and reveal distance

Use `var(--token-name)` for new colors and spacing.
Add a reusable token instead of scattering new literal values.

Muted sage is an accent, not the normal body-text color.
Do not reduce text contrast just to achieve a “low-contrast” visual style.

Breakpoints:
- 40rem: two-column service/review cards
- 48rem: main two-column layouts, three-column reviews/process,
  mobile call bar hidden
- 64rem: single-row desktop navigation, four service columns

Literal media-query breakpoints are intentional.
CSS variables do not work in ordinary media-query conditions.

The sticky mobile call bar includes the device safe-area inset.
The footer reserves space so the fixed bar does not cover final content.

## 5. Updating prices and service content

Replace these visible tokens in `index.html`:

- `[STARTING_PRICE]`
- `[LAWN_PRICE]`
- `[WEED_PRICE]`
- `[CLEANUP_PRICE]`
- `[IRRIGATION_PRICE]`

The headline token should include its currency:
example `\$45`, not `45`.

Service-card placeholders already have `$` before the token:
replace `[LAWN_PRICE]` with `45`, not `\$45`.

These are examples of formatting, NOT suggested business prices.

After approval:
1. Replace all tokens.
2. Remove the sentence stating prices await owner approval.
3. Keep the scope-dependent final-quote disclaimer.
4. Confirm headline and lawn-card pricing agree.
5. Do not invent offers, warranties, savings, or availability.

Service order must remain:
1. Lawn Care & Maintenance
2. Weed Treatment
3. Clean Ups
4. Irrigation Repair

Additional services are currently mentioned below those cards.

Before advertising chemical spraying, irrigation installation, or other
specialized work, have the owner confirm the relevant authorization,
qualifications, scope, and marketing wording. Do not invent licensing,
insurance, certification, or treatment-safety claims.

## 6. Images and media: exact locations

### Source originals

Keep original files in:

    assets/brand/
    assets/media/

Suggested originals:

    assets/media/gustavo-owner-original.jpg
    assets/media/gustavo-truck-original.jpg
    assets/media/victorville-lawn-original.jpg

These repository-level files are not deployed.

### Public optimized files

Create these deployable directories:

    site/assets/brand/
    site/assets/media/

Suggested public exports:

    site/assets/brand/logo.svg
    site/assets/brand/favicon.svg
    site/assets/media/gustavo-owner.webp
    site/assets/media/gustavo-truck.webp
    site/assets/media/victorville-lawn.webp
    site/assets/media/social-share.jpg

Use lowercase, descriptive, hyphenated filenames.

HTML paths are relative to `site/index.html`:

    src="assets/media/gustavo-owner.webp"

Never use:

    src="../assets/media/gustavo-owner.webp"

### Replacing stock photos

Current placements:
- Hero Lawn Image
- Owner Portrait
- Truck Photo

Each current photo is explicitly disclosed as stock.
The stock portrait does not depict Gustavo.
The stock truck does not depict his vehicle.
The stock garden is not a completed business project.

For each replacement:
1. Export an appropriately sized optimized file.
2. Remove sensitive embedded metadata.
3. Place the export in `site/assets/media/`.
4. Change `src`.
5. Change `alt` to accurately describe the actual image.
6. Set `width` and `height` to the export's actual intrinsic dimensions.
7. Update crop/aspect-ratio styles if needed.
8. Remove stock disclosure only once the authentic photo is installed.

Keep the hero image eager/high-priority.
Keep below-fold images lazy-loaded.

Suggested image sizing targets, not guarantees:
- Hero: approximately 1200–1600 pixels wide
- Owner: approximately 800 pixels wide
- Truck: approximately 1000 pixels wide
- Optimize for visual quality and transfer size rather than a fixed quota

Check each current Unsplash URL in a browser before using the placeholder
site. Stock URL availability and image suitability have not been guaranteed.

Do not use a recognizable stock person as if
