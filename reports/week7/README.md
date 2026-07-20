# Week 7 — Sprint 5

This is the public Week 7 report for PDn-control.

## Prior Sprint and Maintained Entry Points

- [Week 6 canonical report](../week6/README.md)
- [Repository README](../../README.md)
- [Contributing guide](../../CONTRIBUTING.md)
- [AI-agent guidance](../../AGENTS.md)
- [Customer handover guide](../../docs/customer-handover.md)
- [Roadmap](../../docs/roadmap.md)
- [Testing and QA status](../../docs/testing.md)
- [User acceptance tests](../../docs/user-acceptance-tests.md)
- [Architecture](../../docs/architecture/README.md)
- [Development process](../../docs/development-process.md)
- [Changelog](../../CHANGELOG.md)
- [Week 7 LLM usage report](llm-report.md)

## Sprint 5 Container

- Product Backlog: https://github.com/orgs/TemporaryOrganization1/projects/2
- Sprint 5 Backlog: https://github.com/orgs/TemporaryOrganization1/projects/7
- Sprint 5 milestone: https://github.com/TemporaryOrganization1/PDn-control/milestone/5?closed=1
- Sprint dates: 13.07.2026 - 19.07.2026
- Sprint size: 13
- Sprint Goal: complete Week 7 transition work needed for the final customer-usable course version, fix pdf-report generation and add subscription plan managemnt

## Current Week 7 Maintenance

The current working tree aligns the public pricing page, profile plan controls, account navigation, and API documentation with the implemented entitlement model: Free remains available without payment, while an authenticated user can activate Paid access for 30 days without automatic renewal. Unsupported checkout and purchase-history placeholder pages have been removed.

Local frontend verification on 2026-07-16 completed lint (with six pre-existing `img` optimization warnings), TypeScript checking, a production build, and Vitest coverage. This is not protected-branch CI or release evidence. The local shell did not expose the Go toolchain; no new Go-test result is claimed.

## Transition and Customer Evidence

- Current public handover level and limitations: see [customer handover](../../docs/customer-handover.md).
- Final customer-confirmation status: Status confirmed that product is ready and only needs access to the repository
- Remaining blockers or support expectations: None

## Customer Feedback and UAT

| Follow-up item | Current repository response | Evidence status |
|---|---|---|
| Make pricing and account-plan navigation match the implemented product | Pricing now describes Free/Paid entitlements and routes Paid activation through the profile; unsupported checkout and purchases pages are removed. | https://github.com/TemporaryOrganization1/PDn-control/issues/29 |
| Week 6 PDF layout follow-up | Outside this tariff/navigation change. | https://github.com/TemporaryOrganization1/PDn-control/issues/172 |

## Final Delivery Evidence Still Required

- Final product access verification: https://pdn2.neurolife.tech/.
- Hosted documentation verification: http://194.87.95.22:8088.
- Final SemVer release mapped to `MVP v3`: https://github.com/TemporaryOrganization1/PDn-control/releases/tag/MVP3.
- Public sanitized demo video: https://drive.google.com/file/d/1P9FkSNjZCICpxHYrX4GpiMOU7cJkfH1m/view?usp=sharing.
- Sprint 5 Review summary/transcript:https://github.com/TemporaryOrganization1/PDn-control/blob/main/reports/week7/sprint-review-summary.md and https://github.com/TemporaryOrganization1/PDn-control/blob/main/reports/week7/sprint-review-transcript.md
- Week 7 reflection: https://github.com/TemporaryOrganization1/PDn-control/blob/main/reports/week7/reflection.md.
- Week 7 retrospective: https://github.com/TemporaryOrganization1/PDn-control/blob/main/reports/week7/retrospective.md.
- Demo Day rehearsal/preparation evidence: The presentation for Demo day is finished and team conducted a rehearsal of it.
- Contribution traceability by team member and inspectable issue/PR/review/test evidence: TODO.
- Sanitized screenshots under `reports/week7/images/`: TODO; no screenshots are claimed in this draft.
