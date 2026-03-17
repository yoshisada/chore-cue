# Research: ChoreCue Phase 1 MVP

## Decision 1: Use the PRD's proposed cross-platform stack as the implementation baseline

**Decision**: Plan Phase 1 around a shared Expo and Tamagui application with One for app structure, a PostgreSQL-backed service layer, Better Auth for authentication, and Drizzle ORM for schema management.

**Rationale**: The Phase 1 PRD already names this stack as the intended baseline, and the repo currently has no competing implementation to constrain us. Reusing the declared baseline reduces setup churn and keeps planning aligned with the product's cross-platform and low-cost goals.

**Alternatives considered**:

- A custom mobile stack with platform-specific apps: rejected because it expands implementation cost and slows the smallest useful release.
- A web-only first slice: rejected because the PRD explicitly treats mobile as the primary product surface.

## Decision 2: Keep the household model intentionally simple

**Decision**: Treat a household as a small shared container with two primary members in Phase 1, without advanced roles, permission matrices, or multi-household switching requirements.

**Rationale**: The constitution and PRD both emphasize small-household simplicity. A lightweight household model supports assignment, completion, and bumping without the extra administration that the MVP explicitly excludes.

**Alternatives considered**:

- Granular role-based access controls: rejected because they solve a larger-household problem outside Phase 1.
- Shared anonymous usage with no member identity: rejected because assignment and bumping require visible actor identity.

## Decision 3: Represent recurrence with three explicit modes

**Decision**: Define recurrence as one of three supported rule types: every `N` days, weekly on a selected day, or daily at a specified time.

**Rationale**: These are the only recurrence patterns committed in Phase 1. Encoding them explicitly keeps validation, due calculation, and acceptance testing concrete and lowers the risk of ambiguous or under-tested scheduling behavior.

**Alternatives considered**:

- A generic rule engine for future recurrence patterns: rejected because it adds complexity before the MVP needs it.
- Hard-coded recurrence directly on the chore record with no separate rule model: rejected because it makes validation and future extension harder.

## Decision 4: Keep photo support in scope but structurally optional

**Decision**: Model photo attachment as an optional chore asset reference that does not block the core create, list, complete, or bump loop if storage integration lands later in implementation.

**Rationale**: The PRD includes optional photo support in Phase 1 while also flagging storage cost as an open question. An optional asset reference preserves feature scope without forcing the rest of the MVP to depend on file storage readiness.

**Alternatives considered**:

- Dropping photos from the plan entirely: rejected because it would narrow the approved Phase 1 scope too early.
- Making photos mandatory or central to the flow: rejected because the core product value comes from recurrence visibility and completion history, not media handling.

## Decision 5: Rate-limit bumps by sender and day

**Decision**: Enforce polite bump limits using sender-scoped daily counts, with each bump tied to a specific chore and recipient.

**Rationale**: This matches the functional requirements directly and keeps the rule easy to explain, test, and surface in the user experience. It also preserves the PRD's goal of neutral reminders without opening broader notification-management scope.

**Alternatives considered**:

- Rate limiting by chore only: rejected because a sender could still spam multiple chores in one day.
- Rate limiting by household only: rejected because it over-constrains the tiny household use case and obscures responsibility for reminder behavior.
