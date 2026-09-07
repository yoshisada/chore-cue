import { zql } from 'on-zero'

import { callerIsHouseholdMember, inCallerHousehold } from '../where/household'

export const householdsByUserId = (props: { userId: string }) => {
  return zql.householdMember
    .where(inCallerHousehold)
    .where('userId', props.userId)
    .related('household', (q) => q.where(callerIsHouseholdMember).one())
}

export const householdById = (props: { householdId: string }) => {
  return zql.household
    .where(callerIsHouseholdMember)
    .where('id', props.householdId)
    .related('members', (q) => q.where(inCallerHousehold))
    .one()
}

/** the household roster — impossible before, when a member could only see their own row */
export const membersByHouseholdId = (props: { householdId: string }) => {
  return zql.householdMember
    .where(inCallerHousehold)
    .where('householdId', props.householdId)
    .orderBy('joinedAt', 'asc')
    .orderBy('id', 'asc')
    .related('user', (q) => q.one())
}
