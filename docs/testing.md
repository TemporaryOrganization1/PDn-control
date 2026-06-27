# Testing and QA Status

This document is the maintained testing status artifact for Assignment 4 Part 7 and later product work. The minimum required automated line coverage for each critical module is 30%.

## Critical Modules and Coverage

| Critical module | Why critical | Required line coverage | Current line coverage | Evidence |
|---|---|---:|---:|---|
| `backend/main-backend/internal/store/store.go` | Tracks scan progress, results, report IDs, and guest request limits. | 30% | 73.3% | `go test ./... -covermode=atomic -coverprofile=coverage.out` in `backend/main-backend`; `go tool cover -func=coverage.out`. |
| `backend/main-backend/internal/workerpool/pool.go` | Selects crawler workers, enforces worker capacity, and dispatches scan tasks. | 30% | 91.1% | `go test ./... -covermode=atomic -coverprofile=coverage.out` in `backend/main-backend`; `go tool cover -func=coverage.out`. |
| `backend/geoip-service/internal/downloader/downloader.go` | Downloads and stores the GeoIP database used by jurisdiction checks. | 30% | 66.7% package coverage; `DownloadMMDB` 71.0%. | `go test ./... -covermode=atomic -coverprofile=coverage.out` in `backend/geoip-service`; `go tool cover -func=coverage.out`. |
| `frontend/src/api.js` | Normalizes scan requests, handles API errors, and calculates displayed risk score. | 30% | 61.13% | `npm test -- --coverage` in `frontend`. |
| `backend/crawler-worker/src/url.ts` | Normalizes target domains used by crawler checks. | 30% | 94.44% | `npm test -- --coverage` in `backend/crawler-worker`. |
| `backend/crawler-worker/src/checks/https.ts` | Detects insecure HTTP endpoints during scans. | 30% | 100% | `npm test -- --coverage` in `backend/crawler-worker`. |
| `backend/crawler-worker/src/checks/ssl.ts` | Detects self-signed or insecure SSL/TLS endpoints during scans. | 30% | 97.22% | `npm test -- --coverage` in `backend/crawler-worker`. |

Global repository coverage is lower because command entrypoints, DB-backed stores, PDF rendering, UI pages, and full browser crawler flows are not yet fully automated. The Assignment 4 threshold is enforced for the listed critical modules.

## Automated Test Status

| Test type | Scope | Command or CI check | Latest result | Evidence |
|---|---|---|---|---|
| Unit tests | Guest quota, task state, URL parsing, frontend API helpers, result scoring. | `go test ./...`, `npm test -- --coverage` | Passing locally via Docker. | GitHub Actions `Quality Gates` workflow and local Docker runs. |
| Integration tests | Worker pool HTTP dispatch with `httptest`; GeoIP MMDB download with `httptest`; crawler check subscriptions with fake request/response objects. | `go test ./...`, `npm test -- --coverage` | Passing locally via Docker. | GitHub Actions `Quality Gates` workflow and local Docker runs. |
| Automated QRTs | QR-001, QR-002, and QR-003 candidates are covered by build, test, and CI checks; formal QRT traceability is maintained in `docs/quality-requirement-tests.md` when updated. | `Quality Gates` workflow | Pending protected-branch CI evidence. | [Quality Gates workflow](https://github.com/TemporaryOrganization1/PDn-control/actions/workflows/quality.yml). |

## CI and QA Check Status

| Gate or check | Required for Done? | Latest protected-branch status | Evidence |
|---|---|---|---|
| Go formatting check | Yes | Pending next `main` run. | [Quality Gates workflow](https://github.com/TemporaryOrganization1/PDn-control/actions/workflows/quality.yml). |
| Go static analysis (`go vet`) | Yes | Pending next `main` run. | [Quality Gates workflow](https://github.com/TemporaryOrganization1/PDn-control/actions/workflows/quality.yml). |
| Go tests and coverage | Yes | Passing locally via Docker. Pending protected-branch run. | `backend/main-backend/coverage.out`, `backend/geoip-service/coverage.out` generated locally; CI uploads coverage artifacts. |
| Frontend build and tests | Yes | Passing locally via Docker. Pending protected-branch run. | `npm run build`; `npm test -- --coverage`. |
| Crawler-worker typecheck, tests, and coverage | Yes | Passing locally via Docker. Pending protected-branch run. | `npm run typecheck`; `npm test -- --coverage`. |
| Additional QA check: dependency vulnerability scan | Yes | Passing locally via Docker. Pending protected-branch run. | `govulncheck` for Go modules; `npm audit --audit-level=high --omit=dev` for Node packages. |
| Lychee link checking | Yes, but not the additional QA check. | Existing workflow. | [Link Checker workflow](https://github.com/TemporaryOrganization1/PDn-control/actions/workflows/link-check.yml). |

## Additional QA Check Rationale

| QA objective or risk | Additional QA check | Scope | Latest result | Evidence | Limitations or follow-up |
|---|---|---|---|---|---|
| Vulnerable dependencies can expose the deployed checker, reports, authentication, crawler workers, or GeoIP service to avoidable security and reliability risks. | Automated dependency vulnerability scanning. | Go modules with `govulncheck`; Node production dependencies with `npm audit --audit-level=high --omit=dev`. | Passing locally after upgrading Go services to Go 1.25 and updating vulnerable Go dependencies. | `Quality Gates` workflow. | Audit results depend on the public vulnerability databases available at run time. Dev dependency findings are reviewed separately from production dependency gates. |

## Manual Evidence That Does Not Count as QRT

| Evidence | Scope | Result | Follow-up PBI or issue |
|---|---|---|---|
| Public deployed product smoke access at `https://pdn2.neurolife.tech/`. | Production deployment availability. | Page loads as the FZ-152 checker. | Track deployment regressions in the Product Backlog if observed. |

## Maintained Gates For Later Work

The `Quality Gates` workflow, the tests added for critical modules, coverage reporting, dependency vulnerability scanning, and this testing document remain active after Assignment 4. Later PBIs must keep these checks passing or replace them with documented equivalent or stronger checks when product scope changes.

## Local Verification Notes

The host shell used for this update did not expose `go` or `npm` in `PATH`, so verification was performed through Docker containers:

```bash
docker run --rm -v "${PWD}:/work" -w /work/backend/main-backend golang:1.25 sh -lc "/usr/local/go/bin/gofmt -w internal/store/store_test.go internal/workerpool/pool_test.go internal/api/handlers_test.go && /usr/local/go/bin/go test ./... -covermode=atomic -coverprofile=coverage.out && /usr/local/go/bin/go tool cover -func=coverage.out && /usr/local/go/bin/go run golang.org/x/vuln/cmd/govulncheck@latest ./..."
docker run --rm -v "${PWD}:/work" -w /work/backend/geoip-service golang:1.25 sh -lc "/usr/local/go/bin/gofmt -w internal/downloader/downloader_test.go && /usr/local/go/bin/go test ./... -covermode=atomic -coverprofile=coverage.out && /usr/local/go/bin/go tool cover -func=coverage.out && /usr/local/go/bin/go run golang.org/x/vuln/cmd/govulncheck@latest ./..."
docker run --rm -v "${PWD}:/work" -w /work/frontend node:20-alpine sh -lc "npm ci && npm run build && npm test -- --coverage && npm audit --audit-level=high --omit=dev"
docker run --rm -e PUPPETEER_SKIP_DOWNLOAD=true -v "${PWD}:/work" -w /work/backend/crawler-worker node:22 sh -lc "npm ci && npm run typecheck && npm test -- --coverage && npm audit --audit-level=high --omit=dev"
```
