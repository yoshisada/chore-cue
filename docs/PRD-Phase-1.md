# Phase 1 - MVP

Product Name: `ChoreCue`

## Goal

Ship the smallest useful shared chore tracker that helps two people remember recurring chores, mark them complete, and send limited polite bumps.

## MVP Objective

Solve the core problem of losing track of what chores need to be done and when they were last completed.

## Target MVP Users

- Couples sharing a household
- Roommates with a small set of recurring chores

## MVP Features

- Cross-platform mobile app based on [`tamagui/takeout-free`](https://github.com/tamagui/takeout-free)
- Create chores with title, optional description, and dynamic category
- Assign a chore to a person in the household
- Support core recurring schedule patterns:
  - every `N` days
  - weekly on a day
  - daily at a time
- Save and display last completed time
- Recalculate the next due time when a chore is marked complete
- Show a simple list of due, upcoming, and overdue chores
- Attach an optional photo to a chore
- Let users politely bump another person about a chore
- Enforce a limit of 5 bumps per user per day

## Explicitly Excluded Features

- Paid plans, billing, or any monetization work
- Advanced household administration such as granular roles, permissions, or support for large households
- Smart-home integrations, inventory tracking, or other adjacent home-management systems
- Rich notification systems beyond the core polite bump workflow
- Deep gamification systems such as streak economies, leaderboards, or rewards that are not required for the core chore loop

## Simplifications

- Optimize for very small households instead of broad multi-user support.
- Keep roles and permissions minimal or nonexistent.
- Use simple notification and bump templates rather than customizable messaging systems.
- Prefer one shared cross-platform codebase over platform-specific native implementations.
- Start from the Takeout Free conventions instead of designing a custom app architecture from scratch.
- Use lightweight gamification only if it does not block the core tracking experience.
- Keep the UI at wireframe fidelity with minimal styling and no polish-heavy design work in the MVP.

## User Scenarios And Testing

### Scenario 1 - Create and track a recurring chore

A household member creates a chore with a title, category, assignee, and one of the supported recurrence patterns so both people can see when it is due next.

Acceptance checks:

- A user can create a chore with the required fields and save it successfully.
- The saved chore appears in the shared list with its assignee and next due state.
- The system supports every `N` days, weekly on a day, and daily at a time as valid recurrence options.

### Scenario 2 - Complete a chore and reset its timer

A household member marks a chore complete and expects the app to preserve completion history while recalculating the next due time correctly.

Acceptance checks:

- Marking a chore complete stores the completion timestamp.
- The list updates the chore's last completed value.
- The system recalculates the next due value according to the chore's recurrence rule.

### Scenario 3 - Review what is overdue

A user opens the app and quickly understands which chores are overdue, due now, or upcoming.

Acceptance checks:

- The default list view separates overdue, due, and upcoming chores clearly.
- Overdue chores appear before due chores, and due chores appear before upcoming chores.
- Each visible chore shows enough metadata to understand what it is, who it belongs to, and when it was last completed or due.

### Scenario 4 - Send a polite bump without spamming

A user sends a reminder to their partner or roommate for a chore, but the app prevents excessive nagging.

Acceptance checks:

- A user can send a polite bump from an eligible chore.
- The recipient context stays tied to the chore being bumped.
- The system blocks the sixth bump from the same user within the same day.

## Functional Requirements

- FR1. The system must allow a household member to create a chore with a title, assignee, category, and recurrence rule.
- FR2. The system must allow a chore to include an optional description and optional photo.
- FR3. The system must support these recurrence types in Phase 1: every `N` days, weekly on a selected day, and daily at a specified time.
- FR4. The system must persist the last completed timestamp for each chore.
- FR5. The system must recalculate and store the next due value whenever a chore is created or marked complete.
- FR6. The system must display chores in shared overdue, due, and upcoming states.
- FR7. The system must allow a household member to mark a chore complete from the chore list or chore detail flow.
- FR8. The system must allow a household member to edit or archive an existing chore.
- FR9. The system must allow a household member to send a polite bump tied to a specific chore and assignee.
- FR10. The system must enforce a maximum of 5 bumps per user per day.
- FR11. The system must remain usable in a wireframe-level mobile-first interface on the supported cross-platform surfaces.
- FR12. The system must optimize the primary workflow for a very small household and must not require complex role or permission setup.

## Key Entities

- `HouseholdMember`: a person in the shared household who can create chores, complete chores, and send bumps.
- `Chore`: the primary tracked record containing title, description, category, assignee, recurrence settings, optional photo, last completed timestamp, and next due state.
- `RecurrenceRule`: the scheduling definition that determines how the next due value is calculated.
- `ChoreCompletion`: a timestamped completion event used to preserve history and reset the schedule.
- `BumpEvent`: a reminder event tied to a sender, recipient, chore, timestamp, and daily rate-limit checks.

## MVP Success Criteria

- A new household can create at least one chore for each supported recurrence type and see a valid next due value for all of them.
- Completing a chore always updates both the last completed timestamp and the next due value in line with its recurrence rule.
- A user can identify which chores are overdue, due, and upcoming within a single list view without leaving the core workflow.
- The app allows polite bumps for eligible chores and rejects the sixth bump from the same user on the same day.
- The Phase 1 scope remains limited to the shared chore loop without adding advanced administration, smart-home features, or nonessential gamification.

## Assumptions

- MVP should ship as quickly as possible.
- Cheap or free deployment is a major constraint.
- `tamagui/takeout-free` is the initial project scaffold.
- Expo, Tamagui, and One are the default app-layer stack.
- PostgreSQL, Zero, Better Auth, and Drizzle are the default data/auth stack.
- The core value comes from accuracy of recurrence, visibility of due chores, and completion history.

## Open Questions

- Whether photo attachment should ship in the first release or move immediately after the initial core loop if storage setup proves too expensive.
- Whether Phase 1 should include any minimal celebratory feedback for chore completion, or leave gamification entirely out of the first ship.
