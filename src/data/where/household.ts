import { serverWhere } from 'on-zero'

/**
 * shared household permission partials.
 *
 * permissions only run server-side (on the client they auto-pass), so these are
 * the authority for who may read/write household rows — never trust the client.
 */

// a sentinel that can never match a real userId, so an anonymous caller matches
// no rows even if a membership row ever carries an empty userId
const NO_CALLER = '__no_caller__'

/** caller has a membership in this household */
export const callerIsHouseholdMember = serverWhere('household', (_, auth) =>
  _.exists('members', (m) => m.where('userId', auth?.id || NO_CALLER))
)

/** caller has an admin membership in this household */
export const callerIsHouseholdAdmin = serverWhere('household', (_, auth) =>
  _.exists('members', (m) =>
    m.where('userId', auth?.id || NO_CALLER).where('role', 'admin')
  )
)
