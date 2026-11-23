# Google Business Profile API — prepared, waiting on access

This folder contains a dependency-free CLI for editing the profile and creating
posts through Google's official APIs. It is built and smoke-tested, but **it
cannot make live calls until Google approves API access**.

## Status

| Item | State |
|---|---|
| GBP verified | 2026-11-24 |
| Eligible to request API access | **2027-01-23** (60 days after verification) |
| Google Cloud project | not created yet |
| OAuth client | not created yet |
| CLI | ready (`gbp.mjs`) |
| Access request | not submitted |
| Approved quota | unknown (300 QPM = approved) |

Google requires the profile to be verified and active for **60+ days** before it
will approve API access, and the request must come from an owner/manager email
on the profile. Applying earlier is almost always rejected. See
[Prerequisites](https://developers.google.com/my-business/content/prereqs).

## What the CLI can do

| Command | API | Purpose |
|---|---|---|
| `auth` | OAuth 2.0 | Loopback + PKCE login, saves a refresh token |
| `status` | — | Show config/token state locally |
| `accounts` | Account Management v1 | Find the GBP account ID |
| `locations` | Business Information v1 | Find the location ID and current fields |
| `get` | Business Information v1 | Read one location |
| `patch` | Business Information v1 | Description, phone, website, or a JSON payload |
| `posts` | My Business v4 | List local posts |
| `post` | My Business v4 | Create a standard/event/offer post with CTA and photo |
| `media` | My Business v4 | Add a photo from a public URL |

All commands support `--dry-run`, which prints the exact HTTP request without a
token. Use it to prepare posts and edits before approval.

## One-time setup

### 1. Create the Cloud project

1. Open <https://console.cloud.google.com/projectcreate>.
2. Name it `sugs-gbp` (the ID becomes something like `sugs-gbp-482113`).
3. Copy the **project number** from the project dashboard — the access request
   asks for it.

### 2. Enable the APIs

Enable these four in the API Library (links go straight to each):

- [My Business Account Management API](https://console.cloud.google.com/apis/library/mybusinessaccountmanagement.googleapis.com)
- [My Business Business Information API](https://console.cloud.google.com/apis/library/mybusinessbusinessinformation.googleapis.com)
- [Google My Business API (v4)](https://console.cloud.google.com/apis/library/mybusiness.googleapis.com) — posts, media, reviews
- [Business Profile Performance API](https://console.cloud.google.com/apis/library/businessprofileperformance.googleapis.com) — optional metrics

### 3. Configure the OAuth consent screen

1. Open <https://console.cloud.google.com/apis/credentials/consent>.
2. User type: **External**. Publishing status: **Testing** is fine to start.
3. Add scope `https://www.googleapis.com/auth/business.manage`.
4. Add `sugspropertyservices@gmail.com` as a test user.

> **Testing-mode caveat:** refresh tokens for External apps in Testing expire
> after 7 days. For a durable automation, publish the app and complete Google's
> sensitive-scope verification, or accept re-running `auth` weekly. A Google
> Workspace "Internal" app avoids this, but this business uses a consumer Gmail.

### 4. Create the OAuth client

1. Open <https://console.cloud.google.com/apis/credentials>.
2. **Create credentials → OAuth client ID → Desktop app**.
3. Copy the client ID and secret, then either:

   ```bash
   GBP_CLIENT_ID="...apps.googleusercontent.com" \
   GBP_CLIENT_SECRET="..." \
   node automations/gbp/gbp.mjs auth
   ```

   or run `node automations/gbp/gbp.mjs auth` in a terminal and paste them when
   prompted. The client is saved to `~/.config/sugs-gbp/client.json` (0600).

### 5. Request API access — on or after 2027-01-23

1. Open the [GBP API contact form](https://support.google.com/business/contact/api_default).
2. Choose **Basic API access request**.
3. Provide the project number and use the owner/manager email
   `sugspropertyservices@gmail.com`.
4. After review, check **Cloud Console → APIs & Services → Business Profile
   APIs → Quotas**. `0 QPM` = not approved; `300 QPM` = approved.

If it is rejected, confirm the 60-day and website requirements before
reapplying.

## Commands

```bash
cd /path/to/sugs-property-services-github

# Local state
node automations/gbp/gbp.mjs status

# After access is approved
node automations/gbp/gbp.mjs accounts
node automations/gbp/gbp.mjs locations --account 123456789

# Read / edit
node automations/gbp/gbp.mjs get --location locations/987654321 --json
node automations/gbp/gbp.mjs patch --location locations/987654321 \
  --description "Lawn care and landscaping across Victorville, Hesperia, and Apple Valley." \
  --validate-only
node automations/gbp/gbp.mjs patch --location locations/987654321 \
  --phone "(909) 582-6445"

# Posts and photos
node automations/gbp/gbp.mjs post --location locations/987654321 \
  --summary "Fresh cut in Hesperia this morning. Weekly routes still open." \
  --cta LEARN_MORE --url https://sugspropertyservices.com/ \
  --photo https://sugspropertyservices.com/images/front-lawn-palms-960.webp

node automations/gbp/gbp.mjs media --location locations/987654321 \
  --url https://sugspropertyservices.com/images/front-yard-cactus-960.webp \
  --category EXTERIOR

# Preview anything without credentials
node automations/gbp/gbp.mjs post --location locations/987654321 \
  --summary "Test" --cta LEARN_MORE --url https://sugspropertyservices.com/ \
  --dry-run
```

`patch --payload file.json --update-mask profile.description,hours` is available
for edits the convenience flags do not cover.

## Security

- OAuth scope is the single `business.manage` scope.
- Refresh token and client secret live in `~/.config/sugs-gbp/`, mode 0600;
  override the directory with `GBP_CONFIG_DIR`.
- Nothing sensitive is written to the repo. Do not add `client.json` or
  `token.json` to Git.
- `--dry-run` never reads the token and never calls Google.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `403 ... quota` | Access request not approved yet (0 QPM). |
| `invalid_grant` | Refresh token expired (Testing mode) or revoked. Run `auth` again. |
| `Multiple GBP accounts` | Pass `--account 123456789`; run `accounts` to see options. |
| Posts 403 but locations work | The v4 **Google My Business API** is not enabled for the project. |
| Image rejected | Google fetches `sourceUrl` server-side; use a public **JPG or PNG**. The site's WebP images may not be accepted. |
| `API has not been used/enabled` | Enable the specific API for the project and wait a minute. |

## API reference

- [Prerequisites and 60-day rule](https://developers.google.com/my-business/content/prereqs)
- [Create posts](https://developers.google.com/my-business/content/posts-data)
- [Upload media](https://developers.google.com/my-business/content/upload-photos)
- [Latest API changes](https://developers.google.com/my-business/content/latest-updates)
