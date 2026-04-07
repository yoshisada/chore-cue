import { number, string, table } from '@rocicorp/zero'
import { mutations, serverWhere } from 'on-zero'

import type { TableInsertRow } from 'on-zero'

export type Household = TableInsertRow<typeof schema>

export const schema = table('household')
  .columns({
    id: string(),
    name: string(),
    createdAt: number(),
  })
  .primaryKey('id')

const permissions = serverWhere('household', (_, auth) => {
  return _.cmpLit(auth?.id || '', '!=', '')
})

export const mutate = mutations(schema, permissions, {
  update: async ({ authData, tx }, household: Partial<Household> & { id: string }) => {
    if (!authData) throw new Error('Unauthorized')
    await tx.mutate.household.update(household)
  },
})
