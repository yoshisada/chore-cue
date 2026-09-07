import { householdActions } from '~/data/server/actions/householdActions'
import { ensureAuth } from '~/features/auth/server/ensureAuth'

import type { Endpoint } from 'one'
import type { AuthData } from '~/features/auth/types'

/**
 * the HTTP path to the member-lifecycle server actions.
 *
 * memberships are deliberately not writable through Zero (householdId, userId,
 * role and status are all server-owned), so `MembersPage` reaches them here.
 * every branch re-derives the caller from the session — nothing about who you
 * are is read from the request body.
 */
export const POST: Endpoint = async (req) => {
  let session: Awaited<ReturnType<typeof ensureAuth>>
  try {
    session = await ensureAuth(req)
  } catch (response) {
    if (response instanceof Response) return response
    throw response
  }

  const authData: AuthData = {
    id: session.user.id,
    role: session.user.role === 'admin' ? 'admin' : undefined,
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    if (body.action === 'add') {
      const member = await householdActions.addLocalMember(authData, {
        householdId: String(body.householdId ?? ''),
        displayName: String(body.displayName ?? ''),
        role: body.role === 'admin' ? 'admin' : 'member',
      })
      return Response.json({ ok: true, memberId: member.id })
    }

    if (body.action === 'deactivate') {
      await householdActions.deactivateMember(authData, {
        memberId: String(body.memberId ?? ''),
      })
      return Response.json({ ok: true })
    }
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Request failed' },
      { status: 400 }
    )
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 })
}
