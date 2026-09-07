import type {
  BumpEvent,
  Chore,
  Household,
  HouseholdMember,
  Todo,
  User,
  UserState,
} from './generated/types'

export type * from './generated/types'

export type UserWithState = User & {
  state?: UserState
}

export type UserWithRelations = User & {
  state?: UserState
  todos?: readonly Todo[]
}

export type TodoWithUser = Todo & {
  user?: User
}

export type HouseholdMemberWithUser = HouseholdMember & {
  user?: User
}

export type HouseholdWithMembers = Household & {
  members?: readonly HouseholdMember[]
}

export type ChoreWithRelations = Chore & {
  assignee?: HouseholdMember
  creator?: HouseholdMember
  bumps?: readonly BumpEvent[]
}

export type BumpEventWithRelations = BumpEvent & {
  chore?: Chore
  sender?: HouseholdMember
  recipient?: HouseholdMember
}
