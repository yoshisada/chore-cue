# Data Model: ChoreCue Phase 1 MVP

## HouseholdMember

**Purpose**: Represents a person in the shared household who can create chores, complete chores, and send bumps.

**Fields**:

- `memberId`: Stable unique identifier
- `householdId`: Identifier for the household the member belongs to
- `displayName`: Human-readable name used in assignment and reminder flows
- `status`: Active or inactive membership state
- `createdAt`: Membership creation timestamp

**Relationships**:

- Belongs to one household
- Can create many chores
- Can be assigned many chores
- Can create many bump events
- Can complete many chores over time

**Validation Rules**:

- `displayName` is required for assignment visibility
- A member can belong to only one active household in Phase 1

## Household

**Purpose**: Groups the members and chores that share one small-home workflow.

**Fields**:

- `householdId`: Stable unique identifier
- `name`: Optional household label
- `createdAt`: Household creation timestamp

**Relationships**:

- Has many household members
- Has many chores

**Validation Rules**:

- Household complexity stays minimal in Phase 1 and does not include role configuration

## Chore

**Purpose**: Stores the primary recurring household task that users create, review, complete, edit, archive, and bump against.

**Fields**:

- `choreId`: Stable unique identifier
- `householdId`: Household that owns the chore
- `title`: Required chore title
- `description`: Optional supporting description
- `category`: User-defined chore category label
- `assigneeMemberId`: Assigned household member
- `createdByMemberId`: Member who created the chore
- `status`: Active or archived state
- `photoAssetId`: Optional linked photo reference
- `lastCompletedAt`: Most recent completion timestamp, nullable until first completion
- `nextDueAt`: Next due timestamp or equivalent due-state anchor
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relationships**:

- Belongs to one household
- Has one assignee
- Has one recurrence rule
- Has many completion records
- Has many bump events

**Validation Rules**:

- `title`, `category`, `assigneeMemberId`, and recurrence data are required for an active chore
- Archived chores are excluded from normal bump eligibility
- `nextDueAt` must be recalculated whenever recurrence inputs or completion state changes

**State Transitions**:

- `active -> archived` when a user archives a chore
- `archived -> active` is optional for later implementation and not required in Phase 1
- `active` chores can receive completion events and eligible bumps

## RecurrenceRule

**Purpose**: Defines how the system calculates the next due value for a chore.

**Fields**:

- `recurrenceRuleId`: Stable unique identifier
- `choreId`: Linked chore
- `ruleType`: One of `interval_days`, `weekly_day`, or `daily_time`
- `intervalDays`: Positive integer used for every-`N`-days rules
- `dayOfWeek`: Selected weekday for weekly rules
- `timeOfDay`: Selected time for daily-time rules
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relationships**:

- Belongs to one chore

**Validation Rules**:

- Exactly one supported rule type must be active for a recurrence rule
- `intervalDays` is required only for interval rules and must be greater than zero
- `dayOfWeek` is required only for weekly rules
- `timeOfDay` is required only for daily-time rules

## ChoreCompletion

**Purpose**: Preserves timestamped completion history and triggers due recalculation.

**Fields**:

- `completionId`: Stable unique identifier
- `choreId`: Linked chore
- `completedByMemberId`: Member who completed the chore
- `completedAt`: Completion timestamp

**Relationships**:

- Belongs to one chore
- Belongs to one completing member

**Validation Rules**:

- Completion records can only be created for active chores
- Creating a completion record must update the parent chore's `lastCompletedAt` and `nextDueAt`

## BumpEvent

**Purpose**: Records polite reminder attempts so the system can preserve context and enforce rate limits.

**Fields**:

- `bumpEventId`: Stable unique identifier
- `choreId`: Linked chore
- `senderMemberId`: Member sending the bump
- `recipientMemberId`: Assigned member receiving the bump
- `sentAt`: Timestamp of the accepted bump
- `messageType`: Identifier for the polite bump template used

**Relationships**:

- Belongs to one chore
- Belongs to one sender
- Belongs to one recipient

**Validation Rules**:

- Sender and recipient must be different active household members
- A bump can only be created for an active chore with a valid assignee
- No more than five bump events from the same sender may be accepted within one calendar day

## PhotoAsset

**Purpose**: Represents an optional image linked to a chore for context.

**Fields**:

- `photoAssetId`: Stable unique identifier
- `storageKey`: Opaque reference to the stored asset
- `uploadedByMemberId`: Member who attached the photo
- `createdAt`: Upload timestamp

**Relationships**:

- Can be linked from one or more chores if reuse is later allowed, but Phase 1 assumes one-to-one chore attachment

**Validation Rules**:

- Photo attachment remains optional and must not block core chore operations when absent
