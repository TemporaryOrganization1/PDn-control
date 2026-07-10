# AI Agent Guidance

This file is for AI coding agents working in the PDn-control repository. Follow the repository's existing architecture, documentation, and course evidence rules.

## Required Context

Before changing files, inspect the task-specific context and the maintained docs that govern the affected area:

- [README.md](README.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [docs/development-process.md](docs/development-process.md)
- [docs/definition-of-done.md](docs/definition-of-done.md)
- [docs/customer-handover.md](docs/customer-handover.md)
- [docs/deployment.md](docs/deployment.md)
- [docs/testing.md](docs/testing.md)
- [docs/architecture/README.md](docs/architecture/README.md)
- relevant assignment files under `course_information_swp26/` for course tasks

For frontend work, also read [frontend/PDn_Control_Universal_UI_Blueprint.md](frontend/PDn_Control_Universal_UI_Blueprint.md) and inspect the existing components before editing.

## Product Boundaries

- Preserve the monorepo structure: `frontend/`, `backend/main-backend/`, `backend/crawler-worker/`, `backend/geoip-service/`, `api/`, `docs/`, `docs-site/`, and `reports/`.
- Docker Compose is the primary run and deployment model.
- Keep frontend, backend, crawler-worker, GeoIP, PostgreSQL, report storage, and image storage responsibilities separate.
- Keep `api/openapi.yaml` aligned with API behavior when API behavior changes.
- Preserve callback and secret boundaries between crawler workers and main backend.
- Do not expose server-side secrets to frontend code, public docs, screenshots, reports, or examples.

## Public And Private Evidence Rules

- Do not invent customer meetings, approvals, CI runs, releases, deployments, screenshots, recordings, or issue/PR evidence.
- If external or private evidence is missing, write an explicit `TODO` or blocker instead of making a claim.
- Never commit `.env`, credentials, raw recordings, private recording links, exact private timecodes, university emails, or unnecessary PII.
- Keep public documents sanitized and route private evidence through the Moodle/private submission wrapper only.

## Implementation Style

- Follow existing code patterns and local helpers before adding abstractions or dependencies.
- Keep edits scoped to the requested task.
- Add comments only where they clarify non-obvious logic.
- For frontend UI, preserve the premium dark legal-tech direction, existing components, Tailwind patterns, and lucide icons where applicable.
- Do not change backend/API/auth/scan behavior for purely visual work.

## Documentation Updates

Update maintained docs when the corresponding behavior changes:

- Access, setup, handover, or public entry point: [README.md](README.md), [docs/customer-handover.md](docs/customer-handover.md)
- Deployment, runtime configuration, SMTP, OpenRouter, recovery: [docs/deployment.md](docs/deployment.md)
- Architecture or service boundaries: [docs/architecture/README.md](docs/architecture/README.md) and ADRs
- Testing, CI, coverage, QRTs: [docs/testing.md](docs/testing.md), [docs/quality-requirements.md](docs/quality-requirements.md), [docs/quality-requirement-tests.md](docs/quality-requirement-tests.md)
- User-facing acceptance scenarios: [docs/user-acceptance-tests.md](docs/user-acceptance-tests.md)
- User-visible changes: [CHANGELOG.md](CHANGELOG.md)

## Verification

Run the strongest relevant checks you can:

```bash
(cd backend/main-backend && go test ./...)
(cd backend/geoip-service && go test ./...)
(cd frontend && npm run check && npm run build && npm test -- --coverage)
(cd backend/crawler-worker && npm run typecheck && npm test -- --coverage)
docker compose build
```

On Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked. If a check cannot be run, report why and name the residual risk.
