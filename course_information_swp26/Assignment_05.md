# Assignment 5

## Focus

In Assignment 5, continue the Sprint-based product work with stronger emphasis on architecture reasoning, maintainable development process documentation, configuration management, and delivery of `MVP v2`. The goal is not only to ship another increment. The goal is to show that the team can explain how the product is structured, why important architecture decisions were made, how the team develops and releases the product, and how those choices support continued product evolution.

Assignment 5 builds on the maintained product, quality, CI, testing, and evidence assets introduced earlier. The Sprint must still produce a customer-accessible increment and a traceable response to customer feedback. For Assignment 5, that delivered increment is `MVP v2`: the next release-mapped product increment after `MVP v1`, refined using customer feedback and selected new functionality.

The architecture documentation, ADRs, workflow documentation, configuration-management documentation, and hosted documentation introduced or updated in Assignment 5 are maintained project assets. Later project work must keep them current when product scope, architecture, deployment model, quality requirements, workflow, or tooling changes.

Use [Artifact Requirements](Artifact_Requirements.md) as the authoritative source for shared artifact terminology, weekly public report semantics, release and milestone artifact semantics, screenshot evidence, Sprint Review artifacts, maintained architecture and development-process artifact structures, hosted artifact visibility, and public/private evidence handling. Use [Process Requirements](Process_Requirements.md) as the authoritative source for shared Scrum, Product Backlog, traceability, [architecture and ADR](Process_Requirements.md#architecture-documentation-and-adrs), [quality requirement and quality requirement test](Process_Requirements.md#quality-requirements-and-quality-requirement-tests), [UAT](Process_Requirements.md#user-acceptance-tests), [Definition of Done](Process_Requirements.md#definition-of-done), and [customer feedback](Process_Requirements.md#customer-feedback-traceability) semantics. Use [Product Repository Requirements](Repository_Requirements.md) as the authoritative source for repository workflow, [release and changelog](Repository_Requirements.md#releases-and-changelog), [issue-linked workflow](Repository_Requirements.md#issue-linked-workflow), [configuration and secrets baseline](Repository_Requirements.md#configuration-sensitive-information-and-public-artifacts), and [CI and automation](Repository_Requirements.md#quality-automation-and-ci) requirements.

Assignment 5 adds week-specific deliverables, maintained documentation paths, and `MVP v2` release expectations. Where this assignment repeats a shared rule as a checklist item, the shared requirement remains the definition of the term and this assignment states what evidence must be produced for Week 5.

For this assignment:

* Maintained project assets live in `docs/`.
* Maintained architecture assets live in `docs/architecture/`.
* The Week 5 public report means `reports/week5/README.md`.
* The Moodle PDF is the private submission wrapper. It contains public permalinks plus private identity, recording, credential, and access details that must not be committed to the public repository.

Follow [Artifact Requirements](Artifact_Requirements.md#cross-cutting-artifact-rules), [Artifact Requirements](Artifact_Requirements.md#shared-artifact-visibility-table), [Artifact Requirements](Artifact_Requirements.md#recording-artifacts-and-timecodes), and [Artifact Requirements](Artifact_Requirements.md#moodle-pdf-submission-wrapper-artifact) for reusable public/private evidence handling. For Assignment 5, `reports/week5/README.md` is the canonical public artifact and the Moodle PDF is the canonical private wrapper. Keep Week 5 evidence separated according to those shared rules and place only private identity, private recordings, exact private timecodes, private access instructions, private credentials, private consent evidence, and other customer-identifying evidence in the private submission channel.

## Architecture Guidance

The software architecture of a system is the set of structures needed to reason about the system. These structures include software elements, the relations among them, and important properties of both. Architecture matters because it helps the team explain how the delivered product supports stakeholder goals, quality requirements, and future change.

Use architectural views to document the system from different reasoning angles. For this assignment, the maintained architecture documentation must cover a static view, a dynamic view, and a deployment view. Together, these views should help a reader understand what the system is made of, how important flows work, and how the product is deployed and operated.

Use diagrams-as-code for maintained architecture diagrams and keep the source files inside the repository. This avoids losing editable diagram sources, keeps the architecture versioned together with the product, makes changes reviewable in normal PR or MR workflow, and gives the team stable artifacts to reference from reports and maintained documentation. All diagrams-as-code tools are acceptable. `PlantUML` is recommended for this assignment.

Suggested reading:

* [About architecture](https://github.com/inno-se/the-guide/blob/b86b0c4bf6d119b0a984c82955845fdb9428edf5/README.md#architecture)
* [Architectural views](https://github.com/inno-se-toolkit/se-toolkit-lab-8/blob/8f35f5321048adb9b31a00ae23845b3b096cdaf6/wiki/architectural-views.md#architectural-views)
* [Quality attributes and quality scenarios](https://github.com/Alexey-Popov/awesome-ai-architect/blob/8d2c0b687d51371e582948264acd0393d2706c9b/solution-architecture/quality-attributes.md)
* [Visualize architecture with diagrams-as-code tools](https://github.com/inno-se-toolkit/se-toolkit-lab-8/blob/8f35f5321048adb9b31a00ae23845b3b096cdaf6/wiki/visualize-architecture.md)

Example maintained diagram artifacts:

* Static view example: [PlantUML source](https://github.com/inno-se-toolkit/se-toolkit-lab-8/blob/8f35f5321048adb9b31a00ae23845b3b096cdaf6/wiki/lab-1/docs/diagrams/src/telegram/component-diagram.puml), [rendered SVG](https://github.com/inno-se-toolkit/se-toolkit-lab-8/blob/8f35f5321048adb9b31a00ae23845b3b096cdaf6/wiki/lab-1/docs/diagrams/out/telegram/component-diagram/Component%20Diagram.svg)
* Dynamic view example: [PlantUML source](https://github.com/inno-se-toolkit/se-toolkit-lab-8/blob/8f35f5321048adb9b31a00ae23845b3b096cdaf6/wiki/lab-1/docs/diagrams/src/telegram/sequence-diagram.puml), [rendered SVG](https://github.com/inno-se-toolkit/se-toolkit-lab-8/blob/8f35f5321048adb9b31a00ae23845b3b096cdaf6/wiki/lab-1/docs/diagrams/out/telegram/sequence-diagram/Sequence%20Diagram.svg)
* Deployment view example: [PlantUML source](https://github.com/inno-se-toolkit/se-toolkit-lab-8/blob/8f35f5321048adb9b31a00ae23845b3b096cdaf6/wiki/lab-1/docs/diagrams/src/telegram/deployment-diagram.puml), [rendered SVG](https://github.com/inno-se-toolkit/se-toolkit-lab-8/blob/8f35f5321048adb9b31a00ae23845b3b096cdaf6/wiki/lab-1/docs/diagrams/out/telegram/deployment-diagram/Deployment%20Diagram.svg)

## Part 1: Refine the Product Backlog and Plan Sprint 3

1. Refine the Product Backlog before Sprint Planning.

2. Review:

   * Customer feedback on `MVP v1`
   * Current product risks and quality gaps
   * Unfinished product work
   * Architecture or workflow problems discovered during Assignment 4

3. Create or update PBIs for the selected Sprint scope. The scope may include product features, bug fixes, architecture work, testing work, deployment work, workflow or configuration-management work, documentation, infrastructure, and automation.

   Follow [Process Requirements](Process_Requirements.md#product-backlog-items-and-scope) for what counts as a PBI.

4. Create an explicit Sprint 3 milestone with:

   * Sprint start and finish dates
   * Sprint Goal
   * Selected Sprint PBIs

5. Use the Sprint 3 milestone as the authoritative Sprint container. Issues assigned to that milestone are the selected Sprint Backlog items.

6. Keep the Sprint milestone separate from the SemVer release mapped to `MVP v2`.

7. The Sprint Goal must be value-focused and explain what product, process, or architecture outcome the team intends to deliver.

8. Assign every selected Sprint PBI to the Sprint milestone.

9. Ensure every selected Sprint PBI has:

   * Clear expected outcome
   * Acceptance criteria
   * Story Points
   * Implementer
   * Different reviewer
   * Current Work Status

    Follow [Process Requirements](Process_Requirements.md#sprint-planning-readiness-and-estimation) and [Process Requirements](Process_Requirements.md#sprint-roles-and-evidence) for reusable readiness, estimation, implementer, reviewer, and evidence expectations.

10. Keep the Product Backlog board/view and Sprint Backlog platform board/view inspectable.

11. The Sprint Backlog platform board/view must use GitHub or GitLab platform functionality, such as a Kanban board or GitHub Projects view. Do not use a Markdown artifact as the Sprint work-management board/view.

12. The Sprint Backlog platform board/view must include the items assigned to the Sprint 3 milestone and show useful work-management information where the platform supports it, such as priority, `MVP version`, estimate or Story Points, assignee, and status.

13. Update `docs/roadmap.md` to reflect:

    * The current product direction
    * The current Sprint
    * `MVP v2`
    * The next expected increment or Sprint
    * Architecture, quality, or process work that must continue later

14. The planned `MVP v2` scope must be justified by customer value, quality improvement, maintainability, and evidence that the selected work can be completed to the current Definition of Done.

## Part 2: Respond to Customer Feedback on MVP v1

1. Review the customer's feedback on `MVP v1` and any later feedback already received.

   Follow [Process Requirements](Process_Requirements.md#customer-feedback-traceability) for reusable feedback traceability and response semantics.

2. Create or update PBIs for feedback points that the team decides to address in Sprint 3.

3. In the Week 5 public report, include a customer feedback response table:

   ```markdown
   | Feedback point | Resulting PBI or issue | Status | Response |
   |---|---|---|---|
   | Users could not understand how to recover from API errors. | [#52](...) | Done | Added clearer error states and retry guidance in the UI. |
   | The customer requested CSV export. | [#60](...) | Deferred | Deferred because MVP v2 prioritized architecture hardening and the booking flow. |
   ```

4. Feedback that is not addressed must still have a clear explanation and, where useful, a linked backlog item.

5. `MVP v2` must address some customer feedback from `MVP v1` unless the team documents why higher-priority product, quality, deployment, or architecture risks made a different Sprint scope more valuable.

## Part 3: Document the Development Process and Configuration Management

Follow [Artifact Requirements](Artifact_Requirements.md#docsdevelopment-processmd) for the required maintained structure and content of `docs/development-process.md`. For Assignment 5, this file is the maintained artifact for both the team's development process and configuration-management documentation. Use [Process Requirements](Process_Requirements.md) for the shared workflow, Sprint, Work Status, Definition of Done, and traceability semantics that the documented process must reflect. Use [Product Repository Requirements](Repository_Requirements.md) for the underlying repository mechanics and enforcement rules that the documented process must match.

1. Create or update:

   ```text
   docs/development-process.md
   ```

2. Illustrate the git workflow in `docs/development-process.md` with a Mermaid `gitGraph` diagram.

3. Explain what the `gitGraph` diagram shows and how the team actually uses the documented workflow.

4. Link `docs/development-process.md` from the root `README.md`, from the hosted documentation site, and from the Week 5 public report.

## Part 4: Document the Architecture

Follow [Artifact Requirements](Artifact_Requirements.md#docsarchitecturereadmemd) for the maintained architecture artifact structure, [Artifact Requirements](Artifact_Requirements.md#docsarchitectureadr) for ADR file-storage rules, and [Process Requirements](Process_Requirements.md#architecture-documentation-and-adrs) for shared architecture-documentation and ADR semantics.

1. Read the suggested architecture references again if needed before updating the architecture documentation, especially the references on architectural views, quality attributes, and diagrams-as-code tooling.

2. Create or update the maintained architecture artifact:

   ```text
   docs/architecture/README.md
   ```

3. Create or update supporting architecture assets under:

   ```text
   docs/architecture/
   ```

4. Store the maintained architecture view assets in the required directories:

   ```text
   docs/architecture/static-view/
   docs/architecture/dynamic-view/
   docs/architecture/deployment-view/
   ```

5. In `docs/architecture/README.md`, include separate sections for the component diagram, sequence diagram or diagrams, and deployment diagram.

### Static View

1. The architecture documentation must include a static view using a [component diagram](https://github.com/inno-se-toolkit/se-toolkit-lab-8/blob/8f35f5321048adb9b31a00ae23845b3b096cdaf6/wiki/architectural-views.md#component-diagram).

2. The component diagram must show:

   * The main internal components of the system
   * External systems, services, APIs, databases, platforms, or users that the product interacts with
   * The main relations or communication paths between components
   * Important protocols, interfaces, or data flows where relevant

3. In the static-view section of `docs/architecture/README.md`, comment on:

   * The coupling and cohesion of the codebase
   * The maintainability implications of the current design
   * Which quality requirements the structure particularly supports or constrains

4. In the static-view section of `docs/architecture/README.md`, explain what the diagram shows.

5. Use a diagrams-as-code approach for maintained architecture diagrams and store the source files inside the repository. The component diagram may be created with PlantUML, Mermaid, Structurizr DSL, D2, or another maintainable diagrams-as-code tool. `PlantUML` is recommended for this assignment.

### Dynamic View

1. The architecture documentation must include a dynamic view using at least one [sequence diagram](https://github.com/inno-se-toolkit/se-toolkit-lab-8/blob/8f35f5321048adb9b31a00ae23845b3b096cdaf6/wiki/architectural-views.md#sequence-diagram) for a non-trivial request or workflow.

2. The selected flow must involve several components and multiple interactions between them.

3. In the dynamic-view section of `docs/architecture/README.md`, explain:

   * What scenario the diagram represents
   * Why that scenario is important to the product
   * Which architecture decisions, integration boundaries, or quality requirements it helps the reader reason about

4. In the dynamic-view section of `docs/architecture/README.md`, explain what the diagram shows.

### Deployment View

1. The architecture documentation must include a deployment view.

2. The deployment view may use a UML [deployment diagram](https://github.com/inno-se-toolkit/se-toolkit-lab-8/blob/8f35f5321048adb9b31a00ae23845b3b096cdaf6/wiki/architectural-views.md#deployment-diagram) or another maintainable diagram type that clearly shows the runtime/deployment structure.

3. The deployment view must show where relevant:

   * The main deployed services or executables
   * Datastores or other stateful infrastructure
   * External services or platforms
   * Important environment or network boundaries
   * The customer-facing access path

4. In the deployment-view section of `docs/architecture/README.md`, explain:

   * Why the selected deployment model was chosen
   * How the current deployment supports or constrains the product
   * What must be considered when deploying or operating it for the customer

5. In the deployment-view section of `docs/architecture/README.md`, explain what the diagram shows.

## Part 5: Create and Link ADRs

Follow [Process Requirements](Process_Requirements.md#architecture-documentation-and-adrs) for shared ADR semantics, ID rules, status meanings, and traceability expectations. Follow [Artifact Requirements](Artifact_Requirements.md#docsarchitectureadr) for ADR file naming and storage.

1. Create or update at least three Architecture Decision Records in:

   ```text
   docs/architecture/adr/
   ```

2. Each required ADR must identify which Assignment 4 or later quality requirement or quality requirements it addresses.

3. Update `docs/quality-requirements.md` so each relevant quality requirement links to at least one related ADR.

4. `docs/architecture/README.md` must link the relevant ADRs and explain how the documented architecture and the decisions fit together.

## Part 6: Extend Testing, QA, and Definition-of-Done Evidence for MVP v2

1. Keep all Assignment 4 testing, CI, quality requirement test, and Definition-of-Done gates active.

2. Extend tests, quality checks, documentation, and CI evidence where needed for `MVP v2`, the selected Sprint scope, and the documented architecture decisions.

3. Do not treat Assignment 5 as requiring fixed numeric growth such as "five more unit tests" or "five more integration tests." Instead, extend automated verification enough that the changed or newly important product areas are credibly covered.

4. Update maintained documentation where needed, including:

   ```text
   docs/testing.md
   docs/quality-requirements.md
   docs/quality-requirement-tests.md
   docs/definition-of-done.md
   ```

5. Keep long maintained documentation files directly readable and navigable in place. For `docs/quality-requirements.md` and `docs/quality-requirement-tests.md`, a table of contents is sufficient when the document is long.

6. If Sprint 3 changes the architecture, critical modules, deployment model, workflow, or CI configuration, update the Definition of Done so it still describes the current completion standard.

## Part 7: Implement, Release, and Deploy MVP v2

1. Implement the selected Sprint scope.

2. `MVP v2` must include:

   * Product changes selected for the Sprint
   * Customer feedback improvements selected for the Sprint
   * Architecture or maintainability improvements selected for the Sprint
   * Documentation updates needed to make the increment understandable, usable, and verifiable

3. Keep PRs or MRs issue-linked and reviewed according to [Product Repository Requirements](Repository_Requirements.md#issue-linked-workflow-requirements).

4. Verify acceptance criteria before merge according to [Process Requirements](Process_Requirements.md#acceptance-criteria).

5. Update `CHANGELOG.md` for user-visible changes according to [Product Repository Requirements](Repository_Requirements.md#releases-and-changelog).

6. Update the root `README.md` with current setup, usage, run, or deployment instructions when they changed.

7. Deploy or otherwise provide the current Sprint increment so the customer and TA can access it.

8. Keep the relevant product access artifact accessible until grading is complete.

9. Create a new SemVer release for the Assignment 5 Sprint increment mapped to `MVP v2`.

10. The release must:

    * Use a SemVer tag prefixed with `v`
    * Point to a commit on the protected default branch
    * Identify that it maps to `MVP v2` and the Assignment 5 Sprint increment
    * Link to the Sprint 3 milestone
    * Link to current run or access instructions
    * Link to the public sanitized demo video
    * Link to the Week 5 public report

## Part 8: Update and Execute User Acceptance Tests

1. Follow [Process Requirements](Process_Requirements.md#user-acceptance-tests) for maintained UAT semantics and [Artifact Requirements](Artifact_Requirements.md#uat-public-result-summary-artifact) for public/private handling.

2. Maintain all active UAT scenarios in:

   ```text
   docs/user-acceptance-tests.md
   ```

3. Keep `docs/user-acceptance-tests.md` directly readable and navigable in place. A table of contents is sufficient when the document is long.

4. Add at least two new UAT scenarios for newly implemented `MVP v2` functionality. These scenarios must cover new or changed user-facing behavior delivered in Sprint 3, even if other Sprint work focused on architecture, maintainability, deployment, or workflow improvements.

5. Link each UAT to the relevant acceptance criteria, user story, or supporting PBI where applicable.

6. Execute the relevant old and new UAT scenarios with the customer during a recorded session.

7. In the Week 5 public report, summarize:

   * Which UAT scenarios passed
   * Which UAT scenarios failed or still need changes
   * What still needs to be fixed in the product
   * The most important feedback points received
   * The resulting PBIs or issues

8. Do not commit the private UAT recording or recording link to the public repository.

9. Submit the private UAT recording link privately through Moodle. The link must be accessible to instructors.

10. If one recording includes both UAT and Sprint Review, include Moodle-only timecodes showing where the customer-executed UAT and Sprint Review discussion occur.

## Part 9: Conduct the Sprint Review

1. Conduct a Sprint Review with the customer or relevant stakeholder according to [Process Requirements](Process_Requirements.md#sprint-cadence-and-scrum-events).

2. Discuss:

   * Planned Sprint Goal
   * Delivered `MVP v2` increment
   * Addressed customer feedback
   * UAT results
   * Architecture documentation and ADR updates
   * Quality requirement and CI evidence that must continue into later work
   * Remaining gaps, risks, and follow-up PBIs

3. Adapt the Product Backlog based on the Sprint Review discussion where appropriate.

4. Follow [Artifact Requirements](Artifact_Requirements.md#sprint-review-artifacts) and [Artifact Requirements](Artifact_Requirements.md#recording-artifacts-and-timecodes) for the shared permission, transcript, notes, summary, and public/private handling rules.

5. If the Sprint Review uses a transcript, write the English transcript in:

   ```text
   reports/week5/sprint-review-transcript.md
   ```

6. If the Sprint Review uses notes instead of a transcript, write detailed English notes in:

   ```text
   reports/week5/sprint-review-notes.md
   ```

    In addition to the shared Sprint Review notes structure, include the Sprint Goal reviewed, delivered increment shown, addressed feedback, UAT results, architecture or workflow changes discussed, and resulting Product Backlog updates.

7. Write the Sprint Review summary in:

     ```text
     reports/week5/sprint-review-summary.md
     ```

     In addition to the shared Sprint Review summary structure, include the Sprint Goal reviewed, delivered increment discussed, UAT results, and architecture evidence discussed.

8. If the same recorded meeting includes both customer-executed UAT and the Sprint Review discussion, one recording, transcript or notes file, and summary may cover both events. Include Moodle-only timecodes showing where the customer-executed UAT and Sprint Review discussion occur.

## Part 10: Conduct the Sprint Retrospective

1. Conduct a Sprint Retrospective after the Sprint Review according to [Artifact Requirements](Artifact_Requirements.md#retrospective-artifact).

2. Write:

   ```text
   reports/week5/retrospective.md
   ```

3. Keep the retrospective focused on what the team learned from the current Sprint and what concrete process change should happen next.

## Part 11: Host the Maintained Documentation

1. Publish the maintained documentation as a browsable hosted documentation site according to [Artifact Requirements](Artifact_Requirements.md#hosted-documentation-site).

2. Link the hosted documentation site from the root `README.md`, from `reports/week5/README.md`, and from the SemVer release mapped to `MVP v2` where practical.

## Part 12: Reflect on the Week

Follow [Artifact Requirements](Artifact_Requirements.md#reflection-artifact) for the shared reflection structure.

Write:

```text
reports/week5/reflection.md
```

Emphasize what the team learned from documenting architecture, recording ADRs, refining the workflow, managing configuration, delivering `MVP v2`, and reviewing the increment with the customer.

## Part 13: Record a Public Sanitized Demo Video

1. Record a public sanitized demo video according to [Artifact Requirements](Artifact_Requirements.md#public-sanitized-demo-video-artifact). The public sanitized demo video is a product demonstration for everyone, not a private UAT recording.

2. The public sanitized demo video must explain the current state of `MVP v2`, including what was improved, fixed, or added.

3. Link the public sanitized demo video from `reports/week5/README.md` and from the SemVer release mapped to `MVP v2`.

## Part 14: Report on LLM Usage

Follow [Artifact Requirements](Artifact_Requirements.md#llm-report-artifact) for the shared LLM report expectations.

Write:

```text
reports/week5/llm-report.md
```

Describe the Assignment 5 use of AI or LLM tools.

## Assignment Report in the Repository

Create the following public Week 5 report structure:

```text
reports/
`-- week5/
    |-- README.md
    |-- sprint-review-summary.md
    |-- sprint-review-transcript.md # if publication is permitted
    |-- sprint-review-notes.md      # if recording or private sharing is refused
    |-- reflection.md
    |-- retrospective.md
    |-- llm-report.md
    `-- images/
```

Use `reports/week5/README.md` as the canonical Week 5 public report and submission index. It must contain direct links to every applicable required repository file and external public artifact.

Include:

1. Project name and short description.
2. Link to the Product Backlog board/view.
3. Link to the Sprint Backlog platform board/view.
4. Link to the Sprint 3 milestone.
5. Sprint Goal, Sprint dates, and short scope summary.
6. Total Sprint size in Story Points.
7. Summary of delivered `MVP v2` changes.
8. Link to the relevant product access artifact.
9. Link to current access or run instructions.
10. Customer feedback response table with feedback points and resulting PBIs or issues.
11. Explanation of feedback not addressed.
12. Link to `docs/roadmap.md`.
13. Link to `docs/definition-of-done.md`.
14. Link to `docs/testing.md`.
15. Link to `docs/quality-requirements.md`.
16. Link to `docs/quality-requirement-tests.md`.
17. Link to `docs/user-acceptance-tests.md`.
18. Link to `docs/development-process.md`.
19. Link to `docs/architecture/README.md`.
20. Links to the static, dynamic, and deployment view artifacts.
21. Link to the ADR directory or ADR index.
22. Summary of the architecture and how it supports the current product.
23. Short explanation of how quality requirements are linked to the architecture decisions.
24. Testing and CI status summary for the delivered increment.
25. Link to the CI pipeline.
26. Link to the latest protected-default-branch CI run.
27. Link to the SemVer release mapped to `MVP v2`.
28. Link to `CHANGELOG.md`.
29. Public sanitized demo video shorter than two minutes.
30. Public sanitized UAT results summary.
31. Link to the hosted documentation site.
32. Link to the published Sprint Review transcript; state explicitly if public publication was refused and the transcript is shared only through Moodle or an equivalent private instructor-sharing channel; or link to the Sprint Review notes if recording or private sharing was refused.
33. If any artifact, evidence pattern, or access arrangement differs from the expected default, justify that deviation explicitly.
34. Link to `reports/week5/sprint-review-summary.md`.
35. Link to `reports/week5/reflection.md`.
36. Link to `reports/week5/retrospective.md`.
37. Link to `reports/week5/llm-report.md`.
38. Summary of the current product status.
39. Summary of the next steps.
40. Contribution traceability table mapping each team member to issues, PRs or MRs, review activity, testing, quality, automation, architecture, or documentation work.
41. Embedded screenshots from `reports/week5/images/` for:

    * Sprint milestone
    * Board or project workflow view
    * Latest protected-default-branch CI run
    * SemVer release
    * Example reviewed issue-linked PR or MR
    * Hosted docs site

42. Include product access artifact screenshots where relevant or where public links may not be inspectable by graders.

## Assignment Report on Moodle

Create one PDF containing:

1. Project name and team number.
2. Table with team members, university emails, GitHub or GitLab usernames, assigned Scrum roles, and assigned technical responsibilities.
3. Who did what during the Sprint.
4. Who did not participate in any of the activities.
5. Commit-hash permalink to `reports/week5/README.md`.
6. Commit-hash permalink to the product repository tree at the submission commit. The commit must be on the protected default branch.
7. Link to the recording of the Sprint Review with the customer.
8. Link to the private UAT recording. This link must be accessible to instructors and must not be committed to the public repository.

   You may provide a link to the Sprint Review recording with a timecode for UAT if it was part of the Sprint Review meeting.
9. Sanitized English Sprint Review transcript if it could not be published but private instructor sharing was permitted, or detailed English Sprint Review notes if recording or private instructor sharing was refused.
10. Link to the public sanitized Sprint Review summary.
11. Exact private access instructions for the product access artifact, including limited-permission test credentials if needed.
12. Any instructor-only evidence that must not be committed publicly, such as private consent, access, credential, or customer-identifying evidence.
