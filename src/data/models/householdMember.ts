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

export const mutate = mutations(schema, permissions)
