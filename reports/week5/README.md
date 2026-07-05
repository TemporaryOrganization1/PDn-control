# Week 5 Partial Report: Assignment 5 Parts 3-6

This is a partial public evidence index for Assignment 5. It covers Part 3, Part 4, Part 5, Part 6, and the repository-hosted implementation for Part 11: development process, configuration management, architecture documentation, ADRs, testing/QA, Definition of Done, and the requested link-checker exclusion for the deployed product URL.

Full Assignment 5 release, product deployment update, UAT, Sprint Review, retrospective, reflection, demo video, and Moodle-private evidence are outside this partial update.

## Project

PDn-control is a website compliance checker for Federal Law No. 152 and related Russian regulations. The public product URL is [https://pdn2.neurolife.tech/](https://pdn2.neurolife.tech/).

## Part 3: Development Process And Configuration Management

- Maintained process artifact: [docs/development-process.md](../../docs/development-process.md)
- Sanitized configuration example: [`.env.example`](../../.env.example)
- Root setup and documentation index: [README.md](../../README.md)

The development process artifact documents the GitHub issue/PR workflow, Work Status values, Mermaid `gitGraph`, review/merge expectations, CI gates, reproducible development environment, and configuration/secrets-management rules.

## Part 4: Architecture Documentation

- Architecture index: [docs/architecture/README.md](../../docs/architecture/README.md)
- Static view source: [component-diagram.mmd](../../docs/architecture/static-view/component-diagram.mmd)
- Dynamic view source: [scan-sequence.mmd](../../docs/architecture/dynamic-view/scan-sequence.mmd)
- Deployment view source: [deployment-diagram.mmd](../../docs/architecture/deployment-view/deployment-diagram.mmd)

The architecture documentation covers the current Next.js/nginx frontend, Go main backend, PostgreSQL persistence, Node/Puppeteer crawler workers, OpenRouter integration, GeoIP service, SMTP email verification, PDF report storage, and Docker Compose deployment model.

## Part 5: ADRs

- [ADR-001: Docker Compose Service Boundaries](../../docs/architecture/adr/ADR-001-docker-compose-service-boundaries.md)
- [ADR-002: Asynchronous Crawler Workers](../../docs/architecture/adr/ADR-002-asynchronous-crawler-workers.md)
- [ADR-003: Mermaid Maintained Architecture Diagrams](../../docs/architecture/adr/ADR-003-mermaid-maintained-architecture-diagrams.md)

Quality requirement links to ADRs are maintained in [docs/quality-requirements.md](../../docs/quality-requirements.md).

## Part 6: Testing, QA, And Definition Of Done

- Testing and QA status: [docs/testing.md](../../docs/testing.md)
- Quality requirements: [docs/quality-requirements.md](../../docs/quality-requirements.md)
- Quality requirement tests: [docs/quality-requirement-tests.md](../../docs/quality-requirement-tests.md)
- Definition of Done: [docs/definition-of-done.md](../../docs/definition-of-done.md)
- Quality Gates workflow: [Quality Gates](https://github.com/TemporaryOrganization1/PDn-control/actions/workflows/quality.yml)
- Link Checker workflow: [Link Checker](https://github.com/TemporaryOrganization1/PDn-control/actions/workflows/link-check.yml)

Assignment 4 quality gates remain active. The Definition of Done now explicitly requires relevant architecture documentation and ADR updates after architecture documentation has been introduced.

## Link Checker Exclusion

The deployed product URL `https://pdn2.neurolife.tech/` is excluded narrowly from Lychee because it can be temporarily unavailable during technical maintenance. The exclusion is documented in [docs/testing.md](../../docs/testing.md), and the link should be manually checked before final Assignment 5 submission.

## Hosted Documentation Site Status

Part 11 is implemented as a lightweight self-hosted documentation viewer:

- Documentation site source and run instructions: [docs-site/README.md](../../docs-site/README.md)
- Documentation site server: [docs-site/server.py](../../docs-site/server.py)
- Maintained documentation served by the site: [docs/](../../docs/)

The viewer can be deployed on a separate weak server by cloning the repository and running:

```bash
python3 docs-site/server.py --host 0.0.0.0 --port 8088
```

It serves only the maintained documentation and does not start the main product Docker Compose stack. After deployment, the public hosted URL should be added here and to the `MVP v2` SemVer release.
