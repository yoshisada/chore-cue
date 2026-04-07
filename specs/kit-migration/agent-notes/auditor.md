# Auditor Friction Notes — Kit Migration

**Agent**: auditor (Task #5)
**Date**: 2026-04-04
**Branch**: `build/kit-migration-20260407`

---

## What Went Well

- Zero @take-out/ references in source code, scripts, app, or package.json — grep confirmed clean.
- Zero tko references in package.json — confirmed clean.
- All helper modules exist in src/helpers/ with correct structure (14 files across 3 subdirectories).
- QA report was comprehensive — 42/42 E2E tests pass, visual verification of luxury editorial theme confirmed.
- The 5 unit test failures are pre-existing from the base branch (002-luxury-editorial-redesign), not migration regressions.
- Implementation was well-scoped — 70 files changed, 31 source files modified, all import paths correctly updated.

## Friction Points

### 1. No blockers.md to reconcile

The instructions required reconciling blockers.md against code state, but no blockers.md was ever created. No blockers were encountered during the pipeline. This is a good outcome but the reconciliation step was a no-op.

### 2. FR-013 (file kit issues) scored as partial

The spec requires filing GitHub issues on yoshisada/kit for every bug or API mismatch. The implementer correctly noted that kit is a scaffolding CLI with no runtime packages — the gap is architectural, not a bug. No actionable issues to file. This FR should have been revised after the research phase found that kit doesn't publish runtime packages.

### 3. Unit test exit code 1 despite pre-existing failures

`bun run test:unit` and `bun run test:unit:coverage` both exit with code 1 due to 5 pre-existing failures. This makes it impossible to get a clean "smoke test: PASS" for unit tests. The QA report confirmed these are identical to the base branch, so this is accepted as a known condition.

### 4. bun.lock still references @take-out/helpers transitively

`on-zero` (Zero sync) depends on `@take-out/helpers` as a transitive dependency. This is outside the project's control and expected. The spec's FR-014 grep target correctly scopes to `src/ scripts/ app/ package.json`, excluding lockfile transitive deps.

### 5. tasks.md checkboxes never updated

All 49 tasks in tasks.md remain unchecked ([ ]) even though implementation is complete. The implementer committed code but didn't update the task checkboxes. This is cosmetic but makes post-hoc verification harder.

## Recommendations

- Future migration PRDs should include a research gate before writing requirements — FR-013 assumed kit publishes packages, which research disproved.
- The 5 pre-existing test failures on the base branch should be fixed before the next feature branch to avoid confusion in future audits.
- Consider adding a pipeline step to update tasks.md checkboxes as implementation progresses.
