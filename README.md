# Sug's Property Services

Public repository for the Sug's Property Services website, documentation, and
automations.

- **Owner:** Gustavo Lopez (GitHub account `mjddawangph-dotcom`)
- **Business:** Lawn care / property maintenance — Victorville & the High Desert, CA
- **Repo visibility:** Public
- **Production URL:** https://sugspropertyservices.com/
- **Hosting:** Cloudflare Pages, deployed from `main`
- **Legacy hosting:** GitHub Pages (`gh-pages`); disable after Cloudflare is verified

## Layout

```
docs/         business plan, SEO, content, outreach, automation specs, runbooks
site/         static landing page; Cloudflare Pages build root
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

### Cloudflare Pages (live)

The live site is Cloudflare Pages, deploying from `main` with `site` as the build
output directory. The custom domain is `sugspropertyservices.com`; the bare
domain is primary and `www` redirects to it with a 301.

Build settings:

| Setting            | Value        |
|--------------------|--------------|
| Framework preset   | None         |
| Build command      | *(empty)*    |
| Build output dir   | `site`       |
| Production branch  | `main`       |

Canonical, Open Graph, structured-data, robots, and sitemap URLs use
`https://sugspropertyservices.com/`.

Cloudflare Pages, both custom domains, SSL, and the HTTPS `www` redirect are
live. Always Use HTTPS still needs to be enabled, and GitHub Pages is still
enabled as the legacy copy.

### GitHub Pages (legacy)

`gh-pages` contains the previous published copy. Do not update it for new
changes. Disable GitHub Pages after the Cloudflare custom domain is verified.

The site is public and indexable. Prices, photos, contact details, the
service-area list, Formspree delivery, and the privacy policy have been
approved.

## Content status

- Approved starting prices: $50 lawn mowing, $150 property cleanup, $85
  irrigation repair.
- The former placeholder review cards have been removed. Real Google Reviews
  will be used after the Google Business Profile is active.
- Do not publish invented testimonials, ratings, or review counts.
- A basic privacy policy is published at `site/privacy.html`.
- Apple touch icon, branded `404.html`, responsive image variants, and basic
  Cloudflare security headers are in place.
- Operating hours are published in the quote contact box, both page footers,
  and the LocalBusiness structured data.
- The site includes a favicon, Open Graph/Twitter metadata, LocalBusiness
  structured data, `robots.txt`, and `sitemap.xml`.
- `robots.txt` allows Google and Bing search crawlers plus official social
  link-preview crawlers, disallows known AI crawlers, and blocks all other
  crawlers. It is advisory, not access control.
- Dark mode, the fixed background logo watermark, and the compact carousel
  indicators are current.

## Security notes

This repository is public. Do not commit home addresses, identification
documents, API keys, passwords, private keys, or `.env` files. The owner's exact
home address was redacted from the current business-plan file because it is a
service-area business; earlier Git history still contains it. If that history
must be removed, rewrite history or make the repository private.

`site/_headers` adds basic Cloudflare Pages security headers. It does not add a
Content-Security-Policy because the site uses inline theme/bootstrap scripts and
the Formspree CDN; add and test a CSP separately if desired.

## Git identity

Commits in this workspace use the identity from `.gitconfig` in the workspace
root, activated by a dedicated `includeIf` rule in `~/.gitconfig`.
Remote is SSH: `git@github.com:mjddawangph-dotcom/sugs-property-services.git`.
