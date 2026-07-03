# ADR-002: Asynchronous Crawler Workers

**Status:** Accepted

**Date:** 2026-07-03

**Quality requirements addressed:** [QR-001](../../quality-requirements.md#qr-001-scan-dispatch-responsiveness), [QR-003](../../quality-requirements.md#qr-003-invalid-input-protection)

## Context

Website scans may take much longer than a normal HTTP request because the worker opens a browser, loads third-party websites, collects network evidence, performs GeoIP checks, and may call OpenRouter for AI-assisted analysis. Blocking the user request until the scan completes would make the UI feel unavailable and would couple frontend responsiveness to crawler runtime.

## Decision

The main backend accepts a scan request, validates the input and guest/auth state, reserves a worker, creates a task with a `req-id`, and immediately returns an accepted response. A crawler worker processes the scan asynchronously and reports progress back to `POST /api/progress` using the worker secret. The frontend polls `GET /api/progress/{req-id}` until the task is completed or failed.

## Consequences

Users receive quick scan acceptance and progress feedback even when the full crawler workflow is slow. Worker capacity remains explicit through the worker pool, and invalid input can be rejected before crawler resources are consumed. The tradeoff is additional state coordination: progress state, worker release, callback security, and PDF/history persistence must remain consistent.
