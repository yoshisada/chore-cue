import { number, string, table } from '@rocicorp/zero'
import { mutations, serverWhere } from 'on-zero'

import type { TableInsertRow } from 'on-zero'

export type HouseholdMember = TableInsertRow<typeof schema>

export const schema = table('householdMember')
  .columns({
    id: string(),
    householdId: string(),
    userId: string(),
    role: string(),
    displayName: string().optional(),
    joinedAt: number(),
  })
  .primaryKey('id')

const permissions = serverWhere('householdMember', (_, auth) => {
  return _.cmp('userId', auth?.id || '')
})

// memberships are created/removed server-side only (see householdActions), and
// householdId/userId/role are server-owned — clients may only edit their own displayName
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
  update: async ({ authData, tx }, member: Partial<HouseholdMember> & { id: string }) => {
    if (!authData) throw new Error('Unauthorized')
    await tx.mutate.householdMember.update(
      member.displayName === undefined
        ? { id: member.id }
        : { id: member.id, displayName: member.displayName }
    )
  },
})
