# Quickstart: ChoreCue Phase 1 MVP

## Purpose

This quickstart describes the intended implementation sequence for the Phase 1 MVP defined in [spec.md](C:\Users\yoshisada\Documents\GitHub\chore-cue\specs\001-phase1-chore-loop\spec.md).

## Preconditions

- The repository has Spec Kit initialized and the active branch is `001-phase1-chore-loop`.
- The Takeout Free starter or equivalent application scaffold has been added to the repo before implementation begins.
- Local tooling supports Bun, Docker, and the selected TypeScript application stack from the PRD.

## Recommended Build Order

1. Create the baseline application structure for the mobile client, backend service, shared database package, and test directories.
2. Implement the core data model for households, members, chores, recurrence rules, completions, and bump events.
3. Build recurrence calculation logic first and verify all three supported recurrence patterns with unit tests.
4. Expose the minimum backend contract for chore list retrieval, chore creation or editing, completion recording, and polite bump actions.
5. Implement the mobile-first chore list and chore creation flow at wireframe fidelity.
6. Add completion, edit, archive, and bump actions to the chore flows.
7. Add optional photo attachment support without blocking the main create or complete loop.
8. Validate the success criteria with integration and contract checks before moving to deeper polish.

## Verification Focus

- Creating chores for all three recurrence modes results in valid next due values.
- Completing a chore updates both completion history and due-state calculations.
- The main list makes overdue, due, and upcoming work understandable at a glance.
- The system accepts the first five bumps from a sender in one day and rejects the sixth.

## Deferred Work

- Rich notifications beyond the core polite bump flow
- Advanced household roles or administration
- Deep gamification systems
- Broader web-first polish or adjacent household-management features
