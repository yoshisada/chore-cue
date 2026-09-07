import { zql } from 'on-zero'

import { inCallerHousehold } from '../where/household'

/**
 * ordering is on the underlying `nextDueAt` with a total tie-break, so a chore
 * rolling from "upcoming" into "due soon" at a boundary changes only which
 * section renders it — never the query result order. stable pagination, stable
 * tests.
 */
export const choreBoard = (props: { householdId: string; limit?: number }) => {
  return zql.chore
    .where(inCallerHousehold)
    .where('householdId', props.householdId)
    .where('status', 'active')
    .orderBy('nextDueAt', 'asc')
    .orderBy('id', 'asc')
    .related('assignee', (q) => q.one())
    .limit(props.limit ?? 200)
}

export const archivedChores = (props: { householdId: string; limit?: number }) => {
  return zql.chore
    .where(inCallerHousehold)
    .where('householdId', props.householdId)
    .where('status', 'archived')
    .orderBy('archivedAt', 'desc')
    .orderBy('id', 'asc')
    .related('assignee', (q) => q.one())
    .limit(props.limit ?? 100)
}

export const choreById = (props: { choreId: string }) => {
  return zql.chore
    .where(inCallerHousehold)
    .where('id', props.choreId)
    .related('assignee', (q) => q.one())
    .one()
}
