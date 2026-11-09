# Sug's Property Services — Website Handoff

A single-page, responsive website built with vanilla HTML, CSS, and JavaScript.
No build tools, JavaScript frameworks, or animation libraries are required.

## File structure

site/
├── README_FOR_DEEPSEEK.md
├── index.html
├── style.css
└── script.js

Optional after replacing stock images:

site/
└── images/
    ├── gustavo.webp
    ├── work-truck.webp
    └── project-01.webp

## IMPORTANT: Before publishing

This is a working starter website, not a verified business listing.

1. Gustavo must approve the example starting prices:
   - Lawn mowing: \$45 per cut
   - Property cleanup: \$150
   - Irrigation repair: \$85
2. Replace all stock photos with authorized photos of Gustavo, his truck,
   and actual completed projects.
3. Replace all three clearly labeled fictional review examples with genuine,
   permission-approved customer reviews.
4. Confirm every service-area ZIP code with Gustavo.
   The current list is a SAMPLE list, not comprehensive county coverage.
5. Connect and test the Formspree endpoint.
6. Review the contact/privacy wording and confirm the business information.
7. Remove the visible placeholder notices ONLY after replacing or verifying
   their corresponding content.

Do not present fictional testimonials, stock projects, or a stock portrait as
authentic evidence of this business's work.

## Running locally

Open index.html in a modern browser for a quick visual preview.

For reliable form/integration testing, serve the folder over HTTP using a
local development server. One option, if Python is installed:

    cd site
    python -m http.server 8000

Then open localhost on port 8000.

Deploy the site folder to any static host with HTTPS.
No server-side application code is included.

## Quick edit markers

Search the files for "EDIT:".

Important markers include:

- EDIT: SEO
- EDIT: Business Contact
- EDIT: Starting Prices
- EDIT: Hero Image
- EDIT: Owner Photo
- EDIT: Truck Photo
- EDIT: Slideshow Images
- EDIT: Grid Gallery
- EDIT: Verified Reviews
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

No fabricated street address, business hours, review aggregate, or credentials
have been added. Add structured business data only after verifying the facts
and obtaining the public website URL.

## Pricing

Search for "EDIT: Starting Prices" and update EVERY visible price.

The hero currently uses the requested exact headline structure:

"Lawn mowing & property maintenance in Victorville, from \$45 per cut."

The \$45 price is an example, not a price supplied by Gustavo.

The pricing cards explain that final pricing depends on property size,
condition, scope, and access. Confirm the minimum service and any exclusions.

## Brand colors and typography

In style.css, edit the variables under "EDIT: Brand Colors".

The palette uses forest green, muted sage, warm earth tones, and off-white.
Dark text/buttons provide readable contrast without bright green accents.

The font is Inter, loaded through Google Fonts, with system-font fallbacks.
For a fully self-hosted site, download appropriately licensed font files,
add local @font-face rules, and remove the Google Fonts links.

## Replacing images

All current images are stock placeholders.

In index.html, search for:

- EDIT: Hero Image
- EDIT: Owner Photo
- EDIT: Truck Photo
- EDIT: Slideshow Images
- EDIT: Grid Gallery

Replace each src with a local path such as:

    images/gustavo.webp

Update alt text to accurately describe the replacement image.
Do not identify a stock model as Gustavo.

Use compressed WebP/AVIF images where possible.
Keep width and height attributes so space is reserved while images load.

The hero loads eagerly. Below-the-fold images use loading="lazy".

## Grid gallery: add or remove images

Find "EDIT: Grid Gallery" in index.html.

Each gallery item is a <figure class="gallery-item"> containing:

1. An <img>
2. A <figcaption>

To add a photo:
- Duplicate one complete figure.
- Update src, alt, and the caption.
- Remove "Stock placeholder" only when the image is actual business work.

To remove a photo:
- Delete its entire figure.

No JavaScript changes are necessary. CSS Grid adjusts automatically.

## Slideshow: update, add, or remove images

Find "EDIT: Slideshow Images" in index.html.

Each slide is a <figure class="slide"> inside #carousel-track.

To update a photo:
- Change its img src, alt text, and caption.

To add/remove a slide:
- Duplicate/delete an entire figure.slide.
- Keep at least one slide.

script.js reads the slide elements and generates the dot buttons automatically.
There is no separate JavaScript image array to maintain.

The carousel:
- Uses native CSS scroll-snap.
- Supports touch/trackpad scrolling.
- Has previous/next buttons and generated dot indicators.
- Supports Left/Right arrow keys while its viewport is focused.
- Does not autoplay.
- Disables endpoint arrows and hides controls for a single slide.

## Reviews

Find "EDIT: Verified Reviews" in index.html.

The three five-star entries are FICTIONAL DESIGN EXAMPLES with full sample names.
Their placeholder labeling is intentionally visible.

Before publishing, replace the names, locations, text, and ratings with
authentic customer feedback. Do not remove the disclosure while retaining
invented reviews.

## Location modal and allowed ZIP codes

Find "EDIT: Allowed ZIP Codes" in script.js.

Edit the strings inside ALLOWED_ZIPS.

ZIP codes must remain quoted strings, e.g.:

    "92392"

The sample entries include selected ZIPs associated with the requested cities
and county areas. They do not imply service throughout either county.

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

## Formspree setup

Find "EDIT: Formspree Endpoint" in index.html.

Replace:

    https://formspree.io/f/YOUR_FORM_ID

with the real endpoint from Gustavo's Formspree account.

In Formspree:
1. Create the form.
2. Configure sugspropertyservices@gmail.com as the notification recipient.
3. Complete any recipient verification required by the account.
4. Configure spam protection and allowed domains as appropriate.
5. Test delivery and notification behavior.

The HTML endpoint does not itself configure the recipient email.

The form uses:
- method="POST"
- FormData for AJAX submission
- Accept: application/json

Do not manually set the Content-Type header when submitting FormData.
The browser must generate the multipart boundary.

The frontend deliberately blocks submissions while YOUR_FORM_ID is present.
An error leaves the entered data intact. Success resets the form.

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
No file uploads are accepted. Review the short disclosure and add a dedicated
privacy policy if appropriate.

## Accessibility and motion

- Semantic sections, labels, skip link, and visible focus rings.
- Native dialog with keyboard dismissal and focus handling.
- Status messages use live regions.
- Carousel controls have accessible names.
- Scroll reveals use IntersectionObserver.
- Reduced-motion preferences disable animation/smooth scrolling.
- Content remains visible if JavaScript or IntersectionObserver is unavailable.

## Launch checklist

[ ] Confirm all contact information.
[ ] Approve all starting prices.
[ ] Verify ZIP list and service-area wording.
[ ] Replace portrait, truck, slideshow, and gallery stock images.
[ ] Replace fictional testimonials with genuine reviews.
[ ] Remove only the notices whose placeholder content has been replaced.
[ ] Configure the Formspree recipient.
[ ] Test valid/invalid ZIPs, ZIP+4, missing ZIP, Skip, Escape, and reopening.
[ ] Test submission success and network/server error states.
[ ] Test phone/email links and all section links.
[ ] Test keyboard navigation and reduced-motion mode.
[ ] Test mobile layout and carousel swiping.
[ ] Check deployed images and font loading.
[ ] Confirm HTTPS and privacy wording.
