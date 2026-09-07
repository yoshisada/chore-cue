// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

import { firstDueAt } from '~/features/chorecue/recurrence'

import { renderBoard } from './boardHarness'
import { buildMixedRows, FIXED_NOW, OTHER_MEMBER_ID, VIEWER_MEMBER_ID } from './fixtures'

vi.mock('~/zero/client', async () => (await import('./zeroMock')).zeroClientMock())
vi.mock('~/features/auth/client/useHouseholdContext', async () =>
  (await import('./zeroMock')).householdContextMock()
)

describe('useChoreBoard – creating a chore', () => {
  it('adds a chore from the composer to the board', async () => {
    const board = renderBoard({ chores: buildMixedRows() })
    await board.setComposer('title', 'Scrub sink')
    await board.setComposer('tags', ['Kitchen'])

    const result = await board.addChore()

    expect(result.ok).toBe(true)
    expect(board.visible()).toHaveLength(4)
    expect(board.visible().map((chore) => chore.title)).toContain('Scrub sink')
  })

  it('derives householdId and creator from the caller, never the payload', async () => {
    const board = renderBoard({ chores: [] })
    await board.setComposer('title', 'Scrub sink')
    await board.setComposer('tags', ['Kitchen'])
    await board.setComposer('assigneeName', 'Alex')
    await board.addChore()

    // the payload the board sends carries no household or creator at all
    expect(board.zero.mutate.chore.create).toHaveBeenCalledWith(
      expect.not.objectContaining({ householdId: expect.anything() })
    )
    expect(board.rows()[0]).toMatchObject({
      householdId: 'household-test',
      createdByMemberId: VIEWER_MEMBER_ID,
      assigneeMemberId: OTHER_MEMBER_ID,
      status: 'active',
    })
  })

  it('resets the composer after adding a chore', async () => {
    const board = renderBoard({ chores: buildMixedRows() })
    await board.setComposer('title', 'Scrub sink')
    await board.setComposer('tags', ['Kitchen'])
    await board.addChore()

    expect(board.board().composer.title).toBe('')
    expect(board.board().composer.tags).toEqual([])
    expect(board.board().composer.assigneeName).toBe('Sam')
  })

  it('mints a fresh chore id for every create', async () => {
    const board = renderBoard({ chores: [] })

    for (const title of ['Scrub sink', 'Wipe counter']) {
      await board.setComposer('title', title)
      await board.setComposer('tags', ['Kitchen'])
      await board.addChore()
    }

    const ids = board.rows().map((row) => row.id)
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
  })

  it('schedules the first occurrence from the rule rather than "today"', async () => {
    const board = renderBoard({ chores: [] })
    await board.setComposer('title', 'Water plants')
    await board.setComposer('tags', ['Living room'])
    await board.setComposer('recurrenceSummary', 'Daily time')
    await board.addChore()

    const expected = firstDueAt(
      { type: 'daily_time', timeMinutes: 19 * 60, timezone: 'UTC' },
      FIXED_NOW
    )
    expect(board.rows()[0]?.nextDueAt).toBe(expected)
    expect(board.visible()[0]?.dueBucket).toBe('dueSoon')
  })

  it('does not add a chore when the title is empty', async () => {
    const board = renderBoard({ chores: buildMixedRows() })
    await board.setComposer('title', '   ')
    await board.setComposer('tags', ['Kitchen'])

    const result = await board.addChore()

    expect(result).toEqual({ ok: false, reason: 'Chore title is required' })
    expect(board.zero.mutate.chore.create).not.toHaveBeenCalled()
    expect(board.visible()).toHaveLength(3)
  })

  it('does not add a chore when tags are empty', async () => {
    const board = renderBoard({ chores: buildMixedRows() })
    await board.setComposer('title', 'Clean fridge')
    await board.setComposer('tags', [])

    const result = await board.addChore()

    expect(result).toEqual({ ok: false, reason: 'At least one tag is required' })
    expect(board.zero.mutate.chore.create).not.toHaveBeenCalled()
    expect(board.visible()).toHaveLength(3)
  })

  it('keeps the rejected draft in the composer so it can be corrected', async () => {
    const board = renderBoard({ chores: [] })
    await board.setComposer('title', 'Clean fridge')
    await board.setComposer('tags', [])
    await board.addChore()

    expect(board.board().composer.title).toBe('Clean fridge')
  })

  it('preserves the selected recurrence type on the new chore', async () => {
    const board = renderBoard({ chores: [] })
    await board.setComposer('title', 'Vacuum')
    await board.setComposer('tags', ['Living room'])
    await board.setComposer('recurrenceSummary', 'Weekly')
    await board.addChore()

    expect(board.rows()[0]?.recurrenceRuleType).toBe('weekly_day')
    expect(board.visible()[0]?.recurrenceSummary).toBe('Weekly')
  })

  it('resolves the selected assignee name to a member id', async () => {
    const board = renderBoard({ chores: [] })
    await board.setComposer('title', 'Vacuum')
    await board.setComposer('tags', ['Living room'])
    await board.setComposer('assigneeName', 'Sam')
    await board.addChore()

    expect(board.rows()[0]?.assigneeMemberId).toBe(VIEWER_MEMBER_ID)
    expect(board.visible()[0]?.assigneeName).toBe('Sam')
    // assigned to yourself, so there is nobody to nudge
    expect(board.visible()[0]?.bumpBlockedReason).toBe('self')
  })

  it('rejects an assignee who is not in the household', async () => {
    const board = renderBoard({ chores: [] })
    await board.setComposer('title', 'Vacuum')
    await board.setComposer('tags', ['Living room'])
    await board.setComposer('assigneeName', 'Nobody')

    const result = await board.addChore()

    expect(result).toEqual({ ok: false, reason: 'An assignee is required' })
    expect(board.zero.mutate.chore.create).not.toHaveBeenCalled()
    expect(board.rows()).toHaveLength(0)
  })

  it('reports the reason when the mutator itself rejects the write', async () => {
    // the draft is perfectly valid; it is the write that is refused, and the
    // board must hand that reason back rather than swallow it
    const board = renderBoard({ chores: [], userId: null })
    await board.setComposer('title', 'Vacuum')
    await board.setComposer('tags', ['Living room'])

    const result = await board.addChore()

    expect(result).toEqual({ ok: false, reason: 'Unauthorized' })
    expect(board.zero.mutate.chore.create).toHaveBeenCalledOnce()
    expect(board.rows()).toHaveLength(0)
    // a failed create must not throw the composer away
    expect(board.board().composer.title).toBe('Vacuum')
  })

  it('attaches a photo label when the composer has one', async () => {
    const board = renderBoard({ chores: [] })
    await board.setComposer('title', 'Organize pantry')
    await board.setComposer('tags', ['Kitchen'])
    await board.setComposer('photoLabel', 'pantry.jpg')
    await board.addChore()

    expect(board.visible()[0]?.photoLabel).toBe('pantry.jpg')
  })

  it('stores a null photo when the composer photo is empty', async () => {
    const board = renderBoard({ chores: [] })
    await board.setComposer('title', 'Organize pantry')
    await board.setComposer('tags', ['Kitchen'])
    await board.addChore()

    expect(board.visible()[0]?.photoLabel).toBeNull()
  })
})
