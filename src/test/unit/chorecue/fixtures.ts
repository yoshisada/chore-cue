import { toChoreCard } from '~/features/chorecue/choreMapping'

import type { ChoreRow } from '~/features/chorecue/choreMapping'
import type {
  ChoreCard,
  ChoreComposerState,
  ChoreEditorState,
  RecurrenceSummary,
} from '~/features/chorecue/types'

/**
 * fixtures are row-first: the DB-shaped row is the source of truth and the view
 * model is derived from it through `toChoreCard`, so the two representations
 * cannot drift apart in the way a hand-written card fixture always eventually
 * does.
 */

/** monday, 09:00 UTC — one fixed clock shared by every chorecue test */
export const FIXED_NOW = Date.parse('2026-06-15T09:00:00.000Z')

export const HOUR_MS = 60 * 60 * 1000
export const DAY_MS = 24 * HOUR_MS

export const HOUSEHOLD_ID = 'household-test'
export const VIEWER_USER_ID = 'user-sam'
export const VIEWER_MEMBER_ID = 'member-sam'
export const OTHER_MEMBER_ID = 'member-alex'

export const householdRow = {
  id: HOUSEHOLD_ID,
  name: 'Test Household',
  createdAt: FIXED_NOW - 30 * DAY_MS,
}

export function buildMemberRows() {
  return [
    {
      id: VIEWER_MEMBER_ID,
      householdId: HOUSEHOLD_ID,
      userId: VIEWER_USER_ID,
      role: 'admin',
      status: 'active',
      timezone: 'UTC',
      displayName: 'Sam',
      joinedAt: FIXED_NOW - 30 * DAY_MS,
    },
    {
      // a "local member": in the household, no login
      id: OTHER_MEMBER_ID,
      householdId: HOUSEHOLD_ID,
      userId: null,
      role: 'member',
      status: 'active',
      timezone: 'UTC',
      displayName: 'Alex',
      joinedAt: FIXED_NOW - 20 * DAY_MS,
    },
  ]
}

export const memberLookup = new Map([
  [VIEWER_MEMBER_ID, { name: 'Sam', active: true }],
  [OTHER_MEMBER_ID, { name: 'Alex', active: true }],
])

export function buildChoreRow(overrides: Partial<ChoreRow> = {}): ChoreRow {
  return {
    id: 'test-chore-1',
    householdId: HOUSEHOLD_ID,
    title: 'Test chore',
    description: null,
    tags: ['Test'],
    // assigned to the *other* member by default, so the viewer may bump it
    assigneeMemberId: OTHER_MEMBER_ID,
    createdByMemberId: VIEWER_MEMBER_ID,
    status: 'active',
    recurrenceRuleType: 'interval_days',
    recurrenceIntervalDays: 3,
    recurrenceDayOfWeek: null,
    recurrenceTimeMinutes: 9 * 60,
    timezone: 'UTC',
    nextDueAt: FIXED_NOW + 6 * HOUR_MS,
    lastCompletedAt: null,
    lastCompletedByMemberId: null,
    lastBumpedAt: null,
    archivedAt: null,
    photoLabel: null,
    createdAt: FIXED_NOW - 10 * DAY_MS,
    updatedAt: FIXED_NOW - 10 * DAY_MS,
    ...overrides,
  } as ChoreRow
}

export function buildOverdueRow(overrides: Partial<ChoreRow> = {}): ChoreRow {
  return buildChoreRow({
    id: 'overdue-1',
    title: 'Overdue chore',
    nextDueAt: FIXED_NOW - 2 * DAY_MS,
    ...overrides,
  })
}

export function buildDueRow(overrides: Partial<ChoreRow> = {}): ChoreRow {
  return buildChoreRow({
    id: 'due-1',
    title: 'Due chore',
    nextDueAt: FIXED_NOW + 6 * HOUR_MS,
    ...overrides,
  })
}

export function buildUpcomingRow(overrides: Partial<ChoreRow> = {}): ChoreRow {
  return buildChoreRow({
    id: 'upcoming-1',
    title: 'Upcoming chore',
    recurrenceRuleType: 'weekly_day',
    recurrenceIntervalDays: null,
    recurrenceDayOfWeek: 5,
    recurrenceTimeMinutes: 10 * 60,
    nextDueAt: FIXED_NOW + 4 * DAY_MS,
    ...overrides,
  })
}

export function buildMixedRows(): ChoreRow[] {
  return [buildOverdueRow(), buildDueRow(), buildUpcomingRow()]
}

export function buildRowsWithArchived(): ChoreRow[] {
  return [
    ...buildMixedRows(),
    buildChoreRow({
      id: 'archived-1',
      title: 'Archived chore',
      status: 'archived',
      archivedAt: FIXED_NOW - DAY_MS,
    }),
  ]
}

export interface CardContextOverrides {
  now?: number
  viewerMemberId?: string
  bumpsUsedToday?: number
}

/** the same derivation the hook performs, so card fixtures stay honest */
export function toCard(row: ChoreRow, ctx: CardContextOverrides = {}): ChoreCard {
  return toChoreCard(row, {
    now: ctx.now ?? FIXED_NOW,
    viewerMemberId: ctx.viewerMemberId ?? VIEWER_MEMBER_ID,
    bumpsUsedToday: ctx.bumpsUsedToday ?? 0,
    members: memberLookup,
  })
}

export function buildChore(overrides: Partial<ChoreCard> = {}): ChoreCard {
  return { ...toCard(buildChoreRow()), ...overrides }
}

export function buildOverdueChore(overrides: Partial<ChoreCard> = {}): ChoreCard {
  return { ...toCard(buildOverdueRow()), ...overrides }
}

export function buildDueChore(overrides: Partial<ChoreCard> = {}): ChoreCard {
  return { ...toCard(buildDueRow()), ...overrides }
}

export function buildUpcomingChore(overrides: Partial<ChoreCard> = {}): ChoreCard {
  return { ...toCard(buildUpcomingRow()), ...overrides }
}

export function buildMixedCards(): ChoreCard[] {
  return buildMixedRows().map((row) => toCard(row))
}

export function buildCardsWithArchived(): ChoreCard[] {
  return buildRowsWithArchived().map((row) => toCard(row))
}

export function buildComposer(
  overrides: Partial<ChoreComposerState> = {}
): ChoreComposerState {
  return {
    title: 'New chore',
    tags: ['Kitchen'],
    assigneeName: 'Sam',
    recurrenceSummary: 'Every N days',
    photoLabel: '',
    ...overrides,
  }
}

export function buildEditor(overrides: Partial<ChoreEditorState> = {}): ChoreEditorState {
  return {
    choreId: 'test-chore-1',
    title: 'Test chore',
    tags: ['Test'],
    assigneeName: 'Alex',
    recurrenceSummary: 'Every N days',
    photoLabel: '',
    ...overrides,
  }
}

export const allRecurrenceTypes: RecurrenceSummary[] = [
  'Every N days',
  'Weekly',
  'Daily time',
]
