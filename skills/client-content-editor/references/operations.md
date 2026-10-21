# Runbook

Reference deployment: Hostinger VPS, Debian 13, Postgres 17, Payload 3.88,
Caddy, Cloudflare Tunnel. Adjust paths to the actual install.

---

## Layout

```
/opt/mediawave/
  cms/                     the Payload app
  cms/.env                 secrets, 600
  sites/<slug>/            each client's site source, built here
  media/                   uploads
  backups/                 nightly dumps
  bin/cms                  operator CLI
  .pgpass-mediawave        db password, 600
  .cf-token                Cloudflare API token, 600
```

Services: `mediawave-cms`, `caddy`, `postgresql`, `cloudflared`,
`mediawave-backup.timer`.

---

## Public access without opening a port

Do not open 80/443. Use a tunnel: the server makes an outbound connection and the
firewall stays at DROP.

```bash
apt-get install -y cloudflared
cloudflared tunnel login            # prints a URL for the human to authorise
cloudflared tunnel create mediawave
```

`/etc/cloudflared/config.yml`:
```yaml
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json
ingress:
  - hostname: admin.<client-domain>
    service: http://127.0.0.1:3000
  - service: http_status:404
```

```bash
cloudflared tunnel route dns mediawave admin.<client-domain>
cloudflared service install
```

**Check existing DNS before routing.** If the apex already points at a static
host, only add the `admin` subdomain and leave the rest alone.

The zone and account behind the cert:
```python
import base64, json, re
raw = open("/root/.cloudflared/cert.pem").read()
d = json.loads(base64.b64decode(re.sub(r"\s", "", re.search(r"TOKEN-----(.*?)-----END", raw, re.S).group(1))))
# d["zoneID"], d["accountID"], d["apiToken"]  -- zone scoped only, cannot touch Pages
```

---

## Deploying to a static host

A Pages/Workers deploy needs its own token: `Account > Cloudflare Pages > Edit`.
Store it at `/opt/mediawave/.cf-token` (600) and as `CLOUDFLARE_API_TOKEN` in
`.env`, then set the tenant's `deployCmd`:

```
npx --yes wrangler@4 pages deploy ./dist --project-name=<project> --branch=main --commit-dirty=true
```

**Always deploy to a preview branch first and look at it:**
```bash
npx wrangler@4 pages deploy ./dist --project-name=<project> --branch=cms-preview --commit-dirty=true
```
This is what catches a stale test marker or a broken image before the client's
customers see it.

Direct upload works even when the project is Git-connected.

---

## Operator CLI

`/opt/mediawave/bin/cms`, driving the REST API as the client user.

```
cms list                    every slot
cms get <key> [he|en]       read a value
cms set <key> "value" [he]  write a value
cms publish                 trigger a publish
cms status                  last job status
cms wait                    block until done or failed
```

---

## Routine

```bash
systemctl status mediawave-cms
systemctl restart mediawave-cms
tail -f /var/log/mediawave-cms.log
cms status
```

After changing platform code:
```bash
cd /opt/mediawave/cms
set -a && . ./.env && set +a
npx payload generate:importmap     # only if a custom component changed
npm run build
systemctl restart mediawave-cms
```

Schema change: `npx payload migrate:create <name>` then `npx payload migrate`.

Manual rebuild when the queue is stuck:
```bash
cd /opt/mediawave/sites/<slug> && npm run build
```

---

## Backups

A nightly systemd timer dumping Postgres and tarring the media, 30 day retention.

```bash
systemctl start mediawave-backup.service      # run now
tail /var/log/mediawave-backup.log
systemctl list-timers mediawave-backup.timer
```

Restore:
```bash
PGPASS=$(cat /opt/mediawave/.pgpass-mediawave)
systemctl stop mediawave-cms
PGPASSWORD="$PGPASS" pg_restore -h 127.0.0.1 -U mediawave -d mediawave \
  --clean --if-exists --no-owner /opt/mediawave/backups/db_<date>.dump
tar xzf /opt/mediawave/backups/media_<date>.tar.gz -C /opt/mediawave
systemctl start mediawave-cms
```

**Exercise the restore once into a scratch database before calling it done.**
A backup nobody has restored is not a backup.

```bash
sudo -u postgres createdb -O mediawave restoretest
PGPASSWORD="$PGPASS" pg_restore -h 127.0.0.1 -U mediawave -d restoretest --no-owner <dump>
# assert the row counts and that Hebrew labels survived
sudo -u postgres psql -c "DROP DATABASE restoretest;"
```

---

## Adding a client

Roughly twenty minutes once the platform exists.

1. Copy the site source to `/opt/mediawave/sites/<slug>`, run `npm install`
2. Create the tenant row: name, slug, siteUrl, repoPath, buildCmd, deployCmd, bilingual
3. Create a `client` user and link it to the tenant
4. Insert the slot rows - **verify every key renders first**
5. Add `src/lib/cms.ts` and wire the components, always with fallbacks
6. Seed initial values and images from the site's current content, so the client's
   first login shows their real site rather than empty cards
7. Publish once and verify in a browser
8. Write the client guide, then hand over

---

## Costs

| Item | Cost |
|------|------|
| VPS, shared by every client | one small monthly fee |
| Postgres, Payload, Caddy, cloudflared | 0, open source |
| Static hosting | 0 on Cloudflare's free tier |
| Images | 0 locally, or R2's free tier |
| Video | 0, it is a YouTube link |

An additional client adds nothing. That is the entire point of the shared instance.

---

## Still worth adding

- **SMTP.** Without a mail adapter, password reset does not work and you reset
  passwords by hand. Payload warns about this at boot.
- **R2 for media**, once local storage or the lack of a CDN starts to matter.
  Adding `s3Storage` pointed at R2 is a small change.
