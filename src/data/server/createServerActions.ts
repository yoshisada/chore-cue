import { analyticsActions } from './actions/analyticsActions'
import { householdActions } from './actions/householdActions'
import { userActions } from './actions/userActions'

export const createServerActions = () => {
  return {
    analyticsActions,
    householdActions,
    userActions,
  }
}

export type ServerActions = ReturnType<typeof createServerActions>
