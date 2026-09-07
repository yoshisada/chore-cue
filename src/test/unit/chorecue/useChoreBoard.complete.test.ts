import { describe, expect, it } from 'vitest'

import { advanceNextDueAt } from '~/features/chorecue/recurrence'

import {
  buildMixedRows,
  buildOverdueRow,
  DAY_MS,
  FIXED_NOW,
  VIEWER_MEMBER_ID,
} from './fixtures'
import { createBoardDriver } from './renderHelpers'

describe('useChoreBoard – completing a chore advances its schedule', () => {
  it('moves a completed overdue chore out of the overdue bucket', async () => {
    const board = createBoardDriver(buildMixedRows())
    await board.completeChore('overdue-1')

    const completed = board.chores.find((c) => c.id === 'overdue-1')
    expect(completed?.dueBucket).not.toBe('overdue')
  })

  it('advances nextDueAt exactly as the recurrence rule says', async () => {
    const rows = buildMixedRows()
    const target = rows.find((r) => r.id === 'overdue-1')!
    const board = createBoardDriver(rows)

    await board.completeChore('overdue-1')

    const expected = advanceNextDueAt(
      {
        type: 'interval_days',
        intervalDays: 3,
        timeMinutes: 9 * 60,
        timezone: 'UTC',
      },
      { previousDueAt: target.nextDueAt, completedAt: FIXED_NOW }
    )

    expect(board.rows.find((r) => r.id === 'overdue-1')?.nextDueAt).toBe(expected)
  })

  it('never leaves a just-completed chore already overdue', async () => {
    const board = createBoardDriver([
      buildOverdueRow({ id: 'stale', nextDueAt: FIXED_NOW - 40 * DAY_MS }),
    ])

    await board.completeChore('stale')

    const chore = board.chores.find((c) => c.id === 'stale')
    expect(chore?.nextDueAt).toBeGreaterThan(FIXED_NOW)
    expect(chore?.dueBucket).not.toBe('overdue')
  })

  it('records who completed it and when', async () => {
    const board = createBoardDriver(buildMixedRows())
    await board.completeChore('due-1')

    const row = board.rows.find((r) => r.id === 'due-1') as any
    expect(row.lastCompletedAt).toBe(FIXED_NOW)
    expect(row.lastCompletedByMemberId).toBe(VIEWER_MEMBER_ID)
    expect(board.chores.find((c) => c.id === 'due-1')?.lastCompletedLabel).toBe(
      'Last done today at 9:00 AM'
    )
  })

  it('is idempotent under a double tap: the schedule advances once', async () => {
    const board = createBoardDriver(buildMixedRows())

    await board.completeChore('overdue-1')
    const afterFirst = board.rows.find((r) => r.id === 'overdue-1')?.nextDueAt

    // the second call still carries the *original* expectedDueAt in a real
    // double-tap; here the driver re-reads it, so assert both paths hold
    const ctx = board.store.context('user-sam')
    const { mutate } = await import('~/data/models/chore')
    await mutate.complete(ctx, {
      choreId: 'overdue-1',
      expectedDueAt: FIXED_NOW - 2 * DAY_MS,
      now: FIXED_NOW + 1000,
    })

    expect(board.rows.find((r) => r.id === 'overdue-1')?.nextDueAt).toBe(afterFirst)
  })

  it('does not affect other chores when completing one', async () => {
    const board = createBoardDriver(buildMixedRows())
    const before = { ...(board.rows.find((r) => r.id === 'due-1') as any) }

    await board.completeChore('overdue-1')

    expect(board.rows.find((r) => r.id === 'due-1')).toEqual(before)
  })

  it('moves the completed chore between sections', async () => {
    const board = createBoardDriver(buildMixedRows())
    expect(board.sections.overdue).toHaveLength(1)

    await board.completeChore('overdue-1')

    expect(board.sections.overdue).toHaveLength(0)
    expect(board.sections.upcoming).toHaveLength(2)
  })

  it('re-derives bump eligibility from the assignee, not the completion', async () => {
    const board = createBoardDriver([
      buildOverdueRow({ id: 'mine', assigneeMemberId: VIEWER_MEMBER_ID }),
      buildOverdueRow({ id: 'theirs' }),
    ])

    await board.completeChore('mine')
    await board.completeChore('theirs')

    expect(board.chores.find((c) => c.id === 'mine')?.canBump).toBe(false)
    expect(board.chores.find((c) => c.id === 'theirs')?.canBump).toBe(true)
  })

  it('reports a failure for a chore that does not exist', async () => {
    const board = createBoardDriver(buildMixedRows())
    const before = board.rows.map((r) => ({ ...r }))

    const result = await board.completeChore('nonexistent')

    expect(result.ok).toBe(false)
    expect(board.rows).toEqual(before)
  })
})
