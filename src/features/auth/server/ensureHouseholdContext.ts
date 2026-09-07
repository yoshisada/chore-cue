import { deriveServerHouseholdId } from '../householdContext'
import { ensureAuth } from './ensureAuth'

export async function ensureHouseholdContext(req: Request) {
  const { session, user } = await ensureAuth(req)

  return {
    session,
    user,
    householdId: deriveServerHouseholdId(user.id),
  }
}
