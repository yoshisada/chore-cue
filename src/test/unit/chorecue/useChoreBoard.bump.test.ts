import { describe, expect, it } from 'vitest'

import { ConstraintViolation } from './fakeZero'
import {
  buildMixedRows,
  buildOverdueRow,
  FIXED_NOW,
  OTHER_MEMBER_ID,
  VIEWER_MEMBER_ID,
} from './fixtures'
import { createBoardDriver } from './renderHelpers'

describe('useChoreBoard – bump quota and eligibility', () => {
  it('starts a fresh board with no bumps spent', () => {
    const board = createBoardDriver(buildMixedRows())

    expect(board.bumpCount).toBe(0)
  })

  it('accepts the first bump and records a bump event', async () => {
    const board = createBoardDriver(buildMixedRows())
    const accepted = await board.sendBump('overdue-1')

    expect(accepted).toBe(true)
    expect(board.bumpCount).toBe(1)

    const [bump] = board.store.rows('bumpEvent')
    expect(bump).toMatchObject({
      choreId: 'overdue-1',
      senderMemberId: VIEWER_MEMBER_ID,
      recipientMemberId: OTHER_MEMBER_ID,
      dailySequence: 1,
      messageType: 'gentle_nudge',
    })
  })

  it('stamps lastBumpedAt on the bumped chore', async () => {
    const board = createBoardDriver(buildMixedRows())
    await board.sendBump('overdue-1')

    const row = board.rows.find((r) => r.id === 'overdue-1') as any
    expect(row.lastBumpedAt).toBe(FIXED_NOW)
  })

  it('accepts bumps 1 through 5, numbering them in sequence', async () => {
    const board = createBoardDriver(buildMixedRows())

    for (let i = 0; i < 5; i++) {
      expect(await board.sendBump('overdue-1')).toBe(true)
    }

    expect(board.bumpCount).toBe(5)
    expect(board.store.rows('bumpEvent').map((b) => b.dailySequence)).toEqual([
      1, 2, 3, 4, 5,
    ])
  })

  it('rejects the sixth bump of the day', async () => {
    const board = createBoardDriver(buildMixedRows())

    for (let i = 0; i < 5; i++) {
      await board.sendBump('overdue-1')
    }

    expect(await board.sendBump('overdue-1')).toBe(false)
    expect(board.bumpCount).toBe(5)
  })

  it('makes a forged sixth bump impossible at the schema level', async () => {
    const board = createBoardDriver(buildMixedRows())

    for (let i = 0; i < 5; i++) {
      await board.sendBump('overdue-1')
    }

    // the mutator is not the only line of defence: CHECK(dailySequence 1..5)
    // plus UNIQUE(sender, sentOnDate, dailySequence) mean a client that forged
    // its way past `bumpEligibility` still cannot land a row
    const ctx = board.store.context('user-sam')
    const forged = {
      id: 'forged-bump',
      householdId: 'household-test',
      choreId: 'overdue-1',
      senderMemberId: VIEWER_MEMBER_ID,
      recipientMemberId: OTHER_MEMBER_ID,
      sentAt: FIXED_NOW,
      sentOnDate: '2026-06-15',
      dailySequence: 6,
      messageType: 'gentle_nudge',
      createdAt: FIXED_NOW,
    }

    await expect(ctx.tx.mutate.bumpEvent.insert(forged as any)).rejects.toThrow(
      ConstraintViolation
    )

    // and re-using a sequence number already spent collides on the unique index
    await expect(
      ctx.tx.mutate.bumpEvent.insert({ ...forged, dailySequence: 3 } as any)
    ).rejects.toThrow(ConstraintViolation)
  })

  it('does not modify chore state on a rejected bump', async () => {
    const board = createBoardDriver(buildMixedRows())

    for (let i = 0; i < 5; i++) {
      await board.sendBump('overdue-1')
    }

    const before = { ...(board.rows.find((r) => r.id === 'overdue-1') as any) }
    await board.sendBump('overdue-1')
    const after = board.rows.find((r) => r.id === 'overdue-1')

    expect(after).toEqual(before)
  })

  it('counts bumps globally across chores, not per chore', async () => {
    const board = createBoardDriver(buildMixedRows())

    await board.sendBump('overdue-1')
    await board.sendBump('due-1')
    await board.sendBump('upcoming-1')

    expect(board.bumpCount).toBe(3)
  })

  it('refuses to bump a chore assigned to the viewer', async () => {
    const board = createBoardDriver([
      buildOverdueRow({ id: 'mine', assigneeMemberId: VIEWER_MEMBER_ID }),
    ])

    expect(await board.sendBump('mine')).toBe(false)
    expect(board.chores[0]?.bumpBlockedReason).toBe('self')
    expect(board.bumpCount).toBe(0)
  })

  it('refuses to bump an archived chore', async () => {
    const board = createBoardDriver(buildMixedRows())
    await board.archiveChore('overdue-1')

    expect(await board.sendBump('overdue-1')).toBe(false)
    expect(board.chores.find((c) => c.id === 'overdue-1')?.bumpBlockedReason).toBe(
      'archived'
    )
  })

  it('explains the block once the daily limit is reached', async () => {
    const board = createBoardDriver(buildMixedRows())

    for (let i = 0; i < 5; i++) {
      await board.sendBump('overdue-1')
    }

    expect(board.chores.find((c) => c.id === 'due-1')?.bumpBlockedReason).toBe(
      'daily-limit'
    )
  })
})
