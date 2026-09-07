import { useCallback, useMemo, useState } from 'react'

import { membersByHouseholdId } from '~/data/queries/household'
import { useHouseholdContext } from '~/features/auth/client/useHouseholdContext'
import { useQuery } from '~/zero/client'

import { addLocalMemberRequest, deactivateMemberRequest } from './memberActions'
import {
  canAddMember,
  canRemoveMember,
  emptyComposer,
  getMemberNames,
  toMemberList,
} from './memberState'

import type { MemberActionResult } from './memberActions'
import type { MemberComposerState } from './types'

const REJECTION_MESSAGES: Record<string, string> = {
  'empty-name': 'A member name is required',
  'duplicate-name': 'That name is already taken in this household',
  'not-found': 'Member not found',
  'last-admin': 'A household needs at least one admin',
}

/**
 * the roster, backed by Zero.
 *
 * reads come from the synced `membersByHouseholdId` query; writes go through the
 * server actions, because memberships are server-owned (and members are
 * deactivated rather than deleted — chore FKs are ON DELETE RESTRICT).
 */
export function useMemberBoard() {
  const household = useHouseholdContext()
  const householdId = household.householdId

  const [rows] = useQuery(
    membersByHouseholdId,
    { householdId },
    { enabled: !!householdId }
  )

  const [composer, setComposer] = useState<MemberComposerState>(emptyComposer)

  // until the roster syncs the viewer is still a real member, so the assignee
  // picker and the members page are never blank for a signed-in user
  const members = useMemo(() => {
    const roster = toMemberList(rows ?? [])
    if (roster.length > 0) return roster
    if (!household.memberId) return roster
    return [{ id: household.memberId, name: household.displayName, role: household.role }]
  }, [rows, household.memberId, household.displayName, household.role])

  const memberNames = useMemo(() => getMemberNames(members), [members])

  function updateComposer<Key extends keyof MemberComposerState>(
    key: Key,
    value: MemberComposerState[Key]
  ) {
    setComposer((current) => ({ ...current, [key]: value }))
  }

  const handleAddMember = useCallback(async (): Promise<MemberActionResult> => {
    const verdict = canAddMember(members, composer)
    if (!verdict.ok) {
      return { ok: false, error: REJECTION_MESSAGES[verdict.reason] }
    }

    const result = await addLocalMemberRequest({
      householdId,
      displayName: verdict.name,
      role: verdict.role,
    })
    if (result.ok) setComposer(emptyComposer)

    return result
  }, [members, composer, householdId])

  const handleRemoveMember = useCallback(
    async (memberId: string): Promise<MemberActionResult> => {
      const verdict = canRemoveMember(members, memberId)
      if (!verdict.ok) {
        return { ok: false, error: REJECTION_MESSAGES[verdict.reason] }
      }

      return deactivateMemberRequest(memberId)
    },
    [members]
  )

  return {
    members,
    composer,
    memberNames,
    updateComposer,
    addMember: handleAddMember,
    removeMember: handleRemoveMember,
  }
}
