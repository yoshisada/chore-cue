import { firstDueAt } from './recurrence'
import { DAY_MS } from './timezone'

import type { RecurrenceRule } from './recurrence'

/**
 * the three chores a brand-new household starts with.
 *
 * one per recurrence type and one per due bucket, so the whole loop (overdue →
 * complete → reschedule, bump, archive) is demonstrable on a fresh signup
 * instead of landing on an empty board. pure: `now` is passed in.
 */

export interface StarterChoresInput {
  householdId: string
  memberId: string
  now: number
  timezone?: string
}

export interface StarterChore {
  id: string
  householdId: string
  title: string
  tags: string[]
  assigneeMemberId: string
  createdByMemberId: string
  rule: RecurrenceRule
  nextDueAt: number
}

export const STARTER_CHORE_COUNT = 3

export function starterChoreId(householdId: string, index: number): string {
  return `${householdId}-starter-${index}`
}

export function buildStarterChores(input: StarterChoresInput): StarterChore[] {
  const timezone = input.timezone || 'UTC'
  const { householdId, memberId, now } = input

  const compost: RecurrenceRule = {
    type: 'interval_days',
    intervalDays: 2,
    timeMinutes: 8 * 60,
    timezone,
  }
  const counters: RecurrenceRule = {
    type: 'daily_time',
    timeMinutes: 19 * 60,
    timezone,
  }
  const vacuum: RecurrenceRule = {
    type: 'weekly_day',
    dayOfWeek: 5,
    timeMinutes: 10 * 60,
    timezone,
  }

  const base = {
    householdId,
    assigneeMemberId: memberId,
    createdByMemberId: memberId,
  }

  return [
    {
      ...base,
      id: starterChoreId(householdId, 1),
      title: 'Take out compost',
      tags: ['Kitchen', 'Quick'],
      rule: compost,
      // deliberately in the past so the board opens with a real overdue card
      nextDueAt: now - 26 * 60 * 60 * 1000,
    },
    {
      ...base,
      id: starterChoreId(householdId, 2),
      title: 'Wipe kitchen counters',
      tags: ['Kitchen', 'Daily'],
      rule: counters,
      nextDueAt: firstDueAt(counters, now),
    },
    {
      ...base,
      id: starterChoreId(householdId, 3),
      title: 'Vacuum living room',
      tags: ['Living room', 'Deep clean'],
      rule: vacuum,
      // ensure the weekly card is always more than a day out, so it reads as
      // "upcoming" rather than colliding with the daily one
      nextDueAt: nextWeeklyBeyondTomorrow(vacuum, now),
    },
  ]
}

function nextWeeklyBeyondTomorrow(rule: RecurrenceRule, now: number): number {
  let due = firstDueAt(rule, now)
  if (due - now <= DAY_MS) {
    due = firstDueAt(rule, due)
  }
  return due
}
