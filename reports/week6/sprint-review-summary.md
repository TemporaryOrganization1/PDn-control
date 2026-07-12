# Sprint Review Summary

**Project:** PDn-control  
**Sprint:** Sprint 4 / Assignment 6  
**Reviewed increment:** `MVP v2` (continued)  
**Date:** 2026-07-11  
**Customer:** Mark Petrov  
**Public transcript:** [sprint-review-transcript.md](sprint-review-transcript.md)

---

## Sprint Goal Reviewed

The Sprint Goal was to improve visual design based on previous customer feedback, finalize the PDF report functionality, add risk-scoring and total fine calculation, and prepare for project handover. The team also needed to address UAT sign-off and discuss monetization strategy.

---

## Delivered Increment Discussed

The team demonstrated the redesigned frontend with a significantly improved visual appearance. The customer positively acknowledged the progress, noting the design now looks "like a product" compared to earlier versions. The team also showed:

- Email verification flow (functional)
- Screenshot evidence in scan results
- PDF report generation (in progress, needs refinement)
- Input validation (only websites can be entered)

---

## UAT Results

The customer formally accepted the following UAT criteria during the meeting:

| Criteria | Status |
|---|---|
| Screenshot evidence visible in scan results | ✅ Accepted |
| Validation prevents entering non-website input | ✅ Accepted |

The customer verbally confirmed acceptance of these points.

---

## Customer Feedback

### Positive
The customer expressed clear satisfaction with the design improvements:
- *"Now I like the design more."*
- *"This looks like a product."*
- *"It's something more interesting."*

The customer acknowledged teams' use of AI for the redesign and noted the difference between earlier versions and the current state.

### Areas for Improvement
1. **PDF report formatting** – The customer noticed layout shifting issues and requested: *"Make pretty pdf-generator."*
2. **Monetization / subscription logic** – The customer advised:
   - Limiting *check depth* (e.g., only 1 criterion or hide full results) rather than limiting number of checks
   - The team should propose one coherent variant rather than multiple options
3. **Remaining work** – The customer summarized: *"Finish sanding. Make pretty pdf-generator, add subscription and that's it."*

---
t
## Handover Discussion

The team asked about project transfer requirements. The customer responded:
- Transfer via ZIP file or add Michael to the repository
- The team may remain on the repository (no need to leave)

The team confirmed they planned to grant repository access to the customer.

---

## Architecture And Process Evidence Discussed

Documentation was briefly mentioned. The customer indicated it is sufficient for academic purposes: *"If you need it for your assignment then it's okay already."*

---

## Resulting Backlog Updates

| Follow-up | Reason | Status |
|---|---|---|
| Polish PDF report formatting | Customer noted shifting/layout issues | **Current Sprint priority** |
| Design and propose subscription/freemium model | Customer requires monetization logic for MVP | **Current Sprint priority** |
| Complete handover (repository access) | Project transfer preparation | **Current Sprint priority** |
| Keep screenshots and validation working | Already accepted, maintain as-is | Ongoing |

---

## Remaining Risks

| Risk | Description |
|---|---|
| **PDF quality** | The report is the main deliverable artifact; poor formatting may reduce perceived product quality |
| **Subscription logic definition** | Team needs to design a clear freemium model and get customer approval before implementation |
| **Time management** | With handover approaching, remaining polish must be completed efficiently |

---

## Key Takeaways

- The design turnaround from the previous sprint was successful and well-received
- The team demonstrated responsiveness to customer feedback
- The product is now perceived as approaching a real product
- Final sprint should focus on polish, monetization, and handover readiness