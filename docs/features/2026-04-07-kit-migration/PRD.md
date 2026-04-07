# Feature PRD: Migrate to yoshisada/kit

## Parent Product

[ChoreCue Product PRD](../../PRD.md) — lightweight shared household chore tracker for couples and roommates.

## Feature Overview

Replace the `tamagui/takeout-free` scaffold foundation with `yoshisada/kit`, achieving full feature parity. The app must behave identically after migration — same screens, same data flow, same auth, same sync. Any bugs, missing features, or improvements discovered in kit during this migration get filed as GitHub issues on [yoshisada/kit](https://github.com/yoshisada/kit).

## Problem / Motivation

ChoreCue was built on `tamagui/takeout-free`, which is no longer the actively maintained scaffold. The user maintains `yoshisada/kit` as a fork and evolution of takeout-free — more configurable, supporting more technologies and frameworks. Migrating ChoreCue to kit serves two purposes:

1. **Consolidation**: Move off an upstream scaffold onto a self-maintained one, reducing dependency on external maintainers.
2. **Dogfooding**: Use a real, feature-complete app to stress-test kit and surface issues before other projects adopt it.

## Goals

- Achieve 100% feature parity with the current app on branch `002-luxury-editorial-redesign`.
- Replace all `@take-out/*` package dependencies with kit equivalents.
- Replace `tko` CLI usage with kit's CLI and script system.
- Preserve the luxury editorial design system (theme, fonts, animations, component styling).
- Preserve all data: Drizzle schema, Zero sync, migrations, and generated types.
- Preserve all auth flows: Better Auth setup, session handling, household context.
- File every kit bug, missing feature, or improvement discovered during migration as a GitHub issue on `yoshisada/kit`.
- Zero user-facing regressions.

## Non-Goals

- Adding new features, screens, or capabilities beyond what exists today.
- Changing the tech stack (no new frameworks, databases, or auth systems).
- Redesigning the UI or UX beyond what the luxury editorial redesign already established.
- Optimizing performance, bundle size, or build speed (unless required for parity).
- Supporting kit's optional modules (Electron, spec-kit) — this is a base migration only.

## Target Users

Same as the parent product: couples and small households using ChoreCue. This migration is invisible to end users — no behavioral changes.

## Core User Stories

1. **As a developer**, I want ChoreCue running on the kit scaffold so that I maintain one scaffold across all my projects.
2. **As a developer**, I want every kit issue I discover during migration filed on the kit repo so the scaffold improves for future projects.
3. **As an end user**, I want the app to work exactly as it did before the migration — same screens, same flows, same speed.

## Functional Requirements

### Scaffold Replacement

- Replace all `@take-out/cli` usage (`tko` commands) with kit's CLI equivalents for: `check`, `migrate build`, `env-update`, `run`, `script`.
- Replace `@take-out/helpers` imports across ~12 source files: `ensureEnv`, `createEmitter`, `createStorage`, `time`, `assertString`, `ensure`, `prettyPrintResponse`, `setStorageDriver`, `useEmitter`, `useEmitterValue`, `isEqualNever`.
- Replace `@take-out/postgres` usage: `migrate()` function in `src/database/migrate.ts` and `createServerHelpers()` in `src/database/helpers.ts`.
- Replace `@take-out/better-auth-utils`: `createBetterAuthClient()` in `src/features/auth/client/authClient.ts`.
- Replace `@take-out/hooks` with kit equivalents.
- Replace `@take-out/scripts` with kit's script system.
- Update `scripts/postinstall.ts` to remove or adapt patches that were specific to takeout-free package bugs.

### Configuration & Build

- Update `package.json` dependencies: remove all `@take-out/*` packages, add kit equivalents.
- Update `vite.config.ts` if kit changes the One/Vite plugin setup.
- Update `tsconfig.json` if kit changes type acquisition or path aliases.
- Update `docker-compose.yml` if kit changes the Zero/Postgres service configuration.
- Update `Dockerfile` if kit changes the build or serve commands.
- Ensure `bun dev`, `bun run ios`, `bun run android` all work identically.

### Data Layer Parity

- Drizzle schema (`src/database/schema-public.ts`) and all migrations must work unchanged or be adapted to kit's migration system.
- Zero sync (`src/zero/server.ts`, `src/zero/client.tsx`) must connect and sync identically.
- Generated Zero types (`src/data/generated/*`) must regenerate correctly via kit's equivalent of `on-zero generate`.
- All server actions (`src/data/server/actions/*`) must function identically.

### Auth Parity

- Better Auth server setup (`src/features/auth/server/authServer.ts`) must produce identical session behavior.
- Auth client (`src/features/auth/client/authClient.ts`) must work on both web and native.
- Middleware (`app/_middleware.ts`) must redirect based on session state identically.
- Household context derivation (`deriveServerHouseholdId`) must be preserved.

### UI Parity

- All screens must render identically: chore board, members page, settings, auth flows.
- Luxury editorial theme (`src/tamagui/themes/luxuryEditorial.ts`) must apply correctly.
- Custom fonts (Playfair Display, Inter) must load on both web and native.
- All animations (CSS on web, Reanimated on native) must work.
- All custom interface components (`src/interface/*`) must render and behave identically.

### Issue Routing

- When a kit bug or missing feature is discovered during migration, file it as a GitHub issue on `yoshisada/kit` with:
  - Clear title describing the issue
  - Steps to reproduce or context from the migration
  - Labels: `bug`, `enhancement`, or `migration-feedback` as appropriate
- Track filed issues in a migration log so nothing gets lost.

## Absolute Musts

1. **Full feature parity** — every screen, flow, and interaction works identically after migration.
2. **No data loss** — existing Drizzle migrations and Zero sync continue working.
3. **Cross-platform** — web and iOS must both work (Android is secondary but should not regress).
4. **Issue routing to kit repo** — every kit problem discovered gets filed on `yoshisada/kit`.

## Tech Stack

Inherited from product PRD — no additions or overrides. The migration swaps the scaffold layer underneath the same stack:

- TypeScript 5.9 (strict mode), React 19 with React Compiler
- Tamagui 2.0.0-rc.17, One (vxrn 1.9.9), Expo
- PostgreSQL 16 + Rocicorp Zero + Drizzle ORM
- Better Auth
- Bun 1.2.22, Docker

The only change is the scaffold source: `tamagui/takeout-free` → `yoshisada/kit`.

## Impact on Existing Features

- **Chore board**: No behavioral change. UI renders from feature code, not scaffold code.
- **Auth flows**: Client wrapper changes internally but exposes the same API surface.
- **Data sync**: Zero connection setup may change internally but sync behavior is identical.
- **Luxury editorial theme**: No impact — theme tokens and Tamagui config are app-level code.
- **Scripts**: `tko` commands replaced with kit equivalents — same functionality, different runner.
- **Postinstall patches**: Some may become unnecessary if kit fixes the upstream bugs. Others need adaptation.

**Breaking changes**: None user-facing. Developer-facing: all `@take-out/*` imports change to kit equivalents, `tko` CLI commands change to kit CLI commands.

## Success Metrics

1. All existing unit tests pass (`bun run test:unit`) with 80%+ coverage maintained.
2. All existing integration tests pass (`bun run test:integration`).
3. `bun dev` starts successfully and all screens render on web.
4. `bun run ios` builds and runs on iOS simulator with all flows working.
5. Zero kit issues remain unfiled — every problem discovered is tracked on `yoshisada/kit`.

## Risks / Unknowns

- **Kit API surface may not match takeout-free 1:1**: Some helpers or utilities may not have direct equivalents in kit yet. These become kit issues to file.
- **Postinstall patches**: The current app patches takeout-free bugs. Kit may have fixed some but introduced others.
- **Zero/Drizzle integration**: If kit changes how database helpers or migration runners work, the migration surface area grows.
- **Build tooling differences**: Kit may configure Vite or One differently, causing subtle build behavior changes.
- **Native builds**: iOS and Android builds are sensitive to dependency changes — even scaffold-level swaps can cause Xcode or Gradle issues.

## Assumptions

- `yoshisada/kit` provides equivalents for all `@take-out/*` packages currently used.
- Kit's CLI provides equivalents for all `tko` commands currently used.
- The One router, Vite, and Tamagui versions are compatible between the current app and kit.
- The migration can be done incrementally (replace one package at a time) rather than requiring a big-bang rewrite.
- Kit's base template structure is compatible with the current app's file layout.

## Open Questions

- Does kit provide a migration guide or compatibility layer for apps built on takeout-free?
- Which `@take-out/*` helpers have direct kit equivalents vs. which need to be reimplemented or inlined?
- Does kit change the Docker Compose setup for Zero/Postgres, or is that identical?
- Should the migration happen on a new branch from `002-luxury-editorial-redesign`, or as a continuation of that branch?
