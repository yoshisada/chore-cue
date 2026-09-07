import { serverWhere } from 'on-zero'

/**
 * shared household permission partials.
 *
 * permissions only run server-side (on the client they auto-pass), so these are
 * the authority for who may read/write household rows — never trust the client.
 */

// a sentinel that can never match a real userId, so an anonymous caller matches
// no rows even if a membership row ever carries an empty userId. this matters
// now that local members exist: their userId is NULL.
const NO_CALLER = '__no_caller__'

/** every table whose rows belong to exactly one household via a `household` relationship */
type HouseholdScoped = 'chore' | 'bumpEvent' | 'householdMember'

/**
 * the caller has an ACTIVE membership in the row's household.
 *
 * used by chore/bumpEvent/householdMember so a household's roster and board are
 * visible to the whole household — and to nobody else.
 */
export const inCallerHousehold = serverWhere<HouseholdScoped>((_, auth) =>
  _.exists('household', (q) =>
    q.whereExists('members', (m) =>
      m.where('userId', auth?.id || NO_CALLER).where('status', 'active')
    )
  )
)

/** caller has an active membership in this household */
export const callerIsHouseholdMember = serverWhere('household', (_, auth) =>
  _.exists('members', (m) =>
    m.where('userId', auth?.id || NO_CALLER).where('status', 'active')
  )
)

/** caller has an active admin membership in this household */
export const callerIsHouseholdAdmin = serverWhere('household', (_, auth) =>
  _.exists('members', (m) =>
    m
      .where('userId', auth?.id || NO_CALLER)
      .where('role', 'admin')
      .where('status', 'active')
  )
)
