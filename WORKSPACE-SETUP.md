# Workspace Setup — sugs-property-services-github

How this workspace was created and how to reproduce/repair it.

## 1. How GitHub access actually works here

This machine authenticates to GitHub with an **SSH key, not a token**.

| Item | Location | Scope |
|------|----------|-------|
| Private key | `~/.ssh/id_ed25519` | machine-wide |
| Public key | `~/.ssh/id_ed25519.pub` — `SHA256:NLUZ802mitTEf1QdgimRUu5AVO0O6efTwdU2YLiFq3Y` (`dsh-github`) | authorized on account `mjddawangph-dotcom` |
| SSH host rule | `~/.ssh/config` → `Host github.com` uses that key | machine-wide |
| Commit identity | `.gitconfig` (inherited via `includeIf` on `DS-GitHub/`) | this workspace |
| Tokens / `.env` / `gh` CLI | **none present** | — |

Consequences:

- **There is no token to paste.** The AI agent found no `.git-credentials`,
  no `.netrc`, no `GITHUB_TOKEN`, and no `gh` CLI. Nothing needs copying for
  authentication: the SSH key already covers every repository in this account.
- The only per-workspace piece is the **commit identity**, which is copied below.
- Credentials live outside the workspace and are deliberately *not* duplicated
  into it — a copy of a private key in a repo folder is a security risk and
  would end up in `.git/` backups.

## 2. Create the workspace

```bash
# from the parent workspace directory
cd /home/xadmin0/Documents/deepseek-harness/default-workspace/DS-GitHub

mkdir -p sugs-property-services-github
cd sugs-property-services-github

# full structure
mkdir -p docs/{00-business-plan,01-seo-strategy,02-content-calendar,03-outreach-playbook,04-automation-specs,05-runbook}
mkdir -p site automations/{bookings,outreach,social} assets/{brand,media}
for d in docs/01-seo-strategy docs/02-content-calendar docs/03-outreach-playbook \
         docs/04-automation-specs docs/05-runbook automations/bookings \
         automations/outreach automations/social assets/brand assets/media; do
  : > "$d/.gitkeep"
done
```

> Path note: the new workspace was created **inside** `DS-GitHub/` because the
> filesystem outside the active workspace is read-only to the agent. As a
> subdirectory it automatically inherits the `DS-GitHub/` git-identity rule.
> To put it at the top level instead, run from your own shell:
> `mv sugs-property-services-github ~/Documents/deepseek-harness/default-workspace/`
> then re-run the identity step (2.3) with the new path.

## 3. Copy the GitHub configuration

### 3.1 Commit identity (the only thing that needs copying)

```bash
cp /home/xadmin0/Documents/deepseek-harness/default-workspace/DS-GitHub/.gitconfig \
   /home/xadmin0/Documents/deepseek-harness/default-workspace/DS-GitHub/sugs-property-services-github/.gitconfig
chmod 600 .gitconfig
```

Contents (same identity as the parent workspace):

```ini
[user]
	name = mjddawangph-dotcom
	email = mjddawangph-dotcom@users.noreply.github.com
[init]
	defaultBranch = main
```

### 3.2 Why it already works without more config

`~/.gitconfig` contains:

```ini
[includeIf "gitdir:/home/xadmin0/Documents/deepseek-harness/default-workspace/DS-GitHub/"]
	path = /home/xadmin0/Documents/deepseek-harness/default-workspace/DS-GitHub/.gitconfig
```

`includeIf` matches **any** repository under `DS-GitHub/`, subdirectories
included — so commit identity is resolved automatically here. Verified:

```bash
git config user.name    # -> mjddawangph-dotcom
git config user.email   # -> mjddawangph-dotcom@users.noreply.github.com
```

If you move the workspace outside `DS-GitHub/`, add a matching `includeIf`
block (with the new path) to `~/.gitconfig`, or set the identity locally:

```bash
git config --local user.name  "mjddawangph-dotcom"
git config --local user.email "mjddawangph-dotcom@users.noreply.github.com"
```

### 3.3 Initialize the repo and remote

```bash
git init -b main
git remote add origin git@github.com:mjddawangph-dotcom/sugs-property-services.git
git remote -v
```

### 3.4 If you ever switch to HTTPS + a token instead

Not needed today, but if you do, **this is where the token goes** — never in a
tracked file:

```bash
# option A: credential store (plaintext, chmod 600)
git config --global credential.helper store
printf 'https://mjddawangph-dotcom:%s@github.com\n' "$GITHUB_TOKEN" > ~/.git-credentials
chmod 600 ~/.git-credentials

# option B: local .env (git-ignored) for scripts that call the API
echo 'GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxx' >> .env   # .env is in .gitignore
```

## 4. Verify authentication

```bash
# 1. key is accepted, shows the account
ssh -T git@github.com
#    -> Hi mjddawangph-dotcom! You've successfully authenticated...

# 2. remote is reachable
git ls-remote origin
```

Step 2 **fails with `ERROR: Repository not found` until the private repo exists
on GitHub**. Create it at <https://github.com/new> (name
`sugs-property-services`, visibility **Private**, no README/license), then
re-run `git ls-remote origin` and push:

```bash
git push -u origin main
```

## 5. Cloudflare Pages — manual only

Out of scope for this workspace setup and intentionally not automated.

- Do **not** add Wrangler config, `wrangler.toml`, or DNS automation here.
- In the Cloudflare dashboard: Pages → connect the repo →
  build command empty, output directory `site`, production branch `main`.
- Gustavo owns this step; the agent must not attempt DNS or build-settings loops.
