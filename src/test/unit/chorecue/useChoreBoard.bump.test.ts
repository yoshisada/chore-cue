import { describe, expect, it } from 'vitest'

import { createBoardDriver } from './renderHelpers'
import { buildChore, buildMixedBoard } from './fixtures'

describe('useChoreBoard – bump-count and bump-label state transitions', () => {
  it('accepts the first bump and increments count', () => {
    const board = createBoardDriver(buildMixedBoard())
    const accepted = board.sendBump('overdue-1')

    expect(accepted).toBe(true)
    expect(board.bumpCount).toBe(1)
  })

  it('appends gentle reminder text to the bumped chore label', () => {
    const board = createBoardDriver(buildMixedBoard())
    board.sendBump('overdue-1')

    const chore = board.chores.find((c) => c.id === 'overdue-1')
    expect(chore?.dueLabel).toContain('gentle reminder sent')
  })

  it('accepts bumps 1 through 5', () => {
    const board = createBoardDriver(buildMixedBoard())

    for (let i = 0; i < 5; i++) {
      expect(board.sendBump('overdue-1')).toBe(true)
    }
    expect(board.bumpCount).toBe(5)
  })

  it('rejects the sixth bump', () => {
    const board = createBoardDriver(buildMixedBoard())

    for (let i = 0; i < 5; i++) {
      board.sendBump('overdue-1')
    }

    const accepted = board.sendBump('overdue-1')
    expect(accepted).toBe(false)
    expect(board.bumpCount).toBe(5)
  })

  it('does not modify chore state on a rejected bump', () => {
    const board = createBoardDriver(buildMixedBoard())

    for (let i = 0; i < 5; i++) {
      board.sendBump('overdue-1')
    }

    const labelBefore = board.chores.find((c) => c.id === 'overdue-1')?.dueLabel
    board.sendBump('overdue-1')
    const labelAfter = board.chores.find((c) => c.id === 'overdue-1')?.dueLabel

    expect(labelAfter).toBe(labelBefore)
  })

  it('bump count is global across different chores', () => {
    const board = createBoardDriver(buildMixedBoard())

    board.sendBump('overdue-1')
    board.sendBump('due-1')
    board.sendBump('upcoming-1')

    expect(board.bumpCount).toBe(3)
  })

  it('does not affect non-bumped chores', () => {
    const board = createBoardDriver(buildMixedBoard())
    const dueBefore = board.chores.find((c) => c.id === 'due-1')?.dueLabel

    board.sendBump('overdue-1')

    const dueAfter = board.chores.find((c) => c.id === 'due-1')?.dueLabel
    expect(dueAfter).toBe(dueBefore)
  })
})
