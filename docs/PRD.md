# Product Requirements Document

Product Name: `ChoreCue`

## Overview

ChoreCue is a lightweight shared household app for couples or roommates who want to stop losing track of recurring chores. The product helps users see what needs to be done, when it was last completed, and who should handle it next without turning reminders into nagging.

## Product Thesis

Small households often do not need a complex family management platform. They need a simple shared system that makes chores visible, keeps completion history accurate, and enables polite nudges when something is overdue.

## Problem

- Couples and roommates forget when chores like laundry, watering plants, or cleaning were last done.
- Recurring tasks do not fit a single schedule pattern; some happen every few days, some weekly, and some at a specific time.
- Asking a partner to do a chore can feel awkward or repetitive without a neutral system.
- Generic task apps do not center on household recurrence, completion history, or gentle shared accountability.

## Goals

- Make recurring household chores easy to create and manage.
- Track when each chore was last completed and when it is due next.
- Let one user politely bump another user to complete a chore.
- Keep the product simple enough to ship quickly as a personal project with low-cost infrastructure.
- Add light gamification so chore completion feels satisfying rather than purely administrative.

## Non-Goals

- Building a paid SaaS product or monetization system.
- Supporting large households, property managers, or enterprise use cases in the first version.
- Creating a full smart-home platform or home inventory system.
- Optimizing for advanced admin roles, permissions, or complex organizational hierarchies.
- Defining success metrics beyond `TBD`, since the user explicitly chose placeholders for now.

## Target Users

- Primary users: couples sharing a home.
- Secondary users: roommates or small families with simple shared chore responsibilities.
- Context: personal B2C-style usage, but not intended as a commercial product initially.
- Buyer: not applicable for `v1`; this is a personal project for the user and their girlfriend.

## Core User Stories

- As a user, I want to create a chore with a title, category, optional photo, and schedule so I can track recurring home tasks.
- As a user, I want to see when a chore was last completed and when it is due next so I do not have to remember it manually.
- As a user, I want to mark a chore as done and automatically reset its timer so the next due date stays accurate.
- As a user, I want to define different recurrence patterns such as every 5 days, every Wednesday, or every day at a certain time.
- As a user, I want to bump my partner or roommate to do a chore in a polite way so reminders feel less personal.
- As a user, I want bumping to be rate-limited so the app does not become annoying or abusive.
- As a user, I want flexible chore categories so I can organize tasks in a way that matches our home.

## Functional Requirements

- Users can create, edit, archive, and view chores.
- Each chore includes:
  - title
  - optional description
  - dynamic category
  - optional photo
  - assignee or target person
  - recurrence schedule
  - last completed timestamp
  - next due timestamp or state
- The app supports recurring schedule types including:
  - every `N` days
  - specific day of week
  - daily at a specified time
  - bump-only or reminder-oriented chores
- Users can mark a chore as completed.
- Completing a chore stores the completion time and recalculates the next due date.
- Users can view a list of chores and their current status, including overdue and upcoming chores.
- Users can bump another household member for a chore.
- The app limits bumps to 5 per user per day.
- Bumps are worded politely by default.
- Users can upload or attach a photo to a chore for context.
- The app is mobile-first and must support cross-platform delivery.
- The preferred starting stack is [`tamagui/takeout-free`](https://github.com/tamagui/takeout-free).
- The initial client stack uses Expo, Tamagui, and One for a shared cross-platform app experience.
- The initial backend and data stack uses PostgreSQL, Zero for sync, Better Auth for authentication, and Drizzle ORM for schema management.
- The product should still aim for free or very low-cost development and deployment where practical.

## Technical Approach

- Starting point: [`tamagui/takeout-free`](https://github.com/tamagui/takeout-free)
- Frontend:
  - Expo for mobile runtime
  - Tamagui for shared UI
  - One for universal app structure and routing
- Backend and data:
  - PostgreSQL as the primary database
  - Zero for real-time sync
  - Better Auth for authentication
  - Drizzle ORM for database schema and migrations
- Infrastructure notes:
  - Local development expects Bun and Docker
  - The starter includes web support, but mobile is the primary product surface
  - Storage and deployment details can be refined later based on cost and operational simplicity

## UX / Product Principles

- Fast to understand: users should know what is due in a few seconds.
- Low friction: completing a chore should take one tap or click.
- Polite by design: reminders should reduce tension, not create more of it.
- Flexible enough for real households: recurrence and categories must cover common home chore patterns.
- Lightweight and affordable: infrastructure and product scope should stay small.
- Slightly playful: gamification should encourage consistency without overshadowing the core utility.
- Cross-platform by default: the product should feel native on mobile while sharing as much implementation as possible.
- Wireframe-first UI: `v1` should use the simplest possible interface, with minimal visual polish and no time spent on advanced styling beyond clarity and usability.

## Success Metrics

- `TBD`
- `TBD`
- `TBD`
- Time window for measurement: `TBD`

## Risks / Unknowns

- Whether gamification meaningfully improves habit completion for a two-person household.
- Whether polite bumps feel helpful or still come across as nagging.
- Which recurrence model users need most often, and whether the initial scheduling options are enough.
- Whether photo support adds enough value to justify the extra implementation and storage complexity.

## Assumptions

- The first release is for a very small household, usually 2 users.
- Users are comfortable with a mobile-first experience.
- `v1` is explicitly cross-platform rather than web-only.
- `tamagui/takeout-free` is the implementation baseline unless a major blocker appears during setup or early development.
- Expo, Tamagui, and One are the preferred app-layer technologies.
- PostgreSQL, Zero, Better Auth, and Drizzle are the preferred data/auth stack for the initial build.
- Authentication and household setup can remain simple in `v1`.
- Notification volume should stay intentionally limited to avoid fatigue.
- The UI should stay intentionally plain and wireframe-like until the core chore loop is working well.

## Open Questions

- What exact forms of gamification are desirable in the MVP without adding too much scope?
- Should chores support one assignee at a time only, or optional shared ownership?
- How should bump-only chores differ from regularly scheduled chores in the UI and data model?
- Which items are explicitly excluded from the MVP? `TBD`
- Should web support ship alongside mobile in `v1`, or follow after iOS and Android are stable?
- Will the production deployment stay close to the starter defaults, or should parts of the backend be swapped later for cheaper managed services?
