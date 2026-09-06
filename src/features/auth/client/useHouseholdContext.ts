import { useMemo } from 'react'

import { householdsByUserId } from '~/data/queries/household'
import { useQuery } from '~/zero/client'

import { deriveHouseholdContext } from '../householdContext'
import { useAuth } from './authClient'

export function useHouseholdContext() {
  const auth = useAuth()
  const userId = auth.user?.id ?? ''

  const [memberships] = useQuery(householdsByUserId, { userId }, { enabled: !!userId })

  const derived = useMemo(
    () => deriveHouseholdContext(auth),
    [auth.state, auth.user?.id, auth.user?.name, auth.user?.username]
  )

  const primaryMembership = memberships?.[0]

  return useMemo(
    () => ({
      ...derived,
      householdId: primaryMembership?.householdId ?? derived.householdId,
      householdName: primaryMembership?.household?.name ?? derived.householdName,
    }),
    [derived, primaryMembership]
  )
}
