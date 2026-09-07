import { scryptAsync } from '@noble/hashes/scrypt.js'
import { bytesToHex, randomBytes } from '@noble/hashes/utils.js'

import type { PoolClient } from 'pg'

const DEMO_ID = 'demo-user-id'
const DEMO_EMAIL = 'demo@takeout.tamagui.dev'
const DEMO_NAME = 'Demo User'
const DEMO_PASSWORD = 'demopassword123'

// this migration seeds a well-known, email-verified account with a public
// password that is also a household admin. it must never run unless a human
// explicitly opts in, so it is gated behind SEED_DEMO_USER=1 (opt-in, never
// opt-out: an unset variable in CI/staging/production seeds nothing).
const SEED_ENV_VAR = 'SEED_DEMO_USER'

// vite tries to eval process.env at build time, so read it through globalThis
// (same trick as src/database/migrate.ts)
const PROCESS_ENV = globalThis['process']['env']

function isDemoSeedEnabled(): boolean {
  return PROCESS_ENV[SEED_ENV_VAR] === '1'
}

// same params as better-auth
const scryptConfig = { N: 16384, r: 16, p: 1, dkLen: 64 }

async function hashPassword(password: string): Promise<string> {
  const salt = bytesToHex(randomBytes(16))
  const key = await scryptAsync(password.normalize('NFKC'), salt, {
    ...scryptConfig,
    maxmem: 128 * scryptConfig.N * scryptConfig.r * 2,
  })
  return `${salt}:${bytesToHex(key)}`
}

export async function up(client: PoolClient) {
  if (!isDemoSeedEnabled()) {
    console.info(`⏭️  skipping demo user seed (set ${SEED_ENV_VAR}=1 to enable)`)
    return
  }

  const passwordHash = await hashPassword(DEMO_PASSWORD)
  const now = new Date().toISOString()

  // insert demo user (skip if already exists by email)
  await client.query(
    `
    INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt", role)
    VALUES ($1, $2, $3, true, $4, $4, 'user')
    ON CONFLICT (email) DO NOTHING
    `,
    [DEMO_ID, DEMO_NAME, DEMO_EMAIL, now]
  )

  // insert account with password
  await client.query(
    `
    INSERT INTO account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
    VALUES ($1, $2, 'credential', $3, $4, $5, $5)
    ON CONFLICT (id) DO NOTHING
    `,
    [`${DEMO_ID}-account`, DEMO_ID, DEMO_ID, passwordHash, now]
  )

  // insert user public
  await client.query(
    `
    INSERT INTO "userPublic" (id, name, "joinedAt")
    VALUES ($1, $2, $3)
    ON CONFLICT (id) DO NOTHING
    `,
    [DEMO_ID, DEMO_NAME, now]
  )

  // insert user state
  await client.query(
    `
    INSERT INTO "userState" ("userId", "darkMode")
    VALUES ($1, false)
    ON CONFLICT ("userId") DO NOTHING
    `,
    [DEMO_ID]
  )

  // insert demo household (only if household table exists)
  // use SAVEPOINT so that a failure here doesn't poison the outer transaction
  const DEMO_HOUSEHOLD_ID = `household-${DEMO_ID.slice(0, 8)}`
  try {
    await client.query('SAVEPOINT household_insert')
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
    await client.query('RELEASE SAVEPOINT household_insert')
  } catch {
    // household tables may not exist yet if migration 0003 hasn't run
    await client.query('ROLLBACK TO SAVEPOINT household_insert')
  }

  console.info('demo user created:', DEMO_EMAIL)
}
