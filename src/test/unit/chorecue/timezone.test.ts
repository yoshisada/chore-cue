import { describe, expect, it } from 'vitest'

import {
  addLocalDaysAtTime,
  localDateKey,
  snapToLocalTime,
  utcMsToZonedParts,
  zonedTimeToUtcMs,
} from '~/features/chorecue/timezone'

const MONDAY_9AM_UTC = Date.parse('2026-06-15T09:00:00Z')

describe('utcMsToZonedParts', () => {
  it('splits an instant into UTC calendar parts', () => {
    expect(utcMsToZonedParts(MONDAY_9AM_UTC, 'UTC')).toEqual({
      y: 2026,
      m: 6,
      d: 15,
      weekday: 1,
      minutes: 9 * 60,
    })
  })

  it('shifts the calendar day for a zone behind UTC', () => {
    const justAfterUtcMidnight = Date.parse('2026-06-15T02:00:00Z')
    const parts = utcMsToZonedParts(justAfterUtcMidnight, 'America/New_York')

    expect(parts.d).toBe(14)
    expect(parts.weekday).toBe(0)
    expect(parts.minutes).toBe(22 * 60)
  })

  it('falls back to UTC math for an unknown timezone', () => {
    expect(utcMsToZonedParts(MONDAY_9AM_UTC, 'Not/AZone')).toEqual(
      utcMsToZonedParts(MONDAY_9AM_UTC, 'UTC')
    )
  })
})

describe('zonedTimeToUtcMs', () => {
  it('round-trips through utcMsToZonedParts', () => {
    for (const timezone of ['UTC', 'America/New_York', 'Asia/Tokyo']) {
      const parts = utcMsToZonedParts(MONDAY_9AM_UTC, timezone)
      expect(zonedTimeToUtcMs(parts, timezone)).toBe(MONDAY_9AM_UTC)
    }
  })
})

describe('localDateKey', () => {
  it('formats a zero-padded YYYY-MM-DD', () => {
    expect(localDateKey(Date.parse('2026-01-05T12:00:00Z'), 'UTC')).toBe('2026-01-05')
  })

  it('uses the local day, not the UTC day', () => {
    const lateEvening = Date.parse('2026-06-16T03:30:00Z')
    expect(localDateKey(lateEvening, 'UTC')).toBe('2026-06-16')
    expect(localDateKey(lateEvening, 'America/New_York')).toBe('2026-06-15')
  })
})

describe('addLocalDaysAtTime', () => {
  it('keeps the wall-clock time across a DST spring-forward', () => {
    // 2026-03-08 is the US spring-forward; 09:00 local must stay 09:00 local
    const saturday = Date.parse('2026-03-07T14:00:00Z')
    const sunday = addLocalDaysAtTime(saturday, 1, 9 * 60, 'America/New_York')

    expect(utcMsToZonedParts(sunday, 'America/New_York')).toMatchObject({
      d: 8,
      minutes: 9 * 60,
    })
    // the real elapsed time is 23 hours, not 24 — that is the point
    expect(sunday - saturday).toBe(23 * 60 * 60 * 1000)
  })

  it('rolls over month boundaries', () => {
    const result = addLocalDaysAtTime(Date.parse('2026-01-31T09:00:00Z'), 1, 0, 'UTC')
    expect(localDateKey(result, 'UTC')).toBe('2026-02-01')
  })
})

describe('snapToLocalTime', () => {
  it('lands on the same local day at the requested minute', () => {
    const snapped = snapToLocalTime(MONDAY_9AM_UTC, 19 * 60, 'UTC')
    expect(new Date(snapped).toISOString()).toBe('2026-06-15T19:00:00.000Z')
  })

  it('can move backwards within the day', () => {
    const snapped = snapToLocalTime(MONDAY_9AM_UTC, 0, 'UTC')
    expect(snapped).toBeLessThan(MONDAY_9AM_UTC)
    expect(localDateKey(snapped, 'UTC')).toBe('2026-06-15')
  })
})
