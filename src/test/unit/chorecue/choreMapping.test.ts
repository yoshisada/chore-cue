import { describe, expect, it } from 'vitest'

import {
  deriveDueBucket,
  DUE_SOON_WINDOW_MS,
  formatClockLabel,
  formatDueLabel,
  formatLastCompletedLabel,
  localDayDelta,
  toChoreCard,
} from '~/features/chorecue/choreMapping'

import {
  buildChoreRow,
  DAY_MS,
  FIXED_NOW,
  HOUR_MS,
  memberLookup,
  OTHER_MEMBER_ID,
  VIEWER_MEMBER_ID,
} from './fixtures'

const ctx = {
  now: FIXED_NOW,
  viewerMemberId: VIEWER_MEMBER_ID,
  bumpsUsedToday: 0,
  members: memberLookup,
}

describe('choreMapping', () => {
  describe('formatClockLabel', () => {
    it('renders midnight and noon in 12-hour form', () => {
      expect(formatClockLabel(0)).toBe('12:00 AM')
      expect(formatClockLabel(12 * 60)).toBe('12:00 PM')
    })

    it('renders an evening time with padded minutes', () => {
      expect(formatClockLabel(19 * 60 + 5)).toBe('7:05 PM')
    })
  })

  describe('localDayDelta', () => {
    it('counts calendar days, not elapsed 24-hour spans', () => {
      const lateMonday = Date.parse('2026-06-15T23:30:00.000Z')
      const earlyTuesday = Date.parse('2026-06-16T00:30:00.000Z')

      expect(localDayDelta(lateMonday, earlyTuesday, 'UTC')).toBe(1)
    })
  })

  describe('formatDueLabel', () => {
    it('says "Due now" inside the hour the chore came due', () => {
      expect(formatDueLabel(FIXED_NOW - 10 * 60 * 1000, FIXED_NOW, 'UTC')).toBe('Due now')
    })

    it('counts hours overdue below a day', () => {
      expect(formatDueLabel(FIXED_NOW - 3 * HOUR_MS, FIXED_NOW, 'UTC')).toBe(
        '3 hours overdue'
      )
    })

    it('counts whole days overdue, singular included', () => {
      expect(formatDueLabel(FIXED_NOW - DAY_MS, FIXED_NOW, 'UTC')).toBe('1 day overdue')
      expect(formatDueLabel(FIXED_NOW - 2 * DAY_MS, FIXED_NOW, 'UTC')).toBe(
        '2 days overdue'
      )
    })

    it('names today and tomorrow inside the due-soon window', () => {
      expect(formatDueLabel(FIXED_NOW + 6 * HOUR_MS, FIXED_NOW, 'UTC')).toBe(
        'Due today at 3:00 PM'
      )
      expect(formatDueLabel(FIXED_NOW + 20 * HOUR_MS, FIXED_NOW, 'UTC')).toBe(
        'Due tomorrow at 5:00 AM'
      )
    })

    it('names the weekday within the coming week', () => {
      expect(formatDueLabel(FIXED_NOW + 4 * DAY_MS, FIXED_NOW, 'UTC')).toBe(
        'Next due Friday'
      )
    })

    it('falls back to a date beyond a week out', () => {
      expect(formatDueLabel(FIXED_NOW + 20 * DAY_MS, FIXED_NOW, 'UTC')).toBe(
        'Next due Jul 5'
      )
    })
  })

  describe('formatLastCompletedLabel', () => {
    it('returns null when the chore has never been completed', () => {
      expect(formatLastCompletedLabel(null, FIXED_NOW, 'UTC')).toBeNull()
    })

    it('names today, yesterday, then the weekday', () => {
      expect(formatLastCompletedLabel(FIXED_NOW - HOUR_MS, FIXED_NOW, 'UTC')).toBe(
        'Last done today at 8:00 AM'
      )
      expect(formatLastCompletedLabel(FIXED_NOW - DAY_MS, FIXED_NOW, 'UTC')).toBe(
        'Last done yesterday at 9:00 AM'
      )
      expect(formatLastCompletedLabel(FIXED_NOW - 3 * DAY_MS, FIXED_NOW, 'UTC')).toBe(
        'Last done Friday'
      )
    })
  })

  describe('toChoreCard', () => {
    it('derives bucket, labels and bump eligibility from the row plus the clock', () => {
      const card = toChoreCard(
        buildChoreRow({
          nextDueAt: FIXED_NOW - DAY_MS,
          lastCompletedAt: FIXED_NOW - DAY_MS,
        }),
        ctx
      )

      expect(card).toMatchObject({
        dueBucket: 'overdue',
        dueLabel: '1 day overdue',
        lastCompletedLabel: 'Last done yesterday at 9:00 AM',
        assigneeName: 'Alex',
        assigneeMemberId: OTHER_MEMBER_ID,
        recurrenceSummary: 'Every N days',
        canBump: true,
        bumpBlockedReason: null,
      })
    })

    it('reports "self" for a chore assigned to the viewer', () => {
      const card = toChoreCard(buildChoreRow({ assigneeMemberId: VIEWER_MEMBER_ID }), ctx)

      expect(card.canBump).toBe(false)
      expect(card.bumpBlockedReason).toBe('self')
    })

    it('reports "daily-limit" once the quota is spent', () => {
      const card = toChoreCard(buildChoreRow(), { ...ctx, bumpsUsedToday: 5 })

      expect(card.bumpBlockedReason).toBe('daily-limit')
    })

    it('reports "unassigned" when the row has no assignee', () => {
      const card = toChoreCard(buildChoreRow({ assigneeMemberId: null }), ctx)

      expect(card.bumpBlockedReason).toBe('unassigned')
      expect(card.assigneeName).toBe('Member')
    })

    it('falls back to the assignee relation when no roster is supplied', () => {
      const card = toChoreCard(
        buildChoreRow({
          assignee: { id: OTHER_MEMBER_ID, displayName: 'Robin', status: 'active' },
        }),
        { ...ctx, members: undefined }
      )

      expect(card.assigneeName).toBe('Robin')
      expect(card.assigneeActive).toBe(true)
    })

    it('marks an archived row archived and unbumpable', () => {
      const card = toChoreCard(
        buildChoreRow({ status: 'archived', archivedAt: FIXED_NOW }),
        ctx
      )

      expect(card.archived).toBe(true)
      expect(card.bumpBlockedReason).toBe('archived')
    })

    it('leaves the rule null and falls back to a label for a malformed row', () => {
      const card = toChoreCard(buildChoreRow({ recurrenceRuleType: 'nonsense' }), ctx)

      expect(card.rule).toBeNull()
      expect(card.recurrenceSummary).toBe('Every N days')
    })
  })

  describe('deriveDueBucket', () => {
    it('uses a 24-hour due-soon window', () => {
      expect(DUE_SOON_WINDOW_MS).toBe(DAY_MS)
      expect(deriveDueBucket(FIXED_NOW + DAY_MS - 1, FIXED_NOW)).toBe('dueSoon')
    })
  })
})
