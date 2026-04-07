# Implementation Plan: Kit Scaffold Migration

**Branch**: `build/kit-migration-20260407` | **Date**: 2026-04-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/kit-migration/spec.md`

## Summary

Migrate ChoreCue off the `tamagui/takeout-free` scaffold by inlining all `@take-out/*` package functionality into local project code, then removing the npm dependencies. Research confirmed that `yoshisada/kit` is a project scaffolding CLI (like `create-next-app`), not a runtime library — it does not publish npm packages that replace `@take-out/*` at runtime. The migration strategy is therefore to **inline** the small utilities, **copy and adapt** the more complex modules (emitter system, auth client wrapper, migration runner), and **replace** `tko` CLI commands with direct scripts.

No features added, no data model changes, no UI changes. The luxury editorial theme, all screens, auth flows, and data sync must work identically after migration. Kit issues discovered get filed on yoshisada/kit.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)
**Primary Dependencies**: React 19 with React Compiler, Tamagui 2.0.0-rc.17, One (vxrn 1.9.9), Expo, React Native Reanimated 4.1.6
**Storage**: PostgreSQL 16 + Rocicorp Zero (offline-first CRDT sync) + Drizzle ORM
**Testing**: Vitest (unit), Playwright (integration), 80% coverage threshold
**Target Platform**: Web (Chromium), iOS (Expo/React Native), Android (secondary)
**Project Type**: Cross-platform mobile-first app
**Performance Goals**: Feature parity — no regressions from current performance
**Constraints**: Offline-capable via Zero sync, luxury editorial theme must be preserved
**Scale/Scope**: Small household app (2 users), ~17 source files to update imports, 1 test file to update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| 1. Preserve The Shared Chore Loop | PASS | Migration does not modify chore loop — all feature code unchanged |
| 2. Keep Household Coordination Polite | PASS | No user-facing changes — reminders and nudges unchanged |
| 3. Favor Small-Household Simplicity | PASS | No scope expansion — same target audience |
| 4. Require Flexible Recurrence Accuracy | PASS | No recurrence logic changes — all data layer preserved |
| 5. Ship The Smallest Useful Cross-Platform Slice | PASS | This is infrastructure-only, no feature scope added |
| 6. Write Testable Product Specs | PASS | Spec includes acceptance scenarios and measurable success criteria |
| 7. Maintain Coverage Discipline | PASS | 80% coverage threshold maintained as a success criterion (SC-001) |

No violations. No complexity justification needed.

## Project Structure

### Documentation (this feature)

```text
specs/kit-migration/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 data model (no changes)
├── quickstart.md        # Phase 1 quickstart guide
├── contracts/
│   └── interfaces.md    # Phase 1 interface contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
├── agent-notes/
│   └── specifier.md     # Friction notes
└── tasks.md             # Phase 2 task breakdown (from /tasks)
```

### Source Code (repository root)

```text
src/
├── helpers/             # NEW — inlined @take-out/helpers utilities
│   ├── ensureEnv.ts
│   ├── assertions.ts    # assertString, ensure, ensureExists
│   ├── emitter.ts       # createEmitter, useEmitter, useEmitterValue, isEqualNever
│   ├── storage.ts       # createStorage, setStorageDriver
│   ├── time.ts
│   └── prettyPrintResponse.ts
├── server/              # env-server.ts, getIsAdmin.ts (update imports → ~/helpers/)
├── zero/                # server.ts (update import → ~/helpers/)
├── database/            # migrate.ts, helpers.ts (inline @take-out/postgres)
├── features/
│   ├── auth/
│   │   ├── client/      # authClient.ts (inline @take-out/better-auth-utils),
│   │   │                # platformClient.native.ts (update import → ~/helpers/)
│   │   └── server/      # ensureAuthUser.ts, apiHandler.ts, authServer.ts (update imports)
│   ├── storage/         # setupStorage.native.ts (update import → ~/helpers/)
│   └── app/             # scrollToTopEmitter.ts (update import → ~/helpers/)
├── interface/
│   └── toast/           # Toast.tsx, Toast.native.tsx, emitter.ts (update imports)
└── tamagui/             # Theme preserved unchanged

scripts/
└── postinstall.ts       # Remove @take-out patches, keep RN patch

package.json             # Remove @take-out/* deps, replace tko scripts
```

**Structure Decision**: New `src/helpers/` directory for inlined utilities. All other directories preserved. `isWeb` import replaced with `import { isWeb } from 'tamagui'` (already re-exported).

## Implementation Phases

### Phase 1: Inline @take-out/helpers Utilities

Create `src/helpers/` with inlined versions of all helpers. Group by concern:

**Simple inlines** (2-3 lines each):
- `ensureEnv(key, default?)` — env lookup with throw
- `assertString(val, msg)` — type guard
- `ensure(val)` — truthy assertion
- `ensureExists(val, name)` — null check with throw
- `isWeb` — replace with `import { isWeb } from 'tamagui'`

**Medium inlines** (~10-30 lines each):
- `prettyPrintResponse(res)` — debug helper
- `time` — duration constant object
- `createStorage(prefix)` / `setStorageDriver(driver)` — storage abstraction

**Complex inlines** (~30-60 lines each):
- `createEmitter(name, initial, opts?)` — event emitter with `useSyncExternalStore`
- `useEmitter(emitter, cb)` / `useEmitterValue(emitter)` — React hooks
- `isEqualNever` — comparator (`() => false`)

**Source**: Read implementations from `node_modules/@take-out/helpers/` before inlining.

### Phase 2: Inline @take-out/better-auth-utils

Inline `createBetterAuthClient()` into `src/features/auth/client/`:
- Wraps `better-auth/client` with `createAuthClient()`
- Adds `useAuth()` hook, token management (`setAuthClientToken`, `clearAuthClientToken`)
- Manages `authState` emitter

**Source**: Read implementation from `node_modules/@take-out/better-auth-utils/` before inlining.

### Phase 3: Inline @take-out/postgres

Inline into `src/database/`:
- `migrate(opts)` — Drizzle migration runner with Zero CVR/CDB database creation
- `createServerHelpers(database)` — thin wrapper returning `{ sql, getDBClient }`

**Source**: Read implementation from `node_modules/@take-out/postgres/` before inlining.

### Phase 4: Replace tko CLI Commands

Replace `tko` references in `package.json` scripts:
- `tko check` / `tko check --all` — inline validation script or remove
- `tko migrate build` — direct Drizzle migration build command
- `tko run env-update` — inline env generation script
- `tko run update-local-env` — same as env-update

### Phase 5: Update Source File Imports

Update all 15 source files + 1 test file to use new local imports:
- `@take-out/helpers` → `~/helpers/*` (12 source files + 1 test)
- `@take-out/postgres` → `~/database/*` (2 files, already inlined in Phase 3)
- `@take-out/better-auth-utils` → `~/features/auth/client/*` (1 file, already inlined in Phase 2)

### Phase 6: Clean Up Dependencies and Postinstall

1. Remove all 6 `@take-out/*` packages from `package.json`
2. Remove `@take-out/cli` (provides `tko` binary)
3. Run `bun install` to regenerate `bun.lock`
4. Update `scripts/postinstall.ts`:
   - Remove patch 1 (`@take-out/scripts` missing export) — no longer relevant
   - Remove patch 2 (`@take-out/helpers` asyncContext.native.js) — no longer relevant
   - Keep patch 3 (react-native deepFreeze) — unrelated to @take-out
   - Replace `bun tko run update-local-env` with inline env generation
   - Keep `bun run one patch`
5. Update `scripts/up.ts` — remove `takeout` upgrade target

### Phase 7: Verification and Issue Filing

1. Run `bun dev` — verify web app loads
2. Run `bun run test:unit:coverage` — verify tests pass with 80%+ coverage
3. Run `bun run test:integration` — verify Playwright tests pass
4. Run `bun run ios` — verify iOS build
5. Grep to confirm zero `@take-out/` and `tko` references remain
6. File GitHub issues on yoshisada/kit for candidates identified in research:
   - Emitter system (for kit's packages/app/)
   - Auth client wrapper (for kit's packages/auth/)
   - Migration runner (for kit's packages/database/)
   - Storage abstraction (for kit's packages/app/)
7. Update CLAUDE.md references
