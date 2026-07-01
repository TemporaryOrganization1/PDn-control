# Meeting Week 4 Summary

**Date:** June 27, 2026  
**Duration:** 18 minutes 15 seconds  

---

## Participants

| Role | Name |
| :--- | :--- |
| **Customer** | Mark Petrov |
| **Project Delivery Team** | Ruslan Stetsenko, Lenar Gabdrakhimov, Egor Oleshko |

---

## Purpose of Meeting

Sprint 2 review and demonstration of progress ot customer.

---

## Artifacts Demonstrated

| Artifact | Description | Status |
| :--- | :--- | :--- |
| **Frontend application** | Main page with URL input, scan initiation, and report view | Connected to backend, but design criticized |
| **Backend Integration** | Crawlers connected to frontend for real-time checks | Successfully integrated |
| **Authentication Module** | User registration and login functionality | Implemented, but missing email verification |
| **PDF report** | User can download and view PDF report of compliance checks | Functional
| **Violations Display** | Showed violations for checked website | Functional |
| **Guest Usage Limit** | Three free checks without registration | Implemented and demonstrated |
| **History of Verifications** | Personal account with past scans and downloadable reports | During meeting worked only on localhost, now works on the deployed website |

---

## Scope Reviewed

### Sprint 2 Items Completed

| Task | Status | Notes |
| :--- | :--- | :--- |
| PDF report generation | ✅ Done | Report can be viewed and downloaded |
| User registration (basic) | ✅ Done | Missing email verification |
| Guest attempt limit (3 scans) | ✅ Done | After limit, user must login/register |
| Fine calculation | 🟡 In Progress | Planned to be done on the next sprint |
| Risk scoring | 🟡 In Progress | Displays random numbers, not real scoring |
| History of verifications | ✅ Done | History is working properly |
| New frontend design | 🟡 In progress | New design is in process of development |

---

## Implemented Progress Discussed

### What Was Completed
- Core scanning flow: user enters URL, clicks scan, receives a list of violations.
- PDF reports can be viewed and developed
- Backend checks are executing.
- Guest limitation (3 free scans) is enforced.
- Basic account creation without email confirmation.
- History that works locally.

### What Was Not Yet Implemented
- **Email verification** for registration (planned for next sprint).
- **Fine calculation** – not available in the report.
- **Real risk scoring** – currently a random placeholder.
- **New frontend** – only old version was shown.
- **History on production server** – only works locally..

---

## Approvals and Requested Changes

### Approved
- ✅ Core scanning functionality and guest check limitation.
- ✅ Basic registration flow (with the explicit requirement to add email verification).

### Requested Changes / Rejections
- ❌ **Frontend design not shown** – Mark expects to see the new design
- ❌ **“Results” button UX** – must show a message that no scan has been started yet.
- ❌ **Risk score display** – must reflect real data, not random placeholders.
- ❌ **Missing email verification** – email should be verified
- ❌ **mc.yandex.ru hosting** – should be treated as normal. Even if there'is an error, then it's Yandex's fault.
- ❌ **Fine calculation** – must be implemented.

### Recommendations Given by Mark
- Use **Cursor**.
- Learn and apply **agents, skills, and MCPs** (not just planning mode).
- For design, “vibecode it” with the help of proper AI tools – the product is B2C and design is critical for user retention.
- Improve AI prompting to avoid bad vibecoding.

---

## Risks Identified

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Poor UI/UX design** | Product not sellable; customer dissatisfaction | Switch to Cursor as recommended |
| **No email verification** | Invalid accounts, security concerns | Prioritise in Sprint 2 |
| **Random risk score** | Gives random number, that may lead to misunderstandings | Replace placeholder with real scoring logic |
| **History not on server** | History isn't working on server due to bug | Fix bug |

---

## Resulting Backlog or Scope Changes

### New Backlog Items Added

| Item | Priority | Sprint |
| :--- | :--- | :--- |
| Finalise and present new frontend design to Mark | High | Sprint 3 |
| Implement email verification for registration | High | Sprint 3 |
| Implement real fine calculation | High | Sprint 3 |
| Replace risk score placeholder with actual scoring | High | Sprint 3 |
| Add informative message when no scan results exist | Medium | Sprint 3 |
| Define proper free and subscription version logic | High | Sprint 3 |

### Existing Backlog Items Updated

| Item | Change | Reason |
| :--- | :--- | :--- |
| Account creation | Scope expanded to include email verification | Customer requirement |
| Frontend development | Complete redesign required; must be shown to Mark for approval | Current state rejected |
| Risk scoring | Must produce real values, not random numbers | Placeholder misleading |
| PDF report generation | Implemented | PDF can be viewed and downloaded  |
| History | Implemented | History is distinct for different users and works on deployed server |

---

## Outcome

- Core scanning and guest access were demonstrated successfully, but many supporting features are either missing or incomplete.
- Mark said that for a B2C product, **design is the primary competitive factor** – if the site looks ugly, users will leave. He expects to see a better design next week.
- Email verification, fine calculation, and proper risk scoring should be implemented.
- Mark offered specific technical advice (Cursor, agents, MCPs, agent skills) and the team committed to adopting these practices.

**Meeting concluded with Mark’s desire to see new frontend design**