# Specifier Friction Notes

**Date**: 2026-04-07
**Agent**: specifier (kiln-playful-household team)

## What went well

- The feature PRD was thorough with all 22 FRs clearly enumerated, making spec generation straightforward.
- Having the existing luxury editorial theme code to reference made it easy to understand the exact token shape and contracts needed.
- The two-implementer split (impl-theme / impl-components) maps cleanly to the file ownership boundaries.

## What was confusing

1. **Branch naming mismatch with speckit scripts**: The branch `build/playful-household-redesign-20260407` uses a `build/` prefix format that the `.specify/scripts/bash/check-prerequisites.sh` and `setup-plan.sh` scripts don't recognize. They expect `NNN-feature-name` format. This forced manual directory resolution instead of using the script automation.

2. **Spec directory naming**: The instruction to use `specs/playful-household-redesign/` (no numeric prefix) conflicts with the convention established by `specs/001-phase1-chore-loop/` and `specs/002-luxury-editorial-redesign/`. Not a problem functionally, but could cause confusion when listing spec directories.

3. **Agent context update script**: The `update-agent-context.sh` script also depends on the branch-name-to-spec-dir convention and failed. This is a non-critical failure since CLAUDE.md already has the right tech context.

## What could be improved

1. **Speckit scripts should support configurable branch naming patterns** — the `build/` prefix format is a valid convention and the scripts should handle it or allow overrides.

2. **The plan template asks for "NEEDS CLARIFICATION" items to drive research**, but this redesign has no unknowns — the PRD resolved all open questions explicitly. The research phase felt somewhat forced for a well-defined visual reskin.

3. **Task template assumes a standard models-services-endpoints pattern** that doesn't map well to a UI/theme-only feature. The user story organization still worked, but the "Models before services" guidance in the template was irrelevant.

## Issues encountered

- `check-prerequisites.sh --json --paths-only` exits with error on non-standard branch names (exit code 1)
- `setup-plan.sh --json` exits with error on non-standard branch names (exit code 1)
- `update-agent-context.sh claude` exits with error because it derives spec path from branch name
