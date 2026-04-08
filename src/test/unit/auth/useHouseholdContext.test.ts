import { describe, expect, it } from 'vitest'

import { deriveHouseholdContext } from '~/features/auth/householdContext'

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
      householdId: 'household-abcdef12',
      householdName: 'My Household',
      displayName: 'Alex',
      isAuthenticated: true,
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
      householdId: 'household-demo-use',
      householdName: 'My Household',
      displayName: 'sammy',
      isAuthenticated: false,
    })
  })

  it('uses the generic demo member label when no user data exists', () => {
    expect(deriveHouseholdContext({})).toEqual({
      userId: 'demo-user',
      householdId: 'household-demo-use',
      householdName: 'My Household',
      displayName: 'Demo Member',
      isAuthenticated: false,
    })
  })
})
