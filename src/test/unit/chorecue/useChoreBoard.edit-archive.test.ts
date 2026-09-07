// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

import { mutate as choreMutators } from '~/data/models/chore'
import { emptyEditorState } from '~/features/chorecue/boardState'
import { firstDueAt } from '~/features/chorecue/recurrence'

import { renderBoard } from './boardHarness'
import { buildMixedRows, FIXED_NOW, VIEWER_MEMBER_ID, VIEWER_USER_ID } from './fixtures'

vi.mock('~/zero/client', async () => (await import('./zeroMock')).zeroClientMock())
vi.mock('~/features/auth/client/useHouseholdContext', async () =>
  (await import('./zeroMock')).householdContextMock()
)

describe('useChoreBoard – edit and archive flows', () => {
  describe('editing', () => {
    it('begins edit by loading chore data into the editor', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      await board.beginEdit('overdue-1')

      expect(board.board().editor.choreId).toBe('overdue-1')
      expect(board.board().editor.title).toBe('Overdue chore')
    })

    it('returns an empty editor for an unknown chore id', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      await board.beginEdit('nonexistent')

      expect(board.board().editor).toEqual(emptyEditorState)
    })

    it('saves edited title and tags', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      await board.beginEdit('due-1')
      await board.setEditor('title', 'Updated title')
      await board.setEditor('tags', ['Updated tag'])
      await board.saveEdit()

      expect(board.card('due-1')?.title).toBe('Updated title')
      expect(board.card('due-1')?.tags).toEqual(['Updated tag'])
    })

    it('clears editor state after saving', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      await board.beginEdit('due-1')
      const result = await board.saveEdit()

      expect(result).toEqual({ ok: true })
      expect(board.board().editor).toEqual(emptyEditorState)
    })

    it('does nothing when saving with no active editor', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      const before = board.rows().map((row) => ({ ...row }))

      const result = await board.saveEdit()

      expect(result).toEqual({ ok: false, reason: 'No chore is being edited' })
      expect(board.zero.mutate.chore.edit).not.toHaveBeenCalled()
      expect(board.rows()).toEqual(before)
    })

    it('keeps the draft on the sheet when the save is rejected', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      await board.beginEdit('due-1')
      await board.setEditor('title', '   ')

      const result = await board.saveEdit()

      expect(result).toEqual({ ok: false, reason: 'Chore title is required' })
      expect(board.zero.mutate.chore.edit).not.toHaveBeenCalled()
      expect(board.board().editor.choreId).toBe('due-1')
      expect(board.card('due-1')?.title).toBe('Due chore')
    })

    it('saves a changed assignee and re-derives bump eligibility from it', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      await board.beginEdit('overdue-1')
      await board.setEditor('assigneeName', 'Sam')
      await board.saveEdit()

      const chore = board.card('overdue-1')
      expect(chore?.assigneeName).toBe('Sam')
      expect(chore?.assigneeMemberId).toBe(VIEWER_MEMBER_ID)
      expect(chore?.canBump).toBe(false)
      expect(chore?.bumpBlockedReason).toBe('self')
    })

    it('leaves nextDueAt alone when the recurrence is unchanged', async () => {
      const rows = buildMixedRows()
      const before = rows.find((row) => row.id === 'overdue-1')!.nextDueAt
      const board = renderBoard({ chores: rows })

      await board.beginEdit('overdue-1')
      await board.setEditor('title', 'Renamed only')
      await board.saveEdit()

      expect(board.row('overdue-1')?.nextDueAt).toBe(before)
    })

    it('re-anchors nextDueAt deterministically when the recurrence changes', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      await board.beginEdit('overdue-1')
      await board.setEditor('recurrenceSummary', 'Daily time')
      await board.saveEdit()

      const expected = firstDueAt(
        { type: 'daily_time', timeMinutes: 19 * 60, timezone: 'UTC' },
        FIXED_NOW
      )

      expect(board.row('overdue-1')?.nextDueAt).toBe(expected)
      expect(board.card('overdue-1')?.recurrenceSummary).toBe('Daily time')
    })

    it('clears the photo when the editor photo label is emptied', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      await board.beginEdit('overdue-1')
      await board.setEditor('photoLabel', 'photo.jpg')
      await board.saveEdit()
      expect(board.card('overdue-1')?.photoLabel).toBe('photo.jpg')

      await board.beginEdit('overdue-1')
      await board.setEditor('photoLabel', '')
      await board.saveEdit()

      expect(board.card('overdue-1')?.photoLabel).toBeNull()
    })

    it('refuses to save a chore archived out from under the open sheet', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      await board.beginEdit('due-1')
      await board.setEditor('title', 'Should not stick')

      // another device archives the chore while this sheet is open
      await choreMutators.archive(board.store.context(VIEWER_USER_ID), {
        choreId: 'due-1',
        now: FIXED_NOW,
      })

      const result = await board.saveEdit()

      expect(result).toEqual({ ok: false, reason: 'Cannot edit an archived chore' })
      expect(board.row('due-1')?.title).toBe('Due chore')
      // the draft is still there to explain the failure against
      expect(board.board().editor.choreId).toBe('due-1')
    })
  })

  describe('archiving', () => {
    it('marks a chore as archived and stamps archivedAt', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      const result = await board.archiveChore('overdue-1')

      expect(result).toEqual({ ok: true })
      expect(board.row('overdue-1')?.status).toBe('archived')
      expect(board.row('overdue-1')?.archivedAt).toBe(FIXED_NOW)
    })

    it('is idempotent', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      await board.archiveChore('overdue-1')
      const after = { ...board.row('overdue-1') }

      const second = await board.archiveChore('overdue-1')

      expect(second).toEqual({ ok: true })
      expect(board.row('overdue-1')).toEqual(after)
    })

    it('never deletes the row', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      await board.archiveChore('overdue-1')

      expect(board.rows()).toHaveLength(3)
    })

    it('clears the editor when the archived chore is being edited', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      await board.beginEdit('overdue-1')
      expect(board.board().editor.choreId).toBe('overdue-1')

      await board.archiveChore('overdue-1')

      expect(board.board().editor).toEqual(emptyEditorState)
    })

    it('preserves the editor when archiving a different chore', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      await board.beginEdit('due-1')

      await board.archiveChore('overdue-1')

      expect(board.board().editor.choreId).toBe('due-1')
    })

    it('removes the chore from visible sections', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      await board.archiveChore('overdue-1')

      expect(board.card('overdue-1')).toBeUndefined()
      expect(board.visible()).toHaveLength(2)
    })

    it('reports the reason when the archive is refused, and keeps the editor', async () => {
      const board = renderBoard({ chores: buildMixedRows(), userId: null })
      await board.beginEdit('overdue-1')

      const result = await board.archiveChore('overdue-1')

      expect(result).toEqual({ ok: false, reason: 'Unauthorized' })
      expect(board.row('overdue-1')?.status).toBe('active')
      expect(board.board().editor.choreId).toBe('overdue-1')
    })
  })

  describe('cancelEdit', () => {
    it('clears the editor without writing the draft', async () => {
      const board = renderBoard({ chores: buildMixedRows() })
      await board.beginEdit('overdue-1')
      await board.setEditor('title', 'Renamed while distracted')

      await board.cancelEdit()

      expect(board.board().editor).toEqual(emptyEditorState)
      expect(board.zero.mutate.chore.edit).not.toHaveBeenCalled()
      expect(board.row('overdue-1')?.title).toBe('Overdue chore')
    })
  })
})
