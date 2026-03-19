import { useMemo, useState } from 'react'

import {
  addMember,
  emptyComposer,
  getMemberNames,
  initialMembers,
  removeMember,
} from './memberState'
import type { Member, MemberComposerState } from './types'

export function useMemberBoard() {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [composer, setComposer] = useState<MemberComposerState>(emptyComposer)

  const memberNames = useMemo(() => getMemberNames(members), [members])

  function updateComposer<Key extends keyof MemberComposerState>(
    key: Key,
    value: MemberComposerState[Key]
  ) {
    setComposer((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function handleAddMember() {
    setMembers((current) => addMember(current, composer))
    setComposer(emptyComposer)
  }

  function handleRemoveMember(memberId: string) {
    setMembers((current) => removeMember(current, memberId))
  }

  return {
    members,
    composer,
    memberNames,
    updateComposer,
    addMember: handleAddMember,
    removeMember: handleRemoveMember,
  }
}
