# Implementation Plan: ChoreCue Test Coverage Uplift

**Branch**: `001-phase1-chore-loop` | **Date**: 2026-03-16 | **Spec**: [spec.md](C:\Users\yoshisada\Documents\GitHub\chore-cue\specs\001-phase1-chore-loop\spec.md)
**Input**: Feature specification from `/specs/001-phase1-chore-loop/spec.md`

## Summary

Raise the ChoreCue codebase to a sustainable test baseline by replacing placeholder/demo checks with meaningful unit, integration, and contract coverage around the active root-level Takeout app. The plan focuses on executing real ChoreCue feature logic, auth and setup regression paths, and the highest-risk household flows until the repository can honestly enforce the new constitutional rule of maintaining at least 80% automated coverage.

## Technical Context

**Language/Version**: TypeScript with Bun-oriented tooling and a root-level One/Tamagui Takeout app  
**Primary Dependencies**: Vitest, Playwright, Bun, One, Tamagui, Better Auth, Zero, Drizzle ORM  
**Storage**: PostgreSQL and Zero for the intended application stack, with local feature state currently used in parts of the ChoreCue prototype  
**Testing**: Vitest for unit coverage, Playwright for browser integration, targeted contract tests for ChoreCue flows and configuration guarantees  
**Target Platform**: Web-first local validation on the Takeout scaffold, with mobile-first product behavior preserved in the UI under test  
**Project Type**: Cross-platform mobile and web application with integrated API and data layers  
**Performance Goals**: Keep unit tests fast enough for frequent local execution, keep browser integration focused on core regressions, and achieve at least 80% automated coverage on the actively maintained code paths  
**Constraints**: Windows support is shaky in the upstream Takeout stack, coverage must become meaningful rather than synthetic, tests should prioritize active root-app code instead of stale `_old_*` scaffolding, and new work must not drift outside the Phase 1 chore loop  
**Scale/Scope**: Cover the root `src/features/chorecue`, the current auth/setup regression area, the active feed route, and the highest-risk config or route boundaries before expanding to lower-value edge surfaces

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- `Preserve The Shared Chore Loop`: Pass. The test plan targets create, review, complete, edit, archive, and bump behavior in the ChoreCue loop.
- `Keep Household Coordination Polite`: Pass. Reminder and bump behavior remain covered as user-facing rules, not just implementation details.
- `Favor Small-Household Simplicity`: Pass. Tests assume a tiny household model with simple membership and no advanced role matrix beyond the current auth context.
- `Require Flexible Recurrence Accuracy`: Pass. Coverage expansion explicitly includes recurrence-driven due-state transitions and completion reset behavior.
- `Ship The Smallest Useful Cross-Platform Slice`: Pass. The plan focuses on the active Takeout root app and high-value regressions rather than broad platform expansion.
- `Write Testable Product Specs`: Pass. The work is directly oriented around executable checks mapped to spec requirements.
- `Maintain Coverage Discipline`: Pass only if this plan is executed. Current measurable coverage is effectively 0% because the existing unit suite mostly validates configuration strings instead of application code.

## Project Structure

### Documentation (this feature)

```text
specs/001-phase1-chore-loop/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- quickstart-validation.md
|-- contracts/
|   `-- phase1-api.openapi.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
app/
`-- (app)/
    `-- home/
        `-- (tabs)/
            `-- feed/
                `-- index.tsx

src/
|-- features/
|   |-- auth/
|   |   |-- client/
|   |   `-- server/
|   `-- chorecue/
|       |-- components/
|       |-- ChoreHomePage.tsx
|       |-- types.ts
|       `-- useChoreBoard.ts
|-- interface/
|-- test/
|   |-- integration/
|   |-- unit/
|   `-- vitest.config.ts
`-- zero/
```

**Structure Decision**: Use the active root-level Takeout scaffold as the source of truth. New tests should target `src/features/chorecue`, the feed route under `app/`, and the currently active auth/setup files in `src/features/auth` rather than the moved-aside `_old_*` scaffolding.

## Phase 0: Research Summary

1. Coverage tooling exists, but current unit tests mainly inspect configuration files and do not exercise meaningful app code.
2. Vitest coverage can run once the coverage provider version matches the installed Vitest version.
3. The existing auth regression suite is already revealing a real mismatch: it expects `setupClient.ts` for `native`, while `vite.config.ts` now points `native` to `setupNative.ts`.
4. Windows support remains an environmental risk for Bun and Takeout postinstall behavior, so test commands should be resilient and documented with known platform caveats.
5. The highest-value test targets are the ChoreCue board state transitions, auth household context derivation, and the feed route rendering path.

## Phase 1: Design Plan

1. Replace synthetic coverage with executable tests around the active ChoreCue feature state in `src/features/chorecue/useChoreBoard.ts`.
2. Add component-level unit coverage for `ChoreHomePage.tsx` and `components/PhotoInput.tsx`, focusing on section rendering, edit/archive visibility, and photo attachment affordances.
3. Rewrite or fix the auth setup regression suite so it validates the current `setupClient.ts` and `setupNative.ts` contract correctly instead of failing on outdated expectations.
4. Add route-level integration coverage for `app/(app)/home/(tabs)/feed/index.tsx` to ensure the feed renders ChoreCue rather than the Takeout todo demo.
5. Add targeted integration checks for create, complete, bump-limit, edit, archive, and photo-clear flows using the active root app state.
6. Add explicit coverage reporting to the Vitest workflow and fail the pipeline when coverage falls below 80%.
7. Keep Playwright coverage narrow and product-facing: route availability, auth entry points, and the main ChoreCue board interactions once local boot is stable.

## Post-Design Constitution Check

- `Preserve The Shared Chore Loop`: Still passes. Coverage work is anchored to the core household flows.
- `Keep Household Coordination Polite`: Still passes. Bump-limit and reminder tests preserve the human-facing product rule.
- `Favor Small-Household Simplicity`: Still passes. Test data remains small and understandable.
- `Require Flexible Recurrence Accuracy`: Still passes. Recurrence-driven state changes remain first-class test targets.
- `Ship The Smallest Useful Cross-Platform Slice`: Still passes. This is a focused testing plan, not a platform rewrite.
- `Write Testable Product Specs`: Still passes. The plan converts requirements into concrete executable checks.
- `Maintain Coverage Discipline`: Still gated on implementation. The rule is now constitutional, and this plan is the path to enforcing it honestly.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required for this plan.
