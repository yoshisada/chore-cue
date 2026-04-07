export interface HouseholdContext {
  userId: string
  householdId: string
  householdName: string
  displayName: string
  isAuthenticated: boolean
}

export interface HouseholdAuthSnapshot {
  state?: string
  user?: {
    id?: string
    name?: string | null
    username?: string | null
  } | null
}

export function deriveServerHouseholdId(userId: string) {
  return `household-${userId.slice(0, 8) || 'demo'}`
}

export function deriveHouseholdContext(auth: HouseholdAuthSnapshot): HouseholdContext {
  const userId = auth.user?.id ?? 'demo-user'

  return {
    userId,
    householdId: deriveServerHouseholdId(userId),
    householdName: 'My Household',
    displayName: auth.user?.name || auth.user?.username || 'Demo Member',
    isAuthenticated: auth.state === 'logged-in',
  }
}

