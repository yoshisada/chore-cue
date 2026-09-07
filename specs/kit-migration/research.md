# Kit Migration Research

## Overview

This document maps every `@take-out/*` import in chore-cue to its equivalent in the [yoshisada/kit](https://github.com/yoshisada/kit) scaffold. Kit is a modular starter kit CLI (`@kit/cli`) that scaffolds Turborepo monorepos with One router, Tamagui, Zero sync, Drizzle ORM, and Better Auth — the same stack chore-cue uses.

**Key finding**: Kit is a project scaffolding tool (like `create-next-app`), not a runtime library. It does not publish npm packages that replace `@take-out/*` at runtime. The migration strategy is therefore: **inline the functionality** from `@take-out/*` into local project code, then remove the npm dependencies.

---

## 1. Package-by-Package Mapping

### 1.1 `@take-out/helpers`

The most heavily used package. Contains small utility functions.

| Function | Used In | Kit Equivalent | Migration Strategy |
|---|---|---|---|
| `ensureEnv(key, default?)` | `src/server/env-server.ts` | **No kit equivalent** | Inline: `process.env[key] ?? default ?? throw` |
| `createEmitter(name, initial, opts?)` | `src/interface/toast/emitter.ts`, `src/features/app/scrollToTopEmitter.ts` | **No kit equivalent** | Inline: lightweight event emitter (~30 lines) using `useSyncExternalStore` pattern |
| `useEmitter(emitter, callback)` | `src/interface/toast/Toast.tsx` | **No kit equivalent** | Inline: React hook wrapping emitter subscribe |
| `useEmitterValue(emitter)` | `src/interface/toast/Toast.tsx` | **No kit equivalent** | Inline: React hook using `useSyncExternalStore` |
| `isEqualNever` | `src/features/app/scrollToTopEmitter.ts` | **No kit equivalent** | Inline: `() => false` (a comparator that always returns false) |
| `assertString(val, msg)` | `src/zero/server.ts` | **No kit equivalent** | Inline: `if (typeof val !== 'string') throw new Error(msg); return val` |
| `ensure(val)` | `src/server/getIsAdmin.ts` | **No kit equivalent** | Inline: `if (!val) throw new Error('ensure failed')` |
| `ensureExists(val, name)` | `src/features/auth/server/ensureAuthUser.ts` | **No kit equivalent** | Inline: `if (val == null) throw new Error(\`${name} does not exist\`)` |
| `prettyPrintResponse(res)` | `src/features/auth/server/apiHandler.ts` | **No kit equivalent** | Inline: clone response, read body, `console.info` formatted output |
| `time` | `src/features/auth/server/authServer.ts` | **No kit equivalent** | Inline: object with duration helpers, e.g. `time.minute.days(2)` = 2 days in minutes |
| `createStorage(prefix)` | `src/features/auth/client/platformClient.native.ts` | **No kit equivalent** | Inline: thin wrapper around `setStorageDriver`'s global driver |
| `setStorageDriver(driver)` | `src/features/storage/setupStorage.native.ts` | **No kit equivalent** | Inline: sets a module-level global storage driver |
| `isWeb` | `src/interface/toast/Toast.tsx` | **No kit equivalent** | Replace with `import { isWeb } from 'tamagui'` (already re-exported from tamagui) |

### 1.2 `@take-out/postgres`

| Function | Used In | Kit Equivalent | Migration Strategy |
|---|---|---|---|
| `createServerHelpers(database)` | `src/database/helpers.ts` | **No kit equivalent** | Inline: returns `{ sql, getDBClient }` wrapping the Drizzle database instance |
| `migrate(opts)` | `src/database/migrate.ts` | **No kit equivalent** | Inline: Drizzle migration runner with Zero CVR/CDB database creation |

### 1.3 `@take-out/better-auth-utils`

| Function | Used In | Kit Equivalent | Migration Strategy |
|---|---|---|---|
| `createBetterAuthClient(opts)` | `src/features/auth/client/authClient.ts` | **No kit equivalent** | Inline: wraps `better-auth/client` with `createAuthClient()`, adds `useAuth()` hook, token management (`setAuthClientToken`, `clearAuthClientToken`), and `authState` emitter |

### 1.4 `@take-out/hooks`

| Import | Used In | Kit Equivalent | Migration Strategy |
|---|---|---|---|
| (none found in src/) | N/A — listed in `package.json` but not imported | N/A | **Remove dependency** — unused |

### 1.5 `@take-out/scripts`

| Function | Used In | Kit Equivalent | Migration Strategy |
|---|---|---|---|
| (used by `@take-out/cli` internally) | `scripts/postinstall.ts` patches its exports | N/A | **Remove dependency** — only consumed via `tko` CLI |

### 1.6 `@take-out/cli` (`tko`)

| Command | Used In | Kit Equivalent | Migration Strategy |
|---|---|---|---|
| `tko check` | `package.json` scripts `check`, `check:all` | `kit create` (different purpose) | Inline or remove — `tko check` validates env/config; replace with direct checks |
| `tko migrate build` | `package.json` script `migrate:build` | **No kit equivalent** | Inline: bundles migration .ts files into a single .js for Docker |
| `tko run env-update` | `package.json` script `env:update`, `postinstall.ts` | **No kit equivalent** | Inline: reads `.env.*` files and generates `env-server.ts` exports |
| `tko run update-local-env` | `scripts/postinstall.ts` | **No kit equivalent** | Same as `env-update` — inline the env generation script |
| `tko run update-deps` | `scripts/up.ts` | **No kit equivalent** | Replace with direct `bun update` commands |

---

## 2. Kit CLI Commands vs tko Commands

| tko Command | Purpose | Kit CLI Command | Notes |
|---|---|---|---|
| `tko check` | Validate project config/env | (none) | Kit has no equivalent — it's a scaffolder, not a project validator |
| `tko migrate build` | Bundle migration TS → JS | (none) | Kit template references `db:migrate` in turbo pipeline but delegates to Drizzle |
| `tko run env-update` | Generate env-server.ts from .env files | (none) | Kit has no env management |
| `tko run <script>` | Run named script | (none) | Kit has no script runner |
| `tko update-deps` | Update package groups | (none) | Kit has no upgrade command |

**Kit CLI commands** (for reference, not migration targets):
- `kit create <name>` — scaffold a new project from the base template
- `kit add <module>` — install an optional module (electron, spec-kit)

---

## 3. Infrastructure Comparison

### 3.1 Vite Configuration

| Aspect | chore-cue (`vite.config.ts`) | Kit template (`templates/base/apps/web/vite.config.ts`) |
|---|---|---|
| Router | `one()` with full options (setupFile, react compiler, metro, sitemap, etc.) | `one({ web: { defaultRenderMode: 'spa' } })` minimal |
| Tamagui | `tamaguiPlugin()` (config in tamagui.build.ts) | `tamaguiPlugin({ components: ['tamagui'], config: './tamagui.config.ts' })` |
| SSR | Custom noExternal/external config | Not configured |
| Build | API rollup externals | Not configured |
| Analysis | Optional rollup-plugin-visualizer | Not configured |

**Verdict**: chore-cue's vite.config.ts is significantly more complex. Kit's template is a minimal starting point. No migration needed — keep chore-cue's config as-is.

### 3.2 Docker Compose

Kit template does not include a `docker-compose.yml`. chore-cue's docker-compose setup (pgdb + migrate + zero) is custom. **No migration needed.**

### 3.3 TypeScript Configuration

| Aspect | chore-cue | Kit template |
|---|---|---|
| Structure | Single `tsconfig.json` with path aliases (`~/*` → `./src/*`) | Monorepo: root tsconfig + per-package tsconfigs with project references |
| Target | ES2022 | ES2022 |
| Module | ESNext / bundler | ESNext / bundler |
| Strict | Yes | Yes |

**Verdict**: Kit uses a Turborepo monorepo structure with workspace packages. chore-cue is a flat single-package project. No tsconfig migration needed.

### 3.4 Monorepo Structure

Kit template uses Turborepo with workspaces:
- `apps/web/` — One router web app
- `packages/app/` — shared app features
- `packages/ui/` — UI component library
- `packages/config/` — shared tsconfig
- `packages/zero/` — (referenced in tsconfig)
- `packages/auth/` — (referenced in tsconfig)
- `packages/database/` — (referenced in tsconfig)

chore-cue is a flat single-package app. **No structural migration needed** — chore-cue's structure works fine without Turborepo.

---

## 4. Kit Gaps — Functions Missing from Kit

These are the `@take-out/*` functions actively used by chore-cue that have **no equivalent in kit**. These should either be inlined into chore-cue or filed as GitHub issues on yoshisada/kit if they should be part of the kit scaffold.

### Candidates for GitHub Issues on yoshisada/kit

1. **Emitter system** (`createEmitter`, `useEmitter`, `useEmitterValue`, `isEqualNever`)
   - Used for toast notifications and scroll-to-top events
   - Generic, reusable pattern — good candidate for kit's `packages/app/` or a utility package

2. **Auth client wrapper** (`createBetterAuthClient`)
   - Wraps better-auth client with React hooks, token management, auth state
   - Core to any app using Better Auth — good candidate for kit

3. **Migration runner** (`migrate` from `@take-out/postgres/migrate`)
   - Bundles Drizzle migrations with Zero CVR/CDB database creation
   - Essential for Zero + Drizzle projects — good candidate for kit

4. **Storage abstraction** (`createStorage`, `setStorageDriver`)
   - Platform-agnostic storage with pluggable backends (MMKV, in-memory)
   - Common cross-platform need — good candidate for kit

### Candidates for Inline-Only (too simple for a kit package)

5. **`ensureEnv`** — 3-line function
6. **`assertString`** — 2-line function
7. **`ensure`** — 2-line function
8. **`ensureExists`** — 3-line function
9. **`prettyPrintResponse`** — ~10-line debug helper
10. **`time`** — duration constant object
11. **`isWeb`** — already available from `tamagui`
12. **`createServerHelpers`** — thin wrapper around Drizzle

---

## 5. Postinstall Patches

chore-cue's `scripts/postinstall.ts` patches three `@take-out/*` bugs:

1. **`@take-out/scripts`** — missing `"."` export for Vite 7 strict exports
2. **`@take-out/helpers` asyncContext.native.js** — dynamic import bug in React Native
3. **react-native deepFreezeAndThrowOnMutationInDev** — unrelated to @take-out

After migration, patches 1 and 2 are **eliminated** (no more @take-out packages to patch). Patch 3 remains.

The postinstall also runs:
- `bun tko run update-local-env` — needs to be replaced with an inline env generation script
- `bun run one patch` — stays as-is (One framework patch)

---

## 6. Test Impact

`src/test/unit/auth-initialization.test.ts` imports from `@take-out/helpers`:
- `setStorageDriver` and `createStorage` on line 14

This test must be updated to import from the new local module locations after inlining.

---

## 7. Recommended Migration Order

1. **Inline `@take-out/helpers` utilities** into `src/helpers/` (largest surface area, simplest functions)
2. **Inline `@take-out/better-auth-utils`** into `src/features/auth/client/` (self-contained)
3. **Inline `@take-out/postgres`** into `src/database/` (migration runner + server helpers)
4. **Replace `tko` CLI commands** in `package.json` scripts with direct commands or local scripts
5. **Remove all `@take-out/*` and `@take-out/cli` dependencies** from `package.json`
6. **Remove postinstall patches** for @take-out packages
7. **Update tests** to use new import paths
8. **Update `scripts/up.ts`** to remove `takeout` upgrade target

---

## 8. Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| `createBetterAuthClient` has hidden complexity (token refresh, auth state machine) | Medium | Read source from `node_modules/@take-out/better-auth-utils` before inlining |
| `migrate` function has Zero-specific CVR/CDB creation logic | Medium | Read source from `node_modules/@take-out/postgres` before inlining |
| `createEmitter` + hooks may use `useSyncExternalStore` with SSR considerations | Low | Well-understood React pattern |
| Removing `tko` CLI breaks `check`, `migrate:build`, `env:update` scripts | Low | These are all replaceable with simple scripts |
| `on-zero` package also depends on `@take-out/helpers` internally | Low | `on-zero` is a separate package — its internal deps are its own concern |
