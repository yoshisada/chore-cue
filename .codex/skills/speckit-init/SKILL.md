---
name: speckit-init
description: Initialize github/spec-kit in the current repository for Codex. Use when the user asks to bootstrap Spec Kit, run `specify init`, or add `/speckit.*` workflow files to an existing repo.
---

# Speckit Init

Use this skill to bootstrap `github/spec-kit` in the current repository without making the user remember the install command, agent flag, or overwrite rules.

## When to use

Use when the user asks to:

- initialize Spec Kit in the current repo
- run `specify init` or `specify check`
- add `/speckit.*` commands or `.specify/` scaffolding to an existing project
- set up Spec Kit for Codex in a repository that does not have it yet

Do not use this skill for PRD extraction or for running the later Speckit spec workflow after initialization. Use `speckit-prd-workflow` for that follow-on work.

## Inputs

Collect or infer:

- the current repository root
- optional target AI agent; default to `codex` when the user does not specify another supported agent
- optional permission to overwrite/merge if the repo already contains `.specify/` or other Spec Kit-generated files

Safe assumptions:

- use the current working directory as the init target unless the user names another path
- use PowerShell scripts on Windows via `--script ps`
- prefer initializing in-place with `specify init .` or `specify init --here`

## Output

Initialize Spec Kit in the current repo and report:

- the command used
- whether `specify` was installed persistently or run via `uvx`
- which new Spec Kit files or folders were created, especially `.specify/`
- any follow-up step the user can run next, usually `/speckit.constitution`

Do not claim success until the generated scaffolding is visible on disk.

## Workflow

1. Confirm the current repo root and inspect whether `.specify/` or existing `/speckit.*` workflow files are already present.
2. Check whether `specify` is already available.
3. If `specify` is missing, prefer persistent installation with:
   `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git`
4. If persistent install is not appropriate or fails for a non-critical reason, fall back to:
   `uvx --from git+https://github.com/github/spec-kit.git specify ...`
5. Initialize the current repo for Codex:
   - on Windows: `specify init . --ai codex --script ps`
   - otherwise: `specify init . --ai codex`
   - `specify init --here ...` is also acceptable when clearer in the current shell
6. If the directory is non-empty and Spec Kit asks to merge, do not add `--force` unless the user explicitly asked for overwrite behavior or confirmed it.
7. Verify the result by checking the expected generated files and summarizing what changed.
8. Point the user to the next Speckit step, usually `/speckit.constitution`.

## Validation

Before finishing, verify all of the following:

- `specify init` completed successfully
- `.specify/` now exists, unless the upstream tool changed its layout and another clear Spec Kit scaffold was created
- the repo now contains the expected Speckit command scaffolding for the chosen agent
- the response mentions any manual next step or unresolved warning

## Stop conditions

Pause and ask before continuing if:

- the repo already contains `.specify/` and re-initialization could overwrite or merge files
- `--force` would be required to continue
- the user asked for an unsupported agent and the correct `--ai` value cannot be inferred safely
- `uv`, Python, or Git is missing and there is no workable fallback

If initialization fails, report the exact failing step, keep any partial changes intact, and suggest the smallest next action instead of retrying destructive commands.
