# Deployment Notes

The project is intended to run on a server with Docker Compose:

```bash
docker compose up -d --build
```

## Required Environment

Create a server-side `.env` file from the sanitized root [`.env.example`](../.env.example), then replace placeholders or provide equivalent environment variables before running Compose:

- `OPENROUTER_API_KEY`: required for AI-assisted crawler checks.
- `WORKER_SECRET`: shared secret used by crawler workers when reporting progress to the main backend.
- `COOKIE_SECURE`: set to `true` only when the site is served through HTTPS. Set to `false` for plain HTTP deployments.
- `CORS_ALLOWED_ORIGINS`: comma-separated list of allowed frontend origins for direct backend access during development or custom deployments.
- `DATABASE_URL`: optional override for the main backend PostgreSQL connection. The default Compose value points to the bundled `postgres` service.

## Services

- `frontend`: public nginx reverse proxy on ports `80` and `443`; serves the exported Next.js frontend and proxies `/api/` to `main-backend`.
- `main-backend`: Go API for authentication, guest limits, scan orchestration, and progress/results.
- `crawler-worker-1..3`: Node/Chromium workers that perform website checks.
- `geoip-service`: GeoIP data updater and lookup service.
- `postgres`: persistent database for auth, guest usage, and GeoIP data.

## Current Deployment Caveats

- If the server does not terminate HTTPS before requests reach the frontend, keep `COOKIE_SECURE=false`; otherwise login and password-change cookies will not work in browsers.
- The frontend publishes port `80`. If the server terminates HTTPS, run this compose stack behind that HTTPS reverse proxy and forward traffic to the `frontend` container.
- The current public product URL is `https://pdn2.neurolife.tech/`. It is excluded from automated Lychee checks because maintenance windows can make it temporarily unavailable, so smoke-check it manually before submission.
- Query history is persisted for authenticated users and returned through `GET /api/reports`.
- Go module sums are tracked in `go.sum`, so local Go checks and Docker builds use the same dependency integrity data.
