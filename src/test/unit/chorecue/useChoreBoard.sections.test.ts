// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

import { renderBoard } from './boardHarness'
import {
  buildDueRow,
  buildMixedRows,
  buildOverdueRow,
  buildUpcomingRow,
  DAY_MS,
  FIXED_NOW,
} from './fixtures'

vi.mock('~/zero/client', async () => (await import('./zeroMock')).zeroClientMock())
vi.mock('~/features/auth/client/useHouseholdContext', async () =>
  (await import('./zeroMock')).householdContextMock()
)

describe('useChoreBoard – due-bucket grouping and archive filtering', () => {
  it('correctly groups multiple chores per bucket', () => {
    const { board } = renderBoard({
      chores: [
        buildOverdueRow({ id: 'o1' }),
        buildOverdueRow({ id: 'o2' }),
        buildDueRow({ id: 'd1' }),
        buildUpcomingRow({ id: 'u1' }),
        buildUpcomingRow({ id: 'u2' }),
        buildUpcomingRow({ id: 'u3' }),
      ],
    })
    const { sections } = board()

    expect(sections.overdue).toHaveLength(2)
    expect(sections.dueSoon).toHaveLength(1)
    expect(sections.upcoming).toHaveLength(3)
  })

  it('buckets are derived from the clock, not stored on the row', async () => {
    const board = renderBoard({
      chores: [buildUpcomingRow({ id: 'u1', nextDueAt: FIXED_NOW + 2 * DAY_MS })],
    })

    expect(board.board().sections.upcoming).toHaveLength(1)

    // same row, a day and a half later: it has rolled into "due soon" with
    // nothing written to the database
    await board.setNow(FIXED_NOW + 1.5 * DAY_MS)
    expect(board.board().sections.dueSoon).toHaveLength(1)
    expect(board.row('u1')?.nextDueAt).toBe(FIXED_NOW + 2 * DAY_MS)

    await board.setNow(FIXED_NOW + 3 * DAY_MS)
    expect(board.board().sections.overdue).toHaveLength(1)
  })

  it('sections update after archiving a chore', async () => {
    const board = renderBoard({ chores: buildMixedRows() })
    expect(board.board().sections.overdue).toHaveLength(1)

    await board.archiveChore('overdue-1')

    expect(board.board().sections.overdue).toHaveLength(0)
    // archived, not deleted: the row is simply no longer on the board
    expect(board.row('overdue-1')?.status).toBe('archived')
  })

  it('sections update after adding a new chore', async () => {
    const board = renderBoard({ chores: buildMixedRows() })
    expect(board.board().sections.dueSoon).toHaveLength(1)

    await board.setComposer('title', 'New task')
    await board.setComposer('tags', ['General'])
    await board.setComposer('recurrenceSummary', 'Daily time')
    await board.addChore()

    expect(board.board().sections.dueSoon).toHaveLength(2)
  })

  it('sections update after completing moves a chore across buckets', async () => {
    const board = renderBoard({
      chores: [buildOverdueRow({ id: 'o1' }), buildOverdueRow({ id: 'o2' })],
    })

    expect(board.board().sections.overdue).toHaveLength(2)
    expect(board.board().sections.upcoming).toHaveLength(0)

    await board.completeChore('o1')

    expect(board.board().sections.overdue).toHaveLength(1)
    expect(board.board().sections.upcoming).toHaveLength(1)
  })
})
