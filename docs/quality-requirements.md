# Quality Requirements

The project uses ISO/IEC 25010 quality sub-characteristics to define measurable quality requirements. These requirements and their linked automated quality requirement tests are maintained product assets starting in Assignment 4.

## QR-001: Scan dispatch responsiveness

**ISO/IEC 25010 sub-characteristic:** Time behaviour

**Scenario:** When the main backend selects an available crawler worker under the standard CI test environment, the worker pool shall reserve and return the worker within 50 ms.

**Why this matters:** Users need quick feedback after submitting a compliance check. Slow internal dispatch delays scan acceptance and makes the product feel unavailable even when workers exist.

**Linked quality requirement tests:** [QRT-001](quality-requirement-tests.md#qrt-001-scan-dispatch-responsiveness)

## QR-002: Type-check feedback for crawler changes

**ISO/IEC 25010 sub-characteristic:** Analysability

**Scenario:** When a developer opens or updates a pull request under the CI environment, the crawler-worker TypeScript gate shall analyze the crawler code and fail the build when type or interface errors are detected.

**Why this matters:** The crawler coordinates browser automation, URL parsing, and compliance checks. Fast type feedback helps developers diagnose interface mistakes before they reach the deployed workers.

**Linked quality requirement tests:** [QRT-002](quality-requirement-tests.md#qrt-002-crawler-type-check-feedback)

## QR-003: Invalid input protection

**ISO/IEC 25010 sub-characteristic:** User error protection

**Scenario:** When a user or caller submits invalid website or identity input under the standard automated test environment, the product shall reject the invalid input without starting downstream scan work or accepting malformed identity data.

**Why this matters:** Clear rejection of invalid input prevents wasted crawler capacity, misleading scan status, and account data quality problems.

**Linked quality requirement tests:** [QRT-003](quality-requirement-tests.md#qrt-003-invalid-input-protection)
