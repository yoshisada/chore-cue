import type { MemberRole } from './types'

/**
 * client-side calls into the member-lifecycle server actions.
 *
 * memberships are not writable through Zero on purpose — householdId, userId,
 * role and status are server-owned — so these go over HTTP and the session
 * cookie identifies the caller.
 */

const MEMBERS_ENDPOINT = '/api/household/members'

export interface MemberActionResult {
  ok: boolean
  error?: string
}

async function post(body: Record<string, unknown>): Promise<MemberActionResult> {
  try {
    const response = await fetch(MEMBERS_ENDPOINT, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const payload = (await response.json().catch(() => null)) as {
      error?: string
    } | null

    if (!response.ok) {
      return { ok: false, error: payload?.error ?? 'Request failed' }
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Network error' }
  }
}

export function addLocalMemberRequest(input: {
  householdId: string
  displayName: string
  role: MemberRole
}): Promise<MemberActionResult> {
  return post({ action: 'add', ...input })
}

export function deactivateMemberRequest(memberId: string): Promise<MemberActionResult> {
  return post({ action: 'deactivate', memberId })
}
