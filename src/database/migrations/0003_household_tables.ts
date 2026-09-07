import sql from './0003_household_tables.sql?raw'

import type { PoolClient } from 'pg'

const DEMO_ID = 'demo-user-id'

export async function up(client: PoolClient) {
  await client.query(sql)

  // Seed demo user's household (demo user is created in 0002 before these tables exist)
  const DEMO_HOUSEHOLD_ID = `household-${DEMO_ID.slice(0, 8)}`
  const now = new Date().toISOString()

  await client.query(
    `
    INSERT INTO "household" (id, name, "createdAt")
    VALUES ($1, $2, $3)
    ON CONFLICT (id) DO NOTHING
    `,
    [DEMO_HOUSEHOLD_ID, 'My Household', now]
  )

  await client.query(
    `
    INSERT INTO "householdMember" (id, "householdId", "userId", role, "joinedAt")
    VALUES ($1, $2, $3, 'admin', $4)
    ON CONFLICT (id) DO NOTHING
    `,
    [`${DEMO_HOUSEHOLD_ID}-${DEMO_ID}`, DEMO_HOUSEHOLD_ID, DEMO_ID, now]
  )
}
