# Week 4 Report: Part 7 Testing and QA Evidence

This partial Week 4 report indexes the public evidence created for Assignment 4 Part 7. Other Week 4 report sections are intentionally outside this implementation scope.

## Product

PDn-control is a website compliance checker for Federal Law No. 152 and related Russian regulations.

- Deployed product: [https://pdn2.neurolife.tech/](https://pdn2.neurolife.tech/)
- Testing status artifact: [docs/testing.md](../../docs/testing.md)
- Quality gates workflow: [Quality Gates](https://github.com/TemporaryOrganization1/PDn-control/actions/workflows/quality.yml)
- Link checking workflow: [Link Checker](https://github.com/TemporaryOrganization1/PDn-control/actions/workflows/link-check.yml)

## Part 7 Testing Summary

Automated tests were added for critical product logic and important component interactions:

| Area | Test evidence |
|---|---|
| Main backend guest quota, task state, and worker dispatch | `backend/main-backend/internal/store/store_test.go`, `backend/main-backend/internal/workerpool/pool_test.go`, `backend/main-backend/internal/api/handlers_test.go` |
| GeoIP downloader interaction | `backend/geoip-service/internal/downloader/downloader_test.go` |
| Frontend API request/error/risk-score logic | `frontend/src/api.test.js` |
| Crawler URL parsing, HTTPS/SSL checks, and invalid-run orchestration | `backend/crawler-worker/tests/` |

Critical modules meet the 30% line coverage threshold documented in [docs/testing.md](../../docs/testing.md).

## Part 4 Quality Requirement Test Summary

Automated quality requirement tests are maintained in [docs/quality-requirement-tests.md](../../docs/quality-requirement-tests.md) and run in the [Quality Gates](https://github.com/TemporaryOrganization1/PDn-control/actions/workflows/quality.yml) workflow.

| QRT | Linked QR | Automated evidence |
|---|---|---|
| QRT-001 Scan dispatch responsiveness | QR-001 Time behaviour | `go test ./internal/workerpool -run TestQRTWorkerSelectionCompletesWithinThreshold -count=1` |
| QRT-002 Crawler type-check feedback | QR-002 Analysability | `npm run typecheck` in the crawler-worker CI job |
| QRT-003 Invalid input protection | QR-003 User error protection | `go test ./internal/api -run TestValidEmail -count=1`; `npm test -- --run tests/runner.test.ts` |

## Screenshot Items 18-24 Evidence

### 18. Quality model and selected ISO/IEC 25010 sub-characteristics

The project uses the ISO/IEC 25010 quality model. The Assignment 4 quality requirements use three different sub-characteristics: Time behaviour ([QR-001](../../docs/quality-requirements.md#qr-001-scan-dispatch-responsiveness)), Analysability ([QR-002](../../docs/quality-requirements.md#qr-002-type-check-feedback-for-crawler-changes)), and User error protection ([QR-003](../../docs/quality-requirements.md#qr-003-invalid-input-protection)).

### 19. Testing status summary

Critical modules and current line coverage are documented in [docs/testing.md](../../docs/testing.md#critical-modules-and-coverage). The current critical-module coverage values are: main-backend store 73.3%, main-backend workerpool 91.1%, GeoIP downloader 66.7%, frontend API helpers 61.13%, crawler URL parsing 94.44%, crawler HTTPS check 100%, and crawler SSL/TLS check 97.22%.

### 20. Links to unit tests

- [Main backend store tests](../../backend/main-backend/internal/store/store_test.go)
- [Main backend API helper tests](../../backend/main-backend/internal/api/handlers_test.go)
- [Frontend API helper tests](../../frontend/src/api.test.js)
- [Crawler URL and runner tests](../../backend/crawler-worker/tests/)

### 21. Links to integration tests

- [Worker pool HTTP dispatch integration test](../../backend/main-backend/internal/workerpool/pool_test.go)
- [GeoIP downloader HTTP integration test](../../backend/geoip-service/internal/downloader/downloader_test.go)
- [Crawler HTTPS/SSL subscription interaction tests](../../backend/crawler-worker/tests/checks.test.ts)

### 22. Links to automated quality requirement tests

- [Quality requirement test definitions](../../docs/quality-requirement-tests.md)
- [QRT-001 workerpool test](../../backend/main-backend/internal/workerpool/pool_test.go)
- [QRT-002 crawler type-check gate](../../backend/crawler-worker/tsconfig.json)
- [QRT-003 invalid input tests](../../backend/main-backend/internal/api/handlers_test.go) and [crawler runner test](../../backend/crawler-worker/tests/runner.test.ts)

### 23. Link to the CI pipeline

[Quality Gates CI pipeline](https://github.com/TemporaryOrganization1/PDn-control/actions/workflows/quality.yml)

### 24. Link to the latest protected-default-branch CI run

[Latest successful Quality Gates run on `main`](https://github.com/TemporaryOrganization1/PDn-control/actions/runs/28302778949)

## Additional QA Check Options Considered

| Option | Assessment |
|---|---|
| Dependency vulnerability scanning | Selected because the product has public web services, auth/session handling, crawler workers, and external dependency-heavy stacks. |
| Static analysis beyond compiler/typechecker | Partially covered by `go vet`; useful later with a dedicated JS linter, but not selected as the distinct Assignment 4 QA check. |
| Accessibility checking | Valuable for the React frontend, but browser-based accessibility automation is deferred until a stable component/E2E test setup exists. |
| API contract checking | Useful for OpenAPI drift, but deferred because the immediate risk found during implementation was dependency security. |
| Performance testing | Useful for scan latency, but deferred because deterministic browser/network performance tests require more controlled fixtures. |

Link checking is intentionally not counted as the additional QA check because Assignment 4 forbids using Lychee or any link checker for that role.

## Selected Additional QA Check

The selected additional QA check is automated dependency vulnerability scanning:

- Go modules: `go run golang.org/x/vuln/cmd/govulncheck@latest ./...`
- Node production dependencies: `npm audit --audit-level=high --omit=dev`

This check runs in `.github/workflows/quality.yml` on pull requests and pushes to `main`.

## QA Objective And Risk

The objective is to detect vulnerable dependencies before they reach the protected default branch. This matters because PDn-control accepts URLs from users, manages authentication/session state, stores generated reports, uses crawler workers, and serves a public deployment. A vulnerable dependency in these paths can create avoidable security, privacy, reliability, or availability risk.

During implementation, the Go vulnerability scan found reachable vulnerabilities in older `pgx` and Echo-related transitive dependencies. The Go services were upgraded to Go 1.25 and safer dependency versions; the scan then reported no vulnerabilities.

## Limitations And Deferred QA Work

- The latest protected-default-branch CI result must be captured after this branch is merged or opened as a PR.
- Browser E2E and accessibility checks are deferred; current frontend automation covers API helper logic and build integrity.
- Global repository coverage is lower than critical-module coverage because DB-backed stores, PDF rendering, full UI pages, and full live-browser crawler flows remain only partially automated.
- Dependency audit results depend on the public vulnerability databases available when CI runs.
