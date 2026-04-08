# Specifier Friction Notes

**Date**: 2026-04-04
**Agent**: specifier
**Branch**: build/kit-migration-20260408

## What was confusing or unclear

1. **Branch naming convention**: The scripts (`check-prerequisites.sh`, `setup-plan.sh`, `create-new-feature.sh`, `update-agent-context.sh`) all expect feature branches named like `001-feature-name` (numeric prefix + kebab-case). The team lead set up `build/kit-migration-20260407` which doesn't match this pattern. Every script failed with "Not on a feature branch." I had to bypass all scripts and work manually.

2. **Spec directory naming**: The instructions said "spec directory MUST be specs/kit-migration/ — no numeric prefix." This conflicts with the script defaults which would create `specs/003-kit-migration/` or similar. Since the scripts all failed anyway, this was moot, but the conflicting conventions were confusing.

3. **Kit is a scaffolder, not a runtime library**: The initial feature description and PRD assumed kit would provide npm package replacements for `@take-out/*`. The researcher found that kit is actually a project scaffolding CLI (like create-next-app) and doesn't publish runtime packages. This required a significant mid-stream pivot in the plan from "swap package imports" to "inline everything locally." The PRD should have clarified this upfront.

## Where I got stuck

1. **Every shell script failed**: All four speckit bash scripts errored because the branch name didn't match `###-feature-name` format. I had to manually: create the spec directory, copy template content, and write all files directly. The `update-agent-context.sh` script was the only one I couldn't work around (it requires reading plan.md from a path derived from the branch name).

2. **Research pivot**: After the researcher updated research.md with the finding that kit has no runtime packages, I had to rewrite plan.md and contracts/interfaces.md to change the strategy from "swap imports" to "inline utilities." The first versions of these files were based on incorrect assumptions.

## What could be improved for next time

1. **Branch name flexibility in scripts**: The speckit bash scripts should accept a `--spec-dir` flag to override the auto-detected spec directory, or support arbitrary branch naming patterns beyond `###-feature-name`.

2. **PRD accuracy on kit**: The PRD should investigate whether the target scaffold provides runtime packages before assuming a 1:1 package swap. A single sentence like "kit is a scaffolding tool, not a runtime library" would have saved the plan rewrite.

3. **Run research before specify/plan**: For migration tasks, running research first (to understand the target) before writing the spec/plan would prevent the mid-stream pivot. The current pipeline order (specify -> plan with research -> tasks) assumes the feature description is accurate, which it wasn't for the kit migration strategy.

4. **Team lead should set branch name compatible with speckit scripts**, or the scripts should be updated to handle custom branch patterns.
