import { describe, expect, it } from 'vitest'

import { emptyEditorState } from '~/features/chorecue/boardState'
import { firstDueAt } from '~/features/chorecue/recurrence'

import { buildMixedRows, FIXED_NOW, VIEWER_MEMBER_ID } from './fixtures'
import { createBoardDriver } from './renderHelpers'

describe('useChoreBoard – edit and archive flows', () => {
  describe('editing', () => {
    it('begins edit by loading chore data into the editor', () => {
      const board = createBoardDriver(buildMixedRows())
      board.beginEdit('overdue-1')

      expect(board.editor.choreId).toBe('overdue-1')
      expect(board.editor.title).toBe('Overdue chore')
    })

    it('returns an empty editor for an unknown chore id', () => {
      const board = createBoardDriver(buildMixedRows())
      board.beginEdit('nonexistent')

      expect(board.editor).toEqual(emptyEditorState)
    })

    it('saves edited title and tags', async () => {
      const board = createBoardDriver(buildMixedRows())
      board.beginEdit('due-1')
      board.updateEditor('title', 'Updated title')
      board.updateEditor('tags', ['Updated tag'])
      await board.saveEdit()

      const chore = board.chores.find((c) => c.id === 'due-1')
      expect(chore?.title).toBe('Updated title')
      expect(chore?.tags).toEqual(['Updated tag'])
    })

    it('clears editor state after saving', async () => {
      const board = createBoardDriver(buildMixedRows())
      board.beginEdit('due-1')
      await board.saveEdit()

      expect(board.editor).toEqual(emptyEditorState)
    })

    it('does nothing when saving with no active editor', async () => {
      const board = createBoardDriver(buildMixedRows())
      const before = board.rows.map((r) => ({ ...r }))

      const result = await board.saveEdit()

      expect(result.ok).toBe(false)
      expect(board.rows).toEqual(before)
    })

    it('saves a changed assignee and re-derives bump eligibility from it', async () => {
      const board = createBoardDriver(buildMixedRows())
      board.beginEdit('overdue-1')
      board.updateEditor('assigneeName', 'Sam')
      await board.saveEdit()

      const chore = board.chores.find((c) => c.id === 'overdue-1')
      expect(chore?.assigneeName).toBe('Sam')
      expect(chore?.assigneeMemberId).toBe(VIEWER_MEMBER_ID)
      expect(chore?.canBump).toBe(false)
      expect(chore?.bumpBlockedReason).toBe('self')
    })

    it('leaves nextDueAt alone when the recurrence is unchanged', async () => {
      const rows = buildMixedRows()
      const before = rows.find((r) => r.id === 'overdue-1')!.nextDueAt
      const board = createBoardDriver(rows)

      board.beginEdit('overdue-1')
      board.updateEditor('title', 'Renamed only')
      await board.saveEdit()

      expect(board.rows.find((r) => r.id === 'overdue-1')?.nextDueAt).toBe(before)
    })

    it('re-anchors nextDueAt deterministically when the recurrence changes', async () => {
      const board = createBoardDriver(buildMixedRows())
      board.beginEdit('overdue-1')
      board.updateEditor('recurrenceSummary', 'Daily time')
      await board.saveEdit()

      const expected = firstDueAt(
        { type: 'daily_time', timeMinutes: 19 * 60, timezone: 'UTC' },
        FIXED_NOW
      )

      expect(board.rows.find((r) => r.id === 'overdue-1')?.nextDueAt).toBe(expected)
      expect(board.chores.find((c) => c.id === 'overdue-1')?.recurrenceSummary).toBe(
        'Daily time'
      )
    })

    it('clears the photo when the editor photo label is emptied', async () => {
      const board = createBoardDriver(buildMixedRows())
      board.beginEdit('overdue-1')
      board.updateEditor('photoLabel', 'photo.jpg')
      await board.saveEdit()

      board.beginEdit('overdue-1')
      board.updateEditor('photoLabel', '')
      await board.saveEdit()

      expect(board.chores.find((c) => c.id === 'overdue-1')?.photoLabel).toBeNull()
    })

    it('refuses to edit an archived chore', async () => {
      const board = createBoardDriver(buildMixedRows())
      board.beginEdit('overdue-1')
      await board.archiveChore('overdue-1')

      board.beginEdit('overdue-1')
      board.updateEditor('title', 'Should not stick')
      const result = await board.saveEdit()

      expect(result.ok).toBe(false)
      expect(board.chores.find((c) => c.id === 'overdue-1')?.title).toBe('Overdue chore')
    })
  })

  describe('archiving', () => {
    it('marks a chore as archived and stamps archivedAt', async () => {
      const board = createBoardDriver(buildMixedRows())
      await board.archiveChore('overdue-1')

      expect(board.chores.find((c) => c.id === 'overdue-1')?.archived).toBe(true)
      expect(board.rows.find((r) => r.id === 'overdue-1')?.archivedAt).toBe(FIXED_NOW)
    })

    it('sets canBump to false on an archived chore', async () => {
      const board = createBoardDriver(buildMixedRows())
      await board.archiveChore('overdue-1')

      expect(board.chores.find((c) => c.id === 'overdue-1')?.canBump).toBe(false)
    })

    it('is idempotent', async () => {
      const board = createBoardDriver(buildMixedRows())
      await board.archiveChore('overdue-1')
      const after = { ...(board.rows.find((r) => r.id === 'overdue-1') as any) }

      const second = await board.archiveChore('overdue-1')

      expect(second.ok).toBe(true)
      expect(board.rows.find((r) => r.id === 'overdue-1')).toEqual(after)
    })

    it('never deletes the row', async () => {
      const board = createBoardDriver(buildMixedRows())
      await board.archiveChore('overdue-1')

      expect(board.rows).toHaveLength(3)
    })

    it('clears the editor when the archived chore is being edited', async () => {
      const board = createBoardDriver(buildMixedRows())
      board.beginEdit('overdue-1')
      expect(board.editor.choreId).toBe('overdue-1')

      await board.archiveChore('overdue-1')

      expect(board.editor).toEqual(emptyEditorState)
    })

    it('preserves the editor when archiving a different chore', async () => {
      const board = createBoardDriver(buildMixedRows())
      board.beginEdit('due-1')

      await board.archiveChore('overdue-1')

      expect(board.editor.choreId).toBe('due-1')
    })

    it('removes the chore from visible sections', async () => {
      const board = createBoardDriver(buildMixedRows())
      await board.archiveChore('overdue-1')

      const sections = board.sections
      const visible = [...sections.overdue, ...sections.dueSoon, ...sections.upcoming]
      expect(visible.find((c) => c.id === 'overdue-1')).toBeUndefined()
    })
  })
})
