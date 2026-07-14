# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Server-derived free/paid scan profiles with 3/10 AI exploration budgets
- PostgreSQL-backed rolling 30-day quota for guests and free accounts
- Explicit `unknown` status for AI categories not fully evaluated
- Paid-only PDF and screenshot entitlement enforcement across backend, worker, and frontend
- Full worker report payload propagation with screenshot, SSL, country, about, and evidence image IDs
- Local SVG country flags under `frontend/public/flags`
- Report deletion endpoint and history UI action that remove related PDF and image records

### Changed
- Free results now expose a concise summary without URLs, infrastructure details, images, or PDF artifacts
- Categories that were not evaluated are omitted from visible result counters and check cards while remaining non-successful internally
- Paid-origin history and artifacts retain their scan-time entitlement after later plan changes
- Authenticated users can temporarily activate a server-persisted Paid plan for 30 days from the profile until payment-provider integration is completed
- Result score now represents check completion quality instead of fine probability
- PDF reports include the new payload data, possible fines, SSL/site info, and evidence image references
- Public repository entry points now include current product access, hosted documentation, customer handover, contributor, and AI-agent guidance

### Fixed
- Final worker payloads sent as objects are now normalized and saved by the main backend
- Free report cleanup now removes related PDF files and evidence images
- Crawler containers now use a Puppeteer-matched Chrome for Testing build instead of an unpinned distribution Chromium that could crash during startup
- Crawler startup closes its browser probe and reports initialization failures with a non-zero exit code

### Deprecated
- `/api/guest/remaining` and `GUEST_LIMIT`; use `/api/usage` and the new Free quota configuration

### Removed
- In-memory/IP-based quota as the authoritative scan-limit mechanism

## [1.0.0] - 2026-06-21

### Added
- Issue templates
- User-story index
- (Core feature) Checking website for complience with the law FL-152

### Changed
- Some user stories

### Deprecated

### Removed

### Fixed

### Security

## [1.1.0] - 2026-06-28

### Added
- PDF report generation
- User history
- Auto tests and user acceptance tests

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [2.0.0] - 2026-07-05

### Added
- Email Verification
- New website design
- More tests and documentation of separate site

### Changed

### Deprecated

### Removed

### Fixed
- Several bug fixs

### Security

## [2.1.0] - 2026-07-12

### Added
- Total fine calculation
- Risk scoring
- Flags for countries
- Real-time log-journal during the check

### Changed

### Deprecated

### Removed

### Fixed
- A few minor fixes

### Security
