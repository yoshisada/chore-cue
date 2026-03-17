# AGENTS

<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:
- Invoke: `npx openskills read <skill-name>` (run in your shell)
  - For multiple: `npx openskills read skill-one,skill-two`
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
</usage>

<available_skills>

<skill>
<name>speckit-init</name>
<description>Initialize github/spec-kit in the current repository for Codex. Use when the user asks to bootstrap Spec Kit, run `specify init`, or add `/speckit.*` workflow files to an existing repo.</description>
<location>project</location>
</skill>

<skill>
<name>speckit-prd-workflow</name>
<description>Run the Speckit workflow from a PRD stored in the current repo. Use when Codex needs to find a PRD such as docs/prd.md, fill or update .specify/memory/constitution.md first, extract requirements into a startup checklist, ask only for missing product inputs, and continue the repo's local Speckit prompts, scripts, and templates.</description>
<location>project</location>
</skill>

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>
