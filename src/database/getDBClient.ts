import pg, { type Pool, type PoolClient } from 'pg'

export type GetDBClientOptions = {
  pool?: Pool
  connectionString?: string
  retries?: number
  onRetry?: (error: Error, attempt: number) => void
}

const cache = new Map<
  string,
  {
    pool: pg.Pool
    maxConnections: number | null
    reservedConnections: number | null
    openedConnections: number | null
    openedConnectionsLastUpdate: number | null
  }
>()

const createPoolKey = (connectionString: string) => connectionString

const getOrCreatePoolCache = (connectionString: string, config: pg.PoolConfig) => {
  const key = createPoolKey(connectionString)

  if (!cache.has(key)) {
    cache.set(key, {
      pool: new pg.Pool(config),
      maxConnections: null,
      reservedConnections: null,
      openedConnections: null,
      openedConnectionsLastUpdate: null,
    })
  }

  return cache.get(key)!
}

export async function getDBClient(options: GetDBClientOptions = {}): Promise<PoolClient> {
  const { pool, connectionString, retries = 8 } = options

  if (!pool && !connectionString) {
    throw new Error('Either pool or connectionString must be provided')
  }

  try {
    return await tryToGetNewClientFromPool(pool, connectionString, retries)
  } catch (error) {
    console.error(`Failed to get DB client:`, error)
    throw error
  }
}

async function tryToGetNewClientFromPool(
  providedPool: Pool | undefined,
  connectionString: string | undefined,
  retries: number
): Promise<PoolClient> {
  const { default: retry } = await import('async-retry')
  const clientFromPool = await retry(
    async () => {
      if (providedPool) {
        console.info(`Connecting to provided pool...`)
        const client = await providedPool.connect()
        console.info(`Connected to pool`)
        return client
      }

      if (!connectionString) {
        throw new Error('No connection string provided')
      }

      const configurations: pg.PoolConfig = {
        connectionString,
        connectionTimeoutMillis: 5_000,
        idleTimeoutMillis: 30_000,
        allowExitOnIdle: true,
      }

      const poolCache = getOrCreatePoolCache(connectionString, configurations)

      console.info(`Connecting to pool ${connectionString}...`)
      const client = await poolCache.pool.connect()
      console.info(`Connected to pool`)
      return client
    },
    {
      retries,
      minTimeout: 300,
      factor: 2,
      maxTimeout: 8000,
    }
  )

  return clientFromPool
}
