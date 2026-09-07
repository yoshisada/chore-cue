import {
  addLocalDaysAtTime,
  DAY_MS,
  MINUTES_PER_DAY,
  snapToLocalTime,
  utcMsToZonedParts,
} from './timezone'

import type { RecurrenceSummary } from './types'

/**
 * the structured recurrence model that backs every chore.
 *
 * these functions are the single source of truth for scheduling: the optimistic
 * UI and the server mutators both call them, so they cannot disagree about when
 * a chore is next due.
 *
 * nothing here reads the clock — `now`/`from`/`completedAt` are always passed in.
 */

export type RecurrenceRuleType = 'interval_days' | 'weekly_day' | 'daily_time'

export type RecurrenceRule =
  | {
      type: 'interval_days'
      intervalDays: number
      timeMinutes: number
      timezone: string
    }
  | { type: 'weekly_day'; dayOfWeek: number; timeMinutes: number; timezone: string }
  | { type: 'daily_time'; timeMinutes: number; timezone: string }

/** the recurrence columns of a `chore` row, however they arrive */
export interface ChoreRowLike {
  recurrenceRuleType?: string | null
  recurrenceIntervalDays?: number | null
  recurrenceDayOfWeek?: number | null
  recurrenceTimeMinutes?: number | null
  timezone?: string | null
}

export const MIN_INTERVAL_DAYS = 1
export const MAX_INTERVAL_DAYS = 365
export const DEFAULT_TIME_MINUTES = 9 * 60
export const DEFAULT_INTERVAL_DAYS = 3
export const DEFAULT_WEEKLY_DAY = 5 // friday
export const DEFAULT_DAILY_TIME_MINUTES = 19 * 60
export const DEFAULT_TIMEZONE = 'UTC'

/** a crafted row must never be able to hang a mutator */
const MAX_ADVANCE_ITERATIONS = 400

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
}

/** mirrors the `chore_recurrence_shape_chk` database constraint */
export function isValidRule(
  rule: RecurrenceRule | null | undefined
): rule is RecurrenceRule {
  if (!rule) return false
  if (!isInteger(rule.timeMinutes)) return false
  if (rule.timeMinutes < 0 || rule.timeMinutes > MINUTES_PER_DAY - 1) return false
  if (typeof rule.timezone !== 'string' || !rule.timezone) return false

  switch (rule.type) {
    case 'interval_days':
      return (
        isInteger(rule.intervalDays) &&
        rule.intervalDays >= MIN_INTERVAL_DAYS &&
        rule.intervalDays <= MAX_INTERVAL_DAYS
      )
    case 'weekly_day':
      return isInteger(rule.dayOfWeek) && rule.dayOfWeek >= 0 && rule.dayOfWeek <= 6
    case 'daily_time':
      return true
    default:
      return false
  }
}

/** total: returns null for a malformed row rather than throwing */
export function toRule(row: ChoreRowLike | null | undefined): RecurrenceRule | null {
  if (!row) return null

  const timezone = row.timezone || DEFAULT_TIMEZONE
  const timeMinutes = row.recurrenceTimeMinutes ?? DEFAULT_TIME_MINUTES

  let candidate: RecurrenceRule | null = null

  switch (row.recurrenceRuleType) {
    case 'interval_days':
      candidate = {
        type: 'interval_days',
        intervalDays: row.recurrenceIntervalDays ?? Number.NaN,
        timeMinutes,
        timezone,
      }
      break
    case 'weekly_day':
      candidate = {
        type: 'weekly_day',
        dayOfWeek: row.recurrenceDayOfWeek ?? Number.NaN,
        timeMinutes,
        timezone,
      }
      break
    case 'daily_time':
      candidate = { type: 'daily_time', timeMinutes, timezone }
      break
    default:
      return null
  }

  return isValidRule(candidate) ? candidate : null
}

/** the recurrence columns a rule writes to a `chore` row */
export function ruleToColumns(rule: RecurrenceRule) {
  return {
    recurrenceRuleType: rule.type,
    recurrenceIntervalDays: rule.type === 'interval_days' ? rule.intervalDays : null,
    recurrenceDayOfWeek: rule.type === 'weekly_day' ? rule.dayOfWeek : null,
    recurrenceTimeMinutes: rule.timeMinutes,
    timezone: rule.timezone,
  }
}

export function sameRule(
  left: RecurrenceRule | null | undefined,
  right: RecurrenceRule | null | undefined
): boolean {
  if (!left || !right) return false
  if (left.type !== right.type) return false
  if (left.timeMinutes !== right.timeMinutes) return false
  if (left.timezone !== right.timezone) return false

  if (left.type === 'interval_days' && right.type === 'interval_days') {
    return left.intervalDays === right.intervalDays
  }
  if (left.type === 'weekly_day' && right.type === 'weekly_day') {
    return left.dayOfWeek === right.dayOfWeek
  }
  return true
}

/** rule -> the label the existing three-chip composer renders */
export function describeRecurrence(rule: RecurrenceRule): RecurrenceSummary {
  switch (rule.type) {
    case 'interval_days':
      return 'Every N days'
    case 'weekly_day':
      return 'Weekly'
    case 'daily_time':
      return 'Daily time'
  }
}

/** composer label -> a structured rule, so the existing UI needs no new pickers */
export function ruleFromSummary(
  summary: RecurrenceSummary,
  timezone: string = DEFAULT_TIMEZONE
): RecurrenceRule {
  switch (summary) {
    case 'Weekly':
      return {
        type: 'weekly_day',
        dayOfWeek: DEFAULT_WEEKLY_DAY,
        timeMinutes: DEFAULT_TIME_MINUTES,
        timezone,
      }
    case 'Daily time':
      return {
        type: 'daily_time',
        timeMinutes: DEFAULT_DAILY_TIME_MINUTES,
        timezone,
      }
    case 'Every N days':
    default:
      return {
        type: 'interval_days',
        intervalDays: DEFAULT_INTERVAL_DAYS,
        timeMinutes: DEFAULT_TIME_MINUTES,
        timezone,
      }
  }
}

function periodMs(rule: RecurrenceRule): number {
  switch (rule.type) {
    case 'interval_days':
      return rule.intervalDays * DAY_MS
    case 'weekly_day':
      return 7 * DAY_MS
    case 'daily_time':
      return DAY_MS
  }
}

function stepDays(rule: RecurrenceRule): number {
  switch (rule.type) {
    case 'interval_days':
      return rule.intervalDays
    case 'weekly_day':
      return 7
    case 'daily_time':
      return 1
  }
}

/**
 * the first occurrence strictly after `from`, snapped to the rule's local time.
 * loops (rather than doing modular arithmetic) so DST transitions cannot land
 * the result on the wrong wall-clock time; capped so a crafted rule terminates.
 */
export function firstDueAt(rule: RecurrenceRule, from: number): number {
  const { timeMinutes, timezone } = rule

  let candidate: number
  if (rule.type === 'weekly_day') {
    // align onto the target weekday using the local calendar day of `from`
    const delta = (rule.dayOfWeek - utcMsToZonedParts(from, timezone).weekday + 7) % 7
    candidate = addLocalDaysAtTime(from, delta, timeMinutes, timezone)
  } else {
    candidate = snapToLocalTime(from, timeMinutes, timezone)
  }

  const step = stepDays(rule)
  let iterations = 0
  while (candidate <= from) {
    if (iterations >= MAX_ADVANCE_ITERATIONS) {
      return from + periodMs(rule)
    }
    candidate = addLocalDaysAtTime(candidate, step, timeMinutes, timezone)
    iterations += 1
  }

  return candidate
}

export interface AdvanceInput {
  previousDueAt: number
  completedAt: number
}

/**
 * where the schedule lands after a completion.
 *
 * - `interval_days` is completion-relative: "every 3 days" means three days from
 *   when you actually did it, so a week away does not fire a burst of stale
 *   instances.
 * - `daily_time`/`weekly_day` are anchor-relative: completing "counters, daily at
 *   7pm" at 6:15pm keeps tomorrow at 7pm rather than sliding earlier each cycle.
 *
 * in both cases the result is strictly after `completedAt`, so a just-completed
 * chore is never already overdue.
 */
export function advanceNextDueAt(rule: RecurrenceRule, input: AdvanceInput): number {
  if (rule.type === 'interval_days') {
    let candidate = addLocalDaysAtTime(
      input.completedAt,
      rule.intervalDays,
      rule.timeMinutes,
      rule.timezone
    )

    let iterations = 0
    while (candidate <= input.completedAt) {
      if (iterations >= MAX_ADVANCE_ITERATIONS) {
        return input.completedAt + periodMs(rule)
      }
      candidate = addLocalDaysAtTime(
        candidate,
        rule.intervalDays,
        rule.timeMinutes,
        rule.timezone
      )
      iterations += 1
    }

    return candidate
  }

  const anchor = Math.max(input.completedAt, input.previousDueAt)
  return firstDueAt(rule, anchor)
}
