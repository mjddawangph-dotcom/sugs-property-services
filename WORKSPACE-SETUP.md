# Workspace Setup — sugs-property-services-github

Location: `/home/xadmin0/Documents/deepseek-harness/default-workspace/sugs-property-services-github`
GitHub repo: `git@github.com:mjddawangph-dotcom/sugs-property-services.git` (public)

## 1. How GitHub access works here

This machine authenticates to GitHub with an **SSH key, not a token**.

| Item | Location | Scope |
|------|----------|-------|
| Private key | `~/.ssh/id_ed25519` (`SHA256:NLUZ802mit...Fq3Y`, `dsh-github`) | machine-wide |
| Host rule | `~/.ssh/config` → `Host github.com` uses that key | machine-wide |
| Commit identity | `.gitconfig` in this folder | this workspace only |
| Tokens / `.env` / `gh` CLI | none | — |

There is **nothing to paste and no credential to copy**. The SSH key already
covers every repo in `mjddawangph-dotcom`; the only per-workspace artifact is
the commit identity below. The private key is deliberately not duplicated here.

## 2. Commit identity

`.gitconfig` in this folder:

```ini
[user]
	name = mjddawangph-dotcom
	email = mjddawangph-dotcom@users.noreply.github.com
[init]
	defaultBranch = main
```

It is activated by a dedicated rule in `~/.gitconfig`:

```ini
[includeIf "gitdir:/home/xadmin0/Documents/deepseek-harness/default-workspace/sugs-property-services-github/"]
	path = /home/xadmin0/Documents/deepseek-harness/default-workspace/sugs-property-services-github/.gitconfig
```

Verify:

```bash
git config user.name    # -> mjddawangph-dotcom
git config user.email   # -> mjddawangph-dotcom@users.noreply.github.com
```

## 3. DSH sidebar entry

The sidebar is driven by the workspace registry at
`~/.dsh/storages/workspace.json` (not by scanning directories). This workspace
is registered there as:

- id `84c0d48b-dda8-4036-8bb5-08254b53b2d6`
- path `/home/xadmin0/Documents/deepseek-harness/default-workspace/sugs-property-services-github`
- title `sugs-property-services-github`

The registry is loaded into memory when `dsh web` boots, so a running server may
need a refresh/restart to show the new row. If it does not appear, use
**New workspace** in the sidebar and select this folder — the registry resolves
the existing path rather than duplicating it.

## 4. Verification

```bash
ssh -T git@github.com        # -> Hi mjddawangph-dotcom! You've successfully authenticated...
git ls-remote --heads origin # main (source) and gh-pages (published site)
git push -u origin main
```

## 5. Hosting

### GitHub Pages (current)

The site is live at:
https://mjddawangph-dotcom.github.io/sugs-property-services/

`gh-pages` contains the contents of `site/` at its root. `main` is the source
of truth. Publishing is a manual copy from `site/` to `gh-pages` followed by a
push. Do not edit the generated branch by hand except during that publish step.

The site is public and indexable. Prices, photos, contact details, the
service-area list, Formspree delivery, and the privacy policy are approved.

### Cloudflare Pages (planned)

Intentionally not automated: no `wrangler.toml`, no DNS or build-setting
automation. In the Cloudflare dashboard: Pages → connect repo → build command
empty, output directory `site`, production branch `main`. Gustavo owns this step.
