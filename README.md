# PDn-control

PDn-control is a legal-tech website checker for risks related to Russian personal-data law, especially Federal Law No. 152. It crawls a submitted website, classifies compliance risks, and shows a user-facing report. Guest and free accounts receive three summary scans in a rolling 30-day window; paid-origin scans use a deeper exploration budget and can generate PDF and screenshot evidence. In the current MVP, an authenticated user can activate Paid access for 30 days from the profile without payment or automatic renewal.

## Current Access

- Product: [https://pdn2.neurolife.tech/](https://pdn2.neurolife.tech/)
- Hosted documentation: [http://194.87.95.22:8088/](http://194.87.95.22:8088/)
- Customer handover guide: [docs/customer-handover.md](docs/customer-handover.md)

The public deployment accepts a website URL and returns a risk-oriented report. The service performs an initial technical/content check only; final legal conclusions should be confirmed by a qualified specialist.

## Repository Guidance

- Contributor workflow: [CONTRIBUTING.md](CONTRIBUTING.md)
- AI-agent guidance: [AGENTS.md](AGENTS.md)
- Development process and configuration management: [docs/development-process.md](docs/development-process.md)
- Definition of Done: [docs/definition-of-done.md](docs/definition-of-done.md)

## Maintained Documentation

- Architecture and ADRs: [docs/architecture/README.md](docs/architecture/README.md)
- Deployment notes: [docs/deployment.md](docs/deployment.md)
- Testing and QA status: [docs/testing.md](docs/testing.md)
- Quality requirements: [docs/quality-requirements.md](docs/quality-requirements.md)
- Quality requirement tests: [docs/quality-requirement-tests.md](docs/quality-requirement-tests.md)
- User acceptance tests: [docs/user-acceptance-tests.md](docs/user-acceptance-tests.md)
- User-story index: [docs/user-stories.md](docs/user-stories.md)
- Roadmap: [docs/roadmap.md](docs/roadmap.md)
- OpenAPI contract: [api/openapi.yaml](api/openapi.yaml)

## Architecture At A Glance

```text
Browser
  -> frontend nginx / exported Next.js
  -> main-backend Go/Echo API
  -> crawler workers with Puppeteer
  -> GeoIP service and PostgreSQL
```

The Docker Compose stack contains the frontend proxy, main backend, three crawler workers, GeoIP service, PostgreSQL, persistent report/image storage, and optional SMTP/OpenRouter integration. The maintained architecture views explain the service boundaries, scan sequence, and deployment topology in [docs/architecture/README.md](docs/architecture/README.md).

## Run Locally

Prerequisites:

- Docker and Docker Compose
- An OpenRouter API key for AI-assisted checks
- An IP2Location LITE token for GeoIP fallback (optional, get at https://lite.ip2location.com/)
- Optional SMTP credentials if email verification must be tested

```bash
git clone https://github.com/TemporaryOrganization1/PDn-control.git
cd PDn-control
cp .env.example .env
docker compose up --build
```

The local product is served at [http://localhost](http://localhost). Replace placeholders in `.env` before running realistic crawler, SMTP, or production-like checks. Do not commit `.env` or private access details.

For deployment configuration, HTTPS, SMTP diagnostics, OpenRouter proxying, and recovery notes, use [docs/deployment.md](docs/deployment.md).

## Run The Documentation Site

```bash
python3 docs-site/server.py --host 0.0.0.0 --port 8088
```

This starts only the documentation viewer for files under `docs/`. It does not start the product services. See [docs-site/README.md](docs-site/README.md).

## Verification

Common local checks:

```bash
(cd backend/main-backend && go test ./...)
(cd backend/geoip-service && go test ./...)
(cd frontend && npm run check && npm run build && npm test -- --coverage)
(cd backend/crawler-worker && npm run typecheck && npm test -- --coverage)
```

On Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked by execution policy.

## Reports And Releases

- Latest completed public evidence index: [reports/week6/README.md](reports/week6/README.md)
- Week 7 draft evidence and explicit blockers: [reports/week7/README.md](reports/week7/README.md)
- Changelog: [CHANGELOG.md](CHANGELOG.md)
