import { and, eq } from 'drizzle-orm'

import { getDb } from '~/database'
import { household, householdMember } from '~/database/schema-public'
import { normalizeHouseholdName, normalizeTitle } from '~/features/chorecue/choreRules'

import { choreActions } from './choreActions'

import type { AuthData } from '~/features/auth/types'
import type { MemberRole } from '~/features/members/types'

function generateHouseholdId(userId: string): string {
  // the full user id: a truncated prefix collides across users, and the
  // conflict-tolerant insert below would then silently admit the second
  // user into the first user's household as an admin
  return `household-${userId}`
}

export const householdActions = {
  ensureHouseholdForUser,
  renameHousehold,
  addLocalMember,
  deactivateMember,
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

  // the seed hook must sit after the id is resolved on BOTH branches: a
  // household created before this feature existed would otherwise never be
  // seeded, and would open on a permanently empty board.
  const membership = existing[0] ?? (await createHouseholdAndMembership(userId))

  await choreActions.seedStarterChores(authData, {
    householdId: membership.householdId,
    memberId: membership.id,
    timezone: 'timezone' in membership ? (membership.timezone ?? 'UTC') : 'UTC',
  })

  return membership
}

async function createHouseholdAndMembership(userId: string) {
  const db = getDb()
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
    status: 'active' as const,
    timezone: 'UTC',
    joinedAt: now,
  }

  await db.insert(householdMember).values(membership).onConflictDoNothing()

  return membership
}

async function requireHouseholdAdmin(authData: AuthData, householdId: string) {
  if (!authData) throw new Error('Unauthorized')

  const db = getDb()
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

  const caller = membership[0]
  if (!caller || caller.role !== 'admin' || caller.status !== 'active') {
    throw new Error('Only household admins can do that')
  }

  return caller
}

async function renameHousehold(authData: AuthData, householdId: string, name: string) {
  await requireHouseholdAdmin(authData, householdId)

  const trimmed = normalizeHouseholdName(name)
  if (!trimmed) throw new Error('Household name is required')

  await getDb()
    .update(household)
    .set({ name: trimmed })
    .where(eq(household.id, householdId))
}

export interface AddLocalMemberInput {
  householdId: string
  displayName: string
  role?: MemberRole
}

/**
 * adds a "local member": a person in the household with no login.
 *
 * this is what makes the bump feature reachable on day one — every signup gets a
 * household of exactly one, so without local members "assign to someone else",
 * "no self-bump" and the 5/day quota are all unexercisable.
 */
async function addLocalMember(authData: AuthData, input: AddLocalMemberInput) {
  await requireHouseholdAdmin(authData, input.householdId)

  const displayName = normalizeTitle(input.displayName)
  if (!displayName) throw new Error('A member name is required')

  const db = getDb()

  const roster = await db
    .select()
    .from(householdMember)
    .where(eq(householdMember.householdId, input.householdId))

  const duplicate = roster.some(
    (member) => (member.displayName ?? '').toLowerCase() === displayName.toLowerCase()
  )
  if (duplicate) throw new Error('That name is already taken in this household')

  const member = {
    id: crypto.randomUUID(),
    householdId: input.householdId,
    // NULL: an accepted invite later fills this in on this same row, and every
    // chore already assigned to it carries over untouched
    userId: null,
    role: input.role === 'admin' ? ('admin' as const) : ('member' as const),
    status: 'active' as const,
    timezone: 'UTC',
    displayName,
    joinedAt: new Date().toISOString(),
  }

  await db.insert(householdMember).values(member)

  return member
}

export interface DeactivateMemberInput {
  memberId: string
}

/**
 * deactivates a member. NEVER deletes: `chore.assigneeMemberId` holds
 * ON DELETE RESTRICT, so a delete would either fail or orphan history.
 */
async function deactivateMember(authData: AuthData, input: DeactivateMemberInput) {
  if (!authData) throw new Error('Unauthorized')

  const db = getDb()

  const found = await db
    .select()
    .from(householdMember)
    .where(eq(householdMember.id, input.memberId))
    .limit(1)

  const target = found[0]
  if (!target) throw new Error('Member not found')

  await requireHouseholdAdmin(authData, target.householdId)

  if (target.status === 'inactive') return target

  if (target.role === 'admin') {
    const roster = await db
      .select()
      .from(householdMember)
      .where(eq(householdMember.householdId, target.householdId))

    const activeAdmins = roster.filter(
      (member) => member.role === 'admin' && member.status === 'active'
    )
    if (activeAdmins.length <= 1) {
      throw new Error('A household must keep at least one active admin')
    }
  }

  await db
    .update(householdMember)
    .set({ status: 'inactive' })
    .where(eq(householdMember.id, input.memberId))

  return { ...target, status: 'inactive' as const }
}
