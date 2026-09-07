import { useCallback, useMemo, useState } from 'react'

import { bumpsSentOnDate } from '~/data/queries/bump'
import { choreBoard } from '~/data/queries/chore'
import { membersByHouseholdId } from '~/data/queries/household'
import { useHouseholdContext } from '~/features/auth/client/useHouseholdContext'
import { findMemberIdByName, toMemberList } from '~/features/members/memberState'
import { useQuery, zero } from '~/zero/client'

import {
  beginEditForBoard,
  buildChoreDraft,
  buildChoreEdit,
  collectAllTags,
  createSections,
  emptyComposer,
  emptyEditorState,
  filterBySearch,
  filterByTags,
  resetEditorIfEditing,
  sortVisibleChores,
} from './boardState'
import { toChoreCard } from './choreMapping'
import { bumpEligibility } from './choreRules'
import { toRule } from './recurrence'
import { localDateKey } from './timezone'
import { useNowTick } from './useNowTick'

import type { MemberLookupEntry } from './choreMapping'
import type { ChoreCard, ChoreComposerState, ChoreEditorState } from './types'

export interface BoardActionResult {
  ok: boolean
  reason?: string
}

const OK: BoardActionResult = { ok: true }

function failure(error: unknown): BoardActionResult {
  return { ok: false, reason: error instanceof Error ? error.message : String(error) }
}

/**
 * the board, backed by Zero.
 *
 * chores, the roster and the day's bumps are all synced queries; every write is
 * a named mutator whose body runs on the client (optimistically) and again on
 * the server (authoritatively) from the same pure rules. nothing here is stored
 * in component state except the composer, the editor and the filters, which are
 * UI state rather than domain state.
 */
export function useChoreBoard(options: { now?: number } = {}) {
  const household = useHouseholdContext()
  const tick = useNowTick()
  const now = options.now ?? tick

  const householdId = household.householdId
  const viewerMemberId = household.memberId
  const timezone = household.timezone

  const [choreRows, choreInfo] = useQuery(
    choreBoard,
    { householdId },
    { enabled: !!householdId }
  )
  const [memberRows] = useQuery(
    membersByHouseholdId,
    { householdId },
    { enabled: !!householdId }
  )

  const sentOnDate = localDateKey(now, timezone)
  const [bumpRows] = useQuery(
    bumpsSentOnDate,
    { senderMemberId: viewerMemberId, sentOnDate },
    { enabled: !!viewerMemberId }
  )

  const [composer, setComposer] = useState<ChoreComposerState>(emptyComposer)
  const [editor, setEditor] = useState<ChoreEditorState>(emptyEditorState)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  // before any membership row has synced, the viewer is still a real person the
  // board can address — so the composer always has at least one assignee
  const members = useMemo(() => {
    const roster = toMemberList(memberRows ?? [])
    if (roster.length > 0) return roster
    if (!viewerMemberId) return roster
    return [{ id: viewerMemberId, name: household.displayName, role: household.role }]
  }, [memberRows, viewerMemberId, household.displayName, household.role])

  const memberLookup = useMemo(() => {
    const lookup = new Map<string, MemberLookupEntry>()
    for (const member of members) {
      lookup.set(member.id, { name: member.name, active: true })
    }
    return lookup
  }, [members])

  const bumpCount = bumpRows?.length ?? 0

  const chores = useMemo<ChoreCard[]>(
    () =>
      (choreRows ?? []).map((row) =>
        toChoreCard(row, {
          now,
          viewerMemberId,
          bumpsUsedToday: bumpCount,
          members: memberLookup,
        })
      ),
    [choreRows, now, viewerMemberId, bumpCount, memberLookup]
  )

  const sorted = useMemo(() => sortVisibleChores(chores), [chores])
  const afterSearch = useMemo(
    () => filterBySearch(sorted, searchQuery),
    [sorted, searchQuery]
  )
  const allTags = useMemo(() => collectAllTags(afterSearch), [afterSearch])
  const filtered = useMemo(
    () => filterByTags(afterSearch, selectedTags),
    [afterSearch, selectedTags]
  )
  const sections = useMemo(() => createSections(filtered), [filtered])

  const defaultAssigneeName = members[0]?.name ?? ''
  const resolvedComposer = useMemo(
    () => ({
      ...composer,
      assigneeName: composer.assigneeName || defaultAssigneeName,
    }),
    [composer, defaultAssigneeName]
  )

  function updateComposer<Key extends keyof ChoreComposerState>(
    key: Key,
    value: ChoreComposerState[Key]
  ) {
    setComposer((current) => ({ ...current, [key]: value }))
  }

  function updateEditor<Key extends keyof ChoreEditorState>(
    key: Key,
    value: ChoreEditorState[Key]
  ) {
    setEditor((current) => ({ ...current, [key]: value }))
  }

  const addChore = useCallback(async (): Promise<BoardActionResult> => {
    const intent = buildChoreDraft(resolvedComposer, {
      choreId: crypto.randomUUID(),
      assigneeMemberId: findMemberIdByName(members, resolvedComposer.assigneeName),
      timezone,
      now,
    })
    if (!intent.ok) return { ok: false, reason: intent.error.message }

    try {
      await zero.mutate.chore.create(intent.value)
      setComposer(emptyComposer)
      return OK
    } catch (error) {
      return failure(error)
    }
  }, [resolvedComposer, members, timezone, now])

  const completeChore = useCallback(
    async (choreId: string): Promise<BoardActionResult> => {
      const chore = chores.find((item) => item.id === choreId)
      if (!chore) return { ok: false, reason: 'Chore not found' }

      try {
        // compare-and-swap on the due instant the viewer actually saw, so a
        // double-tap cannot advance the schedule twice
        await zero.mutate.chore.complete({
          choreId,
          expectedDueAt: chore.nextDueAt,
          now,
        })
        return OK
      } catch (error) {
        return failure(error)
      }
    },
    [chores, now]
  )

  const sendBump = useCallback(
    async (choreId: string): Promise<boolean> => {
      const chore = chores.find((item) => item.id === choreId)
      if (!chore) return false

      // the same predicate the server runs — checked here only to avoid a
      // pointless round trip and to keep the button honest
      const verdict = bumpEligibility(chore, {
        viewerMemberId,
        bumpsUsedToday: bumpCount,
      })
      if (!verdict.canBump) return false

      try {
        await zero.mutate.bumpEvent.send({
          bumpId: crypto.randomUUID(),
          choreId,
          messageType: 'gentle_nudge',
          now,
        })
        return true
      } catch {
        return false
      }
    },
    [chores, viewerMemberId, bumpCount, now]
  )

  function beginEdit(choreId: string) {
    setEditor(beginEditForBoard(chores, choreId))
  }

  const saveEdit = useCallback(async (): Promise<BoardActionResult> => {
    if (!editor.choreId) return { ok: false, reason: 'No chore is being edited' }

    const intent = buildChoreEdit(editor, {
      assigneeMemberId: findMemberIdByName(members, editor.assigneeName),
      timezone,
      now,
      existingRule: toRule(choreRows?.find((row) => row.id === editor.choreId)),
    })
    if (!intent.ok) return { ok: false, reason: intent.error.message }

    try {
      await zero.mutate.chore.edit(intent.value)
      setEditor(emptyEditorState)
      return OK
    } catch (error) {
      return failure(error)
    }
  }, [editor, members, timezone, now, choreRows])

  const archiveChore = useCallback(
    async (choreId: string): Promise<BoardActionResult> => {
      try {
        await zero.mutate.chore.archive({ choreId, now })
        setEditor((current) => resetEditorIfEditing(current, choreId))
        return OK
      } catch (error) {
        return failure(error)
      }
    },
    [now]
  )

  function attachComposerPhoto() {
    setComposer((current) => ({ ...current, photoLabel: 'kitchen-reference.jpg' }))
  }

  function clearComposerPhoto() {
    setComposer((current) => ({ ...current, photoLabel: '' }))
  }

  function attachEditorPhoto() {
    setEditor((current) => ({ ...current, photoLabel: 'updated-reference.jpg' }))
  }

  function clearEditorPhoto() {
    setEditor((current) => ({ ...current, photoLabel: '' }))
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) => {
      const next = new Set(current)
      if (next.has(tag)) {
        next.delete(tag)
      } else {
        next.add(tag)
      }
      return next
    })
  }

  function clearTagFilter() {
    setSelectedTags(new Set())
  }

  return {
    sections,
    allTags,
    selectedTags,
    searchQuery,
    setSearchQuery,
    composer: resolvedComposer,
    editor,
    bumpCount,
    memberNames: members.map((member) => member.name),
    isLoading: !!householdId && choreInfo.type === 'unknown',
    updateComposer,
    addChore,
    completeChore,
    sendBump,
    beginEdit,
    updateEditor,
    saveEdit,
    archiveChore,
    attachComposerPhoto,
    clearComposerPhoto,
    attachEditorPhoto,
    clearEditorPhoto,
    toggleTag,
    clearTagFilter,
  }
}
