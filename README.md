# Gender Reveal Invitation

Evite-style animated invite for Himani and Praneeth's gender reveal. Guests open an envelope, read the invitation, then RSVP. Notifications use open-source tools only.

## Open-source stack

| Layer | Tool | License |
|-------|------|---------|
| Frontend | Vite | MIT |
| Backend | Express | MIT |
| Email | Nodemailer | MIT |
| Push alerts | ntfy | Apache 2.0 |
| Container | Docker + Node Alpine | OSS |
| HTTPS proxy | Caddy | Apache 2.0 |
| CI/CD | GitHub Actions | OSS |
| Hosting A | Fly.io (Docker) | Free public URL |
| Hosting B | Coolify on VPS | MIT |
| Hosting C | Docker Compose + Caddy | OSS self-host |

RSVPs are also saved to `data/rsvps.jsonl` as a backup log.

---

## Deploy to a public URL (Fly.io)

Fly.io gives you a free public link like `https://gender-reveal-invite.fly.dev`.

### 1. Install Fly CLI

```bash
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

Docs: https://fly.io/docs/flyctl/install/

### 2. Log in

```bash
fly auth signup
fly auth login
```

### 3. Configure secrets

```bash
copy .env.example .env
fly launch --no-deploy
fly volumes create rsvp_data --region iad --size 1

fly secrets set RSVP_TO_EMAIL=your-email@gmail.com
fly secrets set SMTP_HOST=your-smtp-host SMTP_PORT=587 SMTP_USER=your-email@gmail.com SMTP_PASS=your-app-password
fly secrets set NTFY_TOPIC=your-unique-topic-name NTFY_SERVER=https://ntfy.sh
```

For ntfy: pick a unique topic, install the ntfy app, and subscribe to get instant phone notifications.

### 4. Deploy

```bash
fly deploy
```

Share `https://<your-app-name>.fly.dev` with guests.

### 5. Custom domain (optional)

```bash
fly certs add your-domain.com
```

Point DNS to Fly as instructed. Cloudflare DNS works well.

---

## Self-host: Docker + Caddy

```bash
copy .env.example .env
# Edit .env and set your domain in Caddyfile

docker compose up -d --build
```

Caddy auto-provisions HTTPS via Let's Encrypt.

---

## Coolify (open-source PaaS)

1. Install Coolify on a VPS: https://coolify.io
2. Create a Dockerfile app from this repo
3. Set env vars from `.env.example`
4. Assign your custom domain

---

## Local development

```bash
npm install
copy .env.example .env
npm run dev
```

Open http://localhost:5173

---

## Notifications

Configure at least one:

**Email** — set `RSVP_TO_EMAIL`, `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` (Gmail App Password) in your host's env settings

**ntfy push** — set `NTFY_TOPIC`, subscribe in the ntfy app (works without SMTP)

Both can run together.

---

## GitHub Actions auto-deploy

1. Push to GitHub
2. Run `fly tokens create deploy`
3. Add `FLY_API_TOKEN` as a repo secret
4. Pushes to `main` auto-deploy
