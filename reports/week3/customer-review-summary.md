# Meeting Week 3 Summary

**Date:** June 19, 2026  
**Duration:** 13 minutes 48 seconds  

---

## Participants

| Role | Name |
| :--- | :--- |
| **Customer** | Mark Petrov |
| **Project Delivery Team** | Ruslan Stetsenko, Lenar Gabdrakhimov, Timur Zainullin, Dinislam Baizigitov |

---

## Purpose of Meeting

Sprint 1 review and demonstration of MVP version 1 progress to the customer.

---

## Artifacts Demonstrated

| Artifact | Description | Status |
| :--- | :--- | :--- |
| **Frontend Application** | Live demo showing website compliance check functionality | Connected to backend, but design criticized |
| **Backend Integration** | Crawlers connected to frontend for real-time checks | Successfully integrated |
| **Authentication Module** | User registration and login functionality | Implemented, but missing email verification |
| **Backlog Board** | Project backlog showing "Done" and "Ready" items | Presented but status workflow unclear |
| **Violations Display** | Showed violations for checked website | Functional |

---

## Scope Reviewed

### Sprint 1 Items Completed

| Task | Status | Notes |
| :--- | :--- | :--- |
| Site compliance check (core) | ✅ Done | Main function working |
| PDF report generation | 🟡 In Progress | Cannot download yet |
| Total possible fine calculation | ✅ Done | Implemented |
| Account creation | ✅ Done | Authentication added |
| AI-powered verification | ✅ Done | Backend AI working |

---

## Implemented Progress Discussed

### What Was Completed
- Backend crawlers successfully connected to frontend
- User authentication system added
- Personal account page created (no history yet)
- AI-powered verification system implemented
- Violations can be opened and viewed

### What Was Not Yet Implemented
- PDF download functionality
- Email verification for registration
- Check history in personal account
- Design improvements

---

## Approvals and Requested Changes

### Approved
- ✅ Backend functionality and core logic
- ✅ AI-powered verification system
- ✅ Authentication system (pending email verification)

### Requested Changes / Rejections
- ❌ **Frontend Design Rejected** – Mark called it "underwhelming" and "weak"
- ❌ **Missing Email Verification** – Required before account creation is complete
- ❌ **Backlog Workflow** – Need to clarify "Done" vs "Ready" statuses

### Recommendations Given
- Switch from **DeepSeek v4** to **Cursor** for development
- Use **Kombai** MCP for design generation
- Implement proper prompting strategy with planning mode
- Contact Misha for SMTP server provisioning

---

## Risks Identified

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Poor UI/UX Design** | Product not sellable; customer dissatisfaction | Switch to Cursor + Kombai as recommended |
| **No Designer on Team** | Design quality remains low | Use MCP tools and better prompting strategies |
| **Missing SMTP Server** | Email verification cannot be implemented | Contact Misha immediately for provisioning |
| **Frontend Tool Choice** | Using inadequate tool (DeepSeek v4) | Migrate to Cursor as suggested by Mark |
| **No Public Deployment** | Customer cannot test the product | Deploy to public URL for customer testing |
| **Unclear Backlog Status** | Confusion about "Done" vs "Ready" | Implement proper review process |

---

## Resulting Backlog or Scope Changes

### New Backlog Items Added

| Item | Priority | Sprint |
| :--- | :--- | :--- |
| Redesign frontend using Cursor + Kombai | High | Sprint 2 |
| Implement email verification with SMTP | High | Sprint 2 |
| Deploy to public hosting environment | High | Sprint 2 |
| Clarify backlog status workflow | Medium | Sprint 2 |

### Existing Backlog Items Updated

| Item | Change | Reason |
| :--- | :--- | :--- |
| Account creation | Scope expanded to include email verification | Customer requirement |
| Frontend development | Complete redesign required | Design rejected by customer |
| PDF generation | Still pending | Not yet functional |

---

## Outcome

- The backend and core functionality were **approved** by Mark
- The frontend design was **rejected** and requires significant improvement
- The team received clear technical recommendations for tools and workflow
- Email verification is now a **mandatory requirement**
- Mark agreed to test the product once deployed to a public URL

**Meeting concluded with no additional questions from the team.**