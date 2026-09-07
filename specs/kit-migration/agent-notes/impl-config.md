# Config/Build Migration — Friction Notes

## Summary

The config/build migration was already complete when this agent started. The source code implementer (or prior work) had already:

1. Removed all 6 `@take-out/*` dependencies from `package.json`
2. Replaced all `tko` CLI commands with direct equivalents in package.json scripts
3. Cleaned `scripts/postinstall.ts` — only RN deepFreeze patch and `one patch` remain
4. Cleaned `scripts/up.ts` — no `takeout` upgrade target
5. Regenerated `bun.lock` without direct @take-out dependencies

## Verification Results

- **package.json**: Zero `@take-out` or `tko` references
- **vite.config.ts**: No takeout-specific configuration
- **tsconfig.json**: `~/*` → `./src/*` path alias covers `~/helpers/*` — no changes needed
- **docker-compose.yml**: No takeout references
- **Dockerfile**: Uses `bun.lock` (not `package-lock.json`), no takeout references
- **CLAUDE.md**: Already clean of takeout/tko references
- **postinstall.ts**: Only RN deepFreeze patch + `one patch` remain

## Remaining @take-out References (Expected)

- `bun.lock`: Transitive dependency from `on-zero` package — outside our control
- `specs/`, `docs/`, `.kiln/`: Documentation and QA test files describing the migration

## Friction

- **Low friction overall**: The config/build changes were already implemented before this agent ran. The main value-add was systematic verification that nothing was missed.
- **package-lock.json**: A stale npm lockfile existed with @take-out references but was already removed from git tracking on this branch.
- **Task overlap**: T025-T032 were marked complete before this agent started, suggesting the source implementer handled config tasks as well. The task boundary between config and source implementers could be clarified in future pipelines.
