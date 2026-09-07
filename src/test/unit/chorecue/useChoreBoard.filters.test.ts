// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

import { renderBoard } from './boardHarness'
import { buildDueRow, buildMixedRows, buildOverdueRow } from './fixtures'

vi.mock('~/zero/client', async () => (await import('./zeroMock')).zeroClientMock())
vi.mock('~/features/auth/client/useHouseholdContext', async () =>
  (await import('./zeroMock')).householdContextMock()
)

const taggedRows = [
  buildOverdueRow({ id: 'kitchen-1', title: 'Wash dishes', tags: ['Kitchen', 'Daily'] }),
  buildDueRow({ id: 'bath-1', title: 'Scrub tub', tags: ['Bathroom'] }),
]

describe('useChoreBoard – tag chips and search', () => {
  it('collects the tag chips from every visible chore', () => {
    const { board } = renderBoard({ chores: taggedRows })

    expect(board().allTags).toEqual(['Bathroom', 'Daily', 'Kitchen'])
  })

  it('keeps the whole chip list while a search narrows the board', async () => {
    const board = renderBoard({ chores: taggedRows })

    await board.search('dishes')

    // the board is narrowed, but the chips are not: a search must not strand
    // an active tag filter by hiding the chip that would clear it
    expect(board.visible().map((chore) => chore.id)).toEqual(['kitchen-1'])
    expect(board.board().allTags).toEqual(['Bathroom', 'Daily', 'Kitchen'])
  })

  it('searches title, assignee and tag alike', async () => {
    const board = renderBoard({ chores: taggedRows })

    await board.search('bathroom')
    expect(board.visible().map((chore) => chore.id)).toEqual(['bath-1'])

    await board.search('alex')
    expect(board.visible()).toHaveLength(2)

    await board.search('   ')
    expect(board.visible()).toHaveLength(2)
  })

  it('filters the sections down to a selected tag', async () => {
    const board = renderBoard({ chores: taggedRows })

    await board.toggleTag('Kitchen')

    expect(board.board().selectedTags).toEqual(new Set(['Kitchen']))
    expect(board.visible().map((chore) => chore.id)).toEqual(['kitchen-1'])
  })

  it('toggling the same chip twice puts the board back', async () => {
    const board = renderBoard({ chores: taggedRows })

    await board.toggleTag('Kitchen')
    await board.toggleTag('Kitchen')

    expect(board.board().selectedTags.size).toBe(0)
    expect(board.visible()).toHaveLength(2)
  })

  it('clears every selected chip at once', async () => {
    const board = renderBoard({ chores: taggedRows })
    await board.toggleTag('Kitchen')
    await board.toggleTag('Bathroom')
    expect(board.visible()).toHaveLength(2)

    await board.clearTagFilter()

    expect(board.board().selectedTags.size).toBe(0)
    expect(board.visible()).toHaveLength(2)
  })

  it('combines the search box and the chips', async () => {
    const board = renderBoard({ chores: taggedRows })

    await board.toggleTag('Kitchen')
    await board.search('tub')

    expect(board.visible()).toHaveLength(0)
  })

  it('picks up the tags of a chore added while a filter is active', async () => {
    const board = renderBoard({ chores: taggedRows })
    await board.toggleTag('Kitchen')

    await board.setComposer('title', 'Sweep hallway')
    await board.setComposer('tags', ['Hallway'])
    await board.addChore()

    expect(board.board().allTags).toEqual(['Bathroom', 'Daily', 'Hallway', 'Kitchen'])
    // the new chore does not carry the active tag, so it stays out of view
    expect(board.visible().map((chore) => chore.id)).toEqual(['kitchen-1'])
  })
})

describe('useChoreBoard – empty and loading states', () => {
  it('tells an empty board apart from an empty filter result', async () => {
    const board = renderBoard({ chores: taggedRows })

    await board.search('nothing matches this')

    expect(board.visible()).toHaveLength(0)
    // there are chores, they are just filtered out — the board owes the user a
    // "clear your filters" message rather than the first-run empty state
    expect(board.board().hasAnyChores).toBe(true)
  })

  it('reports an empty household as having no chores at all', () => {
    const { board } = renderBoard({ chores: [] })

    expect(board().hasAnyChores).toBe(false)
    expect(board().allTags).toEqual([])
  })

  it('is loading until the chore query has synced', () => {
    const { board } = renderBoard({ chores: buildMixedRows(), loading: true })

    expect(board().isLoading).toBe(true)
    expect(board().sections.overdue).toHaveLength(1)
  })

  it('is not loading once the query reports a result', () => {
    const { board } = renderBoard({ chores: buildMixedRows() })

    expect(board().isLoading).toBe(false)
  })

  it('is not loading when there is no household to sync yet', () => {
    const { board } = renderBoard({
      chores: buildMixedRows(),
      loading: true,
      household: { householdId: '' },
    })

    expect(board().isLoading).toBe(false)
    expect(board().sections.overdue).toHaveLength(0)
  })

  it('still offers the viewer as an assignee before the roster syncs', () => {
    const { board } = renderBoard({
      chores: [],
      members: [],
      household: { displayName: 'Solo Sam' },
    })

    expect(board().memberNames).toEqual(['Solo Sam'])
    expect(board().composer.assigneeName).toBe('Solo Sam')
  })
})
