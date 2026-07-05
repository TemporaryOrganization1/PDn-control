# Week 5 LLM Usage Report

This report describes how AI/LLM tools were used during Assignment 5. The team used LLM support as an assistant for drafting, implementation guidance, debugging, and documentation, while keeping final responsibility for repository changes, evidence, and submitted artifacts with the team.

## Areas Where LLMs Were Used

| Area | How LLM support was used | Human verification |
|---|---|---|
| Frontend redesign | Generated UI ideas, wording, component structure suggestions, and design alternatives for the remade customer-facing frontend. | The team reviewed the result in the running product and discussed the design with the customer during Sprint Review. |
| Email verification | Helped reason about the registration flow, SMTP configuration, environment variables, and deployment troubleshooting. | The team tested the registration and email verification flow during the customer meeting. |
| Testing and CI | Suggested test coverage targets, helped draft automated test commands, and helped explain CI evidence in reports. | GitHub Actions Quality Gates and Link Checker were used as authoritative evidence. |
| Architecture documentation | Helped structure the static, dynamic, and deployment views and phrase the architecture implications. | The diagrams and ADRs were checked against the actual Docker Compose/services/code structure. |
| ADRs and quality requirements | Helped connect ADRs to quality requirements and quality requirement tests. | Links were reviewed in `docs/quality-requirements.md`, `docs/architecture/README.md`, and related ADR files. |
| Week 5 reporting | Helped draft and organize `reports/week5/README.md`, Sprint Review summary, reflection, retrospective, and public evidence wording. | The team compared the report content with Assignment 5 requirements and available public/private evidence. |

## Prompting Strategy

The team mainly used LLMs for focused tasks: summarize the current repository state, propose missing report sections, explain errors, draft documentation from known facts, and improve wording. Prompts included local file context, assignment requirements, known GitHub links, and customer-review notes where relevant. The team avoided asking the model to invent private evidence, credentials, recordings, or customer statements that were not present in the meeting transcript.

## Benefits

LLM assistance reduced the time needed to organize a large Assignment 5 evidence set. It was especially useful for turning scattered repository artifacts into a readable report, checking that architecture and quality documentation were linked consistently, and making configuration-management explanations clearer.

## Limitations And Risks

LLM output can be overconfident or outdated, especially for live GitHub Actions, releases, and repository state. For that reason, current CI run links, release links, issue states, and branch state were verified against GitHub or local Git before being included in the public report. The team also treated private links and customer recordings carefully: raw recording links are not committed to the public repository unless the assignment and privacy rules allow publication.

## Final Responsibility

All final artifacts, links, and claims remain the responsibility of the project team. LLM-generated text was edited and checked against the repository, the customer review transcript, and Assignment 5 requirements before inclusion.
