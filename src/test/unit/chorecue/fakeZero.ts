import { createZeroClient } from 'on-zero'

import { schema } from '~/data/schema'
import { toRule } from '~/features/chorecue/recurrence'

import type { MutatorContext } from 'on-zero'

/**
 * an in-memory stand-in for a Zero transaction.
 *
 * this exists so the board tests can invoke the REAL mutator bodies from
 * `~/data/models/chore` and `~/data/models/bumpEvent` — the same code the
 * client runs optimistically and the server runs authoritatively — instead of a
 * prototype reducer that only resembles them.
 *
 * it also enforces the constraints that carry real weight in the migration:
 * UNIQUE(sender, sentOnDate, dailySequence) and CHECK(dailySequence BETWEEN 1
 * AND 5), which together make a sixth same-day bump physically impossible, plus
 * the recurrence shape check and the archive-consistency check. a test that
 * forges a write past the mutator still hits the schema.
 */

// on-zero's `zql` proxy is only wired up once a client or server has been
// created; the models call it at mutation time, so it has to be initialized
// before any mutator body runs. no Zero instance is constructed by this.
createZeroClient({ schema, models: {}, groupedQueries: {} })

export type Row = Record<string, any>

export interface FakeZeroSeed {
  household?: Row[]
  householdMember?: Row[]
  chore?: Row[]
  bumpEvent?: Row[]
}

export class ConstraintViolation extends Error {
  constructor(constraint: string) {
    super(`constraint violated: ${constraint}`)
    this.name = 'ConstraintViolation'
  }
}

type Ast = {
  table: string
  where?: Condition
  limit?: number
}

type Condition =
  | { type: 'and' | 'or'; conditions: Condition[] }
  | {
      type: 'simple'
      left: { name: string }
      right: { value: unknown }
      op: string
    }
  | { type: string; [key: string]: unknown }

function matchesCondition(row: Row, condition: Condition | undefined): boolean {
  if (!condition) return true

  if (condition.type === 'and') {
    return (condition as any).conditions.every((c: Condition) => matchesCondition(row, c))
  }
  if (condition.type === 'or') {
    return (condition as any).conditions.some((c: Condition) => matchesCondition(row, c))
  }
  if (condition.type === 'simple') {
    const simple = condition as any
    const left = row[simple.left.name]
    const right = simple.right.value

    switch (simple.op) {
      case '=':
        return left === right
      case '!=':
        return left !== right
      case '<':
        return left < right
      case '<=':
        return left <= right
      case '>':
        return left > right
      case '>=':
        return left >= right
      case 'IN':
        return Array.isArray(right) && right.includes(left)
      default:
        throw new Error(`fakeZero: unsupported operator ${simple.op}`)
    }
  }

  throw new Error(`fakeZero: unsupported condition ${condition.type}`)
}

const MAX_TITLE_LENGTH = 120

function assertChoreConstraints(row: Row) {
  const title = String(row.title ?? '').trim()
  if (title.length < 1 || title.length > MAX_TITLE_LENGTH) {
    throw new ConstraintViolation('chore_title_len_chk')
  }
  const minutes = row.recurrenceTimeMinutes
  if (typeof minutes !== 'number' || minutes < 0 || minutes > 1439) {
    throw new ConstraintViolation('chore_time_minutes_chk')
  }
  if ((row.status === 'archived') !== (row.archivedAt != null)) {
    throw new ConstraintViolation('chore_archive_consistency_chk')
  }
  if (!toRule(row)) {
    throw new ConstraintViolation('chore_recurrence_shape_chk')
  }
}

function assertBumpConstraints(row: Row, existing: Row[]) {
  if (row.senderMemberId === row.recipientMemberId) {
    throw new ConstraintViolation('bumpEvent_no_self_chk')
  }
  if (
    typeof row.dailySequence !== 'number' ||
    row.dailySequence < 1 ||
    row.dailySequence > 5
  ) {
    throw new ConstraintViolation('bumpEvent_sequence_chk')
  }
  const collision = existing.some(
    (other) =>
      other.id !== row.id &&
      other.senderMemberId === row.senderMemberId &&
      other.sentOnDate === row.sentOnDate &&
      other.dailySequence === row.dailySequence
  )
  if (collision) {
    throw new ConstraintViolation('bumpEvent_sender_day_seq_uniq')
  }
}

const CONSTRAINTS: Record<string, (row: Row, existing: Row[]) => void> = {
  chore: assertChoreConstraints,
  bumpEvent: assertBumpConstraints,
}

export interface FakeZero {
  tables: Record<string, Row[]>
  rows(table: string): Row[]
  context(userId: string | null): MutatorContext
}

export function createFakeZero(seed: FakeZeroSeed = {}): FakeZero {
  const tables: Record<string, Row[]> = {
    household: [...(seed.household ?? [])],
    householdMember: [...(seed.householdMember ?? [])],
    chore: [...(seed.chore ?? [])].map((row) => ({ ...row })),
    bumpEvent: [...(seed.bumpEvent ?? [])].map((row) => ({ ...row })),
  }

  function table(name: string): Row[] {
    const rows = tables[name]
    if (!rows) throw new Error(`fakeZero: unknown table ${name}`)
    return rows
  }

  function check(name: string, row: Row) {
    CONSTRAINTS[name]?.(row, table(name))
  }

  async function run(query: any) {
    const ast: Ast = query.ast
    const rows = table(ast.table).filter((row) => matchesCondition(row, ast.where))
    const limited = ast.limit == null ? rows : rows.slice(0, ast.limit)

    return query.format?.singular ? (limited[0] ?? undefined) : limited
  }

  const mutate = new Proxy({} as Record<string, any>, {
    get(_target, name: string) {
      return {
        async insert(row: Row) {
          const next = { ...row }
          check(name, next)
          table(name).push(next)
        },
        async upsert(row: Row) {
          const rows = table(name)
          const index = rows.findIndex((existing) => existing.id === row.id)
          const next = index >= 0 ? { ...rows[index], ...row } : { ...row }
          check(name, next)
          if (index >= 0) rows[index] = next
          else rows.push(next)
        },
        async update(patch: Row) {
          const rows = table(name)
          const index = rows.findIndex((existing) => existing.id === patch.id)
          if (index < 0) throw new Error(`fakeZero: no ${name} row ${patch.id}`)
          const next = { ...rows[index], ...patch }
          check(name, next)
          rows[index] = next
        },
        async delete(patch: Row) {
          const rows = table(name)
          const index = rows.findIndex((existing) => existing.id === patch.id)
          if (index >= 0) rows.splice(index, 1)
        },
      }
    },
  })

  return {
    tables,
    rows: table,
    context(userId: string | null): MutatorContext {
      return {
        tx: { run, mutate } as unknown as MutatorContext['tx'],
        authData: userId ? { id: userId, role: undefined } : null,
        environment: 'client',
        can: async () => {},
      }
    },
  }
}
