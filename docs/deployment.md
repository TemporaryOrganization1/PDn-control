# Deployment Notes

The project is intended to run on a server with Docker Compose:

```bash
docker compose up -d --build
```

## Required Environment

Create a server-side `.env` file from the sanitized root [`.env.example`](../.env.example), then replace placeholders or provide equivalent environment variables before running Compose:

- `OPENROUTER_API_KEY`: required for AI-assisted crawler checks.
- `WORKER_SECRET`: shared secret used by crawler workers when reporting progress to the main backend.
- `APP_BASE_URL`: public site URL used in generated links, for example `https://pdn.example.com`.
- `SERVER_NAME`: domain handled by the frontend nginx container. Use `_` for local runs.
- `ENABLE_HTTPS`: set to `true` only when valid TLS certificates are mounted into the frontend container.
- `COOKIE_SECURE`: set to `true` when the public site is served through HTTPS. Set to `false` for plain HTTP/local deployments.
- `CORS_ALLOWED_ORIGINS`: comma-separated list of allowed frontend origins for direct backend access during development or custom deployments.
- `DATABASE_URL`: optional override for the main backend PostgreSQL connection. The default Compose value points to the bundled `postgres` service.

## Local HTTP Run

For local development with the production Docker stack:

```env
APP_BASE_URL=http://localhost
SERVER_NAME=_
ENABLE_HTTPS=false
COOKIE_SECURE=false
LETSENCRYPT_DIR=pdn-letsencrypt
```

Then run:

```bash
docker compose up -d --build
```

The frontend nginx container serves the exported Next.js app on `http://localhost` and proxies `/api/` to `main-backend` over the internal Docker network.

## Production Domain Run

Point the domain DNS `A`/`AAAA` record to the server, place certificates on the host, then set:

```env
APP_BASE_URL=https://your-domain.example
SERVER_NAME=your-domain.example
ENABLE_HTTPS=true
COOKIE_SECURE=true
LETSENCRYPT_DIR=/etc/letsencrypt
```

By default the frontend container expects:

```text
/etc/letsencrypt/live/your-domain.example/fullchain.pem
/etc/letsencrypt/live/your-domain.example/privkey.pem
```

Use `SSL_CERTIFICATE` and `SSL_CERTIFICATE_KEY` if your certificate files live elsewhere inside the mounted `/etc/letsencrypt` directory. With HTTPS enabled, nginx redirects port `80` traffic to `443`.

## Services

- `frontend`: public nginx reverse proxy on ports `80` and `443`; serves the exported Next.js frontend and proxies `/api/` to `main-backend`.
- `main-backend`: Go API for authentication, guest limits, scan orchestration, and progress/results.
- `crawler-worker-1..3`: Node/Chromium workers that perform website checks.
- `geoip-service`: GeoIP data updater and lookup service.
- `postgres`: persistent database for auth, guest usage, and GeoIP data.

## Current Deployment Caveats

- If another reverse proxy terminates HTTPS before this compose stack, keep `ENABLE_HTTPS=false`, forward traffic to frontend port `80`, and still set `COOKIE_SECURE=true` because browsers access the site over HTTPS.
- If `ENABLE_HTTPS=true` but certificate files are missing, the frontend container exits instead of silently serving broken TLS.
- The current public product URL is `https://pdn2.neurolife.tech/`. It is excluded from automated Lychee checks because maintenance windows can make it temporarily unavailable, so smoke-check it manually before submission.
- Query history is persisted for authenticated users and returned through `GET /api/reports`.
- Go module sums are tracked in `go.sum`, so local Go checks and Docker builds use the same dependency integrity data.
