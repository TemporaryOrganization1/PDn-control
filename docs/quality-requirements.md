# Quality Requirements

The project uses ISO/IEC 25010 quality sub-characteristics to define measurable quality requirements. These requirements and their linked automated quality requirement tests are maintained product assets starting in Assignment 4.

Starting in Assignment 5, each relevant quality requirement also links to architecture decisions that address or constrain it.

- [QR-001: Scan dispatch responsiveness](#qr-001-scan-dispatch-responsiveness)
- [QR-002: Type-check feedback for crawler changes](#qr-002-type-check-feedback-for-crawler-changes)
- [QR-003: Invalid input protection](#qr-003-invalid-input-protection)
- [QR-004: Server-enforced scan entitlements](#qr-004-server-enforced-scan-entitlements)

## QR-001: Scan dispatch responsiveness

**ISO/IEC 25010 sub-characteristic:** Time behaviour

**Scenario:** When the main backend selects an available crawler worker under the standard CI test environment, the worker pool shall reserve and return the worker within 50 ms.

**Why this matters:** Users need quick feedback after submitting a compliance check. Slow internal dispatch delays scan acceptance and makes the product feel unavailable even when workers exist.

**Linked quality requirement tests:** [QRT-001](quality-requirement-tests.md#qrt-001-scan-dispatch-responsiveness)

**Related architecture decisions:** [ADR-001](architecture/adr/ADR-001-docker-compose-service-boundaries.md), [ADR-002](architecture/adr/ADR-002-asynchronous-crawler-workers.md)

## QR-002: Type-check feedback for crawler changes

**ISO/IEC 25010 sub-characteristic:** Analysability

**Scenario:** When a developer opens or updates a pull request under the CI environment, the crawler-worker TypeScript gate shall analyze the crawler code and fail the build when type or interface errors are detected.

**Why this matters:** The crawler coordinates browser automation, URL parsing, and compliance checks. Fast type feedback helps developers diagnose interface mistakes before they reach the deployed workers.

**Linked quality requirement tests:** [QRT-002](quality-requirement-tests.md#qrt-002-crawler-type-check-feedback)

**Related architecture decisions:** [ADR-003](architecture/adr/ADR-003-mermaid-maintained-architecture-diagrams.md)

## QR-003: Invalid input protection

**ISO/IEC 25010 sub-characteristic:** User error protection

**Scenario:** When a user or caller submits invalid website or identity input under the standard automated test environment, the product shall reject the invalid input without starting downstream scan work or accepting malformed identity data.

**Why this matters:** Clear rejection of invalid input prevents wasted crawler capacity, misleading scan status, and account data quality problems.

**Linked quality requirement tests:** [QRT-003](quality-requirement-tests.md#qrt-003-invalid-input-protection)

**Related architecture decisions:** [ADR-001](architecture/adr/ADR-001-docker-compose-service-boundaries.md), [ADR-002](architecture/adr/ADR-002-asynchronous-crawler-workers.md)

## QR-004: Server-enforced scan entitlements

**ISO/IEC 25010 sub-characteristic:** Integrity

**Scenario:** When a Guest or Free scan is accepted, backend and crawler-worker shall enforce the immutable summary profile even if the legacy client check type or an invalid worker payload requests broader capabilities; the stored result shall contain no PDF/image evidence and unexamined AI categories shall remain `unknown`.

**Why this matters:** Subscription boundaries must not depend on editable browser state, and a shallow scan must not claim compliance for categories it did not examine.

**Linked quality requirement tests:** [QRT-004](quality-requirement-tests.md#qrt-004-scan-entitlement-enforcement)

**Related architecture decisions:** [ADR-002](architecture/adr/ADR-002-asynchronous-crawler-workers.md), [ADR-004](architecture/adr/ADR-004-server-side-scan-entitlements.md)
