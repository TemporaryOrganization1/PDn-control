# Deployment Notes

The project is intended to run on a server with Docker Compose:

```bash
docker compose up -d --build
```

## Required Environment

Create a server-side `.env` file or provide equivalent environment variables before running Compose:

- `OPENROUTER_API_KEY`: required for AI-assisted crawler checks.
- `WORKER_SECRET`: shared secret used by crawler workers when reporting progress to the main backend.
- `COOKIE_SECURE`: set to `true` only when the site is served through HTTPS. Set to `false` for plain HTTP deployments.
- `CORS_ALLOWED_ORIGINS`: comma-separated list of allowed frontend origins for direct backend access during development or custom deployments.
- `DATABASE_URL`: optional override for the main backend PostgreSQL connection. The default Compose value points to the bundled `postgres` service.

## Services

- `frontend`: nginx serving the React app on port `80` and proxying `/api/` to `main-backend`.
- `main-backend`: Go API for authentication, guest limits, scan orchestration, and progress/results.
- `crawler-worker-1..3`: Node/Chromium workers that perform website checks.
- `geoip-service`: GeoIP data updater and lookup service.
- `postgres`: persistent database for auth, guest usage, and GeoIP data.

## Current Deployment Caveats

- If the server does not terminate HTTPS before requests reach the frontend, keep `COOKIE_SECURE=false`; otherwise login and password-change cookies will not work in browsers.
- The frontend currently publishes port `80`. If another web server already uses that port, change the `frontend.ports` mapping or put the app behind a reverse proxy.
- Query history is only a placeholder in the personal account. No history data is persisted yet.
- Go module sums are tracked in `go.sum`, so local Go checks and Docker builds use the same dependency integrity data.
