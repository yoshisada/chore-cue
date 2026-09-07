// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

import { mutate as choreMutators } from '~/data/models/chore'
import { advanceNextDueAt } from '~/features/chorecue/recurrence'

import { renderBoard } from './boardHarness'
import {
  buildMixedRows,
  buildOverdueRow,
  DAY_MS,
  FIXED_NOW,
  VIEWER_MEMBER_ID,
  VIEWER_USER_ID,
} from './fixtures'

vi.mock('~/zero/client', async () => (await import('./zeroMock')).zeroClientMock())
vi.mock('~/features/auth/client/useHouseholdContext', async () =>
  (await import('./zeroMock')).householdContextMock()
)

describe('useChoreBoard – completing a chore advances its schedule', () => {
  it('moves a completed overdue chore out of the overdue bucket', async () => {
    const board = renderBoard({ chores: buildMixedRows() })
    await board.completeChore('overdue-1')

    expect(board.card('overdue-1')?.dueBucket).not.toBe('overdue')
  })

  it('advances nextDueAt exactly as the recurrence rule says', async () => {
    const rows = buildMixedRows()
    const target = rows.find((row) => row.id === 'overdue-1')!
    const board = renderBoard({ chores: rows })

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

    expect(board.row('overdue-1')?.nextDueAt).toBe(expected)
  })

  it('completes against the due instant the viewer actually saw', async () => {
    const board = renderBoard({ chores: buildMixedRows() })
    const seen = board.card('overdue-1')?.nextDueAt

    await board.completeChore('overdue-1')

    expect(board.zero.mutate.chore.complete).toHaveBeenCalledWith({
      choreId: 'overdue-1',
      expectedDueAt: seen,
      now: FIXED_NOW,
    })
  })

  it('never leaves a just-completed chore already overdue', async () => {
    const board = renderBoard({
      chores: [buildOverdueRow({ id: 'stale', nextDueAt: FIXED_NOW - 40 * DAY_MS })],
    })

    await board.completeChore('stale')

    expect(board.card('stale')?.nextDueAt).toBeGreaterThan(FIXED_NOW)
    expect(board.card('stale')?.dueBucket).not.toBe('overdue')
  })

  it('records who completed it and when', async () => {
    const board = renderBoard({ chores: buildMixedRows() })
    await board.completeChore('due-1')

    expect(board.row('due-1')?.lastCompletedAt).toBe(FIXED_NOW)
    expect(board.row('due-1')?.lastCompletedByMemberId).toBe(VIEWER_MEMBER_ID)
    expect(board.card('due-1')?.lastCompletedLabel).toBe('Last done today at 9:00 AM')
  })

  it('is idempotent under a double tap: the schedule advances once', async () => {
    const board = renderBoard({ chores: buildMixedRows() })

    await board.completeChore('overdue-1')
    const afterFirst = board.row('overdue-1')?.nextDueAt

    // the board re-reads the card, so its second tap is a no-op on eligibility;
    // a real double-tap replays the *original* expectedDueAt, which the
    // compare-and-swap must also refuse
    await board.completeChore('overdue-1')
    await choreMutators.complete(board.store.context(VIEWER_USER_ID), {
      choreId: 'overdue-1',
      expectedDueAt: FIXED_NOW - 2 * DAY_MS,
      now: FIXED_NOW + 1000,
    })

    expect(board.row('overdue-1')?.nextDueAt).toBe(afterFirst)
  })

  it('does not affect other chores when completing one', async () => {
    const board = renderBoard({ chores: buildMixedRows() })
    const before = { ...board.row('due-1') }

    await board.completeChore('overdue-1')

    expect(board.row('due-1')).toEqual(before)
  })

  it('moves the completed chore between sections', async () => {
    const board = renderBoard({ chores: buildMixedRows() })
    expect(board.board().sections.overdue).toHaveLength(1)

    await board.completeChore('overdue-1')

    expect(board.board().sections.overdue).toHaveLength(0)
    expect(board.board().sections.upcoming).toHaveLength(2)
  })

  it('re-derives bump eligibility from the assignee, not the completion', async () => {
    const board = renderBoard({
      chores: [
        buildOverdueRow({ id: 'mine', assigneeMemberId: VIEWER_MEMBER_ID }),
        buildOverdueRow({ id: 'theirs' }),
      ],
    })

    await board.completeChore('mine')
    await board.completeChore('theirs')

    expect(board.card('mine')?.canBump).toBe(false)
    expect(board.card('theirs')?.canBump).toBe(true)
  })

  it('reports a failure for a chore that does not exist', async () => {
    const board = renderBoard({ chores: buildMixedRows() })
    const before = board.rows().map((row) => ({ ...row }))

    const result = await board.completeChore('nonexistent')

    expect(result).toEqual({ ok: false, reason: 'Chore not found' })
    expect(board.zero.mutate.chore.complete).not.toHaveBeenCalled()
    expect(board.rows()).toEqual(before)
  })

  it('reports the reason when the mutator refuses the completion', async () => {
    const board = renderBoard({ chores: buildMixedRows(), userId: null })

    const result = await board.completeChore('overdue-1')

    expect(result).toEqual({ ok: false, reason: 'Unauthorized' })
    expect(board.row('overdue-1')?.lastCompletedAt).toBeNull()
  })
})
