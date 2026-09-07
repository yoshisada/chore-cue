import { describe, expect, it } from 'vitest'

import {
  advanceNextDueAt,
  describeRecurrence,
  firstDueAt,
  isValidRule,
  ruleFromSummary,
  ruleToColumns,
  sameRule,
  toRule,
} from '~/features/chorecue/recurrence'
import { localDateKey, utcMsToZonedParts } from '~/features/chorecue/timezone'

import type { RecurrenceRule } from '~/features/chorecue/recurrence'

// a monday, 09:00 UTC
const NOW = Date.parse('2026-06-15T09:00:00Z')

const daily: RecurrenceRule = {
  type: 'daily_time',
  timeMinutes: 19 * 60,
  timezone: 'UTC',
}
const weekly: RecurrenceRule = {
  type: 'weekly_day',
  dayOfWeek: 5,
  timeMinutes: 10 * 60,
  timezone: 'UTC',
}
const interval: RecurrenceRule = {
  type: 'interval_days',
  intervalDays: 3,
  timeMinutes: 8 * 60,
  timezone: 'UTC',
}

describe('isValidRule', () => {
  it('accepts each well-formed rule type', () => {
    expect(isValidRule(daily)).toBe(true)
    expect(isValidRule(weekly)).toBe(true)
    expect(isValidRule(interval)).toBe(true)
  })

  it('rejects null and out-of-range time minutes', () => {
    expect(isValidRule(null)).toBe(false)
    expect(isValidRule({ ...daily, timeMinutes: -1 })).toBe(false)
    expect(isValidRule({ ...daily, timeMinutes: 1440 })).toBe(false)
    expect(isValidRule({ ...daily, timeMinutes: 1439 })).toBe(true)
    expect(isValidRule({ ...daily, timeMinutes: 12.5 })).toBe(false)
  })

  it('rejects out-of-range interval and weekday values', () => {
    expect(isValidRule({ ...interval, intervalDays: 0 })).toBe(false)
    expect(isValidRule({ ...interval, intervalDays: 366 })).toBe(false)
    expect(isValidRule({ ...weekly, dayOfWeek: 7 })).toBe(false)
    expect(isValidRule({ ...weekly, dayOfWeek: -1 })).toBe(false)
  })

  it('rejects an empty timezone and an unknown type', () => {
    expect(isValidRule({ ...daily, timezone: '' })).toBe(false)
    expect(isValidRule({ type: 'nope', timeMinutes: 0, timezone: 'UTC' } as never)).toBe(
      false
    )
  })
})

describe('toRule', () => {
  it('reads each rule type back off a row', () => {
    expect(
      toRule({
        recurrenceRuleType: 'interval_days',
        recurrenceIntervalDays: 3,
        recurrenceTimeMinutes: 8 * 60,
        timezone: 'UTC',
      })
    ).toEqual(interval)

    expect(
      toRule({
        recurrenceRuleType: 'weekly_day',
        recurrenceDayOfWeek: 5,
        recurrenceTimeMinutes: 10 * 60,
        timezone: 'UTC',
      })
    ).toEqual(weekly)

    expect(
      toRule({
        recurrenceRuleType: 'daily_time',
        recurrenceTimeMinutes: 19 * 60,
        timezone: 'UTC',
      })
    ).toEqual(daily)
  })

  it('is total: returns null rather than throwing on a malformed row', () => {
    expect(toRule(null)).toBeNull()
    expect(toRule({ recurrenceRuleType: 'moon_phase' })).toBeNull()
    // interval_days with no interval cannot be satisfied
    expect(
      toRule({ recurrenceRuleType: 'interval_days', recurrenceTimeMinutes: 0 })
    ).toBeNull()
    expect(
      toRule({ recurrenceRuleType: 'weekly_day', recurrenceDayOfWeek: 9 })
    ).toBeNull()
  })
})

describe('ruleToColumns', () => {
  it('nulls out the columns the rule type does not use', () => {
    expect(ruleToColumns(daily)).toEqual({
      recurrenceRuleType: 'daily_time',
      recurrenceIntervalDays: null,
      recurrenceDayOfWeek: null,
      recurrenceTimeMinutes: 19 * 60,
      timezone: 'UTC',
    })
    expect(ruleToColumns(weekly).recurrenceDayOfWeek).toBe(5)
    expect(ruleToColumns(interval).recurrenceIntervalDays).toBe(3)
  })

  it('round-trips through toRule', () => {
    for (const rule of [daily, weekly, interval]) {
      expect(toRule(ruleToColumns(rule))).toEqual(rule)
    }
  })
})

describe('sameRule', () => {
  it('compares every field that matters', () => {
    expect(sameRule(daily, { ...daily })).toBe(true)
    expect(sameRule(daily, { ...daily, timeMinutes: 1 })).toBe(false)
    expect(sameRule(daily, { ...daily, timezone: 'Asia/Tokyo' })).toBe(false)
    expect(sameRule(interval, { ...interval, intervalDays: 4 })).toBe(false)
    expect(sameRule(weekly, { ...weekly, dayOfWeek: 1 })).toBe(false)
    expect(sameRule(daily, weekly)).toBe(false)
    expect(sameRule(null, daily)).toBe(false)
  })
})

describe('describeRecurrence / ruleFromSummary', () => {
  it('maps every composer chip to a rule and back', () => {
    for (const summary of ['Every N days', 'Weekly', 'Daily time'] as const) {
      expect(describeRecurrence(ruleFromSummary(summary, 'UTC'))).toBe(summary)
      expect(isValidRule(ruleFromSummary(summary, 'UTC'))).toBe(true)
    }
  })
})

describe('firstDueAt', () => {
  it('picks today for a daily rule whose time is still ahead', () => {
    expect(new Date(firstDueAt(daily, NOW)).toISOString()).toBe(
      '2026-06-15T19:00:00.000Z'
    )
  })

  it('rolls to tomorrow when the time has already passed today', () => {
    const evening = Date.parse('2026-06-15T20:00:00Z')
    expect(new Date(firstDueAt(daily, evening)).toISOString()).toBe(
      '2026-06-16T19:00:00.000Z'
    )
  })

  it('lands on the requested weekday for a weekly rule', () => {
    const due = firstDueAt(weekly, NOW)
    expect(utcMsToZonedParts(due, 'UTC').weekday).toBe(5)
    expect(localDateKey(due, 'UTC')).toBe('2026-06-19')
  })

  it('skips a whole week when the weekday matches but the time has passed', () => {
    const fridayAfternoon = Date.parse('2026-06-19T15:00:00Z')
    expect(localDateKey(firstDueAt(weekly, fridayAfternoon), 'UTC')).toBe('2026-06-26')
  })

  it('is always strictly after the anchor', () => {
    for (const rule of [daily, weekly, interval]) {
      expect(firstDueAt(rule, NOW)).toBeGreaterThan(NOW)
    }
  })
})

describe('advanceNextDueAt', () => {
  it('is completion-relative for interval rules', () => {
    const completedAt = Date.parse('2026-06-15T12:00:00Z')
    const next = advanceNextDueAt(interval, {
      previousDueAt: Date.parse('2026-06-14T08:00:00Z'),
      completedAt,
    })

    // three days from when it was actually done, at 08:00
    expect(new Date(next).toISOString()).toBe('2026-06-18T08:00:00.000Z')
  })

  it('is anchor-relative for daily rules, so completing early does not slide', () => {
    const previousDueAt = Date.parse('2026-06-15T19:00:00Z')
    const completedAt = Date.parse('2026-06-15T18:15:00Z')

    const next = advanceNextDueAt(daily, { previousDueAt, completedAt })
    expect(new Date(next).toISOString()).toBe('2026-06-16T19:00:00.000Z')
  })

  it('is anchor-relative for weekly rules', () => {
    const previousDueAt = Date.parse('2026-06-19T10:00:00Z')
    const next = advanceNextDueAt(weekly, {
      previousDueAt,
      completedAt: Date.parse('2026-06-19T09:00:00Z'),
    })
    expect(new Date(next).toISOString()).toBe('2026-06-26T10:00:00.000Z')
  })

  it('catches up rather than firing a burst of stale instances', () => {
    // a chore that went a month overdue, then got done
    const previousDueAt = Date.parse('2026-05-01T19:00:00Z')
    const completedAt = Date.parse('2026-06-15T09:00:00Z')

    for (const rule of [daily, weekly, interval]) {
      const next = advanceNextDueAt(rule, { previousDueAt, completedAt })
      expect(next).toBeGreaterThan(completedAt)
    }
  })

  it('never returns a just-completed chore as already overdue', () => {
    const completedAt = NOW
    for (const rule of [daily, weekly, interval]) {
      const next = advanceNextDueAt(rule, { previousDueAt: NOW - 1000, completedAt })
      expect(next).toBeGreaterThan(completedAt)
    }
  })

  it('terminates on a pathological interval without hanging', () => {
    const longInterval: RecurrenceRule = {
      type: 'interval_days',
      intervalDays: 365,
      timeMinutes: 0,
      timezone: 'UTC',
    }
    const next = advanceNextDueAt(longInterval, {
      previousDueAt: 0,
      completedAt: NOW,
    })
    expect(next).toBeGreaterThan(NOW)
  })
})
