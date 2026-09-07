import { describe, expect, it } from 'vitest'

import {
  bumpEligibility,
  ChoreValidationError,
  DAILY_BUMP_LIMIT,
  isBumpMessageType,
  MAX_TAGS,
  normalizeHouseholdName,
  normalizeTag,
  normalizeTags,
  normalizeTitle,
  validateChoreDraft,
} from '~/features/chorecue/choreRules'

import type { RecurrenceRule } from '~/features/chorecue/recurrence'

const rule: RecurrenceRule = { type: 'daily_time', timeMinutes: 540, timezone: 'UTC' }

const validDraft = {
  title: 'Take out compost',
  tags: ['Kitchen'],
  assigneeMemberId: 'member-2',
  rule,
}

const bumpableChore = {
  archived: false,
  assigneeMemberId: 'member-2',
  assigneeActive: true,
}

const viewer = { viewerMemberId: 'member-1', bumpsUsedToday: 0 }

describe('normalizers', () => {
  it('collapses whitespace and trims', () => {
    expect(normalizeTitle('  Take   out\ncompost ')).toBe('Take out compost')
    expect(normalizeTitle(42)).toBe('')
    expect(normalizeHouseholdName('  The   Flat ')).toBe('The Flat')
    expect(normalizeTag(' Kitchen ')).toBe('Kitchen')
  })

  it('dedupes tags case-insensitively and caps the count', () => {
    expect(normalizeTags(['Kitchen', 'kitchen', ' ', 'Quick'])).toEqual([
      'Kitchen',
      'Quick',
    ])
    expect(normalizeTags(null)).toEqual([])
    expect(normalizeTags(Array.from({ length: 20 }, (_, i) => `tag-${i}`)).length).toBe(
      MAX_TAGS
    )
  })
})

describe('isBumpMessageType', () => {
  it('accepts only the closed template set', () => {
    expect(isBumpMessageType('gentle_nudge')).toBe(true)
    expect(isBumpMessageType('heads_up')).toBe(true)
    expect(isBumpMessageType('do the dishes you slob')).toBe(false)
    expect(isBumpMessageType(undefined)).toBe(false)
  })
})

describe('validateChoreDraft', () => {
  it('normalizes a valid draft', () => {
    const draft = validateChoreDraft({
      ...validDraft,
      title: '  Take out   compost ',
      tags: ['Kitchen', 'kitchen'],
      description: '  ',
      photoLabel: ' compost-bin.jpg ',
    })

    expect(draft.title).toBe('Take out compost')
    expect(draft.tags).toEqual(['Kitchen'])
    expect(draft.description).toBeNull()
    expect(draft.photoLabel).toBe('compost-bin.jpg')
  })

  it('rejects an empty title', () => {
    expect(() => validateChoreDraft({ ...validDraft, title: '   ' })).toThrow(
      ChoreValidationError
    )
  })

  it('rejects an over-long title with a field-keyed error', () => {
    try {
      validateChoreDraft({ ...validDraft, title: 'x'.repeat(121) })
      expect.unreachable('should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(ChoreValidationError)
      expect((error as ChoreValidationError).field).toBe('title')
    }
  })

  it('requires at least one tag', () => {
    try {
      validateChoreDraft({ ...validDraft, tags: [' '] })
      expect.unreachable('should have thrown')
    } catch (error) {
      expect((error as ChoreValidationError).field).toBe('tags')
    }
  })

  it('requires an assignee', () => {
    try {
      validateChoreDraft({ ...validDraft, assigneeMemberId: '  ' })
      expect.unreachable('should have thrown')
    } catch (error) {
      expect((error as ChoreValidationError).field).toBe('assigneeMemberId')
    }
  })

  it('requires a well-formed recurrence rule', () => {
    try {
      validateChoreDraft({
        ...validDraft,
        rule: { ...rule, timeMinutes: 5000 },
      })
      expect.unreachable('should have thrown')
    } catch (error) {
      expect((error as ChoreValidationError).field).toBe('rule')
    }
  })

  it('rejects an over-long description', () => {
    try {
      validateChoreDraft({ ...validDraft, description: 'x'.repeat(1001) })
      expect.unreachable('should have thrown')
    } catch (error) {
      expect((error as ChoreValidationError).field).toBe('description')
    }
  })
})

describe('bumpEligibility', () => {
  it('allows a bump on someone else’s active chore', () => {
    expect(bumpEligibility(bumpableChore, viewer)).toEqual({ canBump: true })
  })

  it('blocks an archived chore', () => {
    expect(bumpEligibility({ ...bumpableChore, archived: true }, viewer)).toEqual({
      canBump: false,
      reason: 'archived',
    })
  })

  it('blocks an unassigned chore', () => {
    expect(bumpEligibility({ ...bumpableChore, assigneeMemberId: null }, viewer)).toEqual(
      { canBump: false, reason: 'unassigned' }
    )
  })

  it('blocks a chore assigned to a deactivated member', () => {
    expect(bumpEligibility({ ...bumpableChore, assigneeActive: false }, viewer)).toEqual({
      canBump: false,
      reason: 'inactive-assignee',
    })
  })

  it('blocks bumping yourself', () => {
    expect(
      bumpEligibility({ ...bumpableChore, assigneeMemberId: 'member-1' }, viewer)
    ).toEqual({ canBump: false, reason: 'self' })
  })

  it('blocks the sixth bump of the day', () => {
    expect(
      bumpEligibility(bumpableChore, {
        ...viewer,
        bumpsUsedToday: DAILY_BUMP_LIMIT - 1,
      })
    ).toEqual({ canBump: true })

    expect(
      bumpEligibility(bumpableChore, { ...viewer, bumpsUsedToday: DAILY_BUMP_LIMIT })
    ).toEqual({ canBump: false, reason: 'daily-limit' })
  })

  it('reports the most specific reason first', () => {
    // archived AND self AND over quota — "archived" is the useful explanation
    expect(
      bumpEligibility(
        { archived: true, assigneeMemberId: 'member-1', assigneeActive: true },
        { viewerMemberId: 'member-1', bumpsUsedToday: 99 }
      )
    ).toEqual({ canBump: false, reason: 'archived' })
  })
})
