import type { PoolClient } from 'pg'

/**
 * removes the demo account that migration 0002 used to seed unconditionally.
 *
 * gating 0002 only stops *future* runs — the ledger already records
 * `0002_demo_user`, so it will never run again, and any database that has
 * already applied it still holds a known-password, email-verified account. this
 * migration deletes those rows unless the operator has explicitly opted back in.
 */

const DEMO_ID = 'demo-user-id'
const DEMO_EMAIL = 'demo@takeout.tamagui.dev'
const DEMO_HOUSEHOLD_ID = `household-${DEMO_ID.slice(0, 8)}`

const SEED_ENV_VAR = 'SEED_DEMO_USER'

// vite tries to eval process.env at build time, so read it through globalThis
// (same trick as src/database/migrate.ts)
const PROCESS_ENV = globalThis['process']['env']

// delete order respects ON DELETE RESTRICT: bumps -> chores -> members -> household
const CLEANUP_STATEMENTS: { sql: string; params: unknown[] }[] = [
  {
    sql: `DELETE FROM "bumpEvent" WHERE "householdId" = $1`,
    params: [DEMO_HOUSEHOLD_ID],
  },
  { sql: `DELETE FROM "chore" WHERE "householdId" = $1`, params: [DEMO_HOUSEHOLD_ID] },
  {
    sql: `DELETE FROM "householdMember" WHERE "householdId" = $1 OR "userId" = $2`,
    params: [DEMO_HOUSEHOLD_ID, DEMO_ID],
  },
  { sql: `DELETE FROM "household" WHERE id = $1`, params: [DEMO_HOUSEHOLD_ID] },
  { sql: `DELETE FROM "userState" WHERE "userId" = $1`, params: [DEMO_ID] },
  { sql: `DELETE FROM "userPublic" WHERE id = $1`, params: [DEMO_ID] },
  { sql: `DELETE FROM "session" WHERE "userId" = $1`, params: [DEMO_ID] },
  { sql: `DELETE FROM "account" WHERE "userId" = $1`, params: [DEMO_ID] },
  {
    sql: `DELETE FROM "user" WHERE id = $1 OR email = $2`,
    params: [DEMO_ID, DEMO_EMAIL],
  },
]

export async function up(client: PoolClient) {
  if (PROCESS_ENV[SEED_ENV_VAR] === '1') {
    console.info(`⏭️  keeping demo user (${SEED_ENV_VAR}=1)`)
    return
  }

  // the runner wraps every migration in one BEGIN…COMMIT, so a failure here
  // would roll back the entire batch. a savepoint keeps the blast radius local.
  for (const statement of CLEANUP_STATEMENTS) {
    try {
      await client.query('SAVEPOINT demo_cleanup')
      await client.query(statement.sql, statement.params)
      await client.query('RELEASE SAVEPOINT demo_cleanup')
    } catch {
      // a table may not exist in every deployment — skip and continue
      await client.query('ROLLBACK TO SAVEPOINT demo_cleanup')
      await client.query('RELEASE SAVEPOINT demo_cleanup')
    }
  }

  console.info('🧹 demo user removed (set SEED_DEMO_USER=1 to keep it)')
}
