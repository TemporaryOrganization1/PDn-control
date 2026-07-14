# ADR-004: Server-Side Scan Entitlements

## Status

Accepted

## Context

The product has free and paid plans, but the crawler previously used one hard-coded AI budget and always created screenshots and PDF reports. Client-side hiding would not prevent callers or workers from requesting paid artifacts directly. Scan behavior must also remain stable when a plan expires while a long-running scan is in progress.

## Decision

The main backend derives an immutable `ScanProfile` when `/api/check` accepts a task. The profile controls AI exploration, detail level, PDF generation, and image capture. It is stored with task state and persisted with authenticated history. The worker receives only the server-derived limits, while the backend sanitizes callbacks and rejects image uploads that contradict the profile.

Free usage is counted in PostgreSQL over an exact rolling 30-day window. Guests use a random HttpOnly cookie whose hash is stored as the quota subject; authenticated users use their internal user ID. Paid scans bypass the quota.

## Consequences

- Guest and free scans have the same scan quality and cannot create PDF or screenshot artifacts.
- Paid artifacts remain associated with the paid-origin scan after the account later returns to free.
- Unknown or unvisited AI categories are reported as `unknown`, not as successful checks.
- Internal worker payloads and public progress/history payloads now include explicit entitlement metadata.
- Real payment processing remains outside this decision. Until it is integrated, an authenticated profile can activate a server-persisted Paid plan for 30 days; the payment provider must replace this self-service transition later.
