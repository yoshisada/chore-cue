import { describe, expect, it } from 'vitest'

import { buildDueRow, buildMixedRows } from './fixtures'
import { createBoardDriver } from './renderHelpers'

describe('useChoreBoard – default state and section ordering', () => {
  it('groups chores into overdue, dueSoon, and upcoming sections', () => {
    const board = createBoardDriver(buildMixedRows())
    const sections = board.sections

    expect(sections.overdue).toHaveLength(1)
    expect(sections.dueSoon).toHaveLength(1)
    expect(sections.upcoming).toHaveLength(1)
  })

  it('returns sections in overdue → dueSoon → upcoming order', () => {
    const board = createBoardDriver(buildMixedRows())
    const sections = board.sections
    const allChores = [...sections.overdue, ...sections.dueSoon, ...sections.upcoming]

    expect(allChores[0]?.dueBucket).toBe('overdue')
    expect(allChores[1]?.dueBucket).toBe('dueSoon')
    expect(allChores[2]?.dueBucket).toBe('upcoming')
  })

  it('returns empty sections when Zero has no rows yet', () => {
    const board = createBoardDriver([])
    const sections = board.sections

    expect(sections.overdue).toHaveLength(0)
    expect(sections.dueSoon).toHaveLength(0)
    expect(sections.upcoming).toHaveLength(0)
  })

  it('returns all chores in one bucket when they share the same due state', () => {
    const board = createBoardDriver([
      buildDueRow({ id: 'a' }),
      buildDueRow({ id: 'b' }),
      buildDueRow({ id: 'c' }),
    ])
    const sections = board.sections

    expect(sections.overdue).toHaveLength(0)
    expect(sections.dueSoon).toHaveLength(3)
    expect(sections.upcoming).toHaveLength(0)
  })

  it('starts with an empty composer', () => {
    const board = createBoardDriver(buildMixedRows())
    expect(board.composer.title).toBe('')
    expect(board.composer.tags).toEqual([])
  })

  it('starts with no editor active', () => {
    const board = createBoardDriver(buildMixedRows())
    expect(board.editor.choreId).toBeNull()
  })

  it('starts with zero bumps spent today', () => {
    const board = createBoardDriver(buildMixedRows())
    expect(board.bumpCount).toBe(0)
  })
})
