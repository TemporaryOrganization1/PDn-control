# ADR-001: Docker Compose Service Boundaries

**Status:** Accepted

**Date:** 2026-07-03

**Quality requirements addressed:** [QR-001](../../quality-requirements.md#qr-001-scan-dispatch-responsiveness), [QR-003](../../quality-requirements.md#qr-003-invalid-input-protection)

## Context

PDn-control combines a customer-facing web UI, authentication/session handling, scan orchestration, browser automation, AI-assisted analysis, GeoIP lookups, PDF report generation, and persistent history. These responsibilities have different runtime dependencies and scaling concerns.

## Decision

Keep the product as a Docker Compose monorepo deployment with explicit service boundaries:

- `frontend` serves exported Next.js pages through nginx and proxies `/api/*` to the backend.
- `main-backend` owns public API routes, authentication, guest limits, scan orchestration, progress state, history, and PDF report metadata.
- `crawler-worker-*` services run browser automation and compliance checks.
- `geoip-service` owns GeoIP database updates and lookup behavior.
- `postgres` stores auth, sessions, scan history, report metadata, and GeoIP update metadata.

## Consequences

This structure keeps user-facing API, crawler execution, and GeoIP data concerns cohesive while allowing crawler capacity to grow independently by adding worker containers. The tradeoff is that local development and deployment require Docker Compose and correct service configuration. The service boundary also makes configuration management important because secrets and runtime overrides must be supplied through `.env` or deployment environment variables, not committed config files.
