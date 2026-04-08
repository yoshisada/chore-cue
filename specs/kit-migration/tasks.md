# Tasks: Kit Scaffold Migration

**Input**: Design documents from `specs/kit-migration/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/interfaces.md

**Tests**: Tests are not generated as separate tasks — existing tests must continue passing after migration. Test file import updates are included in the implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. Since this is a migration (not a new feature), stories map to migration phases rather than new functionality.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Read existing implementations from node_modules before removing dependencies

- [X] T001 Read and document `@take-out/helpers` source from `node_modules/@take-out/helpers/` to understand exact implementations before inlining
- [X] T002 [P] Read and document `@take-out/better-auth-utils` source from `node_modules/@take-out/better-auth-utils/` to understand createBetterAuthClient implementation
- [X] T003 [P] Read and document `@take-out/postgres` source from `node_modules/@take-out/postgres/` to understand migrate() and createServerHelpers() implementations

---

## Phase 2: Foundational (Inline Helpers)

**Purpose**: Create the local helper modules that all import updates depend on. MUST complete before any source file imports can be updated.

**CRITICAL**: No import updates (Phases 3-8) can begin until these files exist.

- [X] T004 Create `src/helpers/ensureEnv.ts` — inline ensureEnv(key, defaultValue?) from @take-out/helpers
- [X] T005 [P] Create `src/helpers/assertions.ts` — inline assertString, ensure, ensureExists from @take-out/helpers
- [X] T006 [P] Create `src/helpers/emitter.ts` — inline createEmitter, useEmitter, useEmitterValue, isEqualNever from @take-out/helpers (uses useSyncExternalStore pattern)
- [X] T007 [P] Create `src/helpers/storage.ts` — inline createStorage, setStorageDriver from @take-out/helpers
- [X] T008 [P] Create `src/helpers/time.ts` — inline time duration helper object from @take-out/helpers
- [X] T009 [P] Create `src/helpers/prettyPrintResponse.ts` — inline prettyPrintResponse from @take-out/helpers

**Checkpoint**: All helper modules exist — import updates can now proceed in parallel

---

## Phase 3: User Story 1 - Developer Runs the App After Migration (Priority: P1) MVP

**Goal**: App starts and runs identically after migration — `bun dev` works, all screens render, data syncs, auth works.

**Independent Test**: Run `bun dev` and verify web app loads. Run `bun run ios` and verify iOS simulator launches.

### Implementation for User Story 1

- [X] T010 [US1] Inline `createBetterAuthClient()` into `src/features/auth/client/authClient.ts` — replace @take-out/better-auth-utils import with local implementation (wraps better-auth/client, adds useAuth hook, token management, authState emitter)
- [X] T011 [P] [US1] Inline `migrate()` function into `src/database/migrate.ts` — replace `@take-out/postgres/migrate` import with local Drizzle migration runner including Zero CVR/CDB database creation
- [X] T012 [P] [US1] Inline `createServerHelpers()` into `src/database/helpers.ts` — replace `@take-out/postgres` import with local wrapper returning `{ sql, getDBClient }`
- [X] T013 [P] [US1] Update `src/server/env-server.ts` — replace `@take-out/helpers` import with `~/helpers/ensureEnv`
- [X] T014 [P] [US1] Update `src/server/getIsAdmin.ts` — replace `@take-out/helpers` import with `~/helpers/assertions`
- [X] T015 [P] [US1] Update `src/zero/server.ts` — replace `@take-out/helpers` import with `~/helpers/assertions`
- [X] T016 [P] [US1] Update `src/features/auth/server/ensureAuthUser.ts` — replace `@take-out/helpers` import with `~/helpers/assertions`
- [X] T017 [P] [US1] Update `src/features/auth/server/apiHandler.ts` — replace `@take-out/helpers` import with `~/helpers/prettyPrintResponse`
- [X] T018 [P] [US1] Update `src/features/auth/server/authServer.ts` — replace `@take-out/helpers` import with `~/helpers/time`
- [X] T019 [P] [US1] Update `src/features/auth/client/platformClient.native.ts` — replace `@take-out/helpers` import with `~/helpers/storage`
- [X] T020 [P] [US1] Update `src/features/storage/setupStorage.native.ts` — replace `@take-out/helpers` import with `~/helpers/storage`
- [X] T021 [P] [US1] Update `src/interface/toast/emitter.ts` — replace `@take-out/helpers` import with `~/helpers/emitter`
- [X] T022 [P] [US1] Update `src/interface/toast/Toast.tsx` — replace `@take-out/helpers` imports with `~/helpers/emitter` and `import { isWeb } from 'tamagui'`
- [X] T023 [P] [US1] Update `src/interface/toast/Toast.native.tsx` — replace `@take-out/helpers` import with `~/helpers/emitter`
- [X] T024 [P] [US1] Update `src/features/app/scrollToTopEmitter.ts` — replace `@take-out/helpers` import with `~/helpers/emitter`

**Checkpoint**: All @take-out/* imports replaced in source files — app should compile

---

## Phase 4: User Story 2 - All @take-out/* Imports Replaced (Priority: P1)

**Goal**: Zero references to `@take-out/` remain anywhere in the codebase.

**Independent Test**: `grep -r "@take-out/" src/ scripts/ app/ package.json` returns zero matches.

### Implementation for User Story 2

- [X] T025 [US2] Remove all 6 `@take-out/*` packages from `package.json` dependencies: @take-out/better-auth-utils, @take-out/cli, @take-out/helpers, @take-out/hooks, @take-out/postgres, @take-out/scripts
- [X] T026 [US2] Run `bun install` to regenerate `bun.lock` without @take-out packages
- [X] T027 [US2] Run `grep -r "@take-out/" src/ scripts/ app/ package.json` to verify zero remaining references — fix any missed imports

**Checkpoint**: No @take-out packages in dependencies or source code

---

## Phase 5: User Story 3 - tko CLI Commands Replaced (Priority: P1)

**Goal**: All package.json scripts work without tko — using direct commands or inline scripts.

**Independent Test**: Run each script and verify it executes successfully. `grep "tko" package.json` returns zero matches.

### Implementation for User Story 3

- [X] T028 [US3] Replace `tko check` and `tko check --all` in `package.json` scripts with direct validation commands or remove if not needed
- [X] T029 [P] [US3] Replace `tko migrate build` in `package.json` scripts with direct Drizzle migration build command
- [X] T030 [P] [US3] Replace `tko run env-update` in `package.json` scripts with inline env generation script
- [X] T031 [US3] Update `scripts/postinstall.ts` — remove @take-out patches (patches 1 and 2), keep react-native deepFreeze patch (patch 3), replace `bun tko run update-local-env` with inline equivalent, keep `bun run one patch`
- [X] T032 [P] [US3] Update `scripts/up.ts` — remove `takeout` upgrade target if present

**Checkpoint**: No tko references in package.json — all scripts use direct commands

---

## Phase 6: User Story 4 - Existing Tests Pass (Priority: P2)

**Goal**: All unit and integration tests pass with 80%+ coverage.

**Independent Test**: `bun run test:unit:coverage` passes. `bun run test:integration` passes.

### Implementation for User Story 4

- [X] T033 [US4] Update `src/test/unit/auth-initialization.test.ts` — replace `@take-out/helpers` imports (setStorageDriver, createStorage) with `~/helpers/storage`
- [X] T034 [US4] Run `bun run test:unit` and fix any failing tests caused by import path changes
- [X] T035 [US4] Run `bun run test:unit:coverage` and verify 80%+ coverage threshold — add helpers to coverage.include in `src/test/vitest.config.ts` if needed
- [X] T036 [US4] Run `bun run test:integration` and fix any failing Playwright tests

**Checkpoint**: All tests green with coverage threshold met

---

## Phase 7: User Story 5 - Kit Issues Filed (Priority: P2)

**Goal**: Every kit gap or issue discovered during migration has a GitHub issue on yoshisada/kit.

**Independent Test**: Review migration log and verify every workaround has a linked issue.

### Implementation for User Story 5

- [ ] T037 [US5] File GitHub issue on yoshisada/kit for missing emitter system (createEmitter, useEmitter, useEmitterValue) — candidate for kit packages/app/
- [ ] T038 [P] [US5] File GitHub issue on yoshisada/kit for missing auth client wrapper (createBetterAuthClient) — candidate for kit packages/auth/
- [ ] T039 [P] [US5] File GitHub issue on yoshisada/kit for missing migration runner (migrate with Zero CVR/CDB) — candidate for kit packages/database/
- [ ] T040 [P] [US5] File GitHub issue on yoshisada/kit for missing storage abstraction (createStorage, setStorageDriver) — candidate for kit packages/app/
- [ ] T041 [US5] Create migration log at `specs/kit-migration/migration-log.md` documenting all issues, workarounds, and filed GitHub issue URLs

**Checkpoint**: All kit gaps documented and filed

---

## Phase 8: User Story 6 - Luxury Editorial Theme Preserved (Priority: P2)

**Goal**: Theme renders identically on web and iOS — fonts, colors, spacing, animations.

**Independent Test**: Visually compare each screen on web and iOS before and after migration.

### Implementation for User Story 6

- [ ] T042 [US6] Run `bun dev` and visually verify luxury editorial theme on web — check chore board, members, settings, auth screens for correct fonts (Playfair Display, Inter), colors, and CSS animations
- [ ] T043 [US6] Run `bun run ios` and visually verify luxury editorial theme on iOS — check all screens for correct fonts, Reanimated animations, and spacing

**Checkpoint**: Visual parity confirmed on web and iOS

---

## Phase 9: Polish and Cross-Cutting Concerns

**Purpose**: Final verification, documentation, and cleanup

- [ ] T044 Run `grep -r "@take-out/" .` across entire repo to catch any remaining references in config files, docs, or comments
- [ ] T045 [P] Update `CLAUDE.md` — remove references to `@take-out/*` packages and `tko` CLI, update tech stack and commands sections
- [ ] T046 [P] Verify `vite.config.ts` has no takeout-free-specific configuration that needs updating
- [ ] T047 [P] Verify `tsconfig.json` path aliases include `~/helpers/*` mapping if not already covered by `~/*` → `./src/*`
- [ ] T048 Run final verification: `bun dev` starts, `bun run test:unit:coverage` passes, `bun run test:integration` passes
- [ ] T049 Run `bun run ios` for final iOS verification

---

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — read source before inlining
- **Phase 3 (US1)**: Depends on Phase 2 — helper modules must exist before imports can update
- **Phase 4 (US2)**: Depends on Phase 3 — all imports updated before removing packages
- **Phase 5 (US3)**: Can start after Phase 2 — independent of Phase 3/4 (different files)
- **Phase 6 (US4)**: Depends on Phases 3, 4, 5 — all changes complete before testing
- **Phase 7 (US5)**: Can start after Phase 2 — issue filing is independent of implementation
- **Phase 8 (US6)**: Depends on Phases 3, 4, 5 — all changes complete before visual verification
- **Phase 9 (Polish)**: Depends on all previous phases

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (Phase 2) — no dependencies on other stories
- **US2 (P1)**: Depends on US1 — imports must be updated before packages are removed
- **US3 (P1)**: Independent of US1/US2 — tko replacement is in different files (package.json scripts)
- **US4 (P2)**: Depends on US1, US2, US3 — all changes must be complete before testing
- **US5 (P2)**: Independent — can file issues at any time during migration
- **US6 (P2)**: Depends on US1, US2, US3 — visual check after all changes

### Parallel Opportunities

- T002, T003 can run in parallel with T001 (reading different packages)
- T004-T009 can all run in parallel (creating different helper files)
- T010-T024 can mostly run in parallel (updating different source files), except T010-T012 which inline complex modules
- T028-T032 can run in parallel with Phase 3 (different files)
- T037-T040 can run in parallel (filing independent issues)
- T044-T047 can run in parallel (checking different config files)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all helper file creation together:
Task: "Create src/helpers/ensureEnv.ts"
Task: "Create src/helpers/assertions.ts"
Task: "Create src/helpers/emitter.ts"
Task: "Create src/helpers/storage.ts"
Task: "Create src/helpers/time.ts"
Task: "Create src/helpers/prettyPrintResponse.ts"
```

## Parallel Example: Phase 3 (US1 Import Updates)

```bash
# After T010-T012 complete, launch all simple import updates together:
Task: "Update src/server/env-server.ts"
Task: "Update src/server/getIsAdmin.ts"
Task: "Update src/zero/server.ts"
Task: "Update src/features/auth/server/ensureAuthUser.ts"
Task: "Update src/features/auth/server/apiHandler.ts"
Task: "Update src/features/auth/server/authServer.ts"
Task: "Update src/features/auth/client/platformClient.native.ts"
Task: "Update src/features/storage/setupStorage.native.ts"
Task: "Update src/interface/toast/emitter.ts"
Task: "Update src/interface/toast/Toast.tsx"
Task: "Update src/interface/toast/Toast.native.tsx"
Task: "Update src/features/app/scrollToTopEmitter.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Read existing implementations
2. Complete Phase 2: Create helper modules (CRITICAL — blocks all stories)
3. Complete Phase 3: Update all source file imports (US1)
4. Complete Phase 4: Remove @take-out packages (US2)
5. Complete Phase 5: Replace tko CLI (US3)
6. **SELF-VALIDATE**: Run `bun dev`, verify app starts — MVP is functional
7. Complete Phase 6: Run tests (US4)

### Incremental Delivery

1. Phases 1-2: Foundation ready (helpers exist)
2. Phase 3: All imports updated — app compiles
3. Phases 4-5: Dependencies cleaned — app is standalone
4. Phase 6: Tests confirm no regressions
5. Phase 7: Kit issues filed — dogfooding complete
6. Phases 8-9: Visual and final verification

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Read source from node_modules BEFORE removing packages (Phase 1 before Phase 4)
- `isWeb` replaces with `import { isWeb } from 'tamagui'` — not inlined into helpers
- Total tasks: 49
- Tasks per story: US1=15, US2=3, US3=5, US4=4, US5=5, US6=2
- Setup=3, Foundational=6, Polish=6
