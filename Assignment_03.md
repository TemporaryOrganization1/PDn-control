# Assignment 3

## Part 1: Migrate User Stories to the Product Backlog

In Assignment 2, you documented and prioritized user stories in `reports/week2/user-stories.md` and negotiated the proposed MVP v1 scope with the customer. In this assignment, migrate the active stories into the issue-based Product Backlog and continue refining them while preparing to deliver MVP v1.

Use [Process Requirements](Process_Requirements.md) as the authoritative source for reusable definitions such as traceability, PBI structure, issue roles, Work Status meanings, and evidence expectations.

1. Preserve `reports/week2/user-stories.md` as the historical Assignment 2 artifact. Do not rewrite it during migration.

2. Create one issue for every active user story from Assignment 2.

3. Preserve each stable ID in the issue title:

   ```text
   US-001: View available courses
   ```

   The title should be a short summary of the user story. The full user-story statement must still appear in the issue body. Do not replace the stable ID with the platform-assigned issue number. Stable IDs must not be changed, reused, or reassigned.

4. Copy the following information into each migrated issue:

   * Stable user-story ID
   * User-story statement
   * MoSCoW priority
   * Notes, constraints, assumptions, and open questions

5. Continue refining the backlog after migration:

   * Add newly discovered user stories when appropriate.
   * Split overly large or unclear stories into smaller PBIs while preserving traceability.
   * Mark invalid, duplicated, obsolete, infeasible, or otherwise unnecessary stories as removed instead of deleting their history.

6. Preserve Requirement status for every story:

   * `Active`: an accepted, current product requirement.
   * `Removed`: no longer considered a current product requirement.

   Preserve the stable IDs of removed stories and explain why they were removed. Do not create issues for removed stories unless an issue is useful for preserving discussion or decisions.

7. Create and maintain the current user-story index in:

   ```text
   docs/user-stories.md
   ```

8. Use the following structure in `docs/user-stories.md`:

   ```markdown
   | ID | Short title | MoSCoW priority | Issue | Requirement status | Work Status | Sprint |
   |---|---|---|---|---|---|---|
   | US-001 | View available courses | Must Have | [#12](...) | Active | Done | [Sprint 1](...) |
   | US-002 | Export course list | Could Have | [#13](...) | Active | To Do | — |
   | US-003 | Print course catalogue | — | — | Removed | — | — |
   ```

9. `docs/user-stories.md` must index all user stories for traceability, including:

   * Active stories with issue links
   * Removed stories with preserved stable IDs and removed status

10. In `docs/user-stories.md`:

    * `Work Status` must mirror the current issue status for quick traceability. Use `To Do`, `Ready`, `In Progress`, `Review`, `Done`, or `—` for removed stories.
    * `Sprint` must link to the sprint milestone when the story is assigned to a sprint, or use `—` when the story is not currently assigned to any sprint.
    * Keep active stories ordered by MoSCoW priority, then by Sprint, then by stable ID.
    * Place removed stories after all active stories.
    * The issue tracker remains the authoritative source for live status. `docs/user-stories.md` mirrors the current state for traceability.

11. After migration, issues are the authoritative source for active user stories. Use `docs/user-stories.md` only as an index and traceability artifact; do not duplicate full mutable story content there.

12. When adding a new user story after migration, assign it the next unused stable ID after the highest existing `US-xxx` value already present in `docs/user-stories.md`. Never reuse IDs of removed, split, or superseded stories.

13. If stories were removed, split, or replaced during refinement, explain which stories changed, why they changed, and how traceability was preserved.

14. Update current documentation to reference the migrated issues where appropriate.

## Part 2: Add Acceptance Criteria

1. Add at least three acceptance criteria to every user-story issue.

2. Add at least three testable acceptance criteria to every other PBI counted toward the backlog minimum.

3. Follow the shared acceptance-criteria rules in [Process Requirements](Process_Requirements.md).

4. Review criteria as a team and clarify ambiguous PBIs before estimation and Sprint Planning.

## Part 3: Create and Refine the Product Backlog

1. Create and maintain the Product Backlog using GitHub Issues/Projects, GitLab Issues/Boards, or an equivalent issue-based backlog supported by the course.

2. Ensure the Product Backlog contains at least 15 PBIs in total.

3. Follow [Process Requirements](Process_Requirements.md) for what counts as a PBI.

4. The following do not count toward the required 15 PBIs:

   * `Won't Have` PBIs
   * Removed PBIs
   * Assignment-administration or course-task issues

5. Each PBI counted toward the required 15 must include:

   * Clear title
   * Description
   * Type
   * Work Status
   * MoSCoW priority
   * Story Points
   * At least three acceptance criteria
   * Milestone where applicable
   * Assignee when included in the current Sprint Backlog

6. Use the canonical Work Status meanings from [Process Requirements](Process_Requirements.md).

7. Refine the backlog to satisfy **DEEP**:

   * **Detailed Appropriately:** high-priority and near-term PBIs are more detailed than future PBIs.
   * **Emergent:** update the backlog as the team learns.
   * **Estimated:** PBIs have Story Point estimates.
   * **Prioritized:** PBIs are ordered and prioritized using MoSCoW.

8. Create and keep accessible:

   * A Product Backlog board/view
   * A current Sprint Backlog board/view

   Use GitHub Projects, GitLab Boards, or another equivalent saved board/view that makes the backlog state inspectable.

## Part 4: Estimate the Product Backlog

1. Estimate PBIs using Story Points and the [Modified Fibonacci scale](https://www.atlassian.com/agile/project-management/fibonacci-story-points):

   ```text
   1, 2, 3, 5, 8, 13, 20, 40, 100
   ```

2. Estimate as a team using Planning Poker or another collaborative relative-estimation process.

3. Record the final estimate on each PBI counted toward the required 15. You do not need to document every estimation round.

4. Split or clarify PBIs that the team cannot estimate confidently.

5. Record the total current Product Backlog size in Story Points in the Week 3 report.

## Part 5: Create the Definition of Done

1. Create:

   ```text
   docs/definition-of-done.md
   ```

2. Use `docs/definition-of-done.md` to define the team's shared minimum completion standard.

3. Follow [Process Requirements](Process_Requirements.md) for the shared course-level Definition of Done expectations.

4. The Definition of Done must include at least:

   * All issue acceptance criteria are satisfied
   * The work is reviewed by another team member
   * The issue-linked PR/MR is merged into the protected default branch
   * Required tests or checks pass
   * `CHANGELOG.md` is updated if the change is user-visible

5. A PBI may be marked `Done` only when both:

   * Its issue-specific acceptance criteria are satisfied
   * The team Definition of Done is satisfied

## Part 6: Create the Sprint Backlog and Plan MVP v1

1. Create the milestone for the current Sprint with its start and finish dates.

2. The current Sprint must run from Monday to Sunday unless your TA explicitly approves another cadence.

3. Define the Sprint Goal for the current Sprint in the sprint milestone description.

   The Sprint Goal must be a short value-focused statement describing what will be delivered to the customer during the Sprint. It must be specific enough that the team and instructors can determine at the end of the Sprint whether it was achieved.

4. For this course, use the sprint milestone as the container for the Sprint Backlog. Issues assigned to the current sprint milestone represent the selected Sprint Backlog items.

5. Track MVP version separately from the sprint milestone:

   * Use a custom field or equivalent property where available, for example `MVP version`.
   * If the platform does not support a suitable field, use a dedicated label such as `mvp-v1`, `mvp-v2`, or `mvp-v3`.
   * On GitHub, the recommended approach is to use the Table view in GitHub Projects with a custom `MVP version` field and group items by that field.

6. Select the PBIs planned for MVP v1:

   * Select user stories only from the `Must Have` stories.
   * MVP v1 does not need to include every `Must Have` story.
   * Include the necessary technical, infrastructure, design, documentation, deployment, testing, or other supporting PBIs required to deliver the selected scope.
   * Mark each selected MVP v1 PBI using the chosen MVP version field or label.

7. Assign every selected Sprint PBI to the current sprint milestone.

8. Add every selected Sprint PBI to the current Sprint Backlog.

9. Assign every selected Sprint PBI to a team member.

10. Ensure every selected Sprint PBI is estimated and sufficiently detailed for implementation.

11. Calculate the total number of Story Points selected for the current Sprint.

12. Decompose current-sprint user stories into smaller linked technical PBIs as needed so developers can start working without additional clarification.

13. Follow [Process Requirements](Process_Requirements.md) for:

    * User-story and supporting-PBI structure
    * Implementer and reviewer roles
    * Work Status meanings
    * Evidence and deliverable expectations

14. The Sprint Backlog must include current-sprint items in `Ready`, `In Progress`, `Review`, and `Done`.

15. The agreed MVP v1 scope is the set of PBIs marked with the `MVP v1` version field or label.

16. All PBIs selected for MVP v1 must be completed, reviewed, verified, and marked `Done` by the Assignment 3 submission.

## Part 7: Implement and Verify MVP v1

1. Deliver the MVP v1 scope negotiated in Assignment 2 and finalized through Assignment 3 backlog refinement and Sprint Planning.

2. MVP v1 must include:

   * All user stories marked as part of `MVP v1`
   * All supporting PBIs marked as part of `MVP v1`

3. By submission, every PBI marked as part of `MVP v1` must:

   * Satisfy all issue-level acceptance criteria
   * Satisfy the team Definition of Done
   * Be reviewed by another team member
   * Have its issue-linked PR/MR merged into the protected default branch
   * Be marked `Done`

4. Verify the relevant acceptance criteria before merging each issue-linked PR/MR.

5. Record evidence of how the acceptance criteria were verified in the PR/MR and the Week 3 report.

6. Provide a usable delivered increment appropriate to the product type. For example:

   * **Web/mobile:** the hosted application works for the selected MVP v1 flows.
   * **API/service:** the documented endpoints needed by MVP v1 are accessible and usable.
   * **CLI:** the released command-line interface supports the delivered MVP v1 workflows.
   * **Library:** the released package/build and usage example demonstrate the delivered MVP v1 functionality.

7. Keep the delivered MVP v1 accessible until the assignment has been graded.

## Part 8: Sprint Review with the Customer

1. Arrange a Sprint Review meeting with the customer. As many team members as possible should attend.

2. Present and discuss:

   * The planned MVP v1 scope
   * The implemented MVP v1 progress
   * Any changes between the planned and implemented scope
   * Remaining gaps, risks, or follow-up items

3. Review the current Product Backlog and Sprint Backlog with the customer.

4. Obtain explicit customer feedback on the implemented MVP v1 progress against the planned scope.

5. If the customer accepts the reviewed MVP v1 progress and scope, obtain explicit approval. Otherwise, document the requested changes and follow-up actions.

6. **Always ask for permission before recording starts.** Before recording, inform the customer that the recording and a sanitized English transcript will be shared privately with instructors for assessment, and obtain permission for this private sharing. Ask separately for permission to publish the sanitized English transcript.

7. Write the English customer review transcript in:

   ```text
   reports/week3/customer-review-transcript.md
   ```

   Clean it for readability without changing meaning. Place each timestamp on a separate line. Remove PII and confidential business information while preserving enough context for evaluation. Use `[inaudible]` and `[redacted]` where appropriate.

8. Before publication, provide the final sanitized transcript to the customer for review. Publish it only after receiving explicit approval. No response does not constitute approval. If approval is not received, do not commit the transcript. State this in `reports/week3/README.md` and include the sanitized transcript only in the Moodle PDF if private instructor sharing was permitted.

9. If recording or private instructor sharing is refused, write detailed English notes in:

   ```text
   reports/week3/customer-review-notes.md
   ```

   The notes replace the transcript as evidence. Record the discussion chronologically and include the scope reviewed, implemented progress shown, customer feedback, questions, decisions, approvals, requested changes, and resulting backlog updates. Sanitize the notes before sharing them with instructors or publishing them.

10. Write the meeting summary in:

   ```text
   reports/week3/customer-review-summary.md
   ```

   Include the date, participants or roles, artifacts demonstrated, scope reviewed, implemented progress discussed, approvals or requested changes, risks, action points, and resulting backlog or scope changes.

## Part 9: Create or Update the Roadmap

1. Create:

   ```text
   docs/roadmap.md
   ```

2. Structure `docs/roadmap.md` as a list of Sprints. For each Sprint, include:

   * Sprint name or number
   * Target dates
   * Goal or expected outcome
   * Link to the corresponding sprint milestone

3. Update the roadmap as the product and backlog evolve.

## Part 10: Apply the Assignment 3 Repository Workflow

Complete all applicable shared workflow requirements in [Process Requirements](Process_Requirements.md) and all repository/platform requirements under **Required Starting Assignment 3** in [Product Repository Requirements](Repository_Requirements.md), especially:

1. User Story, Other PBI, Course Task, and Bug Report issue templates.

2. Disabled blank issue creation where supported.

3. Issue-linked branches and PRs/MRs.

4. Issue-number branch naming using the format:

   ```text
   <issue-number>-short-description
   ```

5. Acceptance-criteria verification before merge.

6. Extended PR/MR template.

7. Merge-commit workflow.

8. SemVer releases and MVP-to-release mapping.

9. Root `CHANGELOG.md` and changelog workflow.

10. Issue-linked reviewed PRs/MRs as evidence of the workflow.

11. Every team member must participate in the workflow by doing all of the following during Assignment 3:

    * Push at least one commit
    * Create at least one issue-linked PR/MR
    * Review and approve at least one other team member's PR/MR
    * Leave at least one meaningful review comment on another team member's PR/MR

## Part 11: Reflect on the Week

Write:

```text
reports/week3/reflection.md
```

Include:

1. `## Learning points`: what the team learned from backlog migration, backlog refinement, estimation, Sprint Planning, MVP v1 delivery, customer review, release preparation, and workflow enforcement.

2. `## Validated assumptions`: assumptions or decisions confirmed or rejected through implementation, testing, deployment, review, or customer feedback.

3. `## Friction and gaps`: unresolved requirements, technical risks, missing scope, blocked work, review/process friction, follow-up questions, and uncertainties discovered during MVP v1 delivery.

4. `## Planned response`: how the team will respond in the next Sprint or assignment, with links to affected PBIs, milestones, releases, or documentation where relevant.

## Part 12: Conduct a Sprint Retrospective

Write:

```text
reports/week3/retrospective.md
```

This retrospective must be public and sanitized. Do not include sensitive personal information or private conflict details.

Include:

1. `## What went well`: three specific points.
2. `## What did not go well`: three specific points.
3. `## Action points`: one or two concrete improvement actions for the next Sprint.

## Part 13: Report on LLM Usage

Write:

```text
reports/week3/llm-report.md
```

Describe how AI/LLM tools were used. If no AI tools were used, state that explicitly.

## Assignment Report in the Repository

Create the following public Week 3 report structure:

```text
reports/
└── week3/
    ├── README.md
    ├── sprint-report.md
    ├── customer-review-summary.md
    ├── customer-review-transcript.md # if publication is permitted
    ├── customer-review-notes.md      # if recording or private sharing is refused
    ├── reflection.md
    ├── retrospective.md
    ├── llm-report.md
    └── images/
```

Use `reports/week3/README.md` as the public index for the Assignment 3 submission. It must link to every applicable required Week 3 file and external artifact. Keep the substantive content in the dedicated files specified below rather than duplicating it only in the report index.

Write the Sprint report in:

```text
reports/week3/sprint-report.md
```

Include:

1. Summary of user stories and PBIs added, changed, split, or removed since Assignment 2.
2. Report on which customer feedback points from Assignment 2 were addressed in MVP v1.
3. Link to historical `reports/week2/user-stories.md`.
4. Link to current `docs/user-stories.md`.
5. Link to the Product Backlog board/view.
6. Link to the current Sprint Backlog board/view.
7. Sprint Goal.
8. Total Product Backlog size in Story Points.
9. Total current Sprint size in Story Points.
10. Link to the current sprint milestone.
11. Link to the MVP version field, filtered view, or equivalent grouped view showing the MVP v1 scope.
12. Description of the selected MVP v1 scope.
13. Explanation of PBI types, statuses, priorities, sprint milestone usage, MVP version tracking, and task-decomposition approach.
    Reference the shared definitions in `Process_Requirements.md` where appropriate instead of restating them inconsistently.
14. References to the verification evidence for the completed MVP v1 PBIs.
15. Summary of the current product status.
16. Summary of the next steps.
17. A contribution traceability table mapping each team member to their issues, PRs/MRs, and review activity.

Write the public Week 3 report in:

```text
reports/week3/README.md
```

Use this report as an index. Provide direct links to every applicable required repository file and external artifact:

1. Project name, short description, and link to the root `LICENSE`.
2. Link to historical `reports/week2/user-stories.md`.
3. Link to current `docs/user-stories.md`.
4. Link to `reports/week3/sprint-report.md`.
5. Link to the Product Backlog board/view.
6. Link to the current Sprint Backlog board/view.
7. Link to the current sprint milestone.
8. Link to the MVP version field, filtered view, or equivalent grouped view showing the MVP v1 scope.
9. Link to the SemVer release mapped to `MVP v1`.
10. Link to the root `CHANGELOG.md`.
11. Link to `Process_Requirements.md`.
12. Link to `docs/roadmap.md`.
13. Link to `docs/definition-of-done.md`.
14. Links to the issue templates and the extended PR/MR template.
15. Links to reviewed issue-linked PRs/MRs created during Week 3.
16. Link to the delivered MVP v1 deployment, runnable artifact, or equivalent access point.
17. Link to access or run instructions in the root `README.md`.
18. Embedded screenshots from `reports/week3/images/` showing:

    * Product Backlog view
    * Sprint Backlog view
    * Sprint milestone
    * MVP version field, grouped view, or filtered view
    * SemVer release
    * Delivered MVP v1
    * Example reviewed issue-linked PR/MR

19. Link to the published customer review transcript; link to the customer review notes if recording or private sharing was refused; or state that the transcript is included only in Moodle with the customer's permission.
20. Link to the customer review summary.
21. Link to the Week 3 reflection.
22. Link to the retrospective.
23. Link to the LLM report.

## Assignment Report on Moodle

Create one PDF containing:

1. Project name and team number.
2. Table with team members, GitHub/GitLab usernames, assigned roles, and required university-identity mapping.
3. Summary of contributions.
4. Commit-hash permalink to `reports/week3/README.md`.
5. Commit-hash permalink to the product repository tree at the submission commit. The commit must be on the protected default branch.
6. Live links to:

   * Product Backlog board/view
   * Current Sprint Backlog board/view
   * Current sprint milestone
   * MVP version field, filtered view, or equivalent grouped view showing the MVP v1 scope
   * SemVer release mapped to `MVP v1`
   * Delivered MVP v1 deployment, runnable artifact, or equivalent access point

7. Live links to:

   * `docs/user-stories.md`
   * `Process_Requirements.md`
   * `docs/roadmap.md`
   * `docs/definition-of-done.md`
   * `CHANGELOG.md`

8. Links to the reviewed issue-linked PRs/MRs used as Assignment 3 evidence.
9. Exact access instructions for the delivered MVP v1, including any limited-permission test credentials if needed.
10. Customer recording link, only if the customer permitted private instructor sharing. Store it outside the repository and make it accessible only to instructors.
11. Sanitized English customer review transcript if it could not be published but private instructor sharing was permitted, or detailed English notes if recording or private sharing was refused.
12. Explanation of the customer feedback, approvals, requested changes, and resulting backlog updates.

> [!IMPORTANT]
> Verify all links before submission. Public links must be publicly viewable but not publicly editable. Required artifacts and links must remain accessible until the assignment has been graded.

### Submission Procedure

* Submit the PDF through Moodle.
* Only **one submission per team** is required.

### AI and LLM Usage

You may use AI tools, LLMs, or other productivity tools. However:

1. Explicitly report which tools were used and how.
2. The submission must contain meaningful analysis and original team effort.
3. Do not submit filler text, generic AI-generated content, or unnecessary explanations.

Failure to disclose AI usage or submitting low-value AI-generated content may result in a failing grade.
