import { number, string, table } from '@rocicorp/zero'
import { mutations, zql } from 'on-zero'

import { inCallerHousehold } from '../where/household'

import type { TableInsertRow } from 'on-zero'

export type HouseholdMember = TableInsertRow<typeof schema>

export const schema = table('householdMember')
  .columns({
    id: string(),
    householdId: string(),
    // NULL for a "local member" — someone in the household with no login yet
    userId: string().optional(),
    role: string(),
    status: string(),
    timezone: string(),
    displayName: string().optional(),
    joinedAt: number(),
  })
  .primaryKey('id')

// the whole household can see its own roster; nobody else can see any of it.
// (the previous `userId = auth.id` rule made a roster literally impossible.)
export const permissions = inCallerHousehold

// memberships are created/removed server-side only (see householdActions), and
// householdId/userId/role/status are server-owned — clients may only edit a
// displayName, and only their own unless they are an admin of the household
export const mutate = mutations(schema, permissions, {
  insert: async () => {
    throw new Error('Household memberships can only be created on the server')
  },
  upsert: async () => {
    throw new Error('Household memberships can only be created on the server')
  },
  delete: async () => {
    throw new Error('Household memberships can only be removed on the server')
  },
  update: async (ctx, member: Partial<HouseholdMember> & { id: string }) => {
    if (!ctx.authData?.id) throw new Error('Unauthorized')
    if (member.displayName === undefined) return

    const target = await ctx.tx.run(zql.householdMember.where('id', member.id).one())
    if (!target) throw new Error('Member not found')

    if (target.userId !== ctx.authData.id) {
      // editing someone else's row requires being an admin of their household
      const caller = await ctx.tx.run(
        zql.householdMember
          .where('householdId', target.householdId)
          .where('userId', ctx.authData.id)
          .where('status', 'active')
          .one()
      )
      if (!caller || caller.role !== 'admin') {
        throw new Error('Only household admins can rename another member')
      }
    }

    // field allowlist: displayName only, never the caller's whole payload
    await ctx.tx.mutate.householdMember.update({
      id: member.id,
      displayName: member.displayName,
    })
  },
})
