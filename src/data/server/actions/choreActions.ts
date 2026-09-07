import { eq } from 'drizzle-orm'

import { getDb } from '~/database'
import { chore } from '~/database/schema-public'
import { ruleToColumns } from '~/features/chorecue/recurrence'
import { buildStarterChores } from '~/features/chorecue/starterChores'

import type { AuthData } from '~/features/auth/types'

export const choreActions = {
  seedStarterChores,
}

export interface SeedStarterChoresInput {
  householdId: string
  memberId: string
  timezone?: string
  now?: number
}

/**
 * gives a brand-new household three example chores — one per recurrence type,
 * one per due bucket — so the loop is demonstrable instead of landing on an
 * empty board.
 *
 * this deliberately is NOT a migration: migrations run once per database, but
 * households are created per signup, so a migration has no household to seed and
 * no valid assigneeMemberId to point at.
 *
 * idempotent twice over: an existence probe, plus deterministic ids with
 * onConflictDoNothing.
 */
async function seedStarterChores(authData: AuthData, input: SeedStarterChoresInput) {
  if (!authData) return { seeded: 0 }
  if (!input?.householdId || !input?.memberId) return { seeded: 0 }

  const db = getDb()

  const existing = await db
    .select({ id: chore.id })
    .from(chore)
    .where(eq(chore.householdId, input.householdId))
    .limit(1)

  if (existing.length > 0) return { seeded: 0 }

  const now = input.now ?? Date.now()
  const starters = buildStarterChores({
    householdId: input.householdId,
    memberId: input.memberId,
    timezone: input.timezone,
    now,
  })

  const nowIso = new Date(now).toISOString()

  await db
    .insert(chore)
    .values(
      starters.map((starter) => ({
        id: starter.id,
        householdId: starter.householdId,
        title: starter.title,
        tags: starter.tags,
        assigneeMemberId: starter.assigneeMemberId,
        createdByMemberId: starter.createdByMemberId,
        status: 'active' as const,
        ...ruleToColumns(starter.rule),
        nextDueAt: new Date(starter.nextDueAt).toISOString(),
        createdAt: nowIso,
        updatedAt: nowIso,
      }))
    )
    .onConflictDoNothing()

  return { seeded: starters.length }
}
