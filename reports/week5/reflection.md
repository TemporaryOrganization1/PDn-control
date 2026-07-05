# Week 5 Reflection

During Week 5 the team learned that delivering an increment is only part of the work. The product also needs maintainable evidence that explains how it is built, why important decisions were made, how it is tested, and how future team members can safely change it.

Architecture documentation was one of the most useful additions. Creating static, dynamic, and deployment views helped the team describe the system as a set of services and interactions instead of only a collection of files. It also made the important boundaries clearer: frontend/proxy, main backend, crawler workers, GeoIP service, PostgreSQL, PDF storage, SMTP, and external APIs.

Writing ADRs helped the team capture the reasoning behind decisions such as Docker Compose service boundaries, asynchronous crawler workers, and diagrams-as-code. This was useful because it connects technical choices to quality requirements such as dispatch responsiveness, invalid input protection, and maintainability.

The development-process and configuration-management documentation also improved the project. It clarified how issues, PRs, review, CI, environment variables, and secrets should be handled. This matters because the product now depends on more runtime configuration, including email verification and deployment settings.

The Sprint Review showed that `MVP v2` made progress, especially with email verification and the maintained documentation set, but also that the product still needs stronger visual design. The customer feedback made the next direction clear: improve the product presentation, make the interface feel more trustworthy, and add more useful visual evidence to reports.

Overall, Week 5 moved the project from just shipping functionality toward maintaining a product with architecture, process, quality, release, and customer-feedback traceability.
