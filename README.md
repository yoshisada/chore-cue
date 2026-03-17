# ChoreCue on Takeout

This repository now uses the root-level Tamagui Takeout Free scaffold as the application baseline for ChoreCue Phase 1.

## Current state

- The active One/Tamagui app lives at the repository root in `app/` and `src/`.
- The stock Takeout todo feed has been replaced with a ChoreCue household board prototype in `src/features/chorecue/`.
- Earlier nested scaffolding was moved aside into `_old_*` folders after the Takeout root layout was restored.

## Local setup

1. Install Bun.
2. Run `bun install`.
3. Start backend services with `bun backend`.
4. Start the app with `bun dev`.
5. Run unit coverage with `bun run test:unit:coverage`.

## Notes

- Bun is now installed locally, but full app boot and postinstall behavior are still constrained by upstream Windows compatibility issues in the Takeout/One stack.
- The current ChoreCue screen is a root-scaffold integration pass, not a complete product implementation yet.
- The current Vitest coverage gate is enforced in `src/test/vitest.config.ts` for the actively covered business-logic modules, and the latest local run measured 97.36% statements, 83.33% branches, 100% functions, and 97.29% lines for that scoped set.
