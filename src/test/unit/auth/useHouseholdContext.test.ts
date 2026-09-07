import { describe, expect, it } from 'vitest'

import { deriveHouseholdContext, withMembership } from '~/features/auth/householdContext'

describe('deriveHouseholdContext', () => {
  it('derives household information from a logged-in user', () => {
    expect(
      deriveHouseholdContext({
        state: 'logged-in',
        user: {
          id: 'abcdef123456',
          name: 'Alex',
          username: 'alex-home',
        },
      })
    ).toEqual({
      userId: 'abcdef123456',
      householdId: 'household-abcdef123456',
      householdName: 'My Household',
      displayName: 'Alex',
      isAuthenticated: true,
      memberId: '',
      role: 'member',
      timezone: 'UTC',
    })
  })

  it('falls back to username and demo defaults when needed', () => {
    expect(
      deriveHouseholdContext({
        state: 'signed-out',
        user: {
          username: 'sammy',
        },
      })
    ).toEqual({
      userId: 'demo-user',
      householdId: 'household-demo-user',
      householdName: 'My Household',
      displayName: 'sammy',
      isAuthenticated: false,
      memberId: '',
      role: 'member',
      timezone: 'UTC',
    })
  })

  it('uses the generic demo member label when no user data exists', () => {
    expect(deriveHouseholdContext({})).toEqual({
      userId: 'demo-user',
      householdId: 'household-demo-user',
      householdName: 'My Household',
      displayName: 'Demo Member',
      isAuthenticated: false,
      memberId: '',
      role: 'member',
      timezone: 'UTC',
    })
  })
})

describe('withMembership', () => {
  const derived = deriveHouseholdContext({
    state: 'logged-in',
    user: { id: 'abcdef123456', name: 'Alex' },
  })

  it('returns the derived context untouched when no membership has synced', () => {
    expect(withMembership(derived, null)).toBe(derived)
  })

  it('folds the membership row in, which is what makes memberId knowable', () => {
    expect(
      withMembership(derived, {
        id: 'member-1',
        householdId: 'household-real',
        role: 'admin',
        timezone: 'Europe/Berlin',
        displayName: 'Alexandra',
        household: { name: 'The Flat' },
      })
    ).toMatchObject({
      householdId: 'household-real',
      householdName: 'The Flat',
      displayName: 'Alexandra',
      memberId: 'member-1',
      role: 'admin',
      timezone: 'Europe/Berlin',
    })
  })

  it('treats any non-admin role as a plain member and defaults the timezone', () => {
    expect(
      withMembership(derived, { id: 'member-2', householdId: 'household-real' })
    ).toMatchObject({
      memberId: 'member-2',
      role: 'member',
      timezone: 'UTC',
      // no membership displayName: the auth-derived one still stands
      displayName: 'Alex',
    })
  })
})
