import { describe, expect, it } from 'vitest'

import {
  buildBoardWithArchived,
  buildChore,
  buildDueChore,
  buildMixedBoard,
  buildOverdueChore,
  buildUpcomingChore,
} from './fixtures'
import { createBoardDriver } from './renderHelpers'

describe('useChoreBoard – due-bucket grouping and archive filtering', () => {
  it('excludes archived chores from all sections', () => {
    const board = createBoardDriver(buildBoardWithArchived())
    const sections = board.sections
    const allVisible = [...sections.overdue, ...sections.due, ...sections.upcoming]

    expect(allVisible).toHaveLength(3)
    expect(allVisible.every((c) => !c.archived)).toBe(true)
  })

  it('correctly groups multiple chores per bucket', () => {
    const chores = [
      buildOverdueChore({ id: 'o1' }),
      buildOverdueChore({ id: 'o2' }),
      buildDueChore({ id: 'd1' }),
      buildUpcomingChore({ id: 'u1' }),
      buildUpcomingChore({ id: 'u2' }),
      buildUpcomingChore({ id: 'u3' }),
    ]
    const board = createBoardDriver(chores)
    const sections = board.sections

    expect(sections.overdue).toHaveLength(2)
    expect(sections.due).toHaveLength(1)
    expect(sections.upcoming).toHaveLength(3)
  })

  it('returns empty sections when all chores are archived', () => {
    const chores = [
      buildChore({ id: 'a1', archived: true }),
      buildChore({ id: 'a2', archived: true }),
    ]
    const board = createBoardDriver(chores)
    const sections = board.sections

    expect(sections.overdue).toHaveLength(0)
    expect(sections.due).toHaveLength(0)
    expect(sections.upcoming).toHaveLength(0)
  })

  it('sections update after archiving a chore', () => {
    const board = createBoardDriver(buildMixedBoard())
    expect(board.sections.overdue).toHaveLength(1)

    board.archiveChore('overdue-1')

    expect(board.sections.overdue).toHaveLength(0)
  })

  it('sections update after adding a new chore', () => {
    const board = createBoardDriver(buildMixedBoard())
    expect(board.sections.due).toHaveLength(1)

    board.updateComposer('title', 'New task')
    board.updateComposer('tags', ['General'])
    board.addChore()

    expect(board.sections.due).toHaveLength(2)
  })

  it('sections update after completing moves chore across buckets', () => {
    const board = createBoardDriver([
      buildOverdueChore({ id: 'o1' }),
      buildOverdueChore({ id: 'o2' }),
    ])

    expect(board.sections.overdue).toHaveLength(2)
    expect(board.sections.upcoming).toHaveLength(0)

    board.completeChore('o1')

    expect(board.sections.overdue).toHaveLength(1)
    expect(board.sections.upcoming).toHaveLength(1)
  })
})
