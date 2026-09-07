import { describe, expect, it } from 'vitest'

import {
  canAddMember,
  canRemoveMember,
  emptyComposer,
  findMemberIdByName,
  getMemberNames,
  toMemberList,
} from '~/features/members/memberState'

import type { Member } from '~/features/members/types'

const members: Member[] = [
  { id: 'member-1', name: 'Sam', role: 'admin' },
  { id: 'member-2', name: 'Alex', role: 'member' },
]

describe('memberState', () => {
  describe('canAddMember', () => {
    it('accepts a valid name', () => {
      const result = canAddMember(members, { name: 'Jordan', role: 'member' })
      expect(result).toEqual({ ok: true, name: 'Jordan', role: 'member' })
    })

    it('rejects an empty name', () => {
      expect(canAddMember(members, { name: '   ', role: 'member' })).toEqual({
        ok: false,
        reason: 'empty-name',
      })
    })

    it('rejects a duplicate name case-insensitively', () => {
      expect(canAddMember(members, { name: 'sam', role: 'member' })).toEqual({
        ok: false,
        reason: 'duplicate-name',
      })
    })

    it('trims whitespace from the accepted name', () => {
      const result = canAddMember(members, { name: '  Jordan  ', role: 'admin' })
      expect(result).toMatchObject({ ok: true, name: 'Jordan', role: 'admin' })
    })

    it('accepts into an empty roster', () => {
      expect(canAddMember([], { name: 'Jordan', role: 'admin' })).toMatchObject({
        ok: true,
      })
    })
  })

  describe('canRemoveMember', () => {
    it('allows removing a non-admin member', () => {
      expect(canRemoveMember(members, 'member-2')).toEqual({ ok: true })
    })

    it('rejects an unknown id', () => {
      expect(canRemoveMember(members, 'nonexistent')).toEqual({
        ok: false,
        reason: 'not-found',
      })
    })

    it('prevents removing the last admin', () => {
      expect(canRemoveMember(members, 'member-1')).toEqual({
        ok: false,
        reason: 'last-admin',
      })
    })

    it('allows removing an admin when another admin remains', () => {
      const twoAdmins: Member[] = [
        { id: 'member-1', name: 'Sam', role: 'admin' },
        { id: 'member-2', name: 'Alex', role: 'admin' },
      ]
      expect(canRemoveMember(twoAdmins, 'member-1')).toEqual({ ok: true })
    })

    it('rejects removing the only member, who is necessarily the last admin', () => {
      const solo: Member[] = [{ id: 'member-1', name: 'Sam', role: 'admin' }]
      expect(canRemoveMember(solo, 'member-1')).toEqual({
        ok: false,
        reason: 'last-admin',
      })
    })
  })

  describe('toMemberList', () => {
    it('prefers displayName, then the linked user, then a fallback', () => {
      const rows = [
        { id: 'a', displayName: 'Sam', role: 'admin', status: 'active' },
        {
          id: 'b',
          displayName: null,
          role: 'member',
          status: 'active',
          user: { name: 'Alexandra' },
        },
        { id: 'c', displayName: null, role: 'member', status: 'active' },
      ]

      expect(toMemberList(rows)).toEqual([
        { id: 'a', name: 'Sam', role: 'admin' },
        { id: 'b', name: 'Alexandra', role: 'member' },
        { id: 'c', name: 'Member', role: 'member' },
      ])
    })

    it('hides deactivated members from the roster', () => {
      const rows = [
        { id: 'a', displayName: 'Sam', role: 'admin', status: 'active' },
        { id: 'b', displayName: 'Gone', role: 'member', status: 'inactive' },
      ]

      expect(toMemberList(rows).map((m) => m.id)).toEqual(['a'])
    })

    it('treats an unknown role as a plain member', () => {
      const rows = [{ id: 'a', displayName: 'Sam', role: 'owner', status: 'active' }]
      expect(toMemberList(rows)[0]?.role).toBe('member')
    })
  })

  describe('findMemberIdByName', () => {
    it('resolves a display name to a member id, case-insensitively', () => {
      expect(findMemberIdByName(members, ' alex ')).toBe('member-2')
    })

    it('returns undefined for an unknown or blank name', () => {
      expect(findMemberIdByName(members, 'Nobody')).toBeUndefined()
      expect(findMemberIdByName(members, '   ')).toBeUndefined()
    })
  })

  describe('getMemberNames', () => {
    it('returns names of all members', () => {
      expect(getMemberNames(members)).toEqual(['Sam', 'Alex'])
    })

    it('returns an empty array for an empty roster', () => {
      expect(getMemberNames([])).toEqual([])
    })
  })

  describe('emptyComposer', () => {
    it('has an empty name and the member role', () => {
      expect(emptyComposer).toEqual({ name: '', role: 'member' })
    })
  })
})
