# Data Model: Kit Scaffold Migration

**Date**: 2026-04-04
**Branch**: `build/kit-migration-20260407`

## Overview

This migration has **no data model changes**. All Drizzle schema definitions, migrations, Zero sync types, and generated models remain unchanged. This document records the entities that must be preserved without modification.

## Preserved Entities

### Package Mapping (migration-time only)

A conceptual mapping used during implementation, not persisted in the app.

| Field            | Description                                      |
|------------------|--------------------------------------------------|
| sourcePackage    | The `@take-out/*` package being replaced          |
| targetPackage    | The kit equivalent package                        |
| exports          | List of named exports that must map 1:1           |
| sourceFiles      | List of source files importing from this package  |
| status           | pending, completed, or needs-issue                |

### Migration Log (migration-time only)

Tracks issues discovered during migration for filing on yoshisada/kit.

| Field            | Description                                      |
|------------------|--------------------------------------------------|
| issue            | Description of the problem found                  |
| category         | bug, enhancement, or migration-feedback           |
| workaround       | How it was handled in this migration               |
| githubIssueUrl   | Link to the filed issue on yoshisada/kit           |
| status           | filed, pending, not-needed                         |

## Unchanged Data Entities

The following existing data entities are NOT modified by this migration:

- **User** — Better Auth user records
- **Session** — Better Auth session management
- **Account** — Better Auth account linking
- **Verification** — Better Auth verification tokens
- **Household** — Household grouping
- **HouseholdMember** — Household membership
- **Chore** — Chore definitions with recurrence
- **ChoreCompletion** — Completion history records

All Drizzle schema in `src/database/schema-public.ts` and migrations in `src/database/migrations/` remain byte-for-byte identical.
