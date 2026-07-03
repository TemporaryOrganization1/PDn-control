# Artifact Requirements

These requirements define the shared artifact semantics, handling rules, and recurring artifact structures used across the course. Use [Process Requirements](Process_Requirements.md) as the authoritative source for process and Scrum semantics. Use [Product Repository Requirements](Repository_Requirements.md) as the authoritative source for repository and platform mechanics. Assignment documents may add stricter or more specific requirements for a particular artifact instance, but they must not redefine the same shared artifact type inconsistently.

## Artifact Concepts and Terminology

**Since: A2**

1. An artifact is any inspectable file, external deliverable, saved board or view, milestone, release, recording, video, deployment access point, or other preserved evidence used to plan, deliver, verify, review, or submit course work.
2. An artifact type is the shared kind of artifact, such as a weekly public report, Sprint Review transcript, release, or testing document.
3. An artifact instance is the concrete file, URL, board, release, or other concrete occurrence required by an assignment.
4. A canonical public artifact is the primary public artifact that readers should use as the authoritative entry point for a particular scope, such as the weekly public report.
5. A canonical private artifact is the primary private submission wrapper or private evidence container for a particular scope, such as the Moodle PDF.
6. A supporting artifact is any artifact linked from a canonical artifact to provide the detailed evidence or maintained content that the canonical artifact summarizes or indexes.
7. An accessible artifact is an artifact that the intended reviewers can open and inspect using the access method required by the assignment.
8. Inspectable evidence is evidence that reviewers can meaningfully examine rather than merely trust by assertion.
9. A sanitized artifact is an artifact cleaned of secrets, unnecessary PII, confidential customer information, and other data that should not appear in its intended sharing channel.
10. A product access artifact is a shared umbrella term for a deployed product, hosted artifact, or runnable product.

## Artifact Categories

**Since: A2**

1. Shared artifact categories include:
   * Report and index artifacts
   * Sprint Review artifacts
   * Access artifacts
   * Submission wrapper artifacts
   * Traceability and evidence artifacts
   * Maintained documentation artifacts
   * Release and milestone artifacts
2. By default, artifacts under `reports/` are Course Task artifacts.
3. Maintained artifacts such as `docs/user-stories.md`, `docs/roadmap.md`, `docs/definition-of-done.md`, root setup documentation, deployment or run instructions, interface specifications, `CHANGELOG.md`, and later maintained quality/testing artifacts are not Course Tasks when they improve the maintained product repository.

## Storage Classes

**Since: A2**

1. A repository-resident artifact is kept directly in the repository.
2. An external-but-indexed artifact is hosted outside the repository but must be linked from the relevant canonical public or private artifact.
3. A private-only artifact must not be committed to the public repository and must be shared only through the assignment's private submission channel or another instructor-approved private channel.
4. Assignment documents must identify the canonical public artifact, the canonical private artifact where applicable, and the main supporting artifacts.

## Cross-Cutting Artifact Rules

**Since: A2**

1. Keep the repository and required external artifacts accessible until the course has been graded.
2. Public artifacts must be viewable but not publicly editable.
3. Private artifacts must be shared only with the intended instructors or other explicitly approved reviewers.
4. Use external storage according to the artifact's sensitivity:
   * Store public, non-sensitive artifacts in package registries or publicly accessible cloud storage.
   * Store private recordings or instructor-only evidence in access-controlled university storage or cloud storage shared only with instructors.
5. Do not store or submit real, personal, or production credentials, secrets, unnecessary PII, or confidential customer information in public artifacts.
6. Dedicated limited-permission test credentials may be submitted privately when an assignment requires them.
7. Do not use Git LFS or public external storage to publish private or confidential information.
8. Sanitize public repository documents. Use GitHub or GitLab usernames, roles, or pseudonyms such as `customer` instead of real names where possible.
9. Use only sanitized demo or test data in public deployments, video demonstrations, screenshots, API documentation, Swagger or Postman examples, and other public materials.
10. Public and private evidence must remain separated according to the artifact type and assignment-specific routing rules.
11. Provide concrete sanitization detail where specific examples help interpretation. Typical examples include real names, email addresses, phone numbers, university emails, customer-identifying details, private credentials, confidential business information, raw recordings or recording links, and exact private timecodes.
12. If a team uses an artifact form, evidence pattern, or submission arrangement that differs materially from the assignment's expected default, the team must state and justify that deviation explicitly in the relevant report.

## Sensitive Information Types

**Since: A2**

Sensitive information includes, at minimum:

* Real names when a sanitized role, username, or pseudonym is sufficient
* Email addresses, including university emails
* Phone numbers
* Customer-identifying details
* Private credentials and access secrets
* Confidential business information
* Raw recordings and private recording links
* Exact timecodes in private recordings

Use this section as the shared reference point for sanitization-sensitive artifact types such as transcripts, screenshots, recordings, demos, and private submission wrappers.

## Artifact Relationships and Traceability

**Since: A2**

1. Canonical artifacts should index or link their supporting artifacts instead of duplicating their full content.
2. The weekly public report is the canonical public index for that assignment unless the assignment explicitly states otherwise.
3. The Moodle PDF or equivalent private submission wrapper is the canonical private artifact unless the assignment explicitly states otherwise.
4. Releases should link delivered increment evidence.
5. Milestones should link Sprint planning and Sprint scope evidence.
6. Maintained docs artifacts should link to implementation and verification evidence where appropriate.
7. When one artifact summarizes another artifact's evidence, the summary must preserve clear links or references to the detailed evidence.
8. Explicit named deliverables are required only when the expected evidence is not obvious from a normal linked PR/MR.

**Example**

Examples include a design artifact, API specification, interface prototype, product access artifact, or an explicitly required documentation artifact.

## Shared Artifact Visibility Table

**Since: A2**

Use this table as the default shared public/private classification. Assignment documents may add stricter or more specific routing where needed.

| Artifact type | Default visibility | Notes |
|---|---|---|
| Weekly public report | Public | Canonical public assignment index unless another public canonical artifact is specified. |
| Maintained documentation artifact | Public unless an assignment explicitly states otherwise | Keep readable, inspectable, and appropriately sanitized for the sharing channel. |
| Hosted documentation site | Public when an assignment requires it | Treat it as a public supporting artifact for maintained documentation. |
| Public sanitized demo video | Public | Use sanitized demo data only. |
| Sprint Review summary | Public sanitized | Keep publication-safe and link private evidence indirectly where needed. |
| Sprint Review transcript | Public sanitized only when publication is permitted | Otherwise share privately or replace with notes as allowed. |
| Sprint Review transcript shared privately after public refusal | Private-only | Use this when instructor sharing is permitted but public publication is refused. |
| Sprint Review notes | Public sanitized only when publication is permitted or when the assignment allows public fallback notes | Otherwise share privately. |
| UAT recording | Private-only | Includes recordings where UAT is part of the Sprint Review meeting. |
| Rehearsed presentation video | Private-only | Submit only through the private submission channel. |
| Presentation slides | Private-only | Never commit to the product repository. |
| Private access instructions | Private-only | Includes limited-permission credentials and other private access steps. |
| Private consent evidence | Private-only | Share only through the private submission channel when required. |
| Exact timecodes in private recordings | Private-only | Timecodes into private recordings are private metadata. |

## Access Artifacts

**Since: A2**

1. A deployed product is a running instance of the product that reviewers can access without building it locally.
2. A hosted artifact is a downloadable or installable build, package, or other hosted product artifact available online.
3. A runnable product is a product the reviewer can run locally from the repository or a published package using documented instructions.
4. A product access artifact is one of those three forms.
5. Any of the three may satisfy an access requirement depending on the product type and assignment requirements or goals unless an assignment explicitly requires a more specific form.
6. Preferred and acceptable access forms by product type:
   * Web frontend:
     Preferred: deployed product.
     Acceptable alternative: hosted installable or exported build when that is the realistic review path for the product.
   * Mobile application:
     Preferred: deployed product or an accessible hosted web/emulator build when the product supports that review mode.
     Acceptable alternative: hosted installable build or test-distribution link with clear installation and access instructions.
   * API or service:
     Preferred: deployed product with reachable documented endpoints.
     Acceptable alternative: another hosted artifact that exposes the documented interface in an inspectable way.
   * Bot or integration:
     Preferred: deployed product or other hosted live instance that supports the intended interaction.
     Acceptable alternative: runnable product when live hosting is not practical and the interaction can still be inspected reliably.
   * CLI:
     Preferred: runnable product.
     Acceptable alternative: hosted package/build artifact with clear run instructions.
   * Library:
     Preferred: hosted package/build artifact together with a runnable usage example.
     Acceptable alternative: runnable product from the repository when publishing a package is not the realistic review path.
   * No-code or configuration-heavy product:
     Preferred: whichever deployed, hosted, or runnable form most directly exposes the intended user workflow or system behavior.
     Acceptable alternatives: any other inspectable product access artifact that lets reviewers verify the intended behavior without relying on unsupported assumptions.

## Product Access Artifact Table

**Since: A2**

| Product type | Preferred access form | Acceptable alternatives | Required access/run instructions |
|---|---|---|---|
| Web frontend | Deployed product | Hosted installable/exported build when that is the realistic review path | URL, any required navigation notes, and limited-permission credentials if needed |
| Mobile application | Deployed product or hosted web/emulator build | Hosted installable build or test-distribution link | Installation/opening steps, device/emulator expectations, and limited-permission credentials if needed |
| API/service | Deployed product with reachable documented endpoints | Other hosted artifact that exposes the interface inspectably | Endpoint/docs URL, authentication/test-token instructions, and representative invocation guidance |
| Bot/integration | Deployed product or hosted live instance | Runnable product when live hosting is not practical | Entry point, triggering steps, environment/account prerequisites, and credentials if needed |
| CLI | Runnable product | Hosted package/build artifact | Install/run steps, command examples, and required environment configuration |
| Library | Hosted package/build artifact plus runnable example | Runnable product from the repository | Install steps, example usage command/snippet, and required toolchain information |
| No-code/config-heavy product | Most direct inspectable deployed/hosted/runnable form | Another inspectable product access artifact | Clear reviewer steps for opening, accessing, and exercising the intended behavior |

## Weekly Public Report and Index Artifact

**Since: A2**

**Required**

1. Each assignment that requires a weekly public report must identify one canonical public report or index artifact.
2. The weekly public report must provide direct links to every applicable required public repository file and external public artifact for that assignment.
3. The weekly public report must identify the relevant delivered, reviewed, or submitted scope clearly enough that reviewers can tell what body of work the report covers.
4. Keep substantive content in dedicated supporting artifacts when the assignment requires those dedicated artifacts. The weekly public report should summarize and index them rather than duplicating their full content.
5. When the assignment requires product access, release, review, testing, documentation, or other public evidence artifacts, the weekly public report must link them directly.
6. When the assignment requires a public explanation of outcomes, status, or evidence interpretation, provide a brief summary that helps reviewers understand what changed, what was verified, or what still needs attention.
7. If a team uses an artifact form, evidence pattern, or access arrangement that differs materially from the assignment's expected default, the weekly public report must state and justify that deviation explicitly.
8. The weekly public report must remain accessible and inspectable until grading is complete.
9. Maintained documentation referenced from the weekly public report must be readable and inspectable in context, not only as raw source files or bare links.
10. When a rendered or otherwise directly readable form is practical, expose that form in the maintained documentation itself or in the hosted documentation site when one is required.
11. Diagrams written directly in Markdown-capable notation such as Mermaid count as readable-in-context when included in the maintained documentation page that explains them.

**Recommended**

1. Include short summaries that help reviewers navigate the linked evidence.
2. Use consistent section ordering across assignments where practical.

## Sprint Review Artifacts

**Since: A2**

Sprint Review artifacts cover Week 2 and later review meetings with the customer or relevant stakeholder. Assignment documents may specialize the exact goals and discussion points of the review, but they should use the shared Sprint Review artifact terminology and structures below.

**Required**

1. Each required Sprint Review must produce a public sanitized summary.
2. Use a transcript when the meeting is recorded and transcript sharing is permitted by the relevant sharing channel.
3. Use notes when recording or transcript sharing is refused, or when the assignment explicitly allows notes as fallback evidence.
4. The relevant public report must state which Sprint Review evidence form was used and what publication or private-sharing permissions were granted where that affects reviewer access.

### Sprint Review Transcript

**Since: A2**

**Required**

1. Use a Sprint Review transcript when the meeting is recorded and transcript sharing is permitted by the relevant sharing channel.
2. Write the transcript in English.
3. Clean it for readability without changing meaning.
4. Place each timestamp on a separate line.
5. Remove PII and confidential business information while preserving enough context for evaluation.
6. Use `[inaudible]` and `[redacted]` where appropriate.
7. If public publication is not permitted but private instructor sharing is permitted, do not commit the transcript publicly. Link or submit it only through the private submission channel.
8. For each Sprint Review, ask separately for:
   * recording permission before recording starts
   * public transcript publication permission
   * private instructor-sharing permission if public publication is refused
9. If public publication is refused, state that explicitly in the relevant report.

### Sprint Review Notes

**Since: A2**

**Required**

1. Use Sprint Review notes when recording or transcript sharing is refused, or when the assignment explicitly allows notes as the fallback evidence.
2. Record the discussion chronologically.
3. Sanitize the notes before sharing them.
4. Include the scope reviewed, feedback, questions, decisions, approvals or requested changes, action points, risks where relevant, and resulting backlog or artifact updates.

### Sprint Review Summary

**Since: A2**

**Required**

1. Create a public sanitized summary of each required Sprint Review.
2. Include the date, participants or roles, artifacts demonstrated, scope or goal reviewed, feedback, approvals or requested changes, risks, action points, and resulting backlog or scope changes.
3. Link to affected stories, PBIs, interface artifacts, releases, milestones, or other evidence where relevant.
4. If the Sprint Review was recorded or recording was attempted, record whether recording was permitted, whether public transcript publication was permitted, and whether private instructor sharing was permitted when publication was refused.

## Reflection Artifact

**Since: A2**

**Required**

1. A reflection artifact records what the team learned during the assignment and how that learning affects later work.
2. Use a sectioned structure.
3. Unless an assignment explicitly overrides it, include at least:
   * `## Learning points`
   * `## Validated assumptions`
   * `## Friction and gaps` or `## Needs clarification`
   * `## Planned response`

## Retrospective Artifact

**Since: A3**

**Required**

1. A retrospective artifact records the team's inspection and adaptation of its process after the Sprint Review.
2. Store the retrospective at `reports/weekN/retrospective.md` unless an assignment explicitly states otherwise.
3. Keep the retrospective public and sanitized unless an assignment explicitly states otherwise.
4. Unless an assignment explicitly overrides it, include at least:
   * `## What went well`
   * `## What did not go well`
   * `## What the team changed or attempted to change based on the previous Sprint Retrospective, and what results they observed`
   * `## Action points`
5. Under `## Action points`, include one or two concrete improvement actions for the next Sprint.
6. For the first Sprint retrospective, when there is no previous Sprint retrospective, state that explicitly in the previous-retrospective follow-up section.

## LLM Report Artifact

**Since: A2**

**Required**

1. An LLM report discloses how AI or LLM tools were used during the assignment.
2. If no such tools were used, state that explicitly.
3. The report should cover the relevant forms of use such as coding, writing, prototyping, transcription, research, or idea generation where applicable.

## Screenshot Evidence Artifact

**Since: A2**

**Required**

1. Use screenshots when the assignment requires inspectable visual evidence or when public links may not be reliably inspectable by graders.
2. Use PNG unless the assignment explicitly specifies another format.
3. Sanitize screenshots before publication.
4. Refer to [Sensitive Information Types](#sensitive-information-types) for the shared list of content that must not appear in public screenshots.
5. Keep file sizes reasonable.
6. When an assignment uses a weekly `images/` directory, store the screenshots there and embed or link them from the canonical weekly public report.

## Public Sanitized Demo Video Artifact

**Since: A2**

**Required**

1. A public sanitized demo video is a public product demonstration artifact, not a private customer or UAT recording.
2. Keep it sanitized and use only sanitized demo data.
3. Refer to [Sensitive Information Types](#sensitive-information-types) for the shared list of content that must not appear in public demos.
4. Unless an assignment explicitly specifies otherwise, keep it shorter than two minutes.
5. Link it from the relevant weekly public report and release when the assignment requires those links.

## Presentation Slides Artifact

**Since: A4**

**Required**

1. Presentation slides are private-only artifacts.
2. Never commit presentation slides to the product repository, even in sanitized form.
3. Submit them only through the dedicated private submission channel required by the assignment.
4. Do not link presentation slides from public weekly reports or releases.

## Rehearsed Presentation Video Artifact

**Since: A4**

**Required**

1. Rehearsed presentation videos are private-only artifacts.
2. Never commit them to the product repository.
3. Do not link them from public weekly reports or releases.
4. Submit them only through the private submission channel required by the assignment.

## UAT Public Result Summary Artifact

**Since: A4**

**Required**

1. A UAT public result summary may be a standalone artifact or an embedded section of another artifact when the assignment allows that structure.
2. Summarize which UAT scenarios passed, which failed or need product changes, the main feedback points received, and the resulting PBIs or issues.
3. Do not expose private customer information in the public summary.

## Moodle PDF Submission Wrapper Artifact

**Since: A2**

**Required**

1. The Moodle PDF or equivalent private submission wrapper is the canonical private artifact unless an assignment explicitly defines another private wrapper.
2. It must wrap and link public and private evidence for the assignment rather than duplicating full public artifact content unnecessarily.
3. It must identify the submission clearly enough for instructors to match the wrapper to the team and the intended repository state.
4. It must link the canonical public artifact and any required public permalinks instead of restating the full public report unnecessarily.
5. It may include instructor-only evidence that must not be committed publicly.
6. It must include required private-only evidence such as recording links, private transcripts or notes, private access instructions, limited-permission credentials, consent evidence, or other instructor-only materials when the assignment requires them.
7. Use commit-hash permalinks when the assignment requires permalinks to the report or repository state.
8. Include private timecodes where the assignment requires exact timecodes for recordings.

## Boards and Views as Artifacts

**Since: A3**

**Required**

1. Boards and saved views used as Product Backlog, Sprint Backlog, MVP scope, or similar inspectable workflow artifacts must remain accessible and inspectable.
2. Use saved or stable platform views where practical rather than ad hoc filters that reviewers cannot reconstruct easily.
3. These artifacts must reflect the authoritative issue and milestone state required by the relevant process semantics.

## Milestone Artifact Requirements

**Since: A3**

**Required**

1. A Sprint milestone or equivalent Sprint container is an artifact that must remain inspectable.
2. It must contain or clearly expose the Sprint Goal, Sprint dates, selected Sprint PBIs, and current workflow state where the platform supports those views.
3. Preserve milestone evidence long enough for grading and later traceability.

## Release Artifact Requirements

**Since: A3**

**Required**

1. A release is an artifact that preserves delivered increment evidence.
2. It must remain inspectable and linkable.
3. When the assignment uses a canonical public report for the delivered increment, the release must link that report.
4. It must link the relevant changelog and other supporting artifacts required by the assignment.
5. It must link the applicable product access artifact.
6. It must link run or access instructions.
7. It must link the public sanitized demo video when the assignment requires that demo video.
8. It must include or link built artifacts where applicable.
9. Preserve mapped release evidence until the course has been graded.

## Recording Artifacts and Timecodes

**Since: A2**

**Required**

1. Private customer recordings, private instructor-only transcripts or notes, and exact private timecodes are private-only artifacts unless an assignment explicitly permits sanitized public publication.
2. For each recorded Sprint Review or UAT meeting, ask separately for:
   * recording permission before recording starts
   * public transcript publication permission when a transcript may be produced and published
   * private instructor-sharing permission if public publication is refused
3. If public publication is refused, state that explicitly in the relevant report.
4. When one recording covers multiple required activities, such as Sprint Review and customer-executed UAT, include exact private timecodes when the assignment requires them.

## Maintained Docs Artifacts

**Since: A3**

Maintained documentation artifacts are public unless an assignment explicitly states otherwise. Keep them readable, inspectable, linked from the relevant canonical report artifact, and current as later project work changes the product or process they describe.

### `docs/user-stories.md`

**Since: A3**

**Required**

1. `docs/user-stories.md` is the authoritative current registry of stable user-story IDs and current user-story membership when a team uses that artifact.
2. It must index all user stories for traceability, including removed stories with preserved stable IDs.
3. Mirror enough live issue metadata for quick traceability, such as issue link, requirement status, current Work Status, and Sprint assignment where applicable.
4. Do not use it as the detailed Sprint execution plan.
5. Do not duplicate full mutable story content there after migration to the issue tracker.

### `docs/interface.md`

**Since: A2**

**Required**

1. When an assignment requires `docs/interface.md`, use it as the maintained interface specification for non-graphical externally used interfaces or other explicitly required interface documentation.
2. Describe the interface type, intended users, commands/messages/functions, inputs, outputs, success examples, error examples, and authentication or configuration where relevant.
3. Identify which elements, if any, are implemented or mocked in the relevant product increment.

### `docs/quality-requirements.md`

**Since: A4**

**Required**

1. Use one section per quality requirement.
2. Each quality requirement must have a stable ID in the form `QR-001`.
3. Each quality requirement must explain:
   * the selected ISO/IEC 25010 quality sub-characteristic
   * why it matters for the product and stakeholders
   * the measurable scenario
   * the linked quality requirement tests that verify it
4. Specify each quality requirement as a measurable scenario using:

```text
When <source> <stimulus> under <environment>,
the <artifact> shall <response> within <response measure>.
```

5. The response measure must be concrete enough to test.
6. Starting in Assignment 5, each relevant quality requirement must link to the related ADR or ADRs that address it.

**Recommended**

Use this structure:

```markdown
## QR-001: Search response time

**ISO/IEC 25010 sub-characteristic:** Time behaviour

**Scenario:** When an end user submits a course search request under normal production-like load, the search API shall return matching results within 2 seconds for 95% of requests.

**Why this matters:** Users need quick feedback when searching available courses because slow search blocks the main workflow.

**Linked quality requirement tests:** [QRT-001](quality-requirement-tests.md#qrt-001-search-response-time)
```

### `docs/quality-requirement-tests.md`

**Since: A4**

**Required**

1. Use one section per quality requirement test.
2. Each quality requirement test must have a stable ID in the form `QRT-001`.
3. A quality requirement test is an automated test or CI check that directly verifies one or more measurable quality requirement scenarios.
4. Each quality requirement test must define:
   * stable ID
   * linked quality requirement ID
   * verification method
   * test data, setup, or environment
   * automated command or CI check
   * expected measurable result
   * evidence location
5. A quality requirement test must always be automated.
6. Required unit tests, coverage checks, type checking, or static analysis may count as quality requirement tests only when they directly verify a measurable quality requirement scenario.
7. Quality requirement tests are expected to run in CI. A non-CI QRT is allowed only with TA permission.
8. If a TA-approved non-CI QRT is used, `docs/quality-requirement-tests.md` must document the exception, automated command, inspectable report/log or generated output, and where to look for the latest result.
9. Manual quality evidence, manual reviews, observations, and UATs do not count as quality requirement tests unless a later assignment or TA-approved exception explicitly allows it.
10. Manual evidence may still be useful for testing status, exploratory findings, or follow-up PBIs even when it does not count as a QRT.

**Required**

Use this table to distinguish the main evidence types:

| Evidence type | What it means | Can it count as QRT? |
|---|---|---|
| Quality requirement | Measurable non-functional product requirement with `QR-NNN` ID. | No; it is the requirement being verified. |
| QRT | Automated test or CI check with `QRT-NNN` ID that directly verifies a measurable QR scenario. | Yes. |
| Unit test | Automated test for isolated product logic or a small module. | Only if linked to a measurable QR scenario. |
| Integration test | Automated test for interaction between product components, such as API plus persistence or UI component plus state/API boundary. | Only if linked to a measurable QR scenario. |
| UAT | Customer-executed end-user scenario. | No. |
| Manual evidence | Observation, review, screenshot, or exploratory check. | No. |

**Recommended**

Use this structure:

```markdown
## QRT-001: CI type-check feedback time

**Linked quality requirement:** QR-001

**Verification method:** Automated CI check.

**Test data, setup, or environment:** Standard CI build environment for pull requests and protected default-branch updates.

**Automated command or CI check:** CI type-checking or static-analysis job.

**Expected measurable result:** The gate completes in 5 seconds or less and fails when type or interface errors are detected.

**Evidence link:** Latest protected default-branch CI run showing the job result and duration.
```

### `docs/user-acceptance-tests.md`

**Since: A4**

**Required**

1. Each maintained UAT scenario should have a stable ID in the form `UAT-001`.
2. Each maintained UAT scenario should include:
   * stable scenario ID
   * scenario status such as `Active`, `Retired`, or `Superseded`
   * user goal
   * preconditions
   * step-by-step instructions
   * expected outcome for each important step or for the scenario as a whole
   * assignment-specific execution results when required
   * customer comments or observed issues after execution
   * resulting PBIs or issues after execution
3. Keep UAT IDs stable.
4. Preserve UAT execution history when an assignment requires customer execution evidence.

### `docs/development-process.md`

**Since: A5**

**Required**

1. `docs/development-process.md` is the canonical maintained documentation artifact for the team's current actual development process.
2. It must describe the process the team actually uses in the repository, not an aspirational workflow that differs materially from current practice.
3. It must describe the boards, views, or equivalent platform configurations used to manage the Product Backlog and Sprint Backlog.
4. It must define the workflow states, columns, or equivalent board statuses the team uses and the entry criteria for moving work into each state.
5. It must describe the team's git and review workflow, including:
   * the base workflow adapted to the team context
   * how issues are created and used
   * how branches are created and named
   * how changes are submitted through PRs or MRs
   * how review is performed
   * how changes are merged
   * how issues are resolved or closed
6. It must describe the team's configuration and secrets-management approach, including where relevant:
   * where secrets are stored without revealing them
   * which files remain ignored
   * how runtime configuration is supplied to the product
   * how CI or deployment configuration is handled
   * which sanitized example configuration artifacts are committed
7. It must describe the team's reproducible development environment expectations relevant to the repository, such as a Nix shell, `devenv`, containerized setup, package-manager workflow, or another defined setup path where applicable.
8. It must describe the CI process and whether the team uses deployment automation or continuous delivery.
9. Keep it directly readable and navigable in place rather than using it only as a link list to raw repository paths or external tools.

### `docs/architecture/README.md`

**Since: A5**

**Required**

1. `docs/architecture/README.md` is the canonical maintained architecture index artifact.
2. It must describe the current delivered architecture and link the relevant supporting architecture artifacts.
3. It must include clearly readable sections for the maintained architecture views required by the relevant assignment.
4. It must link the maintained architecture view directories:
   * `docs/architecture/static-view/`
   * `docs/architecture/dynamic-view/`
   * `docs/architecture/deployment-view/`
5. It must include the ADR index home for the maintained ADR set and link the relevant ADRs in context.
6. It must make the architecture views readable in context rather than providing only bare links or separate source files without explanation.
7. When diagrams or other view artifacts have separate source and rendered forms, expose the directly readable form in the maintained documentation where practical and link the source form.
8. The shared default maintained architecture structure starting in Assignment 5 uses `static-view/`, `dynamic-view/`, and `deployment-view/`. A later assignment may explicitly replace or extend that default structure.

### `docs/architecture/static-view/`

**Since: A5**

**Required**

1. `docs/architecture/static-view/` is the default maintained location for static-view artifacts starting in Assignment 5.
2. Store the maintained source artifacts for the static architecture view there.
3. If rendered artifacts such as SVG or PNG are used for readability, keep or link both source and rendered forms where practical.

### `docs/architecture/dynamic-view/`

**Since: A5**

**Required**

1. `docs/architecture/dynamic-view/` is the default maintained location for dynamic-view artifacts starting in Assignment 5.
2. Store the maintained source artifacts for the dynamic architecture view there.
3. If rendered artifacts such as SVG or PNG are used for readability, keep or link both source and rendered forms where practical.

### `docs/architecture/deployment-view/`

**Since: A5**

**Required**

1. `docs/architecture/deployment-view/` is the default maintained location for deployment-view artifacts starting in Assignment 5.
2. Store the maintained source artifacts for the deployment architecture view there.
3. If rendered artifacts such as SVG or PNG are used for readability, keep or link both source and rendered forms where practical.

### `docs/architecture/adr/`

**Since: A5**

**Required**

1. `docs/architecture/adr/` is the maintained location for Architecture Decision Record files.
2. Store each ADR as a separate file using this filename pattern:

   ```text
   ADR-001-short-description.md
   ```

3. Use a stable descriptive filename slug after creation unless a correction is clearly necessary.
4. The filename slug should be lowercase and hyphen-separated.
5. `docs/architecture/README.md` is the required index home for the ADR set. A separate `docs/architecture/adr/README.md` file is not required.

### Hosted Documentation Site

**Since: A5**

**Required**

1. Starting in Assignment 5, publish the maintained documentation as a browsable hosted documentation site.
2. The hosted documentation site is a public supporting artifact for the maintained documentation set.
3. It must expose the maintained documentation as browsable, readable, and navigable pages clearly enough that reviewers can inspect the current product, process, architecture, quality, and testing documentation without reading raw repository paths first.
4. When architecture diagrams or other maintained documentation are shown in context inside repository Markdown files, preserve an equally readable presentation in the hosted documentation site where practical.
5. Link the hosted documentation site from the relevant weekly public report.
6. Keep the hosted documentation site accessible until grading is complete.

### `docs/testing.md`

**Since: A4**

**Required**

1. `docs/testing.md` is the canonical testing status overview artifact.
2. `docs/quality-requirement-tests.md` is the canonical detailed QRT artifact.
3. `docs/testing.md` must show, at minimum:
   * critical modules and their coverage status
   * unit test status
   * integration test status
   * automated quality requirement test status
   * linting, formatting, type checking, and additional QA check status
   * links or references to where to find the detailed QRT definitions and evidence
   * additional QA check objective or risk addressed, scope, where to look for the latest result, evidence, and limitations or follow-up work
   * CI links, latest protected-default-branch result, and branch protection or rules evidence
   * manual test evidence where automation is not feasible and where the evidence does not count as a quality requirement test
   * which Assignment 4 quality gates remain active for later project work, or which documented replacements supersede them
4. The testing baseline includes Lychee link checking according to [Product Repository Requirements](Repository_Requirements.md#lychee-link-checking).
5. Starting in Assignment 4, maintain at least one additional automated QA check beyond Lychee.

**Recommended**

Use this structure unless an assignment explicitly requires another structure:

```markdown
## Critical Modules and Coverage

| Critical module | Why critical | Required line coverage | Current line coverage | Evidence |
|---|---|---:|---:|---|
| `src/search.ts` | Main user workflow. | 30% | 42% | [Coverage run](...) |

## Automated Test Status

| Test type | Scope | Command or CI check | Latest result | Evidence |
|---|---|---|---|---|
| Unit tests | Critical product logic | `npm test -- --coverage` | Passing | [CI run](...) |
| Integration tests | API and database interaction | `npm run test:integration` | Passing | [CI run](...) |
| Automated QRTs | QR-001, QR-002, QR-003 | `npm run test:quality` | Passing | [QRT report](...) |

## Additional QA Checks

### Dependency Vulnerability Scan

**Rationale:** Dependencies with known vulnerabilities may expose users or deployments to avoidable risk.

**Scope:** Product dependency manifests and lockfiles.

**Where to look for the latest result:** Linked CI run for the dependency vulnerability scan.

**Evidence:** [CI run](...)

**Limitations or follow-up:** Some vulnerabilities may require manual triage or delayed upstream fixes.

## CI and QA Check Status

| Gate or check | Required for Done? | Latest protected-branch status | Evidence |
|---|---|---|---|
| Linting | Yes | Passing | [CI run](...) |
| Formatting or type checking | Yes | Passing | [CI run](...) |
| Additional QA check | Yes | Passing | [Check report](...) |
```

### `docs/definition-of-done.md`

**Since: A3**

**Required**

1. `docs/definition-of-done.md` defines the team's shared minimum completion standard for work in that repository.
2. It must require, at minimum:
   * all issue acceptance criteria are satisfied
   * the work is reviewed by another team member
   * for user stories, the linked supporting PBIs provide the required implementation, review, and verification evidence
   * required tests or checks pass
   * relevant quality requirements and quality requirement tests are satisfied or explicitly documented as not applicable
   * relevant architecture documentation is satisfied or explicitly documented as not applicable after architecture documentation is introduced in Assignment 5
   * CI quality gates pass before merge when CI is configured for the repository
   * verification evidence is preserved in the normal workflow artifacts

### `docs/roadmap.md`

**Since: A3**

**Required**

1. `docs/roadmap.md` is the Sprint-by-Sprint delivery plan.
2. It must not duplicate the full user-story index or repeat full mutable issue content that already lives in the issue tracker.
3. Structure the roadmap as a list of Sprints. For each Sprint, include:
   * Sprint name or number
   * link to the corresponding Sprint milestone
   * Sprint start and finish dates
   * Sprint Goal
   * short focus or expected outcome statement
   * linked planned items for that Sprint, such as user stories and supporting PBIs
4. Keep the roadmap lightweight and traceable:
   * use links to issues or other tracked PBIs instead of copying their full descriptions
   * summarize the intended Sprint outcome briefly instead of restating backlog metadata such as MoSCoW priority, Requirement status, Work Status, or full acceptance criteria
