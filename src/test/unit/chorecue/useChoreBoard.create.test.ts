import { describe, expect, it } from 'vitest'

import { createBoardDriver } from './renderHelpers'
import { buildMixedBoard } from './fixtures'

describe('useChoreBoard – create-chore state transitions', () => {
  it('adds a chore from the composer to the board', () => {
    const board = createBoardDriver(buildMixedBoard())
    board.updateComposer('title', 'Scrub sink')
    board.updateComposer('tags', ['Kitchen'])
    board.addChore()

    const all = board.chores
    expect(all).toHaveLength(4)
    expect(all[0]?.title).toBe('Scrub sink')
  })

  it('resets the composer after adding a chore', () => {
    const board = createBoardDriver(buildMixedBoard())
    board.updateComposer('title', 'Scrub sink')
    board.updateComposer('tags', ['Kitchen'])
    board.addChore()

    expect(board.composer.title).toBe('')
    expect(board.composer.tags).toEqual([])
  })

  it('new chore appears in the due section', () => {
    const board = createBoardDriver(buildMixedBoard())
    board.updateComposer('title', 'Scrub sink')
    board.updateComposer('tags', ['Kitchen'])
    board.addChore()

    expect(board.sections.due).toHaveLength(2)
  })

  it('does not add a chore when title is empty', () => {
    const board = createBoardDriver(buildMixedBoard())
    board.updateComposer('title', '   ')
    board.updateComposer('tags', ['Kitchen'])
    board.addChore()

    expect(board.chores).toHaveLength(3)
  })

  it('does not add a chore when tags are empty', () => {
    const board = createBoardDriver(buildMixedBoard())
    board.updateComposer('title', 'Clean fridge')
    board.updateComposer('tags', [])
    board.addChore()

    expect(board.chores).toHaveLength(3)
  })

  it('preserves the selected recurrence type on the new chore', () => {
    const board = createBoardDriver([])
    board.updateComposer('title', 'Vacuum')
    board.updateComposer('tags', ['Living room'])
    board.updateComposer('recurrenceSummary', 'Weekly')
    board.addChore()

    expect(board.chores[0]?.recurrenceSummary).toBe('Weekly')
  })

  it('preserves the selected assignee on the new chore', () => {
    const board = createBoardDriver([])
    board.updateComposer('title', 'Vacuum')
    board.updateComposer('tags', ['Living room'])
    board.updateComposer('assigneeName', 'Alex')
    board.addChore()

    expect(board.chores[0]?.assigneeName).toBe('Alex')
  })

  it('attaches photo label when provided in composer', () => {
    const board = createBoardDriver([])
    board.updateComposer('title', 'Organize pantry')
    board.updateComposer('tags', ['Kitchen'])
    board.updateComposer('photoLabel', 'pantry.jpg')
    board.addChore()

    expect(board.chores[0]?.photoLabel).toBe('pantry.jpg')
  })

  it('sets null photo when composer photo is empty', () => {
    const board = createBoardDriver([])
    board.updateComposer('title', 'Organize pantry')
    board.updateComposer('tags', ['Kitchen'])
    board.addChore()

    expect(board.chores[0]?.photoLabel).toBeNull()
  })
})
