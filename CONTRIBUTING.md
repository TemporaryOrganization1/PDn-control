# Contributing To PDn-control

This guide describes the current contribution workflow for product code, documentation, tests, deployment configuration, and maintained course artifacts.

## Before Starting Work

- Create or select a GitHub issue for the work. Use user-story, PBI, bug, or course-task templates as appropriate.
- Confirm the issue has acceptance criteria, expected outcome, estimate, implementer, reviewer, and Work Status when it is selected for a Sprint.
- Read the relevant maintained docs before editing: [docs/development-process.md](docs/development-process.md), [docs/definition-of-done.md](docs/definition-of-done.md), and the product area documentation affected by the change.
- Keep public/private evidence separated. Do not commit credentials, raw recordings, private recording links, exact private timecodes, private access instructions, university emails, or unnecessary PII.

## Branches And Pull Requests

- Branch from the issue where practical.
- Use `ISSUE_NUMBER-short-description`, for example `126-fix-result-page`.
- Open a focused PR into `main`.
- Link the issue with `Closes #...` or an equivalent reference.
- Fill in the PR template, including testing performed and acceptance-criteria verification.
- A different team member must review the PR before merge.
- Merge only after required checks pass and the Definition of Done is satisfied.

## Definition Of Done

A change is complete only when the linked issue acceptance criteria and [docs/definition-of-done.md](docs/definition-of-done.md) are satisfied. In practice this means:

- Required tests and quality gates pass.
- Relevant docs, API contracts, diagrams, QRTs, UATs, deployment notes, or handover instructions are updated when affected.
- User-visible changes are recorded in [CHANGELOG.md](CHANGELOG.md), or the PR explains why the changelog is not applicable.
- Review, verification, and traceability evidence are preserved in normal GitHub artifacts.

## Local Setup

```bash
cp .env.example .env
docker compose up --build
```

The frontend is served at [http://localhost](http://localhost). Replace placeholder values in `.env` locally or on the server. Never commit `.env`.

Important runtime secrets include:

- `OPENROUTER_API_KEY`
- `WORKER_SECRET`
- `IMAGE_SECRET`
- SMTP credentials
- production database credentials if overridden
- private product access credentials, if any are introduced

## Verification Commands

Run the subset relevant to the changed area:

```bash
(cd backend/main-backend && go test ./...)
(cd backend/geoip-service && go test ./...)
(cd frontend && npm run check && npm run build && npm test -- --coverage)
(cd backend/crawler-worker && npm run typecheck && npm test -- --coverage)
docker compose build
```

On Windows PowerShell, use `npm.cmd` when script execution policy blocks `npm.ps1`.

## Documentation Responsibilities

- Product access, setup, and entry-point changes update [README.md](README.md) and [docs/customer-handover.md](docs/customer-handover.md).
- Deployment, HTTPS, SMTP, OpenRouter proxy, or recovery changes update [docs/deployment.md](docs/deployment.md).
- Architecture or service-boundary changes update [docs/architecture/README.md](docs/architecture/README.md) and ADRs where needed.
- QA, coverage, CI, or automated test changes update [docs/testing.md](docs/testing.md), [docs/quality-requirements.md](docs/quality-requirements.md), and [docs/quality-requirement-tests.md](docs/quality-requirement-tests.md) when affected.
- Customer-facing scenario changes update [docs/user-acceptance-tests.md](docs/user-acceptance-tests.md) when affected.

## Public Evidence Safety

Public repository artifacts should use sanitized product data and public links. Private Moodle-only evidence must stay outside the repository, including recordings, exact timecodes, private credentials, private access steps, and customer-identifying details that are not necessary for public evaluation.
