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
