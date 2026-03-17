# ChoreCue Constitution

## 1. Preserve The Shared Chore Loop

Every feature must strengthen the core loop of seeing what is due, marking chores complete, and keeping the next due state accurate for a very small household. Work that does not improve visibility, completion, or polite accountability belongs in future scope unless the PRD is updated.

## 2. Keep Household Coordination Polite

User-facing reminders and nudges must reduce tension rather than amplify it. Specs and implementations must preserve polite default wording, intentional notification restraint, and safeguards such as bump rate limits.

## 3. Favor Small-Household Simplicity

Specifications must optimize for couples or similarly small households before supporting larger-group complexity. New work should avoid advanced roles, permissions, or organizational behavior unless the PRD explicitly broadens the target audience.

## 4. Require Flexible Recurrence Accuracy

Chore scheduling features must treat due-state accuracy as a product requirement, not a convenience. When a chore is completed, the system must reliably persist completion history and recalculate the next due value for the supported recurrence types.

## 5. Ship The Smallest Useful Cross-Platform Slice

Feature specs must prefer the smallest coherent cross-platform workflow that solves the current user problem. Future ideas such as richer gamification, broader platform polish, or adjacent household systems must be recorded separately instead of blending into MVP scope.

## 6. Write Testable Product Specs

Every new specification must include user-visible scenarios, explicit functional requirements, at least one key entity, and measurable or falsifiable success criteria. Placeholder language such as `TBD` is not sufficient once a feature enters active specification work.

## 7. Maintain Coverage Discipline

The repository must maintain at least 80% automated test coverage at all times. Any change that would drop effective coverage below that threshold must add or update tests as part of the same work before it is considered complete.
