import { boolean, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const userPublic = pgTable('userPublic', {
  id: text('id').primaryKey(),
  name: text('name'),
  username: text('username'),
  image: text('image'),
  joinedAt: timestamp('joinedAt', { mode: 'string' }).defaultNow().notNull(),
})

export const userState = pgTable('userState', {
  userId: text('userId').primaryKey(),
  darkMode: boolean('darkMode').notNull().default(false),
})

export const household = pgTable('household', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
})

export const householdMember = pgTable(
  'householdMember',
  {
    id: text('id').primaryKey(),
    householdId: text('householdId').notNull(),
    userId: text('userId').notNull(),
    role: text('role', { enum: ['admin', 'member'] })
      .notNull()
      .default('member'),
    displayName: text('displayName'),
    joinedAt: timestamp('joinedAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('householdMember_householdId_idx').on(table.householdId),
    index('householdMember_userId_idx').on(table.userId),
  ]
)

export const todo = pgTable(
  'todo',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    text: text('text').notNull(),
    completed: boolean('completed').notNull().default(false),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [index('todo_userId_idx').on(table.userId)]
)
