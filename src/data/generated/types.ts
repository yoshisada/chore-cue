import type * as schema from './tables'
import type { TableInsertRow, TableUpdateRow } from 'on-zero'

export type BumpEvent = TableInsertRow<typeof schema.bumpEvent>
export type BumpEventUpdate = TableUpdateRow<typeof schema.bumpEvent>

export type Chore = TableInsertRow<typeof schema.chore>
export type ChoreUpdate = TableUpdateRow<typeof schema.chore>

export type Household = TableInsertRow<typeof schema.household>
export type HouseholdUpdate = TableUpdateRow<typeof schema.household>

export type HouseholdMember = TableInsertRow<typeof schema.householdMember>
export type HouseholdMemberUpdate = TableUpdateRow<typeof schema.householdMember>

export type Todo = TableInsertRow<typeof schema.todo>
export type TodoUpdate = TableUpdateRow<typeof schema.todo>

export type User = TableInsertRow<typeof schema.userPublic>
export type UserUpdate = TableUpdateRow<typeof schema.userPublic>

export type UserState = TableInsertRow<typeof schema.userState>
export type UserStateUpdate = TableUpdateRow<typeof schema.userState>
