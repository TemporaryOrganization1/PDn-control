# Testing and QA Status

This document is the maintained testing status artifact for Assignment 4 Part 7 and later product work. The minimum required automated line coverage for each critical module is 30%.

Starting in Assignment 5, architecture documentation and ADR traceability are also part of the maintained QA evidence. Architecture decisions are indexed in [docs/architecture/README.md](architecture/README.md), and relevant quality requirements link to their ADRs in [docs/quality-requirements.md](quality-requirements.md).

- [Critical Modules and Coverage](#critical-modules-and-coverage)
- [Automated Test Status](#automated-test-status)
- [CI and QA Check Status](#ci-and-qa-check-status)
- [Additional QA Check Rationale](#additional-qa-check-rationale)
- [Link Checker Exclusions](#link-checker-exclusions)
- [Manual Evidence That Does Not Count as QRT](#manual-evidence-that-does-not-count-as-qrt)
- [Maintained Gates For Later Work](#maintained-gates-for-later-work)

## Critical Modules and Coverage

| Critical module | Why critical | Required line coverage | Current line coverage | Evidence |
|---|---|---:|---:|---|
| `backend/main-backend/internal/store/store.go` | Tracks scan progress, results, report IDs, and guest request limits. | 30% | 73.3% | `go test ./... -covermode=atomic -coverprofile=coverage.out` in `backend/main-backend`; `go tool cover -func=coverage.out`. |
| `backend/main-backend/internal/workerpool/pool.go` | Selects crawler workers, enforces worker capacity, and dispatches scan tasks. | 30% | 91.1% | `go test ./... -covermode=atomic -coverprofile=coverage.out` in `backend/main-backend`; `go tool cover -func=coverage.out`. |
| `backend/geoip-service/internal/downloader/downloader.go` | Downloads and stores the GeoIP database used by jurisdiction checks. | 30% | 66.7% package coverage; `DownloadMMDB` 71.0%. | `go test ./... -covermode=atomic -coverprofile=coverage.out` in `backend/geoip-service`; `go tool cover -func=coverage.out`. |
| `frontend/lib/api.ts` | Normalizes scan requests and handles API errors for the Next frontend. | 30% | Covered by Vitest unit tests. | `npm test -- --coverage` in `frontend`. |
| `backend/crawler-worker/src/url.ts` | Normalizes target domains used by crawler checks. | 30% | 94.44% | `npm test -- --coverage` in `backend/crawler-worker`. |
| `backend/crawler-worker/src/checks/https.ts` | Detects insecure HTTP endpoints during scans. | 30% | 100% | `npm test -- --coverage` in `backend/crawler-worker`. |
| `backend/crawler-worker/src/checks/ssl.ts` | Detects self-signed or insecure SSL/TLS endpoints during scans. | 30% | 97.22% | `npm test -- --coverage` in `backend/crawler-worker`. |

Global repository coverage is lower because command entrypoints, DB-backed stores, PDF rendering, UI pages, and full browser crawler flows are not yet fully automated. The Assignment 4 threshold is enforced for the listed critical modules.

## Automated Test Status

| Test type | Scope | Command or CI check | Latest result | Evidence |
|---|---|---|---|---|
| Unit tests | Guest quota, task state, URL parsing, worker payload shape, frontend API helpers, result scoring, fines, and country flag helpers. | `go test ./...`, `npm test -- --coverage`, `npm run check` | Backend tests plus Next lint/typecheck and Vitest frontend coverage. | [Quality Gates workflow](https://github.com/TemporaryOrganization1/PDn-control/actions/workflows/quality.yml). |
| Integration tests | Worker pool HTTP dispatch with `httptest`; GeoIP MMDB download with `httptest`; crawler check subscriptions with fake request/response objects. | `go test ./...`, `npm test -- --coverage` | Passing in the latest protected-branch CI run. | [Quality Gates run on `main`](https://github.com/TemporaryOrganization1/PDn-control/actions/runs/28668920944). |
| Automated QRTs | QRT-001 scan dispatch responsiveness, QRT-002 crawler type-check feedback, QRT-003 invalid input protection. | `go test ./internal/workerpool -run TestQRTWorkerSelectionCompletesWithinThreshold -count=1`; `npm run typecheck`; `npm test -- --run tests/runner.test.ts`; `go test ./internal/api -run TestValidEmail -count=1` | Passing in the latest protected-branch CI run. | [Quality requirement tests](quality-requirement-tests.md); [Quality Gates run on `main`](https://github.com/TemporaryOrganization1/PDn-control/actions/runs/28668920944). |

## CI and QA Check Status

| Gate or check | Required for Done? | Latest protected-branch status | Evidence |
|---|---|---|---|
| Go formatting check | Yes | Passing. | [Quality Gates run on `main`](https://github.com/TemporaryOrganization1/PDn-control/actions/runs/28668920944). |
| Go static analysis (`go vet`) | Yes | Passing. | [Quality Gates run on `main`](https://github.com/TemporaryOrganization1/PDn-control/actions/runs/28668920944). |
| Go tests and coverage | Yes | Passing. | `backend/main-backend/coverage.out` and `backend/geoip-service/coverage.out` are uploaded by CI as coverage artifacts in the [Quality Gates run on `main`](https://github.com/TemporaryOrganization1/PDn-control/actions/runs/28668920944). |
| Frontend build and tests | Yes | Passing. | Frontend build, tests, and coverage run in the [Quality Gates run on `main`](https://github.com/TemporaryOrganization1/PDn-control/actions/runs/28668920944). |
| Crawler-worker typecheck, tests, and coverage | Yes | Passing. | Crawler-worker typecheck, tests, and coverage run in the [Quality Gates run on `main`](https://github.com/TemporaryOrganization1/PDn-control/actions/runs/28668920944). |
| Additional QA check: dependency vulnerability scan | Yes | Passing. | `govulncheck` for Go modules and `npm audit --audit-level=high --omit=dev` for Node packages run in the [Quality Gates run on `main`](https://github.com/TemporaryOrganization1/PDn-control/actions/runs/28668920944). |
| Lychee link checking | Yes, but not the additional QA check. | Passing on the latest protected-branch run. | [Link Checker run on `main`](https://github.com/TemporaryOrganization1/PDn-control/actions/runs/28668922205). |
| Architecture and ADR traceability | Yes for architecture-affecting work after Assignment 5. | Maintained documentation added. | [Architecture documentation](architecture/README.md), [quality requirements](quality-requirements.md), and [Definition of Done](definition-of-done.md). |

## Additional QA Check Rationale

| QA objective or risk | Additional QA check | Scope | Latest result | Evidence | Limitations or follow-up |
|---|---|---|---|---|---|
| Vulnerable dependencies can expose the deployed checker, reports, authentication, crawler workers, or GeoIP service to avoidable security and reliability risks. | Automated dependency vulnerability scanning. | Go modules with `govulncheck`; Node production dependencies with `npm audit --audit-level=high --omit=dev`. | Passing in the latest protected-branch CI run. | [Quality Gates run on `main`](https://github.com/TemporaryOrganization1/PDn-control/actions/runs/28668920944). | Audit results depend on the public vulnerability databases available at run time. Dev dependency findings are reviewed separately from production dependency gates. |

## Link Checker Exclusions

Lychee checks repository Markdown on pull requests and pushes to `main`. Exclusions must stay narrow and documented.

| Excluded link or path | Reason | Manual verification expectation |
|---|---|---|
| `localhost` | Local development links are not reachable from GitHub-hosted CI. | Verify locally when setup/run instructions change. |
| `course_information_swp26` | Course-provided reference material contains external instructional links that are not product evidence. | Keep the course materials readable locally. |
| `node_modules`, `coverage`, `.next` | Generated or dependency directories are not maintained Markdown evidence. | Not applicable. |
| `https://gitlab.pg.innopolis.university/` | External platform link is unsuitable for unauthenticated CI checks. | Verify manually before submission if referenced in public evidence. |
| `https://pdn2.neurolife.tech/` | Product deployment is sometimes unavailable during technical maintenance, causing false CI failures. | Manually open the product URL before submission and record availability in the relevant weekly report. |

## Manual Evidence That Does Not Count as QRT

| Evidence | Scope | Result | Follow-up PBI or issue |
|---|---|---|---|
| Public deployed product smoke access at `https://pdn2.neurolife.tech/`. | Production deployment availability. | Manual smoke check required because the URL is excluded from Lychee during technical maintenance windows. | Track deployment regressions in the Product Backlog if observed. |

## Maintained Gates For Later Work

The `Quality Gates` workflow, the `Link Checker` workflow, the tests added for critical modules, coverage reporting, dependency vulnerability scanning, architecture documentation, ADR links, and this testing document remain active after Assignment 4 and Assignment 5. Later PBIs must keep these checks and maintained artifacts current or replace them with documented equivalent or stronger checks when product scope changes.

## Local Verification Notes

DB-backed report lifecycle tests in `backend/main-backend/internal/auth` are opt-in and run when `TEST_DATABASE_URL` points to a PostgreSQL database. Without that variable they are skipped; pure unit tests still run with `go test ./...`.

If the host shell does not expose `go` or `npm` reliably, verification can be performed through Docker containers:

```bash
docker run --rm -v "${PWD}:/work" -w /work/backend/main-backend golang:1.25 sh -lc "/usr/local/go/bin/gofmt -w internal/store/store_test.go internal/workerpool/pool_test.go internal/api/handlers_test.go && /usr/local/go/bin/go test ./... -covermode=atomic -coverprofile=coverage.out && /usr/local/go/bin/go tool cover -func=coverage.out && /usr/local/go/bin/go run golang.org/x/vuln/cmd/govulncheck@latest ./..."
docker run --rm -v "${PWD}:/work" -w /work/backend/geoip-service golang:1.25 sh -lc "/usr/local/go/bin/gofmt -w internal/downloader/downloader_test.go && /usr/local/go/bin/go test ./... -covermode=atomic -coverprofile=coverage.out && /usr/local/go/bin/go tool cover -func=coverage.out && /usr/local/go/bin/go run golang.org/x/vuln/cmd/govulncheck@latest ./..."
docker run --rm -v "${PWD}:/work" -w /work/frontend node:24-alpine sh -lc "npm ci && npm run check && npm run build && npm test -- --coverage && npm audit --audit-level=high --omit=dev"
docker run --rm -e PUPPETEER_SKIP_DOWNLOAD=true -v "${PWD}:/work" -w /work/backend/crawler-worker node:22 sh -lc "npm ci && npm run typecheck && npm test -- --coverage && npm audit --audit-level=high --omit=dev"
```
