# Sug's Property Services — Website Handoff

A single-page, responsive website built with vanilla HTML, CSS, and JavaScript.
No build tools, JavaScript frameworks, or animation libraries are required.

Current live site:
https://sugspropertyservices.com/

Source lives on `main`; Cloudflare Pages deploys it. The `gh-pages` branch is a
legacy preview and should be disabled after the Cloudflare cutover.

## File structure

site/
├── .nojekyll
├── index.html
├── privacy.html
├── robots.txt
├── sitemap.xml
├── style.css
├── script.js
├── assets/
│   └── brand/
│       └── logo.svg
└── images/
    ├── owner-portrait.webp
    ├── front-yard-cactus.webp
    ├── social-share.jpg
    ├── backyard-gravel-tree.webp
    ├── front-lawn-palms.webp
    ├── lawn-palm-maintenance.webp
    ├── palm-gravel-landscaping.webp
    ├── side-yard-cactus.webp
    ├── side-walkway-planters.webp
    ├── palm-lined-side-yard.webp
    ├── palm-bed-fence.webp
    └── tall-palms-driveway.webp

## Current content status

The live site is public and indexable. The `noindex` launch gate and the price
preview notices have been removed.

- Prices are approved:
  - Lawn mowing: \$50 per cut
  - Property cleanup: \$150
  - Irrigation repair: \$85
- The owner portrait and project photos are approved for publication.
- The current ZIP and city list is approved for service-area screening.
  Final availability still needs confirmation for the exact address.
- The public phone number and email are approved.
- Operating hours are 7:00 AM–7:00 PM daily. They appear in the quote contact
  box, the footer on both pages, and the LocalBusiness structured data.
- Formspree is verified working.
- A basic privacy policy is published at privacy.html and linked from the quote
  form, footer, and service-area checker.
- The reviews section remains intentionally omitted. Google Reviews will be
  used after the Google Business Profile is active. Do not add invented
  testimonials or ratings.

Do not present fictional testimonials or unauthorized photos as authentic
evidence of this business's work.

## Running locally

Open index.html in a modern browser for a quick visual preview.

For reliable form/integration testing, serve the folder over HTTP using a
local development server. One option, if Python is installed:

    cd site
    python -m http.server 8000

Then open http://localhost:8000.

Opening index.html directly works for a quick visual check, but serve over HTTP
for Formspree, storage, and service-area testing.

## Hosting and publishing

Production target: Cloudflare Pages at https://sugspropertyservices.com/.

Cloudflare Pages should deploy from `main` with build command empty, output
directory `site`, and production branch `main`. The bare domain is primary; `www` must
301-redirect to it.

The canonical URL, Open Graph URLs, structured data URL, sitemap URLs, and
`Sitemap:` line in robots.txt use the apex custom domain.

Cutover is pending until the Pages project, DNS records, SSL, both custom
domains, and the `www` redirect are verified. The old `gh-pages` GitHub Pages
deployment is legacy and should be disabled after verification.

`privacy.html` is part of the published site and should be included in every
deployment of the `site/` folder.

## Quick edit markers

Search the files for "EDIT:".

Important markers include:

- EDIT: SEO
- EDIT: Starting Prices
- EDIT: Hero Image
- EDIT: Service Descriptions
- EDIT: Slideshow Images
- EDIT: Verified Service Areas
- EDIT: Business Contact
- EDIT: Formspree Endpoint
- EDIT: Brand Colors
- EDIT: Allowed ZIP Codes

## Business information and SEO

In index.html, update:

- The title and meta description
- Phone links: tel:+19095826445
- Visible phone number: (909) 582-6445
- Email links and visible email
- Service-area copy
- Gustavo's introduction
- Footer business details

Keep contact information consistent everywhere.

No street address, review aggregate, ratings, or credentials have been added.
The phone, email, hours, services, and service areas are approved. Keep the
visible content and structured data in sync with the source business facts.

## Pricing

Search for "EDIT: Starting Prices" and update EVERY visible price.

The hero currently uses the requested exact headline structure:

"Lawn mowing & property maintenance in Victorville, from \$50 per cut."

The \$50 price is approved for the hero and pricing card.

The pricing cards explain that final pricing depends on property size,
condition, scope, and access. Confirm the minimum service and any exclusions.

## Brand colors and typography

In style.css, edit the variables under "EDIT: Brand Colors".

The palette uses forest green, muted sage, warm earth tones, and off-white.
Dark text/buttons provide readable contrast without bright green accents.

The font is Inter, loaded through Google Fonts, with system-font fallbacks.
For a fully self-hosted site, download appropriately licensed font files,
add local @font-face rules, and remove the Google Fonts links.

## Images

All current photos are real business or owner images; there are no stock
project photos or truck photos left on the page.

In index.html, search for:

- EDIT: Hero Image
- EDIT: Slideshow Images

The hero and first carousel slide both use `front-yard-cactus.webp`. The owner
section uses `owner-portrait.webp`. The other nine project photos appear in the
carousel only.

Use compressed WebP images where possible. Keep width and height attributes so
space is reserved while images load.

The hero loads eagerly. Below-the-fold images use loading="lazy".

Do not identify a stock model as Gustavo. Confirm usage permission before
replacing or adding a photo.

## Slideshow: update, add, or remove images

Find "EDIT: Slideshow Images" in index.html.

Each slide is a <figure class="slide"> inside #carousel-track. The current
carousel holds ten project photos.

To update a photo:
- Change its img src and alt text.

To add/remove a slide:
- Duplicate/delete an entire figure.slide.
- Keep at least one slide.

script.js reads the slide elements and generates the dot buttons automatically.
There is no separate JavaScript image array to maintain.

The carousel:
- Uses native CSS scroll-snap.
- Supports touch/trackpad scrolling.
- Has previous/next buttons and generated dot indicators.
- Keeps dot indicators on one compact row; adding many slides makes the row
  scroll, and the active dot is kept in view.
- Supports Left/Right arrow keys while its viewport is focused.
- Does not autoplay.
- Disables endpoint arrows and hides controls for a single slide.

## Reviews (intentionally omitted)

The former placeholder review section and its fictional cards have been
removed. The site does not render a reviews section at this time.

Google Reviews will be used once the Google Business Profile is active. At that
point, either embed an approved Google Reviews widget or add a clear link to the
profile. Revisit the privacy wording and any third-party script/CSP requirements
before embedding.

Do not add invented testimonials, star ratings, review counts, or review
structured data. Leave the section out until real Google reviews are available.

## Location modal and allowed ZIP codes

Find "EDIT: Allowed ZIP Codes" in script.js.

Edit the strings inside ALLOWED_ZIPS.

ZIP codes must remain quoted strings, e.g.:

    "92392"

The current entries have been approved for screening. They still do not imply
service throughout either county; confirm the exact address and scheduling
before committing to a job.

The checker:
- Requests an address ending in a five-digit ZIP or ZIP+4.
- Checks only the extracted five-digit ZIP.
- Does not geocode street addresses or verify property-level coverage.
- Shows a validation message inline when no trailing ZIP is supplied.
- Shows in-area/out-of-area results in a separate result dialog.
  The Continue button closes the result and returns to the page.
- Lets visitors skip or close the checker without a result.
- Offers a "Check your area" button to reopen the modal.

A ZIP is only a screening tool. Gustavo must confirm actual availability.

The modal appears once per browser tab/session using sessionStorage.
Only a dismissal flag is stored; the address is not stored.
If storage is unavailable, the site still works.

To retest the first-load behavior:
- Open a new browser session/tab without copied session storage, or
- Remove "sugs-area-dismissed" from sessionStorage in developer tools.

## Formspree configuration

Find "EDIT: Formspree Endpoint" in index.html. The form is already configured
with:

    https://formspree.io/f/xzeenprg

If the Formspree form changes, update the action and keep the same `f/<id>`
format. The form ID is public by design; no secret belongs in the HTML.

Formspree is verified working. If the form or recipient changes, re-test:
1. Confirm the form exists and is active.
2. Confirm sugspropertyservices@gmail.com as the notification recipient.
3. Complete any recipient verification required by the account.
4. Configure spam protection and allowed domains as appropriate.
5. Test delivery and notification behavior.

The HTML endpoint does not itself configure the recipient email.

The form uses the official `@formspree/ajax` CDN bundle (`@formspree/ajax@1`)
from unpkg. It is initialized in script.js with the form ID extracted from the
form action.

The integration uses:
- `data-fs-field` on inputs for field-level invalid state
- `data-fs-submit-btn` on the submit button
- `data-fs-success` and `data-fs-error` for form-level messages
- `useDefaultStyles: false`, with styles in style.css

The native form action and method remain in place as a no-JavaScript fallback.
The AJAX initializer is skipped while `YOUR_FORM_ID` remains. Success resets the
form; field values are left intact on an error.

Without JavaScript, the native HTML POST remains available after endpoint setup.

## Form fields

All eight requested services appear in the dropdown.

Required:
- Name
- Phone
- Email
- Address
- Service needed

Optional:
- Project details

The form collects contact details and project details through Formspree.
No file uploads are accepted. The form disclosure and footer link to
`privacy.html`; keep the policy aligned with actual data practices.

## Accessibility and motion

- Semantic sections, labels, skip link, and visible focus rings.
- Header includes a theme toggle with an updated accessible name, so dark mode
  is available on desktop, tablet, and mobile.
- Mobile header uses a hamburger menu at 820px and below. It closes on Escape,
  outside click, or link selection and reports its state with aria-expanded.
- Native dialog with keyboard dismissal and focus handling.
- Status messages use live regions.
- Carousel controls have accessible names.
- Scroll reveals use IntersectionObserver.
- Reduced-motion preferences disable animation/smooth scrolling.
- Content remains visible if JavaScript or IntersectionObserver is unavailable.

## Dark mode

The header theme toggle switches the entire page between light and dark.

- The first visit follows the visitor's `prefers-color-scheme` setting.
- A manual choice is stored in localStorage under `sug-theme` and persists.
- The `meta[name="theme-color"]` value updates with the selected theme.
- Dark palette tokens live under `html[data-theme="dark"]` in style.css.
- The header, mobile menu, cards, forms, carousel controls, modal, sticky
  mobile CTA, and footer all have dark-theme treatments.
- The brand logo gets a light circular backing in dark mode for contrast.

When adding a component, use the existing color variables first. If a color is
hard-coded, add a corresponding `html[data-theme="dark"]` rule.

## Header and fixed watermark

The header shows the SVG emblem plus the bold business name. It also contains
the light/dark toggle and the mobile menu control. The header is intentionally
opaque so content does not show through while scrolling.

A fixed brand watermark sits behind the page content:

- It uses `assets/brand/logo.svg` through `body::before`.
- The size is `min(1320px, 120vw, 125vh)` and it is fixed to the viewport.
- It is centered with `inset: 0`, a matched width/height, and `margin: auto`.
- Light mode uses 10% opacity; dark mode inverts the logo and uses 6.5%.
- `main` and `.site-footer` sit above it with `z-index: 1`.
- `.section-tinted` and `.promise-strip` use translucent backgrounds so the
  watermark remains faintly visible through those bands.
- Opaque cards, forms, header, and footer sit above the watermark.

To tune it, edit the `body::before` rule in style.css:
`width`, `height`, `margin`, and `opacity`. Keep `pointer-events: none`.

## SEO, sharing, and crawler files

- The favicon uses `assets/brand/logo.svg`.
- `index.html` includes canonical, Open Graph, and Twitter metadata.
- `images/social-share.jpg` is the 1200x630 social preview image.
- `index.html` includes `HomeAndConstructionBusiness` JSON-LD with the approved
  name, phone, email, opening hours, services, and service cities. It
  intentionally omits a street address, ratings, and review counts.
- `sitemap.xml` lists the home page and the privacy policy.
- `robots.txt` allows Googlebot, Googlebot-Image, Google-InspectionTool, Bingbot,
  BingPreview, and official social link-preview crawlers (Facebook, Twitter,
  LinkedIn, Slack, Discord). It disallows known AI crawlers and blocks all other
  crawlers with `User-agent: * / Disallow: /`.

`robots.txt` is advisory, not access control. It cannot identify or stop a
person using a browser or a script that ignores the file. For stronger blocking,
use a host with bot management or a WAF, such as Cloudflare.

Operating hours are duplicated intentionally: contact box, footer on both
pages, and JSON-LD. If the schedule changes, update all three website locations
and the Google Business Profile together. Use GBP special hours for holiday
exceptions; do not add temporary dates to the schema.

## Launch checklist

[x] Confirm all contact information.
[x] Approve all starting prices and remove the price preview notices.
[x] Confirm permission for the owner portrait and project photos.
[x] Verify ZIP list and service-area wording.
[ ] Confirm the Google Business Profile is active before adding Google Reviews.
[x] Keep the reviews section out until real Google reviews are available.
[x] Verify the Formspree recipient and test delivery.
[x] Remove the `noindex` launch gate and placeholder notices.
[x] Add and link the privacy policy.
[x] Publish operating hours in the contact box, both footers, and JSON-LD.
[ ] Match the published hours to the Google Business Profile.
[ ] Test valid/invalid ZIPs, ZIP+4, missing ZIP, Skip, Escape, and reopening.
[ ] Test submission success and network/server error states.
[ ] Test phone/email links and all section links.
[ ] Test keyboard navigation and reduced-motion mode.
[x] Add favicon, Open Graph/Twitter metadata, and a social-sharing image.
[x] Add LocalBusiness structured data without unverified claims.
[x] Add robots.txt and sitemap.xml.
[x] Use the apex custom domain for canonical, Open Graph, schema, robots, and sitemap.
[ ] Verify Cloudflare Pages custom domain and SSL.
[ ] Add and verify the www-to-apex 301 redirect.
[ ] Disable the legacy GitHub Pages deployment.
[ ] Submit the sitemap in Google Search Console.
[ ] Test light/dark toggle, reload persistence, and OS dark preference.
[ ] Test mobile layout, carousel swiping, and the mobile menu in both themes.
[ ] Check the fixed watermark at 320, 390, 820, 821, and 1440 widths.
[ ] Check deployed images and font loading.
[x] Confirm HTTPS and privacy wording.
