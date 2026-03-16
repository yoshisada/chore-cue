# Startup Requirements Intake

## 1. Product Definition

- Status: FILLED
- Source: `docs/PRD-Phase-1.md` Goal, MVP Objective
- Notes: Phase 1 is the smallest useful shared chore tracker for a very small household. It must help two people create recurring chores, understand when chores are due, complete them, and send limited polite bumps.

## 2. Target Users

- Status: FILLED
- Source: `docs/PRD-Phase-1.md` Target MVP Users
- Notes: Primary users are couples sharing a household. Secondary users are roommates with a small set of recurring chores. Larger or operationally complex household use cases remain out of scope.

## 3. Product Scope Boundaries

- Status: FILLED
- Source: `docs/PRD-Phase-1.md` MVP Features, Explicitly Excluded Features, Simplifications
- Notes: Current scope includes chore creation, assignment, three recurrence patterns, completion tracking, due-state visibility, optional photo attachment, editing or archiving, and polite bumping with a daily rate limit. Excluded scope includes billing, advanced admin or permissions, smart-home or inventory features, rich notifications, and deep gamification.

## 4. Core Pillars To Preserve

- Status: FILLED
- Source: `docs/PRD-Phase-1.md` Goal, Simplifications, MVP Success Criteria
- Notes: Preserve the shared chore loop, keep coordination polite, optimize for a two-person household, keep recurrence behavior accurate, ship the smallest coherent cross-platform slice, and keep the interface wireframe-level and mobile-first.

## 5. Actor And Profile Requirements

- Status: PARTIAL
- Source: `docs/PRD-Phase-1.md` MVP Features, Functional Requirements, Key Entities
- Notes: Main actors are household members who can create chores, complete chores, and send bumps. The PRD implies each member needs a name or visible identity sufficient for assignment and bump targeting, but it does not define a full profile schema. Roles and permissions should stay minimal or nonexistent in Phase 1.

## 6. Core Workflow Requirements

- Status: FILLED
- Source: `docs/PRD-Phase-1.md` MVP Features, User Scenarios And Testing, Functional Requirements
- Notes: Core workflows are create a chore, view shared due-state lists, complete a chore and reset its timer, edit or archive a chore, and send a polite bump tied to a chore. Required chore inputs are title, assignee, category, recurrence rule, with optional description and photo.

## 7. Detection, Decision, Or Recommendation Requirements

- Status: FILLED
- Source: `docs/PRD-Phase-1.md` User Scenarios And Testing, Functional Requirements
- Notes: Inputs include recurrence rules, completion timestamps, current time, assignee context, and bump actions. The system must classify chores as overdue, due, or upcoming, calculate next due values, and determine whether a bump is allowed under the 5-per-user-per-day limit.

## 8. Content, Action, And Queue Requirements

- Status: FILLED
- Source: `docs/PRD-Phase-1.md` MVP Features, User Scenarios And Testing, Functional Requirements
- Notes: The main surfaced content is a shared chore list with overdue, due, and upcoming states. Users can create, edit, archive, mark complete, attach a photo, and send a polite bump. Ordering must keep overdue chores ahead of due chores and due chores ahead of upcoming chores.

## 9. Analytics And Interface Requirements

- Status: PARTIAL
- Source: `docs/PRD-Phase-1.md` MVP Features, Simplifications, MVP Success Criteria
- Notes: The interface must be mobile-first, cross-platform, and kept at wireframe fidelity. No business analytics requirements are defined in the Phase 1 PRD, so the spec should rely on falsifiable workflow outcomes instead of KPI dashboards or monetization metrics.

## 10. Initial Entity List

- Status: FILLED
- Source: `docs/PRD-Phase-1.md` Key Entities
- Notes: Main actors: `HouseholdMember`. Main workflow records: `Chore`, `ChoreCompletion`, `BumpEvent`. Main configuration object: `RecurrenceRule`. Supporting organization data includes chore category and due-state buckets for shared list presentation.

## 11. Requirement Translation Rules

- Status: FILLED
- Source: `.codex/skills/speckit-prd-workflow/references/startup-requirements.md`
- Notes: Translate each Phase 1 capability into a testable user-visible requirement, use the four Phase 1 scenarios as the backbone for acceptance coverage, preserve scope exclusions, and treat open questions such as photo timing or celebratory feedback as assumptions or future-scope notes unless they block the MVP loop.

## 12. Minimum Start Condition

- Status: FILLED
- Source: `docs/PRD-Phase-1.md`, `.specify/memory/constitution.md`
- Notes: The Phase 1 MVP request is tied to named target users, in-scope capabilities, more than five functional requirements, multiple key entities, and measurable success criteria. Remaining gaps are non-blocking and can be captured as assumptions for specification work.
