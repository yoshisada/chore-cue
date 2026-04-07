import { and, eq } from 'drizzle-orm'

import { getDb } from '~/database'
import { household, householdMember } from '~/database/schema-public'

import type { AuthData } from '~/features/auth/types'

function generateHouseholdId(userId: string): string {
  return `household-${userId.slice(0, 8)}`
}

export const householdActions = {
  ensureHouseholdForUser,
  renameHousehold,
}

async function ensureHouseholdForUser(authData: AuthData, userId: string) {
  if (!authData) return null

  const db = getDb()

  // Check if membership already exists
  const existing = await db
    .select()
    .from(householdMember)
    .where(eq(householdMember.userId, userId))
    .limit(1)

  if (existing.length > 0) {
    return existing[0]
  }

  const householdId = generateHouseholdId(userId)
  const now = new Date().toISOString()

  // Create household row if it doesn't exist
  await db
    .insert(household)
    .values({
      id: householdId,
      name: 'My Household',
      createdAt: now,
    })
    .onConflictDoNothing()

  // Create membership
  const membershipId = `${householdId}-${userId}`
  const membership = {
    id: membershipId,
    householdId,
    userId,
    role: 'admin' as const,
    joinedAt: now,
  }

  await db.insert(householdMember).values(membership).onConflictDoNothing()

  return membership
}

async function renameHousehold(authData: AuthData, householdId: string, name: string) {
  if (!authData) throw new Error('Unauthorized')

  const db = getDb()

  // Verify caller is an admin of this household
  const membership = await db
    .select()
    .from(householdMember)
    .where(
      and(
        eq(householdMember.householdId, householdId),
        eq(householdMember.userId, authData.id)
      )
    )
    .limit(1)

  if (membership.length === 0 || membership[0].role !== 'admin') {
    throw new Error('Only household admins can rename the household')
  }

  await db
    .update(household)
    .set({ name: name.trim() })
    .where(eq(household.id, householdId))
}
