# Interface Contracts: Kit Scaffold Migration

**Date**: 2026-04-04
**Branch**: `build/kit-migration-20260408`

## Overview

This migration inlines `@take-out/*` functionality into local project code (kit is a scaffolding tool, not a runtime library). The contracts below document the **internal interface boundaries** that must be preserved — each inlined module must expose the same function signatures and behavior as the original `@take-out/*` export.

## Contract 1: Helper Utilities (src/helpers/)

Inlined from `@take-out/helpers`. Each function must preserve its original type signature.

| Export             | New Location           | Type Signature (preserved)                        | Used In                          |
|--------------------|------------------------|---------------------------------------------------|----------------------------------|
| ensureEnv          | ~/helpers/ensureEnv    | `(key: string, defaultValue?: string) => string`  | src/server/env-server.ts         |
| createEmitter      | ~/helpers/emitter      | `<T>(name: string, initial: T, opts?) => Emitter<T>` | src/interface/toast/emitter.ts, src/features/app/scrollToTopEmitter.ts |
| useEmitter         | ~/helpers/emitter      | `<T>(emitter: Emitter<T>, cb: (v: T) => void) => void` | src/interface/toast/Toast.tsx, Toast.native.tsx |
| useEmitterValue    | ~/helpers/emitter      | `<T>(emitter: Emitter<T>) => T`                   | src/interface/toast/Toast.tsx     |
| isEqualNever       | ~/helpers/emitter      | `(a: never, b: never) => boolean`                 | src/features/app/scrollToTopEmitter.ts |
| assertString       | ~/helpers/assertions   | `(value: unknown, msg?: string) => asserts value is string` | src/zero/server.ts |
| ensure             | ~/helpers/assertions   | `<T>(value: T \| null \| undefined) => T`         | src/server/getIsAdmin.ts         |
| ensureExists       | ~/helpers/assertions   | `<T>(value: T \| null \| undefined, name?: string) => T` | src/features/auth/server/ensureAuthUser.ts |
| prettyPrintResponse| ~/helpers/prettyPrintResponse | `(response: Response) => void`              | src/features/auth/server/apiHandler.ts |
| time               | ~/helpers/time         | Time utility object with duration helpers          | src/features/auth/server/authServer.ts |
| createStorage      | ~/helpers/storage      | `(prefix: string) => Storage`                     | src/features/auth/client/platformClient.native.ts |
| setStorageDriver   | ~/helpers/storage      | `(driver: StorageDriver) => void`                 | src/features/storage/setupStorage.native.ts |
| isWeb              | **tamagui** (not inlined) | `boolean`                                       | src/interface/toast/Toast.tsx — replace with `import { isWeb } from 'tamagui'` |

## Contract 2: Postgres Utilities (src/database/)

Inlined from `@take-out/postgres`. Functions integrated into existing database files.

| Export               | New Location           | Type Signature (preserved)                      | Used In                      |
|----------------------|------------------------|-------------------------------------------------|------------------------------|
| migrate              | ~/database/migrate     | `(opts: MigrateOptions) => Promise<void>`       | src/database/migrate.ts (self-contained) |
| createServerHelpers  | ~/database/helpers     | `(database: DrizzleDB) => ServerHelpers`        | src/database/helpers.ts (self-contained) |

Note: `migrate` was previously imported from subpath `@take-out/postgres/migrate`. After inlining, it lives directly in `src/database/migrate.ts`.

## Contract 3: Better Auth Client (src/features/auth/client/)

Inlined from `@take-out/better-auth-utils`. Wrapper integrated into auth client module.

| Export                 | New Location                     | Type Signature (preserved)                      | Used In                                      |
|------------------------|----------------------------------|-------------------------------------------------|----------------------------------------------|
| createBetterAuthClient | ~/features/auth/client/authClient | `(config: AuthClientConfig) => AuthClient`     | src/features/auth/client/authClient.ts (self-contained) |

The `AuthClient` return type includes:
- `useAuth()` — React hook returning auth state
- `setAuthClientToken(token)` — set auth token for native
- `clearAuthClientToken()` — clear auth token
- `authState` — emitter for auth state changes

## Contract 4: CLI Commands (package.json scripts)

`tko` CLI replaced with direct commands. No kit CLI equivalent exists for these commands.

| Current Script        | Current Command          | New Command                                     |
|-----------------------|--------------------------|-------------------------------------------------|
| check                 | `tko check`              | Direct validation script or removed              |
| check:all             | `tko check --all`        | Direct validation script or removed              |
| env:update            | `tko run env-update`     | Inline env generation script                     |
| migrate:build         | `tko migrate build`      | Direct Drizzle migration build command           |

## Contract 5: Test File Updates

| Test File                                    | Current Import                          | New Import                    |
|----------------------------------------------|-----------------------------------------|-------------------------------|
| src/test/unit/auth-initialization.test.ts    | `@take-out/helpers` (setStorageDriver, createStorage) | `~/helpers/storage` |
