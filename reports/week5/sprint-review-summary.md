# Sprint Review Summary

**Project:** PDn-control  
**Sprint:** Sprint 3 / Assignment 5  
**Reviewed increment:** `MVP v2`  
**Date:** 2026-07-04  
**Customer:** Mark Petrov  
**Public transcript:** [sprint-review-transcript.md](sprint-review-transcript.md)

## Sprint Goal Reviewed

The Sprint Goal was to improve the customer-facing product experience and add email verification. The team also prepared Assignment 5 evidence: architecture documentation, ADRs, testing and CI documentation, hosted documentation, UAT evidence, and release artifacts.

## Delivered Increment Discussed

The team demonstrated the remade frontend, account registration with email verification, profile/account area, check results, check history, and PDF report access. The customer saw the registration flow where an email is sent, a verification link is opened, and the account becomes available after verification.

## UAT Results

Email verification passed during the customer session. The profile/account access flow was demonstrated after verification. The PDF report functionality was discussed at the end of the meeting and the customer accepted the UAT point verbally.

## Customer Feedback

The strongest feedback was about visual design. The customer said that the product still felt like a student project rather than a polished SaaS product and asked the team to improve the color palette, call-to-action hierarchy, layout, and visual presentation. The customer recommended looking at SaaS/dark landing references and using a coherent palette instead of a plain black-and-white layout.

The customer also reacted positively to the idea of adding visual evidence to reports and scan results, such as screenshots showing the exact page element related to a detected issue. This was accepted as valuable follow-up functionality.

## Architecture And Process Evidence Discussed

The Sprint also introduced maintained architecture documentation, ADRs, development-process documentation, configuration-management documentation, updated testing documentation, and a hosted documentation site. These artifacts support future changes by making service boundaries, asynchronous crawler behavior, deployment structure, and quality requirements easier to inspect.

## Resulting Backlog Updates

| Follow-up | Reason | Status |
|---|---|---|
| Improve visual design and landing page presentation | Customer requested a more polished SaaS-style design and clearer product packaging. | Next Sprint candidate |
| Add visual evidence to scan results/reports | Customer liked the value of showing where a detected issue appears on the checked site. | Next Sprint candidate |
| Continue total possible fine calculation | Existing open product work remains valuable for users. | Open |
| Keep architecture and QA evidence current | Assignment 5 introduced maintained architecture/process/testing assets. | Ongoing Definition of Done item |

## Remaining Risks

The main product risk is presentation quality: the functional product exists, but the customer may not trust or want to use it if the interface does not communicate value clearly. The main engineering risk is keeping the frontend, backend, crawler result format, and report generation contract aligned as visual evidence and fine calculation are added.
