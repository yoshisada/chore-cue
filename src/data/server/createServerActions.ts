import { analyticsActions } from './actions/analyticsActions'
import { choreActions } from './actions/choreActions'
import { householdActions } from './actions/householdActions'
import { userActions } from './actions/userActions'

export const createServerActions = () => {
  return {
    analyticsActions,
    choreActions,
    householdActions,
    userActions,
  }
}

export type ServerActions = ReturnType<typeof createServerActions>
