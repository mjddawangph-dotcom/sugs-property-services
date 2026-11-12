# Sug's Property Services

Public repository for the Sug's Property Services website, documentation, and
automations.

- **Owner:** Gustavo Lopez (GitHub account `mjddawangph-dotcom`)
- **Business:** Lawn care / property maintenance — Victorville & the High Desert, CA
- **Repo visibility:** Public
- **Live site:** https://mjddawangph-dotcom.github.io/sugs-property-services/
- **Current hosting:** GitHub Pages, published from the `gh-pages` branch
- **Planned hosting:** Cloudflare Pages, configured manually by the owner

## Layout

```
docs/         business plan, SEO, content, outreach, automation specs, runbooks
site/         static landing page; source for the published `gh-pages` branch
site/assets/  brand files, including the SVG logo
site/images/  real owner portrait and project photos
automations/  bookings, outreach, social automation code
assets/       workspace-level brand/media staging area
```

## Local development

No build step. Serve the `site` folder over HTTP:

```bash
cd site
python3 -m http.server 8000
```

Then open http://localhost:8000.

Opening `site/index.html` directly works for a quick visual check, but use HTTP
for Formspree, storage, and the service-area checker.

## Hosting

### GitHub Pages (current)

The live site is published from the `gh-pages` branch. That branch contains the
contents of `site/` at its root (`index.html`, `privacy.html`, `style.css`,
`script.js`, `assets/`, `images/`, `.nojekyll`). `main` remains the source of truth.

The site is public and indexable. Prices, photos, contact details, the
service-area list, Formspree delivery, and the privacy policy have been
approved. `privacy.html` is included in the published branch.

Canonical, Open Graph, structured-data, robots, and sitemap URLs currently use
the GitHub Pages address. Update all of them together when a custom domain is
connected.

### Cloudflare Pages (planned)

Cloudflare Pages is configured **manually** in the Cloudflare dashboard.
A GitHub Actions workflow for Pages has not been added.

Build settings (set by hand in the Cloudflare dashboard):

| Setting            | Value        |
|--------------------|--------------|
| Framework preset   | None         |
| Build command      | *(empty)*    |
| Build output dir   | `site`       |
| Production branch  | `main`       |

> Do not add automated Cloudflare configuration here. Deployment setup is a
> manual, human-owned step.

## Content status

- Approved starting prices: $50 lawn mowing, $150 property cleanup, $85
  irrigation repair.
- The former placeholder review cards have been removed. Real Google Reviews
  will be used after the Google Business Profile is active.
- Do not publish invented testimonials, ratings, or review counts.
- A basic privacy policy is published at `site/privacy.html`.
- The site includes a favicon, Open Graph/Twitter metadata, LocalBusiness
  structured data, `robots.txt`, and `sitemap.xml`.
- `robots.txt` allows Google and Bing search crawlers, disallows known AI
  crawlers, and blocks all other crawlers. It is advisory, not access control.
- Dark mode, the fixed background logo watermark, and the compact carousel
  indicators are current.

## Git identity

Commits in this workspace use the identity from `.gitconfig` in the workspace
root, activated by a dedicated `includeIf` rule in `~/.gitconfig`.
Remote is SSH: `git@github.com:mjddawangph-dotcom/sugs-property-services.git`.
