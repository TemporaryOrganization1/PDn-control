# Quality Requirement Tests

This document defines the automated quality requirement tests (QRTs) for Assignment 4 and later product work. Each QRT directly verifies a measurable scenario from `docs/quality-requirements.md` and runs in the `Quality Gates` CI workflow.

## QRT-001: Scan dispatch responsiveness

**Linked quality requirement:** [QR-001](quality-requirements.md#qr-001-scan-dispatch-responsiveness)

**Verification method:** Automated Go unit-level quality test.

**Test data, setup, or environment:** A `workerpool.Pool` with one available worker under the standard Go CI environment.

**Automated command or CI check:** `go test ./internal/workerpool -run TestQRTWorkerSelectionCompletesWithinThreshold -count=1` in the `Main Backend Go Checks` job.

**Expected measurable result:** `GetFreeWorker` returns an available worker and completes within 50 ms.

**Evidence link:** [Worker pool QRT test](../backend/main-backend/internal/workerpool/pool_test.go); [Quality Gates workflow](https://github.com/TemporaryOrganization1/PDn-control/actions/workflows/quality.yml).

## QRT-002: Crawler type-check feedback

**Linked quality requirement:** [QR-002](quality-requirements.md#qr-002-type-check-feedback-for-crawler-changes)

**Verification method:** Automated TypeScript type-checking CI gate.

**Test data, setup, or environment:** Standard Node 22 CI environment for the crawler-worker package.

**Automated command or CI check:** `npm run typecheck` in the `Crawler Worker Node Checks` job, named `Automated quality requirement test - type-check feedback`.

**Expected measurable result:** The gate completes successfully for valid crawler code and fails the job if TypeScript type or interface errors are present.

**Evidence link:** [Crawler worker TypeScript config](../backend/crawler-worker/tsconfig.json); [Quality Gates workflow](https://github.com/TemporaryOrganization1/PDn-control/actions/workflows/quality.yml).

## QRT-003: Invalid input protection

**Linked quality requirement:** [QR-003](quality-requirements.md#qr-003-invalid-input-protection)

**Verification method:** Automated unit tests for invalid URL and invalid email validation.

**Test data, setup, or environment:** Standard Go CI environment for main-backend and Node 22 CI environment for crawler-worker.

**Automated command or CI check:** `go test ./internal/api -run TestValidEmail -count=1` in `Main Backend Go Checks`; `npm test -- --run tests/runner.test.ts` in `Crawler Worker Node Checks`.

**Expected measurable result:** Invalid email values are rejected by backend validation; invalid target URLs cause `runCheck` to return `Invalid URL` before a browser page is opened.

**Evidence link:** [Backend validation test](../backend/main-backend/internal/api/handlers_test.go); [Crawler invalid URL test](../backend/crawler-worker/tests/runner.test.ts); [Quality Gates workflow](https://github.com/TemporaryOrganization1/PDn-control/actions/workflows/quality.yml).
