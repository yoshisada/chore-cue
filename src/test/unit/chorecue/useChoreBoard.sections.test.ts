import { describe, expect, it } from 'vitest'

import {
  buildChoreRow,
  buildDueRow,
  buildMixedRows,
  buildOverdueRow,
  buildRowsWithArchived,
  buildUpcomingRow,
  DAY_MS,
  FIXED_NOW,
} from './fixtures'
import { createBoardDriver } from './renderHelpers'

describe('useChoreBoard – due-bucket grouping and archive filtering', () => {
  it('excludes archived chores from all sections', () => {
    const board = createBoardDriver(buildRowsWithArchived())
    const sections = board.sections
    const visible = [...sections.overdue, ...sections.dueSoon, ...sections.upcoming]

    expect(visible).toHaveLength(3)
    expect(visible.every((c) => !c.archived)).toBe(true)
  })

  it('correctly groups multiple chores per bucket', () => {
    const board = createBoardDriver([
      buildOverdueRow({ id: 'o1' }),
      buildOverdueRow({ id: 'o2' }),
      buildDueRow({ id: 'd1' }),
      buildUpcomingRow({ id: 'u1' }),
      buildUpcomingRow({ id: 'u2' }),
      buildUpcomingRow({ id: 'u3' }),
    ])
    const sections = board.sections

    expect(sections.overdue).toHaveLength(2)
    expect(sections.dueSoon).toHaveLength(1)
    expect(sections.upcoming).toHaveLength(3)
  })

  it('returns empty sections when every chore is archived', () => {
    const board = createBoardDriver([
      buildChoreRow({ id: 'a1', status: 'archived', archivedAt: FIXED_NOW - DAY_MS }),
      buildChoreRow({ id: 'a2', status: 'archived', archivedAt: FIXED_NOW - DAY_MS }),
    ])
    const sections = board.sections

    expect(sections.overdue).toHaveLength(0)
    expect(sections.dueSoon).toHaveLength(0)
    expect(sections.upcoming).toHaveLength(0)
  })

  it('buckets are derived from the clock, not stored on the row', () => {
    const rows = [buildUpcomingRow({ id: 'u1', nextDueAt: FIXED_NOW + 2 * DAY_MS })]

    expect(createBoardDriver(rows).sections.upcoming).toHaveLength(1)
    // same row, a day and a half later: it has rolled into "due soon" with
    // nothing written to the database
    expect(
      createBoardDriver(rows, { now: FIXED_NOW + 1.5 * DAY_MS }).sections.dueSoon
    ).toHaveLength(1)
    expect(
      createBoardDriver(rows, { now: FIXED_NOW + 3 * DAY_MS }).sections.overdue
    ).toHaveLength(1)
  })

  it('sections update after archiving a chore', async () => {
    const board = createBoardDriver(buildMixedRows())
    expect(board.sections.overdue).toHaveLength(1)

    await board.archiveChore('overdue-1')

    expect(board.sections.overdue).toHaveLength(0)
  })

  it('sections update after adding a new chore', async () => {
    const board = createBoardDriver(buildMixedRows())
    expect(board.sections.dueSoon).toHaveLength(1)

    board.updateComposer('title', 'New task')
    board.updateComposer('tags', ['General'])
    board.updateComposer('recurrenceSummary', 'Daily time')
    await board.addChore()

    expect(board.sections.dueSoon).toHaveLength(2)
  })

  it('sections update after completing moves a chore across buckets', async () => {
    const board = createBoardDriver([
      buildOverdueRow({ id: 'o1' }),
      buildOverdueRow({ id: 'o2' }),
    ])

    expect(board.sections.overdue).toHaveLength(2)
    expect(board.sections.upcoming).toHaveLength(0)

    await board.completeChore('o1')

    expect(board.sections.overdue).toHaveLength(1)
    expect(board.sections.upcoming).toHaveLength(1)
  })
})
