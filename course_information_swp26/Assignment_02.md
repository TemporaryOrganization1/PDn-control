# Assignment 2

## Part 1: Prepare the Product Repository

1. Create a new product repository and complete all requirements under **Required Starting Assignment 2** in the [Product Repository Requirements](Repository_Requirements.md#required-starting-assignment-2). Ensure that the customer's written consent to the MIT-licensed public development model is obtained before creating the repository, as specified in the repository requirements.

2. Create the following report structure:

   ```text
   reports/
   └── week2/
       ├── README.md
       ├── user-stories.md
       ├── mvp-v0-report.md
       ├── customer-meeting-summary.md
       ├── customer-meeting-transcript.md # if publication is permitted
       ├── customer-meeting-notes.md      # if recording or private sharing is refused
       ├── analysis.md
       ├── llm-report.md
       └── images/
   ```

3. Complete the repository setup, basic PR/MR workflow, and Lychee link-checking requirements before submission.

4. Use `reports/week2/README.md` as the public index for the Assignment 2 submission. It must link to every applicable required Week 2 file and external artifact. Keep substantive content in the dedicated files specified below rather than placing it directly in this report index. The README should link to those files, not replicate their content.

## Part 2: Document and Prioritize User Stories

Write the user stories in:

```text
reports/week2/user-stories.md
```

1. Identify the relevant user roles or personas.

2. Document at least 10 user stories using the following format:

   ```text
   As a [type of user / persona],
   I want to [perform a specific action],
   so that [I achieve a specific goal or value].
   ```

   The required total may include stories later marked as removed during Assignment 2 only if they were documented as legitimate candidate requirements before being removed for a recorded reason. Preserve those stories and explain why they were removed; you do not need to replace them solely to maintain 10 active stories.

3. Assign every user story a stable unique ID using the format `US-01`, `US-02`, and so on.

   * Stable IDs must not be changed, reused, or reassigned.
   * Preserve the IDs when stories are edited or later migrated into issues.
   * Mark removed stories instead of reusing their IDs.
   * Gaps in the numbering sequence are expected when stories are removed; do not renumber to fill them.

4. Assign a MoSCoW priority to every active user story relative to the intended product scope for the duration of the course:

   * `Must Have`: required for the intended product by the end of the course.
   * `Should Have`: important but not essential for the intended product.
   * `Could Have`: valuable but less important.
   * `Won't Have`: a valid story intentionally excluded from the intended product scope for the course. Explain why it is excluded in the story's notes.

   Requirement status indicates whether a story is a current product requirement:

   * `Active`: an accepted, current product requirement.
   * `Removed`: no longer considered a product requirement because it is invalid, duplicated, obsolete, infeasible, or otherwise no longer needed.

   Requirement status is separate from MoSCoW priority and implementation workflow status. These three dimensions serve different purposes:

   * **Requirement status** (Active / Removed) — whether the story is a current product requirement.
   * **MoSCoW priority** (Must / Should / Could / Won't Have) — the story's importance relative to the intended product scope.
   * **Implementation workflow** (e.g., To Do / In Progress / Done) — tracks execution progress, which is not required for Assignment 2.

5. Select a small, non-empty initial proposed MVP v1 scope from the active `Must Have` user stories and list the selected stable IDs in an `## Initial proposed MVP v1 scope` section. Removed stories do not count toward this selection. Keep the scope small enough to prototype and discuss meaningfully. Do not select `Should Have`, `Could Have`, or `Won't Have` stories.

   This is an initial proposal, not a final delivery commitment. It will be refined, estimated, and finalized in Assignment 3.

6. Use the following structure for every active user story:

   ```markdown
   ## US-01: Short title

   **Requirement status:** Active
   **MoSCoW priority:** Must Have

   As a [type of user / persona],
   I want to [perform a specific action],
   so that [I achieve a specific goal or value].

   ### Notes and constraints

   Relevant notes, constraints, assumptions, or open questions.
   ```

7. Preserve every removed story using the following structure:

   ```markdown
   ## US-09: Short title

   **Requirement status:** Removed
   **Previous MoSCoW priority:** Could Have

   As a [type of user / persona],
   I want to [perform a specific action],
   so that [I achieve a specific goal or value].

   **Reason:** Explain why the story was removed.
   ```

   Include the previous priority only if one was assigned.

> [!IMPORTANT]
> User stories remain in `reports/week2/user-stories.md` for this assignment. Do not migrate them into issues yet. Backlog management, acceptance criteria, and estimation will be introduced later.

## Part 3: Design the Product Interface

Prototype every externally used interface needed by the user stories in the initial proposed MVP v1 scope. You may identify one primary interface, but do not omit another interface required to complete a selected story. For example, if a user story requires a web interface that communicates with a supporting API, prototype the web interface (the primary interface); the supporting API needs separate prototyping only if it is itself an externally used interface. Stories may share screens and journeys, and prototypes do not need production behavior. Use the applicable paths below.

1. For a product with a graphical interface, design an interactive prototype in Figma or another accessible prototyping tool. Include navigation between screens and important states where relevant (e.g., empty, success, and error states) for the key workflows covered by the selected MVP v1 scope.

2. For a product whose externally used interface is an API, create:

   The API artifacts serve as the interface prototype. Create `api/openapi.yaml` and `api/postman_collection.json`, and include:

   * OpenAPI specification for the proposed interface
   * Accessible self-hosted rendered Swagger UI (a shared Swagger Editor URL such as `editor.swagger.io` is not sufficient)
   * Accessible implementation or working mock for each documented endpoint
   * Postman collection demonstrating representative successful and error responses
   * Public view-only Postman workspace/collection link

   A separate mock is not required for an endpoint that is already implemented and accessible. The endpoints do not need production implementations for Assignment 2. Identify which documented endpoints, if any, are implemented or mocked as part of MVP v0.

3. For a product with another non-graphical externally used interface, such as a CLI, library, bot, or integration contract:

   * Create an interactive interface mock or demonstration.
   * Document the interface contract in:

   ```text
   docs/interface.md
   ```

   Describe the interface type, intended users, commands/messages/functions, inputs, outputs, success examples, error examples, and authentication or configuration where relevant. Identify which elements, if any, are implemented or mocked as part of MVP v0.

4. Every product must have an interface appropriate to stakeholder needs. SSH access alone is not a product interface. If the expected customer workflow is to connect by SSH and run a script, design and document at least a CLI or another explicit interface.

5. If the product also has an internal or incidental API, document it only when it is relevant to the externally used interface or MVP v0 foundation.

6. Make all selected prototype and interface artifacts publicly viewable but not publicly editable, and keep them accessible until the course has been graded.

7. Use placeholders such as `{{access_token}}` instead of real credentials or PII in public interface artifacts. Do not commit `.env` files, API keys, tokens, or other secrets to the repository.

## Part 4: Deploy MVP v0

The prototype and MVP v0 have different purposes and evaluation criteria, but the same implementation may serve both roles if it satisfies both sets of requirements:

* The prototype explores and communicates the proposed MVP v1 user experience. It does not need production behavior.
* MVP v0 is a runnable or deployed technical product foundation with a working smoke check. It does not need to implement a complete user story or reproduce the prototype.
* MVP v0 may reuse or implement elements of the prototype where useful.
* Runnable prototype code, including a static application such as TypeScript generated from a Figma prototype, may also serve as MVP v0 when it is accessible over the internet, usable for its demonstrated purpose, and satisfies the MVP v0 smoke-check requirements.

The table below summarises the different purposes and criteria:

| Aspect                                        | Prototype                                                   | MVP v0                                            |
| --------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| **Purpose**                                   | Explore and communicate the proposed MVP v1 user experience | Establish a runnable technical product foundation |
| **Primary audience**                          | Team, customer (for feedback)                               | TA (for evaluation)                               |
| **Needs customer approval?**                  | No                                                          | No                                                |
| **Needs production behavior?**                | No                                                          | No                                                |
| **Needs to implement a complete user story?** | No                                                          | No                                                |
| **Must be runnable / deployed?**              | No (interactive mock is sufficient)                         | Yes                                               |
| **Must pass a smoke check?**                  | No                                                          | Yes                                               |
| **May use mocks / placeholders?**             | Yes                                                         | Yes                                               |

MVP v0 is evaluated by the TA. It does not need to be shown to or approved by the customer.

1. Build a runnable or deployed MVP v0 product foundation. A complete end-to-end business feature is not required; placeholder behavior and mocks are allowed where appropriate.

2. Document MVP v0 in:

   ```text
   reports/week2/mvp-v0-report.md
   ```

   Include:

   * Purpose and description of the MVP v0 foundation
   * Deployment URL or runnable-artifact link
   * Public video demonstration link
   * Relationship to the prototype and proposed MVP v1 stories, where applicable
   * Current limitations, placeholders, and mocks
   * Link to local setup instructions
   * Repeatable smoke-check scenario

3. Define and document at least one repeatable smoke-check scenario in `reports/week2/mvp-v0-report.md`. Include access instructions, steps, and expected results. The smoke check must demonstrate that MVP v0 is accessible and usable for its demonstrated purpose. Use a scenario appropriate to the product:

   * **Web/mobile:** the application opens, primary navigation works, and at least one interactive data-flow element is demonstrated (e.g., form submission, API call, or state change).
   * **API/service:** the service starts, a health endpoint works, and Swagger UI is accessible when the API is part of the documented external interface.
   * **CLI:** the command runs and `--help` works.
   * **Library:** the package builds and a minimal usage example runs.
   * **Other product type:** provide an equivalent minimal check demonstrating that the product foundation runs.

4. Hosted products must be accessible over the internet until the course has been graded.

5. For a mobile application, provide either:

   * A publicly accessible hosted web/emulator build, or
   * An accessible installable build or test-distribution link with clear installation and access instructions.

   A video demonstration alone does not satisfy the MVP v0 access requirement.

6. For a CLI tool, library, or another product that cannot reasonably be hosted as a running service, publish an accessible runnable artifact or package and provide clear run instructions.

7. Provide a public sanitized video demonstration of MVP v0 shorter than two minutes.

8. Provide clear and reproducible local setup instructions in the root `README.md`. Link from the root `README.md` to `reports/week2/README.md` and `reports/week2/mvp-v0-report.md`.

9. In the Moodle PDF, explain exactly how the TA can access MVP v0. Include the deployment URL or runnable-artifact link, dedicated limited-permission test credentials if needed, and a link to the documented smoke-check scenario.

> [!IMPORTANT]
> Never submit real, personal, or production credentials. This includes API keys, tokens, passwords, and other secrets — even sandbox or test credentials from third-party services. Add a sanitized `.env.example` file and ensure `.env` and other secret files are listed in `.gitignore`.

## Part 5: Review with the Customer

1. Arrange a customer review meeting. As many team members as possible should attend.

2. Present and discuss:

   * User stories and MoSCoW priorities
   * Initial proposed MVP v1 scope
   * Selected prototype and interface artifacts

3. Ask the customer to explicitly approve:

   * The documented user stories
   * The MoSCoW priorities
   * The initial proposed MVP v1 scope

   Confirm in the meeting summary that written consent to the public MIT-licensed development model was obtained before repository creation. Written consent includes a message via Telegram, email, or another chat service — a paper signature is not required. Capture the approvals in the transcript. After incorporating feedback, obtain customer approval of the Assignment 2 proposed MVP v1 scope and the final updated user stories and priorities. If capturing approval in the transcript is not possible, retain written customer approval.

4. Show the prototype and interface artifacts to the customer and obtain their feedback. Customer approval of the prototype and interface artifacts is not required.

5. Update `reports/week2/user-stories.md`, priorities, initial proposed MVP v1 scope, and prototype and interface artifacts where appropriate.

6. **Always ask for permission before recording starts.** Before recording, inform the customer that the recording and a sanitized English transcript will be shared privately with instructors for assessment, and obtain permission for this private sharing. Recording, transcript, and meeting summary are mandatory unless the customer refuses recording or private sharing. Separately ask the customer whether the sanitized transcript may also be published in the repository. If the customer refuses recording or private sharing, document the refusal, notify the TA, and provide detailed English meeting notes instead.

7. Write the English customer meeting transcript in:

   ```text
   reports/week2/customer-meeting-transcript.md
   ```

   Clean it for readability without changing meaning. Place each timestamp on a separate line. Remove PII and confidential business information while preserving enough context for evaluation. Use `[inaudible]` and `[redacted]` where appropriate.

   PII includes real names (replace with GitHub/GitLab usernames or pseudonyms), email addresses, phone numbers, and other personally identifying details. The goal is to keep the transcript useful for assessment while protecting privacy.

   During the meeting (before recording), ask the customer for a one-time decision on whether the sanitized transcript may be published in the repository. Record this decision in the meeting summary. If the customer agrees, publish the sanitized transcript without an additional review round. If the customer refuses, do not commit the transcript; include it only in the Moodle PDF and state this in `reports/week2/README.md`.

8. If recording or private sharing with the course instructors is refused, write detailed English notes in:

   ```text
   reports/week2/customer-meeting-notes.md
   ```

   The notes replace the transcript as evidence. Record the discussion chronologically and include the artifacts presented, customer feedback, questions, decisions, and approvals. Sanitize the notes before sharing them with instructors or publishing them. Inform the customer that sanitized notes will be used as assessment evidence. If the customer refuses any written documentation sharing, contact the TA immediately and follow the TA's instructions.

9. Write the meeting summary in:

   ```text
   reports/week2/customer-meeting-summary.md
   ```

   Include the date, participants or roles, artifacts demonstrated, discussion points, decisions, action points, risks, feedback, customer approvals, and resulting changes. Link to affected stories, prototype screens, API/interface artifacts, or other evidence where relevant.

## Part 6: Analyse the Week

Write:

```text
reports/week2/analysis.md
```

Include:

1. `## Learning points`: what the team learned from writing user stories, prioritization, prototyping, interface design, MVP v0 deployment, and customer validation of the proposed product interface.
2. `## Validated assumptions`: assumptions or design decisions confirmed or rejected through the prototype, MVP v0 technical work, research, or customer review. For example: "We assumed users need feature X — confirmed during the customer meeting" or "We assumed technology Y would support our deployment — rejected after testing in MVP v0."
3. `## Needs clarification`: unresolved questions, assumptions, requirements, constraints, and technical risks.
4. `## Planned response`: how learning points will affect MVP v1, with links to affected stories or artifacts.

## Part 7: Report on LLM Usage

Write:

```text
reports/week2/llm-report.md
```

Describe how AI/LLM tools were used throughout the assignment. This includes all AI/LLM-assisted activities: coding, writing, prototyping, transcription, research, idea generation, and any other use. If no AI/LLM tools were used, state that explicitly.

## Assignment Report in the Repository

Write the public Week 2 report in:

```text
reports/week2/README.md
```

Use this report as an index. Provide direct links to every applicable required repository file and external artifact:

1. Project name, short description, and link to the root `LICENSE`.
2. Link to `reports/week2/user-stories.md`.
3. Link to every selected prototype and interface artifact:

   * For a graphical interface: the interactive prototype.
   * For an API interface: the OpenAPI specification, Swagger UI, accessible implementation or mock, and Postman collection.
   * For another non-graphical interface: the interactive mock/demonstration and `docs/interface.md`.

4. Link to `reports/week2/mvp-v0-report.md`, the deployed MVP v0 or runnable artifact, run instructions, and public video demonstration.
5. Link to the minimal PR/MR template and reviewed PRs/MRs created during Week 2.
6. Link to the Lychee configuration and latest successful protected-default-branch run.
7. List and justification of excluded Lychee links, plus confirmation of manual verification (visit each excluded link in a browser to confirm it is accessible before submission).
8. Screenshots embedded from `reports/week2/images/` (use PNG format; keep file sizes reasonable):

   * Protected default branch settings
   * Example reviewed PR/MR (must be a review by another team member, not a self-review)
   * Selected prototype and interface artifacts
   * Deployed MVP v0 or runnable artifact

9. `Coverage` section that:

    * References the stable IDs covered by the prototype.
    * Explains the selected prototype and interface artifacts and references the stable user-story IDs represented by them.
    * Links to `reports/week2/mvp-v0-report.md`, which explains the MVP v0 foundation and documents the repeatable smoke-check scenario.
    * References stable user-story IDs represented by MVP v0 where applicable. For example, if MVP v0 sets up authentication infrastructure, reference the related user story (e.g., US-02: User login) even if login is not yet functional. MVP v0 is a product foundation and does not need to implement a complete user story.
10. Link to the published customer transcript; link to the customer notes if recording or private sharing was refused; or state that the transcript is included only in Moodle with the customer's permission.
11. Link to the customer meeting summary.
12. Link to the Week 2 analysis.
13. Link to the LLM report.

## Assignment Report on Moodle

Create one PDF containing:

1. Project name and team number.
2. Table with team members, University emails, GitHub/GitLab usernames, assigned Scrum roles (Product Owner, Scrum Master, Developer), assigned technical responsibilities (e.g., Frontend, Backend, DevOps).
3. Summary of contributions: a per-person breakdown of what each team member did during the week.
4. Commit-hash permalink to `reports/week2/README.md`. Use the full commit hash (e.g., from `git log` or the GitHub/GitLab permalink feature), not a branch name.
5. Commit-hash permalink to the product repository tree at the submission commit. The commit must be on the protected default branch.
6. Live links to the selected prototype and interface artifacts, MVP v0 deployment/runnable artifact, and public MVP v0 video.
7. Customer recording link, only if the customer permitted private instructor sharing. Store it outside the repository and make it accessible only to instructors. If recording or private sharing was refused, state this and include the detailed notes.
8. Dedicated limited-permission test credentials and access instructions if needed.
9. Sanitized English transcript if it could not be published but the customer permitted private instructor sharing, or detailed English notes if recording or private sharing was refused.
10. Evidence of the customer's written consent to the public MIT-licensed development model.

> [!IMPORTANT]
> Verify all links before submission. Public links must be publicly viewable but not publicly editable. Required artifacts and links must remain accessible until the course has been graded.

### Submission Procedure

* Submit the PDF through Moodle.
* Only **one submission per team** is required.

### AI and LLM Usage

You may use AI tools, LLMs, or other productivity tools. However:

1. Explicitly report which tools were used and how.
2. The submission must contain meaningful analysis and original team effort.
3. Do not submit filler text, generic AI-generated content, or unnecessary explanations.

Failure to disclose AI usage or submitting low-value AI-generated content may result in a failing grade.
