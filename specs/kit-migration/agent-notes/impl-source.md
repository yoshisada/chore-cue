# Source Code Migration — Friction Notes

## Summary

All `@take-out/*` imports have been replaced with local `~/helpers/*` modules. The migration was already completed in a prior pipeline run (commit `83093b5`). This pass verified completeness and marked all tasks.

## What was already done

- `src/helpers/ensureEnv.ts` — inlined from `@take-out/helpers/server/ensureEnv`
- `src/helpers/ensure.ts` — inlined `ensure`, `ensureExists`, `assertString` from `@take-out/helpers`
- `src/helpers/emitter.tsx` — inlined `Emitter`, `createEmitter`, `useEmitter`, `useEmitterValue`, `isEqualNever`
- `src/helpers/time.ts` — inlined `time` duration helpers
- `src/helpers/prettyPrintResponse.ts` — inlined with `getHeaders` and `streamToString` embedded
- `src/helpers/storage/` — inlined `createStorage`, `setStorageDriver`, `StorageDriver` type
- `src/helpers/createBetterAuthClient.ts` — inlined from `@take-out/better-auth-utils`, uses local emitter + storage
- `src/database/migrationRunner.ts` — inlined from `@take-out/postgres/migrate`
- `src/database/getDBClient.ts` — inlined from `@take-out/postgres/helpers/getDBClient`
- `src/database/helpers.ts` — replaced `createServerHelpers()` with local `createSql` + `ellipsis`

## Design decisions observed

1. **`ensure.ts` combined assertions**: `assertString`, `ensure`, `ensureExists` live in one file rather than the tasks.md suggested `assertions.ts`. Consumers import from `~/helpers/ensure`.
2. **`createBetterAuthClient` uses `dequal/lite`** instead of `isEqualDeepLite` from helpers — a local `const isEqualDeepLite = (a, b) => dequal(a, b)` wraps it.
3. **`helpers.ts` inlines `ellipsis`** rather than importing from helpers — keeps the database module self-contained.
4. **`isWeb` imported from `tamagui`** directly in `Toast.tsx` — not wrapped in helpers.

## Friction

- None encountered — the migration was clean and all 131 unit tests pass.
