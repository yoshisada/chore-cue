import { number, string, table } from '@rocicorp/zero'
import { mutations, zql } from 'on-zero'

import {
  bumpEligibility,
  BumpRejected,
  isBumpMessageType,
} from '~/features/chorecue/choreRules'
import { localDateKey } from '~/features/chorecue/timezone'

import { inCallerHousehold } from '../where/household'
import { loadOwnChore, requireActiveMember } from './helpers/requireActiveMember'
import { trustedNow } from './helpers/trustedNow'

import type { TableInsertRow } from 'on-zero'
import type { BumpMessageType } from '~/features/chorecue/choreRules'

export type BumpEvent = TableInsertRow<typeof schema>

export const schema = table('bumpEvent')
  .columns({
    id: string(),
    householdId: string(),
    choreId: string(),
    senderMemberId: string(),
    recipientMemberId: string(),
    sentAt: number(),
    sentOnDate: string(),
    dailySequence: number(),
    messageType: string(),
    createdAt: number(),
  })
  .primaryKey('id')

export const permissions = inCallerHousehold

export interface BumpSendInput {
  bumpId: string
  choreId: string
  messageType: BumpMessageType
  now: number
}

/**
 * bump history is append-only.
 *
 * there is deliberately no update or delete path: if bumps could be deleted the
 * daily quota would reset for free. the quota itself is enforced twice — here by
 * `bumpEligibility`, and in the schema by UNIQUE(sender, day, sequence) plus
 * CHECK(sequence BETWEEN 1 AND 5), which no race can get past.
 */
export const mutate = mutations(schema, permissions, {
  insert: async () => {
    throw new Error('Use bumpEvent.send')
  },
  upsert: async () => {
    throw new Error('Use bumpEvent.send')
  },
  update: async () => {
    throw new Error('Bump history is append-only')
  },
  delete: async () => {
    throw new Error('Bump history is append-only')
  },

  async send(ctx, input: BumpSendInput) {
    // the quota bucket must come from the server clock — a client lying about
    // `now` would otherwise mint itself a fresh daily quota at will
    const now = trustedNow(ctx, input.now)
    if (!isBumpMessageType(input.messageType)) {
      throw new BumpRejected('invalid-template')
    }

    const sender = await requireActiveMember(ctx)
    const chore = await loadOwnChore(ctx, input.choreId, sender.householdId)

    const recipient = chore.assigneeMemberId
      ? await ctx.tx.run(zql.householdMember.where('id', chore.assigneeMemberId).one())
      : undefined

    const sentOnDate = localDateKey(now, sender.timezone)
    const usedToday = await ctx.tx.run(
      zql.bumpEvent.where('senderMemberId', sender.id).where('sentOnDate', sentOnDate)
    )

    // exactly the predicate the bump button runs — same module, so the
    // optimistic UI and the server authority cannot drift apart
    const verdict = bumpEligibility(
      {
        archived: chore.status === 'archived',
        assigneeMemberId: chore.assigneeMemberId,
        assigneeActive: recipient?.status === 'active',
      },
      { viewerMemberId: sender.id, bumpsUsedToday: usedToday.length }
    )
    if (!verdict.canBump) throw new BumpRejected(verdict.reason)

    await ctx.tx.mutate.bumpEvent.insert({
      id: input.bumpId,
      householdId: sender.householdId,
      choreId: chore.id,
      senderMemberId: sender.id,
      recipientMemberId: chore.assigneeMemberId,
      sentAt: now,
      sentOnDate,
      dailySequence: usedToday.length + 1,
      messageType: input.messageType,
      createdAt: now,
    })

    await ctx.tx.mutate.chore.update({
      id: chore.id,
      lastBumpedAt: now,
      updatedAt: now,
    })
  },
})
