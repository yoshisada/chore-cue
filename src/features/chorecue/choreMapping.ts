import { bumpEligibility } from './choreRules'
import { describeRecurrence, toRule } from './recurrence'
import { utcMsToZonedParts } from './timezone'

import type { ChoreRowLike } from './recurrence'
import type { ChoreCard, DueBucket } from './types'

/**
 * database row -> the card the board renders.
 *
 * pure: `now` is a parameter, so every label is deterministic under test without
 * fake timers. `dueBucket`, `dueLabel` and `canBump` are *derived* here rather
 * than stored on the row, which is what lets a chore roll from "upcoming" into
 * "due soon" without anybody writing to Postgres.
 */

export const DUE_SOON_WINDOW_MS = 24 * 60 * 60 * 1000

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export interface ChoreRow extends ChoreRowLike {
  id: string
  title: string
  tags?: readonly string[] | null
  assigneeMemberId?: string | null
  status?: string | null
  photoLabel?: string | null
  nextDueAt: number
  lastCompletedAt?: number | null
  lastBumpedAt?: number | null
  archivedAt?: number | null
  assignee?: {
    id?: string | null
    displayName?: string | null
    status?: string | null
  } | null
}

export interface MemberLookupEntry {
  name: string
  active: boolean
}

export interface ChoreCardContext {
  now: number
  viewerMemberId: string
  bumpsUsedToday: number
  /** memberId -> display name / active flag; falls back to the row's `assignee` relation */
  members?: ReadonlyMap<string, MemberLookupEntry>
}

export function deriveDueBucket(nextDueAt: number, now: number): DueBucket {
  if (nextDueAt <= now) return 'overdue'
  if (nextDueAt - now <= DUE_SOON_WINDOW_MS) return 'dueSoon'
  return 'upcoming'
}

/** "7:00 PM" from minutes past local midnight */
export function formatClockLabel(minutes: number): string {
  const normalized = ((Math.trunc(minutes) % 1440) + 1440) % 1440
  const hour24 = Math.floor(normalized / 60)
  const minute = normalized % 60
  const suffix = hour24 < 12 ? 'AM' : 'PM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12

  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`
}

/** whole local calendar days from `from` to `to` (negative when `to` is earlier) */
export function localDayDelta(from: number, to: number, timezone: string): number {
  const a = utcMsToZonedParts(from, timezone)
  const b = utcMsToZonedParts(to, timezone)
  const aDay = Date.UTC(a.y, a.m - 1, a.d)
  const bDay = Date.UTC(b.y, b.m - 1, b.d)

  return Math.round((bDay - aDay) / DAY_MS)
}

function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

export function formatDueLabel(nextDueAt: number, now: number, timezone: string): string {
  const diff = nextDueAt - now
  const parts = utcMsToZonedParts(nextDueAt, timezone)
  const clock = formatClockLabel(parts.minutes)

  if (diff <= 0) {
    const overdueBy = -diff
    if (overdueBy < HOUR_MS) return 'Due now'
    if (overdueBy < DAY_MS) {
      return `${pluralize(Math.floor(overdueBy / HOUR_MS), 'hour')} overdue`
    }
    return `${pluralize(Math.floor(overdueBy / DAY_MS), 'day')} overdue`
  }

  const dayDelta = localDayDelta(now, nextDueAt, timezone)

  if (diff <= DUE_SOON_WINDOW_MS) {
    return dayDelta <= 0 ? `Due today at ${clock}` : `Due tomorrow at ${clock}`
  }

  if (dayDelta <= 6) {
    return `Next due ${WEEKDAY_NAMES[parts.weekday]}`
  }

  return `Next due ${MONTH_NAMES[parts.m - 1]} ${parts.d}`
}

export function formatLastCompletedLabel(
  lastCompletedAt: number | null | undefined,
  now: number,
  timezone: string
): string | null {
  if (lastCompletedAt == null) return null

  const parts = utcMsToZonedParts(lastCompletedAt, timezone)
  const clock = formatClockLabel(parts.minutes)
  const dayDelta = localDayDelta(lastCompletedAt, now, timezone)

  if (dayDelta <= 0) return `Last done today at ${clock}`
  if (dayDelta === 1) return `Last done yesterday at ${clock}`
  if (dayDelta < 7) return `Last done ${WEEKDAY_NAMES[parts.weekday]}`

  return `Last done ${MONTH_NAMES[parts.m - 1]} ${parts.d}`
}

function resolveAssignee(
  row: ChoreRow,
  members: ReadonlyMap<string, MemberLookupEntry> | undefined
): { name: string; active: boolean } {
  const memberId = row.assigneeMemberId ?? ''
  const known = memberId ? members?.get(memberId) : undefined
  if (known) return known

  const relation = row.assignee
  return {
    name: relation?.displayName || 'Member',
    active: relation ? relation.status !== 'inactive' : Boolean(memberId),
  }
}

export function toChoreCard(row: ChoreRow, ctx: ChoreCardContext): ChoreCard {
  const rule = toRule(row)
  const timezone = row.timezone || 'UTC'
  const archived = row.status === 'archived'
  const assignee = resolveAssignee(row, ctx.members)

  const verdict = bumpEligibility(
    {
      archived,
      assigneeMemberId: row.assigneeMemberId,
      assigneeActive: assignee.active,
    },
    { viewerMemberId: ctx.viewerMemberId, bumpsUsedToday: ctx.bumpsUsedToday }
  )

  return {
    id: row.id,
    title: row.title,
    tags: row.tags ? [...row.tags] : [],
    assigneeName: assignee.name,
    assigneeMemberId: row.assigneeMemberId ?? '',
    assigneeActive: assignee.active,
    recurrenceSummary: rule ? describeRecurrence(rule) : 'Every N days',
    rule,
    dueBucket: deriveDueBucket(row.nextDueAt, ctx.now),
    dueLabel: formatDueLabel(row.nextDueAt, ctx.now, timezone),
    nextDueAt: row.nextDueAt,
    lastCompletedAt: row.lastCompletedAt ?? null,
    lastCompletedLabel: formatLastCompletedLabel(row.lastCompletedAt, ctx.now, timezone),
    photoLabel: row.photoLabel || null,
    archived,
    canBump: verdict.canBump,
    bumpBlockedReason: verdict.canBump ? null : verdict.reason,
  }
}
