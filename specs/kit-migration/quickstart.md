# Quickstart: Kit Scaffold Migration

**Branch**: `build/kit-migration-20260407`

## Prerequisites

- Bun 1.2.22+
- Node 24.3.0+
- Docker (for backend services)

## Key Insight

Kit (`yoshisada/kit`) is a project scaffolding CLI, not a runtime library. It does not publish npm packages that replace `@take-out/*`. The migration strategy is to **inline** all `@take-out/*` functionality into local project code, then remove the dependencies.

## Migration Steps (High-Level)

1. **Read source code** from `node_modules/@take-out/*/` to understand implementations before inlining
2. **Create `src/helpers/`** directory with inlined helper utilities
3. **Inline auth client wrapper** into `src/features/auth/client/`
4. **Inline postgres utilities** into `src/database/`
5. **Update all imports** in 15 source files + 1 test file to use new local paths
6. **Replace `tko` commands** in `package.json` with direct scripts
7. **Remove all `@take-out/*` dependencies** from `package.json`
8. **Clean up postinstall** — remove @take-out patches, keep RN patch
9. **Run `bun install`** to regenerate lock file
10. **Verify**: `bun dev`, `bun run test:unit:coverage`, `bun run test:integration`, `bun run ios`
11. **File GitHub issues** on yoshisada/kit for missing utilities that should be in kit

## Verification Commands

```bash
# Confirm no @take-out references remain
grep -r "@take-out/" src/ scripts/ app/ package.json

# Confirm no tko references remain in scripts
grep "tko" package.json

# Run full test suite
bun run test:unit:coverage
bun run test:integration

# Start dev server
bun dev

# Build iOS
bun run ios
```

## Files to Create

| File                          | Content                                           |
|-------------------------------|---------------------------------------------------|
| src/helpers/ensureEnv.ts      | Inlined `ensureEnv` (~3 lines)                    |
| src/helpers/assertions.ts     | Inlined `assertString`, `ensure`, `ensureExists`  |
| src/helpers/emitter.ts        | Inlined `createEmitter`, `useEmitter`, `useEmitterValue`, `isEqualNever` |
| src/helpers/storage.ts        | Inlined `createStorage`, `setStorageDriver`       |
| src/helpers/time.ts           | Inlined `time` duration helpers                   |
| src/helpers/prettyPrintResponse.ts | Inlined `prettyPrintResponse`                |

## Files to Modify

| File                                          | Change                                    |
|-----------------------------------------------|-------------------------------------------|
| package.json                                  | Remove @take-out/* deps, replace tko scripts |
| bun.lock                                      | Regenerated after install                  |
| src/server/env-server.ts                      | Import from ~/helpers/ensureEnv            |
| src/server/getIsAdmin.ts                      | Import from ~/helpers/assertions           |
| src/zero/server.ts                            | Import from ~/helpers/assertions           |
| src/features/auth/server/ensureAuthUser.ts    | Import from ~/helpers/assertions           |
| src/features/auth/client/authClient.ts        | Inline createBetterAuthClient              |
| src/features/auth/client/platformClient.native.ts | Import from ~/helpers/storage          |
| src/features/auth/server/apiHandler.ts        | Import from ~/helpers/prettyPrintResponse  |
| src/features/auth/server/authServer.ts        | Import from ~/helpers/time                 |
| src/interface/toast/Toast.tsx                  | Import from ~/helpers/emitter + tamagui    |
| src/interface/toast/Toast.native.tsx           | Import from ~/helpers/emitter              |
| src/interface/toast/emitter.ts                | Import from ~/helpers/emitter              |
| src/features/storage/setupStorage.native.ts   | Import from ~/helpers/storage              |
| src/features/app/scrollToTopEmitter.ts        | Import from ~/helpers/emitter              |
| src/database/migrate.ts                       | Inline migrate function                    |
| src/database/helpers.ts                       | Inline createServerHelpers                 |
| scripts/postinstall.ts                        | Remove @take-out patches                   |
| src/test/unit/auth-initialization.test.ts     | Import from ~/helpers/storage              |
