---
description: Run the post-implementation testing workflow. Executes unit tests, Playwright web integration tests, then mobile verification — in that order. Invoke immediately after a feature is considered complete.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Purpose

This skill is the **mandatory gate between "implementation done" and "feature done"**. A feature is NOT complete until all test phases pass. If any phase fails, stop, fix the issue in-place, and re-run that phase before proceeding to the next.

## Test Execution Order

Tests run in strict sequential phases. Do NOT skip phases or reorder them.

```
Phase 1: Unit Tests          (fast feedback — pure logic regressions)
Phase 2: Playwright Web Tests (full integration against Chromium)
Phase 3: Mobile Verification  (iOS simulator build & manual/visual check)
```

## Outline

### Phase 1 — Unit Tests

1. Run unit tests for fast regression feedback:

   ```sh
   bun run test:unit
   ```

2. If unit tests pass, run coverage to check thresholds:

   ```sh
   bun run test:unit:coverage
   ```

3. **Coverage gate**: The project enforces 80% on lines, functions, statements, and branches for files listed in `src/test/vitest.config.ts` → `coverage.include`. If coverage drops below threshold:
   - Identify which file(s) fell below the threshold
   - Write or update unit tests in `src/test/unit/` to restore coverage
   - Re-run `bun run test:unit:coverage` until the gate passes

4. **If any unit test fails**:
   - Read the failure output and identify the root cause
   - Fix the implementation (not the test) unless the test itself is wrong
   - Re-run `bun run test:unit` until green
   - Do NOT proceed to Phase 2 until all unit tests pass with coverage met

### Phase 2 — Playwright Web Integration Tests

1. **Pre-check**: Confirm the dev server is running on `http://localhost:8081`. If not, inform the user to start it with `bun dev` (or `bun backend && bun dev` if the backend is also down). Do NOT start the server yourself — the user manages the dev environment.

2. Run Playwright integration tests:

   ```sh
   bun run test:integration
   ```

3. **If any integration test fails**:
   - Read the Playwright failure output (screenshots will be in `src/test/integration/.output/test-results/`)
   - Identify whether the failure is:
     - **Implementation bug**: Fix the source code, re-run
     - **Test needs updating**: If the feature intentionally changed behavior that a test asserts, update the test to match the new behavior
     - **Flaky/timing issue**: Check for missing `waitFor` calls or race conditions, fix the test
   - Re-run `bun run test:integration` until green
   - Do NOT proceed to Phase 3 until all Playwright tests pass

4. **If the feature added new user-facing flows** that are not covered by existing integration tests:
   - Check existing tests in `src/test/integration/` to confirm coverage
   - If new flows are untested, write new Playwright spec files following the project conventions:
     - Place in `src/test/integration/` or a feature subdirectory (e.g., `src/test/integration/chorecue/`)
     - Use `*.spec.ts` naming
     - Use helpers from `src/test/integration/helpers.ts` (`loginAsDemo`, `waitForZeroSync`)
     - Use `test.describe` blocks and `test.beforeEach` for setup
     - Assert with `expect(...).toBeVisible()`, `toHaveText()`, etc.
   - Re-run to confirm the new tests pass

### Phase 3 — Mobile Verification

1. **iOS Simulator build** (primary mobile target):

   ```sh
   bun run ios
   ```

2. After the build completes and the app launches in the simulator:
   - Inform the user that the iOS build is running
   - Ask the user to visually verify the feature on the simulator
   - If the user reports issues, fix them and rebuild

3. **Android** (if the user requests or if the feature has platform-specific code using `.native.ts` files):

   ```sh
   bun run android
   ```

4. **Platform-specific regressions**: If any `.native.ts` or `.native.tsx` files were modified during the feature, mobile testing is mandatory — do not skip Phase 3.

## Completion Criteria

A feature is **test-complete** when ALL of the following are true:

- [ ] Unit tests pass (`bun run test:unit`)
- [ ] Coverage thresholds met (`bun run test:unit:coverage`)
- [ ] Playwright integration tests pass (`bun run test:integration`)
- [ ] New user-facing flows have integration test coverage
- [ ] iOS simulator build succeeds and user confirms visual correctness
- [ ] (If applicable) Android build succeeds

## Failure Protocol

If you cannot resolve a test failure after 3 attempts at fixing the same issue:

1. Stop and report the failure clearly to the user
2. Include: the failing test name, the error message, what you tried, and your best diagnosis
3. Ask the user how they want to proceed

## Notes

- This skill is registered as a mandatory `after_implement` hook in `.specify/extensions.yml`. It should fire automatically after `/speckit.implement` completes.
- The testing order (unit → web → mobile) is intentional: catch logic bugs cheaply before running expensive integration and build steps.
- Playwright tests run against Chromium Desktop only (see `src/test/playwright.config.ts`).
- Coverage scope is limited to files explicitly listed in `src/test/vitest.config.ts` — if you add new pure-logic files during implementation, add them to the coverage `include` array.
