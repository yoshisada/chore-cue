# Startup Requirements Intake

Use this file as the required, ordered startup checklist after the constitution has been filled or updated. Fill it from the current repo PRD. Do not prefill this file with project-specific content.

For each item, record:

- `Status`: `FILLED`, `PARTIAL`, or `MISSING`
- `Source`: PRD section or user clarification
- `Notes`: concise extracted content or the missing-data question

## 1. Product Definition

- Product name
- Product summary
- Core product philosophy
- Primary problem to solve

## 2. Target Users

- Primary user segments
- User goals by segment
- Secondary or future audiences
- User segments explicitly out of scope

## 3. Product Scope Boundaries

- MVP or current-scope capabilities
- Future features
- Explicit exclusions or non-goals

## 4. Core Pillars To Preserve

- Core system or product pillars
- Core user value promises
- Important philosophy constraints that must survive feature work

## 5. Actor And Profile Requirements

- Main account, workspace, or tenancy behavior
- Per-actor configuration requirements
- Profile or persona inputs
- Stored profile fields

## 6. Core Workflow Requirements

- Key configuration or strategy fields
- Inputs that influence behavior
- Primary workflow types
- Lists, collections, or categories the system must manage
- Purpose of each workflow or collection type

## 7. Detection, Decision, Or Recommendation Requirements

- Source types
- Input event or signal types
- Filtering or prioritization factors
- Evaluation criteria
- Output or recommendation types
- Inbox, queue, or surfaced-record fields
- Allowed user actions

## 8. Content, Action, And Queue Requirements

- Content or output types
- Action or engagement types
- Priority ordering rules
- Queue, draft, or state buckets
- Allowed queue actions

## 9. Analytics And Interface Requirements

- Core metrics
- Analysis dimensions
- UI, extension, or integration capabilities

## 10. Initial Entity List

- Main actors
- Main configuration objects
- Main workflow records
- Main generated outputs
- Main analytics or reporting records

## 11. Requirement Translation Rules

Turn the startup facts above into Speckit requirements using these rules:

- Write each functional requirement as a testable system behavior.
- Prefer one requirement per user-visible capability.
- Separate current-scope requirements from future-scope notes.
- Convert PRD lists into explicit capabilities, constraints, or managed entities.
- Translate product philosophy into requirement intent, not marketing copy.
- Use the entity list when filling `Key Entities`.
- Use target users and goals when drafting `User Scenarios & Testing`.
- Use measurable product outcomes when drafting `Success Criteria`.

## 12. Minimum Start Condition

The startup checklist is considered complete enough to begin `/speckit.specify` when the current feature request can be tied back to:

- a filled or updated constitution
- at least one target user segment or actor
- at least one in-scope capability or one explicitly marked future feature
- at least five functional requirements derived from the intake
- at least one key entity
- at least three measurable or falsifiable success criteria
