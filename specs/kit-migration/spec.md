# Feature Specification: Kit Scaffold Migration

**Feature Branch**: `build/kit-migration-20260407`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: Migrate ChoreCue from tamagui/takeout-free scaffold to yoshisada/kit — a pure scaffold swap with full feature parity.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Runs the App After Migration (Priority: P1)

A developer clones the migrated branch, runs the standard dev commands (`bun dev`, `bun run ios`), and the app starts without errors. All screens load, data syncs, auth works, and the luxury editorial theme renders correctly. The developer experience is functionally identical to the pre-migration branch.

**Why this priority**: If the app does not start and run correctly after migration, the entire effort fails. This is the foundational gate for all other stories.

**Independent Test**: Run `bun dev` and verify the web app loads at localhost:8081 with all tabs, auth flows, and chore board functioning. Run `bun run ios` and verify the iOS simulator launches with identical behavior.

**Acceptance Scenarios**:

1. **Given** the migrated codebase on `build/kit-migration-20260407`, **When** a developer runs `bun dev`, **Then** the web app starts and all screens render identically to `002-luxury-editorial-redesign`.
2. **Given** the migrated codebase, **When** a developer runs `bun run ios`, **Then** the iOS simulator builds and launches with all flows working.
3. **Given** the migrated codebase, **When** a developer runs `bun backend && bun dev`, **Then** Zero sync connects, data flows between client and server, and offline-first behavior works.

---

### User Story 2 - All @take-out/* Imports Replaced with Kit Equivalents (Priority: P1)

Every source file that previously imported from `@take-out/*` packages now imports from the corresponding kit package. No `@take-out/*` references remain anywhere in the codebase — not in source files, package.json, lock files, or scripts.

**Why this priority**: Incomplete replacement leaves the codebase in a broken hybrid state. This is a prerequisite for the app to even compile.

**Independent Test**: Run `grep -r "@take-out/" src/ scripts/ app/ package.json` and verify zero matches. Run `bun install` and verify no `@take-out/*` packages are resolved.

**Acceptance Scenarios**:

1. **Given** the migrated codebase, **When** searching all source files for `@take-out/`, **Then** zero matches are found.
2. **Given** the migrated codebase, **When** `bun install` completes, **Then** no `@take-out/*` packages appear in `bun.lock`.
3. **Given** the migrated codebase, **When** TypeScript compilation runs, **Then** all kit imports resolve without type errors.

---

### User Story 3 - tko CLI Commands Replaced with Kit CLI (Priority: P1)

All `package.json` scripts that reference `tko` are updated to use kit's CLI equivalent. Developers use the same script names (`bun check`, `bun migrate:build`, etc.) but they invoke kit's CLI under the hood.

**Why this priority**: Developer workflow scripts must work for any development to proceed. Broken scripts block the entire team.

**Independent Test**: Run each script (`bun check`, `bun migrate:build`, `bun env:update`) and verify they execute successfully using kit's CLI.

**Acceptance Scenarios**:

1. **Given** the migrated package.json, **When** a developer runs `bun check`, **Then** kit's check command executes successfully.
2. **Given** the migrated package.json, **When** a developer runs `bun migrate:build`, **Then** kit's migration build command executes successfully.
3. **Given** the migrated package.json, **When** searching package.json for `tko`, **Then** zero matches are found.

---

### User Story 4 - Existing Tests Pass After Migration (Priority: P2)

All existing unit tests and integration tests pass without modification (unless a test directly references `@take-out/*` imports, in which case the import path is updated). Test coverage remains at or above 80%.

**Why this priority**: Tests validate that the migration did not introduce regressions. Failing tests indicate broken functionality.

**Independent Test**: Run `bun run test:unit:coverage` and verify all tests pass with 80%+ coverage. Run `bun run test:integration` and verify all Playwright tests pass.

**Acceptance Scenarios**:

1. **Given** the migrated codebase, **When** `bun run test:unit` executes, **Then** all unit tests pass.
2. **Given** the migrated codebase, **When** `bun run test:unit:coverage` executes, **Then** coverage meets the 80% threshold.
3. **Given** the migrated codebase, **When** `bun run test:integration` executes, **Then** all Playwright integration tests pass.

---

### User Story 5 - Kit Issues Filed for Problems Discovered (Priority: P2)

When the migration encounters a kit bug, missing feature, or API mismatch, the issue is filed as a GitHub issue on `yoshisada/kit` with a clear title, reproduction steps, and appropriate labels (`bug`, `enhancement`, or `migration-feedback`).

**Why this priority**: Dogfooding kit is a key motivation for this migration. Unfiled issues undermine the purpose of the effort.

**Independent Test**: After migration, verify that every workaround or deviation from expected kit behavior has a corresponding GitHub issue on `yoshisada/kit`.

**Acceptance Scenarios**:

1. **Given** a kit bug is discovered during migration, **When** the developer documents it, **Then** a GitHub issue is created on `yoshisada/kit` with title, reproduction steps, and labels.
2. **Given** migration is complete, **When** reviewing the migration log, **Then** every workaround has a linked kit issue.

---

### User Story 6 - Luxury Editorial Theme Preserved (Priority: P2)

The luxury editorial design system — including the theme tokens, Playfair Display and Inter fonts, CSS animations on web, Reanimated animations on native, and all custom interface components — renders identically after migration.

**Why this priority**: The theme was the output of the previous feature branch. Regression would lose completed work.

**Independent Test**: Visually compare each screen (chore board, members, settings, auth) on web and iOS before and after migration. Verify fonts load, colors match, and animations play.

**Acceptance Scenarios**:

1. **Given** the migrated app on web, **When** viewing any screen, **Then** the luxury editorial theme renders with correct fonts, colors, and spacing.
2. **Given** the migrated app on iOS, **When** viewing any screen, **Then** fonts load correctly and Reanimated animations play smoothly.

---

### Edge Cases

- What happens if a kit package does not export an equivalent for a `@take-out/helpers` utility (e.g., `isEqualNever`)? The utility is inlined or reimplemented locally, and a kit issue is filed.
- What happens if kit changes the export path structure (e.g., `@take-out/postgres/migrate` becomes a different subpath)? The import is updated to match kit's export map, verified via kit's documentation or source.
- What happens if postinstall patches that fixed takeout-free bugs are no longer needed in kit? The patches are removed. If they are still needed, they are adapted and a kit issue is filed.
- What happens if kit's CLI has different command names or flags than `tko`? The package.json scripts are updated to use kit's exact command syntax.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST replace all `@take-out/helpers` imports across 12 source files with kit equivalents: `ensureEnv`, `createEmitter`, `createStorage`, `time`, `assertString`, `ensure`, `ensureExists`, `prettyPrintResponse`, `setStorageDriver`, `useEmitter`, `useEmitterValue`, `isEqualNever`, and `isWeb`.
- **FR-002**: System MUST replace `@take-out/postgres` usage — `migrate()` in `src/database/migrate.ts` and `createServerHelpers()` in `src/database/helpers.ts` — with kit equivalents.
- **FR-003**: System MUST replace `@take-out/better-auth-utils` usage — `createBetterAuthClient()` in `src/features/auth/client/authClient.ts` — with kit equivalent.
- **FR-004**: System MUST replace all `tko` CLI references in `package.json` scripts (`check`, `check:all`, `env:update`, `migrate:build`) with kit CLI equivalents.
- **FR-005**: System MUST use the spec directory `specs/kit-migration/` with no numeric prefix.
- **FR-006**: System MUST remove all six `@take-out/*` packages from `package.json` dependencies and add their kit replacements.
- **FR-007**: System MUST update `scripts/postinstall.ts` to remove or adapt patches that were specific to takeout-free package bugs.
- **FR-008**: System MUST preserve all Drizzle schema definitions, migrations, and generated Zero types without behavioral changes.
- **FR-009**: System MUST preserve Better Auth server configuration, client setup, middleware redirects, and household context derivation (`deriveServerHouseholdId`).
- **FR-010**: System MUST preserve the luxury editorial theme, including theme tokens, custom fonts (Playfair Display, Inter), CSS animations (web), and Reanimated animations (native).
- **FR-011**: System MUST preserve all existing screens and user flows: chore board, members page, settings, and auth flows.
- **FR-012**: System MUST update `vite.config.ts`, `tsconfig.json`, and Docker configuration if kit changes the build or service setup.
- **FR-013**: System MUST file a GitHub issue on `yoshisada/kit` for every kit bug, missing feature, or API mismatch discovered during migration, with clear title, reproduction context, and appropriate labels.
- **FR-014**: System MUST verify via grep that zero references to `@take-out/` remain in the codebase after migration (source files, package.json, lock file, scripts).
- **FR-015**: System MUST maintain 80%+ test coverage after migration.

### Key Entities

- **Package Mapping**: Each `@take-out/*` package maps to a specific kit package. The mapping defines source package, target package, and per-export correspondence.
- **Migration Log**: A record of all issues discovered during migration, including workarounds applied and GitHub issues filed on `yoshisada/kit`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All existing unit tests pass with 80%+ coverage after migration.
- **SC-002**: All existing Playwright integration tests pass after migration.
- **SC-003**: The app starts via `bun dev` and renders all screens on web without errors.
- **SC-004**: The app builds and runs via `bun run ios` on the iOS simulator with all flows working.
- **SC-005**: Zero references to `@take-out/` exist anywhere in the codebase (verified by grep across all files).
- **SC-006**: Zero references to `tko` exist in package.json scripts.
- **SC-007**: Every kit issue discovered during migration has a corresponding GitHub issue filed on `yoshisada/kit`.
- **SC-008**: The luxury editorial theme renders identically on web and iOS — correct fonts, colors, spacing, and animations.

## Assumptions

- `yoshisada/kit` provides equivalent exports for all `@take-out/*` utilities currently in use (if not, they are inlined locally and a kit issue is filed).
- Kit's CLI provides equivalents for all `tko` commands currently used (`check`, `migrate build`, `env-update`, `run`).
- The One router, Vite, and Tamagui versions are compatible between the current app and kit's expected versions.
- The migration can be done package-by-package rather than requiring a big-bang replacement.
- Kit's Docker Compose setup for Zero/Postgres is compatible with the current configuration, or differences are documented and adapted.
- The `@take-out/hooks` package, while listed as a dependency, has no actual imports in the codebase and can be removed without replacement.
- The `@take-out/scripts` package provides shared build scripts that kit replaces with its own script system.
