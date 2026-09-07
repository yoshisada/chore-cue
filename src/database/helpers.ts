import { database } from './database'
import { getDBClient, type GetDBClientOptions } from './getDBClient'

import type { Pool, QueryResult } from 'pg'

const ellipsis = (str: string, maxLength: number): string => {
  const shortened = str.length > 500 ? str.slice(0, 500) : str
  const cleaned = shortened.replace(/\s+/g, ' ').trim()
  if (cleaned.length > maxLength) {
    return cleaned.substring(0, maxLength - 3) + '...'
  }
  return cleaned
}

const createSql = (pool: Pool) => {
  return (strings: TemplateStringsArray, ...values: any[]): Promise<QueryResult<any>> => {
    const text = strings.reduce((result, str, i) => {
      return result + str + (i < values.length ? `$${i + 1}` : '')
    }, '')

    console.info(`sql: ${ellipsis(text, 80)}`)

    return pool.query(text.trim(), values)
  }
}

export const sql = createSql(database)

export { getDBClient }

export const getDBClientFromPool = (
  options?: Omit<GetDBClientOptions, 'pool' | 'connectionString'>
) => getDBClient({ pool: database, ...options })
