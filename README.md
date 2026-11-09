# Sug's Property Services

Public repository for the Sug's Property Services website, documentation, and
automations.

- **Owner:** Gustavo Lopez (GitHub account `mjddawangph-dotcom`)
- **Business:** Lawn care / property maintenance — Victorville & the High Desert, CA
- **Repo visibility:** Public

## Layout

```
docs/         business plan, SEO, content, outreach, automation specs, runbooks
site/         static landing page — Cloudflare Pages build root
automations/  bookings, outreach, social automation code
assets/       brand and media files
```

## Local development

No build step. The landing page is a single static file:

```bash
open site/index.html        # macOS
xdg-open site/index.html    # Linux
```

## Deploy

Cloudflare Pages is configured **manually** in the Cloudflare dashboard.
A GitHub Actions workflow for pages will be set up manually by the owner.

Build settings (set by hand in the Cloudflare dashboard):

| Setting            | Value        |
|--------------------|--------------|
| Framework preset   | None         |
| Build command      | *(empty)*    |
| Build output dir   | `site`       |
| Production branch  | `main`       |

> Do not add automated Cloudflare configuration here. Deployment setup is a
> manual, human-owned step.

## Git identity

Commits in this workspace use the identity from `.gitconfig` in the workspace
root, activated by a dedicated `includeIf` rule in `~/.gitconfig`.
Remote is SSH: `git@github.com:mjddawangph-dotcom/sugs-property-services.git`.
