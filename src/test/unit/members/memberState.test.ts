import { describe, expect, it } from 'vitest'

import {
  addMember,
  emptyComposer,
  getMemberNames,
  initialMembers,
  removeMember,
} from '~/features/members/memberState'

describe('memberState', () => {
  describe('addMember', () => {
    it('adds a member with a valid name', () => {
      const result = addMember(initialMembers, { name: 'Jordan', role: 'member' })
      expect(result).toHaveLength(3)
      expect(result[2]!.name).toBe('Jordan')
      expect(result[2]!.role).toBe('member')
    })

    it('rejects empty name', () => {
      const result = addMember(initialMembers, { name: '   ', role: 'member' })
      expect(result).toBe(initialMembers)
    })

    it('rejects duplicate name (case-insensitive)', () => {
      const result = addMember(initialMembers, { name: 'sam', role: 'member' })
      expect(result).toBe(initialMembers)
    })

    it('trims whitespace from name', () => {
      const result = addMember(initialMembers, { name: '  Jordan  ', role: 'admin' })
      expect(result[2]!.name).toBe('Jordan')
    })

    it('assigns a unique id', () => {
      const result = addMember(initialMembers, { name: 'Jordan', role: 'member' })
      const ids = result.map((m) => m.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('removeMember', () => {
    it('removes a member by id', () => {
      const result = removeMember(initialMembers, 'member-2')
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Sam')
    })

    it('returns same array for unknown id', () => {
      const result = removeMember(initialMembers, 'nonexistent')
      expect(result).toBe(initialMembers)
    })

    it('prevents removing the last admin', () => {
      const result = removeMember(initialMembers, 'member-1')
      expect(result).toBe(initialMembers)
    })

    it('allows removing an admin when another admin exists', () => {
      const members = [
        { id: 'member-1', name: 'Sam', role: 'admin' as const },
        { id: 'member-2', name: 'Alex', role: 'admin' as const },
      ]
      const result = removeMember(members, 'member-1')
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Alex')
    })
  })

  describe('getMemberNames', () => {
    it('returns names of all members', () => {
      expect(getMemberNames(initialMembers)).toEqual(['Sam', 'Alex'])
    })

    it('returns empty array for empty members', () => {
      expect(getMemberNames([])).toEqual([])
    })
  })

  describe('emptyComposer', () => {
    it('has empty name and member role', () => {
      expect(emptyComposer).toEqual({ name: '', role: 'member' })
    })
  })
})
