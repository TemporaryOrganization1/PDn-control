# Process Requirements

These requirements define the reusable Scrum, workflow, and product-management expectations used across the course. Use [Artifact Requirements](Artifact_Requirements.md) as the authoritative source for shared artifact semantics, recurring artifact structures, and public/private artifact handling. Assignment documents may add stricter or more specific requirements for a particular week, but they must not redefine the same shared terms differently.

## Product Backlog Items and Scope

1. A Product Backlog item (PBI) is an issue or equivalent tracked item representing product work that improves the product.

2. PBIs may include user stories, bugs, technical work, infrastructure work, research, design, testing, deployment, and maintained product documentation or maintained workflow documentation that improves the product repository.

3. A Course Task is tracked work whose primary purpose is course reporting, grading evidence, submission packaging, or course administration rather than improving the product.

4. Course Tasks are not PBIs even if the team tracks them in the same platform.

5. Use [Artifact Requirements](Artifact_Requirements.md) for shared artifact classification and maintained-artifact handling rules.

## Product Goal and Product Backlog Management

1. Maintain a Product Goal as the longer-lived target for the product. The Product Backlog should evolve toward that goal.

2. Maintain one current Product Backlog that acts as the single ordered source of product work for the team.

3. Product Backlog refinement is an ongoing recurring activity. Refine the backlog throughout the Sprint instead of postponing all clarification until Sprint Planning.

4. The Product Backlog must satisfy **DEEP**:

   * **Detailed appropriately:** near-term and high-priority PBIs are more detailed than distant PBIs.
   * **Emergent:** add, remove, split, merge, clarify, and reorder PBIs as the team learns.
   * **Estimated:** sufficiently understood PBIs are estimated before the team commits to them in a Sprint.
   * **Prioritized:** the backlog is ordered so the most valuable or important work is considered first.

5. Keep enough refined backlog near the top that the next Sprint can be planned without major preventable ambiguity.

## User Stories, Requirement Status, and Decomposition

1. A user-story issue must contain:

   * The stable user-story ID where applicable
   * The user-story statement
   * Relevant notes, constraints, assumptions, or open questions
   * Acceptance criteria

2. Use stable user-story IDs consistently once assigned. Do not change, reuse, or reassign them.

3. Requirement status for a user story is one of:

   * `Active` - an accepted, current product requirement
   * `Removed` - no longer considered a current product requirement

4. Preserve the stable IDs and history of removed stories. Explain why they were removed instead of deleting the requirement history.

5. Do not use a user-story issue as the main container for implementation subtasks.

6. When implementation, design, testing, deployment, or other supporting work needs to be tracked explicitly, create separate linked PBIs.

7. A separate linked PBI is required when the work needs its own implementer responsibility, review, acceptance criteria, estimation, or verification evidence.

8. User stories selected for a Sprint must be small enough to be completed within that Sprint. If a story is too large or unclear, split or refine it before Sprint Planning while preserving traceability.

9. A user story is completed only when all linked supporting PBIs required to satisfy its acceptance criteria are completed. A user-story issue does not require its own dedicated implementation PR/MR.

## Acceptance Criteria

1. Use `acceptance criteria` terminology for PBIs.

2. Acceptance criteria must be specific, observable, and testable.

3. Given/When/Then ([Gherkin](https://cucumber.io/docs/gherkin/reference)) is recommended for behavioral scenarios, but any clear and testable format is acceptable.

4. A PBI that is expected to be implemented, reviewed, or verified must not be treated as ready for execution without acceptance criteria appropriate to that work.

## Architecture Documentation and ADRs

1. Software architecture is the set of structures needed to reason about the system. These structures comprise software elements, relations among them, and properties of both.

2. Architecture documentation should describe the current system structure, important elements, relations between them, external systems, deployment-relevant boundaries, and quality-relevant properties at a level that helps the team reason about product change.

3. Starting in Assignment 5, treat architecture documentation as a maintained product asset. Later project work must keep it current when product scope, architecture, deployment model, integrations, or important risks change materially.

4. Assignment documents may require specific architecture-view sets or stricter architecture-documentation minima for a particular week. This shared section defines the reusable architecture and ADR semantics, not one permanent fixed view set for every later assignment.

5. Use Architecture Decision Records (ADRs) to preserve important architecture decisions, rationale, tradeoffs, and their relationship to quality requirements.

6. Starting in Assignment 5, treat ADRs as maintained product assets. Preserve ADR history when a decision changes instead of deleting or silently replacing earlier decisions.

7. Each ADR must have a stable ID using the format:

   ```text
   ADR-001
   ```

8. Use stable ADR IDs consistently once assigned. Do not change, reuse, or reassign them.

9. ADR status is one of:

   * `Proposed` - a documented candidate decision that has not yet been adopted
   * `Accepted` - the current adopted decision
   * `Superseded` - replaced by a later ADR; include an explicit `Superseded by: ADR-...` link
   * `Deprecated` - no longer recommended or no longer applicable without one direct replacement ADR

10. Each ADR must define:

    * Stable ID
    * Status
    * Context
    * Decision
    * Consequences and tradeoffs
    * Quality requirements addressed where applicable

11. Architecture documentation should explain what the documented structure, views, and decisions help the reader reason about, including important boundaries, interactions, deployment concerns, and major quality implications.

12. Architecture documentation should identify which quality requirements or quality concerns the current structure particularly supports, constrains, or leaves risky.

13. Preserve traceability between architecture elements, ADRs, quality requirements, quality requirement tests, PBIs, PRs/MRs, CI jobs, manual evidence where applicable, and reported test results after the relevant artifacts are introduced.

14. Use [Artifact Requirements](Artifact_Requirements.md) for the maintained artifact structure of `docs/architecture/README.md`, `docs/architecture/adr/`, the supporting view directories under `docs/architecture/`, and the hosted documentation site.

## Quality Requirements and Quality Requirement Tests

1. Quality requirements describe how well the product must satisfy stakeholder needs. They are non-functional requirements that influence architecture, technology choices, testing strategy, and release readiness.

2. Use a recognized quality model to structure quality requirements. For this course, use ISO/IEC 25010 quality characteristics and sub-characteristics where applicable. Required quality requirements should be distinguished at the sub-characteristic level, such as:

   * Time behaviour
   * Resource utilization
   * Availability
   * Fault tolerance
   * Confidentiality
   * Integrity
   * Interoperability
   * Operability
   * Modifiability
   * Testability

3. Each quality requirement must have a stable ID using the format:

   ```text
   QR-001
   ```

4. A quality requirement must explain:

   * The selected ISO/IEC 25010 quality sub-characteristic
   * Why that quality requirement matters for this product and stakeholders
   * The measurable scenario
   * The automated quality requirement tests that verify it

   After ADRs are introduced in Assignment 5, each relevant quality requirement must also link to the architecture decisions that address it.

5. Specify each quality requirement as a measurable scenario using this structure:

   ```text
   When <source> <stimulus> under <environment>,
   the <artifact> shall <response> within <response measure>.
   ```

6. The response measure must be concrete enough to test. Avoid vague measures such as `fast`, `secure`, `user-friendly`, or `reliable` without measurable criteria.

7. Each quality requirement must have at least one linked automated quality requirement test with a stable ID using the format:

    ```text
    QRT-001
    ```

8. A quality requirement test is an automated test or CI check that directly verifies one or more measurable quality requirement scenarios.

    Repository requirements define which CI jobs and repository evidence must exist. This section defines only whether a test or check qualifies as a QRT for traceability and quality-requirement verification.

9. Quality requirement tests must define:

    * Stable ID
    * Linked quality requirement ID
    * Verification method
    * Test data, setup, or environment
    * Automated command or CI check
    * Expected measurable result
    * Evidence location

10. Required unit tests, coverage checks, type checking, or static analysis may count as quality requirement tests only when they directly verify a measurable quality requirement scenario. For example, type checking may verify an Analysability scenario, and unit-test coverage may verify a Testability scenario.

11. Manual quality evidence, manual reviews, observations, and UATs may support testing status, but they do not count as quality requirement tests unless a later assignment or TA-approved exception explicitly allows it.

12. Treat quality requirements and quality requirement tests as maintained product assets starting in Assignment 4. Later project work must keep introduced assets current, extend them when product scope or risk changes, and preserve history when a requirement or test is replaced.

13. Relevant ADRs should link back to the quality requirements they address.

14. Use [Artifact Requirements](Artifact_Requirements.md) for the maintained artifact structure of `docs/quality-requirements.md` and `docs/quality-requirement-tests.md`.

## User Acceptance Tests

1. User acceptance tests (UATs) describe end-user-facing scenarios that customers or relevant stakeholders can execute to inspect whether the product supports intended user goals.

2. Each maintained UAT scenario should have a stable ID using the format:

   ```text
   UAT-001
   ```

3. Keep UAT IDs stable:

   * If a UAT scenario is still valid but needs clarification, edit it in place and keep the same ID.
   * If the clarification or refinement preserves the same user goal, keep the same ID.
   * If a UAT scenario becomes obsolete, mark it `Retired` with a short reason. Do not delete it or reuse its ID.
   * If the user goal or scenario meaning changes materially, create a new UAT ID and optionally mark the old one `Retired` or `Superseded`.

4. Preserve UAT execution history when an assignment requires customer execution evidence. Add new execution-result sections instead of overwriting previous assignment results.

5. UAT results that reveal product gaps, defects, or changed stakeholder expectations must be converted into traceable Product Backlog decisions.

6. Use [Artifact Requirements](Artifact_Requirements.md) for the maintained artifact structure of `docs/user-acceptance-tests.md` and for UAT result artifact handling.

## Traceability and User-Story Index

1. Traceability means preserving the links between a requirement or user story and the downstream work and evidence that implement and verify it.

2. At minimum, maintain traceability between:

   * Stable user-story IDs
   * User-story issues
   * Linked supporting PBIs where applicable
   * Sprint assignment where applicable
   * Related PRs/MRs
   * Verification evidence

3. When a story is removed, split, superseded, or replaced, preserve its history and explain the change instead of deleting it.

4. When a team maintains a current user-story index such as `docs/user-stories.md`, that index is the authoritative registry of stable user-story IDs and current user-story membership, while the issue tracker remains the authoritative source for live issue details and execution state.

5. A current user-story index should mirror enough live issue metadata for quick traceability, such as the issue link, requirement status, current Work Status, and Sprint assignment where applicable.

## Customer Feedback Traceability

1. Customer feedback that affects product scope, quality, usability, or delivery risk must be converted into traceable Product Backlog decisions.

2. For each material feedback point, record:

   * The feedback point or requested change
   * The resulting PBI, issue, roadmap item, or decision record
   * The current status or planned response

3. For every material feedback point, document whether it was:

   * Addressed in the Sprint
   * Partially addressed
   * Added to the backlog for later
   * Rejected or deferred with rationale

4. Feedback that the team decides not to address must still be documented with a short rationale and, where useful, a backlog link for future reconsideration.

5. Do not treat the number of completed issues as the main measure of progress. The Sprint scope should be justified by stakeholder value, quality improvement, risk reduction, and evidence that the selected work is Done.

## Sprint Cadence and Scrum Events

1. Use Sprints as the recurring container for development work, inspection, and adaptation.

2. Unless a TA explicitly approves another cadence, a Sprint runs from Monday to Sunday.

3. Each Sprint must have a Sprint Goal: a short value-focused statement describing what the team intends to deliver and why that Sprint is worthwhile.

4. Sprint Planning must produce:

   * A Sprint Goal
   * The selected Sprint PBIs
   * A workable plan to deliver them

5. The Sprint Backlog is the set of Sprint-selected PBIs plus the current delivery plan needed to achieve the Sprint Goal.

6. Use the Sprint milestone or equivalent Sprint container consistently so the Sprint Backlog remains inspectable.

   The Sprint milestone is the planning and inspection container. It records the Sprint Goal, dates, selected PBIs, and current workflow state.

   A SemVer release is the packaged delivered increment created from the protected default branch after Sprint work is completed. A release may map to the delivered Sprint increment, but it does not replace the Sprint milestone.

   [Product Repository Requirements](Repository_Requirements.md) define how releases, tags, and changelog entries are created and preserved. [Artifact Requirements](Artifact_Requirements.md) define their shared artifact requirements. This section defines the Sprint and release roles in planning and inspection.

7. Hold a Daily Scrum or equivalent daily developer coordination event during the Sprint to inspect progress toward the Sprint Goal and adapt the plan for the next day of work.

8. Conduct a Sprint Review with relevant stakeholders to inspect the delivered outcome, discuss what changed, collect feedback, and adapt the Product Backlog as needed.

9. Conduct a Sprint Retrospective after the Sprint Review and before the next Sprint Planning. Identify concrete improvements to quality, collaboration, tools, or process, and carry the most useful improvements into the next Sprint.

## Sprint Planning, Readiness, and Estimation

1. Estimate PBIs using Story Points and the Modified Fibonacci scale:

   ```text
   1, 2, 3, 5, 8, 13, 20, 40, 100
   ```

2. Estimation must be collaborative. Planning Poker is recommended, but another collaborative relative-estimation process is acceptable.

3. If the team cannot estimate a PBI confidently, split or clarify it before committing to it in a Sprint.

4. A Sprint-selected PBI must be sufficiently ready to start. At minimum, it must have:

   * A clear expected outcome
   * The required description and context
   * Acceptance criteria
   * An estimate
   * An implementer
   * A different reviewer

5. A Sprint-selected user story may require additional linked supporting PBIs before it is ready for execution.

6. A Sprint Goal should be a short value-focused statement that makes it possible to judge at the end of the Sprint whether the intended outcome was achieved.

## Sprint Roles and Evidence

1. Each Sprint-tracked PBI must name:

   * One implementer responsible for doing the work
   * One different reviewer responsible for reviewing the work and confirming it is ready for completion

2. If the selected platform does not provide a suitable native field for the reviewer, record that role in the issue template or issue body.

3. Each issue must describe the expected outcome clearly.

4. A linked PR/MR is the default implementation evidence for a change.

5. Explicit named deliverables are required only when the expected evidence is not obvious from a normal linked PR/MR. Use [Artifact Requirements](Artifact_Requirements.md) for shared deliverable artifact expectations.

6. Implementation PRs/MRs normally link to the supporting PBIs that do the work. They do not need to link directly to the parent user-story issue when traceability is preserved through linked supporting PBIs, related PRs/MRs, and verification evidence.

## Work Status

Use the following Work Status values consistently wherever the course requires issue status tracking:

* `To Do` - the PBI remains in the Product Backlog and is not currently ready to start
* `Ready` - the PBI is selected for the current Sprint, assigned, estimated, has the required description and acceptance criteria, and can be started without major unanswered questions
* `In Progress` - work has started on the PBI
* `Review` - the current implementation is ready for review, and the issue-linked PR/MR is open or the review is actively happening
* `Done` - for a supporting or implementation PBI, the issue acceptance criteria are satisfied, the team Definition of Done is satisfied, the issue-linked PR/MR is merged into the protected default branch, and the PBI is complete for the Sprint; for a user-story issue, the story acceptance criteria are satisfied, the team Definition of Done is satisfied, and all linked supporting PBIs required to satisfy the story's acceptance criteria are reviewed, merged, verified, and marked `Done`

## Definition of Done

1. Every team must maintain a team-specific Definition of Done in:

   ```text
   docs/definition-of-done.md
   ```

2. The team Definition of Done defines the shared minimum completion standard for work in that repository.

3. A PBI may be marked `Done` only when both:

   * Its issue-specific acceptance criteria are satisfied
   * The team Definition of Done is satisfied

4. The team Definition of Done should, at minimum, require:

   * All issue acceptance criteria are satisfied
   * The work is reviewed by another team member
   * For user stories, the linked supporting PBIs provide the required implementation, review, and verification evidence
   * Required tests or checks pass
   * Relevant quality requirements and quality requirement tests are satisfied or explicitly documented as not applicable
   * Relevant architecture documentation is satisfied or explicitly documented as not applicable after architecture documentation is introduced in Assignment 5
   * CI quality gates pass before merge when CI is configured for the repository
   * Verification evidence is preserved in the normal workflow artifacts

5. For supporting or implementation PBIs, `Done` normally also means the issue-linked PR/MR is merged into the protected default branch.

6. When later project work changes the product stack, architecture, quality requirements, critical modules, or CI configuration, update the Definition of Done so it continues to describe the current completion standard.

7. This section defines completion semantics. [Product Repository Requirements](Repository_Requirements.md) and assignment documents define specific CI gates, tests, coverage thresholds, and platform enforcement. [Artifact Requirements](Artifact_Requirements.md) define the maintained artifact structure and evidence expectations.

## Roadmap

1. Every team must maintain a current roadmap in:

   ```text
   docs/roadmap.md
   ```

2. `docs/roadmap.md` is the Sprint-by-Sprint delivery plan.

3. Update the roadmap as the product direction and Product Backlog evolve.

4. Use [Artifact Requirements](Artifact_Requirements.md) for the maintained artifact structure of `docs/roadmap.md`.
