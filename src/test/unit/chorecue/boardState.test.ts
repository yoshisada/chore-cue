import { describe, expect, it } from 'vitest'

import {
  addChoreToBoard,
  archiveChoreInBoard,
  beginEditForBoard,
  collectAllTags,
  completeChoreInBoard,
  createSections,
  dueSortValue,
  emptyComposer,
  emptyEditorState,
  filterByTags,
  initialChores,
  saveEditedChore,
  sendBumpForBoard,
  sortVisibleChores,
} from '~/features/chorecue/boardState'

describe('boardState', () => {
  it('orders due buckets as overdue, due, then upcoming', () => {
    expect(dueSortValue('overdue')).toBeLessThan(dueSortValue('due'))
    expect(dueSortValue('due')).toBeLessThan(dueSortValue('upcoming'))
  })

  it('sorts visible chores and excludes archived ones', () => {
    const archived = {
      ...initialChores[0],
      id: 'archived-1',
      archived: true,
    }

    const sorted = sortVisibleChores([initialChores[2], archived, initialChores[1], initialChores[0]])

    expect(sorted.map((item) => item.id)).toEqual(['chore-1', 'chore-2', 'chore-3'])
  })

  it('creates sections from visible chores', () => {
    const sections = createSections(initialChores)

    expect(sections.overdue).toHaveLength(1)
    expect(sections.due).toHaveLength(1)
    expect(sections.upcoming).toHaveLength(1)
    expect(sections.overdue[0]?.title).toBe('Take out compost')
  })

  it('adds a chore with normalized labels and photo state', () => {
    const next = addChoreToBoard(initialChores, {
      ...emptyComposer,
      title: '  Mop bathroom  ',
      tags: ['Bathroom'],
      assigneeName: 'Alex',
      recurrenceSummary: 'Weekly',
      photoLabel: 'bathroom.png',
    })

    expect(next[0]).toMatchObject({
      title: 'Mop bathroom',
      tags: ['Bathroom'],
      dueBucket: 'due',
      photoLabel: 'bathroom.png',
      canBump: false,
    })
  })

  it('does not add a chore with empty title', () => {
    const next = addChoreToBoard(initialChores, {
      ...emptyComposer,
      title: '   ',
      tags: ['Kitchen'],
    })

    expect(next).toEqual(initialChores)
  })

  it('does not add a chore with no tags', () => {
    const next = addChoreToBoard(initialChores, {
      ...emptyComposer,
      title: 'Clean fridge',
      tags: [],
    })

    expect(next).toEqual(initialChores)
  })

  it('completes a chore and moves it to upcoming', () => {
    const next = completeChoreInBoard(initialChores, 'chore-1')
    expect(next.find((item) => item.id === 'chore-1')).toMatchObject({
      dueBucket: 'upcoming',
      dueLabel: 'Reset for the next cycle',
      lastCompletedLabel: 'Completed just now',
    })
  })

  it('accepts bumps until the daily limit', () => {
    const result = sendBumpForBoard(initialChores, 'chore-1', 2)

    expect(result.accepted).toBe(true)
    expect(result.bumpCount).toBe(3)
    expect(result.chores.find((item) => item.id === 'chore-1')?.dueLabel).toContain(
      'gentle reminder sent'
    )
  })

  it('rejects the sixth bump without changing state', () => {
    const result = sendBumpForBoard(initialChores, 'chore-1', 5)

    expect(result.accepted).toBe(false)
    expect(result.bumpCount).toBe(5)
    expect(result.chores).toEqual(initialChores)
  })

  it('begins editing from the selected chore', () => {
    const editor = beginEditForBoard(initialChores, 'chore-3')

    expect(editor).toMatchObject({
      choreId: 'chore-3',
      title: 'Vacuum living room',
      recurrenceSummary: 'Weekly',
      photoLabel: 'vacuum-corner.png',
    })
  })

  it('returns an empty editor for an unknown chore', () => {
    expect(beginEditForBoard(initialChores, 'missing')).toEqual(emptyEditorState)
  })

  it('saves an edited chore and clears editor state', () => {
    const result = saveEditedChore(initialChores, {
      choreId: 'chore-2',
      title: 'Wipe counters deeply',
      tags: ['Deep clean'],
      assigneeName: 'Sam',
      recurrenceSummary: 'Every N days',
      photoLabel: '',
    })

    expect(result.chores.find((item) => item.id === 'chore-2')).toMatchObject({
      title: 'Wipe counters deeply',
      tags: ['Deep clean'],
      assigneeName: 'Sam',
      recurrenceSummary: 'Every N days',
      photoLabel: null,
      canBump: true,
    })
    expect(result.editor).toEqual(emptyEditorState)
  })

  it('archives a chore and clears matching editor state', () => {
    const result = archiveChoreInBoard(initialChores, 'chore-1', {
      choreId: 'chore-1',
      title: 'Take out compost',
      tags: ['Kitchen', 'Quick'],
      assigneeName: 'Sam',
      recurrenceSummary: 'Every N days',
      photoLabel: 'compost-bin.jpg',
    })

    expect(result.chores.find((item) => item.id === 'chore-1')).toMatchObject({
      archived: true,
      canBump: false,
    })
    expect(result.editor).toEqual(emptyEditorState)
  })

  it('collectAllTags returns sorted unique tags from all chores', () => {
    const tags = collectAllTags(initialChores)
    expect(tags).toEqual(['Daily', 'Deep clean', 'Kitchen', 'Living room', 'Quick'])
  })

  it('collectAllTags returns empty array for no chores', () => {
    expect(collectAllTags([])).toEqual([])
  })

  it('filterByTags returns all chores when no tags selected', () => {
    const result = filterByTags(initialChores, new Set())
    expect(result).toEqual(initialChores)
  })

  it('filterByTags returns chores matching any selected tag', () => {
    const result = filterByTags(initialChores, new Set(['Kitchen']))
    expect(result).toHaveLength(2)
    expect(result.map((c) => c.id)).toEqual(['chore-1', 'chore-2'])
  })

  it('filterByTags excludes chores with no matching tags', () => {
    const result = filterByTags(initialChores, new Set(['Deep clean']))
    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('chore-3')
  })
})
