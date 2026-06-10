# User Stories

## Personas

- **User** — a website owner or operator who wants to check compliance with Federal Law No. 152 (FL-152).
- **Admin** — a system administrator who manages the PDn Control platform.
- **Lawyer** — a legal professional hired to audit websites for FL-152 compliance.

---

## US-01: Website compliance check

**Requirement Status:** Active
**MoSCoW priority:** Must Have

As a user,
I want to check if my website is violating Federal Law No. 152,
so that I can identify compliance issues.

### Notes and constraints

The check must cover basic FL-152 requirements. The user provides a URL and the system scans the site for potential violations.

---

## US-02: PDF report generation

**Requirement Status:** Active
**MoSCoW priority:** Must Have

As a user,
I want to get a report as a PDF file,
so that I can easily share and view the compliance results.

### Notes and constraints

The PDF should include a summary of violations, risk scores, and recommendations. Must be downloadable after a scan completes.

---

## US-03: AI-powered verification

**Requirement Status:** Active
**MoSCoW priority:** Must Have

As a user,
I want to verify my website using AI tools,
so that I get cheap and fast verification results.

### Notes and constraints

AI analysis should be used to detect violations and suggest fixes. Must balance speed with reasonable accuracy.

---

## US-04: Selectable violation list

**Requirement Status:** Active
**MoSCoW priority:** Could Have

As an admin,
I want to select from a list of violations to check,
so that I can customise which requirements to verify against.

---

## US-05: Query and billing history

**Requirement Status:** Active
**MoSCoW priority:** Must Have

As a user,
I want to see my history of queries and bills in one place,
so that I can easily navigate between past results and track spending.

### Notes and constraints

The history page should display past scans, dates, statuses, and associated costs.

---

## US-06: Total possible fine calculation

**Requirement Status:** Active
**MoSCoW priority:** Must Have

As a user,
I want to check my website,
so that I get the total possible fine for identified violations.

---

## US-07: Risk-scoring display

**Requirement Status:** Active
**MoSCoW priority:** Should Have

As a user,
I want to see risk-scoring for my website,
so that I understand the priority of each problem.

---

## US-08: AI privacy policy analysis

**Requirement Status:** Active
**MoSCoW priority:** Must Have

As a user,
I want AI to analyse my privacy policy,
so that I get a list of missing obligations under Federal Law No. 152.

### Notes and constraints

The system should compare the privacy policy content against FL-152 requirements and highlight gaps.

---

## US-09: Subpage violation detection

**Requirement Status:** Active
**MoSCoW priority:** Could Have

As a lawyer hired to check a website for violations of Federal Law No. 152,
I want to get all subpages that may contain violations of FL-152,
so that I can save time during the audit.

---

## US-10: Web-based admin control system

**Requirement Status:** Removed
**Previous MoSCoW priority:** Won't Have

As an admin,
I want to have the control system as a website,
so that I can open it easily from any device.

### Notes and constraints

**Reason:** The product already targets a web-based interface as the primary delivery model.

---

## Initial proposed MVP v1 scope

The following stories are proposed for the initial MVP v1:

- **US-01** — Website compliance check (foundational feature)
- **US-02** — PDF report generation (essential output)
- **US-03** — AI-powered verification (core differentiator)
- **US-06** — Total possible fine calculation (key user value)
- **US-08** — AI privacy policy analysis (core feature)

These stories represent the smallest meaningful set of Must Have features that deliver end-to-end value: a user can scan a website, get AI-driven violation detection, see the estimated fine, and download a PDF report.
