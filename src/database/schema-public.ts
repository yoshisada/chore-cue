import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

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
    // NULL = "local member": a person in the household with no login yet.
    // an accepted invite later fills this in on the same row, so chores stay put.
    userId: text('userId'),
    role: text('role', { enum: ['admin', 'member'] })
      .notNull()
      .default('member'),
    // members are deactivated, never deleted — chore/bump rows reference them
    status: text('status', { enum: ['active', 'inactive'] })
      .notNull()
      .default('active'),
    timezone: text('timezone').notNull().default('UTC'),
    displayName: text('displayName'),
    joinedAt: timestamp('joinedAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('householdMember_householdId_idx').on(table.householdId),
    index('householdMember_userId_idx').on(table.userId),
  ]
)

export const chore = pgTable(
  'chore',
  {
    id: text('id').primaryKey(),
    householdId: text('householdId')
      .notNull()
      .references(() => household.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    assigneeMemberId: text('assigneeMemberId')
      .notNull()
      .references(() => householdMember.id, { onDelete: 'restrict' }),
    createdByMemberId: text('createdByMemberId')
      .notNull()
      .references(() => householdMember.id, { onDelete: 'restrict' }),
    status: text('status', { enum: ['active', 'archived'] })
      .notNull()
      .default('active'),

    // recurrence is inlined rather than a 1:1 table so "exactly one well-formed
    // rule per chore" is a single CHECK instead of a deferred constraint
    recurrenceRuleType: text('recurrenceRuleType', {
      enum: ['interval_days', 'weekly_day', 'daily_time'],
    }).notNull(),
    recurrenceIntervalDays: integer('recurrenceIntervalDays'),
    recurrenceDayOfWeek: integer('recurrenceDayOfWeek'),
    recurrenceTimeMinutes: integer('recurrenceTimeMinutes').notNull().default(540),
    timezone: text('timezone').notNull().default('UTC'),

    // no default: a chore without a schedule is not representable
    nextDueAt: timestamp('nextDueAt', { mode: 'string' }).notNull(),
    lastCompletedAt: timestamp('lastCompletedAt', { mode: 'string' }),
    lastCompletedByMemberId: text('lastCompletedByMemberId').references(
      () => householdMember.id,
      { onDelete: 'set null' }
    ),
    lastBumpedAt: timestamp('lastBumpedAt', { mode: 'string' }),
    archivedAt: timestamp('archivedAt', { mode: 'string' }),
    photoLabel: text('photoLabel'),

    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('chore_household_status_due_idx').on(
      table.householdId,
      table.status,
      table.nextDueAt
    ),
    index('chore_assigneeMemberId_idx').on(table.assigneeMemberId),
    check(
      'chore_title_len_chk',
      sql`char_length(btrim(${table.title})) between 1 and 120`
    ),
    check(
      'chore_time_minutes_chk',
      sql`${table.recurrenceTimeMinutes} between 0 and 1439`
    ),
    check(
      'chore_archive_consistency_chk',
      sql`(${table.status} = 'archived') = (${table.archivedAt} is not null)`
    ),
    check(
      'chore_recurrence_shape_chk',
      sql`CASE ${table.recurrenceRuleType} WHEN 'interval_days' THEN ${table.recurrenceIntervalDays} IS NOT NULL AND ${table.recurrenceIntervalDays} BETWEEN 1 AND 365 AND ${table.recurrenceDayOfWeek} IS NULL WHEN 'weekly_day' THEN ${table.recurrenceDayOfWeek} IS NOT NULL AND ${table.recurrenceDayOfWeek} BETWEEN 0 AND 6 AND ${table.recurrenceIntervalDays} IS NULL WHEN 'daily_time' THEN ${table.recurrenceIntervalDays} IS NULL AND ${table.recurrenceDayOfWeek} IS NULL ELSE false END`
    ),
  ]
)

/**
 * bump history. append-only: no update/delete path exists anywhere, because
 * deleting today's bumps would reset the daily quota for free.
 *
 * UNIQUE(sender, day, sequence) + CHECK(sequence BETWEEN 1 AND 5) together make
 * a sixth same-day bump physically impossible rather than merely "rejected by a
 * count query that lost a race".
 */
export const bumpEvent = pgTable(
  'bumpEvent',
  {
    id: text('id').primaryKey(),
    // denormalized so household permissions are a single hop
    householdId: text('householdId')
      .notNull()
      .references(() => household.id, { onDelete: 'cascade' }),
    choreId: text('choreId')
      .notNull()
      .references(() => chore.id, { onDelete: 'cascade' }),
    senderMemberId: text('senderMemberId')
      .notNull()
      .references(() => householdMember.id, { onDelete: 'restrict' }),
    recipientMemberId: text('recipientMemberId')
      .notNull()
      .references(() => householdMember.id, { onDelete: 'restrict' }),
    sentAt: timestamp('sentAt', { mode: 'string' }).notNull(),
    // 'YYYY-MM-DD' in the sender's timezone; text (not date) so it ports to Zero
    sentOnDate: text('sentOnDate').notNull(),
    dailySequence: integer('dailySequence').notNull(),
    // closed template enum: a bump cannot become a free-text abuse channel
    messageType: text('messageType', {
      enum: ['gentle_nudge', 'friendly_reminder', 'heads_up'],
    }).notNull(),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('bumpEvent_sender_day_seq_uniq').on(
      table.senderMemberId,
      table.sentOnDate,
      table.dailySequence
    ),
    index('bumpEvent_chore_sentAt_idx').on(table.choreId, table.sentAt),
    check(
      'bumpEvent_no_self_chk',
      sql`${table.senderMemberId} <> ${table.recipientMemberId}`
    ),
    check('bumpEvent_sequence_chk', sql`${table.dailySequence} between 1 and 5`),
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
