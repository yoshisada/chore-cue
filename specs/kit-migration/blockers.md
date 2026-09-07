# Blockers: Kit Scaffold Migration

## Blocker: FR-013 / T037-T041 — Kit GitHub issues not filed

**Status**: BLOCKED
**Reason**: Tasks T037-T041 (Phase 7, US5) require filing GitHub issues on yoshisada/kit for missing features discovered during migration (emitter system, auth client wrapper, migration runner, storage abstraction) and creating a migration log. These were not completed by implementers and were flagged as pending in QA report (SC-007: NOT VERIFIED).
**Impact**: No user-facing functionality affected. This is a developer workflow item — kit dogfooding feedback is not routed yet.
**Resolution path**: File the 4 GitHub issues on yoshisada/kit and create specs/kit-migration/migration-log.md. Can be done post-merge as a follow-up task.
**Date**: 2026-04-08

## Blocker: T042-T043 — Visual verification tasks unchecked

**Status**: RESOLVED (by QA)
**Reason**: QA engineer verified luxury editorial theme preservation on web via Playwright (SC-008: PASS in QA report). iOS native verification (T043/SC-004) requires physical `bun run ios` which was not run by implementers, but QA confirmed web parity.
**Impact**: iOS visual verification not independently confirmed by implementer. QA web verification covers the theme preservation requirement.
**Resolution path**: Run `bun run ios` for full native verification. Web theme is confirmed PASS.
**Date**: 2026-04-08

## Blocker: T048-T049 — Final verification tasks unchecked

**Status**: RESOLVED (by QA + auditor)
**Reason**: T048 (bun dev starts, unit tests pass, integration tests pass) is confirmed by QA report and auditor smoke test — 131 unit tests pass, 92.2% coverage, app loads on port 8081. T049 (iOS) is pending native build.
**Impact**: None for web. iOS not independently verified.
**Resolution path**: Run `bun run ios` for final iOS confirmation.
**Date**: 2026-04-08

## Compliance Summary

| FR | Description | Status |
|----|-------------|--------|
| FR-001 | Replace @take-out/helpers imports | PASS |
| FR-002 | Replace @take-out/postgres usage | PASS |
| FR-003 | Replace @take-out/better-auth-utils | PASS |
| FR-004 | Replace tko CLI in package.json | PASS |
| FR-005 | Spec directory = specs/kit-migration/ | PASS |
| FR-006 | Remove @take-out/* from dependencies | PASS |
| FR-007 | Update postinstall.ts | PASS |
| FR-008 | Preserve Drizzle/Zero data layer | PASS |
| FR-009 | Preserve Better Auth config | PASS |
| FR-010 | Preserve luxury editorial theme | PASS |
| FR-011 | Preserve all screens/flows | PASS |
| FR-012 | Update vite/tsconfig/Docker if needed | PASS |
| FR-013 | File kit issues on yoshisada/kit | BLOCKED |
| FR-014 | Zero @take-out/ references remain | PASS |
| FR-015 | 80%+ test coverage | PASS |
