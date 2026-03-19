import { describe, expect, it } from 'vitest'

import { createBoardDriver } from './renderHelpers'
import { buildChore, buildMixedBoard, buildOverdueChore } from './fixtures'

describe('useChoreBoard – complete-chore state transitions', () => {
  it('moves a completed chore to upcoming bucket', () => {
    const board = createBoardDriver(buildMixedBoard())
    board.completeChore('overdue-1')

    const completed = board.chores.find((c) => c.id === 'overdue-1')
    expect(completed?.dueBucket).toBe('upcoming')
  })

  it('sets the due label to reset message after completion', () => {
    const board = createBoardDriver(buildMixedBoard())
    board.completeChore('due-1')

    const completed = board.chores.find((c) => c.id === 'due-1')
    expect(completed?.dueLabel).toBe('Reset for the next cycle')
  })

  it('sets last completed label to just now', () => {
    const board = createBoardDriver(buildMixedBoard())
    board.completeChore('overdue-1')

    const completed = board.chores.find((c) => c.id === 'overdue-1')
    expect(completed?.lastCompletedLabel).toBe('Completed just now')
  })

  it('does not affect other chores when completing one', () => {
    const board = createBoardDriver(buildMixedBoard())
    const beforeDue = board.chores.find((c) => c.id === 'due-1')
    board.completeChore('overdue-1')
    const afterDue = board.chores.find((c) => c.id === 'due-1')

    expect(afterDue).toEqual(beforeDue)
  })

  it('moves completed chore from overdue section to upcoming', () => {
    const board = createBoardDriver(buildMixedBoard())
    expect(board.sections.overdue).toHaveLength(1)

    board.completeChore('overdue-1')

    expect(board.sections.overdue).toHaveLength(0)
    expect(board.sections.upcoming).toHaveLength(2)
  })

  it('preserves canBump based on assignee after completion', () => {
    const chores = [
      buildChore({ id: 'alex-chore', assigneeName: 'Alex', dueBucket: 'overdue' }),
      buildChore({ id: 'sam-chore', assigneeName: 'Sam', dueBucket: 'overdue' }),
    ]
    const board = createBoardDriver(chores)

    board.completeChore('alex-chore')
    board.completeChore('sam-chore')

    expect(board.chores.find((c) => c.id === 'alex-chore')?.canBump).toBe(false)
    expect(board.chores.find((c) => c.id === 'sam-chore')?.canBump).toBe(true)
  })

  it('handles completing a chore that does not exist gracefully', () => {
    const board = createBoardDriver(buildMixedBoard())
    const before = [...board.chores]
    board.completeChore('nonexistent')

    expect(board.chores).toEqual(before)
  })
})
