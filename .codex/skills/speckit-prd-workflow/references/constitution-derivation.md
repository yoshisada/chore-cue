# Constitution Derivation Guide

Use the repository PRD to derive durable product principles for `.specify/memory/constitution.md`.

Write principles that govern future work, not one-off feature details.

## What Belongs In The Constitution

Promote PRD content into the constitution when it is:

- a durable product philosophy
- a quality bar that should constrain future implementation
- a workflow rule that future specs must follow
- a recurring user promise the product must preserve
- a scope rule that should be treated as a guardrail

Do not promote PRD content when it is:

- a one-time feature requirement
- a temporary MVP shortcut
- a detailed UI preference with no wider governance value
- an implementation idea that belongs in planning

## Derivation Process

1. Read the PRD sections for philosophy, principles, target users, scope boundaries, success criteria, and non-goals.
2. Identify the statements that should hold true across multiple features.
3. Rewrite those statements as durable, testable principles.
4. Add workflow constraints for how future specs should be created if the PRD implies them.
5. Keep the number of principles small enough to be memorable and enforceable.

## Principle Writing Rules

- Use short principle names.
- State the rule, then the rationale if needed.
- Prefer constraints that can be checked during spec, plan, or review.
- Keep product philosophy separate from implementation details.
- Avoid vague language such as "best", "robust", or "intuitive" unless the PRD defines what that means.

## Mapping Heuristics

### Product philosophy -> principle

If the PRD says the product should preserve a repeated value promise or operating philosophy, convert it into a principle.

Example pattern:

- PRD: "Users should always understand why the system recommended an action."
- Constitution principle: "Explain Recommendation Decisions: user-facing recommendations must include enough reasoning context for the user to validate the recommendation."

### Scope boundary -> guardrail

If the PRD clearly excludes a class of features or complexity, treat it as a guardrail.

Example pattern:

- PRD: "The MVP avoids broad automation and focuses on a single guided workflow."
- Constitution principle: "Preserve Guided Scope: new feature specs must keep the MVP centered on one guided workflow unless the PRD explicitly broadens scope."

### Workflow expectation -> process rule

If the PRD implies how work should be validated, surfaced, or reviewed, convert it into a workflow rule for future specs.

Example pattern:

- PRD: "Every feature must support measurable product outcomes."
- Constitution principle: "Attach Measurable Outcomes: every spec must include falsifiable success criteria tied to product outcomes."

## Validation Checklist

Before finalizing the constitution update, verify:

- each principle is durable across multiple future features
- each principle is implied by the PRD or by clear repo workflow context
- no principle is just a restated feature requirement
- the principle set is concise and non-overlapping
- the wording is concrete enough to shape future spec decisions
