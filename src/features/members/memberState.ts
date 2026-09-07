import type { Member, MemberComposerState, MemberRole } from './types'

/**
 * pure member-roster rules.
 *
 * the array mutators this file used to hold are gone: memberships are created
 * and deactivated on the server (chore FKs are ON DELETE RESTRICT, so a member
 * is never actually deleted). what remains are the predicates the UI runs for a
 * fast, explained rejection — the server re-checks the same invariants in a
 * transaction, so a race cannot get past them.
 */

export const emptyComposer: MemberComposerState = {
  name: '',
  role: 'member',
}

export interface MemberRowLike {
  id: string
  displayName?: string | null
  role?: string | null
  status?: string | null
  userId?: string | null
  user?: { name?: string | null; username?: string | null } | null
}

function toRole(value: string | null | undefined): MemberRole {
  return value === 'admin' ? 'admin' : 'member'
}

/** Zero roster rows -> the shape `MembersPage` and the assignee picker render */
export function toMemberList(rows: readonly MemberRowLike[]): Member[] {
  return rows
    .filter((row) => row.status !== 'inactive')
    .map((row) => ({
      id: row.id,
      name: row.displayName || row.user?.name || row.user?.username || 'Member',
      role: toRole(row.role),
    }))
}

export function getMemberNames(members: Member[]): string[] {
  return members.map((m) => m.name)
}

export function findMemberIdByName(members: Member[], name: string): string | undefined {
  const trimmed = name.trim().toLowerCase()
  if (!trimmed) return undefined
  return members.find((m) => m.name.toLowerCase() === trimmed)?.id
}

export type AddMemberVerdict =
  | { ok: true; name: string; role: MemberRole }
  | { ok: false; reason: 'empty-name' | 'duplicate-name' }

export function canAddMember(
  members: Member[],
  composer: MemberComposerState
): AddMemberVerdict {
  const name = composer.name.trim()
  if (!name) return { ok: false, reason: 'empty-name' }

  const duplicate = members.some((m) => m.name.toLowerCase() === name.toLowerCase())
  if (duplicate) return { ok: false, reason: 'duplicate-name' }

  return { ok: true, name, role: composer.role }
}

export type RemoveMemberVerdict =
  | { ok: true }
  | { ok: false; reason: 'not-found' | 'last-admin' }

/**
 * the one genuinely interesting invariant on this page: a household must keep at
 * least one active admin, or nobody can ever administer it again.
 */
export function canRemoveMember(
  members: Member[],
  memberId: string
): RemoveMemberVerdict {
  const target = members.find((m) => m.id === memberId)
  if (!target) return { ok: false, reason: 'not-found' }

  if (target.role === 'admin') {
    const adminCount = members.filter((m) => m.role === 'admin').length
    if (adminCount <= 1) return { ok: false, reason: 'last-admin' }
  }

  return { ok: true }
}
