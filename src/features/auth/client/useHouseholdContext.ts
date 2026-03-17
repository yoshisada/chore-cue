import { useMemo } from 'react'

import { deriveHouseholdContext } from '../householdContext'
import { useAuth } from './authClient'

export function useHouseholdContext() {
  const auth = useAuth()

  return useMemo(
    () => deriveHouseholdContext(auth),
    [auth.state, auth.user?.id, auth.user?.name, auth.user?.username]
  )
}
