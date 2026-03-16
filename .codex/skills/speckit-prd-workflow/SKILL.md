---
name: speckit-prd-workflow
description: Run the Speckit workflow from a PRD stored in the current repo. Use when Codex needs to find a PRD such as docs/prd.md, fill or update .specify/memory/constitution.md first, extract requirements into a startup checklist, ask only for missing product inputs, and continue the repo's local Speckit prompts, scripts, and templates.
---

# Speckit PRD Workflow

Use this skill when a repository already has a PRD and you need to convert it into constitution-ready, Speckit-ready product inputs without making the user restate what is already documented.

## Inputs

- A repository that contains a PRD, ideally under `docs/`
- Optional local Speckit files under `.specify/` or `.codex/prompts/`
- Optional user clarifications only when the PRD leaves blocking gaps

## Workflow Order

1. Discover the PRD using the repo-first path order in `references/workflow-map.md`.
2. Read `.specify/memory/constitution.md` if present, or locate the local constitution template if the memory file is missing.
3. Read `references/constitution-derivation.md` before writing or updating constitution principles from a PRD.
4. Use the PRD to fill or update the constitution before any specification work.
5. If the constitution needs information the PRD does not provide, ask only the minimum principle-level questions needed to complete it.
6. Read `references/startup-requirements.md` before drafting any specification content and fill its ordered intake sections from the PRD.
7. Mark each intake item as `FILLED`, `PARTIAL`, or `MISSING`.
8. If the PRD leaves required specification information unclear, ask only the minimum follow-up questions needed to continue.
9. Once missing inputs are resolved, summarize the feature in product language and continue the Speckit workflow without asking the user to restate information already present in the PRD.
10. Convert the extracted PRD facts into testable functional requirements, key entities, and measurable success criteria.

## Constitution-First Behavior

- Fill `.specify/memory/constitution.md` before starting `/speckit.specify`.
- Use the local `/speckit.constitution` prompt if the repo includes it.
- Treat the constitution as the governing source for principles, quality bars, and workflow constraints that later specs must respect.
- When the constitution template still contains placeholders, replace them with concrete principles derived from the PRD, repo context, and minimal user clarifications.
- If the constitution already exists and is filled, update it only when the PRD or user request implies new governing principles or changes to existing ones.
- Use `references/constitution-derivation.md` to decide which PRD statements become principles, workflow constraints, or governance rules.
- Use `references/constitution-example.md` as a calibration example for the right level of abstraction.
- Do not copy ordinary feature requirements into the constitution unless they represent a durable rule for future work.

## Rules For Speckit Drafting

- Use the PRD as the system of record for scope, audience, product philosophy, pillars, MVP scope, and future boundaries.
- Keep specifications focused on what users need and why.
- Avoid implementation choices unless the local Speckit workflow explicitly requires technical planning later.
- Reuse wording from the PRD only when it improves fidelity; otherwise rewrite into concise, testable requirements.
- Do not prefill project-specific data into the skill itself. Gather that data from the current repo's PRD at runtime.
- Prefer autonomous continuation: after collecting missing inputs, proceed through the next Speckit step instead of stopping for confirmation.
- When filling a Speckit spec, map PRD material into user scenarios, functional requirements, key entities, and success criteria.

## Missing-Data Behavior

- Ask for missing data only when it materially changes scope, acceptance criteria, or the meaning of a requirement.
- Keep follow-up questions concise and grouped.
- If the PRD gives a reasonable default, use it and record the assumption.
- If the local Speckit workflow supports clarification as a separate step, still collect enough information to produce a viable first spec draft.

## Startup Gate

Before starting `/speckit.specify`, confirm all of the following:

- a PRD file has been found in the repo docs area and read
- `.specify/memory/constitution.md` exists and is filled enough to guide spec decisions
- the ordered checklist in `references/startup-requirements.md` has been filled from the PRD as far as possible
- any remaining missing product inputs are turned into focused clarification questions
- the feature request is consistent with the PRD's current scope or explicitly marked as future-scope
- the next local Speckit step has been identified from the repo workflow files

If the gate is not satisfied, stop and show the incomplete checklist plus the minimum follow-up questions needed to proceed.
