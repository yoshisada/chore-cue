import { mutate as bumpMutators } from '~/data/models/bumpEvent'
import { mutate as choreMutators } from '~/data/models/chore'
import {
  beginEditForBoard,
  buildChoreDraft,
  buildChoreEdit,
  createSections,
  emptyComposer,
  emptyEditorState,
  resetEditorIfEditing,
} from '~/features/chorecue/boardState'
import { toChoreCard } from '~/features/chorecue/choreMapping'
import { bumpEligibility } from '~/features/chorecue/choreRules'
import { localDateKey } from '~/features/chorecue/timezone'
import { findMemberIdByName, toMemberList } from '~/features/members/memberState'

import { createFakeZero } from './fakeZero'
import {
  buildMemberRows,
  FIXED_NOW,
  householdRow,
  VIEWER_MEMBER_ID,
  VIEWER_USER_ID,
} from './fixtures'

import type { FakeZero } from './fakeZero'
import type { ChoreRow } from '~/features/chorecue/choreMapping'
import type {
  ChoreCard,
  ChoreComposerState,
  ChoreEditorState,
} from '~/features/chorecue/types'

/**
 * `useChoreBoard` as a plain object, so the board's behaviour can be asserted
 * without React rendering infrastructure.
 *
 * every write goes through the REAL `chore.*` / `bumpEvent.send` mutator bodies
 * against `fakeZero`, which also enforces the schema constraints. these are no
 * longer tests of a prototype reducer: they exercise the production write path,
 * quota constraint and compare-and-swap included.
 */

export interface BoardDriverOptions {
  now?: number
  userId?: string | null
  viewerMemberId?: string
  timezone?: string
}

export interface BoardDriver {
  readonly store: FakeZero
  readonly rows: ChoreRow[]
  readonly chores: ChoreCard[]
  readonly composer: ChoreComposerState
  readonly editor: ChoreEditorState
  readonly bumpCount: number
  readonly sections: ReturnType<typeof createSections>
  updateComposer<K extends keyof ChoreComposerState>(
    key: K,
    value: ChoreComposerState[K]
  ): void
  updateEditor<K extends keyof ChoreEditorState>(key: K, value: ChoreEditorState[K]): void
  addChore(): Promise<{ ok: boolean; reason?: string }>
  completeChore(choreId: string): Promise<{ ok: boolean; reason?: string }>
  sendBump(choreId: string): Promise<boolean>
  beginEdit(choreId: string): void
  cancelEdit(): void
  saveEdit(): Promise<{ ok: boolean; reason?: string }>
  archiveChore(choreId: string): Promise<{ ok: boolean; reason?: string }>
}

let choreCounter = 0

function nextId(prefix: string) {
  choreCounter += 1
  return `${prefix}-${choreCounter}`
}

export function createBoardDriver(
  initialRows: ChoreRow[] = [],
  options: BoardDriverOptions = {}
): BoardDriver {
  const now = options.now ?? FIXED_NOW
  const timezone = options.timezone ?? 'UTC'
  const userId = options.userId === undefined ? VIEWER_USER_ID : options.userId
  const viewerMemberId = options.viewerMemberId ?? VIEWER_MEMBER_ID

  const memberRows = buildMemberRows()
  const store = createFakeZero({
    household: [householdRow],
    householdMember: memberRows,
    chore: initialRows,
  })
  const ctx = store.context(userId)

  const members = toMemberList(memberRows)
  const memberLookup = new Map(
    members.map((member) => [member.id, { name: member.name, active: true }])
  )

  let composer: ChoreComposerState = { ...emptyComposer, assigneeName: 'Alex' }
  let editor: ChoreEditorState = { ...emptyEditorState }

  function rows(): ChoreRow[] {
    return store.rows('chore') as ChoreRow[]
  }

  function bumpCount(): number {
    const sentOnDate = localDateKey(now, timezone)
    return store
      .rows('bumpEvent')
      .filter(
        (row) => row.senderMemberId === viewerMemberId && row.sentOnDate === sentOnDate
      ).length
  }

  function cards(): ChoreCard[] {
    const used = bumpCount()
    return rows().map((row) =>
      toChoreCard(row, {
        now,
        viewerMemberId,
        bumpsUsedToday: used,
        members: memberLookup,
      })
    )
  }

  async function attempt(fn: () => Promise<void>) {
    try {
      await fn()
      return { ok: true as const }
    } catch (error) {
      return {
        ok: false as const,
        reason: error instanceof Error ? error.message : String(error),
      }
    }
  }

  return {
    get store() {
      return store
    },
    get rows() {
      return rows()
    },
    get chores() {
      return cards()
    },
    get composer() {
      return composer
    },
    get editor() {
      return editor
    },
    get bumpCount() {
      return bumpCount()
    },
    get sections() {
      return createSections(cards())
    },

    updateComposer(key, value) {
      composer = { ...composer, [key]: value }
    },
    updateEditor(key, value) {
      editor = { ...editor, [key]: value }
    },

    async addChore() {
      const intent = buildChoreDraft(composer, {
        choreId: nextId('new-chore'),
        assigneeMemberId: findMemberIdByName(members, composer.assigneeName),
        timezone,
        now,
      })
      if (!intent.ok) return { ok: false, reason: intent.error.message }

      const result = await attempt(() => choreMutators.create(ctx, intent.value))
      if (result.ok) composer = { ...emptyComposer, assigneeName: 'Alex' }
      return result
    },

    async completeChore(choreId: string) {
      const chore = cards().find((item) => item.id === choreId)
      if (!chore) return { ok: false, reason: 'Chore not found' }

      return attempt(() =>
        choreMutators.complete(ctx, {
          choreId,
          expectedDueAt: chore.nextDueAt,
          now,
        })
      )
    },

    async sendBump(choreId: string) {
      const chore = cards().find((item) => item.id === choreId)
      if (!chore) return false

      const verdict = bumpEligibility(chore, {
        viewerMemberId,
        bumpsUsedToday: bumpCount(),
      })
      if (!verdict.canBump) return false

      const result = await attempt(() =>
        bumpMutators.send(ctx, {
          bumpId: nextId('bump'),
          choreId,
          messageType: 'gentle_nudge',
          now,
        })
      )
      return result.ok
    },

    beginEdit(choreId: string) {
      editor = beginEditForBoard(cards(), choreId)
    },

    cancelEdit() {
      editor = { ...emptyEditorState }
    },

    async saveEdit() {
      if (!editor.choreId) return { ok: false, reason: 'No chore is being edited' }

      const intent = buildChoreEdit(editor, {
        assigneeMemberId: findMemberIdByName(members, editor.assigneeName),
        timezone,
        now,
      })
      if (!intent.ok) return { ok: false, reason: intent.error.message }

      const result = await attempt(() => choreMutators.edit(ctx, intent.value))
      if (result.ok) editor = { ...emptyEditorState }
      return result
    },

    async archiveChore(choreId: string) {
      const result = await attempt(() => choreMutators.archive(ctx, { choreId, now }))
      if (result.ok) editor = resetEditorIfEditing(editor, choreId)
      return result
    },
  }
}
