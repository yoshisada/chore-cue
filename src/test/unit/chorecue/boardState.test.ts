import { describe, expect, it } from 'vitest'

import {
  beginEditForBoard,
  buildChoreDraft,
  buildChoreEdit,
  collectAllTags,
  createSections,
  deriveDueBucket,
  DUE_SOON_WINDOW_MS,
  dueSortValue,
  emptyEditorState,
  filterBySearch,
  filterByTags,
  resetEditorIfEditing,
  sortVisibleChores,
} from '~/features/chorecue/boardState'

import {
  buildChore,
  buildComposer,
  buildEditor,
  buildMixedCards,
  buildCardsWithArchived,
  FIXED_NOW,
  OTHER_MEMBER_ID,
} from './fixtures'

describe('boardState', () => {
  describe('deriveDueBucket', () => {
    it('orders due buckets as overdue, dueSoon, then upcoming', () => {
      expect(dueSortValue('overdue')).toBeLessThan(dueSortValue('dueSoon'))
      expect(dueSortValue('dueSoon')).toBeLessThan(dueSortValue('upcoming'))
    })

    it('treats a due instant in the past as overdue', () => {
      expect(deriveDueBucket(FIXED_NOW - 1, FIXED_NOW)).toBe('overdue')
    })

    it('treats a due instant exactly now as overdue', () => {
      expect(deriveDueBucket(FIXED_NOW, FIXED_NOW)).toBe('overdue')
    })

    it('treats the far edge of the 24h window as dueSoon', () => {
      expect(deriveDueBucket(FIXED_NOW + DUE_SOON_WINDOW_MS, FIXED_NOW)).toBe('dueSoon')
    })

    it('treats one millisecond past the window as upcoming', () => {
      expect(deriveDueBucket(FIXED_NOW + DUE_SOON_WINDOW_MS + 1, FIXED_NOW)).toBe(
        'upcoming'
      )
    })
  })

  describe('sorting and sections', () => {
    it('sorts visible chores by bucket and excludes archived ones', () => {
      const [overdue, due, upcoming] = buildMixedCards()
      const archived = buildChore({ id: 'archived-1', archived: true })

      const sorted = sortVisibleChores([upcoming!, archived, due!, overdue!])

      expect(sorted.map((item) => item.id)).toEqual(['overdue-1', 'due-1', 'upcoming-1'])
    })

    it('breaks ties by due instant, then title, then id', () => {
      const base = { dueBucket: 'dueSoon' as const, nextDueAt: FIXED_NOW + 1000 }
      const sorted = sortVisibleChores([
        buildChore({ ...base, id: 'z', title: 'Same title' }),
        buildChore({ ...base, id: 'a', title: 'Same title' }),
        buildChore({ ...base, title: 'Alpha', id: 'm' }),
        buildChore({ ...base, nextDueAt: FIXED_NOW + 500, title: 'Zulu', id: 'q' }),
      ])

      expect(sorted.map((item) => item.id)).toEqual(['q', 'm', 'a', 'z'])
    })

    it('creates sections from visible chores', () => {
      const sections = createSections(buildMixedCards())

      expect(sections.overdue).toHaveLength(1)
      expect(sections.dueSoon).toHaveLength(1)
      expect(sections.upcoming).toHaveLength(1)
      expect(sections.overdue[0]?.title).toBe('Overdue chore')
    })

    it('keeps archived chores out of every section', () => {
      const sections = createSections(buildCardsWithArchived())
      const visible = [...sections.overdue, ...sections.dueSoon, ...sections.upcoming]

      expect(visible).toHaveLength(3)
      expect(visible.every((item) => !item.archived)).toBe(true)
    })
  })

  describe('tags and search', () => {
    it('collectAllTags returns sorted unique tags from all chores', () => {
      const chores = [
        buildChore({ id: 'a', tags: ['Kitchen', 'Quick'] }),
        buildChore({ id: 'b', tags: ['Kitchen', 'Daily'] }),
      ]

      expect(collectAllTags(chores)).toEqual(['Daily', 'Kitchen', 'Quick'])
    })

    it('collectAllTags returns empty array for no chores', () => {
      expect(collectAllTags([])).toEqual([])
    })

    it('filterByTags returns all chores when no tags selected', () => {
      const chores = buildMixedCards()
      expect(filterByTags(chores, new Set())).toEqual(chores)
    })

    it('filterByTags returns chores matching any selected tag', () => {
      const chores = [
        buildChore({ id: 'a', tags: ['Kitchen'] }),
        buildChore({ id: 'b', tags: ['Bathroom'] }),
      ]

      expect(filterByTags(chores, new Set(['Kitchen'])).map((c) => c.id)).toEqual(['a'])
    })

    it('filterByTags excludes chores with no matching tags', () => {
      const chores = [buildChore({ id: 'a', tags: ['Kitchen'] })]
      expect(filterByTags(chores, new Set(['Deep clean']))).toHaveLength(0)
    })

    it('filterBySearch matches title, assignee and tags', () => {
      const chores = [
        buildChore({ id: 'a', title: 'Mop floor', assigneeName: 'Sam', tags: ['Hall'] }),
        buildChore({ id: 'b', title: 'Dishes', assigneeName: 'Alex', tags: ['Kitchen'] }),
      ]

      expect(filterBySearch(chores, 'mop').map((c) => c.id)).toEqual(['a'])
      expect(filterBySearch(chores, 'alex').map((c) => c.id)).toEqual(['b'])
      expect(filterBySearch(chores, 'kitchen').map((c) => c.id)).toEqual(['b'])
    })

    it('filterBySearch returns everything for a blank query', () => {
      const chores = buildMixedCards()
      expect(filterBySearch(chores, '   ')).toEqual(chores)
    })
  })

  describe('editor state', () => {
    it('begins editing from the selected chore', () => {
      const editor = beginEditForBoard(buildMixedCards(), 'upcoming-1')

      expect(editor).toMatchObject({
        choreId: 'upcoming-1',
        title: 'Upcoming chore',
        recurrenceSummary: 'Weekly',
      })
    })

    it('returns an empty editor for an unknown chore', () => {
      expect(beginEditForBoard(buildMixedCards(), 'missing')).toEqual(emptyEditorState)
    })

    it('resets the editor when the chore under edit is the one acted on', () => {
      const editor = buildEditor({ choreId: 'due-1' })
      expect(resetEditorIfEditing(editor, 'due-1')).toEqual(emptyEditorState)
    })

    it('leaves the editor alone for a different chore', () => {
      const editor = buildEditor({ choreId: 'due-1' })
      expect(resetEditorIfEditing(editor, 'overdue-1')).toBe(editor)
    })
  })

  describe('write intents', () => {
    const ctx = {
      choreId: 'chore-new',
      assigneeMemberId: OTHER_MEMBER_ID,
      timezone: 'UTC',
      now: FIXED_NOW,
    }

    it('builds a create payload with a structured recurrence rule', () => {
      const intent = buildChoreDraft(
        buildComposer({ title: '  Mop  bathroom ', recurrenceSummary: 'Weekly' }),
        ctx
      )

      expect(intent.ok).toBe(true)
      if (!intent.ok) return
      expect(intent.value).toMatchObject({
        choreId: 'chore-new',
        title: 'Mop bathroom',
        tags: ['Kitchen'],
        assigneeMemberId: OTHER_MEMBER_ID,
        now: FIXED_NOW,
      })
      expect(intent.value.rule.type).toBe('weekly_day')
    })

    it('rejects an empty title with a field-keyed error', () => {
      const intent = buildChoreDraft(buildComposer({ title: '   ' }), ctx)

      expect(intent.ok).toBe(false)
      if (intent.ok) return
      expect(intent.error.field).toBe('title')
    })

    it('rejects a draft with no tags', () => {
      const intent = buildChoreDraft(buildComposer({ tags: [] }), ctx)

      expect(intent.ok).toBe(false)
      if (intent.ok) return
      expect(intent.error.field).toBe('tags')
    })

    it('rejects a draft whose assignee could not be resolved', () => {
      const intent = buildChoreDraft(buildComposer(), {
        ...ctx,
        assigneeMemberId: undefined,
      })

      expect(intent.ok).toBe(false)
      if (intent.ok) return
      expect(intent.error.field).toBe('assigneeMemberId')
    })

    it('builds an edit payload keyed to the chore under edit', () => {
      const intent = buildChoreEdit(buildEditor({ choreId: 'due-1' }), {
        assigneeMemberId: OTHER_MEMBER_ID,
        timezone: 'UTC',
        now: FIXED_NOW,
      })

      expect(intent.ok).toBe(true)
      if (!intent.ok) return
      expect(intent.value.choreId).toBe('due-1')
    })

    it('rejects an edit when no chore is being edited', () => {
      const intent = buildChoreEdit(buildEditor({ choreId: null }), {
        assigneeMemberId: OTHER_MEMBER_ID,
        timezone: 'UTC',
        now: FIXED_NOW,
      })

      expect(intent.ok).toBe(false)
    })
  })
})
