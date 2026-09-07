# Implementer Friction Notes

## What went smoothly
- The research.md was excellent — every @take-out/* function was mapped with its source file location
- All @take-out packages had readable, well-structured TypeScript source in node_modules
- The inlining strategy was straightforward for most utilities (ensure, ensureEnv, time, etc.)
- No new test failures were introduced — all 5 failing tests were pre-existing on the base branch

## What was confusing or unclear
- The spec.md and plan.md still reference "kit equivalents" and "kit packages" as if kit publishes runtime npm packages, but the research correctly identified kit as a scaffolding CLI only. The spec needs updating to reflect the "inline" strategy rather than "replace with kit package"
- The contracts/interfaces.md file was referenced in the plan but never created — wasn't needed since research.md covered the mapping

## Where I got stuck
- The emitter module has deep dependencies: it imports dequal, and transitively depends on AbortError/EnsureError classes, globalValue, and createGlobalContext. I simplified by only inlining the functions actually used by chore-cue rather than the full module
- The createBetterAuthClient is the most complex piece — it has a Proxy-based signOut override, retry logic, and storage persistence. Required careful reading of the original source

## Kit issues discovered
- Kit does not provide any runtime packages — it's purely a scaffolding CLI. This means every @take-out/* utility needs to be inlined into each project that migrates. This is a significant gap for the emitter system, auth client wrapper, migration runner, and storage abstraction which are reusable across projects
- No issues filed on yoshisada/kit as there are no "bugs" — the gap is architectural (kit doesn't publish packages)

## What could be improved
- The spec should have reflected the research finding that kit has no runtime packages from the start, rather than assuming 1:1 package replacements
- A shared utilities package in kit's monorepo template would save every project from inlining the same helpers
- The on-zero package still depends on @take-out/helpers as a transitive dependency — this is expected but means bun.lock still references @take-out/helpers indirectly
