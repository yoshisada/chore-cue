import { describe, expect, it } from 'vitest'

import { deriveServerHouseholdId } from '~/features/auth/householdContext'

describe('deriveServerHouseholdId', () => {
  it('uses the first eight characters of the user id', () => {
    expect(deriveServerHouseholdId('1234567890abcdef')).toBe('household-1234567890abcdef')
  })

  it('handles short ids without throwing', () => {
    expect(deriveServerHouseholdId('sam')).toBe('household-sam')
  })
})
