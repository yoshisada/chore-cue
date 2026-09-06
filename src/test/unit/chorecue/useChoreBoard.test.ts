import { describe, expect, it } from 'vitest'

import { buildChore, buildMixedBoard } from './fixtures'
import { createBoardDriver } from './renderHelpers'

describe('useChoreBoard – default state and section ordering', () => {
  it('groups initial chores into overdue, due, and upcoming sections', () => {
    const board = createBoardDriver(buildMixedBoard())
    const sections = board.sections

    expect(sections.overdue).toHaveLength(1)
    expect(sections.due).toHaveLength(1)
    expect(sections.upcoming).toHaveLength(1)
  })

  it('returns sections in overdue → due → upcoming order', () => {
    const board = createBoardDriver(buildMixedBoard())
    const sections = board.sections
    const allChores = [...sections.overdue, ...sections.due, ...sections.upcoming]

    expect(allChores[0]?.dueBucket).toBe('overdue')
    expect(allChores[1]?.dueBucket).toBe('due')
    expect(allChores[2]?.dueBucket).toBe('upcoming')
  })

  it('returns empty sections when no chores exist', () => {
    const board = createBoardDriver([])
    const sections = board.sections

    expect(sections.overdue).toHaveLength(0)
    expect(sections.due).toHaveLength(0)
    expect(sections.upcoming).toHaveLength(0)
  })

  it('returns all chores in one bucket when they share the same due state', () => {
    const board = createBoardDriver([
      buildChore({ id: 'a', dueBucket: 'due' }),
      buildChore({ id: 'b', dueBucket: 'due' }),
      buildChore({ id: 'c', dueBucket: 'due' }),
    ])
    const sections = board.sections

    expect(sections.overdue).toHaveLength(0)
    expect(sections.due).toHaveLength(3)
    expect(sections.upcoming).toHaveLength(0)
  })

  it('starts with an empty composer', () => {
    const board = createBoardDriver(buildMixedBoard())
    expect(board.composer.title).toBe('')
    expect(board.composer.tags).toEqual([])
  })

  it('starts with no editor active', () => {
    const board = createBoardDriver(buildMixedBoard())
    expect(board.editor.choreId).toBeNull()
  })

  it('starts with zero bump count', () => {
    const board = createBoardDriver(buildMixedBoard())
    expect(board.bumpCount).toBe(0)
  })
})
