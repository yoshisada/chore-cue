import { ensureAuth } from './ensureAuth'
import { deriveServerHouseholdId } from '../householdContext'

export async function ensureHouseholdContext(req: Request) {
  const { session, user } = await ensureAuth(req)

  return {
    session,
    user,
    householdId: deriveServerHouseholdId(user.id),
  }
}
