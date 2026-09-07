import { zql } from 'on-zero'

import type { MutatorContext } from 'on-zero'

/**
 * the shared preamble for every household-scoped mutator.
 *
 * identity is always DERIVED here, never accepted from the client: householdId,
 * createdByMemberId, lastCompletedByMemberId and senderMemberId all come from
 * this lookup. client payloads may only carry ids of rows they are pointing at,
 * and each of those is re-validated against the caller's household.
 */
export async function requireActiveMember(ctx: MutatorContext) {
  const userId = ctx.authData?.id
  if (!userId) throw new Error('Unauthorized')

  const member = await ctx.tx.run(
    zql.householdMember.where('userId', userId).where('status', 'active').one()
  )
  if (!member) throw new Error('No active household membership')

  return member
}

/**
 * loads a chore the caller's household owns.
 *
 * "doesn't exist" and "isn't yours" deliberately share one message, so the
 * mutator is not a cross-household existence oracle.
 */
export async function loadOwnChore(
  ctx: MutatorContext,
  choreId: string,
  householdId: string
) {
  const chore = await ctx.tx.run(zql.chore.where('id', choreId).one())
  if (!chore || chore.householdId !== householdId) {
    throw new Error('Chore not found')
  }
  return chore
}

/** loads a member of the caller's household, or null */
export async function loadHouseholdMember(
  ctx: MutatorContext,
  memberId: string,
  householdId: string
) {
  const member = await ctx.tx.run(zql.householdMember.where('id', memberId).one())
  if (!member || member.householdId !== householdId) return null
  return member
}
