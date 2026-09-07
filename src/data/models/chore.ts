import { json, number, string, table } from '@rocicorp/zero'
import { mutations } from 'on-zero'

import { validateChoreDraft } from '~/features/chorecue/choreRules'
import {
  advanceNextDueAt,
  firstDueAt,
  ruleToColumns,
  sameRule,
  toRule,
} from '~/features/chorecue/recurrence'

import { inCallerHousehold } from '../where/household'
import {
  loadHouseholdMember,
  loadOwnChore,
  requireActiveMember,
} from './helpers/requireActiveMember'
import { trustedNow } from './helpers/trustedNow'

import type { TableInsertRow } from 'on-zero'
import type { RecurrenceRule } from '~/features/chorecue/recurrence'

export type Chore = TableInsertRow<typeof schema>

export const schema = table('chore')
  .columns({
    id: string(),
    householdId: string(),
    title: string(),
    description: string().optional(),
    tags: json<string[]>(),
    assigneeMemberId: string(),
    createdByMemberId: string(),
    status: string(),
    recurrenceRuleType: string(),
    recurrenceIntervalDays: number().optional(),
    recurrenceDayOfWeek: number().optional(),
    recurrenceTimeMinutes: number(),
    timezone: string(),
    nextDueAt: number(),
    lastCompletedAt: number().optional(),
    lastCompletedByMemberId: string().optional(),
    lastBumpedAt: number().optional(),
    archivedAt: number().optional(),
    photoLabel: string().optional(),
    createdAt: number(),
    updatedAt: number(),
  })
  .primaryKey('id')

export const permissions = inCallerHousehold

export interface ChoreCreateInput {
  choreId: string
  title: string
  tags: string[]
  assigneeMemberId: string
  rule: RecurrenceRule
  description?: string | null
  photoLabel?: string | null
  now: number
}

export interface ChoreEditInput {
  choreId: string
  title: string
  tags: string[]
  assigneeMemberId: string
  rule: RecurrenceRule
  description?: string | null
  photoLabel?: string | null
  now: number
}

export interface ChoreCompleteInput {
  choreId: string
  /** compare-and-swap token: the `nextDueAt` the caller believed it was completing */
  expectedDueAt: number
  now: number
}

export interface ChoreArchiveInput {
  choreId: string
  now: number
}

/**
 * every write is a named intent.
 *
 * generic CRUD is closed off: an open `update(Partial<Chore>)` would let a client
 * set `nextDueAt`/`lastCompletedAt` to anything it liked and skip the schedule
 * entirely, and an open `insert` would let it forge `householdId`.
 */
export const mutate = mutations(schema, permissions, {
  insert: async () => {
    throw new Error('Use chore.create')
  },
  upsert: async () => {
    throw new Error('Use chore.create')
  },
  update: async () => {
    throw new Error('Use chore.edit, chore.complete or chore.archive')
  },
  delete: async () => {
    throw new Error('Chores are archived, never deleted')
  },

  async create(ctx, input: ChoreCreateInput) {
    const now = trustedNow(ctx, input.now)
    const member = await requireActiveMember(ctx)
    const draft = validateChoreDraft(input)

    const assignee = await loadHouseholdMember(
      ctx,
      draft.assigneeMemberId,
      member.householdId
    )
    if (!assignee || assignee.status !== 'active') {
      throw new Error('Assignee is not an active member of this household')
    }

    await ctx.tx.mutate.chore.insert({
      id: input.choreId,
      // derived from the caller's membership, never read from the payload
      householdId: member.householdId,
      createdByMemberId: member.id,
      title: draft.title,
      description: draft.description,
      tags: draft.tags,
      photoLabel: draft.photoLabel,
      assigneeMemberId: draft.assigneeMemberId,
      status: 'active',
      ...ruleToColumns(draft.rule),
      nextDueAt: firstDueAt(draft.rule, now),
      lastCompletedAt: null,
      lastCompletedByMemberId: null,
      lastBumpedAt: null,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    })
  },

  async edit(ctx, input: ChoreEditInput) {
    const now = trustedNow(ctx, input.now)
    const member = await requireActiveMember(ctx)
    const chore = await loadOwnChore(ctx, input.choreId, member.householdId)
    if (chore.status !== 'active') throw new Error('Cannot edit an archived chore')

    const draft = validateChoreDraft(input)

    const assignee = await loadHouseholdMember(
      ctx,
      draft.assigneeMemberId,
      member.householdId
    )
    if (!assignee || assignee.status !== 'active') {
      throw new Error('Assignee is not an active member of this household')
    }

    // a recurrence edit must not leave nextDueAt ambiguous: re-anchor to the
    // first occurrence after now — anchoring off an old lastCompletedAt would
    // back-date the chore into deep overdue the moment its rule changes
    const nextDueAt = sameRule(toRule(chore), draft.rule)
      ? chore.nextDueAt
      : firstDueAt(draft.rule, now)

    await ctx.tx.mutate.chore.update({
      id: chore.id,
      title: draft.title,
      description: draft.description,
      tags: draft.tags,
      photoLabel: draft.photoLabel,
      assigneeMemberId: draft.assigneeMemberId,
      ...ruleToColumns(draft.rule),
      nextDueAt,
      updatedAt: now,
    })
  },

  async complete(ctx, input: ChoreCompleteInput) {
    const now = trustedNow(ctx, input.now)
    const member = await requireActiveMember(ctx)
    const chore = await loadOwnChore(ctx, input.choreId, member.householdId)
    if (chore.status !== 'active') throw new Error('Cannot complete an archived chore')

    // compare-and-swap: a double-tap, a retry or a replayed push must not
    // advance the schedule twice
    if (chore.nextDueAt !== input.expectedDueAt) return

    const rule = toRule(chore)
    if (!rule) throw new Error('Chore has an invalid recurrence rule')

    await ctx.tx.mutate.chore.update({
      id: chore.id,
      lastCompletedAt: now,
      lastCompletedByMemberId: member.id,
      nextDueAt: advanceNextDueAt(rule, {
        previousDueAt: chore.nextDueAt,
        completedAt: now,
      }),
      updatedAt: now,
    })
  },

  async archive(ctx, input: ChoreArchiveInput) {
    const now = trustedNow(ctx, input.now)
    const member = await requireActiveMember(ctx)
    const chore = await loadOwnChore(ctx, input.choreId, member.householdId)
    if (chore.status === 'archived') return // idempotent

    await ctx.tx.mutate.chore.update({
      id: chore.id,
      status: 'archived',
      archivedAt: now,
      updatedAt: now,
    })
  },
})
