export type HouseholdRole = 'admin' | 'member'

export interface HouseholdContext {
  userId: string
  householdId: string
  householdName: string
  displayName: string
  isAuthenticated: boolean
  /** the viewer's `householdMember.id` — '' until the membership row syncs */
  memberId: string
  role: HouseholdRole
  timezone: string
}

export const DEFAULT_TIMEZONE = 'UTC'

export interface MembershipSnapshot {
  id?: string | null
  householdId?: string | null
  role?: string | null
  timezone?: string | null
  displayName?: string | null
  household?: { name?: string | null } | null
}

/**
 * fold the viewer's membership row into the derived context.
 *
 * `memberId` is what makes `bumpEligibility` ("is this chore assigned to me?")
 * and the daily bump quota answerable at all, and it is already in hand here —
 * the hook queries this row for the household name anyway.
 */
export function withMembership(
  derived: HouseholdContext,
  membership: MembershipSnapshot | null | undefined
): HouseholdContext {
  if (!membership) return derived

  return {
    ...derived,
    householdId: membership.householdId ?? derived.householdId,
    householdName: membership.household?.name ?? derived.householdName,
    displayName: membership.displayName || derived.displayName,
    memberId: membership.id ?? '',
    role: membership.role === 'admin' ? 'admin' : 'member',
    timezone: membership.timezone || DEFAULT_TIMEZONE,
  }
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
    memberId: '',
    role: 'member',
    timezone: DEFAULT_TIMEZONE,
  }
}
