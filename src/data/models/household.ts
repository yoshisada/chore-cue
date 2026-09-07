import { number, string, table } from '@rocicorp/zero'
import { mutations } from 'on-zero'

import { callerIsHouseholdAdmin } from '../where/household'

import type { TableInsertRow } from 'on-zero'

export type Household = TableInsertRow<typeof schema>

export const schema = table('household')
  .columns({
    id: string(),
    name: string(),
    createdAt: number(),
  })
  .primaryKey('id')

// households are created server-side (see householdActions) and are never
// deleted from the client. the only client-writable field is `name`, and only
// an admin of *that* household may change it — the permission is row-dependent,
// so a logged-in user cannot rename a household they do not belong to.
export const mutate = mutations(schema, callerIsHouseholdAdmin, {
  insert: async () => {
    throw new Error('Households can only be created on the server')
  },
  upsert: async () => {
    throw new Error('Households can only be created on the server')
  },
  delete: async () => {
    throw new Error('Households cannot be deleted')
  },
  update: async ({ authData, tx, can }, input: { id: string; name: string }) => {
    if (!authData) throw new Error('Unauthorized')

    // row-dependent check: caller must be an admin of THIS household
    await can(callerIsHouseholdAdmin, input.id)

    const name = typeof input.name === 'string' ? input.name.trim() : ''
    if (!name) throw new Error('Household name is required')

    // field allowlist: only `name` is forwarded, never the caller's whole payload
    await tx.mutate.household.update({ id: input.id, name })
  },
})
