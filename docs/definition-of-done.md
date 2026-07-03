# Definition of Done

This document defines the team's shared minimum completion standard for repository work. A PBI can be marked `Done` only when its issue-specific acceptance criteria and the relevant items below are satisfied.

## Required For Every PBI

- Acceptance criteria are satisfied and verified before merge.
- The work is reviewed by a different team member.
- The PR/MR links the related issue and preserves verification evidence.
- Required CI checks pass before merge, including Quality Gates and Link Checker where applicable.
- Relevant automated tests are added or updated for changed behavior.
- Relevant quality requirements and quality requirement tests are satisfied or explicitly documented as not applicable.
- Verification evidence is preserved in PRs, CI results, reports, or maintained documentation.
- User-visible changes are added to `CHANGELOG.md`, or the PR explains why the changelog is not applicable.

## User Stories And Supporting PBIs

- A user story is `Done` only when all linked supporting PBIs required for its acceptance criteria are also `Done`.
- Supporting PBIs must preserve implementation, review, and verification traceability through linked PRs/MRs and CI evidence.
- Deferred or rejected feedback must remain traceable through an issue, report table, or documented rationale.

## Architecture And ADR Requirements

After Assignment 5, architecture documentation is part of Done for architecture-affecting work.

- Changes that affect service boundaries, deployment, integrations, critical flows, security-sensitive behavior, quality requirements, or runtime configuration update [docs/architecture/README.md](architecture/README.md) and the relevant view source files.
- Important architecture decisions are recorded or updated as ADRs in `docs/architecture/adr/`.
- Relevant quality requirements in [docs/quality-requirements.md](quality-requirements.md) link to the ADRs that address them.
- If architecture documentation is not affected, the PR may state that architecture updates are not applicable.

## Testing And QA Requirements

- Critical modules remain covered according to [docs/testing.md](testing.md).
- Automated QRTs in [docs/quality-requirement-tests.md](quality-requirement-tests.md) remain current and passing.
- Dependency vulnerability scanning remains active as the additional QA check beyond Lychee.
- Link-check exclusions remain narrow, documented, and manually verified when they cover public product evidence.

## Configuration And Sensitive Information

- No secrets, private credentials, raw recordings, private links, or unnecessary PII are committed.
- Runtime configuration changes are reflected in `.env.example`, Docker Compose, deployment docs, or development-process docs as appropriate.
- `.env` and generated/private artifacts remain ignored.
