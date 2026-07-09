# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Full worker report payload propagation with screenshot, SSL, country, about, and evidence image IDs
- Local SVG country flags under `frontend/public/flags`
- Report deletion endpoint and history UI action that remove related PDF and image records

### Changed
- Result score now represents check completion quality instead of fine probability
- PDF reports include the new payload data, possible fines, SSL/site info, and evidence image references

### Fixed
- Final worker payloads sent as objects are now normalized and saved by the main backend
- Free report cleanup now removes related PDF files and evidence images

### Removed
- Auth service, user registration, login, and account UI
- Guest check limit that depended on authentication

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
