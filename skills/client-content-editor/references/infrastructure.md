# Nati's live infrastructure

> **Shared copy (2026-10-21):** server IPs, hostnames, the tailnet name, the Cloudflare account ID and the tunnel ID are replaced by `<PLACEHOLDERS>`. The real values stay on Nati's machine.

The platform is already built and running. **Do not stand up a new one.** For a
new client, follow "Adding a client" in `operations.md` against this install.

**No secrets are stored in this file.** Every credential lives on the server, at
the paths listed under "Where the secrets are". Read them there when needed.

---

## Getting in

The VPS has **zero ports open to the internet**. `ufw` is at DROP policy and SSH
listens only on the Tailscale interface. Access is over the tailnet.

```bash
ssh root@<VPS_TAILSCALE_IP>
```

| | |
|---|---|
| Tailnet | `<TAILNET_NAME>` (Tailscale free plan) |
| Machine | `<VPS_HOSTNAME>`, Tailscale SSH enabled, key expiry disabled |
| Tailscale IP | `<VPS_TAILSCALE_IP>` |
| Nati's desktop | `<DESKTOP_HOSTNAME>`, `<DESKTOP_TAILSCALE_IP>` |

If SSH fails, check Tailscale is up on the local machine first:
`"/c/Program Files/Tailscale/tailscale.exe" status`

---

## The server

Hostinger VPS, managed at `hpanel.hostinger.com`.

| | |
|---|---|
| OS | Debian 13 (trixie) |
| CPU / RAM | 2 vCPU AMD EPYC 9354P, 7.8 GB |
| Disk | 99 GB, roughly 82 GB free |
| Swap | 2 GB at `/swapfile`, added for build headroom |
| Node | 24.15.0 |
| Postgres | 17.11, database and role both named `mediawave` |

`/home/nati` holds unrelated work (openclaw, hermes, an obsidian vault). **Leave
it alone.** Everything for this platform lives under `/opt/mediawave`.

---

## Layout and services

```
/opt/mediawave/
  cms/                  Payload app        (systemd: mediawave-cms, port 3000)
  sites/<slug>/         client site source, built in place
  media/                uploads
  backups/              nightly dumps, 30 day retention
  bin/cms               operator CLI, symlinked to /usr/local/bin/cms
```

| Service | Role |
|---|---|
| `mediawave-cms` | the Payload app |
| `postgresql` | database |
| `caddy` | port 80 to the app, 8080 serves a built site locally |
| `cloudflared` | the public tunnel |
| `mediawave-backup.timer` | nightly at 03:20 |

---

## Cloudflare

| | |
|---|---|
| Account ID | `<CLOUDFLARE_ACCOUNT_ID>` |
| Tunnel | name `mediawave`, id `<TUNNEL_ID>` |
| Tunnel config | `/etc/cloudflared/config.yml` |

Pages projects on this account, all built from GitHub org **`mediawave-dev`**:

| Project | Domains | Repo |
|---|---|---|
| `ben-david-judaica` | ben-david-judaica.com, www | `mediawave-dev/Ben-David`, branch `main` |
| `mediawaveisrael` | mediawave.co.il | `mediawave-dev/MediaWaveIsrael` |
| `hava-landing-page` | hava-landing-page.pages.dev | `mediawave-dev/hava-landing-page` |

Build command `npm run build`, output `dist`.

Note the split: **Tailscale and Hostinger are on Nati's personal GitHub
(`levy_n`), while Cloudflare Pages builds from the `mediawave-dev` org.**

---

## Tenant one: Ben David Judaica

| | |
|---|---|
| Editor | `https://admin.ben-david-judaica.com` |
| Live site | `https://ben-david-judaica.com` |
| Site source | `/opt/mediawave/sites/ben-david` |
| Framework | Astro 5, static, bilingual he/en |
| Slots | 11 |
| Support contact in the guide | Moriah, 052-8731808 |

The client's own business number on the site is 054-5504775. Different thing from
the support contact; do not conflate them.

---

## Where the secrets are

| What | Path on the server | Mode |
|---|---|---|
| Login credentials | `/opt/mediawave/CREDENTIALS.txt` | 600 |
| Database password | `/opt/mediawave/.pgpass-mediawave` | 600 |
| Cloudflare API token | `/opt/mediawave/.cf-token` | 600 |
| App environment | `/opt/mediawave/cms/.env` | 600 |
| Tunnel certificate | `/root/.cloudflared/cert.pem` | 600 |
| GitHub read token | `/opt/mediawave/.gh-token` | 600 |

```bash
ssh root@<VPS_TAILSCALE_IP> 'cat /opt/mediawave/CREDENTIALS.txt'
```

The Cloudflare token is scoped to `Account > Cloudflare Pages > Edit`. The
GitHub token is a fine-grained PAT on the `mediawave-dev` org with Contents
Read-only, used to clone client repos onto the server; verified read-only with
the write probe in gotchas #19. The tunnel
cert is zone-scoped and **cannot** touch Pages, so do not try to use it for
deployments.

---

## Auth notes

The client's password is deliberately memorable, so the account carries a lockout
of 5 attempts and a 10 minute lock. **If you weaken the lockout, strengthen the
password.**

Payload stores emails lowercased. Query with the lowercase form or the lookup
returns nothing; the login form itself accepts any casing.

**There is no SMTP adapter.** Password reset does not work, so reset by hand:

```bash
ssh root@<VPS_TAILSCALE_IP> 'cd /opt/mediawave/cms && set -a && . ./.env && set +a \
  && npx payload run src/scripts/setpw.ts'
```

---

## Verifying anything

```bash
cd g:/Web-Dev/Ben-David
PW=$(ssh root@<VPS_TAILSCALE_IP> 'grep ^CLIENT /opt/mediawave/CREDENTIALS.txt | awk "{print \$3}"')
node tests/cms-frontend.mjs "$PW" ./shots        # 35 checks
node tests/verify-live.mjs "https://ben-david-judaica.com" "some text"
node tests/verify-entry.mjs ./shots              # the bare hostname redirect
```

Never verify a content change with `curl`. See `gotchas.md` #10.
