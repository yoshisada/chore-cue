import { relationships } from '@rocicorp/zero'

import * as tables from './generated/tables'

export const userRelationships = relationships(tables.userPublic, ({ many, one }) => ({
  state: one({
    sourceField: ['id'],
    destSchema: tables.userState,
    destField: ['userId'],
  }),
  todos: many({
    sourceField: ['id'],
    destSchema: tables.todo,
    destField: ['userId'],
  }),
}))

export const todoRelationships = relationships(tables.todo, ({ one }) => ({
  user: one({
    sourceField: ['userId'],
    destSchema: tables.userPublic,
    destField: ['id'],
  }),
}))

export const userStateRelationships = relationships(tables.userState, ({ one }) => ({
  user: one({
    sourceField: ['userId'],
    destSchema: tables.userPublic,
    destField: ['id'],
  }),
}))

export const householdRelationships = relationships(tables.household, ({ many }) => ({
  members: many({
    sourceField: ['id'],
    destSchema: tables.householdMember,
    destField: ['householdId'],
  }),
  chores: many({
    sourceField: ['id'],
    destSchema: tables.chore,
    destField: ['householdId'],
  }),
}))

export const householdMemberRelationships = relationships(
  tables.householdMember,
  ({ many, one }) => ({
    // the `household` edge is what `inCallerHousehold` walks
    household: one({
      sourceField: ['householdId'],
      destSchema: tables.household,
      destField: ['id'],
    }),
    user: one({
      sourceField: ['userId'],
      destSchema: tables.userPublic,
      destField: ['id'],
    }),
    assignedChores: many({
      sourceField: ['id'],
      destSchema: tables.chore,
      destField: ['assigneeMemberId'],
    }),
  })
)

export const choreRelationships = relationships(tables.chore, ({ many, one }) => ({
  household: one({
    sourceField: ['householdId'],
    destSchema: tables.household,
    destField: ['id'],
  }),
  assignee: one({
    sourceField: ['assigneeMemberId'],
    destSchema: tables.householdMember,
    destField: ['id'],
  }),
  creator: one({
    sourceField: ['createdByMemberId'],
    destSchema: tables.householdMember,
    destField: ['id'],
  }),
  bumps: many({
    sourceField: ['id'],
    destSchema: tables.bumpEvent,
    destField: ['choreId'],
  }),
}))

export const bumpEventRelationships = relationships(tables.bumpEvent, ({ one }) => ({
  household: one({
    sourceField: ['householdId'],
    destSchema: tables.household,
    destField: ['id'],
  }),
  chore: one({
    sourceField: ['choreId'],
    destSchema: tables.chore,
    destField: ['id'],
  }),
  sender: one({
    sourceField: ['senderMemberId'],
    destSchema: tables.householdMember,
    destField: ['id'],
  }),
  recipient: one({
    sourceField: ['recipientMemberId'],
    destSchema: tables.householdMember,
    destField: ['id'],
  }),
}))

export const allRelationships = [
  userRelationships,
  todoRelationships,
  userStateRelationships,
  householdRelationships,
  householdMemberRelationships,
  choreRelationships,
  bumpEventRelationships,
]
