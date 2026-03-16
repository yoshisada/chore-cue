# Speckit Workflow Map

Use this map to discover and align the skill with the current repository's workflow files.

## PRD Discovery Order

Check for the PRD in this order:

1. `docs/prd.md`
2. `docs/*prd*.md`
3. `*prd*.md` in the repo root

If no PRD is found, ask the user for the PRD path before continuing.

## Constitution Files

Check for constitution artifacts in this order:

1. `.specify/memory/constitution.md`
2. `.specify/templates/constitution-template.md`
3. `.codex/prompts/speckit.constitution.md`

If the memory constitution is missing but the template exists, fill the template into the memory file before continuing.

For guidance on converting PRD content into constitution principles, read:

- `references/constitution-derivation.md`
- `references/constitution-example.md`

## Prompt Files

Look for these prompt files if the repo uses local `.codex` prompts:

- `.codex/prompts/speckit.constitution.md`: create or update the project constitution before specification work
- `.codex/prompts/speckit.specify.md`: create or update the feature specification from a natural-language description, create the feature branch, and generate `checklists/requirements.md`
- `.codex/prompts/speckit.clarify.md`: resolve open specification questions
- `.codex/prompts/speckit.plan.md`: build the implementation plan and design artifacts
- `.codex/prompts/speckit.tasks.md`: generate dependency-ordered tasks from the spec and plan
- `.codex/prompts/speckit.checklist.md`: create requirement-quality checklists
- `.codex/prompts/speckit.analyze.md`, `.implement.md`, `.constitution.md`, `.taskstoissues.md`: downstream support prompts

## Script Files

Look for these script files if the repo uses the `.specify` workflow:

- `.specify/scripts/powershell/create-new-feature.ps1`: create the feature branch and initialize spec paths
- `.specify/scripts/powershell/check-prerequisites.ps1`: resolve the active feature directory and available docs
- `.specify/scripts/powershell/setup-plan.ps1`: initialize planning files
- `.specify/scripts/powershell/update-agent-context.ps1`: refresh agent context from the plan

## Templates

Look for these template files if they exist:

- `.specify/templates/spec-template.md`: structure for `spec.md`
- `.specify/templates/checklist-template.md`: structure for checklists
- `.specify/templates/plan-template.md`: structure for `plan.md`
- `.specify/templates/tasks-template.md`: structure for `tasks.md`

## How To Use This Skill With The Workflow

1. Discover the PRD.
2. Discover the constitution files and fill or update `.specify/memory/constitution.md`.
3. Fill the intake checklist in `startup-requirements.md`.
4. Discover the local Speckit prompts, scripts, and templates.
5. Ask only for missing product inputs that block a viable constitution or spec draft.
6. Convert the feature into PRD-aligned user stories, requirements, entities, and success criteria.
7. Start the local Speckit flow after the startup gate passes.

## Failure Handling

- If the PRD is missing, stop and ask for its location.
- If the constitution template exists but the memory constitution is missing, create the memory constitution before proceeding.
- If Speckit prompt or script files are missing, explain which workflow component is unavailable and continue with the closest supported step.
- If the PRD is too sparse to derive a viable first spec, ask only the minimum product questions needed to proceed.
