# ADR-003: Mermaid Maintained Architecture Diagrams

**Status:** Accepted

**Date:** 2026-07-03

**Quality requirements addressed:** [QR-002](../../quality-requirements.md#qr-002-type-check-feedback-for-crawler-changes)

## Context

Assignment 5 requires maintained diagrams-as-code for static, dynamic, and deployment architecture views. The team needs diagrams that are reviewable in PRs, readable in GitHub Markdown, and easy to keep current as the product changes.

## Decision

Use Mermaid source files stored under `docs/architecture/static-view/`, `docs/architecture/dynamic-view/`, and `docs/architecture/deployment-view/`. The architecture README embeds matching Mermaid diagrams in context and links the source files.

## Consequences

Architecture changes can be reviewed as text in normal PR workflow and rendered directly by GitHub Markdown. This supports maintainability and analysability by keeping architecture evidence close to the implementation and QA documentation. The tradeoff is that Mermaid is less expressive than full UML tooling for some notation details, so complex future views may need PlantUML or another diagrams-as-code tool if Mermaid becomes limiting.
