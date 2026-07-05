## 1. Project

PDn-control is a website compliance checker for Federal Law No. 152 and related Russian regulations. The public product URL is [https://pdn2.neurolife.tech/](https://pdn2.neurolife.tech/).

## 2. Product Backlog

https://github.com/orgs/TemporaryOrganization1/projects/2/views/1

## 3. Sprint Backlog

https://github.com/orgs/TemporaryOrganization1/projects/5

## 4. Sprint 3 Milestone

https://github.com/TemporaryOrganization1/PDn-control/milestone/3

## 5. Spring
Goal: Improve frontend design and make email verification
Dates: 29.06.2026 - 05.07.2026
Summary: Frontend has to be improved to satisfy customer's vision and email verification is needed for registration.

## 6. Story points

8

## 7. MVP2 changes

Email verification was implemented and 2 versions of frontend design were created.

## 8. Product

https://pdn2.neurolife.tech/](https://pdn2.neurolife.tech/

## 9. Run intructions

No specific intructions

## 10. Customer feedback response table

| Feedback point | Resulting PBI or issue | Status | Response |
|---|---|---|---|
| The site design is underwhelming | https://github.com/TemporaryOrganization1/PDn-control/issues/137 | Done | The design was remade twice, the first one was rejected and the second one os yet to be demonstrated
| Email verification should be implemented | https://github.com/TemporaryOrganization1/PDn-control/issues/104 | Done | The email verification works

## 11. Explanation of feedback not addressed

All feedback points were addressed

## 12. Roadmap

## 13. Definition-of-done

https://github.com/TemporaryOrganization1/PDn-control/blob/main/docs/definition-of-done.md

## 14. Testing

https://github.com/TemporaryOrganization1/PDn-control/blob/main/docs/testing.md

## 15. Quality Requirements

https://github.com/TemporaryOrganization1/PDn-control/blob/main/docs/quality-requirements.md

## 16. Quality tests

https://github.com/TemporaryOrganization1/PDn-control/blob/main/docs/quality-requirement-tests.md

## 17. User Acceptance

https://github.com/TemporaryOrganization1/PDn-control/blob/main/docs/user-acceptance-tests.md

## 18. Development process

https://github.com/TemporaryOrganization1/PDn-control/blob/main/docs/development-process.md

## 19. Architecture README

https://github.com/TemporaryOrganization1/PDn-control/blob/main/docs/architecture/README.md

## 20. View artifacts

- Static view source: [component-diagram.mmd](../../docs/architecture/static-view/component-diagram.mmd)
- Dynamic view source: [scan-sequence.mmd](../../docs/architecture/dynamic-view/scan-sequence.mmd)
- Deployment view source: [deployment-diagram.mmd](../../docs/architecture/deployment-view/deployment-diagram.mmd)

## 21. Part 5: ADRs

- [ADR-001: Docker Compose Service Boundaries](../../docs/architecture/adr/ADR-001-docker-compose-service-boundaries.md)
- [ADR-002: Asynchronous Crawler Workers](../../docs/architecture/adr/ADR-002-asynchronous-crawler-workers.md)
- [ADR-003: Mermaid Maintained Architecture Diagrams](../../docs/architecture/adr/ADR-003-mermaid-maintained-architecture-diagrams.md)

## 22. Summary of architecture

## 23. Explanation of how quality requirements are linked to the architecture decisions

## 24. Testing and CI status summary

## 25. CI pipeline

## 26. Link to the latest protected-default-branch CI run.

## 27. SemVer release

## 28. CHANGELOG

https://github.com/TemporaryOrganization1/PDn-control/blob/main/CHANGELOG.md

## 29. Demo video

## 30. UAT results summary

## 31. Documentation site

http://194.87.95.22:8088/

## 32. Sprint review transcript

https://github.com/TemporaryOrganization1/PDn-control/blob/main/reports/week5/customer-review-transcript.md

## 33. Deviations
None

## 34. Sprint review summary

## 35. Reflection

## 36. Retrospective

## 37. LLM report

## 38. Summary of current product

## 39. Summary of the next steps

## 40. Contribution

## 41. Screenshots

## 42. None

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
