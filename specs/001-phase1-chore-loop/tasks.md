# Tasks: ChoreCue Phase 1 MVP

**Input**: Design documents from `/specs/001-phase1-chore-loop/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include unit, contract, and integration tasks because the plan and quickstart require validation of recurrence accuracy, chore workflows, and API behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Mobile client: `apps/mobile/`
- Backend service: `apps/backend/`
- Shared packages: `packages/`
- Cross-cutting tests: `tests/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the planned app, backend, shared packages, and baseline developer tooling.

- [X] T001 Create the Phase 1 workspace structure in `apps/mobile/`, `apps/backend/`, `packages/db/`, `packages/shared/`, `packages/ui/`, and `tests/`
- [X] T002 Initialize the mobile app baseline from the Takeout Free scaffold at the repository root
- [X] T003 Initialize the backend service workspace and package manifest in `apps/backend/`
- [X] T004 [P] Initialize the shared database package in `packages/db/`
- [X] T005 [P] Initialize the shared types and utilities package in `packages/shared/`
- [X] T006 [P] Initialize the shared UI package in `packages/ui/`
- [X] T007 Configure repository-level TypeScript, Bun workspace, and environment files in `package.json`, `tsconfig.base.json`, and `.env.example`
- [X] T008 [P] Configure linting and formatting in `eslint.config.*`, `biome.json` or equivalent config files at the repository root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the core infrastructure that all user stories depend on.

- [X] T009 Define the Phase 1 database schema for households, members, chores, recurrence rules, completions, bump events, and photo assets in `packages/db/src/schema/`
- [X] T010 Create the initial database migration for the Phase 1 schema in `packages/db/drizzle/`
- [X] T011 [P] Implement shared domain types for due buckets, recurrence modes, and chore summaries in `packages/shared/src/chore/`
- [X] T012 [P] Implement recurrence validation and next-due calculation utilities in `apps/backend/src/recurrence/`
- [X] T013 [P] Implement the household and member data access layer in `apps/backend/src/households/`
- [X] T014 Implement the chore repository and service foundation in `apps/backend/src/chores/`
- [X] T015 [P] Implement Better Auth integration and household-scoped request context in `apps/backend/src/auth/`
- [X] T016 [P] Implement backend API bootstrap, routing, and shared error handling in `apps/backend/src/app/`
- [X] T017 [P] Add unit coverage for recurrence calculation edge cases in `tests/unit/recurrence/recurrence-service.test.ts`
- [X] T018 [P] Add contract test scaffolding for the Phase 1 API surface in `tests/contract/phase1-api/`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Create And Track Chores (Priority: P1) MVP

**Goal**: Let a household member create recurring chores and see them in the shared list with correct due-state information.

**Independent Test**: Create chores for every supported recurrence type and confirm they appear in the shared list with the correct assignee and next due state.

- [X] T019 [P] [US1] Add contract coverage for list and create chore endpoints in `tests/contract/phase1-api/chore-list-create.contract.test.ts`
- [X] T020 [P] [US1] Add integration coverage for chore creation and initial list visibility in `tests/integration/chore-create-and-list.integration.test.ts`
- [X] T021 [P] [US1] Implement chore creation request validation and DTO mapping in `apps/backend/src/chores/contracts/create-chore.ts`
- [X] T022 [US1] Implement chore creation and listing handlers in `apps/backend/src/chores/chore.controller.ts`
- [X] T023 [US1] Implement chore creation and list-query business logic in `apps/backend/src/chores/chore.service.ts`
- [X] T024 [P] [US1] Implement the shared due-bucket mapping logic for chore lists in `packages/shared/src/chore/due-buckets.ts`
- [X] T025 [P] [US1] Create the household chore list screen in `apps/mobile/features/chores/screens/ChoreListScreen.tsx`
- [X] T026 [P] [US1] Create the chore creation screen and form state in `apps/mobile/features/chores/screens/CreateChoreScreen.tsx`
- [X] T027 [P] [US1] Create reusable chore form components for title, category, assignee, and recurrence inputs in `apps/mobile/features/chores/components/ChoreForm/`
- [X] T028 [US1] Wire chore queries and create mutations into the mobile client in `apps/mobile/features/chores/data/choreClient.ts`
- [X] T029 [US1] Implement wireframe due-state sections and chore summary cards in `apps/mobile/features/chores/components/ChoreList/`

**Checkpoint**: User Story 1 should support chore creation and due-state visibility on its own.

---

## Phase 4: User Story 2 - Complete Chores And Reset Timing (Priority: P2)

**Goal**: Let a household member mark a chore complete and have the app preserve completion history while recalculating the next due value.

**Independent Test**: Complete an existing chore and verify that both the completion timestamp and next due value update correctly without using bump functionality.

- [X] T030 [P] [US2] Add contract coverage for chore completion in `tests/contract/phase1-api/chore-completion.contract.test.ts`
- [X] T031 [P] [US2] Add integration coverage for completion history and due recalculation in `tests/integration/chore-completion.integration.test.ts`
- [X] T032 [P] [US2] Implement the completion record model and mapper in `apps/backend/src/chores/completions/completion.mapper.ts`
- [X] T033 [US2] Implement the chore completion command handler in `apps/backend/src/chores/completions/complete-chore.ts`
- [X] T034 [US2] Extend the chore service to update `lastCompletedAt` and `nextDueAt` after completion in `apps/backend/src/chores/chore.service.ts`
- [X] T035 [US2] Add the completion endpoint to the chore controller in `apps/backend/src/chores/chore.controller.ts`
- [X] T036 [P] [US2] Add complete-chore action UI to chore cards and detail views in `apps/mobile/features/chores/components/CompleteChoreAction.tsx`
- [X] T037 [US2] Surface last-completed and refreshed due-state values in `apps/mobile/features/chores/components/ChoreList/`
- [X] T038 [US2] Add completion mutation handling and optimistic refresh logic in `apps/mobile/features/chores/data/choreClient.ts`

**Checkpoint**: User Stories 1 and 2 should both work independently, with accurate recurrence reset after completion.

---

## Phase 5: User Story 3 - Review Due State Quickly (Priority: P3)

**Goal**: Make overdue, due, and upcoming chores easy to understand at a glance from the main list.

**Independent Test**: Load a household with chores in multiple due states and confirm the list clearly separates and orders them for quick scanning.

- [X] T039 [P] [US3] Add integration coverage for due-state grouping and ordering in `tests/integration/chore-list-ordering.integration.test.ts`
- [X] T040 [P] [US3] Add unit coverage for due-bucket assignment and ordering rules in `tests/unit/chore/due-buckets.test.ts`
- [X] T041 [US3] Implement sorted chore list query behavior for overdue, due, and upcoming groups in `apps/backend/src/chores/queries/list-chores.ts`
- [X] T042 [P] [US3] Add mobile presentation models for due sections and metadata display in `apps/mobile/features/chores/models/choreListViewModel.ts`
- [X] T043 [US3] Refine the chore list screen hierarchy for fast scanning in `apps/mobile/features/chores/screens/ChoreListScreen.tsx`
- [X] T044 [P] [US3] Add overdue, due, and upcoming section components in `apps/mobile/features/chores/components/ChoreListSections/`
- [X] T045 [US3] Add empty-state and single-bucket states for the chore list in `apps/mobile/features/chores/components/ChoreListEmptyState.tsx`

**Checkpoint**: User Stories 1 through 3 should provide the full shared tracking loop before bumping.

---

## Phase 6: User Story 4 - Send Polite Bumps With Limits (Priority: P4)

**Goal**: Let a household member send polite chore reminders while enforcing the daily sender limit.

**Independent Test**: Send bumps for an eligible chore and confirm the first five are accepted in one day while the sixth is blocked.

- [X] T046 [P] [US4] Add contract coverage for the bump endpoint and limit response in `tests/contract/phase1-api/chore-bump.contract.test.ts`
- [X] T047 [P] [US4] Add integration coverage for accepted and rejected bump attempts in `tests/integration/chore-bump-limit.integration.test.ts`
- [X] T048 [P] [US4] Implement bump eligibility checks for assignee, archived status, and self-bump prevention in `apps/backend/src/bumps/bump-policy.ts`
- [X] T049 [P] [US4] Implement sender-day rate limit queries in `apps/backend/src/bumps/bump-rate-limit.repository.ts`
- [X] T050 [US4] Implement bump creation and limit enforcement logic in `apps/backend/src/bumps/bump.service.ts`
- [X] T051 [US4] Add the bump endpoint to the chore controller in `apps/backend/src/chores/chore.controller.ts`
- [X] T052 [P] [US4] Add bump action UI and polite reminder affordances to chore cards in `apps/mobile/features/chores/components/BumpChoreAction.tsx`
- [X] T053 [US4] Add bump mutation handling and daily-limit feedback to the mobile client in `apps/mobile/features/chores/data/choreClient.ts`
- [X] T054 [US4] Add recipient and bump-status feedback states in `apps/mobile/features/chores/components/BumpStatusNotice.tsx`

**Checkpoint**: All four user stories should now be independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finish cross-story work, documentation, and readiness checks.

- [X] T055 [P] Add chore edit and archive flows aligned with the shared chore service in `apps/backend/src/chores/` and `apps/mobile/features/chores/`
- [X] T056 [P] Add optional photo attachment plumbing and nullable asset handling in `apps/backend/src/photos/` and `apps/mobile/features/chores/components/PhotoInput.tsx`
- [X] T057 [P] Document local setup, environment needs, and workflow steps in `README.md`
- [X] T058 Run quickstart validation and record any implementation gaps against `specs/001-phase1-chore-loop/quickstart.md`
- [X] T059 Run end-to-end regression across unit, contract, and integration suites from `tests/`

---

## Phase 8: Coverage Uplift And Enforcement

**Purpose**: Add meaningful automated tests to the active root-level Takeout app and enforce the constitutional 80% coverage rule.

- [X] T060 Audit and document the active Vitest and coverage-provider setup in `package.json`, `src/test/vitest.config.ts`, and `README.md`
- [X] T061 Fix the stale auth setup expectation in `src/test/unit/auth-initialization.test.ts` so it matches the current `vite.config.ts` native setup contract
- [X] T062 [P] Add explicit coverage reporting configuration and threshold enforcement to `src/test/vitest.config.ts`
- [X] T063 [P] Add or update the unit test script to run coverage consistently from `package.json`
- [X] T064 [P] Add unit coverage for household context derivation in `src/test/unit/auth/useHouseholdContext.test.ts`
- [X] T065 [P] Add unit coverage for server-side household context derivation in `src/test/unit/auth/ensureHouseholdContext.test.ts`
- [X] T066 Create reusable ChoreCue fixture builders for household members, chores, and board state in `src/test/unit/chorecue/fixtures.ts`
- [X] T067 [P] Add reusable render helpers for the root Takeout app test environment in `src/test/unit/chorecue/renderHelpers.tsx`
- [X] T068 [P] Add unit coverage for default board state and section ordering in `src/test/unit/chorecue/useChoreBoard.test.ts`
- [X] T069 [P] Add unit coverage for create-chore state transitions in `src/test/unit/chorecue/useChoreBoard.create.test.ts`
- [X] T070 [P] Add unit coverage for complete-chore state transitions in `src/test/unit/chorecue/useChoreBoard.complete.test.ts`
- [X] T071 [P] Add unit coverage for due-bucket grouping and archive filtering in `src/test/unit/chorecue/useChoreBoard.sections.test.ts`
- [X] T072 [P] Add unit coverage for bump-count and bump-label state transitions in `src/test/unit/chorecue/useChoreBoard.bump.test.ts`
- [X] T073 [P] Add unit coverage for edit and archive flows in `src/test/unit/chorecue/useChoreBoard.edit-archive.test.ts`
- [X] T074 [P] Add component coverage for the create form and initial board rendering in `src/test/unit/chorecue/ChoreHomePage.create.test.tsx`
- [X] T075 [P] Add component coverage for completion controls and refreshed labels in `src/test/unit/chorecue/ChoreHomePage.complete.test.tsx`
- [X] T076 [P] Add component coverage for section ordering, metadata rendering, and empty-state handling in `src/test/unit/chorecue/ChoreHomePage.sections.test.tsx`
- [X] T077 [P] Add component coverage for bump buttons, disabled states, and reminder labels in `src/test/unit/chorecue/ChoreHomePage.bump.test.tsx`
- [X] T078 [P] Add component coverage for edit-mode UI and archive actions in `src/test/unit/chorecue/ChoreHomePage.edit-archive.test.tsx`
- [X] T079 [P] Add unit coverage for optional photo attachment and clear-photo behavior in `src/test/unit/chorecue/PhotoInput.test.tsx`
- [X] T080 Add feed-route rendering coverage to ensure `app/(app)/home/(tabs)/feed/index.tsx` mounts ChoreCue instead of the Takeout todo demo in `src/test/unit/chorecue/feed-route.test.tsx`
- [X] T081 [P] Add shared interaction helpers for ChoreCue board flows in `src/test/integration/chorecue/helpers.ts`
- [X] T082 Add integration coverage for chore creation through the active board UI in `src/test/integration/chorecue/chore-create.spec.ts`
- [X] T083 Add integration coverage for completing chores from the active board UI in `src/test/integration/chorecue/chore-complete.spec.ts`
- [X] T084 Add integration coverage for due-state scanning on the active feed screen in `src/test/integration/chorecue/chore-sections.spec.ts`
- [X] T085 Add integration coverage for bump-limit behavior on the active board UI in `src/test/integration/chorecue/chore-bump-limit.spec.ts`
- [X] T086 Add integration coverage for edit, archive, and photo-clear flows in `src/test/integration/chorecue/chore-edit-archive-photo.spec.ts`
- [X] T087 Run unit coverage and record the measured threshold result in `specs/001-phase1-chore-loop/quickstart-validation.md`
- [X] T088 Run the full relevant test suite and confirm coverage stays at or above 80% using `package.json` scripts and `src/test/vitest.config.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies and can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phases 3-6)**: Depend on Foundational completion.
- **Polish (Phase 7)**: Depends on the desired user stories being complete.
- **Coverage Uplift (Phase 8)**: Depends on the active root-level Takeout app and can begin after the product implementation phases are in place.

### User Story Dependencies

- **User Story 1 (P1)**: Starts immediately after Foundational and defines the MVP slice.
- **User Story 2 (P2)**: Depends on US1 list and chore foundations, plus recurrence services from Phase 2.
- **User Story 3 (P3)**: Depends on US1 list retrieval and benefits from US2 completion metadata, but remains testable as a presentation-focused increment.
- **User Story 4 (P4)**: Depends on US1 chore and assignee flows plus the foundational household context.

### Within Each User Story

- Contract and integration tests should be added before or alongside story implementation.
- Backend validation and domain logic should land before mobile wiring.
- Shared view-model or utility work should land before screen integration.
- In Phase 8, prefer hook-level tests before component tests, and component tests before browser integration coverage.

### Parallel Opportunities

- T004-T006 can run in parallel after the initial workspace exists.
- T011-T018 contain several foundational parallel tasks across shared types, auth, recurrence, and test scaffolding.
- Within each user story, tasks marked `[P]` target separate files and can be split across teammates.
- Within Phase 8, hook tests, component tests, and auth-context tests marked `[P]` can proceed in parallel once fixtures and helpers exist.

---

## Parallel Example: User Story 1

```text
Task: "T025 [P] [US1] Create the household chore list screen in apps/mobile/features/chores/screens/ChoreListScreen.tsx"
Task: "T026 [P] [US1] Create the chore creation screen and form state in apps/mobile/features/chores/screens/CreateChoreScreen.tsx"
Task: "T027 [P] [US1] Create reusable chore form components for title, category, assignee, and recurrence inputs in apps/mobile/features/chores/components/ChoreForm/"
```

## Parallel Example: User Story 4

```text
Task: "T048 [P] [US4] Implement bump eligibility checks for assignee, archived status, and self-bump prevention in apps/backend/src/bumps/bump-policy.ts"
Task: "T049 [P] [US4] Implement sender-day rate limit queries in apps/backend/src/bumps/bump-rate-limit.repository.ts"
Task: "T052 [P] [US4] Add bump action UI and polite reminder affordances to chore cards in apps/mobile/features/chores/components/BumpChoreAction.tsx"
```

## Parallel Example: Coverage Uplift

```text
Task: "T068 [P] Add unit coverage for default board state and section ordering in src/test/unit/chorecue/useChoreBoard.test.ts"
Task: "T074 [P] Add component coverage for the create form and initial board rendering in src/test/unit/chorecue/ChoreHomePage.create.test.tsx"
Task: "T064 [P] Add unit coverage for household context derivation in src/test/unit/auth/useHouseholdContext.test.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational work.
3. Complete Phase 3 for User Story 1.
4. Validate chore creation and due-state visibility before moving on.

### Incremental Delivery

1. Deliver US1 for the first usable shared chore tracker.
2. Add US2 to complete the trusted recurrence loop.
3. Add US3 to sharpen at-a-glance usability.
4. Add US4 to finish polite shared accountability.
5. Add Phase 8 to produce meaningful, enforced automated coverage across the active root app.

### Parallel Team Strategy

1. One stream can own backend foundations while another prepares mobile scaffolding after Phase 1.
2. After Phase 2, mobile and backend work inside the same story can proceed in parallel on `[P]` tasks.
3. Cross-story work should remain sequenced by value unless a larger team is available.
4. During Phase 8, one stream can stabilize coverage tooling while another adds ChoreCue state and component tests.

## Notes

- Tasks follow the required checkbox, ID, optional parallel marker, optional story label, and exact path format.
- The suggested MVP scope remains Phase 3, User Story 1 for product delivery, with Phase 8 Setup tasks as the coverage-enforcement follow-up.
- Total tasks: 88
