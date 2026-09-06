import { describe, expect, it } from 'vitest'

import { emptyEditorState } from '~/features/chorecue/boardState'

import { buildMixedBoard } from './fixtures'
import { createBoardDriver } from './renderHelpers'

describe('useChoreBoard – edit and archive flows', () => {
  describe('editing', () => {
    it('begins edit by loading chore data into editor', () => {
      const board = createBoardDriver(buildMixedBoard())
      board.beginEdit('overdue-1')

      expect(board.editor.choreId).toBe('overdue-1')
      expect(board.editor.title).toBe('Overdue chore')
    })

    it('returns empty editor for unknown chore id', () => {
      const board = createBoardDriver(buildMixedBoard())
      board.beginEdit('nonexistent')

      expect(board.editor).toEqual(emptyEditorState)
    })

    it('saves edited title and tags', () => {
      const board = createBoardDriver(buildMixedBoard())
      board.beginEdit('due-1')
      board.updateEditor('title', 'Updated title')
      board.updateEditor('tags', ['Updated tag'])
      board.saveEdit()

      const chore = board.chores.find((c) => c.id === 'due-1')
      expect(chore?.title).toBe('Updated title')
      expect(chore?.tags).toEqual(['Updated tag'])
    })

    it('clears editor state after saving', () => {
      const board = createBoardDriver(buildMixedBoard())
      board.beginEdit('due-1')
      board.saveEdit()

      expect(board.editor).toEqual(emptyEditorState)
    })

    it('does nothing when saving with no active editor', () => {
      const board = createBoardDriver(buildMixedBoard())
      const before = [...board.chores]
      board.saveEdit()

      expect(board.chores).toEqual(before)
    })

    it('saves changed assignee', () => {
      const board = createBoardDriver(buildMixedBoard())
      board.beginEdit('overdue-1')
      board.updateEditor('assigneeName', 'Alex')
      board.saveEdit()

      const chore = board.chores.find((c) => c.id === 'overdue-1')
      expect(chore?.assigneeName).toBe('Alex')
    })

    it('saves changed recurrence type', () => {
      const board = createBoardDriver(buildMixedBoard())
      board.beginEdit('overdue-1')
      board.updateEditor('recurrenceSummary', 'Daily time')
      board.saveEdit()

      const chore = board.chores.find((c) => c.id === 'overdue-1')
      expect(chore?.recurrenceSummary).toBe('Daily time')
    })

    it('clears photo when editor photo label is empty', () => {
      const board = createBoardDriver(buildMixedBoard())
      board.beginEdit('overdue-1')
      board.updateEditor('photoLabel', 'photo.jpg')
      board.saveEdit()

      board.beginEdit('overdue-1')
      board.updateEditor('photoLabel', '')
      board.saveEdit()

      const chore = board.chores.find((c) => c.id === 'overdue-1')
      expect(chore?.photoLabel).toBeNull()
    })

    it('updates canBump based on new assignee', () => {
      const board = createBoardDriver(buildMixedBoard())
      board.beginEdit('overdue-1')
      board.updateEditor('assigneeName', 'Alex')
      board.saveEdit()

      expect(board.chores.find((c) => c.id === 'overdue-1')?.canBump).toBe(false)
    })
  })

  describe('archiving', () => {
    it('marks a chore as archived', () => {
      const board = createBoardDriver(buildMixedBoard())
      board.archiveChore('overdue-1')

      const chore = board.chores.find((c) => c.id === 'overdue-1')
      expect(chore?.archived).toBe(true)
    })

    it('sets canBump to false on archived chore', () => {
      const board = createBoardDriver(buildMixedBoard())
      board.archiveChore('overdue-1')

      const chore = board.chores.find((c) => c.id === 'overdue-1')
      expect(chore?.canBump).toBe(false)
    })

    it('clears editor when the archived chore is being edited', () => {
      const board = createBoardDriver(buildMixedBoard())
      board.beginEdit('overdue-1')
      expect(board.editor.choreId).toBe('overdue-1')

      board.archiveChore('overdue-1')

      expect(board.editor).toEqual(emptyEditorState)
    })

    it('preserves editor when archiving a different chore', () => {
      const board = createBoardDriver(buildMixedBoard())
      board.beginEdit('due-1')

      board.archiveChore('overdue-1')

      expect(board.editor.choreId).toBe('due-1')
    })

    it('removes the chore from visible sections', () => {
      const board = createBoardDriver(buildMixedBoard())
      board.archiveChore('overdue-1')

      const sections = board.sections
      const allVisible = [...sections.overdue, ...sections.due, ...sections.upcoming]
      expect(allVisible.find((c) => c.id === 'overdue-1')).toBeUndefined()
    })
  })
})
