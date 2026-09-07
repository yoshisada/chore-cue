// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

import { renderBoard } from './boardHarness'
import { ConstraintViolation } from './fakeZero'
import {
  buildMixedRows,
  buildOverdueRow,
  FIXED_NOW,
  OTHER_MEMBER_ID,
  VIEWER_MEMBER_ID,
  VIEWER_USER_ID,
} from './fixtures'

vi.mock('~/zero/client', async () => (await import('./zeroMock')).zeroClientMock())
vi.mock('~/features/auth/client/useHouseholdContext', async () =>
  (await import('./zeroMock')).householdContextMock()
)

describe('useChoreBoard – bump quota and eligibility', () => {
  it('starts a fresh board with no bumps spent', () => {
    const { board } = renderBoard({ chores: buildMixedRows() })

    expect(board().bumpCount).toBe(0)
  })

  it('accepts the first bump and records a bump event', async () => {
    const board = renderBoard({ chores: buildMixedRows() })
    const accepted = await board.sendBump('overdue-1')

    expect(accepted.ok).toBe(true)
    expect(board.board().bumpCount).toBe(1)

    const [bump] = board.bumps()
    expect(bump).toMatchObject({
      choreId: 'overdue-1',
      senderMemberId: VIEWER_MEMBER_ID,
      recipientMemberId: OTHER_MEMBER_ID,
      dailySequence: 1,
      messageType: 'gentle_nudge',
    })
  })

  it('stamps lastBumpedAt on the bumped chore', async () => {
    const board = renderBoard({ chores: buildMixedRows() })
    await board.sendBump('overdue-1')

    expect(board.row('overdue-1')?.lastBumpedAt).toBe(FIXED_NOW)
  })

  it('accepts bumps 1 through 5, numbering them in sequence', async () => {
    const board = renderBoard({ chores: buildMixedRows() })

    for (let i = 0; i < 5; i++) {
      expect((await board.sendBump('overdue-1')).ok).toBe(true)
    }

    expect(board.board().bumpCount).toBe(5)
    expect(board.bumps().map((bump) => bump.dailySequence)).toEqual([1, 2, 3, 4, 5])
  })

  it('rejects the sixth bump of the day without reaching the mutator', async () => {
    const board = renderBoard({ chores: buildMixedRows() })

    for (let i = 0; i < 5; i++) {
      await board.sendBump('overdue-1')
    }

    const rejected = await board.sendBump('overdue-1')
    expect(rejected).toEqual({ ok: false, reason: 'Daily bump limit reached' })
    expect(board.board().bumpCount).toBe(5)
    expect(board.zero.mutate.bumpEvent.send).toHaveBeenCalledTimes(5)
  })

  it('makes a forged sixth bump impossible at the schema level', async () => {
    const board = renderBoard({ chores: buildMixedRows() })

    for (let i = 0; i < 5; i++) {
      await board.sendBump('overdue-1')
    }

    // the mutator is not the only line of defence: CHECK(dailySequence 1..5)
    // plus UNIQUE(sender, sentOnDate, dailySequence) mean a client that forged
    // its way past `bumpEligibility` still cannot land a row
    const ctx = board.store.context(VIEWER_USER_ID)
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

    await expect(ctx.tx.mutate.bumpEvent.insert(forged as never)).rejects.toThrow(
      ConstraintViolation
    )

    // and re-using a sequence number already spent collides on the unique index
    await expect(
      ctx.tx.mutate.bumpEvent.insert({ ...forged, dailySequence: 3 } as never)
    ).rejects.toThrow(ConstraintViolation)
  })

  it('does not modify chore state on a rejected bump', async () => {
    const board = renderBoard({ chores: buildMixedRows() })

    for (let i = 0; i < 5; i++) {
      await board.sendBump('overdue-1')
    }

    const before = { ...board.row('overdue-1') }
    await board.sendBump('overdue-1')

    expect(board.row('overdue-1')).toEqual(before)
  })

  it('counts bumps globally across chores, not per chore', async () => {
    const board = renderBoard({ chores: buildMixedRows() })

    await board.sendBump('overdue-1')
    await board.sendBump('due-1')
    await board.sendBump('upcoming-1')

    expect(board.board().bumpCount).toBe(3)
  })

  it('counts the bumps already synced for today, so the quota survives a reload', () => {
    const board = renderBoard({
      chores: buildMixedRows(),
      bumps: [1, 2, 3].map((dailySequence) => ({
        id: `bump-${dailySequence}`,
        householdId: 'household-test',
        choreId: 'overdue-1',
        senderMemberId: VIEWER_MEMBER_ID,
        recipientMemberId: OTHER_MEMBER_ID,
        sentAt: FIXED_NOW,
        sentOnDate: '2026-06-15',
        dailySequence,
        messageType: 'gentle_nudge',
        createdAt: FIXED_NOW,
      })),
    })

    expect(board.board().bumpCount).toBe(3)
  })

  it('refuses to bump a chore assigned to the viewer', async () => {
    const board = renderBoard({
      chores: [buildOverdueRow({ id: 'mine', assigneeMemberId: VIEWER_MEMBER_ID })],
    })

    expect(await board.sendBump('mine')).toEqual({
      ok: false,
      reason: "You can't bump your own chore",
    })
    expect(board.card('mine')?.bumpBlockedReason).toBe('self')
    expect(board.board().bumpCount).toBe(0)
    expect(board.zero.mutate.bumpEvent.send).not.toHaveBeenCalled()
  })

  it('refuses to bump a chore that has left the board', async () => {
    const board = renderBoard({ chores: buildMixedRows() })
    await board.archiveChore('overdue-1')

    expect(board.card('overdue-1')).toBeUndefined()
    const rejected = await board.sendBump('overdue-1')
    expect(rejected).toEqual({ ok: false, reason: 'Chore not found' })
    expect(board.zero.mutate.bumpEvent.send).not.toHaveBeenCalled()
  })

  it('explains the block once the daily limit is reached', async () => {
    const board = renderBoard({ chores: buildMixedRows() })

    for (let i = 0; i < 5; i++) {
      await board.sendBump('overdue-1')
    }

    expect(board.card('due-1')?.bumpBlockedReason).toBe('daily-limit')
  })
})
