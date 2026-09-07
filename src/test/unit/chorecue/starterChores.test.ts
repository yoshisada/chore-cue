import { describe, expect, it } from 'vitest'

import { isValidRule } from '~/features/chorecue/recurrence'
import { buildStarterChores, starterChoreId } from '~/features/chorecue/starterChores'
import { DAY_MS } from '~/features/chorecue/timezone'

const NOW = Date.parse('2026-06-15T09:00:00Z')

const input = { householdId: 'household-abc12345', memberId: 'member-1', now: NOW }

describe('buildStarterChores', () => {
  it('seeds one chore per recurrence type', () => {
    const chores = buildStarterChores(input)

    expect(chores).toHaveLength(3)
    expect(chores.map((chore) => chore.rule.type)).toEqual([
      'interval_days',
      'daily_time',
      'weekly_day',
    ])
    for (const chore of chores) {
      expect(isValidRule(chore.rule)).toBe(true)
    }
  })

  it('lands one chore in each due bucket', () => {
    const dueAts = buildStarterChores(input).map((chore) => chore.nextDueAt - NOW)

    expect(dueAts[0]).toBeLessThan(0)
    expect(dueAts[1]).toBeGreaterThan(0)
    expect(dueAts[1]).toBeLessThanOrEqual(DAY_MS)
    expect(dueAts[2]).toBeGreaterThan(DAY_MS)
  })

  it('uses deterministic ids so re-seeding is a no-op', () => {
    const first = buildStarterChores(input)
    const second = buildStarterChores({ ...input, now: NOW + 5_000 })

    expect(first.map((chore) => chore.id)).toEqual(second.map((chore) => chore.id))
    expect(first.map((chore) => chore.id)).toEqual([
      starterChoreId(input.householdId, 1),
      starterChoreId(input.householdId, 2),
      starterChoreId(input.householdId, 3),
    ])
  })

  it('assigns every chore to the founding member', () => {
    for (const chore of buildStarterChores(input)) {
      expect(chore.assigneeMemberId).toBe('member-1')
      expect(chore.createdByMemberId).toBe('member-1')
      expect(chore.householdId).toBe('household-abc12345')
      expect(chore.tags.length).toBeGreaterThan(0)
    }
  })

  it('keeps the weekly chore upcoming even when seeded on its own weekday', () => {
    // 2026-06-19 is the friday the weekly starter targets
    const onFriday = Date.parse('2026-06-19T09:00:00Z')
    const weeklyStarter = buildStarterChores({ ...input, now: onFriday }).find(
      (chore) => chore.rule.type === 'weekly_day'
    )

    expect(weeklyStarter).toBeDefined()
    expect((weeklyStarter?.nextDueAt ?? 0) - onFriday).toBeGreaterThan(DAY_MS)
  })
})
