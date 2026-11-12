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
git ls-remote --heads origin # main (source) and gh-pages (legacy preview)
git push -u origin main
```

## 5. Hosting

### Cloudflare Pages (live)

The live site is https://sugspropertyservices.com/.

Cloudflare Pages is connected to the GitHub repository from `main`, with `site`
as the build output directory. The custom domain is `sugspropertyservices.com`
(bare domain primary) and `www` redirects to it with a 301.

Cloudflare Pages, both custom domains, SSL, and the HTTPS `www` redirect are
live. Always Use HTTPS still needs to be enabled, and GitHub Pages is still
enabled as the legacy copy.

### GitHub Pages (legacy)

`gh-pages` is the previous published copy. Do not update it for new changes.
Disable GitHub Pages after the Cloudflare custom domain is verified.
