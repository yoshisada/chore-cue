import { serverWhere, zql } from 'on-zero'

const permission = serverWhere('household', (_, auth) => {
  return _.cmpLit(auth?.id || '', '!=', '')
})

const memberPermission = serverWhere('householdMember', (_, auth) => {
  return _.cmp('userId', auth?.id || '')
})

export const householdsByUserId = (props: { userId: string }) => {
  return zql.householdMember
    .where(memberPermission)
    .where('userId', props.userId)
    .related('household', (q) => q.where(permission).one())
}

export const householdById = (props: { householdId: string }) => {
  return zql.household
    .where(permission)
    .where('id', props.householdId)
    .related('members', (q) => q.where(memberPermission))
    .one()
}
