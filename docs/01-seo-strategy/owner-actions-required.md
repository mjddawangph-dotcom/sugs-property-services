# Owner Actions — Everything That Cannot Be Done From the Code

**Last updated:** 2026-11-15
**Companion doc:** [Competitive gap analysis](competitive-gap-analysis-lara-landscaping.md)

This file is the to-do list for work that needs a real person: logins, verification,
money, photos, or facts only the owner knows. The site-side work is already done and
listed at the bottom.

Everything here is ordered by impact. **Section 1 is the difference between the site
ranking and not ranking at all.**

---

## 1. Blocking — this week

### 1.1 Google Search Console (30 min)

Nothing else matters until Google knows the site exists.

1. Go to <https://search.google.com/search-console>.
2. **Add property → Domain** (not URL prefix). Enter `sugspropertyservices.com`.
3. It gives you a TXT record. Add it in Cloudflare DNS (DNS → Records → Add record →
   TXT, name `@`, value as given).
4. Click Verify. It can take a few minutes.
5. **Sitemaps → Add sitemap** → `sitemap.xml`. Status should become "Success".
6. Open **URL Inspection**, paste `https://sugspropertyservices.com/landscaping/`, and
   press **Request indexing** for each new page (there are 11).

### 1.2 Bing Webmaster Tools (15 min)

1. <https://www.bing.com/webmasters> → Add site.
2. Easiest path: **Import from Google Search Console** once §1.1 is done.
3. Submit `https://sugspropertyservices.com/sitemap.xml`.

### 1.3 Google Business Profile — finish verification (highest-value item on this page)

The site cannot appear in the map pack without this. For "Victorville landscaping",
most clicks go to the three map results, not the organic list. Lara has 105 reviews
and a verified profile; that is the actual reason they are #1.

While the verification is pending, get these ready:

| Field | Value |
|---|---|
| Business name | Sug's Property Services |
| Primary category | *Lawn care service* (secondary: *Landscaper*) |
| Website | https://sugspropertyservices.com/ |
| Phone | (909) 582-6445 |
| Hours | Daily, 7:00 AM – 7:00 PM |
| Service areas | Victorville, Hesperia, Apple Valley |
| Services | Lawn mowing, yard cleanup, irrigation repair, weed control, sod installation |

**Suggested description (paste-ready, 603 characters):**

> Owner-operated lawn care and property maintenance in Victorville, Hesperia, and
> Apple Valley. We handle routine mowing and edging, weed treatment in gravel and
> beds, one-time and seasonal property cleanups, sprinkler and irrigation repair,
> shrub and tree trimming, fertilization, and sod installation. Starting prices are
> published on our site: mowing from $50 per cut, cleanups from $150, and irrigation
> repair from $85. Open seven days a week, 7 AM to 7 PM. Call or text for a
> straightforward quote before any work starts.

After it goes live:

- Upload 10+ photos (the project photos in `site/images/` work; add the owner portrait).
- Add the same services and hours that are on the site. Mismatches hurt.
- Post once a week (a photo + one sentence is enough).
- **Send me the Maps URL** so I can add `sameAs`, the review link, and turn on the
  reviews section. A ready-to-paste snippet is in §7.2.

### 1.4 Analytics (30 min)

Right now there is no way to know whether any of this works.

1. Cloudflare dashboard → **Analytics & Logs → Web Analytics → Add a site**.
2. Copy the beacon snippet.
3. **First** update `site/privacy.html` to disclose analytics, then add the snippet to
   the `<head>` of every page.

Track these two events once it is running: `tel:` taps and form submits. Ranking
without conversion data is half a measurement.

---

## 2. Facts only you can confirm

I deliberately did **not** invent any of these. Each one is currently omitted from the
site and the structured data.

| # | Item | Why it matters | What I need |
|---|---|---|---|
| 1 | **License status** | California generally requires a C-27 licence for landscape construction over $500 (maintenance is usually exempt). Lara advertises CSLB #932542 and BBB A+, and it is a visible trust signal. | The CSLB number, or confirmation that no licence applies to the work you take on. |
| 2 | **Insurance** | "Insured" is one of the most-asked questions for any contractor touching a property. | Confirm yes/no and the coverage type. |
| 3 | **Year started** | Enables "serving the High Desert since 20XX" and `foundingDate` in schema. | The year. |
| 4 | **Service-area address / ZIP** | The schema currently says `Victorville, CA, US` with no ZIP. A service-area business can omit the street address but should include the ZIP. | Your business ZIP (not necessarily a home address). |
| 5 | **Geo coordinates** | Improves local entity matching. | I can use the Victorville city centroid, or you can drop a pin in Google Maps and send the coordinates. |
| 6 | **Phone number** | The site shows a **909** number. Victorville is **760**. Lara's copy explicitly sells "we're not a crew that trucks in from down the hill." | Whether a 760 number (or a 760 tracking number) is possible. |
| 7 | **Real project captions** | The gallery has 10 real photos with honest descriptions, but no neighborhood, no job type, no price. | For each photo: neighborhood/area, what the job was, and roughly what it cost (a range is fine). |
| 8 | **Review link** | Needed for the review request system. | The Google review URL once the profile is live. |
| 9 | **Social profiles** | `sameAs` links validate the business entity. | Facebook, Instagram, Yelp, Nextdoor, BBB URLs — or confirmation that none exist. |

---

## 3. Off-site work — month 1 to 3

This is where the ranking is actually won. None of it can be done from the repo.

### 3.1 Reviews — the 105-review problem

Current gap: **0 vs 105 reviews at 4.9★**. Target: 40–60 reviews at 4.7★+ within six
months. Do not buy, incentivise, or write reviews — that is the one shortcut that can
end the business.

The system:

1. Print a small card for every invoice: QR code straight to the Google review form,
   plus "Takes 30 seconds — thank you."
2. Send the SMS below the same day, while the yard still looks good.
3. Reply to every review within 48 hours, mentioning the service and the city
   ("Thanks for the mowing in Hesperia…").
4. Never argue in a public reply. Take it to a phone call, then ask them to update it.

**SMS template:**

> Hi [name], thanks for letting us take care of the yard today. If we did a good job,
> a quick Google review helps other Victorville neighbors find us — takes about 30
> seconds: [LINK]. If something wasn't right, reply here first and I'll come back and
> fix it. — Gustavo

**Email template:**

> Subject: How did we do today?
>
> Hi [name],
>
> Thanks for having us out to [service] at [street or neighborhood]. If you were happy
> with the work, a short Google review genuinely helps a small local business get found
> — here's the direct link: [LINK]
>
> And if anything was missed, reply to this email and I'll come back out. I'd rather
> fix it than have you quietly disappointed.
>
> Gustavo
> Sug's Property Services
> (909) 582-6445

### 3.2 Citations — identical name, address, phone everywhere

Fill this in once, then copy it exactly onto every platform. Inconsistency here is a
common reason a business fails to match its own listing.

| Platform | Status | Notes |
|---|---|---|
| Google Business Profile | pending verification | priority 1 |
| Bing Places | not started | imports from GBP |
| Apple Business Connect | not started | powers Apple Maps |
| Yelp | not started | |
| BBB | not started | only if you want the accreditation |
| Nextdoor | not started | strong for local service referrals |
| Angi | not started | |
| Thumbtack | not started | |
| Facebook Page | not started | |
| Instagram | not started | |
| Houzz / Porch | optional | lower priority for maintenance work |

### 3.3 Local links a competitor cannot fake

- Victorville Chamber of Commerce membership (usually includes a member directory link).
- Property managers and HOAs you actually work for — ask for a "vendors" page mention.
- The nurseries, rock yards, and irrigation suppliers you buy from.
- Youth sports, church, or school sponsorship with a website mention.
- Nextdoor business page plus genuine recommendations in neighborhood threads.
- Real before/after posts in local Facebook groups — actual jobs, not adverts.

---

## 4. Content that needs your local knowledge

I wrote every page from facts already approved in the repo. I did **not** invent
neighborhoods, HOA rules, soil conditions, or job histories. The pages that would
benefit most from your input:

### 4.1 City pages for Hesperia and Apple Valley

Deliberately not built yet. Lara has nine city pages that are **93% identical** — that
is their biggest weakness. Building thin city pages now would copy their mistake.

The template to fill in, per city, once you can supply real detail:

1. **Local opening** (~120 words) — what lots in that city actually start as, which
   neighborhoods you work in (name 4–6 real ones), drive time from base.
2. **Climate and soil** — sun, wind, freeze dates, caliche/hardpan, water cost.
3. **Services that sell there** — 4–6, each with one local sentence.
4. **Three real jobs in that city** — photo, neighborhood, what was wrong, what you
   did, price band.
5. **Local pricing** — the starting prices plus what pushes the number up locally.
6. **HOA / city rules worth knowing** — turf restrictions, watering schedules, permit
   thresholds.
7. **Seasons** — when to mow, overseed, cut back, expect weeds.
8. **Five or six FAQs**, marked up as `FAQPage`.
9. **Nearby cities** — 2–4 internal links with descriptive anchors.

Two or three genuinely local pages beat nine templated ones.

### 4.2 Content hub — two posts a month

Each one answers a question a Victorville homeowner actually types. Proposed order:

1. How much does lawn mowing cost in Victorville?
2. Sod vs. artificial turf in the High Desert
3. Why does my bermudagrass die every winter?
4. What to do about caliche before planting
5. Victorville watering rules, explained
6. What a property cleanup actually includes (and what it costs)

Each post should link to one service page and one city page.

### 4.3 Spanish pages

Victorville is heavily bilingual and **no competitor in this SERP has Spanish
content**. This is the most defensible long-term advantage available, and it is
authentic to the owner. Plan: `/es/` versions of the home, landscaping, mowing,
cleanup, irrigation, and contact pages, with `hreflang` pairs. Needs a translator
(or a native speaker reviewing machine translation — do not ship raw output).

---

## 5. Deferred technical items

| # | Item | Why deferred | Action |
|---|---|---|---|
| 1 | **404 body still empty on unknown paths** | Cloudflare platform setting, not the repo. The branded `404.html` exists but does not serve. | In the Pages project, confirm `not_found_handling` is set to serve `/404.html`. The old checklist item 9 covers this. |
| 2 | **First-load service-area modal** | Existing behaviour, outside the approved scope. On mobile it covers the hero immediately, which is the pattern Google calls an intrusive interstitial. | Consider showing it only when "Check your area" is clicked, or after a delay/scroll. |
| 3 | **Hero image weight** | `front-yard-cactus-960.webp` is ~140 KB, `-1600` is ~423 KB. Fine, but the LCP image could be ~60–70 KB. | Re-encode the 960 and 1600 variants at quality ~72. |
| 4 | **HSTS** | Safe only once every subdomain is HTTPS. | Enable in Cloudflare once confirmed. |
| 5 | **Content-Security-Policy** | The site uses inline theme scripts and Formspree. A CSP needs testing or it will break the form. | Add and test separately. |
| 6 | **`Google-Extended` remains blocked** | Deliberate AI policy already in `robots.txt`. Worth knowing it also limits how Google's AI features can use the content. | Leave as-is unless the policy changes. |
| 7 | **Repo is public** | No secrets are committed, but the old home address is still in Git history. | Rewrite history or make the repo private. |

---

## 6. What I deliberately did not do

For the record, so nobody assumes it was an oversight:

- **No reviews, ratings, or review counts.** The site is review-free until real Google
  reviews exist.
- **No "Licensed & Insured", no CSLB number, no BBB badge, no "since 20XX".** You chose
  to omit unverified credential claims. When §2 items 1–3 are confirmed, add them to
  the footer, the about page, and `HomeAndConstructionBusiness` in the schema.
- **No fabricated city detail.** No invented neighborhoods, HOA rules, or job stories.
- **No `aggregateRating`, `sameAs`, `geo`, `foundingDate`, or `postalCode`** in schema,
  because those values are not known yet.
- **No Google Maps link or review-request page**, because the profile is not verified.
- **No artificial-turf claims.** The site now explicitly says natural sod only, which
  stops wasted quotes from people who wanted synthetic.

---

## 7. Ready-to-paste snippets

### 7.1 Once the licence and insurance are confirmed

Add to the footer of every page, directly under the phone number:

```html
<p class="footer-credential">Licensed &amp; insured &mdash; CSLB #000000</p>
```

And add to the `HomeAndConstructionBusiness` node in every JSON-LD block:

```json
"foundingDate": "20XX",
"hasCredential": {
  "@type": "EducationalOccupationalCredential",
  "credentialCategory": "license",
  "name": "California Landscape Contractor (C-27)",
  "recognizedBy": { "@type": "Organization", "name": "California State License Board" },
  "identifier": "000000"
}
```

### 7.2 Once Google Business Profile is live

Add to every `HomeAndConstructionBusiness` node:

```json
"sameAs": [
  "https://www.google.com/maps/place/?q=place_id:YOUR_PLACE_ID",
  "https://www.facebook.com/YOURPAGE",
  "https://www.yelp.com/biz/YOUR-BUSINESS"
],
"hasMap": "https://www.google.com/maps/place/?q=place_id:YOUR_PLACE_ID"
```

Then create `/leave-a-review/` at `site/leave-a-review/index.html` with a `noindex`
meta tag and a single prominent button pointing at the Google review URL. Do **not**
add it to `sitemap.xml` — it is a conversion page, not a ranking page.

### 7.3 Once there are at least 10 real reviews

Only then add `aggregateRating` to the business node, using the numbers Google actually
shows:

```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.9",
  "reviewCount": "12",
  "bestRating": "5"
}
```

Never round up, never estimate, never include reviews that are not visible on the page.

---

## 8. What is already done (2026-11-15)

Site work completed and verified locally:

- Homepage rewritten: keyword-led title, H1, meta description, and Open Graph/Twitter.
- JSON-LD upgraded: `WebSite` + `HomeAndConstructionBusiness` with address locality,
  `priceRange`, area served, hours, and a nine-item offer catalog with starting prices.
- 11 new pages, each with its own title, description, canonical, breadcrumbs,
  `BreadcrumbList`, and page-level schema:
  `/landscaping/`, `/services/`, `/services/lawn-mowing/`, `/services/yard-cleanup/`,
  `/services/irrigation-repair/`, `/services/weed-control/`, `/services/sod-turf/`,
  `/faq/`, `/about/`, `/gallery/`, `/contact/`.
- `FAQPage` schema on `/faq/`, `/landscaping/`, and every service page.
- `Service` schema with `priceSpecification` on the three priced services.
- Header navigation and footer rebuilt with real internal links to every page
  (previously the nav was all `#` anchors).
- Sitemap expanded from 2 to 13 URLs with `lastmod`.
- `robots.txt`: the `User-agent: *` catch-all now allows crawling instead of blocking
  everything not explicitly whitelisted. AI-crawler blocks are unchanged.
- `privacy.html` links normalised to the canonical `/privacy`.
- Gallery page with 10 real project photos, descriptive alt text, and captions.
- Contact page with the existing Formspree form, plus pricing and area context.
- Interior-page CSS: breadcrumbs, prose column, photo grid, FAQ accordion,
  two-column footer, responsive grids.
- Homepage now 855 visible words (was 760) with 27 crawlable internal links (was 1).

**Not deployed yet.** Changes are committed locally; pushing to `main` triggers the
Cloudflare Pages deploy.
