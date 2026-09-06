import type { Member, MemberComposerState } from './types'

export const initialMembers: Member[] = [
  { id: 'member-1', name: 'Sam', role: 'admin' },
  { id: 'member-2', name: 'Alex', role: 'member' },
]

export const emptyComposer: MemberComposerState = {
  name: '',
  role: 'member',
}

function nextMemberId(members: Member[]): string {
  const highest = members.reduce((max, m) => {
    const suffix = Number.parseInt(m.id.replace(/^member-/, ''), 10)
    return Number.isFinite(suffix) ? Math.max(max, suffix) : max
  }, 0)

  return `member-${highest + 1}`
}

export function addMember(members: Member[], composer: MemberComposerState): Member[] {
  const trimmed = composer.name.trim()
  if (!trimmed) return members
  if (members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase())) return members

  return [
    ...members,
    {
      id: nextMemberId(members),
      name: trimmed,
      role: composer.role,
    },
  ]
}

export function removeMember(members: Member[], memberId: string): Member[] {
  const target = members.find((m) => m.id === memberId)
  if (!target) return members

  if (target.role === 'admin') {
    const adminCount = members.filter((m) => m.role === 'admin').length
    if (adminCount <= 1) return members
  }

  return members.filter((m) => m.id !== memberId)
}

export function getMemberNames(members: Member[]): string[] {
  return members.map((m) => m.name)
}
