import sql from './0004_chore_domain.sql?raw'

import type { PoolClient } from 'pg'

export async function up(client: PoolClient) {
  await client.query(sql)
}
