# Week 7 — Sprint 5 Draft Evidence Index

This is the public, sanitized Week 7 report scaffold for PDn-control. It records only inspectable repository facts. Missing Sprint, customer, release, deployment, and presentation evidence remains explicitly marked `TODO`; local implementation work is not treated as customer acceptance or protected-branch CI evidence.

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

- Product Backlog: TODO — add the inspectable board/view link.
- Sprint 5 Backlog: TODO — add the inspectable board/view link.
- Sprint 5 milestone: TODO — add the inspectable milestone link.
- Sprint dates: TODO — confirm from the formal milestone.
- Sprint size: TODO — report committed and completed Story Points from the authoritative board.
- Sprint Goal: complete Week 7 maintenance and transition work needed for the final customer-usable course version.

## Current Week 7 Maintenance

The current working tree aligns the public pricing page, profile plan controls, account navigation, and API documentation with the implemented entitlement model: Free remains available without payment, while an authenticated user can activate Paid access for 30 days without automatic renewal. Unsupported checkout and purchase-history placeholder pages have been removed.

Local frontend verification on 2026-07-16 completed lint (with six pre-existing `img` optimization warnings), TypeScript checking, a production build, and Vitest coverage. This is not protected-branch CI or release evidence. The local shell did not expose the Go toolchain; no new Go-test result is claimed.

## Transition and Customer Evidence

- Current public handover level and limitations: see [customer handover](../../docs/customer-handover.md).
- Final customer-confirmation status: `TODO — not yet accepted in public evidence`.
- What was transferred or delegated in Week 7: TODO — record only after an inspectable transition action occurs.
- Customer-independent use or customer-side operation: TODO — no public evidence currently proves this.
- Remaining blockers or support expectations: TODO — update after final customer confirmation.

## Customer Feedback and UAT

| Follow-up item | Current repository response | Evidence status |
|---|---|---|
| Make pricing and account-plan navigation match the implemented product | Pricing now describes Free/Paid entitlements and routes Paid activation through the profile; unsupported checkout and purchases pages are removed. | Local implementation and tests only; issue/PR and protected-branch evidence TODO. |
| Recheck customer-critical Week 7 behavior | A maintained pricing-flow scenario is listed as UAT-010. | Execution and customer result TODO; do not report acceptance yet. |
| Week 6 PDF layout follow-up | Outside this tariff/navigation change. | TODO — link the responsible issue/PR and rerun the relevant UAT when completed. |

## Final Delivery Evidence Still Required

- Final product access verification: TODO.
- Hosted documentation verification: TODO.
- Final SemVer release mapped to `MVP v3`: TODO.
- Public sanitized demo video: TODO.
- Sprint 5 Review summary/transcript-or-notes: TODO.
- Week 7 reflection: TODO.
- Week 7 retrospective: TODO.
- Demo Day rehearsal/preparation evidence: TODO.
- Contribution traceability by team member and inspectable issue/PR/review/test evidence: TODO.
- Sanitized screenshots under `reports/week7/images/`: TODO; no screenshots are claimed in this draft.

Private identities, credentials, recordings, exact timecodes, customer messages, consent evidence, and private access details must remain in the Week 7 Moodle wrapper rather than this public report.
