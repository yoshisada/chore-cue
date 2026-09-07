import { zql } from 'on-zero'

import { inCallerHousehold } from '../where/household'

/**
 * the day's bumps for one sender. this is what makes the 5/day quota survive a
 * reload and reset at the sender's own midnight, instead of living in a
 * component's useState.
 */
export const bumpsSentOnDate = (props: {
  senderMemberId: string
  sentOnDate: string
}) => {
  return zql.bumpEvent
    .where(inCallerHousehold)
    .where('senderMemberId', props.senderMemberId)
    .where('sentOnDate', props.sentOnDate)
    .orderBy('dailySequence', 'asc')
}

export const bumpsForChore = (props: { choreId: string; limit?: number }) => {
  return zql.bumpEvent
    .where(inCallerHousehold)
    .where('choreId', props.choreId)
    .orderBy('sentAt', 'desc')
    .limit(props.limit ?? 20)
}
