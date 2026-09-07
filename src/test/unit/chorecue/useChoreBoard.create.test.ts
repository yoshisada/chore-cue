import { describe, expect, it } from 'vitest'

import { firstDueAt } from '~/features/chorecue/recurrence'

import { buildMixedRows, FIXED_NOW, OTHER_MEMBER_ID, VIEWER_MEMBER_ID } from './fixtures'
import { createBoardDriver } from './renderHelpers'

describe('useChoreBoard – creating a chore', () => {
  it('adds a chore from the composer to the board', async () => {
    const board = createBoardDriver(buildMixedRows())
    board.updateComposer('title', 'Scrub sink')
    board.updateComposer('tags', ['Kitchen'])

    const result = await board.addChore()

    expect(result.ok).toBe(true)
    expect(board.chores).toHaveLength(4)
    expect(board.chores.map((c) => c.title)).toContain('Scrub sink')
  })

  it('derives householdId and creator from the caller, never the payload', async () => {
    const board = createBoardDriver([])
    board.updateComposer('title', 'Scrub sink')
    board.updateComposer('tags', ['Kitchen'])
    await board.addChore()

    expect(board.rows[0]).toMatchObject({
      householdId: 'household-test',
      createdByMemberId: VIEWER_MEMBER_ID,
      assigneeMemberId: OTHER_MEMBER_ID,
      status: 'active',
    })
  })

  it('resets the composer after adding a chore', async () => {
    const board = createBoardDriver(buildMixedRows())
    board.updateComposer('title', 'Scrub sink')
    board.updateComposer('tags', ['Kitchen'])
    await board.addChore()

    expect(board.composer.title).toBe('')
    expect(board.composer.tags).toEqual([])
  })

  it('schedules the first occurrence from the rule rather than "today"', async () => {
    const board = createBoardDriver([])
    board.updateComposer('title', 'Water plants')
    board.updateComposer('tags', ['Living room'])
    board.updateComposer('recurrenceSummary', 'Daily time')
    await board.addChore()

    const expected = firstDueAt(
      { type: 'daily_time', timeMinutes: 19 * 60, timezone: 'UTC' },
      FIXED_NOW
    )
    expect(board.rows[0]?.nextDueAt).toBe(expected)
    expect(board.chores[0]?.dueBucket).toBe('dueSoon')
  })

  it('does not add a chore when the title is empty', async () => {
    const board = createBoardDriver(buildMixedRows())
    board.updateComposer('title', '   ')
    board.updateComposer('tags', ['Kitchen'])

    const result = await board.addChore()

    expect(result.ok).toBe(false)
    expect(board.chores).toHaveLength(3)
  })

  it('does not add a chore when tags are empty', async () => {
    const board = createBoardDriver(buildMixedRows())
    board.updateComposer('title', 'Clean fridge')
    board.updateComposer('tags', [])

    const result = await board.addChore()

    expect(result.ok).toBe(false)
    expect(board.chores).toHaveLength(3)
  })

  it('preserves the selected recurrence type on the new chore', async () => {
    const board = createBoardDriver([])
    board.updateComposer('title', 'Vacuum')
    board.updateComposer('tags', ['Living room'])
    board.updateComposer('recurrenceSummary', 'Weekly')
    await board.addChore()

    expect(board.rows[0]?.recurrenceRuleType).toBe('weekly_day')
    expect(board.chores[0]?.recurrenceSummary).toBe('Weekly')
  })

  it('resolves the selected assignee name to a member id', async () => {
    const board = createBoardDriver([])
    board.updateComposer('title', 'Vacuum')
    board.updateComposer('tags', ['Living room'])
    board.updateComposer('assigneeName', 'Sam')
    await board.addChore()

    expect(board.rows[0]?.assigneeMemberId).toBe(VIEWER_MEMBER_ID)
    expect(board.chores[0]?.assigneeName).toBe('Sam')
    // assigned to yourself, so there is nobody to nudge
    expect(board.chores[0]?.bumpBlockedReason).toBe('self')
  })

  it('rejects an assignee who is not in the household', async () => {
    const board = createBoardDriver([])
    board.updateComposer('title', 'Vacuum')
    board.updateComposer('tags', ['Living room'])
    board.updateComposer('assigneeName', 'Nobody')

    const result = await board.addChore()

    expect(result.ok).toBe(false)
    expect(board.rows).toHaveLength(0)
  })

  it('attaches a photo label when the composer has one', async () => {
    const board = createBoardDriver([])
    board.updateComposer('title', 'Organize pantry')
    board.updateComposer('tags', ['Kitchen'])
    board.updateComposer('photoLabel', 'pantry.jpg')
    await board.addChore()

    expect(board.chores[0]?.photoLabel).toBe('pantry.jpg')
  })

  it('stores a null photo when the composer photo is empty', async () => {
    const board = createBoardDriver([])
    board.updateComposer('title', 'Organize pantry')
    board.updateComposer('tags', ['Kitchen'])
    await board.addChore()

    expect(board.chores[0]?.photoLabel).toBeNull()
  })
})
