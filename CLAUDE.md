# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChoreCue is a cross-platform household chore tracking app built on the Takeout Free scaffold. Currently in Phase 1 MVP development (branch: `001-phase1-chore-loop`). The main feature lives in `src/features/chorecue/`.

## Tech Stack

- **Framework**: One (meta-framework) + Expo (native) + Tamagui (UI)
- **Language**: TypeScript 5.9 (strict mode), React 19 with React Compiler
- **Data**: PostgreSQL 16 + Rocicorp Zero (offline-first CRDT sync) + Drizzle ORM
- **Auth**: Better Auth
- **Package Manager**: Bun 1.2.22
- **Node**: 24.3.0

## Commands

```bash
# Development
bun dev                          # Start dev server (web + native)
bun run ios                      # Build & run iOS simulator
bun run android                  # Build & run Android

# Backend (must run before dev)
bun backend                      # Docker Compose: Postgres + Zero + migrations
bun backend:clean                # Tear down Docker volumes

# Testing
bun run test:unit                # Vitest unit tests
bun run test:unit:coverage       # Unit tests with coverage (80% threshold)
bun run test:integration         # Playwright integration tests
bun test                         # Both unit + integration

# Code Quality
bun lint                         # oxlint (type-aware)
bun lint:fix                     # oxlint + oxfmt auto-fix
bun format                       # oxfmt
bun format:check                 # Check formatting only

# Database
bun migrate                      # Run Drizzle migrations
bun migrate:build                # Build migration bundle
bun zero:generate                # Generate Zero types from schema

# Environment
bun run env:dev <cmd>            # Run command with .env.development loaded
bun run env:test <cmd>           # Run command with test env
```

## Architecture

### Routing & Layouts (file-based via One Router)

- `app/_layout.tsx` — root layout
- `app/(app)/_layout.tsx` — protected routes, wraps with providers (Zero, Toast, Dialog)
- `app/(app)/home/(tabs)/` — main tab interface
- `app/(app)/auth/` — login/signup flows
- `app/api/` — server API routes

### Data Flow (Zero Sync)

Zero provides offline-first sync between client and Postgres:
1. Client connects via WebSocket to Zero server (port 4948)
2. Mutations go through `/api/zero/push`, queries through `/api/zero/pull`
3. Docker Compose runs three Postgres databases: main, CVR, CDB
4. Native uses op-sqlite for local storage; web uses in-memory

### Key Directories

- `src/features/` — feature modules (chorecue, auth, theme, storage)
- `src/interface/` — shared UI component library
- `src/database/` — Drizzle schema and migrations
- `src/data/` — Zero queries and models
- `src/zero/` — Zero sync client setup
- `src/test/unit/` — Vitest tests
- `src/test/integration/` — Playwright tests
- `specs/001-phase1-chore-loop/` — Phase 1 specification documents

### Auth & Household Context

- Better Auth handles sessions via HTTP-only cookies
- Middleware (`app/_middleware.ts`) redirects based on session state
- Household ID derived from user ID: `deriveServerHouseholdId(userId)` → `household-{first8chars}`

### Path Alias

`~/*` maps to `./src/*` (configured in tsconfig.json)

## Conventions

### Import Restrictions (enforced by oxlint)

Do NOT import these directly from `tamagui` — use `~/interface` wrappers instead:
Button, Tooltip, Popover, Select, Input, Switch, TextArea, Image

### Platform-Specific Files

Use `.native.ts` / `.native.tsx` suffixes for React Native-specific code. The bundler resolves these automatically.

### Environment Setup

Copy `.env.development.example` → `.env.development` and set:
- `BETTER_AUTH_SECRET` (≥32 chars, generate with `openssl rand -base64 32`)
- `BETTER_AUTH_URL` and `ONE_SERVER_URL` (typically `http://localhost:8081`)

### Testing

- Coverage is scoped to specific files in `src/test/vitest.config.ts` (currently `boardState.ts` and `householdContext.ts`)
- Unit tests go in `src/test/unit/`, integration tests in `src/test/integration/`
- 80% coverage threshold on lines, functions, statements, branches

### Tooling

- `tko` CLI (from `@take-out/cli`) provides project scripts — run `bun tko` to see available commands
- Spec Kit integration via `npx openskills read <skill-name>` for task-specific guidance

## Active Technologies
- TypeScript 5.9 (strict mode), React 19 with React Compiler + Tamagui 2.0.0-rc.17, One (vxrn 1.9.9), Expo, React Native Reanimated 4.1.6, @tamagui/animations-css (web), @tamagui/animations-reanimated (native) (002-luxury-editorial-redesign)
- N/A — this is a visual-only redesign with no data layer changes (002-luxury-editorial-redesign)

## Recent Changes
- 002-luxury-editorial-redesign: Added TypeScript 5.9 (strict mode), React 19 with React Compiler + Tamagui 2.0.0-rc.17, One (vxrn 1.9.9), Expo, React Native Reanimated 4.1.6, @tamagui/animations-css (web), @tamagui/animations-reanimated (native)
