# Feature Specification: ChoreCue Phase 1 MVP

**Feature Branch**: `001-phase1-chore-loop`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "Phase 1 MVP shared chore tracker for creating recurring chores, completing them, reviewing due states, and sending polite bumps"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create And Track Chores (Priority: P1)

A household member creates a recurring chore with an assignee and schedule so the household can reliably see what needs attention next.

**Why this priority**: Without chore creation and visible due state, the product does not solve the core MVP problem of losing track of recurring household work.

**Independent Test**: Can be fully tested by creating chores for each supported recurrence type and confirming they appear in the shared list with the correct assignee and next due state.

**Acceptance Scenarios**:

1. **Given** a household member is adding a new chore, **When** they enter a title, assignee, category, and a supported recurrence rule and save it, **Then** the system stores the chore and shows it in the shared list.
2. **Given** a chore uses an every-`N`-days recurrence, **When** the chore is saved, **Then** the system calculates and stores the next due value from that recurrence rule.
3. **Given** a chore uses a weekly-on-a-day or daily-at-a-time recurrence, **When** the chore is saved, **Then** the system calculates and stores the next due value from that recurrence rule.

---

### User Story 2 - Complete Chores And Reset Timing (Priority: P2)

A household member marks a chore complete and expects the system to preserve the completion record while recalculating when that chore is due next.

**Why this priority**: Accurate completion history and schedule reset are central to trust in the product and directly support the main household tracking loop.

**Independent Test**: Can be fully tested by completing an existing chore and verifying that the completion timestamp and next due state both update correctly without requiring any bump flow.

**Acceptance Scenarios**:

1. **Given** a chore is visible in the shared list, **When** a household member marks it complete, **Then** the system records the completion timestamp for that chore.
2. **Given** a chore has just been marked complete, **When** the completion is saved, **Then** the system recalculates the next due value according to the chore's recurrence rule.
3. **Given** a chore has a prior completion history, **When** it is completed again, **Then** the latest completion is reflected without losing the chore's core details.

---

### User Story 3 - Review Due State Quickly (Priority: P3)

A household member opens the app and quickly understands which chores are overdue, due, or upcoming so they can decide what to do next without extra navigation.

**Why this priority**: The app needs to make the state of household work obvious at a glance, but it depends on chores already existing and due-state calculations already working.

**Independent Test**: Can be fully tested by loading a list containing overdue, due, and upcoming chores and confirming the list groups and ordering communicate what needs attention first.

**Acceptance Scenarios**:

1. **Given** the household has chores in multiple due states, **When** a household member opens the main list, **Then** overdue, due, and upcoming chores are clearly distinguishable.
2. **Given** chores exist in all three states, **When** the list is displayed, **Then** overdue chores appear before due chores and due chores appear before upcoming chores.
3. **Given** a visible chore in the list, **When** a household member reviews it, **Then** they can understand what the chore is, who it belongs to, and its last completed or due context.

---

### User Story 4 - Send Polite Bumps With Limits (Priority: P4)

A household member sends a polite reminder tied to a chore, while the system limits repeated nudges so the app stays helpful instead of becoming a source of tension.

**Why this priority**: Polite accountability is part of the Phase 1 value proposition, but it builds on the core chore and due-state workflows already being in place.

**Independent Test**: Can be fully tested by sending bumps for an eligible chore and confirming that the system allows the first five bumps from a sender in one day and blocks the sixth.

**Acceptance Scenarios**:

1. **Given** a chore is assigned to another household member, **When** a user sends a bump from that chore, **Then** the reminder stays associated with the specific chore and intended recipient.
2. **Given** a user has sent fewer than five bumps on the current day, **When** they send another eligible bump, **Then** the system accepts it using polite reminder wording.
3. **Given** a user has already sent five bumps on the current day, **When** they attempt a sixth bump, **Then** the system blocks it and preserves the daily limit.

### Edge Cases

- What happens when a household member tries to save a chore without one of the required fields such as title, assignee, category, or recurrence rule?
- How does the system handle a chore whose next due value would otherwise become ambiguous after editing its recurrence rule?
- What happens when a user attempts to bump a chore that is unassigned, assigned to themselves, archived, or otherwise not eligible for reminder sending?
- How does the list behave when no chores exist yet or when all chores belong to the same due-state bucket?
- What happens when a user reaches the daily bump limit and the day boundary changes before their next attempt?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a household member to create a chore with a title, assignee, category, and recurrence rule.
- **FR-002**: The system MUST allow a chore to include an optional description and optional photo.
- **FR-003**: The system MUST support these recurrence types in Phase 1: every `N` days, weekly on a selected day, and daily at a specified time.
- **FR-004**: The system MUST calculate and store a next due value whenever a chore is created.
- **FR-005**: The system MUST persist the last completed timestamp for each chore.
- **FR-006**: The system MUST recalculate and store the next due value whenever a chore is marked complete.
- **FR-007**: The system MUST display chores in a shared list with overdue, due, and upcoming states.
- **FR-008**: The system MUST order chore visibility so overdue chores appear before due chores and due chores appear before upcoming chores.
- **FR-009**: The system MUST show enough chore metadata in the shared list for a household member to understand the chore, its assignee, and its completion or due context.
- **FR-010**: The system MUST allow a household member to mark a chore complete from the chore list or a chore detail flow.
- **FR-011**: The system MUST allow a household member to edit an existing chore.
- **FR-012**: The system MUST allow a household member to archive an existing chore.
- **FR-013**: The system MUST allow a household member to send a polite bump tied to a specific chore and assignee.
- **FR-014**: The system MUST prevent the sixth bump from the same sender within the same day.
- **FR-015**: The system MUST keep the primary workflow usable for a very small household without requiring advanced role or permission setup.
- **FR-016**: The system MUST keep the Phase 1 interface mobile-first and usable at wireframe fidelity across the supported product surfaces.

### Key Entities *(include if feature involves data)*

- **HouseholdMember**: A person in the small shared household who can create chores, complete them, and send bumps.
- **Chore**: The primary tracked household task containing title, category, assignee, recurrence settings, optional description, optional photo, last completed timestamp, and next due state.
- **RecurrenceRule**: The scheduling definition that determines how a chore's next due value is calculated.
- **ChoreCompletion**: A completion record tied to a chore and timestamp so the system can preserve history and update due calculations.
- **BumpEvent**: A reminder record tied to a sender, recipient, chore, and timestamp so the system can enforce polite bump behavior and daily limits.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new household can create at least one chore for each supported recurrence type and each created chore immediately appears with a valid next due value.
- **SC-002**: In validation of the core chore loop, 100% of chore completion actions update both the last completed timestamp and the next due value according to the selected recurrence rule.
- **SC-003**: A household member can determine whether a chore is overdue, due, or upcoming from the main list without leaving the primary workflow.
- **SC-004**: A household member can complete the primary actions of creating a chore, marking it done, and sending a valid bump using the Phase 1 interface without requiring setup of advanced permissions or admin configuration.
- **SC-005**: The system accepts the first five bumps from a sender in a single day and rejects the sixth attempt for that same sender on that day.

## Assumptions

- Phase 1 continues to optimize for a household of roughly two people even if the underlying model can technically support a small number beyond that.
- Photo attachment remains in scope for the specification, but if storage cost or setup becomes a planning blocker it can be treated as the first candidate for post-MVP sequencing.
- Minimal celebratory or playful feedback is optional and must not expand the core Phase 1 scope unless it directly supports chore completion without adding meaningful complexity.
